// 📁 app/api/quant-terminal/live/snapshot/route.ts
// BFF: 查询缓存的实盘结果快照
//
// GET /api/quant-terminal/live/snapshot?strategyId=
//
// 返回 LiveSnapshotResponse：
//   { found: false }                         — 无缓存（会话从未停止过）
//   { found: true, cachedAt, result: {...} } — 有缓存，直接渲染无需等待流

import { NextRequest, NextResponse } from "next/server";
import {
  getOrCreateLiveSession,
  buildLiveSnapshot,
  getMockLiveSnapshot,
} from "@/lib/api/quant-terminal/live/mock";

const BACKEND = process.env.BACKEND_URL;

export async function GET(request: NextRequest) {
  const strategyId =
    request.nextUrl.searchParams.get("strategyId") ?? "unknown";
  const cached = request.nextUrl.searchParams.get("cached") === "true";

  if (!BACKEND) {
    if (cached) {
      // cached=true → 查询 snapshot 缓存（stopped/done 时写入）
      return NextResponse.json(getMockLiveSnapshot(strategyId));
    }
    // cached=false → 返回当前会话实时快照（legacy LiveSnapshot）
    const state = getOrCreateLiveSession(strategyId);
    return NextResponse.json(buildLiveSnapshot(state));
  }

  try {
    const qs = request.nextUrl.searchParams.toString();
    const res = await fetch(`${BACKEND}/live/snapshot?${qs}`, {
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
    console.error("[live/snapshot]", err);
    return NextResponse.json({ found: false });
  }
}
