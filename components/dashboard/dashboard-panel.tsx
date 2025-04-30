"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
    ArrowDownIcon,
    ArrowUpIcon,
    BarChart3Icon,
    CandlestickChartIcon,
    CoinsIcon,
    LineChartIcon,
    RefreshCwIcon,
    Settings2Icon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MarketOverview } from "@/components/market-overview"
import { PortfolioPerformance } from "@/components/portfolio-performance"
import { TradingStrategies } from "@/components/trading-strategies"
import { RecentTrades } from "@/components/recent-trades"
import { fetchDashboardData } from "@/lib/api/dashboard"
import type { DashboardData } from "@/lib/types"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SiteHeader } from "@/components/layout/site-header"
import { getCurrentUserInfo } from "@/lib/api/auth"

export default function DashboardPanel() {
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                setIsLoading(true)
                const data = await fetchDashboardData()
                setDashboardData(data)
                setError(null)
            } catch (err) {
                console.error("Failed to fetch dashboard data:", err)
                setError("Failed to load dashboard data. Please try again later.")
            } finally {
                setIsLoading(false)
            }
        }

        loadDashboardData()
    }, [])

    const handleRefresh = async () => {
        try {
            setIsLoading(true)
            const data = await fetchDashboardData()
            setDashboardData(data)
            setError(null)
        } catch (err) {
            console.error("Failed to refresh dashboard data:", err)
            setError("Failed to refresh data. Please try again later.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        // <UserProvider>
        //     <SidebarProvider>
        //         <AppSidebar variant="inset" />
        //         <SidebarInset>
        //             <SiteHeader />
        <div className="flex min-h-screen flex-col bg-background">

            <main className="flex-1 space-y-4 p-4 md:p-6">

                {error && <div className="rounded-md bg-destructive/15 p-3 text-destructive">{error}</div>}

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
                            <LineChartIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {isLoading ? (
                                    <div className="h-7 w-32 animate-pulse rounded bg-muted"></div>
                                ) : (
                                    `$${dashboardData?.portfolioValue.toLocaleString() || "0.00"}`
                                )}
                            </div>
                            <div className="flex items-center text-sm">
                                {isLoading ? (
                                    <div className="h-4 w-24 animate-pulse rounded bg-muted"></div>
                                ) : dashboardData?.portfolioChange ? (
                                    <>
                                        {dashboardData.portfolioChange >= 0 ? (
                                            <ArrowUpIcon className="mr-1 h-4 w-4 text-green-500" />
                                        ) : (
                                            <ArrowDownIcon className="mr-1 h-4 w-4 text-red-500" />
                                        )}
                                        <span className={dashboardData.portfolioChange >= 0 ? "text-green-500" : "text-red-500"}>
                                            {dashboardData.portfolioChange >= 0 ? "+" : ""}
                                            {dashboardData.portfolioChange}%
                                        </span>
                                        <span className="text-muted-foreground ml-1">from last week</span>
                                    </>
                                ) : null}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Strategies</CardTitle>
                            <BarChart3Icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {isLoading ? (
                                    <div className="h-7 w-16 animate-pulse rounded bg-muted"></div>
                                ) : (
                                    dashboardData?.activeStrategies || 0
                                )}
                            </div>
                            <div className="flex items-center text-sm">
                                {isLoading ? (
                                    <div className="h-4 w-24 animate-pulse rounded bg-muted"></div>
                                ) : dashboardData?.strategiesChange ? (
                                    <>
                                        {dashboardData.strategiesChange >= 0 ? (
                                            <ArrowUpIcon className="mr-1 h-4 w-4 text-green-500" />
                                        ) : (
                                            <ArrowDownIcon className="mr-1 h-4 w-4 text-red-500" />
                                        )}
                                        <span className={dashboardData.strategiesChange >= 0 ? "text-green-500" : "text-red-500"}>
                                            {dashboardData.strategiesChange >= 0 ? "+" : ""}
                                            {dashboardData.strategiesChange}
                                        </span>
                                        <span className="text-muted-foreground ml-1">from last month</span>
                                    </>
                                ) : null}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Monthly Profit</CardTitle>
                            <LineChartIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {isLoading ? (
                                    <div className="h-7 w-32 animate-pulse rounded bg-muted"></div>
                                ) : (
                                    `$${dashboardData?.monthlyProfit.toLocaleString() || "0.00"}`
                                )}
                            </div>
                            <div className="flex items-center text-sm">
                                {isLoading ? (
                                    <div className="h-4 w-24 animate-pulse rounded bg-muted"></div>
                                ) : dashboardData?.profitChange ? (
                                    <>
                                        {dashboardData.profitChange >= 0 ? (
                                            <ArrowUpIcon className="mr-1 h-4 w-4 text-green-500" />
                                        ) : (
                                            <ArrowDownIcon className="mr-1 h-4 w-4 text-red-500" />
                                        )}
                                        <span className={dashboardData.profitChange >= 0 ? "text-green-500" : "text-red-500"}>
                                            {dashboardData.profitChange >= 0 ? "+" : ""}
                                            {dashboardData.profitChange}%
                                        </span>
                                        <span className="text-muted-foreground ml-1">from last month</span>
                                    </>
                                ) : null}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
                            <BarChart3Icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {isLoading ? (
                                    <div className="h-7 w-24 animate-pulse rounded bg-muted"></div>
                                ) : (
                                    `${dashboardData?.winRate || 0}%`
                                )}
                            </div>
                            <div className="flex items-center text-sm">
                                {isLoading ? (
                                    <div className="h-4 w-24 animate-pulse rounded bg-muted"></div>
                                ) : dashboardData?.winRateChange ? (
                                    <>
                                        {dashboardData.winRateChange >= 0 ? (
                                            <ArrowUpIcon className="mr-1 h-4 w-4 text-green-500" />
                                        ) : (
                                            <ArrowDownIcon className="mr-1 h-4 w-4 text-red-500" />
                                        )}
                                        <span className={dashboardData.winRateChange >= 0 ? "text-green-500" : "text-red-500"}>
                                            {dashboardData.winRateChange >= 0 ? "+" : ""}
                                            {dashboardData.winRateChange}%
                                        </span>
                                        <span className="text-muted-foreground ml-1">from last month</span>
                                    </>
                                ) : null}
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="overview">Market Overview</TabsTrigger>
                        <TabsTrigger value="performance">Portfolio Performance</TabsTrigger>
                        <TabsTrigger value="strategies">Trading Strategies</TabsTrigger>
                        <TabsTrigger value="trades">Recent Trades</TabsTrigger>
                    </TabsList>
                    <TabsContent value="overview" className="space-y-4">
                        <MarketOverview />
                    </TabsContent>
                    <TabsContent value="performance" className="space-y-4">
                        <PortfolioPerformance />
                    </TabsContent>
                    <TabsContent value="strategies" className="space-y-4">
                        <TradingStrategies />
                    </TabsContent>
                    <TabsContent value="trades" className="space-y-4">
                        <RecentTrades />
                    </TabsContent>
                </Tabs>
            </main>
        </div>
        /* </SidebarInset>
    </SidebarProvider>
</UserProvider> */

    )
}