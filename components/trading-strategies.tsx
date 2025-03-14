"use client"

import { useState, useEffect } from "react"
import { PlayIcon, PauseIcon, TrashIcon, PencilIcon, PlusIcon, InfoIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { fetchTradingStrategies, updateStrategyStatus, deleteStrategy } from "@/lib/api/strategies"
import type { Strategy } from "@/lib/types"

export function TradingStrategies() {
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionInProgress, setActionInProgress] = useState<number | null>(null)
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [itemsPerPage] = useState(3) // Reduced to 3 to ensure pagination is visible

  useEffect(() => {
    const loadStrategies = async () => {
      try {
        setIsLoading(true)
        const data = await fetchTradingStrategies(currentPage, itemsPerPage)
        setStrategies(data.items)
        setTotalPages(data.totalPages)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch trading strategies:", err)
        setError("Failed to load trading strategies")
      } finally {
        setIsLoading(false)
      }
    }

    loadStrategies()
  }, [currentPage, itemsPerPage])

  const handleStatusChange = async (id: number, newStatus: "active" | "paused") => {
    try {
      setActionInProgress(id)
      await updateStrategyStatus(id, newStatus)
      setStrategies(strategies.map((strategy) => (strategy.id === id ? { ...strategy, status: newStatus } : strategy)))
    } catch (err) {
      console.error(`Failed to update strategy status:`, err)
      setError("Failed to update strategy status")
    } finally {
      setActionInProgress(null)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      setActionInProgress(id)
      await deleteStrategy(id)
      setStrategies(strategies.filter((strategy) => strategy.id !== id))
    } catch (err) {
      console.error(`Failed to delete strategy:`, err)
      setError("Failed to delete strategy")
    } finally {
      setActionInProgress(null)
    }
  }

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
  }

  const openStrategyDetails = (strategy: Strategy) => {
    setSelectedStrategy(strategy)
  }

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = []
    const maxPagesToShow = 5

    if (totalPages <= maxPagesToShow) {
      // Show all pages if there are few
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      // Always show first page
      pageNumbers.push(1)

      // Calculate start and end of page range
      let startPage = Math.max(2, currentPage - 1)
      let endPage = Math.min(totalPages - 1, currentPage + 1)

      // Adjust if at the beginning or end
      if (currentPage <= 2) {
        endPage = 3
      } else if (currentPage >= totalPages - 1) {
        startPage = totalPages - 2
      }

      // Add ellipsis if needed
      if (startPage > 2) {
        pageNumbers.push("ellipsis1")
      }

      // Add page range
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i)
      }

      // Add ellipsis if needed
      if (endPage < totalPages - 1) {
        pageNumbers.push("ellipsis2")
      }

      // Always show last page
      if (totalPages > 1) {
        pageNumbers.push(totalPages)
      }
    }

    return pageNumbers
  }

  // 3. Wrap all strategy cards in a single Card component
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">Trading Strategies</CardTitle>
        <Button>
          <PlusIcon className="mr-2 h-4 w-4" />
          New Strategy
        </Button>
      </CardHeader>
      <CardContent>
        {error && <div className="rounded-md bg-destructive/15 p-3 text-destructive">{error}</div>}

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <div className="h-6 w-3/4 animate-pulse rounded bg-muted"></div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-2">
                    <div className="h-4 w-full animate-pulse rounded bg-muted"></div>
                    <div className="h-4 w-full animate-pulse rounded bg-muted"></div>
                    <div className="h-4 w-full animate-pulse rounded bg-muted"></div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-2">
                  <div className="h-8 w-20 animate-pulse rounded bg-muted"></div>
                  <div className="h-8 w-20 animate-pulse rounded bg-muted"></div>
                  <div className="h-8 w-8 animate-pulse rounded bg-muted"></div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {strategies.map((strategy) => (
                <Card key={strategy.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle>{strategy.name}</CardTitle>
                      <Badge variant={strategy.status === "active" ? "default" : "secondary"}>{strategy.status}</Badge>
                    </div>
                    <CardDescription>{strategy.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Performance (30d)</span>
                        <span className={strategy.performance >= 0 ? "text-green-500" : "text-red-500"}>
                          {strategy.performance >= 0 ? "+" : ""}
                          {strategy.performance}%
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Allocation</span>
                        <span>{strategy.allocation}%</span>
                      </div>
                      <Progress value={strategy.allocation} className="h-2" />
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Risk Level</span>
                        <span
                          className={
                            strategy.risk === "low"
                              ? "text-green-500"
                              : strategy.risk === "medium"
                                ? "text-yellow-500"
                                : "text-red-500"
                          }
                        >
                          {strategy.risk.charAt(0).toUpperCase() + strategy.risk.slice(1)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-2">
                    <Button variant="outline" size="sm">
                      <PencilIcon className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => openStrategyDetails(strategy)}>
                          <InfoIcon className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle className="flex items-center">
                            {selectedStrategy?.name}
                            <Badge
                              variant={selectedStrategy?.status === "active" ? "default" : "secondary"}
                              className="ml-2"
                            >
                              {selectedStrategy?.status}
                            </Badge>
                          </DialogTitle>
                          <DialogDescription>{selectedStrategy?.description}</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="mb-2 text-sm font-medium">Performance</h4>
                              <p
                                className={
                                  selectedStrategy?.performance && selectedStrategy.performance >= 0
                                    ? "text-green-500 text-xl font-bold"
                                    : "text-red-500 text-xl font-bold"
                                }
                              >
                                {selectedStrategy?.performance && selectedStrategy.performance >= 0 ? "+" : ""}
                                {selectedStrategy?.performance}%
                              </p>
                            </div>
                            <div>
                              <h4 className="mb-2 text-sm font-medium">Risk Level</h4>
                              <p
                                className={
                                  selectedStrategy?.risk === "low"
                                    ? "text-green-500 text-xl font-bold"
                                    : selectedStrategy?.risk === "medium"
                                      ? "text-yellow-500 text-xl font-bold"
                                      : "text-red-500 text-xl font-bold"
                                }
                              >
                                {selectedStrategy?.risk?.charAt(0).toUpperCase() + selectedStrategy?.risk?.slice(1)}
                              </p>
                            </div>
                          </div>

                          <div>
                            <h4 className="mb-2 text-sm font-medium">Algorithm</h4>
                            <p className="text-sm">{selectedStrategy?.algorithm}</p>
                          </div>

                          <div>
                            <h4 className="mb-2 text-sm font-medium">Timeframe</h4>
                            <p className="text-sm">{selectedStrategy?.timeframe}</p>
                          </div>

                          <div>
                            <h4 className="mb-2 text-sm font-medium">Assets</h4>
                            <div className="flex flex-wrap gap-2">
                              {selectedStrategy?.assets?.split(",").map((asset) => (
                                <Badge key={asset} variant="outline">
                                  {asset}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="mb-2 text-sm font-medium">Parameters</h4>
                            <div className="rounded-md bg-muted p-3 text-sm font-mono">
                              {selectedStrategy?.parameters &&
                                Object.entries(selectedStrategy.parameters).map(([key, value]) => (
                                  <div key={key} className="flex justify-between">
                                    <span>{key}:</span>
                                    <span>{JSON.stringify(value)}</span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    {strategy.status === "active" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(strategy.id, "paused")}
                        disabled={actionInProgress === strategy.id}
                      >
                        <PauseIcon className="h-4 w-4 mr-1" />
                        {actionInProgress === strategy.id ? "Updating..." : "Pause"}
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(strategy.id, "active")}
                        disabled={actionInProgress === strategy.id}
                      >
                        <PlayIcon className="h-4 w-4 mr-1" />
                        {actionInProgress === strategy.id ? "Updating..." : "Resume"}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive"
                      onClick={() => handleDelete(strategy.id)}
                      disabled={actionInProgress === strategy.id}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {/* Always show pagination controls */}
            <Pagination className="mt-6">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
                </PaginationItem>

                {getPageNumbers().map((page, i) => (
                  <PaginationItem key={i}>
                    {page === "ellipsis1" || page === "ellipsis2" ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink isActive={page === currentPage} onClick={() => handlePageChange(page as number)}>
                        {page}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </>
        )}
      </CardContent>
    </Card>
  )
}

