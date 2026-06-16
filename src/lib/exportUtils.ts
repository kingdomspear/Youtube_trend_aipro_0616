import * as XLSX from "xlsx";
import { YouTubeVideo } from "@/types/youtube";

export interface ExportVideo extends YouTubeVideo {
  rank: number;
  trendScore?: number;
  subCategory?: string;
}

export function generateCsv(videos: ExportVideo[]): string {
  const BOM = "﻿";
  const headers = [
    "순위", "제목", "채널명", "조회수", "좋아요", "댓글수",
    "트렌드점수", "업로드일", "영상길이", "카테고리ID", "태그",
  ];
  const rows = videos.map((v) => [
    v.rank,
    `"${v.title.replace(/"/g, '""')}"`,
    `"${v.channelTitle.replace(/"/g, '""')}"`,
    v.viewCount,
    v.likeCount,
    v.commentCount,
    v.trendScore ?? "",
    v.publishedAt.slice(0, 10),
    v.duration,
    v.categoryId,
    `"${(v.tags || []).slice(0, 5).join(", ")}"`,
  ]);
  return BOM + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

export function generateExcel(videos: ExportVideo[]): Buffer {
  const data = [
    ["순위", "제목", "채널명", "조회수", "좋아요", "댓글수", "트렌드점수", "업로드일", "영상길이", "카테고리"],
    ...videos.map((v) => [
      v.rank, v.title, v.channelTitle,
      parseInt(v.viewCount) || 0,
      parseInt(v.likeCount) || 0,
      parseInt(v.commentCount) || 0,
      v.trendScore ?? "",
      v.publishedAt.slice(0, 10),
      v.duration,
      v.categoryId,
    ]),
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);

  // 열 너비 설정
  ws["!cols"] = [
    { wch: 6 }, { wch: 50 }, { wch: 25 }, { wch: 12 },
    { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 8 }, { wch: 8 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "급상승 영상");

  return Buffer.from(XLSX.write(wb, { type: "buffer", bookType: "xlsx" }));
}
