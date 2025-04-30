// app/(dashboard)/layout.tsx
"use client";

import { UserProvider } from "@/app/context/user-context"
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SiteHeader } from "@/components/layout/site-header";
import { SidebarProvider } from "@/components/ui/sidebar"
import { SidebarInset } from "@/components/ui/sidebar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <UserProvider>
            <SidebarProvider>
                <AppSidebar variant="inset" />
                <SidebarInset>
                    <SiteHeader />
                    <div className="flex flex-col min-h-screen bg-background">
                        <main className="flex-1 p-4 md:p-6">
                            {children}
                        </main>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </UserProvider>
    )
}