import { NextResponse } from "next/server";

export async function POST(
    request: Request,
    { params }: { params: { step: string } }
) {
    try {
        const step = params.step
        const req = await request.json()
        console.log("req ->", JSON.stringify(req))
        const response = await fetch(`http://localhost:3001/api/strategies/draft/${step}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(req),
        })

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