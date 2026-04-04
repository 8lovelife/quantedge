// Chart drawing utilities for quant terminal

export interface Signal {
  i: number;
  type: "buy" | "sell";
}

export interface ChartPadding {
  l: number;
  r: number;
  t: number;
  b: number;
}

// ── Shared X-axis time label generator ───────────────────────────────────────
// Generates 4 evenly-spaced time labels for the chart's X axis.
// startTime: unix ms of the first data point (0 = use current time as "now")
// totalMs:   total time span covered by all pts (e.g. pts.length * tickMs)
function drawXAxisTimeLabels(
  ctx: CanvasRenderingContext2D,
  PAD: ChartPadding,
  cW: number,
  H: number,
  startTime: number,
  totalMs: number,
) {
  const steps = 3; // we draw 4 labels at positions 0/3, 1/3, 2/3, 3/3
  ctx.fillStyle = "#94a3b8";
  ctx.font = "9px JetBrains Mono, monospace";

  for (let i = 0; i <= steps; i++) {
    const t = startTime + (totalMs * i) / steps;
    const d = new Date(t);
    // Format: "HH:MM" for intraday spans, "M/D" for multi-day spans
    const label =
      totalMs < 60_000 * 10
        ? // < 10 minutes: show HH:MM:SS so seconds are visible
          d.toLocaleTimeString("zh-CN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })
        : totalMs < 3_600_000 * 4
          ? // < 4 hours: HH:MM
            d.toLocaleTimeString("zh-CN", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : totalMs < 86_400_000 * 3
            ? // < 3 days: M/D HH:00
              `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:00`
            : // multi-day: M/D
              `${d.getMonth() + 1}/${d.getDate()}`;
    ctx.textAlign = i === 0 ? "left" : i === steps ? "right" : "center";
    const x = PAD.l + cW * (i / steps);
    ctx.fillText(label, x, H - 6);
  }
}

// ── BacktestChartViewport — same pattern as PaperChartViewport ───────────────
export interface BacktestChartViewport {
  viewStart: number; // index into allPts
  viewEnd: number;
}

export function drawBacktestChart(
  canvas: HTMLCanvasElement,
  // Always pass the FULL pts/sigs arrays; viewport controls what's displayed
  allPts: number[],
  allSigs: Signal[],
  options: {
    showAnimation?: boolean;
    currentIndex?: number;
    startTime?: number;
    tickMs?: number;
    viewport?: BacktestChartViewport;
  } = {},
) {
  if (allPts.length < 2) return;

  // Resolve viewport
  const vStart = Math.max(0, options.viewport?.viewStart ?? 0);
  const vEnd = Math.min(
    allPts.length - 1,
    options.viewport?.viewEnd ?? allPts.length - 1,
  );
  if (vEnd <= vStart) return;

  const pts = allPts.slice(vStart, vEnd + 1);

  const W = canvas.parentElement?.getBoundingClientRect().width || 500;
  const H = 140;
  const PAD: ChartPadding = { l: 40, r: 12, t: 12, b: 24 };
  const cW = W - PAD.l - PAD.r;
  const cH = H - PAD.t - PAD.b;

  const mn = Math.min(...pts) - 2;
  const mx = Math.max(...pts) + 2;
  const range = mx - mn || 1;

  const dpr = window.devicePixelRatio || 1;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width = W + "px";
  canvas.style.height = H + "px";

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);

  // Coordinate mappers scoped to viewport
  const xM = (globalIdx: number) =>
    PAD.l + ((globalIdx - vStart) / Math.max(vEnd - vStart, 1)) * cW;
  const xML = (localIdx: number) => xM(vStart + localIdx);
  const yM = (v: number) => PAD.t + cH - ((v - mn) / range) * cH;

  // Grid lines
  const gridStops = [0, 0.25, 0.5, 0.75, 1];
  gridStops.forEach((t) => {
    const y = PAD.t + cH * (1 - t);
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(PAD.l, y);
    ctx.lineTo(W - PAD.r, y);
    ctx.stroke();

    ctx.fillStyle = "#94a3b8";
    ctx.font = "9px JetBrains Mono, monospace";
    ctx.textAlign = "right";
    const label =
      t === 0.5
        ? "0%"
        : (t > 0.5 ? "+" : "") + Math.round((mn + (mx - mn) * t) * 0.4) + "%";
    ctx.fillText(label, PAD.l - 4, y + 3);
  });

  // Benchmark line (dashed) — across visible viewport
  ctx.strokeStyle = "#94a3b8";
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(xML(0), yM(pts[0]));
  ctx.lineTo(xML(pts.length - 1), yM(pts[pts.length - 1] * 0.35));
  ctx.stroke();
  ctx.setLineDash([]);

  // Area fill
  const gradient = ctx.createLinearGradient(0, PAD.t, 0, PAD.t + cH);
  gradient.addColorStop(0, "rgba(59, 130, 246, 0.12)");
  gradient.addColorStop(1, "rgba(59, 130, 246, 0)");
  ctx.beginPath();
  ctx.moveTo(xML(0), yM(pts[0]));
  pts.forEach((v, i) => {
    if (i > 0) ctx.lineTo(xML(i), yM(v));
  });
  ctx.lineTo(xML(pts.length - 1), PAD.t + cH);
  ctx.lineTo(xML(0), PAD.t + cH);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  // Line
  ctx.strokeStyle = "#3b82f6";
  ctx.lineWidth = 2;
  ctx.lineJoin = "round";
  ctx.beginPath();
  pts.forEach((v, i) => {
    if (i === 0) ctx.moveTo(xML(i), yM(v));
    else ctx.lineTo(xML(i), yM(v));
  });
  ctx.stroke();

  // Signal dots — filtered to viewport, deduplicated by canvas X distance
  const MIN_SIG_PX = 12;
  let lastSigX = -MIN_SIG_PX * 2;
  allSigs
    .filter((s) => s.i >= vStart && s.i <= vEnd && s.i < allPts.length)
    .sort((a, b) => a.i - b.i)
    .forEach((s) => {
      const x = xM(s.i);
      if (x - lastSigX < MIN_SIG_PX) return;
      lastSigX = x;
      // Glow ring
      ctx.beginPath();
      ctx.arc(x, yM(allPts[s.i]), 8, 0, Math.PI * 2);
      ctx.fillStyle =
        s.type === "buy" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)";
      ctx.fill();
      // Dot
      ctx.beginPath();
      ctx.arc(x, yM(allPts[s.i]), 5, 0, Math.PI * 2);
      ctx.fillStyle = s.type === "buy" ? "#10b981" : "#ef4444";
      ctx.fill();
    });

  // Animation dot
  if (
    options.showAnimation &&
    options.currentIndex !== undefined &&
    options.currentIndex < allPts.length - 1
  ) {
    const animIdx = Math.min(options.currentIndex, vEnd);
    if (animIdx >= vStart) {
      ctx.beginPath();
      ctx.arc(xM(animIdx), yM(allPts[animIdx]), 4, 0, Math.PI * 2);
      ctx.fillStyle = "#3b82f6";
      ctx.fill();
    }
  }

  // X-axis labels scoped to the visible viewport
  const btTickMs = options.tickMs ?? 4 * 3_600_000;
  const btStart = options.startTime ?? Date.now() - allPts.length * btTickMs;
  const viewStartMs = btStart + vStart * btTickMs;
  const viewSpanMs = (vEnd - vStart) * btTickMs;
  drawXAxisTimeLabels(ctx, PAD, cW, H, viewStartMs, viewSpanMs);
}

