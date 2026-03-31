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

export function drawBacktestChart(
  canvas: HTMLCanvasElement,
  pts: number[],
  sigs: Signal[],
  options: {
    showAnimation?: boolean;
    currentIndex?: number;
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

  // X-axis labels
  const labels = ["12月", "1月", "2月", "3月"];
  labels.forEach((l, i) => {
    ctx.fillStyle = "#94a3b8";
    ctx.font = "9px JetBrains Mono, monospace";
    ctx.textAlign = "left";
    ctx.fillText(l, PAD.l + cW * (i / 3), H - 6);
  });
}

export function drawPaperChart(
  canvas: HTMLCanvasElement,
  pts: number[],
  sigs: Signal[],
  ref: number[],
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

  const yM = (v: number) => PAD.t + cH - ((v - mn) / (mx - mn)) * cH;
  const xM = (i: number) => PAD.l + (i / (pts.length - 1)) * cW;

  // Grid lines + Y-axis labels (same as backtest/live charts)
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
    const val = mn + (mx - mn) * t;
    const label =
      t === 0.5 ? "0%" : (val > 0 ? "+" : "") + Math.round(val * 0.4) + "%";
    ctx.fillText(label, PAD.l - 4, y + 3);
  });

  // Reference line (dashed)
  if (ref && pts.length > 1) {
    ctx.strokeStyle = "#3b82f6";
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

  // Area fill
  const gradient = ctx.createLinearGradient(0, PAD.t, 0, PAD.t + cH);
  gradient.addColorStop(0, "rgba(139, 92, 246, 0.1)");
  gradient.addColorStop(1, "rgba(139, 92, 246, 0)");

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
  ctx.strokeStyle = "#8b5cf6";
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

  // X-axis labels
  const labels = ["3/8", "3/12", "3/17", "3/22"];
  labels.forEach((l, i) => {
    ctx.fillStyle = "#94a3b8";
    ctx.font = "9px JetBrains Mono, monospace";
    ctx.textAlign = "left";
    ctx.fillText(l, PAD.l + cW * (i / 3), H - 6);
  });
}

export function drawLiveChart(
  canvas: HTMLCanvasElement,
  pts: number[],
  sigs: Signal[],
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
