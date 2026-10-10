(() => {
  'use strict';
  if (window.__WE_SECTION_PROGRESS_PINK_V4__) return;
  window.__WE_SECTION_PROGRESS_PINK_V4__ = true;

  const PINK='#ec008c';
  const path=location.pathname.replace(/\/+$/,'')||'/';
  const isHome=new Set(['/','/index.html','/es','/es/index.html']).has(path);
  let rail=null,dots=[],sections=[],raf=0;

  document.getElementById('we-section-progress-pink')?.remove();
  document.getElementById('we-section-progress-pink-style-v3')?.remove();

  const style=document.createElement('style');
  style.id='we-section-progress-pink-style-v4';
  style.textContent=`
    body>[data-complete][aria-hidden="true"]{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important}
    #we-section-progress-pink{position:fixed!important;right:18px!important;left:auto!important;top:50%!important;transform:translateY(-50%)!important;z-index:2147483000!important;display:flex!important;visibility:visible!important;opacity:1!important;flex-direction:column;align-items:center;gap:8px;pointer-events:auto;user-select:none;-webkit-tap-highlight-color:transparent}
    #we-section-progress-pink::before{content:"";position:absolute;top:-13px;bottom:-13px;left:50%;width:1px;transform:translateX(-50%);background:linear-gradient(to bottom,transparent,rgba(236,0,140,.2) 10%,rgba(236,0,140,.2) 90%,transparent);z-index:-1}
    #we-section-progress-pink button{display:block!important;width:8px;height:8px;padding:0;margin:0;border:1px solid ${PINK};border-radius:999px;background:#171717;opacity:.72;cursor:pointer;transition:height .24s ease,width .24s ease,background-color .24s ease,opacity .24s ease,box-shadow .24s ease}
    #we-section-progress-pink button.is-past{background:${PINK};opacity:.9;box-shadow:0 0 7px rgba(236,0,140,.22)}
    #we-section-progress-pink button.is-active{width:8px;height:24px;background:${PINK};opacity:1;box-shadow:0 0 12px rgba(236,0,140,.4)}
    @media(max-width:767px){#we-section-progress-pink{right:8px!important;gap:6px;transform:translateY(-50%) scale(.84)!important;transform-origin:right center}#we-section-progress-pink button{width:7px;height:7px}#we-section-progress-pink button.is-active{width:7px;height:20px}}
  `;
  (document.head||document.documentElement).appendChild(style);

  function removeLegacyPercent(root=document){
    const list=[];
    if(root instanceof HTMLElement&&root.matches('[data-complete]')) list.push(root);
    root.querySelectorAll?.('[data-complete]').forEach(el=>list.push(el));
    for(const el of list){
      if(!(el instanceof HTMLElement)||el.id==='we-section-progress-pink')continue;
      const txt=(el.textContent||'').replace(/\s+/g,'').trim();
      const fixed=el.classList.contains('fixed')||getComputedStyle(el).position==='fixed';
      if(fixed&&/^\d{1,3}%$/.test(txt)) el.remove();
    }
    document.querySelectorAll('body > div').forEach(el=>{
      if(!(el instanceof HTMLElement)||el.id==='we-section-progress-pink')return;
      const txt=(el.textContent||'').replace(/\s+/g,'').trim();
      if(!/^\d{1,3}%$/.test(txt))return;
      const cs=getComputedStyle(el),r=el.getBoundingClientRect();
      if(cs.position==='fixed'&&r.left>innerWidth*.7)el.remove();
    });
  }

  function usable(el){if(!(el instanceof HTMLElement))return false;const cs=getComputedStyle(el),r=el.getBoundingClientRect();return cs.display!=='none'&&cs.visibility!=='hidden'&&r.height>=180&&r.width>=Math.min(280,innerWidth*.45)}
  function candidates(){const raw=[...document.querySelectorAll('main > section,main section[data-section],section[data-section],[data-method="true"],footer')].filter(usable),u=[];for(const el of raw){if(u.includes(el)||u.some(p=>p.contains(el)))continue;u.push(el)}return u.sort((a,b)=>(a.getBoundingClientRect().top+scrollY)-(b.getBoundingClientRect().top+scrollY))}

  function makeRail(count){rail?.remove();rail=document.createElement('nav');rail.id='we-section-progress-pink';rail.setAttribute('aria-label',isHome?'Scroll progress':'Page sections');dots=Array.from({length:count},(_,i)=>{const b=document.createElement('button');b.type='button';b.setAttribute('aria-label',`Go to page ${i+1} of ${count}`);rail.appendChild(b);return b});document.body.appendChild(rail)}
  function buildHome(){removeLegacyPercent();makeRail(3);dots.forEach((b,i)=>b.addEventListener('click',()=>{const max=Math.max(0,document.documentElement.scrollHeight-innerHeight);scrollTo({top:max*(i/2),behavior:'smooth'})}));updateHome()}
  function updateHome(){raf=0;if(!rail||!document.body.contains(rail)||dots.length!==3){buildHome();return}const max=Math.max(1,document.documentElement.scrollHeight-innerHeight),p=Math.max(0,Math.min(1,scrollY/max)),a=p<1/3?0:p<2/3?1:2;dots.forEach((d,i)=>{d.classList.toggle('is-active',i===a);d.classList.toggle('is-past',i<a);d.setAttribute('aria-current',i===a?'true':'false')})}
  function buildSections(){removeLegacyPercent();sections=candidates();if(sections.length<2){rail?.remove();rail=null;dots=[];return}makeRail(sections.length);dots.forEach((b,i)=>b.addEventListener('click',()=>sections[i]?.scrollIntoView({behavior:'smooth',block:'start'})));updateSections()}
  function updateSections(){raf=0;if(!sections.length||!dots.length)return;const probe=innerHeight*.42;let active=0,best=Infinity;sections.forEach((s,i)=>{const r=s.getBoundingClientRect(),d=Math.abs(r.top+Math.min(r.height,innerHeight)*.35-probe);if(d<best){best=d;active=i}});dots.forEach((d,i)=>{d.classList.toggle('is-active',i===active);d.classList.toggle('is-past',i<active);d.setAttribute('aria-current',i===active?'true':'false')})}
  function update(){isHome?updateHome():updateSections()}
  function scroll(){if(!raf)raf=requestAnimationFrame(update)}
  function ensure(){removeLegacyPercent();if(isHome&&(!rail||!document.body.contains(rail)||dots.length!==3))buildHome()}

  function boot(){isHome?buildHome():buildSections();addEventListener('scroll',scroll,{passive:true});addEventListener('resize',()=>{clearTimeout(boot._r);boot._r=setTimeout(()=>isHome?updateHome():buildSections(),160)},{passive:true});addEventListener('pageshow',ensure,{passive:true});addEventListener('visibilitychange',()=>{if(!document.hidden)ensure()},{passive:true});const mo=new MutationObserver(ms=>{let relevant=false;for(const m of ms){for(const n of m.addedNodes){if(n instanceof HTMLElement&&((n.hasAttribute?.('data-complete'))||n.id==='we-section-progress-pink'))relevant=true}}if(relevant||isHome)ensure()});mo.observe(document.body,{childList:true,subtree:false});[250,700,1500,3000,6000].forEach(ms=>setTimeout(ensure,ms))}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();