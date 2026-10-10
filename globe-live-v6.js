(() => {
  'use strict';
  if (window.__WE_GLOBE_V23_BOOTSTRAP__) return;
  window.__WE_GLOBE_V23_BOOTSTRAP__ = true;
  const s = document.createElement('script');
  s.src = '/globe-reference-v23.js?v=23';
  s.defer = true;
  s.dataset.globeV23 = '1';
  (document.head || document.documentElement).appendChild(s);
})();