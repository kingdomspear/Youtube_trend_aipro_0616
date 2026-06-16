import { NextRequest, NextResponse } from "next/server";
import { fetchChannelInfo } from "@/lib/youtube";
import { db } from "@/lib/db";
import { QuotaExceededError } from "@/lib/quota";

export async function GET(req: NextRequest, { params }: { params: Promise<{ channelId: string }> }) {
  const { channelId } = await params;

  // 캐시 확인 (24시간)
  try {
    const cached = await db.channel.findUnique({ where: { channelId } });
    if (cached) {
      const ageHours = (Date.now() - new Date(cached.updatedAt).getTime()) / 3600000;
      if (ageHours < 24) return NextResponse.json(cached);
    }
  } catch {}

  try {
    const info = await fetchChannelInfo(channelId);
    await db.channel.upsert({
      where: { channelId },
      create: info,
      update: info,
    });
    return NextResponse.json(info);
  } catch (error: any) {
    if (error instanceof QuotaExceededError) {
      return NextResponse.json({ error: error.message, quotaExceeded: true }, { status: 429 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
