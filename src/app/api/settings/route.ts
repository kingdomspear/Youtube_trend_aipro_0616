import { NextRequest, NextResponse } from "next/server";
import { getSetting, setSetting, deleteSetting, maskKey } from "@/lib/settings";
import type { SettingKey } from "@/lib/settings";

const ALLOWED_KEYS: SettingKey[] = ["YOUTUBE_API_KEY", "ANTHROPIC_API_KEY"];

// GET: 현재 설정값 (마스킹된 값 + 출처 반환)
export async function GET() {
  const results: Record<string, { masked: string; source: "db" | "env" | "none" }> = {};

  for (const key of ALLOWED_KEYS) {
    const dbRow = await import("@/lib/db").then(({ db }) =>
      db.setting.findUnique({ where: { key } })
    );
    const envVal = process.env[key];

    if (dbRow?.value) {
      results[key] = { masked: maskKey(dbRow.value), source: "db" };
    } else if (envVal) {
      results[key] = { masked: maskKey(envVal), source: "env" };
    } else {
      results[key] = { masked: "", source: "none" };
    }
  }

  return NextResponse.json(results);
}

// POST: 키 저장
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { key, value } = body as { key: SettingKey; value: string };

  if (!ALLOWED_KEYS.includes(key)) {
    return NextResponse.json({ error: "허용되지 않는 키입니다." }, { status: 400 });
  }
  if (!value?.trim()) {
    return NextResponse.json({ error: "값을 입력해주세요." }, { status: 400 });
  }

  await setSetting(key, value.trim());
  return NextResponse.json({ success: true, masked: maskKey(value.trim()) });
}

// DELETE: 키 삭제 (DB에서만 삭제, 환경변수는 유지)
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key") as SettingKey;

  if (!ALLOWED_KEYS.includes(key)) {
    return NextResponse.json({ error: "허용되지 않는 키입니다." }, { status: 400 });
  }

  await deleteSetting(key);
  return NextResponse.json({ success: true });
}
