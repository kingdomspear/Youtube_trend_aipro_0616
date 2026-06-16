"use client";

import { useState, useEffect, useCallback } from "react";
import { YouTubeVideo } from "@/types/youtube";
import { COUNTRIES, YOUTUBE_CATEGORIES } from "@/types/youtube";
import { calculateTrendScore } from "@/lib/trendScore";
import TrendScoreBadge from "@/components/TrendScoreBadge";
import { Globe2, Loader2, RefreshCw, X, ChevronDown } from "lucide-react";
import Link from "next/link";

interface CountryData {
  regionCode: string;
  videos: (YouTubeVideo & { rank: number; trendScore: number; trendGrade: string })[];
  error?: string;
  regionNotSupported?: boolean;
}

const DEFAULT_COUNTRIES = ["KR", "US", "JP"];

export default function ComparePage() {
  const [selected, setSelected] = useState<string[]>(DEFAULT_COUNTRIES);
  const [categoryId, setCategoryId] = useState("");
  const [results, setResults] = useState<CountryData[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch_ = useCallback(async (countries: string[], catId: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ countries: countries.join(","), categoryId: catId, maxResults: "10" });
      const res = await fetch(`/api/compare?${params}`);
      const data = await res.json();
      setResults(data.comparisons || []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetch_(selected, categoryId); }, []);

  const addCountry = (code: string) => {
    if (selected.includes(code) || selected.length >= 5) return;
    const next = [...selected, code];
    setSelected(next);
    fetch_(next, categoryId);
  };

  const removeCountry = (code: string) => {
    const next = selected.filter((c) => c !== code);
    setSelected(next);
    setResults((r) => r.filter((d) => d.regionCode !== code));
  };

  const countryName = (code: string) => COUNTRIES.find((c) => c.code === code)?.name || code;

  function formatNum(n: string) {
    const v = parseInt(n) || 0;
    if (v >= 100000000) return `${(v / 100000000).toFixed(1)}억`;
    if (v >= 10000) return `${(v / 10000).toFixed(1)}만`;
    return v.toLocaleString();
  }

  return (
    <div>
      <div className="flex items-center gap-2.5 mb-6">
        <Globe2 className="w-6 h-6" style={{ color: "var(--color-primary)" }} />
        <h1 className="heading-xl" style={{ color: "var(--color-ink)" }}>국가 비교 대시보드</h1>
      </div>

      {/* Controls */}
      <div className="rounded-[16px] p-4 mb-6 flex flex-wrap gap-3 items-center"
        style={{ background: "var(--color-canvas)", border: "1px solid var(--color-hairline)" }}>

        {/* Category select */}
        <div className="relative flex items-center">
          <select
            value={categoryId}
            onChange={(e) => { setCategoryId(e.target.value); fetch_(selected, e.target.value); }}
            className="chip appearance-none pr-7 cursor-pointer"
          >
            {YOUTUBE_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
          <ChevronDown className="absolute right-3 w-3 h-3 pointer-events-none" style={{ color: "var(--color-mute)" }} />
        </div>

        {/* Country chips */}
        <div className="flex flex-wrap gap-2">
          {selected.map((code) => (
            <span key={code} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
              style={{ background: "var(--color-surface-card)", color: "var(--color-ink)" }}>
              {countryName(code)} ({code})
              <button onClick={() => removeCountry(code)} disabled={selected.length <= 1}
                className="disabled:opacity-30">
                <X className="w-3 h-3" style={{ color: "var(--color-mute)" }} />
              </button>
            </span>
          ))}
          {selected.length < 5 && (
            <div className="relative">
              <select
                onChange={(e) => { if (e.target.value) { addCountry(e.target.value); e.target.value = ""; } }}
                className="chip chip-sm appearance-none pr-6 cursor-pointer"
                style={{ borderStyle: "dashed", borderWidth: 1, borderColor: "var(--color-hairline)", background: "transparent" }}
              >
                <option value="">+ 국가 추가</option>
                {COUNTRIES.filter((c) => !selected.includes(c.code)).map((c) => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <button onClick={() => fetch_(selected, categoryId)} disabled={loading}
          className="ml-auto w-8 h-8 flex items-center justify-center rounded-full transition-colors"
          style={{ background: "var(--color-surface-card)", color: "var(--color-mute)" }}>
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--color-primary)" }} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {results.map(({ regionCode, videos, error, regionNotSupported }: any) => (
            <div key={regionCode} className="overflow-hidden rounded-[16px]"
              style={{ background: "var(--color-canvas)", border: "1px solid var(--color-hairline)" }}>

              {/* Card header */}
              <div className="px-4 py-3 flex items-center gap-2"
                style={{ background: "var(--color-primary)" }}>
                <Globe2 className="w-4 h-4 text-white/80" />
                <span className="font-bold text-white">{countryName(regionCode)}</span>
                <span className="text-white/60 text-sm">({regionCode})</span>
              </div>

              {error ? (
                <p className="text-sm p-4" style={{ color: "var(--color-error)" }}>{error}</p>
              ) : regionNotSupported ? (
                <p className="text-sm p-4" style={{ color: "#b45309" }}>
                  이 국가에서는 해당 카테고리 급상승 데이터를 제공하지 않습니다.
                </p>
              ) : (
                <div style={{ borderTop: `1px solid var(--color-hairline-soft)` }}>
                  {videos.slice(0, 10).map((v: any, i: number) => {
                    const { score, grade } = calculateTrendScore(v);
                    const thumb = v.thumbnails.default;
                    return (
                      <Link key={v.id} href={`/video/${v.id}`}
                        className="flex items-center gap-3 p-3 transition-colors"
                        style={{ borderBottom: "1px solid var(--color-hairline-soft)" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "var(--color-surface-soft)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        <span className="text-xs font-bold w-5 shrink-0 text-center" style={{ color: "var(--color-stone)" }}>{i + 1}</span>
                        <img src={thumb?.url} alt="" className="w-14 h-10 object-cover shrink-0"
                          style={{ borderRadius: "8px" }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold line-clamp-2 leading-snug" style={{ color: "var(--color-ink)" }}>{v.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px]" style={{ color: "var(--color-ash)" }}>{formatNum(v.viewCount)} 회</span>
                            <TrendScoreBadge score={score} grade={grade} />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
