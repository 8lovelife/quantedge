// 📁 app/api/quant-terminal/live/stop/route.ts
// BFF: 终止实盘策略并强制平仓
//
// POST /api/quant-terminal/live/stop?strategyId=
//
// 停止后自动将结果写入 snapshot 缓存，供后续查询

import { NextRequest, NextResponse } from "next/server";
import {
  getOrCreateLiveSession,
  updateLiveSession,
  buildLiveResult,
} from "@/lib/api/quant-terminal/live/mock";

const BACKEND = process.env.BACKEND_URL;

export async function POST(request: NextRequest) {
  const strategyId =
    request.nextUrl.searchParams.get("strategyId") ?? "unknown";

  if (!BACKEND) {
    const state = getOrCreateLiveSession(strategyId);
    const stopped = {
      ...state,
      status: "stopped" as const,
      openPosition: false,
      openBuyPrice: 0,
      openQty: 0,
    };
    updateLiveSession(strategyId, stopped);
    buildLiveResult(stopped); // 触发 snapshot 缓存写入
    return NextResponse.json({
      ok: true,
      status: "stopped",
      message: "策略已终止，持仓已平仓",
    });
  }

  try {
    const qs = request.nextUrl.searchParams.toString();
    const res = await fetch(`${BACKEND}/live/stop?${qs}`, {
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
    console.error("[live/stop]", err);
    return NextResponse.json({ error: "Backend unreachable" }, { status: 502 });
  }
}
