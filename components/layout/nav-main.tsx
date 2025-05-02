"use client"

import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { MenuItem } from "@/lib/api/auth"
import { getIconComponent } from "@/lib/utils"

export function NavMain({
    items,
}: {
    items: MenuItem[]
}) {
    return (
        <SidebarGroup>
            <SidebarGroupContent className="flex flex-col gap-2">
                <SidebarMenu>
                    {items.map((item) => {
                        const Icon = getIconComponent(item.icon)
                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton asChild tooltip={item.title}>
                                    <Link href={item.url} className="flex items-center gap-2">
                                        {Icon && <Icon className="w-4 h-4" />}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )
                    })}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    )
}
