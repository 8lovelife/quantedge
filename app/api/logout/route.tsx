import { NextRequest, NextResponse } from "next/server"

const BACKENT_SERVER_API = process.env.BACKENT_SERVER_API

export async function DELETE(request: NextRequest) {

    try {
        const token = request.cookies.get("session_id")?.value
        if (!token) {
            return NextResponse.json({ authenticated: false }, { status: 401 })
        }
        const res = await fetch(`${BACKENT_SERVER_API}/api/logout`, {
            method: "DELETE",

            headers: {
                "Content-Type": "application/json",
                ...(token ? { Cookie: `session_id=${token}` } : {}),
            },

        });
        if (!res.ok) throw new Error(`API Error: ${res.status}`);
        const response = NextResponse.json({ success: true })
        response.cookies.delete("session_id")
        return response
    } catch (error) {
        console.error("Error revoke current user:", error)
        return NextResponse.json({ success: false, error: " revoke current user" }, { status: 500 })
    }


}
