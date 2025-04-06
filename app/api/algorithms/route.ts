import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const urlS = `http://127.0.0.1:3001/api/algorithms`
        const results = await fetch(urlS)
        const algorithmOptions = await results.json();
        return NextResponse.json(algorithmOptions)
    } catch (error) {
        console.error("Error fetching algorithms:", error)
        return NextResponse.json(
            { success: false, error: "Failed to fetch algorithms", algorithms: [] },
            { status: 500 },
        )
    }
}