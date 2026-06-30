import { initHeader } from './header.js';
import { initHeroCarousel } from './heroCarousel.js';
import { initShowcase } from './showcase.js';
import { initTopSellingCarousel } from './topSellingCarousel.js';
import { initAboutVision } from './aboutVision.js';
import { initTestimonialCarousel } from './testimonialCarousel.js';
import { initWhyRicoCarousel } from './whyRicoCarousel.js';
import { initProductVideos } from './productVideos.js';
import { initInspiredLiving } from './inspiredLiving.js';
import { initNewsletter } from './newsletter.js';
import { initInstagramCarousel } from './instagramCarousel.js';
import { initBuiltToLast } from './builtToLast.js';
import { initFooter } from './footer.js';

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initHeroCarousel();
  initShowcase();
  initTopSellingCarousel();
  initAboutVision();
  initTestimonialCarousel();
  initWhyRicoCarousel();
  initProductVideos();
  initInspiredLiving();
  initNewsletter();
  initInstagramCarousel();
  initBuiltToLast();
  initFooter();
});
