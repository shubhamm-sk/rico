import { PRODUCT_VIDEOS } from './productVideosConfig.js';

const TRANSITION_MS = 500;
const SWIPE_THRESHOLD = 50;

const PLAY_ICON = `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><polygon points="8,5 19,12 8,19"/></svg>`;

export function initProductVideos() {
  const section = document.getElementById('productVideos');
  const viewport = document.getElementById('productVideosViewport');
  const track = document.getElementById('productVideosTrack');
  const prevBtn = document.getElementById('productVideosPrev');
  const nextBtn = document.getElementById('productVideosNext');
  const modal = document.getElementById('videoModal');
  const modalBackdrop = document.getElementById('videoModalBackdrop');
  const modalClose = document.getElementById('videoModalClose');
  const modalPlayer = document.getElementById('videoModalPlayer');

  if (!section || !viewport || !track) return;

  const videos = [...PRODUCT_VIDEOS];
  let currentIndex = 0;
  let cardStep = 0;
  let maxIndex = 0;

  buildCards();
  measure();
  updatePosition(false);
  updateArrows();

  window.addEventListener('resize', debounce(() => {
    measure();
    currentIndex = Math.min(currentIndex, maxIndex);
    updatePosition(false);
    updateArrows();
  }, 150));

  prevBtn?.addEventListener('click', () => goTo(currentIndex - 1));
  nextBtn?.addEventListener('click', () => goTo(currentIndex + 1));

  initTouchSwipe(viewport, {
    onSwipeLeft: () => goTo(currentIndex + 1),
    onSwipeRight: () => goTo(currentIndex - 1),
  });

  track.addEventListener('click', (e) => {
    const playBtn = e.target.closest('.product-video-card__play');
    if (!playBtn) return;
    const index = Number(playBtn.closest('.product-video-card')?.dataset.index);
    if (!Number.isNaN(index)) openModal(videos[index]);
  });

  modalClose?.addEventListener('click', closeModal);
  modalBackdrop?.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal?.classList.contains('is-open')) closeModal();
  });

  function buildCards() {
    track.innerHTML = videos
      .map((video, index) => {
        const thumbStyle = video.thumbnail
          ? `style="background-image: url('${video.thumbnail}')"`
          : '';
        const thumbClass = video.thumbnail ? ' product-video-card__bg--has-thumb' : '';

        return `
          <article class="product-video-card" data-index="${index}">
            <div class="product-video-card__bg${thumbClass}" ${thumbStyle}>
              <div class="product-video-card__overlay"></div>
              <div class="product-video-card__content">
                <span class="product-video-card__label">${video.label}</span>
                <button type="button" class="product-video-card__play" aria-label="Play ${video.label}">
                  ${PLAY_ICON}
                </button>
              </div>
            </div>
          </article>
        `;
      })
      .join('');
  }

  function measure() {
    const card = track.querySelector('.product-video-card');
    if (!card) return;
    const styles = getComputedStyle(track);
    const gap = parseFloat(styles.gap) || 20;
    cardStep = card.offsetWidth + gap;
    const visible = Math.max(1, Math.floor(viewport.offsetWidth / cardStep));
    maxIndex = Math.max(0, videos.length - visible);
    track.style.justifyContent = maxIndex === 0 ? 'center' : 'flex-start';
  }

  function goTo(index) {
    const next = Math.max(0, Math.min(index, maxIndex));
    if (next === currentIndex) return;
    currentIndex = next;
    updatePosition(true);
    updateArrows();
  }

  function updatePosition(animate) {
    track.style.transition = animate
      ? `transform ${TRANSITION_MS}ms ease`
      : 'none';
    track.style.transform = `translateX(-${currentIndex * cardStep}px)`;
  }

  function updateArrows() {
    prevBtn?.classList.toggle('is-disabled', currentIndex === 0);
    nextBtn?.classList.toggle('is-disabled', currentIndex >= maxIndex);
    if (prevBtn) prevBtn.disabled = currentIndex === 0;
    if (nextBtn) nextBtn.disabled = currentIndex >= maxIndex;
  }

  function openModal(video) {
    if (!modal || !modalPlayer) return;

    modalPlayer.innerHTML = '';
    const player = createPlayer(video.videoUrl);
    modalPlayer.appendChild(player);
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('video-modal-open');

    if (player.tagName === 'VIDEO') {
      player.play().catch(() => {});
    }
  }

  function closeModal() {
    if (!modal || !modalPlayer) return;

    const video = modalPlayer.querySelector('video');
    const iframe = modalPlayer.querySelector('iframe');

    if (video) {
      video.pause();
      video.removeAttribute('src');
      video.load();
    }
    if (iframe) {
      iframe.src = '';
    }

    modalPlayer.innerHTML = '';
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('video-modal-open');
  }
}

function createPlayer(url) {
  if (isEmbedUrl(url)) {
    const iframe = document.createElement('iframe');
    iframe.src = toEmbedUrl(url);
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    iframe.title = 'Product video';
    return iframe;
  }

  const video = document.createElement('video');
  video.src = url;
  video.controls = true;
  video.autoplay = true;
  video.playsInline = true;
  return video;
}

function isEmbedUrl(url) {
  return /youtube\.com|youtu\.be|vimeo\.com/i.test(url);
}

function toEmbedUrl(url) {
  if (url.includes('youtu.be/')) {
    const id = url.split('youtu.be/')[1]?.split(/[?&]/)[0];
    return `https://www.youtube.com/embed/${id}?autoplay=1`;
  }
  if (url.includes('youtube.com/watch')) {
    const id = new URL(url, window.location.origin).searchParams.get('v');
    return `https://www.youtube.com/embed/${id}?autoplay=1`;
  }
  if (url.includes('vimeo.com')) {
    const id = url.split('vimeo.com/')[1]?.split(/[?&]/)[0];
    return `https://player.vimeo.com/video/${id}?autoplay=1`;
  }
  return url;
}

function initTouchSwipe(element, { onSwipeLeft, onSwipeRight }) {
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
