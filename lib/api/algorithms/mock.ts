export const algorithmOptions = [
    {
        value: "moving_average",
        label: "Moving Average Crossover",
        defaultParameters: {
            smaFast: "10",
            smaSlow: "50",
        },
    },
    {
        value: "rsi",
        label: "RSI Strategy",
        defaultParameters: {
            rsiPeriod: "14",
            overbought: "70",
            oversold: "30",
        },
    },
    {
        value: "macd",
        label: "MACD Strategy",
        defaultParameters: {
            fastPeriod: "12",
            slowPeriod: "26",
            signalPeriod: "9",
        },
    },
    {
        value: "bollinger",
        label: "Bollinger Bands",
        defaultParameters: {
            period: "20",
            stdDev: "2",
        },
    },
    {
        value: "custom",
        label: "Custom Algorithm",
        defaultParameters: {},
    },
]