(() => {
  'use strict';
  if (window.__WE_METHOD_SCROLL_V17__) return;
  window.__WE_METHOD_SCROLL_V17__ = true;

  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
  let raf=0;

  function boot(){
    const method=document.querySelector('[data-method="true"]');
    const rail=method?.querySelector('[data-method-rail="true"]');
    const track=method?.querySelector('[data-method-track="true"]');
    const intro=method?.querySelector('[data-method-intro="true"]');
    if(!method||!rail||!track)return setTimeout(boot,120);
    const slides=[...track.querySelectorAll('[data-method-slide]')];
    if(!slides.length)return;

    // Kill the original fixed phase navigator. It was leaking over the audit section.
    const nativeSvg=method.querySelector('svg[aria-label="method progress"]');
    const nativeProgress=nativeSvg?.parentElement;
    if(nativeProgress)nativeProgress.style.setProperty('display','none','important');

    method.style.setProperty('--method-bg','#ffffff');
    method.style.setProperty('--method-fg','#171717');
    method.style.setProperty('--method-border','rgba(0,0,0,.1)');

    let topDoc=0,total=1;
    function layout(){
      const mobile=innerWidth<768,vh=Math.max(520,innerHeight),totalVh=mobile?6.15:5.8;
      method.style.setProperty('position','relative','important');
      method.style.setProperty('height',(vh*totalVh)+'px','important');
      method.style.setProperty('min-height',(vh*totalVh)+'px','important');
      method.style.setProperty('overflow','clip','important');
      method.style.setProperty('background','#fff','important');
      method.style.setProperty('isolation','isolate','important');

      rail.style.setProperty('position','sticky','important');rail.style.setProperty('top','0','important');rail.style.setProperty('left','0','important');rail.style.setProperty('width','100vw','important');rail.style.setProperty('height','100svh','important');rail.style.setProperty('min-height','520px','important');rail.style.setProperty('overflow','hidden','important');rail.style.setProperty('z-index','2','important');rail.style.setProperty('background','#fff','important');
      if(intro){intro.style.setProperty('position','absolute','important');intro.style.setProperty('inset','0','important');intro.style.setProperty('z-index','1','important');intro.style.setProperty('pointer-events','none','important');intro.style.setProperty('color','#171717','important')}
      track.style.setProperty('position','absolute','important');track.style.setProperty('inset','0','important');track.style.setProperty('width','100vw','important');track.style.setProperty('height','100svh','important');track.style.setProperty('display','block','important');track.style.setProperty('overflow','hidden','important');track.style.setProperty('transform','none','important');track.style.setProperty('opacity','1','important');track.style.setProperty('z-index','2','important');track.style.setProperty('background','#fff','important');

      slides.forEach((slide,i)=>{
        slide.style.setProperty('position','absolute','important');slide.style.setProperty('inset','0','important');slide.style.setProperty('display','flex','important');slide.style.setProperty('width','100vw','important');slide.style.setProperty('max-width','none','important');slide.style.setProperty('height','100svh','important');slide.style.setProperty('min-height','520px','important');slide.style.setProperty('margin','0','important');slide.style.setProperty('z-index',String(10+i),'important');slide.style.setProperty('will-change','transform,opacity','important');slide.style.setProperty('transition','none','important');slide.style.setProperty('background','#fff','important');slide.style.setProperty('color','#171717','important');
        slide.querySelectorAll('[data-method-name],[data-method-tagline],[data-method-bullet],[data-method-watermark]').forEach(n=>n.style.setProperty('color','#171717','important'));
      });
      const audit=[...document.querySelectorAll('section')].find(s=>(s.textContent||'').includes("What's slowing you down?"));
      if(audit){audit.style.setProperty('position','relative','important');audit.style.setProperty('z-index','20','important')}
      const r=method.getBoundingClientRect();topDoc=scrollY+r.top;total=Math.max(1,method.offsetHeight-innerHeight);paint();
    }

    function paint(){
      raf=0;if(!document.body.contains(method))return;
      const rect=method.getBoundingClientRect();
      const inMethod=rect.bottom>1&&rect.top<innerHeight;
      rail.style.setProperty('visibility',inMethod?'visible':'hidden','important');
      rail.style.setProperty('pointer-events',inMethod?'auto':'none','important');
      const p=clamp((scrollY-topDoc)/total,0,1);
      if(intro){const out=1-ease(clamp((p-.035)/.105,0,1));intro.style.setProperty('opacity',String(out),'important');intro.style.setProperty('transform',`translate3d(${(1-out)*-5}vw,0,0)`,'important')}
      const startBase=.105,gap=.155,duration=.13;
      slides.forEach((slide,i)=>{
        const local=ease(clamp((p-(startBase+i*gap))/duration,0,1));
        slide.style.setProperty('transform',`translate3d(${(1-local)*104}vw,0,0)`,'important');
        slide.style.setProperty('opacity',String(clamp(local*1.08,0,1)),'important');
        slide.style.setProperty('visibility',local>.015?'visible':'hidden','important');
        slide.style.setProperty('pointer-events',local>.98?'auto':'none','important');
      });
    }
    function schedule(){if(!raf)raf=requestAnimationFrame(paint)}
    addEventListener('scroll',schedule,{passive:true});addEventListener('resize',()=>{clearTimeout(boot._r);boot._r=setTimeout(layout,120)},{passive:true});
    layout();[400,1000,2200].forEach(ms=>setTimeout(layout,ms));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();