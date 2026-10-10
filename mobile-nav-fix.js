(() => {
  'use strict';
  if (window.__WE_MOBILE_NAV_FIX_V3__) return;
  window.__WE_MOBILE_NAV_FIX_V3__ = true;

  const MOBILE_MAX = 767;
  const norm = v => (v || '').replace(/\s+/g,' ').trim().toLowerCase();
  let header=null,button=null,panel=null,backdrop=null,open=false,lastPanel=null,lastButton=null;

  function isMobile(){ return innerWidth<=MOBILE_MAX; }
  function findHeader(){ return document.querySelector('[data-nav-root="true"]') || document.querySelector('header'); }
  function findButton(root){
    if(!root) return null;
    return root.querySelector('button[aria-label="Open menu"],button[aria-label="Close menu"],button[aria-label="Abrir menu"],button[aria-label="Fechar menu"]')
      || [...root.querySelectorAll('button')].find(el=>{
        const label=norm(el.getAttribute('aria-label'));
        return (label.includes('menu') || el.getAttribute('aria-expanded')!==null) && !/search|buscar/.test(label);
      }) || null;
  }
  function looksMenu(el){
    if(!el) return false;
    const t=norm(el.textContent);
    return t.includes('services')&&t.includes('method')&&t.includes('case studies')&&
      t.includes('business diagnosis')&&t.includes('ai visibility check')&&t.includes('free seo check')&&
      t.includes('about')&&t.includes('blog')&&t.includes('reviews')&&t.includes('contact')&&t.includes('message us');
  }
  function findPanel(root,btn){
    const id=btn?.getAttribute('aria-controls');
    if(id){ const el=document.getElementById(id); if(el) return el; }
    const list=[...(root||document).querySelectorAll('nav,aside,section,div')]
      .filter(el=>el!==root&&looksMenu(el))
      .map(el=>({el,depth:(()=>{let d=0,n=el;while(n&&n!==root){d++;n=n.parentElement}return d})()}))
      .sort((a,b)=>b.depth-a.depth);
    return list[0]?.el||null;
  }
  function imp(el,p,v){ if(el) el.style.setProperty(p,v,'important'); }
  function unlock(){
    document.documentElement.style.removeProperty('overflow');
    document.body.style.removeProperty('overflow');
    document.documentElement.classList.remove('overflow-hidden');
    document.body.classList.remove('overflow-hidden');
  }
  function ensureBackdrop(){
    if(backdrop&&document.contains(backdrop)) return;
    backdrop=document.createElement('div');
    backdrop.id='we-mobile-menu-backdrop';
    Object.assign(backdrop.style,{position:'fixed',inset:'0',background:'rgba(0,0,0,.24)',backdropFilter:'blur(2px)',zIndex:'2147482998',display:'none'});
    backdrop.addEventListener('click',()=>setOpen(false));
    document.body.appendChild(backdrop);
  }
  function visualHeight(){ return window.visualViewport?.height || innerHeight; }
  function visualTop(){ return window.visualViewport?.offsetTop || 0; }
  function applyPanelGeometry(){
    if(!panel||!isMobile()) return;
    const hr=(header||document.body).getBoundingClientRect();
    const top=Math.max(12, Math.round((hr.bottom>0&&hr.bottom<visualHeight()?hr.bottom:76) + 8 + visualTop()));
    const bottom=12;
    const h=Math.max(260,Math.floor(visualHeight()-top-bottom));
    imp(panel,'position','fixed');
    imp(panel,'top',top+'px');
    imp(panel,'left','12px');
    imp(panel,'right','12px');
    imp(panel,'bottom','auto');
    imp(panel,'width','auto');
    imp(panel,'height',h+'px');
    imp(panel,'max-height',h+'px');
    imp(panel,'min-height','0');
    imp(panel,'overflow-y','auto');
    imp(panel,'overflow-x','hidden');
    imp(panel,'overscroll-behavior','contain');
    imp(panel,'box-sizing','border-box');
    imp(panel,'padding-bottom','max(18px, env(safe-area-inset-bottom))');
    imp(panel,'margin','0');
    imp(panel,'transform','none');
    imp(panel,'z-index','2147482999');
    imp(panel,'border-radius','28px');
    imp(panel,'-webkit-overflow-scrolling','touch');

    const cta=[...panel.querySelectorAll('a,button')].find(el=>norm(el.textContent).includes('message us'));
    if(cta){
      imp(cta,'position','sticky');
      imp(cta,'bottom','0');
      imp(cta,'z-index','5');
      imp(cta,'margin-top','16px');
      imp(cta,'margin-bottom','0');
      imp(cta,'background','rgba(20,20,20,.97)');
      imp(cta,'backdrop-filter','blur(12px)');
    }
  }
  function setOpen(next){
    if(!isMobile()){
      open=false; unlock();
      if(backdrop) backdrop.style.display='none';
      return;
    }
    if(!panel||!button) return;
    open=!!next;
    button.setAttribute('aria-expanded',open?'true':'false');
    button.setAttribute('aria-label',open?'Close menu':'Open menu');
    panel.setAttribute('aria-hidden',open?'false':'true');
    panel.dataset.weMenuFallback=open?'open':'closed';
    if(open){
      ensureBackdrop();
      backdrop.style.display='block';
      imp(panel,'display','block');
      imp(panel,'visibility','visible');
      imp(panel,'opacity','1');
      imp(panel,'pointer-events','auto');
      applyPanelGeometry();
      document.documentElement.style.setProperty('overflow','hidden','important');
      document.body.style.setProperty('overflow','hidden','important');
    }else{
      if(backdrop) backdrop.style.display='none';
      imp(panel,'display','none');
      imp(panel,'visibility','hidden');
      imp(panel,'opacity','0');
      imp(panel,'pointer-events','none');
      unlock();
    }
  }
  function clickHandler(e){
    if(!isMobile()) return;
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
    setOpen(!open);
  }
  function wire(forceClose=false){
    const h=findHeader();
    const b=findButton(h);
    const p=findPanel(h,b);
    if(!h||!b||!p) return false;
    header=h;button=b;panel=p;
    if(lastButton!==button){
      if(lastButton) lastButton.removeEventListener('click',clickHandler,true);
      button.addEventListener('click',clickHandler,true);
      lastButton=button;
    }
    if(lastPanel!==panel){
      panel.addEventListener('click',e=>{ if(isMobile()&&e.target.closest('a[href]')) setOpen(false); });
      lastPanel=panel;
      forceClose=true;
    }
    if(isMobile()){
      if(forceClose) setOpen(false);
      else if(open){ imp(panel,'display','block'); applyPanelGeometry(); }
      else { imp(panel,'display','none'); unlock(); }
    }
    return true;
  }

  function boot(){
    ensureBackdrop();
    wire(true);
    const mo=new MutationObserver(()=>wire(false));
    mo.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['aria-expanded','style','class']});
    setInterval(()=>wire(false),1000);
  }

  document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&open) setOpen(false); });
  addEventListener('resize',()=>{ wire(false); if(open) applyPanelGeometry(); },{passive:true});
  window.visualViewport?.addEventListener('resize',()=>{ if(open) applyPanelGeometry(); },{passive:true});
  window.visualViewport?.addEventListener('scroll',()=>{ if(open) applyPanelGeometry(); },{passive:true});

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
