(() => {
  'use strict';
  if (window.__WE_ORIGINAL_GLOBE_V18__) return;
  window.__WE_ORIGINAL_GLOBE_V18__ = true;

  const TAU = Math.PI * 2;
  const RAD = Math.PI / 180;
  const clamp = (v,a,b) => Math.max(a, Math.min(b,v));
  const ACCENT = '#e4007c';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let visitor = { lat: -23.5505, lng: -46.6333, city: 'SÃO PAULO' };
  let land = [];

  function latLngVec(lat,lng){
    const la=lat*RAD, lo=lng*RAD, c=Math.cos(la);
    return [c*Math.sin(lo), Math.sin(la), c*Math.cos(lo)];
  }

  async function json(url, timeout=2200){
    const c=new AbortController();
    const t=setTimeout(()=>c.abort(), timeout);
    try{
      const r=await fetch(url,{cache:'no-store',signal:c.signal});
      if(!r.ok) throw new Error(String(r.status));
      return await r.json();
    } finally { clearTimeout(t); }
  }

  async function loadVisitor(){
    try{
      const d=await json('https://ipapi.co/json/');
      if(Number.isFinite(+d.latitude)&&Number.isFinite(+d.longitude)){
        visitor={lat:+d.latitude,lng:+d.longitude,city:String(d.city||'ONLINE').toUpperCase()};
        return;
      }
    }catch(_){ }
    try{
      const d=await json('https://ipwho.is/');
      if(d.success!==false&&Number.isFinite(+d.latitude)&&Number.isFinite(+d.longitude)){
        visitor={lat:+d.latitude,lng:+d.longitude,city:String(d.city||'ONLINE').toUpperCase()};
      }
    }catch(_){ }
  }

  function rings(g){
    if(!g) return [];
    if(g.type==='Polygon') return g.coordinates;
    if(g.type==='MultiPolygon') return g.coordinates.flat();
    return [];
  }

  function rasterize(data){
    const mw=innerWidth<768?720:1080, mh=mw/2;
    const mask=document.createElement('canvas');
    mask.width=mw; mask.height=mh;
    const m=mask.getContext('2d');
    if(!m) return [];
    m.fillStyle='#fff';
    const px=lon=>(lon+180)/360*mw;
    const py=lat=>(90-lat)/180*mh;
    for(const f of data.features||[]){
      for(const ring of rings(f.geometry)){
        if(!ring||ring.length<3) continue;
        m.beginPath();
        let started=false, last=ring[0];
        for(const p of ring){
          if(started&&Math.abs(p[0]-last[0])>180){ started=false; last=p; continue; }
          if(!started){ m.moveTo(px(p[0]),py(p[1])); started=true; }
          else m.lineTo(px(p[0]),py(p[1]));
          last=p;
        }
        m.closePath(); m.fill();
      }
    }
    const img=m.getImageData(0,0,mw,mh).data;
    const out=[];
    const step=innerWidth<768?5.8:4.7;
    for(let y=step*.5;y<mh;y+=step){
      for(let x=step*.5;x<mw;x+=step){
        if(img[((y|0)*mw+(x|0))*4+3]>90) out.push([x/mw*360-180,90-y/mh*180]);
      }
    }
    return out;
  }

  async function loadLand(){
    try{
      const r=await fetch('/data/ne_110m_admin_0_countries.geojson',{cache:'force-cache'});
      if(!r.ok) throw new Error('geo');
      land=rasterize(await r.json());
    }catch(_){
      try{
        const raw=(await fetch('/globe-land-v4.dat',{cache:'force-cache'}).then(r=>r.ok?r.text():Promise.reject())).trim();
        const bytes=Uint8Array.from(atob(raw),c=>c.charCodeAt(0));
        const view=new DataView(bytes.buffer);
        const pts=[];
        for(let i=0;i+3<bytes.length;i+=4){
          pts.push([view.getUint16(i,false)/65535*360-180,view.getUint16(i+2,false)/65535*180-90]);
        }
        land=pts;
      }catch(__){ land=[]; }
    }
  }

  function boot(){
    const hero=document.querySelector('[data-hero-section="true"]');
    if(!hero) return setTimeout(boot,120);

    const oldIds=[
      'we-globe-layer-v3','we-globe-layer-v4','we-globe-v4','we-custom-globe-v3',
      'we-globe-interactive-v13','we-globe-original-v15','we-globe-original-v16',
      'we-globe-flow-v17','we-globe-live-v5','we-globe-live-v6','we-globe-fallback',
      'we-original-globe-v18'
    ];
    oldIds.forEach(id=>document.getElementById(id)?.remove());

    let guard=document.getElementById('we-globe-v18-guard');
    if(!guard){
      guard=document.createElement('style');
      guard.id='we-globe-v18-guard';
      guard.textContent='#we-globe-layer-v3,#we-globe-layer-v4,#we-custom-globe-v3,#we-globe-interactive-v13,#we-globe-original-v15,#we-globe-original-v16,#we-globe-flow-v17,#we-globe-live-v5,#we-globe-live-v6,#we-globe-fallback{display:none!important}';
      document.head.appendChild(guard);
    }

    if(getComputedStyle(hero).position==='static') hero.style.position='relative';

    const layer=document.createElement('div');
    layer.id='we-original-globe-v18';
    layer.setAttribute('aria-hidden','true');
    Object.assign(layer.style,{
      position:'absolute',left:'0',right:'0',top:'0',height:'min(720px,72svh)',
      zIndex:'8',pointerEvents:'none',overflow:'visible'
    });

    const wrap=document.createElement('div');
    Object.assign(wrap.style,{
      position:'absolute',left:'50%',top:'92px',transform:'translateX(-50%)',
      width:'min(520px,44vw,58vh)',height:'min(520px,44vw,58vh)',
      minWidth:'390px',minHeight:'390px',pointerEvents:'auto',touchAction:'none',
      cursor:'grab',overflow:'visible'
    });

    const canvas=document.createElement('canvas');
    Object.assign(canvas.style,{
      position:'absolute',inset:'0',width:'100%',height:'100%',display:'block',
      opacity:'0',transition:'opacity .7s cubic-bezier(.16,1,.3,1)'
    });
    wrap.appendChild(canvas); layer.appendChild(wrap); hero.prepend(layer);

    const style=document.createElement('style');
    style.textContent=`
      @media(max-width:767px){
        #we-original-globe-v18{height:300px!important}
        #we-original-globe-v18>div{width:238px!important;height:238px!important;min-width:238px!important;min-height:238px!important;top:34px!important}
      }
      @media(min-width:768px) and (max-width:1100px){
        #we-original-globe-v18>div{width:410px!important;height:410px!important;min-width:410px!important;min-height:410px!important;top:78px!important}
      }
    `;
    document.head.appendChild(style);

    const ctx=canvas.getContext('2d',{alpha:true,desynchronized:true});
    if(!ctx) return;
    const S=600,CX=300,CY=300,R=226;
    let dpr=1, visible=true;
    let yaw=-visitor.lng*RAD, pitch=clamp(visitor.lat*RAD,-.52,.52);
    let targetYaw=yaw,targetPitch=pitch;
    let dragging=false,lastX=0,lastY=0,velX=0,velY=0;
    let lastT=performance.now();

    function resize(){
      dpr=Math.min(devicePixelRatio||1,2);
      canvas.width=Math.round(S*dpr); canvas.height=Math.round(S*dpr);
      ctx.setTransform(dpr,0,0,dpr,0,0);
    }
    resize();

    function project(lat,lng,rad=R){
      let [x,y,z]=latLngVec(lat,lng);
      const cy=Math.cos(yaw),sy=Math.sin(yaw);
      const x1=x*cy+z*sy, z1=-x*sy+z*cy;
      const cp=Math.cos(pitch),sp=Math.sin(pitch);
      const y2=y*cp-z1*sp, z2=y*sp+z1*cp;
      return {x:CX+x1*rad,y:CY-y2*rad,z:z2};
    }

    function orbit(angle,flat,offset,alpha){
      ctx.save(); ctx.translate(CX,CY); ctx.rotate(angle);
      ctx.beginPath(); ctx.ellipse(0,offset,R*1.07,R*flat,0,0,TAU);
      ctx.strokeStyle=`rgba(240,240,248,${alpha})`; ctx.lineWidth=.55; ctx.stroke(); ctx.restore();
    }

    function sphere(){
      ctx.clearRect(0,0,S,S);

      const aura=ctx.createRadialGradient(CX,CY,R*.55,CX,CY,R*1.20);
      aura.addColorStop(0,'rgba(240,240,248,.012)');
      aura.addColorStop(.75,'rgba(240,240,248,.006)');
      aura.addColorStop(1,'rgba(240,240,248,0)');
      ctx.fillStyle=aura; ctx.beginPath(); ctx.arc(CX,CY,R*1.2,0,TAU); ctx.fill();

      // Fine orbital wires, as in the reference.
      orbit(-.73,.19,-R*.03,.055); orbit(-.58,.28,R*.07,.065);
      orbit(-.37,.35,-R*.10,.050); orbit(-.18,.14,R*.14,.042);
      orbit(.08,.27,-R*.04,.055); orbit(.27,.19,R*.08,.050);
      orbit(.46,.31,-R*.12,.045); orbit(.67,.22,R*.03,.050);

      // Transparent glass body: no opaque black disc.
      const glass=ctx.createRadialGradient(CX-R*.32,CY-R*.36,R*.03,CX,CY,R);
      glass.addColorStop(0,'rgba(255,255,255,.035)');
      glass.addColorStop(.38,'rgba(255,255,255,.008)');
      glass.addColorStop(.78,'rgba(255,255,255,0)');
      glass.addColorStop(1,'rgba(255,255,255,.012)');
      ctx.fillStyle=glass; ctx.beginPath(); ctx.arc(CX,CY,R,0,TAU); ctx.fill();

      ctx.save(); ctx.beginPath(); ctx.arc(CX,CY,R-1,0,TAU); ctx.clip();
      for(const p of land){
        const q=project(p[1],p[0]);
        if(q.z<-.02) continue;
        const depth=clamp((q.z+.02)/1.02,0,1);
        const edge=clamp((1-Math.hypot(q.x-CX,q.y-CY)/R)*5.2,.16,1);
        const a=(.18+depth*.72)*edge;
        const size=.52+depth*.62;
        ctx.fillStyle=`rgba(240,240,248,${a})`;
        ctx.beginPath(); ctx.arc(q.x,q.y,size,0,TAU); ctx.fill();
      }
      ctx.restore();

      // Latitude/longitude guide rings kept extremely subtle.
      ctx.save();
      ctx.strokeStyle='rgba(240,240,248,.045)'; ctx.lineWidth=.48;
      for(const rr of [.33,.66]){ ctx.beginPath(); ctx.ellipse(CX,CY,R,R*rr,0,0,TAU); ctx.stroke(); }
      ctx.beginPath(); ctx.ellipse(CX,CY,R*.34,R,0,0,TAU); ctx.stroke();
      ctx.restore();

      // Hairline sphere rim.
      ctx.save();
      ctx.beginPath(); ctx.arc(CX,CY,R,0,TAU);
      ctx.strokeStyle='rgba(240,240,248,.18)'; ctx.lineWidth=.75; ctx.stroke();
      ctx.beginPath(); ctx.arc(CX,CY,R+2.2,0,TAU);
      ctx.strokeStyle='rgba(240,240,248,.035)'; ctx.lineWidth=1.1; ctx.stroke();
      ctx.restore();

      drawVisitor();
    }

    function drawVisitor(){
      const p=project(visitor.lat,visitor.lng);
      if(p.z<-.05) return;
      const q=project(visitor.lat,visitor.lng,R*1.035);

      // Thin magenta pointer from the actual geographic point.
      ctx.save();
      ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y);
      ctx.strokeStyle='rgba(228,0,124,.78)'; ctx.lineWidth=.8; ctx.stroke();
      ctx.beginPath(); ctx.arc(q.x,q.y,3.2,0,TAU);
      ctx.fillStyle=ACCENT; ctx.shadowColor=ACCENT; ctx.shadowBlur=10; ctx.fill();
      ctx.shadowBlur=0;

      const text='ONLINE · '+visitor.city;
      ctx.font='9px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace';
      ctx.textBaseline='middle';
      const tw=ctx.measureText(text).width, bw=tw+28,bh=22;
      let lx=q.x+10, ly=q.y-bh*.5;
      if(lx+bw>S-12) lx=q.x-bw-10;
      ly=clamp(ly,10,S-bh-10);
      ctx.beginPath(); ctx.roundRect(lx,ly,bw,bh,11);
      ctx.fillStyle='rgba(18,18,20,.93)'; ctx.fill();
      ctx.strokeStyle='rgba(240,240,248,.11)'; ctx.lineWidth=.65; ctx.stroke();
      ctx.beginPath(); ctx.arc(lx+10,ly+bh/2,2.9,0,TAU);
      ctx.fillStyle=ACCENT; ctx.fill();
      ctx.fillStyle='rgba(240,240,248,.62)';
      ctx.fillText(text,lx+18,ly+bh/2+.2);
      ctx.restore();
    }

    function frame(t){
      requestAnimationFrame(frame);
      if(!visible||document.hidden) return;
      const dt=Math.min(40,t-lastT); lastT=t;
      if(!dragging){
        if(!reduced) targetYaw += dt*.000020;
        yaw += (targetYaw-yaw)*.055;
        pitch += (targetPitch-pitch)*.055;
        yaw += velX; pitch=clamp(pitch+velY,-.68,.68);
        velX*=.93; velY*=.90;
      }
      sphere();
    }

    function down(e){ dragging=true; lastX=e.clientX; lastY=e.clientY; velX=velY=0; wrap.style.cursor='grabbing'; try{wrap.setPointerCapture(e.pointerId)}catch(_){} }
    function move(e){
      if(!dragging) return;
      const dx=e.clientX-lastX,dy=e.clientY-lastY; lastX=e.clientX; lastY=e.clientY;
      const sx=dx*.0062, sy=dy*.0054;
      yaw+=sx; pitch=clamp(pitch-sy,-.68,.68); targetYaw=yaw; targetPitch=pitch;
      velX=sx*.18; velY=-sy*.12;
    }
    function up(e){ dragging=false; wrap.style.cursor='grab'; try{wrap.releasePointerCapture(e.pointerId)}catch(_){} }
    wrap.addEventListener('pointerdown',down);
    wrap.addEventListener('pointermove',move);
    wrap.addEventListener('pointerup',up);
    wrap.addEventListener('pointercancel',up);

    const io=new IntersectionObserver(es=>visible=!!es[0]?.isIntersecting,{rootMargin:'180px'});
    io.observe(hero);
    addEventListener('resize',resize,{passive:true});

    Promise.allSettled([loadLand(),loadVisitor()]).then(()=>{
      targetYaw=-visitor.lng*RAD;
      targetPitch=clamp(visitor.lat*RAD,-.52,.52);
      yaw=targetYaw; pitch=targetPitch;
      requestAnimationFrame(()=>canvas.style.opacity='1');
    });
    setTimeout(()=>{ if(canvas.style.opacity!=='1') canvas.style.opacity='1'; },900);
    requestAnimationFrame(frame);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
