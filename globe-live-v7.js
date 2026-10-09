(() => {
  'use strict';
  if (window.__WE_GLOBE_V15__) return;
  window.__WE_GLOBE_V15__ = true;

  const TAU = Math.PI * 2;
  const RAD = Math.PI / 180;
  const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
  const lerp = (a,b,t) => a + (b-a)*t;

  const HQ = { lat:25.6866, lng:-100.3161, city:'MONTERREY' };
  let visitor = null;
  let land = [];

  const vec = (lat,lng) => {
    const la=lat*RAD, lo=lng*RAD, c=Math.cos(la);
    return [c*Math.sin(lo), Math.sin(la), c*Math.cos(lo)];
  };
  const fromVec = v => {
    const m=Math.hypot(v[0],v[1],v[2])||1;
    const x=v[0]/m,y=v[1]/m,z=v[2]/m;
    return {lat:Math.asin(y)/RAD,lng:Math.atan2(x,z)/RAD};
  };
  const slerpLatLng = (a,b,t) => {
    const A=vec(a.lat,a.lng), B=vec(b.lat,b.lng);
    const d=clamp(A[0]*B[0]+A[1]*B[1]+A[2]*B[2],-1,1);
    const ang=Math.acos(d);
    if(ang<1e-5) return {lat:a.lat,lng:a.lng};
    const s=Math.sin(ang), wa=Math.sin((1-t)*ang)/s, wb=Math.sin(t*ang)/s;
    return fromVec([A[0]*wa+B[0]*wb,A[1]*wa+B[1]*wb,A[2]*wa+B[2]*wb]);
  };

  function rasterizeGeojson(data,mobile){
    const mw=mobile?600:900, mh=mw/2;
    const c=document.createElement('canvas'); c.width=mw; c.height=mh;
    const x=c.getContext('2d');
    x.fillStyle='#fff';
    const px=lon=>(lon+180)/360*mw;
    const py=lat=>(90-lat)/180*mh;
    const drawRing=ring=>{
      if(!ring||ring.length<3)return;
      x.moveTo(px(ring[0][0]),py(ring[0][1]));
      for(let i=1;i<ring.length;i++)x.lineTo(px(ring[i][0]),py(ring[i][1]));
      x.closePath();
    };
    for(const f of data.features||[]){
      const g=f.geometry;if(!g)continue;
      x.beginPath();
      if(g.type==='Polygon') for(const r of g.coordinates) drawRing(r);
      else if(g.type==='MultiPolygon') for(const p of g.coordinates) for(const r of p) drawRing(r);
      x.fill('evenodd');
    }
    const img=x.getImageData(0,0,mw,mh).data;
    const step=mobile?4:4;
    const pts=[];
    for(let yy=step/2;yy<mh;yy+=step){
      for(let xx=step/2;xx<mw;xx+=step){
        if(img[((yy|0)*mw+(xx|0))*4+3] > 80){
          const lon=xx/mw*360-180;
          const lat=90-yy/mh*180;
          pts.push([lon,lat]);
        }
      }
    }
    return pts;
  }

  async function getVisitor(){
    const withTimeout=(url,ms=2200)=>{
      const ac=new AbortController(); const id=setTimeout(()=>ac.abort(),ms);
      return fetch(url,{cache:'no-store',signal:ac.signal}).then(r=>{clearTimeout(id);if(!r.ok)throw 0;return r.json()});
    };
    try{
      const d=await withTimeout('https://ipapi.co/json/');
      const lat=+d.latitude,lng=+d.longitude;
      if(Number.isFinite(lat)&&Number.isFinite(lng)) return {lat,lng,city:d.city||d.region||d.country_name||'ONLINE'};
    }catch{}
    try{
      const d=await withTimeout('https://ipwho.is/');
      const lat=+d.latitude,lng=+d.longitude;
      if(d.success!==false&&Number.isFinite(lat)&&Number.isFinite(lng)) return {lat,lng,city:d.city||d.region||d.country||'ONLINE'};
    }catch{}
    return {lat:-23.5505,lng:-46.6333,city:'SÃO PAULO'};
  }

  function boot(){
    const hero=document.querySelector('[data-hero-section="true"]');
    if(!hero) return setTimeout(boot,160);

    ['we-globe-interactive-v13','we-globe-original-v15','we-globe-live-v6','we-globe-fallback'].forEach(id=>document.getElementById(id)?.remove());

    const layer=document.createElement('div');
    layer.id='we-globe-original-v15';
    layer.setAttribute('aria-hidden','true');
    Object.assign(layer.style,{position:'absolute',left:'0',width:'100%',height:'min(960px,100svh)',minHeight:'610px',zIndex:'8',pointerEvents:'none',overflow:'hidden'});

    const canvas=document.createElement('canvas');
    Object.assign(canvas.style,{position:'absolute',inset:'0',width:'100%',height:'100%',pointerEvents:'none'});
    layer.appendChild(canvas);

    const hit=document.createElement('div');
    Object.assign(hit.style,{position:'absolute',borderRadius:'50%',pointerEvents:'auto',touchAction:'none',cursor:'grab',background:'transparent'});
    layer.appendChild(hit);
    document.body.appendChild(layer);

    const ctx=canvas.getContext('2d',{alpha:true});
    if(!ctx){layer.remove();return;}

    let W=0,H=0,D=1,R=0,cx=0,cy=0;
    let yaw=0, pitch=-8*RAD;
    let drag=false,lx=0,ly=0,vx=0,vy=0;
    let last=performance.now(), raf=0, visible=true;
    let auto=0;

    const principal=()=>visitor||{lat:-23.5505,lng:-46.6333,city:'SÃO PAULO'};

    function sync(){
      const r=hero.getBoundingClientRect();
      layer.style.top=(scrollY+r.top)+'px';
    }
    function resize(){
      sync();
      W=Math.max(320,innerWidth); H=Math.max(610,Math.min(960,innerHeight));
      D=Math.min(devicePixelRatio||1,W<760?1.35:1.7);
      const mobile=W<760;
      R=mobile?Math.min(W*.305,150):Math.min(W*.185,H*.305,280);
      cx=W*.5; cy=mobile?Math.min(H*.30,235):H*.445;
      canvas.width=Math.round(W*D);canvas.height=Math.round(H*D);
      ctx.setTransform(D,0,0,D,0,0);
      const p=R*.16;
      Object.assign(hit.style,{left:(cx-R-p)+'px',top:(cy-R-p)+'px',width:(2*(R+p))+'px',height:(2*(R+p))+'px'});
    }

    function project(lon,lat){
      const la=lat*RAD;
      const desired=visitor ? (18*RAD - visitor.lng*RAD) : 46*RAD;
      const lo=lon*RAD + desired + yaw + auto;
      const c=Math.cos(la);
      const X=c*Math.sin(lo), Z=c*Math.cos(lo), Y=-Math.sin(la);
      const cp=Math.cos(pitch), sp=Math.sin(pitch);
      const y=Y*cp-Z*sp, z=Y*sp+Z*cp;
      return {x:cx+X*R,y:cy+y*R,z};
    }

    function drawSphere(){
      const bg=ctx.createRadialGradient(cx-R*.30,cy-R*.40,R*.05,cx,cy,R*1.10);
      bg.addColorStop(0,'rgba(52,52,58,.20)');
      bg.addColorStop(.58,'rgba(14,14,16,.56)');
      bg.addColorStop(1,'rgba(2,2,3,.82)');
      ctx.fillStyle=bg;ctx.beginPath();ctx.arc(cx,cy,R,0,TAU);ctx.fill();

      const halo=ctx.createRadialGradient(cx,cy,R*.86,cx,cy,R*1.18);
      halo.addColorStop(0,'rgba(255,255,255,0)');
      halo.addColorStop(.72,'rgba(240,240,248,.035)');
      halo.addColorStop(1,'rgba(240,240,248,0)');
      ctx.fillStyle=halo;ctx.beginPath();ctx.arc(cx,cy,R*1.18,0,TAU);ctx.fill();

      ctx.save();ctx.beginPath();ctx.arc(cx,cy,R-.5,0,TAU);ctx.clip();
      for(const p of land){
        const q=project(p[0],p[1]);
        if(q.z<=.01)continue;
        const z=clamp(q.z,0,1);
        const rr=.45+z*.78;
        ctx.beginPath();ctx.arc(q.x,q.y,rr,0,TAU);
        ctx.fillStyle=`rgba(238,238,244,${.16+z*.82})`;ctx.fill();
      }
      ctx.restore();

      ctx.beginPath();ctx.arc(cx,cy,R+.2,0,TAU);
      ctx.lineWidth=.7;ctx.strokeStyle='rgba(245,245,250,.18)';ctx.stroke();

      ctx.beginPath();ctx.arc(cx,cy,R-1.5,208*RAD,332*RAD);
      ctx.lineWidth=2.1;ctx.strokeStyle='rgba(255,255,255,.55)';ctx.stroke();
      ctx.beginPath();ctx.arc(cx,cy,R-3.2,220*RAD,305*RAD);
      ctx.lineWidth=.8;ctx.strokeStyle='rgba(255,255,255,.48)';ctx.stroke();
    }

    function ellipse(rx,ry,ang,alpha,shift=0){
      ctx.save();ctx.translate(cx,cy);ctx.rotate(ang);ctx.beginPath();ctx.ellipse(0,shift,rx,ry,0,0,TAU);
      ctx.lineWidth=.55;ctx.strokeStyle=`rgba(225,225,234,${alpha})`;ctx.stroke();ctx.restore();
    }
    function drawOrbits(){
      ellipse(R*1.20,R*.36,-.18,.13);
      ellipse(R*1.17,R*.23,.33,.11);
      ellipse(R*1.10,R*.51,.08,.08);
      ellipse(R*1.23,R*.18,-.52,.09,R*.04);
      ellipse(R*1.14,R*.42,.67,.07,-R*.02);
      ellipse(R*1.06,R*.61,-.78,.055);
      ellipse(R*1.25,R*.30,.96,.06);
    }

    function drawRoute(){
      const target=principal();
      const pts=[];
      for(let i=0;i<=50;i++){
        const p=slerpLatLng(HQ,target,i/50);
        const q=project(p.lng,p.lat);
        pts.push(q);
      }
      ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
      ctx.beginPath();let open=false;
      for(const q of pts){
        if(q.z<-.03){open=false;continue;}
        if(!open){ctx.moveTo(q.x,q.y);open=true;}else ctx.lineTo(q.x,q.y);
      }
      ctx.lineWidth=1.05;ctx.strokeStyle='rgba(228,0,124,.72)';ctx.stroke();ctx.restore();
    }

    function drawNodeAndLabel(now){
      const t=principal(); const p=project(t.lng,t.lat);
      if(p.z<-.05)return;
      const pulse=.5+.5*Math.sin(now*.0035);
      ctx.beginPath();ctx.arc(p.x,p.y,5+pulse*5,0,TAU);ctx.fillStyle=`rgba(228,0,124,${.08+.05*pulse})`;ctx.fill();
      ctx.beginPath();ctx.arc(p.x,p.y,3.2,0,TAU);ctx.fillStyle='#e4007c';ctx.fill();

      const mobile=W<760;
      const label='ONLINE · '+String(t.city||'ONLINE').toUpperCase();
      ctx.font=(mobile?'9px':'10px')+' ui-monospace,SFMono-Regular,Menlo,monospace';
      const tw=ctx.measureText(label).width, bw=tw+31, bh=22;
      let x=p.x+12,y=p.y-31;
      if(x+bw>W-8)x=p.x-bw-12;
      if(y<8)y=p.y+12;
      ctx.beginPath();ctx.roundRect(x,y,bw,bh,11);
      ctx.fillStyle='rgba(18,18,20,.91)';ctx.fill();
      ctx.strokeStyle='rgba(255,255,255,.12)';ctx.lineWidth=.65;ctx.stroke();
      ctx.beginPath();ctx.arc(x+11,y+11,2.8,0,TAU);ctx.fillStyle='#e4007c';ctx.fill();
      ctx.textBaseline='middle';ctx.fillStyle='rgba(235,235,242,.70)';ctx.fillText(label,x+20,y+11.2);
    }

    function draw(now){
      raf=0;if(!visible||document.hidden)return;
      const dt=Math.min(40,now-last);last=now;
      if(!drag){
        yaw+=vx; pitch=clamp(pitch+vy,-28*RAD,22*RAD);
        vx*=.94;vy*=.90;
        if(Math.abs(vx)<.00002)vx=0;if(Math.abs(vy)<.00002)vy=0;
        if(!vx)auto += dt*.000012;
      }
      ctx.setTransform(D,0,0,D,0,0);ctx.clearRect(0,0,W,H);
      drawOrbits();drawSphere();drawRoute();drawNodeAndLabel(now);
      raf=requestAnimationFrame(draw);
    }

    hit.addEventListener('pointerdown',e=>{
      drag=true;lx=e.clientX;ly=e.clientY;vx=vy=0;hit.style.cursor='grabbing';hit.setPointerCapture?.(e.pointerId);
    });
    hit.addEventListener('pointermove',e=>{
      if(!drag)return;
      const dx=e.clientX-lx,dy=e.clientY-ly;lx=e.clientX;ly=e.clientY;
      const sx=dx*.0060, sy=dy*.0038;
      yaw+=sx;pitch=clamp(pitch+sy,-28*RAD,22*RAD);vx=sx*.28;vy=sy*.22;
    });
    const release=e=>{if(!drag)return;drag=false;hit.style.cursor='grab';try{hit.releasePointerCapture?.(e.pointerId)}catch{}};
    hit.addEventListener('pointerup',release);hit.addEventListener('pointercancel',release);

    const io=new IntersectionObserver(es=>{visible=!!es[0]?.isIntersecting;if(visible&&!raf){last=performance.now();raf=requestAnimationFrame(draw)}},{rootMargin:'160px 0px'});
    io.observe(layer);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden&&visible&&!raf){last=performance.now();raf=requestAnimationFrame(draw)}});
    addEventListener('resize',()=>{resize()},{passive:true});

    resize();
    raf=requestAnimationFrame(draw);

    Promise.all([
      fetch('/data/ne_110m_admin_0_countries.geojson',{cache:'force-cache'}).then(r=>r.ok?r.json():Promise.reject()).then(d=>{land=rasterizeGeojson(d,W<760)}).catch(()=>{}),
      getVisitor().then(v=>{visitor=v})
    ]).catch(()=>{});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
