(() => {
  'use strict';
  if (window.__WE_METHOD_SCROLL_V21__) return;
  window.__WE_METHOD_SCROLL_V21__ = true;

  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
  const BG='#0b0b0d',FG='#e8e8ea',MUTED='#8e8e95',PINK='#e4007c',BORDER='rgba(255,255,255,.08)';
  let raf=0,scrollBound=false;

  function boot(){
    const method=document.querySelector('[data-method="true"]');
    const rail=method?.querySelector('[data-method-rail="true"]');
    const track=method?.querySelector('[data-method-track="true"]');
    const intro=method?.querySelector('[data-method-intro="true"]');
    if(!method||!rail||!track)return setTimeout(boot,120);
    const slides=[...track.querySelectorAll('[data-method-slide]')];
    if(!slides.length)return;

    const nativeSvg=method.querySelector('svg[aria-label="method progress"]');
    const nativeProgress=nativeSvg?.parentElement;
    if(nativeProgress)nativeProgress.style.setProperty('display','none','important');

    method.style.setProperty('--method-bg',BG);
    method.style.setProperty('--method-fg',FG);
    method.style.setProperty('--method-muted',MUTED);
    method.style.setProperty('--method-accent',PINK);
    method.style.setProperty('--method-border',BORDER);

    const paintTheme=root=>{
      if(!root)return;
      root.style.setProperty('background',BG,'important');
      root.style.setProperty('color',FG,'important');
      root.querySelectorAll('[data-method-name],h1,h2,h3').forEach(n=>n.style.setProperty('color',FG,'important'));
      root.querySelectorAll('[data-method-tagline],[data-method-watermark],p').forEach(n=>n.style.setProperty('color',MUTED,'important'));
      root.querySelectorAll('[data-method-bullet]').forEach(n=>n.style.setProperty('color',FG,'important'));
      root.querySelectorAll('[data-method-index],[data-method-step],[aria-current="true"]').forEach(n=>n.style.setProperty('color',PINK,'important'));
      root.querySelectorAll('[class*="border-"]').forEach(n=>n.style.setProperty('border-color',BORDER,'important'));
    };

    function mobileLayout(){
      method.style.setProperty('position','relative','important');
      method.style.setProperty('height','auto','important');
      method.style.setProperty('min-height','0','important');
      method.style.setProperty('overflow','visible','important');
      method.style.setProperty('background',BG,'important');
      method.style.setProperty('color',FG,'important');
      method.style.setProperty('contain','none','important');

      rail.style.setProperty('position','relative','important');
      rail.style.setProperty('top','auto','important');
      rail.style.setProperty('left','auto','important');
      rail.style.setProperty('width','100%','important');
      rail.style.setProperty('height','auto','important');
      rail.style.setProperty('min-height','0','important');
      rail.style.setProperty('overflow','visible','important');
      rail.style.setProperty('background',BG,'important');
      rail.style.setProperty('visibility','visible','important');
      rail.style.setProperty('pointer-events','auto','important');

      if(intro){
        intro.style.setProperty('position','relative','important');
        intro.style.setProperty('inset','auto','important');
        intro.style.setProperty('min-height','auto','important');
        intro.style.setProperty('padding-bottom','48px','important');
        intro.style.setProperty('opacity','1','important');
        intro.style.setProperty('transform','none','important');
        intro.style.setProperty('background',BG,'important');
        intro.style.setProperty('color',FG,'important');
        intro.style.setProperty('pointer-events','auto','important');
        paintTheme(intro);
      }

      track.style.setProperty('position','relative','important');
      track.style.setProperty('inset','auto','important');
      track.style.setProperty('width','100%','important');
      track.style.setProperty('height','auto','important');
      track.style.setProperty('overflow','visible','important');
      track.style.setProperty('transform','none','important');
      track.style.setProperty('opacity','1','important');
      track.style.setProperty('background',BG,'important');

      slides.forEach(slide=>{
        slide.style.setProperty('position','relative','important');
        slide.style.setProperty('inset','auto','important');
        slide.style.setProperty('display','flex','important');
        slide.style.setProperty('width','100%','important');
        slide.style.setProperty('max-width','none','important');
        slide.style.setProperty('height','auto','important');
        slide.style.setProperty('min-height','0','important');
        slide.style.setProperty('padding-top','48px','important');
        slide.style.setProperty('padding-bottom','48px','important');
        slide.style.setProperty('margin','0','important');
        slide.style.setProperty('transform','none','important');
        slide.style.setProperty('opacity','1','important');
        slide.style.setProperty('visibility','visible','important');
        slide.style.setProperty('pointer-events','auto','important');
        slide.style.setProperty('will-change','auto','important');
        slide.style.setProperty('transition','none','important');
        slide.style.setProperty('background',BG,'important');
        slide.style.setProperty('color',FG,'important');
        slide.style.setProperty('border-color',BORDER,'important');
        paintTheme(slide);
      });
      paintTheme(method);
    }

    let topDoc=0,total=1;
    function desktopLayout(){
      const vh=Math.max(520,innerHeight),totalVh=5.8;
      method.style.setProperty('position','relative','important');
      method.style.setProperty('height',(vh*totalVh)+'px','important');
      method.style.setProperty('min-height',(vh*totalVh)+'px','important');
      method.style.setProperty('overflow','clip','important');
      method.style.setProperty('background',BG,'important');
      method.style.setProperty('color',FG,'important');
      method.style.setProperty('isolation','isolate','important');

      rail.style.setProperty('position','sticky','important');rail.style.setProperty('top','0','important');rail.style.setProperty('left','0','important');rail.style.setProperty('width','100vw','important');rail.style.setProperty('height','100svh','important');rail.style.setProperty('min-height','520px','important');rail.style.setProperty('overflow','hidden','important');rail.style.setProperty('z-index','2','important');rail.style.setProperty('background',BG,'important');
      if(intro){intro.style.setProperty('position','absolute','important');intro.style.setProperty('inset','0','important');intro.style.setProperty('z-index','1','important');intro.style.setProperty('pointer-events','none','important');paintTheme(intro)}
      track.style.setProperty('position','absolute','important');track.style.setProperty('inset','0','important');track.style.setProperty('width','100vw','important');track.style.setProperty('height','100svh','important');track.style.setProperty('overflow','hidden','important');track.style.setProperty('background',BG,'important');
      slides.forEach((slide,i)=>{slide.style.setProperty('position','absolute','important');slide.style.setProperty('inset','0','important');slide.style.setProperty('display','flex','important');slide.style.setProperty('width','100vw','important');slide.style.setProperty('height','100svh','important');slide.style.setProperty('min-height','520px','important');slide.style.setProperty('padding','0','important');slide.style.setProperty('z-index',String(10+i),'important');slide.style.setProperty('will-change','transform,opacity','important');slide.style.setProperty('transition','none','important');paintTheme(slide)});
      const r=method.getBoundingClientRect();topDoc=scrollY+r.top;total=Math.max(1,method.offsetHeight-innerHeight);paintDesktop();
    }

    function paintDesktop(){
      raf=0;if(innerWidth<768||!document.body.contains(method))return;
      const rect=method.getBoundingClientRect(),inMethod=rect.bottom>1&&rect.top<innerHeight;
      rail.style.setProperty('visibility',inMethod?'visible':'hidden','important');rail.style.setProperty('pointer-events',inMethod?'auto':'none','important');
      const p=clamp((scrollY-topDoc)/total,0,1);
      if(intro){const out=1-ease(clamp((p-.035)/.105,0,1));intro.style.setProperty('opacity',String(out),'important');intro.style.setProperty('transform',`translate3d(${(1-out)*-5}vw,0,0)`,'important')}
      const startBase=.105,gap=.155,duration=.13;
      slides.forEach((slide,i)=>{const local=ease(clamp((p-(startBase+i*gap))/duration,0,1));slide.style.setProperty('transform',`translate3d(${(1-local)*104}vw,0,0)`,'important');slide.style.setProperty('opacity',String(clamp(local*1.08,0,1)),'important');slide.style.setProperty('visibility',local>.015?'visible':'hidden','important');slide.style.setProperty('pointer-events',local>.98?'auto':'none','important')});
    }

    function schedule(){if(!raf)raf=requestAnimationFrame(paintDesktop)}
    function bindDesktopScroll(){if(!scrollBound){addEventListener('scroll',schedule,{passive:true});scrollBound=true}}
    function unbindDesktopScroll(){if(scrollBound){removeEventListener('scroll',schedule);scrollBound=false}}
    function layout(){if(innerWidth<768){unbindDesktopScroll();mobileLayout()}else{bindDesktopScroll();desktopLayout()}}

    addEventListener('resize',()=>{clearTimeout(boot._r);boot._r=setTimeout(layout,180)},{passive:true});
    layout();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();