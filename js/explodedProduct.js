import gsap from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/+esm';
import { ScrollTrigger } from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/ScrollTrigger/+esm';

gsap.registerPlugin(ScrollTrigger);

export const SECTION_DATA = {
  heading: 'Crafted with Innovations',
  subheading: 'Innovation Inside Every Detail',
  main_image: 'assets/images/product-exploded-view.svg',
  quote_highlighted:
    'For over 60 years, RICO has invested in research, engineering, and',
  quote_muted:
    'product development to create appliances designed for modern homes and built for years of dependable performance.',
};

const MOBILE_BREAKPOINT = 768;

function isMobileExperience() {
  return (
    window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches ||
    window.matchMedia('(hover: none) and (pointer: coarse)').matches
  );
}

function buildQuoteMarkup(data) {
  return `
    <span class="crafted-innovations__quote-highlight">"${data.quote_highlighted}</span>
    <span class="crafted-innovations__quote-muted"> ${data.quote_muted}"</span>
  `;
}

function renderSection(container, data) {
  container.innerHTML = `
    <section class="crafted-innovations" id="craftedInnovations" aria-label="${data.heading}">
      <div class="crafted-innovations__pin-wrap">
        <div class="crafted-innovations__inner">
          <header class="crafted-innovations__heading">
            <h2 class="crafted-innovations__title">${data.heading}</h2>
            <p class="crafted-innovations__subtitle">${data.subheading}</p>
          </header>

          <div class="crafted-innovations__stage" id="craftedStage">
            <div class="crafted-innovations__drag-hint" id="craftedDragHint" aria-hidden="true">
              <span class="crafted-innovations__hand"></span>
              <span class="crafted-innovations__drag-label">Scroll to assemble</span>
            </div>

            <div class="crafted-innovations__product" id="craftedProduct">
              <img
                class="crafted-innovations__main-image"
                id="craftedMainImage"
                src="${data.main_image}"
                alt="Exploded product view"
                loading="lazy"
                decoding="async"
                draggable="false"
              />
            </div>
          </div>

          <blockquote class="crafted-innovations__quote" id="craftedQuote">
            ${buildQuoteMarkup(data)}
          </blockquote>
        </div>
      </div>
    </section>
  `;
}

function initMobileAnimation(section, image, quote) {
  section.classList.add('crafted-innovations--mobile');

  gsap.fromTo(
    image,
    { opacity: 0, scale: 0.94, y: 28 },
    {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 1.1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: section,
        start: 'top 75%',
        toggleActions: 'play none none reverse',
      },
    }
  );

  gsap.fromTo(
    quote,
    { opacity: 0, y: 20 },
    {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: 'power2.out',
      delay: 0.15,
      scrollTrigger: {
        trigger: section,
        start: 'top 65%',
        toggleActions: 'play none none reverse',
      },
    }
  );
}

function initDesktopAnimation(section) {
  const pinWrap = section.querySelector('.crafted-innovations__pin-wrap');
  const product = section.querySelector('#craftedProduct');
  const image = section.querySelector('#craftedMainImage');
  const quote = section.querySelector('#craftedQuote');
  const dragHint = section.querySelector('#craftedDragHint');
  const highlight = quote.querySelector('.crafted-innovations__quote-highlight');
  const muted = quote.querySelector('.crafted-innovations__quote-muted');

  gsap.set(image, {
    scale: 1.14,
    x: 28,
    y: -32,
    rotation: 3,
    transformOrigin: '50% 50%',
    force3D: true,
  });

  gsap.to(dragHint, {
    x: 10,
    duration: 1.4,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1,
  });

  const timeline = gsap.timeline({
    defaults: { ease: 'power2.out' },
    scrollTrigger: {
      trigger: pinWrap,
      start: 'top top',
      end: '+=150%',
      pin: true,
      scrub: 0.65,
      anticipatePin: 1,
    },
  });

  timeline.to(
    image,
    {
      scale: 1,
      x: 0,
      y: 0,
      rotation: 0,
      duration: 1,
    },
    0
  );

  timeline.fromTo(
    quote,
    { opacity: 0.3, y: 20 },
    { opacity: 1, y: 0, duration: 0.55 },
    0.4
  );

  timeline.fromTo(highlight, { opacity: 0.45 }, { opacity: 1, duration: 0.4 }, 0.5);
  timeline.fromTo(muted, { opacity: 0.15 }, { opacity: 1, duration: 0.45 }, 0.65);

  initDragInteraction(product, timeline);
}

function initDragInteraction(product, timeline) {
  let isDragging = false;
  let startX = 0;
  let startProgress = 0;

  const setProgress = (progress) => {
    timeline.progress(gsap.utils.clamp(0, 1, progress));
  };

  const onPointerDown = (event) => {
    if (!event.isPrimary) return;
    isDragging = true;
    startX = event.clientX;
    startProgress = timeline.progress();
    product.setPointerCapture(event.pointerId);
    product.classList.add('is-dragging');
  };

  const onPointerMove = (event) => {
    if (!isDragging) return;
    const delta = (event.clientX - startX) / product.offsetWidth;
    setProgress(startProgress + delta * 1.25);
  };

  const endDrag = (event) => {
    if (!isDragging) return;
    isDragging = false;
    product.classList.remove('is-dragging');
    if (product.hasPointerCapture(event.pointerId)) {
      product.releasePointerCapture(event.pointerId);
    }
  };

  product.addEventListener('pointerdown', onPointerDown);
  product.addEventListener('pointermove', onPointerMove);
  product.addEventListener('pointerup', endDrag);
  product.addEventListener('pointercancel', endDrag);
}

export function initExplodedProduct(containerId = 'explodedProductRoot') {
  const container = document.getElementById(containerId);
  if (!container) return;

  renderSection(container, SECTION_DATA);

  const section = container.querySelector('.crafted-innovations');
  const image = section.querySelector('#craftedMainImage');
  const quote = section.querySelector('#craftedQuote');

  if (isMobileExperience()) {
    initMobileAnimation(section, image, quote);
    return;
  }

  initDesktopAnimation(section);

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 200);
  });
}
