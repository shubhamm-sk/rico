import { TESTIMONIALS } from './testimonialsConfig.js';

const TRANSITION_MS = 500;
const AUTO_INTERVAL = 6000;
const SWIPE_THRESHOLD = 50;

export function initTestimonialCarousel() {
  const section = document.getElementById('testimonials');
  const viewport = document.getElementById('testimonialsViewport');
  const track = document.getElementById('testimonialsTrack');
  const prevBtn = document.getElementById('testimonialsPrev');
  const nextBtn = document.getElementById('testimonialsNext');

  if (!section || !viewport || !track) return;

  const items = [...TESTIMONIALS];
  let currentIndex = 0;
  let cardStep = 0;
  let isHovered = false;
  let autoTimer = null;

  buildCards();
  measure();
  updatePosition(false);
  updateArrows();
  startAuto();

  window.addEventListener('resize', debounce(() => {
    measure();
    currentIndex = Math.min(currentIndex, getMaxIndex());
    updatePosition(false);
    updateArrows();
  }, 150));

  section.addEventListener('mouseenter', () => {
    isHovered = true;
    stopAuto();
  });

  section.addEventListener('mouseleave', () => {
    isHovered = false;
    startAuto();
  });

  prevBtn?.addEventListener('click', () => goTo(currentIndex - 1));
  nextBtn?.addEventListener('click', () => goTo(currentIndex + 1));

  initTouchSwipe(viewport, {
    onSwipeLeft: () => goTo(currentIndex + 1),
    onSwipeRight: () => goTo(currentIndex - 1),
  });

  function buildCards() {
    track.innerHTML = items
      .map((item, i) => createCard(item, i))
      .join('');
  }

  function createCard(item) {
    const stars = '★'.repeat(item.rating) + '☆'.repeat(5 - item.rating);
    const verifiedHtml = item.verified
      ? '<span class="testimonial-card__verified">Verified Purchase</span>'
      : '';

    return `
      <article class="testimonial-card">
        <div class="testimonial-card__header">
          <img class="testimonial-card__avatar" src="${item.avatar}" alt="" width="40" height="40" loading="lazy" onerror="this.src='assets/images/avatar-placeholder.svg'">
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
      ? `transform ${TRANSITION_MS}ms ease`
      : 'none';
    track.style.transform = `translateX(-${currentIndex * cardStep}px)`;
  }

  function updateArrows() {
    const max = getMaxIndex();
    const disabled = max === 0;
    prevBtn?.classList.toggle('is-disabled', disabled);
    nextBtn?.classList.toggle('is-disabled', disabled);
  }

  function startAuto() {
    stopAuto();
    if (items.length <= 1) return;
    autoTimer = setInterval(() => {
      if (!isHovered) goTo(currentIndex + 1);
    }, AUTO_INTERVAL);
  }

  function stopAuto() {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
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
