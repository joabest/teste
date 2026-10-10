(() => {
  'use strict';
  if(window.__WE_MOBILE_NAV_FIX_V6__) return;
  window.__WE_MOBILE_NAV_FIX_V6__=true;

  const isMobile=()=>innerWidth<=767;
  let drawer=null,backdrop=null,open=false;
  const links=[
    ['Services','/services'],['Method','/method'],['Case Studies','/case-studies'],
    ['Business Diagnosis','/ai-business-check'],['AI Visibility Check','/ai-check'],['Free SEO Check','/seo-check'],
    ['About','/about'],['Blog','/blog'],['Reviews','/reviews'],['Contact','/contact']
  ];

  function findButton(){
    const header=document.querySelector('[data-nav-root="true"]')||document.querySelector('header');
    if(!header) return null;
    return header.querySelector('button[aria-label*="menu" i],button[aria-expanded]') ||
      [...header.querySelectorAll('button')].find(b=>!/(search|buscar)/i.test(b.getAttribute('aria-label')||'')&&b.querySelector('svg')) || null;
  }

  function ensureUI(){
    if(drawer&&document.body.contains(drawer)) return;
    backdrop=document.createElement('div');
    backdrop.id='we-mobile-nav-backdrop-v6';
    Object.assign(backdrop.style,{position:'fixed',inset:'0',background:'rgba(0,0,0,.46)',zIndex:'2147483000',display:'none'});
    backdrop.addEventListener('click',()=>setOpen(false));

    drawer=document.createElement('nav');
    drawer.id='we-mobile-nav-drawer-v6';
    drawer.setAttribute('aria-label','Mobile navigation');
    Object.assign(drawer.style,{position:'fixed',left:'16px',right:'16px',top:'112px',maxHeight:'calc(100dvh - 132px)',overflowY:'auto',overscrollBehavior:'contain',WebkitOverflowScrolling:'touch',background:'rgba(18,18,20,.995)',border:'1px solid rgba(255,255,255,.10)',borderRadius:'26px',boxShadow:'0 24px 70px rgba(0,0,0,.55)',padding:'18px',zIndex:'2147483001',display:'none'});

    const style=document.createElement('style');
    style.id='we-mobile-nav-style-v6';
    style.textContent=`
      #we-mobile-nav-drawer-v6 a{display:flex;align-items:center;justify-content:space-between;min-height:48px;padding:0 14px;border-bottom:1px solid rgba(255,255,255,.07);color:#f1f1f3!important;text-decoration:none!important;font:500 14px/1.2 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.06em}
      #we-mobile-nav-drawer-v6 a::after{content:'↗';color:#e4007c;font-size:13px;opacity:.8}
      #we-mobile-nav-drawer-v6 .we-tools-label{padding:14px 14px 6px;color:#e4007c;font:600 11px/1 ui-monospace,monospace;letter-spacing:.15em;text-transform:uppercase}
      #we-mobile-nav-drawer-v6 .we-message-us{margin-top:14px;border:1px solid rgba(228,0,124,.52)!important;border-radius:999px!important;justify-content:center!important;background:rgba(228,0,124,.08)}
      #we-mobile-nav-drawer-v6 .we-message-us::after{content:''}
    `;
    document.head.appendChild(style);

    links.forEach((it,i)=>{
      if(i===3){const l=document.createElement('div');l.className='we-tools-label';l.textContent='Tools FREE';drawer.appendChild(l)}
      const a=document.createElement('a');a.href=it[1];a.textContent=it[0];drawer.appendChild(a);
    });
    const wa=document.createElement('a');wa.href='https://wa.me/';wa.target='_blank';wa.rel='noopener';wa.className='we-message-us';wa.textContent='message us';drawer.appendChild(wa);
    document.body.append(backdrop,drawer);
  }

  function lock(v){
    document.documentElement.style[v?'setProperty':'removeProperty']('overflow',...(v?['hidden','important']:[]));
    document.body.style[v?'setProperty':'removeProperty']('overflow',...(v?['hidden','important']:[]));
  }

  function setOpen(v){
    if(!isMobile()){open=false;if(drawer)drawer.style.display='none';if(backdrop)backdrop.style.display='none';lock(false);return}
    ensureUI();
    open=!!v;
    drawer.style.display=open?'block':'none';
    backdrop.style.display=open?'block':'none';
    lock(open);
    const b=findButton();
    if(b){b.setAttribute('aria-expanded',open?'true':'false');b.setAttribute('aria-label',open?'Close menu':'Open menu')}
  }

  document.addEventListener('click',e=>{
    if(!isMobile()) return;
    const b=findButton();
    if(b&&(e.target===b||b.contains(e.target))){
      e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
      setOpen(!open);
      return;
    }
    if(open&&e.target.closest?.('#we-mobile-nav-drawer-v6 a')) setOpen(false);
  },true);

  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&open)setOpen(false)});
  addEventListener('resize',()=>{if(!isMobile()&&open)setOpen(false)},{passive:true});

  function boot(){ensureUI();const b=findButton();if(b){b.setAttribute('aria-expanded','false');b.setAttribute('aria-label','Open menu')}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();