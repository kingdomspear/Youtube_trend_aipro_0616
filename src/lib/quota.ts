import { db } from "./db";

// YouTube Data API v3 quota 비용 (단위: units)
const QUOTA_COSTS: Record<string, number> = {
  "videos.list": 1,
  "commentThreads.list": 1,
  "channels.list": 1,
};

export const DAILY_LIMIT = 10000;
export const DAILY_SOFT_LIMIT = 7000; // 이 값 도달 시 API 호출 중지

export class QuotaExceededError extends Error {
  constructor(used: number) {
    super(`일일 API 사용 한도(${DAILY_SOFT_LIMIT.toLocaleString()} units)에 도달했습니다. 현재 사용량: ${used.toLocaleString()} units. 내일 다시 시도해 주세요.`);
    this.name = "QuotaExceededError";
  }
}

export async function checkQuota(): Promise<void> {
  const date = new Date().toISOString().slice(0, 10);
  const logs = await db.quotaLog.findMany({ where: { date } });
  const used = logs.reduce((s, l) => s + l.units, 0);
  if (used >= DAILY_SOFT_LIMIT) {
    throw new QuotaExceededError(used);
  }
}

export async function logQuota(endpoint: keyof typeof QUOTA_COSTS): Promise<void> {
  try {
    const date = new Date().toISOString().slice(0, 10);
    await db.quotaLog.create({
      data: { endpoint, units: QUOTA_COSTS[endpoint] ?? 1, date },
    });
  } catch {
    // quota 로깅 실패는 무시
  }
}

export async function getQuotaStats(date?: string): Promise<{
  used: number;
  limit: number;
  softLimit: number;
  remaining: number;
  softRemaining: number;
  pct: number;
  softPct: number;
  blocked: boolean;
  byEndpoint: Record<string, number>;
}> {
  const targetDate = date || new Date().toISOString().slice(0, 10);
  const logs = await db.quotaLog.findMany({ where: { date: targetDate } });

  const used = logs.reduce((s, l) => s + l.units, 0);
  const byEndpoint: Record<string, number> = {};
  logs.forEach((l) => {
    byEndpoint[l.endpoint] = (byEndpoint[l.endpoint] || 0) + l.units;
  });

  return {
    used,
    limit: DAILY_LIMIT,
    softLimit: DAILY_SOFT_LIMIT,
    remaining: Math.max(0, DAILY_LIMIT - used),
    softRemaining: Math.max(0, DAILY_SOFT_LIMIT - used),
    pct: Math.round((used / DAILY_LIMIT) * 100),
    softPct: Math.min(100, Math.round((used / DAILY_SOFT_LIMIT) * 100)),
    blocked: used >= DAILY_SOFT_LIMIT,
    byEndpoint,
  };
}
