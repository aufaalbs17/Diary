import { NextRequest, NextResponse } from "next/server";
import { getServerDb, getUserBySession } from "@/lib/server-db";

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("olm_session")?.value;
    const db = getServerDb();

    let user = getUserBySession(sessionToken);
    if (!user) {
      // Check user_id cookie fallback
      const cookieUserId = request.cookies.get("olm_user_id")?.value;
      if (cookieUserId) {
        const member = db.space.members.find((m) => m.user_id === cookieUserId);
        user = member?.profile || null;
      }
    }

    // Default to active member-1 if nothing set
    if (!user) {
      user = db.space.members[0]?.profile || null;
    }

    const partnerMember = db.space.members.find((m) => m.user_id !== user?.id);

    return NextResponse.json({
      success: true,
      user,
      partner: partnerMember?.profile || null,
      space: db.space,
      isAuthenticated: Boolean(user),
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Gagal memuat sesi auth" },
      { status: 500 }
    );
  }
}
