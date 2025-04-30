import { AppSidebar } from "@/components/layout/app-sidebar";
import { SiteHeader } from "@/components/layout/site-header";
import StrategyBuilder from "@/components/strategy-builder/strategy-builder";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function EditStrategyPage({ params }: { params: { id: string } }) {
    return (
        <StrategyBuilder mode="edit" strategyId={parseInt(params.id)} />
    )
}