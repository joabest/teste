(()=>{
  if (window.__weeStaticFx) return;
  window.__weeStaticFx = true;

  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function revealStuck(){
    const scope=$('main')||document.body;
    $$('[style*="opacity:0"],[style*="opacity: 0"],.opacity-0',scope).forEach(el=>{
      if(el.closest('[aria-hidden="true"],header,[data-dd-panel],#mobile-nav-panel')) return;
      const cs=getComputedStyle(el);
      if(cs.position==='fixed'&&el.closest('header')) return;
      el.style.opacity='1';
      el.style.visibility='visible';
      if(el.style.transform&&/translate|scale/.test(el.style.transform)) el.style.transform='none';
      el.classList.remove('opacity-0');
    });
    $$('[data-footer-phrase],[data-footer-socials],[data-footer-meta]').forEach(el=>{
      el.style.opacity='1'; el.style.visibility='visible';
    });
  }

  function toolsHoverFallback(){
    const header=$('header[data-nav-root="true"]');
    if(!header||header.dataset.toolsHoverReady==='1') return;

    const toolsBtn=$$('nav button[aria-haspopup="true"]',header).find(btn=>{
      const txt=(btn.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
      return txt.startsWith('tools')&&txt.includes('free');
    });
    if(!toolsBtn) return;

    const shell=header.firstElementChild||header;
    const candidates=[...shell.children].filter(el=>{
      if(el.tagName==='NAV') return false;
      if(el.matches('[data-dd-panel],#mobile-nav-panel')) return false;
      const txt=(el.textContent||'').toLowerCase();
      return txt.includes('seo check')||txt.includes('ai visibility')||txt.includes('ai check')||txt.includes('free tools');
    });
    const toolsPanel=candidates[0];
    if(!toolsPanel) return;

    header.dataset.toolsHoverReady='1';
    let timer=null;
    const arrow=toolsBtn.querySelector('span[aria-hidden="true"]:last-child');
    const free=toolsBtn.querySelector('sup');

    const open=()=>{
      clearTimeout(timer);
      toolsBtn.setAttribute('aria-expanded','true');
      toolsPanel.setAttribute('aria-hidden','false');
      toolsPanel.classList.remove('invisible','pointer-events-none','opacity-0');
      toolsPanel.style.visibility='visible';
      toolsPanel.style.pointerEvents='auto';
      toolsPanel.style.opacity='1';
      toolsPanel.style.transform='translateX(-50%) translateY(0)';
      toolsPanel.style.transition='opacity 180ms ease, transform 220ms ease';
      toolsBtn.style.color='var(--fg, #f0f0f8)';
      if(arrow) arrow.style.transform='rotate(180deg)';
      if(free){
        free.style.textShadow='0 0 10px currentColor';
        free.style.transform='translateY(-1px) scale(1.06)';
        free.style.transition='transform 180ms ease, text-shadow 180ms ease';
      }
      $$('a,button',toolsPanel).forEach(el=>{if(el.getAttribute('tabindex')==='-1') el.setAttribute('tabindex','0')});
    };

    const close=()=>{
      clearTimeout(timer);
      timer=setTimeout(()=>{
        toolsBtn.setAttribute('aria-expanded','false');
        toolsPanel.setAttribute('aria-hidden','true');
        toolsPanel.style.opacity='0';
        toolsPanel.style.pointerEvents='none';
        toolsPanel.style.visibility='hidden';
        toolsPanel.style.transform='translateX(-50%) translateY(-6px)';
        toolsBtn.style.color='';
        if(arrow) arrow.style.transform='';
        if(free){free.style.textShadow='';free.style.transform=''}
        $$('a,button',toolsPanel).forEach(el=>el.setAttribute('tabindex','-1'));
      },120);
    };

    toolsBtn.addEventListener('mouseenter',open);
    toolsBtn.addEventListener('focus',open);
    toolsBtn.parentElement&&toolsBtn.parentElement.addEventListener('mouseenter',open);
    toolsBtn.parentElement&&toolsBtn.parentElement.addEventListener('mouseleave',close);
    toolsPanel.addEventListener('mouseenter',()=>clearTimeout(timer));
    toolsPanel.addEventListener('mouseleave',close);
    toolsBtn.addEventListener('click',e=>{
      if(matchMedia('(min-width: 768px)').matches){
        e.preventDefault();
        toolsBtn.getAttribute('aria-expanded')==='true'?close():open();
      }
    });
    document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
  }

  function makeGlobe(){
    if($('#wee-static-globe')) return;
    const heading=$$('h1,h2').find(el=>/your tech partner/i.test(el.textContent||''));
    if(!heading) return;
    const hero=heading.closest('section')||heading.parentElement;
    if(!hero) return;

    const wrap=document.createElement('div');
    wrap.id='wee-static-globe';
    wrap.setAttribute('aria-hidden','true');
    Object.assign(wrap.style,{position:'relative',width:'min(430px,72vw)',aspectRatio:'1',margin:'0 auto 18px',zIndex:'1',pointerEvents:'none'});
    const c=document.createElement('canvas');
    Object.assign(c.style,{width:'100%',height:'100%',display:'block',filter:'drop-shadow(0 0 28px rgba(255,255,255,.08))'});
    wrap.appendChild(c);
    heading.parentElement.insertBefore(wrap,heading);

    const ctx=c.getContext('2d');
    let w=0,h=0,dpr=1,t=0,pts=[];
    function resize(){
      const r=wrap.getBoundingClientRect(); dpr=Math.min(devicePixelRatio||1,2); w=Math.max(1,r.width);h=Math.max(1,r.height);
      c.width=w*dpr;c.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
      pts=[];
      const n=w<320?850:1500;
      const ga=Math.PI*(3-Math.sqrt(5));
      for(let i=0;i<n;i++){
        const y=1-(i/(n-1))*2,rad=Math.sqrt(1-y*y),th=ga*i;
        pts.push({x:Math.cos(th)*rad,y,z:Math.sin(th)*rad,r:Math.random()*.55+.35});
      }
    }
    function draw(){
      if(!ctx)return; ctx.clearRect(0,0,w,h); const R=Math.min(w,h)*.40,cx=w/2,cy=h/2;
      const rot=t*.00018;
      for(const p of pts){
        const x=p.x*Math.cos(rot)-p.z*Math.sin(rot),z=p.x*Math.sin(rot)+p.z*Math.cos(rot),y=p.y;
        if(z<-.18) continue;
        const rim=Math.max(0,1-Math.abs(z));
        const alpha=.10+.48*Math.pow((z+1)/2,1.5)+.16*rim;
        const px=cx+x*R,py=cy+y*R;
        ctx.beginPath();ctx.arc(px,py,p.r*(.65+(z+1)*.28),0,Math.PI*2);
        ctx.fillStyle=`rgba(230,232,236,${alpha})`;ctx.fill();
      }
      ctx.beginPath();ctx.arc(cx,cy,R,0,Math.PI*2);ctx.strokeStyle='rgba(255,255,255,.13)';ctx.lineWidth=.7;ctx.stroke();
      if(!reduced){t+=16;requestAnimationFrame(draw)}
    }
    resize();draw(); addEventListener('resize',resize,{passive:true});
  }

  function methodFallback(){
    const title=$$('h1,h2,h3').find(el=>/the 5 method/i.test(el.textContent||''));
    if(!title)return;

    const methodEls=$$('*').filter(el=>[...el.attributes].some(a=>a.name.startsWith('data-method')));
    methodEls.forEach(el=>{
      el.style.opacity='1';
      el.style.visibility='visible';
      el.classList.remove('opacity-0','invisible');
      if(el.style.transform&&/translate|scale/.test(el.style.transform)) el.style.transform='none';
    });

    let sec=title.closest('section')||title.parentElement;
    if(sec){
      $$('[style*="opacity:0"],[style*="opacity: 0"],.opacity-0',sec).forEach(el=>{
        el.style.opacity='1';el.style.visibility='visible';el.classList.remove('opacity-0');
        if(el.style.transform)el.style.transform='none';
      });
    }

    const phases=['DISCOVER','DIAGNOSE','DESIGN','DELIVER','EVOLVE'];
    $$('main *').forEach(el=>{
      const txt=(el.textContent||'').trim();
      if(phases.includes(txt)){
        let p=el;
        for(let i=0;i<3&&p;i++,p=p.parentElement){
          p.style.opacity='1';p.style.visibility='visible';
          p.classList.remove('opacity-0','invisible');
          if(p.style.transform) p.style.transform='none';
        }
      }
    });
  }

  function footerFallback(){
    const phrase=$('[data-footer-phrase="true"]');
    if(phrase){phrase.style.opacity='1';phrase.style.visibility='visible';phrase.style.transform='none'}
    const anchor=$('[data-torus-mobile-anchor="true"]');
    if(anchor&&!$('#wee-static-torus')){
      const ring=document.createElement('div');ring.id='wee-static-torus';ring.setAttribute('aria-hidden','true');
      Object.assign(ring.style,{width:'110px',height:'110px',border:'1px solid rgba(255,255,255,.18)',borderRadius:'50%',margin:'0 auto',boxShadow:'inset 0 0 0 16px rgba(255,255,255,.025),0 0 38px rgba(255,255,255,.035)',transform:'rotateX(64deg) rotateZ(-18deg)'});
      anchor.appendChild(ring);
    }
  }

  function init(){ revealStuck(); toolsHoverFallback(); makeGlobe(); methodFallback(); footerFallback(); }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  setTimeout(init,350);setTimeout(init,1200);setTimeout(init,2400);
})();
