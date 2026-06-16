"use client";

import { BarChart2 } from "lucide-react";

interface Pattern {
  total: number;
  avgLength: number;
  hasNumber: { count: number; pct: number };
  hasEmoji: { count: number; pct: number };
  hasBracket: { count: number; pct: number };
  hasQuestion: { count: number; pct: number };
  hasExclamation: { count: number; pct: number };
  topWords: { word: string; count: number; pct: number }[];
}

function Bar({ pct, color = "var(--color-primary)" }: { pct: number; color?: string }) {
  return (
    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "var(--color-hairline)" }}>
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

const BAR_COLORS = [
  "var(--color-ash)",
  "var(--color-primary)",
  "#f59e0b",
  "#7e238b",
  "#22c55e",
  "#f97316",
];

export default function TitlePatternCard({ pattern }: { pattern: Pattern }) {
  const stats = [
    { label: "평균 글자수", value: `${pattern.avgLength}자`, pct: Math.min(pattern.avgLength / 60 * 100, 100) },
    { label: "숫자 포함", value: `${pattern.hasNumber.pct}%`, pct: pattern.hasNumber.pct },
    { label: "이모지 포함", value: `${pattern.hasEmoji.pct}%`, pct: pattern.hasEmoji.pct },
    { label: "괄호 사용", value: `${pattern.hasBracket.pct}%`, pct: pattern.hasBracket.pct },
    { label: "물음표", value: `${pattern.hasQuestion.pct}%`, pct: pattern.hasQuestion.pct },
    { label: "느낌표", value: `${pattern.hasExclamation.pct}%`, pct: pattern.hasExclamation.pct },
  ];

  return (
    <div className="rounded-[16px] p-5" style={{ background: "var(--color-canvas)", border: "1px solid var(--color-hairline)" }}>
      <div className="flex items-center gap-2 mb-4">
        <BarChart2 className="w-5 h-5" style={{ color: "var(--color-primary)" }} />
        <h3 className="font-bold text-sm" style={{ color: "var(--color-ink)" }}>제목 패턴 분석</h3>
        <span className="caption-sm" style={{ color: "var(--color-ash)" }}>(영상 {pattern.total}개 기준)</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Stats */}
        <div className="space-y-2.5">
          <p className="caption-md font-semibold mb-2" style={{ color: "var(--color-mute)" }}>제목 특성</p>
          {stats.map(({ label, value, pct }, i) => (
            <div key={label} className="flex items-center gap-3 caption-sm">
              <span className="w-20 shrink-0" style={{ color: "var(--color-mute)" }}>{label}</span>
              <Bar pct={pct} color={BAR_COLORS[i]} />
              <span className="w-10 text-right font-mono" style={{ color: "var(--color-charcoal)" }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Top words */}
        <div>
          <p className="caption-md font-semibold mb-2" style={{ color: "var(--color-mute)" }}>자주 등장하는 단어</p>
          <div className="flex flex-wrap gap-1.5">
            {pattern.topWords.slice(0, 12).map(({ word, count, pct }) => (
              <span key={word}
                className="chip chip-sm inline-flex items-center gap-1"
                title={`${count}개 영상에서 등장 (${pct}%)`}>
                {word}
                <span style={{ color: "var(--color-ash)", fontSize: "10px" }}>{pct}%</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
