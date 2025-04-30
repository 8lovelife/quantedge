import { notFound } from "next/navigation"
import StrategyDetails from "@/components/strategy-dashboard/strategy-details"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SiteHeader } from "@/components/layout/site-header"

// Update the getStrategyById function to return proper data
function getStrategyById(id: number) {
    // In a real app, this would fetch from an API or database
    // Check if the ID is valid
    if (isNaN(id) || id < 1 || id > 4) {
        return { exists: false }
    }

    return {
        id: id,
        exists: true,
    }
}

export default function StrategyDetailsPage({ params }: { params: { id: string } }) {
    const strategyId = Number.parseInt(params.id)
    // Check if strategy exists
    // const strategy = getStrategyById(strategyId)

    // if (!strategy.exists) {
    //     notFound()
    // }

    return (
        <SidebarProvider>
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader />
                <StrategyDetails id={strategyId} />
            </SidebarInset>
        </SidebarProvider >
    )
}
