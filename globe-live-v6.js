(() => {
  'use strict';
  if (window.__WE_GLOBE_V26_BOOTSTRAP__) return;
  window.__WE_GLOBE_V26_BOOTSTRAP__ = true;
  const s = document.createElement('script');
  s.src = '/globe-reference-v23.js?v=26';
  s.defer = true;
  s.dataset.globeV26 = '1';
  (document.head || document.documentElement).appendChild(s);
})();