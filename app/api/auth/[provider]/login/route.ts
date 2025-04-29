import { NextRequest, NextResponse } from "next/server";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;

export async function GET(req: NextRequest, { params }: { params: { provider: string } }) {
    const { provider } = await params;

    if (provider === "google") {
        const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");

        authUrl.searchParams.set("client_id", GOOGLE_CLIENT_ID);
        authUrl.searchParams.set("redirect_uri", GOOGLE_REDIRECT_URI);
        authUrl.searchParams.set("response_type", "code");
        authUrl.searchParams.set("scope", "openid email profile");
        authUrl.searchParams.set("access_type", "offline"); // 获取 refresh_token
        authUrl.searchParams.set("prompt", "consent"); // 每次都要求同意

        return NextResponse.json({ auth_url: authUrl.toString() });
    }

    return NextResponse.json({ error: "Unsupported provider" }, { status: 400 });
}