// 📁 app/api/quant-terminal/live/resume/route.ts
// BFF: 恢复暂停的实盘策略
//
// POST /api/quant-terminal/live/resume?strategyId=

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
    updateLiveSession(strategyId, { ...state, status: "running" });
    return NextResponse.json({
      ok: true,
      status: "running",
      message: "策略已恢复运行",
    });
  }

  try {
    const qs = request.nextUrl.searchParams.toString();
    const res = await fetch(`${BACKEND}/live/resume?${qs}`, {
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
    console.error("[live/resume]", err);
    return NextResponse.json({ error: "Backend unreachable" }, { status: 502 });
  }
}
