(function () {
  const instances = [];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function gauss(x, mu, sigma) {
    const z = (x - mu) / sigma;
    return Math.exp(-0.5 * z * z);
  }

  function kdeAt(x, t) {
    const m1 = 0.28 + 0.15 * Math.sin(t * 0.95);
    const m2 = 0.72 + 0.13 * Math.cos(t * 0.8);
    const m3 = 0.5 + 0.1 * Math.sin(t * 1.2 + 0.8);
    return (
      0.9 * gauss(x, m1, 0.085) +
      0.75 * gauss(x, m2, 0.075) +
      0.5 * gauss(x, m3, 0.1)
    );
  }

  function setupCanvas(canvas) {
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(rect.width, 24);
    const h = Math.max(rect.height, 16);
    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx: ctx, w: w, h: h };
  }

  function makeAnimator(canvas, drawFrame) {
    const wrap = canvas.parentElement;
    let raf = null;
    const t0 = performance.now();

    function draw() {
      const setup = setupCanvas(canvas);
      const color = getComputedStyle(wrap).color;
      const t = (performance.now() - t0) / 1000;
      drawFrame(setup.ctx, setup.w, setup.h, color, t);
      if (!reducedMotion) raf = requestAnimationFrame(draw);
    }

    draw();
    return {
      destroy: function () {
        if (raf) cancelAnimationFrame(raf);
        canvas.dataset.ready = "";
      },
    };
  }

  function drawDensity(ctx, w, h, color, t) {
    const baseY = h - 1;
    const steps = Math.max(20, Math.round(w));
    const vals = [];
    let maxK = 0.001;
    for (let i = 0; i <= steps; i += 1) {
      const v = kdeAt(i / steps, t);
      vals.push(v);
      if (v > maxK) maxK = v;
    }
    ctx.clearRect(0, 0, w, h);
    ctx.beginPath();
    ctx.moveTo(0, baseY);
    for (let i = 0; i <= steps; i += 1) {
      ctx.lineTo((i / steps) * w, baseY - (vals[i] / maxK) * (h - 4));
    }
    ctx.lineTo(w, baseY);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.82;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.beginPath();
    for (let i = 0; i <= steps; i += 1) {
      const x = (i / steps) * w;
      const y = baseY - (vals[i] / maxK) * (h - 4);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  function drawBars(ctx, w, h, color, t) {
    const barCount = 5;
    const gap = w * 0.08;
    const barW = (w - gap * (barCount + 1)) / barCount;
    const baseY = h - 1;
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < barCount; i += 1) {
      const phase = t * 1.35 + i * 0.75;
      const norm =
        0.32 +
        0.68 * (0.5 + 0.5 * Math.sin(phase) * Math.cos(phase * 0.55 + 0.4));
      const barH = Math.max(2, norm * (h - 3));
      const x = gap + i * (barW + gap);
      const y = baseY - barH;
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.35 + norm * 0.55;
      ctx.fillRect(x, y, barW, barH);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = color;
      ctx.lineWidth = 0.8;
      ctx.strokeRect(x + 0.5, y + 0.5, Math.max(0, barW - 1), Math.max(0, barH - 1));
    }
  }

  function drawScatter(ctx, w, h, color, t) {
    const n = 16;
    const cx = w / 2;
    const cy = h / 2;
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < n; i += 1) {
      const a = t * 0.7 + i * 0.62;
      const rx = w * (0.32 + 0.06 * Math.sin(t + i * 0.4));
      const ry = h * (0.34 + 0.05 * Math.cos(t * 0.9 + i * 0.3));
      const px = cx + Math.cos(a) * rx;
      const py = cy + Math.sin(a * 1.08) * ry;
      const r = 1 + (i % 3) * 0.35;
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.45 + (i / n) * 0.5;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawRing(ctx, cx, cy, r0, r1, a0, a1, color, alpha) {
    ctx.beginPath();
    ctx.arc(cx, cy, r1, a0, a1);
    ctx.arc(cx, cy, r0, a1, a0, true);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function drawNestedPie(ctx, w, h, color, t) {
    const cx = w / 2;
    const cy = h / 2;
    const R = Math.min(w, h) * 0.48;
    const midR = R * 0.68;
    const innerHole = R * 0.36;
    const outerSegs = [0.3, 0.22, 0.24, 0.24];
    const innerSegs = [0.38, 0.34, 0.28];
    ctx.clearRect(0, 0, w, h);

    let a = t * 0.55;
    outerSegs.forEach(function (frac, i) {
      const span = frac * Math.PI * 2 * (0.92 + 0.08 * Math.sin(t + i));
      drawRing(ctx, cx, cy, midR, R, a, a + span, color, 0.42 + i * 0.12);
      a += span;
    });

    a = -t * 0.85 + 0.5;
    innerSegs.forEach(function (frac, i) {
      const span = frac * Math.PI * 2;
      drawRing(ctx, cx, cy, innerHole, midR - 0.5, a, a + span, color, 0.55 + i * 0.1);
      a += span;
    });

    ctx.beginPath();
    ctx.arc(cx, cy, innerHole * 0.55, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.25;
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function drawLine(ctx, w, h, color, t) {
    const steps = Math.max(18, Math.round(w));
    const baseY = h - 1;
    ctx.clearRect(0, 0, w, h);
    ctx.beginPath();
    for (let i = 0; i <= steps; i += 1) {
      const x = (i / steps) * w;
      const nx = i / steps;
      const y =
        baseY -
        (0.22 +
          0.55 *
            (0.5 +
              0.5 *
                Math.sin(nx * Math.PI * 2.2 + t * 1.4) *
                Math.cos(nx * 3.5 - t * 0.6))) *
          (h - 4);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.lineTo(w, baseY);
    ctx.lineTo(0, baseY);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.12;
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function drawBoxplot(ctx, w, h, color, t) {
    const groups = 3;
    const gw = w / groups;
    ctx.clearRect(0, 0, w, h);
    for (let g = 0; g < groups; g += 1) {
      const cx = gw * g + gw / 2;
      const spread = 0.12 + 0.06 * Math.sin(t + g);
      const q1 = h * (0.55 + spread * Math.sin(t * 0.8 + g));
      const med = h * (0.38 + spread * Math.cos(t + g * 0.7));
      const q3 = h * (0.22 + spread * Math.sin(t * 1.1 + g * 1.2));
      const bw = gw * 0.22;
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.2;
      ctx.fillRect(cx - bw, q3, bw * 2, q1 - q3);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = color;
      ctx.lineWidth = 0.9;
      ctx.strokeRect(cx - bw, q3, bw * 2, q1 - q3);
      ctx.beginPath();
      ctx.moveTo(cx - bw, med);
      ctx.lineTo(cx + bw, med);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, q3 - 2);
      ctx.lineTo(cx, q1 + 2);
      ctx.stroke();
    }
  }

  function drawHistogram(ctx, w, h, color, t) {
    const bins = 7;
    const gap = w * 0.03;
    const binW = (w - gap * (bins + 1)) / bins;
    const baseY = h - 1;
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < bins; i += 1) {
      const v =
        0.25 +
        0.75 *
          kdeAt(i / (bins - 1), t * 1.1 + i * 0.15) *
          (0.85 + 0.15 * Math.sin(t * 1.8 + i));
      const barH = Math.max(2, v * (h - 3));
      const x = gap + i * (binW + gap);
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.5 + (i / bins) * 0.4;
      ctx.fillRect(x, baseY - barH, binW, barH);
    }
    ctx.globalAlpha = 1;
  }

  function drawHeatmap(ctx, w, h, color, t) {
    const cols = 6;
    const rows = 4;
    const cw = w / cols;
    const rh = h / rows;
    ctx.clearRect(0, 0, w, h);
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        const v =
          0.5 +
          0.5 *
            Math.sin(c * 0.9 + t * 1.2) *
            Math.cos(r * 1.1 + t * 0.9);
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.15 + v * 0.7;
        ctx.fillRect(c * cw + 0.5, r * rh + 0.5, cw - 1, rh - 1);
      }
    }
    ctx.globalAlpha = 1;
  }

  const CHART_DRAWERS = {
    density: drawDensity,
    bars: drawBars,
    scatter: drawScatter,
    "nested-pie": drawNestedPie,
    line: drawLine,
    boxplot: drawBoxplot,
    histogram: drawHistogram,
    heatmap: drawHeatmap,
  };

  function initChart(canvas) {
    const type = canvas.getAttribute("data-chart");
    const drawer = CHART_DRAWERS[type];
    if (!drawer) return null;
    return makeAnimator(canvas, drawer);
  }

  function initNavMiniCharts() {
    document.querySelectorAll(".nav-chart-canvas").forEach(function (canvas) {
      if (canvas.dataset.ready === "1") return;
      canvas.dataset.ready = "1";
      const api = initChart(canvas);
      if (api) instances.push(api);
    });
  }

  window.initNavMiniCharts = initNavMiniCharts;
  window.destroyNavMiniCharts = function () {
    instances.forEach(function (api) {
      if (api && api.destroy) api.destroy();
    });
    instances.length = 0;
  };
})();
