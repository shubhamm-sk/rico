import { TESTIMONIALS } from './testimonialsConfig.js';

const AUTO_SPEED = 25;
const MANUAL_TRANSITION_MS = 500;
const MANUAL_PAUSE_MS = 3000;
const SWIPE_THRESHOLD = 40;

export function initTestimonialCarousel() {
  const section = document.getElementById('testimonials');
  const viewport = document.getElementById('testimonialsViewport');
  const track = document.getElementById('testimonialsTrack');
  const prevBtn = document.getElementById('testimonialsPrev');
  const nextBtn = document.getElementById('testimonialsNext');

  if (!section || !viewport || !track) return;

  const items = [...TESTIMONIALS];
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    initReducedMotionCarousel(viewport, track, prevBtn, nextBtn, items);
    return;
  }

  let position = 0;
  let setWidth = 0;
  let cardStep = 0;
  let isHovered = false;
  let isTouching = false;
  let isDragging = false;
  let isManualAnimating = false;
  let manualPauseUntil = 0;
  let rafId = null;
  let lastTimestamp = null;

  buildTrack();
  measure();
  applyTransform();
  prevBtn?.classList.remove('is-disabled');
  nextBtn?.classList.remove('is-disabled');

  rafId = requestAnimationFrame(tick);

  window.addEventListener('resize', debounce(() => {
    const ratio = setWidth > 0 ? position / setWidth : 0;
    measure();
    position = ratio * setWidth;
    normalizePosition();
    applyTransform();
  }, 150));

  viewport.addEventListener('mouseenter', () => {
    isHovered = true;
  });

  viewport.addEventListener('mouseleave', () => {
    isHovered = false;
  });

  prevBtn?.addEventListener('click', () => navigateByCard(-1));
  nextBtn?.addEventListener('click', () => navigateByCard(1));

  initTouchInteraction();

  /** Duplicate card set twice — same seamless loop as top-selling */
  function buildTrack() {
    const cardsHtml = items.map((item) => createCard(item)).join('');
    track.innerHTML = cardsHtml + cardsHtml;
  }

  function createCard(item) {
    const stars = '★'.repeat(item.rating) + '☆'.repeat(5 - item.rating);
    const verifiedHtml = item.verified
      ? '<span class="testimonial-card__verified">Verified Purchase</span>'
      : '';

    return `
      <article class="testimonial-card">
        <div class="testimonial-card__header">
          <img class="testimonial-card__avatar" src="${item.avatar}" alt="" width="44" height="44" loading="lazy" onerror="this.src='assets/images/avatar-placeholder.svg'">
          <span class="testimonial-card__name">${item.name}</span>
        </div>
        <div class="testimonial-card__rating-row">
          <span class="testimonial-card__stars" aria-label="${item.rating} out of 5 stars">${stars}</span>
          <strong class="testimonial-card__title">${item.title}</strong>
        </div>
        <div class="testimonial-card__meta">
          <span>Reviewed in India on ${item.date}</span>
          <span>Colour: ${item.colour}</span>
          ${verifiedHtml}
        </div>
        <p class="testimonial-card__body">${item.review}</p>
      </article>
    `;
  }

  function measure() {
    const card = track.querySelector('.testimonial-card');
    if (!card) return;

    const styles = getComputedStyle(track);
    const gap = parseFloat(styles.gap) || 20;
    cardStep = card.offsetWidth + gap;
    setWidth = cardStep * items.length;
  }

  function getCardStep() {
    if (!cardStep) measure();
    return cardStep || 366;
  }

  function isAutoPaused() {
    return isHovered
      || isTouching
      || isDragging
      || isManualAnimating
      || Date.now() < manualPauseUntil;
  }

  function normalizePosition() {
    if (setWidth <= 0) return;
    while (position >= setWidth) position -= setWidth;
    while (position < 0) position += setWidth;
  }

  function applyTransform() {
    track.style.transform = `translate3d(${-position}px, 0, 0)`;
  }

  /** Constant-speed RAF scroll — identical technique to top-selling */
  function tick(timestamp) {
    if (lastTimestamp === null) lastTimestamp = timestamp;
    const delta = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    if (!isAutoPaused() && setWidth > 0) {
      position += AUTO_SPEED * delta;
      if (position >= setWidth) position -= setWidth;
      applyTransform();
    }

    rafId = requestAnimationFrame(tick);
  }

  function pauseAfterManualNav() {
    manualPauseUntil = Date.now() + MANUAL_PAUSE_MS;
  }

  function navigateByCard(direction) {
    const step = getCardStep();
    const target = position + direction * step;
    animateTo(target);
    pauseAfterManualNav();
  }

  function animateTo(targetPosition) {
    if (isManualAnimating) return;

    const start = position;
    let delta = targetPosition - start;

    if (setWidth > 0) {
      if (delta > setWidth / 2) delta -= setWidth;
      if (delta < -setWidth / 2) delta += setWidth;
    }

    const end = start + delta;
    const startTime = performance.now();
    isManualAnimating = true;
    track.style.transition = `transform ${MANUAL_TRANSITION_MS}ms ease`;

    function frame(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / MANUAL_TRANSITION_MS, 1);
      const eased = easeInOutCubic(progress);
      position = start + delta * eased;
      applyTransform();

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        position = end;
        normalizePosition();
        applyTransform();
        track.style.transition = 'none';
        isManualAnimating = false;
      }
    }

    requestAnimationFrame(frame);
  }

  function initTouchInteraction() {
    let startX = 0;
    let startY = 0;
    let dragStartPosition = 0;
    let hasDragged = false;

    viewport.addEventListener('touchstart', (e) => {
      isTouching = true;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      dragStartPosition = position;
      hasDragged = false;
      track.style.transition = 'none';
    }, { passive: true });

    viewport.addEventListener('touchmove', (e) => {
      const dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;

      if (!isDragging && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
        isDragging = true;
      }

      if (!isDragging) return;

      hasDragged = true;
      position = dragStartPosition - dx;
      normalizePosition();
      applyTransform();
    }, { passive: true });

    viewport.addEventListener('touchend', (e) => {
      isTouching = false;
      isDragging = false;
      track.style.transition = 'none';

      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;

      if (!hasDragged && Math.abs(dx) < SWIPE_THRESHOLD) {
        return;
      }

      if (Math.abs(dx) >= SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
        navigateByCard(dx > 0 ? -1 : 1);
      } else if (hasDragged) {
        const step = getCardStep();
        const snapped = Math.round(position / step) * step;
        animateTo(snapped);
        pauseAfterManualNav();
      }
    }, { passive: true });

    viewport.addEventListener('touchcancel', () => {
      isTouching = false;
      isDragging = false;
      track.style.transition = 'none';
    }, { passive: true });
  }

  return () => {
    if (rafId) cancelAnimationFrame(rafId);
  };
}

