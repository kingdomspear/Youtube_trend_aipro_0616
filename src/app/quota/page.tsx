"use client";

import { useEffect, useState } from "react";
import { Database, RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react";

interface QuotaStats {
  used: number;
  limit: number;
  softLimit: number;
  remaining: number;
  pct: number;
  byEndpoint: Record<string, number>;
}

export default function QuotaPage() {
  const [stats, setStats] = useState<QuotaStats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/quota");
      setStats(await res.json());
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const today = new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });

  const barColor = (pct: number) => pct >= 90 ? "var(--color-primary)" : pct >= 70 ? "#f97316" : "#22c55e";
  const statusColor = (pct: number) => pct >= 90 ? "var(--color-primary)" : pct >= 70 ? "#f97316" : "#22c55e";

  return (
    <div>
      <div className="flex items-center gap-2.5 mb-6">
        <Database className="w-6 h-6" style={{ color: "var(--color-primary)" }} />
        <h1 className="heading-xl" style={{ color: "var(--color-ink)" }}>API 할당량 관리</h1>
        <button onClick={load} disabled={loading}
          className="ml-auto w-8 h-8 flex items-center justify-center rounded-full"
          style={{ background: "var(--color-surface-card)", color: "var(--color-mute)" }}>
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {stats && (
        <div className="space-y-4">
          {/* Usage card */}
          <div className="rounded-[16px] p-6"
            style={{ background: "var(--color-canvas)", border: "1px solid var(--color-hairline)" }}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-bold" style={{ color: "var(--color-ink)" }}>오늘의 사용량</h2>
                <p className="caption-sm mt-0.5" style={{ color: "var(--color-ash)" }}>{today} 기준</p>
              </div>
              <div className="flex items-center gap-1.5 text-sm font-semibold"
                style={{ color: statusColor(stats.pct) }}>
                {stats.pct >= 70
                  ? <AlertTriangle className="w-4 h-4" />
                  : <CheckCircle2 className="w-4 h-4" />}
                {stats.pct >= 90 ? "위험" : stats.pct >= 70 ? "주의" : "정상"}
              </div>
            </div>

            <div className="flex justify-between mb-1.5 caption-sm" style={{ color: "var(--color-mute)" }}>
              <span>{stats.used.toLocaleString()} / {stats.limit.toLocaleString()} units</span>
              <span>{stats.pct}%</span>
            </div>
            <div className="h-3 rounded-full overflow-hidden mb-5" style={{ background: "var(--color-surface-card)" }}>
              <div className="h-full rounded-full transition-all"
                style={{ width: `${stats.pct}%`, background: barColor(stats.pct) }} />
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "사용됨", value: stats.used.toLocaleString(), sub: "units" },
                { label: "남은 한도", value: stats.remaining.toLocaleString(), sub: "units" },
                { label: "일일 한도", value: stats.limit.toLocaleString(), sub: "units" },
              ].map(({ label, value, sub }) => (
                <div key={label} className="rounded-[16px] p-3 text-center"
                  style={{ background: "var(--color-surface-card)" }}>
                  <p className="text-lg font-bold" style={{ color: "var(--color-ink)" }}>{value}</p>
                  <p className="caption-sm" style={{ color: "var(--color-ash)" }}>{sub}</p>
                  <p className="caption-sm mt-0.5" style={{ color: "var(--color-mute)" }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* By endpoint */}
          {Object.keys(stats.byEndpoint).length > 0 && (
            <div className="rounded-[16px] p-5"
              style={{ background: "var(--color-canvas)", border: "1px solid var(--color-hairline)" }}>
              <h3 className="font-bold text-sm mb-4" style={{ color: "var(--color-ink)" }}>엔드포인트별 사용량</h3>
              <div className="space-y-3">
                {Object.entries(stats.byEndpoint).sort((a, b) => b[1] - a[1]).map(([endpoint, units]) => (
                  <div key={endpoint} className="flex items-center gap-3">
                    <span className="text-sm w-48 font-mono shrink-0" style={{ color: "var(--color-mute)" }}>{endpoint}</span>
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "var(--color-surface-card)" }}>
                      <div className="h-full rounded-full" style={{ width: `${(units / stats.used) * 100}%`, background: "var(--color-primary)" }} />
                    </div>
                    <span className="text-sm font-bold w-16 text-right shrink-0" style={{ color: "var(--color-ink)" }}>{units} u</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Policy info */}
          <div className="rounded-[16px] p-4"
            style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}>
            <p className="font-bold text-sm mb-2" style={{ color: "#1d4ed8" }}>YouTube Data API v3 할당량 정책</p>
            <ul className="space-y-1 caption-sm" style={{ color: "#3b82f6" }}>
              <li>• 일일 기본 한도: <strong>10,000 units</strong> (Google 기준)</li>
              <li>• videos.list / commentThreads.list / channels.list: 각 <strong>1 unit</strong>/요청</li>
              <li>• 리셋 시간: 매일 태평양 표준시(PST) 자정</li>
              <li>• 한도 증가 필요 시 Google Cloud Console에서 할당량 증가 요청 가능</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
