import { NextRequest, NextResponse } from "next/server";
import { fetchVideoComments } from "@/lib/youtube";
import { QuotaExceededError } from "@/lib/quota";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const videoId = searchParams.get("videoId");
  const maxResults = parseInt(searchParams.get("maxResults") || "20");
  const pageToken = searchParams.get("pageToken") || undefined;

  if (!videoId) {
    return NextResponse.json({ error: "videoId가 필요합니다." }, { status: 400 });
  }

  try {
    const data = await fetchVideoComments(videoId, Math.min(maxResults, 100), pageToken);
    return NextResponse.json(data);
  } catch (error: any) {
    if (error instanceof QuotaExceededError) {
      return NextResponse.json({ error: error.message, quotaExceeded: true }, { status: 429 });
    }
    const status = error?.response?.status || 500;
    const message = error?.response?.data?.error?.message || error?.message || "알 수 없는 오류";
    if (message.includes("disabled comments") || message.includes("commentsDisabled")) {
      return NextResponse.json({ error: "이 영상은 댓글이 비활성화되어 있습니다.", commentsDisabled: true }, { status: 403 });
    }
    return NextResponse.json({ error: message }, { status });
  }
}
