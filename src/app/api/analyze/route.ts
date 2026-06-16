import { NextRequest, NextResponse } from "next/server";
import { analyzeCommentSentiment, generateVideoSummary } from "@/lib/ai";
import { extractCommentKeywords } from "@/lib/trendScore";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { type, comments, title, description, channelTitle, viewCount } = body;

  if (!type) return NextResponse.json({ error: "type이 필요합니다." }, { status: 400 });

  try {
    if (type === "sentiment") {
      if (!comments?.length) return NextResponse.json({ error: "댓글이 없습니다." }, { status: 400 });
      const result = await analyzeCommentSentiment(comments);
      return NextResponse.json(result);
    }

    if (type === "keywords") {
      if (!comments?.length) return NextResponse.json({ error: "댓글이 없습니다." }, { status: 400 });
      const result = extractCommentKeywords(comments);
      return NextResponse.json({ keywords: result });
    }

    if (type === "summary") {
      if (!title) return NextResponse.json({ error: "title이 필요합니다." }, { status: 400 });
      const result = await generateVideoSummary(title, description || "", channelTitle || "", viewCount || "0", comments || []);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "지원하지 않는 type입니다." }, { status: 400 });
  } catch (error: any) {
    const isApiKeyError = error.message?.includes("API 키") || error.message?.includes("api_key");
    return NextResponse.json(
      { error: error.message, requiresApiKey: isApiKeyError },
      { status: isApiKeyError ? 401 : 500 }
    );
  }
}
