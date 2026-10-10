(() => {
  'use strict';

  const sameOriginUrl=value=>{try{return new URL(value,location.href)}catch{return null}};
  const ANALYTICS_HOST=/((^|\.)googletagmanager\.com|(^|\.)google-analytics\.com)$/i;
  const MOBILE=matchMedia('(max-width: 767px)').matches;

  // The original Next page ships a fixed 000%/100% progress widget. It is no longer used.
  const legacyProgressStyle=document.createElement('style');
  legacyProgressStyle.id='we-remove-legacy-percent-v17';
  legacyProgressStyle.textContent='body>[data-complete][aria-hidden="true"]{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important}';
  (document.head||document.documentElement).appendChild(legacyProgressStyle);

  if(MOBILE){
    document.documentElement.classList.add('intro-skip','perf-mobile');
    const critical=document.createElement('style');
    critical.id='we-mobile-critical-v14';
    critical.textContent=`@media(max-width:767px){
      main[data-home-main="true"]{visibility:visible!important}
      [data-intro-overlay="true"]{display:none!important}
      [data-nav-root="true"]{opacity:1!important;pointer-events:auto!important;transition:none!important}
      [data-hero-title="true"],[data-hero-sub="true"],[data-hero-stats="true"]{opacity:1!important;visibility:visible!important;transform:none!important;transition:none!important}
      .ai-star,.stats-star-twinkle,.spark-trail-head,[data-pulse-ring="true"]{animation:none!important;filter:none!important}
      body>div[aria-hidden="true"].pointer-events-none.fixed.inset-0>canvas{display:none!important}
      main[data-home-main="true"] section[data-section]{content-visibility:auto;contain-intrinsic-size:900px}
      [data-method="true"]{content-visibility:visible!important;contain:none!important}
      [data-method="true"] [data-method-rail="true"],
      [data-method="true"] [data-method-track="true"],
      [data-method="true"] [data-method-slide]{content-visibility:visible!important;contain:none!important}
      [data-method="true"] [data-method-track="true"]{will-change:transform!important}
    }`;
    (document.head||document.documentElement).appendChild(critical);
  }

  const polishStaticDom=(root=document)=>{
    const scope=root&&root.querySelectorAll?root:document;
    scope.querySelectorAll('img[src^="/_next/image?url="]').forEach(img=>{
      try{
        const optimized=new URL(img.getAttribute('src'),location.origin);
        const direct=optimized.searchParams.get('url');
        if(!direct)return;
        const source=new URL(direct,location.origin);
        if(!/(^|\.)googleusercontent\.com$/i.test(source.hostname))return;
        img.removeAttribute('srcset');
        img.removeAttribute('sizes');
        img.referrerPolicy='no-referrer';
        img.src=source.href;
      }catch{}
    });
    scope.querySelectorAll('a[href*="awwwards.com/sites/weevolveit"]').forEach(node=>node.remove());
  };

  const optimizeImages=()=>{
    const hero=document.querySelector('[data-hero-section="true"]');
    const header=document.querySelector('[data-nav-root="true"]');
    document.querySelectorAll('img').forEach(img=>{
      if(hero?.contains(img)||header?.contains(img)) return;
      img.loading='lazy';
      img.decoding='async';
      try{img.fetchPriority='low'}catch{}
    });
  };

  const startStaticPolish=()=>{
    polishStaticDom(document);
    optimizeImages();
    document.querySelectorAll('body>[data-complete][aria-hidden="true"]').forEach(el=>el.remove());
    if(!document.documentElement)return;
    const observer=new MutationObserver(mutations=>{
      for(const mutation of mutations){
        for(const node of mutation.addedNodes){
          if(node&&node.nodeType===1){
            polishStaticDom(node);
            if(node.matches?.('body>[data-complete][aria-hidden="true"]'))node.remove();
          }
        }
      }
    });
    observer.observe(document.documentElement,{childList:true,subtree:true});
    setTimeout(()=>observer.disconnect(),7000);
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',startStaticPolish,{once:true});
  else startStaticPolish();

  document.addEventListener('click',event=>{
    if(event.defaultPrevented||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||event.button!==0)return;
    const a=event.target?.closest?.('a[href]');
    if(!a||a.hasAttribute('download')||(a.target&&a.target!=='_self'))return;
    const href=a.getAttribute('href');
    if(!href||href.startsWith('#')||href.startsWith('mailto:')||href.startsWith('tel:')||href.startsWith('javascript:'))return;
    const url=sameOriginUrl(a.href);
    if(!url||url.origin!==location.origin)return;
    if(url.pathname===location.pathname&&url.search===location.search&&url.hash)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    location.href=url.pathname+url.search+url.hash;
  },true);

  for(const name of ['pushState','replaceState']){
    const original=history[name].bind(history);
    history[name]=function(state,title,url){
      if(url!=null){
        const next=sameOriginUrl(url);
        if(next&&next.origin===location.origin&&next.pathname!==location.pathname){
          location.href=next.pathname+next.search+next.hash;
          return;
        }
      }
      return original(state,title,url);
    };
  }

  const nativeFetch=window.fetch?.bind(window);
  if(nativeFetch){
    window.fetch=function(input,init){
      let url;
      try{url=new URL(typeof input==='string'?input:input.url,location.href)}catch{return nativeFetch(input,init)}
      if(ANALYTICS_HOST.test(url.hostname))return Promise.resolve(new Response('',{status:204}));
      let isRsc=url.searchParams.has('_rsc');
      try{
        const headers=new Headers(init?.headers||(typeof input!=='string'&&input.headers?input.headers:undefined));
        if(headers.get('RSC')==='1'||headers.has('Next-Router-State-Tree'))isRsc=true;
      }catch{}
      if(isRsc&&url.origin===location.origin&&url.pathname!==location.pathname)return new Promise(()=>{});
      return nativeFetch(input,init);
    };
  }

  const scriptSrc=Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype,'src');
  if(scriptSrc?.set&&scriptSrc?.get){
    Object.defineProperty(HTMLScriptElement.prototype,'src',{
      configurable:true,enumerable:scriptSrc.enumerable,get:scriptSrc.get,
      set(value){
        let next=value;
        try{
          const u=new URL(value,location.href);
          if(ANALYTICS_HOST.test(u.hostname))next='data:text/javascript,/*analytics-disabled*/';
          else if(u.origin===location.origin&&u.pathname.startsWith('/_next/static/chunks/')&&!this.hasAttribute('data-static-initial'))next='https://weevolveit.com'+u.pathname+u.search;
        }catch{}
        return scriptSrc.set.call(this,next);
      }
    });
  }

  const linkHref=Object.getOwnPropertyDescriptor(HTMLLinkElement.prototype,'href');
  if(linkHref?.set&&linkHref?.get){
    Object.defineProperty(HTMLLinkElement.prototype,'href',{
      configurable:true,enumerable:linkHref.enumerable,get:linkHref.get,
      set(value){
        let next=value;
        try{
          const u=new URL(value,location.href);
          if(ANALYTICS_HOST.test(u.hostname))next='data:text/plain,';
          else if(u.origin===location.origin&&u.pathname.startsWith('/_next/static/chunks/')&&this.rel==='stylesheet')next='https://weevolveit.com'+u.pathname+u.search;
        }catch{}
        return linkHref.set.call(this,next);
      }
    });
  }

  let recovered=false;
  const recover=()=>{
    if(recovered)return;
    const text=(document.body?.innerText||'').toLowerCase();
    if(!text.includes("this page couldn't load")&&!text.includes('this page could not load'))return;
    recovered=true;
    const key='wee-static-recover:'+location.pathname+location.search;
    try{
      if(sessionStorage.getItem(key)==='1'){history.back();return}
      sessionStorage.setItem(key,'1');
    }catch{}
    location.reload();
  };
  const observe=()=>{
    if(!document.documentElement)return;
    const mo=new MutationObserver(recover);
    mo.observe(document.documentElement,{childList:true,subtree:true});
    setTimeout(()=>mo.disconnect(),7000);
    recover();
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',observe,{once:true});
  else observe();
})();

/* MIRROR_CRITICAL_VISUAL_FIXES_V17 */
(()=>{
  const load=(src,key)=>{
    if(document.querySelector(`script[data-mirror-v17="${key}"]`))return;
    const s=document.createElement('script');
    s.src=src;
    s.defer=true;
    s.dataset.mirrorV17=key;
    (document.head||document.documentElement).appendChild(s);
  };
  const ready=fn=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn,{once:true}):fn();
  const idle=fn=>{const run=()=>('requestIdleCallback' in window?requestIdleCallback(fn,{timeout:1200}):setTimeout(fn,450));if(document.readyState==='complete')run();else addEventListener('load',run,{once:true})};

  ready(()=>load('/asset-fallback-v6.js?v=15','assets'));
  ready(()=>load('/section-progress-pink.js?v=4','section-progress'));

  const p=location.pathname.replace(/\/+$/,'')||'/';
  const methodPages=new Set(['/','/index.html','/method','/es','/es/index.html','/es/method']);
  if(methodPages.has(p))ready(()=>load('/method-scroll-v6.js?v=17','method'));

  const homePages=new Set(['/','/index.html','/es','/es/index.html']);
  if(homePages.has(p)){
    ready(()=>load('/footer-particle-fallback.js?v=15','footer-particles'));
    idle(()=>load('/globe-live-v6.js?v=25','globe-interactive'));
  }

  const blogPages=new Set(['/blog','/blog.html','/es/blog','/es/blog.html']);
  if(blogPages.has(p))ready(()=>load('/blog-pagination-v1.js?v=2','blog-pagination'));
})();