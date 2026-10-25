import { NextRequest, NextResponse } from "next/server";
import { getServerDb, saveServerDb } from "@/lib/server-db";

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("olm_session")?.value;
    if (sessionToken) {
      const db = getServerDb();
      delete db.sessions[sessionToken];
      saveServerDb(db);
    }

    const response = NextResponse.json({
      success: true,
      message: "Berhasil keluar dari akun.",
    });

    response.cookies.delete("olm_session");
    response.cookies.delete("olm_user_id");

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Gagal proses logout" },
      { status: 500 }
    );
  }
}
