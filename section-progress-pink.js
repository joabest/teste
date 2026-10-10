(() => {
  'use strict';
  if (window.__WE_SECTION_PROGRESS_PINK_V2__) return;
  window.__WE_SECTION_PROGRESS_PINK_V2__ = true;

  const PINK = '#ec008c';
  const MIN_SECTION_H = 180;
  let rail = null;
  let dots = [];
  let sections = [];
  let raf = 0;

  document.getElementById('we-section-progress-pink')?.remove();

  const style = document.createElement('style');
  style.id = 'we-section-progress-pink-style-v2';
  style.textContent = `
    #we-section-progress-pink{
      position:fixed;
      right:18px;
      left:auto;
      top:50%;
      transform:translateY(-50%);
      z-index:9996;
      display:flex;
      flex-direction:column;
      align-items:center;
      gap:7px;
      pointer-events:auto;
      user-select:none;
      -webkit-tap-highlight-color:transparent;
    }
    #we-section-progress-pink::before{
      content:"";
      position:absolute;
      top:-13px;
      bottom:-13px;
      left:50%;
      width:1px;
      transform:translateX(-50%);
      background:linear-gradient(to bottom,transparent,rgba(236,0,140,.14) 10%,rgba(236,0,140,.14) 90%,transparent);
      z-index:-1;
    }
    #we-section-progress-pink button{
      width:8px;
      height:8px;
      padding:0;
      margin:0;
      border:1px solid ${PINK};
      border-radius:999px;
      background:#171717;
      opacity:.62;
      cursor:pointer;
      transition:height .24s ease,width .24s ease,background-color .24s ease,opacity .24s ease,box-shadow .24s ease,border-radius .24s ease;
    }
    #we-section-progress-pink button.is-active{
      width:8px;
      height:24px;
      border-radius:999px;
      background:${PINK};
      opacity:1;
      box-shadow:0 0 10px rgba(236,0,140,.32);
    }
    #we-section-progress-pink button:hover{opacity:1}
    @media (max-width:767px){
      #we-section-progress-pink{
        right:8px;
        left:auto;
        gap:5px;
        transform:translateY(-50%) scale(.82);
        transform-origin:right center;
      }
      #we-section-progress-pink button{width:7px;height:7px}
      #we-section-progress-pink button.is-active{width:7px;height:20px}
    }
    @media (prefers-reduced-motion:reduce){
      #we-section-progress-pink button{transition:none!important}
      html{scroll-behavior:auto!important}
    }
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
    const selectors = [
      'main > section',
      'main section[data-section]',
      'section[data-section]',
      'main > div > section',
      '[data-method="true"]',
      'footer'
    ];
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
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      const onRight = r.left > innerWidth * .78;
      const small = r.width < 100 && r.height < 120;
      if ((cs.position === 'fixed' || cs.position === 'sticky' || cs.position === 'absolute') && onRight && small) {
        el.style.setProperty('opacity', '0', 'important');
        el.style.setProperty('pointer-events', 'none', 'important');
      }
    }
  }

  function build() {
    sections = candidates();
    hideNativePercentageRail();
    if (sections.length < 2) {
      rail?.remove();
      rail = null;
      dots = [];
      return;
    }

    rail?.remove();
    rail = document.createElement('nav');
    rail.id = 'we-section-progress-pink';
    rail.setAttribute('aria-label', 'Page sections');

    dots = sections.map((section, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', `Go to section ${i + 1} of ${sections.length}`);
      b.addEventListener('click', () => {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      rail.appendChild(b);
      return b;
    });
    document.body.appendChild(rail);
    update();
  }

  function update() {
    raf = 0;
    if (!sections.length || !dots.length) return;
    const probe = innerHeight * .42;
    let active = 0;
    let best = Infinity;
    sections.forEach((section, i) => {
      const r = section.getBoundingClientRect();
      const center = r.top + Math.min(r.height, innerHeight) * .35;
      const dist = Math.abs(center - probe);
      if (dist < best) { best = dist; active = i; }
    });
    dots.forEach((d, i) => {
      const on = i === active;
      d.classList.toggle('is-active', on);
      d.setAttribute('aria-current', on ? 'true' : 'false');
    });
  }

  function onScroll() {
    if (!raf) raf = requestAnimationFrame(update);
  }

  function loadPolish() {
    if (!document.querySelector('script[data-site-polish-v24]')) {
      const s = document.createElement('script');
      s.src = '/site-polish-v24.js?v=24';
      s.defer = true;
      s.dataset.sitePolishV24 = '1';
      (document.head || document.documentElement).appendChild(s);
    }
    if (!document.querySelector('script[data-site-interactions-v17]')) {
      const x = document.createElement('script');
      x.src = '/site-interactions-v17.js?v=17';
      x.defer = true;
      x.dataset.siteInteractionsV17 = '1';
      (document.head || document.documentElement).appendChild(x);
    }
  }

  function boot() {
    build();
    loadPolish();
    addEventListener('scroll', onScroll, { passive:true });
    addEventListener('resize', () => {
      clearTimeout(boot._t);
      boot._t = setTimeout(build, 180);
    }, { passive:true });

    const mo = new MutationObserver(() => {
      clearTimeout(boot._m);
      boot._m = setTimeout(build, 350);
    });
    mo.observe(document.body, { childList:true, subtree:true });
    setTimeout(() => mo.disconnect(), 7000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once:true });
  } else {
    boot();
  }
})();