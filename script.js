/* ═══════════════════════════════════════════════════════════
   ChemCosmos — Interactive Layer
═══════════════════════════════════════════════════════════ */

/* ── PAGE NAVIGATION ─────────────────────────────────────── */
(function initNav() {
  const pageLabels = {
    home: 'Home', bigbang: 'The Big Bang', stars: 'Stars as Reactors',
    atomic: 'Atomic Models', decay: 'Radioactive Decay',
    matter: 'Matter at Scale', hub: 'AP Chem Hub', citations: 'Citations'
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
    closeMobileMenu();
    if (pageId === 'atomic') initAtomicTimeline();
    if (pageId === 'decay')  { initDecayCalc(); initBindingChart(false); }
    if (pageId === 'stars')  initBindingChart(true);
  }

  document.querySelectorAll('.sn-item[data-page]').forEach(a => {
    a.addEventListener('click', e => { e.preventDefault(); goTo(a.dataset.page); });
  });
  document.querySelectorAll('[data-page]').forEach(el => {
    if (!el.classList.contains('sn-item')) el.addEventListener('click', () => goTo(el.dataset.page));
  });

  const mobBtn = document.getElementById('mobMenu');
  const overlay = document.getElementById('mobOverlay');
  const sidebar = document.getElementById('sidebar');
  function openMobileMenu() { sidebar.classList.add('open'); overlay.classList.add('show'); }
  function closeMobileMenu() { sidebar.classList.remove('open'); overlay.classList.remove('show'); }
  window.closeMobileMenu = closeMobileMenu;
  if (mobBtn) mobBtn.addEventListener('click', openMobileMenu);
  if (overlay) overlay.addEventListener('click', closeMobileMenu);

  goTo('home');
})();


/* ── ATOMIC MODEL TIMELINE ───────────────────────────────── */
function initAtomicTimeline() {
  const btns = document.querySelectorAll('.mt-btn[data-model]');
  const panels = document.querySelectorAll('.mt-panel');
  if (!btns.length) return;

  function showModel(id) {
    btns.forEach(b => b.classList.remove('active'));
    panels.forEach(p => p.classList.remove('active'));
    const btn = document.querySelector(`.mt-btn[data-model="${id}"]`);
    const panel = document.getElementById('model-' + id);
    if (btn) btn.classList.add('active');
    if (panel) panel.classList.add('active');
  }

  btns.forEach(btn => {
    btn.addEventListener('click', () => showModel(btn.dataset.model));
  });

  const order = ['dalton','thomson','rutherford','bohr','quantum'];
  document.addEventListener('keydown', e => {
    const active = document.querySelector('.mt-btn.active');
    if (!active) return;
    const idx = order.indexOf(active.dataset.model);
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      showModel(order[(idx + 1) % order.length]);
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      showModel(order[(idx - 1 + order.length) % order.length]);
    }
  });
}


