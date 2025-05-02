"use client"
import StrategyBuilder from "@/components/strategy-builder/strategy-builder";
import { useParams } from "next/navigation";

export default function EditStrategyPage() {
    const pathParams = useParams()
    const strategyId = typeof pathParams.id === "string" ? pathParams.id : "1"
    return <StrategyBuilder strategyId={parseInt(strategyId)} mode="edit" />;
}