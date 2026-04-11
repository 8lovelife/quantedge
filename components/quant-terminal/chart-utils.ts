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
  ctx.font = "8px JetBrains Mono, monospace";

  for (let i = 0; i <= steps; i++) {
    const t = startTime + (totalMs * i) / steps;
    const d = new Date(t);
    // Format: full date+time for short spans, date+hour for medium, date only for multi-day
    const pad = (n: number) => String(n).padStart(2, "0");
    const date = `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}`;
    const label =
      totalMs < 60_000 * 10
        ? // < 10 minutes: "YYYY/MM/DD HH:MM:SS"
          `${date} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
        : totalMs < 3_600_000 * 4
          ? // < 4 hours: "YYYY/MM/DD HH:MM"
            `${date} ${pad(d.getHours())}:${pad(d.getMinutes())}`
          : totalMs < 86_400_000 * 3
            ? // < 3 days: "YYYY/MM/DD HH:00"
              `${date} ${d.getHours()}:00`
            : // multi-day: "YYYY/MM/DD"
              date;
    ctx.textAlign = i === 0 ? "left" : i === steps ? "right" : "center";
    const x = PAD.l + cW * (i / steps);
    ctx.fillText(label, x, H - 6);
  }
}

export function drawBacktestChart(
  canvas: HTMLCanvasElement,
  pts: number[],
  sigs: Signal[],
  options: {
    showAnimation?: boolean;
    currentIndex?: number;
    startTime?: number; // unix ms of first data point; defaults to 3 months ago
    tickMs?: number; // ms per data point; defaults to 4h candles
    viewport?: {
      viewStart: number;
      viewEnd: number;
    };
  } = {},
) {
  if (pts.length < 2) return;

  const W = canvas.parentElement?.getBoundingClientRect().width || 500;
  const H = 140;
  const PAD: ChartPadding = { l: 40, r: 12, t: 20, b: 24 };
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
        : (t > 0.5 ? "+" : "") + Math.round((mn + (mx - mn) * t) * 0.4) + "%";
    ctx.fillText(label, PAD.l - 4, y + 3);
  });

  // Benchmark line (dashed)
  ctx.strokeStyle = "#94a3b8";
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(xM(0), yM(0));
  ctx.lineTo(xM(pts.length - 1), yM(pts[pts.length - 1] * 0.35));
  ctx.stroke();
  ctx.setLineDash([]);

  // Area fill
  const gradient = ctx.createLinearGradient(0, PAD.t, 0, PAD.t + cH);
  gradient.addColorStop(0, "rgba(59, 130, 246, 0.12)");
  gradient.addColorStop(1, "rgba(59, 130, 246, 0)");

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
  ctx.strokeStyle = "#3b82f6";
  ctx.lineWidth = 2;
  ctx.lineJoin = "round";
  ctx.beginPath();
  pts.forEach((v, i) => {
    if (i === 0) ctx.moveTo(xM(i), yM(v));
    else ctx.lineTo(xM(i), yM(v));
  });
  ctx.stroke();

  // Signals — buy ▼ above line (green), sell ▲ below line (red)
  sigs
    .filter((s) => s.i < pts.length)
    .forEach((s) => {
      const sx = xM(s.i);
      const sy = yM(pts[s.i]);
      const isBuy = s.type === "buy";
      const color = isBuy ? "#10b981" : "#ef4444";
      const glowColor = isBuy ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)";
      const r = 5;
      const GAP = 8;
      const rawTy = isBuy ? sy - GAP - r : sy + GAP + r;
      const ty = Math.max(PAD.t + r + 2, Math.min(H - PAD.b - r - 2, rawTy));

      // Glow
      ctx.beginPath();
      ctx.arc(sx, ty, r + 3, 0, Math.PI * 2);
      ctx.fillStyle = glowColor;
      ctx.fill();

      // Triangle pointing toward the line
      ctx.beginPath();
      if (isBuy) {
        ctx.moveTo(sx, ty + r);
        ctx.lineTo(sx - r, ty - r + 2);
        ctx.lineTo(sx + r, ty - r + 2);
      } else {
        ctx.moveTo(sx, ty - r);
        ctx.lineTo(sx - r, ty + r - 2);
        ctx.lineTo(sx + r, ty + r - 2);
      }
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    });

  // Animation dot
  if (
    options.showAnimation &&
    options.currentIndex !== undefined &&
    options.currentIndex < pts.length - 1
  ) {
    ctx.beginPath();
    ctx.arc(xM(pts.length - 1), yM(pts[pts.length - 1]), 4, 0, Math.PI * 2);
    ctx.fillStyle = "#3b82f6";
    ctx.fill();
  }

  // X-axis labels — dynamic based on actual time range
  const btTickMs = options.tickMs ?? 4 * 3_600_000; // default: 4h candles
  const btStart = options.startTime ?? Date.now() - pts.length * btTickMs;
  const btTotalMs = pts.length * btTickMs;
  drawXAxisTimeLabels(ctx, PAD, cW, H, btStart, btTotalMs);
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
  const PAD: ChartPadding = { l: 40, r: 12, t: 20, b: 24 };
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

  // ── Time window ──────────────────────────────────────────────────────────────
  const now = Date.now();
  const paperStart = startTime ?? now - allPts.length * tickMs;
  const paperEnd = endTime ?? paperStart + allPts.length * tickMs;
  const totalPlanMs = paperEnd - paperStart;

  // progressRatio: fraction of plan elapsed, based on data-point count so it
  // grows steadily per tick regardless of tick speed vs plan duration.
  const totalPlanPts =
    totalPlanMs > 0 ? totalPlanMs / Math.max(tickMs, 1) : allPts.length;
  const progressRatio = Math.min(1, allPts.length / Math.max(totalPlanPts, 1));

  // ── Coordinate mappers ───────────────────────────────────────────────────────
  // The curve ALWAYS fills 100% of canvas width.
  // No "future zone" is reserved — the progress bar in the UI already shows
  // plan progress. Reserving right-side space makes the chart cramped and
  // unreadable (especially early in a multi-day plan with fast 300ms ticks).
  // A thin "今" overlay line still marks the current moment.
  const drawW = cW;
  const futureW = 0;

  const xM = (globalIdx: number) =>
    PAD.l + ((globalIdx - vStart) / Math.max(vEnd - vStart, 1)) * drawW;
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
    // Convert pts unit → BTC price (same formula as store: 84231 + pt * 80)
    const price = Math.round(84231 + val * 80);
    const label =
      price >= 1000 ? (price / 1000).toFixed(1) + "k" : String(price);
    ctx.fillText(label, PAD.l - 4, y + 3);
  });

  // Future zone removed — curve fills full canvas width for maximum readability.

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

  // ── Signal markers — buy ▼ above line (green), sell ▲ below line (red) ──────
  const MIN_SIG_PX = 12;
  let lastSigX = -MIN_SIG_PX * 2;

  allSigs
    .filter((s) => s.i >= vStart && s.i <= vEnd && s.i < allPts.length)
    .sort((a, b) => a.i - b.i)
    .forEach((s) => {
      const x = xM(s.i);
      if (x - lastSigX < MIN_SIG_PX) return;
      lastSigX = x;
      const sy = yM(allPts[s.i]);
      const isBuy = s.type === "buy";
      const color = isBuy ? "#10b981" : "#ef4444";
      const glowColor = isBuy ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)";
      const r = 5;
      const GAP = 8;
      const rawTy = isBuy ? sy - GAP - r : sy + GAP + r;
      const ty = Math.max(PAD.t + r + 2, Math.min(H - PAD.b - r - 2, rawTy));

      // Glow
      ctx.beginPath();
      ctx.arc(x, ty, r + 3, 0, Math.PI * 2);
      ctx.fillStyle = glowColor;
      ctx.fill();

      // Triangle pointing toward the line
      ctx.beginPath();
      if (isBuy) {
        ctx.moveTo(x, ty + r);
        ctx.lineTo(x - r, ty - r + 2);
        ctx.lineTo(x + r, ty - r + 2);
      } else {
        ctx.moveTo(x, ty - r);
        ctx.lineTo(x - r, ty + r - 2);
        ctx.lineTo(x + r, ty + r - 2);
      }
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    });

  // ── "今" marker — a small label at the right edge of the curve ─────────────
  // Since the curve now fills full width, the right edge IS "now".
  // Show a subtle "今" tag at the top-right of the drawn area when the plan
  // is still in progress (not yet done).
  if (progressRatio < 0.99) {
    const nowX = PAD.l + drawW - 1; // right edge of drawn curve
    ctx.fillStyle = "rgba(139,92,246,0.7)";
    ctx.font = "bold 8px JetBrains Mono, monospace";
    ctx.textAlign = "right";
    ctx.fillText("今", nowX, PAD.t + 10);
  }

  // ── X-axis time labels ───────────────────────────────────────────────────────
  // Each data point represents one simulated tick (tickMs apart in sim time,
  // but happening at 300ms real intervals). The REAL timestamps are:
  //   point 0   → paperStart
  //   point N-1 → now  (the latest data point is always "right now")
  // So we interpolate real wall-clock time across the collected points.
  // This means the right anchor is always `now`, left anchor is `paperStart +
  // (vStart / totalPts) * elapsed`, and inner ticks are real moments in between.
  const nowMs = Date.now();
  const elapsedMs = nowMs - paperStart; // real ms since paper trading started
  // Real timestamp for a given global point index
  const ptToRealMs = (idx: number): number =>
    allPts.length <= 1
      ? nowMs
      : paperStart + (idx / (allPts.length - 1)) * elapsedMs;

  const realViewStartMs = ptToRealMs(vStart);
  const realViewEndMs = ptToRealMs(vEnd);
  const realViewSpanMs = realViewEndMs - realViewStartMs;

  // Format granularity based on the visible real-time span
  // Always include date so signal markers show the correct calendar day.
  const fmtReal = (ms: number): string => {
    const d = new Date(ms);
    const pad = (n: number) => String(n).padStart(2, "0");
    const date = `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}`;
    if (realViewSpanMs < 3_600_000 * 2)
      // Short window: show full "YYYY/MM/DD HH:MM:SS"
      return `${date} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    if (realViewSpanMs < 86_400_000 * 2)
      // Medium window: "YYYY/MM/DD HH:00"
      return `${date} ${pad(d.getHours())}:00`;
    // Multi-day: "YYYY/MM/DD"
    return date;
  };

  ctx.font = "8px JetBrains Mono, monospace";
  const labelY = H - 5;
  const MAX_INNER = 2; // at most 2 inner ticks → max 4 labels total
  const MIN_TICK_PX = 90;
  const innerCount = Math.min(
    MAX_INNER,
    Math.max(0, Math.floor(cW / MIN_TICK_PX) - 1),
  );

  // Left anchor — real time of leftmost visible point
  ctx.fillStyle = "#94a3b8";
  ctx.textAlign = "left";
  ctx.fillText(fmtReal(realViewStartMs), PAD.l, labelY);

  // Right anchor — "now" (rightmost collected point)
  ctx.fillStyle = "#8b5cf6";
  ctx.textAlign = "right";
  ctx.fillText(fmtReal(realViewEndMs), PAD.l + cW, labelY);

  // Inner ticks — evenly spaced between anchors
  if (innerCount > 0) {
    for (let i = 1; i <= innerCount; i++) {
      const ratio = i / (innerCount + 1);
      const x = PAD.l + cW * ratio;
      const tMs = realViewStartMs + realViewSpanMs * ratio;
      ctx.fillStyle = "#94a3b8";
      ctx.textAlign = "center";
      ctx.fillText(fmtReal(tMs), x, labelY);
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
  const PAD: ChartPadding = { l: 40, r: 12, t: 20, b: 24 };
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

  const GRID_R = 12;
  const gridStops = [0, 0.25, 0.5, 0.75, 1];
  gridStops.forEach((t) => {
    const y = PAD.t + cH * (1 - t);
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(PAD.l, y);
    ctx.lineTo(W - GRID_R, y);
    ctx.stroke();

    ctx.fillStyle = "#94a3b8";
    ctx.font = "9px JetBrains Mono, monospace";
    ctx.textAlign = "right";
    const val = mn + (mx - mn) * t;
    // Convert pts unit → BTC price (same formula as store: 84231 + pt * 80)
    const price = Math.round(84231 + val * 80);
    const label =
      price >= 1000 ? (price / 1000).toFixed(1) + "k" : String(price);
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

  // Signals — buy ▼ floats above the line (green), sell ▲ floats below (red)
  sigs.forEach((s) => {
    if (s.i >= pts.length) return;
    const sx = xM(s.i);
    const sy = yM(pts[s.i]);
    const isBuy = s.type === "buy";
    const color = isBuy ? "#10b981" : "#ef4444";
    const glowColor = isBuy ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)";
    const r = 5;
    const GAP = 8; // px gap between line and triangle tip
    // Clamp so triangle stays inside canvas
    const rawTy = isBuy ? sy - GAP - r : sy + GAP + r;
    const ty = Math.max(PAD.t + r + 2, Math.min(H - PAD.b - r - 2, rawTy));

    // Glow
    ctx.beginPath();
    ctx.arc(sx, ty, r + 3, 0, Math.PI * 2);
    ctx.fillStyle = glowColor;
    ctx.fill();

    // Triangle pointing toward the line
    ctx.beginPath();
    if (isBuy) {
      // ▼ tip points down toward line
      ctx.moveTo(sx, ty + r);
      ctx.lineTo(sx - r, ty - r + 2);
      ctx.lineTo(sx + r, ty - r + 2);
    } else {
      // ▲ tip points up toward line
      ctx.moveTo(sx, ty - r);
      ctx.lineTo(sx - r, ty + r - 2);
      ctx.lineTo(sx + r, ty + r - 2);
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  });

  // Current point — small circle at live edge
  const lx = xM(pts.length - 1);
  const ly = yM(pts[pts.length - 1]);
  ctx.beginPath();
  ctx.arc(lx, ly, 4, 0, Math.PI * 2);
  ctx.fillStyle = "#10b981";
  ctx.fill();

  const liveStart = startTime ?? Date.now() - pts.length * tickMs;
  const liveTotalMs = pts.length * tickMs;
  drawXAxisTimeLabels(ctx, PAD, cW, H, liveStart, liveTotalMs);
}

// ── Shared crosshair drawing ─────────────────────────────────────────────────
// Draws a vertical hairline + highlighted dot at position `x` on the canvas.
// color: the accent color for this chart (violet for paper, emerald for live).
export function drawCrosshair(
  canvas: HTMLCanvasElement,
  x: number, // canvas CSS pixel x
  y: number, // canvas CSS pixel y (the data point's y)
  color: string,
  PAD_L = 40,
  PAD_T = 12,
  PAD_B = 24,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const dpr = window.devicePixelRatio || 1;
  const W = canvas.width / dpr;
  const H = canvas.height / dpr;

  ctx.save();
  // Vertical hairline
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.moveTo(x, PAD_T);
  ctx.lineTo(x, H - PAD_B);
  ctx.stroke();
  ctx.setLineDash([]);

  // Highlighted dot
  ctx.globalAlpha = 1;
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x, y, 9, 0, Math.PI * 2);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.25;
  ctx.stroke();
  ctx.restore();
}

// Hit-test for paper chart: given mouse offsetX, return the closest data point index
// and its canvas coordinates.
export function paperHitTest(
  canvas: HTMLCanvasElement,
  offsetX: number,
  allPts: number[],
  vStart: number,
  vEnd: number,
  PAD_L = 40,
  PAD_R = 12,
): { localIdx: number; globalIdx: number; x: number } | null {
  if (allPts.length < 2 || vEnd <= vStart) return null;
  const drawW = canvas.getBoundingClientRect().width - PAD_L - PAD_R;
  const span = vEnd - vStart;
  const localIdx = Math.max(
    0,
    Math.min(vEnd - vStart, Math.round(((offsetX - PAD_L) / drawW) * span)),
  );
  const globalIdx = vStart + localIdx;
  const x = PAD_L + (localIdx / Math.max(span, 1)) * drawW;
  return { localIdx, globalIdx, x };
}

// Hit-test for live chart: given mouse offsetX, return the closest data point index.
export function liveHitTest(
  canvas: HTMLCanvasElement,
  offsetX: number,
  pts: number[],
  PAD_L = 40,
  PAD_R = 12,
): { idx: number; x: number } | null {
  if (pts.length < 2) return null;
  const cW = canvas.getBoundingClientRect().width - PAD_L - PAD_R;
  const idx = Math.max(
    0,
    Math.min(
      pts.length - 1,
      Math.round(((offsetX - PAD_L) / cW) * (pts.length - 1)),
    ),
  );
  const x = PAD_L + (idx / (pts.length - 1)) * cW;
  return { idx, x };
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
