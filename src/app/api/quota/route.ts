import { NextRequest, NextResponse } from "next/server";
import { getQuotaStats } from "@/lib/quota";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date") || undefined;
  try {
    const stats = await getQuotaStats(date);
    return NextResponse.json(stats);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
