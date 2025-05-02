"use client"

import React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import {
    ArrowLeft,
    Plus,
    Search,
    MoreHorizontal,
    Eye,
    Edit,
    Trash2,
    Beaker,
    Clock,
    Rocket,
    LineChart,
    FileEdit,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { formatDate } from "@/lib/utils"
import { deleteStrategy, fetchStrategies, StrategySummary } from "@/lib/api/strategies"
import { StrategySkeleton } from "../loading/strategy-skeleton"
import { toast } from "sonner"

export default function StrategiesPage() {
    const router = useRouter()
    const [strategies, setStrategies] = useState<StrategySummary[]>([])
    const [totalItems, setTotalItems] = useState(0)
    const [totalPages, setTotalPages] = useState(1)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState("all")
    const [searchQuery, setSearchQuery] = useState("")
    const [sortBy, setSortBy] = useState("updated")
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(8)

    // Refs for tracking scroll position and content height
    const contentRef = useRef<HTMLDivElement>(null)
    const paginationRef = useRef<HTMLDivElement>(null)
    const [showFloatingPagination, setShowFloatingPagination] = useState(false)

    // Fetch strategies
    useEffect(() => {
        async function loadStrategies() {
            try {
                setIsLoading(true)
                const response = await fetchStrategies({
                    page: currentPage,
                    limit: itemsPerPage,
                    search: searchQuery,
                    status: activeTab,
                    sort: sortBy
                })

                setStrategies(response.items)
                setTotalItems(response.total)
                setTotalPages(response.totalPages)
                setError(null)
            } catch (err) {
                console.error('Failed to load strategies:', err)
                setError('Failed to load strategies')
            } finally {
                setIsLoading(false)
            }
        }

        loadStrategies()
    }, [currentPage, itemsPerPage, searchQuery, activeTab, sortBy])

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery, activeTab, sortBy])

    // Handle scroll behavior for floating pagination
    useEffect(() => {
        const handleScroll = () => {
            if (!contentRef.current || !paginationRef.current) return

            const contentRect = contentRef.current.getBoundingClientRect()
            const paginationRect = paginationRef.current.getBoundingClientRect()

            // Check if bottom of content is not visible
            if (contentRect.bottom > window.innerHeight &&
                window.scrollY > contentRect.top + 100) {
                setShowFloatingPagination(true)
            } else {
                setShowFloatingPagination(false)
            }
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "draft":
                return <Badge variant="outline">Draft</Badge>
            case "backtest":
                return <Badge variant="secondary">Backtested</Badge>
            case "paper":
                return <Badge variant="outline" className="bg-blue-500/10 text-blue-500">Paper</Badge>
            case "live":
                return <Badge className="bg-green-500">Live</Badge>
            default:
                return <Badge variant="outline">Unknown</Badge>
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "draft":
                return <FileEdit className="h-4 w-4 text-muted-foreground" />
            case "backtest":
                return <Beaker className="h-4 w-4 text-violet-500" />
            case "paper":
                return <Clock className="h-4 w-4 text-blue-500" />
            case "live":
                return <Rocket className="h-4 w-4 text-green-500" />
            default:
                return <FileEdit className="h-4 w-4 text-muted-foreground" />
        }
    }

    const getNextAction = (strategy: StrategySummary) => {
        if (isLoading) {
            return <span className="flex items-center justify-center">Loading...</span>
        }

        if (strategy.isIncomplete) {
            return (
                <>
                    <Edit className="mr-2 h-4 w-4" />
                    Complete Setup
                </>
            )
        }

        switch (strategy.status) {
            case "draft":
                return (
                    <>
                        <Beaker className="mr-2 h-4 w-4" />
                        Run Backtest
                    </>
                )
            case "backtest":
                return (
                    <>
                        <Clock className="mr-2 h-4 w-4" />
                        Paper Trade
                    </>
                )
            case "paper":
                return (
                    <>
                        <Rocket className="mr-2 h-4 w-4" />
                        Go Live
                    </>
                )
            case "live":
                return (
                    <>
                        <LineChart className="mr-2 h-4 w-4" />
                        Monitor
                    </>
                )
            default:
                return null
        }
    }

    const handleEditStrategy = (id: number) => {
        console.log(`Edit strategy with id: ${id}`)
    }

    const handleDeleteStrategy = async (id: number) => {
        try {
            if (id) {
                await deleteStrategy(id)

                // Refresh the strategies list
                const response = await fetchStrategies({
                    page: currentPage,
                    limit: itemsPerPage,
                    search: searchQuery,
                    status: activeTab,
                    sort: sortBy
                })

                // Update state with new data
                setStrategies(response.items)
                setTotalItems(response.total)
                setTotalPages(response.totalPages)

                // Show success message
                toast.success("Strategy deleted successfully")

                // If this was the last item on the page, go to previous page
                if (strategies.length === 1 && currentPage > 1) {
                    setCurrentPage(prev => prev - 1)
                }
            }
        } catch (error) {
            console.error('Error deleting strategy:', error)
            toast.error("Failed to delete strategy")
        }
    }

    const handleActionClick = (strategy: StrategySummary) => {
        if (strategy.isIncomplete) {
            router.push(`/strategies/${strategy.id}/edit`)
            return
        }

        switch (strategy.status) {
            case "draft":
                if (!strategy.isIncomplete) {
                    router.push(`/strategies/${strategy.id}/observe`)
                }
                break
            case "backtest":
                router.push(`/strategies/${strategy.id}`)
                break
            case "paper":
                router.push(`/strategies/${strategy.id}/go-live`)
                break
            case "live":
                router.push(`/strategies/${strategy.id}/monitor`)
                break
        }
    }

    // Pagination handlers
    const goToFirstPage = () => setCurrentPage(1)
    const goToPreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 1))
    const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages))
    const goToLastPage = () => setCurrentPage(totalPages)

    // Pagination component
    const PaginationControls = () => (
        <div className="flex justify-center items-center space-x-2">
            <Button
                variant="outline"
                size="icon"
                onClick={goToFirstPage}
                disabled={currentPage === 1}
            >
                <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
                variant="outline"
                size="icon"
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{currentPage}</span>
                <span className="mx-2">/</span>
                <span>{totalPages}</span>
                <span className="ml-2">({(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems})</span>
            </div>

            <Button
                variant="outline"
                size="icon"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
                variant="outline"
                size="icon"
                onClick={goToLastPage}
                disabled={currentPage === totalPages}
            >
                <ChevronsRight className="h-4 w-4" />
            </Button>
        </div>
    )

    return (
        <div className="flex min-h-screen flex-col">
            <main className="flex-1 space-y-4 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                        {/* <Button
                            variant="outline"
                            size="icon"
                            onClick={() => router.push("/strategies")}
                            className="mr-4"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button> */}
                        <div>
                            <h1 className="text-2xl font-bold">Strategy Management</h1>
                            <p className="text-muted-foreground">
                                {totalItems} strategies • Manage your algorithmic trading templates here
                            </p>
                        </div>
                    </div>
                </div>

                <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                    <div className="flex flex-col md:flex-row gap-4 items-center mb-4">
                        <TabsList className="md:mr-auto">
                            <TabsTrigger value="all">All Strategies</TabsTrigger>
                            <TabsTrigger value="draft">Drafts</TabsTrigger>
                            <TabsTrigger value="backtest">Backtested</TabsTrigger>
                            <TabsTrigger value="paper">Paper Trading</TabsTrigger>
                            <TabsTrigger value="live">Live</TabsTrigger>
                        </TabsList>

                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="relative w-full md:w-[140px]">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-[90px]">
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="updated">Last Updated</SelectItem>
                                    <SelectItem value="name">Name</SelectItem>
                                    <SelectItem value="performance">Performance</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button onClick={() => router.push("/strategies/create")}>
                                <Plus className="h-4 w-4 mr-2" />
                                New Strategy
                            </Button>
                        </div>
                    </div>

                    <TabsContent value={activeTab} className="mt-4" ref={contentRef}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {isLoading ? (
                                [...Array(itemsPerPage)].map((_, i) => (
                                    <StrategySkeleton key={i} />
                                ))
                            ) : error ? (
                                <div className="col-span-full flex justify-center p-8">
                                    <div className="flex flex-col items-center gap-4">
                                        <p className="text-sm text-destructive">{error}</p>
                                        <Button
                                            variant="outline"
                                            onClick={() => window.location.reload()}
                                        >
                                            Try Again
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                strategies.map((strategy) => (
                                    <Card
                                        key={strategy.id}
                                        className="overflow-hidden border hover:border-primary/50 transition-colors cursor-pointer flex flex-col"
                                    // onClick={() => {
                                    //     if (strategy.isIncomplete) {
                                    //         router.push(`/strategies/${strategy.id}/edit`)
                                    //     } else {
                                    //         router.push(`/strategies/${strategy.id}`)
                                    //     }
                                    // }}
                                    >
                                        <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(strategy.status)}
                                                <CardTitle className="text-lg font-semibold">
                                                    {strategy.name}
                                                    {strategy.isIncomplete && (
                                                        <span className="ml-2 text-xs text-muted-foreground">(Incomplete)</span>
                                                    )}
                                                </CardTitle>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={e => e.stopPropagation()}
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={(e) => {
                                                        e.stopPropagation();

                                                        if (strategy.isIncomplete) {
                                                            router.push(`/strategies/${strategy.id}/edit`)
                                                            return
                                                        }

                                                        router.push(`/strategies/${strategy.id}`);

                                                    }}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEditStrategy(strategy.id);
                                                    }}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit Strategy
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteStrategy(strategy.id);
                                                        }}
                                                        className="text-destructive"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </CardHeader>

                                        <CardContent className="p-4 flex-1 flex flex-col">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="capitalize">
                                                        {strategy.type}
                                                    </Badge>
                                                    {getStatusBadge(strategy.status)}
                                                    {/* {strategy.isIncomplete && (
                                                        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">
                                                            Incomplete
                                                        </Badge>
                                                    )} */}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    Updated: {formatDate(strategy.updated)}
                                                </div>
                                            </div>

                                            {strategy.isIncomplete ? (
                                                <div className="grid grid-cols-3 gap-2 text-center mb-4">
                                                    <div className="bg-muted/30 p-2 rounded-md h-[72px] flex flex-col justify-center col-span-3">
                                                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                                            <FileEdit className="h-4 w-4" />
                                                            <span className="text-sm">Complete strategy configuration to continue</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-3 gap-2 text-center mb-4">
                                                    <div className="bg-muted/30 p-2 rounded-md h-[72px] flex flex-col justify-center">
                                                        <div className="text-xs text-muted-foreground">Return</div>
                                                        <div className="text-sm font-bold text-green-500">
                                                            {Number(strategy.backtestPerformance?.strategyReturn * 100 || 0).toFixed(2)}%
                                                        </div>
                                                    </div>
                                                    <div className="bg-muted/30 p-2 rounded-md h-[72px] flex flex-col justify-center">
                                                        <div className="text-xs text-muted-foreground">Win Rate</div>
                                                        <div className="text-sm font-bold">
                                                            {Number(strategy.backtestPerformance?.winRate * 100 || 0).toFixed(2)}%
                                                        </div>
                                                    </div>
                                                    <div className="bg-muted/30 p-2 rounded-md h-[72px] flex flex-col justify-center">
                                                        <div className="text-xs text-muted-foreground">Drawdown</div>
                                                        <div className="text-sm font-bold text-red-500">
                                                            {Number(strategy.backtestPerformance?.maxDrawdown * 100 || 0).toFixed(2)}%
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex gap-2 mt-auto">
                                                {!!!strategy.isIncomplete && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="flex-1 h-9"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            router.push(`/strategies/${strategy.id}`);
                                                        }}
                                                    >
                                                        <Eye className="mr-2 h-3 w-3" />
                                                        Details
                                                    </Button>
                                                )}


                                                <div className="flex-1">
                                                    <Button
                                                        size="sm"
                                                        className="w-full h-9"
                                                        variant={strategy.status === "live" ? "default" : "outline"}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleActionClick(strategy);
                                                        }}
                                                    >
                                                        {getNextAction(strategy)}
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>

                        {/* Static Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="mt-8" ref={paginationRef}>
                                <PaginationControls />
                            </div>
                        )}
                    </TabsContent>
                </Tabs>

                {/* Floating Pagination Controls */}
                {totalPages > 1 && showFloatingPagination && (
                    <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t p-4 shadow-lg z-50 transition-all duration-300">
                        <div className="container mx-auto">
                            <PaginationControls />
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}