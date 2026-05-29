/* ═══════════════════════════════════════════════════════════
   ChemCosmos · Interactive Layer
   All visualizations run on vanilla Canvas 2D — no libraries.
═══════════════════════════════════════════════════════════ */

/* ── PAGE NAVIGATION ─────────────────────────────────────── */
(function initNav() {
  const pageLabels = {
    home:      'Home',
    bigbang:   'The Big Bang',
    stars:     'Stars as Reactors',
    atomic:    'Atomic Models',
    decay:     'Radioactive Decay',
    matter:    'Matter at Scale',
    hub:       'AP Chem Hub',
    citations: 'Citations'
  };

  function goTo(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.sn-item').forEach(a => a.classList.remove('active'));
    const page = document.getElementById('page-' + pageId);
    if (page) { page.classList.add('active'); page.scrollTop = 0; }
    const nav = document.querySelector(`.sn-item[data-page="${pageId}"]`);
    if (nav) nav.classList.add('active');
    const ind = document.getElementById('mobPageIndicator');
    if (ind) ind.textContent = pageLabels[pageId] || pageId;
    closeSidebar();
    resetReadingBar();

    if (pageId === 'home')     { animateCounters(); }
    if (pageId === 'atomic')   { initAtomicTimeline(); }
    if (pageId === 'decay')    { initDecayCalc(); initBindingChart(false); }
    if (pageId === 'stars')    { initBindingChart(true); initStellarFromNav(); }

    setTimeout(() => {
      const p = document.getElementById('page-' + pageId);
      if (p) observeChildren(p);
    }, 80);
  }

  document.querySelectorAll('.sn-item[data-page]').forEach(a => {
    a.addEventListener('click', e => { e.preventDefault(); goTo(a.dataset.page); });
  });
  document.querySelectorAll('[data-page]').forEach(el => {
    if (!el.classList.contains('sn-item')) {
      el.addEventListener('click', () => goTo(el.dataset.page));
    }
  });

  const mobBtn    = document.getElementById('mobMenu');
  const navToggle = document.getElementById('navToggle');
  const overlay   = document.getElementById('mobOverlay');
  const sidebar   = document.getElementById('sidebar');

  function openSidebar() {
    sidebar.classList.add('open');
    overlay.classList.add('show');
    if (navToggle) { navToggle.classList.add('open'); navToggle.setAttribute('aria-expanded','true'); }
    document.body.style.overflow = 'hidden';
  }
  function closeSidebar() {
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
    if (navToggle) { navToggle.classList.remove('open'); navToggle.setAttribute('aria-expanded','false'); }
    document.body.style.overflow = '';
  }
  function toggleSidebar() {
    sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
  }

  const closeBtn = document.getElementById('sidebarClose');

  window.closeMobileMenu = closeSidebar;
  if (mobBtn)    mobBtn.addEventListener('click', openSidebar);
  if (navToggle) navToggle.addEventListener('click', toggleSidebar);
  if (closeBtn)  closeBtn.addEventListener('click', closeSidebar);
  if (overlay)   overlay.addEventListener('click', closeSidebar);

  goTo('home');
})();


