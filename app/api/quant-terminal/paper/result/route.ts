// 📁 app/api/quant-terminal/paper/result/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  getOrCreateSession,
  buildPaperResult,
} from "@/lib/api/quant-terminal/paper/mock";

const BACKEND = process.env.BACKEND_URL;

export async function GET(request: NextRequest) {
  const strategyId =
    request.nextUrl.searchParams.get("strategyId") ?? "unknown";
  if (!BACKEND) {
    const state = getOrCreateSession(strategyId);
    return NextResponse.json(buildPaperResult(state));
  }
  try {
    const qs = request.nextUrl.searchParams.toString();
    const res = await fetch(`${BACKEND}/paper/result?${qs}`, {
      headers: request.headers.get("Authorization")
        ? { Authorization: request.headers.get("Authorization")! }
        : {},
    });
    if (res.status === 202)
      return NextResponse.json(
        { error: "Session not complete" },
        { status: 202 },
      );
    if (!res.ok)
      return NextResponse.json(
        { error: await res.text() },
        { status: res.status },
      );
    return NextResponse.json(await res.json());
  } catch (err) {
    console.error("[paper/result]", err);
    return NextResponse.json({ error: "Backend unreachable" }, { status: 502 });
  }
}
