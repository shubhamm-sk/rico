import gsap from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/+esm';
import { ScrollTrigger } from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/ScrollTrigger/+esm';

gsap.registerPlugin(ScrollTrigger);

export const CRAFTED_SECTION_DATA = {
  heading: 'Crafted with Innovations',
  subheading: 'Innovation Inside Every Detail',
  main_image: 'assets/product/main.png',
  quote_highlighted:
    'For over 60 years, RICO has invested in research, engineering, and',
  quote_muted:
    ' product development to create appliances designed for modern homes and built for years of dependable performance.',
};

const MOBILE_MQ = window.matchMedia('(max-width: 768px)');
const TABLET_MQ = window.matchMedia('(max-width: 1024px)');

let scrollTriggerInstance = null;
let mobileObserver = null;
let resizeTimer = null;
let resizeBound = false;

function populateSection(section, data) {
  const title = section.querySelector('#craftedTitle');
  const subtitle = section.querySelector('#craftedSubtitle');
  const quoteBright = section.querySelector('#craftedQuoteBright');
  const quoteMuted = section.querySelector('#craftedQuoteMuted');
  const layers = section.querySelectorAll('[data-crafted-layer]');

  if (title) title.textContent = data.heading;
  if (subtitle) subtitle.textContent = data.subheading;
  if (quoteBright) quoteBright.textContent = `"${data.quote_highlighted}`;
  if (quoteMuted) quoteMuted.textContent = `${data.quote_muted}"`;

  layers.forEach((layer) => {
    layer.src = data.main_image;
  });
}

function teardownCrafted(section) {
  if (scrollTriggerInstance) {
    scrollTriggerInstance.kill();
    scrollTriggerInstance = null;
  }

  ScrollTrigger.getAll().forEach((trigger) => {
    if (trigger.trigger === section) trigger.kill();
  });

  if (mobileObserver) {
    mobileObserver.disconnect();
    mobileObserver = null;
  }

  gsap.killTweensOf(section.querySelectorAll('*'));
  section.classList.remove('crafted-with-innovations--mobile');
}

function initDesktopAnimation(section) {
  const stack = section.querySelector('#craftedImageStack');
  const handHint = section.querySelector('#craftedHandHint');
  const quoteBright = section.querySelector('#craftedQuoteBright');
  const quoteMuted = section.querySelector('#craftedQuoteMuted');
  const base = section.querySelector('[data-crafted-layer="base"]');
  const left = section.querySelector('[data-crafted-layer="left"]');
  const center = section.querySelector('[data-crafted-layer="center"]');
  const right = section.querySelector('[data-crafted-layer="right"]');

  if (!stack || !base || !left || !center || !right) return;

  const pinEnd = TABLET_MQ.matches ? '+=100%' : '+=150%';

  gsap.set(stack, {
    scale: 1.15,
    x: -40,
    y: -30,
    force3D: true,
  });

  gsap.set(base, {
    opacity: 0,
    scale: 1.05,
    filter: 'blur(4px)',
    force3D: true,
  });

  gsap.set([left, center, right], {
    opacity: 0.85,
    filter: 'blur(6px)',
    force3D: true,
  });

  gsap.set(left, { x: -90, y: -70, rotation: -4 });
  gsap.set(center, { x: 0, y: -55, rotation: 0 });
  gsap.set(right, { x: 90, y: 70, rotation: 4 });

  if (handHint) gsap.set(handHint, { opacity: 1 });
  if (quoteBright) gsap.set(quoteBright, { opacity: 0, y: 20 });
  if (quoteMuted) gsap.set(quoteMuted, { opacity: 0, y: 20 });

  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: pinEnd,
      pin: true,
      scrub: 1,
      anticipatePin: 1,
    },
  });

  scrollTriggerInstance = timeline.scrollTrigger;

  timeline
    .to(
      stack,
      {
        scale: 1,
        x: 0,
        y: 0,
        duration: 0.45,
        ease: 'power2.out',
      },
      0
    )
    .to(
      left,
      {
        x: 0,
        y: 0,
        rotation: 0,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 0.38,
        ease: 'power2.out',
      },
      0
    )
    .to(
      right,
      {
        x: 0,
        y: 0,
        rotation: 0,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 0.38,
        ease: 'power2.out',
      },
      0.06
    )
    .to(
      center,
      {
        x: 0,
        y: 0,
        rotation: 0,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 0.38,
        ease: 'power2.out',
      },
      0.12
    )
    .to(
      base,
      {
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
        duration: 0.42,
        ease: 'power2.out',
      },
      0.18
    );

  if (handHint) {
    timeline.to(
      handHint,
      {
        opacity: 0,
        duration: 0.12,
        ease: 'power2.out',
      },
      0.16
    );
  }

  if (quoteBright) {
    timeline.to(
      quoteBright,
      {
        opacity: 1,
        y: 0,
        duration: 0.22,
        ease: 'power2.out',
      },
      0.32
    );
  }

  if (quoteMuted) {
    timeline.to(
      quoteMuted,
      {
        opacity: 1,
        y: 0,
        duration: 0.28,
        ease: 'power2.out',
      },
      0.52
    );
  }
}

function initMobileAnimation(section) {
  section.classList.add('crafted-with-innovations--mobile');

  const stack = section.querySelector('#craftedImageStack');
  const base = section.querySelector('[data-crafted-layer="base"]');
  const quoteBright = section.querySelector('#craftedQuoteBright');
  const quoteMuted = section.querySelector('#craftedQuoteMuted');

  if (!stack || !base) return;

  gsap.set(stack, { scale: 0.95, opacity: 0, force3D: true });
  gsap.set(base, { opacity: 1, filter: 'none' });
  if (quoteBright) gsap.set(quoteBright, { opacity: 0, y: 16 });
  if (quoteMuted) gsap.set(quoteMuted, { opacity: 0, y: 16 });

  mobileObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        gsap.to(stack, {
          scale: 1,
          opacity: 1,
          duration: 0.85,
          ease: 'power2.out',
        });

        if (quoteBright) {
          gsap.to(quoteBright, {
            opacity: 1,
            y: 0,
            duration: 0.65,
            delay: 0.15,
            ease: 'power2.out',
          });
        }

        if (quoteMuted) {
          gsap.to(quoteMuted, {
            opacity: 1,
            y: 0,
            duration: 0.65,
            delay: 0.3,
            ease: 'power2.out',
          });
        }

        mobileObserver.disconnect();
        mobileObserver = null;
      });
    },
    { threshold: 0.25, rootMargin: '0px 0px -10% 0px' }
  );

  mobileObserver.observe(section);
}

function initCraftedAnimation(section) {
  teardownCrafted(section);

  if (MOBILE_MQ.matches) {
    initMobileAnimation(section);
  } else {
    initDesktopAnimation(section);
  }
}

export function initCrafted(data = CRAFTED_SECTION_DATA) {
  const section = document.getElementById('crafted-with-innovations');
  if (!section) return;

  populateSection(section, data);
  initCraftedAnimation(section);

  if (!resizeBound) {
    resizeBound = true;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        initCraftedAnimation(section);
        ScrollTrigger.refresh();
      }, 200);
    });
  }
}
