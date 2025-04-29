// This is a placeholder for your authentication logic
// In a real application, you would implement proper authentication

export type User = {
    id: string
    email: string
    name: string
}


export type AuthUserInfo = {
    providerUid: string,
    provider: string,
    name: string,
    picture: string,
    email: string,
    accessToken: String,
    expiresIn: number,
    refreshToken: String,
}


export interface UserInfo {
    id: number;
    name: string;
    email: string;
    avatar_url?: string;
    token?: string;
    menus: MenuItem[];
}

export interface MenuItem {
    title: string;
    url: string;
    icon?: string;
}

export async function getCurrentUserInfo(): Promise<UserInfo | null> {

    try {
        const res = await fetch("/api/login", { method: "GET", credentials: "include" });
        if (!res.ok) {
            return null;
        }
        const userInfo = (await res.json()).user;
        return userInfo;
    } catch (error) {
        console.error("Failed to fetch user info:", error);
        return null;
    }
}

export async function login(email: string, password: string): Promise<User> {
    // In a real app, you would verify credentials against your database
    // and create a session token

    // This is just a placeholder implementation
    if (email && password) {
        // Set a cookie in a real implementation
        // cookies().set("session", "token-value", { httpOnly: true, secure: true })

        return {
            id: "user-1",
            email,
            name: "Crypto Trader",
        }
    }

    throw new Error("Invalid credentials")
}

export async function logout() {
    const res = await fetch("/api/logout", {
        method: "DELETE"
    });
    const data = await res.json();
    window.location.href = "/dashboard"
}


export async function handleGoogleLogin() {
    const res = await fetch("/api/auth/google/login");
    const data = await res.json();
    if (data.auth_url) {
        window.location.href = data.auth_url;
    }
}
