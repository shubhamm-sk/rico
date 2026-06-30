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

// ── Render one slide group (optionally a loop clone) ───────────────────────
function renderSlideGroup(group, groupIndex, groups, chunkSize, options = {}) {
  const { isClone = false, eager = false } = options;
  const isSingleInPair = group.length === 1 && chunkSize === 2;
  const innerClass = isSingleInPair ? ' showcase__slide-inner--single' : '';
  const cloneClass = isClone ? ' showcase__slide--clone' : '';
  const cloneAttr = isClone ? ' data-clone="prefix"' : ` data-group-index="${groupIndex}"`;

  const blocks = group
    .map((item, itemIndex) => {
      const slotClass = itemIndex === 0 ? 'showcase__product--a' : 'showcase__product--b';
      const globalIndex = getGlobalIndex(groupIndex, itemIndex, groups);
      return renderProductBlock(item, slotClass, globalIndex, eager);
    })
    .join('');

  return `
    <article
      class="showcase__slide${cloneClass}"
      ${cloneAttr}
      aria-hidden="true"
    >
      <div class="showcase__slide-bg" aria-hidden="true"></div>
      <div class="showcase__slide-inner${innerClass}">${blocks}</div>
    </article>
  `;
}

// ── Render all slide groups into #showcaseTrack ────────────────────────────
function renderShowcase() {
  const track = document.getElementById('showcaseTrack');
  if (!track) return getSlideGroups();

  const groups = getSlideGroups();
  const chunkSize = getChunkSize();

  const reversedSlides = groups
    .slice()
    .reverse()
    .map((group, reversedPos) => {
      const groupIndex = groups.length - 1 - reversedPos;
      return renderSlideGroup(group, groupIndex, groups, chunkSize, {
        eager: groupIndex <= 1,
      });
    })
    .join('');

  const loopClone = renderSlideGroup(groups[0], 0, groups, chunkSize, {
    isClone: true,
    eager: true,
  });

  track.innerHTML = loopClone + reversedSlides;

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
  let slides = [];
  let total = 0;
  let currentIndex = 0;
  let anchorProductIndex = 0;
  let isTransitioning = false;
  let autoplayTimer = null;
  let touchResumeTimer = null;
  let transitionFallbackTimer = null;
  let slideWidth = 0;
  let touchStartX = 0;
  let isHovered = false;

  /** Pixel offset for logical index (prefix clone sits at offset 0). */
  function getTrackOffset(logicalIndex) {
    return (groups.length - logicalIndex) * slideWidth;
  }

  function syncSlides() {
    slides = groups.map((_, index) =>
      track.querySelector(`.showcase__slide[data-group-index="${index}"]`)
    ).filter(Boolean);
    total = slides.length;
  }

  function setTrackOffsetPx(offsetPx, animate = true) {
    const x = Math.round(offsetPx);

    if (!animate) {
      track.classList.add('is-instant');
      track.style.transform = `translate3d(-${x}px, 0, 0)`;
      requestAnimationFrame(() => {
        track.classList.remove('is-instant');
      });
      return;
    }

    track.classList.remove('is-instant');
    requestAnimationFrame(() => {
      track.style.transform = `translate3d(-${x}px, 0, 0)`;
    });
  }

  function clearTransitionFallback() {
    if (transitionFallbackTimer) {
      clearTimeout(transitionFallbackTimer);
      transitionFallbackTimer = null;
    }
  }

  function waitForTrackTransition(onComplete) {
    clearTransitionFallback();
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      track.removeEventListener('transitionend', onTransitionEnd);
      clearTransitionFallback();
      onComplete();
    };

    const onTransitionEnd = (event) => {
      if (event.target !== track || event.propertyName !== 'transform') return;
      finish();
    };

    track.addEventListener('transitionend', onTransitionEnd);
    transitionFallbackTimer = setTimeout(finish, TRANSITION_MS + 80);
  }

  function activateSlide(logicalIndex) {
    slides.forEach((slide, index) => {
      if (!slide) return;
      const isActive = index === logicalIndex;
      slide.classList.toggle('is-active', isActive);
      slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
    });
  }

  function preloadSlideImages(logicalIndex) {
    const slide = slides[logicalIndex];
    if (!slide) return;

    slide.querySelectorAll('.showcase__image').forEach((img) => {
      if (!(img instanceof HTMLImageElement)) return;
      if (img.complete && img.naturalWidth > 0) return;
      img.loading = 'eager';
      img.decode?.().catch(() => {});
    });
  }

  function preloadAdjacentSlides() {
    if (total <= 1) return;
    preloadSlideImages((currentIndex + 1) % total);
    preloadSlideImages((currentIndex - 1 + total) % total);
  }

  function completeLoopWrap() {
    setTrackOffsetPx(getTrackOffset(0), false);
    activateSlide(0);
    isTransitioning = false;
    preloadAdjacentSlides();
  }

  function runLoopWrapTransition() {
    isTransitioning = true;
    slides[currentIndex]?.classList.remove('is-active');
    slides[currentIndex]?.setAttribute('aria-hidden', 'true');

    currentIndex = 0;
    anchorProductIndex = getGlobalIndex(0, 0, groups);
    updateDots();
    preloadSlideImages(0);

    setTrackOffsetPx(0, true);

    waitForTrackTransition(() => {
      requestAnimationFrame(() => {
        completeLoopWrap();
      });
    });
  }

  const onPrevClick = () => {
    prevSlide();
    resetAutoplay();
  };

  const onNextClick = () => {
    nextSlide();
    resetAutoplay();
  };

  const onMouseEnter = () => {
    isHovered = true;
    stopAutoplay();
  };

  const onMouseLeave = () => {
    isHovered = false;
    if (!touchResumeTimer) {
      resetAutoplay();
    }
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
    viewport.addEventListener('mouseenter', onMouseEnter);
    viewport.addEventListener('mouseleave', onMouseLeave);
    viewport.addEventListener('touchstart', onTouchStart, { passive: true });
    viewport.addEventListener('touchend', onTouchEnd, { passive: true });
  }

  function unbindEvents() {
    prevBtn?.removeEventListener('click', onPrevClick);
    nextBtn?.removeEventListener('click', onNextClick);
    [prevBtn, nextBtn].forEach((btn) => btn?.removeEventListener('keydown', onKeydown));
    viewport.removeEventListener('mouseenter', onMouseEnter);
    viewport.removeEventListener('mouseleave', onMouseLeave);
    viewport.removeEventListener('touchstart', onTouchStart);
    viewport.removeEventListener('touchend', onTouchEnd);
  }

  function refreshDom() {
    groups = getSlideGroups();
    syncSlides();
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
    slideWidth = Math.round(viewport.offsetWidth);
    const trackSlides = track.querySelectorAll('.showcase__slide');
    track.style.width = `${slideWidth * trackSlides.length}px`;
    trackSlides.forEach((slide) => {
      slide.style.width = `${slideWidth}px`;
      slide.style.flexBasis = `${slideWidth}px`;
    });
  }

  function clearTouchResumeTimer() {
    if (touchResumeTimer) {
      clearTimeout(touchResumeTimer);
      touchResumeTimer = null;
    }
  }

  function onTouchStart(event) {
    touchStartX = event.changedTouches[0].clientX;
    stopAutoplay();
    clearTouchResumeTimer();
  }

  function onTouchEnd(event) {
    const dx = event.changedTouches[0].clientX - touchStartX;

    if (Math.abs(dx) > SWIPE_THRESHOLD) {
      if (dx < 0) nextSlide();
      else prevSlide();
      resetAutoplay();
      return;
    }

    clearTouchResumeTimer();
    touchResumeTimer = setTimeout(() => {
      touchResumeTimer = null;
      if (!isHovered) {
        resetAutoplay();
      }
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
    const isLoopWrap = prevIndex === total - 1 && nextIndex === 0 && animate;

    if (isLoopWrap) {
      runLoopWrapTransition();
      return;
    }

    if (prevIndex !== nextIndex) {
      slides[prevIndex]?.classList.remove('is-active');
      slides[prevIndex]?.setAttribute('aria-hidden', 'true');
    }

    currentIndex = nextIndex;
    anchorProductIndex = getGlobalIndex(currentIndex, 0, groups);
    preloadSlideImages(currentIndex);

    if (animate && prevIndex !== nextIndex) {
      isTransitioning = true;
      updateDots();
      setTrackOffsetPx(getTrackOffset(currentIndex), true);

      waitForTrackTransition(() => {
        activateSlide(currentIndex);
        isTransitioning = false;
        preloadAdjacentSlides();
      });
      return;
    }

    setTrackOffsetPx(getTrackOffset(currentIndex), false);
    updateDots();
    activateSlide(currentIndex);
    preloadAdjacentSlides();
  }

  function nextSlide() {
    goToSlide(currentIndex + 1);
  }

  function prevSlide() {
    goToSlide(currentIndex - 1);
  }

  /** Autoplay tick — advances groups forward with left-to-right track motion. */
  function autoplayStep() {
    if (isTransitioning) return;
    nextSlide();
  }

  function updateDots() {
    dotsRoot.querySelectorAll('.showcase__dot').forEach((dot, index) => {
      const isActive = index === currentIndex;
      dot.classList.toggle('is-active', isActive);
      dot.setAttribute('aria-selected', isActive ? 'true' : 'false');

      if (isActive) {
        const fill = dot.querySelector('.showcase__dot-fill');
        if (fill) {
          requestAnimationFrame(() => {
            fill.style.animation = 'none';
            requestAnimationFrame(() => {
              fill.style.animation = '';
            });
          });
        }
      }
    });
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(autoplayStep, AUTO_INTERVAL_MS);
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function resetAutoplay() {
    stopAutoplay();
    if (!isHovered && !touchResumeTimer) {
      startAutoplay();
    }
  }

  function goToProductAnchor(productIndex) {
    const groupIndex = findGroupIndexForProduct(productIndex, groups);
    goToSlide(groupIndex, false);
  }

  function destroy() {
    stopAutoplay();
    clearTouchResumeTimer();
    clearTransitionFallback();
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
