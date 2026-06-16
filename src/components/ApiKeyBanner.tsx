"use client";

import { Key, ExternalLink, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ApiKeyBanner() {
  return (
    <div className="rounded-[16px] p-5" style={{ background: "#fff8e7", border: "1px solid #f5d87a" }}>
      <div className="flex items-start gap-3">
        <Key className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "#b45309" }} />
        <div className="flex-1">
          <h3 className="font-bold text-sm mb-1" style={{ color: "#92400e" }}>YouTube API 키 설정이 필요합니다</h3>
          <p className="text-sm mb-3" style={{ color: "#a16207" }}>
            설정 메뉴에서 YouTube Data API 키를 등록하면 급상승 영상 데이터를 불러올 수 있습니다.
          </p>
          <Link href="/settings" className="btn-primary inline-flex items-center gap-1.5 text-sm">
            설정으로 이동 <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="https://console.cloud.google.com/"
            target="_blank" rel="noopener noreferrer"
            className="ml-3 text-sm font-semibold inline-flex items-center gap-1"
            style={{ color: "#b45309" }}
          >
            API 키 발급 <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
