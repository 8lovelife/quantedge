// We'll break your 867-line `HistoryPage` component into logical, manageable chunks.
// Here's a starting point that separates UI and logic, removes mock data, and composes the page more cleanly.

// Structure:
// - components/RunSelectionCard.tsx
// - components/ChartCard.tsx
// - components/BasicTabContent.tsx
// - components/AdvancedTabContent.tsx
// - pages/HistoryPage.tsx (main entry)

// Let's begin by creating the cleaned-up main file. We'll move mocks, utilities, and long rendering chunks out.

"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";

import { LabRunComparison, LabRunHistory, labRunHistoryComparison } from "@/lib/api/algorithms";
import RunSelectionCard from "./run-selection-card";
import BasicTabContent from "./basic-tab-content";
import AdvancedTabContent from "./advanced-tab-content";
import { calculateExtendedMetrics, getBestMetricValues, mergeDrawdowns, mergeLines, prepareRadarData, prepareWinLossData } from "./chart-utils";
import StrategyTempleteObserveResultsLoadingSkeleton from "../observe-results-panel-skeleton";

export default function HistoryPage() {
    const params = useParams();
    const router = useRouter();

    const [runsToBacktest, setRunsToBacktest] = useState<Record<number, LabRunComparison>>({});
    const [runComparisonData, setRunComparisonData] = useState<LabRunComparison[]>();
    const [selected, setSelected] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<"basic" | "advanced">("basic");
    const [pareto, setPareto] = useState<number[]>([]);

    const templateId = typeof params.id === "string" ? params.id : "1";



    // Load data from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const comparisonData = await labRunHistoryComparison(parseInt(templateId));

                setRunComparisonData(comparisonData);

                if (comparisonData?.length) {
                    setSelected([comparisonData[0].runId]);
                    setRunsToBacktest(Object.fromEntries(comparisonData.map(item => [item.runId, item])));
                }
            } catch (err) {
                console.error("Failed to fetch run backtest data", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [templateId]);

    // const runHistorys: LabRunHistory[] = runComparisonData?.map(item => item.labRunHistory) ?? [];
    const runHistorys: LabRunHistory[] = runComparisonData?.flatMap(item => item.labRunHistory ?? []) ?? [];
    const effectiveSelected = selected.length === 0 ? [runHistorys[0]?.id ?? 1] : selected;

    useEffect(() => {
        const ids: number[] = [];
        const list = effectiveSelected
            .map(id => runsToBacktest[id])
            .filter(Boolean);
        list.forEach(a => {
            const dom = list.some(b =>
                b.runId !== a.runId &&
                b.backtestData.metrics.strategyReturn >= a.backtestData.metrics.strategyReturn &&
                b.backtestData.metrics.maxDrawdown <= a.backtestData.metrics.maxDrawdown &&
                b.backtestData.metrics.sharpeRatio >= a.backtestData.metrics.sharpeRatio &&
                (
                    b.backtestData.metrics.strategyReturn > a.backtestData.metrics.strategyReturn ||
                    b.backtestData.metrics.maxDrawdown < a.backtestData.metrics.maxDrawdown ||
                    b.backtestData.metrics.sharpeRatio > a.backtestData.metrics.sharpeRatio
                )
            );

            if (!dom) ids.push(a.runId);
        });

        setPareto(ids);
    }, [selected, runsToBacktest]);

    const toggle = (id: number) => {
        setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
    };

    // Data for charts
    const lineData = mergeLines(effectiveSelected, runsToBacktest);
    const drawdownData = mergeDrawdowns(effectiveSelected, runsToBacktest);
    const winLossData = prepareWinLossData(effectiveSelected, runsToBacktest);
    const radarData = prepareRadarData(effectiveSelected, runsToBacktest);

    const scatter = effectiveSelected.map((id, idx) => ({
        id,
        ret: runsToBacktest[id]?.backtestData?.metrics.strategyReturn,
        dd: runsToBacktest[id]?.backtestData?.metrics.maxDrawdown,
        color: pareto.includes(id) ? "#ff7f0e" : ["#1f77b4", "#2ca02c", "#d62728", "#9467bd"][idx % 4]
    }));

    const metricsTableData = effectiveSelected
        .map(id => {
            const run = runsToBacktest[id]?.backtestData;
            if (!run) return null;
            return {
                id,
                ...calculateExtendedMetrics(run)
            };
        })
        .filter(Boolean);

    const bestValues = getBestMetricValues(metricsTableData);

    const palette = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b"]


    return (
        <div className="flex min-h-screen flex-col">
            <main className="flex-1 space-y-4 p-4 md:p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                        <Button variant="outline" size="icon" onClick={() => router.back()} className="mr-4">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">MA Crossover</h1>
                            <p className="text-muted-foreground">Strategy Comparison Dashboard</p>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <StrategyTempleteObserveResultsLoadingSkeleton />
                ) : (
                    <>


                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Configuration Panel */}
                            <div className="space-y-4">
                                <RunSelectionCard runHistorys={runHistorys} selected={selected} toggle={toggle} />
                            </div>

                            <div className="md:col-span-2">

                                <Tabs defaultValue="basic" >
                                    <TabsList className="grid w-[200px] grid-cols-2">
                                        <TabsTrigger value="basic">Basic</TabsTrigger>
                                        <TabsTrigger value="advanced">Advanced</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="basic">
                                        <BasicTabContent
                                            selected={selected}
                                            runs={runsToBacktest}
                                            lineData={lineData}
                                            monthlyData={winLossData}
                                            scatter={scatter}
                                            pareto={pareto}
                                            palette={palette}
                                        />
                                    </TabsContent>

                                    <TabsContent value="advanced">
                                        <AdvancedTabContent
                                            selected={selected}
                                            runs={runsToBacktest}
                                            drawdownData={drawdownData}
                                            radarData={radarData}
                                            winLossData={winLossData}
                                            metricsTableData={metricsTableData}
                                            bestValues={bestValues}
                                            palette={palette}
                                            formatMetric={m => m}
                                        />
                                    </TabsContent>
                                </Tabs>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}

