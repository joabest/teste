(() => {
  'use strict';
  if(window.__WE_MOBILE_NAV_FIX_V9__) return;
  window.__WE_MOBILE_NAV_FIX_V9__=true;

  const isMobile=()=>innerWidth<=767;

  if(isMobile()){
    window.__WE_METHOD_SCROLL_V21__=true;
    window.__WE_GLOBE_V28_BOOTSTRAP__=true;
    window.__WE_GLOBE_REF_V27__=true;
    window.__WE_SECTION_PROGRESS_PINK_V6__=true;
    window.__WE_SECTION_PROGRESS_PINK_V7__=true;

    const restoreOriginalMobile=()=>{
      document.documentElement.classList.remove('perf-mobile');
      document.getElementById('we-mobile-critical-v21')?.remove();
      document.getElementById('we-section-progress-pink-style-v6')?.remove();
      document.getElementById('we-section-progress-pink-style-v7')?.remove();
      document.querySelectorAll('.we-soft-transition-v24,.we-soft-transition-v25').forEach(n=>n.remove());
      document.querySelectorAll('#we-globe-ref-v27,#we-globe-ref-v28').forEach(n=>n.remove());
      if(!document.querySelector('script[data-we-progress-v9]')){
        const s=document.createElement('script');
        s.src='/section-progress-pink.js?v=9';
        s.defer=true;
        s.dataset.weProgressV9='1';
        (document.head||document.documentElement).appendChild(s);
      }
    };
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',restoreOriginalMobile,{once:true});
    else restoreOriginalMobile();
  }

  let drawer=null,backdrop=null,open=false;
  const links=[
    ['Services','/services'],['Method','/method'],['Case Studies','/case-studies'],
    ['Business Diagnosis','/ai-business-check'],['AI Visibility Check','/ai-check'],['Free SEO Check','/seo-check'],
    ['About','/about'],['Blog','/blog'],['Reviews','/reviews'],['Contact','/contact']
  ];

  function findHeader(){return document.querySelector('[data-nav-root="true"]')||document.querySelector('header')}
  function findButton(){
    const header=findHeader();
    if(!header) return null;
    return header.querySelector('button[aria-label*="menu" i],button[aria-expanded]') ||
      [...header.querySelectorAll('button')].find(b=>!/(search|buscar)/i.test(b.getAttribute('aria-label')||'')&&b.querySelector('svg')) || null;
  }

  function geometry(){
    if(!drawer||!backdrop)return;
    const header=findHeader();
    const r=header?.getBoundingClientRect();
    const vv=window.visualViewport;
    const top=Math.max(76,Math.round((r&&r.bottom>0?r.bottom:92)+6));
    const bottomInset=Math.max(8,Math.round(innerHeight-((vv?.offsetTop||0)+(vv?.height||innerHeight)))+8);
    backdrop.style.top=top+'px';
    backdrop.style.bottom=bottomInset+'px';
    drawer.style.top=top+'px';
    drawer.style.bottom=bottomInset+'px';
    drawer.style.height='auto';
    drawer.style.maxHeight='none';
  }

  function ensureUI(){
    if(drawer&&document.body.contains(drawer)) return;

    ['v6','v7','v8'].forEach(v=>{
      document.getElementById('we-mobile-nav-backdrop-'+v)?.remove();
      document.getElementById('we-mobile-nav-drawer-'+v)?.remove();
      document.getElementById('we-mobile-nav-style-'+v)?.remove();
    });

    backdrop=document.createElement('div');
    backdrop.id='we-mobile-nav-backdrop-v9';
    Object.assign(backdrop.style,{
      position:'fixed',left:'0',right:'0',background:'#0b0b0d',zIndex:'2147483000',
      display:'none',pointerEvents:'auto',touchAction:'none'
    });
    backdrop.addEventListener('click',()=>setOpen(false));
    backdrop.addEventListener('touchmove',e=>e.preventDefault(),{passive:false});

    drawer=document.createElement('nav');
    drawer.id='we-mobile-nav-drawer-v9';
    drawer.setAttribute('aria-label','Mobile navigation');
    Object.assign(drawer.style,{
      position:'fixed',left:'10px',right:'10px',overflowY:'scroll',overflowX:'hidden',
      WebkitOverflowScrolling:'touch',touchAction:'pan-y',overscrollBehaviorY:'contain',
      background:'#0b0b0d',border:'1px solid rgba(255,255,255,.09)',borderRadius:'0 0 24px 24px',
      boxShadow:'0 24px 70px rgba(0,0,0,.7)',padding:'10px 12px max(18px, env(safe-area-inset-bottom))',
      zIndex:'2147483001',display:'none',isolation:'isolate',contain:'layout paint'
    });

    const style=document.createElement('style');
    style.id='we-mobile-nav-style-v9';
    style.textContent=`
      #we-mobile-nav-backdrop-v9,#we-mobile-nav-drawer-v9{opacity:1!important;filter:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}
      #we-mobile-nav-drawer-v9 *{box-sizing:border-box!important}
      #we-mobile-nav-drawer-v9 a{display:flex;align-items:center;justify-content:space-between;min-height:46px;padding:0 10px;border-bottom:1px solid rgba(255,255,255,.065);color:#d9d9dd!important;background:#0b0b0d!important;text-decoration:none!important;font:500 12px/1.2 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.08em}
      #we-mobile-nav-drawer-v9 a::after{content:'↗';color:#e4007c;font-size:12px;opacity:.82}
      #we-mobile-nav-drawer-v9 .we-tools-label{padding:15px 10px 5px;color:#8e8e95;background:#0b0b0d;font:600 10px/1 ui-monospace,monospace;letter-spacing:.16em;text-transform:uppercase}
      #we-mobile-nav-drawer-v9 .we-message-us{margin-top:14px;border:1px solid rgba(228,0,124,.45)!important;border-radius:999px!important;justify-content:center!important;background:#111114!important;color:#f2f2f4!important}
      #we-mobile-nav-drawer-v9 .we-message-us::after{content:''}
      @media(max-width:420px){#we-mobile-nav-drawer-v9 a{min-height:43px;font-size:11px}#we-mobile-nav-drawer-v9 .we-tools-label{padding-top:12px}}
    `;
    document.head.appendChild(style);

    links.forEach((it,i)=>{
      if(i===3){const l=document.createElement('div');l.className='we-tools-label';l.textContent='Tools FREE';drawer.appendChild(l)}
      const a=document.createElement('a');a.href=it[1];a.textContent=it[0];drawer.appendChild(a);
    });
    const wa=document.createElement('a');wa.href='https://wa.me/';wa.target='_blank';wa.rel='noopener';wa.className='we-message-us';wa.textContent='message us';drawer.appendChild(wa);
    document.body.append(backdrop,drawer);
    geometry();
  }

  function setOpen(v){
    if(!isMobile()){
      open=false;
      if(drawer)drawer.style.display='none';
      if(backdrop)backdrop.style.display='none';
      return;
    }
    ensureUI();
    open=!!v;
    if(open)geometry();
    drawer.style.display=open?'block':'none';
    backdrop.style.display=open?'block':'none';
    if(open) drawer.scrollTop=0;
    const b=findButton();
    if(b){
      b.setAttribute('aria-expanded',open?'true':'false');
      b.setAttribute('aria-label',open?'Close menu':'Open menu');
      b.style.position='relative';
      b.style.zIndex='2147483002';
    }
  }

  document.addEventListener('click',e=>{
    if(!isMobile()) return;
    const b=findButton();
    if(b&&(e.target===b||b.contains(e.target))){
      e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();setOpen(!open);return;
    }
    if(open&&e.target.closest?.('#we-mobile-nav-drawer-v9 a')) setOpen(false);
  },true);

  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&open)setOpen(false)});
  addEventListener('resize',()=>{if(!isMobile()&&open)setOpen(false);else if(open)geometry()},{passive:true});
  window.visualViewport?.addEventListener('resize',()=>{if(open)geometry()},{passive:true});
  window.visualViewport?.addEventListener('scroll',()=>{if(open)geometry()},{passive:true});

  function boot(){
    document.documentElement.style.removeProperty('overflow');
    document.body.style.removeProperty('overflow');
    ensureUI();
    const b=findButton();
    if(b){b.setAttribute('aria-expanded','false');b.setAttribute('aria-label','Open menu')}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();