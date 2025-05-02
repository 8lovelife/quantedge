import { NextResponse } from "next/server";

const BACKENT_SERVER_API = process.env.BACKENT_SERVER_API

export async function GET(request: Request) {
    try {
        const urlS = `${BACKENT_SERVER_API}/api/algorithms`
        const results = await fetch(urlS)
        const algorithmOptions = await results.json();
        console.log('algorithmOptions->' + JSON.stringify(algorithmOptions))
        return NextResponse.json(algorithmOptions)
    } catch (error) {
        console.error("Error fetching algorithms:", error)
        return NextResponse.json(
            { success: false, error: "Failed to fetch algorithms", algorithms: [] },
            { status: 500 },
        )
    }
}