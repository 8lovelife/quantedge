// 📁 app/api/quant-terminal/backtest/snapshot/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getMockSnapshot } from "@/lib/api/quant-terminal/backtest/mock";

const BACKEND = process.env.BACKEND_URL;

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const strategyId = params.get("strategyId") ?? "unknown";
  const range = (params.get("range") ?? "3m") as "1m" | "3m" | "6m" | "1y";

  if (!BACKEND) {
    return NextResponse.json(getMockSnapshot(strategyId, range));
  }
  try {
    const qs = params.toString();
    const res = await fetch(`${BACKEND}/backtest/snapshot?${qs}`, {
      headers: request.headers.get("Authorization")
        ? { Authorization: request.headers.get("Authorization")! }
        : {},
    });
    if (res.status === 404) return NextResponse.json({ found: false });
    if (!res.ok)
      return NextResponse.json(
        { error: await res.text() },
        { status: res.status },
      );
    return NextResponse.json(await res.json());
  } catch (err) {
    console.error("[backtest/snapshot]", err);
    return NextResponse.json({ found: false });
  }
}
