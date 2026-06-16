import Anthropic from "@anthropic-ai/sdk";
import { db } from "./db";
import { getSetting } from "./settings";
import { createHash } from "crypto";

async function getClient(): Promise<Anthropic> {
  const key = await getSetting("ANTHROPIC_API_KEY");
  if (!key || key.startsWith("your_")) {
    throw new Error("ANTHROPIC_API_KEY가 설정되지 않았습니다. 설정 메뉴에서 API 키를 등록해주세요.");
  }
  return new Anthropic({ apiKey: key });
}

function cacheKey(type: string, input: string): string {
  return createHash("sha256").update(`${type}:${input}`).digest("hex").slice(0, 32);
}

async function getCached(key: string): Promise<string | null> {
  try {
    const row = await db.aiCache.findUnique({ where: { cacheKey: key } });
    if (!row) return null;
    if (new Date(row.expiresAt) < new Date()) {
      await db.aiCache.delete({ where: { cacheKey: key } });
      return null;
    }
    return row.result;
  } catch {
    return null;
  }
}

async function setCache(key: string, type: string, result: string, ttlHours = 24): Promise<void> {
  const expiresAt = new Date(Date.now() + ttlHours * 3600000);
  try {
    await db.aiCache.upsert({
      where: { cacheKey: key },
      create: { cacheKey: key, type, result, expiresAt },
      update: { result, expiresAt },
    });
  } catch {}
}

// 댓글 감성 분석
export async function analyzeCommentSentiment(comments: string[]): Promise<{
  overall: "positive" | "negative" | "mixed" | "neutral";
  positiveRatio: number;
  negativeRatio: number;
  neutralRatio: number;
  themes: string[];
  positiveExamples: string[];
  negativeExamples: string[];
}> {
  const input = comments.slice(0, 40).join("\n---\n");
  const key = cacheKey("sentiment", input);
  const cached = await getCached(key);
  if (cached) return JSON.parse(cached);

  const client = await getClient();
  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 800,
    messages: [
      {
        role: "user",
        content: `다음 YouTube 영상 댓글들을 감성 분석해주세요. JSON 형식으로만 답변하세요.

댓글 목록:
${input}

다음 JSON 형식으로 정확히 응답하세요:
{
  "overall": "positive|negative|mixed|neutral",
  "positiveRatio": 0~100 숫자,
  "negativeRatio": 0~100 숫자,
  "neutralRatio": 0~100 숫자,
  "themes": ["주요 반응 테마 3~5개"],
  "positiveExamples": ["긍정 댓글 예시 2개"],
  "negativeExamples": ["부정 댓글 예시 2개"]
}`,
      },
    ],
  });

  const text = (response.content[0] as { text: string }).text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  const result = jsonMatch ? JSON.parse(jsonMatch[0]) : {
    overall: "neutral", positiveRatio: 33, negativeRatio: 33, neutralRatio: 34,
    themes: ["분석 불가"], positiveExamples: [], negativeExamples: [],
  };

  await setCache(key, "sentiment", JSON.stringify(result), 12);
  return result;
}

// 영상 AI 요약 (왜 뜨는지)
export async function generateVideoSummary(
  title: string,
  description: string,
  channelTitle: string,
  viewCount: string,
  comments: string[]
): Promise<{
  whyTrending: string;
  targetAudience: string;
  contentStrengths: string[];
  creatorTip: string;
}> {
  const input = `${title}|${channelTitle}|${viewCount}`;
  const key = cacheKey("summary", input);
  const cached = await getCached(key);
  if (cached) return JSON.parse(cached);

  const client = await getClient();
  const topComments = comments.slice(0, 10).join("\n");
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 600,
    messages: [
      {
        role: "user",
        content: `YouTube 영상 분석을 JSON으로만 응답하세요.

제목: ${title}
채널: ${channelTitle}
조회수: ${parseInt(viewCount).toLocaleString()}
설명: ${description.slice(0, 200)}
주요 댓글: ${topComments}

JSON 형식:
{
  "whyTrending": "이 영상이 급상승하는 이유 (2~3문장)",
  "targetAudience": "주요 시청자층",
  "contentStrengths": ["강점 3가지"],
  "creatorTip": "이 영상에서 배울 수 있는 콘텐츠 기획 팁"
}`,
      },
    ],
  });

  const text = (response.content[0] as { text: string }).text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  const result = jsonMatch ? JSON.parse(jsonMatch[0]) : {
    whyTrending: "분석 중 오류가 발생했습니다.",
    targetAudience: "-",
    contentStrengths: [],
    creatorTip: "-",
  };

  await setCache(key, "summary", JSON.stringify(result), 24);
  return result;
}

// 콘텐츠 기획 리포트
export async function generateContentReport(
  regionCode: string,
  categoryName: string,
  videos: { title: string; viewCount: string; likeCount: string; channelTitle: string }[]
): Promise<{
  weeklyThemes: string[];
  audienceInsights: string;
  formatTrends: string[];
  contentIdeas: { title: string; reason: string }[];
  summary: string;
}> {
  const input = videos.map((v) => v.title).join("|");
  const key = cacheKey("report", `${regionCode}:${categoryName}:${input.slice(0, 200)}`);
  const cached = await getCached(key);
  if (cached) return JSON.parse(cached);

  const client = await getClient();
  const videoList = videos
    .slice(0, 20)
    .map((v, i) => `${i + 1}. [${parseInt(v.viewCount).toLocaleString()}회] ${v.title} - ${v.channelTitle}`)
    .join("\n");

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1200,
    messages: [
      {
        role: "user",
        content: `다음은 YouTube ${regionCode} 지역 "${categoryName}" 카테고리 급상승 영상 목록입니다.
콘텐츠 기획 리포트를 JSON으로만 생성해주세요.

영상 목록:
${videoList}

JSON 형식:
{
  "weeklyThemes": ["이번 주 주요 주제 5가지"],
  "audienceInsights": "시청자 특성 및 니즈 분석 (3~4문장)",
  "formatTrends": ["인기 콘텐츠 형식/포맷 4가지"],
  "contentIdeas": [
    {"title": "기획 아이디어 제목", "reason": "선정 이유"},
    {"title": "기획 아이디어 제목", "reason": "선정 이유"},
    {"title": "기획 아이디어 제목", "reason": "선정 이유"},
    {"title": "기획 아이디어 제목", "reason": "선정 이유"},
    {"title": "기획 아이디어 제목", "reason": "선정 이유"}
  ],
  "summary": "전체 트렌드 요약 (2~3문장)"
}`,
      },
    ],
  });

  const text = (response.content[0] as { text: string }).text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  const result = jsonMatch ? JSON.parse(jsonMatch[0]) : {
    weeklyThemes: [],
    audienceInsights: "분석 실패",
    formatTrends: [],
    contentIdeas: [],
    summary: "분석 실패",
  };

  await setCache(key, "report", JSON.stringify(result), 6);
  return result;
}
