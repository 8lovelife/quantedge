// 📁 app/api/quant-terminal/paper/snapshot/route.ts
// BFF: 查询缓存的模拟交易结果快照
//
// GET /api/quant-terminal/paper/snapshot?strategyId=
//
// 返回 PaperSnapshotResponse：
//   { found: false }                         — 无缓存
//   { found: true, cachedAt, result: {...} } — 有缓存，直接渲染无需等待会话

import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:8000";

export async function GET(request: NextRequest) {
  try {
    const qs = request.nextUrl.searchParams.toString();
    const res = await fetch(`${BACKEND}/paper/snapshot?${qs}`, {
      headers: request.headers.get("Authorization")
        ? { Authorization: request.headers.get("Authorization")! }
        : {},
    });
    // 404 = 无缓存，标准化为 found:false
    if (res.status === 404) {
      return NextResponse.json({ found: false });
    }
    if (!res.ok)
      return NextResponse.json(
        { error: await res.text() },
        { status: res.status },
      );
    return NextResponse.json(await res.json());
  } catch (err) {
    console.error("[quant-terminal/paper/snapshot]", err);
    // 后端不可达时降级返回 found:false，前端重新开始模拟
    return NextResponse.json({ found: false });
  }
}
