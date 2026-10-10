(() => {
  'use strict';
  // Footer particle sphere removed: keep the closing statement clean and unobstructed.
  const cleanup = () => {
    document.getElementById('we-footer-particle-canvas')?.remove();
    document.getElementById('we-footer-particle-hit')?.remove();
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', cleanup, { once: true });
  } else {
    cleanup();
  }
})();
