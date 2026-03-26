'use client'

import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'
import type { Strategy, StrategyState } from './types'
import { StatusBadge } from './status-badge'
import { PipBar } from './pip-bar'

interface StrategyCardProps {
  strategy: Strategy
  state: StrategyState
  isActive: boolean
  isPanelOpen: boolean
  onClick: () => void
}

const stageColors = {
  draft: '#f59e0b',
  bt: '#3b82f6',
  paper: '#8b5cf6',
  live: '#10b981',
}

function getLastActivePipColor(stages: StrategyState['stages']) {
  const order: (keyof typeof stages)[] = ['live', 'paper', 'bt', 'draft']
  for (const k of order) {
    const st = stages[k]
    if (st === 'running' || st === 'done' || st === 'paused') {
      return stageColors[k]
    }
  }
  return stageColors.draft
}

export function StrategyCard({ strategy, state, isActive, isPanelOpen, onClick }: StrategyCardProps) {
  const returnStyle = strategy.returnRate.startsWith('+')
    ? 'text-emerald-500'
    : strategy.returnRate.startsWith('-')
    ? 'text-red-500'
    : 'text-muted-foreground'

  const chevronColor = isActive ? getLastActivePipColor(state.stages) : 'currentColor'

  return (
    <div
      onClick={onClick}
      className={cn(
        "mb-2 p-3 bg-card border rounded-xl cursor-pointer transition-all shadow-sm hover:shadow-md",
        "hover:border-violet-500/30",
        isActive && "border-violet-500 bg-gradient-to-br from-violet-500/5 to-blue-500/5 ring-[3px] ring-violet-500/10"
      )}
    >
      <div className="flex justify-between items-start mb-1">
        <div className="text-[13px] text-foreground font-semibold">
          {strategy.name}
        </div>
        <StatusBadge stages={state.stages} />
      </div>
      <div className="font-mono text-[10px] text-muted-foreground">
        {strategy.asset} · {strategy.type} · {strategy.timeframe}
      </div>
      <div className={cn("font-mono text-[10px] mt-1 font-medium", returnStyle)}>
        {strategy.returnRate || strategy.returnHint}
        {strategy.returnRate && (
          <span className="text-muted-foreground ml-1">{strategy.returnHint}</span>
        )}
      </div>
      <div className="flex items-center gap-1">
        <div className="flex-1">
          <PipBar stages={state.stages} />
        </div>
        <div className={cn(
          "w-[18px] h-[14px] flex items-center justify-center ml-1 transition-opacity",
          isActive ? "opacity-100" : "opacity-0"
        )}>
          <ChevronDown
            className={cn(
              "w-2.5 h-2.5 transition-transform duration-300",
              isActive && isPanelOpen && "rotate-180"
            )}
            style={{ color: chevronColor }}
          />
        </div>
      </div>
    </div>
  )
}
