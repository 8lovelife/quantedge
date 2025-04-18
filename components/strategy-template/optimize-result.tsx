"use client";

import React, { useMemo, useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ScatterChart, Scatter, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";
import { LineChart as LineChartIcon, Zap } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";


const ParetoTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;

    const p = payload[0].payload;      // 整个点的数据
    return (
        <div className="rounded-md border bg-background p-3 text-xs space-y-1">
            <div><strong>Return:</strong> {p.cagr}%</div>
            <div><strong>Max DD:</strong> {p.dd}%</div>
            <Separator />
            {Object.entries(p.params).map(([k, v]) => (
                <div key={k}>{k}: {v}</div>
            ))}
        </div>
    );
};

// fake data -------------------------------------------------
const fakePareto = [
    { id: "fp5-sp20", cagr: 32.1, maxDD: 10.5 },
    { id: "fp5-sp30", cagr: 28.4, maxDD: 8.9 },
    { id: "fp10-sp30", cagr: 25.0, maxDD: 6.3 },
];

// ---------------------------------------------------------------------------
// 🗂️  Types
// ---------------------------------------------------------------------------
export interface Metrics {
    cagr: number;            // return %
    max_drawdown: number;    // drawdown %
    sharpe: number;
    trades: number;
}

export interface GridEntry {
    id: string;                           // "fp5-sp20"
    params: Record<string, number>;       // { fastPeriod: 5, slowPeriod: 20, ... }
    metrics: Metrics;
    equityCurve: [string, number][];      // [[timestamp, equity], ...]
}

export interface GridResult {
    generatedAt: string;                  // iso date string
    symbol: string;                       // e.g. "BTC/USDT"
    combinations: number;
    leaderboard: GridEntry[];             // 已排序（Return - DD）
    paretoFront: GridEntry[];
    entries: GridEntry[];                 // 全量
}

// ---------------------------------------------------------------------------
// 📈  Helper – build summary cards
// ---------------------------------------------------------------------------
function buildSummaryCards(best: GridEntry) {
    return [
        { label: "Return", value: `${best.metrics.cagr}%`, color: "text-green-500" },
        { label: "Max DD", value: `${best.metrics.max_drawdown}%`, color: "text-red-500" },
        { label: "Sharpe", value: best.metrics.sharpe, color: "" },
        { label: "Trades", value: best.metrics.trades, color: "" }
    ]
}

// ---------------------------------------------------------------------------
// 🖼️  Main Component
// ---------------------------------------------------------------------------
interface Props { data: GridResult }

export default function GridResultPage({ data }: Props) {
    const [selected, setSelected] = useState<GridEntry | null>(null);
    const cards = useMemo(() => buildSummaryCards(data.leaderboard[0]), [data]);
    const [activeTab, setActiveTab] = useState("leaderboard")



    // 转成 Recharts 需要的字段名
    const scatterData = useMemo(
        () => fakePareto.map(p => ({ ...p, dd: p.maxDD })), []
    );
    // const scatterData = useMemo(() =>
    //     data.paretoFront.map(e => ({
    //         id: e.id,
    //         cagr: e.metrics.cagr,
    //         dd: e.metrics.max_drawdown
    //     })), [data]);

    return (
        <div className="space-y-6">
            {/* --- Header Summary ------------------------------------------------ */}
            <Card>
                <CardHeader>
                    <CardTitle>{data.symbol} – MA Grid Search</CardTitle>
                    <CardDescription>{data.combinations} combinations · {new Date(data.generatedAt).toUTCString()}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-4 gap-4 text-center">
                        {cards.map(c => (
                            <div key={c.label} className="bg-muted/40 p-3 rounded-xl">
                                <div className="text-xs text-muted-foreground">{c.label}</div>
                                <div className={cn("text-xl font-bold", c.color)}>{c.value}</div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* --- Tabs ---------------------------------------------------------- */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
                    <TabsTrigger value="pareto">Pareto</TabsTrigger>
                    <TabsTrigger value="entry">All Entries</TabsTrigger>
                </TabsList>

                {/* === Leaderboard =============================================== */}
                <TabsContent value="leaderboard" className="pt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pareto Front</CardTitle>
                            <CardDescription>Return vs. Max Drawdown</CardDescription>
                        </CardHeader>

                        {/* 只有可见时才渲染图表，避免 0 宽高 */}
                        {activeTab === "pareto" && (
                            <CardContent className="overflow-visible">
                                <ResponsiveContainer width="100%" height={400}>
                                    <ScatterChart margin={{ top: 20, right: 30 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            type="number"
                                            dataKey="cagr"
                                            name="Return %"
                                            tickFormatter={(v) => `${v}%`}
                                        />
                                        <YAxis
                                            type="number"
                                            dataKey="dd"
                                            name="Max DD %"
                                            domain={[0, "auto"]}
                                            tickFormatter={(v) => `${v}%`}
                                        />
                                        <ParetoTooltip
                                            formatter={(v: number, n) =>
                                                [`${v}%`, n === "dd" ? "Max DD" : "Return"]
                                            }
                                        />
                                        <Scatter data={scatterData} fill="#6366f1" />
                                    </ScatterChart>
                                </ResponsiveContainer>
                            </CardContent>
                        )}
                    </Card>
                </TabsContent>

                {/* === Pareto Scatter ============================================ */}
                <TabsContent value="pareto" className="pt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pareto Front</CardTitle>
                            <CardDescription>Return vs. Max Drawdown</CardDescription>
                        </CardHeader>
                        <CardContent className="overflow-x-auto">
                            {activeTab === "pareto" && (
                                <ResponsiveContainer width="100%" height={400}>
                                    <ScatterChart margin={{ top: 20, right: 30 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="cagr"
                                            name="Return %"
                                            type="number"
                                            domain={["auto", "auto"]}
                                        />
                                        <YAxis
                                            dataKey="dd"
                                            domain={[0, 'auto']}
                                            tickFormatter={(v) => `${v}%`}
                                        />
                                        <Tooltip formatter={(v: number, n) =>
                                            [`${v}%`, n === "dd" ? "Max DD" : "Return"]
                                        } />
                                        <Scatter
                                            name="Pareto"
                                            data={scatterData}
                                            fill="#6366f1"
                                            onClick={(p) => {
                                                const entry = data.paretoFront.find(e => e.id === p.id)
                                                if (entry) setSelected(entry)
                                            }}
                                        />
                                    </ScatterChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* === All Entries (virtual) ===================================== */}
                <TabsContent value="entry" className="pt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>All Combinations</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground text-sm">⚠️ 这里可以接入 react‑virtual 表格，示例略。</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* --- Drawer : Equity Curve ---------------------------------------- */}
            <Drawer open={!!selected} onOpenChange={() => setSelected(null)}>
                <DrawerContent className="max-w-3xl mx-auto">
                    {selected && (
                        <>
                            <DrawerHeader>
                                <DrawerTitle>Equity Curve – {selected.id}</DrawerTitle>
                                <div className="flex flex-wrap gap-1 pt-2">
                                    {Object.entries(selected.params).map(([k, v]) =>
                                        <Badge key={k} variant="outline">{k}:{v}</Badge>)}
                                </div>
                            </DrawerHeader>
                            <div className="p-6">
                                <LineChart width={700} height={350} data={selected.equityCurve}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="t" hide />
                                    <YAxis domain={["auto", "auto"]} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="cum" strokeWidth={2} dot={false} />
                                </LineChart>
                            </div>
                        </>
                    )}
                </DrawerContent>
            </Drawer>
        </div>
    );
}
