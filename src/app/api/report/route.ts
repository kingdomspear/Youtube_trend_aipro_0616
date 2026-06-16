import { NextRequest, NextResponse } from "next/server";
import { generateContentReport } from "@/lib/ai";
import { YOUTUBE_CATEGORIES } from "@/types/youtube";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { regionCode = "KR", categoryId = "", videos } = body;

  if (!videos?.length) {
    return NextResponse.json({ error: "videos가 필요합니다." }, { status: 400 });
  }

  const categoryName =
    YOUTUBE_CATEGORIES.find((c) => c.id === categoryId)?.title || "전체";

  try {
    const result = await generateContentReport(regionCode, categoryName, videos);
    return NextResponse.json(result);
  } catch (error: any) {
    const isApiKeyError = error.message?.includes("API 키") || error.message?.includes("api_key");
    return NextResponse.json(
      { error: error.message, requiresApiKey: isApiKeyError },
      { status: isApiKeyError ? 401 : 500 }
    );
  }
}
