'use client'

import { useQuantTerminalStore } from './store'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Strategy, StrategyState, StrategyFamily } from './types'

interface StrategyListProps {
  onNewStrategy?: () => void
}

// ── helpers ────────────────────────────────────────────────────────────────

function buildFamilies(strategies: Strategy[]): StrategyFamily[] {
  const map = new Map<string, StrategyFamily>()
  // preserve insertion order of first appearance
  for (const s of strategies) {
    if (!map.has(s.familyId)) {
      map.set(s.familyId, { familyId: s.familyId, baseName: s.name, members: [] })
    }
    map.get(s.familyId)!.members.push(s)
  }
  // sort members by version asc
  for (const f of map.values()) {
    f.members.sort((a, b) => a.version - b.version)
  }
  return Array.from(map.values())
}

function getStageLabel(state: StrategyState): { text: string; color: string } {
  const { stages } = state
  if (stages.live === 'running') return { text: '● 实盘中', color: 'text-emerald-500' }
  if (stages.live === 'paused') return { text: '⏸ 实盘暂停', color: 'text-amber-500' }
  if (stages.live === 'stopped') return { text: '■ 已终止', color: 'text-red-500' }
  if (stages.live === 'done') return { text: '✓ 已归档', color: 'text-muted-foreground' }
  if (stages.paper === 'running') return { text: '● 模拟中', color: 'text-violet-500' }
  if (stages.paper === 'paused') return { text: '⏸ 模拟暂停', color: 'text-amber-500' }
  if (stages.paper === 'done') return { text: '✓ 模拟完成', color: 'text-violet-500' }
  if (stages.bt === 'running') return { text: '● 回测中', color: 'text-blue-500' }
  if (stages.bt === 'done') return { text: '✓ 回测完成', color: 'text-blue-500' }
  if (stages.bt === 'ready') return { text: '待回测', color: 'text-muted-foreground' }
  return { text: '草稿', color: 'text-amber-500' }
}

function getReturnDisplay(strategy: Strategy, state: StrategyState): { bt?: string; paper?: string; live?: string } {
  return {
    bt: state.btDone ? '+34.2%' : undefined,
    paper: state.paperDone ? '+5.2%' : undefined,
    live: strategy.returnRate && strategy.returnRate !== '' ? strategy.returnRate : undefined,
  }
}

// pip color map
const STAGE_COLOR = { draft: '#f59e0b', bt: '#3b82f6', paper: '#8b5cf6', live: '#10b981' }

function ActivePip({ state }: { state: StrategyState }) {
  const { stages } = state
  const order = ['live', 'paper', 'bt', 'draft'] as const
  for (const k of order) {
    const st = stages[k]
    if (st === 'running' || st === 'paused') {
      return <span className="w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0" style={{ backgroundColor: STAGE_COLOR[k] }} />
    }
  }
  return null
}

// ── Member row (inside an expanded family) ─────────────────────────────────

interface MemberRowProps {
  strategy: Strategy
  state: StrategyState
  isActive: boolean
  isLatest: boolean
  onClick: () => void
}

function MemberRow({ strategy, state, isActive, isLatest, onClick }: MemberRowProps) {
  const label = getStageLabel(state)
  const ret = getReturnDisplay(strategy, state)

  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-all border',
        isActive
          ? 'bg-gradient-to-r from-violet-500/8 to-blue-500/5 border-violet-500/40'
          : 'border-transparent hover:bg-muted/60 hover:border-border/40'
      )}
    >
      {/* Version badge */}
      <div className={cn(
        'flex-shrink-0 w-[28px] h-[18px] rounded text-[9px] font-mono font-bold flex items-center justify-center',
        isLatest ? 'bg-violet-500/15 text-violet-500' : 'bg-muted text-muted-foreground'
      )}>
        v{strategy.version}
      </div>

      {/* Stage + returns */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <ActivePip state={state} />
          <span className={cn('font-mono text-[10px] font-medium truncate', label.color)}>
            {label.text}
          </span>
        </div>
        {/* Compact return comparison */}
        <div className="flex items-center gap-1.5 mt-0.5">
          {ret.bt && (
            <span className="font-mono text-[9px] text-blue-500">回测{ret.bt}</span>
          )}
          {ret.paper && (
            <span className="font-mono text-[9px] text-violet-500">模拟{ret.paper}</span>
          )}
          {ret.live && (
            <span className={cn('font-mono text-[9px] font-semibold', ret.live.startsWith('+') ? 'text-emerald-500' : 'text-red-500')}>
              实盘{ret.live}
            </span>
          )}
          {!ret.bt && !ret.paper && !ret.live && (
            <span className="font-mono text-[9px] text-muted-foreground/50">暂无数据</span>
          )}
        </div>
      </div>

      {/* Active indicator */}
      {isActive && (
        <div className="w-1 h-4 rounded-full flex-shrink-0" style={{
          backgroundColor: STAGE_COLOR[
            state.stages.live === 'running' || state.stages.live === 'paused' ? 'live' :
              state.stages.paper === 'running' || state.stages.paper === 'paused' ? 'paper' :
                state.stages.bt === 'running' ? 'bt' : 'draft'
          ]
        }} />
      )}
    </div>
  )
}

