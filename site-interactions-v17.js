(() => {
  'use strict';
  if (window.__WE_SITE_INTERACTIONS_V17__) return;
  window.__WE_SITE_INTERACTIONS_V17__ = true;

  const PINK='#ec008c';
  const path=location.pathname.replace(/\/+$/,'')||'/';

  const aliases=new Map([
    ['/ai-visibility-check','/ai-check'],
    ['/free-seo-check','/seo-check'],
    ['/business-diagnosis','/ai-business-check']
  ]);

  // Some mirrored tool URLs are actual 404 snapshots. Redirect them to the valid local captures.
  if (aliases.has(path)) {
    location.replace(aliases.get(path) + location.search + location.hash);
    return;
  }

  function repairToolLinks(root=document){
    const scope=root?.querySelectorAll?root:document;
    scope.querySelectorAll('a[href]').forEach(a=>{
      let u;
      try{u=new URL(a.getAttribute('href'),location.href)}catch{return}
      if(u.origin!==location.origin)return;
      const clean=u.pathname.replace(/\/+$/,'')||'/';
      const mapped=aliases.get(clean);
      if(mapped){
        a.href=mapped+u.search+u.hash;
        return;
      }
      const txt=(a.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
      if(txt.includes('ai visibility')) a.href='/ai-check';
      else if(txt.includes('free seo')) a.href='/seo-check';
      else if(txt.includes('business diagnosis')) a.href='/ai-business-check';
    });
  }

  const style=document.createElement('style');
  style.id='we-site-interactions-v17-style';
  style.textContent=`
    .we-seo-hover-card{
      position:relative!important;
      overflow:hidden!important;
      isolation:isolate;
      transition:transform .32s cubic-bezier(.16,1,.3,1),border-color .32s ease,box-shadow .32s ease,opacity .32s ease!important;
    }
    .we-seo-hover-card::after{
      content:"";
      position:absolute;
      inset:-35%;
      z-index:-1;
      opacity:0;
      pointer-events:none;
      background:radial-gradient(circle at 50% 100%,rgba(236,0,140,.16),rgba(236,0,140,0) 56%);
      transform:translateY(18px) scale(.94);
      transition:opacity .34s ease,transform .46s cubic-bezier(.16,1,.3,1);
    }
    @media (hover:hover){
      .we-seo-hover-card:hover{
        transform:translateY(-5px)!important;
        border-color:rgba(236,0,140,.42)!important;
        box-shadow:0 18px 48px rgba(0,0,0,.30),0 0 0 1px rgba(236,0,140,.08)!important;
      }
      .we-seo-hover-card:hover::after{opacity:1;transform:translateY(0) scale(1)}
    }
    @media (prefers-reduced-motion:reduce){
      .we-seo-hover-card,.we-seo-hover-card::after{transition:none!important}
    }
  `;
  (document.head||document.documentElement).appendChild(style);

  function findPricingY(){
    const nodes=[...document.querySelectorAll('main *')];
    for(const el of nodes){
      if(el.children.length>6)continue;
      const t=(el.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
      if(t.includes('50')&&t.includes('usd')&&t.includes('hour')){
        const r=el.getBoundingClientRect();
        if(r.height>0)return scrollY+r.top;
      }
    }
    return Infinity;
  }

  function polishSeoCards(){
    if(!/\/services\/seo(?:\.html)?$/.test(path))return;
    const pricingY=findPricingY();
    const candidates=[...document.querySelectorAll('main div, main article, main li')];
    let count=0;
    for(const el of candidates){
      if(count>=16)break;
      if(el.closest('header,nav,footer'))continue;
      if(el.querySelectorAll('div,article,li').length>8)continue;
      const r=el.getBoundingClientRect();
      if(r.width<180||r.height<70||r.height>460)continue;
      const y=scrollY+r.top;
      if(y>=pricingY)continue;
      const txt=(el.textContent||'').replace(/\s+/g,' ').trim();
      if(txt.length<24||txt.length>420)continue;
      const cs=getComputedStyle(el);
      const radius=parseFloat(cs.borderTopLeftRadius)||0;
      const border=parseFloat(cs.borderTopWidth)||0;
      if(radius<8&&border<1)continue;
      el.classList.add('we-seo-hover-card');
      count++;
    }
  }

  function boot(){
    repairToolLinks();
    polishSeoCards();
    const mo=new MutationObserver(list=>{
      for(const m of list){
        m.addedNodes?.forEach(node=>{
          if(node?.nodeType===1)repairToolLinks(node);
        });
      }
    });
    mo.observe(document.documentElement,{childList:true,subtree:true});
    setTimeout(()=>{polishSeoCards();mo.disconnect();},5000);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
