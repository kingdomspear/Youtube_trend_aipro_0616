"use client";

import { useState } from "react";
import { Download, ChevronDown } from "lucide-react";

interface Props {
  getVideos: () => object[];
}

export default function ExportButton({ getVideos }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const exportFile = async (format: "csv" | "xlsx") => {
    setLoading(true); setOpen(false);
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videos: getVideos(), format }),
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `youtube-trend-${new Date().toISOString().slice(0, 10)}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { alert("내보내기에 실패했습니다."); }
    setLoading(false);
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)} disabled={loading}
        className="chip chip-sm flex items-center gap-1.5" style={{ color: "var(--color-mute)" }}>
        <Download className="w-3.5 h-3.5" />
        내보내기
        <ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-20 min-w-[130px] rounded-[16px] overflow-hidden"
          style={{ background: "var(--color-canvas)", border: "1px solid var(--color-hairline)", boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}>
          <button onClick={() => exportFile("csv")}
            className="w-full px-4 py-2.5 text-sm text-left font-semibold transition-colors"
            style={{ color: "var(--color-ink)" }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--color-surface-soft)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
            CSV 다운로드
          </button>
          <button onClick={() => exportFile("xlsx")}
            className="w-full px-4 py-2.5 text-sm text-left font-semibold transition-colors"
            style={{ color: "var(--color-ink)", borderTop: "1px solid var(--color-hairline-soft)" }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--color-surface-soft)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
            Excel 다운로드
          </button>
        </div>
      )}
    </div>
  );
}
