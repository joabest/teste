(() => {
  'use strict';
  if (window.__WE_METHOD_SCROLL_V3__) return;
  window.__WE_METHOD_SCROLL_V3__ = true;

  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const smooth=t=>t*t*(3-2*t);

  function boot(){
    const method=document.querySelector('[data-method="true"]');
    const rail=method&&method.querySelector('[data-method-rail="true"]');
    const track=method&&method.querySelector('[data-method-track="true"]');
    const intro=method&&method.querySelector('[data-method-intro="true"]');
    if(!method||!rail||!track||!intro) return setTimeout(boot,180);
    if(method.dataset.scrollFallbackV3==='1') return;
    method.dataset.scrollFallbackV3='1';

    const slides=[...track.querySelectorAll('[data-method-slide]')];
    const progress=[...rail.children].find(el=>el!==intro&&el!==track&&el.classList&&el.classList.contains('fixed'))||null;
    let topDoc=0,total=1,startX=0,endX=0,activeDesktop=false,ticking=false;

    function desktopLayout(){
      activeDesktop=innerWidth>=768;
      if(!activeDesktop){
        method.style.removeProperty('height');
        rail.style.setProperty('position','relative','important');
        rail.style.setProperty('height','auto','important');
        rail.style.setProperty('overflow','visible','important');
        intro.style.setProperty('position','relative','important');
        intro.style.setProperty('opacity','1','important');
        intro.style.setProperty('transform','none','important');
        intro.style.setProperty('min-height','55svh','important');
        intro.style.setProperty('pointer-events','auto','important');
        track.style.setProperty('position','relative','important');
        track.style.setProperty('display','block','important');
        track.style.setProperty('width','100%','important');
        track.style.setProperty('height','auto','important');
        track.style.setProperty('transform','none','important');
        track.style.setProperty('opacity','1','important');
        slides.forEach(s=>{
          s.style.setProperty('width','100%','important');
          s.style.setProperty('height','auto','important');
          s.style.setProperty('min-height','78svh','important');
          s.style.setProperty('transform','none','important');
          s.style.setProperty('opacity','1','important');
        });
        if(progress) progress.style.setProperty('display','none','important');
        return;
      }

      if(progress) progress.style.removeProperty('display');
      rail.style.setProperty('position','sticky','important');
      rail.style.setProperty('top','0','important');
      rail.style.setProperty('height','100vh','important');
      rail.style.setProperty('overflow','hidden','important');
      intro.style.setProperty('position','absolute','important');
      intro.style.setProperty('inset','0','important');
      intro.style.setProperty('min-height','0','important');
      intro.style.setProperty('pointer-events','none','important');
      track.style.setProperty('position','absolute','important');
      track.style.setProperty('left','0','important');
      track.style.setProperty('top','0','important');
      track.style.setProperty('display','flex','important');
      track.style.setProperty('width','350vw','important');
      track.style.setProperty('height','100vh','important');
      slides.forEach(s=>{
        s.style.setProperty('width','70vw','important');
        s.style.setProperty('height','100vh','important');
        s.style.removeProperty('min-height');
      });

      startX=innerWidth*.92;
      endX=-innerWidth*2.48;
      const travel=startX-endX;
      const height=Math.round(innerHeight + travel*1.22 + innerHeight*.65);
      method.style.setProperty('height',height+'px','important');
      const rect=method.getBoundingClientRect();
      topDoc=scrollY+rect.top;
      total=Math.max(1,height-innerHeight);
      render();
    }

    function render(){
      ticking=false;
      if(!activeDesktop) return;
      const p=clamp((scrollY-topDoc)/total,0,1);

      const introIn=smooth(clamp(p/.055,0,1));
      const introOut=1-smooth(clamp((p-.105)/.09,0,1));
      const introOpacity=clamp(introIn*introOut,0,1);
      intro.style.setProperty('opacity',String(introOpacity),'important');
      intro.style.setProperty('transform',`translate3d(${(1-introIn)*8}vw,0,0)`,'important');

      const moveP=smooth(clamp((p-.12)/.80,0,1));
      const x=startX+(endX-startX)*moveP;
      const trackOpacity=smooth(clamp((p-.105)/.075,0,1))*(1-smooth(clamp((p-.965)/.035,0,1))*.12);
      track.style.setProperty('transform',`translate3d(${x}px,0,0)`,'important');
      track.style.setProperty('opacity',String(clamp(trackOpacity,0,1)),'important');

      const center=innerWidth*.5;
      slides.forEach((slide,i)=>{
        const slideCenter=x+(i*.70+.35)*innerWidth;
        const distance=Math.abs(slideCenter-center)/innerWidth;
        const fade=clamp(1-(distance-.24)*.72,.42,1);
        slide.style.setProperty('opacity',String(fade),'important');
      });

      if(progress){
        const show=smooth(clamp((p-.16)/.05,0,1))*(1-smooth(clamp((p-.94)/.05,0,1)));
        progress.style.setProperty('opacity',String(show),'important');
        progress.style.setProperty('transform',`translateX(-50%) translateY(${(1-show)*14}px)`,'important');
      }
    }

    function request(){if(ticking)return;ticking=true;requestAnimationFrame(render)}
    addEventListener('scroll',request,{passive:true});
    addEventListener('resize',()=>{desktopLayout();request()},{passive:true});
    desktopLayout();

    // The original Next controller may hydrate later. Re-assert the sticky rail and our
    // transform after hydration without fighting the browser on every scroll event.
    const keep=setInterval(()=>{
      if(!document.body.contains(method)){clearInterval(keep);return;}
      if(activeDesktop){
        rail.style.setProperty('position','sticky','important');
        rail.style.setProperty('top','0','important');
        track.style.setProperty('width','350vw','important');
        request();
      }
    },600);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