/** Static row + manual arrows when reduced motion is preferred */
function initReducedMotionCarousel(viewport, track, prevBtn, nextBtn, items) {
  let currentIndex = 0;
  let cardStep = 0;

  track.innerHTML = items.map((item) => createReducedMotionCard(item)).join('');
  measure();
  updatePosition(false);
  updateArrows();

  window.addEventListener('resize', debounce(() => {
    measure();
    currentIndex = Math.min(currentIndex, getMaxIndex());
    updatePosition(false);
    updateArrows();
  }, 150));

  prevBtn?.addEventListener('click', () => goTo(currentIndex - 1));
  nextBtn?.addEventListener('click', () => goTo(currentIndex + 1));

  initTouchSwipe(viewport, {
    onSwipeLeft: () => goTo(currentIndex + 1),
    onSwipeRight: () => goTo(currentIndex - 1),
  });

  function measure() {
    const card = track.querySelector('.testimonial-card');
    if (!card) return;
    const styles = getComputedStyle(track);
    const gap = parseFloat(styles.gap) || 20;
    cardStep = card.offsetWidth + gap;
  }

  function getMaxIndex() {
    if (!cardStep) return 0;
    const visible = viewport.offsetWidth / cardStep;
    return Math.max(0, items.length - Math.floor(visible));
  }

  function goTo(index) {
    const max = getMaxIndex();
    let next = index;
    if (next > max) next = 0;
    if (next < 0) next = max;
    if (next === currentIndex && max > 0) return;
    currentIndex = next;
    updatePosition(true);
    updateArrows();
  }

  function updatePosition(animate) {
    track.style.transition = animate
      ? `transform ${MANUAL_TRANSITION_MS}ms ease`
      : 'none';
    track.style.transform = `translate3d(-${currentIndex * cardStep}px, 0, 0)`;
  }

  function updateArrows() {
    const max = getMaxIndex();
    const disabled = max === 0;
    prevBtn?.classList.toggle('is-disabled', disabled);
    nextBtn?.classList.toggle('is-disabled', disabled);
  }
}

function createReducedMotionCard(item) {
  const stars = '★'.repeat(item.rating) + '☆'.repeat(5 - item.rating);
  const verifiedHtml = item.verified
    ? '<span class="testimonial-card__verified">Verified Purchase</span>'
    : '';

  return `
    <article class="testimonial-card">
      <div class="testimonial-card__header">
        <img class="testimonial-card__avatar" src="${item.avatar}" alt="" width="44" height="44" loading="lazy" onerror="this.src='assets/images/avatar-placeholder.svg'">
        <span class="testimonial-card__name">${item.name}</span>
      </div>
      <div class="testimonial-card__rating-row">
        <span class="testimonial-card__stars" aria-label="${item.rating} out of 5 stars">${stars}</span>
        <strong class="testimonial-card__title">${item.title}</strong>
      </div>
      <div class="testimonial-card__meta">
        <span>Reviewed in India on ${item.date}</span>
        <span>Colour: ${item.colour}</span>
        ${verifiedHtml}
      </div>
      <p class="testimonial-card__body">${item.review}</p>
    </article>
  `;
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
