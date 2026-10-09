(() => {
  'use strict';
  if (window.__WE_METHOD_SCROLL_V11__) return;
  window.__WE_METHOD_SCROLL_V11__ = true;

  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
  let raf=0;

  function boot(){
    const method=document.querySelector('[data-method="true"]');
    const rail=method?.querySelector('[data-method-rail="true"]');
    const track=method?.querySelector('[data-method-track="true"]');
    const intro=method?.querySelector('[data-method-intro="true"]');
    if(!method||!rail||!track) return setTimeout(boot,120);

    const slides=[...track.querySelectorAll('[data-method-slide]')];
    if(!slides.length) return;

    let frac=innerWidth<768?1:.70;

    function layout(){
      const mobile=innerWidth<768;
      frac=mobile?1:.70;
      const vh=Math.max(520,innerHeight);
      const totalVh=mobile?6.25:5.8;

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
        intro.style.setProperty('pointer-events','none','important');
        intro.style.setProperty('z-index','3','important');
      }

      track.style.setProperty('position','absolute','important');
      track.style.setProperty('left','0','important');
      track.style.setProperty('top','0','important');
      track.style.setProperty('display','flex','important');
      track.style.setProperty('flex-direction','row','important');
      track.style.setProperty('align-items','stretch','important');
      track.style.setProperty('width',(slides.length*frac*100)+'vw','important');
      track.style.setProperty('height','100svh','important');
      track.style.setProperty('opacity','1','important');
      track.style.setProperty('will-change','transform','important');
      track.style.setProperty('transition','none','important');
      track.style.setProperty('z-index','2','important');

      slides.forEach(slide=>{
        slide.style.setProperty('position','relative','important');
        slide.style.setProperty('display','flex','important');
        slide.style.setProperty('flex','0 0 '+(frac*100)+'vw','important');
        slide.style.setProperty('width',(frac*100)+'vw','important');
        slide.style.setProperty('max-width','none','important');
        slide.style.setProperty('height','100svh','important');
        slide.style.setProperty('min-height','520px','important');
        slide.style.setProperty('margin','0','important');
        slide.style.setProperty('overflow','visible','important');
        slide.style.setProperty('opacity','1','important');
      });
      paint();
    }

    function paint(){
      raf=0;
      if(!document.body.contains(method)) return;
      const mobile=innerWidth<768;
      const rect=method.getBoundingClientRect();
      const span=Math.max(1,method.offsetHeight-innerHeight);
      const p=clamp(-rect.top/span,0,1);

      const introEnd=mobile?.12:.10;
      const moveStart=mobile?.08:.07;
      const moveEnd=mobile?.95:.92;
      const q=ease(clamp((p-moveStart)/(moveEnd-moveStart),0,1));

      const start=innerWidth*(mobile?1.02:.92);
      const end=mobile
        ? -innerWidth*(slides.length-1)
        : -innerWidth*((slides.length*frac)-1.02);
      const x=start+(end-start)*q;
      track.style.setProperty('transform',`translate3d(${x}px,0,0)`,'important');

      if(intro){
        const f=1-ease(clamp(p/introEnd,0,1));
        intro.style.setProperty('opacity',String(f),'important');
        intro.style.setProperty('transform',`translate3d(${(1-f)*-7}vw,0,0)`,'important');
      }

      const center=innerWidth*.5;
      slides.forEach((slide,i)=>{
        const sc=x+(i*frac+frac*.5)*innerWidth;
        const d=Math.abs(sc-center)/innerWidth;
        const op=mobile?clamp(1-d*1.15,.04,1):clamp(1-d*.58,.28,1);
        slide.style.setProperty('opacity',String(op),'important');
      });
    }

    function schedule(){
      if(raf) return;
      raf=requestAnimationFrame(paint);
    }

    addEventListener('scroll',schedule,{passive:true});
    addEventListener('resize',()=>{layout();schedule();},{passive:true});
    layout();

    // React can modify inline geometry after hydration. Reassert it a few times.
    [350,900,1800,3200].forEach(ms=>setTimeout(()=>{layout();schedule();},ms));
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
