/* Thinking Orbs — vanilla JS port for Spectra Studio
   Ported from the npm package `thinking-orbs` v0.1.1 (MIT, Jakub Antalik)
   (installed via npm install thinking-orbs; core draw math copied verbatim,
    React wrapper replaced with plain JS + Spectra violet tint + calm-mode).
   Six states: working / searching / solving / listening / composing / shaping */
(() => {
  /* ---------- core math (verbatim from thinking-orbs dist) ---------- */
  const rnd2 = (e, n) => {
    const s = Math.sin(e * 12.9898 + n * 78.233) * 43758.5453;
    return s - Math.floor(s);
  };
  const fibSphere = (e, n) => {
    const s = Math.PI * (3 - Math.sqrt(5)), r = 1 - (2 * (e + 0.5)) / n,
      t = Math.sqrt(1 - r * r), o = e * s;
    return [t * Math.cos(o), r, t * Math.sin(o)];
  };
  const angDiff = (e, n) => Math.atan2(Math.sin(e - n), Math.cos(e - n));
  const rotator = (e, n, s, r, t) => {
    const o = Math.sin(n), c = Math.cos(n), a = Math.sin(e), i = Math.cos(e);
    return (m, g, M) => {
      const u = m * i + M * a, h = -m * a + M * i, b = g * c - h * o, x = g * o + h * c;
      return [s + u * t, r - b * t, x];
    };
  };

  /* dot renderer — Spectra-tinted: dark bg → violet..white ramp, light bg → violet..ink */
  const drawDots = (ctx, dots, lightBg, rMin, tint) => {
    dots.sort((a, b) => a.z - b.z);
    for (const d of dots) {
      const a = d.a ?? 1;
      if (a < 0.02) continue;
      const w = Math.min(1, Math.max(0, d.white));
      if (tint) {
        // brightness: ink-heavy dots on light bg, bright dots on dark bg (matches upstream)
        const k = lightBg ? w : 1 - w;
        const r = Math.round(19 + (245 - 19) * k);
        const g = Math.round(14 + (245 - 14) * k);
        const b = Math.round(40 + (255 - 40) * k);
        ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
      } else {
        const v = Math.round((lightBg ? w : 1 - w) * 255);
        ctx.fillStyle = `rgba(${v},${v},${v},${a})`;
      }
      ctx.beginPath();
      ctx.arc(d.x, d.y, Math.max(rMin ?? 0.3, d.r), 0, Math.PI * 2);
      ctx.fill();
    }
  };
  const sizeMul = (e, n) => (e / 300) ** n;

  const solveSteps = (e, n, s, r) => {
    const t = 2 * n * s + r, o = e % t, c = new Array(n).fill(0);
    let a = -1;
    if (o < 2 * n * s) {
      const i = Math.floor(o / s), m = (o - i * s) / s, M = 1 - (1 - Math.min(1, m / 0.7)) ** 3;
      if (i < n) {
        for (let u = 0; u < i; u++) c[u] = 1;
        c[i] = M; a = i;
      } else {
        const u = 2 * n - 1 - i;
        for (let h = 0; h < u; h++) c[h] = 1;
        c[u] = 1 - M; a = u;
      }
    }
    return { amount: c, active: a };
  };
  const applyTwist = (e, n, s) => {
    let [r, t, o] = e, c = false;
    for (let a = 0; a < n.length; a++) {
      if (s.amount[a] <= 0) continue;
      const i = n[a], m = i.axis === 0 ? r : i.axis === 1 ? t : o;
      if (m < i.lo || m >= i.hi) continue;
      if (a === s.active) c = true;
      const g = i.ang * s.amount[a], M = Math.cos(g), u = Math.sin(g);
      if (i.axis === 0) { const h = t * M - o * u; o = t * u + o * M; t = h; }
      else if (i.axis === 1) { const h = r * M + o * u; o = -r * u + o * M; r = h; }
      else { const h = r * M - t * u; t = r * u + t * M; r = h; }
    }
    return [r, t, o, c];
  };
  const buildMoves = (e) => {
    const n = [];
    for (let s = 0; s < e; s++) {
      const r = Math.min(2, Math.floor(rnd2(s, 2.3) * 3)),
        t = -1 + 0.5 * Math.min(3, Math.floor(rnd2(s, 5.9) * 4)),
        o = rnd2(s, 7.7) < 0.5 ? 1 : -1;
      n.push({ axis: r, lo: t, hi: t + 0.5, ang: (o * Math.PI) / 2 });
    }
    return n;
  };

  const MODE_GLOBE = (e, n, s, r, t) => {
    const c = n / 2, a = n / 2, i = (n / 2) * 0.82,
      m = 0.4 + 0.06 * Math.sin(s * 0.35),
      g = rotator(s * 0.5, m, c, a, i),
      M = s * (0.5 + 1.2 * (t.scanMul ?? 1)),
      u = sizeMul(n, t.rsPow ?? 0.6), h = t.dimBase ?? 1, b = [],
      x = t.latRings ?? 17, I = t.lonDensity ?? 44;
    for (let P = 0; P <= x; P++) {
      const y = -Math.PI / 2 + (P / x) * Math.PI, D = Math.cos(y), w = Math.sin(y),
        k = Math.max(1, Math.round(Math.abs(D) * I));
      for (let v = 0; v < k; v++) {
        const R = (v / k) * 2 * Math.PI, [p, d, l] = g(D * Math.cos(R), w, D * Math.sin(R)),
          f = (l + 1) / 2, S = angDiff(R + s * 0.5, M),
          L = Math.exp(-(S * S) / 0.18) * Math.max(0, l);
        b.push({
          x: p, y: d, z: l,
          r: ((t.rBase ?? 0.6) + (t.rDepth ?? 1.7) * f + (t.rBoost ?? 1) * L) * u,
          white: (t.inkFar ?? 0.62) - (t.inkSpan ?? 0.54) * f,
          a: h + (1 - h) * Math.min(1, L),
        });
      }
    }
    drawDots(e, b, r, t.rMin, true);
  };
  const MODE_RUBIK = (e, n, s, r, t) => {
    const o = n / 2, c = n / 2, a = (n / 2) * 0.82,
      i = rotator(s * 0.55, 0.35 + 0.1 * Math.sin(s * 0.9), o, c, a),
      m = sizeMul(n, t.rsPow ?? 0.6),
      g = t.moveCount ?? 14, M = buildMoves(g),
      u = solveSteps(s, g, 0.42, 1.2), h = [],
      b = t.latRings ?? 15, x = t.lonDensity ?? 40;
    for (let I = 0; I <= b; I++) {
      const P = -Math.PI / 2 + (I / b) * Math.PI, y = Math.cos(P), D = Math.sin(P),
        w = Math.max(1, Math.round(Math.abs(y) * x));
      for (let k = 0; k < w; k++) {
        const v = (k / w) * 2 * Math.PI,
          [R, p, d, l] = applyTwist([y * Math.cos(v), D, y * Math.sin(v)], M, u),
          [f, S, L] = i(R, p, d), A = (L + 1) / 2;
        h.push({
          x: f, y: S, z: L,
          r: ((t.rBase ?? 0.6) + (t.rDepth ?? 1.7) * A + (l ? t.rActive ?? 0.3 : 0)) * m,
          white: (t.inkFar ?? 0.62) - (t.inkSpan ?? 0.54) * A - (l ? 0.14 : 0),
        });
      }
    }
    drawDots(e, h, r, t.rMin, true);
  };
  const MODE_WAVE = (e, n, s, r, t) => {
    const o = n / 2, c = n / 2, a = (n / 2) * 0.874,
      i = rotator(s * 0.18, 0.38, o, c, 1),
      m = sizeMul(n, t.rsPow ?? 0.6), g = [],
      M = t.rings ?? 15, u = t.lonDensity ?? 40;
    for (let h = 0; h <= M; h++) {
      const b = -Math.PI / 2 + (h / M) * Math.PI, x = Math.cos(b), I = Math.sin(b),
        P = 0.62 * Math.sin(s * 2.1 - h * 0.52) + 0.38 * Math.sin(s * 1.27 + h * 0.83),
        y = a * (0.88 + 0.105 * P),
        D = Math.max(1, Math.round(Math.abs(x) * u));
      for (let w = 0; w < D; w++) {
        const k = (w / D) * 2 * Math.PI,
          [v, R, p] = i(x * Math.cos(k) * y, I * y, x * Math.sin(k) * y),
          d = (p / a + 1) / 2, l = Math.max(0, P);
        g.push({
          x: v, y: R, z: p,
          r: ((t.rBase ?? 0.6) + (t.rDepth ?? 1.7) * d) * (1 + 0.4 * l) * m,
          white: 0.66 - 0.56 * d - 0.1 * l,
        });
      }
    }
    drawDots(e, g, r, t.rMin, true);
  };
  const smooth = (e) => e * e * (3 - 2 * e);
  const pathOf = (e) => {
    const n = e.length, s = [];
    let r = 0;
    for (let t = 0; t < n; t++) {
      const o = e[t], c = e[(t + 1) % n], a = Math.hypot(c[0] - o[0], c[1] - o[1]);
      s.push(a); r += a;
    }
    return (t) => {
      let o = t * r, c = 0;
      while (o > s[c] && c < n - 1) o -= s[c], c++;
      const a = e[c], i = e[(c + 1) % n], m = s[c] ? Math.min(1, o / s[c]) : 0;
      return [a[0] + (i[0] - a[0]) * m, a[1] + (i[1] - a[1]) * m];
    };
  };
  const circlePath = (e) => {
    const n = -Math.PI / 2 + e * 2 * Math.PI;
    return [Math.cos(n) * 0.24, Math.sin(n) * 0.24];
  };
  const triPath = pathOf([[0, -0.26], [0.24, 0.16], [-0.24, 0.16]]);
  const squarePath = pathOf([[0, -0.2], [0.2, -0.2], [0.2, 0.2], [-0.2, 0.2], [-0.2, -0.2]]);
  const SHAPES = [circlePath, triPath, squarePath];
  const MORPH_HOLD = 1.4, MORPH_T = 0.9, MORPH_LEN = MORPH_HOLD + MORPH_T;
  const MODE_MORPH = (e, n, s, r, t) => {
    const o = SHAPES.length, c = s % (MORPH_LEN * o), a = Math.floor(c / MORPH_LEN),
      i = c - a * MORPH_LEN,
      m = i > MORPH_HOLD ? smooth((i - MORPH_HOLD) / MORPH_T) : 0,
      g = t.spread ?? 1, M = SHAPES[a], u = SHAPES[(a + 1) % o],
      h = 160, b = [];
    for (let p = 0; p < h; p++) {
      const d = p / h, l = M(d), f = u(d);
      b.push([(l[0] + (f[0] - l[0]) * m) * g, (l[1] + (f[1] - l[1]) * m) * g]);
    }
    const x = [];
    let I = 0;
    for (let p = 0; p < h; p++) {
      const d = b[p], l = b[(p + 1) % h], f = Math.hypot(l[0] - d[0], l[1] - d[1]);
      x.push(f); I += f;
    }
    const P = Math.max(6, Math.round(34 * (t.iconD ?? 1))),
      y = (t.rDot ?? 0.021) * 1.35 * g,
      D = 1 + 0.02 * Math.sin(i * 3.1), w = [], k = n / 2;
    let v = 0, R = 0;
    for (let p = 0; p < P; p++) {
      const d = (p / P) * I;
      while (R + x[v] < d && v < h - 1) R += x[v], v++;
      const l = b[v], f = b[(v + 1) % h],
        S = x[v] ? Math.min(1, (d - R) / x[v]) : 0,
        L = (l[0] + (f[0] - l[0]) * S) * D, A = (l[1] + (f[1] - l[1]) * S) * D;
      w.push({ x: k + L * n, y: k + A * n, z: 0, r: Math.max(0.35, y * n), white: 0.1 });
    }
    drawDots(e, w, r, t.rMin, true);
  };
  const MODE_ORBITS = (e, n, s, r, t) => {
    const o = n / 2, c = n / 2, a = (n / 2) * 0.82,
      i = rotator(s * 0.12, 0.3, o, c, 1),
      m = sizeMul(n, t.rsPow ?? 0.6), g = [],
      M = t.orbitN ?? 12, u = t.ghostN ?? 40, h = t.particles ?? 3;
    for (let b = 0; b < M; b++) {
      const x = rnd2(b, 1.7), I = rnd2(b, 5.2), P = rnd2(b, 8.9),
        y = a * (0.45 + 0.52 * x), D = x * 2 * Math.PI,
        w = Math.acos(2 * I - 1),
        k = Math.sin(w) * Math.cos(D), v = Math.cos(w), R = Math.sin(w) * Math.sin(D);
      let p = -v, d = k;
      const l = 0, f = Math.max(1e-6, Math.sqrt(p * p + d * d));
      p /= f; d /= f;
      const S = v * l - R * d, L = R * p - k * l, A = k * d - v * p,
        B = (0.25 + 0.55 * P) * (P > 0.5 ? 1 : -1);
      for (let C = 0; C < u; C++) {
        const E = (C / u) * 2 * Math.PI,
          [T, z, N] = i((p * Math.cos(E) + S * Math.sin(E)) * y, (d * Math.cos(E) + L * Math.sin(E)) * y, (l * Math.cos(E) + A * Math.sin(E)) * y),
          O = (N / y + 1) / 2;
        g.push({ x: T, y: z, z: N, r: (t.ghostR ?? 0.9) * m, white: 0.72, a: (t.ghostA ?? 0.5) * (0.4 + 0.6 * O) });
      }
      for (let C = 0; C < h; C++) {
        const E = s * B + (C / h) * 2 * Math.PI + I * 6,
          [T, z, N] = i((p * Math.cos(E) + S * Math.sin(E)) * y, (d * Math.cos(E) + L * Math.sin(E)) * y, (l * Math.cos(E) + A * Math.sin(E)) * y),
          O = (N / y + 1) / 2;
        g.push({ x: T, y: z, z: N, r: ((t.partR ?? 1.2) + (t.partRDepth ?? 1.6) * O) * m, white: 0.3 - 0.22 * O });
      }
    }
    drawDots(e, g, r, t.rMin, true);
  };
  const MODE_RIBBON = (e, n, s, r, t) => {
    const o = n / 2, c = n / 2, a = (n / 2) * 0.78, i = t.spin ?? 1,
      m = rotator(s * 0.1 * i, 0.3, o, c, 1),
      g = sizeMul(n, t.rsPow ?? 0.6), M = [], u = t.ghostN ?? 150;
    for (let f = 0; f < u; f++) {
      const S = fibSphere(f, u),
        [L, A, B] = m(S[0] * a, S[1] * a, S[2] * a), C = (B / a + 1) / 2;
      M.push({ x: L, y: A, z: B, r: 0.8 * g, white: 0.78, a: 0.1 + 0.22 * C });
    }
    const h = s * 0.24 * i, b = 0.55 + 0.3 * Math.sin(s * 0.18) * i,
      x = Math.cos(h), I = 0, P = Math.sin(h),
      y = -P * Math.sin(b), D = Math.cos(b), w = x * Math.sin(b),
      k = I * w - P * D, v = P * y - x * w, R = x * D - I * y,
      p = t.lanes ?? 5, d = t.segs ?? 88, l = Math.max(1, Math.round(p * (t.bandMul ?? 1)));
    for (let f = 0; f < l; f++) {
      const S = (f - (l - 1) / 2) * 0.075, L = Math.abs(f - (l - 1) / 2) / Math.max(1, (l - 1) / 2);
      for (let A = 0; A < d; A++) {
        const B = (A / d) * 2 * Math.PI,
          C = (0.16 * Math.sin(B * 3 - s * 1.7 + f * 0.22) + 0.07 * Math.sin(B * 5 + s * 1.1)) * (t.wobMul ?? 1),
          E = S + C,
          T = x * Math.cos(B) + y * Math.sin(B) + k * E,
          z = I * Math.cos(B) + D * Math.sin(B) + v * E,
          N = P * Math.cos(B) + w * Math.sin(B) + R * E,
          O = Math.sqrt(T * T + z * z + N * N),
          [X, Z, W] = m((T / O) * a, (z / O) * a, (N / O) * a), j = (W / a + 1) / 2;
        M.push({
          x: X, y: Z, z: W,
          r: ((t.rBase ?? 1.1) + (t.rDepth ?? 1.7) * j) * (1 - 0.25 * L) * g,
          white: 0.52 - 0.44 * j + 0.18 * L, a: 0.4 + 0.6 * j,
        });
      }
    }
    drawDots(e, M, r, t.rMin, true);
  };

  const MODE_DRAWS = { orbits: MODE_ORBITS, globe: MODE_GLOBE, rubik: MODE_RUBIK, wave: MODE_WAVE, ribbon: MODE_RIBBON, morph: MODE_MORPH };
  const STATE_TO_MODE = { working: "orbits", searching: "globe", solving: "rubik", listening: "wave", composing: "ribbon", shaping: "morph" };

  /* ---------- presets (verbatim tuning from thinking-orbs) ---------- */
  const countKeys = [["latRings", "lonDensity"], ["rings", "lonDensity"], ["lanes", "segs"]];
  const countSqrt = ["orbitN", "ghostN"], countIcon = ["iconD"],
    sizeKeys = ["rBase", "rDepth", "rActive", "rDot", "ghostR", "partR", "partRDepth"];
  const scaleCounts = (e, n) => {
    const s = { ...e }, r = new Set(), t = Math.sqrt(n);
    for (const [o, c] of countKeys) {
      const a = s[o], i = s[c];
      if (a != null && i != null && !r.has(o) && !r.has(c)) {
        s[o] = Math.max(2, Math.round(a * t)); s[c] = Math.max(2, Math.round(i * t)); r.add(o); r.add(c);
      }
    }
    for (const o of countSqrt) { const c = s[o]; if (c != null && !r.has(o)) s[o] = Math.max(1, Math.round(c * n)); }
    for (const o of countIcon) { const c = s[o]; if (c != null && !r.has(o)) s[o] = Math.max(1, Math.round(c * n)); }
    return s;
  };
  const scaleSizes = (e, n) => {
    const s = { ...e };
    for (const r of sizeKeys) { const t = s[r]; if (t != null) s[r] = t * n; }
    return s;
  };
  const BASE = {
    globe: { latRings: 17, lonDensity: 44, rBase: 0.6, rDepth: 1.7, rBoost: 1, inkFar: 0.62, inkSpan: 0.54, rsPow: 0.6, rMin: 0.3 },
    orbits: { orbitN: 12, ghostN: 40, ghostR: 0.9, ghostA: 0.5, particles: 3, partR: 1.2, partRDepth: 1.6, rsPow: 0.6, rMin: 0.3 },
    rubik: { latRings: 15, lonDensity: 40, moveCount: 14, rBase: 0.6, rDepth: 1.7, rActive: 0.3, inkFar: 0.62, inkSpan: 0.54, rsPow: 0.6, rMin: 0.3 },
    wave: { rings: 15, lonDensity: 40, rBase: 0.6, rDepth: 1.7, rsPow: 0.6, rMin: 0.3 },
    ribbon: { lanes: 5, segs: 88, ghostN: 150, rBase: 1.1, rDepth: 1.7, rsPow: 0.6, rMin: 0.3 },
    morph: { rDot: 0.021, iconD: 1, rMin: 0.25 },
  };
  const TUNING = {
    orbits: { 64: { speed: 1.885, count: 1, size: 1 }, 20: { speed: 3.9, count: 0.238, size: 2.4 } },
    globe: { 64: { speed: 2.015, count: 0.42, size: 1.15, extra: { scanMul: 4.08, dimBase: 0.45 } }, 20: { speed: 2.665, count: 0.105, size: 1.75, extra: { scanMul: 4.335, dimBase: 0.45 } } },
    rubik: { 64: { speed: 1.82, count: 0.35, size: 1.05 }, 20: { speed: 1.95, count: 0.088, size: 1.9 } },
    wave: { 64: { speed: 4.388, count: 0.341, size: 1 }, 20: { speed: 3.998, count: 0.105, size: 1.6 } },
    ribbon: { 64: { speed: 2.34, count: 0.25, size: 0.85, extra: { spin: 0, bandMul: 3.9, wobMul: 1 } }, 20: { speed: 3.12, count: 0.051, size: 1.073, extra: { spin: 0, bandMul: 4.94, wobMul: 1 } } },
    morph: { 64: { speed: 2.405, count: 0.54, size: 0.395, extra: { spread: 1.45 } }, 20: { speed: 2.08, count: 0.53, size: 1.011, extra: { spread: 1.45 } } },
  };
  const presetCache = new Map();
  const resolvePreset = (state, px) => {
    const key = `${state}-${px}`;
    if (presetCache.has(key)) return presetCache.get(key);
    const mode = STATE_TO_MODE[state], tune = TUNING[mode][px >= 40 ? 64 : 20];
    let opts = { ...BASE[mode] };
    if (tune.count !== 1) opts = scaleCounts(opts, tune.count);
    if (tune.size !== 1) opts = scaleSizes(opts, tune.size);
    if (tune.extra) opts = { ...opts, ...tune.extra };
    const p = { mode, speed: tune.speed, opts };
    presetCache.set(key, p);
    return p;
  };

  /* ---------- vanilla ThinkingOrb ---------- */
  const LIGHT = () => document.documentElement.classList.contains("theme-light");
  const CALM = () =>
    document.body.classList.contains("calm-mode") ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  class ThinkingOrb {
    constructor(canvas, { state = "working", speed = 1 } = {}) {
      this.cv = canvas;
      this.state = state;
      this.speedMul = speed;
      this.px = parseInt(canvas.getAttribute("data-size") || "64", 10);
      this.raf = 0;
      this.running = false;
      this.inView = true;

      const dpr = Math.min(2, window.devicePixelRatio || 1);
      this.dpr = dpr;
      canvas.width = Math.round(this.px * dpr);
      canvas.height = Math.round(this.px * dpr);
      canvas.style.width = `${this.px}px`;
      canvas.style.height = `${this.px}px`;
      this.ctx = canvas.getContext("2d");

      new IntersectionObserver((entries) => {
        this.inView = entries[0].isIntersecting;
        this.sync();
      }).observe(canvas);
      document.addEventListener("visibilitychange", () => this.sync());
      this.sync();
    }
    setState(s) { this.state = s; this.render(performance.now() / 1000); this.sync(); }
    sync() {
      const want = this.inView && !document.hidden && !CALM();
      if (want && !this.running) {
        this.running = true;
        const loop = () => {
          if (!this.running) return;
          this.render(performance.now() / 1000);
          this.raf = requestAnimationFrame(loop);
        };
        this.raf = requestAnimationFrame(loop);
      } else if (!want && this.running) {
        this.running = false;
        cancelAnimationFrame(this.raf);
      }
    }
    render(tSec) {
      const { mode, speed, opts } = resolvePreset(this.state, this.px);
      const ctx = this.ctx;
      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      ctx.clearRect(0, 0, this.px, this.px);
      MODE_DRAWS[mode](ctx, this.px, tSec * speed * this.speedMul, LIGHT(), opts);
    }
  }

  window.SpectraOrb = ThinkingOrb;

  /* Auto-mount: <canvas class="thinking-orb" data-state="working" data-size="64"> */
  const mount = () => {
    document.querySelectorAll("canvas.thinking-orb:not([data-mounted])").forEach((cv) => {
      cv.setAttribute("data-mounted", "1");
      const orb = new ThinkingOrb(cv, { state: cv.dataset.state || "working" });
      cv._orb = orb;
    });
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
