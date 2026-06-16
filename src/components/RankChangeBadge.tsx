"use client";

import { TrendingUp, TrendingDown, Minus, Sparkles } from "lucide-react";

interface Props {
  change: number | null;
  compact?: boolean;
}

export default function RankChangeBadge({ change, compact }: Props) {
  if (change === null) return (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold"
      style={{ background: "#f3e8ff", color: "#7e238b" }}>
      <Sparkles className="w-3 h-3" />
      {!compact && "신규"}
    </span>
  );
  if (change > 0) return (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold"
      style={{ background: "#dcfce7", color: "#15803d" }}>
      <TrendingUp className="w-3 h-3" />+{change}
    </span>
  );
  if (change < 0) return (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold"
      style={{ background: "rgba(230,0,35,0.08)", color: "var(--color-primary)" }}>
      <TrendingDown className="w-3 h-3" />{change}
    </span>
  );
  return (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px]"
      style={{ background: "var(--color-surface-card)", color: "var(--color-ash)" }}>
      <Minus className="w-3 h-3" />{!compact && "-"}
    </span>
  );
}
