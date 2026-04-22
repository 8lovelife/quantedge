// 📁 app/api/quant-terminal/paper/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  getOrCreateSession,
  buildPaperStatus,
} from "@/lib/api/quant-terminal/paper/mock";

const BACKEND = process.env.BACKEND_URL;

export async function GET(request: NextRequest) {
  const strategyId =
    request.nextUrl.searchParams.get("strategyId") ?? "unknown";
  if (!BACKEND) {
    const state = getOrCreateSession(strategyId);
    return NextResponse.json(buildPaperStatus(state));
  }
  try {
    const qs = request.nextUrl.searchParams.toString();
    const res = await fetch(`${BACKEND}/paper/status?${qs}`, {
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
    console.error("[paper/status]", err);
    return NextResponse.json({ error: "Backend unreachable" }, { status: 502 });
  }
}
