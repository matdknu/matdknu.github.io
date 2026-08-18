(function () {
  var GROUP_COLORS = {
    1: "#8a7048",
    2: "#3d5f8a",
    3: "#5c4080",
    4: "#8b4a38",
    5: "#b91c1c",
    6: "#2a6658"
  };

  function theme() {
    var s = getComputedStyle(document.documentElement);
    return {
      ink: (s.getPropertyValue("--ink") || "#1a1a1a").trim(),
      muted: (s.getPropertyValue("--ink-muted") || "#999999").trim(),
      body: (s.getPropertyValue("--ink-body") || "#555555").trim(),
      bg: (s.getPropertyValue("--bg") || "#fafaf7").trim(),
      border: (s.getPropertyValue("--border") || "#e0ddd8").trim(),
      font: (s.getPropertyValue("--font-mono") || "IBM Plex Mono, monospace").trim()
    };
  }

  function splitLabel(raw) {
    var parts = String(raw || "").split("\n");
    return {
      title: parts[0] || "",
      subtitle: parts.slice(1).join(" ").trim()
    };
  }

  function render(el, spec) {
    if (typeof d3 === "undefined") return;

    var nodes = (spec.nodes || []).map(function (n, i) {
      var label = splitLabel(n.name);
      return {
        id: i,
        title: label.title,
        subtitle: label.subtitle,
        group: n.group,
        size: n.size || 22,
        color: GROUP_COLORS[n.group] || "#555555"
      };
    });

    var links = (spec.links || []).map(function (l) {
      return {
        source: l.source,
        target: l.target,
        value: l.value || 10
      };
    });

    el.innerHTML = "";
    var t = theme();
    var width = Math.max(el.clientWidth, 320);
    var height = spec.height || 360;
    var isMobile = width < 640;
    var pad = isMobile ? 28 : 56;

    var svg = d3.select(el)
      .append("svg")
      .attr("viewBox", "0 0 " + width + " " + height)
      .attr("role", "img")
      .attr("aria-label", spec.aria || "Academic lineage network");

    var defs = svg.append("defs");
    defs.append("marker")
      .attr("id", el.id + "-arrow")
      .attr("viewBox", "0 -4 8 8")
      .attr("refX", 8)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-4L8,0L0,4")
      .attr("fill", t.muted);

    nodes.forEach(function (n, i) {
      var t0 = nodes.length === 1 ? 0.5 : i / (nodes.length - 1);
      n.x = pad + t0 * (width - pad * 2);
      n.y = height * (0.42 + (i % 2 === 0 ? -0.04 : 0.04));
    });

    var linkForce = d3.forceLink(links)
      .id(function (d) { return d.id; })
      .distance(isMobile ? 78 : 108)
      .strength(1);

    var simulation = d3.forceSimulation(nodes)
      .force("link", linkForce)
      .force("charge", d3.forceManyBody().strength(isMobile ? -280 : -520))
      .force("collide", d3.forceCollide().radius(function (d) {
        return Math.max(14, d.size * 0.42) + (isMobile ? 22 : 28);
      }))
      .force("x", d3.forceX(function (d) {
        var t0 = nodes.length === 1 ? 0.5 : d.id / (nodes.length - 1);
        return pad + t0 * (width - pad * 2);
      }).strength(0.55))
      .force("y", d3.forceY(height / 2).strength(0.14))
      .alpha(0.9)
      .alphaDecay(0.03);

    var link = svg.append("g")
      .attr("fill", "none")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", t.border)
      .attr("stroke-width", 1.4)
      .attr("marker-end", "url(#" + el.id + "-arrow)");

    var node = svg.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .attr("class", "lineage-node")
      .call(d3.drag()
        .on("start", function (event, d) {
          if (!event.active) simulation.alphaTarget(0.25).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", function (event, d) {
          d.fx = Math.max(18, Math.min(width - 18, event.x));
          d.fy = Math.max(18, Math.min(height - 18, event.y));
        })
        .on("end", function (event, d) {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }));

    node.append("circle")
      .attr("r", function (d) { return Math.max(9, d.size * 0.38); })
      .attr("fill", function (d) { return d.color; })
      .attr("stroke", t.bg)
      .attr("stroke-width", 2.5);

    var last = nodes[nodes.length - 1];
    node.filter(function (d) { return d === last; })
      .append("circle")
      .attr("r", function (d) { return Math.max(9, d.size * 0.38) + 5; })
      .attr("fill", "none")
      .attr("stroke", function (d) { return d.color; })
      .attr("stroke-width", 1)
      .attr("opacity", 0.7);

    var label = node.append("text")
      .attr("text-anchor", "middle")
      .attr("fill", t.ink)
      .style("font-family", t.font)
      .style("pointer-events", "none");

    label.append("tspan")
      .attr("x", 0)
      .attr("dy", function (d) {
        return Math.max(9, d.size * 0.38) + 14;
      })
      .style("font-size", isMobile ? "9px" : "10.5px")
      .style("font-weight", "500")
      .text(function (d) { return d.title; });

    label.append("tspan")
      .attr("x", 0)
      .attr("dy", "1.25em")
      .attr("fill", t.body)
      .style("font-size", isMobile ? "7.5px" : "8.5px")
      .style("font-weight", "400")
      .text(function (d) { return d.subtitle; });

    function clamp(d) {
      var r = Math.max(9, d.size * 0.38) + 8;
      d.x = Math.max(r, Math.min(width - r, d.x));
      d.y = Math.max(r, Math.min(height - 36, d.y));
    }

    simulation.on("tick", function () {
      nodes.forEach(clamp);
      link
        .attr("x1", function (d) { return d.source.x; })
        .attr("y1", function (d) { return d.source.y; })
        .attr("x2", function (d) {
          var dx = d.target.x - d.source.x;
          var dy = d.target.y - d.source.y;
          var dist = Math.hypot(dx, dy) || 1;
          var r = Math.max(9, d.target.size * 0.38) + 6;
          return d.target.x - (dx / dist) * r;
        })
        .attr("y2", function (d) {
          var dx = d.target.x - d.source.x;
          var dy = d.target.y - d.source.y;
          var dist = Math.hypot(dx, dy) || 1;
          var r = Math.max(9, d.target.size * 0.38) + 6;
          return d.target.y - (dy / dist) * r;
        });
      node.attr("transform", function (d) {
        return "translate(" + d.x + "," + d.y + ")";
      });
    });

    el._lineageSim = simulation;
  }

  window.mountLineageGraph = function (selector, spec) {
    var el = typeof selector === "string" ? document.querySelector(selector) : selector;
    if (!el) return;

    var painted = false;
    function tryPaint() {
      if (el.clientWidth < 40) return;
      if (painted && el.dataset.w === String(el.clientWidth)) return;
      painted = true;
      el.dataset.w = String(el.clientWidth);
      if (el._lineageSim) el._lineageSim.stop();
      render(el, spec);
    }

    tryPaint();
    if (window.ResizeObserver) {
      new ResizeObserver(tryPaint).observe(el);
    }
    document.addEventListener("site-lang-change", function () {
      window.setTimeout(tryPaint, 60);
    });
  };
})();
