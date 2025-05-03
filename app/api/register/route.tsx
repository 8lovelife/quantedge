import { type NextRequest, NextResponse } from "next/server"

const BACKENT_SERVER_API = process.env.BACKENT_SERVER_API

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, password } = body

        // Validate required fields
        if (!email || !password) {
            return NextResponse.json({ error: "Email, and password are required" }, { status: 400 })
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
        }

        // Validate password strength
        if (password.length < 8) {
            return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 })
        }

        const result = await fetch(`${BACKENT_SERVER_API}/api/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        })

        const registerResponse = await result.json();
        if (registerResponse.userExist) {
            return NextResponse.json(
                { error: "Registration failed: user with this email already exists." },
                { status: 400 }
            );
        }

        const userInfoData = registerResponse.userInfo;
        const sessionToken = userInfoData.token; // session ID

        const response = NextResponse.json({
            success: true,
            message: "Registration successful",
            user: userInfoData
        })
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
        console.error("Registration error:", error)
        return NextResponse.json({ error: "Registration failed" }, { status: 500 })
    }
}
