import { NextRequest, NextResponse } from "next/server";
import { fetchTrendingVideos } from "@/lib/youtube";
import { calculateTrendScore } from "@/lib/trendScore";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const countries = (searchParams.get("countries") || "KR,US,JP").split(",").slice(0, 5);
  const categoryId = searchParams.get("categoryId") || "";
  const maxResults = Math.min(parseInt(searchParams.get("maxResults") || "10"), 10);

  const results = await Promise.allSettled(
    countries.map(async (regionCode) => {
      const code = regionCode.trim();
      try {
        const data = await fetchTrendingVideos(code, categoryId, maxResults);
        const videos = data.videos.map((v, i) => ({
          ...v,
          rank: i + 1,
          trendScore: calculateTrendScore(v).score,
        }));
        return { regionCode: code, videos };
      } catch (e: any) {
        const msg: string = e?.response?.data?.error?.message || e?.message || "";
        const status: number = e?.response?.status || 500;
        if (status === 404 || msg.includes("not found") || msg.includes("Requested entity")) {
          return { regionCode: code, videos: [], regionNotSupported: true };
        }
        throw e;
      }
    })
  );

  const comparisons = results.map((r, i) =>
    r.status === "fulfilled"
      ? r.value
      : { regionCode: countries[i].trim(), videos: [], error: (r.reason as Error).message }
  );

  return NextResponse.json({ comparisons });
}
