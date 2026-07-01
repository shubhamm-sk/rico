/**
 * Reusable ImageUploadSlot component.
 * Used for About Innovation banner and Hero banner overlays.
 *
 * @param {Object} options
 * @param {HTMLElement} options.container - Parent element to mount into
 * @param {string} [options.placeholderLine1='Add Your']
 * @param {string} [options.placeholderLine2='HERO BANNER']
 * @param {string} [options.placeholderButton='Here']
 * @param {string|null} [options.initialImage=null]
 * @param {Function} [options.onChange] - Called with (imageUrl|null) when image changes
 * @param {string} [options.variant='hero'] - 'hero' | 'banner'
 * @returns {{ getImage: () => string|null, setImage: (url: string|null) => void, destroy: () => void }}
 */
export function ImageUploadSlot({
  container,
  placeholderLine1 = 'Add Your',
  placeholderLine2 = 'HERO BANNER',
  placeholderButton = 'Here',
  initialImage = null,
  onChange = () => {},
  variant = 'hero',
}) {
  const slot = document.createElement('div');
  slot.className = `image-upload-slot image-upload-slot--${variant}`;
  slot.setAttribute('role', 'button');
  slot.setAttribute('tabindex', '0');
  slot.setAttribute('aria-label', 'Upload image');

  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileInput.className = 'image-upload-slot__input';
  fileInput.setAttribute('aria-hidden', 'true');

  const placeholder = document.createElement('div');
  placeholder.className = 'image-upload-slot__placeholder';
  const btnHtml = placeholderButton
    ? `<span class="image-upload-slot__btn">${placeholderButton}</span>`
    : '';
  const line2Html = placeholderLine2
    ? `<span class="image-upload-slot__line2">${placeholderLine2}</span>`
    : '';
  placeholder.innerHTML = `
    <span class="image-upload-slot__line1">${placeholderLine1}</span>
    ${line2Html}
    ${btnHtml}
  `;

  const preview = document.createElement('div');
  preview.className = 'image-upload-slot__preview';
  preview.hidden = true;

  const previewImg = document.createElement('img');
  previewImg.className = 'image-upload-slot__img';
  previewImg.alt = 'Uploaded banner';

  const controls = document.createElement('div');
  controls.className = 'image-upload-slot__controls';
  controls.innerHTML = `
    <button type="button" class="image-upload-slot__change">Change Image</button>
    <button type="button" class="image-upload-slot__remove">✕ Remove</button>
  `;

  preview.appendChild(previewImg);
  preview.appendChild(controls);
  slot.appendChild(fileInput);
  slot.appendChild(placeholder);
  slot.appendChild(preview);
  container.appendChild(slot);

  let currentImage = initialImage;
  let objectUrl = null;

  function revokeObjectUrl() {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      objectUrl = null;
    }
  }

  function showPlaceholder() {
    placeholder.hidden = false;
    preview.hidden = true;
    slot.classList.remove('image-upload-slot--has-image');
  }

  function showPreview(url) {
    previewImg.src = url;
    placeholder.hidden = true;
    preview.hidden = false;
    slot.classList.add('image-upload-slot--has-image');
  }

  function setImage(url) {
    revokeObjectUrl();
    currentImage = url;
    if (url) {
      showPreview(url);
    } else {
      showPlaceholder();
      fileInput.value = '';
    }
    onChange(url);
  }

  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    revokeObjectUrl();
    objectUrl = URL.createObjectURL(file);
    currentImage = objectUrl;
    showPreview(objectUrl);
    onChange(objectUrl);
  }

  function openPicker() {
    fileInput.click();
  }

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  });

  slot.addEventListener('click', (e) => {
    if (e.target.closest('.image-upload-slot__controls')) return;
    if (!currentImage) openPicker();
  });

  slot.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && !currentImage) {
      e.preventDefault();
      openPicker();
    }
  });

  controls.querySelector('.image-upload-slot__change').addEventListener('click', (e) => {
    e.stopPropagation();
    openPicker();
  });

  controls.querySelector('.image-upload-slot__remove').addEventListener('click', (e) => {
    e.stopPropagation();
    setImage(null);
  });

  if (initialImage) {
    showPreview(initialImage);
  }

  return {
    getImage: () => currentImage,
    setImage,
    destroy: () => {
      revokeObjectUrl();
      slot.remove();
    },
  };
}

/** Alias matching the spec API — mounts ImageUploadSlot into `#${id}` or a given element. */
export function createImageUploadSlot({
  id,
  container,
  placeholderText,
  variant = 'banner',
  onChange,
}) {
  const mount = container || document.getElementById(id);
  if (!mount) return null;

  return ImageUploadSlot({
    container: mount,
    placeholderLine1: placeholderText,
    placeholderLine2: '',
    placeholderButton: '',
    variant,
    onChange,
  });
}
