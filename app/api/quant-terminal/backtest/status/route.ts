// 📁 app/api/quant-terminal/backtest/status/route.ts
import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL;

export async function GET(request: NextRequest) {
  if (!BACKEND) {
    const jobId = request.nextUrl.searchParams.get("jobId") ?? "";
    return NextResponse.json({
      jobId,
      status: "done",
      progressPct: 100,
      message: "完成",
    });
  }
  try {
    const qs = request.nextUrl.searchParams.toString();
    const res = await fetch(`${BACKEND}/backtest/status?${qs}`, {
      headers: request.headers.get("Authorization")
        ? { Authorization: request.headers.get("Authorization")! }
        : {},
    });
    if (!res.ok)
      return NextResponse.json(
        { error: await res.text() },
        { status: res.status },
      );
    return NextResponse.json(await res.json());
  } catch (err) {
    console.error("[backtest/status]", err);
    return NextResponse.json({ error: "Backend unreachable" }, { status: 502 });
  }
}
