export const algorithmOptions = [
    {
        value: "mean-reversion",
        label: "Mean Reversionr",
        desc: "Price returns to historical average",
        icon: "Activity",
        info: "Mean reversion strategy info",
        defaultParameters: {
            slowPeriod: "5",
            fastPeriod: "2",
        },
        defaultRisk: {
            "maxDrawdown": 15
        }
    },
    {
        value: "breakout",
        label: "Breakout",
        desc: "Price returns to historical average",
        icon: "Activity",
        info: "Mean reversion strategy info",
        defaultParameters: {
            rsiPeriod: "14",
            overbought: "70",
            oversold: "30",
        },
        defaultRisk: {
            "maxDrawdown": 15
        }
    },
    {
        value: "macd",
        label: "MACD Strategy",
        desc: "Price returns to historical average",
        icon: "Activity",
        info: "Mean reversion strategy info",
        defaultParameters: {
            fastPeriod: "12",
            slowPeriod: "26",
            signalPeriod: "9",
        },
        defaultRisk: {
            "maxDrawdown": 15
        }
    },
    {
        value: "bollinger",
        label: "Bollinger Bands",
        desc: "Price returns to historical average",
        icon: "Activity",
        info: "Mean reversion strategy info",
        defaultParameters: {
            period: "20",
            stdDev: "2",
        },
        defaultRisk: {
            "maxDrawdown": 15
        }
    }
]