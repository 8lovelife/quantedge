"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Plus, Search, MoreHorizontal, CheckCircle, XCircle, ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight, RefreshCw, Pencil, Trash2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { toast } from "sonner"

interface Exchange {
    id: number
    name: string
    type: "spot" | "futures"
    mode: "paper" | "live"
    baseUrl: string
    apiKey: string
    enabled: boolean
    lastUpdated: string
    minQty: number
    priceStep: number
    makerFee: number
    takerFee: number
}

const mockExchanges: Exchange[] = [
    { id: 1, name: "Binance", type: "spot", mode: "paper", baseUrl: "https://api.binance.com", apiKey: "****1234", enabled: true, lastUpdated: "2025-04-27", minQty: 0.001, priceStep: 0.01, makerFee: 0.1, takerFee: 0.1 },
    { id: 2, name: "OKX", type: "futures", mode: "live", baseUrl: "https://www.okx.com", apiKey: "****5678", enabled: false, lastUpdated: "2025-04-26", minQty: 0.01, priceStep: 0.1, makerFee: 0.08, takerFee: 0.1 },
]

export default function ExchangesPage() {
    const router = useRouter()
    const [exchanges, setExchanges] = useState<Exchange[]>([])
    const [activeTab, setActiveTab] = useState("all")
    const [searchQuery, setSearchQuery] = useState("")
    const [sortBy, setSortBy] = useState("updated")
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(8)
    const [isLoading, setIsLoading] = useState(true)
    const [open, setOpen] = useState(false)
    const [newExchange, setNewExchange] = useState<Partial<Exchange>>({})

    const paginationRef = useRef<HTMLDivElement>(null)
    const [showFloatingPagination, setShowFloatingPagination] = useState(false)

    useEffect(() => {
        async function loadExchanges() {
            setIsLoading(true)
            setTimeout(() => {
                setExchanges(mockExchanges)
                setIsLoading(false)
            }, 500)
        }
        loadExchanges()
    }, [])

    useEffect(() => {
        const handleScroll = () => {
            if (!paginationRef.current) return
            const rect = paginationRef.current.getBoundingClientRect()
            setShowFloatingPagination(rect.top > window.innerHeight)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const filtered = exchanges.filter(e =>
        (activeTab === "all" || e.type === activeTab) &&
        e.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => {
        if (sortBy === "name") return a.name.localeCompare(b.name)
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
    })

    const totalPages = Math.ceil(filtered.length / itemsPerPage)
    const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    const handleAddExchange = () => {
        if (newExchange.name && newExchange.baseUrl && newExchange.apiKey && newExchange.type && newExchange.mode) {
            setExchanges(prev => [...prev, {
                id: Date.now(),
                name: newExchange.name,
                type: newExchange.type,
                mode: newExchange.mode,
                baseUrl: newExchange.baseUrl,
                apiKey: newExchange.apiKey,
                enabled: true,
                lastUpdated: new Date().toISOString().split("T")[0],
                minQty: 0.001,
                priceStep: 0.01,
                makerFee: 0.1,
                takerFee: 0.1,
            }])
            setNewExchange({})
            setOpen(false)
            toast.success("Exchange added successfully")
        } else {
            toast.error("Please fill all required fields")
        }
    }

    const PaginationControls = () => (
        <div className="flex justify-center items-center space-x-2">
            <Button variant="outline" size="icon" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}><ChevronsLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4" /></Button>
            <span className="text-sm">{currentPage} / {totalPages || 1}</span>
            <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}><ChevronRight className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}><ChevronsRight className="h-4 w-4" /></Button>
        </div>
    )

    return (
        <div className="flex min-h-screen flex-col">
            <main className="flex-1 space-y-4 p-4 md:p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Exchange Management</h1>
                        <p className="text-muted-foreground">{exchanges.length} exchanges • Last updated: {new Date().toISOString().split("T")[0]}</p>
                    </div>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button><Plus className="h-4 w-4 mr-2" />Add Exchange</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader><DialogTitle>Add New Exchange</DialogTitle></DialogHeader>
                            <div className="space-y-4">
                                <Input placeholder="Exchange Name" value={newExchange.name || ''} onChange={e => setNewExchange(prev => ({ ...prev, name: e.target.value }))} />
                                <Input placeholder="Base URL" value={newExchange.baseUrl || ''} onChange={e => setNewExchange(prev => ({ ...prev, baseUrl: e.target.value }))} />
                                <Input placeholder="API Key" value={newExchange.apiKey || ''} onChange={e => setNewExchange(prev => ({ ...prev, apiKey: e.target.value }))} />
                                <Select onValueChange={value => setNewExchange(prev => ({ ...prev, type: value as "spot" | "futures" }))}>
                                    <SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="spot">Spot</SelectItem>
                                        <SelectItem value="futures">Futures</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select onValueChange={value => setNewExchange(prev => ({ ...prev, mode: value as "paper" | "live" }))}>
                                    <SelectTrigger><SelectValue placeholder="Select Mode" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="paper">Paper</SelectItem>
                                        <SelectItem value="live">Live</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleAddExchange}>Save</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="all">
                    <div className="flex flex-col md:flex-row gap-4 items-center mb-4">
                        <TabsList className="md:mr-auto">
                            <TabsTrigger value="all">All</TabsTrigger>
                            <TabsTrigger value="spot">Spot</TabsTrigger>
                            <TabsTrigger value="futures">Futures</TabsTrigger>
                        </TabsList>

                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-8 w-40" />
                            </div>
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-[90px]">
                                    <SelectValue placeholder="Sort" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="updated">Updated</SelectItem>
                                    <SelectItem value="name">Name</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <TabsContent value={activeTab}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {isLoading ? (
                                [...Array(itemsPerPage)].map((_, i) => (
                                    <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
                                ))
                            ) : (
                                paginated.map((exchange) => (
                                    <Card key={exchange.id} className="flex flex-col">
                                        <CardHeader className="flex flex-row items-center justify-between p-4">
                                            <div>
                                                <CardTitle className="text-lg font-semibold">{exchange.name}</CardTitle>
                                                <div className="flex gap-2 mt-2">
                                                    <Badge variant="outline">{exchange.type}</Badge>
                                                    <Badge variant="outline" className={exchange.mode === "live" ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"}>{exchange.mode}</Badge>
                                                </div>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem><RefreshCw className="h-4 w-4 mr-2" />Test Connection</DropdownMenuItem>
                                                    <DropdownMenuItem><Pencil className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-destructive"><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </CardHeader>

                                        <CardContent className="p-4 space-y-4 text-sm">
                                            <div className="grid grid-cols-3 gap-2 text-center">
                                                <div className="bg-muted/30 p-2 rounded-md h-[72px] flex flex-col justify-center">
                                                    <div className="text-xs text-muted-foreground">Status</div>
                                                    <div className="text-sm font-bold">{exchange.enabled ? "Connected" : "Disconnected"}</div>
                                                </div>
                                                <div className="bg-muted/30 p-2 rounded-md h-[72px] flex flex-col justify-center">
                                                    <div className="text-xs text-muted-foreground">Mode</div>
                                                    <div className="text-sm font-bold capitalize">{exchange.mode}</div>
                                                </div>
                                                <div className="bg-muted/30 p-2 rounded-md h-[72px] flex flex-col justify-center">
                                                    <div className="text-xs text-muted-foreground">Type</div>
                                                    <div className="text-sm font-bold capitalize">{exchange.type}</div>
                                                </div>
                                                <div className="bg-muted/30 p-2 rounded-md h-[72px] flex flex-col justify-center">
                                                    <div className="text-xs text-muted-foreground">Min Qty</div>
                                                    <div className="text-sm font-bold">{exchange.minQty}</div>
                                                </div>
                                                <div className="bg-muted/30 p-2 rounded-md h-[72px] flex flex-col justify-center">
                                                    <div className="text-xs text-muted-foreground">Price Step</div>
                                                    <div className="text-sm font-bold">{exchange.priceStep}</div>
                                                </div>
                                                <div className="bg-muted/30 p-2 rounded-md h-[72px] flex flex-col justify-center">
                                                    <div className="text-xs text-muted-foreground">Fee</div>
                                                    <div className="text-sm font-bold">{exchange.makerFee}%/{exchange.takerFee}%</div>
                                                </div>
                                            </div>

                                            <div>Base URL: {exchange.baseUrl}</div>
                                            <div>API Key: {exchange.apiKey}</div>
                                            <div>Updated: {exchange.lastUpdated}</div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>

                        {totalPages > 1 && (
                            <div className="mt-8" ref={paginationRef}>
                                <PaginationControls />
                            </div>
                        )}
                    </TabsContent>
                </Tabs>

                {totalPages > 1 && showFloatingPagination && (
                    <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm p-4 border-t z-50">
                        <PaginationControls />
                    </div>
                )}
            </main>
        </div>
    )
}
