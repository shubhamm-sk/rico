import {
  FOOTER_COLUMNS,
  STATS,
  SOCIAL_LINKS,
  COPYRIGHT,
  COPYRIGHT_LINKS,
} from './footerConfig.js';

const STAT_ICONS = {
  'service-tools': `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
  factory: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M2 20V8l5 3V8l5 3V4l8 4v12H2z"/><path d="M6 20v-4h4v4"/><path d="M14 20v-4h4v4"/></svg>`,
  building: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="1"/><path d="M9 7h1M9 11h1M9 15h1M14 7h1M14 11h1M14 15h1"/></svg>`,
};

const SOCIAL_ICONS = {
  facebook: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.027 4.388 11.02 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.093 24 18.1 24 12.073z"/></svg>`,
  instagram: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>`,
  linkedin: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.062 2.062 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
  youtube: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
};

export function initFooter() {
  renderColumns();
  renderStats();
  renderSocial();
  renderCopyright();
}

function renderColumns() {
  const container = document.getElementById('footerColumns');
  if (!container) return;

  container.innerHTML = FOOTER_COLUMNS.map(
    (col) => `
      <nav class="site-footer__col" aria-label="${col.heading}">
        <h3 class="site-footer__col-heading">${col.heading}</h3>
        <ul class="site-footer__col-links">
          ${col.links
            .map(
              (link) =>
                `<li><a href="${link.href}">${link.label}</a></li>`
            )
            .join('')}
        </ul>
      </nav>
    `
  ).join('');
}

function renderStats() {
  const container = document.getElementById('footerStats');
  if (!container) return;

  container.innerHTML = STATS.map(
    (stat) => `
      <div class="site-footer__stat">
        <span class="site-footer__stat-icon" aria-hidden="true">
          ${STAT_ICONS[stat.icon] || STAT_ICONS['service-tools']}
        </span>
        <div class="site-footer__stat-text">
          <strong class="site-footer__stat-bold">${stat.boldText}</strong>
          <span class="site-footer__stat-sub">${stat.subText}</span>
        </div>
      </div>
    `
  ).join('');
}

function renderSocial() {
  const container = document.getElementById('footerSocial');
  if (!container) return;

  container.innerHTML = SOCIAL_LINKS.map(
    (social) => `
      <a
        href="${social.url}"
        class="site-footer__social-link"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="${social.platform}"
      >
        ${SOCIAL_ICONS[social.icon] || ''}
      </a>
    `
  ).join('');
}

function renderCopyright() {
  const line = document.getElementById('footerCopyrightLine');
  const links = document.getElementById('footerCopyrightLinks');

  if (line) line.textContent = COPYRIGHT.line;

  if (links) {
    links.innerHTML = COPYRIGHT_LINKS.map(
      (link, i) => `
        ${i > 0 ? '<span class="site-footer__copyright-sep" aria-hidden="true">|</span>' : ''}
        <a href="${link.href}">${link.label}</a>
      `
    ).join('');
  }
}
