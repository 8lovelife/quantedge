"use client"

import { useState, useEffect } from "react"
import { CheckCircleIcon, XCircleIcon } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { fetchRecentTrades } from "@/lib/api/trades"
import type { Trade } from "@/lib/types"

export function RecentTrades() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [itemsPerPage] = useState(5) // Reduced to 5 to ensure pagination is visible

  useEffect(() => {
    const loadTrades = async () => {
      try {
        setIsLoading(true)
        const data = await fetchRecentTrades(currentPage, itemsPerPage)
        setTrades(data.items)
        setTotalPages(data.totalPages)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch recent trades:", err)
        setError("Failed to load recent trades")
      } finally {
        setIsLoading(false)
      }
    }

    loadTrades()
  }, [currentPage, itemsPerPage])

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Trades</CardTitle>
        <CardDescription>Your most recent automated trading activities</CardDescription>
      </CardHeader>
      <CardContent>
        {error && <div className="rounded-md bg-destructive/15 p-3 mb-4 text-destructive">{error}</div>}

        <div className="space-y-4">
          <div className="grid grid-cols-7 text-xs font-medium text-muted-foreground">
            <div>ID</div>
            <div>Strategy</div>
            <div>Type</div>
            <div>Asset</div>
            <div className="text-right">Amount</div>
            <div className="text-right">Price</div>
            <div className="text-right">P/L</div>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-6 w-full animate-pulse rounded bg-muted"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {trades.map((trade) => (
                <div key={trade.id} className="grid grid-cols-7 items-center text-sm">
                  <div className="font-medium">{trade.id}</div>
                  <div>{trade.strategy}</div>
                  <div>
                    <Badge variant={trade.type === "buy" ? "outline" : "secondary"}>{trade.type.toUpperCase()}</Badge>
                  </div>
                  <div>{trade.asset}</div>
                  <div className="text-right">{trade.amount}</div>
                  <div className="text-right">${trade.price.toLocaleString()}</div>
                  <div className="text-right">
                    {trade.profit !== null ? (
                      <span
                        className={`flex items-center justify-end ${trade.profit >= 0 ? "text-green-500" : "text-red-500"}`}
                      >
                        {trade.profit >= 0 ? (
                          <CheckCircleIcon className="mr-1 h-4 w-4" />
                        ) : (
                          <XCircleIcon className="mr-1 h-4 w-4" />
                        )}
                        ${Math.abs(trade.profit).toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

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
        </div>
      </CardContent>
    </Card>
  )
}

