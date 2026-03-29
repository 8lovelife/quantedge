'use client'

import { useState } from 'react'
import { useQuantTerminalStore } from './store'
import { cn } from '@/lib/utils'
import { DraftTab } from './tabs/draft-tab'
import { BacktestTab } from './tabs/backtest-tab'
import { PaperTab } from './tabs/paper-tab'
import { LiveTab } from './tabs/live-tab'
import { LiveConfirmModal } from './live-confirm-modal'
import type { StrategyStages } from './types'

const stageColors = {
  draft: '#f59e0b',
  bt: '#3b82f6',
  paper: '#8b5cf6',
  live: '#10b981',
}

const stageNames = {
  draft: '草稿',
  bt: '回测',
  paper: '模拟交易',
  live: '实盘运行',
}

interface StageTabProps {
  stage: keyof StrategyStages
  index: number
  status: StrategyStages[keyof StrategyStages]
  isActive: boolean
  isClickable: boolean
  onClick: () => void
}

function StageTab({ stage, index, status, isActive, isClickable, onClick }: StageTabProps) {
  const color = stageColors[stage]
  const name = stageNames[stage]
  const isLocked = status === 'locked'
  const isDone = status === 'done'
  const isStopped = status === 'stopped'

  const getStatusText = () => {
    if (isLocked) return stage === 'paper' ? '&#128274; 需完成回测' : '&#128274; 需完成模拟'
    if (status === 'ready') return '&#9654; 点击开始'
    if (status === 'running') return '● 运行中'
    if (status === 'paused') return '&#9208; 已暂停'
    if (status === 'stopped') return '&#9632; 已终止'
    if (isDone) return stage === 'draft' ? '&#10003; 已生成' : '&#10003; 完成'
    return ''
  }

  return (
    <div
      onClick={isClickable ? onClick : undefined}
      className={cn(
        'flex-1 flex flex-col items-center justify-center py-2 px-2.5 border-r border-border/40 last:border-r-0 relative transition-all gap-0.5 bg-card',
        isActive && 'bg-gradient-to-br from-violet-500/5 to-blue-500/5',
        !isClickable && 'opacity-40 cursor-default',
        isClickable && !isActive && 'cursor-pointer hover:bg-muted/50',
      )}
    >
      <div
        className="w-[18px] h-[18px] rounded-full flex items-center justify-center font-mono text-[9px] font-semibold border-[1.5px]"
        style={{
          borderColor: isLocked ? 'currentColor' : color,
          backgroundColor: (isDone || isActive) && !isLocked ? color : 'transparent',
          color: isLocked ? 'currentColor' : (isDone || isActive) ? '#fff' : color,
        }}
      >
        {index + 1}
      </div>
      <div className="font-mono text-[10px] font-semibold" style={{ color: isLocked ? 'currentColor' : color }}>
        {name}
      </div>
      <div
        className="font-mono text-[9px]"
        style={{ color: isStopped ? '#ef4444' : isDone ? '#10b981' : isActive ? color : 'currentColor' }}
        dangerouslySetInnerHTML={{ __html: getStatusText() }}
      />
      {isActive && (
        <div className="absolute bottom-0 left-0 right-0 h-[3px]" style={{ backgroundColor: color }} />
      )}
    </div>
  )
}

// Determines clickability and view-only status for each tab based on current stage states
function getTabAccess(stages: StrategyStages) {
  const paperActive = stages.paper === 'running' || stages.paper === 'paused'
  const liveActive = stages.live === 'running' || stages.live === 'paused' || stages.live === 'stopped'
  const isFullyArchived = stages.live === 'done' && stages.paper === 'done' && stages.bt === 'done'

  return {
    draft: {
      isClickable: stages.draft !== 'locked',
      viewOnly: liveActive || paperActive || isFullyArchived,
      viewOnlyReason: liveActive ? 'live' : paperActive ? 'paper' : undefined,
    },
    bt: {
      isClickable: stages.bt !== 'locked',
      viewOnly: liveActive || paperActive || isFullyArchived,
      viewOnlyReason: liveActive ? 'live' : paperActive ? 'paper' : undefined,
    },
    paper: {
      isClickable: stages.paper !== 'locked',
      viewOnly: liveActive || isFullyArchived,
      viewOnlyReason: liveActive ? 'live' : undefined,
    },
    live: {
      isClickable: stages.live !== 'locked',
      viewOnly: isFullyArchived,
      viewOnlyReason: undefined,
    },
  } as Record<keyof StrategyStages, { isClickable: boolean; viewOnly: boolean; viewOnlyReason?: 'paper' | 'live' }>
}

