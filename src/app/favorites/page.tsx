"use client";

import { useEffect, useState } from "react";
import { Star, Trash2, ExternalLink, Loader2 } from "lucide-react";
import Link from "next/link";

interface Favorite {
  id: string;
  type: string;
  targetId: string;
  label: string;
  metadata: string;
  createdAt: string;
}

const TYPE_LABEL: Record<string, string> = { all: "전체", video: "영상", channel: "채널", keyword: "키워드" };

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/favorites");
      const data = await res.json();
      setFavorites(data.favorites || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const remove = async (fav: Favorite) => {
    await fetch(`/api/favorites?type=${fav.type}&targetId=${fav.targetId}`, { method: "DELETE" });
    setFavorites((prev) => prev.filter((f) => f.id !== fav.id));
  };

  const filtered = filter === "all" ? favorites : favorites.filter((f) => f.type === filter);
  const types = ["all", ...Array.from(new Set(favorites.map((f) => f.type)))];

  const typeLink = (fav: Favorite): string => {
    if (fav.type === "video") return `/video/${fav.targetId}`;
    if (fav.type === "channel") return `/channel/${fav.targetId}`;
    return "#";
  };

  return (
    <div>
      <div className="flex items-center gap-2.5 mb-6">
        <Star className="w-6 h-6 fill-current" style={{ color: "#f59e0b" }} />
        <h1 className="heading-xl" style={{ color: "var(--color-ink)" }}>즐겨찾기</h1>
        <span className="caption-md ml-1" style={{ color: "var(--color-ash)" }}>({favorites.length}개)</span>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 mb-5">
        {types.map((t) => (
          <button key={t} onClick={() => setFilter(t)}
            className={`chip chip-sm ${filter === t ? "chip-active" : ""}`}>
            {TYPE_LABEL[t] || t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--color-ash)" }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24" style={{ color: "var(--color-ash)" }}>
          <Star className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-semibold">즐겨찾기한 항목이 없습니다</p>
          <p className="text-sm mt-1">영상 페이지에서 ★ 버튼을 눌러 추가해보세요.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((fav) => {
            let meta: any = {};
            try { meta = JSON.parse(fav.metadata); } catch {}
            return (
              <div key={fav.id} className="flex items-center gap-4 p-4 rounded-[16px] transition-colors"
                style={{ background: "var(--color-canvas)", border: "1px solid var(--color-hairline)" }}>
                {meta.thumbnailUrl && (
                  <img src={meta.thumbnailUrl} alt="" className="w-20 h-14 object-cover shrink-0"
                    style={{ borderRadius: "8px" }} />
                )}
                <div className="flex-1 min-w-0">
                  <span className="caption-sm uppercase tracking-wide" style={{ color: "var(--color-ash)" }}>
                    {TYPE_LABEL[fav.type] || fav.type}
                  </span>
                  <p className="font-semibold text-sm line-clamp-1 mt-0.5" style={{ color: "var(--color-ink)" }}>{fav.label}</p>
                  {meta.channelTitle && <p className="caption-sm" style={{ color: "var(--color-mute)" }}>{meta.channelTitle}</p>}
                  <p className="caption-sm mt-0.5" style={{ color: "var(--color-stone)" }}>
                    {new Date(fav.createdAt).toLocaleDateString("ko-KR")}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Link href={typeLink(fav)}
                    className="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
                    style={{ color: "var(--color-ash)" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--color-surface-card)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                  <button onClick={() => remove(fav)}
                    className="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
                    style={{ color: "var(--color-ash)" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#fff1f1"; (e.currentTarget.style.color = "var(--color-error)"); }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; (e.currentTarget.style.color = "var(--color-ash)"); }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
