(() => {
  'use strict';
  if (window.__WE_GLOBE_V7_BOOTSTRAP__) return;
  window.__WE_GLOBE_V7_BOOTSTRAP__ = true;
  const s=document.createElement('script');
  s.src='/globe-live-v7.js?v=15';
  s.defer=true;
  s.dataset.globeV7='1';
  (document.head||document.documentElement).appendChild(s);
})();
