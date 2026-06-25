import { HERO_SLIDES } from './config.js';
import { ImageUploadSlot } from './imageUploadSlot.js';

const AUTO_INTERVAL = 5500;
const TRANSITION_MS = 800;
const RESUME_DELAY = 6000;
const EASING = 'cubic-bezier(0.65, 0, 0.35, 1)';

export function initHeroCarousel() {
  const track = document.getElementById('heroTrack');
  const heroSection = document.getElementById('heroSection');
  const prevBtn = document.getElementById('heroPrev');
  const nextBtn = document.getElementById('heroNext');

  if (!track || !heroSection) return;

  const slides = [...HERO_SLIDES];
  const uploadSlots = [];
  let currentIndex = 0;
  let isTransitioning = false;
  let autoTimer = null;
  let resumeTimer = null;
  let isPaused = false;

  buildSlides();

  function buildSlides() {
    track.innerHTML = '';
    uploadSlots.length = 0;

    slides.forEach((slideData, index) => {
      const slide = document.createElement('div');
      slide.className = 'hero-slide';
      slide.dataset.index = String(index);

      const img = document.createElement('img');
      img.className = 'hero-slide__image';
      img.src = slideData.image;
      img.alt = `Rico product lineup ${index + 1}`;
      img.loading = index === 0 ? 'eager' : 'lazy';
      img.onerror = () => {
        img.onerror = null;
        img.src = slideData.fallback || `assets/images/hero-placeholder-${(index % 2) + 1}.svg`;
      };

      const overlay = document.createElement('div');
      overlay.className = 'hero-slide__overlay';

      const uploadMount = document.createElement('div');
      uploadMount.className = 'hero-slide__upload-mount';

      const slot = ImageUploadSlot({
        container: uploadMount,
        placeholderLine1: 'Add Your',
        placeholderLine2: 'HERO BANNER',
        placeholderButton: 'Here',
        initialImage: slideData.bannerImage,
        variant: 'hero',
        onChange: (url) => {
          slides[index].bannerImage = url;
        },
      });

      uploadSlots.push(slot);
      overlay.appendChild(uploadMount);
      slide.appendChild(img);
      slide.appendChild(overlay);
      track.appendChild(slide);
    });

    updateSlidePositions(false);
  }

  function getOffset(index) {
    let diff = index - currentIndex;
    const total = slides.length;
    while (diff > total / 2) diff -= total;
    while (diff < -total / 2) diff += total;
    return diff;
  }

  function updateSlidePositions(animate = true) {
    const slideEls = track.querySelectorAll('.hero-slide');
    slideEls.forEach((el, i) => {
      const diff = getOffset(i);
      el.style.transition = animate
        ? `transform ${TRANSITION_MS}ms ${EASING}`
        : 'none';
      el.style.transform = `translateX(${-diff * 100}%)`;
      el.classList.toggle('is-active', i === currentIndex);
      el.style.zIndex = i === currentIndex ? 2 : 1;
    });
  }

  function goTo(index, animate = true) {
    if (isTransitioning && animate) return;
    const total = slides.length;
    const nextIndex = ((index % total) + total) % total;
    if (nextIndex === currentIndex && animate) return;

    if (animate) {
      isTransitioning = true;
      setTimeout(() => {
        isTransitioning = false;
      }, TRANSITION_MS);
    }

    currentIndex = nextIndex;
    updateSlidePositions(animate);
  }

  function next() {
    goTo(currentIndex + 1);
  }

  function prev() {
    goTo(currentIndex - 1);
  }

  function startAuto() {
    stopAuto();
    if (isPaused || slides.length <= 1) return;
    autoTimer = setInterval(next, AUTO_INTERVAL);
  }

  function stopAuto() {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
  }

  function pauseAutoBriefly() {
    stopAuto();
    if (resumeTimer) clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => {
      if (!isPaused) startAuto();
    }, RESUME_DELAY);
  }

  prevBtn?.addEventListener('click', () => {
    prev();
    pauseAutoBriefly();
  });

  nextBtn?.addEventListener('click', () => {
    next();
    pauseAutoBriefly();
  });

  heroSection.addEventListener('mouseenter', () => {
    isPaused = true;
    stopAuto();
  });

  heroSection.addEventListener('mouseleave', () => {
    isPaused = false;
    startAuto();
  });

  initTouchSwipe(heroSection, {
    onSwipeLeft: () => {
      next();
      pauseAutoBriefly();
    },
    onSwipeRight: () => {
      prev();
      pauseAutoBriefly();
    },
  });

  startAuto();

  return { next, prev, goTo, getCurrentIndex: () => currentIndex };
}

function initTouchSwipe(element, { onSwipeLeft, onSwipeRight, threshold = 50 }) {
  let startX = 0;
  let startY = 0;
  let tracking = false;

  element.addEventListener(
    'touchstart',
    (e) => {
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      tracking = true;
    },
    { passive: true }
  );

  element.addEventListener(
    'touchend',
    (e) => {
      if (!tracking) return;
      tracking = false;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;

      if (Math.abs(dx) < threshold || Math.abs(dx) < Math.abs(dy)) return;

      if (dx < 0) onSwipeLeft?.();
      else onSwipeRight?.();
    },
    { passive: true }
  );
}
