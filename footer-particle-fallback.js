(() => {
  'use strict';
  if (window.__WE_PARTICLE_V5__) return;
  window.__WE_PARTICLE_V5__ = true;

  const TAU = Math.PI * 2;
  const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));

  function boot(){
    const phrase = document.querySelector('[data-footer-phrase="true"]');
    const footer = document.querySelector('[data-footer-section="true"]');
    const mobileAnchor = document.querySelector('[data-torus-mobile-anchor="true"]');
    if(!phrase || !footer) return setTimeout(boot,180);

    ['we-particle-object','we-particle-object-v3','we-particle-object-v4','we-particle-object-v5','we-particle-rain','we-particle-rain-v3','we-particle-rain-v4','we-particle-rain-v5']
      .forEach(id=>document.getElementById(id)?.remove());

    const section = phrase.closest('section') || phrase.parentElement;
    section.style.position='relative';
    section.style.overflow='visible';
    footer.style.position='relative';
    phrase.style.position='relative';
    phrase.style.zIndex='4';

    const cv=document.createElement('canvas');
    cv.id='we-particle-object-v5';
    cv.title='Click to release the particles';
    cv.setAttribute('aria-label','Interactive particle torus');
    Object.assign(cv.style,{
      position:'absolute',zIndex:'1',cursor:'pointer',pointerEvents:'auto',opacity:'1',
      transition:'opacity 280ms ease',touchAction:'pan-y',filter:'none'
    });
    const c=cv.getContext('2d',{alpha:true});
    if(!c) return;

    let W=0,H=0,D=1,raf=0,t0=performance.now(),dropped=false,isMobile=false,projected=[];
    const N=1650;
    const pts=Array.from({length:N},(_,i)=>{
      const u=((i*.618033988749895)%1)*TAU;
      const v=((i*.754877666246693)%1)*TAU;
      const tube=.255*(1+.035*Math.sin(i*.19));
      const ring=1+tube*Math.cos(v);
      return {x:ring*Math.cos(u),y:tube*Math.sin(v),z:ring*Math.sin(u),seed:(i%97)/97,tint:i%67===0?1:(i%131===0?2:0)};
    });

    function rotate3(x,y,z,ay,ax,az){
      let cy=Math.cos(ay),sy=Math.sin(ay),X=cy*x+sy*z,Z=-sy*x+cy*z,Y=y;
      let cx=Math.cos(ax),sx=Math.sin(ax),Y2=cx*Y-sx*Z,Z2=sx*Y+cx*Z;
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
          mobileAnchor.style.setProperty('height','235px','important');
          mobileAnchor.style.setProperty('overflow','visible','important');
        }
        Object.assign(cv.style,{width:'min(96vw,430px)',height:'235px',left:'50%',right:'auto',top:'50%',transform:'translate(-50%,-50%)'});
      } else {
        if(cv.parentElement!==section) section.appendChild(cv);
        Object.assign(cv.style,{width:'min(46vw,650px)',height:'min(31vw,420px)',left:'auto',right:'4%',top:'49%',transform:'translateY(-50%)'});
      }
      resize();
    }

    function resize(){
      const r=cv.getBoundingClientRect();
      W=Math.max(260,r.width||260); H=Math.max(210,r.height||210); D=Math.min(2,devicePixelRatio||1);
      cv.width=Math.round(W*D); cv.height=Math.round(H*D); c.setTransform(D,0,0,D,0,0);
    }

    function draw(now){
      if(dropped) return;
      c.clearRect(0,0,W,H);
      const t=(now-t0)*.00028;
      const cx=W*(isMobile?.5:.52), cy=H*.5;
      const scale=Math.min(W,H)*(isMobile?.40:.38);
      projected=[];

      const yaw=t*.82, pitch=.84+Math.sin(t*.45)*.06, roll=-.24+Math.sin(t*.37)*.05;
      for(let i=0;i<pts.length;i++){
        const p=pts[i];
        let [x,y,z]=rotate3(p.x,p.y,p.z,yaw,pitch,roll);
        const persp=1/(2.2-z*.20);
        const px=cx+x*scale*persp*1.46, py=cy+y*scale*persp*1.46;
        const depth=clamp((z+1.35)/2.7,0,1);
        const a=.07+depth*.50;
        const r=.32+depth*.66;
        c.beginPath(); c.arc(px,py,r,0,TAU);
        if(p.tint===1)c.fillStyle=`rgba(228,0,124,${a*.72})`;
        else if(p.tint===2)c.fillStyle=`rgba(0,184,210,${a*.55})`;
        else c.fillStyle=`rgba(240,240,248,${a})`;
        c.fill();
        projected.push({x:px,y:py,r,a,tint:p.tint});
      }

      c.save(); c.translate(cx,cy); c.rotate(roll*.55);
      c.strokeStyle='rgba(240,240,248,.035)'; c.lineWidth=.55;
      c.beginPath(); c.ellipse(0,0,scale*.88,scale*.205,0,0,TAU); c.stroke();
      c.restore();
      raf=requestAnimationFrame(draw);
    }

    function release(){
      if(dropped||!projected.length) return;
      dropped=true; cancelAnimationFrame(raf);

      const footerRect=footer.getBoundingClientRect(), objectRect=cv.getBoundingClientRect();
      const overlay=document.createElement('canvas');
      overlay.id='we-particle-rain-v5';
      Object.assign(overlay.style,{position:'absolute',inset:'0',width:'100%',height:'100%',zIndex:'2',pointerEvents:'none'});
      footer.appendChild(overlay);
      const q=overlay.getContext('2d',{alpha:true}); if(!q) return;

      const d=Math.min(2,devicePixelRatio||1), FW=Math.max(320,footer.clientWidth), FH=Math.max(700,footer.scrollHeight);
      overlay.width=Math.round(FW*d); overlay.height=Math.round(FH*d); q.setTransform(d,0,0,d,0,0);
      const ox=objectRect.left-footerRect.left, oy=objectRect.top-footerRect.top;
      const centerX=W*.5, centerY=H*.5;

      const particles=projected.map((p,i)=>{
        const dx=(p.x-centerX)/Math.max(180,W), dy=(p.y-centerY)/Math.max(150,H);
        return {
          x:ox+p.x,y:oy+p.y,
          vx:dx*(.75+Math.random()*1.5)+(Math.random()-.5)*.75,
          vy:dy*.45-1.2-Math.random()*1.6,
          g:.045+Math.random()*.055,
          r:p.r*(.66+Math.random()*.42),a:p.a*(.7+Math.random()*.3),tint:p.tint,
          fadeStart:FH*(.72+Math.random()*.12),done:false
        };
      });

      cv.style.opacity='0'; cv.style.pointerEvents='none';
      let last=performance.now();
      function fall(now){
        const dt=Math.min(2.2,(now-last)/16.67||1); last=now; q.clearRect(0,0,FW,FH);
        let moving=0;
        for(const p of particles){
          if(p.done) continue;
          p.vy+=p.g*dt; p.vx*=.997; p.x+=p.vx*dt; p.y+=p.vy*dt;
          if(p.x<0){p.x=0;p.vx=Math.abs(p.vx)*.3}else if(p.x>FW){p.x=FW;p.vx=-Math.abs(p.vx)*.3}
          if(p.y>p.fadeStart) p.a*=.975;
          if(p.y>FH+12 || p.a<.018){p.done=true;continue}
          moving++;
          q.beginPath();q.arc(p.x,p.y,p.r,0,TAU);
          if(p.tint===1)q.fillStyle=`rgba(228,0,124,${p.a})`;
          else if(p.tint===2)q.fillStyle=`rgba(0,184,210,${p.a})`;
          else q.fillStyle=`rgba(240,240,248,${p.a})`;
          q.fill();
        }
        if(moving)requestAnimationFrame(fall);
      }
      requestAnimationFrame(fall);
    }

    cv.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();release()});
    phrase.addEventListener('click',e=>{if(!e.target.closest('a'))release()});
    addEventListener('resize',()=>{if(!dropped)place()},{passive:true});
    place(); raf=requestAnimationFrame(draw);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
})();
