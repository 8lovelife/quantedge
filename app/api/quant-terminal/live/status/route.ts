// 📁 app/api/quant-terminal/live/status/route.ts
// BFF: 查询实盘会话运行状态
//
// GET /api/quant-terminal/live/status?strategyId=
//
// 返回 LiveStatusResponse：状态、持仓信息、已运行时长

import { NextRequest, NextResponse } from "next/server";
import {
  getOrCreateLiveSession,
  buildLiveStatus,
} from "@/lib/api/quant-terminal/live/mock";

const BACKEND = process.env.BACKEND_URL;

export async function GET(request: NextRequest) {
  const strategyId =
    request.nextUrl.searchParams.get("strategyId") ?? "unknown";

  if (!BACKEND) {
    const state = getOrCreateLiveSession(strategyId);
    return NextResponse.json(buildLiveStatus(state));
  }

  try {
    const qs = request.nextUrl.searchParams.toString();
    const res = await fetch(`${BACKEND}/live/status?${qs}`, {
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
    console.error("[live/status]", err);
    return NextResponse.json({ error: "Backend unreachable" }, { status: 502 });
  }
}
