import { NextRequest, NextResponse } from "next/server";

const BACKENT_SERVER_API = process.env.BACKENT_SERVER_API

export async function POST(
    request: NextRequest,
    { params }: { params: { step: string } }
) {
    try {

        const token = request.cookies.get("session_id")?.value
        const step = (await params).step
        const req = await request.json()
        console.log("req ->", JSON.stringify(req))
        const response = await fetch(`${BACKENT_SERVER_API}/api/strategies/draft/${step}`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Cookie: `session_id=${token}` },
            body: JSON.stringify(req),
        })

        if (response.status === 401) {
            return new Response("Unauthorized", { status: 401 })
        }

        if (!response.ok) throw new Error(`API Error: ${response.status}`)
        const data = await response.json()

        return NextResponse.json({
            success: true,
            strategy: data,
        })
    } catch (error) {
        console.error("Error creating strategy:", error)
        return NextResponse.json(
            { success: false, error: "Failed to create strategy" },
            { status: 500 }
        )
    }
}