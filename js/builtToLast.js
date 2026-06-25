import { BUILT_TO_LAST_DATA } from './instagramConfig.js';

export function initBuiltToLast() {
  const section = document.getElementById('builtToLast');
  const bgText = document.getElementById('builtToLastBg');
  const quote = document.getElementById('builtToLastQuote');

  if (!section) return;

  if (bgText) bgText.textContent = BUILT_TO_LAST_DATA.backgroundText;
  if (quote) quote.textContent = BUILT_TO_LAST_DATA.quote;

  let ticking = false;

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const rect = section.getBoundingClientRect();
      const viewH = window.innerHeight;
      const progress = 1 - (rect.top + rect.height * 0.5) / (viewH + rect.height * 0.5);
      const offset = Math.max(-30, Math.min(30, progress * 40 - 20));
      if (bgText) {
        bgText.style.transform = `translate(calc(-50% + ${offset}px), -50%)`;
      }
      ticking = false;
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}
