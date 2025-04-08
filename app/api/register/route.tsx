import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { name, email, password } = body

        // Validate required fields
        if (!name || !email || !password) {
            return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 })
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

        // In a real app, you would:
        // 1. Check if the email is already registered
        // 2. Hash the password
        // 3. Store the user in your database
        // 4. Send a verification email

        // This is a placeholder implementation
        // Simulate checking if email exists
        if (email === "existing@example.com") {
            return NextResponse.json({ error: "Email already registered" }, { status: 409 })
        }

        // Simulate successful registration
        return NextResponse.json({
            success: true,
            message: "Registration successful",
            user: {
                id: crypto.randomUUID(),
                name,
                email,
            },
        })
    } catch (error) {
        console.error("Registration error:", error)
        return NextResponse.json({ error: "Registration failed" }, { status: 500 })
    }
}
