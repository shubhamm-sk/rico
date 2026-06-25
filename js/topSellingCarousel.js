import { TOP_SELLING_PRODUCTS } from './config.js';

const AUTO_SPEED = 48;
const MANUAL_TRANSITION_MS = 500;
const MANUAL_PAUSE_MS = 3000;
const SWIPE_THRESHOLD = 40;

export function initTopSellingCarousel() {
  const section = document.getElementById('topSelling');
  const viewport = document.getElementById('topSellingViewport');
  const track = document.getElementById('topSellingTrack');
  const prevBtn = document.getElementById('topSellingPrev');
  const nextBtn = document.getElementById('topSellingNext');

  if (!section || !viewport || !track) return;

  const products = [...TOP_SELLING_PRODUCTS];
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

  function buildTrack() {
    track.innerHTML = '';
    const renderSet = document.createDocumentFragment();

    for (let copy = 0; copy < 2; copy += 1) {
      products.forEach((product, index) => {
        renderSet.appendChild(createCard(product, index));
      });
    }

    track.appendChild(renderSet);
  }

  function createCard(product, index) {
    const card = document.createElement('article');
    card.className = 'top-selling__card';
    card.style.background = product.color;

    const badge = document.createElement('span');
    badge.className = 'top-selling__badge';
    badge.textContent = product.label;
    card.appendChild(badge);

    if (product.image) {
      const img = document.createElement('img');
      img.className = 'top-selling__image';
      img.src = product.image;
      img.alt = product.label;
      img.loading = index < 4 ? 'eager' : 'lazy';
      img.onerror = () => {
        img.onerror = null;
        img.classList.add('is-hidden');
      };
      card.appendChild(img);
    }

    return card;
  }

  function measure() {
    const card = track.querySelector('.top-selling__card');
    if (!card) return;

    const styles = getComputedStyle(track);
    const gap = parseFloat(styles.gap) || 20;
    cardStep = card.offsetWidth + gap;
    setWidth = cardStep * products.length;
  }

  function getCardStep() {
    if (!cardStep) measure();
    return cardStep || 250;
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