// ── PaperChartViewport — passed by paper-tab to control zoom/pan ────────────
export interface PaperChartViewport {
  // Indices into the ALL-pts array (not window-relative).
  // viewStart=0, viewEnd=pts.length-1 shows everything.
  viewStart: number;
  viewEnd: number;
}

export function drawPaperChart(
  canvas: HTMLCanvasElement,
  // ALL accumulated pts — never sliced; caller always passes the full array
  allPts: number[],
  // ALL accumulated signals — absolute indices into allPts
  allSigs: Signal[],
  _ref: number[], // kept for API compat, unused
  startTime?: number,
  endTime?: number,
  tickMs = 300,
  // viewport — which slice of allPts to display; defaults to full array
  viewport?: PaperChartViewport,
) {
  if (allPts.length < 2) return;

  // Resolve viewport bounds, clamped to valid range
  const vStart = Math.max(0, viewport?.viewStart ?? 0);
  const vEnd = Math.min(
    allPts.length - 1,
    viewport?.viewEnd ?? allPts.length - 1,
  );
  if (vEnd <= vStart) return;

  // pts visible in the current viewport
  const pts = allPts.slice(vStart, vEnd + 1);

  const W = canvas.parentElement?.getBoundingClientRect().width || 500;
  const H = 140;
  const PAD: ChartPadding = { l: 40, r: 12, t: 12, b: 24 };
  const cW = W - PAD.l - PAD.r;
  const cH = H - PAD.t - PAD.b;

  const mn = Math.min(...pts) - 1.5;
  const mx = Math.max(...pts) + 1.5;

  const dpr = window.devicePixelRatio || 1;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width = W + "px";
  canvas.style.height = H + "px";

  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);

  // ── Time window — must come FIRST; progressRatio is needed by drawW ─────────
  const now = Date.now();
  const paperStart = startTime ?? now - allPts.length * tickMs;
  const paperEnd = endTime ?? paperStart + allPts.length * tickMs;
  const totalPlanMs = paperEnd - paperStart;
  const elapsedMs = Math.min(Math.max(now - paperStart, 0), totalPlanMs);
  const progressRatio = totalPlanMs > 0 ? elapsedMs / totalPlanMs : 1;

  // ── Coordinate mappers ───────────────────────────────────────────────────────
  // The curve should never occupy less than 35% of canvas width, even when
  // progressRatio ≈ 0 (session just started). This recreates the drawW behaviour
  // from before while keeping viewport zoom/pan working correctly.
  //
  // drawW = canvas px allocated to the drawn curve (≥ 35% of cW)
  // futureW = remaining canvas px shown as the "未来" zone
  const MIN_DRAW_RATIO = 0.35;
  const drawW = cW * Math.max(progressRatio, MIN_DRAW_RATIO);
  const futureW = cW - drawW;

  // xM maps a GLOBAL index → canvas X, stretching the viewport span across drawW
  const xM = (globalIdx: number) =>
    PAD.l + ((globalIdx - vStart) / Math.max(vEnd - vStart, 1)) * drawW;
  // xMLocal maps a local index within pts[]
  const xML = (localIdx: number) => xM(vStart + localIdx);
  const yM = (v: number) => PAD.t + cH - ((v - mn) / (mx - mn || 1)) * cH;

  // ── Grid lines (Y) — past zone uses drawW, future zone uses futureW ────────
  const gridStops = [0, 0.25, 0.5, 0.75, 1];
  gridStops.forEach((t) => {
    const y = PAD.t + cH * (1 - t);
    // Past zone
    ctx.strokeStyle = "rgba(226,232,240,0.7)";
    ctx.lineWidth = 0.5;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(PAD.l, y);
    ctx.lineTo(PAD.l + drawW, y);
    ctx.stroke();
    // Future zone (dimmer)
    if (futureW > 0) {
      ctx.strokeStyle = "rgba(226,232,240,0.25)";
      ctx.beginPath();
      ctx.moveTo(PAD.l + drawW, y);
      ctx.lineTo(W - PAD.r, y);
      ctx.stroke();
    }

    ctx.fillStyle = "#94a3b8";
    ctx.font = "9px JetBrains Mono, monospace";
    ctx.textAlign = "right";
    const val = mn + (mx - mn) * t;
    const label =
      t === 0.5 ? "0%" : (val > 0 ? "+" : "") + Math.round(val * 0.4) + "%";
    ctx.fillText(label, PAD.l - 4, y + 3);
  });

  // ── X-axis formatter — needed both for future zone label and axis ticks ───────
  const viewSpanMs = (vEnd - vStart) * tickMs;
  const viewLeftMs = paperStart + vStart * tickMs;
  // Latest tick time = time of the rightmost point currently drawn (vEnd)
  const latestTickMs = paperStart + vEnd * tickMs;

  const fmtTick = (ms: number): string => {
    const d = new Date(ms);
    const pad = (n: number) => String(n).padStart(2, "0");
    if (totalPlanMs < 60_000 * 10)
      return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    if (totalPlanMs < 3_600_000 * 4)
      return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    if (totalPlanMs < 86_400_000 * 2)
      return `${d.getMonth() + 1}/${d.getDate()} ${pad(d.getHours())}:00`;
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  // ── Future zone fill ─────────────────────────────────────────────────────────
  if (futureW > 1) {
    ctx.fillStyle = "rgba(148,163,184,0.035)";
    ctx.fillRect(PAD.l + drawW, PAD.t, futureW, cH);
    if (futureW > 32) {
      ctx.fillStyle = "rgba(148,163,184,0.35)";
      ctx.font = "9px JetBrains Mono, monospace";
      ctx.textAlign = "center";
      ctx.fillText("未来", PAD.l + drawW + futureW / 2, PAD.t + cH / 2);
    }
    // Plan-end date — shown in bottom-right of future zone (small, dimmed)
    if (futureW > 48) {
      ctx.fillStyle = "rgba(148,163,184,0.4)";
      ctx.font = "9px JetBrains Mono, monospace";
      ctx.textAlign = "right";
      ctx.fillText(`⊙ ${fmtTick(paperEnd)}`, PAD.l + cW, H - 5);
    }
  }

  // ── Area fill ────────────────────────────────────────────────────────────────
  const gradient = ctx.createLinearGradient(0, PAD.t, 0, PAD.t + cH);
  gradient.addColorStop(0, "rgba(139,92,246,0.12)");
  gradient.addColorStop(1, "rgba(139,92,246,0)");
  ctx.beginPath();
  ctx.moveTo(xML(0), yM(pts[0]));
  pts.forEach((v, i) => {
    if (i > 0) ctx.lineTo(xML(i), yM(v));
  });
  ctx.lineTo(xML(pts.length - 1), PAD.t + cH);
  ctx.lineTo(xML(0), PAD.t + cH);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  // ── Curve line ───────────────────────────────────────────────────────────────
  ctx.strokeStyle = "#8b5cf6";
  ctx.lineWidth = 2;
  ctx.lineJoin = "round";
  ctx.setLineDash([]);
  ctx.beginPath();
  pts.forEach((v, i) => {
    if (i === 0) ctx.moveTo(xML(i), yM(v));
    else ctx.lineTo(xML(i), yM(v));
  });
  ctx.stroke();

  // ── Signal dots ──────────────────────────────────────────────────────────────
  // Filter to signals whose global index falls within the current viewport.
  // Deduplicate by canvas X distance so zoomed-out views don't pile circles.
  const MIN_SIG_PX = 12;
  let lastSigX = -MIN_SIG_PX * 2;

  allSigs
    .filter((s) => s.i >= vStart && s.i <= vEnd && s.i < allPts.length)
    .sort((a, b) => a.i - b.i)
    .forEach((s) => {
      const x = xM(s.i);
      if (x - lastSigX < MIN_SIG_PX) return;
      lastSigX = x;
      // glow ring
      ctx.beginPath();
      ctx.arc(x, yM(allPts[s.i]), 8, 0, Math.PI * 2);
      ctx.fillStyle =
        s.type === "buy" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)";
      ctx.fill();
      // dot
      ctx.beginPath();
      ctx.arc(x, yM(allPts[s.i]), 5, 0, Math.PI * 2);
      ctx.fillStyle = s.type === "buy" ? "#10b981" : "#ef4444";
      ctx.fill();
    });

  // ── "今" vertical line — sits at the past/future boundary (PAD.l + drawW) ────
  // Only show when there's a meaningful future zone and we're not fully done.
  if (progressRatio > 0.02 && progressRatio < 0.98 && futureW > 4) {
    const nowX = PAD.l + drawW;
    ctx.strokeStyle = "rgba(139,92,246,0.45)";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(nowX, PAD.t);
    ctx.lineTo(nowX, PAD.t + cH);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#8b5cf6";
    ctx.font = "bold 8px JetBrains Mono, monospace";
    ctx.textAlign = "center";
    ctx.fillText("今", nowX, PAD.t + 8);
  }

  // ── X-axis time labels ───────────────────────────────────────────────────────
  // Left anchor  = time of vStart (viewport left edge)
  // Right anchor = latest tick time (vEnd) — real-time, updates every tick
  // Plan end     = shown inside future zone (see above)
  // Inner ticks  = evenly spaced within drawW (past zone only)
  ctx.font = "9px JetBrains Mono, monospace";
  const labelY = H - 5;
  const MIN_TICK_PX = 56;

  // Left anchor — viewport start time
  ctx.fillStyle = "#94a3b8";
  ctx.textAlign = "left";
  ctx.fillText(fmtTick(viewLeftMs), PAD.l, labelY);

  // Right anchor — latest tick timestamp, updates in real time
  // Only draw if it won't collide with the left anchor
  const rightLabel = fmtTick(latestTickMs);
  const rightLabelX = PAD.l + drawW;
  if (rightLabelX - PAD.l > MIN_TICK_PX) {
    ctx.fillStyle = "#8b5cf6";
    ctx.textAlign = "right";
    ctx.fillText(rightLabel, rightLabelX, labelY);
  }

  // Inner ticks — within the past (drawn) zone only, skip if too close to anchors
  const innerCount = Math.max(0, Math.floor(drawW / MIN_TICK_PX) - 1);
  if (innerCount > 0) {
    for (let i = 1; i <= innerCount; i++) {
      const ratio = i / (innerCount + 1);
      const x = PAD.l + drawW * ratio;
      const tMs = viewLeftMs + viewSpanMs * ratio;
      ctx.fillStyle = "#94a3b8";
      ctx.textAlign = "center";
      ctx.fillText(fmtTick(tMs), x, labelY);
    }
  }
}

