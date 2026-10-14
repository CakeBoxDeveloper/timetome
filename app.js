'use strict';

/* ══════════════════════════════════════
   LOADER + PROGRESS BAR
══════════════════════════════════════ */
(function () {
  const loader = document.getElementById('siteLoader');
  const bar    = document.getElementById('loaderBar');
  if (!loader || !bar) return;

  const MIN_SHOW_MS = 900;
  const startTime   = Date.now();
  let   progress    = 0;
  let   pageReady   = false;

  function setProgress(target) {
    if (target <= progress) return;
    progress = target;
    bar.style.width = progress + '%';
  }

  let phase1Done = false, phase1Val = 0;
  function phase1() {
    phase1Val += 2.5;
    setProgress(phase1Val);
    if (phase1Val < 30) { setTimeout(phase1, 60); }
    else { phase1Done = true; phase2(); }
  }

  let phase2Val = 30;
  function phase2() {
    const step = Math.max(0.3, (80 - phase2Val) * 0.04);
    phase2Val += step;
    setProgress(phase2Val);
    if (phase2Val < 80 && !pageReady) { setTimeout(phase2, 120); }
    else if (pageReady) { finish(); }
    else { setTimeout(phase2, 120); }
  }

  function finish() {
    setProgress(100);
    const elapsed = Date.now() - startTime;
    const delay   = Math.max(0, MIN_SHOW_MS - elapsed) + 280;
    setTimeout(() => {
      loader.classList.add('is-hidden');
      setTimeout(() => { if (loader.parentNode) loader.parentNode.removeChild(loader); }, 600);
    }, delay);
  }

  function onPageLoad() {
    if (pageReady) return;
    pageReady = true;
    finish(); // always finish when page is ready, regardless of phase
  }

  if (document.readyState === 'complete') { onPageLoad(); }
  else { window.addEventListener('load', onPageLoad, { once: true }); }

  const mv = document.querySelector('.loader__model-wrap model-viewer');
  if (mv) { mv.addEventListener('load', () => setProgress(Math.max(progress, 70)), { once: true }); }

  phase1();
})();

