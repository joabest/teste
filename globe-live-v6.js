(() => {
  'use strict';
  if (window.__WE_GLOBE_V20_BOOTSTRAP__) return;
  window.__WE_GLOBE_V20_BOOTSTRAP__ = true;
  const s = document.createElement('script');
  s.src = '/globe-live-v7.js?v=20';
  s.defer = true;
  s.dataset.globeV20 = '1';
  (document.head || document.documentElement).appendChild(s);
})();