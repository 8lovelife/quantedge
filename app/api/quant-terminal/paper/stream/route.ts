// 📁 app/api/quant-terminal/paper/stream/route.ts
// BFF: 将模拟交易 SSE 流从后端透传至浏览器
//
// GET /api/quant-terminal/paper/stream?strategyId=&planDays=
//
// 推送事件：tick / signal / metrics / heartbeat

import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:8000";

export async function GET(request: NextRequest) {
  const qs = request.nextUrl.searchParams.toString();
  try {
    const upstream = await fetch(`${BACKEND}/paper/stream?${qs}`, {
      headers: {
        Accept: "text/event-stream",
        ...(request.headers.get("Authorization")
          ? { Authorization: request.headers.get("Authorization")! }
          : {}),
      },
      // @ts-expect-error — Node.js fetch supports duplex
      duplex: "half",
      signal: request.signal,
    });

    if (!upstream.ok || !upstream.body) {
      return new Response(`Backend error: ${upstream.status}`, { status: 502 });
    }

    return new Response(upstream.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    console.error("[quant-terminal/paper/stream]", err);
    return new Response("Backend unreachable", { status: 502 });
  }
}
