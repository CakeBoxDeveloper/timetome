'use strict';

/* ══════════════════════════════════════════════
   CERT CAROUSEL — exact ClassicClub pattern, no tilt
══════════════════════════════════════════════ */
(function () {
  const container = document.getElementById('certCarousel');
  const slides    = Array.from(document.querySelectorAll('.cert-slide'));
  const dotsEl    = document.getElementById('certDots');
  if (!container || !slides.length) return;

  let activeIndex = 0;

  /* Build dots */
  let dots = [];
  if (dotsEl) {
    dots = slides.map((_, i) => {
      const d = document.createElement('span');
      d.className = 'snap-dot' + (i === 0 ? ' is-active' : '');
      d.addEventListener('click', () => { activeIndex = i; update(); });
      dotsEl.appendChild(d);
      return d;
    });
  }

  function update() {
    slides.forEach((slide, i) => {
      let diff = i - activeIndex;
      if (diff >  slides.length / 2) diff -= slides.length;
      if (diff < -slides.length / 2) diff += slides.length;

      if      (diff ===  0) slide.setAttribute('data-position', '0');
      else if (diff ===  1) slide.setAttribute('data-position', '1');
      else if (diff === -1) slide.setAttribute('data-position', '-1');
      else                  slide.setAttribute('data-position', 'hide');
    });
    dots.forEach((d, i) => d.classList.toggle('is-active', i === activeIndex));
  }

  /* Click any slide */
  slides.forEach((slide, i) => {
    slide.addEventListener('click', () => { activeIndex = i; update(); });
  });

  /* Touch swipe */
  let touchStart = 0, touchTime = 0;
  container.addEventListener('touchstart', e => {
    touchStart = e.touches[0].clientX;
    touchTime  = Date.now();
  }, { passive: true });
  container.addEventListener('touchend', e => {
    const dx = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 50 && Date.now() - touchTime < 500) {
      activeIndex = (activeIndex + (dx > 0 ? 1 : -1) + slides.length) % slides.length;
      update();
    }
  }, { passive: true });

  /* Mouse drag */
  let mStart = 0, dragging = false;
  container.addEventListener('mousedown',  e => { dragging = true; mStart = e.clientX; });
  container.addEventListener('mouseup',    e => {
    if (!dragging) return; dragging = false;
    const dx = mStart - e.clientX;
    if (Math.abs(dx) > 60) {
      activeIndex = (activeIndex + (dx > 0 ? 1 : -1) + slides.length) % slides.length;
      update();
    }
  });
  container.addEventListener('mouseleave', () => { dragging = false; });

  update();
})();

/* ══════════════════════════════════════
   SERVICES SNAP DOTS
══════════════════════════════════════ */
(function () {
  function initSnapDots(trackId, dotsId) {
    const track  = document.getElementById(trackId);
    const dotsEl = document.getElementById(dotsId);
    if (!track || !dotsEl) return;
    const inner = track.querySelector('.snap-inner');
    if (!inner) return;
    const cards = Array.from(inner.children);
    dotsEl.innerHTML = '';
    const dots = cards.map((card, i) => {
      const d = document.createElement('span');
      d.className = 'snap-dot' + (i === 0 ? ' is-active' : '');
      d.addEventListener('click', () => {
        track.scrollTo({ left: card.offsetLeft - (track.clientWidth - card.offsetWidth) / 2, behavior: 'smooth' });
      });
      dotsEl.appendChild(d);
      return d;
    });
    let raf;
    track.addEventListener('scroll', () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const center = track.scrollLeft + track.clientWidth / 2;
        let closest = 0, minDist = Infinity;
        cards.forEach((card, i) => {
          const d = Math.abs(center - (card.offsetLeft + card.offsetWidth / 2));
          if (d < minDist) { minDist = d; closest = i; }
        });
        dots.forEach((d, i) => d.classList.toggle('is-active', i === closest));
      });
    }, { passive: true });
    requestAnimationFrame(() => {
      track.scrollTo({ left: cards[0].offsetLeft - (track.clientWidth - cards[0].offsetWidth) / 2, behavior: 'instant' });
    });
  }
  initSnapDots('servicesTrack', 'servicesDots');
})();

