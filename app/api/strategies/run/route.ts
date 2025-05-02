import { BacktestResponse } from "@/lib/api/backtest/types";
import { NextRequest, NextResponse } from "next/server";

const BACKENT_SERVER_API = process.env.BACKENT_SERVER_API

// API route handler for POST requests (run new backtest)
export async function POST(request: NextRequest) {
    try {
        // Parse request body
        const body = await request.json()
        const { subType: _removed, ...cleanParams } = body.params
        const enginePayload = {
            strategyId: body.strategyId,
            type: body.type,
            subType: body.subType,
            initialCapital: body.initialCapital,
            params: cleanParams,
            timeframe: body.timeframe,
        }

        const token = request.cookies.get("session_id")?.value
        const response = await fetch(`${BACKENT_SERVER_API}/api/strategies/run`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Cookie: `session_id=${token}` },
            body: JSON.stringify(enginePayload),
        });
        if (response.status === 401) {
            return new Response("Unauthorized", { status: 401 })
        }
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        const data = await response.json();

        const result: BacktestResponse = {
            success: true,
            version: data.version,
            date: data.date,
            strategyId: body.strategyId,
            timeframe: body.timeframe,
            data: data,
        }


        console.log("Strategy backtest result:", JSON.stringify(result))


        return NextResponse.json(result)
    } catch (error) {
        console.error("Error processing backtest request:", error)
        return NextResponse.json({ success: false, error: "Failed to process backtest request" }, { status: 500 })
    }
}