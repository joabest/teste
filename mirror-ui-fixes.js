(() => {
  'use strict';
  if (window.__WE_ASSET_RESCUE__) return;
  window.__WE_ASSET_RESCUE__ = true;
  const MAP = {
    '/logos/clients/abrasivos-y-conversiones-ideal.webp': 'https://raw.githubusercontent.com/joabest/teste/test/logos/clients/abrasivos-y-conversiones-ideal.webp',
    '/logos/clients/zebra-technologies.webp': 'https://raw.githubusercontent.com/joabest/teste/test/logos/clients/zebra-technologies.webp',
    '/logos/clients/divacup.webp': 'https://raw.githubusercontent.com/joabest/teste/test/logos/clients/divacup.webp',
    '/logos/clients/enviaflores.webp': 'https://raw.githubusercontent.com/joabest/teste/test/logos/clients/enviaflores.webp',
    '/logos/clients/heli.webp': 'https://raw.githubusercontent.com/joabest/teste/test/logos/clients/heli.webp',
    '/logos/clients/phonix-global.webp': 'https://raw.githubusercontent.com/joabest/teste/test/logos/clients/phonix-global.webp',
    '/logos/clients/stwst.webp': 'https://raw.githubusercontent.com/joabest/teste/test/logos/clients/stwst.webp',
    '/logos/clients/kpnp.webp': 'https://raw.githubusercontent.com/joabest/teste/test/logos/clients/kpnp.webp',
    '/logos/clients/neg.webp': 'https://raw.githubusercontent.com/joabest/teste/test/logos/clients/neg.webp',
    '/logos/clients/br.webp': 'https://raw.githubusercontent.com/joabest/teste/test/logos/clients/br.webp',
    '/logos/clients/ht.webp': 'https://raw.githubusercontent.com/joabest/teste/test/logos/clients/ht.webp',
    '/logos/clients/tnf.webp': 'https://raw.githubusercontent.com/joabest/teste/test/logos/clients/tnf.webp',
    '/images/page-covers/og-ai-business-check-EN.jpg': 'https://raw.githubusercontent.com/joabest/teste/test/images/page-covers/og-ai-business-check-EN.jpg',
    '/images/page-covers/og-ai-check-EN.jpg': 'https://raw.githubusercontent.com/joabest/teste/test/images/page-covers/og-ai-check-EN.jpg',
    '/images/page-covers/og-seo-check-EN.jpg': 'https://raw.githubusercontent.com/joabest/teste/test/images/page-covers/og-seo-check-EN.jpg'
  };

  function getPath(img) {
    if (img.dataset.mirrorAssetPath) return img.dataset.mirrorAssetPath;
    let raw = img.getAttribute('src') || '';
    try {
      const u = new URL(raw, location.href);
      if (u.pathname === '/_next/image') {
        const nested = u.searchParams.get('url');
        if (nested) raw = nested;
      }
      const path = new URL(raw, location.href).pathname;
      img.dataset.mirrorAssetPath = path;
      return path;
    } catch { return raw; }
  }

  function fix(img) {
    if (!(img instanceof HTMLImageElement)) return;
    const path = getPath(img);
    const rescued = MAP[path];
    if (!rescued) return;
    if (path.startsWith('/logos/clients/')) img.classList.add('mirror-client-logo');
    if (img.src === rescued) return;
    img.removeAttribute('srcset');
    img.removeAttribute('sizes');
    img.src = rescued;
  }

  function scan(node=document) {
    if (node instanceof HTMLImageElement) fix(node);
    if (node.querySelectorAll) node.querySelectorAll('img').forEach(fix);
  }

  function start() {
    scan();
    new MutationObserver(list => {
      for (const m of list) {
        if (m.type === 'attributes') fix(m.target);
        m.addedNodes && m.addedNodes.forEach(scan);
      }
    }).observe(document.documentElement, {subtree:true, childList:true, attributes:true, attributeFilter:['src','srcset']});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once:true}); else start();
})();
