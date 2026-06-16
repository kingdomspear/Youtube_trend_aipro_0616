import { fetchVideoComments } from "@/lib/youtube";
import CommentList from "@/components/CommentList";
import SentimentDisplay from "@/components/SentimentDisplay";
import KeywordCloud from "@/components/KeywordCloud";
import AiSummaryCard from "@/components/AiSummaryCard";
import FavoriteButton from "@/components/FavoriteButton";
import { MessageSquare, ExternalLink, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function VideoPage({ params }: Props) {
  const { id } = await params;

  let videoInfo: any = null;
  try {
    const r = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`, { next: { revalidate: 300 } });
    if (r.ok) videoInfo = await r.json();
  } catch {}

  let commentsData: any = null;
  let commentsError: string | null = null;
  let commentsDisabled = false;
  try {
    commentsData = await fetchVideoComments(id, 30);
  } catch (e: any) {
    const msg = e?.response?.data?.error?.message || e?.message || "";
    if (msg.includes("disabled") || msg.includes("commentsDisabled")) commentsDisabled = true;
    else commentsError = msg;
  }

  const commentTexts = commentsData?.comments?.map((c: any) => c.textDisplay) || [];

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/"
        className="inline-flex items-center gap-1.5 text-sm font-semibold mb-5 transition-colors"
        style={{ color: "var(--color-mute)" }}>
        <ArrowLeft className="w-4 h-4" />
        목록으로
      </Link>

      {/* Video embed — pin-card-large style */}
      <div className="overflow-hidden aspect-video mb-5"
        style={{ background: "#000", borderRadius: "var(--rounded-lg)" }}>
        <iframe
          src={`https://www.youtube.com/embed/${id}`}
          title={videoInfo?.title || "YouTube 영상"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen className="w-full h-full"
        />
      </div>

      {/* Video info */}
      <div className="rounded-[16px] p-5 mb-4"
        style={{ background: "var(--color-canvas)", border: "1px solid var(--color-hairline)" }}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="heading-md mb-1" style={{ color: "var(--color-ink)" }}>
              {videoInfo?.title || "영상 제목 로딩 중…"}
            </h1>
            {videoInfo?.author_name && (
              <p className="body-sm mb-3" style={{ color: "var(--color-mute)" }}>{videoInfo.author_name}</p>
            )}
            <a href={`https://www.youtube.com/watch?v=${id}`} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold"
              style={{ color: "var(--color-primary)" }}>
              <ExternalLink className="w-3.5 h-3.5" />
              YouTube에서 보기
            </a>
          </div>
          <FavoriteButton
            type="video" targetId={id}
            label={videoInfo?.title || id}
            metadata={{ thumbnailUrl: videoInfo?.thumbnail_url, channelTitle: videoInfo?.author_name }}
          />
        </div>
      </div>

      {/* AI summary */}
      {videoInfo?.title && (
        <div className="mb-4">
          <AiSummaryCard
            title={videoInfo.title} description=""
            channelTitle={videoInfo.author_name || ""} viewCount="0"
            comments={commentTexts}
          />
        </div>
      )}

      {/* Comment analysis */}
      {commentTexts.length > 0 && (
        <div className="rounded-[16px] p-5 mb-4"
          style={{ background: "var(--color-canvas)", border: "1px solid var(--color-hairline)" }}>
          <h2 className="font-bold text-sm mb-4" style={{ color: "var(--color-ink)" }}>댓글 분석</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="caption-md font-semibold mb-2" style={{ color: "var(--color-mute)" }}>감성 분석</p>
              <SentimentDisplay videoId={id} comments={commentTexts} />
            </div>
            <div>
              <p className="caption-md font-semibold mb-2" style={{ color: "var(--color-mute)" }}>키워드 추출</p>
              <KeywordCloud comments={commentTexts} />
            </div>
          </div>
        </div>
      )}

      {/* Comments */}
      <div className="rounded-[16px] p-5"
        style={{ background: "var(--color-canvas)", border: "1px solid var(--color-hairline)" }}>
        <h2 className="font-bold text-base mb-4 flex items-center gap-2" style={{ color: "var(--color-ink)" }}>
          <MessageSquare className="w-5 h-5" style={{ color: "var(--color-ash)" }} />
          댓글
        </h2>
        {commentsDisabled && (
          <p className="text-sm text-center py-8" style={{ color: "var(--color-ash)" }}>이 영상은 댓글이 비활성화되어 있습니다.</p>
        )}
        {commentsError && (
          <p className="text-sm text-center py-8" style={{ color: "var(--color-error)" }}>댓글을 불러올 수 없습니다: {commentsError}</p>
        )}
        {!commentsDisabled && !commentsError && commentsData && (
          <CommentList
            videoId={id}
            initialComments={commentsData.comments}
            initialNextPageToken={commentsData.nextPageToken}
            totalResults={commentsData.totalResults}
          />
        )}
      </div>
    </div>
  );
}
