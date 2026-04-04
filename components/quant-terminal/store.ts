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

// ── Global background ticker registry ──────────────────────────────────────
// Tracks setInterval IDs keyed by strategyId so we can start/stop independently
// of which strategy panel is currently visible.
const _liveIntervals = new Map<string, ReturnType<typeof setInterval>>();
const _paperIntervals = new Map<string, ReturnType<typeof setInterval>>();

/** Compute a return-percent string from a pts array */
function computeReturnStr(pts: number[]): string {
  if (pts.length < 2) return "+0.0%";
  const first = pts[0];
  const last = pts[pts.length - 1];
  const pct = first !== 0 ? ((last - first) / Math.abs(first)) * 100 : 0;
  return `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`;
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
  unreadLogCount: number;
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
  setPaperPlan: (id: string, days: PaperPlanDays) => void;
  cloneStrategy: (id: string) => string;

  // ── Background ticker control ─────────────────────────────────────────────
  /** Start the global live ticker for a strategy (idempotent) */
  startLiveTicker: (id: string) => void;
  /** Stop the global live ticker for a strategy */
  stopLiveTicker: (id: string) => void;
  /** Start the global paper ticker for a strategy (idempotent) */
  startPaperTicker: (id: string) => void;
  /** Stop the global paper ticker for a strategy */
  stopPaperTicker: (id: string) => void;
  /** Reconcile all tickers to match current stage states */
  syncTickers: () => void;
}