/* ── BINDING ENERGY CHART ────────────────────────────────── */
let bindingInited = false;
function initBindingChart(force) {
  const canvas = document.getElementById('bindingCanvas');
  if (!canvas) return;
  if (bindingInited && !force) return;
  bindingInited = true;

  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  const data = [
    {A:1,  BE:0},    {A:2,  BE:1.11}, {A:3,  BE:2.57}, {A:4,  BE:7.07},
    {A:7,  BE:5.6},  {A:12, BE:7.68}, {A:14, BE:7.48}, {A:16, BE:7.97},
    {A:20, BE:8.03}, {A:24, BE:8.26}, {A:28, BE:8.45}, {A:32, BE:8.48},
    {A:40, BE:8.55}, {A:48, BE:8.67}, {A:56, BE:8.79}, {A:63, BE:8.75},
    {A:84, BE:8.70}, {A:107,BE:8.55}, {A:120,BE:8.50}, {A:138,BE:8.39},
    {A:160,BE:8.24}, {A:184,BE:7.97}, {A:208,BE:7.87}, {A:238,BE:7.57},
  ];

  const pad = { l:44, r:20, t:16, b:36 };
  const cx = (A) => pad.l + (A / 240) * (W - pad.l - pad.r);
  const cy = (be) => pad.t + (1 - be / 9.5) * (H - pad.t - pad.b);

  ctx.clearRect(0, 0, W, H);

  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;
  [2,4,6,8].forEach(be => {
    ctx.beginPath(); ctx.moveTo(pad.l, cy(be)); ctx.lineTo(W-pad.r, cy(be)); ctx.stroke();
  });
  [50,100,150,200].forEach(A => {
    ctx.beginPath(); ctx.moveTo(cx(A), pad.t); ctx.lineTo(cx(A), H-pad.b); ctx.stroke();
  });

  ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, H-pad.b); ctx.lineTo(W-pad.r, H-pad.b); ctx.stroke();

  ctx.fillStyle = 'rgba(139,157,199,0.7)';
  ctx.font = '10px JetBrains Mono, monospace';
  ctx.textAlign = 'right';
  [2,4,6,8].forEach(be => { ctx.fillText(be, pad.l-6, cy(be)+4); });
  ctx.textAlign = 'center';
  [50,100,150,200].forEach(A => { ctx.fillText(A, cx(A), H-pad.b+14); });

  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, 'rgba(6,182,212,0.15)');
  grad.addColorStop(1, 'rgba(6,182,212,0)');
  ctx.beginPath();
  data.forEach((d, i) => { i === 0 ? ctx.moveTo(cx(d.A), cy(d.BE)) : ctx.lineTo(cx(d.A), cy(d.BE)); });
  ctx.lineTo(cx(data[data.length-1].A), H-pad.b);
  ctx.lineTo(cx(data[0].A), H-pad.b);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.beginPath();
  ctx.strokeStyle = '#22d3ee';
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  data.forEach((d, i) => { i === 0 ? ctx.moveTo(cx(d.A), cy(d.BE)) : ctx.lineTo(cx(d.A), cy(d.BE)); });
  ctx.stroke();

  const fe = data.find(d => d.A === 56);
  if (fe) {
    ctx.beginPath();
    ctx.arc(cx(fe.A), cy(fe.BE), 7, 0, Math.PI*2);
    ctx.fillStyle = '#f0b429';
    ctx.fill();
    ctx.fillStyle = '#fcd34d';
    ctx.font = 'bold 11px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('⁵⁶Fe', cx(fe.A), cy(fe.BE) - 14);
    ctx.fillStyle = 'rgba(240,180,41,0.6)';
    ctx.font = '9px JetBrains Mono, monospace';
    ctx.fillText('8.79 MeV', cx(fe.A), cy(fe.BE) - 3);
  }

  ctx.fillStyle = 'rgba(74,90,122,0.9)';
  ctx.font = '10px JetBrains Mono, monospace';
  ctx.textAlign = 'center';
  ctx.fillText('Mass Number (A)', W/2, H-2);
  ctx.save();
  ctx.translate(10, H/2);
  ctx.rotate(-Math.PI/2);
  ctx.fillText('MeV / nucleon', 0, 0);
  ctx.restore();
}


