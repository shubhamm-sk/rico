import { WHY_RICO } from './testimonialsConfig.js';

const MANUAL_TRANSITION_MS = 500;
const MANUAL_PAUSE_MS = 3000;
const SWIPE_THRESHOLD = 50;
const LOOP_SECONDS_PER_ITEM = 5;

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
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    initReducedMotionCarousel(viewport, track, prevBtn, nextBtn, dots, items);
    return;
  }

  initAutoScrollCarousel(viewport, track, prevBtn, nextBtn, dots, items);
}

function createItemHtml(item) {
  const iconSvg = ICONS[item.icon] || ICONS['shield-check'];
  return `
    <div class="why-rico__item">
      <div class="why-rico__circle">
        <span class="why-rico__icon">${iconSvg}</span>
      </div>
      <p class="why-rico__label">${item.label}</p>
    </div>
  `;
}

/** CSS-keyframes auto-scroll — seamless loop, LTR drift (opposite of testimonials) */
function initAutoScrollCarousel(viewport, track, prevBtn, nextBtn, dots, items) {
  let setWidth = 0;
  let itemStep = 0;
  let maxIndex = 0;
  let dotCount = 1;
  let loopDurationSec = items.length * LOOP_SECONDS_PER_ITEM;
  let isManualAnimating = false;
  let isManualPaused = false;
  let manualPauseTimer = null;
  let dotRafId = null;

  buildTrack();
  measure();
  buildDots();
  applyAutoScrollStyles();
  enableInfiniteArrows();
  startDotSync();

  window.addEventListener('resize', debounce(() => {
    const progress = getScrollProgress();
    measure();
    buildDots();
    if (isManualPaused) {
      const x = -progress * setWidth;
      track.style.transform = `translateX(${x}px)`;
    } else {
      resumeAutoScroll(progress);
    }
    updateDotsFromProgress(progress);
  }, 150));

  prevBtn?.addEventListener('click', () => navigateByItem(-1));
  nextBtn?.addEventListener('click', () => navigateByItem(1));

  initTouchInteraction();

  function buildTrack() {
    const itemsHtml = items.map((item) => createItemHtml(item)).join('');
    track.innerHTML = itemsHtml + itemsHtml;
  }

  function measure() {
    const item = track.querySelector('.why-rico__item');
    if (!item) return;

    const styles = getComputedStyle(track);
    const gap = parseFloat(styles.gap) || 30;
    itemStep = item.offsetWidth + gap;
    setWidth = itemStep * items.length;

    const visible = Math.max(1, Math.floor(viewport.offsetWidth / itemStep));
    maxIndex = Math.max(0, items.length - visible);
    dotCount = maxIndex + 1;
    loopDurationSec = items.length * LOOP_SECONDS_PER_ITEM;
  }

  function applyAutoScrollStyles() {
    track.style.setProperty('--why-rico-set-width', `${setWidth}px`);
    track.style.setProperty('--why-rico-duration', `${loopDurationSec}s`);
    track.classList.add('is-auto-scrolling');
    track.classList.remove('is-manual');
    track.style.transform = '';
    track.style.transition = '';
    track.style.animationDelay = '0s';
  }

  function enableInfiniteArrows() {
    prevBtn?.classList.remove('is-disabled');
    nextBtn?.classList.remove('is-disabled');
    if (prevBtn) prevBtn.disabled = false;
    if (nextBtn) nextBtn.disabled = false;
  }

  function getCurrentTranslateX() {
    const matrix = new DOMMatrixReadOnly(getComputedStyle(track).transform);
    return matrix.m41;
  }

  /** 0 at loop start (-setWidth), 1 at loop end (0) */
  function getScrollProgress() {
    const x = getCurrentTranslateX();
    let progress = (x + setWidth) / setWidth;
    progress = progress - Math.floor(progress);
    return progress;
  }

  function progressToTranslateX(progress) {
    return -setWidth + normalizeProgress(progress) * setWidth;
  }

  function normalizeProgress(progress) {
    let normalized = progress % 1;
    if (normalized < 0) normalized += 1;
    return normalized;
  }

  function buildDots() {
    if (!dots) return;

    dots.innerHTML = Array.from({ length: dotCount }, (_, i) =>
      `<button type="button" class="why-rico__dot${i === 0 ? ' is-active' : ''}" data-index="${i}" aria-label="Go to slide ${i + 1}"></button>`
    ).join('');

    dots.querySelectorAll('.why-rico__dot').forEach((dot) => {
      dot.addEventListener('click', () => goToDot(Number(dot.dataset.index)));
    });
  }

  function updateDotsFromProgress(progress) {
    if (!dots || dotCount <= 0) return;

    const pos = normalizeProgress(progress) * setWidth;
    const dotIndex = Math.round(pos / itemStep) % dotCount;
    dots.querySelectorAll('.why-rico__dot').forEach((dot, i) => {
      dot.classList.toggle('is-active', i === dotIndex);
    });
  }

  function startDotSync() {
    function tick() {
      if (!isManualPaused && !isManualAnimating && setWidth > 0) {
        updateDotsFromProgress(getScrollProgress());
      }
      dotRafId = requestAnimationFrame(tick);
    }
    dotRafId = requestAnimationFrame(tick);
  }

  function pauseForManual() {
    isManualPaused = true;
    const progress = getScrollProgress();
    const x = progressToTranslateX(progress);

    track.classList.remove('is-auto-scrolling');
    track.classList.add('is-manual');
    track.style.animationDelay = '0s';
    track.style.transition = 'none';
    track.style.transform = `translateX(${x}px)`;

    scheduleAutoResume();
  }

  function scheduleAutoResume() {
    clearTimeout(manualPauseTimer);
    manualPauseTimer = setTimeout(() => {
      if (isManualAnimating) {
        scheduleAutoResume();
        return;
      }
      resumeAutoScroll(getScrollProgress());
    }, MANUAL_PAUSE_MS);
  }

  function resumeAutoScroll(fromProgress) {
    if (!isManualPaused) return;

    clearTimeout(manualPauseTimer);
    manualPauseTimer = null;

    const progress = normalizeProgress(fromProgress ?? getScrollProgress());
    isManualPaused = false;
    isManualAnimating = false;

    track.style.transition = 'none';
    track.style.transform = '';
    track.style.animationDelay = `${-progress * loopDurationSec}s`;
    track.classList.remove('is-manual');
    track.classList.add('is-auto-scrolling');

    updateDotsFromProgress(progress);
  }

  function navigateByItem(direction) {
    pauseForManual();

    const progress = getScrollProgress();
    const pos = normalizeProgress(progress) * setWidth;
    const targetProgress = normalizeProgress((pos + direction * itemStep) / setWidth);
    animateToProgress(targetProgress);
  }

  function goToDot(index) {
    pauseForManual();
    const clamped = Math.max(0, Math.min(index, maxIndex));
    const targetProgress = (clamped * itemStep % setWidth) / setWidth;
    animateToProgress(targetProgress);
  }

  function animateToProgress(targetProgress) {
    if (isManualAnimating) return;

    const startProgress = getScrollProgress();
    let delta = targetProgress - startProgress;

    if (delta > 0.5) delta -= 1;
    if (delta < -0.5) delta += 1;

    const startTime = performance.now();
    isManualAnimating = true;

    function frame(now) {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / MANUAL_TRANSITION_MS, 1);
      const eased = easeInOutCubic(t);
      const currentProgress = normalizeProgress(startProgress + delta * eased);
      const x = progressToTranslateX(currentProgress);
      track.style.transform = `translateX(${x}px)`;
      updateDotsFromProgress(currentProgress);

      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        isManualAnimating = false;
        updateDotsFromProgress(targetProgress);
        scheduleAutoResume();
      }
    }

    requestAnimationFrame(frame);
  }

  function initTouchInteraction() {
    let startX = 0;
    let startY = 0;
    let dragStartX = 0;
    let hasDragged = false;

    viewport.addEventListener('touchstart', (e) => {
      pauseForManual();
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      dragStartX = getCurrentTranslateX();
      hasDragged = false;
    }, { passive: true });

    viewport.addEventListener('touchmove', (e) => {
      const dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;

      if (!hasDragged && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
        hasDragged = true;
      }

      if (!hasDragged) return;

      let x = dragStartX + dx;
      while (x > 0) x -= setWidth;
      while (x <= -setWidth) x += setWidth;
      track.style.transform = `translateX(${x}px)`;

      const progress = normalizeProgress((x + setWidth) / setWidth);
      updateDotsFromProgress(progress);
    }, { passive: true });

    viewport.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;

      if (!hasDragged && Math.abs(dx) < SWIPE_THRESHOLD) {
        resumeAutoScroll(getScrollProgress());
        return;
      }

      if (Math.abs(dx) >= SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
        navigateByItem(dx > 0 ? -1 : 1);
        return;
      }

      if (hasDragged) {
        const progress = getScrollProgress();
        const snapped = Math.round(progress * setWidth / itemStep) * itemStep / setWidth;
        animateToProgress(snapped);
      }
    }, { passive: true });

    viewport.addEventListener('touchcancel', () => {
      resumeAutoScroll(getScrollProgress());
    }, { passive: true });
  }

  return () => {
    if (dotRafId) cancelAnimationFrame(dotRafId);
    clearTimeout(manualPauseTimer);
  };
}

/** Static row + manual arrows when reduced motion is preferred */
function initReducedMotionCarousel(viewport, track, prevBtn, nextBtn, dots, items) {
  let currentIndex = 0;
  let itemStep = 0;
  let maxIndex = 0;

  track.innerHTML = items.map((item) => createItemHtml(item)).join('');
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
      ? `transform ${MANUAL_TRANSITION_MS}ms ease`
      : 'none';
    track.style.transform = `translateX(-${currentIndex * itemStep}px)`;
  }

  function updateArrows() {
    prevBtn?.classList.toggle('is-disabled', currentIndex === 0);
    nextBtn?.classList.toggle('is-disabled', currentIndex >= maxIndex);
    if (prevBtn) prevBtn.disabled = currentIndex === 0;
    if (nextBtn) nextBtn.disabled = currentIndex >= maxIndex;
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

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