export const useQuantTerminalStore = create<QuantTerminalStore>((set, get) => {
  // ── Internal ticker helpers (close over set/get) ──────────────────────────

  const startLiveTicker = (id: string) => {
    if (_liveIntervals.has(id)) return; // already running

    // Seed data if empty
    const cur = get().strategyStates[id];
    if (cur && !cur.livePts.length) {
      const pts: number[] = [];
      let v = 0;
      for (let i = 0; i < 40; i++) {
        v += (Math.random() - 0.44) * 1.2 + 0.2;
        pts.push(v);
      }
      get().setStrategyState(id, { livePts: pts, liveSigs: [] });
    }

    const interval = setInterval(() => {
      const state = get();
      const stratState = state.strategyStates[id];
      if (!stratState || stratState.stages.live !== "running") {
        // Stage changed externally — clean up
        clearInterval(interval);
        _liveIntervals.delete(id);
        return;
      }

      const pts = [...stratState.livePts];
      const sigs = [...stratState.liveSigs];
      const last = pts[pts.length - 1];
      const nv = last + (Math.random() - 0.46) * 1.4 + 0.15;
      pts.push(nv);
      if (pts.length > 120) pts.shift();

      // Signal detection
      if (pts.length > 5) {
        const delta = pts[pts.length - 1] - pts[pts.length - 4];
        if (
          delta > 1.8 &&
          (sigs.length === 0 || sigs[sigs.length - 1].type === "sell")
        ) {
          sigs.push({ i: pts.length - 1, type: "buy" });
          state.addLog(
            "实盘",
            `<span class="buy">买入</span> BTC <span class="mono">@ ${(83000 + Math.round(nv * 200)).toLocaleString()}</span>`,
          );
        }
        if (
          delta < -1.3 &&
          sigs.length > 0 &&
          sigs[sigs.length - 1].type === "buy"
        ) {
          sigs.push({ i: pts.length - 1, type: "sell" });
          state.addLog(
            "实盘",
            `<span class="sell">卖出</span> <span class="${nv > last ? "buy" : "sell"}">${nv > last ? "+" : ""}${Math.round(Math.abs(delta) * 1.2)}%</span>`,
          );
        }
      }

      // Update BTC price only for the currently-active strategy to avoid flicker
      if (id === get().activeStrategyId) {
        get().setBtcPrice(84231 + Math.round(nv * 80));
      }

      // Compute return and update both strategyState AND strategies list atomically
      const returnStr = computeReturnStr(pts);

      set((prev) => ({
        strategyStates: {
          ...prev.strategyStates,
          [id]: { ...prev.strategyStates[id], livePts: pts, liveSigs: sigs },
        },
        strategies: prev.strategies.map((s) =>
          s.id === id
            ? {
                ...s,
                liveResult: returnStr,
                returnRate: returnStr,
                returnHint: "实盘中",
              }
            : s,
        ),
      }));
    }, 300);

    _liveIntervals.set(id, interval);
  };

  const stopLiveTicker = (id: string) => {
    const interval = _liveIntervals.get(id);
    if (interval) {
      clearInterval(interval);
      _liveIntervals.delete(id);
    }
  };

  const startPaperTicker = (id: string) => {
    if (_paperIntervals.has(id)) return;

    // Seed data if empty
    const cur = get().strategyStates[id];
    if (cur && !cur.paperPts.length) {
      const pts: number[] = [];
      let v = 0;
      for (let i = 0; i < 20; i++) {
        v += (Math.random() - 0.45) * 1.0 + 0.12;
        pts.push(v);
      }
      get().setStrategyState(id, { paperPts: pts, paperSigs: [] });
    }

    const interval = setInterval(() => {
      const state = get();
      const stratState = state.strategyStates[id];
      if (!stratState || stratState.stages.paper !== "running") {
        clearInterval(interval);
        _paperIntervals.delete(id);
        return;
      }

      const pts = [...stratState.paperPts];
      const sigs = [...stratState.paperSigs];
      const last = pts[pts.length - 1];
      const nv = last + (Math.random() - 0.45) * 1.0 + 0.12;
      pts.push(nv);

      // Simple signal detection
      if (pts.length > 5) {
        const delta = pts[pts.length - 1] - pts[pts.length - 4];
        if (
          delta > 1.5 &&
          (sigs.length === 0 || sigs[sigs.length - 1].type === "sell")
        ) {
          sigs.push({ i: pts.length - 1, type: "buy" });
          state.addLog(
            "模拟",
            `<span class="buy">模拟买入</span> BTC <span class="mono">@ ${(83000 + Math.round(nv * 200)).toLocaleString()}</span>`,
          );
        }
        if (
          delta < -1.2 &&
          sigs.length > 0 &&
          sigs[sigs.length - 1].type === "buy"
        ) {
          sigs.push({ i: pts.length - 1, type: "sell" });
          const pnl = (Math.random() * 8 - 2).toFixed(1);
          state.addLog(
            "模拟",
            `<span class="sell">模拟卖出</span> <span class="${Number(pnl) >= 0 ? "buy" : "sell"}">${Number(pnl) >= 0 ? "+" : ""}${pnl}%</span>`,
          );
        }
      }

      // Check plan expiry
      const endTime = stratState.paperEndTime;
      if (endTime > 0 && Date.now() >= endTime) {
        set((prev) => ({
          strategyStates: {
            ...prev.strategyStates,
            [id]: {
              ...prev.strategyStates[id],
              stages: {
                ...prev.strategyStates[id].stages,
                paper: "done",
                live: "ready",
              },
              paperDone: true,
              paperPts: pts,
              paperSigs: sigs,
            },
          },
        }));
        clearInterval(interval);
        _paperIntervals.delete(id);
        return;
      }

      const returnStr = computeReturnStr(pts);

      set((prev) => ({
        strategyStates: {
          ...prev.strategyStates,
          [id]: { ...prev.strategyStates[id], paperPts: pts, paperSigs: sigs },
        },
        strategies: prev.strategies.map((s) =>
          s.id === id
            ? {
                ...s,
                paperResult: returnStr,
                returnRate: returnStr,
                returnHint: "模拟中",
              }
            : s,
        ),
      }));
    }, 300);

    _paperIntervals.set(id, interval);
  };

  const stopPaperTicker = (id: string) => {
    const interval = _paperIntervals.get(id);
    if (interval) {
      clearInterval(interval);
      _paperIntervals.delete(id);
    }
  };

  const syncTickers = () => {
    const { strategies, strategyStates } = get();
    for (const s of strategies) {
      const st = strategyStates[s.id];
      if (!st) continue;

      // Live
      if (st.stages.live === "running") {
        startLiveTicker(s.id);
      } else {
        stopLiveTicker(s.id);
      }

      // Paper
      if (st.stages.paper === "running") {
        startPaperTicker(s.id);
      } else {
        stopPaperTicker(s.id);
      }
    }
  };

  return {
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

    startLiveTicker,
    stopLiveTicker,
    startPaperTicker,
    stopPaperTicker,
    syncTickers,

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
      const newStages = { ...cur.stages, [stage]: status };
      set({
        strategyStates: {
          ...strategyStates,
          [activeStrategyId]: { ...cur, stages: newStages },
        },
      });
      // Reconcile tickers whenever stage changes
      syncTickers();
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
        unreadLogCount: prev.logCollapsed ? prev.unreadLogCount + 1 : 0,
      })),

    addMessage: (message) =>
      set((prev) => ({
        messages: [
          ...prev.messages,
          { ...message, id: crypto.randomUUID(), timestamp: new Date() },
        ],
      })),

    togglePanel: () =>
      set((prev) => ({ panelCollapsed: !prev.panelCollapsed })),
    resetUnreadLogCount: () => set({ unreadLogCount: 0 }),
    toggleLog: () =>
      set((prev) => ({
        logCollapsed: !prev.logCollapsed,
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

    cloneStrategy: (id) => {
      const { strategies, strategyStates } = get();
      const src = strategies.find((s) => s.id === id);
      const srcState = strategyStates[id];
      if (!src || !srcState) return id;

      const familyMembers = strategies.filter(
        (s) => s.familyId === src.familyId,
      );
      if (familyMembers.length >= 3) return id;

      const nextVersion = Math.max(...familyMembers.map((s) => s.version)) + 1;
      const newId = `s${Date.now()}`;
      const newStrategy: Strategy = {
        id: newId,
        name: src.name,
        asset: src.asset,
        timeframe: src.timeframe,
        type: src.type,
        returnRate: "",
        returnHint: "待回测",
        familyId: src.familyId,
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
        strategies: [...prev.strategies, newStrategy],
        strategyStates: { ...prev.strategyStates, [newId]: newState },
        activeStrategyId: newId,
        panelCollapsed: false,
        collapsedFamilies: { ...prev.collapsedFamilies, [src.familyId]: false },
      }));
      return newId;
    },
  };
});

// ── Auto-start tickers on store init ─────────────────────────────────────────
// Run once after module load so that strategies already in "running" state
// (like s1 which starts as live: "running") get their tickers immediately.
setTimeout(() => {
  useQuantTerminalStore.getState().syncTickers();
}, 0);
