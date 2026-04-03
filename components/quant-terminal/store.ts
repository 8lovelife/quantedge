"use client";

import { create } from "zustand";
import type {
  Strategy,
  StrategyState,
  LogItem,
  ChatMessage,
  MarketAsset,
  BtRange,
  PaperPlanDays,
} from "./types";

// Initial strategies data — each gets its own familyId (no clones yet)
export const initialStrategies: Strategy[] = [
  {
    id: "s1",
    name: "均线突破策略",
    asset: "BTC/USDT",
    timeframe: "4h",
    type: "趋势",
    returnRate: "+12.4%",
    returnHint: "本月实盘",
    btResult: "+34.2%",
    paperResult: "+5.2%",
    liveResult: "+12.4%",
    familyId: "f1",
    version: 1,
  },
  {
    id: "s2",
    name: "网格交易 ETH",
    asset: "ETH/USDT",
    timeframe: "1h",
    type: "震荡",
    returnRate: "",
    returnHint: "待模拟",
    btResult: "+34.2%",
    familyId: "f2",
    version: 1,
  },
  {
    id: "s3",
    name: "情绪反转 SOL",
    asset: "SOL/USDT",
    timeframe: "1d",
    type: "情绪",
    returnRate: "",
    returnHint: "回测中",
    familyId: "f3",
    version: 1,
  },
  {
    id: "s4",
    name: "跨所套利",
    asset: "BTC/ETH",
    timeframe: "15m",
    type: "套利",
    returnRate: "",
    returnHint: "待回测",
    familyId: "f4",
    version: 1,
  },
];

// Initial market data
export const initialMarkets: MarketAsset[] = [
  {
    symbol: "BTC/USDT",
    name: "Bitcoin",
    price: "84,231",
    change: "+2.41%",
    isUp: true,
  },
  {
    symbol: "ETH/USDT",
    name: "Ethereum",
    price: "3,182",
    change: "+1.87%",
    isUp: true,
  },
  {
    symbol: "SOL/USDT",
    name: "Solana",
    price: "148.30",
    change: "-0.62%",
    isUp: false,
  },
  {
    symbol: "BNB/USDT",
    name: "BNB",
    price: "612.4",
    change: "+0.94%",
    isUp: true,
  },
];

function createInitialStrategyStates(): Record<string, StrategyState> {
  return {
    s1: {
      stages: { draft: "done", bt: "done", paper: "done", live: "running" },
      activeTab: "live",
      btRange: "3m",
      btPts: [],
      btSigs: [],
      btDone: true,
      paperPts: [],
      paperSigs: [],
      paperRef: [],
      paperDone: true,
      paperPlanDays: 14,
      paperStartTime: 0,
      paperEndTime: 0,
      paperTickMs: 300,
      livePts: [],
      liveSigs: [],
      showPro: false,
    },
    s2: {
      stages: { draft: "done", bt: "done", paper: "ready", live: "locked" },
      activeTab: "paper",
      btRange: "3m",
      btPts: [],
      btSigs: [],
      btDone: true,
      paperPts: [],
      paperSigs: [],
      paperRef: [],
      paperDone: false,
      paperPlanDays: 14,
      paperStartTime: 0,
      paperEndTime: 0,
      paperTickMs: 300,
      livePts: [],
      liveSigs: [],
      showPro: false,
    },
    s3: {
      stages: { draft: "done", bt: "running", paper: "locked", live: "locked" },
      activeTab: "bt",
      btRange: "3m",
      btPts: [],
      btSigs: [],
      btDone: false,
      paperPts: [],
      paperSigs: [],
      paperRef: [],
      paperDone: false,
      paperPlanDays: 14,
      paperStartTime: 0,
      paperEndTime: 0,
      paperTickMs: 300,
      livePts: [],
      liveSigs: [],
      showPro: false,
    },
    s4: {
      stages: { draft: "done", bt: "ready", paper: "locked", live: "locked" },
      activeTab: "draft",
      btRange: "3m",
      btPts: [],
      btSigs: [],
      btDone: false,
      paperPts: [],
      paperSigs: [],
      paperRef: [],
      paperDone: false,
      paperPlanDays: 14,
      paperStartTime: 0,
      paperEndTime: 0,
      paperTickMs: 300,
      livePts: [],
      liveSigs: [],
      showPro: false,
    },
  };
}

interface QuantTerminalStore {
  strategies: Strategy[];
  activeStrategyId: string;
  strategyStates: Record<string, StrategyState>;
  // which family groups are collapsed in the sidebar
  collapsedFamilies: Record<string, boolean>;
  logs: LogItem[];
  messages: ChatMessage[];
  panelCollapsed: boolean;
  logCollapsed: boolean;
  panelWidth: number;
  btcPrice: number;

