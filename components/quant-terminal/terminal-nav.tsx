'use client'

import { useQuantTerminalStore } from './store'

export function TerminalNav() {
  const { btcPrice } = useQuantTerminalStore()

  return (
    <nav className="flex items-center justify-between px-6 h-14 bg-card/95 backdrop-blur-xl border-b border-border/40 z-50 relative flex-shrink-0 shadow-sm">
      <div className="text-lg font-bold bg-gradient-to-r from-violet-600 to-blue-500 bg-clip-text text-transparent tracking-tight">
        QuantEdge<sub className="text-[10px] font-medium text-muted-foreground ml-0.5">AI</sub>
      </div>
      <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)] animate-pulse" />
        <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-500 font-semibold">
          ENGINE LIVE
        </span>
        <span className="text-muted-foreground mx-2">·</span>
        <span className="text-muted-foreground">BTC</span>
        <span className="text-foreground font-semibold mx-1">{btcPrice.toLocaleString()}</span>
        <span className="text-emerald-500 text-[11px]">+2.41%</span>
        <span className="text-muted-foreground mx-2">·</span>
        <span className="text-muted-foreground">ETH</span>
        <span className="text-foreground font-semibold ml-1">3,182</span>
        <span className="text-emerald-500 text-[11px] ml-1">+1.87%</span>
      </div>
    </nav>
  )
}