/* ══════════════════════════════════════
   SCRATCH CARD
══════════════════════════════════════ */
(function () {
  const canvas = document.getElementById('scratchCanvas');
  const valEl  = document.getElementById('lotValue');
  if (!canvas) return;

  const prizes = ['−5%', '−10%', '−15%', '−7%', '−20%', '−10%', '−5%', '−10%'];
  if (valEl) valEl.textContent = prizes[Math.floor(Math.random() * prizes.length)];

  const ctx = canvas.getContext('2d');
  let drawing = false, done = false, total = 1;

  /* ── Fingerprint-like pattern ── */
  function drawLayer() {
    const W = canvas.width, H = canvas.height;
    ctx.fillStyle = '#9a9aaa';
    ctx.fillRect(0, 0, W, H);

    /* Concentric arc "fingerprint" lines */
    ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    ctx.lineWidth = 1;
    const cx = W * 0.5, cy = H * 0.5;
    const steps = 14;
    for (let i = 1; i <= steps; i++) {
      const r = (i / steps) * Math.max(W, H) * 0.7;
      /* Slightly deform each arc for organic feel */
      ctx.beginPath();
      for (let a = 0; a <= Math.PI * 2; a += 0.06) {
        const wobble = 1 + 0.04 * Math.sin(a * 6 + i * 1.3);
        const x = cx + Math.cos(a) * r * wobble;
        const y = cy + Math.sin(a) * r * wobble * 0.55; /* flatten vertically */
        a === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    }

    /* Extra fine horizontal ridges */
    ctx.strokeStyle = 'rgba(255,255,255,0.10)';
    ctx.lineWidth = 0.5;
    for (let y = 2; y < H; y += 4) {
      ctx.beginPath();
      ctx.moveTo(0, y + Math.sin(y * 0.4) * 1.5);
      for (let x = 0; x <= W; x += 3) {
        ctx.lineTo(x, y + Math.sin(y * 0.4 + x * 0.05) * 1.5);
      }
      ctx.stroke();
    }
  }

  function resize() {
    const r = canvas.getBoundingClientRect();
    if (!r.width || !r.height) return;
    canvas.width  = r.width;
    canvas.height = r.height;
    if (!done) drawLayer();
    total = canvas.width * canvas.height || 1;
  }

  /* ── Uneven brush: multiple overlapping ellipses ── */
  function erase(x, y) {
    if (done) return;
    ctx.globalCompositeOperation = 'destination-out';

    /* Main blob */
    const rx = 18 + Math.random() * 10;
    const ry = 10 + Math.random() * 8;
    const rot = Math.random() * Math.PI;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
    ctx.fill();

    /* 2–3 satellite blobs for rough/irregular edge */
    const n = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < n; i++) {
      const ox = x + (Math.random() - 0.5) * 22;
      const oy = y + (Math.random() - 0.5) * 14;
      const sr = 6 + Math.random() * 8;
      ctx.beginPath();
      ctx.arc(ox, oy, sr, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalCompositeOperation = 'source-over';

    if (Math.random() < 0.08) checkDone();
  }

  function checkDone() {
    const d = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let t = 0;
    for (let i = 3; i < d.length; i += 4) if (d[i] < 128) t++;
    if (t / total > 0.55) {
      done = true;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.style.pointerEvents = 'none';
    }
  }

  function pos(e) {
    const r = canvas.getBoundingClientRect();
    const s = e.touches ? e.touches[0] : e;
    return [s.clientX - r.left, s.clientY - r.top];
  }

  canvas.addEventListener('mousedown',  e => { drawing = true;  erase(...pos(e)); });
  canvas.addEventListener('mousemove',  e => { if (drawing) erase(...pos(e)); });
  canvas.addEventListener('mouseup',    () => drawing = false);
  canvas.addEventListener('mouseleave', () => drawing = false);
  canvas.addEventListener('touchstart', e => { e.preventDefault(); drawing = true;  erase(...pos(e)); }, { passive: false });
  canvas.addEventListener('touchmove',  e => { e.preventDefault(); if (drawing) erase(...pos(e)); }, { passive: false });
  canvas.addEventListener('touchend',   () => drawing = false);

  if (document.readyState === 'complete') setTimeout(resize, 100);
  else window.addEventListener('load', () => setTimeout(resize, 100));
  window.addEventListener('resize', () => { if (!done) resize(); });
})();

/* ══════════════════════════════════════
   FLOATING CTA
══════════════════════════════════════ */
(function () {
  const floatCta = document.getElementById('floatCta');
  if (!floatCta) return;
  function update() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    floatCta.classList.toggle('is-visible', window.scrollY > hero.offsetHeight * 0.6);
  }
  window.addEventListener('scroll', update, { passive: true });
  update();
})();

/* All booking buttons → Telegram */
document.querySelectorAll('.cert-buy-btn, .svc-book-btn').forEach(btn => {
  btn.addEventListener('click', () => window.open('https://t.me/pro_telo_niko', '_blank', 'noopener'));
});
