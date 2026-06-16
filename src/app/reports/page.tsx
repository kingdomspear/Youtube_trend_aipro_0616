"use client";

import { useState } from "react";
import { FileText, Loader2, Sparkles, Globe, Tag, AlertCircle, ArrowRight, Key } from "lucide-react";
import { YOUTUBE_CATEGORIES, COUNTRIES } from "@/types/youtube";
import Link from "next/link";

interface ReportResult {
  weeklyThemes: string[];
  audienceInsights: string;
  formatTrends: string[];
  contentIdeas: { title: string; reason: string }[];
  summary: string;
}

export default function ReportsPage() {
  const [regionCode, setRegionCode] = useState("KR");
  const [categoryId, setCategoryId] = useState("");
  const [result, setResult] = useState<ReportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requiresKey, setRequiresKey] = useState(false);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true); setError(null); setResult(null);
    try {
      const trendParams = new URLSearchParams({ regionCode, categoryId, maxResults: "20" });
      const trendRes = await fetch(`/api/trending?${trendParams}`);
      const trendData = await trendRes.json();
      if (trendData.error) throw new Error(trendData.error);

      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regionCode, categoryId, videos: trendData.videos }),
      });
      const data = await res.json();
      if (data.error) { setRequiresKey(data.requiresApiKey); throw new Error(data.error); }
      setResult(data);
      setFetchedAt(new Date().toLocaleString("ko-KR"));
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  };

  const categoryName = YOUTUBE_CATEGORIES.find((c) => c.id === categoryId)?.title || "전체";
  const countryName = COUNTRIES.find((c) => c.code === regionCode)?.name || regionCode;

  return (
    <div>
      <div className="flex items-center gap-2.5 mb-6">
        <FileText className="w-6 h-6" style={{ color: "var(--color-primary)" }} />
        <h1 className="heading-xl" style={{ color: "var(--color-ink)" }}>AI 콘텐츠 기획 리포트</h1>
      </div>

      {/* Config card */}
      <div className="rounded-[16px] p-5 mb-6"
        style={{ background: "var(--color-canvas)", border: "1px solid var(--color-hairline)" }}>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block caption-md font-semibold mb-1.5" style={{ color: "var(--color-mute)" }}>국가</label>
            <select value={regionCode} onChange={(e) => setRegionCode(e.target.value)}
              className="chip appearance-none cursor-pointer">
              {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block caption-md font-semibold mb-1.5" style={{ color: "var(--color-mute)" }}>카테고리</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
              className="chip appearance-none cursor-pointer">
              {YOUTUBE_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          <button onClick={generate} disabled={loading} className="btn-primary flex items-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            리포트 생성
          </button>
        </div>
        <p className="caption-sm mt-3" style={{ color: "var(--color-ash)" }}>
          현재 급상승 영상 TOP 20을 분석하여 콘텐츠 기획 인사이트를 제공합니다. Claude AI 사용.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-[16px] p-4 mb-6"
          style={{ background: requiresKey ? "#fff8e7" : "#fff1f1", border: `1px solid ${requiresKey ? "#f5d87a" : "#fca5a5"}` }}>
          {requiresKey
            ? <Key className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "#b45309" }} />
            : <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "var(--color-error)" }} />
          }
          <div>
            {requiresKey ? (
              <>
                <p className="text-sm font-bold mb-1" style={{ color: "#92400e" }}>Anthropic API 키가 필요합니다</p>
                <Link href="/settings" className="btn-primary inline-flex items-center gap-1.5 text-sm mt-2">
                  설정으로 이동 <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            ) : (
              <p className="text-sm" style={{ color: "var(--color-error)" }}>{error}</p>
            )}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-3" style={{ color: "var(--color-ash)" }}>
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--color-primary)" }} />
          <p className="text-sm">AI가 트렌드를 분석 중입니다…</p>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-4">
          {/* Meta */}
          <div className="flex items-center gap-4 text-sm" style={{ color: "var(--color-mute)" }}>
            <span className="flex items-center gap-1.5"><Globe className="w-4 h-4" />{countryName}</span>
            <span className="flex items-center gap-1.5"><Tag className="w-4 h-4" />{categoryName}</span>
            {fetchedAt && <span className="ml-auto caption-sm">{fetchedAt} 기준</span>}
          </div>

          {/* Summary */}
          <div className="rounded-[16px] p-5"
            style={{ background: "var(--color-surface-card)", border: "1px solid var(--color-hairline)" }}>
            <p className="font-bold text-sm mb-2" style={{ color: "var(--color-ink)" }}>전체 트렌드 요약</p>
            <p className="body-sm leading-relaxed" style={{ color: "var(--color-body)" }}>{result.summary}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Weekly themes */}
            <div className="rounded-[16px] p-5"
              style={{ background: "var(--color-canvas)", border: "1px solid var(--color-hairline)" }}>
              <h3 className="font-bold text-sm mb-3" style={{ color: "var(--color-ink)" }}>이번 주 주요 주제</h3>
              <ol className="space-y-2.5">
                {result.weeklyThemes.map((t, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm">
                    <span className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
                      style={{ background: "var(--color-primary)" }}>{i + 1}</span>
                    <span style={{ color: "var(--color-body)" }}>{t}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Format trends */}
            <div className="rounded-[16px] p-5"
              style={{ background: "var(--color-canvas)", border: "1px solid var(--color-hairline)" }}>
              <h3 className="font-bold text-sm mb-3" style={{ color: "var(--color-ink)" }}>인기 콘텐츠 포맷</h3>
              <ul className="space-y-2">
                {result.formatTrends.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span style={{ color: "var(--color-primary)", marginTop: "2px" }}>▸</span>
                    <span style={{ color: "var(--color-body)" }}>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Audience insights */}
          <div className="rounded-[16px] p-5"
            style={{ background: "var(--color-canvas)", border: "1px solid var(--color-hairline)" }}>
            <h3 className="font-bold text-sm mb-2" style={{ color: "var(--color-ink)" }}>시청자 인사이트</h3>
            <p className="body-sm leading-relaxed" style={{ color: "var(--color-body)" }}>{result.audienceInsights}</p>
          </div>

          {/* Content ideas */}
          <div className="rounded-[16px] p-5"
            style={{ background: "var(--color-canvas)", border: "1px solid var(--color-hairline)" }}>
            <h3 className="font-bold text-sm mb-3" style={{ color: "var(--color-ink)" }}>추천 콘텐츠 아이디어</h3>
            <div className="space-y-2.5">
              {result.contentIdeas.map((idea, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-[16px]"
                  style={{ background: "var(--color-surface-card)" }}>
                  <span className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: "#f59e0b" }}>{i + 1}</span>
                  <div>
                    <p className="text-sm font-bold" style={{ color: "var(--color-ink)" }}>{idea.title}</p>
                    <p className="caption-sm mt-0.5" style={{ color: "var(--color-mute)" }}>{idea.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
