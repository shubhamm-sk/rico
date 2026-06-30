/**
 * Premium Cinematic Product Showcase
 * Groups products into pairs (desktop/tablet) or singles (mobile) per slide.
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
const MOBILE_BREAKPOINT = 768;

// ── Helpers ────────────────────────────────────────────────────────────────
function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

function getChunkSize() {
  return window.innerWidth < MOBILE_BREAKPOINT ? 1 : 2;
}

function getSlideGroups() {
  return chunkArray(products, getChunkSize());
}

function getGlobalIndex(groupIndex, itemIndex, groups) {
  let index = 0;
  for (let g = 0; g < groupIndex; g += 1) {
    index += groups[g].length;
  }
  return index + itemIndex;
}

function findGroupIndexForProduct(productIndex, groups) {
  let cursor = 0;
  for (let g = 0; g < groups.length; g += 1) {
    if (productIndex >= cursor && productIndex < cursor + groups[g].length) {
      return g;
    }
    cursor += groups[g].length;
  }
  return 0;
}

// ── Render one product block inside a slide ────────────────────────────────
function renderProductBlock(item, slotClass, globalIndex, eager) {
  return `
    <div class="showcase__product ${slotClass}" data-product-index="${globalIndex}">
      <div class="showcase__details">
        <h3 class="showcase__name">${item.name}</h3>
        <p class="showcase__code">${item.code}</p>
        <p class="showcase__discount">${item.discount}</p>
        <p class="showcase__price">${item.price}</p>
      </div>
      <div class="showcase__visual">
        <div class="showcase__glow" aria-hidden="true"></div>
        <div class="showcase__float">
          <div class="showcase__image-wrap">
            <img
              class="showcase__image"
              src="assets/product/${item.image}"
              alt="${item.name}"
              loading="${eager ? 'eager' : 'lazy'}"
              decoding="async"
            >
          </div>
        </div>
      </div>
    </div>
  `;
}

// ── Render all slide groups into #showcaseTrack ────────────────────────────
function renderShowcase() {
  const track = document.getElementById('showcaseTrack');
  if (!track) return getSlideGroups();

  const groups = getSlideGroups();
  const chunkSize = getChunkSize();

  track.innerHTML = groups
    .map((group, groupIndex) => {
      const isSingleInPair = group.length === 1 && chunkSize === 2;
      const innerClass = isSingleInPair ? ' showcase__slide-inner--single' : '';

      const blocks = group
        .map((item, itemIndex) => {
          const slotClass = itemIndex === 0 ? 'showcase__product--a' : 'showcase__product--b';
          const globalIndex = getGlobalIndex(groupIndex, itemIndex, groups);
          const eager = groupIndex === 0;
          return renderProductBlock(item, slotClass, globalIndex, eager);
        })
        .join('');

      return `
        <article
          class="showcase__slide"
          data-group-index="${groupIndex}"
          aria-hidden="${groupIndex === 0 ? 'false' : 'true'}"
        >
          <div class="showcase__slide-bg" aria-hidden="true"></div>
          <div class="showcase__slide-inner${innerClass}">${blocks}</div>
        </article>
      `;
    })
    .join('');

  return groups;
}

// ── Carousel controller ────────────────────────────────────────────────────
function createShowcaseCarousel() {
  const section = document.getElementById('showcaseSection');
  const viewport = section?.querySelector('.showcase__viewport');
  const track = document.getElementById('showcaseTrack');
  const prevBtn = document.getElementById('showcasePrev');
  const nextBtn = document.getElementById('showcaseNext');
  const dotsRoot = document.getElementById('showcaseDots');

  if (!section || !viewport || !track || !dotsRoot) {
    return { destroy() {}, getAnchorProductIndex: () => 0, isMobile: getChunkSize() === 1 };
  }

  let groups = getSlideGroups();
  let slides = [...track.querySelectorAll('.showcase__slide')];
  let total = slides.length;
  let currentIndex = 0;
  let anchorProductIndex = 0;
  let isTransitioning = false;
  let autoTimer = null;
  let touchResumeTimer = null;
  let slideWidth = 0;
  let touchStartX = 0;

  const onPrevClick = () => {
    prevSlide();
    resetAutoplay();
  };

  const onNextClick = () => {
    nextSlide();
    resetAutoplay();
  };

  const onMouseEnter = () => stopAutoplay();
  const onMouseLeave = () => {
    if (!touchResumeTimer) startAutoplay();
  };

  const onKeydown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.currentTarget.click();
    }
  };

  function bindEvents() {
    prevBtn?.addEventListener('click', onPrevClick);
    nextBtn?.addEventListener('click', onNextClick);
    [prevBtn, nextBtn].forEach((btn) => btn?.addEventListener('keydown', onKeydown));
    section.addEventListener('mouseenter', onMouseEnter);
    section.addEventListener('mouseleave', onMouseLeave);
    viewport.addEventListener('touchstart', onTouchStart, { passive: true });
    viewport.addEventListener('touchend', onTouchEnd, { passive: true });
  }

  function unbindEvents() {
    prevBtn?.removeEventListener('click', onPrevClick);
    nextBtn?.removeEventListener('click', onNextClick);
    [prevBtn, nextBtn].forEach((btn) => btn?.removeEventListener('keydown', onKeydown));
    section.removeEventListener('mouseenter', onMouseEnter);
    section.removeEventListener('mouseleave', onMouseLeave);
    viewport.removeEventListener('touchstart', onTouchStart);
    viewport.removeEventListener('touchend', onTouchEnd);
  }

  function refreshDom() {
    groups = getSlideGroups();
    slides = [...track.querySelectorAll('.showcase__slide')];
    total = slides.length;
    buildDots();
    measure();
  }

  function init() {
    refreshDom();
    goToSlide(0, false);
    startAutoplay();
    bindEvents();
  }

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
      resetAutoplay();
    }

    touchResumeTimer = setTimeout(() => {
      touchResumeTimer = null;
      if (!section.matches(':hover')) startAutoplay();
    }, TOUCH_RESUME_MS);
  }

  function buildDots() {
    dotsRoot.innerHTML = groups
      .map(
        (_, index) => `
          <button
            class="showcase__dot${index === 0 ? ' is-active' : ''}"
            type="button"
            role="tab"
            aria-label="Go to product group ${index + 1}"
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
    if (total === 0) return;
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
    anchorProductIndex = getGlobalIndex(currentIndex, 0, groups);

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

  function goToProductAnchor(productIndex) {
    const groupIndex = findGroupIndexForProduct(productIndex, groups);
    goToSlide(groupIndex, false);
  }

  function destroy() {
    stopAutoplay();
    if (touchResumeTimer) clearTimeout(touchResumeTimer);
    unbindEvents();
  }

  init();

  return {
    destroy,
    measure,
    goToSlide,
    goToProductAnchor,
    getAnchorProductIndex: () => anchorProductIndex,
    get currentIndex() {
      return currentIndex;
    },
    get isMobile() {
      return getChunkSize() === 1;
    },
  };
}

let carouselController = null;
let lastChunkSize = getChunkSize();

export function initShowcase() {
  renderShowcase();
  carouselController?.destroy();
  carouselController = createShowcaseCarousel();
  lastChunkSize = getChunkSize();

  window.addEventListener(
    'resize',
    debounce(() => {
      const newChunkSize = getChunkSize();
      const anchor = carouselController?.getAnchorProductIndex() ?? 0;

      if (newChunkSize !== lastChunkSize) {
        lastChunkSize = newChunkSize;
        carouselController?.destroy();
        renderShowcase();
        carouselController = createShowcaseCarousel();
        carouselController.goToProductAnchor(anchor);
      } else {
        carouselController?.measure();
        carouselController?.goToSlide(carouselController.currentIndex, false);
      }
    }, 150)
  );
}

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
