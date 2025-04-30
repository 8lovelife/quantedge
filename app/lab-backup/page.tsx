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
    Beaker,
    Heart,
    Download,
    ChevronsLeft,
    ChevronRight,
    ChevronsRight,
    ChevronLeft,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { StrategySkeleton } from "@/components/loading/strategy-skeleton"
import { toast } from "sonner"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SiteHeader } from "@/components/layout/site-header"
import { fetchAlgorithms, fetchStrategyTemplate, StrategyTemplate } from "@/lib/api/algorithms"

const CURRENT_USER = "8lovelife"
const CURRENT_DATE = "2025-04-16 18:30:32"


export default function StrategyLabPage() {
    const router = useRouter()
    const [templates, setTemplates] = useState<StrategyTemplate[]>([])
    const [totalItems, setTotalItems] = useState(0)
    const [totalPages, setTotalPages] = useState(1)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState("lab") // Default tab is 'lab'
    const [searchQuery, setSearchQuery] = useState("")
    const [sortBy, setSortBy] = useState("updated")
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(8)

    // Refs for tracking scroll position and content height
    const contentRef = useRef<HTMLDivElement>(null)
    const paginationRef = useRef<HTMLDivElement>(null)
    const [showFloatingPagination, setShowFloatingPagination] = useState(false)

    // Fetch strategies - Replace with your actual API call if you have one
    useEffect(() => {
        async function loadTemplates() {
            try {
                setIsLoading(true)
                // Simulate API Call
                await new Promise(resolve => setTimeout(resolve, 500));
                // Filter templates based on active tab
                // const filteredTemplates = activeTab === "lab" ? mockTemplates : mockTemplates.filter(t => t.author !== "tradingmaster");
                const strategyTemplates = await fetchStrategyTemplate({
                    page: currentPage,
                    limit: itemsPerPage,
                    search: searchQuery,
                    status: activeTab,
                    sort: sortBy
                });

                setTemplates(strategyTemplates.items);
                setTotalItems(strategyTemplates.total);
                setTotalPages(strategyTemplates.totalPages);
                setError(null)
            } catch (err) {
                console.error('Failed to load strategies:', err)
                setError('Failed to load strategies')
            } finally {
                setIsLoading(false)
            }
        }

        loadTemplates()
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

    const handleCreateStrategy = (template: StrategyTemplate) => {
        // Implement your logic to create a strategy based on the template
        toast.success(`Created strategy from template: ${template.name}`);
        router.push("/backtest") // Navigate to backtest page or wherever you want
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
        <SidebarProvider>
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader />
                <div className="flex min-h-screen flex-col">
                    <main className="flex-1 space-y-4 p-4 md:p-6">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center">
                                <div>
                                    <h1 className="text-2xl font-bold">Strategy Lab</h1>
                                    <p className="text-muted-foreground">
                                        {totalItems} strategy templates • Last updated: {formatDate(new Date().toISOString())}
                                    </p>
                                </div>
                            </div>
                            {/* <div className="flex items-center gap-4">
                                <div className="flex -space-x-2">
                                    <Avatar className="border-2 border-background">
                                        <AvatarFallback>TM</AvatarFallback>
                                    </Avatar>
                                    <div className="text-sm">
                                        <div className="font-medium">tradingmaster</div>
                                        <div className="text-xs text-muted-foreground">
                                            Strategy Author
                                        </div>
                                    </div>
                                </div>
                                <Separator orientation="vertical" className="h-8" />
                                <div className="flex items-center gap-2">
                                    <Avatar>
                                        <AvatarFallback>{CURRENT_USER[0].toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className="text-sm">
                                        <div className="font-medium">{CURRENT_USER}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {CURRENT_DATE} UTC
                                        </div>
                                    </div>
                                </div>
                            </div> */}
                        </div>

                        <Tabs defaultValue="lab" value={activeTab} onValueChange={setActiveTab}>
                            <div className="flex flex-col md:flex-row gap-4 items-center mb-4">
                                <TabsList className="md:mr-auto">
                                    <TabsTrigger value="lab">Lab</TabsTrigger>
                                    <TabsTrigger value="community">Community</TabsTrigger>
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
                                    {/*<Button onClick={() => router.push("/strategies/create")}>
                                <Plus className="h-4 w-4 mr-2" />
                            New Strategy
                            </Button>*/}
                                </div>
                            </div>

                            <TabsContent value="lab" className="mt-2" ref={contentRef}> {/* Reduced margin-top */}
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
                                        templates.map((template) => (
                                            <Card
                                                key={template.id}
                                                className="overflow-hidden border hover:border-primary/50 transition-colors cursor-pointer flex flex-col"
                                            >
                                                <CardHeader className="p-3 pb-2 flex flex-col items-start justify-between space-y-1">
                                                    <div className="flex items-start gap-2 w-full">
                                                        <CardTitle className="text-base font-semibold">
                                                            {template.name}
                                                        </CardTitle>
                                                    </div>
                                                    <div className="flex items-center justify-between w-full">
                                                        <div className="flex items-center text-muted-foreground text-xs">
                                                            <div className="flex items-center gap-1 mr-2">
                                                                <Heart className="w-3 h-3" /> {template.likes}
                                                                <Download className="w-3 h-3" /> {template.usage}
                                                            </div>
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            By {template.author}
                                                        </div>
                                                    </div>
                                                </CardHeader>

                                                <CardContent className="p-3 flex-1 flex flex-col">
                                                    <CardDescription className="text-sm text-muted-foreground mb-3">
                                                        {template.description}
                                                    </CardDescription>

                                                    <div className="grid grid-cols-3 gap-1 text-center mb-3">
                                                        <div className="bg-muted/30 p-1 rounded-md h-[60px] flex flex-col justify-center">
                                                            <div className="text-xs text-muted-foreground">Return</div>
                                                            <div className="text-sm font-bold text-green-500">
                                                                {Number(template.performance?.strategyReturn * 100 || 0).toFixed(2)}%
                                                            </div>
                                                        </div>
                                                        <div className="bg-muted/30 p-1 rounded-md h-[60px] flex flex-col justify-center">
                                                            <div className="text-xs text-muted-foreground">Win Rate</div>
                                                            <div className="text-sm font-bold">
                                                                {Number(template.performance?.winRate * 100 || 0).toFixed(2)}%
                                                            </div>
                                                        </div>
                                                        <div className="bg-muted/30 p-1 rounded-md h-[60px] flex flex-col justify-center">
                                                            <div className="text-xs text-muted-foreground">Drawdown</div>
                                                            <div className="text-sm font-bold text-red-500">
                                                                {Number(template.performance?.maxDrawdown * 100 || 0).toFixed(2)}%
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-2 mt-auto justify-end">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                router.push(`/lab/${template.id}/observe`);
                                                            }}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0"
                                                        // onClick={(e) => {
                                                        //     e.stopPropagation();
                                                        //     router.push(`/strategy-detail/${template.id}`)
                                                        // }}
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            className="h-8"
                                                            variant="outline"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleCreateStrategy(template);
                                                            }}
                                                        >
                                                            Build My Strategy
                                                        </Button>
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
                            <TabsContent value="community" className="mt-4" ref={contentRef}>
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
                                        templates.map((template) => (
                                            <Card
                                                key={template.id}
                                                className="overflow-hidden border hover:border-primary/50 transition-colors cursor-pointer flex flex-col"
                                            >
                                                <CardHeader className="p-3 pb-2 flex flex-col items-start justify-between space-y-1">
                                                    <div className="flex items-start gap-2 w-full">
                                                        <CardTitle className="text-base font-semibold">
                                                            {template.name}
                                                        </CardTitle>
                                                    </div>
                                                    <div className="flex items-center justify-between w-full">
                                                        <div className="flex items-center text-muted-foreground text-xs">
                                                            <div className="flex items-center gap-1 mr-2">
                                                                <Heart className="w-3 h-3" /> {template.likes}
                                                                <Download className="w-3 h-3" /> {template.usage}
                                                            </div>
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            By {template.author}
                                                        </div>
                                                    </div>
                                                </CardHeader>

                                                <CardContent className="p-3 flex-1 flex flex-col">
                                                    <CardDescription className="text-sm text-muted-foreground mb-3">
                                                        {template.description}
                                                    </CardDescription>

                                                    <div className="grid grid-cols-3 gap-1 text-center mb-3">
                                                        <div className="bg-muted/30 p-1 rounded-md h-[60px] flex flex-col justify-center">
                                                            <div className="text-xs text-muted-foreground">Return</div>
                                                            <div className="text-sm font-bold text-green-500">
                                                                {Number(template.performance?.strategyReturn || 0).toFixed(2)}%
                                                            </div>
                                                        </div>
                                                        <div className="bg-muted/30 p-1 rounded-md h-[60px] flex flex-col justify-center">
                                                            <div className="text-xs text-muted-foreground">Win Rate</div>
                                                            <div className="text-sm font-bold">
                                                                {Number(template.performance?.winRate || 0).toFixed(2)}%
                                                            </div>
                                                        </div>
                                                        <div className="bg-muted/30 p-1 rounded-md h-[60px] flex flex-col justify-center">
                                                            <div className="text-xs text-muted-foreground">Drawdown</div>
                                                            <div className="text-sm font-bold text-red-500">
                                                                {Number(template.performance?.maxDrawdown || 0).toFixed(2)}%
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-2 mt-auto justify-end">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                router.push(`/lab/${template.id}/observe`);
                                                            }}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                router.push(`/strategy-detail/${template.id}`)
                                                            }}
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            className="h-8"
                                                            variant="outline"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleCreateStrategy(template);
                                                            }}
                                                        >
                                                            Build My Strategy
                                                        </Button>
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
            </SidebarInset>
        </SidebarProvider>
    )
}