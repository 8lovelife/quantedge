'use client'

import { useState } from 'react'
import { useQuantTerminalStore } from '../store'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { BtRange } from '../types'

interface DraftTabProps {
  onStartBacktest: () => void
  readOnly?: boolean
}

const BT_RANGES: { value: BtRange; label: string; desc: string; minNote?: string }[] = [
  { value: '1m', label: '1个月', desc: '快速验证，结果参考性较低' },
  { value: '3m', label: '3个月', desc: '推荐，覆盖牛熊转换', minNote: undefined },
  { value: '6m', label: '6个月', desc: '更充分，结果更可信' },
  { value: '1y', label: '1年', desc: '最全面，耗时较长' },
]

const BT_RANGE_LABELS: Record<BtRange, string> = {
  '1m': '近1个月',
  '3m': '近3个月',
  '6m': '近6个月',
  '1y': '近1年',
}

export function DraftTab({ onStartBacktest, readOnly }: DraftTabProps) {
  const { togglePro, activeStrategyId, strategyStates, setBtRange } = useQuantTerminalStore()
  const state = strategyStates[activeStrategyId]
  const showPro = state?.showPro ?? false
  const btRange = state?.btRange ?? '3m'
  const [dslCode, setDslCode] = useState('')

  const pp = state?.parsedParams || {
    name: '均线突破策略',
    asset: 'BTC/USDT',
    tf: '4h',
    sl: '2%',
    tp: '6%',
    pos: '10%',
    stratType: 'ema_cross',
  }

  const dslMap: Record<string, string> = {
    ema_cross: `entry  ema(7) > ema(25) and vol > avg(20)*1.3\n  exit   close < ema(7)`,
    grid: `entry  price < lower_band(20, 2.0)\n  exit   price > upper_band(20, 2.0)`,
    low_risk: `entry  ema(7) > ema(25) and rsi < 65 and vol > avg(20)*1.2\n  exit   close < ema(7) or rsi > 75`,
  }

  const defaultDslCode = `strategy "${pp.name}" {\n  asset      ${pp.asset}  tf ${pp.tf}\n  ${dslMap[pp.stratType] || dslMap.ema_cross}\n  stop_loss  ${pp.sl}  take_profit ${pp.tp}  position ${pp.pos}\n  // AI 置信度 87% · 参数可调整\n}`

  return (
    <div className="flex flex-col gap-4 flex-1">
      {/* Plain cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card border border-border/50 rounded-xl p-3 shadow-sm">
          <div className="text-lg mb-1.5">&#128176;</div>
          <div className="text-[10px] text-muted-foreground mb-1 font-medium">过去3个月如果用这个策略</div>
          <div className="text-sm font-semibold text-emerald-500">大概赚了 34%</div>
          <div className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
            投入 ¥10,000 约多了 ¥3,400（历史数据，不代表未来）
          </div>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-3 shadow-sm">
          <div className="text-lg mb-1.5">&#127919;</div>
          <div className="text-[10px] text-muted-foreground mb-1 font-medium">10次交易里</div>
          <div className="text-sm font-semibold text-amber-500">大概 6次 赚钱</div>
          <div className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
            4次亏损，但赚的时候比亏的时候多，整体正收益
          </div>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-3 shadow-sm">
          <div className="text-lg mb-1.5">&#128737;&#65039;</div>
          <div className="text-[10px] text-muted-foreground mb-1 font-medium">最坏情况</div>
          <div className="text-sm font-semibold text-red-500">最多亏过 8%</div>
          <div className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
            即 ¥10,000 最多单次亏 ¥800，之后自动止损离场
          </div>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-3 shadow-sm">
          <div className="text-lg mb-1.5">&#9201;&#65039;</div>
          <div className="text-[10px] text-muted-foreground mb-1 font-medium">需要你做什么</div>
          <div className="text-[13px] font-semibold text-foreground">几乎不用管</div>
          <div className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
            每4小时自动检查一次行情，条件满足自动买卖
          </div>
        </div>
      </div>

      {/* Strategy rules */}
      <div>
        <div className="font-mono text-[10px] text-muted-foreground tracking-wider mb-2 font-medium uppercase">
          策略规则（白话版）
        </div>
        <div className="space-y-2">
          {[
            { icon: '&#128994;', title: '什么时候买？', desc: '当短期趋势超过长期趋势，且今天交易量比平时多30%，自动买入。' },
            { icon: '&#128308;', title: '什么时候卖？', desc: '涨了 <strong>6%</strong> 锁定利润；或跌超 <strong>2%</strong> 自动止损，不让亏太多。' },
            { icon: '&#128188;', title: '每次用多少钱？', desc: '每次最多用账户的 <strong>10%</strong>，不会把所有钱押上。' },
          ].map((rule, i) => (
            <div key={i} className="flex gap-3 p-3 bg-card border border-border/50 rounded-lg shadow-sm">
              <span className="text-base flex-shrink-0" dangerouslySetInnerHTML={{ __html: rule.icon }} />
              <div>
                <div className="text-[13px] text-foreground mb-0.5 font-medium">{rule.title}</div>
                <div
                  className="text-xs text-muted-foreground leading-relaxed [&_strong]:text-foreground"
                  dangerouslySetInnerHTML={{ __html: rule.desc }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Backtest range selector */}
      {!readOnly && (
        <div className="bg-card border border-border/50 rounded-xl p-3 shadow-sm">
          <div className="font-mono text-[10px] text-muted-foreground tracking-wider mb-2.5 font-medium uppercase flex items-center gap-1.5">
            <span>&#128337;</span> 回测时间范围
          </div>
          <div className="grid grid-cols-4 gap-1.5 mb-2">
            {BT_RANGES.map((r) => (
              <button
                key={r.value}
                onClick={() => setBtRange(activeStrategyId, r.value)}
                className={cn(
                  'flex flex-col items-center py-2 px-1 rounded-lg border text-center transition-all',
                  btRange === r.value
                    ? 'bg-blue-500/10 border-blue-500 text-blue-500'
                    : 'bg-muted/40 border-border/50 text-muted-foreground hover:border-blue-500/40 hover:text-foreground'
                )}
              >
                <span className={cn('font-mono text-[11px] font-semibold', btRange === r.value ? 'text-blue-500' : '')}>
                  {r.label}
                </span>
                {r.value === '3m' && (
                  <span className="text-[8px] mt-0.5 px-1 rounded bg-blue-500/20 text-blue-500 font-medium">推荐</span>
                )}
              </button>
            ))}
          </div>
          <div className="text-[10px] text-muted-foreground leading-relaxed">
            {BT_RANGES.find((r) => r.value === btRange)?.desc}
            {btRange === '1m' && (
              <span className="text-amber-500 ml-1">· 建议至少选3个月，结果更可信</span>
            )}
          </div>
        </div>
      )}

      {/* Pro toggle */}
      <div className="flex items-center gap-1.5 cursor-pointer py-1.5 group" onClick={togglePro}>
        <span className="font-mono text-[10px] text-muted-foreground font-medium group-hover:text-violet-500 transition-colors">
          {showPro ? '▲ 收起' : '▼ 查看'} 专业模式（DSL代码）
        </span>
      </div>

      {showPro && (
        <div className="bg-card border border-border/50 border-l-[3px] border-l-violet-500 rounded-xl p-3 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="font-mono text-[10px] text-muted-foreground font-medium">
              DSL 代码
              {readOnly && <span className="ml-2 text-amber-500">· 已锁定，想修改请创建新策略</span>}
            </span>
          </div>
          <textarea
            className="w-full h-40 p-3 bg-muted/50 border border-border rounded-lg font-mono text-[11px] text-foreground leading-relaxed resize-none outline-none cursor-default select-text"
            spellCheck={false}
            value={dslCode || defaultDslCode}
            readOnly
          />
        </div>
      )}

      {/* Action button */}
      {!readOnly && (
        <div className="flex gap-2.5">
          <Button
            onClick={onStartBacktest}
            className="flex-1 h-10 bg-blue-500/10 border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white font-mono text-[11px] font-medium"
            variant="outline"
          >
            &#9654; 开始回测 — 验证 {BT_RANGE_LABELS[btRange]} 历史表现
          </Button>
        </div>
      )}
    </div>
  )
}