  setActiveStrategy: (id: string) => void;
  setStrategyState: (id: string, state: Partial<StrategyState>) => void;
  setActiveTab: (tab: "draft" | "bt" | "paper" | "live") => void;
  setStageStatus: (
    stage: keyof StrategyState["stages"],
    status: StrategyState["stages"]["draft"],
  ) => void;
  setBtRange: (id: string, range: BtRange) => void;
  toggleFamilyCollapse: (familyId: string) => void;
  unreadLogCount: number; // logs added while sidebar is collapsed
  resetUnreadLogCount: () => void;
  addLog: (tag: string, message: string) => void;
  addMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => void;
  togglePanel: () => void;
  toggleLog: () => void;
  setPanelWidth: (width: number) => void;
  setBtcPrice: (price: number) => void;
  togglePro: () => void;
  updateLiveData: (
    pts: number[],
    sigs: { i: number; type: "buy" | "sell" }[],
  ) => void;
  updateBtResult: (id: string, result: string) => void;
  updatePaperResult: (id: string, result: string) => void;
  updateLiveResult: (id: string, result: string) => void;
  addStrategy: (strategy: Omit<Strategy, "id">, dslCode?: string) => string;
  updateStrategy: (id: string, patch: Partial<Omit<Strategy, "id">>) => void;
  // The ONE improve action — always clones, always goes forward
  setPaperPlan: (id: string, days: PaperPlanDays) => void;
  cloneStrategy: (id: string) => string;
}

