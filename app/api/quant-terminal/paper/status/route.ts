// 📁 app/api/quant-terminal/paper/status/route.ts
// BFF: 查询模拟交易会话运行状态
//
// GET /api/quant-terminal/paper/status?strategyId=
//
// 返回 PaperStatusResponse：状态、进度百分比、剩余时间等

import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:8000";

export async function GET(request: NextRequest) {
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
    console.error("[quant-terminal/paper/status]", err);
    return NextResponse.json({ error: "Backend unreachable" }, { status: 502 });
  }
}
