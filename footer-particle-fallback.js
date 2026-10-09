(() => {
  'use strict';
  if(window.__WE_FOOTER_PARTICLES_V14__) return;
  window.__WE_FOOTER_PARTICLES_V14__=true;

  function boot(){
    const phrase=document.querySelector('[data-footer-phrase="true"]');
    const section=phrase&&(phrase.closest('section')||phrase.parentElement);
    if(!phrase||!section) return setTimeout(boot,180);
    if(section.querySelector('#we-footer-particle-canvas')) return;

    section.style.setProperty('position','relative','important');
    section.style.setProperty('overflow','hidden','important');

    const canvas=document.createElement('canvas');
    canvas.id='we-footer-particle-canvas';
    Object.assign(canvas.style,{
      position:'absolute',inset:'0',width:'100%',height:'100%',zIndex:'0',
      pointerEvents:'none',opacity:'0.92'
    });
    section.prepend(canvas);

    // Keep the real footer content above the particle field.
    [...section.children].forEach(el=>{
      if(el===canvas) return;
      if(getComputedStyle(el).position==='static') el.style.position='relative';
      if(!el.style.zIndex) el.style.zIndex='1';
    });

    const hit=document.createElement('button');
    hit.id='we-footer-particle-hit';
    hit.type='button';
    hit.setAttribute('aria-label','Disperse particles');
    Object.assign(hit.style,{
      position:'absolute',border:'0',background:'transparent',padding:'0',margin:'0',
      cursor:'pointer',zIndex:'3',borderRadius:'50%',outline:'none'
    });
    section.appendChild(hit);

    const ctx=canvas.getContext('2d',{alpha:true});
    const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
    let dpr=Math.min(devicePixelRatio||1,1.75),W=0,H=0,cx=0,cy=0,R=140;
    let falling=false,angle=0,raf=0,last=performance.now();
    let points=[];

    function makePoints(){
      const mobile=innerWidth<768;
      const count=reduce?(mobile?420:700):(mobile?1100:1900);
      points=[];
      const golden=Math.PI*(3-Math.sqrt(5));
      for(let i=0;i<count;i++){
        const y=1-(i/(count-1))*2;
        const radius=Math.sqrt(Math.max(0,1-y*y));
        const theta=golden*i;
        const x=Math.cos(theta)*radius;
        const z=Math.sin(theta)*radius;
        points.push({x,y,z,vx:0,vy:0,px:0,py:0,size:Math.random()<.08?1.7:1.05,rest:false});
      }
    }

    function resize(){
      const rect=section.getBoundingClientRect();
      W=Math.max(1,Math.round(rect.width));
      H=Math.max(1,Math.round(rect.height));
      dpr=Math.min(devicePixelRatio||1,1.75);
      canvas.width=Math.round(W*dpr);
      canvas.height=Math.round(H*dpr);
      canvas.style.width=W+'px';
      canvas.style.height=H+'px';
      ctx.setTransform(dpr,0,0,dpr,0,0);

      const sr=section.getBoundingClientRect();
      const pr=phrase.getBoundingClientRect();
      const mobile=innerWidth<768;
      cx=clamp((pr.left-sr.left)+pr.width*(mobile?.64:.72),mobile?W*.36:W*.42,W*.82);
      cy=clamp((pr.top-sr.top)+pr.height*(mobile?.44:.52),H*.16,H*.72);
      R=mobile?Math.min(118,W*.28):Math.min(205,W*.18);

      hit.style.width=(R*2.05)+'px';
      hit.style.height=(R*2.05)+'px';
      hit.style.left=(cx-R*1.025)+'px';
      hit.style.top=(cy-R*1.025)+'px';
      if(!points.length||(!falling&&points.length<(mobile?800:1300))) makePoints();
    }

    function clamp(v,a,b){return Math.max(a,Math.min(b,v));}

    function project(p){
      const ca=Math.cos(angle),sa=Math.sin(angle);
      const x=p.x*ca-p.z*sa;
      const z=p.x*sa+p.z*ca;
      const tilt=.18;
      const yy=p.y*Math.cos(tilt)-z*Math.sin(tilt);
      const zz=p.y*Math.sin(tilt)+z*Math.cos(tilt);
      const depth=(zz+1)*.5;
      p.px=cx+x*R;
      p.py=cy+yy*R;
      p.depth=depth;
    }

    function explode(){
      if(falling){
        falling=false;
        points.forEach(p=>{p.vx=p.vy=0;p.rest=false;});
        return;
      }
      falling=true;
      points.forEach(p=>{
        project(p);
        const dx=(p.px-cx)/(R||1);
        const dy=(p.py-cy)/(R||1);
        const burst=1.2+Math.random()*3.5;
        p.vx=dx*burst+(Math.random()-.5)*2.6;
        p.vy=dy*burst-1.5-Math.random()*3.3;
        p.rest=false;
      });
    }

    hit.addEventListener('click',explode);
    phrase.addEventListener('click',e=>{
      if(e.target.closest('a,button')) return;
      explode();
    });

    function draw(now){
      raf=requestAnimationFrame(draw);
      const dt=Math.min(2.2,(now-last)/16.667||1);last=now;
      ctx.clearRect(0,0,W,H);
      if(!falling&&!reduce) angle+=0.0028*dt;

      if(!falling){
        points.forEach(project);
        points.sort((a,b)=>a.depth-b.depth);
        for(const p of points){
          const a=.28+p.depth*.62;
          ctx.fillStyle=`rgba(238,238,246,${a})`;
          const s=p.size*(.75+p.depth*.75);
          ctx.fillRect(p.px,p.py,s,s);
        }
      }else{
        const floor=H-2;
        for(const p of points){
          if(!p.rest){
            p.vy+=0.15*dt;
            p.vx*=Math.pow(.995,dt);
            p.px+=p.vx*dt;
            p.py+=p.vy*dt;
            if(p.py>=floor){
              p.py=floor-Math.random()*Math.min(16,points.length/95);
              p.vy=0;p.vx*=.45;p.rest=true;
            }
          }
          ctx.fillStyle='rgba(238,238,246,.72)';
          ctx.fillRect(p.px,p.py,p.size,p.size);
        }
      }
    }

    addEventListener('resize',resize,{passive:true});
    resize();
    raf=requestAnimationFrame(draw);

    addEventListener('pagehide',()=>{if(raf)cancelAnimationFrame(raf);},{once:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
