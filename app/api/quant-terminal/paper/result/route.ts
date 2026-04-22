// 📁 app/api/quant-terminal/paper/result/route.ts
// BFF: 获取模拟交易完整结果
//
// GET /api/quant-terminal/paper/result?strategyId=
//
// 返回 PaperResultResponse：完整净值曲线、信号、指标、成交记录
// 若会话未完成，后端应返回 202；BFF 原样透传

import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:8000";

export async function GET(request: NextRequest) {
  try {
    const qs = request.nextUrl.searchParams.toString();
    const res = await fetch(`${BACKEND}/paper/result?${qs}`, {
      headers: request.headers.get("Authorization")
        ? { Authorization: request.headers.get("Authorization")! }
        : {},
    });
    // 202 = 会话未完成，原样返回让前端处理
    if (res.status === 202) {
      return NextResponse.json(
        { error: "Session not complete" },
        { status: 202 },
      );
    }
    if (!res.ok)
      return NextResponse.json(
        { error: await res.text() },
        { status: res.status },
      );
    return NextResponse.json(await res.json());
  } catch (err) {
    console.error("[quant-terminal/paper/result]", err);
    return NextResponse.json({ error: "Backend unreachable" }, { status: 502 });
  }
}
