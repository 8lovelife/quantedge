import { BacktestResponse } from "@/lib/api/backtest/types"
import { error } from "console"
import { NextResponse } from "next/server"

const BACKENT_SERVER_API = process.env.BACKENT_SERVER_API

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const apiUrl = `${BACKENT_SERVER_API}/api/lab/run/backtest?${searchParams.toString()}`
        const response = await fetch(apiUrl)
        if (response.status === 404) {
            return NextResponse.json({
                success: true,
                data: null,
                error: "Backtest not found",
            })
        }
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`)
        }

        const data = await response.json()
        const result: BacktestResponse = {
            success: true,
            version: data.version,
            date: data.date,
            strategyId: "1",
            timeframe: "1h",
            data: data,
        }
        return NextResponse.json(result)
    } catch (error) {
        console.error("Error fetching strategies:", error)
        return NextResponse.json({ success: false, error: "Failed to fetch strategies" }, { status: 500 })
    }
}