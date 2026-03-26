'use client'

import { cn } from '@/lib/utils'
import type { StrategyStages, StageStatus } from './types'

interface PipBarProps {
  stages: StrategyStages
}

const stageColors = {
  draft: 'bg-amber-500',
  bt: 'bg-blue-500',
  paper: 'bg-violet-500',
  live: 'bg-emerald-500',
}

function getPipClass(status: StageStatus, key: keyof StrategyStages) {
  if (status === 'done') return cn('h-1 flex-1 rounded-sm', stageColors[key])
  if (status === 'running' || status === 'paused') return cn('h-1 flex-1 rounded-sm animate-pulse', stageColors[key])
  return 'h-1 flex-1 rounded-sm bg-muted'
}

export function PipBar({ stages }: PipBarProps) {
  return (
    <div className="flex items-center gap-0.5 mt-2">
      {(['draft', 'bt', 'paper', 'live'] as const).map((key) => (
        <div key={key} className={getPipClass(stages[key], key)} />
      ))}
    </div>
  )
}
