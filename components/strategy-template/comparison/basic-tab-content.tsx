"use client";

import {
    ResponsiveContainer,
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    BarChart,
    Bar,
    Cell,
    ScatterChart,
    Scatter,
    ZAxis,
    Area,
    AreaChart
} from "recharts";

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import { Award, History } from "lucide-react";
import { cn } from "@/lib/utils";
import ParametersTable from "@/components/strategy-builder/strategy-dynamic-parameters-table";
import { useState } from "react";
import { format } from "date-fns";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

const ChartCard = ({ title, height = 260, footer, children }) => (
    <Card className="h-full flex flex-col">
        <CardHeader>
            <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
            <ResponsiveContainer width="100%" height={height}>
                {children}
            </ResponsiveContainer>
        </CardContent>
        {footer && <CardFooter className="text-sm text-muted-foreground">{footer}</CardFooter>}
    </Card>
);

export default function BasicTabContent({ selected, runs, lineData, monthlyData, scatter, pareto, palette, metricsTableData, bestValues, runsToParameters, strategyKey }) {

    const [highlightedRunIds, setHighlightedRunIds] = useState<number[]>([])

    const effectiveSelected = selected.length === 0 ? [1] : selected;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ChartCard title="Equity Curve" footer={null}>
                    <LineChart data={lineData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={true} tickFormatter={(str) => format(new Date(str), "MM/dd")}
                        />
                        <YAxis width={60} />
                        <Tooltip />
                        <Legend />
                        {effectiveSelected.map((id, idx) => (
                            <Line
                                key={id}
                                type="monotone"
                                dot={false}
                                dataKey={`run${id}`}
                                name={`Run ${id}`}
                                connectNulls={true}
                                stroke={palette[idx % palette.length]}
                            />
                        ))}
                    </LineChart>
                </ChartCard>


                {/* <ChartContainer
                    config={Object.fromEntries(
                        effectiveSelected.map((id, idx) => [
                            `run${id}`,
                            {
                                label: `Run ${id}`,
                                color: palette[idx % palette.length],
                            },
                        ])
                    )}
                    className="h-full"
                >
                    <ResponsiveContainer width="100%" height={400}>
                        <AreaChart
                            data={lineData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={(str) => format(new Date(str), "MM/dd")}
                            />
                            <YAxis />
                            <Tooltip content={<ChartTooltipContent />} />
                            <Legend />

                            {effectiveSelected.map((id, idx) => (
                                <Area
                                    key={id}
                                    type="monotone"
                                    dataKey={`run${id}`}
                                    name={`Run ${id}`}
                                    stroke={palette[idx % palette.length]}
                                    fill={palette[idx % palette.length]}
                                    fillOpacity={0.2}
                                    strokeWidth={2}
                                    dot={false}
                                />
                            ))}
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartContainer> */}


                <ChartCard title="Monthly Return (%)" footer={null}>
                    <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" tickFormatter={(str) => format(new Date(str), "MM/dd/yyyy")}
                        />
                        <YAxis width={60} />
                        <Tooltip />
                        <Legend />
                        {effectiveSelected.map((id, idx) => (
                            <Bar
                                key={id}
                                dataKey={`run${id}`}
                                name={`Run ${id}`}
                                fill={palette[idx % palette.length]}
                            >
                                {monthlyData.map((row, i) => (
                                    <Cell
                                        key={i}
                                        fill={(row[`run${id}`] ?? 0) >= 0 ? palette[idx % palette.length] : "#ef4444"}
                                    />
                                ))}
                            </Bar>
                        ))}
                    </BarChart>
                </ChartCard>


                <ParametersTable
                    selected={selected}
                    runsToParameters={runsToParameters}
                    strategyKey={strategyKey}
                    highlightedRunIds={highlightedRunIds}
                />

                <Card className="h-full flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Award className="h-5 w-5" />
                            Risk-Adjusted Performance Metrics
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="text-xs" >
                                        <TableHead className="w-[80px]">Run</TableHead>
                                        <TableHead>Return (%)</TableHead>
                                        <TableHead>Max Drawdown (%)</TableHead>
                                        <TableHead>Sharpe</TableHead>
                                        <TableHead>Calmar</TableHead>
                                        <TableHead>Sortino</TableHead>
                                        <TableHead>Win Rate (%)</TableHead>
                                        <TableHead>Profit Factor</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {metricsTableData.map(m => (
                                        <TableRow key={m.id} onClick={() => {
                                            setHighlightedRunIds(prev =>
                                                prev.includes(m.id)
                                                    ? prev.filter(id => id !== m.id)  // remove if already selected
                                                    : [...prev, m.id]                 // add if not selected
                                            )
                                        }} className={cn(
                                            "cursor-pointer",
                                            highlightedRunIds.includes(m.id) && "bg-muted/50"
                                        )}>
                                            <TableCell className="font-medium">{m.id}</TableCell>
                                            <TableCell className={cn(bestValues.strategyReturn === m.strategyReturn && "font-semibold text-green-600")}>{m.strategyReturn}</TableCell>
                                            <TableCell className={cn(bestValues.maxDrawdown === m.maxDrawdown && "font-semibold text-green-600")}>{m.maxDrawdown}</TableCell>
                                            <TableCell className={cn(bestValues.sharpeRatio === m.sharpeRatio && "font-semibold text-green-600")}>{m.sharpeRatio}</TableCell>
                                            <TableCell className={cn(bestValues.calmarRatio === m.calmarRatio && "font-semibold text-green-600")}>{m.calmarRatio}</TableCell>
                                            <TableCell className={cn(bestValues.sortinoRatio === m.sortinoRatio && "font-semibold text-green-600")}>{m.sortinoRatio}</TableCell>
                                            <TableCell className={cn(bestValues.winRate === m.winRate && "font-semibold text-green-600")}>{m.winRate}</TableCell>
                                            <TableCell className={cn(bestValues.profitFactor === m.profitFactor && "font-semibold text-green-600")}>{m.profitFactor}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                    <CardFooter className="text-sm text-muted-foreground">
                        {metricsTableData.length > 1
                            ? "Best values highlighted in green (lower is better for drawdown)"
                            : "Select multiple runs to compare metrics"}
                    </CardFooter>
                </Card>



            </div>


        </div>
    );
}
