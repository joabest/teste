(() => {
  'use strict';
  if (window.__WE_PARTICLE_OBJECT__) return;
  window.__WE_PARTICLE_OBJECT__ = true;
  function boot() {
    const phrase=document.querySelector('[data-footer-phrase="true"]');
    if(!phrase) return setTimeout(boot,300);
    const section=phrase.closest('section')||phrase.parentElement;
    if(!section||section.querySelector('#we-particle-object')) return;
    section.style.position='relative'; phrase.style.position='relative'; phrase.style.zIndex='2';
    const cv=document.createElement('canvas'); cv.id='we-particle-object'; cv.title='Click to disperse particles';
    Object.assign(cv.style,{position:'absolute',width:'min(48vw,680px)',height:'min(42vw,500px)',right:'1%',top:'50%',transform:'translateY(-50%)',zIndex:'1',cursor:'pointer',pointerEvents:'auto',opacity:'.88'});
    section.appendChild(cv); const c=cv.getContext('2d',{alpha:true,desynchronized:true}); if(!c)return;
    let W=0,H=0,D=1,raf=0,t0=performance.now(),gone=false,visible=false,lastFrame=0;
    const FRAME_MS=1000/30;
    const pts=[]; for(let u=0;u<48;u++)for(let v=0;v<18;v++)pts.push([u/48*Math.PI*2,v/18*Math.PI*2]);
    function size(){const r=cv.getBoundingClientRect();W=Math.max(260,r.width);H=Math.max(200,r.height);D=Math.min(1.5,devicePixelRatio||1);cv.width=Math.round(W*D);cv.height=Math.round(H*D);c.setTransform(D,0,0,D,0,0)}
    function rot(x,y,z,ay,ax){let cy=Math.cos(ay),sy=Math.sin(ay),cx=Math.cos(ax),sx=Math.sin(ax),X=cy*x+sy*z,Z=-sy*x+cy*z,Y=cx*y-sx*Z;Z=sx*y+cx*Z;return[X,Y,Z]}
    function draw(now){
      raf=0;
      if(gone||!visible||document.hidden)return;
      if(now-lastFrame<FRAME_MS){raf=requestAnimationFrame(draw);return}
      lastFrame=now;
      c.clearRect(0,0,W,H);const tt=(now-t0)*.0003,cx=W*.55,cy=H*.52,sc=Math.min(W,H)*.30;
      for(const p of pts){let u=p[0],v=p[1],R=1,r=.37,x=(R+r*Math.cos(v))*Math.cos(u),y=r*Math.sin(v),z=(R+r*Math.cos(v))*Math.sin(u);[x,y,z]=rot(x,y,z,tt,-.32+Math.sin(tt*.8)*.07);let dep=(z+1.45)/2.9,px=cx+x*sc,py=cy+y*sc;c.beginPath();c.arc(px,py,.6+dep*1.2,0,Math.PI*2);c.fillStyle=`rgba(240,240,248,${.10+Math.max(0,dep)*.58})`;c.fill()}
      raf=requestAnimationFrame(draw)
    }
    function start(){if(gone||!visible||document.hidden||raf)return;lastFrame=0;raf=requestAnimationFrame(draw)}
    function stop(){if(raf){cancelAnimationFrame(raf);raf=0}}
    function explode(){
      if(gone)return;gone=true;stop();cv.style.opacity='0';
      const ov=document.createElement('canvas');ov.id='we-particle-rain';Object.assign(ov.style,{position:'fixed',inset:'0',width:'100vw',height:'100vh',zIndex:'30',pointerEvents:'none'});document.body.appendChild(ov);
      const q=ov.getContext('2d'),d=Math.min(1.5,devicePixelRatio||1),w=innerWidth,h=innerHeight;ov.width=Math.round(w*d);ov.height=Math.round(h*d);q.setTransform(d,0,0,d,0,0);
      const r=cv.getBoundingClientRect(),ox=r.left+r.width*.55,oy=r.top+r.height*.52;
      const ps=Array.from({length:620},()=>{const a=Math.random()*Math.PI*2,s=1.5+Math.random()*9;return{x:ox+(Math.random()-.5)*120,y:oy+(Math.random()-.5)*85,vx:Math.cos(a)*s+(Math.random()-.5)*2,vy:Math.sin(a)*s-3-Math.random()*5,g:.055+Math.random()*.09,r:.5+Math.random()*1.7,a:.35+Math.random()*.65,life:1}});
      const born=performance.now();let lastFall=0;
      function fall(now){
        if(now-lastFall<1000/45){requestAnimationFrame(fall);return}lastFall=now;
        q.clearRect(0,0,w,h);let alive=0;
        for(const p of ps){p.vy+=p.g;p.vx*=.997;p.x+=p.vx;p.y+=p.vy;p.life-=.0027;if(p.y>h+30||p.life<=0)continue;alive++;q.beginPath();q.arc(p.x,p.y,p.r,0,Math.PI*2);q.fillStyle=`rgba(240,240,248,${p.a*p.life})`;q.fill()}
        if(alive&&now-born<7200)requestAnimationFrame(fall);else{ov.remove();gone=false;cv.style.opacity='.88';t0=performance.now();start()}
      }
      requestAnimationFrame(fall)
    }
    cv.addEventListener('click',explode);phrase.addEventListener('click',e=>{if(!e.target.closest('a'))explode()});
    addEventListener('resize',()=>{size();if(visible&&!gone){c.clearRect(0,0,W,H);start()}},{passive:true});
    document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else start()},{passive:true});
    const io=new IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting);if(visible)start();else stop()},{rootMargin:'180px 0px'});
    io.observe(section);
    size();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();