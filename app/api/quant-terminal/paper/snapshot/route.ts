// 📁 app/api/quant-terminal/paper/snapshot/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  getOrCreateSession,
  buildPaperSnapshot,
  getMockPaperSnapshot,
} from "@/lib/api/quant-terminal/paper/mock";

const BACKEND = process.env.BACKEND_URL;

export async function GET(request: NextRequest) {
  const strategyId =
    request.nextUrl.searchParams.get("strategyId") ?? "unknown";
  const planDays = parseInt(
    request.nextUrl.searchParams.get("planDays") ?? "14",
  );
  const cached = request.nextUrl.searchParams.get("cached") === "true";

  if (!BACKEND) {
    // cached=true → 查 snapshot 缓存（found:true/false）
    // cached=false → 返回当前会话快照（legacy PaperSnapshot）
    if (cached) return NextResponse.json(getMockPaperSnapshot(strategyId));
    const state = getOrCreateSession(strategyId, planDays);
    return NextResponse.json(buildPaperSnapshot(state));
  }
  try {
    const qs = request.nextUrl.searchParams.toString();
    const res = await fetch(`${BACKEND}/paper/snapshot?${qs}`, {
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
    console.error("[paper/snapshot]", err);
    return NextResponse.json({ found: false });
  }
}
