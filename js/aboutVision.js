import { VISION_SECTION_DATA } from './config.js';
import { ImageUploadSlot } from './imageUploadSlot.js';

export function initAboutVision() {
  const aboutHeading = document.getElementById('aboutInnovationHeading');
  const visionHeading = document.getElementById('visionHeading');
  const visionQuote = document.getElementById('visionQuote');
  const foundersLine = document.getElementById('foundersLine');
  const foundersRole = document.getElementById('foundersRole');

  if (aboutHeading) aboutHeading.innerHTML = VISION_SECTION_DATA.aboutHeading;
  if (visionHeading) visionHeading.textContent = VISION_SECTION_DATA.visionHeading;
  if (visionQuote) visionQuote.textContent = `"${VISION_SECTION_DATA.quote}"`;
  if (foundersLine) foundersLine.innerHTML = VISION_SECTION_DATA.foundersLine;
  if (foundersRole) foundersRole.textContent = VISION_SECTION_DATA.foundersRole;

  const bannerMount = document.getElementById('bannerUploadMount');
  const founder1Mount = document.getElementById('founder1UploadMount');
  const founder2Mount = document.getElementById('founder2UploadMount');

  if (bannerMount) {
    ImageUploadSlot({
      container: bannerMount,
      placeholderLine1: 'Add Your Banner',
      placeholderLine2: '',
      placeholderButton: '',
      variant: 'banner',
    });
  }

  if (founder1Mount) {
    ImageUploadSlot({
      container: founder1Mount,
      placeholderLine1: 'FOUNDERS IMAGE -1',
      placeholderLine2: '',
      placeholderButton: '',
      variant: 'portrait',
    });
  }

  if (founder2Mount) {
    ImageUploadSlot({
      container: founder2Mount,
      placeholderLine1: 'FOUNDERS IMAGE -2',
      placeholderLine2: '',
      placeholderButton: '',
      variant: 'portrait',
    });
  }
}
