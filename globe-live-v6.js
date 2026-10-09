(() => {
  'use strict';
  if (window.__WE_GLOBE_REMOVED__) return;
  window.__WE_GLOBE_REMOVED__ = true;

  function cleanupGlobe(){
    [
      'we-globe-live-v6',
      'we-globe-live-v5',
      'we-globe-layer-v3',
      'we-globe-layer',
      'we-globe-fallback'
    ].forEach(id => document.getElementById(id)?.remove());

    const hero = document.querySelector('[data-hero-section="true"]');
    if (hero) {
      hero.querySelectorAll('canvas').forEach(canvas => canvas.remove());
      hero.querySelectorAll('[id*="globe"], [class*="globe"], [data-globe]').forEach(node => {
        if (node !== hero) node.remove();
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', cleanupGlobe, {once:true});
  } else {
    cleanupGlobe();
  }

  // One short post-hydration sweep, then nothing keeps running.
  setTimeout(cleanupGlobe, 700);
  setTimeout(cleanupGlobe, 2200);
})();
