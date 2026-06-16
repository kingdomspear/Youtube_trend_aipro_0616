export interface YouTubeThumbnail {
  url: string;
  width: number;
  height: number;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  channelId: string;
  channelTitle: string;
  publishedAt: string;
  thumbnails: {
    default: YouTubeThumbnail;
    medium: YouTubeThumbnail;
    high: YouTubeThumbnail;
    maxres?: YouTubeThumbnail;
  };
  viewCount: string;
  likeCount: string;
  commentCount: string;
  categoryId: string;
  duration: string;
  tags?: string[];
}

export interface YouTubeComment {
  id: string;
  authorDisplayName: string;
  authorProfileImageUrl: string;
  textDisplay: string;
  likeCount: number;
  publishedAt: string;
  replyCount: number;
}

export interface YouTubeCategory {
  id: string;
  title: string;
}

export interface TrendingResponse {
  videos: YouTubeVideo[];
  nextPageToken?: string;
  totalResults: number;
}

export interface CommentsResponse {
  comments: YouTubeComment[];
  nextPageToken?: string;
  totalResults: number;
}

export const YOUTUBE_CATEGORIES: YouTubeCategory[] = [
  { id: "", title: "전체" },
  { id: "1", title: "영화 & 애니메이션" },
  { id: "2", title: "자동차 & 교통" },
  { id: "10", title: "음악" },
  { id: "15", title: "반려동물 & 동물" },
  { id: "17", title: "스포츠" },
  { id: "19", title: "여행 & 이벤트" },
  { id: "20", title: "게임" },
  { id: "22", title: "인물 & 블로그" },
  { id: "23", title: "코미디" },
  { id: "24", title: "엔터테인먼트" },
  { id: "25", title: "뉴스 & 정치" },
  { id: "26", title: "노하우 & 스타일" },
  { id: "27", title: "교육" },
  { id: "28", title: "과학 & 기술" },
  { id: "29", title: "비영리 & 사회활동" },
];

export const COUNTRIES = [
  { code: "KR", name: "대한민국" },
  { code: "US", name: "미국" },
  { code: "JP", name: "일본" },
  { code: "GB", name: "영국" },
  { code: "DE", name: "독일" },
  { code: "FR", name: "프랑스" },
  { code: "IN", name: "인도" },
  { code: "BR", name: "브라질" },
  { code: "CA", name: "캐나다" },
  { code: "AU", name: "호주" },
  { code: "TW", name: "대만" },
  { code: "SG", name: "싱가포르" },
  { code: "MX", name: "멕시코" },
  { code: "IT", name: "이탈리아" },
  { code: "ES", name: "스페인" },
];
