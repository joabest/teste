(() => {
  'use strict';
  if (window.__WE_ASSET_FIX_V7__) return;
  window.__WE_ASSET_FIX_V7__ = true;

  const RAW='https://raw.githubusercontent.com/joabest/teste/test';
  const EXT=/\.(?:png|jpe?g|webp|gif|svg|avif|ico)$/i;

  function unwrap(value){
    if(!value) return {path:null,external:null};
    try{
      const u=new URL(value,location.href);
      if(u.origin===location.origin && u.pathname==='/_next/image'){
        const inner=u.searchParams.get('url');
        if(!inner) return {path:null,external:null};
        let decoded=inner;
        try{decoded=decodeURIComponent(inner)}catch{}
        try{
          const iu=new URL(decoded,location.origin);
          if(iu.origin===location.origin && EXT.test(iu.pathname)) return {path:iu.pathname,external:null};
          if(iu.protocol==='https:'||iu.protocol==='http:') return {path:null,external:iu.href};
        }catch{}
        if(decoded.startsWith('/') && EXT.test(decoded.split('?')[0])) return {path:decoded.split('?')[0],external:null};
      }
      if(u.origin===location.origin && EXT.test(u.pathname)) return {path:u.pathname,external:null};
    }catch{}
    return {path:null,external:null};
  }

  function normalize(img){
    if(!(img instanceof HTMLImageElement)) return;
    const current=img.getAttribute('src')||'';
    if(!current || current.startsWith('data:') || current.startsWith('blob:')) return;

    // Keep already-working same-origin assets on Vercel. Only unwrap Next's image
    // optimizer URL to its direct local file; do NOT mirror everything to GitHub Raw.
    const found=unwrap(current);
    if(found.external){
      if(/googleusercontent\.com/i.test(found.external)) img.referrerPolicy='no-referrer';
      if(img.src!==found.external) img.src=found.external;
      return;
    }
    if(found.path && current.includes('/_next/image')){
      img.closest('picture')?.querySelectorAll('source').forEach(s=>s.removeAttribute('srcset'));
      img.removeAttribute('srcset');
      img.removeAttribute('sizes');
      img.src=found.path;
      img.dataset.assetLocalV7='1';
    }
  }

  function fallback(img){
    if(!(img instanceof HTMLImageElement) || img.dataset.rawFallbackV7==='1') return;
    const found=unwrap(img.getAttribute('src')||'');
    if(!found.path) return;
    img.dataset.rawFallbackV7='1';
    img.closest('picture')?.querySelectorAll('source').forEach(s=>s.removeAttribute('srcset'));
    img.removeAttribute('srcset');
    img.removeAttribute('sizes');
    img.src=RAW+found.path;
  }

  function sweep(root=document){
    if(root instanceof HTMLImageElement) normalize(root);
    root.querySelectorAll?.('img').forEach(normalize);
    root.querySelectorAll?.('a[href*="awwwards.com/sites/weevolveit"]').forEach(a=>a.remove());
  }

  function start(){
    sweep(document);
    document.addEventListener('error',e=>fallback(e.target),true);

    // Only process newly-added images. No attribute observer and no 2.5s polling loop.
    const mo=new MutationObserver(records=>{
      for(const r of records){
        for(const n of r.addedNodes){
          if(n.nodeType===1) sweep(n);
        }
      }
    });
    mo.observe(document.documentElement,{subtree:true,childList:true});
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
