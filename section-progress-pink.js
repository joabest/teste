(() => {
  'use strict';
  if (window.__WE_SECTION_PROGRESS_PINK__) return;
  window.__WE_SECTION_PROGRESS_PINK__ = true;

  const PINK = '#ec008c';
  const MAX_DOTS = 9;
  const MIN_SECTION_H = 180;
  let rail = null;
  let dots = [];
  let sections = [];
  let raf = 0;

  const style = document.createElement('style');
  style.id = 'we-section-progress-pink-style';
  style.textContent = `
    #we-section-progress-pink{
      position:fixed;
      left:28px;
      top:50%;
      transform:translateY(-50%);
      z-index:9998;
      display:flex;
      flex-direction:column;
      align-items:center;
      gap:10px;
      pointer-events:auto;
      user-select:none;
      -webkit-tap-highlight-color:transparent;
    }
    #we-section-progress-pink button{
      width:10px;
      height:10px;
      padding:0;
      margin:0;
      border:1.25px solid ${PINK};
      border-radius:999px;
      background:transparent;
      opacity:.58;
      cursor:pointer;
      transition:height .28s ease,width .28s ease,background-color .28s ease,opacity .28s ease,box-shadow .28s ease,border-radius .28s ease;
    }
    #we-section-progress-pink button.is-active{
      width:10px;
      height:30px;
      border-radius:999px;
      background:${PINK};
      opacity:1;
      box-shadow:0 0 14px rgba(236,0,140,.34);
    }
    #we-section-progress-pink button:hover{opacity:1}
    @media (max-width:767px){
      #we-section-progress-pink{
        left:14px;
        gap:8px;
        transform:translateY(-50%) scale(.9);
        transform-origin:left center;
      }
      #we-section-progress-pink button{width:9px;height:9px}
      #we-section-progress-pink button.is-active{width:9px;height:25px}
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
    if (uniq.length <= MAX_DOTS) return uniq;

    const picked = [];
    for (let i = 0; i < MAX_DOTS; i++) {
      const idx = Math.round(i * (uniq.length - 1) / (MAX_DOTS - 1));
      picked.push(uniq[idx]);
    }
    return [...new Set(picked)];
  }

  function build() {
    sections = candidates();
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
      b.setAttribute('aria-label', `Go to section ${i + 1}`);
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

  function boot() {
    build();
    addEventListener('scroll', onScroll, { passive:true });
    addEventListener('resize', () => {
      clearTimeout(boot._t);
      boot._t = setTimeout(() => { build(); }, 180);
    }, { passive:true });

    const mo = new MutationObserver(() => {
      clearTimeout(boot._m);
      boot._m = setTimeout(() => build(), 350);
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