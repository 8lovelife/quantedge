import {
    LineChart, Line,
    CartesianGrid, XAxis, YAxis, Tooltip, Legend,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
    ScatterChart,
    ZAxis,
    Scatter,
    ResponsiveContainer
} from "recharts"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Award, Gauge, History } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"


const ChartCard = ({ title, height = 260, footer, children }) => (
    <Card className="h-full flex flex-col">
        <CardHeader>
            <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
            <div style={{ height }}>
                {children}
            </div>
        </CardContent>
        {footer && <CardFooter className="text-sm text-muted-foreground">{footer}</CardFooter>}
    </Card>
)

const AdvancedTabContent = ({ selected, runs, drawdownData, radarData, winLossData, metricsTableData, bestValues, palette, formatMetric, scatter, pareto }) => {

    console.log("advencedScatter Data", scatter)

    const effectiveSelected = selected.length === 0 ? [1] : selected

    const formatCamelCase = (s: string) =>
        s.replace(/([A-Z])/g, " $1").replace(/^./, c => c.toUpperCase())

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ChartCard
                    title={<div className="flex items-center gap-2"><Gauge className="h-5 w-5" />Strategy Metrics Comparison</div>}
                    height={300}
                    footer="Higher values are better for all metrics (drawdown is inverted)"
                >

                    <ResponsiveContainer width="100%" height={300}>
                        <RadarChart outerRadius={90} data={radarData} >
                            <PolarGrid />
                            <PolarAngleAxis
                                dataKey="metric"
                                tickFormatter={formatCamelCase}
                            />                            <PolarRadiusAxis domain={[0, 100]} tick={false} />
                            {/* <Tooltip formatter={(value) => [`${Math.round(value)}%`, 'Score']} /> */}
                            <Tooltip
                                formatter={(value: number, dataKey: string) => {
                                    return [`${Math.round(value)}%`, dataKey.replace("run", "Run ")]
                                }}
                                labelFormatter={(label) => formatCamelCase(label)}
                            />
                            <Legend />

                            {effectiveSelected.map((id, idx) => (
                                <Radar
                                    key={id}
                                    name={`Run ${id}`}
                                    dataKey={`run${id}`}
                                    stroke={palette[idx % palette.length]}
                                    fill={palette[idx % palette.length]}
                                    fillOpacity={0.2}
                                />
                            ))}
                        </RadarChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard
                    title="Drawdown Comparison (%)"
                    footer="Lower values indicate less risk exposure"
                >
                    <ResponsiveContainer width="100%" height={300}>

                        <LineChart data={drawdownData} >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" tick={true}
                                tickFormatter={(str) => format(new Date(str), "MM/dd/yyyy")}
                            />
                            <YAxis width={60} domain={[0, 'auto']} />
                            {/* <Tooltip formatter={(value) => [`${value}%`, 'Drawdown']} /> */}
                            <Tooltip />

                            <Legend />
                            {effectiveSelected.map((id, idx) => (
                                <Line
                                    key={id}
                                    type="monotone"
                                    dot={false}
                                    dataKey={`run${id}`}
                                    name={`Run ${id}`}
                                    stroke={palette[idx % palette.length]}
                                    strokeWidth={1.5}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            <ChartCard
                title="Return vs Drawdown (Pareto)"
                height={320}
                footer={
                    <div className="flex flex-col items-start space-y-1">
                        <div>
                            <History className="h-4 w-4 inline mr-1" />
                            {effectiveSelected.length} runs · {pareto.length} Pareto-optimal
                        </div>
                        <div className="text-xs text-muted-foreground leading-snug">
                            The Pareto frontier represents the optimal set of parameters<br />
                            where no other parameter set is better in all metrics.
                        </div>
                    </div>
                }
            >
                <div className="w-full max-w-full overflow-hidden">
                    <ResponsiveContainer width="100%" height={300}>
                        <ScatterChart>
                            <CartesianGrid />
                            <XAxis type="number" dataKey="dd" name="Max DD" unit="%" />
                            <YAxis type="number" dataKey="ret" name="Return" unit="%" />
                            <ZAxis range={[50, 150]} />
                            <Tooltip formatter={(v) => v + "%"} />
                            <Scatter
                                data={scatter}
                                shape={({ cx, cy, payload }) => (
                                    <circle cx={cx} cy={cy} r={10} fill={payload.color} />
                                )}
                            />
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>
            </ChartCard>

        </div>
    )
}

export default AdvancedTabContent
