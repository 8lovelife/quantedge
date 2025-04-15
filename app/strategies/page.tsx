import type { Metadata } from "next"
import StrategyDashboard from "@/components/strategy-dashboard/strategy-dashboard"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { SiteHeader } from "@/components/layout/site-header"
import { AppSidebar } from "@/components/layout/app-sidebar"

export const metadata: Metadata = {
    title: "Strategy Management | Crypto Quant Trading",
    description: "Manage your trading strategies at various stages of development",
}

export default function StrategiesPage() {
    return (
        <SidebarProvider>
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader />
                <StrategyDashboard />
            </SidebarInset>
        </SidebarProvider>
    )
}
