// strategy-type-selector.tsx – restore Custom dialog content + working Cancel
"use client"

import React, { JSX, memo, useEffect, useState } from "react"
import {
    RadioGroup,
    RadioGroupItem,
} from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import {
    Card,
    CardHeader,
    CardContent,
    CardTitle,
    CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    TrendingUp,
    ArrowDownUp,
    LineChart,
    Activity,
    Info,
    Plus,
    Signal,
    Zap,
    BarChart3,
} from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { string } from "zod"
import { AlgorithmOption } from "@/lib/api/algorithms"

type StrategyType = "mean-reversion" | "breakout" | "rsi" | "macd" | "custom"

interface Strategy {
    id: StrategyType
    title: string
    desc: string
    info: string
}

/* built‑in strategies */
const STRATEGIES: Strategy[] = [
    {
        id: "mean-reversion",
        title: "Mean Reversion",
        desc: "Price returns to historical average",
        info: "Mean‑reversion trades deviations from a moving average and expects a snap‑back to the mean."
    },
    {
        id: "breakout",
        title: "Breakout",
        desc: "Breaks support / resistance",
        info: "Breakout strategy details...",
    },
    {
        id: "rsi",
        title: "RSI",
        desc: "Relative Strength Index",
        info: "RSI strategy details…",
    },
    {
        id: "macd",
        title: "MACD",
        desc: "MA Convergence Divergence",
        info: "MACD strategy details…",
    },
]

const strategyIconMap: Record<string, JSX.Element> = {
    "mean-reversion": <ArrowDownUp className="h-5 w-5" />,
    "breakout": <TrendingUp className="h-5 w-5" />,
    "rsi": <Activity className="h-5 w-5" />,
    "macd": <LineChart className="h-5 w-5" />,
    "momentum": <Signal className="h-5 w-5" />,
    "custom": <Zap className="h-5 w-5" />,
}

/* memoized card */
const StrategyCard = memo(function StrategyCard({
    s,
    selected,
    onSelect,
    onInfo,
}: {
    s: AlgorithmOption
    selected: boolean
    onSelect: (id: string) => void
    onInfo: () => void
}) {

    const icon = strategyIconMap[s.value] || <BarChart3 className="h-5 w-5" /> // fallback icon

    return (
        <div
            onClick={() => onSelect(s.value)}
            className={`flex items-center gap-3 rounded-md border p-3 cursor-pointer transition ${selected ? "border-primary bg-primary/5" : "border-input"
                }`}
        >
            {icon}
            <div className="flex-1">
                <Label className="font-medium">{s.label}</Label>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
            </div>
            <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => {
                    e.stopPropagation()
                    onInfo()
                }}
            >
                <Info className="h-4 w-4" />
            </Button>
        </div>
    )
})

export default function StrategyTypeSelector({
    value,
    onChange,
    strategies,
}: {
    value: string
    onChange: (v: string) => void
    strategies: AlgorithmOption[]
}) {

    /* custom dialog */
    const [customOpen, setCustomOpen] = useState(false)
    /* info dialog */
    const [infoOpen, setInfoOpen] = useState(false)
    const [infoId, setInfoId] = useState<string | null>(null)

    useEffect(() => {
        if (strategies.length > 0 && !infoId) {
            setInfoId(strategies[0].value) // use the first strategy as default
        }
    }, [strategies, infoId])


    const currentInfo = strategies.find((s) => s.value === infoId)!


    return (
        <>
            <RadioGroup
                value={value}
                onValueChange={(v) => onChange(v)}
                className="grid gap-3"
            >
                {/* built‑in */}
                {strategies.map((s) => (
                    <StrategyCard
                        key={s.value}
                        s={s}
                        selected={value === s.value}
                        onSelect={onChange}
                        onInfo={() => {
                            setInfoId(s.value)
                            setInfoOpen(true)
                        }}
                    />
                ))}

                {/* custom */}
                {/* <Dialog open={customOpen} onOpenChange={setCustomOpen}>
                    <DialogTrigger asChild>
                        <div
                            className={`flex items-center gap-3 rounded-md border p-3 cursor-pointer transition ${value === "custom"
                                ? "border-primary bg-primary/5"
                                : "border-dashed hover:border-primary"
                                }`}
                            onClick={() => onChange("custom")}
                        >
                            <Plus className="h-5 w-5 text-muted-foreground" />
                            <div className="flex-1">
                                <Label className="font-medium">Create Custom Strategy</Label>
                                <p className="text-xs text-muted-foreground">
                                    Combine indicators & conditions
                                </p>
                            </div>
                        </div>
                    </DialogTrigger> */}

                {/* <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Create Custom Strategy</DialogTitle>
                            <DialogDescription>
                                Build a custom strategy by combining multiple indicators and
                                conditions.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-2">
                            <div className="space-y-1">
                                <Label>Name</Label>
                                <Input placeholder="My Custom Strategy" />
                            </div>

                            <Tabs defaultValue="indicators">
                                <TabsList className="grid grid-cols-3 w-full">
                                    <TabsTrigger value="indicators">Indicators</TabsTrigger>
                                    <TabsTrigger value="conditions">Conditions</TabsTrigger>
                                    <TabsTrigger value="filters">Filters</TabsTrigger>
                                </TabsList>

                                <TabsContent value="indicators" className="pt-4">
                                    <p className="text-sm text-muted-foreground">
                                        (Indicator picker UI here)
                                    </p>
                                </TabsContent>

                                <TabsContent value="conditions" className="pt-4">
                                    <p className="text-sm text-muted-foreground">
                                        (Conditions builder UI here)
                                    </p>
                                </TabsContent>

                                <TabsContent value="filters" className="pt-4">
                                    <p className="text-sm text-muted-foreground">
                                        (Filters UI here)
                                    </p>
                                </TabsContent>
                            </Tabs>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setCustomOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={() => {
                                    onChange("custom")
                                    setCustomOpen(false)
                                }}
                            >
                                Create Strategy
                            </Button>
                        </DialogFooter>
                    </DialogContent> */}
                {/* </Dialog> */}
            </RadioGroup>

            {/* info dialog */}

            {currentInfo && (
                <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>{currentInfo.label} Strategy</DialogTitle>
                            <DialogDescription>{currentInfo.desc}</DialogDescription>
                        </DialogHeader>
                        <CardContent className="space-y-4">
                            <p>{currentInfo.info}</p>
                        </CardContent>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setInfoOpen(false)}>
                                Close
                            </Button>
                            <Button
                                onClick={() => {
                                    onChange(currentInfo.value)
                                    setInfoOpen(false)
                                }}
                            >
                                Select This Strategy
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </>
    )
}
