import { CATEGORIES } from './inspiredLivingConfig.js';

export function initInspiredLiving() {
  const row = document.getElementById('inspiredLivingRow');
  if (!row) return;

  row.innerHTML = CATEGORIES.map((cat, index) => {
    const emphasized = index === 0 ? ' inspired-card--featured' : '';
    const words = cat.label.split(' ');
    const labelHtml = words.length === 2
      ? `${words[0]}<br>${words[1]}`
      : cat.label;

    return `
      <a href="${cat.link}" class="inspired-card${emphasized}">
        <span class="inspired-card__label">${labelHtml}</span>
      </a>
    `;
  }).join('');
}
