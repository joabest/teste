(() => {
  'use strict';
  if (window.__WE_SECTION_PROGRESS_PINK_V3__) return;
  window.__WE_SECTION_PROGRESS_PINK_V3__ = true;

  const PINK = '#ec008c';
  const MIN_SECTION_H = 180;
  const path = location.pathname.replace(/\/+$/,'') || '/';
  const isHome = new Set(['/','/index.html','/es','/es/index.html']).has(path);
  let rail = null;
  let dots = [];
  let sections = [];
  let raf = 0;

  document.getElementById('we-section-progress-pink')?.remove();

  const style = document.createElement('style');
  style.id = 'we-section-progress-pink-style-v3';
  style.textContent = `
    #we-section-progress-pink{
      position:fixed;right:18px;left:auto;top:50%;transform:translateY(-50%);z-index:9996;
      display:flex;flex-direction:column;align-items:center;gap:8px;pointer-events:auto;user-select:none;
      -webkit-tap-highlight-color:transparent;
    }
    #we-section-progress-pink::before{
      content:"";position:absolute;top:-13px;bottom:-13px;left:50%;width:1px;transform:translateX(-50%);
      background:linear-gradient(to bottom,transparent,rgba(236,0,140,.20) 10%,rgba(236,0,140,.20) 90%,transparent);z-index:-1;
    }
    #we-section-progress-pink button{
      width:8px;height:8px;padding:0;margin:0;border:1px solid ${PINK};border-radius:999px;background:#171717;
      opacity:.68;cursor:pointer;transition:height .24s ease,width .24s ease,background-color .24s ease,opacity .24s ease,box-shadow .24s ease,border-radius .24s ease;
    }
    #we-section-progress-pink button.is-past{background:${PINK};opacity:.88;box-shadow:0 0 7px rgba(236,0,140,.20)}
    #we-section-progress-pink button.is-active{
      width:8px;height:24px;border-radius:999px;background:${PINK};opacity:1;box-shadow:0 0 11px rgba(236,0,140,.38);
    }
    #we-section-progress-pink button:hover{opacity:1}
    @media(max-width:767px){
      #we-section-progress-pink{right:8px;gap:6px;transform:translateY(-50%) scale(.84);transform-origin:right center}
      #we-section-progress-pink button{width:7px;height:7px}
      #we-section-progress-pink button.is-active{width:7px;height:20px}
    }
    @media(prefers-reduced-motion:reduce){#we-section-progress-pink button{transition:none!important}html{scroll-behavior:auto!important}}
  `;
  (document.head || document.documentElement).appendChild(style);

  function isUsable(el) {
    if (!(el instanceof HTMLElement)) return false;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return false;
    const r = el.getBoundingClientRect();
    return r.height >= MIN_SECTION_H && r.width >= Math.min(280, innerWidth * .45);
  }

  function candidates() {
    const selectors = ['main > section','main section[data-section]','section[data-section]','main > div > section','[data-method="true"]','footer'];
    const raw = [...document.querySelectorAll(selectors.join(','))].filter(isUsable);
    const uniq = [];
    for (const el of raw) {
      if (uniq.includes(el)) continue;
      if (uniq.some(p => p.contains(el))) continue;
      uniq.push(el);
    }
    uniq.sort((a,b) => (a.getBoundingClientRect().top + scrollY) - (b.getBoundingClientRect().top + scrollY));
    return uniq;
  }

  function hideNativePercentageRail() {
    const all = [...document.querySelectorAll('body *')];
    for (const el of all) {
      if (!(el instanceof HTMLElement) || el.id === 'we-section-progress-pink' || el.closest('#we-section-progress-pink')) continue;
      const text = (el.textContent || '').trim();
      if (!/^\d{1,3}%$/.test(text)) continue;
      const cs = getComputedStyle(el), r = el.getBoundingClientRect();
      const onRight = r.left > innerWidth * .78, small = r.width < 100 && r.height < 120;
      if ((cs.position === 'fixed' || cs.position === 'sticky' || cs.position === 'absolute') && onRight && small) {
        el.style.setProperty('opacity','0','important');
        el.style.setProperty('pointer-events','none','important');
      }
    }
  }

  function makeRail(count) {
    rail?.remove();
    rail = document.createElement('nav');
    rail.id = 'we-section-progress-pink';
    rail.setAttribute('aria-label', isHome ? 'Scroll progress' : 'Page sections');
    dots = Array.from({length:count}, (_,i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', `Go to page ${i + 1} of ${count}`);
      rail.appendChild(b);
      return b;
    });
    document.body.appendChild(rail);
  }

  function buildHome() {
    hideNativePercentageRail();
    makeRail(3);
    dots.forEach((b,i) => b.addEventListener('click', () => {
      const max = Math.max(0, document.documentElement.scrollHeight - innerHeight);
      const y = max * (i / 2);
      scrollTo({top:y,behavior:'smooth'});
    }));
    updateHome();
  }

  function updateHome() {
    raf = 0;
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const progress = Math.max(0, Math.min(1, scrollY / max));
    const active = progress < 1/3 ? 0 : progress < 2/3 ? 1 : 2;
    dots.forEach((d,i) => {
      d.classList.toggle('is-active', i === active);
      d.classList.toggle('is-past', i < active);
      d.setAttribute('aria-current', i === active ? 'true' : 'false');
    });
  }

  function buildSections() {
    sections = candidates();
    hideNativePercentageRail();
    if (sections.length < 2) { rail?.remove(); rail=null; dots=[]; return; }
    makeRail(sections.length);
    dots.forEach((b,i) => b.addEventListener('click', () => sections[i]?.scrollIntoView({behavior:'smooth',block:'start'})));
    updateSections();
  }

  function updateSections() {
    raf = 0;
    if (!sections.length || !dots.length) return;
    const probe = innerHeight * .42;
    let active = 0, best = Infinity;
    sections.forEach((section,i) => {
      const r = section.getBoundingClientRect();
      const center = r.top + Math.min(r.height, innerHeight) * .35;
      const dist = Math.abs(center - probe);
      if (dist < best) { best=dist; active=i; }
    });
    dots.forEach((d,i) => {
      d.classList.toggle('is-active', i===active);
      d.classList.toggle('is-past', i<active);
      d.setAttribute('aria-current', i===active ? 'true' : 'false');
    });
  }

  function update() { isHome ? updateHome() : updateSections(); }
  function onScroll() { if (!raf) raf=requestAnimationFrame(update); }

  function loadPolish() {
    if (!document.querySelector('script[data-site-polish-v24]')) {
      const s=document.createElement('script');s.src='/site-polish-v24.js?v=25';s.defer=true;s.dataset.sitePolishV24='1';(document.head||document.documentElement).appendChild(s);
    }
    if (!document.querySelector('script[data-site-interactions-v17]')) {
      const x=document.createElement('script');x.src='/site-interactions-v17.js?v=17';x.defer=true;x.dataset.siteInteractionsV17='1';(document.head||document.documentElement).appendChild(x);
    }
  }

  function boot() {
    isHome ? buildHome() : buildSections();
    loadPolish();
    addEventListener('scroll',onScroll,{passive:true});
    addEventListener('resize',()=>{clearTimeout(boot._t);boot._t=setTimeout(()=>{isHome?updateHome():buildSections()},180)},{passive:true});
    if (!isHome) {
      const mo=new MutationObserver(()=>{clearTimeout(boot._m);boot._m=setTimeout(buildSections,350)});
      mo.observe(document.body,{childList:true,subtree:true});
      setTimeout(()=>mo.disconnect(),7000);
    }
  }

  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
})();