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
import { AlgorithmOption, StrategyTemplate } from "@/lib/api/algorithms"
import { cn } from "@/lib/utils"

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
    isEditMode
}: {
    s: StrategyTemplate
    selected: boolean
    onSelect: (id: string) => void
    onInfo: () => void
    isEditMode: boolean
}) {

    const icon = strategyIconMap[s.type] || <BarChart3 className="h-5 w-5" /> // fallback icon

    return (
        <div
            onClick={() => !isEditMode && onSelect(s.type)}
            className={cn(
                "flex items-center gap-3 rounded-md border p-3 transition",
                selected ? "border-primary bg-primary/5" : "border-input",
                !isEditMode && "cursor-pointer",
                isEditMode && !selected && "opacity-50 cursor-not-allowed"
            )}
        >
            {icon}
            <div className="flex-1">
                <Label className="font-medium">{s.name}</Label>
                <p className="text-xs text-muted-foreground">{s.description}</p>
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
    strategyTemplates,
    isEditMode = false,
}: {
    value: string
    onChange: (v: string) => void
    strategyTemplates: StrategyTemplate[]
    isEditMode

}) {

    /* custom dialog */
    const [customOpen, setCustomOpen] = useState(false)
    /* info dialog */
    const [infoOpen, setInfoOpen] = useState(false)
    const [infoId, setInfoId] = useState<string | null>(null)

    useEffect(() => {
        if (strategyTemplates.length > 0 && !infoId) {
            setInfoId(strategyTemplates[0].type) // use the first strategy as default
        }
    }, [strategyTemplates, infoId])


    const currentInfo = strategyTemplates.find((s) => s.type === infoId)!


    return (
        <>
            <RadioGroup
                value={value}
                onValueChange={(v) => onChange(v)}
                className="grid gap-3"
            >
                {/* built‑in */}
                {strategyTemplates.map((s) => (
                    <StrategyCard
                        key={s.type}
                        s={s}
                        selected={value === s.type}
                        onSelect={onChange}
                        isEditMode={isEditMode}
                        onInfo={() => {
                            setInfoId(s.type)
                            setInfoOpen(true)
                        }}
                    />
                ))}

            </RadioGroup>

            {/* info dialog */}

            {currentInfo && (
                <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>{currentInfo.name} Strategy</DialogTitle>
                            <DialogDescription>{currentInfo.description}</DialogDescription>
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
                                    onChange(currentInfo.type)
                                    setInfoOpen(false)
                                }}
                            >
                                Select This Strategy
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {isEditMode && (
                <div className="mt-4 rounded-md bg-muted/50 p-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                        <Info className="h-4 w-4 mr-2" />
                        Strategy type cannot be changed after creation to maintain parameter consistency.
                    </div>
                </div>
            )}
        </>
    )
}
