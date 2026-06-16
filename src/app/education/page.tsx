"use client";

import { useState, useEffect, useCallback } from "react";
import { YouTubeVideo } from "@/types/youtube";
import { COUNTRIES } from "@/types/youtube";
import VideoCard from "@/components/VideoCard";
import ExportButton from "@/components/ExportButton";
import { GraduationCap, Globe, Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { calculateTrendScore, classifyEducationVideo, EDUCATION_SUBCATEGORIES } from "@/lib/trendScore";

type VideoWithSub = YouTubeVideo & { subCategory: string };

const SUB_CATS = ["전체", ...Object.keys(EDUCATION_SUBCATEGORIES), "기타 교육"];

export default function EducationPage() {
  const [regionCode, setRegionCode] = useState("KR");
  const [videos, setVideos] = useState<VideoWithSub[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [regionNotSupported, setRegionNotSupported] = useState(false);
  const [subFilter, setSubFilter] = useState("전체");

  const fetchEducation = useCallback(async (region: string) => {
    setLoading(true);
    setError(null);
    setRegionNotSupported(false);
    setVideos([]);
    try {
      const params = new URLSearchParams({ regionCode: region, categoryId: "27", maxResults: "30" });
      const res = await fetch(`/api/trending?${params}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (data.regionNotSupported) {
        setRegionNotSupported(true);
        return;
      }
      const withSub: VideoWithSub[] = data.videos.slice(0, 30).map((v: YouTubeVideo) => ({
        ...v,
        subCategory: classifyEducationVideo(v.title, v.description),
      }));
      setVideos(withSub);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEducation(regionCode); }, [regionCode, fetchEducation]);

  const filtered = subFilter === "전체" ? videos : videos.filter((v) => v.subCategory === subFilter);

  const getExportVideos = () =>
    filtered.map((v, i) => ({
      ...v,
      rank: i + 1,
      trendScore: calculateTrendScore(v).score,
      subCategory: v.subCategory,
    }));

  // 서브카테고리별 카운트
  const counts: Record<string, number> = {};
  videos.forEach((v) => { counts[v.subCategory] = (counts[v.subCategory] || 0) + 1; });

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <GraduationCap className="w-6 h-6 text-blue-500" />
        <h1 className="text-2xl font-bold text-gray-900">교육 분야 TOP 30</h1>
      </div>

      {/* 국가 + 내보내기 */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex flex-wrap items-center gap-3 mb-4">
        <Globe className="w-4 h-4 text-blue-500 shrink-0" />
        <select
          value={regionCode}
          onChange={(e) => setRegionCode(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
        >
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
          ))}
        </select>
        <button
          onClick={() => fetchEducation(regionCode)}
          disabled={loading}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-500 transition-colors disabled:opacity-40"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
        {videos.length > 0 && (
          <div className="ml-auto">
            <ExportButton getVideos={getExportVideos} />
          </div>
        )}
      </div>

      {/* 서브카테고리 필터 */}
      {videos.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {SUB_CATS.map((cat) => {
            const cnt = cat === "전체" ? videos.length : (counts[cat] || 0);
            if (cnt === 0 && cat !== "전체") return null;
            return (
              <button
                key={cat}
                onClick={() => setSubFilter(cat)}
                className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                  subFilter === cat
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                }`}
              >
                {cat} {cnt > 0 && <span className="ml-0.5 opacity-70">({cnt})</span>}
              </button>
            );
          })}
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 mb-6">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {regionNotSupported && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />
          <div className="text-sm text-amber-700">
            <p className="font-semibold mb-1">해당 국가에서는 교육 카테고리 급상승 영상을 제공하지 않습니다.</p>
            <p>YouTube API는 일부 국가에서 특정 카테고리의 급상승 데이터를 지원하지 않습니다. 다른 국가를 선택해 보세요.</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {["KR", "JP", "IN", "BR"].map((code) => (
                <button
                  key={code}
                  onClick={() => setRegionCode(code)}
                  className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-full text-xs font-medium transition-colors"
                >
                  {code}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <>
          <p className="text-sm text-gray-500 mb-4">
            {subFilter !== "전체" && <span className="font-semibold text-blue-600">{subFilter}</span>}
            {subFilter === "전체" ? "" : " · "}
            <strong>{filtered.length}</strong>개 영상
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {filtered.map((v, i) => (
              <div key={v.id} className="relative">
                <span className="absolute top-2 right-2 z-10 text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full">
                  {v.subCategory}
                </span>
                <VideoCard video={v} rank={i + 1} />
              </div>
            ))}
          </div>
        </>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p>해당 카테고리 영상이 없습니다.</p>
        </div>
      )}
    </div>
  );
}
