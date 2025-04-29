"use client"

import { Coins } from "lucide-react"
import {
    Pie,
    PieChart,
    Cell,
    Tooltip,
    ResponsiveContainer,
    LabelList,
} from "recharts"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Meta } from "../meta"
import { Select } from "../ui/select"

const COLORS = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff7f50",
    "#a3a1fb",
    "#f6c90e",
]

function getStatusColorClass(status: string) {
    switch (status) {
        case "live":
            return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-green-300"
        case "paper":
            return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 border-blue-300"
        default:
            return "bg-muted"
    }
}

// Custom tooltip content
const CustomTooltip = ({
    active,
    payload,
}: {
    active?: boolean
    payload?: any
}) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload
        return (
            <div className="bg-background border rounded-md p-2 shadow-sm text-sm">
                <div className="font-medium">{data.name}</div>
                <div className="text-muted-foreground">{data.value}% allocation</div>
            </div>
        )
    }
    return null
}

export function StrategyAssetsCard({ strategy }: { strategy: any }) {
    const assets = strategy.configuration.assets ?? []

    const pieData = assets.map((asset: any) => ({
        name: `${asset.symbol} (${asset.direction})`,
        value: asset.weight,
    }))

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                    <Coins className="h-5 w-5" />
                    Assets
                </CardTitle>
            </CardHeader>

            <CardContent>
                {assets.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                        <p>No assets configured</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left: Asset List */}
                        <div className="space-y-3">
                            {assets.map((asset: any, index: number) => (
                                <div
                                    key={index}
                                    className="bg-muted/40 p-3 rounded-md flex justify-between items-center"
                                >
                                    <div>
                                        <div className="font-medium">{asset.symbol}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {asset.direction} • {asset.weight}%
                                        </div>
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className={getStatusColorClass(strategy.status)}
                                    >
                                        {strategy.status === "live"
                                            ? "Live"
                                            : strategy.status === "paper"
                                                ? "Paper"
                                                : "Configured"}
                                    </Badge>
                                </div>
                            ))}
                        </div>

                        {/* Right: Pie Chart */}
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        dataKey="value"
                                        nameKey="name"
                                        innerRadius={50}
                                        outerRadius={80}
                                        labelLine={false}
                                        isAnimationActive={false}
                                    >
                                        {pieData.map((_, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={COLORS[index % COLORS.length]}
                                            />
                                        ))}
                                        <LabelList
                                            dataKey="value"
                                            position="inside"
                                            formatter={(val: number) => `${val}%`}
                                            fill="#fff"
                                            fontSize={12}
                                        />
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}