import { NextRequest, NextResponse } from "next/server";

export async function POST(
    request: NextRequest,
    { params }: { params: { step: string } }
) {
    try {

        const token = request.cookies.get("session_id")?.value
        const step = (await params).step
        const req = await request.json()
        console.log("req ->", JSON.stringify(req))
        const response = await fetch(`http://localhost:3001/api/strategies/draft/${step}`, {
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