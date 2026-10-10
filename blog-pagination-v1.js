(() => {
  'use strict';
  if (window.__WE_BLOG_PAGINATION_V1__) return;
  window.__WE_BLOG_PAGINATION_V1__ = true;

  const BATCH = 20;
  let visible = BATCH;
  let observer;
  let raf = 0;

  const isBlogPostHref = href => {
    if (!href) return false;
    try {
      const u = new URL(href, location.href);
      const p = u.pathname.replace(/\/+$/, '');
      return /^\/(?:es\/)?blog\/[^/]+$/.test(p) && !p.includes('/category/');
    } catch { return false; }
  };

  function findGrid() {
    const lists = [...document.querySelectorAll('main ul[data-reveal-stagger], ul[data-reveal-stagger]')];
    return lists.find(ul => {
      const links = [...ul.querySelectorAll('a[href]')].filter(a => isBlogPostHref(a.getAttribute('href')));
      return links.length >= 20;
    }) || null;
  }

  function cards(ul) {
    return [...ul.children].filter(li => li.querySelector?.('a[href]') && isBlogPostHref(li.querySelector('a[href]').getAttribute('href')));
  }

  function labels(total) {
    const lang = (document.documentElement.lang || '').toLowerCase();
    const remaining = Math.max(0, total - visible);
    const next = Math.min(BATCH, remaining);
    if (lang.startsWith('es')) return next === 1 ? 'Mostrar 1 artículo más' : `Mostrar ${next} artículos más`;
    return next === 1 ? 'Show 1 more article' : `Show ${next} more articles`;
  }

  function fallbackBrokenCover(img) {
    if (img.dataset.weBlogFallback === '1') return;
    img.dataset.weBlogFallback = '1';
    const wrap = img.parentElement;
    if (!wrap || wrap.querySelector('.we-blog-cover-fallback')) return;
    img.style.setProperty('opacity', '0', 'important');
    const box = document.createElement('div');
    box.className = 'we-blog-cover-fallback';
    box.setAttribute('aria-hidden', 'true');
    box.innerHTML = '<span>WeEvolve<span>IT</span></span>';
    Object.assign(box.style, {
      position:'absolute', inset:'0', display:'grid', placeItems:'center',
      background:'radial-gradient(circle at 50% 42%,rgba(236,0,140,.10),transparent 42%),#171717',
      color:'rgba(240,240,248,.42)', fontWeight:'700', letterSpacing:'-.03em', zIndex:'0'
    });
    const inner = box.querySelector('span');
    if (inner) inner.style.fontSize = 'clamp(18px,2.2vw,30px)';
    const accent = box.querySelector('span span');
    if (accent) accent.style.color = '#ec008c';
    wrap.prepend(box);
  }

  function watchCovers(root=document) {
    root.querySelectorAll?.('img').forEach(img => {
      let src = img.getAttribute('src') || '';
      try {
        const u = new URL(src, location.href);
        if (u.pathname === '/_next/image') src = u.searchParams.get('url') || src;
      } catch {}
      if (!src.includes('/blog/covers/')) return;
      if (img.complete && img.naturalWidth === 0) fallbackBrokenCover(img);
      img.addEventListener('error', () => fallbackBrokenCover(img), { once:true });
    });
  }

  function findNativeButton(ul) {
    const section = ul.closest('section') || ul.parentElement;
    if (!section) return null;
    return [...section.querySelectorAll('button')].find(b => /show\s+all\s+\d+\s+articles|mostrar\s+todos?/i.test((b.textContent || '').trim())) || null;
  }

  function render() {
    raf = 0;
    const ul = findGrid();
    if (!ul) return;
    const list = cards(ul);
    if (!list.length) return;
    visible = Math.min(Math.max(BATCH, visible), list.length);

    list.forEach((li, i) => {
      if (i < visible) {
        li.style.setProperty('display', '', '');
        if (i >= 9) li.style.setProperty('display', 'list-item', 'important');
      } else {
        li.style.setProperty('display', 'none', 'important');
      }
    });

    let btn = document.getElementById('we-blog-load-more');
    const native = findNativeButton(ul);
    if (!btn && native) {
      btn = native.cloneNode(true);
      btn.id = 'we-blog-load-more';
      btn.type = 'button';
      btn.removeAttribute('aria-expanded');
      const fresh = btn.cloneNode(true);
      btn.replaceWith(fresh);
      btn = fresh;
      btn.addEventListener('click', e => {
        e.preventDefault();
        e.stopImmediatePropagation();
        visible = Math.min(list.length, visible + BATCH);
        render();
      }, true);
      native.replaceWith(btn);
    }

    if (btn) {
      if (visible >= list.length) {
        btn.closest('div.mt-12')?.remove();
        if (document.body.contains(btn)) btn.remove();
      } else {
        const arrow = btn.querySelector('[aria-hidden="true"]');
        const text = labels(list.length);
        [...btn.childNodes].forEach(n => { if (n.nodeType === Node.TEXT_NODE) n.remove(); });
        btn.insertBefore(document.createTextNode(text + ' '), arrow || btn.firstChild);
        btn.setAttribute('aria-label', text);
      }
    }

    watchCovers(ul);
  }

  function schedule() {
    if (!raf) raf = requestAnimationFrame(render);
  }

  function boot() {
    render();
    watchCovers();
    observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList:true, subtree:true });
    setTimeout(() => observer?.disconnect(), 12000);
    [250,700,1400,2600,5000].forEach(ms => setTimeout(render, ms));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once:true });
  else boot();
})();
