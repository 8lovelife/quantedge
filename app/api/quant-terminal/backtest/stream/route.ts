// 📁 app/api/quant-terminal/backtest/stream/route.ts
// BACKEND_URL 已设置 → 透传后端 SSE；未设置 → 服务端 mock SSE

import { NextRequest } from "next/server";
import {
  buildMockBacktestResult,
  buildMockProgressEvents,
} from "@/lib/api/quant-terminal/backtest/mock";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BACKEND = process.env.BACKEND_URL;
const STEP_MS = 350;

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const strategyId = params.get("strategyId") ?? "unknown";
  const range = (params.get("range") ?? "3m") as "1m" | "3m" | "6m" | "1y";
  const asset = params.get("asset") ?? "BTC/USDT";

  // ── 真实后端 ──────────────────────────────────────────────────────────────
  if (BACKEND) {
    try {
      const upstream = await fetch(
        `${BACKEND}/backtest/stream?${params.toString()}`,
        {
          headers: {
            Accept: "text/event-stream",
            ...(request.headers.get("Authorization")
              ? { Authorization: request.headers.get("Authorization")! }
              : {}),
          },
          // @ts-expect-error
          duplex: "half",
          signal: request.signal,
        },
      );
      if (!upstream.ok || !upstream.body)
        return new Response(`Backend error: ${upstream.status}`, {
          status: 502,
        });
      return new Response(upstream.body, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
          "X-Accel-Buffering": "no",
        },
      });
    } catch (err) {
      console.error("[backtest/stream] backend failed:", err);
      return new Response("Backend unreachable", { status: 502 });
    }
  }

  // ── 服务端 Mock SSE ──────────────────────────────────────────────────────
  const result = buildMockBacktestResult(strategyId, range, asset);
  const events = buildMockProgressEvents(result);
  let idx = 0;
  let closed = false;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const timer = setInterval(() => {
        if (closed || idx >= events.length) {
          clearInterval(timer);
          if (!closed)
            try {
              controller.close();
            } catch {
              /* ok */
            }
          return;
        }
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(events[idx++])}\n\n`),
          );
        } catch {
          clearInterval(timer);
          closed = true;
        }
      }, STEP_MS);

      request.signal.addEventListener("abort", () => {
        closed = true;
        clearInterval(timer);
        try {
          controller.close();
        } catch {
          /* ok */
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
