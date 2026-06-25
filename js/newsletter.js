export function initNewsletter() {
  const openBtn = document.getElementById('newsletterOpenBtn');
  const modal = document.getElementById('subscribeModal');
  const backdrop = document.getElementById('subscribeModalBackdrop');
  const closeBtn = document.getElementById('subscribeModalClose');
  const form = document.getElementById('subscribeForm');
  const successEl = document.getElementById('subscribeSuccess');

  if (!openBtn || !modal || !form) return;

  openBtn.addEventListener('click', openModal);
  closeBtn?.addEventListener('click', closeModal);
  backdrop?.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = form.querySelector('[name="name"]');
    const email = form.querySelector('[name="email"]');
    const mobile = form.querySelector('[name="mobile"]');

    if (!name?.value.trim() || !email?.value.trim() || !mobile?.value.trim()) {
      form.reportValidity();
      return;
    }

    if (!email.checkValidity()) {
      email.reportValidity();
      return;
    }

    // TODO: connect to backend/email service
  // fetch('/api/subscribe', { method: 'POST', body: new FormData(form) });

    form.hidden = true;
    if (successEl) {
      successEl.hidden = false;
      successEl.textContent = 'Thanks for subscribing!';
    }

    setTimeout(closeModal, 2000);
  });

  function openModal() {
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('subscribe-modal-open');
    form.hidden = false;
    if (successEl) successEl.hidden = true;
    form.reset();
    form.querySelector('[name="name"]')?.focus();
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('subscribe-modal-open');
    form.hidden = false;
    if (successEl) successEl.hidden = true;
    form.reset();
  }
}
