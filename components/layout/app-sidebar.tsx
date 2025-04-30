"use client"

import type * as React from "react"
import {
    BarChartIcon,
    CameraIcon,
    CandlestickChartIcon,
    ClipboardListIcon,
    DatabaseIcon,
    FileCodeIcon,
    FileIcon,
    FileTextIcon,
    FolderIcon,
    HelpCircleIcon,
    LayoutDashboardIcon,
    ListIcon,
    SearchIcon,
    SettingsIcon,
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { NavMain } from "./nav-main"
import { NavDocuments } from "./nav-documents"
import { NavSecondary } from "./nav-secondary"
import { NavUser } from "./nav-user"
import { useEffect } from "react"
import { useUser } from "@/app/context/user-context"
import { useRouter } from "next/navigation"
import { Skeleton } from "../ui/skeleton"

const data = {
    user: {
        name: "shadcn",
        email: "m@example.com",
        avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
        {
            title: "Dashboard",
            url: "/dashboard", // Changed from "/Dashboard" to "/dashboard"
            icon: LayoutDashboardIcon,
        },
        {
            title: "Strategy",
            url: "/strategies",
            icon: ListIcon,
        },
        // {
        //     title: "Backtesting",
        //     url: "/backtest",
        //     icon: BarChartIcon,
        // },
        {
            title: "Lab",
            url: "/lab",
            icon: FolderIcon
        },
        // {
        //     title: "Market Overview",
        //     url: "/dashboard",
        //     icon: FolderIcon,
        // },
        {
            title: "Exchange",
            url: "/exchanges",
            icon: DatabaseIcon,
        },
    ],
    navClouds: [
        {
            title: "Capture",
            icon: CameraIcon,
            isActive: true,
            url: "#",
            items: [
                {
                    title: "Active Proposals",
                    url: "#",
                },
                {
                    title: "Archived",
                    url: "#",
                },
            ],
        },
        {
            title: "Proposal",
            icon: FileTextIcon,
            url: "#",
            items: [
                {
                    title: "Active Proposals",
                    url: "#",
                },
                {
                    title: "Archived",
                    url: "#",
                },
            ],
        },
        {
            title: "Prompts",
            icon: FileCodeIcon,
            url: "#",
            items: [
                {
                    title: "Active Proposals",
                    url: "#",
                },
                {
                    title: "Archived",
                    url: "#",
                },
            ],
        },
    ],
    navSecondary: [
        // {
        //     title: "Settings",
        //     url: "#",
        //     icon: SettingsIcon,
        // },
        // {
        //     title: "Get Help",
        //     url: "#",
        //     icon: HelpCircleIcon,
        // },
        // {
        //     title: "Search",
        //     url: "#",
        //     icon: SearchIcon,
        // },
    ],
    documents: [
        // {
        //     name: "Data Library",
        //     url: "#",
        //     icon: DatabaseIcon,
        // },
        // {
        //     name: "Reports",
        //     url: "#",
        //     icon: ClipboardListIcon,
        // },
        // {
        //     name: "Word Assistant",
        //     url: "#",
        //     icon: FileIcon,
        // },
    ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { user, isLoadingUser } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!isLoadingUser && !user) {
            router.push("/login");
        }
    }, [isLoadingUser, user, router]);

    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <a href="#">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                    <CandlestickChartIcon className="h-6 w-6 text-primary" />
                                </div>
                                <div className="flex flex-col gap-0.5 leading-none">
                                    <span className="font-semibold">QuantEdge</span>
                                </div>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {isLoadingUser ? (
                    <div className="p-4 space-y-4">
                        <Skeleton className="h-6 w-2/3" />
                        <Skeleton className="h-6 w-2/3" />
                        <Skeleton className="h-8 w-full" />
                    </div>
                ) : (
                    <NavMain items={data.navMain} />
                )}
                <NavSecondary items={data.navSecondary} className="mt-auto" />
            </SidebarContent>

            <SidebarFooter>
                {user ? (
                    <NavUser user={{
                        name: user.name,
                        email: user.email,
                        avatar: user.avatarUrl,
                    }} />
                ) : (
                    <div className="p-4 space-y-2">
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-1/3" />
                    </div>
                )}
            </SidebarFooter>
        </Sidebar>
    );
}
