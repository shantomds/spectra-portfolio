/* Spectra Studio — deep-space background (WebGL)
   Three parallax star layers + violet nebula + milky-way band + cursor parallax.
   Replaces the static CSS star tiles when WebGL is available (they stay as fallback).
   Direction informed by 21st.dev starfield patterns + ui-ux-pro-max OLED/aurora guidance. */
(() => {
  const canvas = document.getElementById("cosmosFx");
  if (!canvas) return;

  const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
  if (!gl) return;

  const VERT = `
    attribute vec2 position;
    varying vec2 vUv;
    void main() { vUv = position * 0.5 + 0.5; gl_Position = vec4(position, 0.0, 1.0); }
  `;

  const FRAG = `
    precision highp float;
    varying vec2 vUv;
    uniform vec2  u_res;
    uniform float u_time;
    uniform vec2  u_mouse;
    uniform float u_light;

    float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
    float snoise(vec2 v){
      const vec4 C = vec4(0.211324865405187, 0.366025403784439,
               -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy));
      vec2 x0 = v - i + dot(i, C.xx);
      vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1;
      i = mod(i, 289.0);
      vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m; m = m*m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    /* one star layer: grid cells, jittered star points, twinkle */
    vec3 starLayer(vec2 uv, float scale, vec2 drift, vec2 parallax, float density, float glow) {
      vec3 col = vec3(0.0);
      vec2 p = uv * scale + drift + parallax * scale * 0.06;
      vec2 id = floor(p);
      vec2 f = fract(p) - 0.5;
      float h = hash(id);
      if (h > density) {
        vec2 off = (vec2(hash(id + 7.3), hash(id + 3.1)) - 0.5) * 0.7;
        float d = length(f - off);
        float tw = 0.55 + 0.45 * sin(u_time * (0.6 + h * 2.2) + h * 40.0);
        float core = smoothstep(0.10 + glow * 0.05, 0.0, d);
        float halo = smoothstep(0.28, 0.0, d) * 0.18;
        float violet = step(0.78, hash(id + 1.7));
        vec3 tint = mix(vec3(0.92, 0.93, 1.0), vec3(0.72, 0.55, 1.0), violet);
        col = tint * (core + halo) * tw * (0.45 + h * 0.55);
      }
      return col;
    }

    void main() {
      vec2 uv = vUv;
      float ratio = u_res.x / u_res.y;
      vec2 p = uv - 0.5;
      p.x *= ratio;

      float t = u_time * 0.02;

      /* base */
      vec3 col = mix(vec3(0.016, 0.014, 0.027), vec3(0.945, 0.945, 0.972), u_light);

      /* violet nebula — two drifting noise octaves, very subtle */
      float n1 = snoise(p * 1.6 + vec2(t * 0.6, -t * 0.4));
      float n2 = snoise(p * 2.8 + vec2(-t * 0.5, t * 0.7) + n1 * 0.3);
      vec3 nebA = mix(vec3(0.11, 0.04, 0.20), vec3(0.86, 0.83, 0.96), u_light);
      vec3 nebB = mix(vec3(0.29, 0.14, 0.50), vec3(0.78, 0.70, 0.98), u_light);
      col = mix(col, nebA, smoothstep(0.15, 0.75, n1) * mix(0.16, 0.22, u_light));
      col = mix(col, nebB, smoothstep(0.35, 0.9, n2 * n1) * mix(0.10, 0.16, u_light));

      /* milky-way diagonal band — extra depth */
      float band = exp(-abs(uv.y * 1.4 - uv.x * 0.55 - 0.18) * 3.2);
      col += mix(nebB, vec3(1.0), 0.35) * band * mix(0.035, 0.05, u_light);

      /* stars: far / mid / near with parallax + twinkle */
      float mx = u_mouse.x, my = u_mouse.y;
      vec3 s1 = starLayer(p, 26.0, vec2(t * 1.1, t * 0.5), vec2(mx, my) * 0.16, 0.965, 0.0);
      vec3 s2 = starLayer(p, 15.0, vec2(t * 0.8, -t * 0.3), vec2(mx, my) * 0.34, 0.955, 0.5);
      vec3 s3 = starLayer(p, 8.5, vec2(t * 0.55, t * 0.35), vec2(mx, my) * 0.6, 0.945, 1.0);
      float starMix = mix(1.0, 0.55, u_light);
      col += (s1 * 0.55 + s2 * 0.8 + s3 * 1.0) * starMix * (0.75 + band * 0.6);

      /* vignette + grain */
      float dist = length(p) * 1.15;
      col *= mix(1.0 - smoothstep(0.55, 1.25, dist) * 0.55, 1.0 - smoothstep(0.55, 1.25, dist) * 0.12, u_light);
      float grain = fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453 + u_time);
      col += (grain - 0.5) * 0.02;

      gl_FragColor = vec4(col, 1.0);
    }
  `;

  const sh = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  };
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const pos = gl.getAttribLocation(prog, "position");
  gl.enableVertexAttribArray(pos);
  gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

  const locs = {
    res: gl.getUniformLocation(prog, "u_res"),
    time: gl.getUniformLocation(prog, "u_time"),
    mouse: gl.getUniformLocation(prog, "u_mouse"),
    light: gl.getUniformLocation(prog, "u_light"),
  };

  const host = canvas.parentElement;
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.max(1, Math.round(host.clientWidth * dpr));
    canvas.height = Math.max(1, Math.round(host.clientHeight * dpr));
    gl.viewport(0, 0, canvas.width, canvas.height);
  };
  new ResizeObserver(resize).observe(host);
  resize();

  // WebGL works → hide the static CSS star tiles + nebulas (they remain as fallback otherwise)
  document.body.classList.add("cosmos-gl");

  const motionOK = () =>
    !document.body.classList.contains("calm-mode") &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let mx = 0, my = 0, tmx = 0, tmy = 0;
  if (window.matchMedia("(pointer: fine)").matches) {
    window.addEventListener("mousemove", (e) => {
      tmx = e.clientX / window.innerWidth - 0.5;
      tmy = 0.5 - e.clientY / window.innerHeight;
    }, { passive: true });
  }

  let frozen = 0;
  let visible = !document.hidden;
  document.addEventListener("visibilitychange", () => { visible = !document.hidden; });

  const frame = (tms) => {
    if (visible) {
      const t = tms * 0.001;
      if (motionOK()) frozen = t;
      mx += (tmx - mx) * 0.04;
      my += (tmy - my) * 0.04;
      const light = document.documentElement.classList.contains("theme-light") ? 1 : 0;
      gl.uniform2f(locs.res, canvas.width, canvas.height);
      gl.uniform1f(locs.time, frozen);
      gl.uniform2f(locs.mouse, mx, my);
      gl.uniform1f(locs.light, light);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
})();
