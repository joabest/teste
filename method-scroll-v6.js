(() => {
  'use strict';
  if (window.__WE_METHOD_SCROLL_V16__) return;
  window.__WE_METHOD_SCROLL_V16__ = true;

  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
  let raf=0;

  function boot(){
    const method=document.querySelector('[data-method="true"]');
    const rail=method?.querySelector('[data-method-rail="true"]');
    const track=method?.querySelector('[data-method-track="true"]');
    const intro=method?.querySelector('[data-method-intro="true"]');
    if(!method||!rail||!track) return setTimeout(boot,140);

    const slides=[...track.querySelectorAll('[data-method-slide]')];
    if(!slides.length) return;

    let maxProgress=0;
    let topDoc=0;
    let total=1;

    function layout(){
      const mobile=innerWidth<768;
      const vh=Math.max(520,innerHeight);
      const totalVh=mobile?6.2:5.8;

      method.style.setProperty('position','relative','important');
      method.style.setProperty('height',(vh*totalVh)+'px','important');
      method.style.setProperty('min-height',(vh*totalVh)+'px','important');
      method.style.setProperty('overflow','visible','important');

      rail.style.setProperty('position','sticky','important');
      rail.style.setProperty('top','0','important');
      rail.style.setProperty('left','0','important');
      rail.style.setProperty('width','100vw','important');
      rail.style.setProperty('height','100svh','important');
      rail.style.setProperty('min-height','520px','important');
      rail.style.setProperty('overflow','hidden','important');
      rail.style.setProperty('z-index','2','important');

      if(intro){
        intro.style.setProperty('position','absolute','important');
        intro.style.setProperty('inset','0','important');
        intro.style.setProperty('z-index','1','important');
        intro.style.setProperty('pointer-events','none','important');
      }

      track.style.setProperty('position','absolute','important');
      track.style.setProperty('inset','0','important');
      track.style.setProperty('width','100vw','important');
      track.style.setProperty('height','100svh','important');
      track.style.setProperty('display','block','important');
      track.style.setProperty('overflow','hidden','important');
      track.style.setProperty('transform','none','important');
      track.style.setProperty('opacity','1','important');
      track.style.setProperty('z-index','2','important');

      slides.forEach((slide,i)=>{
        slide.style.setProperty('position','absolute','important');
        slide.style.setProperty('inset','0','important');
        slide.style.setProperty('display','flex','important');
        slide.style.setProperty('width','100vw','important');
        slide.style.setProperty('max-width','none','important');
        slide.style.setProperty('height','100svh','important');
        slide.style.setProperty('min-height','520px','important');
        slide.style.setProperty('margin','0','important');
        slide.style.setProperty('z-index',String(10+i),'important');
        slide.style.setProperty('will-change','transform,opacity','important');
        slide.style.setProperty('transition','none','important');
      });

      const r=method.getBoundingClientRect();
      topDoc=scrollY+r.top;
      total=Math.max(1,method.offsetHeight-innerHeight);
      paint();
    }

    function paint(){
      raf=0;
      if(!document.body.contains(method)) return;

      const raw=clamp((scrollY-topDoc)/total,0,1);
      // One-way reveal: once a phase has arrived, scrolling back up does not undo it.
      maxProgress=Math.max(maxProgress,raw);
      const p=maxProgress;

      if(intro){
        const introOut=1-ease(clamp((p-.035)/.105,0,1));
        intro.style.setProperty('opacity',String(introOut),'important');
        intro.style.setProperty('transform',`translate3d(${(1-introOut)*-5}vw,0,0)`,'important');
      }

      const startBase=.105;
      const gap=.155;
      const duration=.13;

      slides.forEach((slide,i)=>{
        const start=startBase+i*gap;
        const local=ease(clamp((p-start)/duration,0,1));
        const x=(1-local)*104;
        slide.style.setProperty('transform',`translate3d(${x}vw,0,0)`,'important');
        slide.style.setProperty('opacity',String(clamp(local*1.08,0,1)),'important');
        slide.style.setProperty('pointer-events',local>.98?'auto':'none','important');
      });
    }

    function schedule(){
      if(raf) return;
      raf=requestAnimationFrame(paint);
    }

    addEventListener('scroll',schedule,{passive:true});
    addEventListener('resize',()=>{layout();schedule();},{passive:true});
    layout();

    [350,900,1800,3200].forEach(ms=>setTimeout(()=>{layout();schedule();},ms));
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
