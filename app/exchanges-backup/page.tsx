import { AppSidebar } from "@/components/layout/app-sidebar";
import { SiteHeader } from "@/components/layout/site-header";
import BacktestComparison from "@/components/backtest/strategy-backtest-comparison";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import LabStrategyComparison from "@/components/strategy-template/observe-results-comparison";
import ExchangeConnections from "@/components/exchanges/exchange-connections";
import DashboardPanel from "@/components/dashboard/dashboard-panel";

export default function ExchangeSettingPage() {
    return (
        <SidebarProvider>
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader />
                <DashboardPanel />
            </SidebarInset>
        </SidebarProvider>
    )
}