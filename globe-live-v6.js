(() => {
  'use strict';
  if (window.__WE_GLOBE_V16_BOOTSTRAP__) return;
  window.__WE_GLOBE_V16_BOOTSTRAP__ = true;
  const s=document.createElement('script');
  s.src='/globe-live-v7.js?v=16';
  s.defer=true;
  s.dataset.globeV16='1';
  (document.head||document.documentElement).appendChild(s);
})();