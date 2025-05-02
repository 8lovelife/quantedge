import { NextRequest, NextResponse } from "next/server";

const BACKENT_SERVER_API = process.env.BACKENT_SERVER_API

// PUT handler for updating a strategy
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const id = Number.parseInt((await params).id)
        const req: Number = await request.json()

        // const response = await mockUpdateStrategy(id, data)
        const token = request.cookies.get("session_id")?.value
        const response = await fetch(`${BACKENT_SERVER_API}/api/strategies/run/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json", Cookie: `session_id=${token}`
            },
            body: JSON.stringify(req),
        })

        if (response.status === 401) {
            return new Response("Unauthorized", { status: 401 })
        }

        if (!response.ok) throw new Error(`API Error: ${response.status}`);

        return NextResponse.json({
            success: true,
        })
    } catch (error) {
        console.error("Error updating strategy run:", error)
        return NextResponse.json({ success: false, error: "Failed to update strategy run" }, { status: 500 })
    }
}