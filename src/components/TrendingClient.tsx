"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { YouTubeVideo } from "@/types/youtube";
import VideoCard from "./VideoCard";
import FilterBar from "./FilterBar";
import ApiKeyBanner from "./ApiKeyBanner";
import ExportButton from "./ExportButton";
import TitlePatternCard from "./TitlePatternCard";
import { Loader2, RefreshCw, AlertCircle, Camera, BarChart2, X } from "lucide-react";
import { calculateTrendScore, analyzeTitlePatterns } from "@/lib/trendScore";

const PAGE_SIZE = 50;

export default function TrendingClient() {
  const [regionCode, setRegionCode] = useState("KR");
  const [categoryId, setCategoryId] = useState("");
  const [maxResults, setMaxResults] = useState(50);

  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snapshotSaving, setSnapshotSaving] = useState(false);
  const [snapshotMsg, setSnapshotMsg] = useState<string | null>(null);
  const [showPattern, setShowPattern] = useState(false);
  const [pattern, setPattern] = useState<ReturnType<typeof analyzeTitlePatterns> | null>(null);

  const [rankChanges, setRankChanges] = useState<Record<string, number | null>>({});
  const prevSnapshotRef = useRef<{ videoId: string; rank: number }[]>([]);

  const fetchVideos = useCallback(async (region: string, cat: string, max: number) => {
    setLoading(true);
    setError(null);
    setVideos([]);
    setPattern(null);
    try {
      const firstMax = Math.min(max, PAGE_SIZE);
      const params = new URLSearchParams({ regionCode: region, categoryId: cat, maxResults: String(firstMax) });
      const res = await fetch(`/api/trending?${params}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      let allVideos = data.videos as YouTubeVideo[];
      if (max > PAGE_SIZE && data.nextPageToken) {
        const params2 = new URLSearchParams({ regionCode: region, categoryId: cat, maxResults: String(max - PAGE_SIZE), pageToken: data.nextPageToken });
        const res2 = await fetch(`/api/trending?${params2}`);
        const data2 = await res2.json();
        if (!data2.error) allVideos = [...allVideos, ...data2.videos];
      }

      const prev = prevSnapshotRef.current;
      if (prev.length > 0) {
        const changes: Record<string, number | null> = {};
        allVideos.forEach((v, i) => {
          const prevRank = prev.find((p) => p.videoId === v.id)?.rank;
          changes[v.id] = prevRank != null ? prevRank - (i + 1) : null;
        });
        setRankChanges(changes);
      }
      prevSnapshotRef.current = allVideos.map((v, i) => ({ videoId: v.id, rank: i + 1 }));
      setVideos(allVideos);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchVideos(regionCode, categoryId, maxResults); }, [regionCode, categoryId, maxResults, fetchVideos]);

  const saveSnapshot = async () => {
    setSnapshotSaving(true);
    setSnapshotMsg(null);
    try {
      const res = await fetch("/api/snapshot", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ regionCode, categoryId }) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSnapshotMsg(`스냅샷 저장 완료 (${data.count}개)`);
      setTimeout(() => setSnapshotMsg(null), 3000);
    } catch (e: any) {
      setSnapshotMsg(`오류: ${e.message}`);
    }
    setSnapshotSaving(false);
  };

  const togglePattern = () => {
    if (!showPattern && videos.length > 0) setPattern(analyzeTitlePatterns(videos.map((v) => v.title)));
    setShowPattern((v) => !v);
  };

  const getExportVideos = () => videos.map((v, i) => ({ ...v, rank: i + 1, trendScore: calculateTrendScore(v).score }));

  return (
    <div className="space-y-5">
      {/* Filter chips */}
      <FilterBar
        regionCode={regionCode} categoryId={categoryId} maxResults={maxResults}
        onRegionChange={setRegionCode} onCategoryChange={setCategoryId} onMaxResultsChange={setMaxResults}
      />

      {/* Action bar */}
      <div className="flex flex-wrap items-center gap-3">
        <p className="font-semibold text-base" style={{ color: "var(--color-ink)" }}>
          {loading ? "불러오는 중…" : `급상승 동영상 ${videos.length}개`}
        </p>
        <div className="ml-auto flex items-center gap-2">
          {videos.length > 0 && (
            <>
              <button
                onClick={togglePattern}
                className={`chip chip-sm ${showPattern ? "chip-active" : ""}`}
                style={showPattern ? {} : { color: "var(--color-mute)" }}
              >
                <BarChart2 className="w-3.5 h-3.5" />
                제목 패턴
              </button>
              <ExportButton getVideos={getExportVideos} />
              <button
                onClick={saveSnapshot} disabled={snapshotSaving}
                className="chip chip-sm" style={{ color: "var(--color-mute)" }}
                title="현재 순위 저장"
              >
                <Camera className={`w-3.5 h-3.5 ${snapshotSaving ? "animate-pulse" : ""}`} />
                스냅샷
              </button>
            </>
          )}
          <button
            onClick={() => fetchVideos(regionCode, categoryId, maxResults)} disabled={loading}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-colors disabled:opacity-40"
            style={{ background: "var(--color-surface-card)", color: "var(--color-mute)" }}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Snapshot toast */}
      {snapshotMsg && (
        <div className="flex items-center justify-between px-4 py-2.5 rounded-[16px] text-sm"
          style={{
            background: snapshotMsg.startsWith("오류") ? "#fff1f1" : "var(--color-success-pale)",
            color: snapshotMsg.startsWith("오류") ? "var(--color-error)" : "var(--color-success-deep)",
          }}>
          {snapshotMsg}
          <button onClick={() => setSnapshotMsg(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Errors */}
      {error && error.includes("API 키") && <ApiKeyBanner />}
      {error && !error.includes("API 키") && (
        <div className="flex items-start gap-3 rounded-[16px] p-4 text-sm"
          style={{ background: "#fff1f1", color: "var(--color-error)" }}>
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div><p className="font-bold mb-0.5">오류 발생</p><p>{error}</p></div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--color-primary)" }} />
        </div>
      )}

      {/* Pattern analysis */}
      {showPattern && pattern && <TitlePatternCard pattern={pattern} />}

      {/* Pin grid */}
      {!loading && videos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {videos.map((v, i) => (
            <VideoCard
              key={v.id} video={v} rank={i + 1}
              rankChange={rankChanges[v.id] !== undefined ? rankChanges[v.id] : undefined}
            />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && videos.length === 0 && (
        <div className="text-center py-24" style={{ color: "var(--color-ash)" }}>
          <p className="text-lg font-semibold">영상이 없습니다</p>
          <p className="text-sm mt-1">다른 국가 또는 카테고리를 선택해보세요.</p>
        </div>
      )}
    </div>
  );
}
