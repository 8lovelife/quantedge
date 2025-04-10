// strategy-type-selector.tsx – restore Custom dialog content + working Cancel
"use client"

import React, { memo, useState } from "react"
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

type StrategyType = "mean-reversion" | "breakout" | "rsi" | "macd" | "custom"

interface Strategy {
    id: StrategyType
    title: string
    desc: string
    icon: React.ReactNode
    info: React.ReactNode
}

/* built‑in strategies */
const STRATEGIES: Strategy[] = [
    {
        id: "mean-reversion",
        title: "Mean Reversion",
        desc: "Price returns to historical average",
        icon: <ArrowDownUp className="h-5 w-5" />,
        info: (
            <p>
                Mean‑reversion trades deviations from a moving average and expects a
                snap‑back to the mean.
            </p>
        ),
    },
    {
        id: "breakout",
        title: "Breakout",
        desc: "Breaks support / resistance",
        icon: <TrendingUp className="h-5 w-5" />,
        info: <p>Breakout strategy details…</p>,
    },
    {
        id: "rsi",
        title: "RSI",
        desc: "Relative Strength Index",
        icon: <Activity className="h-5 w-5" />,
        info: <p>RSI strategy details…</p>,
    },
    {
        id: "macd",
        title: "MACD",
        desc: "MA Convergence Divergence",
        icon: <LineChart className="h-5 w-5" />,
        info: <p>MACD strategy details…</p>,
    },
]

/* memoized card */
const StrategyCard = memo(function StrategyCard({
    s,
    selected,
    onSelect,
    onInfo,
}: {
    s: Strategy
    selected: boolean
    onSelect: (id: StrategyType) => void
    onInfo: () => void
}) {
    return (
        <div
            onClick={() => onSelect(s.id)}
            className={`flex items-center gap-3 rounded-md border p-3 cursor-pointer transition ${selected ? "border-primary bg-primary/5" : "border-input"
                }`}
        >
            {s.icon}
            <div className="flex-1">
                <Label className="font-medium">{s.title}</Label>
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
}: {
    value: StrategyType
    onChange: (v: StrategyType) => void
}) {
    /* info dialog */
    const [infoOpen, setInfoOpen] = useState(false)
    const [infoId, setInfoId] = useState<StrategyType>("mean-reversion")
    const currentInfo = STRATEGIES.find((s) => s.id === infoId)!

    /* custom dialog */
    const [customOpen, setCustomOpen] = useState(false)

    return (
        <>
            <RadioGroup
                value={value}
                onValueChange={(v) => onChange(v as StrategyType)}
                className="grid gap-3"
            >
                {/* built‑in */}
                {STRATEGIES.map((s) => (
                    <StrategyCard
                        key={s.id}
                        s={s}
                        selected={value === s.id}
                        onSelect={onChange}
                        onInfo={() => {
                            setInfoId(s.id)
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
            {/* <Dialog open={infoOpen} onOpenChange={setInfoOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{currentInfo.title} Strategy</DialogTitle>
                        <DialogDescription>{currentInfo.desc}</DialogDescription>
                    </DialogHeader>
                    <CardContent className="space-y-4">{currentInfo.info}</CardContent>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setInfoOpen(false)}>
                            Close
                        </Button>
                        <Button
                            onClick={() => {
                                onChange(currentInfo.id)
                                setInfoOpen(false)
                            }}
                        >
                            Select This Strategy
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog> */}
        </>
    )
}
