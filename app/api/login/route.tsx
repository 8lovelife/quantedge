import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

const BACKENT_SERVER_API = process.env.BACKENT_SERVER_API

export type User = {
    id: string
    email: string
    name: string
}

// POST handler for login requests
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, password } = body
        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
        }
        if (!email.includes("@")) {
            return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
        }

        const result = await fetch(`${BACKENT_SERVER_API}/api/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        })

        if (!result.ok) {
            return NextResponse.redirect(new URL("/login?error=Login failed", request.url));
        }

        const userInfoData = await result.json();
        const sessionToken = userInfoData.token; // session ID

        const response = NextResponse.json({ success: true, user: { userInfoData } })
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax" as const,
            maxAge: 7 * 24 * 60 * 60,
            path: "/",
        }
        response.cookies.set("session_id", sessionToken, cookieOptions)
        return response
    } catch (error) {
        console.error("Login error:", error)
        return NextResponse.json({ error: "Authentication failed. Please try again." }, { status: 500 })
    }
}

// GET handler to check if user is authenticated
export async function GET(request: NextRequest) {

    try {

        const cookieStore = cookies();
        const session_id = (await cookieStore).get("session_id")?.value;
        const token = request.cookies.get("session_id")?.value
        if (!token) {
            return NextResponse.json({ authenticated: false }, { status: 401 })
        }
        const response = await fetch(`${BACKENT_SERVER_API}/api/login`, {
            method: "GET",

            headers: {
                "Content-Type": "application/json",
                ...(session_id ? { Cookie: `session_id=${session_id}` } : {}),
            },

        })

        if (response.status === 401) {
            const res = NextResponse.json({ authenticated: false }, { status: 401 });
            res.cookies.set("session_id", "", {
                path: "/",
                expires: new Date(0),
            });
            return res;
        }

        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        const data = await response.json();
        return NextResponse.json({
            authenticated: true,
            user: data
        })
    } catch (error) {
        console.error("Error get current user:", error)
        return NextResponse.json({ success: false, error: " get current user" }, { status: 500 })
    }


}
