import { WHY_RICO } from './testimonialsConfig.js';

const TRANSITION_MS = 500;
const SWIPE_THRESHOLD = 50;

const ICONS = {
  'shield-check': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>`,
  crown: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 18h20L19 8l-5 4-2-6-2 6-5-4z"/><path d="M4 18v2h16v-2"/></svg>`,
  'badge-1965': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="9"/><text x="12" y="13.5" text-anchor="middle" font-size="5.5" font-weight="700" fill="currentColor" stroke="none" font-family="Inter, Arial, sans-serif">1965</text></svg>`,
  award: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="6"/><path d="M8.5 14 7 22l5-3 5 3-1.5-8"/></svg>`,
  headphones: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 14v3a3 3 0 0 0 3 3h1V11H5a2 2 0 0 0-2 2z"/><path d="M21 14v3a3 3 0 0 1-3 3h-1V11h3a2 2 0 0 1 2 2z"/><path d="M4 14h.01M20 14h.01"/></svg>`,
  'map-pin': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>`,
};

export function initWhyRicoCarousel() {
  const section = document.getElementById('whyRico');
  const viewport = document.getElementById('whyRicoViewport');
  const track = document.getElementById('whyRicoTrack');
  const prevBtn = document.getElementById('whyRicoPrev');
  const nextBtn = document.getElementById('whyRicoNext');
  const dots = document.getElementById('whyRicoDots');

  if (!section || !viewport || !track) return;

  const items = [...WHY_RICO];
  let currentIndex = 0;
  let itemStep = 0;
  let maxIndex = 0;

  buildItems();
  measure();
  buildDots();
  updatePosition(false);
  updateArrows();

  window.addEventListener('resize', debounce(() => {
    measure();
    buildDots();
    currentIndex = Math.min(currentIndex, maxIndex);
    updatePosition(false);
    updateArrows();
    updateDots();
  }, 150));

  prevBtn?.addEventListener('click', () => goTo(currentIndex - 1));
  nextBtn?.addEventListener('click', () => goTo(currentIndex + 1));

  initTouchSwipe(viewport, {
    onSwipeLeft: () => goTo(currentIndex + 1),
    onSwipeRight: () => goTo(currentIndex - 1),
  });

  function buildItems() {
    track.innerHTML = items
      .map((item) => {
        const iconSvg = ICONS[item.icon] || ICONS['shield-check'];
        return `
          <div class="why-rico__item">
            <div class="why-rico__circle">
              <span class="why-rico__icon">${iconSvg}</span>
            </div>
            <p class="why-rico__label">${item.label}</p>
          </div>
        `;
      })
      .join('');
  }

  function measure() {
    const item = track.querySelector('.why-rico__item');
    if (!item) return;
    const styles = getComputedStyle(track);
    const gap = parseFloat(styles.gap) || 30;
    itemStep = item.offsetWidth + gap;
    const visible = Math.max(1, Math.floor(viewport.offsetWidth / itemStep));
    maxIndex = Math.max(0, items.length - visible);
    track.style.justifyContent = maxIndex === 0 ? 'center' : 'flex-start';
  }

  function buildDots() {
    if (!dots) return;
    const pageCount = maxIndex + 1;
    dots.innerHTML = Array.from({ length: pageCount }, (_, i) =>
      `<button type="button" class="why-rico__dot${i === currentIndex ? ' is-active' : ''}" data-index="${i}" aria-label="Go to slide ${i + 1}"></button>`
    ).join('');

    dots.querySelectorAll('.why-rico__dot').forEach((dot) => {
      dot.addEventListener('click', () => goTo(Number(dot.dataset.index)));
    });
  }

  function goTo(index) {
    const next = Math.max(0, Math.min(index, maxIndex));
    if (next === currentIndex) return;
    currentIndex = next;
    updatePosition(true);
    updateArrows();
    updateDots();
  }

  function updatePosition(animate) {
    track.style.transition = animate
      ? `transform ${TRANSITION_MS}ms ease`
      : 'none';
    track.style.transform = `translateX(-${currentIndex * itemStep}px)`;
  }

  function updateArrows() {
    prevBtn?.classList.toggle('is-disabled', currentIndex === 0);
    nextBtn?.classList.toggle('is-disabled', currentIndex >= maxIndex);
    prevBtn && (prevBtn.disabled = currentIndex === 0);
    nextBtn && (nextBtn.disabled = currentIndex >= maxIndex);
  }

  function updateDots() {
    dots?.querySelectorAll('.why-rico__dot').forEach((dot, i) => {
      dot.classList.toggle('is-active', i === currentIndex);
    });
  }
}

function initTouchSwipe(element, { onSwipeLeft, onSwipeRight }) {
  let startX = 0;
  let startY = 0;

  element.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, { passive: true });

  element.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0) onSwipeLeft?.();
    else onSwipeRight?.();
  }, { passive: true });
}

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
