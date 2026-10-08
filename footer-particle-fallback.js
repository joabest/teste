(() => {
  'use strict';
  if (window.__WE_PARTICLE_V5__) return;
  window.__WE_PARTICLE_V5__ = true;

  const TAU=Math.PI*2;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

  function boot(){
    const phrase=document.querySelector('[data-footer-phrase="true"]');
    const footer=document.querySelector('[data-footer-section="true"]');
    const mobileAnchor=document.querySelector('[data-torus-mobile-anchor="true"]');
    if(!phrase||!footer) return setTimeout(boot,180);

    ['we-particle-object','we-particle-object-v3','we-particle-object-v4','we-particle-object-v5','we-particle-rain','we-particle-rain-v3','we-particle-rain-v4','we-particle-rain-v5'].forEach(id=>document.getElementById(id)?.remove());

    const section=phrase.closest('section')||phrase.parentElement;
    section.style.position='relative';
    section.style.overflow='visible';
    phrase.style.position='relative';
    phrase.style.zIndex='5';
    footer.style.position='relative';

    const cv=document.createElement('canvas');
    cv.id='we-particle-object-v5';
    cv.title='Click to release the particles';
    cv.setAttribute('aria-label','Interactive particle torus');
    Object.assign(cv.style,{
      position:'absolute',zIndex:'2',cursor:'pointer',pointerEvents:'auto',opacity:'1',
      transition:'opacity 220ms ease',touchAction:'pan-y',filter:'drop-shadow(0 0 18px rgba(255,255,255,.025))'
    });

    const c=cv.getContext('2d',{alpha:true});
    if(!c) return;

    let W=0,H=0,D=1,raf=0,t0=performance.now(),dropped=false,isMobile=false;
    let projected=[];
    const N=2700;
    const pts=Array.from({length:N},(_,i)=>{
      const fu=(i*.618033988749895)%1;
      const fv=(i*.754877666246693)%1;
      const u=fu*TAU;
      const v=fv*TAU;
      const tube=.34*(1+.055*Math.sin(i*.173));
      const ring=1+tube*Math.cos(v);
      return {
        x:ring*Math.cos(u),
        y:tube*Math.sin(v),
        z:ring*Math.sin(u),
        seed:(i*37%101)/101,
        tint:i%47===0?1:(i%83===0?2:0)
      };
    });

    function rotate3(x,y,z,ay,ax,az){
      let cy=Math.cos(ay),sy=Math.sin(ay);
      let X=cy*x+sy*z,Z=-sy*x+cy*z,Y=y;
      let cx=Math.cos(ax),sx=Math.sin(ax);
      let Y2=cx*Y-sx*Z,Z2=sx*Y+cx*Z;
      let cz=Math.cos(az),sz=Math.sin(az);
      return [cz*X-sz*Y2,sz*X+cz*Y2,Z2];
    }

    function place(){
      isMobile=innerWidth<640;
      if(isMobile){
        const host=mobileAnchor||section;
        if(cv.parentElement!==host) host.appendChild(cv);
        if(mobileAnchor){
          mobileAnchor.style.setProperty('position','relative','important');
          mobileAnchor.style.setProperty('height','300px','important');
          mobileAnchor.style.setProperty('overflow','visible','important');
        }
        Object.assign(cv.style,{
          width:'min(116vw,520px)',height:'300px',left:'50%',right:'auto',top:'50%',
          transform:'translate(-50%,-50%)'
        });
      }else{
        if(cv.parentElement!==section) section.appendChild(cv);
        Object.assign(cv.style,{
          width:'min(72vw,980px)',height:'min(48vw,640px)',left:'auto',right:'-8%',top:'50%',
          transform:'translateY(-50%)'
        });
      }
      resize();
    }

    function resize(){
      const r=cv.getBoundingClientRect();
      W=Math.max(300,r.width||300); H=Math.max(260,r.height||260); D=Math.min(2,devicePixelRatio||1);
      cv.width=Math.round(W*D); cv.height=Math.round(H*D); c.setTransform(D,0,0,D,0,0);
    }

    function draw(now){
      if(dropped) return;
      c.clearRect(0,0,W,H);
      const t=(now-t0)*.00032;
      const cx=W*(isMobile?.5:.54),cy=H*.50;
      const scale=Math.min(W,H)*(isMobile?.46:.39);
      projected=[];

      const halo=c.createRadialGradient(cx,cy,scale*.28,cx,cy,scale*1.55);
      halo.addColorStop(0,'rgba(255,255,255,.028)');
      halo.addColorStop(.55,'rgba(255,255,255,.012)');
      halo.addColorStop(1,'rgba(255,255,255,0)');
      c.fillStyle=halo;c.beginPath();c.arc(cx,cy,scale*1.55,0,TAU);c.fill();

      const pitch=.92+Math.sin(t*.7)*.10;
      const yaw=t*.72;
      const roll=-.34+Math.sin(t*.45)*.08;

      for(let i=0;i<pts.length;i++){
        const p=pts[i];
        let [x,y,z]=rotate3(p.x,p.y,p.z,yaw,pitch,roll);
        const breathe=1+.018*Math.sin(t*3+p.seed*TAU)+.008*Math.sin(i*.19+t);
        x*=breathe;y*=breathe;
        const persp=1/(2.18-z*.21);
        const px=cx+x*scale*persp*1.48;
        const py=cy+y*scale*persp*1.48;
        const depth=clamp((z+1.4)/2.8,0,1);
        const a=.12+depth*.82;
        const r=(isMobile?.52:.43)+depth*(isMobile?1.12:1.02);
        c.beginPath();c.arc(px,py,r,0,TAU);
        if(p.tint===1)c.fillStyle=`rgba(228,0,124,${a*.9})`;
        else if(p.tint===2)c.fillStyle=`rgba(0,184,210,${a*.82})`;
        else c.fillStyle=`rgba(242,242,248,${a})`;
        c.fill();
        projected.push({x:px,y:py,r,a,tint:p.tint,z});
      }

      // A subtle moving rim makes the torus read as a live 3D object.
      c.save();c.translate(cx,cy);c.rotate(roll*.7);
      c.strokeStyle='rgba(240,240,248,.075)';c.lineWidth=.7;
      c.beginPath();c.ellipse(0,0,scale*.92,scale*.26,0,0,TAU);c.stroke();
      c.restore();
      raf=requestAnimationFrame(draw);
    }

    function release(){
      if(dropped||!projected.length) return;
      dropped=true;cancelAnimationFrame(raf);

      const footerRect=footer.getBoundingClientRect();
      const objectRect=cv.getBoundingClientRect();
      const overlay=document.createElement('canvas');
      overlay.id='we-particle-rain-v5';
      Object.assign(overlay.style,{position:'absolute',inset:'0',width:'100%',height:'100%',zIndex:'3',pointerEvents:'none'});
      footer.appendChild(overlay);
      const q=overlay.getContext('2d',{alpha:true});
      if(!q)return;

      const d=Math.min(2,devicePixelRatio||1);
      const FW=Math.max(320,footer.clientWidth),FH=Math.max(700,footer.scrollHeight);
      overlay.width=Math.round(FW*d);overlay.height=Math.round(FH*d);q.setTransform(d,0,0,d,0,0);
      const ox=objectRect.left-footerRect.left,oy=objectRect.top-footerRect.top;
      const centerX=W*.5,centerY=H*.5;

      const particles=projected.map((p,i)=>{
        const dx=(p.x-centerX)/Math.max(220,W),dy=(p.y-centerY)/Math.max(180,H);
        return {
          x:ox+p.x,y:oy+p.y,
          vx:dx*(1.1+Math.random()*2.2)+(Math.random()-.5)*1.1,
          vy:dy*.7-1.8-Math.random()*2.4,
          g:.060+Math.random()*.080,
          r:p.r*(.72+Math.random()*.55),a:p.a*(.66+Math.random()*.34),tint:p.tint,
          floor:FH-3-Math.pow(Math.random(),2.55)*(14+Math.max(0,56-Math.abs((ox+p.x)-FW*.5)*.035)),
          settled:false
        };
      });

      cv.style.opacity='0';cv.style.pointerEvents='none';
      let last=performance.now();
      function fall(now){
        const dt=Math.min(2.3,(now-last)/16.67||1);last=now;q.clearRect(0,0,FW,FH);let moving=0;
        for(const p of particles){
          if(!p.settled){
            p.vy+=p.g*dt;p.vx*=.995;p.x+=p.vx*dt;p.y+=p.vy*dt;
            if(p.x<0){p.x=0;p.vx=Math.abs(p.vx)*.42}else if(p.x>FW){p.x=FW;p.vx=-Math.abs(p.vx)*.42}
            if(p.y>=p.floor){p.y=p.floor;p.vy=0;p.vx=0;p.settled=true}else moving++;
          }
          q.beginPath();q.arc(p.x,p.y,p.r,0,TAU);
          if(p.tint===1)q.fillStyle=`rgba(228,0,124,${p.a})`;
          else if(p.tint===2)q.fillStyle=`rgba(0,184,210,${p.a})`;
          else q.fillStyle=`rgba(242,242,248,${p.a})`;
          q.fill();
        }
        if(moving)requestAnimationFrame(fall);
      }
      requestAnimationFrame(fall);
    }

    cv.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();release()});
    phrase.addEventListener('click',e=>{if(!e.target.closest('a'))release()});
    addEventListener('resize',()=>{if(!dropped)place()},{passive:true});
    place();raf=requestAnimationFrame(draw);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
