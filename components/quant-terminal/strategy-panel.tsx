'use client'

import { useState } from 'react'
import { useQuantTerminalStore, initialStrategies } from './store'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
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
  onClick: () => void
}

function StageTab({ stage, index, status, isActive, onClick }: StageTabProps) {
  const color = stageColors[stage]
  const name = stageNames[stage]
  const isLocked = status === 'locked'
  const isDone = status === 'done'

  const getStatusText = () => {
    if (isLocked) return stage === 'paper' ? '&#128274; 需完成回测' : '&#128274; 需完成模拟'
    if (status === 'ready') return '&#9654; 点击开始'
    if (status === 'running') return '● 运行中'
    if (status === 'paused') return '&#9208; 已暂停'
    if (isDone) return stage === 'draft' ? '&#10003; 已生成' : '&#10003; 完成'
    return ''
  }

  return (
    <div
      onClick={isLocked ? undefined : onClick}
      className={cn(
        "flex-1 flex flex-col items-center justify-center py-2 px-2.5 border-r border-border/40 last:border-r-0 cursor-pointer relative transition-all gap-0.5 bg-card",
        isActive && "bg-gradient-to-br from-violet-500/5 to-blue-500/5",
        isLocked && "opacity-40 cursor-default",
        !isLocked && !isActive && "hover:bg-muted/50"
      )}
      style={{ '--tab-color': color } as React.CSSProperties}
    >
      <div
        className={cn(
          "w-[18px] h-[18px] rounded-full flex items-center justify-center font-mono text-[9px] font-semibold border-[1.5px]",
          (isDone || isActive) && "text-white"
        )}
        style={{
          borderColor: isLocked ? 'currentColor' : color,
          backgroundColor: (isDone || isActive) && !isLocked ? color : 'transparent',
          color: isLocked ? 'currentColor' : (isDone || isActive) ? '#fff' : color,
        }}
      >
        {index + 1}
      </div>
      <div
        className="font-mono text-[10px] font-semibold"
        style={{ color: isLocked ? 'currentColor' : color }}
      >
        {name}
      </div>
      <div
        className="font-mono text-[9px]"
        style={{ color: isDone ? '#10b981' : isActive ? color : 'currentColor' }}
        dangerouslySetInnerHTML={{ __html: getStatusText() }}
      />
      {isActive && (
        <div
          className="absolute bottom-0 left-0 right-0 h-[3px]"
          style={{ backgroundColor: color }}
        />
      )}
    </div>
  )
}

export function StrategyPanel() {
  const {
    activeStrategyId,
    strategyStates,
    panelCollapsed,
    setActiveTab,
    setStrategyState,
    addLog,
  } = useQuantTerminalStore()

  const [showLiveModal, setShowLiveModal] = useState(false)

  const state = strategyStates[activeStrategyId]
  const strategy = initialStrategies.find((s) => s.id === activeStrategyId)

  if (!state || !strategy) return null

  const handleTabClick = (tab: keyof StrategyStages) => {
    const status = state.stages[tab]
    if (status === 'locked') return

    if (tab === 'live' && status === 'ready') {
      setShowLiveModal(true)
      return
    }

    if (tab === 'bt' && status === 'ready') {
      handleStartBacktest()
      return
    }

    if (tab === 'paper' && status === 'ready') {
      handleStartPaper()
      return
    }

    setActiveTab(tab)
  }

  const handleStartBacktest = () => {
    setStrategyState(activeStrategyId, {
      stages: { ...state.stages, bt: 'running' },
      activeTab: 'bt',
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
    setStrategyState(activeStrategyId, {
      stages: { ...state.stages, live: 'paused' },
    })
    addLog('实盘', '<span class="warn">已暂停</span>，持仓保持')
  }

  const handleResumeLive = () => {
    setStrategyState(activeStrategyId, {
      stages: { ...state.stages, live: 'running' },
    })
    addLog('实盘', '<span class="hi">已恢复</span>')
  }

  const renderTabContent = () => {
    switch (state.activeTab) {
      case 'draft':
        return <DraftTab onStartBacktest={handleStartBacktest} />
      case 'bt':
        return <BacktestTab onStartPaper={handleStartPaper} onStartBacktest={handleStartBacktest} />
      case 'paper':
        return <PaperTab onStartLive={() => setShowLiveModal(true)} />
      case 'live':
        return <LiveTab onPause={handlePauseLive} onResume={handleResumeLive} />
      default:
        return null
    }
  }

  return (
    <>
      <div
        className={cn(
          "bg-card flex flex-col overflow-hidden h-full w-full shadow-[1px_0_3px_rgba(0,0,0,0.03)]",
          panelCollapsed && "opacity-0 pointer-events-none"
        )}
      >
        <div className={cn("flex flex-col h-full transition-opacity", panelCollapsed ? "opacity-0 pointer-events-none" : "opacity-100")}>
          {/* Header */}
          <div className="flex items-stretch border-b border-border/40 bg-card">
            <div className="px-4 py-2.5 flex flex-col justify-center border-r border-border/40 min-w-0">
              <div className="text-sm font-semibold text-foreground truncate">{strategy.name}</div>
              <div className="font-mono text-[10px] text-muted-foreground mt-0.5">
                {strategy.asset} · {strategy.type} · {strategy.timeframe}
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
                  onClick={() => handleTabClick(stage)}
                />
              ))}
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-auto bg-muted/30">
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
