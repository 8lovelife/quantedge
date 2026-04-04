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

export function drawBacktestChart(
  canvas: HTMLCanvasElement,
  pts: number[],
  sigs: Signal[],
  options: {
    showAnimation?: boolean;
    currentIndex?: number;
    startTime?: number; // unix ms of first data point; defaults to 3 months ago
    tickMs?: number; // ms per data point; defaults to 4h candles
  } = {},
) {
  if (pts.length < 2) return;

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

  // Signals
  sigs
    .filter((s) => s.i < pts.length)
    .forEach((s) => {
      ctx.beginPath();
      ctx.arc(xM(s.i), yM(pts[s.i]), 5, 0, Math.PI * 2);
      ctx.fillStyle = s.type === "buy" ? "#10b981" : "#ef4444";
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

export function drawPaperChart(
  canvas: HTMLCanvasElement,
  pts: number[],
  sigs: Signal[],
  ref: number[],
  startTime?: number,
  endTime?: number,
  tickMs = 300,
) {
  if (pts.length < 2) return;

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

  // ── Time window (computed FIRST so xM is correct from the start) ────────────
  const now = Date.now();
  const paperStart = startTime ?? now - pts.length * tickMs;
  const paperEnd = endTime ?? paperStart + pts.length * tickMs;
  const totalPlanMs = paperEnd - paperStart;
  const elapsedMs = Math.min(Math.max(now - paperStart, 0), totalPlanMs);
  const progressRatio = totalPlanMs > 0 ? elapsedMs / totalPlanMs : 1;

  // curveW = how many canvas px the drawn curve occupies (left portion)
  const curveW = cW * progressRatio;

  // xM: maps data index → canvas X within the elapsed (curve) portion
  const xM = (i: number) => PAD.l + (i / Math.max(pts.length - 1, 1)) * curveW;
  const yM = (v: number) => PAD.t + cH - ((v - mn) / (mx - mn || 1)) * cH;

  // ── Grid lines (Y) ───────────────────────────────────────────────────────────
  const gridStops = [0, 0.25, 0.5, 0.75, 1];
  gridStops.forEach((t) => {
    const y = PAD.t + cH * (1 - t);
    // Past zone grid
    ctx.strokeStyle = "rgba(226,232,240,0.7)";
    ctx.lineWidth = 0.5;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(PAD.l, y);
    ctx.lineTo(PAD.l + curveW, y);
    ctx.stroke();
    // Future zone grid (dimmer)
    ctx.strokeStyle = "rgba(226,232,240,0.25)";
    ctx.beginPath();
    ctx.moveTo(PAD.l + curveW, y);
    ctx.lineTo(W - PAD.r, y);
    ctx.stroke();

    // Y-axis label
    ctx.fillStyle = "#94a3b8";
    ctx.font = "9px JetBrains Mono, monospace";
    ctx.textAlign = "right";
    const val = mn + (mx - mn) * t;
    const label =
      t === 0.5 ? "0%" : (val > 0 ? "+" : "") + Math.round(val * 0.4) + "%";
    ctx.fillText(label, PAD.l - 4, y + 3);
  });

  // ── Future zone fill ─────────────────────────────────────────────────────────
  if (progressRatio < 1) {
    const futureX = PAD.l + curveW;
    ctx.fillStyle = "rgba(148,163,184,0.035)";
    ctx.fillRect(futureX, PAD.t, cW - curveW, cH);

    // "未来" label — only if wide enough
    if (cW - curveW > 32) {
      ctx.fillStyle = "rgba(148,163,184,0.35)";
      ctx.font = "9px JetBrains Mono, monospace";
      ctx.textAlign = "center";
      ctx.fillText("未来", futureX + (cW - curveW) / 2, PAD.t + cH / 2);
    }
  }

  // ── Reference line (dashed) ──────────────────────────────────────────────────
  if (ref && ref.length > 1) {
    ctx.strokeStyle = "rgba(59,130,246,0.5)";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ref.slice(0, pts.length).forEach((v, i) => {
      if (i === 0) ctx.moveTo(xM(i), yM(v));
      else ctx.lineTo(xM(i), yM(v));
    });
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // ── Area fill ────────────────────────────────────────────────────────────────
  const gradient = ctx.createLinearGradient(0, PAD.t, 0, PAD.t + cH);
  gradient.addColorStop(0, "rgba(139,92,246,0.12)");
  gradient.addColorStop(1, "rgba(139,92,246,0)");
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

  // ── Curve line ───────────────────────────────────────────────────────────────
  ctx.strokeStyle = "#8b5cf6";
  ctx.lineWidth = 2;
  ctx.lineJoin = "round";
  ctx.setLineDash([]);
  ctx.beginPath();
  pts.forEach((v, i) => {
    if (i === 0) ctx.moveTo(xM(i), yM(v));
    else ctx.lineTo(xM(i), yM(v));
  });
  ctx.stroke();

  // ── Signal dots ──────────────────────────────────────────────────────────────
  sigs
    .filter((s) => s.i < pts.length)
    .forEach((s) => {
      ctx.beginPath();
      ctx.arc(xM(s.i), yM(pts[s.i]), 5, 0, Math.PI * 2);
      ctx.fillStyle = s.type === "buy" ? "#10b981" : "#ef4444";
      ctx.fill();
    });

  // ── "今" vertical line at NOW ────────────────────────────────────────────────
  if (progressRatio > 0.03 && progressRatio < 0.97) {
    const nowX = PAD.l + curveW;
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
  // Label format chosen by totalPlanMs (the full plan span, not just elapsed)
  const fmtTick = (ms: number): string => {
    const d = new Date(ms);
    const pad = (n: number) => String(n).padStart(2, "0");
    if (totalPlanMs < 60_000 * 10) {
      // < 10 min: HH:MM:SS
      return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    }
    if (totalPlanMs < 3_600_000 * 4) {
      // < 4 h: HH:MM
      return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }
    if (totalPlanMs < 86_400_000 * 2) {
      // < 2 days: M/D HH:00
      return `${d.getMonth() + 1}/${d.getDate()} ${pad(d.getHours())}:00`;
    }
    // ≥ 2 days: M/D
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  ctx.font = "9px JetBrains Mono, monospace";
  const labelY = H - 5;

  // Always draw 4 evenly-spaced labels across the full plan window
  // but visually dim the future ones
  const steps = 3;
  for (let i = 0; i <= steps; i++) {
    const ratio = i / steps;
    const tMs = paperStart + totalPlanMs * ratio;
    const x = PAD.l + cW * ratio;
    const isFuture = ratio > progressRatio + 0.01;

    ctx.fillStyle = isFuture ? "rgba(148,163,184,0.35)" : "#94a3b8";
    ctx.textAlign = i === 0 ? "left" : i === steps ? "right" : "center";

    let label = fmtTick(tMs);
    // Mark the end label clearly as the planned end
    if (i === steps && progressRatio < 0.97) label = `⊙ ${label}`;

    ctx.fillText(label, x, labelY);
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
