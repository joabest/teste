(() => {
  'use strict';
  if (window.__WE_GLOBE_V22__) return;
  window.__WE_GLOBE_V22__ = true;

  const TAU = Math.PI * 2;
  const RAD = Math.PI / 180;
  const PINK = '#e4007c';
  const clamp = (v,a,b) => Math.max(a, Math.min(b,v));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let visitor = { lat: -23.5505, lng: -46.6333, city: 'SÃO PAULO' };
  let land = [];

  const NODES = [
    { lat: 51.5074, lng: -0.1278 },      // London
    { lat: 25.6866, lng: -100.3161 },   // Monterrey
    { lat: 25.2048, lng: 55.2708 },     // Dubai
    { lat: 35.6762, lng: 139.6503 }     // Tokyo
  ];

  function latLngVec(lat,lng){
    const la=lat*RAD, lo=lng*RAD, c=Math.cos(la);
    return [c*Math.sin(lo), Math.sin(la), c*Math.cos(lo)];
  }

  async function getJSON(url, timeout=2200){
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
      const d=await getJSON('https://ipapi.co/json/');
      if(Number.isFinite(+d.latitude)&&Number.isFinite(+d.longitude)){
        visitor={lat:+d.latitude,lng:+d.longitude,city:String(d.city||'ONLINE').toUpperCase()};
        return;
      }
    }catch(_){ }
    try{
      const d=await getJSON('https://ipwho.is/');
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
    const step=innerWidth<768?5.6:4.6;
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
    }catch(_){ land=[]; }
  }

  function boot(){
    const hero=document.querySelector('[data-hero-section="true"]');
    if(!hero) return setTimeout(boot,120);

    [
      'we-globe-layer-v3','we-globe-layer-v4','we-custom-globe-v3','we-globe-interactive-v13',
      'we-globe-original-v15','we-globe-original-v16','we-globe-flow-v17','we-globe-live-v5',
      'we-globe-live-v6','we-globe-fallback','we-original-globe-v18','we-globe-v20','we-globe-v21','we-globe-v22'
    ].forEach(id=>document.getElementById(id)?.remove());

    const layer=document.createElement('div');
    layer.id='we-globe-v22';
    layer.setAttribute('aria-hidden','true');
    Object.assign(layer.style,{
      position:'absolute',left:'0',width:'100%',height:'800px',zIndex:'8',
      pointerEvents:'none',overflow:'visible'
    });

    const wrap=document.createElement('div');
    Object.assign(wrap.style,{
      position:'absolute',left:'50%',top:'42px',transform:'translateX(-50%) scale(1)',
      transformOrigin:'50% 50%',width:'min(700px,56vw,74vh)',height:'min(700px,56vw,74vh)',
      minWidth:'510px',minHeight:'510px',pointerEvents:'auto',touchAction:'none',
      cursor:'grab',overflow:'visible',willChange:'transform'
    });

    const canvas=document.createElement('canvas');
    Object.assign(canvas.style,{
      position:'absolute',inset:'0',width:'100%',height:'100%',display:'block',
      opacity:'0',transition:'opacity .45s ease'
    });
    wrap.appendChild(canvas); layer.appendChild(wrap); document.body.appendChild(layer);

    const style=document.createElement('style');
    style.textContent=`
      #we-globe-v22,#we-globe-v22 *{box-sizing:border-box!important}
      #we-globe-v22{overflow:visible!important;clip:auto!important;contain:none!important}
      #we-globe-v22>div{overflow:visible!important;clip:auto!important;contain:none!important}
      @media(max-width:767px){
        #we-globe-v22{height:380px!important}
        #we-globe-v22>div{width:310px!important;height:310px!important;min-width:310px!important;min-height:310px!important;top:10px!important}
      }
      @media(min-width:768px) and (max-width:1100px){
        #we-globe-v22>div{width:540px!important;height:540px!important;min-width:540px!important;min-height:540px!important;top:42px!important}
      }
    `;
    document.head.appendChild(style);

    const ctx=canvas.getContext('2d',{alpha:true,desynchronized:true});
    if(!ctx) return;

    const S=720,CX=360,CY=360,R=274;
    let dpr=1,visible=true;
    let yaw=0,pitch=0,targetYaw=0,targetPitch=0;
    let returning=true;
    let zoom=1;
    const pointers=new Map();
    let pinchStartDist=0,pinchStartZoom=1;
    let dragging=false,lastX=0,lastY=0;

    function syncPosition(){
      const r=hero.getBoundingClientRect();
      layer.style.top=(window.scrollY+r.top)+'px';
    }

    function homeAngles(){
      return { yaw:-visitor.lng*RAD, pitch:clamp(visitor.lat*RAD,-1.25,1.25) };
    }

    function centerOnVisitor(immediate=false){
      const h=homeAngles();
      targetYaw=h.yaw; targetPitch=h.pitch; returning=true;
      if(immediate){ yaw=targetYaw; pitch=targetPitch; }
    }

    function applyZoom(){
      wrap.style.transform=`translateX(-50%) scale(${zoom.toFixed(3)})`;
    }

    function resize(){
      dpr=Math.min(devicePixelRatio||1,2);
      canvas.width=Math.round(S*dpr); canvas.height=Math.round(S*dpr);
      ctx.setTransform(dpr,0,0,dpr,0,0);
      syncPosition(); applyZoom();
    }

    function project(lat,lng,rad=R){
      let [x,y,z]=latLngVec(lat,lng);
      const cy=Math.cos(yaw),sy=Math.sin(yaw);
      const x1=x*cy+z*sy, z1=-x*sy+z*cy;
      const cp=Math.cos(pitch),sp=Math.sin(pitch);
      const y2=y*cp-z1*sp, z2=y*sp+z1*cp;
      return {x:CX+x1*rad,y:CY-y2*rad,z:z2};
    }

    function drawNetwork(){
      const chain=[NODES[0],NODES[1],NODES[2],NODES[3],visitor];
      for(let i=0;i<4;i++){
        const a=project(chain[i].lat,chain[i].lng,R*1.015);
        const b=project(chain[i+1].lat,chain[i+1].lng,R*1.015);
        const mx=(a.x+b.x)/2,my=(a.y+b.y)/2;
        let vx=mx-CX,vy=my-CY;
        const len=Math.hypot(vx,vy)||1; vx/=len; vy/=len;
        const chord=Math.hypot(b.x-a.x,b.y-a.y);
        const lift=20+chord*.15;
        const cpx=mx+vx*lift,cpy=my+vy*lift;
        const pink=i===3;
        const vis=clamp((a.z+b.z+1.1)/2.1,.18,1);
        ctx.save();
        ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.quadraticCurveTo(cpx,cpy,b.x,b.y);
        ctx.strokeStyle=pink?`rgba(228,0,124,${.72*vis})`:`rgba(255,255,255,${.30*vis})`;
        ctx.lineWidth=pink?.85:.62; ctx.stroke();
        ctx.restore();
      }
    }

    function drawGlobe(t){
      ctx.clearRect(0,0,S,S);
      const aura=ctx.createRadialGradient(CX,CY,R*.72,CX,CY,R*1.18);
      aura.addColorStop(0,'rgba(255,255,255,.01)');
      aura.addColorStop(.78,'rgba(255,255,255,.006)');
      aura.addColorStop(1,'rgba(255,255,255,0)');
      ctx.fillStyle=aura; ctx.beginPath(); ctx.arc(CX,CY,R*1.18,0,TAU); ctx.fill();

      drawNetwork();

      const glass=ctx.createRadialGradient(CX-R*.26,CY-R*.32,R*.04,CX,CY,R);
      glass.addColorStop(0,'rgba(255,255,255,.022)');
      glass.addColorStop(.52,'rgba(255,255,255,.006)');
      glass.addColorStop(1,'rgba(255,255,255,.002)');
      ctx.fillStyle=glass; ctx.beginPath(); ctx.arc(CX,CY,R,0,TAU); ctx.fill();

      ctx.save(); ctx.beginPath(); ctx.arc(CX,CY,R-1,0,TAU); ctx.clip();
      for(const p of land){
        const q=project(p[1],p[0]);
        if(q.z<-.02) continue;
        const depth=clamp((q.z+.02)/1.02,0,1);
        const edge=clamp((1-Math.hypot(q.x-CX,q.y-CY)/R)*5.2,.18,1);
        const a=(.16+depth*.74)*edge;
        const size=.55+depth*.60;
        ctx.fillStyle=`rgba(244,244,248,${a})`;
        ctx.beginPath(); ctx.arc(q.x,q.y,size,0,TAU); ctx.fill();
      }
      ctx.restore();

      ctx.beginPath(); ctx.arc(CX,CY,R,0,TAU);
      ctx.strokeStyle='rgba(255,255,255,.22)'; ctx.lineWidth=.72; ctx.stroke();
      drawVisitor(t);
    }

    function drawVisitor(t){
      const p=project(visitor.lat,visitor.lng,R*1.012);
      if(p.z<-.02) return;
      const pulse=.5+.5*Math.sin(t*.0042);
      const core=3.1+pulse*.7, halo=7+pulse*6;
      ctx.save();
      ctx.globalAlpha=.16+.14*pulse;
      ctx.fillStyle=PINK; ctx.shadowColor=PINK; ctx.shadowBlur=18;
      ctx.beginPath(); ctx.arc(p.x,p.y,halo,0,TAU); ctx.fill();
      ctx.globalAlpha=1; ctx.shadowBlur=11;
      ctx.beginPath(); ctx.arc(p.x,p.y,core,0,TAU); ctx.fillStyle=PINK; ctx.fill();
      ctx.shadowBlur=0;
      const text='ONLINE · '+visitor.city;
      ctx.font='9px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace';
      ctx.textBaseline='middle';
      const tw=ctx.measureText(text).width,bw=tw+20,bh=22;
      let lx=p.x+10,ly=clamp(p.y-bh*.5,8,S-bh-8);
      if(lx+bw>S-10) lx=p.x-bw-10;
      ctx.beginPath(); ctx.roundRect(lx,ly,bw,bh,11);
      ctx.fillStyle='rgba(18,18,20,.92)'; ctx.fill();
      ctx.strokeStyle='rgba(255,255,255,.10)'; ctx.lineWidth=.55; ctx.stroke();
      ctx.fillStyle='rgba(245,245,248,.66)'; ctx.fillText(text,lx+10,ly+bh/2+.2);
      ctx.restore();
    }

    function shortestDelta(a,b){
      let d=(b-a)%TAU;
      if(d>Math.PI)d-=TAU;
      if(d<-Math.PI)d+=TAU;
      return d;
    }

    function frame(t){
      requestAnimationFrame(frame);
      if(!visible||document.hidden) return;
      if(!dragging&&pointers.size<2){
        if(returning){
          const dy=shortestDelta(yaw,targetYaw);
          yaw+=dy*.075; pitch+=(targetPitch-pitch)*.075;
          if(Math.abs(dy)<.0015&&Math.abs(targetPitch-pitch)<.0015){yaw=targetYaw;pitch=targetPitch;returning=false;}
        }else if(!reduced){
          const h=homeAngles();
          targetYaw=h.yaw+Math.sin(t*.00018)*.035;
          targetPitch=h.pitch+Math.sin(t*.00014)*.012;
          yaw+=shortestDelta(yaw,targetYaw)*.018;
          pitch+=(targetPitch-pitch)*.018;
        }
      }
      drawGlobe(t); canvas.style.opacity='1';
    }

    function pointerDistance(){
      const p=[...pointers.values()];
      if(p.length<2) return 0;
      return Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);
    }

    wrap.addEventListener('wheel',e=>{
      e.preventDefault();
      const dir=e.deltaY>0?-.08:.08;
      zoom=clamp(zoom+dir,.85,1.45); applyZoom();
    },{passive:false});

    wrap.addEventListener('pointerdown',e=>{
      pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
      try{wrap.setPointerCapture(e.pointerId)}catch(_){}
      if(pointers.size===1){
        dragging=true; returning=false; lastX=e.clientX; lastY=e.clientY; wrap.style.cursor='grabbing';
      }else if(pointers.size===2){
        dragging=false; pinchStartDist=pointerDistance(); pinchStartZoom=zoom;
      }
    });

    wrap.addEventListener('pointermove',e=>{
      if(!pointers.has(e.pointerId)) return;
      pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
      if(pointers.size>=2){
        const d=pointerDistance();
        if(pinchStartDist>0){ zoom=clamp(pinchStartZoom*(d/pinchStartDist),.85,1.45); applyZoom(); }
        return;
      }
      if(!dragging) return;
      const dx=e.clientX-lastX,dy=e.clientY-lastY; lastX=e.clientX; lastY=e.clientY;
      yaw+=dx*.0072; pitch=clamp(pitch-dy*.0062,-1.48,1.48);
    });

    function endPointer(e){
      pointers.delete(e.pointerId);
      try{wrap.releasePointerCapture(e.pointerId)}catch(_){}
      if(pointers.size<2){ pinchStartDist=0; }
      if(pointers.size===0){
        dragging=false; wrap.style.cursor='grab'; centerOnVisitor(false);
      }else if(pointers.size===1){
        const p=[...pointers.values()][0]; lastX=p.x; lastY=p.y; dragging=true;
      }
    }
    wrap.addEventListener('pointerup',endPointer);
    wrap.addEventListener('pointercancel',endPointer);
    wrap.addEventListener('lostpointercapture',e=>{ if(pointers.has(e.pointerId)) endPointer(e); });

    const io=new IntersectionObserver(es=>visible=!!es[0]?.isIntersecting,{rootMargin:'180px'});
    io.observe(hero);
    addEventListener('resize',resize,{passive:true});
    addEventListener('scroll',syncPosition,{passive:true});

    Promise.all([loadLand(),loadVisitor()]).finally(()=>{
      centerOnVisitor(true); resize(); canvas.style.opacity='1'; requestAnimationFrame(frame);
    });
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();