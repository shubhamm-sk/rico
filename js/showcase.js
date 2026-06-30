/**
 * Premium Cinematic Product Showcase
 * Self-contained module: renders slides from product data and drives auto-slider.
 */

// ── Product data (single source of truth) ──────────────────────────────────
const products = [
  {
    image: 'iron.webp',
    name: 'Classic Iron',
    code: 'IRN-1001',
    discount: '(40% OFF)',
    price: '₹ 1,299.00',
  },
  {
    image: 'iron2.webp',
    name: 'Pro Steam Iron',
    code: 'IRN-2002',
    discount: '(35% OFF)',
    price: '₹ 1,799.00',
  },
  {
    image: 'juser.webp',
    name: 'Citrus Juicer',
    code: 'CJ-2510',
    discount: '(50% OFF)',
    price: '₹ 1,499.00',
  },
  {
    image: 'Steel_Bowl.webp',
    name: 'Steel Mixing Bowl',
    code: 'SB-3005',
    discount: '(20% OFF)',
    price: '₹ 899.00',
  },
  {
    image: 'table_fan.webp',
    name: 'Breeze Table Fan',
    code: 'TF-4012',
    discount: '(30% OFF)',
    price: '₹ 2,199.00',
  },
  {
    image: 'torch.webp',
    name: 'Rechargeable Torch',
    code: 'TR-5050',
    discount: '(45% OFF)',
    price: '₹ 799.00',
  },
  {
    image: 'xzy.jpg',
    name: 'Nutri Fresh',
    code: 'MG-2609',
    discount: '(67% OFF)',
    price: '₹ 7,000.00',
  },
];

const AUTO_INTERVAL_MS = 5000;
const TRANSITION_MS = 700;
const EASING = 'cubic-bezier(.22,.61,.36,1)';
const SWIPE_THRESHOLD = 50;
const TOUCH_RESUME_MS = 4000;

// ── Render slides into #showcaseTrack ──────────────────────────────────────
function renderShowcase() {
  const track = document.getElementById('showcaseTrack');
  if (!track) return;

  track.innerHTML = products
    .map((item, index) => {
      const isReverse = index % 2 === 1;
      const reverseClass = isReverse ? ' showcase__slide--reverse' : '';

      return `
        <article
          class="showcase__slide${reverseClass}"
          data-index="${index}"
          aria-hidden="${index === 0 ? 'false' : 'true'}"
        >
          <div class="showcase__slide-bg" aria-hidden="true"></div>
          <div class="showcase__slide-inner">
            <div class="showcase__details">
              <h3 class="showcase__name">${item.name}</h3>
              <p class="showcase__code">${item.code}</p>
              <p class="showcase__discount">${item.discount}</p>
              <p class="showcase__price">${item.price}</p>
            </div>
            <div class="showcase__hero">
              <div class="showcase__glow" aria-hidden="true"></div>
              <div class="showcase__float">
                <div class="showcase__image-wrap">
                  <img
                    class="showcase__image"
                    src="assets/product/${item.image}"
                    alt="${item.name}"
                    loading="${index === 0 ? 'eager' : 'lazy'}"
                    decoding="async"
                  >
                </div>
              </div>
            </div>
          </div>
        </article>
      `;
    })
    .join('');
}

