(() => {
  'use strict';
  if (window.__WE_ASSET_FIX_V6__) return;
  window.__WE_ASSET_FIX_V6__ = true;

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
        return {path:null,external:null};
      }
      if(u.origin===location.origin && EXT.test(u.pathname)) return {path:u.pathname,external:null};
    }catch{}
    return {path:null,external:null};
  }

  function apply(img){
    if(!(img instanceof HTMLImageElement)) return;
    const current=img.getAttribute('src')||'';
    if(current.startsWith('data:')||current.startsWith('blob:')) return;
    const found=unwrap(current);
    const picture=img.closest('picture');
    picture?.querySelectorAll('source').forEach(s=>s.removeAttribute('srcset'));
    img.removeAttribute('srcset');
    img.removeAttribute('sizes');

    if(found.external){
      if(/googleusercontent\.com/i.test(found.external)) img.referrerPolicy='no-referrer';
      if(img.src!==found.external) img.src=found.external;
      return;
    }
    if(found.path){
      const raw=RAW+found.path;
      if(img.src!==raw) img.src=raw;
      img.dataset.assetMirrorV6='1';
      img.style.removeProperty('visibility');
      img.style.removeProperty('display');
      return;
    }

    // If React later restores a local srcset, prefer its first local candidate.
    const set=img.getAttribute('srcset');
    if(set){
      const first=set.split(',')[0]?.trim().split(/\s+/)[0];
      const f=unwrap(first);
      if(f.path){img.removeAttribute('srcset');img.removeAttribute('sizes');img.src=RAW+f.path;}
    }
  }

  function sweep(root=document){
    if(root instanceof HTMLImageElement) apply(root);
    root.querySelectorAll?.('img').forEach(apply);
    root.querySelectorAll?.('a[href*="awwwards.com/sites/weevolveit"]').forEach(a=>a.remove());
  }

  function start(){
    sweep(document);
    document.addEventListener('error',e=>{
      const img=e.target;
      if(!(img instanceof HTMLImageElement)) return;
      const f=unwrap(img.getAttribute('src')||'');
      if(f.path && !img.src.startsWith(RAW)){
        img.removeAttribute('srcset');img.removeAttribute('sizes');img.src=RAW+f.path;
      }
    },true);
    const mo=new MutationObserver(records=>{
      for(const r of records){
        if(r.type==='attributes' && r.target instanceof HTMLImageElement) apply(r.target);
        for(const n of r.addedNodes) if(n.nodeType===1) sweep(n);
      }
    });
    mo.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['src','srcset']});
    setInterval(()=>sweep(document),2500);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true}); else start();
})();
