import { NextRequest, NextResponse } from "next/server";
import { fetchTrendingVideos } from "@/lib/youtube";
import { db } from "@/lib/db";
import { calculateTrendScore } from "@/lib/trendScore";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const regionCode = body.regionCode || "KR";
  const categoryId = body.categoryId || "";

  try {
    const data = await fetchTrendingVideos(regionCode, categoryId, 50);
    const now = new Date();

    const snapshotData = data.videos.map((v, i) => {
      const { score } = calculateTrendScore(v);
      const thumb = v.thumbnails.medium || v.thumbnails.default;
      return {
        videoId: v.id,
        title: v.title,
        channelId: v.channelId,
        channelTitle: v.channelTitle,
        regionCode,
        categoryId,
        rank: i + 1,
        viewCount: v.viewCount,
        likeCount: v.likeCount,
        commentCount: v.commentCount,
        trendScore: score,
        publishedAt: v.publishedAt,
        thumbnailUrl: thumb?.url || "",
        duration: v.duration,
        capturedAt: now,
      };
    });

    await db.videoSnapshot.createMany({ data: snapshotData });

    return NextResponse.json({ success: true, count: snapshotData.length, capturedAt: now });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 특정 영상의 순위 이력 조회
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const videoId = searchParams.get("videoId");
  const regionCode = searchParams.get("regionCode") || "KR";

  if (!videoId) {
    // 최근 스냅샷 목록 반환
    const snapshots = await db.videoSnapshot.findMany({
      where: { regionCode },
      orderBy: { capturedAt: "desc" },
      distinct: ["capturedAt"],
      take: 20,
      select: { capturedAt: true, regionCode: true, categoryId: true },
    });
    return NextResponse.json({ snapshots });
  }

  const history = await db.videoSnapshot.findMany({
    where: { videoId, regionCode },
    orderBy: { capturedAt: "asc" },
    take: 50,
  });

  return NextResponse.json({ history });
}
