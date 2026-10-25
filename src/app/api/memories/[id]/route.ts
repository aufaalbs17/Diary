import { NextRequest, NextResponse } from "next/server";
import { getServerDb, saveServerDb } from "@/lib/server-db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getServerDb();
    const memory = db.memories.find((m) => m.id === id);

    if (!memory) {
      return NextResponse.json(
        { success: false, message: "Kenangan tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: memory });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Gagal memuat kenangan" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getServerDb();
    const initialLen = db.memories.length;
    db.memories = db.memories.filter((m) => m.id !== id);

    if (db.memories.length === initialLen) {
      return NextResponse.json(
        { success: false, message: "Kenangan tidak ditemukan" },
        { status: 404 }
      );
    }

    saveServerDb(db);
    return NextResponse.json({
      success: true,
      message: "Kenangan berhasil dihapus dari jurnal.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Gagal menghapus kenangan" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const db = getServerDb();
    const idx = db.memories.findIndex((m) => m.id === id);

    if (idx === -1) {
      return NextResponse.json(
        { success: false, message: "Kenangan tidak ditemukan" },
        { status: 404 }
      );
    }

    db.memories[idx] = {
      ...db.memories[idx],
      ...body,
      updated_at: new Date().toISOString(),
    };

    saveServerDb(db);
    return NextResponse.json({
      success: true,
      message: "Kenangan berhasil diperbarui.",
      data: db.memories[idx],
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Gagal memperbarui kenangan" },
      { status: 500 }
    );
  }
}
