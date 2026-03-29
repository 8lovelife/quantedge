// Quant Terminal Types

export type StageStatus = 'locked' | 'ready' | 'running' | 'paused' | 'done' | 'stopped'

export type BtRange = '1m' | '3m' | '6m' | '1y'

export interface Strategy {
  id: string
  name: string          // base name, no version suffix
  asset: string
  timeframe: string
  type: string
  returnRate: string
  returnHint: string
  familyId: string      // groups original + all clones together
  version: number       // 1 = original, 2 = first iteration, etc.
}

export interface StrategyStages {
  draft: StageStatus
  bt: StageStatus
  paper: StageStatus
  live: StageStatus
}

export interface StrategyState {
  stages: StrategyStages
  activeTab: 'draft' | 'bt' | 'paper' | 'live'
  btRange: BtRange
  btPts: number[]
  btSigs: Signal[]
  btDone: boolean
  paperPts: number[]
  paperSigs: Signal[]
  paperRef: number[]
  paperDone: boolean
  livePts: number[]
  liveSigs: Signal[]
  showPro: boolean
  parsedParams?: ParsedParams
  dslCode?: string
}

export interface Signal {
  i: number
  type: 'buy' | 'sell'
}

export interface ParsedParams {
  name: string
  asset: string
  tf: string
  sl: string
  tp: string
  pos: string
  stratType: string
}

export interface MarketAsset {
  symbol: string
  name: string
  price: string
  change: string
  isUp: boolean
}

export interface LogItem {
  time: string
  tag: string
  message: string
}

export interface ChatMessage {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
}

// A family = original strategy + all iterations, grouped for display
export interface StrategyFamily {
  familyId: string
  baseName: string
  members: Strategy[] // sorted version asc, latest first for display
}