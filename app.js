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

  function resize() {
    const r = canvas.getBoundingClientRect();
    if (!r.width || !r.height) return;
    canvas.width  = r.width;
    canvas.height = r.height;
    if (!done) drawLayer();
    total = canvas.width * canvas.height || 1;
  }

  function drawLayer() {
    /* Grey scratch surface */
    ctx.fillStyle = '#b0b0b8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    /* Subtle texture lines */
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    for (let x = -canvas.height; x < canvas.width + canvas.height; x += 14) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + canvas.height, canvas.height); ctx.stroke();
    }
    /* Hint text */
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = `bold ${Math.max(12, canvas.height * 0.22)}px Manrope, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ЗІТРИ', canvas.width / 2, canvas.height / 2);
  }

  function erase(x, y) {
    if (done) return;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, Math.max(18, canvas.height * 0.25), 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    if (Math.random() < 0.1) {
      const d = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let t = 0;
      for (let i = 3; i < d.length; i += 4) if (d[i] < 128) t++;
      if (t / total > 0.55) {
        done = true;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.style.pointerEvents = 'none';
      }
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

  /* Init after layout */
  if (document.readyState === 'complete') { setTimeout(resize, 100); }
  else { window.addEventListener('load', () => setTimeout(resize, 100)); }
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