/* ══════════════════════════════════════════════
   CERT CAROUSEL — ClassicClub pattern
══════════════════════════════════════════════ */
(function () {
  const container = document.getElementById('certCarousel');
  const slides    = Array.from(document.querySelectorAll('.cert-slide'));
  const giftBlock = document.getElementById('certGiftBlock');
  const priceEl   = document.getElementById('certPrice');
  const buyBtn    = document.getElementById('certBuyBtn');
  if (!container || !slides.length) return;

  let activeIndex = 0;

  function updateGiftBlock() {
    const slide = slides[activeIndex];
    const price = slide.dataset.price || '—';
    const hue   = slide.dataset.hue   || '0';
    const bg    = `hsl(${hue}deg 25% 22%)`;
    const border= `hsl(${hue}deg 30% 35% / 0.6)`;
    const btn   = `hsl(${hue}deg 55% 45%)`;

    if (giftBlock) {
      giftBlock.style.background   = bg;
      giftBlock.style.borderColor  = border;
    }
    if (priceEl) priceEl.textContent = price;
    if (buyBtn)  buyBtn.style.background = btn;
  }

  function update() {
    slides.forEach((slide, i) => {
      let diff = i - activeIndex;
      if (diff >  slides.length / 2) diff -= slides.length;
      if (diff < -slides.length / 2) diff += slides.length;
      const pos = diff === 0 ? '0' : diff === 1 ? '1' : diff === -1 ? '-1' : 'hide';
      slide.setAttribute('data-position', pos);
    });
    updateGiftBlock();
  }

  slides.forEach((slide, i) => {
    slide.addEventListener('click', () => { activeIndex = i; update(); });
  });

  let touchStart = 0, touchTime = 0;
  container.addEventListener('touchstart', e => {
    touchStart = e.touches[0].clientX;
    touchTime = Date.now();
  }, { passive: true });
  container.addEventListener('touchend', e => {
    const dx = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 50 && Date.now() - touchTime < 500) {
      activeIndex = (activeIndex + (dx > 0 ? 1 : -1) + slides.length) % slides.length;
      update();
    }
  }, { passive: true });

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
   LOTTERY — tilt + shimmer border + scratch + bot code
══════════════════════════════════════ */
(function () {

  /* ── Canvas shimmer border ── */
  (function shimmerBorder() {
    const wrap   = document.getElementById('lotTiltWrap');
    const canvas = document.getElementById('lotShimmerCanvas');
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext('2d');
    let shimmerT = 0;
    const SPEED = 0.04; // ~25s full cycle
    const R = 16;

    function shimmerPoint(rect, t) {
      const { x, y, w, h, r } = rect;
      const sTop = w-2*r, sRight = h-2*r, sBot = w-2*r, sLeft = h-2*r;
      const arc = (Math.PI/2)*r;
      const total = sTop+arc+sRight+arc+sBot+arc+sLeft+arc;
      let dist = (((t%1)+1)%1)*total;
      let seg;
      seg=arc;    if(dist<seg){const a=Math.PI+(dist/seg)*(Math.PI/2); return{x:x+r+r*Math.cos(a),y:y+r+r*Math.sin(a)};} dist-=seg;
      seg=sTop;   if(dist<seg) return{x:x+r+dist,y};                                                                      dist-=seg;
      seg=arc;    if(dist<seg){const a=-Math.PI/2+(dist/seg)*(Math.PI/2); return{x:x+w-r+r*Math.cos(a),y:y+r+r*Math.sin(a)};} dist-=seg;
      seg=sRight; if(dist<seg) return{x:x+w,y:y+r+dist};                                                                  dist-=seg;
      seg=arc;    if(dist<seg){const a=(dist/seg)*(Math.PI/2); return{x:x+w-r+r*Math.cos(a),y:y+h-r+r*Math.sin(a)};}     dist-=seg;
      seg=sBot;   if(dist<seg) return{x:x+w-r-dist,y:y+h};                                                                dist-=seg;
      seg=arc;    if(dist<seg){const a=Math.PI/2+(dist/seg)*(Math.PI/2); return{x:x+r+r*Math.cos(a),y:y+h-r+r*Math.sin(a)};} dist-=seg;
      return{x,y:y+h-r-dist};
    }

    function rr(c, x, y, w, h, r) {
      c.beginPath();
      c.moveTo(x+r,y); c.lineTo(x+w-r,y); c.quadraticCurveTo(x+w,y,x+w,y+r);
      c.lineTo(x+w,y+h-r); c.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
      c.lineTo(x+r,y+h); c.quadraticCurveTo(x,y+h,x,y+h-r);
      c.lineTo(x,y+r); c.quadraticCurveTo(x,y,x+r,y); c.closePath();
    }

    let last = 0;
    function draw(ts) {
      const delta = Math.min((ts-last)/1000, 0.05); last = ts;
      shimmerT = (shimmerT + delta*SPEED) % 1;

      const cw = canvas.offsetWidth, ch = canvas.offsetHeight;
      if (!cw || !ch) { requestAnimationFrame(draw); return; }
      if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch; }
      ctx.clearRect(0, 0, cw, ch);

      const pad = 0;
      const rect = { x:pad, y:pad, w:cw-pad*2, h:ch-pad*2, r:R };

      // Static base border — gold
      ctx.strokeStyle = 'rgba(200,160,0,0.35)';
      ctx.lineWidth = 1.5;
      rr(ctx, rect.x, rect.y, rect.w, rect.h, rect.r);
      ctx.stroke();

      // Animated shimmer streak — bright yellow
      const gLen = 0.20;
      const pt1 = shimmerPoint(rect, ((shimmerT - gLen/2)+1)%1);
      const pt2 = shimmerPoint(rect, (shimmerT + gLen/2)%1);
      const grd = ctx.createLinearGradient(pt1.x, pt1.y, pt2.x, pt2.y);
      grd.addColorStop(0,    'rgba(255,210,0,0.00)');
      grd.addColorStop(0.25, 'rgba(255,220,0,0.70)');
      grd.addColorStop(0.5,  'rgba(255,245,80,1.00)');
      grd.addColorStop(0.75, 'rgba(255,220,0,0.70)');
      grd.addColorStop(1,    'rgba(255,210,0,0.00)');
      ctx.strokeStyle = grd;
      ctx.lineWidth   = 2.8;
      rr(ctx, rect.x, rect.y, rect.w, rect.h, rect.r);
      ctx.stroke();

      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  })();

  /* ── Tilt ── */
  (function tilt() {
    const wrap = document.getElementById('lotTiltWrap');
    if (!wrap) return;
    // Passive idle sway: CSS animation handles it, no mouse tracking
    wrap.style.animation = 'lotSway 4s ease-in-out infinite';
  })();

  /* ── Scratch card ── */
  const canvas     = document.getElementById('scratchCanvas');
  const valEl      = document.getElementById('lotValue');
  const botAction  = document.getElementById('lotBotAction');
  if (!canvas) return;

  const STORAGE_KEY   = 'ttm_scratch_date';
  const today         = new Date().toISOString().slice(0, 10);
  const alreadyPlayed = localStorage.getItem(STORAGE_KEY) === today;

  // Bot-verifiable code: TTM + day_hex2 + mon_hex2 + checksum + rand5
  const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  function genCode() {
    const d = new Date();
    const day = d.getDate(), mon = d.getMonth() + 1;
    const chk = CHARS[(day ^ mon ^ 0x5A) % 32];
    let rand = '';
    for (let i = 0; i < 5; i++) rand += CHARS[Math.floor(Math.random() * 32)];
    return 'TTM' + day.toString(16).toUpperCase().padStart(2,'0') +
                   mon.toString(16).toUpperCase().padStart(2,'0') + chk + rand;
  }
  const botCode = genCode();

  if (valEl) {
    valEl.textContent         = botCode;
    valEl.style.fontFamily    = 'monospace';
    valEl.style.fontSize      = 'clamp(14px, 4vw, 18px)';
    valEl.style.fontWeight    = '700';
    valEl.style.letterSpacing = '0.10em';
    valEl.style.color         = '#7a4e00';
  }

  const ctx = canvas.getContext('2d');
  let drawing = false, revealed = false;

  function drawLayer() {
    const W = canvas.width, H = canvas.height;
    ctx.fillStyle = '#9a9aaa';
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    ctx.lineWidth = 1;
    const cx2 = W*0.5, cy2 = H*0.5;
    for (let i = 1; i <= 14; i++) {
      const r = (i/14)*Math.max(W,H)*0.7;
      ctx.beginPath();
      for (let a = 0; a <= Math.PI*2; a += 0.06) {
        const wb = 1 + 0.04*Math.sin(a*6+i*1.3);
        const x = cx2 + Math.cos(a)*r*wb, y = cy2 + Math.sin(a)*r*wb*0.55;
        a === 0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
      }
      ctx.closePath(); ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.10)'; ctx.lineWidth = 0.5;
    for (let y = 2; y < H; y += 4) {
      ctx.beginPath(); ctx.moveTo(0, y+Math.sin(y*0.4)*1.5);
      for (let x = 0; x <= W; x += 3) ctx.lineTo(x, y+Math.sin(y*0.4+x*0.05)*1.5);
      ctx.stroke();
    }
  }

  function resize() {
    const r = canvas.getBoundingClientRect();
    if (!r.width || !r.height) return;
    canvas.width = r.width; canvas.height = r.height;
    if (!revealed) drawLayer();
    const prize = document.getElementById('lotPrize');
    if (prize) prize.style.visibility = 'visible';
  }

  function erase(x, y) {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.ellipse(x, y, 10+Math.random()*6, 6+Math.random()*4, Math.random()*Math.PI, 0, Math.PI*2);
    ctx.fill();
    for (let i = 0; i < 2; i++) {
      ctx.beginPath();
      ctx.arc(x+(Math.random()-0.5)*14, y+(Math.random()-0.5)*8, 2+Math.random()*5, 0, Math.PI*2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
    checkReveal();
  }

  function checkReveal() {
    if (revealed) return;
    const d = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let t = 0;
    for (let i = 3; i < d.length; i += 4) if (d[i] < 128) t++;
    if (t / (canvas.width * canvas.height) > 0.65) { revealed = true; showBotLink(); }
  }

  function showBotLink() {
    if (!botAction) return;
    const botUsername = 'pro_telo_niko_bot';
    const url = `https://t.me/${botUsername}?start=${botCode}`;
    botAction.innerHTML =
      `<a href="${url}" target="_blank" rel="noopener" class="lot-bot-link">` +
      `<img src="https://www.svgrepo.com/show/388724/telegram.svg" alt="" style="width:18px;height:18px;filter:brightness(0) invert(1);flex-shrink:0;" />` +
      `Отримай бонус у боті</a>`;
  }

  function pos(e) {
    const r = canvas.getBoundingClientRect(), s = e.touches ? e.touches[0] : e;
    return [s.clientX - r.left, s.clientY - r.top];
  }

  canvas.addEventListener('mousedown', e => {
    if (alreadyPlayed) return; drawing = true; erase(...pos(e));
    localStorage.setItem(STORAGE_KEY, today);
  });
  canvas.addEventListener('touchstart', e => {
    if (alreadyPlayed) return; e.preventDefault(); drawing = true; erase(...pos(e));
    localStorage.setItem(STORAGE_KEY, today);
  }, { passive: false });
  document.addEventListener('mousemove', e => { if (drawing) erase(...pos(e)); });
  document.addEventListener('touchmove', e => { if (!drawing) return; e.preventDefault(); erase(...pos(e)); }, { passive: false });
  document.addEventListener('mouseup',  () => drawing = false);
  document.addEventListener('touchend', () => drawing = false);

  if (alreadyPlayed && botAction) {
    botAction.innerHTML = `<p style="font-size:clamp(9px,2.5vw,11px);color:rgba(200,134,10,0.85);text-align:center;line-height:1.4;font-weight:600;margin-top:6px;">Ви вже спробували сьогодні. Повертайтесь завтра.</p>`;
  }

  if (document.readyState === 'complete') setTimeout(resize, 100);
  else window.addEventListener('load', () => setTimeout(resize, 100));
  window.addEventListener('resize', () => { if (!revealed) resize(); });
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
   HERO MODEL — idle orbit animation
══════════════════════════════════════ */
