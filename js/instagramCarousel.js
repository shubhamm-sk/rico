import { INSTAGRAM_CONFIG, INSTAGRAM_REELS } from './instagramConfig.js';

const EMBED_STYLE = 'background:#FFF; border:0; border-radius:8px; margin:0; max-width:340px; min-width:280px; width:100%;';
const SWIPE_THRESHOLD = 40;
const LOAD_FADE_MS = 1500;

function stripQuery(url) {
  return url.split('?')[0];
}

function ensureEmbedScript() {
  if (document.querySelector('script[src*="instagram.com/embed.js"]')) return;
  const script = document.createElement('script');
  script.async = true;
  script.src = '//www.instagram.com/embed.js';
  document.body.appendChild(script);
}

function renderInstagramEmbeds() {
  if (window.instgrm?.Embeds?.process) {
    window.instgrm.Embeds.process();
    return;
  }
  setTimeout(renderInstagramEmbeds, 500);
}

function getSlidesVisible() {
  if (window.matchMedia('(max-width: 430px)').matches) return 1;
  if (window.matchMedia('(max-width: 768px)').matches) return 2;
  return 3;
}

export function initInstagramCarousel() {
  const section = document.getElementById('instagramFeed');
  const viewport = document.getElementById('instagramViewport');
  const track = document.getElementById('instagramTrack');
  const prevBtn = document.getElementById('instagramPrev');
  const nextBtn = document.getElementById('instagramNext');
  const heading = document.getElementById('instagramHeading');

  if (!section || !viewport || !track) return;

  if (heading) {
    heading.textContent = `Follow Us On ${INSTAGRAM_CONFIG.handle}`;
  }

  ensureEmbedScript();
  buildInstagramTrack();
  renderInstagramEmbeds();

  let currentIndex = 0;
  const totalSlides = INSTAGRAM_REELS.length;

  function getSlideWidth() {
    const slide = track.querySelector('.instagram-feed__slide');
    if (!slide) return 340;
    const styles = getComputedStyle(track);
    const gap = parseFloat(styles.gap) || 16;
    return slide.offsetWidth + gap;
  }

  function getMaxIndex() {
    return Math.max(0, totalSlides - getSlidesVisible());
  }

  function updateArrowState() {
    const maxIndex = getMaxIndex();
    if (prevBtn) {
      prevBtn.disabled = currentIndex <= 0;
      prevBtn.setAttribute('aria-disabled', String(currentIndex <= 0));
    }
    if (nextBtn) {
      nextBtn.disabled = currentIndex >= maxIndex;
      nextBtn.setAttribute('aria-disabled', String(currentIndex >= maxIndex));
    }
  }

  function updateTrackPosition(animate = true) {
    const maxIndex = getMaxIndex();
    if (currentIndex > maxIndex) currentIndex = maxIndex;
    const offset = currentIndex * getSlideWidth();
    track.style.transition = animate ? 'transform 0.5s ease' : 'none';
    track.style.transform = `translateX(-${offset}px)`;
    updateArrowState();
  }

  prevBtn?.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex -= 1;
      updateTrackPosition();
    }
  });

  nextBtn?.addEventListener('click', () => {
    if (currentIndex < getMaxIndex()) {
      currentIndex += 1;
      updateTrackPosition();
    }
  });

  window.addEventListener('resize', debounce(() => {
    updateTrackPosition(false);
  }, 150));

  initTouchInteraction();
  updateTrackPosition(false);

  function buildInstagramTrack() {
    track.innerHTML = INSTAGRAM_REELS.map((url) => {
      const cleanUrl = stripQuery(url);
      return `
        <div class="instagram-feed__slide">
          <div class="instagram-feed__embed-wrap">
            <div class="instagram-feed__skeleton" aria-hidden="true">
              <span class="instagram-feed__spinner"></span>
            </div>
            <blockquote
              class="instagram-media"
              data-instgrm-permalink="${cleanUrl}"
              data-instgrm-version="14"
              style="${EMBED_STYLE}">
            </blockquote>
          </div>
        </div>
      `;
    }).join('');

    track.querySelectorAll('.instagram-feed__slide').forEach((slide) => {
      setTimeout(() => {
        slide.classList.add('instagram-feed__slide--loaded');
      }, LOAD_FADE_MS);
    });
  }

  function initTouchInteraction() {
    let startX = 0;
    let startY = 0;

    viewport.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });

    viewport.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) <= Math.abs(dy)) return;
      if (dx < 0 && currentIndex < getMaxIndex()) {
        currentIndex += 1;
        updateTrackPosition();
      } else if (dx > 0 && currentIndex > 0) {
        currentIndex -= 1;
        updateTrackPosition();
      }
    }, { passive: true });
  }
}

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