/* ── STAR FIELD (HERO) ───────────────────────────────────── */
(function initStarField() {
  const canvas = document.getElementById('starCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, raf = null;

  const NUM_STARS = 280;
  let stars = [], shootingStars = [], nextShoot = 0;

  function resize() {
    if (raf) cancelAnimationFrame(raf);
    const dpr = window.devicePixelRatio || 1;
    const p = canvas.parentElement;
    W = p.offsetWidth; H = p.offsetHeight;
    canvas.width  = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    build(); tick();
  }

  function build() {
    stars = Array.from({ length: NUM_STARS }, () => ({
      x:     Math.random() * W,
      y:     Math.random() * H,
      r:     Math.random() * 1.1 + 0.15,
      base:  Math.random() * 0.45 + 0.06,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.008 + 0.002,
      dx:    (Math.random() - 0.5) * 0.01,
    }));
  }

  function spawnShootingStar() {
    const angle = (Math.random() * 30 + 15) * Math.PI / 180;
    const sx = Math.random() * W * 0.7;
    const sy = Math.random() * H * 0.3;
    shootingStars.push({
      x: sx, y: sy,
      len: Math.random() * 120 + 80,
      vx: Math.cos(angle) * (Math.random() * 8 + 6),
      vy: Math.sin(angle) * (Math.random() * 8 + 6),
      life: 1.0, decay: Math.random() * 0.015 + 0.012,
    });
  }

  function tick() {
    const home = document.getElementById('page-home');
    if (home && home.classList.contains('active')) {
      ctx.clearRect(0, 0, W, H);

      /* stars */
      stars.forEach(s => {
        s.phase += s.speed;
        s.x += s.dx;
        if (s.x < -2) s.x = W + 2;
        if (s.x > W + 2) s.x = -2;
        const a = s.base * (0.45 + 0.55 * Math.sin(s.phase));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(195,212,255,${a.toFixed(3)})`;
        ctx.fill();
      });

      /* shooting stars */
      const now = performance.now();
      if (now > nextShoot) {
        spawnShootingStar();
        nextShoot = now + Math.random() * 5000 + 3000;
      }
      shootingStars = shootingStars.filter(s => s.life > 0);
      shootingStars.forEach(s => {
        const tail = { x: s.x - s.vx * (s.len / (s.vx || 1)) * 0.15, y: s.y - s.vy * (s.len / (s.vy || 1)) * 0.15 };
        const grad = ctx.createLinearGradient(tail.x, tail.y, s.x, s.y);
        grad.addColorStop(0, `rgba(200,220,255,0)`);
        grad.addColorStop(1, `rgba(200,220,255,${(s.life * 0.85).toFixed(3)})`);
        ctx.beginPath();
        ctx.moveTo(tail.x, tail.y);
        ctx.lineTo(s.x, s.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        s.x += s.vx; s.y += s.vy; s.life -= s.decay;
      });
    }
    raf = requestAnimationFrame(tick);
  }

  const ro = new ResizeObserver(resize);
  ro.observe(canvas.parentElement);
  resize();
})();


/* ── ANIMATED STAT COUNTERS ──────────────────────────────── */
function animateCounters() {
  document.querySelectorAll('.stat-num').forEach(el => {
    const raw = el.textContent.trim();
    const num = parseFloat(raw);
    if (isNaN(num)) return;
    const isInt = Number.isInteger(num);
    const decimalPlaces = raw.includes('.') ? (raw.split('.')[1] || '').length : 0;
    let start = null;
    const dur = 1800;
    function step(ts) {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      const e = 1 - Math.pow(1 - p, 4);
      if (isInt)    el.textContent = String(Math.round(num * e));
      else          el.textContent = (num * e).toFixed(decimalPlaces);
      if (p < 1)    requestAnimationFrame(step);
      else          el.textContent = raw;
    }
    requestAnimationFrame(step);
  });
}


/* ── READING PROGRESS BAR ────────────────────────────────── */
function resetReadingBar() {
  const bar = document.getElementById('readingBar');
  if (bar) bar.style.transform = 'scaleX(0)';
}

(function initReadingProgress() {
  const bar = document.getElementById('readingBar');
  if (!bar) return;
  document.querySelectorAll('.page').forEach(page => {
    page.addEventListener('scroll', () => {
      if (!page.classList.contains('active')) return;
      const max = page.scrollHeight - page.clientHeight;
      bar.style.transform = `scaleX(${max > 0 ? (page.scrollTop / max).toFixed(4) : 0})`;
    });
  });
})();


/* ── SCROLL-IN ANIMATIONS ────────────────────────────────── */
const _scrollObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
      _scrollObs.unobserve(e.target);
    }
  });
}, { threshold: 0.06, rootMargin: '0px 0px -24px 0px' });

function observeChildren(page) {
  const sel = '.card,.hub-card,.dt-card,.cit-card,.syn-row,.mt-btn,.tlh-node,.og-col,.chain-node,.tt-row,.stc-stat';
  page.querySelectorAll(sel).forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(10px)';
    el.style.transition = 'opacity 0.42s ease, transform 0.42s ease';
    _scrollObs.observe(el);
  });
}
setTimeout(() => {
  const home = document.getElementById('page-home');
  if (home) observeChildren(home);
}, 900);


/* ── ATOMIC MODEL TIMELINE ───────────────────────────────── */
let _atomicKeyListener = null;

function initAtomicTimeline() {
  const btns   = document.querySelectorAll('.mt-btn[data-model]');
  const panels = document.querySelectorAll('.mt-panel');
  if (!btns.length) return;

  function showModel(id) {
    btns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected','false'); });
    panels.forEach(p => p.classList.remove('active'));
    const btn   = document.querySelector(`.mt-btn[data-model="${id}"]`);
    const panel = document.getElementById('model-' + id);
    if (btn)   { btn.classList.add('active'); btn.setAttribute('aria-selected','true'); }
    if (panel)   panel.classList.add('active');
    if (id === 'bohr')    initEmissionSpectrum();
    if (id === 'quantum') initOrbitalViz();
  }

  btns.forEach(btn => btn.addEventListener('click', () => showModel(btn.dataset.model)));

  const order = ['dalton','thomson','rutherford','bohr','quantum'];
  if (_atomicKeyListener) document.removeEventListener('keydown', _atomicKeyListener);
  _atomicKeyListener = e => {
    const atomic = document.getElementById('page-atomic');
    if (!atomic?.classList.contains('active')) return;
    const active = document.querySelector('.mt-btn.active');
    if (!active) return;
    const idx = order.indexOf(active.dataset.model);
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault(); showModel(order[(idx + 1) % order.length]);
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault(); showModel(order[(idx - 1 + order.length) % order.length]);
    }
  };
  document.addEventListener('keydown', _atomicKeyListener);
  showModel('dalton');
}


/* ── HYDROGEN BALMER EMISSION SPECTRUM ───────────────────── */
let _emissionInited = false;

function initEmissionSpectrum() {
  const canvas = document.getElementById('emissionCanvas');
  if (!canvas || _emissionInited) return;
  _emissionInited = true;

  const dpr = window.devicePixelRatio || 1;
  const W   = canvas.parentElement.offsetWidth || 280;
  const H   = 56;
  canvas.width  = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  canvas.style.width  = W + 'px';
  canvas.style.height = H + 'px';
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  /* Visible spectrum gradient (380–700 nm) */
  const WMIN = 380, WMAX = 700;
  const specGrad = ctx.createLinearGradient(0, 0, W, 0);
  const specColors = [
    [380,'#3b0099'],[420,'#6600cc'],[440,'#0000ff'],[470,'#0066ff'],
    [490,'#00ccff'],[510,'#00ff88'],[530,'#00ff00'],[560,'#ccff00'],
    [580,'#ffff00'],[590,'#ffcc00'],[600,'#ff9900'],[630,'#ff4400'],
    [660,'#cc0000'],[700,'#660000'],
  ];
  specColors.forEach(([nm, col]) => {
    specGrad.addColorStop((nm - WMIN) / (WMAX - WMIN), col);
  });

  /* Dark background */
  ctx.fillStyle = '#06080f';
  ctx.fillRect(0, 0, W, H);

  /* Very dim continuous spectrum base (makes emission lines visible) */
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = specGrad;
  ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 1;

  /* Balmer series lines: [wavelength nm, label, n_upper] */
  const lines = [
    { nm: 656, label: 'Hα', n: '3→2', r: 255, g: 40,  b: 40  },
    { nm: 486, label: 'Hβ', n: '4→2', r: 30,  g: 130, b: 210 },
    { nm: 434, label: 'Hγ', n: '5→2', r: 100, g: 30,  b: 180 },
    { nm: 410, label: 'Hδ', n: '6→2', r: 60,  g: 20,  b: 160 },
  ];

  lines.forEach(line => {
    const x = ((line.nm - WMIN) / (WMAX - WMIN)) * W;
    const c = `rgb(${line.r},${line.g},${line.b})`;

    /* Glow */
    const glow = ctx.createRadialGradient(x, H/2, 0, x, H/2, 18);
    glow.addColorStop(0, `rgba(${line.r},${line.g},${line.b},0.5)`);
    glow.addColorStop(1, `rgba(${line.r},${line.g},${line.b},0)`);
    ctx.fillStyle = glow;
    ctx.fillRect(x - 18, 0, 36, H);

    /* Sharp line */
    ctx.strokeStyle = c;
    ctx.lineWidth   = 2;
    ctx.shadowColor = c;
    ctx.shadowBlur  = 6;
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H * 0.75); ctx.stroke();
    ctx.shadowBlur  = 0;

    /* Label */
    ctx.fillStyle = `rgba(${line.r},${line.g},${line.b},0.9)`;
    ctx.font = `bold ${Math.round(8 * dpr) / dpr}px JetBrains Mono, monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(line.label, x, H - 6);
  });

  /* Wavelength axis ticks */
  ctx.strokeStyle = 'rgba(200,210,255,0.15)';
  ctx.lineWidth   = 0.5;
  [400,450,500,550,600,650,700].forEach(nm => {
    const x = ((nm - WMIN) / (WMAX - WMIN)) * W;
    ctx.beginPath(); ctx.moveTo(x, H - 18); ctx.lineTo(x, H); ctx.stroke();
    ctx.fillStyle = 'rgba(200,210,255,0.25)';
    ctx.font      = `${Math.round(7 * dpr) / dpr}px JetBrains Mono, monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(nm, x, H - 20);
  });
}


/* ── QUANTUM ORBITAL PROBABILITY DENSITY ─────────────────── */
let _orbitalInited = false;

function initOrbitalViz() {
  const canvas = document.getElementById('orbitalCanvas');
  if (!canvas || _orbitalInited) return;
  _orbitalInited = true;

  const dpr = window.devicePixelRatio || 1;
  const W   = canvas.parentElement.offsetWidth || 280;
  const H   = 110;
  canvas.width  = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  canvas.style.width  = W + 'px';
  canvas.style.height = H + 'px';
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  ctx.fillStyle = '#06080f';
  ctx.fillRect(0, 0, W, H);

  const cellW = W / 3;
  const orbitals = [
    { label:'1s', type:'s', n:1, cx: cellW*0.5,   cy: H/2 },
    { label:'2s', type:'s', n:2, cx: cellW*1.5,   cy: H/2 },
    { label:'2px',type:'p', n:2, cx: cellW*2.5,   cy: H/2 },
  ];

  const BLUE   = [79,  138, 255];
  const GOLD   = [200, 146,  58];
  const VIOLET = [139,  92, 246];

  orbitals.forEach((orb, i) => {
    const color = i === 0 ? BLUE : i === 1 ? GOLD : VIOLET;
    const [r,g,b] = color;
    const cx = orb.cx, cy = orb.cy;

    if (orb.type === 's') {
      /* s orbital: spherical shells */
      const maxR = (orb.n === 1 ? 28 : 36);
      /* outer diffuse cloud */
      const outerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR * 1.2);
      outerGrad.addColorStop(0, `rgba(${r},${g},${b},0.55)`);
      outerGrad.addColorStop(0.5,  `rgba(${r},${g},${b},0.22)`);
      outerGrad.addColorStop(1,    `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = outerGrad;
      ctx.beginPath(); ctx.arc(cx, cy, maxR * 1.2, 0, Math.PI*2); ctx.fill();

      if (orb.n === 2) {
        /* 2s has a node ring — show as donut */
        const nodeR = 16;
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = 'rgba(0,0,0,0.65)';
        ctx.beginPath(); ctx.arc(cx, cy, nodeR, 0, Math.PI*2); ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
        /* inner core */
        const innerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, nodeR * 0.7);
        innerGrad.addColorStop(0, `rgba(${r},${g},${b},0.65)`);
        innerGrad.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = innerGrad;
        ctx.beginPath(); ctx.arc(cx, cy, nodeR * 0.7, 0, Math.PI*2); ctx.fill();
      } else {
        /* 1s bright core */
        const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 10);
        coreGrad.addColorStop(0, `rgba(${r},${g},${b},0.9)`);
        coreGrad.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = coreGrad;
        ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI*2); ctx.fill();
      }
    } else {
      /* p orbital: two lobes */
      const lobeL = 38, lobeW = 22;
      [[-1],[1]].forEach(([dir]) => {
        const lobe = ctx.createRadialGradient(cx, cy + dir * lobeL * 0.42, 0, cx, cy + dir * lobeL * 0.42, lobeL * 0.8);
        lobe.addColorStop(0,   `rgba(${r},${g},${b},0.7)`);
        lobe.addColorStop(0.55, `rgba(${r},${g},${b},0.3)`);
        lobe.addColorStop(1,    `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = lobe;
        ctx.save();
        ctx.translate(cx, cy + dir * lobeL * 0.42);
        ctx.scale(lobeW / (lobeL * 0.8), 1);
        ctx.beginPath(); ctx.arc(0, 0, lobeL * 0.8, 0, Math.PI*2); ctx.fill();
        ctx.restore();
      });
      /* nodal plane indicator */
      ctx.strokeStyle = `rgba(${r},${g},${b},0.2)`;
      ctx.lineWidth = 1;
      ctx.setLineDash([3,3]);
      ctx.beginPath(); ctx.moveTo(cx - lobeW, cy); ctx.lineTo(cx + lobeW, cy); ctx.stroke();
      ctx.setLineDash([]);
    }

    /* nucleus dot */
    ctx.fillStyle = '#daa84e';
    ctx.beginPath(); ctx.arc(cx, cy, 2.5, 0, Math.PI*2); ctx.fill();

    /* divider */
    if (i < 2) {
      ctx.strokeStyle = 'rgba(160,175,230,0.06)';
      ctx.lineWidth   = 1;
      ctx.beginPath(); ctx.moveTo(cellW*(i+1), 8); ctx.lineTo(cellW*(i+1), H-8); ctx.stroke();
    }
  });
}


/* ── BINDING ENERGY CHART ────────────────────────────────── */
let bindingInited = false;
let _bindingSnap = null, _bindingCtx = null, _bindingCx = null, _bindingCy = null;
let _bindingData = null, _bindingDims = null;

function initBindingChart(force) {
  const canvas = document.getElementById('bindingCanvas');
  if (!canvas) return;
  if (bindingInited && !force) return;
  bindingInited = true;

  const dpr = window.devicePixelRatio || 1;
  const W   = canvas.parentElement.offsetWidth || 340;
  const H   = Math.round(W * 200 / 340);
  canvas.width  = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  canvas.style.width  = W + 'px';
  canvas.style.height = H + 'px';
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const data = [
    {A:1,  BE:0},    {A:2,  BE:1.11}, {A:3,  BE:2.57}, {A:4,  BE:7.07},
    {A:7,  BE:5.6},  {A:12, BE:7.68}, {A:14, BE:7.48}, {A:16, BE:7.97},
    {A:20, BE:8.03}, {A:24, BE:8.26}, {A:28, BE:8.45}, {A:32, BE:8.48},
    {A:40, BE:8.55}, {A:48, BE:8.67}, {A:56, BE:8.79}, {A:63, BE:8.75},
    {A:84, BE:8.70}, {A:107,BE:8.55}, {A:120,BE:8.50}, {A:138,BE:8.39},
    {A:160,BE:8.24}, {A:184,BE:7.97}, {A:208,BE:7.87}, {A:238,BE:7.57},
  ];

  const pad = { l:44, r:20, t:18, b:38 };
  const cx = A  => pad.l + (A / 240) * (W - pad.l - pad.r);
  const cy = be => pad.t + (1 - be / 9.5) * (H - pad.t - pad.b);

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#06080f';
  ctx.fillRect(0, 0, W, H);

  /* gridlines */
  ctx.strokeStyle = 'rgba(170,185,230,0.05)'; ctx.lineWidth = 1;
  [2,4,6,8].forEach(be => {
    ctx.beginPath(); ctx.moveTo(pad.l, cy(be)); ctx.lineTo(W-pad.r, cy(be)); ctx.stroke();
  });
  [50,100,150,200].forEach(A => {
    ctx.beginPath(); ctx.moveTo(cx(A), pad.t); ctx.lineTo(cx(A), H-pad.b); ctx.stroke();
  });

  /* axes */
  ctx.strokeStyle = 'rgba(170,185,230,0.16)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, H-pad.b); ctx.lineTo(W-pad.r, H-pad.b); ctx.stroke();

  /* axis labels */
  ctx.fillStyle = 'rgba(160,175,215,0.55)';
  ctx.font = `${Math.round(9.5 * dpr) / dpr}px JetBrains Mono, monospace`;
  ctx.textAlign = 'right';
  [2,4,6,8].forEach(be => { ctx.fillText(be, pad.l-5, cy(be)+4); });
  ctx.textAlign = 'center';
  [50,100,150,200].forEach(A => { ctx.fillText(A, cx(A), H-pad.b+14); });

  /* fill area */
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, 'rgba(200,146,58,0.14)');
  grad.addColorStop(1, 'rgba(200,146,58,0)');
  ctx.beginPath();
  data.forEach((d,i) => i === 0 ? ctx.moveTo(cx(d.A), cy(d.BE)) : ctx.lineTo(cx(d.A), cy(d.BE)));
  ctx.lineTo(cx(data[data.length-1].A), H-pad.b);
  ctx.lineTo(cx(data[0].A), H-pad.b);
  ctx.closePath();
  ctx.fillStyle = grad; ctx.fill();

  /* curve line */
  ctx.beginPath();
  ctx.strokeStyle = '#c8923a'; ctx.lineWidth = 2.5; ctx.lineJoin = 'round';
  data.forEach((d,i) => i === 0 ? ctx.moveTo(cx(d.A), cy(d.BE)) : ctx.lineTo(cx(d.A), cy(d.BE)));
  ctx.stroke();

  /* Fe-56 peak marker */
  const fe = data.find(d => d.A === 56);
  if (fe) {
    ctx.beginPath(); ctx.arc(cx(fe.A), cy(fe.BE), 7, 0, Math.PI*2);
    ctx.fillStyle = '#4f8aff'; ctx.fill();
    ctx.strokeStyle = 'rgba(120,160,255,0.4)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#daa84e';
    ctx.font = `bold ${Math.round(11 * dpr) / dpr}px JetBrains Mono, monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('⁵⁶Fe', cx(fe.A), cy(fe.BE) - 14);
    ctx.fillStyle = 'rgba(218,168,78,0.65)';
    ctx.font = `${Math.round(9 * dpr) / dpr}px JetBrains Mono, monospace`;
    ctx.fillText('8.79 MeV', cx(fe.A), cy(fe.BE) - 3);
  }

  /* axis title labels */
  ctx.fillStyle = 'rgba(160,175,215,0.45)';
  ctx.font = `${Math.round(9.5 * dpr) / dpr}px JetBrains Mono, monospace`;
  ctx.textAlign = 'center';
  ctx.fillText('Mass Number (A)', W/2, H - 2);
  ctx.save();
  ctx.translate(10, H/2); ctx.rotate(-Math.PI/2);
  ctx.fillText('MeV / nucleon', 0, 0);
  ctx.restore();

  _bindingSnap = ctx.getImageData(0, 0, canvas.width, canvas.height);
  _bindingCtx = ctx; _bindingCx = cx; _bindingCy = cy;
  _bindingData = data; _bindingDims = { W, H, pad };

  if (!canvas._hoverBound) {
    canvas._hoverBound = true;
    addBindingHover(canvas);
  }
}

function addBindingHover(canvas) {
  canvas.addEventListener('mousemove', e => {
    if (!_bindingSnap || !_bindingData) return;
    const ctx  = _bindingCtx;
    const { W, H, pad } = _bindingDims;
    const rect   = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) * (W / rect.width);
    let nearest  = _bindingData[0], minDist = Infinity;
    _bindingData.forEach(d => {
      const dist = Math.abs(_bindingCx(d.A) - mouseX);
      if (dist < minDist) { minDist = dist; nearest = d; }
    });
    ctx.putImageData(_bindingSnap, 0, 0);
    if (minDist > W / 5) return;
    const px = _bindingCx(nearest.A), py = _bindingCy(nearest.BE);

    ctx.save();
    ctx.strokeStyle = 'rgba(79,138,255,0.3)'; ctx.lineWidth = 1; ctx.setLineDash([3,4]);
    ctx.beginPath(); ctx.moveTo(px, pad.t); ctx.lineTo(px, H-pad.b); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(pad.l, py);  ctx.lineTo(px, py);     ctx.stroke();
    ctx.setLineDash([]);

    ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI*2);
    ctx.fillStyle = '#4f8aff'; ctx.fill();
    ctx.strokeStyle = 'rgba(120,160,255,0.45)'; ctx.lineWidth = 2; ctx.stroke();

    const label = `A=${nearest.A}  ·  ${nearest.BE} MeV`;
    ctx.font = `bold ${Math.round(9 * (window.devicePixelRatio||1)) / (window.devicePixelRatio||1)}px JetBrains Mono, monospace`;
    const lw = ctx.measureText(label).width + 18;
    const lx = px + 10 > W - lw - 4 ? px - lw - 8 : px + 10;
    const ly = py - 14;
    ctx.fillStyle = 'rgba(5,7,13,0.94)';
    ctx.strokeStyle = 'rgba(79,138,255,0.3)'; ctx.lineWidth = 1;
    if (ctx.roundRect) ctx.roundRect(lx, ly, lw, 20, 3);
    else ctx.rect(lx, ly, lw, 20);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#daa84e'; ctx.textAlign = 'left';
    ctx.fillText(label, lx + 9, ly + 13);
    ctx.restore();
  });
  canvas.addEventListener('mouseleave', () => {
    if (_bindingSnap && _bindingCtx) _bindingCtx.putImageData(_bindingSnap, 0, 0);
  });
}


/* ── HALF-LIFE DECAY CALCULATOR ──────────────────────────── */
let _calcTimer = null;

function initDecayCalc() {
  const n0Input = document.getElementById('ci-n0');
  const hlInput = document.getElementById('ci-hl');
  const tInput  = document.getElementById('ci-t');
  const goBtn   = document.getElementById('calcGo');
  if (!goBtn) return;

  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      n0Input.value = btn.dataset.n;
      hlInput.value = btn.dataset.h;
      tInput.value  = btn.dataset.t;
      runCalc();
    });
  });

  [n0Input, hlInput, tInput].forEach(inp => {
    inp.addEventListener('input', () => {
      document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('selected'));
      clearTimeout(_calcTimer);
      _calcTimer = setTimeout(runCalc, 360);
    });
  });

  goBtn.addEventListener('click', runCalc);
  runCalc();

  function runCalc() {
    const N0 = parseFloat(n0Input.value);
    const HL = parseFloat(hlInput.value);
    const T  = parseFloat(tInput.value);
    if (isNaN(N0) || isNaN(HL) || isNaN(T) || HL <= 0 || N0 <= 0 || T < 0) {
      ['cr-remaining','cr-pct','cr-halflives','cr-decayed'].forEach(id => {
        document.getElementById(id).textContent = '--';
      });
      return;
    }
    const halflives = T / HL;
    const remaining = N0 * Math.pow(0.5, halflives);
    const pct       = (remaining / N0) * 100;
    const decayed   = N0 - remaining;
    document.getElementById('cr-remaining').textContent = fmt(remaining);
    document.getElementById('cr-pct').textContent       = pct.toFixed(2) + '%';
    document.getElementById('cr-halflives').textContent = halflives.toFixed(3);
    document.getElementById('cr-decayed').textContent   = fmt(decayed);
    drawDecayCurve(N0, HL, T);
    buildDecayTable(N0, HL, halflives);
  }
}

