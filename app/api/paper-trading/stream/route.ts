// app/api/paper-trading/stream/route.ts
// ─── SSE stream for paper trading ────────────────────────────────────────────
// Pushes tick / signal / metrics / heartbeat events as Server-Sent Events.
// Replace the mock logic inside the interval with real exchange WebSocket
// data when ready — the SSE framing and client contract stay the same.

import {
  buildHeartbeat,
  buildMetrics,
  createMockSession,
  nextTick,
  toSSE,
} from "@/lib/api/quant-terminal/mock";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs"; // needs setTimeout / setInterval

// Tick interval in ms — lower = smoother chart, higher = less CPU
const TICK_MS = 300;

// Metrics snapshot every N ticks
const METRICS_EVERY = 10;

// Heartbeat every N ticks
const HEARTBEAT_EVERY = 20;

export async function GET(request: NextRequest) {
  const strategyId =
    request.nextUrl.searchParams.get("strategyId") ?? "unknown";

  let state = createMockSession(strategyId);
  let tickCount = 0;
  let closed = false;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial heartbeat immediately so the client knows it's connected
      controller.enqueue(encoder.encode(toSSE(buildHeartbeat(state))));

      const interval = setInterval(() => {
        if (closed) {
          clearInterval(interval);
          return;
        }

        // Generate next tick + optional signal
        const { tick, signal, updatedState } = nextTick(state);
        state = updatedState;
        tickCount++;

        try {
          // Always push tick
          controller.enqueue(encoder.encode(toSSE(tick)));

          // Push signal when triggered
          if (signal) {
            controller.enqueue(encoder.encode(toSSE(signal)));
          }

          // Periodic metrics snapshot
          if (tickCount % METRICS_EVERY === 0) {
            controller.enqueue(encoder.encode(toSSE(buildMetrics(state))));
          }

          // Periodic heartbeat
          if (tickCount % HEARTBEAT_EVERY === 0) {
            controller.enqueue(encoder.encode(toSSE(buildHeartbeat(state))));
          }
        } catch {
          // Client disconnected — stop the interval
          clearInterval(interval);
          closed = true;
        }
      }, TICK_MS);

      // Clean up if the client closes the connection
      request.signal.addEventListener("abort", () => {
        closed = true;
        clearInterval(interval);
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // disable Nginx buffering
    },
  });
}
