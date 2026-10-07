(() => {
  'use strict';

  if (window.__WE_MOBILE_NAV_FIX__) return;
  window.__WE_MOBILE_NAV_FIX__ = true;

  const MOBILE_MAX = 767;
  let header = null;
  let button = null;
  let panel = null;
  let open = false;
  let openDisplay = 'block';
  let observer = null;

  const norm = (value) => (value || '').replace(/\s+/g, ' ').trim().toLowerCase();

  function findHeader() {
    return document.querySelector('[data-nav-root="true"]') || document.querySelector('header');
  }

  function findButton(root) {
    if (!root) return null;

    const exact = root.querySelector(
      'button[aria-label="Open menu"], button[aria-label="Close menu"], button[aria-label="Abrir menu"], button[aria-label="Fechar menu"]'
    );
    if (exact) return exact;

    const expanded = root.querySelector('button[aria-expanded]');
    if (expanded && !/search|buscar/i.test(expanded.getAttribute('aria-label') || '')) return expanded;

    const buttons = [...root.querySelectorAll('button')];
    return buttons.find((el) => {
      const label = norm(el.getAttribute('aria-label'));
      return label.includes('menu') && !label.includes('search') && !label.includes('buscar');
    }) || null;
  }

  function looksLikeFullMobileMenu(el) {
    if (!el || el === header) return false;
    const text = norm(el.textContent);
    return (
      text.includes('services') &&
      text.includes('method') &&
      text.includes('case studies') &&
      text.includes('business diagnosis') &&
      text.includes('ai visibility check') &&
      text.includes('free seo check') &&
      text.includes('about') &&
      text.includes('blog') &&
      text.includes('reviews') &&
      text.includes('contact') &&
      text.includes('message us')
    );
  }

  function findPanel(root, menuButton) {
    if (!root) return null;

    const controls = menuButton?.getAttribute('aria-controls');
    if (controls) {
      const controlled = document.getElementById(controls);
      if (controlled) return controlled;
    }

    const candidates = [...root.querySelectorAll('div, nav, section, aside')]
      .filter(looksLikeFullMobileMenu)
      .map((el) => {
        const r = el.getBoundingClientRect();
        return { el, area: Math.max(1, r.width * r.height), h: r.height, w: r.width };
      })
      .filter((x) => x.h > 250 || x.el.scrollHeight > 350)
      .sort((a, b) => a.area - b.area);

    if (candidates.length) return candidates[0].el;

    const marker = [...root.querySelectorAll('a, button, div, span')]
      .find((el) => norm(el.textContent) === 'business diagnosis');
    if (!marker) return null;

    let cur = marker.parentElement;
    let best = null;
    while (cur && cur !== root) {
      if (looksLikeFullMobileMenu(cur)) best = cur;
      cur = cur.parentElement;
    }
    return best;
  }

  function unlockScroll() {
    document.documentElement.style.removeProperty('overflow');
    document.body.style.removeProperty('overflow');
    document.documentElement.classList.remove('overflow-hidden');
    document.body.classList.remove('overflow-hidden');
  }

  function setImportant(el, prop, value) {
    if (!el) return;
    el.style.setProperty(prop, value, 'important');
  }

  function setOpen(next) {
    if (!panel || !button) return;

    if (window.innerWidth > MOBILE_MAX) {
      open = false;
      panel.style.removeProperty('display');
      panel.style.removeProperty('visibility');
      panel.style.removeProperty('opacity');
      panel.style.removeProperty('pointer-events');
      panel.style.removeProperty('max-height');
      panel.style.removeProperty('overflow-y');
      panel.removeAttribute('data-we-menu-fallback');
      unlockScroll();
      return;
    }

    open = !!next;
    panel.setAttribute('data-we-menu-fallback', open ? 'open' : 'closed');
    panel.setAttribute('aria-hidden', open ? 'false' : 'true');
    button.setAttribute('aria-expanded', open ? 'true' : 'false');
    button.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');

    if (open) {
      setImportant(panel, 'display', openDisplay === 'none' ? 'block' : openDisplay);
      setImportant(panel, 'visibility', 'visible');
      setImportant(panel, 'opacity', '1');
      setImportant(panel, 'pointer-events', 'auto');
      setImportant(panel, 'max-height', 'calc(100dvh - 92px)');
      setImportant(panel, 'overflow-y', 'auto');
      document.documentElement.style.setProperty('overflow', 'hidden', 'important');
      document.body.style.setProperty('overflow', 'hidden', 'important');
    } else {
      setImportant(panel, 'display', 'none');
      setImportant(panel, 'visibility', 'hidden');
      setImportant(panel, 'opacity', '0');
      setImportant(panel, 'pointer-events', 'none');
      unlockScroll();
    }
  }

  function onMenuClick(event) {
    if (window.innerWidth > MOBILE_MAX) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    setOpen(!open);
  }

  function wire() {
    header = findHeader();
    button = findButton(header);
    panel = findPanel(header, button);
    if (!header || !button || !panel) return false;

    const computedDisplay = getComputedStyle(panel).display;
    if (computedDisplay && computedDisplay !== 'none') openDisplay = computedDisplay;

    button.style.setProperty('pointer-events', 'auto', 'important');
    button.removeEventListener('click', onMenuClick, true);
    button.addEventListener('click', onMenuClick, true);

    // Static mirrors can boot with the server-rendered drawer already open.
    // Always normalize mobile to a closed state on first load.
    setOpen(false);

    panel.addEventListener('click', (event) => {
      if (window.innerWidth > MOBILE_MAX) return;
      const link = event.target.closest('a[href]');
      if (link) setOpen(false);
    });

    return true;
  }

  function boot() {
    if (wire()) return;

    observer = new MutationObserver(() => {
      if (wire() && observer) {
        observer.disconnect();
        observer = null;
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(() => {
      if (observer) observer.disconnect();
      observer = null;
    }, 10000);
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && open) setOpen(false);
  });

  window.addEventListener('resize', () => {
    if (!header || !button || !panel) wire();
    if (window.innerWidth > MOBILE_MAX) setOpen(false);
  }, { passive: true });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