// ── Family group ────────────────────────────────────────────────────────────

interface FamilyGroupProps {
  family: StrategyFamily
  activeStrategyId: string
  strategyStates: Record<string, StrategyState>
  isCollapsed: boolean
  onToggleCollapse: () => void
  onSelectStrategy: (id: string) => void
}

function FamilyGroup({ family, activeStrategyId, strategyStates, isCollapsed, onToggleCollapse, onSelectStrategy }: FamilyGroupProps) {
  const hasActiveMember = family.members.some((m) => m.id === activeStrategyId)

  // Find the "best" summary status to show on the collapsed header
  const liveRunning = family.members.find((m) => strategyStates[m.id]?.stages.live === 'running')
  const paperRunning = family.members.find((m) => strategyStates[m.id]?.stages.paper === 'running')
  const latest = family.members[family.members.length - 1]
  const summaryState = liveRunning ?? paperRunning ?? latest

  const summaryLabel = summaryState ? getStageLabel(strategyStates[summaryState.id]) : null

  return (
    <div className={cn(
      'mb-2 rounded-xl border overflow-hidden transition-all',
      hasActiveMember ? 'border-violet-500/40 shadow-sm' : 'border-border/50'
    )}>
      {/* Family header — click to collapse/expand */}
      <div
        onClick={onToggleCollapse}
        className={cn(
          'flex items-center gap-2 px-3 py-2.5 cursor-pointer transition-colors',
          hasActiveMember ? 'bg-gradient-to-r from-violet-500/8 to-blue-500/5' : 'bg-card hover:bg-muted/40'
        )}
      >
        {/* Chevron */}
        <ChevronRight className={cn(
          'w-3 h-3 text-muted-foreground flex-shrink-0 transition-transform duration-200',
          !isCollapsed && 'rotate-90'
        )} />

        {/* Base name */}
        <div className="flex-1 min-w-0">
          <div className="text-[12px] font-semibold text-foreground truncate">{family.baseName}</div>
          <div className="font-mono text-[9px] text-muted-foreground mt-0.5">
            {latest.asset} · {family.members.length}个版本
            {summaryLabel && (
              <span className={cn('ml-1.5', summaryLabel.color)}>{summaryLabel.text}</span>
            )}
          </div>
        </div>

        {/* Running pip */}
        {(liveRunning || paperRunning) && (
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0"
            style={{ backgroundColor: liveRunning ? STAGE_COLOR.live : STAGE_COLOR.paper }}
          />
        )}
      </div>

      {/* Members list */}
      {!isCollapsed && (
        <div className="px-2 pb-2 pt-1 bg-card space-y-0.5">
          {/* Show latest version first */}
          {[...family.members].reverse().map((member) => {
            const memberState = strategyStates[member.id]
            if (!memberState) return null
            const isLatest = member.version === Math.max(...family.members.map((m) => m.version))
            return (
              <MemberRow
                key={member.id}
                strategy={member}
                state={memberState}
                isActive={member.id === activeStrategyId}
                isLatest={isLatest}
                onClick={() => onSelectStrategy(member.id)}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Main component ──────────────────────────────────────────────────────────

export function StrategyList({ onNewStrategy }: StrategyListProps) {
  const {
    strategies,
    activeStrategyId,
    strategyStates,
    panelCollapsed,
    collapsedFamilies,
    setActiveStrategy,
    togglePanel,
    toggleFamilyCollapse,
    addLog,
  } = useQuantTerminalStore()

  const families = buildFamilies(strategies)

  const handleSelectStrategy = (id: string) => {
    if (id === activeStrategyId) {
      togglePanel()
      return
    }
    setActiveStrategy(id)
    const s = strategies.find((s) => s.id === id)
    if (s) addLog('→', `<span class="hi">切换</span> ${s.name} v${s.version}`)
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
        {families.map((family) => (
          <FamilyGroup
            key={family.familyId}
            family={family}
            activeStrategyId={activeStrategyId}
            strategyStates={strategyStates}
            isCollapsed={collapsedFamilies[family.familyId] ?? false}
            onToggleCollapse={() => toggleFamilyCollapse(family.familyId)}
            onSelectStrategy={handleSelectStrategy}
          />
        ))}
      </ScrollArea>
    </div>
  )
}