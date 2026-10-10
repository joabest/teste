(() => {
  'use strict';
  if (window.__WE_GLOBE_V24_BOOTSTRAP__) return;
  window.__WE_GLOBE_V24_BOOTSTRAP__ = true;
  const s = document.createElement('script');
  s.src = '/globe-reference-v23.js?v=24';
  s.defer = true;
  s.dataset.globeV24 = '1';
  (document.head || document.documentElement).appendChild(s);
})();