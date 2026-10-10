(() => {
  'use strict';
  if (window.__WE_METHOD_SCROLL_V4__) return;
  window.__WE_METHOD_SCROLL_V4__ = true;

  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const smooth=t=>t*t*(3-2*t);

  function boot(){
    const method=document.querySelector('[data-method="true"]');
    const rail=method&&method.querySelector('[data-method-rail="true"]');
    const track=method&&method.querySelector('[data-method-track="true"]');
    const intro=method&&method.querySelector('[data-method-intro="true"]');
    if(!method||!rail||!track||!intro) return setTimeout(boot,180);
    if(method.dataset.scrollFallbackV4==='1') return;
    method.dataset.scrollFallbackV4='1';

    const slides=[...track.querySelectorAll('[data-method-slide]')];
    const progress=[...rail.children].find(el=>el!==intro&&el!==track&&el.classList&&el.classList.contains('fixed'))||null;
    let topDoc=0,total=1,startX=0,endX=0,slideFrac=.70,ticking=false;

    function layout(){
      const mobile=innerWidth<768;
      slideFrac=mobile?1:.70;
      const trackVW=slideFrac*slides.length*100;

      rail.style.setProperty('position','sticky','important');
      rail.style.setProperty('top','0','important');
      rail.style.setProperty('width','100vw','important');
      rail.style.setProperty('height','100svh','important');
      rail.style.setProperty('min-height','540px','important');
      rail.style.setProperty('overflow','hidden','important');

      intro.style.setProperty('position','absolute','important');
      intro.style.setProperty('inset','0','important');
      intro.style.setProperty('min-height','0','important');
      intro.style.setProperty('pointer-events','none','important');
      intro.style.setProperty('padding-left',mobile?'24px':'32px','important');
      intro.style.setProperty('padding-right',mobile?'24px':'32px','important');

      track.style.setProperty('position','absolute','important');
      track.style.setProperty('left','0','important');
      track.style.setProperty('top','0','important');
      track.style.setProperty('display','flex','important');
      track.style.setProperty('width',trackVW+'vw','important');
      track.style.setProperty('height','100svh','important');
      track.style.setProperty('will-change','transform','important');

      slides.forEach(s=>{
        s.style.setProperty('width',(slideFrac*100)+'vw','important');
        s.style.setProperty('height','100svh','important');
        s.style.setProperty('min-height','540px','important');
        s.style.setProperty('flex-shrink','0','important');
        s.style.setProperty('padding-left',mobile?'8vw':'8vw','important');
        s.style.setProperty('padding-right',mobile?'7vw':'4vw','important');
      });

      if(progress){
        if(mobile) progress.style.setProperty('display','none','important');
        else progress.style.removeProperty('display');
      }

      // Start completely offscreen to the right. End with Evolve centered.
      startX=innerWidth*(mobile?1.02:.92);
      endX=mobile
        ? -innerWidth*(slides.length-1)
        : innerWidth*(.67-(slides.length-.5)*slideFrac);

      const travel=Math.abs(startX-endX);
      const introTravel=mobile?innerHeight*.70:innerHeight*.58;
      const scrollTravel=travel*(mobile?1.12:1.22);
      const outroTravel=innerHeight*(mobile?.34:.55);
      const height=Math.round(innerHeight+introTravel+scrollTravel+outroTravel);
      method.style.setProperty('height',height+'px','important');

      const rect=method.getBoundingClientRect();
      topDoc=scrollY+rect.top;
      total=Math.max(1,height-innerHeight);
      render();
    }

    function render(){
      ticking=false;
      const mobile=innerWidth<768;
      const p=clamp((scrollY-topDoc)/total,0,1);

      // Intro occupies the opening beat, then clears before Discover arrives.
      const introIn=smooth(clamp(p/(mobile?.045:.055),0,1));
      const introOut=1-smooth(clamp((p-(mobile?.085:.105))/(mobile?.075:.09),0,1));
      const introOpacity=clamp(introIn*introOut,0,1);
      intro.style.setProperty('opacity',String(introOpacity),'important');
      intro.style.setProperty('transform',`translate3d(${(1-introIn)*(mobile?12:8)}vw,0,0)`,'important');

      const moveStart=mobile?.11:.12;
      const moveEnd=mobile?.95:.92;
      const moveP=smooth(clamp((p-moveStart)/(moveEnd-moveStart),0,1));
      const x=startX+(endX-startX)*moveP;
      const trackOpacity=smooth(clamp((p-(moveStart-.025))/(mobile?.055:.075),0,1));
      track.style.setProperty('transform',`translate3d(${x}px,0,0)`,'important');
      track.style.setProperty('opacity',String(clamp(trackOpacity,0,1)),'important');

      const center=innerWidth*.5;
      slides.forEach((slide,i)=>{
        const slideCenter=x+(i*slideFrac+slideFrac*.5)*innerWidth;
        const distance=Math.abs(slideCenter-center)/innerWidth;
        const fade=mobile
          ? clamp(1-(distance-.08)*1.15,.10,1)
          : clamp(1-(distance-.24)*.72,.42,1);
        const scale=mobile?clamp(1-distance*.035,.965,1):1;
        slide.style.setProperty('opacity',String(fade),'important');
        slide.style.setProperty('transform',`scale(${scale})`,'important');
      });

      if(progress && !mobile){
        const show=smooth(clamp((p-.16)/.05,0,1))*(1-smooth(clamp((p-.94)/.05,0,1)));
        progress.style.setProperty('opacity',String(show),'important');
        progress.style.setProperty('transform',`translateX(-50%) translateY(${(1-show)*14}px)`,'important');
      }
    }

    function request(){
      if(ticking)return;
      ticking=true;
      requestAnimationFrame(render);
    }

    addEventListener('scroll',request,{passive:true});
    addEventListener('resize',()=>{layout();request()},{passive:true});
    layout();

    // React may hydrate after this fallback. Keep the sticky geometry authoritative.
    const keep=setInterval(()=>{
      if(!document.body.contains(method)){clearInterval(keep);return;}
      rail.style.setProperty('position','sticky','important');
      rail.style.setProperty('top','0','important');
      rail.style.setProperty('overflow','hidden','important');
      track.style.setProperty('display','flex','important');
      request();
    },700);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
