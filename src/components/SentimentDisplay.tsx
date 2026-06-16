"use client";

import { useState } from "react";
import { SmilePlus, Frown, Meh, Loader2, Brain } from "lucide-react";
import Link from "next/link";

interface SentimentResult {
  overall: string;
  positiveRatio: number;
  negativeRatio: number;
  neutralRatio: number;
  themes: string[];
}

interface Props {
  videoId: string;
  comments: string[];
}

const OVERALL_LABEL: Record<string, string> = {
  positive: "긍정적", negative: "부정적", mixed: "혼재", neutral: "중립",
};

export default function SentimentDisplay({ videoId, comments }: Props) {
  const [result, setResult] = useState<SentimentResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requiresKey, setRequiresKey] = useState(false);

  const analyze = async () => {
    if (!comments.length) return;
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "sentiment", comments }),
      });
      const data = await res.json();
      if (data.error) { setRequiresKey(data.requiresApiKey); throw new Error(data.error); }
      setResult(data);
    } catch (e: any) { setError(e.message); }
    setLoading(false);
  };

  if (!result) {
    return (
      <div>
        {error && (
          <p className="caption-sm mb-2" style={{ color: requiresKey ? "#b45309" : "var(--color-error)" }}>
            {requiresKey
              ? <><Link href="/settings" className="font-semibold underline" style={{ color: "var(--color-primary)" }}>설정</Link>에서 Anthropic API 키를 등록해주세요.</>
              : error}
          </p>
        )}
        <button onClick={analyze} disabled={loading || !comments.length}
          className="btn-secondary flex items-center gap-2 text-sm disabled:opacity-50">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
          AI 감성 분석
        </button>
      </div>
    );
  }

  const bars = [
    { label: "긍정", pct: result.positiveRatio, color: "#22c55e" },
    { label: "부정", pct: result.negativeRatio, color: "var(--color-primary)" },
    { label: "중립", pct: result.neutralRatio,  color: "var(--color-ash)" },
  ];

  const overallIcon = result.overall === "positive"
    ? <SmilePlus className="w-4 h-4" style={{ color: "#22c55e" }} />
    : result.overall === "negative"
    ? <Frown className="w-4 h-4" style={{ color: "var(--color-primary)" }} />
    : <Meh className="w-4 h-4" style={{ color: "#f97316" }} />;

  return (
    <div className="rounded-[16px] p-4 space-y-3"
      style={{ background: "var(--color-surface-card)", border: "1px solid var(--color-hairline)" }}>
      <div className="flex items-center gap-2">
        {overallIcon}
        <span className="font-bold text-sm" style={{ color: "var(--color-ink)" }}>
          {OVERALL_LABEL[result.overall] || "분석 완료"}
        </span>
      </div>

      <div className="space-y-1.5">
        {bars.map(({ label, pct, color }) => (
          <div key={label} className="flex items-center gap-2 caption-sm">
            <span className="w-8 font-semibold" style={{ color: "var(--color-mute)" }}>{label}</span>
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "var(--color-hairline)" }}>
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
            </div>
            <span className="w-8 text-right" style={{ color: "var(--color-ash)" }}>{pct}%</span>
          </div>
        ))}
      </div>

      {result.themes.length > 0 && (
        <div>
          <p className="caption-md font-semibold mb-1.5" style={{ color: "var(--color-mute)" }}>주요 반응</p>
          <div className="flex flex-wrap gap-1.5">
            {result.themes.map((t, i) => (
              <span key={i} className="chip chip-sm">{t}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
