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
   CERT CAROUSEL — single card flip
══════════════════════════════════════════════ */
(function () {
  const flipWrap = document.getElementById('certFlipWrap');
  const mv       = document.getElementById('certModelViewer');
  const giftBlock = document.getElementById('certGiftBlock');
  const priceEl   = document.getElementById('certPrice');
  const buyBtn    = document.getElementById('certBuyBtn');
  const tabsEl    = document.getElementById('certTabs');
  if (!mv) return;

  let activeIndex = 0;
  let flipping = false;

  // Cert data
  const certData = [
    {
      price: '2 500 ₴', bg: '#7d5c5b', fg: '#f5d9d5', border: '#d4a9a6',
      name: 'Какао',
      src: 'https://raw.githubusercontent.com/CakeBoxDeveloper/timetome/main/Choco.glb',
      desc: 'М\'який старт — зняти напругу, відпочити та відчути перші результати від комплексного догляду.',
      rows: [
        ['1', 'Aroma Relax + терапія червоним світлом',        '90 хв', '900 ₴'],
        ['2', 'Масаж голови + дарсонваль з насадкою-гребінцем','60 хв', '750 ₴'],
        ['3', 'Масаж ніг + масаж стоп з гарячими камінням',   '75 хв', '850 ₴'],
      ],
    },
    {
      price: '5 000 ₴', bg: '#383f0c', fg: '#c4d18b', border: '#8fa055',
      name: 'Матча',
      src: 'https://raw.githubusercontent.com/CakeBoxDeveloper/timetome/main/Matcha.glb',
      desc: 'Повноцінний курс для тіла — відновлення м\'язів, зняття хронічної втоми та покращення кровообігу.',
      rows: [
        ['1', 'Загальний класичний масаж + масаж голови',      '90 хв', '1 100 ₴'],
        ['2', 'Масаж спини + терапія червоним світлом',        '75 хв', '1 150 ₴'],
        ['3', 'Масаж спини + баночний масаж',                  '75 хв', '1 200 ₴'],
        ['4', 'Масаж ніг + масаж стоп з гарячими камінням',   '75 хв',   '850 ₴'],
      ],
    },
    {
      price: '7 500 ₴', bg: '#780115', fg: '#f7b638', border: '#c88020',
      name: 'Бамбл',
      src: 'https://raw.githubusercontent.com/CakeBoxDeveloper/timetome/main/Mustadr.glb',
      desc: 'Глибока робота з тілом — вогняне відновлення, стоун і сухі голки для тих, хто хоче відчути реальний результат.',
      rows: [
        ['1', 'Вогняне відновлення',                           '90 хв', '1 500 ₴'],
        ['2', 'Загальний масаж + масаж голови',                '90 хв', '1 100 ₴'],
        ['3', 'Stone Massage всього тіла',                     '90 хв', '1 800 ₴'],
        ['4', 'Масаж спини + сухі голки',                     '75 хв', '1 350 ₴'],
        ['5', 'Aroma Relax + терапія червоним світлом',        '90 хв',   '900 ₴'],
      ],
    },
    {
      price: '9 000 ₴', bg: '#3730a2', fg: '#c8bbe7', border: '#8a7fc4',
      name: 'Айс-латте',
      src: 'https://raw.githubusercontent.com/CakeBoxDeveloper/timetome/main/Blue.glb',
      desc: 'Максимальна програма відновлення — від вогняного масажу до стретчингу та аромарелаксу.',
      rows: [
        ['1', 'Вогняне відновлення',                           '90 хв', '1 500 ₴'],
        ['2', 'Загальний масаж + масаж голови',                '90 хв', '1 100 ₴'],
        ['3', 'Stone Massage всього тіла',                     '90 хв', '1 800 ₴'],
        ['4', 'Stretch Release Massage',                       '75 хв', '1 200 ₴'],
        ['5', 'Масаж спини + баночний масаж',                  '75 хв', '1 200 ₴'],
        ['6', 'Aroma Relax + терапія червоним світлом',        '90 хв',   '900 ₴'],
      ],
    },
  ];

  const tabs      = tabsEl ? Array.from(tabsEl.querySelectorAll('.cert-tab')) : [];
  const nameEl    = document.getElementById('certName');
  const descEl    = document.getElementById('certDesc');
  const tableBody = document.getElementById('certTableBody');
  const toggle    = document.getElementById('certProgramToggle');
  const tableWrap = document.getElementById('certProgramTable');

  if (toggle && tableWrap) {
    toggle.addEventListener('click', () => {
      const open = tableWrap.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  function applyData(i) {
    const d = certData[i];
    // gift-block always flat top
    if (giftBlock) giftBlock.style.borderRadius = '0 0 var(--r) var(--r)';
    // Update glow color
    if (window.setCertGlowColor) window.setCertGlowColor(d.bg, d.fg);
    // Model
    mv.setAttribute('src', d.src);
    // Info block
    if (giftBlock) {
      giftBlock.style.background  = d.bg;
      giftBlock.style.borderColor = d.bg;
      giftBlock.style.color       = d.fg;
    }
    if (nameEl)  nameEl.textContent  = d.name;
    if (descEl)  descEl.textContent  = d.desc;
    if (priceEl) priceEl.textContent = d.price;
    if (buyBtn) {
      buyBtn.style.background    = d.fg;
      buyBtn.style.color         = d.bg;
    }
    if (tableBody) {
      tableBody.innerHTML = d.rows.map(([day, proc, time, sum]) =>
        `<tr><td>${day}</td><td>${proc}</td><td>${time}</td><td>${sum}</td></tr>`
      ).join('');
    }
    // Tabs
    tabs.forEach((t, ti) => {
      t.classList.toggle('is-active', ti === i);
      t.style.background = ti === i ? d.bg : 'rgba(255,255,255,0.08)';
      t.style.color      = ti === i ? d.fg : 'rgba(255,255,255,0.45)';
      if (ti === i) t.style.setProperty('--active-bg', d.bg);
    });
  }

  function switchTo(i) {
    if (i === activeIndex || flipping) return;
    flipping = true;

    if (tableWrap && tableWrap.classList.contains('is-open')) {
      tableWrap.classList.remove('is-open');
      toggle?.setAttribute('aria-expanded', 'false');
    }

    // Phase 1: flip out
    flipWrap.classList.add('is-flipping-out');

    // Swap exactly at scaleX=0 (halfway = duration/2)
    setTimeout(() => {
      activeIndex = i;
      applyData(i);
    }, 75); // half of 150ms

    // Phase 2: flip in — start after full out
    setTimeout(() => {
      flipWrap.classList.remove('is-flipping-out');
      flipWrap.classList.add('is-flipping-in');
      setTimeout(() => {
        flipWrap.classList.remove('is-flipping-in');
        flipping = false;
      }, 150);
    }, 150);
  }

  // Prefetch all GLBs into browser cache
  ['Choco','Matcha','Mustadr','Blue'].forEach(name => {
    fetch(`https://raw.githubusercontent.com/CakeBoxDeveloper/timetome/main/${name}.glb`)
      .catch(() => {});
  });

  // Tab clicks
  tabs.forEach((tab, i) => tab.addEventListener('click', () => switchTo(i)));

  // Init
  applyData(0);
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
