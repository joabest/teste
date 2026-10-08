(() => {
  'use strict';
  if (window.__WE_PARTICLE_V4__) return;
  window.__WE_PARTICLE_V4__ = true;

  function boot(){
    const phrase=document.querySelector('[data-footer-phrase="true"]');
    const footer=document.querySelector('[data-footer-section="true"]');
    const mobileAnchor=document.querySelector('[data-torus-mobile-anchor="true"]');
    if(!phrase||!footer) return setTimeout(boot,220);

    document.getElementById('we-particle-object')?.remove();
    document.getElementById('we-particle-object-v3')?.remove();
    document.getElementById('we-particle-object-v4')?.remove();
    document.getElementById('we-particle-rain')?.remove();
    document.getElementById('we-particle-rain-v3')?.remove();
    document.getElementById('we-particle-rain-v4')?.remove();

    const section=phrase.closest('section')||phrase.parentElement;
    section.style.position='relative';
    section.style.overflow='visible';
    phrase.style.position='relative';
    phrase.style.zIndex='4';
    footer.style.position='relative';

    const cv=document.createElement('canvas');
    cv.id='we-particle-object-v4';
    cv.title='Click to release the particles';
    cv.setAttribute('aria-label','Interactive particle sphere');
    cv.style.position='absolute';
    cv.style.zIndex='2';
    cv.style.cursor='pointer';
    cv.style.pointerEvents='auto';
    cv.style.opacity='1';
    cv.style.transition='opacity 260ms ease';
    cv.style.touchAction='pan-y';

    const c=cv.getContext('2d',{alpha:true});
    if(!c) return;

    let W=0,H=0,D=1,raf=0,t0=performance.now(),dropped=false,isMobile=false;
    let lastProjected=[];
    const N=2100;
    const golden=Math.PI*(3-Math.sqrt(5));
    const pts=Array.from({length:N},(_,i)=>{
      const y=1-(i/(N-1))*2;
      const rr=Math.sqrt(Math.max(0,1-y*y));
      const th=golden*i;
      const warp=1+.065*Math.sin(th*3.1+i*.017)+.03*Math.cos(i*.11);
      return {
        x:Math.cos(th)*rr*warp,
        y:y*(.92+.04*Math.sin(i*.09)),
        z:Math.sin(th)*rr*warp,
        seed:(i*37)%101/101,
        tint:i%43===0?1:(i%71===0?2:0)
      };
    });

    function place(){
      isMobile=innerWidth<640;
      if(isMobile){
        // The exported page already contains a dedicated mobile torus anchor. Use it
        // instead of squeezing the particle object into the headline's narrow box.
        const host=mobileAnchor||section;
        if(cv.parentElement!==host) host.appendChild(cv);
        if(mobileAnchor){
          mobileAnchor.style.setProperty('position','relative','important');
          mobileAnchor.style.setProperty('height','280px','important');
          mobileAnchor.style.setProperty('overflow','visible','important');
        }
        Object.assign(cv.style,{
          width:'min(100vw,460px)',
          height:'280px',
          left:'50%',
          right:'auto',
          top:'50%',
          transform:'translate(-50%,-50%)'
        });
      }else{
        if(cv.parentElement!==section) section.appendChild(cv);
        Object.assign(cv.style,{
          width:'min(66vw,930px)',
          height:'min(46vw,620px)',
          left:'auto',
          right:'-2%',
          top:'47%',
          transform:'translateY(-50%)'
        });
      }
      resize();
    }

    function resize(){
      const r=cv.getBoundingClientRect();
      W=Math.max(300,r.width||300);
      H=Math.max(260,r.height||260);
      D=Math.min(2,devicePixelRatio||1);
      cv.width=Math.round(W*D);
      cv.height=Math.round(H*D);
      c.setTransform(D,0,0,D,0,0);
    }

    function rotate(x,y,z,ay,ax){
      const cy=Math.cos(ay),sy=Math.sin(ay),cx=Math.cos(ax),sx=Math.sin(ax);
      let X=cy*x+sy*z,Z=-sy*x+cy*z,Y=cx*y-sx*Z;
      Z=sx*y+cx*Z;
      return [X,Y,Z];
    }

    function draw(now){
      if(dropped) return;
      c.clearRect(0,0,W,H);
      const tt=(now-t0)*.00022;
      const cx=W*.52,cy=H*.50;
      const scale=Math.min(W,H)*(isMobile?.48:.39);
      lastProjected=[];

      const halo=c.createRadialGradient(cx,cy,scale*.10,cx,cy,scale*1.16);
      halo.addColorStop(0,'rgba(255,255,255,.032)');
      halo.addColorStop(.68,'rgba(255,255,255,.013)');
      halo.addColorStop(1,'rgba(255,255,255,0)');
      c.fillStyle=halo;
      c.beginPath();
      c.arc(cx,cy,scale*1.16,0,Math.PI*2);
      c.fill();

      // faint orbital lines around the cloud, like the original interactive object
      c.save();
      c.translate(cx,cy);
      c.strokeStyle='rgba(240,240,248,.085)';
      c.lineWidth=.65;
      for(let i=0;i<5;i++){
        c.save();
        c.rotate(tt*.45+i*.68);
        c.scale(1,.30+.08*(i%2));
        c.beginPath();
        c.arc(0,0,scale*(1.05+i*.035),0,Math.PI*2);
        c.stroke();
        c.restore();
      }
      c.restore();

      for(let i=0;i<pts.length;i++){
        const p=pts[i];
        let [x,y,z]=rotate(p.x,p.y,p.z,tt,-.16+Math.sin(tt*.8)*.08);
        const pulse=1+.018*Math.sin(tt*4+p.seed*12)+.012*Math.sin(i*.13+tt*2);
        x*=pulse;y*=pulse;
        const perspective=1/(1.72-z*.18);
        const px=cx+x*scale*perspective*1.54;
        const py=cy+y*scale*perspective*1.31;
        const depth=(z+1.15)/2.3;
        const alpha=.20+Math.max(0,depth)*.78;
        const size=(isMobile?.58:.48)+Math.max(0,depth)*(isMobile?1.12:1.05);
        let fill=`rgba(242,242,248,${alpha})`;
        if(p.tint===1) fill=`rgba(228,0,124,${alpha*.84})`;
        else if(p.tint===2) fill=`rgba(0,184,210,${alpha*.78})`;
        c.beginPath();
        c.arc(px,py,size,0,Math.PI*2);
        c.fillStyle=fill;
        c.fill();
        lastProjected.push({x:px,y:py,r:size,a:alpha,tint:p.tint,z});
      }
      raf=requestAnimationFrame(draw);
    }

    function release(){
      if(dropped||!lastProjected.length) return;
      dropped=true;
      cancelAnimationFrame(raf);

      const footerRect=footer.getBoundingClientRect();
      const objectRect=cv.getBoundingClientRect();
      const overlay=document.createElement('canvas');
      overlay.id='we-particle-rain-v4';
      Object.assign(overlay.style,{
        position:'absolute',inset:'0',width:'100%',height:'100%',zIndex:'2',pointerEvents:'none'
      });
      footer.appendChild(overlay);
      const q=overlay.getContext('2d',{alpha:true});
      if(!q) return;

      const d=Math.min(2,devicePixelRatio||1);
      const FW=Math.max(320,footer.clientWidth);
      const FH=Math.max(600,footer.scrollHeight);
      overlay.width=Math.round(FW*d);
      overlay.height=Math.round(FH*d);
      q.setTransform(d,0,0,d,0,0);

      const ox=objectRect.left-footerRect.left;
      const oy=objectRect.top-footerRect.top;
      const particles=lastProjected.map((p,i)=>{
        const spread=((i*47)%101)/101-.5;
        return {
          x:ox+p.x,
          y:oy+p.y,
          vx:spread*(.60+Math.random()*1.65)+(p.x-W*.52)/Math.max(220,W)*.9,
          vy:-.20-Math.random()*1.9,
          g:.054+Math.random()*.072,
          r:p.r*(.76+Math.random()*.48),
          a:p.a*(.62+Math.random()*.38),
          tint:p.tint,
          settled:false,
          floor:FH-3-Math.pow(Math.random(),2.4)*(12+Math.max(0,46-Math.abs((ox+p.x)-FW*.5)*.035))
        };
      });

      // Keep a sparse trail through the whole footer while the main cloud settles below.
      for(let i=0;i<150;i++) particles.push({
        x:FW*Math.random(),
        y:Math.max(0,oy+H*.55+Math.random()*Math.max(80,FH-(oy+H*.55))),
        vx:(Math.random()-.5)*.20,
        vy:.15+Math.random()*.65,
        g:.018+Math.random()*.032,
        r:.45+Math.random()*1.0,
        a:.14+Math.random()*.34,
        tint:0,
        settled:false,
        floor:FH-2-Math.random()*16
      });

      cv.style.opacity='0';
      cv.style.pointerEvents='none';
      let last=performance.now();
      function fall(now){
        const dt=Math.min(2.2,(now-last)/16.67||1);
        last=now;
        q.clearRect(0,0,FW,FH);
        let moving=0;
        for(const p of particles){
          if(!p.settled){
            p.vy+=p.g*dt;
            p.vx*=.996;
            p.x+=p.vx*dt;
            p.y+=p.vy*dt;
            if(p.x<0){p.x=0;p.vx=Math.abs(p.vx)*.45}
            else if(p.x>FW){p.x=FW;p.vx=-Math.abs(p.vx)*.45}
            if(p.y>=p.floor){p.y=p.floor;p.vy=0;p.vx=0;p.settled=true}
            else moving++;
          }
          q.beginPath();
          q.arc(p.x,p.y,p.r,0,Math.PI*2);
          if(p.tint===1) q.fillStyle=`rgba(228,0,124,${p.a})`;
          else if(p.tint===2) q.fillStyle=`rgba(0,184,210,${p.a})`;
          else q.fillStyle=`rgba(242,242,248,${p.a})`;
          q.fill();
        }
        if(moving>0) requestAnimationFrame(fall);
      }
      requestAnimationFrame(fall);
    }

    cv.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();release()});
    phrase.addEventListener('click',e=>{if(!e.target.closest('a'))release()});
    addEventListener('resize',()=>{if(!dropped)place()},{passive:true});

    place();
    raf=requestAnimationFrame(draw);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
