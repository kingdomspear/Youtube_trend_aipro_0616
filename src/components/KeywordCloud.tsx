"use client";

import { useState } from "react";
import { Hash, Loader2 } from "lucide-react";

interface Props {
  comments: string[];
}

export default function KeywordCloud({ comments }: Props) {
  const [keywords, setKeywords] = useState<{ word: string; count: number }[] | null>(null);
  const [loading, setLoading] = useState(false);

  const extract = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "keywords", comments }),
      });
      const data = await res.json();
      setKeywords(data.keywords || []);
    } catch {}
    setLoading(false);
  };

  if (!keywords) {
    return (
      <button onClick={extract} disabled={loading || !comments.length}
        className="btn-secondary flex items-center gap-2 text-sm disabled:opacity-50">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Hash className="w-4 h-4" />}
        키워드 추출
      </button>
    );
  }

  if (keywords.length === 0) {
    return <p className="caption-sm" style={{ color: "var(--color-ash)" }}>추출된 키워드가 없습니다.</p>;
  }

  const maxCount = keywords[0]?.count || 1;

  return (
    <div className="flex flex-wrap gap-1.5">
      {keywords.map(({ word, count }) => {
        const scale = 0.75 + (count / maxCount) * 0.5;
        const alpha = Math.round((0.5 + (count / maxCount) * 0.5) * 255).toString(16).padStart(2, "0");
        return (
          <span key={word}
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1"
            style={{
              fontSize: `${scale}rem`,
              background: `var(--color-surface-card)`,
              color: "var(--color-ink)",
              border: "1px solid var(--color-hairline)",
              opacity: 0.5 + (count / maxCount) * 0.5,
            }}
            title={`${count}회 등장`}>
            <Hash className="w-3 h-3" style={{ color: "var(--color-ash)" }} />
            {word}
            <span style={{ fontSize: "10px", color: "var(--color-ash)" }}>{count}</span>
          </span>
        );
      })}
    </div>
  );
}
