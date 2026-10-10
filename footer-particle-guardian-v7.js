(() => {
  'use strict';
  if (window.__WE_FOOTER_PARTICLES_REMOVED__) return;
  window.__WE_FOOTER_PARTICLES_REMOVED__ = true;

  function cleanupParticles(){
    [
      'we-particle-object',
      'we-particle-object-v3',
      'we-particle-object-v4',
      'we-particle-object-v5',
      'we-particle-rain',
      'we-particle-rain-v3',
      'we-particle-rain-v4',
      'we-particle-rain-v5'
    ].forEach(id => document.getElementById(id)?.remove());

    document.querySelectorAll('script[data-footer-particle-runtime]').forEach(node => node.remove());

    const phrase = document.querySelector('[data-footer-phrase="true"]');
    const footer = document.querySelector('[data-footer-section="true"]');
    if (phrase) {
      const section = phrase.closest('section') || phrase.parentElement;
      section?.querySelectorAll('canvas').forEach(canvas => canvas.remove());
    }
    if (footer) {
      footer.querySelectorAll('[id^="we-particle-"]').forEach(node => node.remove());
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', cleanupParticles, {once:true});
  } else {
    cleanupParticles();
  }

  // Clean once after React hydration; no observer, interval or animation loop remains.
  setTimeout(cleanupParticles, 900);
  setTimeout(cleanupParticles, 2400);
})();
