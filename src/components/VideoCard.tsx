"use client";

import { YouTubeVideo } from "@/types/youtube";
import { Eye, ThumbsUp, MessageSquare } from "lucide-react";
import Link from "next/link";
import TrendScoreBadge from "./TrendScoreBadge";
import RankChangeBadge from "./RankChangeBadge";
import { calculateTrendScore } from "@/lib/trendScore";

interface VideoCardProps {
  video: YouTubeVideo;
  rank: number;
  rankChange?: number | null;
}

function formatNumber(n: string | number): string {
  const num = typeof n === "string" ? parseInt(n) : n;
  if (isNaN(num)) return "0";
  if (num >= 100000000) return `${(num / 100000000).toFixed(1)}억`;
  if (num >= 10000) return `${(num / 10000).toFixed(1)}만`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}천`;
  return num.toLocaleString();
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 30) return `${Math.floor(d / 30)}개월 전`;
  if (d > 0) return `${d}일 전`;
  if (h > 0) return `${h}시간 전`;
  return `${m}분 전`;
}

const RANK_COLORS: Record<number, string> = { 1: "#f59e0b", 2: "#94a3b8", 3: "#f97316" };

export default function VideoCard({ video, rank, rankChange }: VideoCardProps) {
  const thumb = video.thumbnails.medium || video.thumbnails.default;
  const { score, grade } = calculateTrendScore(video);
  const rankBg = RANK_COLORS[rank] ?? (rank <= 10 ? "var(--color-primary)" : "rgba(0,0,0,0.55)");

  return (
    <Link href={`/video/${video.id}`} className="group block pin-card" style={{ background: "var(--color-surface-card)" }}>
      {/* Full-bleed thumbnail — NO internal padding */}
      <div className="relative aspect-video overflow-hidden" style={{ borderRadius: "var(--rounded-md) var(--rounded-md) 0 0" }}>
        <img
          src={thumb?.url}
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Rank badge — pin-overlay-pill style */}
        <span
          className="absolute top-2.5 left-2.5 w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold text-white shadow"
          style={{ background: rankBg }}
        >
          {rank}
        </span>

        {/* Rank change */}
        {rankChange !== undefined && (
          <span className="absolute top-2.5 right-2.5">
            <RankChangeBadge change={rankChange} compact />
          </span>
        )}

        {/* Duration overlay */}
        <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[11px] font-mono text-white"
          style={{ background: "rgba(0,0,0,0.75)" }}>
          {video.duration}
        </span>

        {/* Trend score pill anchored bottom-left */}
        <span className="absolute bottom-2 left-2">
          <TrendScoreBadge score={score} grade={grade} />
        </span>
      </div>

      {/* Metadata — kept inside card but minimal */}
      <div className="px-3 pt-2.5 pb-3">
        <h3 className="text-sm font-semibold line-clamp-2 leading-snug mb-1 transition-colors group-hover:text-[var(--color-primary)]"
          style={{ color: "var(--color-ink)" }}>
          {video.title}
        </h3>
        <p className="text-[12px] mb-2 truncate" style={{ color: "var(--color-mute)" }}>
          {video.channelTitle} · {timeAgo(video.publishedAt)}
        </p>

        {/* Stats row */}
        <div className="flex items-center gap-3 text-[11px] font-medium" style={{ color: "var(--color-ash)" }}>
          <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{formatNumber(video.viewCount)}</span>
          <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{formatNumber(video.likeCount)}</span>
          <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{formatNumber(video.commentCount)}</span>
        </div>
      </div>
    </Link>
  );
}
