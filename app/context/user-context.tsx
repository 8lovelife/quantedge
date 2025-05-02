import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { getCurrentUserInfo, UserInfo } from "@/lib/api/auth";

interface UserContextType {
    user: UserInfo | null;
    setUserData: (userInfo: UserInfo) => void;
    isLoadingUser: boolean;
}

const UserContext = createContext<UserContextType>({
    user: null,
    setUserData: () => { },
    isLoadingUser: true,
});

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserInfo | null>(null);
    const [isLoadingUser, setIsLoadingUser] = useState(true);

    useEffect(() => {
        async function loadUser() {
            try {
                const userInfo = await getCurrentUserInfo();
                if (userInfo) {
                    userInfo.menus.sort((a, b) => a.order - b.order)
                    setUser(userInfo);
                }
            } catch (error) {
                console.error("Failed to fetch user:", error);
            } finally {
                setIsLoadingUser(false);
            }
        }
        loadUser();
    }, []);

    const value = useMemo(() => ({
        user,
        setUserData: (userInfo: UserInfo) => setUser(userInfo),
        isLoadingUser,
    }), [user, isLoadingUser]);

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    return useContext(UserContext);
}