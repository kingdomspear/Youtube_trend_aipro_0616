import axios from "axios";
import { YouTubeVideo, YouTubeComment, TrendingResponse, CommentsResponse } from "@/types/youtube";
import { logQuota } from "./quota";
import { getSetting } from "./settings";

const BASE_URL = "https://www.googleapis.com/youtube/v3";

async function getApiKey(): Promise<string> {
  const key = await getSetting("YOUTUBE_API_KEY");
  if (!key || key === "여기에_유튜브_API_키를_입력하세요") {
    throw new Error("YouTube API 키가 설정되지 않았습니다. 설정 메뉴에서 API 키를 등록해주세요.");
  }
  return key;
}

function parseDuration(iso: string): string {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "0:00";
  const h = parseInt(match[1] || "0");
  const m = parseInt(match[2] || "0");
  const s = parseInt(match[3] || "0");
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export async function fetchTrendingVideos(
  regionCode: string = "KR",
  categoryId: string = "",
  maxResults: number = 50,
  pageToken?: string
): Promise<TrendingResponse> {
  const apiKey = await getApiKey();

  const params: Record<string, string | number> = {
    part: "snippet,statistics,contentDetails",
    chart: "mostPopular",
    regionCode,
    maxResults,
    key: apiKey,
  };

  if (categoryId) params.videoCategoryId = categoryId;
  if (pageToken) params.pageToken = pageToken;

  await logQuota("videos.list");
  const res = await axios.get(`${BASE_URL}/videos`, { params });
  const data = res.data;

  const videos: YouTubeVideo[] = data.items.map((item: any) => ({
    id: item.id,
    title: item.snippet.title,
    description: item.snippet.description,
    channelId: item.snippet.channelId,
    channelTitle: item.snippet.channelTitle,
    publishedAt: item.snippet.publishedAt,
    thumbnails: item.snippet.thumbnails,
    viewCount: item.statistics?.viewCount || "0",
    likeCount: item.statistics?.likeCount || "0",
    commentCount: item.statistics?.commentCount || "0",
    categoryId: item.snippet.categoryId,
    duration: parseDuration(item.contentDetails.duration),
    tags: item.snippet.tags,
  }));

  return {
    videos,
    nextPageToken: data.nextPageToken,
    totalResults: data.pageInfo?.totalResults || 0,
  };
}

export async function fetchVideoComments(
  videoId: string,
  maxResults: number = 20,
  pageToken?: string
): Promise<CommentsResponse> {
  const apiKey = await getApiKey();

  const params: Record<string, string | number> = {
    part: "snippet",
    videoId,
    maxResults,
    order: "relevance",
    key: apiKey,
  };

  if (pageToken) params.pageToken = pageToken;

  await logQuota("commentThreads.list");
  const res = await axios.get(`${BASE_URL}/commentThreads`, { params });
  const data = res.data;

  const comments: YouTubeComment[] = data.items.map((item: any) => {
    const top = item.snippet.topLevelComment.snippet;
    return {
      id: item.id,
      authorDisplayName: top.authorDisplayName,
      authorProfileImageUrl: top.authorProfileImageUrl,
      textDisplay: top.textDisplay,
      likeCount: top.likeCount || 0,
      publishedAt: top.publishedAt,
      replyCount: item.snippet.totalReplyCount || 0,
    };
  });

  return {
    comments,
    nextPageToken: data.nextPageToken,
    totalResults: data.pageInfo?.totalResults || 0,
  };
}

export interface ChannelInfo {
  channelId: string;
  title: string;
  description: string;
  subscriberCount: string;
  videoCount: string;
  viewCount: string;
  country: string;
  publishedAt: string;
  thumbnailUrl: string;
}

export async function fetchChannelInfo(channelId: string): Promise<ChannelInfo> {
  const apiKey = await getApiKey();
  await logQuota("channels.list");
  const res = await axios.get(`${BASE_URL}/channels`, {
    params: { part: "snippet,statistics", id: channelId, key: apiKey },
  });
  const item = res.data.items?.[0];
  if (!item) throw new Error("채널을 찾을 수 없습니다.");
  return {
    channelId: item.id,
    title: item.snippet.title,
    description: item.snippet.description || "",
    subscriberCount: item.statistics?.subscriberCount || "0",
    videoCount: item.statistics?.videoCount || "0",
    viewCount: item.statistics?.viewCount || "0",
    country: item.snippet.country || "",
    publishedAt: item.snippet.publishedAt || "",
    thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url || "",
  };
}
