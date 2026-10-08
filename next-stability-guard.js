(() => {
  'use strict';

  const sameOriginUrl=(value)=>{try{return new URL(value,location.href)}catch{return null}};

  const polishStaticDom=(root=document)=>{
    const scope=root&&root.querySelectorAll?root:document;
    scope.querySelectorAll('img[src^="/_next/image?url="]').forEach(img=>{
      try{
        const optimized=new URL(img.getAttribute('src'),location.origin);
        const direct=optimized.searchParams.get('url');
        if(!direct)return;
        const source=new URL(direct);
        if(!/(^|\.)googleusercontent\.com$/i.test(source.hostname))return;
        img.removeAttribute('srcset');
        img.removeAttribute('sizes');
        img.referrerPolicy='no-referrer';
        img.src=source.href;
      }catch{}
    });
    scope.querySelectorAll('a[href*="awwwards.com/sites/weevolveit"]').forEach(node=>node.remove());
  };

  const startStaticPolish=()=>{
    polishStaticDom(document);
    if(!document.documentElement)return;
    const observer=new MutationObserver(mutations=>{
      for(const mutation of mutations){
        for(const node of mutation.addedNodes){
          if(node&&node.nodeType===1)polishStaticDom(node);
        }
      }
    });
    observer.observe(document.documentElement,{childList:true,subtree:true});
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',startStaticPolish,{once:true});
  else startStaticPolish();

  document.addEventListener('click',event=>{
    if(event.defaultPrevented||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||event.button!==0)return;
    const a=event.target&&event.target.closest?event.target.closest('a[href]'):null;
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

  const nativeFetch=window.fetch?window.fetch.bind(window):null;
  if(nativeFetch){
    window.fetch=function(input,init){
      let url;
      try{url=new URL(typeof input==='string'?input:input.url,location.href)}catch{return nativeFetch(input,init)}
      let isRsc=url.searchParams.has('_rsc');
      try{
        const headers=new Headers(init&&init.headers?init.headers:(typeof input!=='string'&&input.headers?input.headers:undefined));
        if(headers.get('RSC')==='1'||headers.has('Next-Router-State-Tree'))isRsc=true;
      }catch{}
      if(isRsc&&url.origin===location.origin&&url.pathname!==location.pathname)return new Promise(()=>{});
      return nativeFetch(input,init);
    };
  }

  const scriptSrc=Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype,'src');
  if(scriptSrc&&scriptSrc.set&&scriptSrc.get){
    Object.defineProperty(HTMLScriptElement.prototype,'src',{
      configurable:true,enumerable:scriptSrc.enumerable,get:scriptSrc.get,
      set(value){
        let next=value;
        try{
          const u=new URL(value,location.href);
          if(u.origin===location.origin&&u.pathname.startsWith('/_next/static/chunks/')&&!this.hasAttribute('data-static-initial'))next='https://weevolveit.com'+u.pathname+u.search;
        }catch{}
        return scriptSrc.set.call(this,next);
      }
    });
  }

  const linkHref=Object.getOwnPropertyDescriptor(HTMLLinkElement.prototype,'href');
  if(linkHref&&linkHref.set&&linkHref.get){
    Object.defineProperty(HTMLLinkElement.prototype,'href',{
      configurable:true,enumerable:linkHref.enumerable,get:linkHref.get,
      set(value){
        let next=value;
        try{
          const u=new URL(value,location.href);
          if(u.origin===location.origin&&u.pathname.startsWith('/_next/static/chunks/')&&this.rel==='stylesheet')next='https://weevolveit.com'+u.pathname+u.search;
        }catch{}
        return linkHref.set.call(this,next);
      }
    });
  }

  let recovered=false;
  const recover=()=>{
    if(recovered)return;
    const text=(document.body&&document.body.innerText||'').toLowerCase();
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
    recover();
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',observe,{once:true});
  else observe();
})();

/* MIRROR_CRITICAL_VISUAL_FIXES_V5 */
(()=>{
  const load=(src,key)=>{
    if(document.querySelector(`script[data-mirror-v5="${key}"]`))return;
    const s=document.createElement('script');
    s.src=src;
    s.defer=true;
    s.dataset.mirrorV5=key;
    (document.head||document.documentElement).appendChild(s);
  };
  load('/mirror-ui-fixes.js?v=5','assets');
  if(location.pathname==='/'||location.pathname==='/index.html'){
    load('/globe-live-v5.js?v=5','globe');
    load('/method-scroll-fallback.js?v=5','method');
    load('/footer-particle-fallback.js?v=5','particles');
  }
})();
