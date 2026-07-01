import { ABOUT_INNOVATION_DATA } from './config.js';
import { ImageUploadSlot } from './imageUploadSlot.js';

export function initAboutInnovation() {
  const aboutHeading = document.getElementById('aboutInnovationHeading');
  const bannerMount = document.getElementById('bannerUploadMount');

  if (aboutHeading) aboutHeading.innerHTML = ABOUT_INNOVATION_DATA.aboutHeading;

  if (bannerMount) {
    ImageUploadSlot({
      container: bannerMount,
      placeholderLine1: 'Add Your Banner',
      placeholderLine2: '',
      placeholderButton: '',
      variant: 'banner',
    });
  }
}
