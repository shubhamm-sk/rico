import { NEW_COLLECTION_PRODUCTS } from './config.js';
import { ImageUploadSlot } from './imageUploadSlot.js';

const TRANSITION_MS = 600;
const SWIPE_THRESHOLD = 50;

export function initNewCollection() {
  const section = document.getElementById('newCollection');
  const track = document.getElementById('newCollectionTrack');
  const prevBtn = document.getElementById('newCollectionPrev');
  const nextBtn = document.getElementById('newCollectionNext');

  if (!section || !track) return;

  const products = [...NEW_COLLECTION_PRODUCTS];
  let currentSlide = 0;
  let itemsPerView = getItemsPerView();
  let totalSlides = getTotalSlides();

  buildSlides();
  updateArrows();
  updatePosition(false);

  window.addEventListener('resize', debounce(() => {
    const prevItems = itemsPerView;
    itemsPerView = getItemsPerView();
    totalSlides = getTotalSlides();
    if (itemsPerView !== prevItems) {
      currentSlide = Math.min(currentSlide, totalSlides - 1);
      buildSlides();
    }
    updatePosition(false);
    updateArrows();
  }, 150));

  prevBtn?.addEventListener('click', () => goTo(currentSlide - 1));
  nextBtn?.addEventListener('click', () => goTo(currentSlide + 1));

  initTouchSwipe(section.querySelector('.new-collection__viewport'), {
    onSwipeLeft: () => goTo(currentSlide + 1),
    onSwipeRight: () => goTo(currentSlide - 1),
  });

  function getItemsPerView() {
    if (window.innerWidth <= 1024) return 1;
    return 2;
  }

  function getTotalSlides() {
    return Math.ceil(products.length / itemsPerView);
  }

  function getSlidesData() {
    const slides = [];
    for (let i = 0; i < products.length; i += itemsPerView) {
      slides.push(products.slice(i, i + itemsPerView));
    }
    return slides;
  }

  function buildSlides() {
    track.innerHTML = '';
    totalSlides = getTotalSlides();
    const slidesData = getSlidesData();

    slidesData.forEach((slideProducts, slideIndex) => {
      const slide = document.createElement('div');
      slide.className = 'new-collection__slide';
      slide.dataset.slideIndex = String(slideIndex);

      slideProducts.forEach((product, indexInSlide) => {
        const globalIndex = slideIndex * itemsPerView + indexInSlide;
        slide.appendChild(createProductBlock(product, globalIndex));
      });

      if (slideProducts.length < itemsPerView && itemsPerView > 1) {
        slide.classList.add('new-collection__slide--single');
      }

      track.appendChild(slide);
    });
  }

  function createProductBlock(product, index) {
    const block = document.createElement('article');
    block.className = 'product-spotlight';

    const info = document.createElement('div');
    info.className = 'product-spotlight__info';
    info.innerHTML = `
      <div class="product-spotlight__tag">${product.name}</div>
      <p class="product-spotlight__model">${product.model}</p>
      <p class="product-spotlight__discount">${product.discount}</p>
      <p class="product-spotlight__price">${product.price}</p>
    `;

    const media = document.createElement('div');
    media.className = 'product-spotlight__media';

    if (product.image) {
      const img = document.createElement('img');
      img.className = 'product-spotlight__image';
      img.src = product.image;
      img.alt = product.name;
      img.loading = index < 2 ? 'eager' : 'lazy';
      img.onerror = () => {
        img.onerror = null;
        if (product.fallback) img.src = product.fallback;
      };
      media.appendChild(img);
    } else {
      const uploadMount = document.createElement('div');
      uploadMount.className = 'product-spotlight__upload';
      ImageUploadSlot({
        container: uploadMount,
        placeholderLine1: 'Click to Add',
        placeholderLine2: 'Product Image',
        placeholderButton: '',
        initialImage: null,
        variant: 'product',
        onChange: (url) => {
          products[index].image = url;
        },
      });
      media.appendChild(uploadMount);
    }

    block.appendChild(info);
    block.appendChild(media);
    return block;
  }

  function goTo(slideIndex) {
    const next = Math.max(0, Math.min(slideIndex, totalSlides - 1));
    if (next === currentSlide) return;
    currentSlide = next;
    updatePosition(true);
    updateArrows();
  }

  function updatePosition(animate) {
    track.style.transition = animate
      ? `transform ${TRANSITION_MS}ms ease`
      : 'none';
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
  }

  function updateArrows() {
    if (prevBtn) {
      const atStart = currentSlide === 0;
      prevBtn.disabled = atStart;
      prevBtn.classList.toggle('is-disabled', atStart);
    }
    if (nextBtn) {
      const atEnd = currentSlide >= totalSlides - 1;
      nextBtn.disabled = atEnd;
      nextBtn.classList.toggle('is-disabled', atEnd);
    }
  }
}

function initTouchSwipe(element, { onSwipeLeft, onSwipeRight }) {
  if (!element) return;
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
