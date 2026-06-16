"use client";

import { useState } from "react";
import { Sparkles, Loader2, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";
import Link from "next/link";

interface SummaryResult {
  whyTrending: string;
  targetAudience: string;
  contentStrengths: string[];
  creatorTip: string;
}

interface Props {
  title: string;
  description: string;
  channelTitle: string;
  viewCount: string;
  comments: string[];
}

export default function AiSummaryCard({ title, description, channelTitle, viewCount, comments }: Props) {
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requiresKey, setRequiresKey] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const generate = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "summary", title, description, channelTitle, viewCount, comments }),
      });
      const data = await res.json();
      if (data.error) { setRequiresKey(data.requiresApiKey); throw new Error(data.error); }
      setResult(data);
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  };

  if (!result) {
    return (
      <div className="rounded-[16px] p-4"
        style={{ background: "var(--color-surface-card)", border: "1px solid var(--color-hairline)" }}>
        {error && (
          <div className="mb-3">
            {requiresKey ? (
              <p className="caption-sm mb-2" style={{ color: "var(--color-error)" }}>
                Anthropic API 키가 필요합니다.{" "}
                <Link href="/settings" className="font-semibold underline" style={{ color: "var(--color-primary)" }}>
                  설정에서 등록
                </Link>
              </p>
            ) : (
              <p className="caption-sm" style={{ color: "var(--color-error)" }}>{error}</p>
            )}
          </div>
        )}
        <button onClick={generate} disabled={loading} className="btn-primary flex items-center gap-2 text-sm">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          AI 트렌드 분석 생성
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-[16px] p-4"
      style={{ background: "var(--color-surface-card)", border: "1px solid var(--color-hairline)" }}>
      <button onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm font-bold" style={{ color: "var(--color-ink)" }}>
          <Sparkles className="w-4 h-4" style={{ color: "var(--color-primary)" }} />
          AI 트렌드 분석
        </div>
        {expanded
          ? <ChevronUp className="w-4 h-4" style={{ color: "var(--color-ash)" }} />
          : <ChevronDown className="w-4 h-4" style={{ color: "var(--color-ash)" }} />}
      </button>

      {expanded && (
        <div className="space-y-3">
          <div>
            <p className="caption-md font-semibold mb-1" style={{ color: "var(--color-primary)" }}>왜 급상승하나요?</p>
            <p className="body-sm leading-relaxed" style={{ color: "var(--color-body)" }}>{result.whyTrending}</p>
          </div>
          <div>
            <p className="caption-md font-semibold mb-1" style={{ color: "var(--color-primary)" }}>주요 시청자층</p>
            <p className="body-sm" style={{ color: "var(--color-body)" }}>{result.targetAudience}</p>
          </div>
          {result.contentStrengths.length > 0 && (
            <div>
              <p className="caption-md font-semibold mb-1" style={{ color: "var(--color-primary)" }}>콘텐츠 강점</p>
              <ul className="space-y-0.5">
                {result.contentStrengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-1.5 body-sm" style={{ color: "var(--color-body)" }}>
                    <span style={{ color: "var(--color-primary)", marginTop: "2px" }}>▸</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="rounded-[16px] p-3" style={{ background: "var(--color-canvas)", border: "1px solid var(--color-hairline)" }}>
            <p className="caption-md font-semibold mb-1" style={{ color: "var(--color-primary)" }}>크리에이터 팁</p>
            <p className="caption-sm leading-relaxed" style={{ color: "var(--color-body)" }}>{result.creatorTip}</p>
          </div>
        </div>
      )}
    </div>
  );
}
