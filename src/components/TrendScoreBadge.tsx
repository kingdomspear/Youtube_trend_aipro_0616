"use client";

import { Zap } from "lucide-react";

interface Props {
  score: number;
  grade: string;
  showBreakdown?: boolean;
  breakdown?: { viewsPerHour: number; likeRate: number; commentRate: number; recencyBonus: number };
}

const GRADE: Record<string, { bg: string; color: string }> = {
  S: { bg: "#7e238b",                     color: "#fff" },
  A: { bg: "var(--color-primary)",        color: "#fff" },
  B: { bg: "#f97316",                     color: "#fff" },
  C: { bg: "#f59e0b",                     color: "#fff" },
  D: { bg: "var(--color-secondary-bg)",   color: "var(--color-mute)" },
};

export default function TrendScoreBadge({ score, grade, showBreakdown, breakdown }: Props) {
  const g = GRADE[grade] || GRADE.D;
  return (
    <div className="inline-flex flex-col gap-1">
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold"
        style={{ background: g.bg, color: g.color }}>
        <Zap className="w-3 h-3" />
        {grade} {score}
      </span>
      {showBreakdown && breakdown && (
        <div className="space-y-0.5" style={{ fontSize: "10px", color: "var(--color-ash)" }}>
          <div>시간당 조회: {breakdown.viewsPerHour.toLocaleString()}</div>
          <div>좋아요율: {breakdown.likeRate}%</div>
          <div>댓글율: {breakdown.commentRate}%</div>
          <div>신규성: {breakdown.recencyBonus}%</div>
        </div>
      )}
    </div>
  );
}
