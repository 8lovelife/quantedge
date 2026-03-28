'use client'

import { cn } from '@/lib/utils'
import type { StrategyStages } from './types'

interface StatusBadgeProps {
  stages: StrategyStages
}

export function StatusBadge({ stages }: StatusBadgeProps) {
  const order: (keyof StrategyStages)[] = ['live', 'paper', 'bt', 'draft']

  // All stages completed = archived
  if (stages.live === 'done' && stages.paper === 'done' && stages.bt === 'done') {
    return (
      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-muted border border-border/50 text-muted-foreground">
        已归档
      </span>
    )
  }

  for (const k of order) {
    const st = stages[k]
    if (st === 'stopped') {
      return (
        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-red-500/10 border border-red-500/20 text-red-500">
          已终止
        </span>
      )
    }
    if (st === 'running') {
      const labels = { live: '实盘中', paper: '模拟中', bt: '回测中', draft: '草稿' }
      const styles = {
        live: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500',
        paper: 'bg-violet-500/10 border-violet-500/20 text-violet-500',
        bt: 'bg-blue-500/10 border-blue-500/20 text-blue-500',
        draft: 'bg-amber-500/10 border-amber-500/20 text-amber-500',
      }
      return (
        <span className={cn(
          "inline-block px-2 py-0.5 rounded text-[10px] font-mono font-medium border",
          styles[k]
        )}>
          {labels[k]}
        </span>
      )
    }
    if (st === 'paused') {
      return (
        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-muted border border-border text-muted-foreground">
          已暂停
        </span>
      )
    }
    if (st === 'done' && k !== 'draft') {
      return (
        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
          已完成
        </span>
      )
    }
  }

  return (
    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-500/10 border border-amber-500/20 text-amber-500">
      草稿
    </span>
  )
}