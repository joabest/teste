(() => {
  'use strict';
  if (window.__WE_GLOBE_V28_BOOTSTRAP__) return;
  window.__WE_GLOBE_V28_BOOTSTRAP__ = true;
  const s=document.createElement('script');
  s.src='/globe-reference-v23.js?v=28';
  s.defer=true;
  s.dataset.globeV28='1';
  (document.head||document.documentElement).appendChild(s);
})();