"use client"

import { useRouter } from "next/navigation"
import {
    ArrowLeftIcon,
    CalendarIcon,
    FilterIcon,
    DownloadIcon,
    HistoryIcon,
    Settings2Icon,
    ClockIcon,
    BarChart4Icon,
    CheckIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { BacktestRunHistoryItem } from "@/lib/api/backtest/types"

interface BacktestHeaderProps {
    title: string
    strategyName: string
    isHistorical: boolean
    selectedRunVersion: number
    timeframe: string
    setTimeframe: (value: string) => void
    runHistory: BacktestRunHistoryItem[]
    isLoadingHistory: boolean
    selectedRunsForComparison: number[]
    toggleRunSelection: (version: number) => void
    navigateToComparisonPage: () => void
    loadBacktestVersion: (version: number) => void
    openParamsDialog: () => void
    isCalculating: boolean
    hasBacktestData: boolean
}

export function BacktestHeader({
    title,
    strategyName,
    isHistorical,
    selectedRunVersion,
    timeframe,
    setTimeframe,
    runHistory,
    isLoadingHistory,
    selectedRunsForComparison,
    toggleRunSelection,
    navigateToComparisonPage,
    loadBacktestVersion,
    openParamsDialog,
    isCalculating,
    hasBacktestData,
}: BacktestHeaderProps) {
    const router = useRouter()

    // Format date for display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleString()
    }

    return (
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
                <Button variant="outline" size="icon" onClick={() => router.back()} className="mr-4">
                    <ArrowLeftIcon className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold flex items-center">
                        <span>{title}</span>
                        <Badge className="ml-3">{strategyName}</Badge>
                        {isHistorical && (
                            <Badge variant="outline" className="ml-2">
                                Historical
                            </Badge>
                        )}
                        {hasBacktestData && (
                            <Badge variant="secondary" className="ml-2">
                                Run #{selectedRunVersion}
                            </Badge>
                        )}
                    </h1>
                    <p className="text-muted-foreground">Historical performance analysis and trade statistics</p>
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <Select value={timeframe} onValueChange={setTimeframe}>
                    <SelectTrigger className="w-[120px]">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Timeframe" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="1m">1 Month</SelectItem>
                        <SelectItem value="3m">3 Months</SelectItem>
                        <SelectItem value="6m">6 Months</SelectItem>
                        <SelectItem value="1y">1 Year</SelectItem>
                        <SelectItem value="all">All Time</SelectItem>
                    </SelectContent>
                </Select>

                {/* Run History Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                            <HistoryIcon className="mr-2 h-4 w-4" />
                            Run History
                            {selectedRunsForComparison.length > 0 && (
                                <Badge variant="secondary" className="ml-2">
                                    {selectedRunsForComparison.length}
                                </Badge>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-72">
                        <div className="flex items-center justify-between p-2">
                            <DropdownMenuLabel>Backtest Runs</DropdownMenuLabel>
                            {selectedRunsForComparison.length >= 2 && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        navigateToComparisonPage()
                                    }}
                                >
                                    <BarChart4Icon className="mr-2 h-4 w-4" />
                                    Compare ({selectedRunsForComparison.length})
                                </Button>
                            )}
                        </div>
                        <DropdownMenuSeparator />
                        {isLoadingHistory ? (
                            <div className="p-4 text-center text-sm text-muted-foreground">Loading run history...</div>
                        ) : runHistory.length === 0 ? (
                            <div className="p-4 text-center text-sm text-muted-foreground">No run history available</div>
                        ) : (
                            runHistory.map((run) => (
                                <div key={run.id} className="flex items-center px-2 py-1.5 hover:bg-muted/50 rounded-sm">
                                    <div className="flex-1 cursor-pointer" onClick={() => loadBacktestVersion(run.version)}>
                                        <div className="flex items-center">
                                            <ClockIcon className="mr-2 h-4 w-4" />
                                            <span className="font-medium">Run #{run.version}</span>
                                            {selectedRunVersion === run.version && <Badge className="ml-2 text-xs">Current</Badge>}
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1">{formatDate(run.date)}</div>
                                    </div>
                                    <div
                                        className={`w-6 h-6 rounded-md border flex items-center justify-center cursor-pointer ${selectedRunsForComparison.includes(run.version) ? "bg-primary border-primary" : "border-input"
                                            }`}
                                        onClick={() => toggleRunSelection(run.version)}
                                    >
                                        {selectedRunsForComparison.includes(run.version) && (
                                            <CheckIcon className="h-4 w-4 text-primary-foreground" />
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Configure & Run Button */}
                <Button onClick={openParamsDialog} disabled={isCalculating}>
                    <Settings2Icon className="mr-2 h-4 w-4" />
                    Configure & Run
                </Button>
                <Button variant="outline" size="icon">
                    <FilterIcon className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                    <DownloadIcon className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}