/* ══════════════════════════════════════════════
   CERT 3D CAROUSEL
   Web Animations API for smooth transitions +
   RAF loop for idle tilt on active slide.
══════════════════════════════════════════════ */

const CERTS = [
  { name: 'Chocolate', dur: '60 хв',  price: '2 500' },
  { name: 'Cranberry', dur: '90 хв',  price: '9 000' },
  { name: 'Matcha',    dur: '90 хв',  price: '5 000' },
  { name: 'Mustard',   dur: '120 хв', price: '7 500' },
];

/* Visual state for each carousel position */
const POS_STATES = {
  '0':    { tx: 0,    scale: 1.00, opacity: 1.00, blur: 0 },
  '1':    { tx: 58,   scale: 0.72, opacity: 0.45, blur: 4 },
  '-1':   { tx: -58,  scale: 0.72, opacity: 0.45, blur: 4 },
  'hide': { tx: 0,    scale: 0.50, opacity: 0.00, blur: 0 },
};

function stateToTransform(s) {
  return `translateX(${s.tx}%) scale(${s.scale}) rotateY(0deg) rotateX(0deg)`;
}

function applyStateInstant(slide, pos) {
  const s = POS_STATES[pos] || POS_STATES['hide'];
  slide.style.transform = stateToTransform(s);
  slide.style.opacity   = s.opacity;
  slide.style.filter    = s.blur > 0 ? `blur(${s.blur}px)` : 'none';
  slide.style.boxShadow = pos === '0'
    ? '0 20px 60px rgba(0,0,0,0.55), 0 0 36px rgba(77,140,255,0.25)'
    : '';
}

let certActive = 0;
let tiltRaf    = null;
let tiltT0     = null;
let isAnimating = false;

const carousel   = document.getElementById('certCarousel');
const certSlides = Array.from(document.querySelectorAll('.cert-slide'));
const certDotsEl = document.getElementById('certDots');

/* Dots */
let certDotEls = [];
if (certDotsEl) {
  certDotEls = CERTS.map((_, i) => {
    const d = document.createElement('span');
    d.className = 'snap-dot' + (i === 0 ? ' is-active' : '');
    d.addEventListener('click', () => setCertActive(i));
    certDotsEl.appendChild(d);
    return d;
  });
}

/* Idle tilt loop — only on the active slide */
function startTilt(slide) {
  stopTilt();
  tiltT0 = null;
  function loop(ts) {
    if (!tiltT0) tiltT0 = ts;
    const t = (ts - tiltT0) / 6000; // 6s period
    const ry = Math.sin(t * Math.PI * 2) * 7;
    const rx = Math.cos(t * Math.PI * 2) * 2.5;
    slide.style.transform = `translateX(0%) scale(1) rotateY(${ry}deg) rotateX(${rx}deg)`;
    tiltRaf = requestAnimationFrame(loop);
  }
  tiltRaf = requestAnimationFrame(loop);
}

function stopTilt() {
  if (tiltRaf) { cancelAnimationFrame(tiltRaf); tiltRaf = null; }
  tiltT0 = null;
}

function updateCarouselHeight() {
  const active = certSlides[certActive];
  if (!active || !carousel) return;
  const h = active.offsetHeight;
  if (h > 20) carousel.style.setProperty('--carousel-h', (h + 32) + 'px');
}

/* Main switch function */
function setCertActive(idx) {
  if (isAnimating) return;
  const count  = certSlides.length;
  const target = ((idx % count) + count) % count;
  if (target === certActive && tiltRaf) return;

  isAnimating = true;
  stopTilt();

  /* Cancel any running Web Animations */
  certSlides.forEach(s => s.getAnimations().forEach(a => a.cancel()));

  const DURATION = 480;
  const EASING   = 'cubic-bezier(0.4,0,0.2,1)';

  /* Compute old positions before updating certActive */
  const oldPositions = certSlides.map(slide => slide.dataset.pos || 'hide');

  certActive = target;
  certDotEls.forEach((d, i) => d.classList.toggle('is-active', i === certActive));

  /* Compute new positions */
  const newPositions = certSlides.map((_, i) => {
    const delta = ((i - certActive) % count + count) % count;
    if      (delta === 0)         return '0';
    else if (delta === 1)         return '1';
    else if (delta === count - 1) return '-1';
    else                          return 'hide';
  });

  /* Run animations */
  const animations = certSlides.map((slide, i) => {
    const fromPos = oldPositions[i];
    const toPos   = newPositions[i];
    const fromS   = POS_STATES[fromPos] || POS_STATES['hide'];
    const toS     = POS_STATES[toPos]   || POS_STATES['hide'];

    slide.dataset.pos = toPos;
    slide.classList.toggle('is-active', toPos === '0');

    const anim = slide.animate([
      {
        transform:  stateToTransform(fromS),
        opacity:    fromS.opacity,
        filter:     fromS.blur > 0 ? `blur(${fromS.blur}px)` : 'none',
      },
      {
        transform:  stateToTransform(toS),
        opacity:    toS.opacity,
        filter:     toS.blur > 0 ? `blur(${toS.blur}px)` : 'none',
      },
    ], { duration: DURATION, easing: EASING, fill: 'forwards' });

    return anim.finished;
  });

  Promise.all(animations).then(() => {
    /* Commit final state as inline styles & cancel animation fill */
    certSlides.forEach((slide, i) => {
      const pos = newPositions[i];
      certSlides[i].getAnimations().forEach(a => a.cancel());
      applyStateInstant(slide, pos);
    });

    isAnimating = false;

    /* Start tilt on new active slide */
    startTilt(certSlides[certActive]);
    updateCarouselHeight();
  }).catch(() => { isAnimating = false; });
}

