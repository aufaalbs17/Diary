import { NextRequest, NextResponse } from "next/server";
import { getServerDb, saveServerDb } from "@/lib/server-db";
import { BucketListItem } from "@/lib/types";

export async function GET() {
  try {
    const db = getServerDb();
    return NextResponse.json({
      success: true,
      data: db.bucketList,
      total: db.bucketList.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Gagal memuat bucket list" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = getServerDb();

    const newItem: BucketListItem = {
      ...body,
      id: body.id || `bkt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString(),
    };

    db.bucketList.unshift(newItem);
    saveServerDb(db);

    return NextResponse.json({
      success: true,
      message: "Impian baru berhasil ditambahkan ke Bucket List! ✨",
      data: newItem,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Gagal menambahkan impian" },
      { status: 500 }
    );
  }
}
