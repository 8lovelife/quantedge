import { NextResponse } from "next/server"

const BACKENT_SERVER_API = process.env.BACKENT_SERVER_API

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const apiUrl = `${BACKENT_SERVER_API}/api/lab/run/comparison?${searchParams.toString()}`
        const response = await fetch(apiUrl)
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`)
        }
        const result = await response.json()
        return NextResponse.json(result)
    } catch (error) {
        console.error("Error fetching strategies:", error)
        return NextResponse.json({ success: false, error: "Failed to fetch strategies" }, { status: 500 })
    }
}