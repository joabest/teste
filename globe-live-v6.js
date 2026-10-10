(() => {
  'use strict';
  if (window.__WE_GLOBE_V21_BOOTSTRAP__) return;
  window.__WE_GLOBE_V21_BOOTSTRAP__ = true;
  const s = document.createElement('script');
  s.src = '/globe-live-v7.js?v=21';
  s.defer = true;
  s.dataset.globeV21 = '1';
  (document.head || document.documentElement).appendChild(s);
})();