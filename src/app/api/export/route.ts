import { NextRequest, NextResponse } from "next/server";
import { generateCsv, generateExcel } from "@/lib/exportUtils";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { videos, format = "csv" } = body;

  if (!videos?.length) {
    return NextResponse.json({ error: "videos가 필요합니다." }, { status: 400 });
  }

  const date = new Date().toISOString().slice(0, 10);

  try {
    if (format === "xlsx") {
      const buffer = generateExcel(videos);
      return new NextResponse(buffer as unknown as BodyInit, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="youtube-trend-${date}.xlsx"`,
        },
      });
    }

    const csv = generateCsv(videos);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="youtube-trend-${date}.csv"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
