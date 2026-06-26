// SHOWCASE SECTION: data
const products = [
  {
    image: 'iron.webp',
    name: 'Classic Iron',
    code: 'IRN-1001',
    discount: '(40% OFF)',
    price: '₹1,299',
  },
  {
    image: 'iron2.webp',
    name: 'Pro Steam Iron',
    code: 'IRN-2002',
    discount: '(35% OFF)',
    price: '₹1,799',
  },
  {
    image: 'juser.webp',
    name: 'Citrus Juicer',
    code: 'CJ-2510',
    discount: '(50% OFF)',
    price: '₹1,499',
  },
  {
    image: 'Steel_Bowl.webp',
    name: 'Steel Mixing Bowl',
    code: 'SB-3005',
    discount: '(20% OFF)',
    price: '₹899',
  },
  {
    image: 'table_fan.webp',
    name: 'Breeze Table Fan',
    code: 'TF-4012',
    discount: '(30% OFF)',
    price: '₹2,199',
  },
  {
    image: 'torch.webp',
    name: 'Rechargeable Torch',
    code: 'TR-5050',
    discount: '(45% OFF)',
    price: '₹799',
  },
  {
    image: 'xzy.jpg',
    name: 'Nutri Fresh',
    code: 'MG-2609',
    discount: '(67% OFF)',
    price: '₹7,000',
  },
];

const SHOWCASE_ANIMATION_MS = 30000;
const TOUCH_RESUME_DELAY_MS = 2000;

// SHOWCASE SECTION: render
function renderShowcase() {
  const track = document.getElementById('showcaseTrack');
  if (!track) return;

  const loopedProducts = products.concat(products);

  track.innerHTML = loopedProducts
    .map((item, index) => {
      const isClone = index >= products.length;

      return `
        <article class="showcase__card"${isClone ? ' aria-hidden="true"' : ''}>
          <div class="showcase__image-wrap">
            <img
              class="showcase__image"
              src="assets/product/${item.image}"
              alt="${item.name}"
              loading="${index < 4 ? 'eager' : 'lazy'}"
            >
          </div>
          <div class="showcase__info">
            <h3 class="showcase__name">${item.name}</h3>
            <p class="showcase__code">${item.code}</p>
            <p class="showcase__discount">${item.discount}</p>
            <p class="showcase__price">${item.price}</p>
          </div>
        </article>
      `;
    })
    .join('');
}

// SHOWCASE SECTION: animation control
function initShowcaseAnimationControl() {
  const section = document.getElementById('showcaseSection');
  const viewport = section?.querySelector('.showcase__viewport');
  const track = document.getElementById('showcaseTrack');

  if (!section || !viewport || !track) return;

  let setWidth = 0;
  let resumeTimer = null;
  let isDragging = false;
  let startX = 0;
  let dragStartTranslate = 0;

  measure();

  window.addEventListener('resize', debounce(measure, 150));

  viewport.addEventListener('touchstart', (event) => {
    if (resumeTimer) {
      clearTimeout(resumeTimer);
      resumeTimer = null;
    }

    measure();
    isDragging = false;
    startX = event.touches[0].clientX;
    dragStartTranslate = captureCurrentTranslate();
    pauseForTouch(dragStartTranslate);
    section.classList.add('is-touch-active');
  }, { passive: true });

  viewport.addEventListener('touchmove', (event) => {
    const dx = event.touches[0].clientX - startX;

    if (!isDragging && Math.abs(dx) > 6) {
      isDragging = true;
    }

    if (!isDragging) return;

    const next = normalizeTranslate(dragStartTranslate + dx);
    applyManualTransform(next);
  }, { passive: true });

  viewport.addEventListener('touchend', () => {
    section.classList.remove('is-touch-active');
    isDragging = false;
    scheduleResume();
  }, { passive: true });

  viewport.addEventListener('touchcancel', () => {
    section.classList.remove('is-touch-active');
    isDragging = false;
    scheduleResume();
  }, { passive: true });

  function measure() {
    setWidth = track.scrollWidth / 2;
  }

  function captureCurrentTranslate() {
    const style = getComputedStyle(track);
    const matrix = new DOMMatrixReadOnly(style.transform);
    return matrix.m41;
  }

  function normalizeTranslate(value) {
    if (setWidth <= 0) return value;

    let next = value;
    while (next > 0) next -= setWidth;
    while (next <= -setWidth) next += setWidth;
    return next;
  }

  function applyManualTransform(value) {
    track.style.transform = `translateX(${value}px)`;
  }

  function pauseForTouch(currentTranslate) {
    section.classList.add('is-touch-paused');
    track.style.animation = 'none';
    applyManualTransform(currentTranslate);
  }

  function scheduleResume() {
    if (resumeTimer) clearTimeout(resumeTimer);
    resumeTimer = setTimeout(resumeAnimation, TOUCH_RESUME_DELAY_MS);
  }

  function resumeAnimation() {
    if (isDragging || setWidth <= 0) return;

    const currentTranslate = captureCurrentTranslate();
    const normalized = normalizeTranslate(currentTranslate);
    let progress = (normalized + setWidth) / setWidth;
    progress = ((progress % 1) + 1) % 1;

    track.style.transform = '';
    track.style.animation = '';
    track.style.animationDelay = `-${progress * SHOWCASE_ANIMATION_MS}ms`;
    section.classList.remove('is-touch-paused');
    resumeTimer = null;
  }
}

export function initShowcase() {
  renderShowcase();
  initShowcaseAnimationControl();
}

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
