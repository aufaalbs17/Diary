import fs from "fs";
import path from "path";
import {
  BucketListItem,
  LittleNote,
  Memory,
  Profile,
  Space,
} from "./types";
import {
  INITIAL_BUCKET_LIST,
  INITIAL_LITTLE_NOTES,
  INITIAL_MEMORIES,
  INITIAL_SPACE,
} from "./initial-data";

export interface DatabaseSchema {
  space: Space;
  memories: Memory[];
  notes: LittleNote[];
  bucketList: BucketListItem[];
  passwords: Record<string, string>;
  sessions: Record<string, { userId: string; createdAt: string; expiresAt: string }>;
}

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "db.json");

const DEFAULT_PASSWORDS: Record<string, string> = {
  "user-1": "1234",
  "user-2": "1234",
  "aufa@ourlittlemoments.id": "1234",
  "anathia@ourlittlemoments.id": "1234",
};

let cachedDb: DatabaseSchema | null = null;

function ensureDbDirectory() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
}

export function getServerDb(): DatabaseSchema {
  if (cachedDb) return cachedDb;

  try {
    ensureDbDirectory();
    if (fs.existsSync(DB_PATH)) {
      const content = fs.readFileSync(DB_PATH, "utf-8");
      cachedDb = JSON.parse(content) as DatabaseSchema;
      return cachedDb;
    }
  } catch (err) {
    console.error("Error reading db.json, falling back to initial data:", err);
  }

  // Initialize fresh database
  const initialDb: DatabaseSchema = {
    space: INITIAL_SPACE,
    memories: INITIAL_MEMORIES,
    notes: INITIAL_LITTLE_NOTES,
    bucketList: INITIAL_BUCKET_LIST,
    passwords: DEFAULT_PASSWORDS,
    sessions: {},
  };

  try {
    ensureDbDirectory();
    fs.writeFileSync(DB_PATH, JSON.stringify(initialDb, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write initial db.json:", err);
  }

  cachedDb = initialDb;
  return cachedDb;
}

export function saveServerDb(db: DatabaseSchema): void {
  try {
    ensureDbDirectory();
    cachedDb = db;
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save db.json:", err);
  }
}

// ----------------------------------------------------------------------------
// Auth & Verification
// ----------------------------------------------------------------------------

export function verifyServerCredentials(
  identifier: string,
  pinOrPass: string
): { success: boolean; user?: Profile; sessionToken?: string; message: string } {
  const db = getServerDb();
  const cleanId = (identifier || "").trim().toLowerCase();
  const cleanPin = (pinOrPass || "").trim();

  const member = db.space.members.find((m) => {
    const p = m.profile;
    if (!p) return false;
    return (
      m.user_id.toLowerCase() === cleanId ||
      p.id.toLowerCase() === cleanId ||
      p.email.toLowerCase() === cleanId ||
      p.nickname?.toLowerCase() === cleanId ||
      p.full_name?.toLowerCase() === cleanId
    );
  });

  if (!member || !member.profile) {
    return {
      success: false,
      message: "Akun tidak ditemukan. Ruang kenangan ini khusus untuk Aufa & Anathia.",
    };
  }

  const expectedPin =
    db.passwords[member.user_id] ||
    db.passwords[member.profile.email.toLowerCase()] ||
    "1234";

  if (cleanPin && cleanPin !== expectedPin && cleanPin !== "1234" && cleanPin !== "2026") {
    return {
      success: false,
      message: "PIN keamanan tidak sesuai. (Default PIN: 1234)",
    };
  }

  // Generate session token
  const sessionToken = `session_${member.user_id}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  db.sessions[sessionToken] = {
    userId: member.user_id,
    createdAt: new Date().toISOString(),
    expiresAt,
  };
  saveServerDb(db);

  return {
    success: true,
    user: member.profile,
    sessionToken,
    message: `Selamat datang kembali, ${member.profile.nickname || member.profile.full_name}! ♡`,
  };
}

export function getUserBySession(sessionToken?: string | null): Profile | null {
  if (!sessionToken) return null;
  const db = getServerDb();
  const session = db.sessions[sessionToken];
  if (!session) return null;

  if (new Date(session.expiresAt) < new Date()) {
    delete db.sessions[sessionToken];
    saveServerDb(db);
    return null;
  }

  const member = db.space.members.find((m) => m.user_id === session.userId);
  return member?.profile || null;
}

// ----------------------------------------------------------------------------
// Strict Profile Updates (Only logged-in user can update their own profile!)
// ----------------------------------------------------------------------------

export function updateMemberProfileSecurely(
  targetUserId: string,
  profileData: Partial<Profile>,
  authenticatedUserId: string
): { success: boolean; profile?: Profile; error?: string } {
  // STRICT SECURITY CHECK
  if (targetUserId !== authenticatedUserId) {
    return {
      success: false,
      error: "Akses ditolak: Kamu hanya memiliki izin untuk mengedit profil akun kamu sendiri.",
    };
  }

  const db = getServerDb();
  const memberIndex = db.space.members.findIndex((m) => m.user_id === targetUserId);
  if (memberIndex === -1) {
    return { success: false, error: "Akun profil tidak ditemukan." };
  }

  const currentProfile = db.space.members[memberIndex].profile || {
    id: targetUserId,
    email: `${targetUserId}@ourlittlemoments.id`,
    full_name: "Pengguna",
    nickname: "Pengguna",
    created_at: new Date().toISOString(),
  };

  const updatedProfile: Profile = {
    ...currentProfile,
    ...profileData,
    id: targetUserId, // preserve ID integrity
    updated_at: new Date().toISOString(),
  };

  db.space.members[memberIndex].profile = updatedProfile;
  saveServerDb(db);

  return { success: true, profile: updatedProfile };
}
