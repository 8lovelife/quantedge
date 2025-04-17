import BacktestPanel from "@/components/backtest/backtest-panel";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SiteHeader } from "@/components/layout/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function CreateStrategyPage() {
    return (
        <SidebarProvider>
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader />
                <BacktestPanel />
            </SidebarInset>
        </SidebarProvider>
    )
}