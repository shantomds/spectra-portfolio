/* Spectra Studio portfolio interactions + galaxy dynamics */
(() => {
  const nav = document.getElementById("nav");
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");
  const year = document.getElementById("year");
  const modal = document.getElementById("modal");
  const modalImg = document.getElementById("modalImg");
  const modalTitle = document.getElementById("modalTitle");
  const modalDesc = document.getElementById("modalDesc");
  const modalCat = document.getElementById("modalCat");
  const modalClose = document.getElementById("modalClose");
  const contactForm = document.getElementById("contactForm");
  const particlesHost = document.getElementById("particles");
  const liveBars = document.getElementById("liveBars");
  const calmToggle = document.getElementById("calmToggle");

  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- Theme: dark (night) / light day (B&W bright) ---------- */
  const themeToggle = document.getElementById("themeToggle");
  const applyTheme = (mode) => {
    const light = mode === "light";
    document.documentElement.classList.toggle("theme-light", light);
    document.documentElement.classList.toggle("theme-dark", !light);
    if (themeToggle) {
      themeToggle.setAttribute("aria-label", light ? "Switch to dark mode" : "Switch to light mode");
      themeToggle.title = light ? "Day mode · click for Night" : "Night mode · click for Day";
    }
    try {
      localStorage.setItem("spectra-theme", light ? "light" : "dark");
    } catch (_) {}
  };

  let themePref = "dark";
  try {
    const t = localStorage.getItem("spectra-theme");
    if (t === "light" || t === "dark") themePref = t;
  } catch (_) {}
  applyTheme(themePref);

  themeToggle?.addEventListener("click", () => {
    const next = document.documentElement.classList.contains("theme-light") ? "dark" : "light";
    applyTheme(next);
  });

  /* ---------- Calm mode (tone down motion) ---------- */
  const applyCalm = (on) => {
    document.body.classList.toggle("calm-mode", on);
    if (calmToggle) {
      calmToggle.setAttribute("aria-pressed", on ? "true" : "false");
      const label = calmToggle.querySelector(".calm-label");
      if (label) label.textContent = on ? "Motion" : "Calm";
    }
    try {
      localStorage.setItem("spectra-calm", on ? "1" : "0");
    } catch (_) {}
  };

  // Restore preference, or soft-default calm on small screens
  let calmPreferred = null;
  try {
    const stored = localStorage.getItem("spectra-calm");
    if (stored === "1") calmPreferred = true;
    if (stored === "0") calmPreferred = false;
  } catch (_) {}

  const mobile = window.matchMedia("(max-width: 700px)").matches;
  const prefersReduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  applyCalm(calmPreferred !== null ? calmPreferred : prefersReduce || mobile);

  calmToggle?.addEventListener("click", () => {
    const next = !document.body.classList.contains("calm-mode");
    applyCalm(next);
  });

  // Sticky nav
  const onScroll = () => {
    if (!nav) return;
    nav.classList.toggle("scrolled", window.scrollY > 12);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Mobile menu
  menuToggle?.addEventListener("click", () => {
    navLinks?.classList.toggle("open");
  });
  navLinks?.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => navLinks.classList.remove("open"));
  });

  // Active section highlight
  const sections = [...document.querySelectorAll("section[id]")];
  const linkMap = new Map(
    [...document.querySelectorAll(".nav-links a")].map((a) => [
      a.getAttribute("href")?.replace("#", ""),
      a,
    ])
  );

  const spy = () => {
    const y = window.scrollY + 120;
    let current = sections[0]?.id;
    for (const s of sections) {
      if (s.offsetTop <= y) current = s.id;
    }
    if (window.scrollY < 200) current = "home";
    linkMap.forEach((el, id) => {
      const active =
        id === current ||
        (id === "about" && (current === "home" || current === "about"));
      el.classList.toggle("active", active);
    });
  };
  window.addEventListener("scroll", spy, { passive: true });
  spy();

  // Reveal on scroll
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("show");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("show"));
  }

  // Filters
  const filterBtns = document.querySelectorAll(".filter-btn");
  const cards = document.querySelectorAll(".work-card");
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const f = btn.dataset.filter;
      cards.forEach((card) => {
        const show = f === "all" || card.dataset.cat === f;
        card.classList.toggle("hidden", !show);
      });
    });
  });

  // Modal
  const openModal = (card) => {
    const img = card.querySelector("img");
    modalImg.src = img?.src || "";
    modalImg.alt = img?.alt || "";
    modalTitle.textContent = card.dataset.title || "";
    modalDesc.textContent = card.dataset.desc || "";
    modalCat.textContent = card.querySelector(".cat")?.textContent || "";
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    modal.classList.remove("open");
    document.body.style.overflow = "";
  };

  cards.forEach((card) => {
    card.addEventListener("click", () => openModal(card));
    card.setAttribute("tabindex", "0");
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openModal(card);
      }
    });
  });

  modalClose?.addEventListener("click", closeModal);
  modal?.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  // Contact form → WhatsApp
  contactForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(contactForm);
    const name = String(data.get("name") || "").trim();
    const contact = String(data.get("contact") || "").trim();
    const type = String(data.get("type") || "").trim();
    const message = String(data.get("message") || "").trim();
    const text = [
      `Hi Sakib, I'm ${name}.`,
      `Contact: ${contact}`,
      `Project type: ${type}`,
      "",
      message,
    ].join("\n");
    const url = `https://wa.me/8801406313103?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener");
  });

  /* ---------- Galaxy particles ---------- */
  const reduceMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    document.body.classList.contains("calm-mode");

  if (particlesHost && !reduceMotion) {
    const count = window.innerWidth < 700 ? 18 : 36;
    for (let i = 0; i < count; i++) {
      const p = document.createElement("span");
      const left = Math.random() * 100;
      const size = 1.5 + Math.random() * 3;
      const duration = 12 + Math.random() * 18;
      const delay = Math.random() * -20;
      p.style.left = `${left}%`;
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      p.style.animationDuration = `${duration}s`;
      p.style.animationDelay = `${delay}s`;
      p.style.opacity = String(0.3 + Math.random() * 0.6);
      particlesHost.appendChild(p);
    }
  }

  /* ---------- Live animated bar graph ---------- */
  if (liveBars && !document.body.classList.contains("calm-mode") && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const spans = [...liveBars.querySelectorAll("span")];
    const base = [45, 62, 50, 78, 68, 90, 72];

    const wave = () => {
      const t = performance.now() / 1000;
      spans.forEach((el, i) => {
        const wiggle = Math.sin(t * 1.4 + i * 0.85) * 12;
        const bounce = Math.sin(t * 2.1 + i * 1.3) * 6;
        let h = base[i] + wiggle + bounce;
        h = Math.max(28, Math.min(98, h));
        el.style.setProperty("--h", `${h.toFixed(1)}%`);
        el.style.height = `${h.toFixed(1)}%`;
      });
      requestAnimationFrame(wave);
    };
    requestAnimationFrame(wave);
  }

  /* ---------- Count-up metrics: 0 → target when dashboard enters view ---------- */
  const counters = document.querySelectorAll(".count-up");
  let metricsAnimated = false;

  const formatCount = (el, value) => {
    const suffix = el.dataset.suffix || "";
    el.textContent = `${Math.round(value)}${suffix}`;
  };

  const runCount = (el) => {
    const target = Number(el.dataset.target || 0);
    const suffix = el.dataset.suffix || "";
    el.textContent = `0${suffix}`;
    const start = performance.now();
    const dur = 1600;
    const tick = (now) => {
      const p = Math.min(1, (now - start) / dur);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - p, 3);
      formatCount(el, target * eased);
      if (p < 1) requestAnimationFrame(tick);
      else formatCount(el, target);
    };
    requestAnimationFrame(tick);
  };

  const startMetricsAnimation = () => {
    if (metricsAnimated) return;
    metricsAnimated = true;
    counters.forEach((c, i) => {
      // slight stagger for polish
      setTimeout(() => runCount(c), i * 120);
    });
  };

  // Ensure start at 0
  counters.forEach((c) => {
    const suffix = c.dataset.suffix || "";
    c.textContent = `0${suffix}`;
  });

  const metricsRoot = document.getElementById("metrics") || counters[0]?.closest(".metrics");
  if (counters.length && "IntersectionObserver" in window && metricsRoot) {
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            startMetricsAnimation();
            cio.disconnect();
          }
        });
      },
      { threshold: 0.25, rootMargin: "0px 0px -10% 0px" }
    );
    cio.observe(metricsRoot);

    // If already on screen at load (e.g. tall monitor / scroll restored)
    requestAnimationFrame(() => {
      const rect = metricsRoot.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.85 && rect.bottom > 0) {
        startMetricsAnimation();
        cio.disconnect();
      }
    });
  } else if (counters.length) {
    startMetricsAnimation();
  }

  /* ---------- Soft parallax on solar system ---------- */
  if (!reduceMotion) {
    const spaces = document.querySelectorAll(".space-visuals");
    window.addEventListener(
      "mousemove",
      (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 12;
        const y = (e.clientY / window.innerHeight - 0.5) * 12;
        spaces.forEach((o) => {
          o.style.translate = `${x}px ${y}px`;
        });
      },
      { passive: true }
    );
  }

  /* ---------- Meteors — one direction only (top-left → bottom-right) ---------- */
  const meteorField = document.getElementById("meteorField");
  if (meteorField && !document.body.classList.contains("calm-mode") && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const angle = 32; // all share same flight angle
    const configs = [
      {
        angle,
        x0: "8vw",
        y0: "-10vh",
        x1: "72vw",
        y1: "70vh",
        len: "150px",
        dur: "4s",
        delay: "0.5s",
        hero: true,
      },
      {
        angle,
        x0: "-5vw",
        y0: "15vh",
        x1: "55vw",
        y1: "75vh",
        len: "100px",
        dur: "3.5s",
        delay: "4.5s",
      },
      {
        angle,
        x0: "25vw",
        y0: "-8vh",
        x1: "95vw",
        y1: "55vh",
        len: "90px",
        dur: "3.2s",
        delay: "8.5s",
      },
    ];

    configs.forEach((c) => {
      const m = document.createElement("span");
      m.className = "meteor" + (c.hero ? " meteor-hero" : "");
      m.style.setProperty("--angle", `${c.angle}deg`);
      m.style.setProperty("--x0", c.x0);
      m.style.setProperty("--y0", c.y0);
      m.style.setProperty("--x1", c.x1);
      m.style.setProperty("--y1", c.y1);
      m.style.setProperty("--len", c.len);
      m.style.setProperty("--dur", c.dur);
      m.style.setProperty("--delay", c.delay);
      meteorField.appendChild(m);
    });
  }

  /* ---------- Dotted Earth with real continent map patterns ---------- */
  function isLand(lat, lon) {
    // lat: -90..90, lon: -180..180 — simplified real-world landmasses
    const regions = [
      // North America
      { lat: [15, 72], lon: [-168, -52], test: (la, lo) => {
        if (la < 25 && lo > -80) return lo < -77; // caribbean thin
        if (la > 50 && lo > -60) return lo < -55;
        if (la < 30 && lo < -115) return true; // mexico/baja
        return !(la < 50 && lo > -65 && la > 40); // cut hudson-ish water loosely
      }},
      // Greenland
      { lat: [60, 84], lon: [-73, -12], test: () => true },
      // South America
      { lat: [-56, 13], lon: [-82, -34], test: (la, lo) => {
        if (la > 5 && lo < -70) return false;
        if (la < -40 && lo < -75) return false;
        return lo < -35;
      }},
      // Europe
      { lat: [36, 72], lon: [-10, 40], test: (la, lo) => {
        if (la < 44 && lo < -5) return false; // atlantic
        if (la > 60 && lo > 30) return lo < 35;
        return true;
      }},
      // Africa
      { lat: [-35, 38], lon: [-18, 52], test: (la, lo) => {
        if (la > 20 && lo < -10) return false;
        if (la < -5 && lo > 45) return false;
        if (la > 30 && lo > 25 && lo < 35) return la < 32; // med edge
        return true;
      }},
      // Middle East / Arabia
      { lat: [12, 42], lon: [34, 60], test: (la, lo) => !(la > 28 && lo > 55) },
      // India / South Asia
      { lat: [6, 36], lon: [66, 98], test: (la, lo) => {
        if (la < 20 && lo < 72) return false;
        return lo < 92 || la > 20;
      }},
      // SE Asia / Indonesia (scattered)
      { lat: [-11, 28], lon: [92, 141], test: (la, lo) => {
        if (la > 15 && lo < 100) return true; // myanmar/thailand
        if (la > 0 && lo > 100 && lo < 110) return true;
        if (la < 5 && la > -9 && lo > 95 && lo < 120) return Math.sin(lo * 0.8 + la) > -0.2;
        if (la < 0 && lo > 110 && lo < 140) return Math.cos(lo * 0.5) > -0.3;
        return la > 5 && lo < 108;
      }},
      // East Asia (China, Japan, Korea)
      { lat: [18, 54], lon: [97, 146], test: (la, lo) => {
        if (lo > 128 && la < 30) return false; // pacific
        if (lo > 140 && la < 42) return la > 30 && lo < 146; // japan-ish
        return lo < 135 || (lo < 146 && la > 30 && la < 46);
      }},
      // Australia
      { lat: [-44, -10], lon: [112, 154], test: (la, lo) => {
        if (la < -40 && lo < 145) return lo > 140;
        return !(la > -15 && lo < 120);
      }},
      // New Zealand
      { lat: [-48, -33], lon: [165, 179], test: () => true },
      // Antarctica (edge band)
      { lat: [-90, -62], lon: [-180, 180], test: () => Math.random() > 0.15 },
      // UK / Ireland already in Europe; Iceland
      { lat: [63, 67], lon: [-25, -13], test: () => true },
      // Madagascar
      { lat: [-26, -12], lon: [43, 51], test: () => true },
      // Japan core
      { lat: [30, 46], lon: [129, 146], test: (la, lo) => lo > 130 },
      // Philippines
      { lat: [5, 20], lon: [117, 127], test: () => Math.random() > 0.35 },
      // Caribbean islands sparse
      { lat: [10, 27], lon: [-86, -59], test: (la, lo) => {
        if (lo > -78 && lo < -70 && la > 17 && la < 24) return Math.random() > 0.4; // cuba-ish
        return false;
      }},
    ];

    for (const r of regions) {
      if (lat >= r.lat[0] && lat <= r.lat[1] && lon >= r.lon[0] && lon <= r.lon[1]) {
        if (r.test(lat, lon)) return true;
      }
    }
    return false;
  }

  function initDotGlobe(canvas) {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssSize = canvas.clientWidth || 220;
    const size = Math.max(180, cssSize) * dpr;
    canvas.width = size;
    canvas.height = size;

    const dots = [];
    const R = size * 0.42;
    // denser sampling for readable continents
    const N = 4200;
    const golden = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const radius = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = golden * i;
      const x = Math.cos(theta) * radius;
      const z = Math.sin(theta) * radius;

      // sphere → lat/lon
      const lat = (Math.asin(Math.max(-1, Math.min(1, y))) * 180) / Math.PI;
      const lon = (Math.atan2(x, z) * 180) / Math.PI;

      if (isLand(lat, lon)) {
        dots.push({ x, y, z, lat });
      }
    }

    // light ocean ring dots for sphere silhouette (sparse)
    for (let i = 0; i < 280; i++) {
      const y = 1 - (i / 279) * 2;
      const radius = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = golden * i * 7.3;
      const x = Math.cos(theta) * radius;
      const z = Math.sin(theta) * radius;
      const lat = (Math.asin(Math.max(-1, Math.min(1, y))) * 180) / Math.PI;
      const lon = (Math.atan2(x, z) * 180) / Math.PI;
      if (!isLand(lat, lon) && Math.random() > 0.82) {
        dots.push({ x, y, z, ocean: true });
      }
    }

    let rot = 0.4; // start showing Eurasia/Africa nicely
    const cx = size / 2;
    const cy = size / 2;

    const draw = () => {
      ctx.clearRect(0, 0, size, size);
      rot += reduceMotion ? 0 : 0.0028;

      const cos = Math.cos(rot);
      const sin = Math.sin(rot);
      const tilt = 0.35;
      const cosT = Math.cos(tilt);
      const sinT = Math.sin(tilt);

      // atmosphere
      const g = ctx.createRadialGradient(cx, cy, R * 0.1, cx, cy, R * 1.22);
      g.addColorStop(0, "rgba(140, 91, 255, 0.12)");
      g.addColorStop(0.55, "rgba(46, 18, 72, 0.08)");
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.22, 0, Math.PI * 2);
      ctx.fill();

      // soft ocean fill disk
      ctx.beginPath();
      ctx.fillStyle = "rgba(30, 20, 55, 0.45)";
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();

      const projected = [];
      for (const p of dots) {
        let x = p.x * cos - p.z * sin;
        let z = p.x * sin + p.z * cos;
        let y = p.y;
        const y2 = y * cosT - z * sinT;
        const z2 = y * sinT + z * cosT;
        projected.push({ x, y: y2, z: z2, ocean: p.ocean });
      }
      projected.sort((a, b) => a.z - b.z);

      for (const p of projected) {
        if (p.z < -0.05) continue;
        const depth = (p.z + 1) / 2;
        const px = cx + p.x * R;
        const py = cy + p.y * R;
        if (p.ocean) {
          const alpha = 0.08 + depth * 0.18;
          ctx.beginPath();
          ctx.fillStyle = `rgba(140, 91, 255, ${alpha.toFixed(3)})`;
          ctx.arc(px, py, 0.45 * dpr, 0, Math.PI * 2);
          ctx.fill();
        } else {
          const alpha = 0.35 + depth * 0.65;
          const r = (0.7 + depth * 1.25) * dpr;
          ctx.beginPath();
          ctx.fillStyle = `rgba(240, 234, 255, ${alpha.toFixed(3)})`;
          ctx.arc(px, py, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // rim light
      ctx.beginPath();
      ctx.strokeStyle = "rgba(140, 91, 255, 0.25)";
      ctx.lineWidth = 1.2 * dpr;
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.stroke();

      if (!reduceMotion) requestAnimationFrame(draw);
    };

    draw();
  }

  initDotGlobe(document.getElementById("dotGlobe"));
})();
