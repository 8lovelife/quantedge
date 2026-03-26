'use client'

import { cn } from '@/lib/utils'
import { initialMarkets } from './store'

export function MarketQuotes() {
  return (
    <div className="p-3 border-b border-border/40">
      <div className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase mb-2 font-medium">
        市场行情
      </div>
      <div className="space-y-1">
        {initialMarkets.map((asset) => (
          <div
            key={asset.symbol}
            className="flex items-center justify-between py-1.5 px-1.5 -mx-1.5 rounded-md cursor-pointer hover:bg-muted/50 transition-colors"
          >
            <div>
              <div className="font-mono text-xs text-foreground font-medium">
                {asset.symbol}
              </div>
              <div className="text-[10px] text-muted-foreground">
                {asset.name}
              </div>
            </div>
            <div className="text-right">
              <div className={cn(
                "font-mono text-xs font-medium",
                asset.isUp ? "text-emerald-500" : "text-red-500"
              )}>
                {asset.price}
              </div>
              <div className={cn(
                "text-[10px]",
                asset.isUp ? "text-emerald-500" : "text-red-500"
              )}>
                {asset.change}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
