(function () {
  const TOKENS = [
    { id: "matias", label: "Matías", size: 30, role: "name", color: "#6c5ce7" },
    { id: "deneken", label: "Deneken", size: 30, role: "name", color: "#4834d4" },
    { id: "nlp", label: "NLP", size: 17, role: "nlp", color: "#8b7cf8" },
    { id: "tokens", label: "tokens", size: 14, role: "nlp", color: "#a78bfa" },
    { id: "embed", label: "embeddings", size: 13, role: "nlp", color: "#c4b5fd" },
    { id: "text", label: "text", size: 15, role: "nlp", color: "#fb923c" },
    { id: "quanteda", label: "quanteda", size: 13, role: "nlp", color: "#fbbf24" },
    { id: "scrape", label: "scraping", size: 13, role: "nlp", color: "#f97316" },
    { id: "survey", label: "survey", size: 16, role: "soc", color: "#2dd4bf" },
    { id: "violence", label: "violence", size: 13, role: "soc", color: "#f472b6" },
    { id: "demo", label: "democracy", size: 13, role: "soc", color: "#7F77DD" },
  ];

  const EDGES = [
    ["matias", "deneken", "seq"],
    ["matias", "nlp", "sem"],
    ["deneken", "nlp", "sem"],
    ["nlp", "tokens", "sem"],
    ["nlp", "embed", "sem"],
    ["nlp", "text", "sem"],
    ["text", "quanteda", "sem"],
    ["text", "scrape", "sem"],
    ["matias", "survey", "sem"],
    ["deneken", "survey", "sem"],
    ["survey", "violence", "sem"],
    ["survey", "demo", "sem"],
    ["violence", "demo", "sem"],
  ];

  function initNameGraph(canvas) {
    if (!canvas || canvas.dataset.ready === "1") return;
    canvas.dataset.ready = "1";

    const ctx = canvas.getContext("2d");
    const wrap = canvas.parentElement;
    const nodeMap = {};
    const nodes = TOKENS.map(function (t) {
      const node = {
        id: t.id,
        label: t.label,
        size: t.size,
        role: t.role,
        color: t.color,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        anchorX: 0,
        anchorY: 0,
      };
      nodeMap[t.id] = node;
      return node;
    });

    const edges = EDGES.map(function (e) {
      return {
        source: nodeMap[e[0]],
        target: nodeMap[e[1]],
        kind: e[2] || "sem",
      };
    }).filter(function (e) {
      return e.source && e.target;
    });

    let width = 0;
    let height = 0;
    let dpr = 1;
    let tick = 0;
    let hovered = null;
    let dragged = null;
    const pointer = { x: 0, y: 0 };

    function updateAnchors() {
      const t = tick * 0.024;
      const cx = width / 2;
      const cy = height * 0.44;
      const rBase = Math.min(width, height) * 0.34;

      nodeMap.matias.anchorX = cx - width * 0.14 + Math.sin(t) * 7;
      nodeMap.matias.anchorY = cy + Math.cos(t * 1.18) * 6;
      nodeMap.deneken.anchorX = cx + width * 0.14 + Math.sin(t + 1.4) * 7;
      nodeMap.deneken.anchorY = cy + Math.cos(t * 0.92 + 0.6) * 6;

      const nlpIds = ["nlp", "tokens", "embed", "text", "quanteda", "scrape"];
      nlpIds.forEach(function (id, i) {
        const base = Math.PI * 0.92 + (i / (nlpIds.length - 1)) * Math.PI * 0.55;
        const angle = base + Math.sin(t * 0.85 + i * 1.1) * 0.14;
        const r = rBase * (0.52 + Math.sin(t * 1.05 + i * 0.7) * 0.05);
        nodeMap[id].anchorX = cx + Math.cos(angle) * r;
        nodeMap[id].anchorY = cy - Math.sin(angle) * r * 0.82 - height * 0.05;
      });

      const socIds = ["survey", "violence", "demo"];
      socIds.forEach(function (id, i) {
        const base = Math.PI * 0.08 + (i / (socIds.length - 1)) * Math.PI * 0.48;
        const angle = base + Math.cos(t * 0.78 + i * 1.2) * 0.12;
        const r = rBase * (0.52 + Math.cos(t * 0.95 + i * 0.8) * 0.05);
        nodeMap[id].anchorX = cx + Math.cos(angle) * r;
        nodeMap[id].anchorY = cy + Math.sin(angle) * r * 0.82 + height * 0.06;
      });
    }

    function resize() {
      if (!wrap) return;
      const rect = wrap.getBoundingClientRect();
      width = Math.max(rect.width, 220);
      height = Math.max(rect.height, 200);
      dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      tick = 0;
      updateAnchors();
      nodes.forEach(function (node) {
        node.x = node.anchorX;
        node.y = node.anchorY;
        node.vx = 0;
        node.vy = 0;
      });
    }

    function clamp(node) {
      const pad = node.role === "name" ? node.size * 0.9 : node.size * 0.7;
      node.x = Math.max(pad, Math.min(width - pad, node.x));
      node.y = Math.max(pad + 8, Math.min(height - pad - 32, node.y));
    }

    function applyPhysics() {
      updateAnchors();

      if (tick % 38 === 0 && !dragged) {
        nodes.forEach(function (node) {
          if (node !== dragged) {
            node.vx += (Math.random() - 0.5) * 0.55;
            node.vy += (Math.random() - 0.5) * 0.55;
          }
        });
      }

      for (let i = 0; i < nodes.length; i += 1) {
        for (let j = i + 1; j < nodes.length; j += 1) {
          const a = nodes[i];
          const b = nodes[j];
          let dx = b.x - a.x;
          let dy = b.y - a.y;
          const distSq = Math.max(dx * dx + dy * dy, 100);
          const repulse = a.role === "name" || b.role === "name" ? 1650 : 1050;
          const force = repulse / distSq;
          const dist = Math.sqrt(distSq);
          dx /= dist;
          dy /= dist;
          a.vx -= dx * force;
          a.vy -= dy * force;
          b.vx += dx * force;
          b.vy += dy * force;
        }
      }

      edges.forEach(function (edge) {
        const dx = edge.target.x - edge.source.x;
        const dy = edge.target.y - edge.source.y;
        const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
        const rest =
          edge.kind === "seq"
            ? width * 0.22 + Math.sin(tick * 0.055) * 10
            : edge.source.role === "name" || edge.target.role === "name"
              ? 68 + Math.sin(tick * 0.04 + 1) * 6
              : 52 + Math.cos(tick * 0.05) * 5;
        const spring = (dist - rest) * (edge.kind === "seq" ? 0.0075 : 0.0042);
        const ux = dx / dist;
        const uy = dy / dist;
        edge.source.vx += ux * spring;
        edge.source.vy += uy * spring;
        edge.target.vx -= ux * spring;
        edge.target.vy -= uy * spring;
      });

      nodes.forEach(function (node) {
        if (dragged === node) {
          node.x = pointer.x;
          node.y = pointer.y;
          node.vx = 0;
          node.vy = 0;
        } else {
          const pull = node.role === "name" ? 0.0028 : 0.0018;
          node.vx += (node.anchorX - node.x) * pull;
          node.vy += (node.anchorY - node.y) * pull;
          if (node.role !== "name") {
            const dx = node.x - width / 2;
            const dy = node.y - height * 0.44;
            const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
            const spin = 0.11 + Math.sin(tick * 0.03 + node.size) * 0.04;
            node.vx += (-dy / dist) * spin;
            node.vy += (dx / dist) * spin;
          }
          node.vx *= 0.87;
          node.vy *= 0.87;
          node.x += node.vx;
          node.y += node.vy;
        }
        clamp(node);
      });
    }

    function pickNode(x, y) {
      const sorted = nodes.slice().sort(function (a, b) {
        return a.size - b.size;
      });
      for (let i = sorted.length - 1; i >= 0; i -= 1) {
        const node = sorted[i];
        const dx = x - node.x;
        const dy = y - node.y;
        const hit = node.role === "name" ? node.size * 1.1 : node.size * 0.95;
        if (dx * dx + dy * dy < hit * hit) return node;
      }
      return null;
    }

    function drawNameCaption(isDark) {
      ctx.save();
      ctx.font = '500 11px "JetBrains Mono", monospace';
      ctx.fillStyle = isDark ? "rgba(255,255,255,0.45)" : "rgba(15,15,20,0.45)";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText("NLP · token graph", 12, 14);
      ctx.textAlign = "left";
      ctx.restore();
    }

    function draw() {
      const isDark =
        document.documentElement.getAttribute("data-theme") === "dark";

      ctx.clearRect(0, 0, width, height);

      edges.forEach(function (edge, index) {
        const hot =
          hovered && (hovered === edge.source || hovered === edge.target);
        const isSeq = edge.kind === "seq";
        ctx.beginPath();
        ctx.strokeStyle = hot
          ? isDark
            ? "rgba(255,255,255,0.55)"
            : "rgba(108,92,231,0.65)"
          : isSeq
            ? isDark
              ? "rgba(255,255,255,0.35)"
              : "rgba(108,92,231,0.45)"
            : isDark
              ? "rgba(255,255,255,0.12)"
              : "rgba(108,92,231,0.2)";
        ctx.lineWidth = isSeq ? 2 : hot ? 1.2 : 0.85;
        if (!isSeq) ctx.setLineDash([3, 4]);
        ctx.moveTo(edge.source.x, edge.source.y);
        ctx.lineTo(edge.target.x, edge.target.y);
        ctx.stroke();
        ctx.setLineDash([]);

        const progress = ((tick * 0.016) + index * 0.11) % 1;
        const px = edge.source.x + (edge.target.x - edge.source.x) * progress;
        const py = edge.source.y + (edge.target.y - edge.source.y) * progress;
        ctx.beginPath();
        ctx.fillStyle = isDark
          ? "rgba(255,255,255,0.7)"
          : "rgba(108,92,231,0.6)";
        ctx.arc(px, py, isSeq ? 2.4 : 1.8, 0, Math.PI * 2);
        ctx.fill();
      });

      nodes.forEach(function (node) {
        const isName = node.role === "name";
        const pulse = isName ? Math.sin(tick * 0.07) * 2.2 : Math.sin(tick * 0.05 + node.size) * 0.6;
        const radius = node.size * (isName ? 0.62 : 0.5) + pulse;
        const isHot = hovered === node;

        if (isName) {
          ctx.beginPath();
          ctx.fillStyle = isDark
            ? "rgba(255,255,255,0.06)"
            : "rgba(108,92,231,0.08)";
          ctx.arc(node.x, node.y, radius + 10, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.beginPath();
        ctx.fillStyle = node.color;
        ctx.shadowColor = isHot ? node.color : "transparent";
        ctx.shadowBlur = isHot ? 20 : isName ? 12 : 0;
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = isDark ? "#ffffff" : "#0f0f14";
        ctx.font = isName
          ? "700 15px Inter, system-ui, sans-serif"
          : node.label.length > 8
            ? "500 9px JetBrains Mono, monospace"
            : "600 10px JetBrains Mono, monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(node.label, node.x, node.y);
      });

      drawNameCaption(isDark);
    }

    function render() {
      tick += 1;
      applyPhysics();
      draw();
      requestAnimationFrame(render);
    }

    function setPointer(evt) {
      const rect = canvas.getBoundingClientRect();
      pointer.x = evt.clientX - rect.left;
      pointer.y = evt.clientY - rect.top;
    }

    canvas.addEventListener("pointermove", function (evt) {
      setPointer(evt);
      hovered = pickNode(pointer.x, pointer.y);
      canvas.style.cursor = hovered ? "grab" : "default";
    });

    canvas.addEventListener("pointerdown", function (evt) {
      setPointer(evt);
      dragged = pickNode(pointer.x, pointer.y);
      if (dragged) {
        canvas.setPointerCapture(evt.pointerId);
        canvas.style.cursor = "grabbing";
      }
    });

    canvas.addEventListener("pointerup", function () {
      dragged = null;
      canvas.style.cursor = hovered ? "grab" : "default";
    });

    canvas.addEventListener("pointerleave", function () {
      hovered = null;
      dragged = null;
    });

    resize();
    window.addEventListener("resize", resize);
    render();
  }

  function mountNameGraph() {
    const mount = document.getElementById("name-graph-mount");
    const aboutEntity = document.querySelector(".about-entity");
    if (!mount || !aboutEntity) return;

    aboutEntity.insertBefore(mount, aboutEntity.firstChild);
    const canvas = mount.querySelector("canvas");
    if (canvas) initNameGraph(canvas);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountNameGraph);
  } else {
    mountNameGraph();
  }
})();
