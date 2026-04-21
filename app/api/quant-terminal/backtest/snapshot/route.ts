// 📁 app/api/quant-terminal/backtest/snapshot/route.ts
// BFF: 查询回测缓存快照
//
// GET /api/quant-terminal/backtest/snapshot?strategyId=&range=
//
// 返回：
//   { found: false }                         — 无缓存，前端需重新跑回测
//   { found: true, cachedAt, result: {...} } — 有缓存，直接渲染

import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:8000";

export async function GET(request: NextRequest) {
  try {
    const qs = request.nextUrl.searchParams.toString();
    const res = await fetch(`${BACKEND}/backtest/snapshot?${qs}`, {
      headers: request.headers.get("Authorization")
        ? { Authorization: request.headers.get("Authorization")! }
        : {},
    });

    // 后端 404 表示无缓存，转为标准 found:false 响应
    if (res.status === 404) {
      return NextResponse.json({ found: false });
    }
    if (!res.ok) {
      return NextResponse.json(
        { error: await res.text() },
        { status: res.status },
      );
    }

    return NextResponse.json(await res.json());
  } catch (err) {
    console.error("[quant-terminal/backtest/snapshot]", err);
    // 后端不可达时返回 found:false，前端降级重跑
    return NextResponse.json({ found: false });
  }
}
