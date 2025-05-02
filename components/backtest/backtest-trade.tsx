import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { ChevronLeft, ChevronRight } from "lucide-react"

const PAGE_SIZE = 10

export default function TradeListCard({ tradeData }) {
    const [page, setPage] = useState(1)
    const totalPages = Math.ceil(tradeData.length / PAGE_SIZE)
    const paginatedData = tradeData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

    return (
        <Card className="mt-6">
            <CardHeader>
                <CardTitle>Trade List</CardTitle>
                <CardDescription>Detailed record of all trades</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b bg-muted/50">
                                <th className="p-3 text-left text-sm font-medium">ID</th>
                                <th className="p-3 text-left text-sm font-medium">Type</th>
                                <th className="p-3 text-left text-sm font-medium">Result</th>
                                <th className="p-3 text-right text-sm font-medium">Profit/Loss</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.map((trade) => (
                                <tr key={trade.id} className="border-b">
                                    <td className="p-3 text-sm">{trade.id}</td>
                                    <td className="p-3 text-sm">
                                        <Badge variant={trade.type === "buy" ? "default" : "secondary"}>
                                            {trade.type === "buy" ? "Buy" : "Sell"}
                                        </Badge>
                                    </td>
                                    <td className="p-3 text-sm">
                                        <Badge
                                            variant={trade.result === "win" ? "outline" : "destructive"}
                                            className={trade.result === "win" ? "text-green-500 border-green-200" : ""}
                                        >
                                            {trade.result === "win" ? "Win" : "Loss"}
                                        </Badge>
                                    </td>
                                    <td className={`p-3 text-sm text-right ${trade.profit >= 0 ? "text-green-500" : "text-red-500"}`}>
                                        {trade.profit >= 0 ? "+" : ""}${trade.profit.toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-4 flex justify-end gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                        className="flex items-center gap-1"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Prev
                    </Button>

                    <Button
                        variant="outline"
                        onClick={() => setPage(page + 1)}
                        disabled={page === totalPages}
                        className="flex items-center gap-1"
                    >
                        Next
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}