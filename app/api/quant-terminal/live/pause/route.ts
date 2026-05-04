// 📁 app/api/quant-terminal/live/pause/route.ts
// BFF: 暂停实盘策略（持仓保持不动）
//
// POST /api/quant-terminal/live/pause?strategyId=

import { NextRequest, NextResponse } from "next/server";
import {
  getOrCreateLiveSession,
  updateLiveSession,
} from "@/lib/api/quant-terminal/live/mock";

const BACKEND = process.env.BACKEND_URL;

export async function POST(request: NextRequest) {
  const strategyId =
    request.nextUrl.searchParams.get("strategyId") ?? "unknown";

  if (!BACKEND) {
    const state = getOrCreateLiveSession(strategyId);
    updateLiveSession(strategyId, { ...state, status: "paused" });
    return NextResponse.json({
      ok: true,
      status: "paused",
      message: "策略已暂停，持仓保留",
    });
  }

  try {
    const qs = request.nextUrl.searchParams.toString();
    const res = await fetch(`${BACKEND}/live/pause?${qs}`, {
      method: "POST",
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
    console.error("[live/pause]", err);
    return NextResponse.json({ error: "Backend unreachable" }, { status: 502 });
  }
}