export function drawLiveChart(
  canvas: HTMLCanvasElement,
  pts: number[],
  sigs: Signal[],
  startTime?: number, // unix ms of first data point
  tickMs = 300, // ms per data point
) {
  if (pts.length < 2) return;

  const W = canvas.parentElement?.getBoundingClientRect().width || 500;
  const H = 140;
  const PAD: ChartPadding = { l: 40, r: 12, t: 12, b: 24 };
  const cW = W - PAD.l - PAD.r;
  const cH = H - PAD.t - PAD.b;

  const mn = Math.min(...pts) - 1.5;
  const mx = Math.max(...pts) + 1.5;
  const range = mx - mn || 1;

  const dpr = window.devicePixelRatio || 1;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width = W + "px";
  canvas.style.height = H + "px";

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);

  const yM = (v: number) => PAD.t + cH - ((v - mn) / range) * cH;
  const xM = (i: number) => PAD.l + (i / (pts.length - 1)) * cW;

  // Grid lines
  const gridStops = [0, 0.25, 0.5, 0.75, 1];
  gridStops.forEach((t) => {
    const y = PAD.t + cH * (1 - t);
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(PAD.l, y);
    ctx.lineTo(W - PAD.r, y);
    ctx.stroke();

    ctx.fillStyle = "#94a3b8";
    ctx.font = "9px JetBrains Mono, monospace";
    ctx.textAlign = "right";
    const label =
      t === 0.5
        ? "0%"
        : (t > 0.5 ? "+" : "") + Math.round((mn + (mx - mn) * t) * 0.3) + "%";
    ctx.fillText(label, PAD.l - 4, y + 3);
  });

  // Area fill
  const gradient = ctx.createLinearGradient(0, PAD.t, 0, PAD.t + cH);
  gradient.addColorStop(0, "rgba(16, 185, 129, 0.12)");
  gradient.addColorStop(1, "rgba(16, 185, 129, 0)");

  ctx.beginPath();
  ctx.moveTo(xM(0), yM(pts[0]));
  pts.forEach((v, i) => {
    if (i > 0) ctx.lineTo(xM(i), yM(v));
  });
  ctx.lineTo(xM(pts.length - 1), PAD.t + cH);
  ctx.lineTo(xM(0), PAD.t + cH);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  // Line
  ctx.strokeStyle = "#10b981";
  ctx.lineWidth = 2;
  ctx.lineJoin = "round";
  ctx.beginPath();
  pts.forEach((v, i) => {
    if (i === 0) ctx.moveTo(xM(i), yM(v));
    else ctx.lineTo(xM(i), yM(v));
  });
  ctx.stroke();

  // Signals with glow
  sigs.forEach((s) => {
    if (s.i >= pts.length) return;
    ctx.beginPath();
    ctx.arc(xM(s.i), yM(pts[s.i]), 5, 0, Math.PI * 2);
    ctx.fillStyle = s.type === "buy" ? "#10b981" : "#ef4444";
    ctx.fill();

    // Outer glow
    ctx.beginPath();
    ctx.arc(xM(s.i), yM(pts[s.i]), 9, 0, Math.PI * 2);
    ctx.strokeStyle =
      s.type === "buy" ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)";
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  // Current point with pulse effect
  const lx = xM(pts.length - 1);
  const ly = yM(pts[pts.length - 1]);

  ctx.beginPath();
  ctx.arc(lx, ly, 6, 0, Math.PI * 2);
  ctx.fillStyle = "#10b981";
  ctx.fill();

  ctx.beginPath();
  ctx.arc(lx, ly, 10, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(16, 185, 129, 0.2)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(lx, ly, 15, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(16, 185, 129, 0.08)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Price label
  const price = (84231 + Math.round(pts[pts.length - 1] * 80)).toLocaleString();
  ctx.fillStyle = "#10b981";
  ctx.font = "bold 10px JetBrains Mono, monospace";
  ctx.textAlign = "left";
  ctx.fillText(price, Math.min(lx + 16, W - PAD.r - 60), ly + 4);

  // X-axis labels — dynamic real-time timestamps
  const liveStart = startTime ?? Date.now() - pts.length * tickMs;
  const liveTotalMs = pts.length * tickMs;
  drawXAxisTimeLabels(ctx, PAD, cW, H, liveStart, liveTotalMs);
}

export function generateBacktestData(): { pts: number[]; sigs: Signal[] } {
  const pts: number[] = [];
  let v = 0;
  for (let i = 0; i < 90; i++) {
    v += (Math.random() - 0.42) * 2.2 + 0.3;
    pts.push(v);
  }

  const sigs: Signal[] = [];
  for (let i = 4; i < 88; i++) {
    const d = pts[i] - pts[i - 4]; // wider window = more reliable signals
    if (
      d > 1.8 &&
      (sigs.length === 0 || sigs[sigs.length - 1].type === "sell")
    ) {
      sigs.push({ i, type: "buy" });
    }
    if (d < -1.2 && sigs.length > 0 && sigs[sigs.length - 1].type === "buy") {
      sigs.push({ i, type: "sell" });
    }
  }

  return { pts, sigs };
}

export function generatePaperData(): {
  pts: number[];
  sigs: Signal[];
  ref: number[];
} {
  const pts: number[] = [];
  let v = 0;
  for (let i = 0; i < 120; i++) {
    v += (Math.random() - 0.46) * 1.6 + 0.18 + (i > 40 && i < 65 ? -0.3 : 0);
    pts.push(v);
  }

  const ref = pts.map((val, i) => val * 0.85 + i * 0.04);

  const sigs: Signal[] = [];
  for (let i = 4; i < 116; i++) {
    const d = pts[i] - pts[i - 3];
    if (
      d > 1.5 &&
      (sigs.length === 0 || sigs[sigs.length - 1].type === "sell")
    ) {
      sigs.push({ i, type: "buy" });
    }
    if (d < -1.2 && sigs.length > 0 && sigs[sigs.length - 1].type === "buy") {
      sigs.push({ i, type: "sell" });
    }
  }

  return { pts, sigs, ref };
}