/* Init after images load */
const allImgs = certSlides.map(s => s.querySelector('img')).filter(Boolean);
let loadedCount = 0;
function tryInit() {
  if (++loadedCount < allImgs.length) return;
  /* Apply initial positions instantly */
  certSlides.forEach((slide, i) => {
    const delta = ((i - certActive) % CERTS.length + CERTS.length) % CERTS.length;
    const pos   = delta === 0 ? '0' : delta === 1 ? '1' : delta === CERTS.length-1 ? '-1' : 'hide';
    slide.dataset.pos = pos;
    slide.classList.toggle('is-active', pos === '0');
    applyStateInstant(slide, pos);
  });
  startTilt(certSlides[certActive]);
  setTimeout(updateCarouselHeight, 50);
}
allImgs.forEach(img => img.complete ? tryInit() : img.addEventListener('load', tryInit));
if (!allImgs.length) tryInit();

window.addEventListener('resize', updateCarouselHeight);

/* Click side slides */
certSlides.forEach(slide => {
  slide.addEventListener('click', () => {
    if (slide.dataset.pos === '1')  setCertActive(certActive + 1);
    if (slide.dataset.pos === '-1') setCertActive(certActive - 1);
  });
});

/* Touch swipe */
if (carousel) {
  let touchX = 0;
  carousel.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive:true });
  carousel.addEventListener('touchend',   e => {
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) setCertActive(certActive + (dx < 0 ? 1 : -1));
  }, { passive:true });
}

/* ══════════════════════════════════════
   SERVICES SNAP DOTS
══════════════════════════════════════ */
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
  }, { passive:true });
  requestAnimationFrame(() => {
    track.scrollTo({ left: cards[0].offsetLeft - (track.clientWidth - cards[0].offsetWidth) / 2, behavior: 'instant' });
  });
}
initSnapDots('servicesTrack', 'servicesDots');

/* ══════════════════════════════════════
   SCRATCH CARD LOTTERY
══════════════════════════════════════ */
(function() {
  const canvas = document.getElementById('scratchCanvas');
  const prizeValueEl = document.getElementById('lotteryValue');
  const hintEl = document.getElementById('scratchHint');
  if (!canvas) return;

  const prizes = ['5%', '10%', '15%', '7%', '20%', '10%', '5%', '10%'];
  const prize  = prizes[Math.floor(Math.random() * prizes.length)];
  if (prizeValueEl) prizeValueEl.textContent = prize;

  const ctx = canvas.getContext('2d');
  let isDrawing = false;
  let totalPixels = 1;

  function resizeCanvas() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width  = rect.width;
    canvas.height = rect.height;
    drawScratchLayer();
    totalPixels = canvas.width * canvas.height;
  }

  function drawScratchLayer() {
    ctx.fillStyle = '#f13c77';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1.5;
    for (let x = -canvas.height; x < canvas.width + canvas.height; x += 18) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + canvas.height, canvas.height);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 13px Manrope, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✦  ЗІТРИ  ✦', canvas.width / 2, canvas.height / 2);
  }

  function scratch(x, y) {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    checkReveal();
  }

  function checkReveal() {
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let transparent = 0;
    for (let i = 3; i < data.length; i += 4) if (data[i] < 128) transparent++;
    if (transparent / totalPixels > 0.55) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (hintEl) { hintEl.textContent = '🎉 Покажи цей екран майстру!'; hintEl.classList.add('is-done'); }
      canvas.style.pointerEvents = 'none';
    }
  }

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const src  = e.touches ? e.touches[0] : e;
    return { x: src.clientX - rect.left, y: src.clientY - rect.top };
  }

  canvas.addEventListener('mousedown',  e => { isDrawing = true;  scratch(...Object.values(getPos(e))); });
  canvas.addEventListener('mousemove',  e => { if (!isDrawing) return; scratch(...Object.values(getPos(e))); });
  canvas.addEventListener('mouseup',    () => { isDrawing = false; });
  canvas.addEventListener('mouseleave', () => { isDrawing = false; });

  canvas.addEventListener('touchstart', e => { e.preventDefault(); isDrawing = true;  scratch(...Object.values(getPos(e))); }, { passive:false });
  canvas.addEventListener('touchmove',  e => { e.preventDefault(); if (!isDrawing) return; scratch(...Object.values(getPos(e))); }, { passive:false });
  canvas.addEventListener('touchend',   () => { isDrawing = false; });

  window.addEventListener('load', resizeCanvas);
  setTimeout(resizeCanvas, 300);
})();

/* ══════════════════════════════════════
   FLOATING CTA
══════════════════════════════════════ */
const floatCta = document.getElementById('floatCta');
function updateCta() {
  const hero = document.querySelector('.hero');
  if (!hero || !floatCta) return;
  floatCta.classList.toggle('is-visible', window.scrollY > hero.offsetHeight * 0.6);
}
window.addEventListener('scroll', updateCta, { passive:true });
updateCta();

document.querySelectorAll('.cert-buy-btn, .svc-book-btn').forEach(btn => {
  btn.addEventListener('click', () => window.open('https://t.me/pro_telo_niko', '_blank', 'noopener'));
});
