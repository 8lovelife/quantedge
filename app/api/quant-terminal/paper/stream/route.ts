// 📁 app/api/quant-terminal/paper/stream/route.ts
// BFF: 模拟交易 SSE 流
// BACKEND_URL 已设置 → 透传后端；未设置 → 服务端 mock SSE

import { NextRequest } from "next/server";
import {
  getOrCreateSession,
  updateSession,
  nextPaperTick,
  buildPaperMetricsEvent,
  buildPaperHeartbeat,
  buildPaperResult,
  toSSE,
} from "@/lib/api/quant-terminal/paper/mock";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BACKEND = process.env.BACKEND_URL;
const TICK_MS = 300;
const METRICS_EVERY = 10;
const HEARTBEAT_EVERY = 20;

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const strategyId = params.get("strategyId") ?? "unknown";
  const planDays = parseInt(params.get("planDays") ?? "14");

  // ── 真实后端 ──────────────────────────────────────────────────────────────
  if (BACKEND) {
    try {
      const upstream = await fetch(
        `${BACKEND}/paper/stream?${params.toString()}`,
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
      console.error("[paper/stream] backend failed:", err);
      return new Response("Backend unreachable", { status: 502 });
    }
  }

  // ── 服务端 Mock SSE ──────────────────────────────────────────────────────
  let closed = false;
  let tickCount = 0;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const initState = getOrCreateSession(strategyId, planDays);
      controller.enqueue(encoder.encode(toSSE(buildPaperHeartbeat(initState))));

      const timer = setInterval(() => {
        if (closed) {
          clearInterval(timer);
          return;
        }
        const cur = getOrCreateSession(strategyId);

        if (cur.status === "running" && Date.now() >= cur.endsAt) {
          const done = { ...cur, status: "done" as const };
          updateSession(strategyId, done);
          buildPaperResult(done);
          try {
            controller.enqueue(
              encoder.encode(toSSE(buildPaperHeartbeat(done))),
            );
            controller.close();
          } catch {
            /* ok */
          }
          clearInterval(timer);
          return;
        }

        const { tick, signal, updatedState } = nextPaperTick(cur);
        updateSession(strategyId, updatedState);
        tickCount++;

        try {
          controller.enqueue(encoder.encode(toSSE(tick)));
          if (signal) controller.enqueue(encoder.encode(toSSE(signal)));
          if (tickCount % METRICS_EVERY === 0)
            controller.enqueue(
              encoder.encode(toSSE(buildPaperMetricsEvent(updatedState))),
            );
          if (tickCount % HEARTBEAT_EVERY === 0)
            controller.enqueue(
              encoder.encode(toSSE(buildPaperHeartbeat(updatedState))),
            );
        } catch {
          clearInterval(timer);
          closed = true;
        }
      }, TICK_MS);

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
