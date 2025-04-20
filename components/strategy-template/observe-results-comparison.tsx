"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsItem, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from 'recharts';
import { AlertCircle, Check, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Sample data for multiple strategies with different parameters
const exampleData = {
    "strategy1": {
        "params": {
            "fastPeriod": 10,
            "slowPeriod": 30,
            "entryThreshold": 1,
            "exitThreshold": 0.5,
            "stopLoss": 0.05,
            "takeProfit": 0.1,
            "riskPerTrade": 0.02,
        },
        "metrics": {
            "strategyReturn": 3.01,
            "maxDrawdown": 6.31,
            "winRate": 50,
            "sharpeRatio": -3.94,
            "totalTrades": 30
        },
        "balances": Array(30).fill(0).map((_, i) => ({
            date: new Date(2025, 1, 8 + i).toISOString(),
            balance: 100000000 + Math.random() * 5000000 - 2000000,
            trades: 1
        })),
        "monthlyReturns": [
            { month: "2025-02", strategyReturn: 0.043 },
            { month: "2025-03", strategyReturn: 0.057 },
            { month: "2025-04", strategyReturn: 0.008 }
        ]
    },
    "strategy2": {
        "params": {
            "fastPeriod": 15,
            "slowPeriod": 35,
            "entryThreshold": 1.2,
            "exitThreshold": 0.4,
            "stopLoss": 0.04,
            "takeProfit": 0.12,
            "riskPerTrade": 0.015,
        },
        "metrics": {
            "strategyReturn": 3.55,
            "maxDrawdown": 5.20,
            "winRate": 55,
            "sharpeRatio": -2.84,
            "totalTrades": 25
        },
        "balances": Array(30).fill(0).map((_, i) => ({
            date: new Date(2025, 1, 8 + i).toISOString(),
            balance: 100000000 + Math.random() * 6000000 - 1000000,
            trades: 1
        })),
        "monthlyReturns": [
            { month: "2025-02", strategyReturn: 0.051 },
            { month: "2025-03", strategyReturn: 0.069 },
            { month: "2025-04", strategyReturn: 0.012 }
        ]
    },
    "strategy3": {
        "params": {
            "fastPeriod": 8,
            "slowPeriod": 25,
            "entryThreshold": 0.8,
            "exitThreshold": 0.6,
            "stopLoss": 0.06,
            "takeProfit": 0.09,
            "riskPerTrade": 0.025,
        },
        "metrics": {
            "strategyReturn": 2.75,
            "maxDrawdown": 7.50,
            "winRate": 48,
            "sharpeRatio": -4.20,
            "totalTrades": 32
        },
        "balances": Array(30).fill(0).map((_, i) => ({
            date: new Date(2025, 1, 8 + i).toISOString(),
            balance: 100000000 + Math.random() * 4000000 - 3000000,
            trades: 1
        })),
        "monthlyReturns": [
            { month: "2025-02", strategyReturn: 0.038 },
            { month: "2025-03", strategyReturn: 0.048 },
            { month: "2025-04", strategyReturn: 0.005 }
        ]
    },
    "strategy4": {
        "params": {
            "fastPeriod": 12,
            "slowPeriod": 28,
            "entryThreshold": 1.1,
            "exitThreshold": 0.55,
            "stopLoss": 0.045,
            "takeProfit": 0.11,
            "riskPerTrade": 0.02,
        },
        "metrics": {
            "strategyReturn": 3.82,
            "maxDrawdown": 4.90,
            "winRate": 58,
            "sharpeRatio": -2.41,
            "totalTrades": 28
        },
        "balances": Array(30).fill(0).map((_, i) => ({
            date: new Date(2025, 1, 8 + i).toISOString(),
            balance: 100000000 + Math.random() * 7000000 - 1000000,
            trades: 1
        })),
        "monthlyReturns": [
            { month: "2025-02", strategyReturn: 0.062 },
            { month: "2025-03", strategyReturn: 0.078 },
            { month: "2025-04", strategyReturn: 0.018 }
        ]
    },
    "strategy5": {
        "params": {
            "fastPeriod": 5,
            "slowPeriod": 20,
            "entryThreshold": 0.9,
            "exitThreshold": 0.7,
            "stopLoss": 0.07,
            "takeProfit": 0.08,
            "riskPerTrade": 0.03,
        },
        "metrics": {
            "strategyReturn": 2.38,
            "maxDrawdown": 8.70,
            "winRate": 45,
            "sharpeRatio": -4.85,
            "totalTrades": 38
        },
        "balances": Array(30).fill(0).map((_, i) => ({
            date: new Date(2025, 1, 8 + i).toISOString(),
            balance: 100000000 + Math.random() * 3500000 - 4000000,
            trades: 1
        })),
        "monthlyReturns": [
            { month: "2025-02", strategyReturn: 0.032 },
            { month: "2025-03", strategyReturn: 0.041 },
            { month: "2025-04", strategyReturn: 0.003 }
        ]
    },
    "strategy6": {
        "params": {
            "fastPeriod": 5,
            "slowPeriod": 20,
            "entryThreshold": 0.9,
            "exitThreshold": 0.7,
            "stopLoss": 0.07,
            "takeProfit": 0.08,
            "riskPerTrade": 0.03,
        },
        "metrics": {
            "strategyReturn": 2.38,
            "maxDrawdown": 8.70,
            "winRate": 45,
            "sharpeRatio": -4.85,
            "totalTrades": 38
        },
        "balances": Array(30).fill(0).map((_, i) => ({
            date: new Date(2025, 1, 8 + i).toISOString(),
            balance: 100000000 + Math.random() * 3500000 - 4000000,
            trades: 1
        })),
        "monthlyReturns": [
            { month: "2025-02", strategyReturn: 0.032 },
            { month: "2025-03", strategyReturn: 0.041 },
            { month: "2025-04", strategyReturn: 0.003 }
        ]
    },
    "strategy7": {
        "params": {
            "fastPeriod": 5,
            "slowPeriod": 20,
            "entryThreshold": 0.9,
            "exitThreshold": 0.7,
            "stopLoss": 0.07,
            "takeProfit": 0.08,
            "riskPerTrade": 0.03,
        },
        "metrics": {
            "strategyReturn": 2.38,
            "maxDrawdown": 8.70,
            "winRate": 45,
            "sharpeRatio": -4.85,
            "totalTrades": 38
        },
        "balances": Array(30).fill(0).map((_, i) => ({
            date: new Date(2025, 1, 8 + i).toISOString(),
            balance: 100000000 + Math.random() * 3500000 - 4000000,
            trades: 1
        })),
        "monthlyReturns": [
            { month: "2025-02", strategyReturn: 0.032 },
            { month: "2025-03", strategyReturn: 0.041 },
            { month: "2025-04", strategyReturn: 0.003 }
        ]
    },
    "strategy8": {
        "params": {
            "fastPeriod": 5,
            "slowPeriod": 20,
            "entryThreshold": 0.9,
            "exitThreshold": 0.7,
            "stopLoss": 0.07,
            "takeProfit": 0.08,
            "riskPerTrade": 0.03,
        },
        "metrics": {
            "strategyReturn": 2.38,
            "maxDrawdown": 8.70,
            "winRate": 45,
            "sharpeRatio": -4.85,
            "totalTrades": 38
        },
        "balances": Array(30).fill(0).map((_, i) => ({
            date: new Date(2025, 1, 8 + i).toISOString(),
            balance: 100000000 + Math.random() * 3500000 - 4000000,
            trades: 1
        })),
        "monthlyReturns": [
            { month: "2025-02", strategyReturn: 0.032 },
            { month: "2025-03", strategyReturn: 0.041 },
            { month: "2025-04", strategyReturn: 0.003 }
        ]
    },
    "strategy9": {
        "params": {
            "fastPeriod": 5,
            "slowPeriod": 20,
            "entryThreshold": 0.9,
            "exitThreshold": 0.7,
            "stopLoss": 0.07,
            "takeProfit": 0.08,
            "riskPerTrade": 0.03,
        },
        "metrics": {
            "strategyReturn": 2.38,
            "maxDrawdown": 8.70,
            "winRate": 45,
            "sharpeRatio": -4.85,
            "totalTrades": 38
        },
        "balances": Array(30).fill(0).map((_, i) => ({
            date: new Date(2025, 1, 8 + i).toISOString(),
            balance: 100000000 + Math.random() * 3500000 - 4000000,
            trades: 1
        })),
        "monthlyReturns": [
            { month: "2025-02", strategyReturn: 0.032 },
            { month: "2025-03", strategyReturn: 0.041 },
            { month: "2025-04", strategyReturn: 0.003 }
        ]
    },
    "strategy10": {
        "params": {
            "fastPeriod": 5,
            "slowPeriod": 20,
            "entryThreshold": 0.9,
            "exitThreshold": 0.7,
            "stopLoss": 0.07,
            "takeProfit": 0.08,
            "riskPerTrade": 0.03,
        },
        "metrics": {
            "strategyReturn": 2.38,
            "maxDrawdown": 8.70,
            "winRate": 45,
            "sharpeRatio": -4.85,
            "totalTrades": 38
        },
        "balances": Array(30).fill(0).map((_, i) => ({
            date: new Date(2025, 1, 8 + i).toISOString(),
            balance: 100000000 + Math.random() * 3500000 - 4000000,
            trades: 1
        })),
        "monthlyReturns": [
            { month: "2025-02", strategyReturn: 0.032 },
            { month: "2025-03", strategyReturn: 0.041 },
            { month: "2025-04", strategyReturn: 0.003 }
        ]
    },
    "strategy11": {
        "params": {
            "fastPeriod": 5,
            "slowPeriod": 20,
            "entryThreshold": 0.9,
            "exitThreshold": 0.7,
            "stopLoss": 0.07,
            "takeProfit": 0.08,
            "riskPerTrade": 0.03,
        },
        "metrics": {
            "strategyReturn": 2.38,
            "maxDrawdown": 8.70,
            "winRate": 45,
            "sharpeRatio": -4.85,
            "totalTrades": 38
        },
        "balances": Array(30).fill(0).map((_, i) => ({
            date: new Date(2025, 1, 8 + i).toISOString(),
            balance: 100000000 + Math.random() * 3500000 - 4000000,
            trades: 1
        })),
        "monthlyReturns": [
            { month: "2025-02", strategyReturn: 0.032 },
            { month: "2025-03", strategyReturn: 0.041 },
            { month: "2025-04", strategyReturn: 0.003 }
        ]
    },
    "strategy12": {
        "params": {
            "fastPeriod": 5,
            "slowPeriod": 20,
            "entryThreshold": 0.9,
            "exitThreshold": 0.7,
            "stopLoss": 0.07,
            "takeProfit": 0.08,
            "riskPerTrade": 0.03,
        },
        "metrics": {
            "strategyReturn": 2.38,
            "maxDrawdown": 8.70,
            "winRate": 45,
            "sharpeRatio": -4.85,
            "totalTrades": 38
        },
        "balances": Array(30).fill(0).map((_, i) => ({
            date: new Date(2025, 1, 8 + i).toISOString(),
            balance: 100000000 + Math.random() * 3500000 - 4000000,
            trades: 1
        })),
        "monthlyReturns": [
            { month: "2025-02", strategyReturn: 0.032 },
            { month: "2025-03", strategyReturn: 0.041 },
            { month: "2025-04", strategyReturn: 0.003 }
        ]
    }
};

export default function LabStrategyComparison() {
    const [selectedStrategies, setSelectedStrategies] = useState([]);
    const [paretoStrategies, setParetoStrategies] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        // Calculate Pareto frontier
        if (selectedStrategies.length > 0) {
            const strategies = selectedStrategies.map(id => ({
                id,
                return: exampleData[id].metrics.strategyReturn,
                drawdown: exampleData[id].metrics.maxDrawdown,
                sharpe: exampleData[id].metrics.sharpeRatio
            }));

            const paretoOptimal = calculateParetoFrontier(strategies);
            setParetoStrategies(paretoOptimal);
        } else {
            setParetoStrategies([]);
        }
    }, [selectedStrategies]);

    const toggleStrategy = (strategyId) => {
        if (selectedStrategies.includes(strategyId)) {
            setSelectedStrategies(selectedStrategies.filter(id => id !== strategyId));
        } else {
            setSelectedStrategies([...selectedStrategies, strategyId]);
        }
    };

    // Calculate Pareto frontier
    const calculateParetoFrontier = (strategies) => {
        const paretoOptimal = [];

        for (const strategy of strategies) {
            let isDominated = false;

            for (const otherStrategy of strategies) {
                if (strategy.id === otherStrategy.id) continue;

                // Check if otherStrategy dominates strategy
                // For return: higher is better
                // For drawdown: lower is better
                // For sharpe: higher is better (absolute value, since they're negative)
                if (otherStrategy.return >= strategy.return &&
                    otherStrategy.drawdown <= strategy.drawdown &&
                    Math.abs(otherStrategy.sharpe) <= Math.abs(strategy.sharpe) &&
                    (otherStrategy.return > strategy.return ||
                        otherStrategy.drawdown < strategy.drawdown ||
                        Math.abs(otherStrategy.sharpe) < Math.abs(strategy.sharpe))) {
                    isDominated = true;
                    break;
                }
            }

            if (!isDominated) {
                paretoOptimal.push(strategy.id);
            }
        }

        return paretoOptimal;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };

    const getBalanceChartData = () => {
        const chartData = [];

        selectedStrategies.forEach(strategyId => {
            exampleData[strategyId].balances.forEach(point => {
                chartData.push({
                    date: formatDate(point.date),
                    [strategyId]: point.balance / 1000000, // Convert to millions for better display
                });
            });
        });

        // Group by date and merge values
        const groupedData = chartData.reduce((acc, curr) => {
            const existingPoint = acc.find(p => p.date === curr.date);
            if (existingPoint) {
                Object.assign(existingPoint, curr);
            } else {
                acc.push(curr);
            }
            return acc;
        }, []);

        // Sort by date
        groupedData.sort((a, b) => new Date(a.date) - new Date(b.date));

        return groupedData;
    };

    const getMonthlyReturnsData = () => {
        const allMonths = Array.from(
            new Set(
                selectedStrategies.flatMap(id =>
                    exampleData[id].monthlyReturns.map(mr => mr.month)
                )
            )
        ).sort();

        return allMonths.map(month => {
            const dataPoint = { month };
            selectedStrategies.forEach(id => {
                const monthReturn = exampleData[id].monthlyReturns.find(mr => mr.month === month);
                if (monthReturn) {
                    dataPoint[id] = monthReturn.strategyReturn * 100; // Convert to percentage
                }
            });
            return dataPoint;
        });
    };

    const getScatterData = () => {
        return Object.keys(exampleData).map(id => ({
            id,
            return: exampleData[id].metrics.strategyReturn,
            drawdown: exampleData[id].metrics.maxDrawdown,
            winRate: exampleData[id].metrics.winRate,
            size: 10,
            isParetoOptimal: paretoStrategies.includes(id) && selectedStrategies.includes(id),
            isSelected: selectedStrategies.includes(id)
        }));
    };

    const getStrategyColor = (index) => {
        const colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b'];
        return colors[index % colors.length];
    };

    const getOptimalParameters = () => {
        if (paretoStrategies.length === 0) return null;

        const optimal = paretoStrategies.map(id => ({
            id,
            ...exampleData[id].params,
            return: exampleData[id].metrics.strategyReturn,
            drawdown: exampleData[id].metrics.maxDrawdown,
            sharpe: exampleData[id].metrics.sharpeRatio,
            winRate: exampleData[id].metrics.winRate
        }));

        return optimal;
    };

    return (
        <div className="flex flex-col space-y-6 p-6 max-w-6xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Quantitative Trading Strategy Comparison</CardTitle>
                    <CardDescription>
                        Compare different parameter sets and find the optimal configuration based on the Pareto frontier
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {Object.keys(exampleData).map((strategyId, index) => (
                            <Card key={strategyId} className={`cursor-pointer border-2 ${selectedStrategies.includes(strategyId) ? 'border-blue-500' : 'border-gray-200'}`}
                                onClick={() => toggleStrategy(strategyId)}>
                                <CardHeader className="p-3">
                                    <CardTitle className="text-sm flex justify-between">
                                        <span>Parameter Set {index + 1}</span>
                                        {selectedStrategies.includes(strategyId) && <Check size={16} className="text-blue-500" />}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-3 pt-0 text-xs">
                                    <p>Return: {exampleData[strategyId].metrics.strategyReturn.toFixed(2)}%</p>
                                    <p>Drawdown: {exampleData[strategyId].metrics.maxDrawdown.toFixed(2)}%</p>
                                    <p>Sharpe: {exampleData[strategyId].metrics.sharpeRatio.toFixed(2)}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {selectedStrategies.length > 0 && (
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid grid-cols-5">
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="performance">Performance</TabsTrigger>
                                <TabsTrigger value="parameters">Parameters</TabsTrigger>
                                <TabsTrigger value="pareto">Pareto Frontier</TabsTrigger>
                                <TabsTrigger value="recommendation">Recommendation</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Strategy Comparison Overview</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Parameter Set</TableHead>
                                                    <TableHead>Return (%)</TableHead>
                                                    <TableHead>Max Drawdown (%)</TableHead>
                                                    <TableHead>Win Rate (%)</TableHead>
                                                    <TableHead>Sharpe Ratio</TableHead>
                                                    <TableHead>Total Trades</TableHead>
                                                    <TableHead>Pareto Optimal</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {selectedStrategies.map((strategyId, index) => (
                                                    <TableRow key={strategyId}>
                                                        <TableCell className="font-medium">Parameter Set {Object.keys(exampleData).indexOf(strategyId) + 1}</TableCell>
                                                        <TableCell>{exampleData[strategyId].metrics.strategyReturn.toFixed(2)}</TableCell>
                                                        <TableCell>{exampleData[strategyId].metrics.maxDrawdown.toFixed(2)}</TableCell>
                                                        <TableCell>{exampleData[strategyId].metrics.winRate.toFixed(0)}</TableCell>
                                                        <TableCell>{exampleData[strategyId].metrics.sharpeRatio.toFixed(2)}</TableCell>
                                                        <TableCell>{exampleData[strategyId].metrics.totalTrades}</TableCell>
                                                        <TableCell>{paretoStrategies.includes(strategyId) ? 'Yes' : 'No'}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="performance">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Performance Analysis</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-medium mb-4">Equity Curve</h3>
                                            <ResponsiveContainer width="100%" height={300}>
                                                <LineChart data={getBalanceChartData()}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="date" />
                                                    <YAxis name="Balance (M)" unit="M" />
                                                    <Tooltip />
                                                    <Legend />
                                                    {selectedStrategies.map((id, index) => (
                                                        <Line
                                                            key={id}
                                                            type="monotone"
                                                            dataKey={id}
                                                            name={`Parameter Set ${Object.keys(exampleData).indexOf(id) + 1}`}
                                                            stroke={getStrategyColor(index)}
                                                            dot={false}
                                                            activeDot={{ r: 8 }}
                                                        />
                                                    ))}
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-medium mb-4">Monthly Returns</h3>
                                            <ResponsiveContainer width="100%" height={300}>
                                                <LineChart data={getMonthlyReturnsData()}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="month" />
                                                    <YAxis name="Return (%)" unit="%" />
                                                    <Tooltip />
                                                    <Legend />
                                                    {selectedStrategies.map((id, index) => (
                                                        <Line
                                                            key={id}
                                                            type="monotone"
                                                            dataKey={id}
                                                            name={`Parameter Set ${Object.keys(exampleData).indexOf(id) + 1}`}
                                                            stroke={getStrategyColor(index)}
                                                            dot={{ r: 5 }}
                                                            activeDot={{ r: 8 }}
                                                        />
                                                    ))}
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="parameters">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Parameter Comparison</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Parameter Set</TableHead>
                                                    <TableHead>Fast Period</TableHead>
                                                    <TableHead>Slow Period</TableHead>
                                                    <TableHead>Entry Threshold</TableHead>
                                                    <TableHead>Exit Threshold</TableHead>
                                                    <TableHead>Stop Loss</TableHead>
                                                    <TableHead>Take Profit</TableHead>
                                                    <TableHead>Risk Per Trade</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {selectedStrategies.map((strategyId) => (
                                                    <TableRow key={strategyId}>
                                                        <TableCell className="font-medium">Parameter Set {Object.keys(exampleData).indexOf(strategyId) + 1}</TableCell>
                                                        <TableCell>{exampleData[strategyId].params.fastPeriod}</TableCell>
                                                        <TableCell>{exampleData[strategyId].params.slowPeriod}</TableCell>
                                                        <TableCell>{exampleData[strategyId].params.entryThreshold}</TableCell>
                                                        <TableCell>{exampleData[strategyId].params.exitThreshold}</TableCell>
                                                        <TableCell>{exampleData[strategyId].params.stopLoss}</TableCell>
                                                        <TableCell>{exampleData[strategyId].params.takeProfit}</TableCell>
                                                        <TableCell>{exampleData[strategyId].params.riskPerTrade}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="pareto">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Pareto Frontier Analysis</CardTitle>
                                        <CardDescription>
                                            The Pareto frontier represents the optimal set of parameters where no other parameter set is better in all metrics
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-medium mb-4">Return vs. Drawdown</h3>
                                            <ResponsiveContainer width="100%" height={400}>
                                                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                                    <CartesianGrid />
                                                    <XAxis type="number" dataKey="drawdown" name="Max Drawdown (%)" unit="%" />
                                                    <YAxis type="number" dataKey="return" name="Return (%)" unit="%" />
                                                    <ZAxis type="number" dataKey="size" range={[60, 400]} />
                                                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                                    <Legend />
                                                    <Scatter
                                                        name="Parameter Sets"
                                                        data={getScatterData().filter(d => d.isSelected)}
                                                        fill="#8884d8"
                                                        shape={(props) => {
                                                            const { cx, cy, fill } = props;
                                                            const isParetoOptimal = props.payload.isParetoOptimal;

                                                            return (
                                                                <g>
                                                                    <circle
                                                                        cx={cx}
                                                                        cy={cy}
                                                                        r={10}
                                                                        fill={isParetoOptimal ? "#ff7f0e" : "#8884d8"}
                                                                        stroke={isParetoOptimal ? "#ff7f0e" : "none"}
                                                                        strokeWidth={2}
                                                                    />
                                                                    <text
                                                                        x={cx}
                                                                        y={cy}
                                                                        textAnchor="middle"
                                                                        dominantBaseline="middle"
                                                                        fill="white"
                                                                        fontSize={10}
                                                                    >
                                                                        {Object.keys(exampleData).indexOf(props.payload.id) + 1}
                                                                    </text>
                                                                </g>
                                                            );
                                                        }}
                                                    />
                                                </ScatterChart>
                                            </ResponsiveContainer>
                                        </div>

                                        {paretoStrategies.length > 0 && (
                                            <div>
                                                <h3 className="text-lg font-medium mb-4">Pareto Optimal Parameter Sets</h3>
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Parameter Set</TableHead>
                                                            <TableHead>Return (%)</TableHead>
                                                            <TableHead>Max Drawdown (%)</TableHead>
                                                            <TableHead>Sharpe Ratio</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {paretoStrategies.filter(id => selectedStrategies.includes(id)).map((strategyId) => (
                                                            <TableRow key={strategyId}>
                                                                <TableCell className="font-medium">Parameter Set {Object.keys(exampleData).indexOf(strategyId) + 1}</TableCell>
                                                                <TableCell>{exampleData[strategyId].metrics.strategyReturn.toFixed(2)}</TableCell>
                                                                <TableCell>{exampleData[strategyId].metrics.maxDrawdown.toFixed(2)}</TableCell>
                                                                <TableCell>{exampleData[strategyId].metrics.sharpeRatio.toFixed(2)}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="recommendation">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Parameter Recommendation</CardTitle>
                                        <CardDescription>
                                            Based on the Pareto frontier analysis, we recommend the following parameter sets
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {paretoStrategies.length > 0 ? (
                                            <>
                                                <Alert>
                                                    <Info className="h-4 w-4" />
                                                    <AlertTitle>Optimal Parameter Sets Found</AlertTitle>
                                                    <AlertDescription>
                                                        We've identified {paretoStrategies.filter(id => selectedStrategies.includes(id)).length} parameter sets that are Pareto optimal based on return, drawdown, and Sharpe ratio.
                                                    </AlertDescription>
                                                </Alert>

                                                <div>
                                                    <h3 className="text-lg font-medium mb-4">Recommended Parameters</h3>
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>Parameter Set</TableHead>
                                                                <TableHead>Fast Period</TableHead>
                                                                <TableHead>Slow Period</TableHead>
                                                                <TableHead>Entry Threshold</TableHead>
                                                                <TableHead>Exit Threshold</TableHead>
                                                                <TableHead>Stop Loss</TableHead>
                                                                <TableHead>Take Profit</TableHead>
                                                                <TableHead>Risk Per Trade</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {getOptimalParameters()?.map((params) => (
                                                                <TableRow key={params.id}>
                                                                    <TableCell className="font-medium">Parameter Set {Object.keys(exampleData).indexOf(params.id) + 1}</TableCell>
                                                                    <TableCell>{params.fastPeriod}</TableCell>
                                                                    <TableCell>{params.slowPeriod}</TableCell>
                                                                    <TableCell>{params.entryThreshold}</TableCell>
                                                                    <TableCell>{params.exitThreshold}</TableCell>
                                                                    <TableCell>{params.stopLoss}</TableCell>
                                                                    <TableCell>{params.takeProfit}</TableCell>
                                                                    <TableCell>{params.riskPerTrade}</TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>

                                                <div className="space-y-4">
                                                    <h3 className="text-lg font-medium">Key Takeaways</h3>
                                                    <div>
                                                        <h4 className="font-medium">For Best Risk-Adjusted Returns:</h4>
                                                        <p>Parameter Set {Object.keys(exampleData).indexOf('strategy4') + 1} offers the best balance of return and risk with a Sharpe ratio of {exampleData['strategy4'].metrics.sharpeRatio.toFixed(2)}.</p>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium">For Maximum Returns:</h4>
                                                        <p>Parameter Set {Object.keys(exampleData).indexOf('strategy4') + 1} provides the highest return at {exampleData['strategy4'].metrics.strategyReturn.toFixed(2)}%.</p>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium">For Minimum Drawdown:</h4>
                                                        <p>Parameter Set {Object.keys(exampleData).indexOf('strategy4') + 1} has the lowest maximum drawdown at {exampleData['strategy4'].metrics.maxDrawdown.toFixed(2)}%.</p>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <Alert variant="destructive">
                                                <AlertCircle className="h-4 w-4" />
                                                <AlertTitle>No Pareto Optimal Sets Found</AlertTitle>
                                                <AlertDescription>
                                                    Please select more parameter sets to compare or try different parameters.
                                                </AlertDescription>
                                            </Alert>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    )}
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => setSelectedStrategies([])}>
                        Reset Selection
                    </Button>
                    <Button onClick={() => setSelectedStrategies(Object.keys(exampleData))}>
                        Select All
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}