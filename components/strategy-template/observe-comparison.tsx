// components/backtest/ResultsPanel.tsx

"use client";
import { useEffect } from "react"
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ComposedChart,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import {
    BacktestData,
    BacktestTrade,
} from "@/lib/api/backtest/types"
import { BacktestTooltip, TradeTooltip } from "../backtest/backtest-components"
import { Button } from "../ui/button"
import { BarChart3 } from "lucide-react"
import { useRouter } from "next/navigation";
import BasicTabContent from "./comparison/basic-tab-content";
import AdvancedTabContent from "./comparison/advanced-tab-content";
// Utility function to format numbers
function formatNumber(value: number, decimals: number): string {
    return value.toFixed(decimals)
}

// Sample data for testing charts
const sampleMonthlyReturns = [
    { month: "Jan", strategyReturn: 2.4, marketReturn: 1.2 },
    { month: "Feb", strategyReturn: -1.3, marketReturn: -2.1 },
    { month: "Mar", strategyReturn: 3.7, marketReturn: 2.5 },
    { month: "Apr", strategyReturn: 1.8, marketReturn: 0.9 },
    { month: "May", strategyReturn: -0.5, marketReturn: -1.2 },
    { month: "Jun", strategyReturn: 4.2, marketReturn: 3.0 },
];

const sampleDistribution = [
    { bin: "-5", count: 3 },
    { bin: "-4", count: 5 },
    { bin: "-3", count: 8 },
    { bin: "-2", count: 12 },
    { bin: "-1", count: 18 },
    { bin: "0", count: 25 },
    { bin: "1", count: 20 },
    { bin: "2", count: 15 },
    { bin: "3", count: 9 },
    { bin: "4", count: 6 },
    { bin: "5", count: 2 },
];

interface ResultsPanelProps {
    data: BacktestData | null
    isLoading: boolean
    templateId: string
    version: string
    onShare?: () => void
    onExport?: () => void
}

// Prepare trade data for visualization
const prepareTradeData = (trades: BacktestTrade[]) => {
    return trades.map((trade, index) => ({
        id: index + 1,
        profit: trade.profit,
        type: trade.type,
        result: trade.result,
    }))
}

export default function StrategyObserveComparisonPanel({ selected, runs, lineData, monthlyData, scatter, pareto, drawdownData, radarData, winLossData, metricsTableData, bestValues, palette, runsToParameters, strategyKey }) {

    return (
        <Card className="col-span-1 md:col-span-2">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Backtest Comparison</CardTitle>
                        <CardDescription>
                            History Backtest Comparison
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">


                <Tabs defaultValue="basic" >
                    <TabsList className="grid w-[200px] grid-cols-2">
                        <TabsTrigger value="basic">Basic</TabsTrigger>
                        <TabsTrigger value="advanced">Advanced</TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic">
                        <BasicTabContent
                            selected={selected}
                            runs={runs}
                            lineData={lineData}
                            monthlyData={monthlyData}
                            scatter={scatter}
                            pareto={pareto}
                            palette={palette}
                            metricsTableData={metricsTableData}
                            bestValues={bestValues}
                            runsToParameters={runsToParameters}
                            strategyKey={strategyKey}
                        />
                    </TabsContent>

                    <TabsContent value="advanced">
                        <AdvancedTabContent
                            selected={selected}
                            runs={runs}
                            drawdownData={drawdownData}
                            radarData={radarData}
                            winLossData={winLossData}
                            metricsTableData={metricsTableData}
                            bestValues={bestValues}
                            palette={palette}
                            formatMetric={m => m}
                            scatter={scatter}
                            pareto={pareto}
                        />
                    </TabsContent>
                </Tabs>


            </CardContent>
        </Card >
    )
}