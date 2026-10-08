/* ══════════════════════════════════════
   CERT 3D CAROUSEL
══════════════════════════════════════ */
const CERTS = [
  { name: 'Chocolate', dur: '60 хв',  price: '2 500' },
  { name: 'Cranberry', dur: '90 хв',  price: '9 000' },
  { name: 'Matcha',    dur: '90 хв',  price: '5 000' },
  { name: 'Mustard',   dur: '120 хв', price: '7 500' },
];

let certActive = 0;
const certSlides = Array.from(document.querySelectorAll('.cert-slide'));
const certDotsEl = document.getElementById('certDots');
const certNameEl  = document.getElementById('certName');
const certDurEl   = document.getElementById('certDur');
const certPriceEl = document.getElementById('certPrice');

// Build dots
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

function setCertActive(idx) {
  certActive = ((idx % CERTS.length) + CERTS.length) % CERTS.length;
  const count = certSlides.length;

  certSlides.forEach((slide, i) => {
    const delta = ((i - certActive) % count + count) % count;
    // Map delta: 0=active, 1=right, count-1=left, others=hide
    if (delta === 0)          slide.dataset.pos = '0';
    else if (delta === 1)     slide.dataset.pos = '1';
    else if (delta === count - 1) slide.dataset.pos = '-1';
    else                      slide.dataset.pos = 'hide';
  });

  // Update info panel
  const c = CERTS[certActive];
  if (certNameEl)  certNameEl.textContent = c.name;
  if (certDurEl)   certDurEl.textContent  = c.dur;
  if (certPriceEl) certPriceEl.innerHTML  = `${c.price} <span class="accent">₴</span>`;

  // Update dots
  certDotEls.forEach((d, i) => d.classList.toggle('is-active', i === certActive));
}

// Init
setCertActive(0);

// Click on side slides to navigate
certSlides.forEach((slide, i) => {
  slide.addEventListener('click', () => {
    if (slide.dataset.pos === '1')  setCertActive(certActive + 1);
    if (slide.dataset.pos === '-1') setCertActive(certActive - 1);
  });
});

// Swipe on carousel
const carousel = document.getElementById('certCarousel');
if (carousel) {
  let touchStartX = 0;
  carousel.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  carousel.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) setCertActive(certActive + (dx < 0 ? 1 : -1));
  }, { passive: true });
}

/* ══════════════════════════════════════
   SERVICES SNAP DOTS
══════════════════════════════════════ */
function initSnapDots(trackId, dotsId) {
  const track = document.getElementById(trackId);
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
      const off = card.offsetLeft - (track.clientWidth - card.offsetWidth) / 2;
      track.scrollTo({ left: off, behavior: 'smooth' });
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
        const c = card.offsetLeft + card.offsetWidth / 2;
        const d = Math.abs(center - c);
        if (d < minDist) { minDist = d; closest = i; }
      });
      dots.forEach((d, i) => d.classList.toggle('is-active', i === closest));
    });
  }, { passive: true });

  // Center first card on load
  requestAnimationFrame(() => {
    const off = cards[0].offsetLeft - (track.clientWidth - cards[0].offsetWidth) / 2;
    track.scrollTo({ left: off, behavior: 'instant' });
  });
}

initSnapDots('servicesTrack', 'servicesDots');

/* ══════════════════════════════════════
   FLOATING CTA
══════════════════════════════════════ */
const floatCta = document.getElementById('floatCta');
function updateCta() {
  const hero = document.querySelector('.hero');
  if (!hero || !floatCta) return;
  floatCta.classList.toggle('is-visible', window.scrollY > hero.offsetHeight * 0.6);
}
window.addEventListener('scroll', updateCta, { passive: true });
updateCta();

/* ══════════════════════════════════════
   ALL CTA → Telegram
══════════════════════════════════════ */
document.querySelectorAll('.cert-buy-btn, .svc-book-btn').forEach(btn => {
  btn.addEventListener('click', () => window.open('https://t.me/pro_telo_niko', '_blank', 'noopener'));
});