/* ── HALF-LIFE DECAY CALCULATOR ──────────────────────────── */
function initDecayCalc() {
  const n0Input  = document.getElementById('ci-n0');
  const hlInput  = document.getElementById('ci-hl');
  const tInput   = document.getElementById('ci-t');
  const goBtn    = document.getElementById('calcGo');
  if (!goBtn) return;

  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      n0Input.value = btn.dataset.n;
      hlInput.value = btn.dataset.h;
      tInput.value  = btn.dataset.t;
      runCalc();
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
        document.getElementById(id).textContent = '—';
      });
      return;
    }

    const halflives = T / HL;
    const remaining = N0 * Math.pow(0.5, halflives);
    const pct = (remaining / N0) * 100;
    const decayed = N0 - remaining;

    document.getElementById('cr-remaining').textContent = fmt(remaining);
    document.getElementById('cr-pct').textContent = pct.toFixed(2) + '%';
    document.getElementById('cr-halflives').textContent = halflives.toFixed(3);
    document.getElementById('cr-decayed').textContent = fmt(decayed);

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
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const maxT = Math.max(T * 1.25, HL * 4);
  const pad = { l:54, r:24, t:20, b:44 };
  const cx = (t) => pad.l + (t / maxT) * (W - pad.l - pad.r);
  const cy = (n) => pad.t + (1 - n / N0) * (H - pad.t - pad.b);

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(2,5,9,0.8)';
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.lineWidth = 1;
  [0.25, 0.5, 0.75, 1.0].forEach(f => {
    const y = cy(f * N0);
    ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W-pad.r, y); ctx.stroke();
  });

  let numHL = Math.floor(maxT / HL);
  for (let i = 1; i <= numHL; i++) {
    const x = cx(i * HL);
    if (x > W-pad.r) break;
    ctx.strokeStyle = 'rgba(240,180,41,0.12)';
    ctx.beginPath(); ctx.moveTo(x, pad.t); ctx.lineTo(x, H-pad.b); ctx.stroke();
    ctx.fillStyle = 'rgba(240,180,41,0.35)';
    ctx.font = '9px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`t½×${i}`, x, pad.t-4);
  }

  ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, H-pad.b); ctx.lineTo(W-pad.r, H-pad.b); ctx.stroke();

  ctx.fillStyle = 'rgba(139,157,199,0.6)'; ctx.font = '10px JetBrains Mono, monospace'; ctx.textAlign = 'right';
  [0.25, 0.5, 0.75, 1.0].forEach(f => { ctx.fillText(fmt(f * N0), pad.l-6, cy(f * N0)+4); });

  const grad = ctx.createLinearGradient(0, pad.t, 0, H-pad.b);
  grad.addColorStop(0, 'rgba(6,182,212,0.22)');
  grad.addColorStop(1, 'rgba(6,182,212,0.02)');
  ctx.beginPath();
  const steps = 200;
  for (let i = 0; i <= steps; i++) {
    const ti = (i / steps) * maxT;
    const ni = N0 * Math.pow(0.5, ti / HL);
    i === 0 ? ctx.moveTo(cx(ti), cy(ni)) : ctx.lineTo(cx(ti), cy(ni));
  }
  ctx.lineTo(cx(maxT), H-pad.b); ctx.lineTo(cx(0), H-pad.b); ctx.closePath();
  ctx.fillStyle = grad; ctx.fill();

  ctx.beginPath(); ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 2.5;
  for (let i = 0; i <= steps; i++) {
    const ti = (i / steps) * maxT;
    const ni = N0 * Math.pow(0.5, ti / HL);
    i === 0 ? ctx.moveTo(cx(ti), cy(ni)) : ctx.lineTo(cx(ti), cy(ni));
  }
  ctx.stroke();

  const rem = N0 * Math.pow(0.5, T / HL);
  const markerX = cx(T); const markerY = cy(rem);
  ctx.strokeStyle = 'rgba(240,180,41,0.3)'; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
  ctx.beginPath(); ctx.moveTo(markerX, markerY); ctx.lineTo(markerX, H-pad.b); ctx.stroke();
  ctx.moveTo(pad.l, markerY); ctx.lineTo(markerX, markerY); ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath(); ctx.arc(markerX, markerY, 5, 0, Math.PI*2);
  ctx.fillStyle = '#f0b429'; ctx.fill();

  const pct = (rem / N0 * 100).toFixed(1);
  const label = `${fmt(rem)} g (${pct}%)`;
  const lx = markerX + 12 > W - 120 ? markerX - 120 : markerX + 12;
  ctx.fillStyle = 'rgba(15,26,46,0.9)'; ctx.strokeStyle = 'rgba(240,180,41,0.4)'; ctx.lineWidth = 1;
  const lw = ctx.measureText(label).width + 16;
  ctx.beginPath(); ctx.roundRect(lx - 4, markerY - 16, lw, 22, 4); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#fcd34d'; ctx.font = 'bold 10px JetBrains Mono, monospace';
  ctx.textAlign = 'left'; ctx.fillText(label, lx + 4, markerY - 1);
}

function buildDecayTable(N0, HL, totalHL) {
  const container = document.getElementById('decayTable');
  if (!container) return;
  const rows = Math.min(Math.ceil(totalHL) + 3, 12);
  let html = '<table><thead><tr><th>Half-Lives (n)</th><th>Time (years)</th><th>Remaining (g)</th><th>% Remaining</th></tr></thead><tbody>';
  for (let i = 0; i <= rows; i++) {
    const t = i * HL;
    const n = N0 * Math.pow(0.5, i);
    const pct = (n / N0 * 100).toFixed(2);
    const isCurrent = i === Math.round(totalHL);
    const style = isCurrent ? ' style="background:rgba(240,180,41,0.07);color:#fcd34d"' : '';
    html += `<tr${style}><td>${i}</td><td>${fmt(t)}</td><td>${fmt(n)}</td><td>${pct}%</td></tr>`;
  }
  html += '</tbody></table>';
  container.innerHTML = html;
}


/* ── SCROLL ANIMATIONS ───────────────────────────────────── */
(function initScrollAnim() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity = '1';
        e.target.style.transform = 'translateY(0)';
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  function observeChildren(page) {
    page.querySelectorAll('.card, .hub-card, .dt-card, .cit-card, .syn-row, .mt-btn, .tlh-node').forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      obs.observe(el);
    });
  }

  document.querySelectorAll('.sn-item[data-page]').forEach(a => {
    a.addEventListener('click', () => {
      const id = a.dataset.page;
      setTimeout(() => {
        const page = document.getElementById('page-' + id);
        if (page) observeChildren(page);
      }, 100);
    });
  });

  setTimeout(() => {
    const home = document.getElementById('page-home');
    if (home) observeChildren(home);
  }, 200);
})();
