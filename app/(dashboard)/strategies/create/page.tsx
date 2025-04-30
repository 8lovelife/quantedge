import { AppSidebar } from "@/components/layout/app-sidebar"
import { SiteHeader } from "@/components/layout/site-header"
import StrategyBuilder from "@/components/strategy-builder/strategy-builder"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Create Strategy | Crypto Quant Trading",
    description: "Create a new trading strategy",
}

export default function CreateStrategyPage() {
    return (
        <StrategyBuilder mode="create" />
    )
}
