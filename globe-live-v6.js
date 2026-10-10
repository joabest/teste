(() => {
  'use strict';
  if (window.__WE_GLOBE_V30_BOOTSTRAP__) return;
  window.__WE_GLOBE_V30_BOOTSTRAP__ = true;
  if (matchMedia('(max-width: 767px)').matches) return;
  const s=document.createElement('script');
  s.src='/globe-reference-v23.js?v=30';
  s.defer=true;
  s.dataset.globeV30='1';
  (document.head||document.documentElement).appendChild(s);
})();