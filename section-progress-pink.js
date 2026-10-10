(() => {
  'use strict';
  if(window.__WE_SECTION_PROGRESS_PINK_V6__)return;
  window.__WE_SECTION_PROGRESS_PINK_V6__=true;

  const PINK='#ec008c';
  const path=location.pathname.replace(/\/+$/,'')||'/';
  const isHome=new Set(['/','/index.html','/es','/es/index.html']).has(path);
  const isMethodPage=new Set(['/','/index.html','/method','/es','/es/index.html','/es/method']).has(path);
  const mobile=matchMedia('(max-width:767px)').matches;
  let rail=null,dots=[],sections=[],raf=0;

  const style=document.createElement('style');
  style.id='we-section-progress-pink-style-v6';
  style.textContent=`
    body>[data-complete][aria-hidden="true"]{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important}
    #we-section-progress-pink{position:fixed!important;right:18px!important;left:auto!important;top:50%!important;transform:translateY(-50%)!important;z-index:2147482500!important;display:flex!important;visibility:visible!important;opacity:1!important;flex-direction:column;align-items:center;gap:8px;pointer-events:auto;user-select:none}
    #we-section-progress-pink::before{content:"";position:absolute;top:-13px;bottom:-13px;left:50%;width:1px;transform:translateX(-50%);background:linear-gradient(to bottom,transparent,rgba(236,0,140,.2) 10%,rgba(236,0,140,.2) 90%,transparent);z-index:-1}
    #we-section-progress-pink button{display:block!important;width:8px;height:8px;padding:0;margin:0;border:1px solid ${PINK};border-radius:999px;background:#171717;opacity:.72;cursor:pointer}
    #we-section-progress-pink button.is-past{background:${PINK};opacity:.9}
    #we-section-progress-pink button.is-active{width:8px;height:24px;background:${PINK};opacity:1}
    @media(max-width:767px){
      #we-section-progress-pink{right:8px!important;gap:6px;transform:translateY(-50%) scale(.84)!important;transform-origin:right center}
      #we-section-progress-pink button{width:7px;height:7px}#we-section-progress-pink button.is-active{width:7px;height:20px}
      main[data-home-main="true"],[data-method="true"],[data-method="true"] [data-method-rail="true"],[data-method="true"] [data-method-track="true"],[data-method="true"] [data-method-intro="true"],[data-method="true"] [data-method-slide]{background:#0b0b0d!important}
      [data-method="true"]{height:auto!important;min-height:0!important;overflow:visible!important;contain:none!important}
      [data-method="true"] [data-method-rail="true"]{position:relative!important;top:auto!important;height:auto!important;min-height:0!important;overflow:visible!important}
      .we-soft-transition-v24,.we-soft-transition-v25{display:none!important}
    }
  `;
  (document.head||document.documentElement).appendChild(style);

  function load(src,key){
    if(document.querySelector(`script[data-we-v6="${key}"]`))return;
    const s=document.createElement('script');s.src=src;s.defer=true;s.dataset.weV6=key;(document.head||document.documentElement).appendChild(s);
  }

  load('/mobile-nav-fix.js?v=7','mobile-nav');
  if(mobile&&isMethodPage)load('/method-scroll-v6.js?v=21','method-mobile');

  function removeLegacyPercent(){document.querySelectorAll('body>[data-complete][aria-hidden="true"]').forEach(el=>el.remove())}
  function usable(el){if(!(el instanceof HTMLElement))return false;const cs=getComputedStyle(el),r=el.getBoundingClientRect();return cs.display!=='none'&&cs.visibility!=='hidden'&&r.height>=180&&r.width>=Math.min(280,innerWidth*.45)}
  function candidates(){const raw=[...document.querySelectorAll('main > section,main section[data-section],section[data-section],[data-method="true"],footer')].filter(usable),u=[];for(const el of raw){if(u.includes(el)||u.some(p=>p.contains(el)))continue;u.push(el)}return u.sort((a,b)=>(a.getBoundingClientRect().top+scrollY)-(b.getBoundingClientRect().top+scrollY))}
  function makeRail(count){rail?.remove();rail=document.createElement('nav');rail.id='we-section-progress-pink';rail.setAttribute('aria-label',isHome?'Scroll progress':'Page sections');dots=Array.from({length:count},(_,i)=>{const b=document.createElement('button');b.type='button';b.setAttribute('aria-label',`Go to page ${i+1} of ${count}`);rail.appendChild(b);return b});document.body.appendChild(rail)}
  function buildHome(){removeLegacyPercent();makeRail(3);dots.forEach((b,i)=>b.addEventListener('click',()=>{const max=Math.max(0,document.documentElement.scrollHeight-innerHeight);scrollTo({top:max*(i/2),behavior:'smooth'})}));updateHome()}
  function updateHome(){raf=0;if(!dots.length)return;const max=Math.max(1,document.documentElement.scrollHeight-innerHeight),p=Math.max(0,Math.min(1,scrollY/max)),a=p<1/3?0:p<2/3?1:2;dots.forEach((d,i)=>{d.classList.toggle('is-active',i===a);d.classList.toggle('is-past',i<a)})}
  function buildSections(){removeLegacyPercent();sections=candidates();if(sections.length<2){rail?.remove();rail=null;dots=[];return}makeRail(sections.length);dots.forEach((b,i)=>b.addEventListener('click',()=>sections[i]?.scrollIntoView({behavior:'smooth',block:'start'})));updateSections()}
  function updateSections(){raf=0;if(!sections.length||!dots.length)return;const probe=innerHeight*.42;let active=0,best=Infinity;sections.forEach((s,i)=>{const r=s.getBoundingClientRect(),d=Math.abs(r.top+Math.min(r.height,innerHeight)*.35-probe);if(d<best){best=d;active=i}});dots.forEach((d,i)=>{d.classList.toggle('is-active',i===active);d.classList.toggle('is-past',i<active)})}
  function onScroll(){if(!raf)raf=requestAnimationFrame(isHome?updateHome:updateSections)}
  function onResize(){clearTimeout(onResize.t);onResize.t=setTimeout(()=>isHome?updateHome():buildSections(),180)}
  function boot(){isHome?buildHome():buildSections();addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',onResize,{passive:true});addEventListener('pageshow',()=>{removeLegacyPercent();isHome?updateHome():updateSections()},{passive:true});if(!isHome)setTimeout(buildSections,700)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();