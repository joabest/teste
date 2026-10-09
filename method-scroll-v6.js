(() => {
  'use strict';
  if(window.__WE_METHOD_SCROLL_V10__) return;
  window.__WE_METHOD_SCROLL_V10__=true;

  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const smooth=t=>t*t*(3-2*t);

  function boot(){
    const method=document.querySelector('[data-method="true"]');
    const rail=method?.querySelector('[data-method-rail="true"]');
    const track=method?.querySelector('[data-method-track="true"]');
    const intro=method?.querySelector('[data-method-intro="true"]');
    if(!method||!rail||!track) return setTimeout(boot,180);
    if(method.dataset.methodV10==='1') return;
    method.dataset.methodV10='1';

    const slides=[...track.querySelectorAll('[data-method-slide]')];
    if(!slides.length) return;

    let slideFrac=.70,startX=0,endX=0,lastW=0,lastH=0;
    let raf=0,near=false;

    function layout(){
      const mobile=innerWidth<768;
      slideFrac=mobile?1:.70;
      const trackVW=slideFrac*slides.length*100;
      const vh=Math.max(560,innerHeight);

      method.style.setProperty('position','relative','important');
      method.style.setProperty('height',(vh*6.2)+'px','important');
      method.style.setProperty('min-height',(vh*6.2)+'px','important');
      method.style.setProperty('overflow','visible','important');

      rail.style.setProperty('position','sticky','important');
      rail.style.setProperty('top','0','important');
      rail.style.setProperty('height','100vh','important');
      rail.style.setProperty('width','100vw','important');
      rail.style.setProperty('overflow','hidden','important');
      rail.style.setProperty('z-index','1','important');
      rail.style.setProperty('background-color','var(--method-bg, transparent)','important');

      if(intro){
        intro.style.setProperty('position','absolute','important');
        intro.style.setProperty('inset','0','important');
        intro.style.setProperty('pointer-events','none','important');
      }

      track.style.setProperty('position','absolute','important');
      track.style.setProperty('left','0','important');
      track.style.setProperty('top','0','important');
      track.style.setProperty('display','flex','important');
      track.style.setProperty('height','100vh','important');
      track.style.setProperty('width',trackVW+'vw','important');
      track.style.setProperty('transition','none','important');
      track.style.setProperty('will-change','transform','important');
      track.style.setProperty('opacity','1','important');

      slides.forEach(slide=>{
        slide.style.setProperty('width',(slideFrac*100)+'vw','important');
        slide.style.setProperty('height','100vh','important');
        slide.style.setProperty('min-height','560px','important');
        slide.style.setProperty('flex','0 0 '+(slideFrac*100)+'vw','important');
        slide.style.setProperty('display','flex','important');
        slide.style.setProperty('opacity','1','important');
      });

      startX=innerWidth*(mobile?1.04:.98);
      endX=mobile ? -innerWidth*(slides.length-1) : -innerWidth*2.80;
      lastW=innerWidth;
      lastH=innerHeight;
    }

    function paint(){
      raf=0;
      if(!near || !document.body.contains(method)) return;

      if(lastW!==innerWidth||lastH!==innerHeight) layout();
      const rect=method.getBoundingClientRect();
      const span=Math.max(1,method.offsetHeight-innerHeight);
      const p=clamp((-rect.top)/span,0,1);
      const move=smooth(clamp((p-.055)/.89,0,1));
      const x=startX+(endX-startX)*move;
      track.style.setProperty('transform',`translate3d(${x}px,0,0)`,'important');

      if(intro){
        const fade=1-smooth(clamp((p-.01)/.09,0,1));
        intro.style.setProperty('opacity',String(fade),'important');
        intro.style.setProperty('transform',`translate3d(${(1-fade)*-5}vw,0,0)`,'important');
      }

      const center=innerWidth*.5;
      slides.forEach((slide,i)=>{
        const sc=x+(i*slideFrac+slideFrac*.5)*innerWidth;
        const dist=Math.abs(sc-center)/Math.max(1,innerWidth);
        slide.style.setProperty('opacity',String(clamp(1-dist*.40,.36,1)),'important');
      });
    }

    function schedule(){
      if(!near||raf) return;
      raf=requestAnimationFrame(paint);
    }

    function onResize(){
      layout();
      schedule();
    }

    layout();

    const io=new IntersectionObserver(entries=>{
      near=!!entries[0]?.isIntersecting;
      if(near) schedule();
    },{rootMargin:'120vh 0px 120vh 0px'});
    io.observe(method);

    addEventListener('scroll',schedule,{passive:true});
    addEventListener('resize',onResize,{passive:true});

    // Two finite post-hydration corrections instead of a permanent interval.
    setTimeout(()=>{layout();schedule();},650);
    setTimeout(()=>{layout();schedule();},1800);

    addEventListener('pagehide',()=>{
      if(raf) cancelAnimationFrame(raf);
      io.disconnect();
      removeEventListener('scroll',schedule);
      removeEventListener('resize',onResize);
    },{once:true});
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