// ── Carousel controller ────────────────────────────────────────────────────
function initShowcaseCarousel() {
  const section = document.getElementById('showcaseSection');
  const viewport = section?.querySelector('.showcase__viewport');
  const track = document.getElementById('showcaseTrack');
  const prevBtn = document.getElementById('showcasePrev');
  const nextBtn = document.getElementById('showcaseNext');
  const dotsRoot = document.getElementById('showcaseDots');

  if (!section || !viewport || !track || !dotsRoot) return;

  const slides = [...track.querySelectorAll('.showcase__slide')];
  const total = slides.length;
  if (total === 0) return;

  let currentIndex = 0;
  let isTransitioning = false;
  let autoTimer = null;
  let touchResumeTimer = null;
  let slideWidth = 0;
  let touchStartX = 0;

  measure();
  buildDots();
  goToSlide(0, false);
  startAutoplay();

  window.addEventListener(
    'resize',
    debounce(() => {
      measure();
      goToSlide(currentIndex, false);
    }, 150)
  );

  prevBtn?.addEventListener('click', () => {
    prevSlide();
    resetAutoplay();
  });

  nextBtn?.addEventListener('click', () => {
    nextSlide();
    resetAutoplay();
  });

  [prevBtn, nextBtn].forEach((btn) => {
    btn?.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        btn.click();
      }
    });
  });

  section.addEventListener('mouseenter', stopAutoplay);
  section.addEventListener('mouseleave', () => {
    if (!touchResumeTimer) startAutoplay();
  });

  viewport.addEventListener('touchstart', onTouchStart, { passive: true });
  viewport.addEventListener('touchend', onTouchEnd, { passive: true });

  function measure() {
    slideWidth = viewport.offsetWidth;
    track.style.width = `${slideWidth * total}px`;
    slides.forEach((slide) => {
      slide.style.width = `${slideWidth}px`;
      slide.style.flexBasis = `${slideWidth}px`;
    });
  }

  function onTouchStart(event) {
    touchStartX = event.changedTouches[0].clientX;
    stopAutoplay();
    if (touchResumeTimer) clearTimeout(touchResumeTimer);
  }

  function onTouchEnd(event) {
    const dx = event.changedTouches[0].clientX - touchStartX;

    if (Math.abs(dx) > SWIPE_THRESHOLD) {
      if (dx < 0) nextSlide();
      else prevSlide();
    }

    touchResumeTimer = setTimeout(() => {
      touchResumeTimer = null;
      if (!section.matches(':hover')) startAutoplay();
    }, TOUCH_RESUME_MS);
  }

  function buildDots() {
    dotsRoot.innerHTML = products
      .map(
        (_, index) => `
          <button
            class="showcase__dot${index === 0 ? ' is-active' : ''}"
            type="button"
            role="tab"
            aria-label="Go to product ${index + 1}"
            aria-selected="${index === 0 ? 'true' : 'false'}"
            data-index="${index}"
          >
            <span class="showcase__dot-fill" aria-hidden="true"></span>
          </button>
        `
      )
      .join('');

    dotsRoot.querySelectorAll('.showcase__dot').forEach((dot) => {
      dot.addEventListener('click', () => {
        const index = Number(dot.dataset.index);
        if (Number.isNaN(index) || index === currentIndex) return;
        goToSlide(index);
        resetAutoplay();
      });
    });
  }

  function goToSlide(index, animate = true) {
    if (isTransitioning && animate) return;

    const nextIndex = ((index % total) + total) % total;
    if (nextIndex === currentIndex && animate) return;

    const prevIndex = currentIndex;
    isTransitioning = animate;

    if (prevIndex !== nextIndex) {
      slides[prevIndex]?.classList.remove('is-active');
      slides[prevIndex]?.classList.add('is-leaving');
      slides[prevIndex]?.setAttribute('aria-hidden', 'true');
    }

    currentIndex = nextIndex;

    track.style.transition = animate
      ? `transform ${TRANSITION_MS}ms ${EASING}`
      : 'none';
    track.style.transform = `translate3d(-${currentIndex * slideWidth}px, 0, 0)`;

    updateDots();

    const finish = () => {
      if (prevIndex !== nextIndex) {
        slides[prevIndex]?.classList.remove('is-leaving');
      }
      slides[currentIndex]?.classList.add('is-active');
      slides[currentIndex]?.setAttribute('aria-hidden', 'false');
      isTransitioning = false;
    };

    if (animate && prevIndex !== nextIndex) {
      setTimeout(finish, TRANSITION_MS);
    } else {
      finish();
    }
  }

  function nextSlide() {
    goToSlide(currentIndex + 1);
  }

  function prevSlide() {
    goToSlide(currentIndex - 1);
  }

  function updateDots() {
    dotsRoot.querySelectorAll('.showcase__dot').forEach((dot, index) => {
      const isActive = index === currentIndex;
      dot.classList.toggle('is-active', isActive);
      dot.setAttribute('aria-selected', isActive ? 'true' : 'false');

      if (isActive) {
        const fill = dot.querySelector('.showcase__dot-fill');
        if (fill) {
          fill.style.animation = 'none';
          void fill.offsetWidth;
          fill.style.animation = '';
        }
      }
    });
  }

  function startAutoplay() {
    stopAutoplay();
    autoTimer = setInterval(() => nextSlide(), AUTO_INTERVAL_MS);
  }

  function stopAutoplay() {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
  }

  function resetAutoplay() {
    stopAutoplay();
    if (!section.matches(':hover') && !touchResumeTimer) {
      startAutoplay();
    }
  }
}

export function initShowcase() {
  renderShowcase();
  initShowcaseCarousel();
}

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
