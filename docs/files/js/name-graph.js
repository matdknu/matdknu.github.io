(function () {
  const TOKENS = [
    { id: "matias", label: "Matías", size: 30, role: "name", color: "#6c5ce7" },
    { id: "deneken", label: "Deneken", size: 30, role: "name", color: "#4834d4" },
    { id: "nlp", label: "NLP", size: 17, role: "method", color: "#8b7cf8" },
    { id: "llms", label: "LLMs", size: 16, role: "method", color: "#a78bfa" },
    { id: "abm", label: "ABM", size: 16, role: "method", color: "#fb923c" },
    { id: "survey", label: "Survey", size: 16, role: "method", color: "#2dd4bf" },
    { id: "experiments", label: "Experiments", size: 14, role: "method", color: "#14b8a6" },
  ];

  const EDGES = [
    ["matias", "deneken", "seq"],
    ["matias", "nlp", "sem"],
    ["deneken", "nlp", "sem"],
    ["matias", "survey", "sem"],
    ["deneken", "survey", "sem"],
    ["matias", "abm", "sem"],
    ["deneken", "llms", "sem"],
    ["nlp", "llms", "sem"],
    ["nlp", "abm", "sem"],
    ["llms", "experiments", "sem"],
    ["survey", "experiments", "sem"],
    ["abm", "experiments", "sem"],
  ];

  function initNameGraph(canvas, options) {
    options = options || {};
    const interactive = options.interactive === true;
    const isWelcome = options.mode === "welcome";

    if (!canvas || canvas.dataset.ready === "1") return null;
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
    let rafId = null;
    const pointer = { x: 0, y: 0 };

    function updateAnchors() {
      const t = tick * 0.024;
      const cx = width / 2;
      const cy = height * (isWelcome ? 0.5 : 0.44);

      if (isWelcome) {
        const rx = width * 0.46;
        const ry = height * 0.46;
        const nameSpread = width * 0.14;

        nodeMap.matias.anchorX = cx - nameSpread + Math.sin(t) * 10;
        nodeMap.matias.anchorY = cy + Math.cos(t * 1.18) * 8;
        nodeMap.deneken.anchorX = cx + nameSpread + Math.sin(t + 1.4) * 10;
        nodeMap.deneken.anchorY = cy + Math.cos(t * 0.92 + 0.6) * 8;

        const methodIds = ["nlp", "llms", "abm", "survey", "experiments"];
        methodIds.forEach(function (id, i) {
          const base = -Math.PI / 2 + (i / methodIds.length) * Math.PI * 2;
          const angle = base + Math.sin(t * 0.85 + i * 1.1) * 0.08;
          const wobble = 0.96 + Math.sin(t * 1.05 + i * 0.7) * 0.04;
          nodeMap[id].anchorX = cx + Math.cos(angle) * rx * wobble;
          nodeMap[id].anchorY = cy + Math.sin(angle) * ry * wobble;
        });
        return;
      }

      const rBase = Math.min(width, height) * 0.34;
      const nameSpread = width * 0.14;

      nodeMap.matias.anchorX = cx - nameSpread + Math.sin(t) * 7;
      nodeMap.matias.anchorY = cy + Math.cos(t * 1.18) * 6;
      nodeMap.deneken.anchorX = cx + nameSpread + Math.sin(t + 1.4) * 7;
      nodeMap.deneken.anchorY = cy + Math.cos(t * 0.92 + 0.6) * 6;

      const methodIds = ["nlp", "llms", "abm", "survey", "experiments"];
      methodIds.forEach(function (id, i) {
        const base = -Math.PI / 2 + (i / methodIds.length) * Math.PI * 2;
        const angle = base + Math.sin(t * 0.85 + i * 1.1) * 0.1;
        const r = rBase * (0.58 + Math.sin(t * 1.05 + i * 0.7) * 0.04);
        nodeMap[id].anchorX = cx + Math.cos(angle) * r;
        nodeMap[id].anchorY = cy + Math.sin(angle) * r * 0.75;
      });
    }

    function resize() {
      if (!wrap) return;
      const rect = wrap.getBoundingClientRect();
      if (isWelcome) {
        width = Math.max(rect.width, window.innerWidth || 400);
        height = Math.max(rect.height, window.innerHeight || 360);
      } else {
        width = Math.max(rect.width, 220);
        height = Math.max(rect.height, 200);
      }
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
      const pad = isWelcome
        ? (node.role === "name" ? 28 : 20)
        : node.role === "name"
          ? node.size * 0.9
          : node.size * 0.7;
      node.x = Math.max(pad, Math.min(width - pad, node.x));
      const bottomInset = isWelcome ? pad : pad + 32;
      const topInset = isWelcome ? pad : pad + 8;
      node.y = Math.max(topInset, Math.min(height - bottomInset, node.y));
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
          const repulse = isWelcome
            ? a.role === "name" || b.role === "name"
              ? 4200
              : 2800
            : a.role === "name" || b.role === "name"
              ? 1650
              : 1050;
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
        const span = Math.min(width, height);
        const rest = isWelcome
          ? edge.kind === "seq"
            ? width * 0.16 + Math.sin(tick * 0.055) * 12
            : edge.source.role === "name" || edge.target.role === "name"
              ? span * 0.14 + Math.sin(tick * 0.04 + 1) * 10
              : span * 0.11 + Math.cos(tick * 0.05) * 8
          : edge.kind === "seq"
            ? width * 0.22 + Math.sin(tick * 0.055) * 10
            : edge.source.role === "name" || edge.target.role === "name"
              ? 68 + Math.sin(tick * 0.04 + 1) * 6
              : 52 + Math.cos(tick * 0.05) * 5;
        const spring = (dist - rest) * (edge.kind === "seq" ? (isWelcome ? 0.0055 : 0.0075) : isWelcome ? 0.003 : 0.0042);
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
          const pull = isWelcome
            ? node.role === "name"
              ? 0.0022
              : 0.0012
            : node.role === "name"
              ? 0.0028
              : 0.0018;
          node.vx += (node.anchorX - node.x) * pull;
          node.vy += (node.anchorY - node.y) * pull;
          if (node.role === "method") {
            const dx = node.x - width / 2;
            const dy = node.y - height * (isWelcome ? 0.5 : 0.44);
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
        ctx.lineWidth = isWelcome
          ? isSeq
            ? 3.5
            : hot
              ? 2.2
              : 1.6
          : isSeq
            ? 2
            : hot
              ? 1.2
              : 0.85;
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
        const scale = isWelcome ? 2.1 : 1;
        const pulse = isName ? Math.sin(tick * 0.07) * 2.2 : Math.sin(tick * 0.05 + node.size) * 0.6;
        const radius = node.size * (isName ? 0.62 : 0.5) * scale + pulse;
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
        const labelSize = isWelcome ? (isName ? 26 : node.label.length > 8 ? 15 : 16) : (isName ? 15 : node.label.length > 8 ? 9 : 10);
        ctx.font = isName
          ? "700 " + labelSize + "px Inter, system-ui, sans-serif"
          : node.label.length > 8
            ? "500 " + labelSize + "px JetBrains Mono, monospace"
            : "600 " + labelSize + "px JetBrains Mono, monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(node.label, node.x, node.y);
      });
    }

    function render() {
      tick += 1;
      applyPhysics();
      draw();
      rafId = requestAnimationFrame(render);
    }

    function setPointer(evt) {
      const rect = canvas.getBoundingClientRect();
      pointer.x = evt.clientX - rect.left;
      pointer.y = evt.clientY - rect.top;
    }

    function onPointerMove(evt) {
      setPointer(evt);
      hovered = pickNode(pointer.x, pointer.y);
      canvas.style.cursor = hovered ? "grab" : "default";
    }

    function onPointerDown(evt) {
      setPointer(evt);
      dragged = pickNode(pointer.x, pointer.y);
      if (dragged) {
        canvas.setPointerCapture(evt.pointerId);
        canvas.style.cursor = "grabbing";
      }
    }

    function onPointerUp() {
      dragged = null;
      canvas.style.cursor = hovered ? "grab" : "default";
    }

    function onPointerLeave() {
      hovered = null;
      dragged = null;
    }

    if (interactive) {
      canvas.addEventListener("pointermove", onPointerMove);
      canvas.addEventListener("pointerdown", onPointerDown);
      canvas.addEventListener("pointerup", onPointerUp);
      canvas.addEventListener("pointerleave", onPointerLeave);
    }

    resize();
    window.addEventListener("resize", resize);
    render();

    return {
      destroy: function () {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
        window.removeEventListener("resize", resize);
        if (interactive) {
          canvas.removeEventListener("pointermove", onPointerMove);
          canvas.removeEventListener("pointerdown", onPointerDown);
          canvas.removeEventListener("pointerup", onPointerUp);
          canvas.removeEventListener("pointerleave", onPointerLeave);
        }
        canvas.dataset.ready = "";
      },
    };
  }

  window.initNameGraph = initNameGraph;
})();
