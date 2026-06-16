"use client";

import { useEffect, useState } from "react";
import { Database } from "lucide-react";
import Link from "next/link";

export default function QuotaBar() {
  const [quota, setQuota] = useState<{ used: number; softLimit: number; softPct: number } | null>(null);

  useEffect(() => {
    fetch("/api/quota").then((r) => r.json()).then(setQuota).catch(() => {});
  }, []);

  if (!quota) return null;

  const pct = quota.softPct;
  const barColor = pct >= 90 ? "var(--color-primary)" : pct >= 70 ? "#f97316" : "#22c55e";

  return (
    <Link href="/quota"
      className="flex items-center gap-2 px-2.5 py-1.5 rounded-[9999px] text-xs font-semibold transition-colors"
      style={{ background: "var(--color-surface-card)", color: "var(--color-mute)" }}
      title={`API 할당량: ${quota.used.toLocaleString()} / ${quota.softLimit.toLocaleString()} units`}
    >
      <Database className="w-3.5 h-3.5" />
      <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--color-hairline)" }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: barColor }} />
      </div>
      <span style={{ color: pct >= 70 ? barColor : "var(--color-ash)" }}>{pct}%</span>
    </Link>
  );
}
