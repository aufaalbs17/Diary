import { NextRequest, NextResponse } from "next/server";
import { verifyServerCredentials } from "@/lib/server-db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identifier, pin, password } = body;

    const credentialPin = pin || password || "1234";
    const result = verifyServerCredentials(identifier, credentialPin);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: result.message,
      user: result.user,
      sessionToken: result.sessionToken,
    });

    if (result.sessionToken) {
      response.cookies.set("olm_session", result.sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 24 * 60 * 60, // 30 days
      });
      response.cookies.set("olm_user_id", result.user?.id || "user-1", {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
      });
    }

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Terjadi kesalahan server saat login" },
      { status: 500 }
    );
  }
}
