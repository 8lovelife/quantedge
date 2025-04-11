"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, X } from "lucide-react"
import { AssetAllocationData } from "@/lib/api/strategies"


interface AssetConfigurationProps {
    data: AssetAllocationData[]
    onChange: (data: AssetAllocationData[]) => void
}

export default function AssetConfiguration({ data, onChange }: AssetConfigurationProps) {
    const [symbol, setSymbol] = useState("")
    const [weight, setWeight] = useState(0)
    const [direction, setDirection] = useState<"long" | "short" | "both">("both")
    const [error, setError] = useState("")

    const handleAdd = () => {
        if (!symbol || weight <= 0 || weight > 100) return

        if (data.some((a) => a.symbol === symbol)) {
            setError("Asset already exists")
            return
        }

        const total = data.reduce((sum, a) => sum + a.weight, 0) + weight
        if (total > 100) {
            setError("Total allocation exceeds 100%")
            return
        }

        setError("")
        onChange([...data, { symbol, weight, direction }])
        setSymbol("")
        setWeight(0)
        setDirection("both")
    }

    const handleRemove = (symbol: string) => {
        const updated = data.filter((a) => a.symbol !== symbol)
        onChange(updated)
    }

    const handleUpdate = (symbol: string, key: keyof AssetAllocationData, value: any) => {
        const updated = data.map((a) => a.symbol === symbol ? { ...a, [key]: value } : a)
        onChange(updated)
    }

    const balance = () => {
        const n = data.length
        if (n === 0) return

        const base = Math.floor(100 / n)
        const remainder = 100 - base * n

        const updated = data.map((a, i) => ({
            ...a,
            weight: base + (i === n - 1 ? remainder : 0),
        }))
        onChange(updated)
    }

    const distribute = () => {
        const currentTotal = data.reduce((sum, a) => sum + a.weight, 0)
        const remaining = 100 - currentTotal
        const n = data.length
        if (remaining <= 0 || n === 0) return

        const base = Math.floor(remaining / n)
        const remainder = remaining - base * n

        const updated = data.map((a, i) => ({
            ...a,
            weight: a.weight + base + (i === n - 1 ? remainder : 0),
        }))
        onChange(updated)
    }

    const totalWeight = data.reduce((sum, a) => sum + a.weight, 0)

    return (
        <div className="space-y-4">
            {/* Add Section */}
            <div className="flex flex-wrap items-end gap-4">
                <div className="flex-1 min-w-[120px]">
                    <Label>Symbol</Label>
                    <Select value={symbol} onValueChange={setSymbol}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="BTC/USDT">BTC/USDT</SelectItem>
                            <SelectItem value="ETH/USDT">ETH/USDT</SelectItem>
                            <SelectItem value="SOL/USDT">SOL/USDT</SelectItem>
                            <SelectItem value="BNB/USDT">BNB/USDT</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="min-w-[100px]">
                    <Label>Direction</Label>
                    <Select value={direction} onValueChange={(v) => setDirection(v as any)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="long">Long</SelectItem>
                            <SelectItem value="short">Short</SelectItem>
                            <SelectItem value="both">Both</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="min-w-[80px]">
                    <Label>Weight %</Label>
                    <Input type="number" value={weight} onChange={(e) => setWeight(+e.target.value)} />
                </div>
                <Button onClick={handleAdd} className="mt-6">Add</Button>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* List */}
            <div className="rounded-md border p-4 space-y-2">
                {data.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No assets added.</p>
                ) : (
                    data.map((a) => (
                        <div key={a.symbol} className="flex justify-between items-center border-b pb-2 last:border-b-0 last:pb-0">
                            <div>{a.symbol}</div>
                            <div className="flex items-center gap-3">
                                <Select value={a.direction} onValueChange={(v) => handleUpdate(a.symbol, "direction", v)}>
                                    <SelectTrigger className="w-[80px]"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="long">Long</SelectItem>
                                        <SelectItem value="short">Short</SelectItem>
                                        <SelectItem value="both">Both</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Input
                                    type="number"
                                    value={a.weight}
                                    onChange={(e) => handleUpdate(a.symbol, "weight", +e.target.value)}
                                    className="w-[70px]"
                                />
                                <span>%</span>
                                <Button variant="ghost" size="sm" onClick={() => handleRemove(a.symbol)}><X className="h-4 w-4" /></Button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center pt-2">
                <div className="space-x-2">
                    <Button variant="outline" size="sm" onClick={distribute}>Distribute Remaining</Button>
                    <Button variant="outline" size="sm" onClick={balance}>Balance Equally</Button>
                </div>
                <div className="text-sm font-medium">
                    Total Allocation: <span className={totalWeight === 100 ? "text-green-500" : "text-amber-500"}>{totalWeight}%</span>
                </div>
            </div>
        </div>
    )
}