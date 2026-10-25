import { NextRequest, NextResponse } from "next/server";
import { getServerDb, saveServerDb } from "@/lib/server-db";
import { Memory } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const db = getServerDb();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const mood = searchParams.get("mood");
    const favorite = searchParams.get("favorite");

    let items = [...db.memories];

    if (category) {
      items = items.filter((m) => m.category === category);
    }
    if (mood) {
      items = items.filter((m) => m.mood === mood);
    }
    if (favorite === "true") {
      items = items.filter((m) => m.is_favorite);
    }

    // Sort by event_date descending
    items.sort(
      (a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime()
    );

    return NextResponse.json({
      success: true,
      data: items,
      total: items.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Gagal memuat memori" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = getServerDb();

    const newMemory: Memory = {
      ...body,
      id: body.id || `mem-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.memories.unshift(newMemory);
    saveServerDb(db);

    return NextResponse.json({
      success: true,
      message: "Kenangan manis berhasil disimpan ke jurnal! 🤍",
      data: newMemory,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Gagal membuat memori baru" },
      { status: 500 }
    );
  }
}