function fmt(n) {
  if (n === 0) return '0';
  if (n < 0.001) return n.toExponential(3);
  if (n >= 1e9)  return n.toExponential(3);
  return parseFloat(n.toPrecision(5)).toString();
}

function drawDecayCurve(N0, HL, T) {
  const canvas = document.getElementById('decayCanvas');
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  const W   = canvas.clientWidth || 580;
  const H   = Math.round(W * 300 / 580);
  canvas.width  = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  canvas.style.height = H + 'px';
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const maxT = Math.max(T * 1.3, HL * 4.5);
  const pad  = { l:54, r:24, t:22, b:44 };
  const cx = t => pad.l + (t / maxT) * (W - pad.l - pad.r);
  const cy = n => pad.t + (1 - n / N0)  * (H - pad.t - pad.b);

  ctx.fillStyle = '#05070d'; ctx.fillRect(0, 0, W, H);

  /* horizontal grid */
  ctx.strokeStyle = 'rgba(170,185,230,0.05)'; ctx.lineWidth = 1;
  [0.25, 0.5, 0.75, 1.0].forEach(f => {
    ctx.beginPath(); ctx.moveTo(pad.l, cy(f*N0)); ctx.lineTo(W-pad.r, cy(f*N0)); ctx.stroke();
  });

  /* half-life markers */
  let numHL = Math.floor(maxT / HL);
  for (let i = 1; i <= Math.min(numHL, 8); i++) {
    const x = cx(i * HL);
    if (x > W - pad.r) break;
    ctx.strokeStyle = 'rgba(79,138,255,0.1)';
    ctx.beginPath(); ctx.moveTo(x, pad.t); ctx.lineTo(x, H-pad.b); ctx.stroke();
    ctx.fillStyle = 'rgba(79,138,255,0.4)';
    ctx.font = `${Math.round(8.5 * dpr)/dpr}px JetBrains Mono, monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(`t½×${i}`, x, pad.t - 5);
  }

  /* axes */
  ctx.strokeStyle = 'rgba(170,185,230,0.11)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, H-pad.b); ctx.lineTo(W-pad.r, H-pad.b); ctx.stroke();

  /* Y-axis values */
  ctx.fillStyle = 'rgba(160,175,215,0.55)';
  ctx.font = `${Math.round(9.5 * dpr)/dpr}px JetBrains Mono, monospace`;
  ctx.textAlign = 'right';
  [0.25, 0.5, 0.75, 1.0].forEach(f => {
    ctx.fillText(fmt(f * N0), pad.l - 5, cy(f*N0) + 4);
  });

  /* filled area */
  const grad = ctx.createLinearGradient(0, pad.t, 0, H-pad.b);
  grad.addColorStop(0, 'rgba(200,146,58,0.17)');
  grad.addColorStop(1, 'rgba(200,146,58,0.02)');
  ctx.beginPath();
  const steps = 240;
  for (let i = 0; i <= steps; i++) {
    const ti = (i/steps)*maxT, ni = N0*Math.pow(0.5, ti/HL);
    i === 0 ? ctx.moveTo(cx(ti), cy(ni)) : ctx.lineTo(cx(ti), cy(ni));
  }
  ctx.lineTo(cx(maxT), H-pad.b); ctx.lineTo(cx(0), H-pad.b); ctx.closePath();
  ctx.fillStyle = grad; ctx.fill();

  /* main curve */
  ctx.beginPath(); ctx.strokeStyle = '#c8923a'; ctx.lineWidth = 2.5;
  for (let i = 0; i <= steps; i++) {
    const ti = (i/steps)*maxT, ni = N0*Math.pow(0.5, ti/HL);
    i === 0 ? ctx.moveTo(cx(ti), cy(ni)) : ctx.lineTo(cx(ti), cy(ni));
  }
  ctx.stroke();

  /* current-time marker */
  const rem = N0 * Math.pow(0.5, T/HL);
  const mx  = cx(T), my = cy(rem);
  ctx.strokeStyle = 'rgba(79,138,255,0.4)'; ctx.lineWidth = 1; ctx.setLineDash([4,4]);
  ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(mx, H-pad.b); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(pad.l, my); ctx.lineTo(mx, my); ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath(); ctx.arc(mx, my, 5, 0, Math.PI*2);
  ctx.fillStyle = '#4f8aff'; ctx.fill();
  ctx.strokeStyle = 'rgba(120,160,255,0.45)'; ctx.lineWidth = 2; ctx.stroke();

  const pct = (rem/N0*100).toFixed(1);
  const lb  = `${fmt(rem)} g (${pct}%)`;
  ctx.font  = `bold ${Math.round(9.5 * dpr)/dpr}px JetBrains Mono, monospace`;
  const lw  = ctx.measureText(lb).width + 16;
  const lx  = mx + 12 > W - lw - 4 ? mx - lw - 10 : mx + 12;
  ctx.fillStyle = 'rgba(5,7,13,0.94)'; ctx.strokeStyle = 'rgba(79,138,255,0.32)'; ctx.lineWidth = 1;
  if (ctx.roundRect) ctx.roundRect(lx-4, my-15, lw, 22, 3);
  else ctx.rect(lx-4, my-15, lw, 22);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#daa84e'; ctx.textAlign = 'left';
  ctx.fillText(lb, lx + 4, my);
}

function buildDecayTable(N0, HL, totalHL) {
  const container = document.getElementById('decayTable');
  if (!container) return;
  const rows = Math.min(Math.ceil(totalHL) + 3, 12);
  let html = '<table><thead><tr><th>Half-Lives (n)</th><th>Time (years)</th><th>Remaining (g)</th><th>% Remaining</th></tr></thead><tbody>';
  for (let i = 0; i <= rows; i++) {
    const t   = i * HL;
    const n   = N0 * Math.pow(0.5, i);
    const pct = (n / N0 * 100).toFixed(2);
    const cur = i === Math.round(totalHL);
    const sty = cur ? ' style="background:rgba(79,138,255,0.07);color:#daa84e"' : '';
    html += `<tr${sty}><td>${i}</td><td>${fmt(t)}</td><td>${fmt(n)}</td><td>${pct}%</td></tr>`;
  }
  html += '</tbody></table>';
  container.innerHTML = html;
}


/* ── STELLAR LIFECYCLE CALCULATOR ────────────────────────── */
(function initStellarCalc() {
  const slider = document.getElementById('stellarMass');
  const numInp = document.getElementById('stellarMassNum');
  const canvas = document.getElementById('stellarCanvas');
  const result = document.getElementById('stcResult');
  if (!slider || !canvas || !result) return;

  const CLASSES = [
    { maxM:0.08,     type:'L',  name:'Brown Dwarf',        hex:'#6b3fa0' },
    { maxM:0.45,     type:'M',  name:'Red Dwarf',           hex:'#ff4500' },
    { maxM:0.80,     type:'K',  name:'Orange Dwarf',        hex:'#ff7700' },
    { maxM:1.04,     type:'G',  name:'Yellow Dwarf',        hex:'#ffd040' },
    { maxM:1.40,     type:'F',  name:'Yellow-White Star',   hex:'#ffe8a0' },
    { maxM:2.10,     type:'A',  name:'White Star',          hex:'#e8eeff' },
    { maxM:16,       type:'B',  name:'Blue-White Giant',    hex:'#aac8ff' },
    { maxM:Infinity, type:'O',  name:'Blue Supergiant',     hex:'#88aaff' },
  ];

  const STAGES = [
    { label:'H → He',    minM:0.08, color:'#60a5fa', desc:'Hydrogen burning (pp-chain)' },
    { label:'He → C, O', minM:0.50, color:'#a78bfa', desc:'Triple-alpha process'       },
    { label:'C → Ne',    minM:8.0,  color:'#34d399', desc:'Carbon burning'             },
    { label:'Ne → O',    minM:8.0,  color:'#fbbf24', desc:'Neon burning'               },
    { label:'O → Si',    minM:8.0,  color:'#f97316', desc:'Oxygen burning'             },
    { label:'Si → Fe',   minM:10.0, color:'#f43f5e', desc:'Silicon burning → iron core' },
  ];

  function hexToRgb(h) {
    const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(h);
    return r ? [parseInt(r[1],16), parseInt(r[2],16), parseInt(r[3],16)] : [255,255,255];
  }

  function calcData(mass) {
    const cls  = CLASSES.find(c => mass < c.maxM) || CLASSES[CLASSES.length-1];
    const life = mass < 0.08 ? null : 1e10 * Math.pow(mass, -2.5);
    const Tc   = mass < 0.08 ? null : 1.5e7 * Math.pow(mass, 0.57);
    const lum  = mass < 0.08 ? null : Math.pow(mass, 4);
    let remnant, remnantHex;
    if      (mass < 0.08) { remnant = 'Brown Dwarf';  remnantHex = '#6b3fa0'; }
    else if (mass < 8)    { remnant = 'White Dwarf';  remnantHex = '#c4b5fd'; }
    else if (mass < 20)   { remnant = 'Neutron Star'; remnantHex = '#60a5fa'; }
    else                  { remnant = 'Black Hole';   remnantHex = '#555577'; }
    return { cls, life, Tc, lum, remnant, remnantHex };
  }

  function fmtLife(y) {
    if (!y) return '--';
    if (y > 1e13) return '> 1 trillion yr';
    if (y > 1e12) return (y/1e12).toFixed(1) + ' trillion yr';
    if (y > 1e9)  return (y/1e9).toFixed(2) + ' billion yr';
    if (y > 1e6)  return (y/1e6).toFixed(1) + ' million yr';
    return y.toExponential(2) + ' yr';
  }
  function fmtTemp(T) {
    if (!T) return '--';
    return (T/1e6).toFixed(1) + ' × 10⁶ K';
  }
  function fmtLum(L) {
    if (!L) return '--';
    if (L >= 1e6) return (L/1e6).toFixed(0) + 'M L☉';
    if (L >= 1e3) return (L/1e3).toFixed(0) + 'k L☉';
    return L.toFixed(1) + ' L☉';
  }

  let starPhase = 0, starRaf = null;

  function drawStar(mass, hex) {
    const dpr = window.devicePixelRatio || 1;
    const S   = 180;
    canvas.width  = S * dpr; canvas.height = S * dpr;
    canvas.style.width = S + 'px'; canvas.style.height = S + 'px';
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const [r,g,b] = hexToRgb(hex);
    const cx = S/2, cy = S/2;
    const maxR = S*0.34, minR = S*0.06;
    const starR = mass < 0.08
      ? minR
      : Math.min(maxR, minR + (Math.log(mass/0.08+1) / Math.log(61)) * (maxR - minR));
    if (starRaf) cancelAnimationFrame(starRaf);

    function tick() {
      ctx.clearRect(0,0,S,S);
      starPhase += 0.018;
      const pulse = 0.92 + 0.08 * Math.sin(starPhase);

      if (mass < 0.08) {
        const g2 = ctx.createRadialGradient(cx,cy,0,cx,cy,starR*1.6);
        g2.addColorStop(0, `rgba(${r},${g},${b},0.55)`);
        g2.addColorStop(0.5,`rgba(${r},${g},${b},0.18)`);
        g2.addColorStop(1,'rgba(0,0,0,0)');
        ctx.fillStyle = g2;
        ctx.beginPath(); ctx.arc(cx,cy,starR*1.6,0,Math.PI*2); ctx.fill();
        starRaf = requestAnimationFrame(tick); return;
      }
      const corona = ctx.createRadialGradient(cx,cy,starR*0.7,cx,cy,starR*3);
      corona.addColorStop(0,`rgba(${r},${g},${b},${0.13*pulse})`);
      corona.addColorStop(0.5,`rgba(${r},${g},${b},0.05)`);
      corona.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle = corona;
      ctx.beginPath(); ctx.arc(cx,cy,starR*3,0,Math.PI*2); ctx.fill();

      const mid = ctx.createRadialGradient(cx,cy,0,cx,cy,starR*1.5);
      mid.addColorStop(0,`rgba(${r},${g},${b},${0.25*pulse})`);
      mid.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle = mid;
      ctx.beginPath(); ctx.arc(cx,cy,starR*1.5,0,Math.PI*2); ctx.fill();

      const disc = ctx.createRadialGradient(cx-starR*0.22,cy-starR*0.22,0,cx,cy,starR);
      disc.addColorStop(0,'#ffffff');
      disc.addColorStop(0.25,hex);
      disc.addColorStop(1,`rgba(${Math.max(0,r-60)},${Math.max(0,g-60)},${Math.max(0,b-60)},0.9)`);
      ctx.fillStyle = disc;
      ctx.beginPath(); ctx.arc(cx,cy,starR*pulse,0,Math.PI*2); ctx.fill();
      starRaf = requestAnimationFrame(tick);
    }
    tick();
  }

  function renderResult(mass, d) {
    const { cls, life, Tc, lum, remnant, remnantHex } = d;
    const [r,g,b]    = hexToRgb(cls.hex);
    const [rr,rg,rb] = hexToRgb(remnantHex);
    const isSN = mass >= 8;

    const stagesHTML = STAGES.map((s, i) => {
      const on    = mass >= s.minM;
      const arrow = i < STAGES.length-1 ? `<span class="stc-chain-arrow">→</span>` : '';
      return `<div class="stc-stage ${on?'active':'inactive'}" title="${s.desc}">
        <span class="stc-stage-dot" style="${on?`background:${s.color}`:''}"></span>
        <span class="stc-stage-text">${s.label}</span>
      </div>${arrow}`;
    }).join('');

    result.innerHTML = `
      <div class="stc-class-row">
        <span class="stc-class-badge"
          style="color:${cls.hex};border-color:rgba(${r},${g},${b},0.35);background:rgba(${r},${g},${b},0.09)">
          ${cls.type}-type
        </span>
        <span class="stc-class-name">${cls.name}</span>
        ${isSN ? '<span class="stc-supernova-tag">Supernova candidate</span>' : ''}
      </div>
      <div class="stc-stats">
        <div class="stc-stat">
          <span class="stc-stat-label">Main-sequence life</span>
          <span class="stc-stat-val">${fmtLife(life)}</span>
        </div>
        <div class="stc-stat">
          <span class="stc-stat-label">Core temperature</span>
          <span class="stc-stat-val">${fmtTemp(Tc)}</span>
        </div>
        <div class="stc-stat">
          <span class="stc-stat-label">Luminosity</span>
          <span class="stc-stat-val">${fmtLum(lum)}</span>
        </div>
      </div>
      <div class="stc-fusion-section">
        <div class="stc-chain-label">Fusion chain achieved</div>
        <div class="stc-chain">${stagesHTML}</div>
      </div>
      <div class="stc-remnant-row">
        <span class="stc-remnant-label">Stellar remnant</span>
        <span class="stc-remnant-badge"
          style="color:${remnantHex};border-color:rgba(${rr},${rg},${rb},0.35);background:rgba(${rr},${rg},${rb},0.09)">
          ${remnant}
        </span>
        ${life ? `<span class="stc-lifespan-note">After ~${fmtLife(life)}</span>` : ''}
      </div>`;
  }

  function update() {
    const mass = Math.max(0.08, Math.min(60, parseFloat(slider.value) || 1));
    const d = calcData(mass);
    drawStar(mass, d.cls.hex);
    renderResult(mass, d);
  }

  slider.addEventListener('input', () => {
    numInp.value = parseFloat(slider.value).toFixed(2); update();
  });
  numInp.addEventListener('input', () => {
    const v = Math.max(0.08, Math.min(60, parseFloat(numInp.value) || 1));
    slider.value = v; update();
  });

  window.initStellarFromNav = () => setTimeout(update, 60);
  if (document.getElementById('page-stars')?.classList.contains('active')) update();
})();
