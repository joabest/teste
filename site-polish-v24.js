(() => {
  'use strict';
  if (window.__WE_SITE_POLISH_V25__) return;
  window.__WE_SITE_POLISH_V25__ = true;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = matchMedia('(max-width: 767px)').matches;

  function findMethodSection() {
    const byData = document.querySelector('[data-method="true"]');
    if (byData) return byData;
    return [...document.querySelectorAll('section, main > div')].find(el => {
      const t = (el.textContent || '').replace(/\s+/g,' ').toLowerCase();
      return t.includes('the 5 method') || (t.includes('discover') && t.includes('diagnose') && t.includes('design'));
    }) || null;
  }

  function normalizeMobileMethod() {
    if (!mobile) return;
    document.querySelectorAll('.we-soft-transition-v24,.we-soft-transition-v25').forEach(el=>el.remove());
    const section=findMethodSection();
    if(!section) return;
    section.style.setProperty('background','#0b0b0d','important');
    section.style.setProperty('height','auto','important');
    section.style.setProperty('min-height','0','important');
    section.style.setProperty('overflow','visible','important');
    section.querySelectorAll('[data-method-rail="true"],[data-method-track="true"],[data-method-intro="true"],[data-method-slide]').forEach(el=>{
      el.style.setProperty('background','#0b0b0d','important');
    });
  }

  function softenWhiteTransition() {
    if (mobile) return normalizeMobileMethod();
    const section = findMethodSection();
    if (!section || section.querySelector(':scope > .we-soft-transition-v25')) return;
    if (getComputedStyle(section).position === 'static') section.style.position = 'relative';
    const overlay = document.createElement('div');
    overlay.className = 'we-soft-transition-v25';
    overlay.setAttribute('aria-hidden','true');
    Object.assign(overlay.style, {
      position:'absolute',left:'0',right:'0',top:'-44px',height:'46px',zIndex:'8',pointerEvents:'none',
      background:'linear-gradient(to bottom, rgba(11,11,13,0) 0%, rgba(11,11,13,.72) 60%, #0b0b0d 100%)'
    });
    section.prepend(overlay);
  }

  function optimizeImages(root = document) {
    root.querySelectorAll?.('img').forEach(img => {
      const r = img.getBoundingClientRect();
      const nearTop = r.top < innerHeight * 1.25;
      if (!nearTop) img.loading = 'lazy';
      img.decoding = 'async';
      try{img.fetchPriority = nearTop ? 'auto' : 'low'}catch{}
    });
  }

  function optimizeVideos(root = document) {
    const vids = [...(root.querySelectorAll?.('video') || [])];
    if (!vids.length) return;
    const io = new IntersectionObserver(entries => {
      for (const e of entries) {
        const v = e.target;
        if (!(v instanceof HTMLVideoElement)) continue;
        if (e.isIntersecting) {
          if (v.dataset.weDeferred === '1' && !v.dataset.weRestored) {
            [...v.querySelectorAll('source[data-we-src]')].forEach(s => { s.src=s.dataset.weSrc||''; s.removeAttribute('data-we-src'); });
            if (v.dataset.weSrc) { v.src=v.dataset.weSrc; delete v.dataset.weSrc; }
            v.dataset.weRestored='1';
            try { v.load(); } catch (_) {}
          }
          if (v.autoplay || v.dataset.weAutoplay === '1') v.play().catch(()=>{});
        } else try { v.pause(); } catch (_) {}
      }
    }, { rootMargin: mobile ? '220px 0px' : '420px 0px' });

    vids.forEach((v,i)=>{
      const rect=v.getBoundingClientRect();
      const heroLike=rect.top<innerHeight*.95&&i<2;
      v.playsInline=true; v.muted=true; v.preload=heroLike?'metadata':'none';
      if(!heroLike&&!v.dataset.weDeferred){
        if(v.hasAttribute('autoplay')){v.dataset.weAutoplay='1';v.removeAttribute('autoplay')}
        if(v.getAttribute('src')){v.dataset.weSrc=v.getAttribute('src');v.removeAttribute('src')}
        v.querySelectorAll('source[src]').forEach(s=>{s.dataset.weSrc=s.getAttribute('src')||'';s.removeAttribute('src')});
        v.dataset.weDeferred='1'; try{v.load()}catch{}
      }
      io.observe(v);
    });
  }

  function boot(){
    softenWhiteTransition();
    optimizeImages();
    optimizeVideos();
    if(mobile){
      const mo=new MutationObserver(normalizeMobileMethod);
      mo.observe(document.body,{childList:true,subtree:true});
      setTimeout(()=>mo.disconnect(),5000);
    }
    if(!reduced) addEventListener('pageshow',()=>document.querySelectorAll('video').forEach(v=>{const r=v.getBoundingClientRect();if(r.bottom<-200||r.top>innerHeight+600)try{v.pause()}catch{}}),{passive:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();