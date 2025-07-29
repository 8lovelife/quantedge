import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname

    // Define public paths that don't require authentication
    const isPublicPath = path === "/login" || path === "/register"
        || path === "/forgot-password" || path === "/"
        || path === "/markets" || path.startsWith("/trade/")

    // Skip middleware for API routes
    if (path.startsWith("/api/")) {
        return NextResponse.next()
    }

    // Get the token from the cookies
    const token = request.cookies.get("session_id")?.value || ""
    // Redirect logic
    if (!isPublicPath && !token) {
        // Redirect to login if trying to access a protected route without a token
        return NextResponse.redirect(new URL("/login", request.url))
    }

    if (isPublicPath && token) {
        // Redirect to dashboard if trying to access login/register with a valid token
        return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        // "/((?!_next/static|_next/image|favicon.ico).*)",

        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|gif|ico)).*)",

    ],
}
