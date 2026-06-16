import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "yt3.ggpht.com" },
      { protocol: "https", hostname: "yt3.googleusercontent.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "ui-avatars.com" },
    ],
  },
  // Vercel 번들에 빌드 시 생성한 스키마 DB 포함
  outputFileTracingIncludes: {
    "/api/**": ["./prisma/runtime.db"],
  },
};

export default nextConfig;
