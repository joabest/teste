(() => {
  'use strict';
  const header = document.querySelector('[data-nav-root]');
  if (!header) return;
  const toggle = header.querySelector('[data-menu-toggle]');
  const panel = header.querySelector('[data-menu-panel]');
  const backdrop = header.querySelector('[data-menu-backdrop]');
  const mobile = matchMedia('(max-width: 767px)');
  let open = false, savedScroll = 0, savedBodyStyle = null, outside = [];

  function closeDetails(except) {
    header.querySelectorAll('details[open]').forEach(el => { if (el !== except) el.open = false; });
  }
  function setOpen(value) {
    value = Boolean(value && mobile.matches);
    if (value === open) return;
    open = value;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    panel.hidden = !open;
    backdrop.hidden = !open;
    header.classList.toggle('menu-open', open);
    if (open) {
      savedScroll = scrollY;
      savedBodyStyle = document.body.getAttribute('style');
      Object.assign(document.body.style, { position: 'fixed', top: `${-savedScroll}px`, width: '100%', overflow: 'hidden' });
      outside = [...document.body.children].filter(el => el !== header && !el.contains(header) && el instanceof HTMLElement);
      outside.forEach(el => { el.dataset.navWasInert = String(el.inert); el.inert = true; });
      panel.scrollTop = 0;
      panel.querySelector('a')?.focus({ preventScroll: true });
    } else {
      if (savedBodyStyle === null) document.body.removeAttribute('style');
      else document.body.setAttribute('style', savedBodyStyle);
      outside.forEach(el => { el.inert = el.dataset.navWasInert === 'true'; delete el.dataset.navWasInert; });
      outside = [];
      scrollTo({ top: savedScroll, behavior: 'instant' });
      toggle.focus({ preventScroll: true });
    }
  }
  toggle.addEventListener('click', () => setOpen(!open));
  backdrop.addEventListener('click', () => setOpen(false));
  panel.addEventListener('click', event => { if (event.target.closest('a')) setOpen(false); });
  document.addEventListener('click', event => { if (!header.contains(event.target)) closeDetails(); });
  header.querySelectorAll('details').forEach(el => el.addEventListener('toggle', () => { if (el.open) closeDetails(el); }));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') { setOpen(false); closeDetails(); }
    if (!open || event.key !== 'Tab') return;
    const items = [toggle, ...panel.querySelectorAll('a, button, summary')].filter(el => el.getClientRects().length);
    const first = items[0], last = items.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  mobile.addEventListener('change', () => { setOpen(false); closeDetails(); });
  addEventListener('pagehide', () => setOpen(false));
})();
