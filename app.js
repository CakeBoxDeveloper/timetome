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

  function update(animate = true) {
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

    if (!animate) {
      // Pause tilt on all slides during transition
      slides.forEach(s => s.classList.add('no-tilt'));
      // Re-enable after transition completes (600ms matches CSS transition duration)
      setTimeout(() => slides.forEach(s => s.classList.remove('no-tilt')), 650);
    }
  }

  /* Click any slide */
  slides.forEach((slide, i) => {
    slide.addEventListener('click', () => { activeIndex = i; update(true); });
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
      update(false);
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
      update(false);
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
  const canvas   = document.getElementById('scratchCanvas');
  const valEl    = document.getElementById('lotValue');
  const disclaimer = document.getElementById('lotDisclaimer');
  if (!canvas) return;

  const STORAGE_KEY = 'ttm_scratch_date';
  const today = new Date().toISOString().slice(0, 10);
  const lastPlayed = localStorage.getItem(STORAGE_KEY);
  const alreadyPlayed = lastPlayed === today;

  const prizes = ['−5%', '−10%', '−15%', '−7%', '−20%', '−10%', '−5%', '−10%'];
  if (valEl) valEl.textContent = prizes[Math.floor(Math.random() * prizes.length)];

  // Generate discount ID: TTM + encoded date + random suffix
  function genDiscountId() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const prefix = 'TTM';
    // Encode today as base32-like: month+day
    const d = new Date();
    const datePart = (d.getMonth() + 1).toString(16).toUpperCase().padStart(1,'0') +
                     d.getDate().toString(16).toUpperCase().padStart(2,'0');
    let rand = '';
    for (let i = 0; i < 9; i++) rand += chars[Math.floor(Math.random() * chars.length)];
    return prefix + datePart + rand; // e.g. TTM-A1F-XKQM3V2PJ → 16 chars total
  }
  const discountId = genDiscountId();
  let idShown = false;

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
    // Make prize visible only after canvas is drawn
    const prize = document.getElementById('lotPrize');
    if (prize) prize.style.visibility = 'visible';
  }

  /* ── Uneven brush: smaller, more natural ── */
  function erase(x, y) {
    if (done) return;
    ctx.globalCompositeOperation = 'destination-out';

    /* Main blob — smaller */
    const rx = 8 + Math.random() * 6;
    const ry = 5 + Math.random() * 4;
    const rot = Math.random() * Math.PI;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
    ctx.fill();

    /* 1–2 small satellite blobs */
    const n = 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < n; i++) {
      const ox = x + (Math.random() - 0.5) * 14;
      const oy = y + (Math.random() - 0.5) * 8;
      const sr = 2 + Math.random() * 5;
      ctx.beginPath();
      ctx.arc(ox, oy, sr, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalCompositeOperation = 'source-over';

    // Check if 50%+ scratched — show discount ID
    if (!idShown && disclaimer) {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let transparent = 0;
      for (let i = 3; i < imgData.data.length; i += 4) {
        if (imgData.data[i] < 128) transparent++;
      }
      const pct = transparent / (canvas.width * canvas.height);
      if (pct > 0.5) {
        idShown = true;
        disclaimer.textContent = 'ID знижки: ' + discountId;
        disclaimer.style.fontWeight = '700';
        disclaimer.style.color = '#c0234e';
        disclaimer.style.letterSpacing = '0.08em';
      }
    }
  }

  function pos(e, src) {
    const r = canvas.getBoundingClientRect();
    const s = e.touches ? e.touches[0] : e;
    return [s.clientX - r.left, s.clientY - r.top];
  }

  /* ── pointer events on document so stroke continues outside canvas ── */
  canvas.addEventListener('mousedown', e => {
    if (alreadyPlayed) return;
    drawing = true; erase(...pos(e));
    localStorage.setItem(STORAGE_KEY, today);
  });
  canvas.addEventListener('touchstart', e => {
    if (alreadyPlayed) return;
    e.preventDefault(); drawing = true; erase(...pos(e));
    localStorage.setItem(STORAGE_KEY, today);
  }, { passive: false });

  document.addEventListener('mousemove', e => { if (drawing) erase(...pos(e)); });
  document.addEventListener('touchmove', e => {
    if (!drawing) return;
    e.preventDefault();
    erase(...pos(e));
  }, { passive: false });

  document.addEventListener('mouseup',  () => drawing = false);
  document.addEventListener('touchend', () => drawing = false);

  function applyAlreadyPlayed() {
    if (disclaimer) {
      disclaimer.textContent = 'Ви вже спробували сьогодні. Повертайтесь завтра.';
      disclaimer.style.color = '#c0234e';
      disclaimer.style.fontWeight = '600';
    }
  }

  if (alreadyPlayed) applyAlreadyPlayed();

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

/* ══════════════════════════════════════
   HERO MODEL — snap-back disabled (idle animation handles orbit)
══════════════════════════════════════ */
