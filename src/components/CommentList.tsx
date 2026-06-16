"use client";

import { useState, useCallback } from "react";
import { YouTubeComment } from "@/types/youtube";
import { ThumbsUp, MessageSquare, ChevronDown, Loader2 } from "lucide-react";

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

interface CommentListProps {
  videoId: string;
  initialComments: YouTubeComment[];
  initialNextPageToken?: string;
  totalResults: number;
}

export default function CommentList({ videoId, initialComments, initialNextPageToken, totalResults }: CommentListProps) {
  const [comments, setComments] = useState<YouTubeComment[]>(initialComments);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>(initialNextPageToken);
  const [loading, setLoading] = useState(false);

  const loadMore = useCallback(async () => {
    if (!nextPageToken || loading) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ videoId, maxResults: "20", pageToken: nextPageToken });
      const res = await fetch(`/api/comments?${params}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setComments((prev) => [...prev, ...data.comments]);
      setNextPageToken(data.nextPageToken);
    } catch {}
    setLoading(false);
  }, [videoId, nextPageToken, loading]);

  if (comments.length === 0) {
    return <p className="text-sm text-center py-8" style={{ color: "var(--color-ash)" }}>댓글이 없습니다.</p>;
  }

  return (
    <div>
      <p className="body-sm mb-4" style={{ color: "var(--color-mute)" }}>
        댓글 <strong style={{ color: "var(--color-ink)" }}>{totalResults.toLocaleString()}</strong>개
      </p>

      <div className="space-y-4">
        {comments.map((c) => (
          <div key={c.id} className="flex gap-3">
            <img
              src={c.authorProfileImageUrl}
              alt={c.authorDisplayName}
              className="w-8 h-8 rounded-full object-cover shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(c.authorDisplayName)}&size=32`;
              }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold" style={{ color: "var(--color-ink)" }}>{c.authorDisplayName}</span>
                <span className="caption-sm" style={{ color: "var(--color-ash)" }}>{timeAgo(c.publishedAt)}</span>
              </div>
              <p className="body-sm leading-relaxed break-words" style={{ color: "var(--color-body)" }}
                dangerouslySetInnerHTML={{ __html: c.textDisplay }} />
              <div className="flex items-center gap-3 mt-1.5 caption-sm" style={{ color: "var(--color-ash)" }}>
                {c.likeCount > 0 && (
                  <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{c.likeCount.toLocaleString()}</span>
                )}
                {c.replyCount > 0 && (
                  <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />답글 {c.replyCount}개</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {nextPageToken && (
        <button onClick={loadMore} disabled={loading}
          className="mt-6 w-full flex items-center justify-center gap-2 py-2.5 rounded-[16px] text-sm font-semibold transition-colors disabled:opacity-50"
          style={{ background: "var(--color-surface-card)", color: "var(--color-mute)" }}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronDown className="w-4 h-4" />}
          댓글 더 보기
        </button>
      )}
    </div>
  );
}
