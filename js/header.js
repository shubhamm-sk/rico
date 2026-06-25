import { HEADER_CONFIG, NAV_LINKS } from './config.js';

export function initHeader() {
  const menuBtn = document.getElementById('menuBtn');
  const menuDrawer = document.getElementById('menuDrawer');
  const menuOverlay = document.getElementById('menuOverlay');
  const menuClose = document.getElementById('menuClose');
  const cartBtn = document.getElementById('cartBtn');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartClose = document.getElementById('cartClose');
  const searchForm = document.getElementById('searchForm');
  const searchInput = document.getElementById('searchInput');
  const searchToggle = document.getElementById('searchToggle');
  const searchWrapper = document.getElementById('searchWrapper');
  const cartBadge = document.getElementById('cartBadge');
  const loginLink = document.getElementById('loginLink');

  if (searchInput) {
    searchInput.placeholder = HEADER_CONFIG.searchPlaceholder;
  }

  updateCartBadge(HEADER_CONFIG.cartItemCount);

  function openDrawer(drawer, overlay) {
    drawer?.classList.add('is-open');
    overlay?.classList.add('is-visible');
    document.body.classList.add('drawer-open');
  }

  function closeDrawer(drawer, overlay) {
    drawer?.classList.remove('is-open');
    overlay?.classList.remove('is-visible');
    if (!document.querySelector('.drawer.is-open')) {
      document.body.classList.remove('drawer-open');
    }
  }

  menuBtn?.addEventListener('click', () => openDrawer(menuDrawer, menuOverlay));
  menuClose?.addEventListener('click', () => closeDrawer(menuDrawer, menuOverlay));
  menuOverlay?.addEventListener('click', () => closeDrawer(menuDrawer, menuOverlay));

  cartBtn?.addEventListener('click', () => openDrawer(cartDrawer, cartOverlay));
  cartClose?.addEventListener('click', () => closeDrawer(cartDrawer, cartOverlay));
  cartOverlay?.addEventListener('click', () => closeDrawer(cartDrawer, cartOverlay));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDrawer(menuDrawer, menuOverlay);
      closeDrawer(cartDrawer, cartOverlay);
      searchWrapper?.classList.remove('is-expanded');
    }
  });

  searchForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = searchInput?.value.trim();
    if (q) {
      window.location.href = `/search?q=${encodeURIComponent(q)}`;
    }
  });

  searchToggle?.addEventListener('click', () => {
    searchWrapper?.classList.toggle('is-expanded');
    if (searchWrapper?.classList.contains('is-expanded')) {
      searchInput?.focus();
    }
  });

  loginLink?.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = '/account/login';
  });

  const navList = document.getElementById('navLinks');
  if (navList) {
    navList.innerHTML = NAV_LINKS.map(
      (link) => `<li><a href="${link.href}">${link.label}</a></li>`
    ).join('');
  }

  return {
    updateCartBadge,
    openCart: () => openDrawer(cartDrawer, cartOverlay),
  };
}

export function updateCartBadge(count) {
  const badge = document.getElementById('cartBadge');
  if (!badge) return;
  if (count > 0) {
    badge.textContent = count > 99 ? '99+' : String(count);
    badge.hidden = false;
  } else {
    badge.hidden = true;
  }
}
