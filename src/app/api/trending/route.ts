import { NextRequest, NextResponse } from "next/server";
import { fetchTrendingVideos } from "@/lib/youtube";
import { QuotaExceededError } from "@/lib/quota";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const regionCode = searchParams.get("regionCode") || "KR";
  const categoryId = searchParams.get("categoryId") || "";
  const maxResults = parseInt(searchParams.get("maxResults") || "50");
  const pageToken = searchParams.get("pageToken") || undefined;

  try {
    const data = await fetchTrendingVideos(regionCode, categoryId, Math.min(maxResults, 50), pageToken);
    return NextResponse.json(data);
  } catch (error: any) {
    if (error instanceof QuotaExceededError) {
      return NextResponse.json({ error: error.message, quotaExceeded: true }, { status: 429 });
    }

    const ytError = error?.response?.data?.error;
    const message = ytError?.message || error?.message || "알 수 없는 오류";
    const status = error?.response?.status || 500;

    if (status === 404 || message.includes("not found") || message.includes("Requested entity")) {
      return NextResponse.json({
        videos: [], totalResults: 0, regionNotSupported: true,
        message: `${regionCode} 지역에서는 해당 카테고리의 급상승 영상을 제공하지 않습니다.`,
      });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
