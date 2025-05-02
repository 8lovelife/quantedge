import { AuthUserInfo } from "@/lib/api/auth";
import { NextRequest, NextResponse } from "next/server";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;

const BACKENT_SERVER_API = process.env.BACKENT_SERVER_API


export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ provider: string }> }
) {
    try {
        const { searchParams } = new URL(req.url);
        const code = searchParams.get("code");
        const provider = (await params).provider

        if (!code) {
            return NextResponse.redirect(new URL("/login?error=MissingCode", req.url));
        }
        const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                code,
                client_id: GOOGLE_CLIENT_ID,
                client_secret: GOOGLE_CLIENT_SECRET,
                redirect_uri: GOOGLE_REDIRECT_URI,
                grant_type: "authorization_code",
            }),
        });


        if (!tokenRes.ok) {
            return NextResponse.redirect(new URL("/login?error=TokenExchangeFailed", req.url));
        }

        const tokenData = await tokenRes.json();
        const accessToken = tokenData.access_token;
        const idToken = tokenData.id_token;

        const userRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        if (!userRes.ok) {
            return NextResponse.redirect(new URL("/login?error=UserInfoFetchFailed", req.url));
        }

        const userInfo = await userRes.json();
        const authUserInfo: AuthUserInfo = {
            providerUid: userInfo.sub,
            provider: provider,
            name: userInfo.name,
            picture: userInfo.picture,
            email: userInfo.email,
            accessToken: accessToken,
            expiresIn: tokenData.expires_in,
            refreshToken: tokenData.refresh_token,
        };

        const result = await fetch(`${BACKENT_SERVER_API}/api/user/auth`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(authUserInfo),
        })

        const userInfoData = await result.json();
        const sessionToken = userInfoData.token; // session ID

        const response = NextResponse.redirect(new URL("/dashboard", req.url));
        response.cookies.set("session_id", sessionToken, {
            httpOnly: true,
            path: "/",
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7,
        });

        return response;

    } catch (error) {
        console.error("Google Callback Error:", error);
        return NextResponse.redirect(new URL("/login?error=CallbackException", req.url));
    }
}