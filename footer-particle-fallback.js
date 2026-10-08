(() => {
  'use strict';
  if (window.__WE_PARTICLE_V3__) return;
  window.__WE_PARTICLE_V3__ = true;

  function boot(){
    const phrase=document.querySelector('[data-footer-phrase="true"]');
    const footer=document.querySelector('[data-footer-section="true"]');
    if(!phrase||!footer) return setTimeout(boot,220);

    document.getElementById('we-particle-object')?.remove();
    document.getElementById('we-particle-object-v3')?.remove();
    document.getElementById('we-particle-rain')?.remove();
    document.getElementById('we-particle-rain-v3')?.remove();

    const section=phrase.closest('section')||phrase.parentElement;
    section.style.position='relative';
    section.style.overflow='visible';
    phrase.style.position='relative';
    phrase.style.zIndex='3';
    footer.style.position='relative';

    const cv=document.createElement('canvas');
    cv.id='we-particle-object-v3';
    cv.title='Click to release the particles';
    cv.setAttribute('aria-label','Interactive particle sphere');
    Object.assign(cv.style,{
      position:'absolute',
      width:'min(66vw,930px)',
      height:'min(46vw,620px)',
      right:'-2%',
      top:'47%',
      transform:'translateY(-50%)',
      zIndex:'2',
      cursor:'pointer',
      pointerEvents:'auto',
      opacity:'1',
      transition:'opacity 260ms ease',
      touchAction:'pan-y'
    });
    section.appendChild(cv);
    const c=cv.getContext('2d',{alpha:true});
    if(!c) return;

    let W=0,H=0,D=1,raf=0,t0=performance.now(),dropped=false;
    let lastProjected=[];
    const N=1900;
    const golden=Math.PI*(3-Math.sqrt(5));
    const pts=Array.from({length:N},(_,i)=>{
      const y=1-(i/(N-1))*2;
      const rr=Math.sqrt(Math.max(0,1-y*y));
      const th=golden*i;
      const warp=1+.055*Math.sin(th*3.1+i*.017)+.025*Math.cos(i*.11);
      return {
        x:Math.cos(th)*rr*warp,
        y:y*(.92+.035*Math.sin(i*.09)),
        z:Math.sin(th)*rr*warp,
        seed:(i*37)%101/101,
        tint:i%41===0?1:(i%67===0?2:0)
      };
    });

    function resize(){
      const r=cv.getBoundingClientRect();
      W=Math.max(300,r.width);H=Math.max(260,r.height);D=Math.min(2,devicePixelRatio||1);
      cv.width=Math.round(W*D);cv.height=Math.round(H*D);c.setTransform(D,0,0,D,0,0);
    }

    function rotate(x,y,z,ay,ax){
      const cy=Math.cos(ay),sy=Math.sin(ay),cx=Math.cos(ax),sx=Math.sin(ax);
      let X=cy*x+sy*z,Z=-sy*x+cy*z,Y=cx*y-sx*Z;Z=sx*y+cx*Z;
      return [X,Y,Z];
    }

    function draw(now){
      if(dropped) return;
      c.clearRect(0,0,W,H);
      const tt=(now-t0)*.00022;
      const cx=W*.53,cy=H*.50,scale=Math.min(W,H)*.39;
      lastProjected=[];

      // faint halo, matching the soft volumetric sphere on the original site
      const halo=c.createRadialGradient(cx,cy,scale*.12,cx,cy,scale*1.1);
      halo.addColorStop(0,'rgba(255,255,255,.018)');halo.addColorStop(.72,'rgba(255,255,255,.008)');halo.addColorStop(1,'rgba(255,255,255,0)');
      c.fillStyle=halo;c.beginPath();c.arc(cx,cy,scale*1.1,0,Math.PI*2);c.fill();

      for(let i=0;i<pts.length;i++){
        const p=pts[i];
        let [x,y,z]=rotate(p.x,p.y,p.z,tt,-.16+Math.sin(tt*.8)*.08);
        // Organic displacement keeps it from looking like a perfect CG ball.
        const pulse=1+.018*Math.sin(tt*4+p.seed*12)+.012*Math.sin(i*.13+tt*2);
        x*=pulse;y*=pulse;
        const perspective=1/(1.72-z*.18);
        const px=cx+x*scale*perspective*1.54;
        const py=cy+y*scale*perspective*1.31;
        const depth=(z+1.15)/2.3;
        const alpha=.16+Math.max(0,depth)*.73;
        const size=.48+Math.max(0,depth)*1.05;
        let fill=`rgba(242,242,248,${alpha})`;
        if(p.tint===1) fill=`rgba(228,0,124,${alpha*.78})`;
        else if(p.tint===2) fill=`rgba(0,184,210,${alpha*.72})`;
        c.beginPath();c.arc(px,py,size,0,Math.PI*2);c.fillStyle=fill;c.fill();
        lastProjected.push({x:px,y:py,r:size,a:alpha,tint:p.tint,z});
      }
      raf=requestAnimationFrame(draw);
    }

    function release(){
      if(dropped||!lastProjected.length) return;
      dropped=true;cancelAnimationFrame(raf);
      const footerRect=footer.getBoundingClientRect();
      const objectRect=cv.getBoundingClientRect();
      const overlay=document.createElement('canvas');
      overlay.id='we-particle-rain-v3';
      Object.assign(overlay.style,{position:'absolute',inset:'0',width:'100%',height:'100%',zIndex:'2',pointerEvents:'none'});
      footer.appendChild(overlay);
      const q=overlay.getContext('2d',{alpha:true});
      if(!q) return;
      const d=Math.min(2,devicePixelRatio||1);
      const FW=Math.max(320,footer.clientWidth),FH=Math.max(600,footer.scrollHeight);
      overlay.width=Math.round(FW*d);overlay.height=Math.round(FH*d);q.setTransform(d,0,0,d,0,0);

      const ox=objectRect.left-footerRect.left;
      const oy=objectRect.top-footerRect.top;
      const particles=lastProjected.map((p,i)=>{
        const spread=((i*47)%101)/101-.5;
        return {
          x:ox+p.x,y:oy+p.y,
          vx:spread*(.55+Math.random()*1.5)+(p.x-W*.53)/Math.max(220,W)*.8,
          vy:-.18-Math.random()*1.7,
          g:.052+Math.random()*.068,
          r:p.r*(.76+Math.random()*.48),
          a:p.a*(.62+Math.random()*.38),
          tint:p.tint,
          settled:false,
          floor:FH-3-Math.pow(Math.random(),2.4)*(10+Math.max(0,42-Math.abs((ox+p.x)-FW*.5)*.035))
        };
      });
      // A small number of stray particles makes the trail extend all the way through the footer.
      for(let i=0;i<120;i++) particles.push({
        x:FW*Math.random(),y:Math.max(0,oy+H*.55+Math.random()*Math.max(80,FH-(oy+H*.55))),
        vx:(Math.random()-.5)*.18,vy:.15+Math.random()*.6,g:.018+Math.random()*.03,r:.45+Math.random()*.9,a:.12+Math.random()*.3,tint:0,settled:false,
        floor:FH-2-Math.random()*14
      });

      cv.style.opacity='0';
      cv.style.pointerEvents='none';
      let last=performance.now();
      function fall(now){
        const dt=Math.min(2.2,(now-last)/16.67||1);last=now;
        q.clearRect(0,0,FW,FH);
        let moving=0;
        for(const p of particles){
          if(!p.settled){
            p.vy+=p.g*dt;p.vx*=.996;p.x+=p.vx*dt;p.y+=p.vy*dt;
            if(p.x<0){p.x=0;p.vx=Math.abs(p.vx)*.45}else if(p.x>FW){p.x=FW;p.vx=-Math.abs(p.vx)*.45}
            if(p.y>=p.floor){p.y=p.floor;p.vy=0;p.vx=0;p.settled=true}else moving++;
          }
          q.beginPath();q.arc(p.x,p.y,p.r,0,Math.PI*2);
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
    addEventListener('resize',()=>{if(!dropped)resize()},{passive:true});
    resize();raf=requestAnimationFrame(draw);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
