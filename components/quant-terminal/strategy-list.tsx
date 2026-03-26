'use client'

import { useQuantTerminalStore } from './store'
import { StrategyCard } from './strategy-card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

interface StrategyListProps {
  onNewStrategy?: () => void
}

export function StrategyList({ onNewStrategy }: StrategyListProps) {
  const { strategies, activeStrategyId, strategyStates, panelCollapsed, setActiveStrategy, togglePanel, addLog } = useQuantTerminalStore()

  const handleStrategyClick = (id: string) => {
    if (id === activeStrategyId) {
      togglePanel()
      return
    }
    setActiveStrategy(id)
    const strategy = strategies.find(s => s.id === id)
    if (strategy) {
      addLog('→', `<span class="hi">切换</span> ${strategy.name}`)
    }
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex items-center justify-between px-3.5 py-2.5">
        <span className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase font-medium">
          我的策略
        </span>
        <Button
          size="sm"
          onClick={onNewStrategy}
          className="h-7 px-3.5 rounded-full bg-gradient-to-r from-violet-600 to-blue-500 text-white text-[11px] font-semibold hover:opacity-90 transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/30 hover:-translate-y-0.5"
        >
          <Plus className="w-3 h-3 mr-1" />
          新建
        </Button>
      </div>
      <ScrollArea className="flex-1 px-2.5 pb-2.5">
        {strategies.map((strategy) => (
          <StrategyCard
            key={strategy.id}
            strategy={strategy}
            state={strategyStates[strategy.id]}
            isActive={strategy.id === activeStrategyId}
            isPanelOpen={!panelCollapsed}
            onClick={() => handleStrategyClick(strategy.id)}
          />
        ))}
      </ScrollArea>
    </div>
  )
}
