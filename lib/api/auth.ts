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
    avatarUrl?: string;
    token?: string;
    menus: MenuItem[];
    roles: Role[];
}

export interface Role {
    id: number,
    name: string,
    displayName: string,
    description: string,
}

export interface MenuItem {
    title: string;
    url: string;
    icon?: string;
    order?: number;
    children?: MenuItem[];
}

export async function getCurrentUserInfo(): Promise<UserInfo | null> {

    try {
        const res = await fetch("/api/login", { method: "GET", credentials: "include" });

        if (res.status === 401) {
            window.location.href = "/login"
            return null;
        }

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

export async function login(email: string, password: string): Promise<UserInfo | null> {
    try {
        const response = await fetch("/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
            credentials: "include",
        })

        const data = await response.json()
        if (!response.ok) {
            throw new Error(data.error || "Login failed")
        }

        return data.user;

    } catch (error) {
        console.error("Failed to fetch user info:", error);
        throw error
    }

}


export async function register(email: string, password: string): Promise<UserInfo | null> {
    try {
        const response = await fetch("/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        })

        const data = await response.json()
        if (!response.ok) {
            throw new Error(data.error || "Registration failed")
        }

        return data.user;

    } catch (error) {
        console.error("Failed to fetch user info:", error);
        throw error
    }

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