export function StrategyPanel() {
  const {
    activeStrategyId,
    strategyStates,
    strategies,
    panelCollapsed,
    setActiveTab,
    setStrategyState,
    addLog,
    updateStrategy,
    cloneStrategy,
  } = useQuantTerminalStore()

  const [showLiveModal, setShowLiveModal] = useState(false)

  const state = strategyStates[activeStrategyId]
  const strategy = strategies.find((s) => s.id === activeStrategyId)

  if (!state || !strategy) return null

  // Max 3 versions per family — disable improve button when at limit
  const familySize = strategies.filter((s) => s.familyId === strategy.familyId).length
  const canImprove = familySize < 3

  const isArchived = state.stages.live === 'done' && state.stages.paper === 'done' && state.stages.bt === 'done'
  const access = getTabAccess(state.stages)

  const handleTabClick = (tab: keyof StrategyStages) => {
    if (!access[tab].isClickable) return
    if (state.activeTab === tab) return

    const status = state.stages[tab]

    // Only trigger start if the tab is NOT in view-only mode
    if (!access[tab].viewOnly) {
      if (tab === 'live' && status === 'ready') { setShowLiveModal(true); return }
      if (tab === 'bt' && status === 'ready') { handleStartBacktest(); return }
      if (tab === 'paper' && status === 'ready') { handleStartPaper(); return }
    }

    setActiveTab(tab)
  }

  const handleStartBacktest = () => {
    setStrategyState(activeStrategyId, {
      stages: { ...state.stages, bt: 'running' },
      activeTab: 'bt',
      btPts: [],
      btSigs: [],
    })
    addLog('回测', '<span class="hi">引擎启动</span>')
  }

  const handleStartPaper = () => {
    setStrategyState(activeStrategyId, {
      stages: { ...state.stages, paper: 'running' },
      activeTab: 'paper',
      paperPts: [],
      paperSigs: [],
      paperRef: [],
    })
    addLog('模拟', '<span class="hi">引擎启动</span>，虚拟 ¥100,000')
  }

  const handleConfirmLive = () => {
    setShowLiveModal(false)
    setStrategyState(activeStrategyId, {
      stages: { ...state.stages, live: 'running' },
      activeTab: 'live',
    })
    addLog('实盘', '<span class="hi">引擎启动</span>，连接交易所')
  }

  const handlePauseLive = () => {
    setStrategyState(activeStrategyId, { stages: { ...state.stages, live: 'paused' } })
    addLog('实盘', '<span class="warn">已暂停</span>，持仓保持')
  }

  const handleResumeLive = () => {
    setStrategyState(activeStrategyId, { stages: { ...state.stages, live: 'running' } })
    addLog('实盘', '<span class="hi">已恢复</span>')
  }

  const handleStopLive = () => {
    setStrategyState(activeStrategyId, { stages: { ...state.stages, live: 'stopped' } })
    addLog('实盘', '<span class="sell">已终止</span>，所有持仓已平仓')
  }

  const handleRestartLive = () => { setShowLiveModal(true) }

  const handleArchiveLive = () => {
    setStrategyState(activeStrategyId, {
      stages: { ...state.stages, live: 'done' },
      activeTab: 'live',
    })
    updateStrategy(activeStrategyId, { returnHint: '已归档' })
    addLog('实盘', '策略已<span class="mono">归档</span>')
  }

  // THE ONE improve action — always creates a new version in the same family, always goes forward
  const handleImprove = () => {
    if (!canImprove) return
    cloneStrategy(activeStrategyId)
    addLog('策略', '已创建新版本，<span class="hi">从草稿开始</span> →')
  }

  const renderTabContent = () => {
    const { viewOnly, viewOnlyReason } = access[state.activeTab]

    switch (state.activeTab) {
      case 'draft': {
        // Params are locked once backtest has been started at least once
        const draftParamsLocked = state.stages.bt !== 'ready' && state.stages.bt !== 'locked'
        return (
          <DraftTab
            onStartBacktest={handleStartBacktest}
            readOnly={draftParamsLocked}
          />
        )
      }
      case 'bt':
        return (
          <BacktestTab
            onStartPaper={handleStartPaper}
            onStartBacktest={handleStartBacktest}
            viewOnly={viewOnly && !isArchived}
            viewOnlyReason={viewOnlyReason}
            readOnly={isArchived}
            onClone={canImprove ? handleImprove : undefined}
          />
        )
      case 'paper':
        return (
          <PaperTab
            onStartLive={() => setShowLiveModal(true)}
            viewOnly={viewOnly && !isArchived}
            viewOnlyReason={viewOnlyReason}
            readOnly={isArchived}
            onClone={canImprove ? handleImprove : undefined}
          />
        )
      case 'live':
        return (
          <LiveTab
            onPause={handlePauseLive}
            onResume={handleResumeLive}
            onStop={handleStopLive}
            onRestart={handleRestartLive}
            onArchive={handleArchiveLive}
            readOnly={isArchived}
            onClone={canImprove ? handleImprove : undefined}
          />
        )
      default:
        return null
    }
  }

  return (
    <>
      <div
        className={cn(
          'bg-card flex flex-col overflow-hidden h-full w-full shadow-[1px_0_3px_rgba(0,0,0,0.03)]',
          panelCollapsed && 'opacity-0 pointer-events-none'
        )}
      >
        <div className={cn('flex flex-col h-full transition-opacity', panelCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100')}>
          {/* Header */}
          <div className="flex items-stretch border-b border-border/40 bg-card">
            <div className="px-4 py-2.5 flex flex-col justify-center border-r border-border/40 min-w-0">
              <div className="text-sm font-semibold text-foreground truncate">{strategy.name}</div>
              <div className="font-mono text-[10px] text-muted-foreground mt-0.5">
                {strategy.asset} · {strategy.type} · {strategy.timeframe}
                {strategy.clonedFrom && <span className="ml-1.5 text-violet-500">· 优化版</span>}
              </div>
            </div>
            <div className="flex flex-1">
              {(['draft', 'bt', 'paper', 'live'] as const).map((stage, i) => (
                <StageTab
                  key={stage}
                  stage={stage}
                  index={i}
                  status={state.stages[stage]}
                  isActive={state.activeTab === stage}
                  isClickable={access[stage].isClickable}
                  onClick={() => handleTabClick(stage)}
                />
              ))}
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-auto bg-muted/30">
            {isArchived && (
              <div className="mx-5 mt-4 px-3 py-2 rounded-lg bg-muted/80 border border-border/60 flex items-center gap-2">
                <span className="text-[11px]">&#128193;</span>
                <span className="font-mono text-[10px] text-muted-foreground">策略已归档，仅供查看</span>
                {canImprove ? (
                  <button onClick={handleImprove} className="ml-auto font-mono text-[10px] text-violet-500 hover:underline">
                    📊 调整参数再跑一次 →
                  </button>
                ) : (
                  <span className="ml-auto font-mono text-[10px] text-muted-foreground/50">
                    已达最大版本数 (3)
                  </span>
                )}
              </div>
            )}
            <div className="p-5 flex flex-col gap-3.5 min-h-full">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>

      <LiveConfirmModal
        open={showLiveModal}
        onClose={() => setShowLiveModal(false)}
        onConfirm={handleConfirmLive}
      />
    </>
  )
}