import { LabRunComparison } from "@/lib/api/algorithms";

export function mergeLines(ids: number[], map: Record<number, LabRunComparison>) {
    const idsToUse = ids.length === 0 ? Object.keys(map).map(Number).slice(0, 1) : ids;
    const byDate: Record<string, any> = {};

    idsToUse.forEach((id) => {
        const comparison = map[id];
        if (!comparison) return;
        const balances = comparison.backtestData?.balances ?? [];
        balances.forEach((p) => {
            const d = p.date;
            if (!byDate[d]) byDate[d] = { date: d };
            byDate[d][`run${id}`] = +(p.balance).toFixed(2);
        });
    });

    return Object.values(byDate).sort(
        (a: any, b: any) => +new Date(a.date) - +new Date(b.date)
    );
}

const calculateDrawdowns = (balances: any[] = []) => {
    let peak = -Infinity;
    return balances.map(point => {
        const { date, balance } = point;
        peak = Math.max(peak, balance);
        const drawdown = peak > 0 ? ((peak - balance) / peak) * 100 : 0;
        return { date, drawdown: drawdown > 0.01 ? drawdown : 0 };
    });
};

export function mergeDrawdowns(ids: number[], map: Record<number, LabRunComparison>) {
    const idsToUse = ids.length === 0 ? Object.keys(map).map(Number).slice(0, 1) : ids;

    const byDate: Record<string, any> = {};

    idsToUse.forEach(id => {
        const balances = map[id]?.backtestData?.balances;
        if (!balances) return;

        const drawdowns = calculateDrawdowns(balances);
        drawdowns.forEach(p => {
            const d = p.date;
            if (!byDate[d]) byDate[d] = { date: d };
            byDate[d][`run${id}`] = +p.drawdown.toFixed(2);
        });
    });

    return Object.values(byDate).sort((a: any, b: any) => +new Date(a.date) - +new Date(b.date));
};

export function prepareWinLossData(
    ids: number[],
    map: Record<number, LabRunComparison>
) {
    const idsToUse = ids.length === 0 ? Object.keys(map).map(Number).slice(0, 1) : ids;

    const months = Array.from(new Set(
        idsToUse.flatMap(id =>
            map[id]?.backtestData?.monthlyReturns?.map(m => m.month) ?? []
        )
    )).sort();

    return months.map(month => {
        const result: Record<string, any> = { month };

        idsToUse.forEach(id => {
            const monthly = map[id]?.backtestData?.data?.monthlyReturns?.find(m => m.month === month);
            if (monthly) {
                const returnValue = +monthly.strategyReturn;
                result[`win${id}`] = returnValue > 0 ? +(returnValue * 100).toFixed(2) : 0;
                result[`loss${id}`] = returnValue < 0 ? +(Math.abs(returnValue) * 100).toFixed(2) : 0;
            }
        });

        return result;
    });
};

export function prepareRadarData(
    effectiveSelected: number[],
    runsToBacktest: Record<number, LabRunComparison>
) {
    const metrics = ["strategyReturn", "sharpeRatio", "winRate"];
    const inverseMetrics = ["maxDrawdown"];
    const allMetrics = [...metrics, ...inverseMetrics];

    // Initialize min/max for normalization
    const minMax: Record<string, { min: number; max: number }> = {};
    for (const metric of allMetrics) {
        let values = effectiveSelected
            .map((id) => runsToBacktest[id]?.backtestData?.metrics?.[metric])
            .filter((v): v is number => typeof v === "number");

        if (values.length === 0) {
            // Avoid crashing when data is missing
            values = [0];
        }

        const min = Math.min(...values);
        const max = Math.max(...values);
        minMax[metric] = {
            min: min === max ? min - 0.1 : min,
            max: min === max ? max + 0.1 : max,
        };
    }

    const radarData = allMetrics.map((metric) => {
        const isInverse = inverseMetrics.includes(metric);
        const row: Record<string, any> = { metric };

        effectiveSelected.forEach((id) => {
            const value = runsToBacktest[id]?.backtestData?.metrics?.[metric];
            if (typeof value === "number") {
                const { min, max } = minMax[metric];
                const normalized = (value - min) / (max - min);
                row[`run${id}`] = (isInverse ? 1 - normalized : normalized) * 100;
            } else {
                row[`run${id}`] = 0;
            }
        });

        return row;
    });
    return radarData;
}

export function calculateExtendedMetrics(backtestData: any) {
    const { strategyReturn, maxDrawdown, sharpeRatio, winRate } = backtestData.metrics;
    return {
        strategyReturn: +strategyReturn.toFixed(2),
        maxDrawdown: +maxDrawdown.toFixed(2),
        sharpeRatio: +sharpeRatio.toFixed(2),
        winRate: +winRate.toFixed(2),
        calmarRatio: maxDrawdown > 0 ? +(strategyReturn / maxDrawdown).toFixed(2) : 0,
        sortinoRatio: +(sharpeRatio * 1.2).toFixed(2),
        profitFactor: +(1 + (winRate - 50) / 100).toFixed(2),
    };
}

export function getBestMetricValues(metricsTableData: any[]) {
    const bestValues: Record<string, number> = {};
    if (!metricsTableData.length) return bestValues;
    const metricKeys = Object.keys(metricsTableData[0]).filter(k => k !== 'id');

    metricKeys.forEach(metric => {
        if (metric === 'maxDrawdown') {
            bestValues[metric] = Math.min(...metricsTableData.map(m => m[metric]));
        } else {
            bestValues[metric] = Math.max(...metricsTableData.map(m => m[metric]));
        }
    });

    return bestValues;
}
