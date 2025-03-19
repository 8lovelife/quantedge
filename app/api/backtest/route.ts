import { NextResponse } from 'next/server';

// Simulate a delay for API response
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Generate historical backtest data with a fixed seed for consistency
const generateHistoricalBacktestData = (days = 180, version = 1, params: any = {}) => {
    // Use fixed values for historical data to ensure consistency
    const data = [];
    // Adjust initial balance based on version to create different results
    let balance = 10000 + version * 500;
    let marketBalance = 10000;
    const date = new Date();
    date.setDate(date.getDate() - days);

    // Generate fixed trades with slight variations based on version and parameters
    const trades = [];

    // Adjust trade frequency based on parameters
    const tradeFrequency = params.tradeFrequency || 12;
    const winRate = params.winRate || (params.riskLevel === 'high' ? 0.55 : params.riskLevel === 'low' ? 0.65 : 0.6);

    // Generate trades based on parameters
    for (let i = 0; i < tradeFrequency; i++) {
        const tradeDay = Math.floor(Math.random() * days);
        const isWin = Math.random() < winRate;

        // Calculate profit based on parameters
        const profitFactor = params.takeProfit / params.stopLoss || 1.5;
        const profit = isWin
            ? Math.random() * 500 * profitFactor
            : -Math.random() * 300 * (1 / profitFactor);

        trades.push({
            day: tradeDay,
            type: Math.random() > 0.5 ? "buy" : "sell",
            result: isWin ? "win" : "loss",
            profit: profit,
        });
    }

    // Sort trades by day
    trades.sort((a, b) => a.day - b.day);

    // Generate price data with parameter influence
    const smaFastInfluence = params.smaFast ? (20 / params.smaFast) * 0.001 : 0.001;
    const smaSlowInfluence = params.smaSlow ? (params.smaSlow / 100) * 0.001 : 0.001;

    for (let i = 0; i < days; i++) {
        const dayDate = new Date(date);
        dayDate.setDate(date.getDate() + i);

        // Deterministic market movement
        const marketChange = Math.sin(i * 0.1) * 0.01 + 0.0003;
        marketBalance = marketBalance * (1 + marketChange);

        // Deterministic strategy movement with parameter-based variation
        const strategyChange = Math.sin(i * 0.1 + 0.5) * (0.012 + smaFastInfluence - smaSlowInfluence) + 0.0005;
        balance = balance * (1 + strategyChange);

        // Find trades for this day
        const dayTrades = trades.filter((t) => t.day === i);
        if (dayTrades.length > 0) {
            dayTrades.forEach((trade) => {
                balance += trade.profit;
            });
        }

        data.push({
            date: dayDate.toISOString().split("T")[0],
            balance: Math.round(balance * 100) / 100,
            marketBalance: Math.round(marketBalance * 100) / 100,
            trades: dayTrades.length,
        });
    }

    return { data, trades, params };
};

// API route handler
export async function POST(request: Request) {
    try {
        // Parse request body
        const body = await request.json();
        const { params, timeframe, strategyId } = body;

        // Log received parameters
        console.log('Received backtest request:', { params, timeframe, strategyId });

        // Simulate API processing time
        await delay(2000);

        // Calculate days based on timeframe
        let days = 180;
        switch (timeframe) {
            case "1m":
                days = 30;
                break;
            case "3m":
                days = 90;
                break;
            case "6m":
                days = 180;
                break;
            case "1y":
                days = 365;
                break;
            case "all":
                days = 730;
                break;
        }

        // Generate backtest data
        const version = Math.floor(Math.random() * 1000); // Generate a unique version ID
        const backtestData = generateHistoricalBacktestData(days, version, params);

        // Create response with backtest data and metadata
        const response = {
            success: true,
            runId: version,
            date: new Date().toISOString(),
            strategyId,
            timeframe,
            data: backtestData
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error processing backtest request:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to process backtest request' },
            { status: 500 }
        );
    }
}

// API route for getting historical backtest data
export async function GET(request: Request) {
    try {
        // Get URL parameters
        const url = new URL(request.url);
        const version = parseInt(url.searchParams.get('version') || '1');
        const timeframe = url.searchParams.get('timeframe') || '6m';
        const strategyId = url.searchParams.get('strategyId') || '1';

        // Calculate days based on timeframe
        let days = 180;
        switch (timeframe) {
            case "1m":
                days = 30;
                break;
            case "3m":
                days = 90;
                break;
            case "6m":
                days = 180;
                break;
            case "1y":
                days = 365;
                break;
            case "all":
                days = 730;
                break;
        }

        // Simulate API processing time
        await delay(1000);

        // Get parameters from mock database based on version
        const mockParams = {
            1: { smaFast: 10, smaSlow: 50, riskLevel: "medium", stopLoss: 2, takeProfit: 6 },
            2: { smaFast: 12, smaSlow: 50, riskLevel: "medium", stopLoss: 2.5, takeProfit: 7 },
            3: { smaFast: 10, smaSlow: 45, riskLevel: "high", stopLoss: 3, takeProfit: 9 },
            4: { smaFast: 8, smaSlow: 40, riskLevel: "low", stopLoss: 1.5, takeProfit: 4.5 },
            5: { smaFast: 15, smaSlow: 60, riskLevel: "medium", stopLoss: 2, takeProfit: 6 },
        };

        const params = mockParams[version as keyof typeof mockParams] || mockParams[1];

        // Generate backtest data
        const backtestData = generateHistoricalBacktestData(days, version, params);

        // Create response with backtest data and metadata
        const response = {
            success: true,
            runId: version,
            date: new Date().toISOString(),
            strategyId,
            timeframe,
            data: backtestData
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error processing historical backtest request:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to process historical backtest request' },
            { status: 500 }
        );
    }
}
