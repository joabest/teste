(()=>{
  'use strict';
  if(window.__WE_FOOTER_GUARDIAN_V7__) return;
  window.__WE_FOOTER_GUARDIAN_V7__=true;

  let loading=false;
  let timer=null;

  function hasTargets(){
    return !!(document.querySelector('[data-footer-section="true"]') && document.querySelector('[data-footer-phrase="true"]'));
  }

  function hasCanvas(){
    return !!document.querySelector('#we-particle-object-v5, #we-particle-rain-v5');
  }

  function ensure(){
    clearTimeout(timer);
    timer=setTimeout(()=>{
      if(!hasTargets() || hasCanvas() || loading) return;
      loading=true;
      try{ delete window.__WE_PARTICLE_V5__; }catch{ window.__WE_PARTICLE_V5__=false; }
      const old=document.querySelector('script[data-footer-particle-runtime="v7"]');
      if(old) old.remove();
      const s=document.createElement('script');
      s.src='/footer-particle-fallback.js?v=7&ts='+Date.now();
      s.defer=true;
      s.dataset.footerParticleRuntime='v7';
      s.onload=()=>{ loading=false; setTimeout(ensure,450); };
      s.onerror=()=>{ loading=false; };
      (document.head||document.documentElement).appendChild(s);
    },120);
  }

  function start(){
    ensure();
    const root=document.documentElement;
    if(!root) return;
    const mo=new MutationObserver(()=>ensure());
    mo.observe(root,{childList:true,subtree:true});
    setInterval(()=>{
      if(document.visibilityState==='visible') ensure();
    },1200);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
