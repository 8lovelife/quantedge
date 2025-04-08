import { type NextRequest, NextResponse } from "next/server"

export type User = {
    id: string
    email: string
    name: string
}

// POST handler for login requests
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, password, rememberMe } = body

        // Basic validation - avoid complex regex that might cause issues
        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
        }

        // Simple email validation
        if (!email.includes("@")) {
            return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
        }

        // Simulate authentication check
        // Replace this with your actual authentication logic
        // For testing, accept any valid email/password combination
        const token = crypto.randomUUID()

        // Set cookie options
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax" as const,
            maxAge: rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60, // 30 days or 1 day
            path: "/",
        }

        // Create a response
        const response = NextResponse.json({
            success: true,
            user: {
                id: "user-1",
                email,
                name: "Crypto Trader",
            },
        })

        // Set the cookie on the response
        response.cookies.set("session", token, cookieOptions)

        return response
    } catch (error) {
        console.error("Login error:", error)
        return NextResponse.json({ error: "Authentication failed. Please try again." }, { status: 500 })
    }
}

// GET handler to check if user is authenticated
export async function GET(request: NextRequest) {
    const token = request.cookies.get("session")?.value

    if (!token) {
        return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    // In a real app, you would verify the token and fetch user data
    return NextResponse.json({
        authenticated: true,
        user: {
            id: "user-1",
            email: "trader@example.com",
            name: "Crypto Trader",
        },
    })
}

// DELETE handler for logout
export async function DELETE(request: NextRequest) {
    const response = NextResponse.json({ success: true })
    response.cookies.delete("session")
    return response
}
