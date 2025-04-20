"use client"
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, BarChart, Bar } from 'recharts';

// Sample backtest results (in a real app, these would come from an API)
const strategies = [
    {
        id: "1",
        name: "Moving Average Crossover",
        timeframe: "1h",
        data: {
            params: {
                fastPeriod: 10,
                slowPeriod: 30,
                entryThreshold: 1,
                exitThreshold: 0.5,
                stopLoss: 0.05,
                takeProfit: 0.1,
                riskPerTrade: 0.02,
                positionSize: 0.3,
                maxConcurrentPositions: 1,
                slippage: 0.001,
                commission: 0.0005,
                entryDelay: 1,
                minHoldingPeriod: 3,
                maxHoldingPeriod: 10
            },
            metrics: {
                strategyReturn: 3.01,
                maxDrawdown: 6.31,
                winRate: 50,
                sharpeRatio: -3.94,
                totalTrades: 30
            },
            monthlyReturns: [
                { month: "2025-02", strategyReturn: 4.33 },
                { month: "2025-03", strategyReturn: 5.71 },
                { month: "2025-04", strategyReturn: 0.78 }
            ],
            balances: [
                { date: "2025-02-08T00:00:00+00:00", balance: 99855072.89, trades: 1 },
                { date: "2025-02-18T00:00:00+00:00", balance: 98042800.74, trades: 1 },
                { date: "2025-02-28T00:00:00+00:00", balance: 104181234.05, trades: 1 },
                { date: "2025-03-10T00:00:00+00:00", balance: 100610778.67, trades: 1 },
                { date: "2025-03-20T00:00:00+00:00", balance: 102245199.01, trades: 1 },
                { date: "2025-03-30T00:00:00+00:00", balance: 104133786.82, trades: 1 },
                { date: "2025-04-07T00:00:00+00:00", balance: 103011637.96, trades: 1 }
            ]
        }
    },
    {
        id: "2",
        name: "RSI Mean Reversion",
        timeframe: "1h",
        data: {
            params: {
                rsiPeriod: 14,
                oversoldThreshold: 30,
                overboughtThreshold: 70,
                stopLoss: 0.03,
                takeProfit: 0.07,
                riskPerTrade: 0.01,
                positionSize: 0.2,
                maxConcurrentPositions: 2
            },
            metrics: {
                strategyReturn: 2.45,
                maxDrawdown: 4.15,
                winRate: 58,
                sharpeRatio: 1.12,
                totalTrades: 42
            },
            monthlyReturns: [
                { month: "2025-02", strategyReturn: 2.16 },
                { month: "2025-03", strategyReturn: 3.24 },
                { month: "2025-04", strategyReturn: 0.94 }
            ],
            balances: [
                { date: "2025-02-08T00:00:00+00:00", balance: 100215000, trades: 1 },
                { date: "2025-02-18T00:00:00+00:00", balance: 101340000, trades: 1 },
                { date: "2025-02-28T00:00:00+00:00", balance: 102160000, trades: 1 },
                { date: "2025-03-10T00:00:00+00:00", balance: 103250000, trades: 1 },
                { date: "2025-03-20T00:00:00+00:00", balance: 104100000, trades: 1 },
                { date: "2025-03-30T00:00:00+00:00", balance: 105240000, trades: 1 },
                { date: "2025-04-07T00:00:00+00:00", balance: 102450000, trades: 1 }
            ]
        }
    },
    {
        id: "3",
        name: "Bollinger Bands Strategy",
        timeframe: "1h",
        data: {
            params: {
                period: 20,
                deviations: 2,
                stopLoss: 0.04,
                takeProfit: 0.08,
                riskPerTrade: 0.015,
                positionSize: 0.25
            },
            metrics: {
                strategyReturn: 1.84,
                maxDrawdown: 3.21,
                winRate: 62,
                sharpeRatio: 1.76,
                totalTrades: 38
            },
            monthlyReturns: [
                { month: "2025-02", strategyReturn: 1.21 },
                { month: "2025-03", strategyReturn: 2.34 },
                { month: "2025-04", strategyReturn: 0.63 }
            ],
            balances: [
                { date: "2025-02-08T00:00:00+00:00", balance: 100124000, trades: 1 },
                { date: "2025-02-18T00:00:00+00:00", balance: 100563000, trades: 1 },
                { date: "2025-02-28T00:00:00+00:00", balance: 101210000, trades: 1 },
                { date: "2025-03-10T00:00:00+00:00", balance: 102145000, trades: 1 },
                { date: "2025-03-20T00:00:00+00:00", balance: 102870000, trades: 1 },
                { date: "2025-03-30T00:00:00+00:00", balance: 103440000, trades: 1 },
                { date: "2025-04-07T00:00:00+00:00", balance: 101840000, trades: 1 }
            ]
        }
    },
    {
        id: "4",
        name: "MACD Strategy",
        timeframe: "1h",
        data: {
            params: {
                fastEMA: 12,
                slowEMA: 26,
                signalEMA: 9,
                stopLoss: 0.06,
                takeProfit: 0.12,
                riskPerTrade: 0.02,
                positionSize: 0.3
            },
            metrics: {
                strategyReturn: 4.12,
                maxDrawdown: 8.75,
                winRate: 46,
                sharpeRatio: -0.84,
                totalTrades: 25
            },
            monthlyReturns: [
                { month: "2025-02", strategyReturn: 5.32 },
                { month: "2025-03", strategyReturn: -1.64 },
                { month: "2025-04", strategyReturn: 3.15 }
            ],
            balances: [
                { date: "2025-02-08T00:00:00+00:00", balance: 101580000, trades: 1 },
                { date: "2025-02-18T00:00:00+00:00", balance: 103270000, trades: 1 },
                { date: "2025-02-28T00:00:00+00:00", balance: 105320000, trades: 1 },
                { date: "2025-03-10T00:00:00+00:00", balance: 104560000, trades: 1 },
                { date: "2025-03-20T00:00:00+00:00", balance: 103240000, trades: 1 },
                { date: "2025-03-30T00:00:00+00:00", balance: 103580000, trades: 1 },
                { date: "2025-04-07T00:00:00+00:00", balance: 104120000, trades: 1 }
            ]
        }
    },
    {
        id: "5",
        name: "Ichimoku Cloud",
        timeframe: "1h",
        data: {
            params: {
                conversionPeriod: 9,
                basePeriod: 26,
                spanPeriod: 52,
                displacement: 26,
                stopLoss: 0.05,
                takeProfit: 0.1
            },
            metrics: {
                strategyReturn: 2.68,
                maxDrawdown: 3.92,
                winRate: 55,
                sharpeRatio: 1.35,
                totalTrades: 32
            },
            monthlyReturns: [
                { month: "2025-02", strategyReturn: 1.87 },
                { month: "2025-03", strategyReturn: 2.43 },
                { month: "2025-04", strategyReturn: 0.82 }
            ],
            balances: [
                { date: "2025-02-08T00:00:00+00:00", balance: 100354000, trades: 1 },
                { date: "2025-02-18T00:00:00+00:00", balance: 101123000, trades: 1 },
                { date: "2025-02-28T00:00:00+00:00", balance: 101870000, trades: 1 },
                { date: "2025-03-10T00:00:00+00:00", balance: 102540000, trades: 1 },
                { date: "2025-03-20T00:00:00+00:00", balance: 103125000, trades: 1 },
                { date: "2025-03-30T00:00:00+00:00", balance: 104300000, trades: 1 },
                { date: "2025-04-07T00:00:00+00:00", balance: 102680000, trades: 1 }
            ]
        }
    }
];