export const useQuantTerminalStore = create<QuantTerminalStore>((set, get) => ({
  strategies: [...initialStrategies],
  activeStrategyId: "s1",
  strategyStates: createInitialStrategyStates(),
  collapsedFamilies: {},
  unreadLogCount: 0,
  logs: [
    { time: "14:32", tag: "系统", message: "引擎已连接" },
    {
      time: "14:30",
      tag: "实盘",
      message: '<span class="hi">买入</span> BTC @ 83,940',
    },
    { time: "14:15", tag: "监控", message: "EMA 金叉信号触发" },
  ],
  messages: [],
  panelCollapsed: false,
  logCollapsed: false,
  panelWidth: 55,
  btcPrice: 84231,

  setActiveStrategy: (id) => set({ activeStrategyId: id }),

  setStrategyState: (id, state) =>
    set((prev) => ({
      strategyStates: {
        ...prev.strategyStates,
        [id]: { ...prev.strategyStates[id], ...state },
      },
    })),

  setActiveTab: (tab) => {
    const { activeStrategyId, strategyStates } = get();
    set({
      strategyStates: {
        ...strategyStates,
        [activeStrategyId]: {
          ...strategyStates[activeStrategyId],
          activeTab: tab,
        },
      },
    });
  },

  setStageStatus: (stage, status) => {
    const { activeStrategyId, strategyStates } = get();
    const cur = strategyStates[activeStrategyId];
    set({
      strategyStates: {
        ...strategyStates,
        [activeStrategyId]: {
          ...cur,
          stages: { ...cur.stages, [stage]: status },
        },
      },
    });
  },

  setBtRange: (id, range) =>
    set((prev) => ({
      strategyStates: {
        ...prev.strategyStates,
        [id]: { ...prev.strategyStates[id], btRange: range },
      },
    })),

  toggleFamilyCollapse: (familyId) =>
    set((prev) => ({
      collapsedFamilies: {
        ...prev.collapsedFamilies,
        [familyId]: !prev.collapsedFamilies[familyId],
      },
    })),

  addLog: (tag, message) =>
    set((prev) => ({
      logs: [
        {
          time: new Date().toLocaleTimeString("zh-CN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          tag,
          message,
        },
        ...prev.logs,
      ].slice(0, 100),
      // increment unread count only when log panel is collapsed
      unreadLogCount: prev.logCollapsed ? prev.unreadLogCount + 1 : 0,
    })),

  addMessage: (message) =>
    set((prev) => ({
      messages: [
        ...prev.messages,
        { ...message, id: crypto.randomUUID(), timestamp: new Date() },
      ],
    })),

  togglePanel: () => set((prev) => ({ panelCollapsed: !prev.panelCollapsed })),
  resetUnreadLogCount: () => set({ unreadLogCount: 0 }),
  toggleLog: () =>
    set((prev) => ({
      logCollapsed: !prev.logCollapsed,
      // clear unread count when expanding
      unreadLogCount: prev.logCollapsed ? 0 : prev.unreadLogCount,
    })),
  setPanelWidth: (width) => set({ panelWidth: width }),
  setBtcPrice: (price) => set({ btcPrice: price }),

  togglePro: () => {
    const { activeStrategyId, strategyStates } = get();
    const cur = strategyStates[activeStrategyId];
    set({
      strategyStates: {
        ...strategyStates,
        [activeStrategyId]: { ...cur, showPro: !cur.showPro },
      },
    });
  },

  updateLiveData: (pts, sigs) => {
    const { activeStrategyId, strategyStates } = get();
    const cur = strategyStates[activeStrategyId];
    set({
      strategyStates: {
        ...strategyStates,
        [activeStrategyId]: { ...cur, livePts: pts, liveSigs: sigs },
      },
    });
  },

  updateBtResult: (id, result) =>
    set((prev) => ({
      strategies: prev.strategies.map((s) =>
        s.id === id ? { ...s, btResult: result } : s,
      ),
    })),

  updatePaperResult: (id, result) =>
    set((prev) => ({
      strategies: prev.strategies.map((s) =>
        s.id === id
          ? {
              ...s,
              paperResult: result,
              returnRate: result,
              returnHint: "模拟中",
            }
          : s,
      ),
    })),

  updateLiveResult: (id, result) =>
    set((prev) => ({
      strategies: prev.strategies.map((s) =>
        s.id === id
          ? {
              ...s,
              liveResult: result,
              returnRate: result,
              returnHint: "实盘中",
            }
          : s,
      ),
    })),

  addStrategy: (strategyData, dslCode) => {
    const newId = `s${Date.now()}`;
    const newStrategy: Strategy = {
      id: newId,
      familyId: `f${Date.now()}`,
      version: 1,
      ...strategyData,
    };
    const newState: StrategyState = {
      stages: { draft: "done", bt: "ready", paper: "locked", live: "locked" },
      activeTab: "draft",
      btRange: "3m",
      btPts: [],
      btSigs: [],
      btDone: false,
      paperPts: [],
      paperSigs: [],
      paperRef: [],
      paperDone: false,
      paperPlanDays: 14,
      paperStartTime: 0,
      paperEndTime: 0,
      paperTickMs: 300,
      livePts: [],
      liveSigs: [],
      showPro: false,
      dslCode,
    };
    set((prev) => ({
      strategies: [newStrategy, ...prev.strategies],
      strategyStates: { ...prev.strategyStates, [newId]: newState },
      activeStrategyId: newId,
      panelCollapsed: false,
    }));
    return newId;
  },

  updateStrategy: (id, patch) =>
    set((prev) => ({
      strategies: prev.strategies.map((s) =>
        s.id === id ? { ...s, ...patch } : s,
      ),
    })),

  setPaperPlan: (id, days) =>
    set((prev) => ({
      strategyStates: {
        ...prev.strategyStates,
        [id]: { ...prev.strategyStates[id], paperPlanDays: days },
      },
    })),

  // The ONE AND ONLY improve action — always creates a new strategy in the same family
  cloneStrategy: (id) => {
    const { strategies, strategyStates } = get();
    const src = strategies.find((s) => s.id === id);
    const srcState = strategyStates[id];
    if (!src || !srcState) return id;

    // Find the highest version in this family to increment
    const familyMembers = strategies.filter((s) => s.familyId === src.familyId);

    // Hard limit: max 3 versions per family (original + 2 iterations)
    if (familyMembers.length >= 3) return id;

    const nextVersion = Math.max(...familyMembers.map((s) => s.version)) + 1;

    const newId = `s${Date.now()}`;
    const newStrategy: Strategy = {
      id: newId,
      name: src.name, // keep base name, version shown separately in UI
      asset: src.asset,
      timeframe: src.timeframe,
      type: src.type,
      returnRate: "",
      returnHint: "待回测",
      familyId: src.familyId, // same family
      version: nextVersion,
    };
    const newState: StrategyState = {
      stages: { draft: "done", bt: "ready", paper: "locked", live: "locked" },
      activeTab: "draft",
      btRange: srcState.btRange ?? "3m",
      btPts: [],
      btSigs: [],
      btDone: false,
      paperPts: [],
      paperSigs: [],
      paperRef: [],
      paperDone: false,
      paperPlanDays: 14,
      paperStartTime: 0,
      paperEndTime: 0,
      paperTickMs: 300,
      livePts: [],
      liveSigs: [],
      showPro: false,
      dslCode: srcState.dslCode,
      parsedParams: srcState.parsedParams,
    };
    set((prev) => ({
      strategies: [...prev.strategies, newStrategy], // append, not prepend — family order matters
      strategyStates: { ...prev.strategyStates, [newId]: newState },
      activeStrategyId: newId,
      panelCollapsed: false,
      // Auto-expand this family so user sees the new entry
      collapsedFamilies: { ...prev.collapsedFamilies, [src.familyId]: false },
    }));
    return newId;
  },
}));
