"use client";

import { useState, useEffect, useCallback } from "react";
import { Star } from "lucide-react";

interface Props {
  type: string;
  targetId: string;
  label: string;
  metadata?: object;
}

export default function FavoriteButton({ type, targetId, label, metadata }: Props) {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/favorites?type=${type}`)
      .then((r) => r.json())
      .then((d) => { setSaved(d.favorites?.some((f: any) => f.targetId === targetId)); })
      .catch(() => {});
  }, [type, targetId]);

  const toggle = useCallback(async () => {
    setLoading(true);
    try {
      if (saved) {
        await fetch(`/api/favorites?type=${type}&targetId=${targetId}`, { method: "DELETE" });
        setSaved(false);
      } else {
        await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, targetId, label, metadata }),
        });
        setSaved(true);
      }
    } catch {}
    setLoading(false);
  }, [saved, type, targetId, label, metadata]);

  return (
    <button onClick={toggle} disabled={loading}
      title={saved ? "즐겨찾기 해제" : "즐겨찾기 추가"}
      className="w-9 h-9 flex items-center justify-center rounded-full transition-colors"
      style={{
        background: saved ? "rgba(245,158,11,0.1)" : "var(--color-surface-card)",
        color: saved ? "#f59e0b" : "var(--color-ash)",
      }}>
      <Star className={`w-4 h-4 ${saved ? "fill-current" : ""}`} />
    </button>
  );
}