// Generate data for Pareto frontier
const generateParetoFrontier = (strategies) => {
    // Extract return and drawdown for each strategy
    const points = strategies.map(strategy => ({
        id: strategy.id,
        name: strategy.name,
        return: strategy.data.metrics.strategyReturn,
        drawdown: strategy.data.metrics.maxDrawdown,
        sharpe: strategy.data.metrics.sharpeRatio,
        winRate: strategy.data.metrics.winRate
    }));

    // Sort by return (descending)
    points.sort((a, b) => b.return - a.return);

    // Find the Pareto frontier
    const paretoFrontier = [];
    let minDrawdown = Infinity;

    for (const point of points) {
        if (point.drawdown < minDrawdown) {
            paretoFrontier.push(point);
            minDrawdown = point.drawdown;
        }
    }

    return { points, paretoFrontier };
};

const BacktestComparison = () => {
    const [selectedStrategies, setSelectedStrategies] = useState(["1", "2"]);
    const [paretoData, setParetoData] = useState({ points: [], paretoFrontier: [] });

    useEffect(() => {
        setParetoData(generateParetoFrontier(strategies));
    }, []);

    const handleStrategyToggle = (strategyId) => {
        if (selectedStrategies.includes(strategyId)) {
            setSelectedStrategies(selectedStrategies.filter(id => id !== strategyId));
        } else {
            setSelectedStrategies([...selectedStrategies, strategyId]);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const getStrategyColor = (index) => {
        const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe', '#00C49F'];
        return colors[index % colors.length];
    };

    const selectedStrategiesData = strategies.filter(s => selectedStrategies.includes(s.id));

    // Prepare data for balance chart
    const balanceChartData = [];
    if (selectedStrategiesData.length > 0) {
        const firstStrategy = selectedStrategiesData[0];
        firstStrategy.data.balances.forEach(balance => {
            const dataPoint = {
                date: formatDate(balance.date),
            };

            selectedStrategiesData.forEach(strategy => {
                const matchingBalance = strategy.data.balances.find(b =>
                    new Date(b.date).getTime() === new Date(balance.date).getTime()
                );
                if (matchingBalance) {
                    // Normalize to percentage change from initial
                    const initialBalance = strategy.data.balances[0].balance;
                    const percentChange = ((matchingBalance.balance / initialBalance) - 1) * 100;
                    dataPoint[strategy.name] = Number(percentChange.toFixed(2));
                }
            });

            balanceChartData.push(dataPoint);
        });
    }

    // Prepare data for monthly returns chart
    const monthlyReturnsData = [];
    if (selectedStrategiesData.length > 0) {
        const allMonths = [...new Set(selectedStrategiesData.flatMap(s => s.data.monthlyReturns.map(r => r.month)))];
        allMonths.sort();

        allMonths.forEach(month => {
            const dataPoint = {
                month: month.substring(5) + '/' + month.substring(0, 4),
            };

            selectedStrategiesData.forEach(strategy => {
                const monthlyReturn = strategy.data.monthlyReturns.find(r => r.month === month);
                if (monthlyReturn) {
                    dataPoint[strategy.name] = Number((monthlyReturn.strategyReturn).toFixed(2));
                }
            });

            monthlyReturnsData.push(dataPoint);
        });
    }

    return (
        <div className="flex flex-col w-full p-4 space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Quantitative Trading Backtest Comparison</h1>
                <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Date:</span>
                    <span className="text-sm">April 18, 2025</span>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-1/4">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>Select Strategies</CardTitle>
                            <CardDescription>Choose strategies to compare</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col space-y-2">
                                {strategies.map((strategy) => (
                                    <div key={strategy.id} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id={`strategy-${strategy.id}`}
                                            checked={selectedStrategies.includes(strategy.id)}
                                            onChange={() => handleStrategyToggle(strategy.id)}
                                            className="w-4 h-4"
                                        />
                                        <label htmlFor={`strategy-${strategy.id}`} className="text-sm font-medium">
                                            {strategy.name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter>
                            <div className="text-xs text-gray-500">
                                {selectedStrategies.length} strategies selected
                            </div>
                        </CardFooter>
                    </Card>
                </div>

                <div className="w-full md:w-3/4">
                    <Tabs defaultValue="summary">
                        <TabsList className="mb-4">
                            <TabsTrigger value="summary">Summary</TabsTrigger>
                            <TabsTrigger value="performance">Performance</TabsTrigger>
                            <TabsTrigger value="pareto">Pareto Analysis</TabsTrigger>
                            <TabsTrigger value="parameters">Parameters</TabsTrigger>
                        </TabsList>

                        <TabsContent value="summary">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Key Metrics Comparison</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full">
                                                <thead>
                                                    <tr>
                                                        <th className="text-left py-2">Strategy</th>
                                                        <th className="text-right py-2">Return (%)</th>
                                                        <th className="text-right py-2">Drawdown (%)</th>
                                                        <th className="text-right py-2">Win Rate (%)</th>
                                                        <th className="text-right py-2">Sharpe</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {selectedStrategiesData.map((strategy, index) => (
                                                        <tr key={strategy.id} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                                                            <td className="py-2">
                                                                <div className="flex items-center">
                                                                    <div className="w-3 h-3 mr-2" style={{ backgroundColor: getStrategyColor(index) }}></div>
                                                                    {strategy.name}
                                                                </div>
                                                            </td>
                                                            <td className="text-right py-2">{strategy.data.metrics.strategyReturn.toFixed(2)}</td>
                                                            <td className="text-right py-2">{strategy.data.metrics.maxDrawdown.toFixed(2)}</td>
                                                            <td className="text-right py-2">{strategy.data.metrics.winRate}</td>
                                                            <td className="text-right py-2">{strategy.data.metrics.sharpeRatio.toFixed(2)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Monthly Returns (%)</CardTitle>
                                    </CardHeader>
                                    <CardContent className="h-72">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={monthlyReturnsData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="month" />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                {selectedStrategiesData.map((strategy, index) => (
                                                    <Bar
                                                        key={strategy.id}
                                                        dataKey={strategy.name}
                                                        fill={getStrategyColor(index)}
                                                    />
                                                ))}
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="performance">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Equity Curve (% Change)</CardTitle>
                                </CardHeader>
                                <CardContent className="h-96">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={balanceChartData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            {selectedStrategiesData.map((strategy, index) => (
                                                <Line
                                                    key={strategy.id}
                                                    type="monotone"
                                                    dataKey={strategy.name}
                                                    stroke={getStrategyColor(index)}
                                                    activeDot={{ r: 8 }}
                                                />
                                            ))}
                                        </LineChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="pareto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Return vs. Drawdown</CardTitle>
                                        <CardDescription>Pareto frontier analysis</CardDescription>
                                    </CardHeader>
                                    <CardContent className="h-96">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <ScatterChart>
                                                <CartesianGrid />
                                                <XAxis
                                                    type="number"
                                                    dataKey="drawdown"
                                                    name="Max Drawdown (%)"
                                                    label={{ value: "Max Drawdown (%)", position: "bottom", offset: 0 }}
                                                />
                                                <YAxis
                                                    type="number"
                                                    dataKey="return"
                                                    name="Return (%)"
                                                    label={{ value: "Return (%)", angle: -90, position: "left" }}
                                                />
                                                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                                <Legend />
                                                <Scatter
                                                    name="All Strategies"
                                                    data={paretoData.points}
                                                    fill="#8884d8"
                                                />
                                                <Scatter
                                                    name="Pareto Optimal"
                                                    data={paretoData.paretoFrontier}
                                                    fill="#ff7300"
                                                    shape="star"
                                                />
                                            </ScatterChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Pareto Optimal Strategies</CardTitle>
                                        <CardDescription>Best risk-return tradeoffs</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {paretoData.paretoFrontier.map((strategy) => (
                                                <div key={strategy.id} className="border rounded-lg p-4">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <h3 className="font-bold">{strategy.name}</h3>
                                                        <Badge variant="outline" className="bg-yellow-100">Pareto Optimal</Badge>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                                        <div>Return: <span className="font-medium">{strategy.return.toFixed(2)}%</span></div>
                                                        <div>Drawdown: <span className="font-medium">{strategy.drawdown.toFixed(2)}%</span></div>
                                                        <div>Win Rate: <span className="font-medium">{strategy.winRate}%</span></div>
                                                        <div>Sharpe: <span className="font-medium">{strategy.sharpe.toFixed(2)}</span></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="parameters">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Strategy Parameters</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        {selectedStrategiesData.map((strategy) => (
                                            <div key={strategy.id} className="border rounded-lg p-4">
                                                <h3 className="font-bold mb-2">{strategy.name}</h3>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                    {Object.entries(strategy.data.params).map(([key, value]) => (
                                                        <div key={key} className="text-sm">
                                                            <span className="text-gray-600">{key}: </span>
                                                            <span className="font-medium">{value}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
};

export default BacktestComparison;