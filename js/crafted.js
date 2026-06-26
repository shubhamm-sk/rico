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
              <img
                class="crafted__image"
                id="craftedImage"
                src="${data.main_image}"
                alt="Crafted with innovations - exploded product view"
                loading="lazy"
                decoding="async"
                draggable="false"
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

// CRAFTED SECTION: scroll animation
function initDesktopScrollAnimation(section) {
  const pinWrap = section.querySelector('#craftedPinWrap');
  const imageWrap = section.querySelector('#craftedImageWrap');
  const image = section.querySelector('#craftedImage');
  const quote = section.querySelector('#craftedQuote');
  const words = quote.querySelectorAll('.crafted__word');

  gsap.set(image, {
    scale: 1,
    y: 0,
    filter: 'brightness(1) contrast(1)',
    transformOrigin: '50% 50%',
    force3D: true,
  });

  gsap.set(words, { opacity: 0.2 });

  const timeline = gsap.timeline({
    defaults: { ease: 'power2.out' },
    scrollTrigger: {
      trigger: pinWrap,
      start: 'top top',
      end: '+=160%',
      pin: true,
      scrub: 0.65,
      anticipatePin: 1,
    },
  });

  timeline.to(
    image,
    {
      scale: 1.05,
      y: -18,
      filter: 'brightness(1.08) contrast(1.05)',
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

  initDragInteraction(imageWrap, image);
}

function initMobileAnimation(section) {
  section.classList.add('crafted--mobile');

  const image = section.querySelector('#craftedImage');
  const quote = section.querySelector('#craftedQuote');

  gsap.fromTo(
    image,
    { opacity: 0, scale: 0.9, y: 24 },
    {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 1.1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: section,
        start: 'top 78%',
        toggleActions: 'play none none reverse',
      },
    }
  );

  gsap.fromTo(
    quote,
    { opacity: 0, y: 18 },
    {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: 'power2.out',
      delay: 0.12,
      scrollTrigger: {
        trigger: section,
        start: 'top 68%',
        toggleActions: 'play none none reverse',
      },
    }
  );
}

// CRAFTED SECTION: drag interaction
function initDragInteraction(imageWrap, image) {
  if (isMobileExperience()) return;

  let isDragging = false;
  let startX = 0;
  let rotateY = 0;
  let translateX = 0;

  const applyTilt = () => {
    gsap.set(image, {
      rotateY,
      x: translateX,
      transformPerspective: 900,
      force3D: true,
    });
  };

  const onPointerDown = (event) => {
    if (!event.isPrimary) return;
    isDragging = true;
    startX = event.clientX;
    imageWrap.setPointerCapture(event.pointerId);
    imageWrap.classList.add('is-dragging');
  };

  const onPointerMove = (event) => {
    if (!isDragging) return;
    const delta = (event.clientX - startX) / imageWrap.offsetWidth;
    rotateY = gsap.utils.clamp(-10, 10, delta * 28);
    translateX = gsap.utils.clamp(-18, 18, delta * 36);
    applyTilt();
  };

  const endDrag = (event) => {
    if (!isDragging) return;
    isDragging = false;
    imageWrap.classList.remove('is-dragging');
    if (imageWrap.hasPointerCapture(event.pointerId)) {
      imageWrap.releasePointerCapture(event.pointerId);
    }
    gsap.to(image, {
      rotateY: 0,
      x: 0,
      duration: 0.45,
      ease: 'power2.out',
    });
  };

  imageWrap.addEventListener('pointerdown', onPointerDown);
  imageWrap.addEventListener('pointermove', onPointerMove);
  imageWrap.addEventListener('pointerup', endDrag);
  imageWrap.addEventListener('pointercancel', endDrag);
}

export function initCrafted(containerId = 'craftedRoot') {
  const container = document.getElementById(containerId);
  if (!container) return;

  renderSection(container, CRAFTED_SECTION_DATA);

  const section = container.querySelector('#craftedSection');
  if (!section) return;

  if (isMobileExperience()) {
    initMobileAnimation(section);
    return;
  }

  initDesktopScrollAnimation(section);

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 200);
  });
}
