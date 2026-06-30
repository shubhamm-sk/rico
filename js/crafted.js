import gsap from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/+esm';
import { ScrollTrigger } from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/ScrollTrigger/+esm';

gsap.registerPlugin(ScrollTrigger);

// CRAFTED SECTION: data
export const CRAFTED_SECTION_DATA = {
  heading: 'Crafted with Innovations',
  subheading: 'Innovation Inside Every Detail',
  main_image: 'assets/product/main.png',
  quote_highlighted:
    'For over 60 years, RICO has invested in research, engineering, and',
  quote_muted:
    'product development to create appliances designed for modern homes and built for years of dependable performance.',
};

const MOBILE_BREAKPOINT = 768;
const CRAFTED_ST_ID = 'crafted-assembly';

/**
 * Part layers use clip-path regions of the single exploded main.png (fallback).
 * At progress 0 each part sits at (0,0) — the natural exploded layout in the image.
 * At progress 1 parts translate inward (assembleX/Y) toward the main body anchor.
 */
const CRAFTED_PARTS = [
  {
    id: 'nozzle',
    clip: 'polygon(2% 8%, 22% 8%, 24% 38%, 4% 36%)',
    assembleX: 195,
    assembleY: 118,
    assembleRotate: 4,
  },
  {
    id: 'housing-large',
    clip: 'polygon(12% 12%, 46% 10%, 48% 58%, 14% 56%)',
    assembleX: 142,
    assembleY: 82,
    assembleRotate: 2,
  },
  {
    id: 'core-cone',
    clip: 'polygon(28% 22%, 54% 20%, 56% 62%, 30% 60%)',
    assembleX: 98,
    assembleY: 52,
    assembleRotate: 1,
  },
  {
    id: 'ribs',
    clip: 'polygon(44% 26%, 63% 24%, 65% 66%, 46% 64%)',
    assembleX: 58,
    assembleY: 28,
    assembleRotate: 0,
  },
  {
    id: 'housing-small',
    clip: 'polygon(54% 34%, 73% 32%, 75% 72%, 56% 70%)',
    assembleX: 32,
    assembleY: 10,
    assembleRotate: -1,
  },
  {
    id: 'body',
    clip: 'polygon(64% 38%, 99% 36%, 99% 98%, 62% 96%)',
    assembleX: 0,
    assembleY: 0,
    assembleRotate: 0,
  },
];

let craftedScrollTriggers = [];

function isMobileExperience() {
  return (
    window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches ||
    window.matchMedia('(hover: none) and (pointer: coarse)').matches
  );
}

function wrapWords(text, className) {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => `<span class="${className} crafted__word">${word}</span>`)
    .join(' ');
}

function buildQuoteMarkup(data) {
  return `
    <span class="crafted__quote--bright">"${wrapWords(data.quote_highlighted, 'crafted__quote-word--bright')}</span>
    <span class="crafted__quote--muted"> ${wrapWords(data.quote_muted, 'crafted__quote-word--muted')}"</span>
  `;
}

function buildPartsMarkup(imageSrc) {
  return CRAFTED_PARTS.map(
    (part) => `
      <div
        class="crafted__part"
        data-part="${part.id}"
        data-explode-x="0"
        data-explode-y="0"
        data-explode-rotate="0"
        style="--part-clip: ${part.clip}; --part-image: url('${imageSrc}')"
        aria-hidden="true"
      ></div>
    `
  ).join('');
}

function renderSection(container, data) {
  container.innerHTML = `
    <section class="crafted" id="craftedSection" aria-label="${data.heading}">
      <div class="crafted__pin-wrap" id="craftedPinWrap">
        <div class="crafted__inner">
          <header class="crafted__header">
            <h2 class="crafted__heading">${data.heading}</h2>
            <p class="crafted__subheading">${data.subheading}</p>
          </header>

          <div class="crafted__stage">
            <div class="crafted__drag-hint" id="craftedDragHint" aria-hidden="true">
              <span class="crafted__hand">✋</span>
            </div>

            <div class="crafted__image-wrap" id="craftedImageWrap">
              <div class="crafted__parts" id="craftedImage" role="img" aria-label="Crafted with innovations - exploded product view">
                ${buildPartsMarkup(data.main_image)}
              </div>
              <img
                class="crafted__image crafted__image--preload"
                src="${data.main_image}"
                alt=""
                loading="eager"
                decoding="async"
                draggable="false"
                aria-hidden="true"
              />
            </div>
          </div>

          <blockquote class="crafted__quote" id="craftedQuote">
            ${buildQuoteMarkup(data)}
          </blockquote>
        </div>
      </div>
    </section>
  `;
}

