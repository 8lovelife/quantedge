"use client"

import type React from "react"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { UserProvider } from "@/app/context/user-context"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SiteHeader } from "@/components/layout/site-header"
import { ReactNode } from "react"

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <UserProvider>
            <SidebarProvider>
                <AppSidebar variant="inset" />
                <SidebarInset>
                    <SiteHeader />
                    {children}
                </SidebarInset>
            </SidebarProvider>
        </UserProvider>
    )
}