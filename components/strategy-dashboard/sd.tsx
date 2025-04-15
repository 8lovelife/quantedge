// mock data for strategies
const mockStrategies = [
    {
        id: 1,
        name: "BTC-ETH Mean Reversion",
        type: "mean-reversion",
        status: "live",
        updated: "2025-04-13T22:30:00Z",
        performance: {
            return: 24.5,
            sharpe: 2.1,
            drawdown: 12.3,
            winRate: 68.5
        },
        configuration: {
            assets: [
                { symbol: "BTC", weight: 50, direction: "LONG" },
                { symbol: "ETH", weight: 50, direction: "SHORT" }
            ],
            parameters: {
                entryThreshold: 2.5,
                exitThreshold: 1.0,
                stopLoss: 5,
                lookbackPeriod: 24
            },
            riskManagement: {
                maxPositionSize: 10,
                stopLossEnabled: true,
                trailingStopLoss: true,
                riskPerTrade: 2
            }
        },
        logs: [
            {
                timestamp: "2025-04-14T01:50:33Z",
                level: "INFO",
                message: "Successfully executed BTC long position"
            }
        ]
    },
    {
        id: 2,
        name: "Trend Following Suite",
        type: "trend-following",
        status: "paper",
        updated: "2025-04-14T01:20:00Z",
        performance: {
            return: 15.8,
            sharpe: 1.8,
            drawdown: 8.5,
            winRate: 62.3
        },
        configuration: {
            assets: [
                { symbol: "BTC", weight: 40, direction: "LONG" },
                { symbol: "ETH", weight: 30, direction: "LONG" },
                { symbol: "SOL", weight: 30, direction: "LONG" }
            ],
            parameters: {
                trendStrength: 3.0,
                momentumPeriod: 14,
                breakoutLevel: 2.5
            },
            riskManagement: {
                maxPositionSize: 15,
                stopLossEnabled: true,
                trailingStopLoss: true,
                riskPerTrade: 1.5
            }
        },
        logs: [
            {
                timestamp: "2025-04-14T01:45:33Z",
                level: "WARNING",
                message: "Position size approaching limit"
            }
        ]
    },
    {
        id: 3,
        name: "Grid Trading Bot",
        type: "grid-trading",
        status: "backtest",
        updated: "2025-04-13T18:15:00Z",
        performance: {
            return: 18.7,
            sharpe: 1.9,
            drawdown: 5.2,
            winRate: 75.4
        },
        configuration: {
            assets: [
                { symbol: "BTC", weight: 100, direction: "BOTH" }
            ],
            parameters: {
                gridLevels: 10,
                gridSpacing: 1.5,
                upperPrice: 75000,
                lowerPrice: 65000
            },
            riskManagement: {
                maxPositionSize: 20,
                stopLossEnabled: false,
                trailingStopLoss: false,
                riskPerTrade: 1
            }
        },
        logs: [
            {
                timestamp: "2025-04-14T01:30:33Z",
                level: "INFO",
                message: "Grid levels recalculated based on new price range"
            }
        ]
    },
    {
        id: 4,
        name: "Volatility Strategy",
        type: "mean-reversion",
        status: "draft",
        updated: "2025-04-14T01:00:00Z",
        performance: {
            return: 0,
            sharpe: 0,
            drawdown: 0,
            winRate: 0
        },
        configuration: {
            assets: [
                { symbol: "ETH", weight: 60, direction: "LONG" },
                { symbol: "SOL", weight: 40, direction: "SHORT" }
            ],
            parameters: {
                volatilityThreshold: 2.0,
                meanPeriod: 20,
                entrySize: 5
            },
            riskManagement: {
                maxPositionSize: 10,
                stopLossEnabled: true,
                trailingStopLoss: false,
                riskPerTrade: 2
            }
        },
        logs: []
    },
    {
        id: 5,
        name: "Multi-Asset Momentum",
        type: "trend-following",
        status: "live",
        updated: "2025-04-14T01:40:00Z",
        performance: {
            return: 31.2,
            sharpe: 2.4,
            drawdown: 14.5,
            winRate: 71.2
        },
        configuration: {
            assets: [
                { symbol: "BTC", weight: 30, direction: "LONG" },
                { symbol: "ETH", weight: 30, direction: "LONG" },
                { symbol: "SOL", weight: 20, direction: "LONG" },
                { symbol: "AVAX", weight: 20, direction: "LONG" }
            ],
            parameters: {
                momentumPeriod: 30,
                rebalanceInterval: 24,
                minimumStrength: 1.5
            },
            riskManagement: {
                maxPositionSize: 25,
                stopLossEnabled: true,
                trailingStopLoss: true,
                riskPerTrade: 2.5
            }
        },
        logs: [
            {
                timestamp: "2025-04-14T01:52:33Z",
                level: "INFO",
                message: "Portfolio rebalanced successfully"
            }
        ]
    }
];

// Mock fetch function
export const fetchStrategies = async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return mockStrategies;
};

// Mock fetch single strategy details
export const fetchStrategyDetails = async (id: number) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const strategy = mockStrategies.find(s => s.id === id);
    if (!strategy) {
        throw new Error('Strategy not found');
    }
    return strategy;
};