function killCraftedScrollTriggers() {
  craftedScrollTriggers.forEach((st) => st.kill());
  craftedScrollTriggers = [];
}

function waitForCraftedAssets(section) {
  const preloadImg = section.querySelector('.crafted__image--preload');
  if (!preloadImg) return Promise.resolve();

  if (preloadImg.complete && preloadImg.naturalWidth > 0) {
    return preloadImg.decode?.().catch(() => undefined) ?? Promise.resolve();
  }

  return new Promise((resolve) => {
    const done = () => resolve();
    preloadImg.addEventListener('load', done, { once: true });
    preloadImg.addEventListener('error', done, { once: true });
  });
}

// CRAFTED SECTION: scroll animation
function initScrollAssemblyAnimation(section) {
  const stage = section.querySelector('.crafted__stage');
  const pinWrap = section.querySelector('#craftedPinWrap');
  const partsRoot = section.querySelector('#craftedImage');
  const partEls = section.querySelectorAll('.crafted__part');
  const dragHint = section.querySelector('#craftedDragHint');
  const quote = section.querySelector('#craftedQuote');
  const words = quote.querySelectorAll('.crafted__word');

  gsap.set(partEls, {
    x: 0,
    y: 0,
    rotate: 0,
    force3D: true,
    transformOrigin: '50% 50%',
  });

  gsap.set(words, { opacity: 0.2 });

  if (dragHint) {
    gsap.set(dragHint, { opacity: 1 });
  }

  const timeline = gsap.timeline({
    defaults: { ease: 'power2.out' },
    scrollTrigger: {
      id: CRAFTED_ST_ID,
      trigger: stage,
      start: 'top top',
      end: '+=120%',
      pin: pinWrap,
      scrub: 0.6,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });

  const imageWrap = section.querySelector('#craftedImageWrap');
  const offsetScale = (imageWrap?.offsetWidth || 900) / 900;

  partEls.forEach((el) => {
    const config = CRAFTED_PARTS.find((p) => p.id === el.dataset.part);
    if (!config) return;

    timeline.fromTo(
      el,
      { x: 0, y: 0, rotate: 0 },
      {
        x: config.assembleX * offsetScale,
        y: config.assembleY * offsetScale,
        rotate: config.assembleRotate || 0,
        duration: 1,
      },
      0
    );
  });

  timeline.to(
    partsRoot,
    {
      scale: 1.04,
      y: -12,
      duration: 0.65,
    },
    0
  );

  timeline.to(
    words,
    {
      opacity: 1,
      stagger: 0.015,
      duration: 0.45,
    },
    0.55
  );

  if (dragHint) {
    timeline.to(
      dragHint,
      {
        opacity: 0,
        duration: 0.12,
      },
      0.08
    );
  }

  craftedScrollTriggers.push(timeline.scrollTrigger);
}

function initMobileAnimation(section) {
  section.classList.add('crafted--mobile');
  initScrollAssemblyAnimation(section);
}

export function initCrafted(containerId = 'craftedRoot') {
  const container = document.getElementById(containerId);
  if (!container) return;

  killCraftedScrollTriggers();

  renderSection(container, CRAFTED_SECTION_DATA);

  const section = container.querySelector('#craftedSection');
  if (!section) return;

  const boot = () => {
    killCraftedScrollTriggers();

    if (isMobileExperience()) {
      initMobileAnimation(section);
    } else {
      initScrollAssemblyAnimation(section);
    }

    ScrollTrigger.refresh();
  };

  waitForCraftedAssets(section).then(boot);

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 200);
  });
}
