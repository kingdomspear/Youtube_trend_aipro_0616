import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import QuotaBar from "@/components/QuotaBar";
import { TrendingUp, Globe2, FileText, Star, Database, Settings } from "lucide-react";

export const metadata: Metadata = {
  title: "YT 트렌드 분석",
  description: "YouTube 급상승 동영상 트렌드 분석 도구",
};

const NAV_LINKS = [
  { href: "/",         label: "급상승",   icon: TrendingUp },
  { href: "/compare",  label: "국가 비교", icon: Globe2 },
  { href: "/reports",  label: "AI 리포트", icon: FileText },
  { href: "/favorites",label: "즐겨찾기",  icon: Star },
  { href: "/quota",    label: "할당량",    icon: Database },
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full flex flex-col" style={{ background: "var(--color-surface-soft)" }}>

        {/* ── Primary Nav ───────────────────────────────────────── */}
        <header style={{ background: "var(--color-canvas)", borderBottom: "1px solid var(--color-hairline)" }}
          className="sticky top-0 z-50">
          <div className="max-w-screen-xl mx-auto px-5 h-16 flex items-center gap-4">

            {/* Brand wordmark */}
            <Link href="/" className="flex items-center gap-2 shrink-0 font-bold text-[17px] tracking-tight"
              style={{ color: "var(--color-primary)" }}>
              {/* YouTube play icon (custom SVG) */}
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0C.488 3.45.029 5.804 0 12c.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0C23.512 20.55 23.971 18.196 24 12c-.029-6.185-.484-8.549-4.385-8.816zM9 16V8l8 3.993L9 16z"/>
              </svg>
              YT 트렌드
            </Link>

            {/* Nav links */}
            <nav className="flex items-center gap-0.5 ml-2 overflow-x-auto">
              {NAV_LINKS.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-[16px] text-sm font-semibold transition-colors whitespace-nowrap"
                  style={{ color: "var(--color-mute)" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--color-ink)", e.currentTarget.style.background = "var(--color-surface-card)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--color-mute)", e.currentTarget.style.background = "transparent")}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
            </nav>

            {/* Right cluster */}
            <div className="ml-auto flex items-center gap-3 shrink-0">
              <QuotaBar />

              <Link href="/settings"
                className="flex items-center gap-1.5 px-3 py-2 rounded-[16px] text-sm font-semibold transition-colors"
                style={{ color: "var(--color-mute)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--color-ink)", e.currentTarget.style.background = "var(--color-surface-card)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--color-mute)", e.currentTarget.style.background = "transparent")}
              >
                <Settings className="w-4 h-4" />
                설정
              </Link>

              <a href="https://www.youtube.com/feed/trending" target="_blank" rel="noopener noreferrer"
                className="btn-primary text-sm flex items-center gap-1.5">
                YouTube 바로가기
              </a>
            </div>
          </div>
        </header>

        {/* ── Main content ──────────────────────────────────────── */}
        <main className="flex-1 max-w-screen-xl mx-auto w-full px-5 py-8">
          {children}
        </main>

        {/* ── Footer ────────────────────────────────────────────── */}
        <footer style={{ background: "var(--color-canvas)", borderTop: "1px solid var(--color-hairline)" }}
          className="py-5 px-5">
          <div className="max-w-screen-xl mx-auto flex items-center justify-between flex-wrap gap-2">
            <span className="font-bold text-sm" style={{ color: "var(--color-primary)" }}>YT 트렌드</span>
            <p className="caption-sm" style={{ color: "var(--color-mute)" }}>
              YouTube Data API v3 기반 트렌드 분석 도구 &nbsp;·&nbsp; © 2026
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
