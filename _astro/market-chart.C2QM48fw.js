const RANGES = { "1W": 7, "1M": 30, "3M": 91, "6M": 182, "1Y": 365 };
const DAY = 86400000;
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function money(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Number(value));
}

function signed(value) {
  const amount = money(Math.abs(Number(value)));
  return Number(value) >= 0 ? `+${amount}` : `−${amount}`;
}

function dateLabel(ms, withYear) {
  const date = new Date(ms);
  const label = `${date.getUTCDate()} ${months[date.getUTCMonth()]}`;
  return withYear ? `${label} ${date.getUTCFullYear()}` : label;
}

function fill(template, values) {
  return String(template || "").replace(/\{(\w+)\}/g, (_, key) => values[key] ?? "");
}

export function createMarketChart(els, options) {
  const plot = els.plot;
  const tip = els.tip;
  const words = options.words || {};
  let points = [];
  let range = "3M";
  let zoom = 1;
  let index = null;

  plot.innerHTML = "";
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 1000 360");
  svg.setAttribute("preserveAspectRatio", "none");
  svg.style.cssText = "width:100%;height:100%;display:block;touch-action:none";
  const area = path("area");
  const line = path("line");
  area.setAttribute("fill", "rgba(212,167,44,.18)");
  area.setAttribute("stroke", "none");
  line.setAttribute("fill", "none");
  line.setAttribute("stroke", "#8d6a2e");
  line.setAttribute("stroke-width", "3");
  line.setAttribute("vector-effect", "non-scaling-stroke");
  const cursor = document.createElementNS("http://www.w3.org/2000/svg", "line");
  cursor.setAttribute("y1", "0");
  cursor.setAttribute("y2", "360");
  cursor.setAttribute("stroke", "#8d6a2e");
  cursor.setAttribute("stroke-dasharray", "4 4");
  cursor.setAttribute("visibility", "hidden");
  svg.append(area, line, cursor);
  plot.append(svg);

  function path(name) {
    const node = document.createElementNS("http://www.w3.org/2000/svg", "path");
    node.dataset.part = name;
    return node;
  }

  function span() {
    return (RANGES[range] || 91) * DAY / zoom;
  }

  function visible() {
    if (!points.length) return [];
    const end = points[points.length - 1].t;
    const start = end - span();
    const rows = points.filter((point) => point.t >= start && point.t <= end);
    return rows.length > 1 ? rows : points.slice(-2);
  }

  function emit(rows, current) {
    const first = rows[0];
    const last = rows[rows.length - 1];
    const point = current || last;
    const past = point !== last;
    const move = signed(point.rate - (past ? first.rate : last.rate === point.rate ? first.rate : point.rate));
    const compared = past ? first : rows[Math.max(0, rows.length - 2)];
    const delta = point.rate - compared.rate;
    const view = {
      value: money(point.rate),
      line: fill(words.since, { move: signed(point.rate - first.rate), date: dateLabel(first.t) }),
      sub: past
        ? dateLabel(point.t, true)
        : fill(words.over, { move: signed(last.rate - first.rate), range: (words.ranges && words.ranges[range]) || range }),
      up: delta >= 0n,
      past,
      badge: point.kind === "est" ? "est" : point.kind === "live" ? "live" : "close",
      badgeText: point.kind === "est" ? words.estimated : point.kind === "live" ? words.live : words.closing
    };
    options.onState?.({ view, over: view.sub });
    if (!tip) return;
    const date = tip.querySelector(".mkc-tip-d");
    const value = tip.querySelector(".mkc-tip-v");
    const note = tip.querySelector(".mkc-tip-n");
    if (date) date.textContent = dateLabel(point.t, true);
    if (value) value.textContent = money(point.rate);
    if (note) note.textContent = point.kind === "est" ? words.tipEst : words.tipClose;
    tip.hidden = index === null;
  }

  function draw() {
    const rows = visible();
    if (rows.length < 2) return;
    const rates = rows.map((point) => Number(point.rate));
    const low = Math.min(...rates);
    const high = Math.max(...rates);
    const pad = Math.max(high - low, high * 0.002);
    const start = rows[0].t;
    const end = rows[rows.length - 1].t;
    const x = (time) => ((time - start) / Math.max(1, end - start)) * 1000;
    const y = (rate) => 16 + (1 - (rate - low) / pad) * 320;
    const commands = rows.map((point, i) => `${i ? "L" : "M"}${x(point.t).toFixed(1)} ${y(Number(point.rate)).toFixed(1)}`).join(" ");
    line.setAttribute("d", commands);
    area.setAttribute("d", `${commands} L${x(end).toFixed(1)} 360 L${x(start).toFixed(1)} 360 Z`);
    const current = index == null ? rows[rows.length - 1] : points[index];
    if (current) {
      cursor.setAttribute("x1", String(x(current.t)));
      cursor.setAttribute("x2", String(x(current.t)));
      cursor.setAttribute("visibility", index == null ? "hidden" : "visible");
    }
    emit(rows, current);
  }

  function pointAt(clientX) {
    const rows = visible();
    if (!rows.length) return;
    const rect = plot.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / Math.max(1, rect.width)));
    const target = rows[0].t + ratio * (rows[rows.length - 1].t - rows[0].t);
    let best = 0;
    let gap = Infinity;
    rows.forEach((point, i) => {
      const next = Math.abs(Number(point.t - target));
      if (next < gap) {
        gap = next;
        best = i;
      }
    });
    index = points.indexOf(rows[best]);
    draw();
  }

  plot.addEventListener("pointermove", (event) => pointAt(event.clientX));
  plot.addEventListener("pointerleave", () => {
    index = null;
    draw();
  });
  plot.addEventListener("keydown", (event) => {
    const rows = visible();
    if (!rows.length) return;
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      const current = index == null ? points.indexOf(rows[rows.length - 1]) : index;
      const step = event.key === "ArrowRight" ? 1 : -1;
      index = Math.min(points.length - 1, Math.max(0, current + step));
      draw();
    }
    if (event.key === "+" || event.key === "=") zoomIn();
    if (event.key === "-" || event.key === "_") zoomOut();
  });

  function setPoints(next) {
    points = Array.isArray(next) ? next : [];
    index = null;
    draw();
  }

  function setRange(next) {
    if (!RANGES[next]) return;
    range = next;
    zoom = 1;
    index = null;
    options.onRange?.(range);
    draw();
  }

  function zoomIn() {
    zoom = Math.min(12, zoom * 1.6);
    draw();
  }

  function zoomOut() {
    zoom = Math.max(1, zoom / 1.6);
    draw();
  }

  setRange("3M");
  return { setPoints, setRange, zoomIn, zoomOut };
}
