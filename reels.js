(() => {
  // ============================================================
  // CONFIG
  // ============================================================

  // Data: what the reels show. Every symbol must match the CV.
  const DATA = {
    // One array per reel, top to bottom. v = big value, l = label under it.
    reels: [
      [
        { v: '25+', l: 'games shipped' },
        { v: '8+', l: 'years in frontend' },
        { v: '4+', l: 'years in iGaming' },
        { v: '14', l: 'Phaser casino games' }
      ],
      [
        { v: '-40%', l: 'bundle size' },
        { v: '-15%', l: 'initial load time' },
        { v: '90%', l: 'test coverage, up from 40%' }
      ],
      [
        { v: '-32%', l: 'draw calls' },
        { v: '12', l: 'slots at Innovecs' },
        { v: '4', l: 'slots on a Pixi engine' }
      ]
    ],
    // Index of the symbol each reel lands on after the first spin on page load.
    firstLanding: [0, 0, 0]
  };

  // Style: how the reels look and move.
  const STYLE = {
    // A value starting with "--" is read from the page's CSS variables,
    // so the canvas stays in sync with styles. Otherwise use #RRGGBB.
    colors: {
      panel: '--panel',     // machine background
      window: '--ink',      // reel window background (also the fade colour)
      value: '--brass',     // big numbers
      label: '--text',      // labels under the numbers
      payline: '--brass'    // frame around the middle row
    },
    fonts: {
      valueFamily: 'Unbounded, system-ui, sans-serif',
      valueWeight: 700,
      labelFamily: '"Atkinson Hyperlegible", system-ui, sans-serif',
      labelWeight: 400,
      labelMinSize: 12,     // px
      labelMaxSize: 15      // px
    },
    layout: {
      minCellHeight: 96,    // px, one symbol's height
      maxCellHeight: 150,
      panelRadius: 20,
      windowRadius: 12,
      paylineRadius: 14,
      paylineWidth: 2,
      paylineAlpha: 0.85,
      fadeDepth: 0.62       // share of a cell faded at the top and bottom of each reel
    },
    animation: {
      startDelay: 250,      // ms after fonts load before the first spin
      baseDuration: 900,    // ms for the first reel
      perReelDelay: 380,    // ms added for each next reel
      extraLoops: 2,        // full turns before landing (first reel; each next one adds 1)
      overshoot: 1.1        // bounce on landing, 0 = none
    }
  };

  // ============================================================
  // ENGINE
  // ============================================================

  const REELS = DATA.reels;
  const { fonts: F, layout: L, animation: A } = STYLE;

  const canvas = document.getElementById('reels');
  const ctx = canvas.getContext('2d');
  const btn = document.getElementById('spin');
  const live = document.getElementById('reel-result');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  const css = getComputedStyle(document.documentElement);
  const resolve = c => (c.startsWith('--') ? css.getPropertyValue(c).trim() : c);
  const C = Object.fromEntries(Object.entries(STYLE.colors).map(([k, v]) => [k, resolve(v)]));
  const rgba = (hex, a) => {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`;
  };
  const valueFont = size => `${F.valueWeight} ${size}px ${F.valueFamily}`;
  const labelFont = size => `${F.labelWeight} ${size}px ${F.labelFamily}`;

  const state = REELS.map(r => ({ pos: Math.floor(Math.random() * r.length), from: 0, to: 0, t0: 0, dur: 0, spinning: false }));
  let geo = null;
  let lastW = 0;

  function layout() {
    const W = canvas.clientWidth;
    if (!W) return;
    lastW = W;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pad = Math.round(Math.max(10, W * 0.03));
    const gap = Math.round(Math.max(8, W * 0.02));
    const count = REELS.length;
    const rw = (W - pad * 2 - gap * (count - 1)) / count;
    const H = Math.round(Math.min(L.maxCellHeight, Math.max(L.minCellHeight, rw * 0.95)));
    const Ht = H * 2 + pad * 2;
    canvas.style.height = Ht + 'px';
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(Ht * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    geo = { W, Ht, pad, gap, rw, H };
    draw();
  }

  function rr(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function wrap(text, maxW) {
    const out = [];
    let cur = '';
    for (const w of text.split(' ')) {
      const t = cur ? cur + ' ' + w : w;
      if (cur && ctx.measureText(t).width > maxW) { out.push(cur); cur = w; } else cur = t;
    }
    if (cur) out.push(cur);
    return out;
  }

  function cell(item, x, cy) {
    const { rw, H } = geo;
    const inner = rw - 18;
    let vs = Math.min(rw * 0.27, H * 0.32);
    ctx.font = valueFont(vs);
    while (ctx.measureText(item.v).width > inner && vs > 12) {
      vs -= 1;
      ctx.font = valueFont(vs);
    }
    const ls = Math.max(F.labelMinSize, Math.min(F.labelMaxSize, rw * 0.095));
    const lh = ls * 1.25;
    ctx.font = labelFont(ls);
    const lines = wrap(item.l, inner).slice(0, 2);
    const block = vs + ls * 0.6 + lines.length * lh;
    let y = cy - block / 2;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = C.value;
    ctx.font = valueFont(vs);
    ctx.fillText(item.v, x + rw / 2, y);
    y += vs + ls * 0.6;
    ctx.fillStyle = C.label;
    ctx.font = labelFont(ls);
    for (const line of lines) { ctx.fillText(line, x + rw / 2, y); y += lh; }
  }

  function draw() {
    if (!geo) return;
    const { W, Ht, pad, gap, rw, H } = geo;
    ctx.clearRect(0, 0, W, Ht);
    ctx.fillStyle = C.panel;
    rr(0, 0, W, Ht, L.panelRadius);
    ctx.fill();

    REELS.forEach((items, i) => {
      const x = pad + i * (rw + gap);
      const y = pad;
      const h = H * 2;
      const cy = y + h / 2;
      const n = items.length;
      const s = state[i];
      ctx.save();
      rr(x, y, rw, h, L.windowRadius);
      ctx.clip();
      ctx.fillStyle = C.window;
      ctx.fillRect(x, y, rw, h);
      const base = Math.floor(s.pos);
      for (let j = base - 2; j <= base + 2; j++) {
        const yy = cy + (s.pos - j) * H;
        if (yy < y - H || yy > y + h + H) continue;
        cell(items[((j % n) + n) % n], x, yy);
      }
      const f = H * L.fadeDepth;
      let g = ctx.createLinearGradient(0, y, 0, y + f);
      g.addColorStop(0, rgba(C.window, 1)); g.addColorStop(1, rgba(C.window, 0));
      ctx.fillStyle = g; ctx.fillRect(x, y, rw, f);
      g = ctx.createLinearGradient(0, y + h - f, 0, y + h);
      g.addColorStop(0, rgba(C.window, 0)); g.addColorStop(1, rgba(C.window, 1));
      ctx.fillStyle = g; ctx.fillRect(x, y + h - f, rw, f);
      ctx.restore();
    });

    ctx.strokeStyle = rgba(C.payline, L.paylineAlpha);
    ctx.lineWidth = L.paylineWidth;
    rr(pad - 4, pad + H / 2, W - pad * 2 + 8, H, L.paylineRadius);
    ctx.stroke();
  }

  const ease = p => {
    const c1 = A.overshoot, c3 = c1 + 1;
    return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2);
  };
  const idx = i => { const n = REELS[i].length; return ((Math.round(state[i].pos) % n) + n) % n; };

  function announce() {
    live.textContent = REELS.map((items, i) => { const it = items[idx(i)]; return `${it.v} ${it.l}`; }).join(', ') + '.';
  }

  function tick(now) {
    let running = false;
    state.forEach((s, i) => {
      if (!s.spinning) return;
      const p = s.dur ? Math.min(1, (now - s.t0) / s.dur) : 1;
      s.pos = s.from + (s.to - s.from) * ease(p);
      if (p >= 1) {
        const n = REELS[i].length;
        s.pos = ((s.to % n) + n) % n;
        s.spinning = false;
      } else running = true;
    });
    draw();
    if (running) requestAnimationFrame(tick);
    else { btn.disabled = false; announce(); }
  }

  function spin(targets) {
    if (state.some(s => s.spinning)) return;
    if (!targets) {
      do { targets = REELS.map(r => Math.floor(Math.random() * r.length)); }
      while (targets.every((t, i) => t === idx(i)));
    }
    const now = performance.now();
    state.forEach((s, i) => {
      const n = REELS[i].length;
      const d = ((targets[i] - idx(i)) % n + n) % n;
      s.from = Math.round(s.pos);
      s.to = s.from + (A.extraLoops + i) * n + d;
      s.t0 = now;
      s.dur = reduce.matches ? 0 : A.baseDuration + i * A.perReelDelay;
      s.spinning = true;
    });
    btn.disabled = true;
    requestAnimationFrame(tick);
  }

  btn.addEventListener('click', () => spin());
  canvas.addEventListener('click', () => spin());
  new ResizeObserver(() => { if (canvas.clientWidth !== lastW) layout(); }).observe(canvas);

  layout();
  const fontsReady = document.fonts
    ? Promise.all([document.fonts.load(valueFont(32)), document.fonts.load(labelFont(16))]).catch(() => {})
    : Promise.resolve();
  fontsReady.then(() => {
    layout();
    if (reduce.matches) {
      state.forEach((s, i) => { s.pos = DATA.firstLanding[i] || 0; });
      draw();
      announce();
    } else {
      setTimeout(() => spin(DATA.firstLanding), A.startDelay);
    }
  });
})();
