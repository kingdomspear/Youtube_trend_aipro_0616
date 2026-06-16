import { PrismaClient } from "@prisma/client";

function createClient(): PrismaClient {
  // Vercel: /tmp/ 만 쓰기 가능 — 번들된 스키마 DB를 /tmp/로 복사 후 사용
  if (process.env.VERCEL) {
    try {
      const fs  = require("fs")   as typeof import("fs");
      const path = require("path") as typeof import("path");
      const tmpDb    = "/tmp/youtube-trend.db";
      const schemaDb = path.join(process.cwd(), "prisma/runtime.db");
      if (!fs.existsSync(tmpDb) && fs.existsSync(schemaDb)) {
        fs.copyFileSync(schemaDb, tmpDb);
      }
      return new PrismaClient({
        datasources: { db: { url: `file:${tmpDb}` } },
        log: ["error"],
      });
    } catch {}
  }

  // 로컬 개발: schema.prisma 의 url 사용
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const db = globalForPrisma.prisma ?? createClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
