(() => {
  'use strict';
  const method = document.querySelector('[data-method]');
  if (!method) return;
  const rail = method.querySelector('[data-method-rail]');
  const track = method.querySelector('[data-method-track]');
  const intro = method.querySelector('[data-method-intro]');
  if (!rail || !track) return;
  const desktop = matchMedia('(min-width: 768px) and (prefers-reduced-motion: no-preference)');
  let frame = 0, distance = 0, observing = false;
  function paint() {
    frame = 0;
    const progress = Math.max(0, Math.min(1, -(method.getBoundingClientRect().top + (intro?.offsetHeight || 0)) / Math.max(1, distance)));
    track.style.transform = `translate3d(${-progress * distance}px, 0, 0)`;
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(paint); }
  function layout() {
    method.classList.toggle('method-desktop', desktop.matches);
    track.style.removeProperty('transform');
    method.style.removeProperty('--method-height');
    distance = desktop.matches ? Math.max(0, track.scrollWidth - rail.clientWidth) : 0;
    if (desktop.matches) method.style.setProperty('--method-height', `${distance + rail.clientHeight + (intro?.offsetHeight || 0)}px`);
    if (!desktop.matches && observing) { removeEventListener('scroll', schedule); observing = false; }
    if (desktop.matches && !observing) { addEventListener('scroll', schedule, { passive: true }); observing = true; }
    if (desktop.matches) schedule();
  }
  desktop.addEventListener('change', layout);
  addEventListener('resize', layout, { passive: true });
  document.fonts?.ready.then(layout);
  addEventListener('load', layout, { once: true });
  layout();
})();
