import { NextRequest, NextResponse } from "next/server";
import { getServerDb, getUserBySession, updateMemberProfileSecurely } from "@/lib/server-db";

export async function GET(request: NextRequest) {
  try {
    const db = getServerDb();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (userId) {
      const member = db.space.members.find((m) => m.user_id === userId);
      if (!member) {
        return NextResponse.json(
          { success: false, message: "Member tidak ditemukan" },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, profile: member.profile });
    }

    return NextResponse.json({
      success: true,
      members: db.space.members.map((m) => m.profile),
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Gagal mengambil profil" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { targetUserId, data } = body;

    if (!targetUserId || !data) {
      return NextResponse.json(
        { success: false, error: "targetUserId dan data profil diperlukan." },
        { status: 400 }
      );
    }

    // Determine authenticated user
    const sessionToken = request.cookies.get("olm_session")?.value;
    let authUser = getUserBySession(sessionToken);

    if (!authUser) {
      const cookieUserId = request.cookies.get("olm_user_id")?.value;
      const headerUserId = request.headers.get("x-user-id");
      const resolvedId = cookieUserId || headerUserId;
      if (resolvedId) {
        const db = getServerDb();
        const member = db.space.members.find((m) => m.user_id === resolvedId);
        authUser = member?.profile || null;
      }
    }

    const authenticatedUserId = authUser?.id;

    if (!authenticatedUserId) {
      return NextResponse.json(
        { success: false, error: "Silakan login terlebih dahulu untuk mengubah profil." },
        { status: 401 }
      );
    }

    // STRICT CHECK: Cannot edit another user's profile!
    if (targetUserId !== authenticatedUserId) {
      return NextResponse.json(
        {
          success: false,
          error: "Pengaturan profil hanya dapat diubah oleh pemilik akun yang sedang login.",
        },
        { status: 403 }
      );
    }

    const result = updateMemberProfileSecurely(targetUserId, data, authenticatedUserId);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Gagal menyimpan profil" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Profil akun berhasil diperbarui! ✨",
      profile: result.profile,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Gagal memperbarui profil di server" },
      { status: 500 }
    );
  }
}
