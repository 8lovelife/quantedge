// 📁 app/api/quant-terminal/live/result/route.ts
// BFF: 获取实盘完整结果
//
// GET /api/quant-terminal/live/result?strategyId=
//
// 返回 LiveResultResponse：净值曲线、信号、指标、成交记录、持仓

import { NextRequest, NextResponse } from "next/server";
import {
  getOrCreateLiveSession,
  buildLiveResult,
} from "@/lib/api/quant-terminal/live/mock";

const BACKEND = process.env.BACKEND_URL;

export async function GET(request: NextRequest) {
  const strategyId =
    request.nextUrl.searchParams.get("strategyId") ?? "unknown";

  if (!BACKEND) {
    const state = getOrCreateLiveSession(strategyId);
    return NextResponse.json(buildLiveResult(state));
  }

  try {
    const qs = request.nextUrl.searchParams.toString();
    const res = await fetch(`${BACKEND}/live/result?${qs}`, {
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
    console.error("[live/result]", err);
    return NextResponse.json({ error: "Backend unreachable" }, { status: 502 });
  }
}
