import { BacktestResponse } from "@/lib/api/backtest/types";
import { NextResponse } from "next/server";


const BACKENT_SERVER_API = process.env.BACKENT_SERVER_API

// API route handler for POST requests (run new backtest)
export async function POST(request: Request) {
    try {
        // Parse request body
        const body = await request.json()
        const { subType: _removed, ...cleanParams } = body.params
        const enginePayload = {
            templateId: body.templateId,
            type: body.type,
            subType: body.subType,
            initialCapital: body.initialCapital,
            params: cleanParams,
            pairs: body.pairs,
            timeframe: body.timeframe,
            positionType: body.positionType,
        }

        console.log("Engine payload:", JSON.stringify(enginePayload))
        const response = await fetch(`${BACKENT_SERVER_API}/api/lab/run`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(enginePayload),
        });
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        const data = await response.json();

        const result: BacktestResponse = {
            success: true,
            version: data.version,
            date: data.date,
            strategyId: "1",
            timeframe: "1h",
            data: data,
        }


        console.log("Backtest result:", JSON.stringify(result))


        return NextResponse.json(result)
    } catch (error) {
        console.error("Error processing backtest request:", error)
        return NextResponse.json({ success: false, error: "Failed to process backtest request" }, { status: 500 })
    }
}