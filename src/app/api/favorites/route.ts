import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const favorites = await db.favorite.findMany({
    where: type ? { type } : undefined,
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ favorites });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { type, targetId, label, metadata } = body;
  if (!type || !targetId || !label) {
    return NextResponse.json({ error: "type, targetId, label은 필수입니다." }, { status: 400 });
  }
  try {
    const fav = await db.favorite.upsert({
      where: { type_targetId: { type, targetId } },
      create: { type, targetId, label, metadata: JSON.stringify(metadata || {}) },
      update: { label, metadata: JSON.stringify(metadata || {}) },
    });
    return NextResponse.json({ favorite: fav });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const targetId = searchParams.get("targetId");
  if (!type || !targetId) {
    return NextResponse.json({ error: "type, targetId가 필요합니다." }, { status: 400 });
  }
  try {
    await db.favorite.deleteMany({ where: { type, targetId } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
