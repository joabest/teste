(() => {
  'use strict';
  if (window.__WE_GLOBE_V29_BOOTSTRAP__) return;
  window.__WE_GLOBE_V29_BOOTSTRAP__ = true;
  if (matchMedia('(max-width: 767px)').matches) return;
  const s=document.createElement('script');
  s.src='/globe-reference-v23.js?v=29';
  s.defer=true;
  s.dataset.globeV29='1';
  (document.head||document.documentElement).appendChild(s);
})();