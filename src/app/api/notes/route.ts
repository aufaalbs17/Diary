import { NextRequest, NextResponse } from "next/server";
import { getServerDb, saveServerDb } from "@/lib/server-db";
import { LittleNote } from "@/lib/types";

export async function GET() {
  try {
    const db = getServerDb();
    const notes = [...db.notes].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return NextResponse.json({
      success: true,
      data: notes,
      total: notes.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Gagal memuat surat kasih" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = getServerDb();

    const newNote: LittleNote = {
      ...body,
      id: body.id || `note-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString(),
    };

    db.notes.unshift(newNote);
    saveServerDb(db);

    return NextResponse.json({
      success: true,
      message: "Surat manis berhasil dikirimkan ke pasangan! 💌",
      data: newNote,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Gagal mengirimkan surat" },
      { status: 500 }
    );
  }
}
