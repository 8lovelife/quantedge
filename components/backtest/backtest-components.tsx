"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Settings2Icon } from "lucide-react"
import type { BacktestParameters, BacktestMetrics, BacktestRunHistoryItem } from "@/lib/api/backtest/index"

// Custom tooltip for backtest chart
export const BacktestTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-popover text-popover-foreground shadow-md rounded-md p-3 text-sm border border-border">
                <p className="font-medium mb-1">{`Date: ${label}`}</p>
                <p className="text-green-500">{`Strategy: $${payload[0].value.toLocaleString()}`}</p>
                {/* <p className="text-blue-500">{`Market: $${payload[1].value.toLocaleString()}`}</p> */}
                {payload[2]?.value > 0 && <p className="text-orange-500 mt-1">{`Trades: ${payload[2].value}`}</p>}
            </div>
        )
    }
    return null
}

// Custom tooltip for trade analysis
export const TradeTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-popover text-popover-foreground shadow-md rounded-md p-3 text-sm border border-border">
                <p className="font-medium mb-1">{`${label}`}</p>
                <p className={payload[0].value >= 0 ? "text-green-500" : "text-red-500"}>
                    {`Profit: ${payload[0].value >= 0 ? "+" : ""}$${payload[0].value.toLocaleString()}`}
                </p>
            </div>
        )
    }
    return null
}

// Metrics Cards Component
export function BacktestMetricsCards({ metrics }: { metrics: BacktestMetrics | undefined }) {
    if (!metrics) return null

    return (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-5 mb-6">
            <Card>
                <CardContent className="pt-6">
                    <div className="text-sm text-muted-foreground">Strategy Return</div>
                    <div
                        className={`text-2xl font-bold ${Number(metrics.strategyReturn * 100) >= 0 ? "text-green-500" : "text-red-500"}`}
                    >
                        {Number(metrics.strategyReturn * 100).toFixed(2)}%
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="pt-6">
                    <div className="text-sm text-muted-foreground">Alpha</div>
                    <div className={`text-2xl font-bold ${Number(metrics.alpha) >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {Number(metrics.alpha).toFixed(2)}%
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="pt-6">
                    <div className="text-sm text-muted-foreground">Max Drawdown</div>
                    <div className="text-2xl font-bold text-red-500">{Number(metrics.maxDrawdown * 100).toFixed(2)}%</div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="pt-6">
                    <div className="text-sm text-muted-foreground">Win Rate</div>
                    <div className="text-2xl font-bold">{Number(metrics.winRate * 100).toFixed(2)}%</div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="pt-6">
                    <div className="text-sm text-muted-foreground">Sharp Rate</div>
                    <div className="text-2xl font-bold">{Number(metrics.sharpeRatio).toFixed(2)}%</div>
                </CardContent>
            </Card>
        </div>
    )
}

// Run Details Component
export function BacktestRunDetails({
    selectedRunVersion,
    runHistory,
    params,
}: {
    selectedRunVersion: number
    runHistory: BacktestRunHistoryItem[]
    params: BacktestParameters | undefined
}) {

    // Format date for display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleString()
    }

    // Get the selected run from history
    const selectedRun = runHistory.find((r) => r.version === selectedRunVersion)


    console.log("selectedRUn is " + JSON.stringify(selectedRun))

    if (!params) return null

    return (
        <Card className="mb-6 bg-muted/30">
            <CardHeader>
                <CardTitle>Backtest Parameters</CardTitle>
                <CardDescription>Configuration used for Run #{selectedRunVersion}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-medium">Run #{selectedRunVersion}</h3>
                        <p className="text-sm text-muted-foreground">{formatDate(selectedRun?.date || "")}</p>
                        {/* {selectedRun?.startTime && selectedRun?.endTime && (
                            <p className="text-sm text-muted-foreground">
                                Duration: {calculateDuration(selectedRun.startTime, selectedRun.endTime)}
                            </p>
                        )} */}
                    </div>

                    {selectedRun?.result && (
                        <div className="flex flex-col">
                            <span className="text-sm font-medium">Results</span>
                            <div className="flex gap-2 mt-1">
                                <Badge variant={selectedRun.result === "success" ? "default" : "destructive"}>
                                    {selectedRun.result === "success" ? "success" : "failed"}
                                </Badge>
                                {/* {selectedRun.result.strategyReturn && (
                                    <Badge
                                        variant="outline"
                                        className={Number(selectedRun.result.strategyReturn) >= 0 ? "text-green-600" : "text-red-600"}
                                    >
                                        Return: {selectedRun.result.strategyReturn}%
                                    </Badge>
                                )}
                                {selectedRun.result.winRate && <Badge variant="outline">Win Rate: {selectedRun.result.winRate}%</Badge>} */}
                            </div>
                        </div>
                    )}

                    {selectedRun?.marketDetails && (
                        <div className="flex flex-col">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-1">
                                {Object.entries(selectedRun.marketDetails)
                                    .filter(([_, v]) =>
                                        v != null &&
                                        !(typeof v === 'string' && v.trim() === '') &&
                                        !(Array.isArray(v) && v.length === 0) &&
                                        !(typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0)
                                    )
                                    .map(([key, value]) => (
                                        <Badge key={key} variant="outline" className="text-xs">
                                            {key}: {value}
                                        </Badge>
                                    ))}
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col">
                        <span className="text-sm font-medium">Parameters</span>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-1">
                            {Object.entries(params)
                                .filter(([_, v]) =>
                                    v != null &&
                                    !(typeof v === 'string' && v.trim() === '') &&
                                    !(Array.isArray(v) && v.length === 0) &&
                                    !(typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0)
                                )
                                .map(([key, value]) => (
                                    <Badge key={key} variant="outline" className="text-xs">
                                        {key}: {value}
                                    </Badge>
                                ))}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

// Add a helper function to calculate duration between two timestamps
function calculateDuration(startTime: string, endTime: string): string {
    const start = new Date(startTime).getTime()
    const end = new Date(endTime).getTime()
    const durationMs = end - start

    if (durationMs < 1000) {
        return `${durationMs}ms`
    } else if (durationMs < 60000) {
        return `${Math.round(durationMs / 1000)}s`
    } else {
        const minutes = Math.floor(durationMs / 60000)
        const seconds = Math.round((durationMs % 60000) / 1000)
        return `${minutes}m ${seconds}s`
    }
}
// Config Prompt Component
export function BacktestConfigPrompt({ openParamsDialog }: { openParamsDialog: () => void }) {
    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle>Configure Backtest Parameters</CardTitle>
                <CardDescription>
                    {window.location.search.includes("mode=historical")
                        ? "No backtest data available for this strategy yet. Run your first backtest to see results."
                        : "Set up your backtest parameters before running the simulation"}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-center p-12">
                    <Button size="lg" onClick={openParamsDialog}>
                        <Settings2Icon className="mr-2 h-5 w-5" />
                        {window.location.search.includes("mode=historical") ? "Run First Backtest" : "Configure Parameters"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

