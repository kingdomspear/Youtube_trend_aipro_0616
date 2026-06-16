import { db } from "./db";

export type SettingKey = "YOUTUBE_API_KEY" | "ANTHROPIC_API_KEY";

/**
 * DB 설정 → 환경변수 순으로 조회.
 * DB에 저장된 값이 있으면 항상 우선 적용.
 */
export async function getSetting(key: SettingKey): Promise<string | null> {
  try {
    const row = await db.setting.findUnique({ where: { key } });
    if (row?.value) return row.value;
  } catch {}
  return process.env[key] ?? null;
}

export async function setSetting(key: SettingKey, value: string): Promise<void> {
  await db.setting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
}

export async function deleteSetting(key: SettingKey): Promise<void> {
  await db.setting.deleteMany({ where: { key } });
}

/** 마지막 4자리만 보여주고 나머지는 마스킹 */
export function maskKey(key: string): string {
  if (!key || key.length < 8) return "****";
  return "*".repeat(key.length - 4) + key.slice(-4);
}
