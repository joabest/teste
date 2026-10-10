(() => {
  'use strict';
  if (window.__WE_GLOBE_V20__) return;
  window.__WE_GLOBE_V20__ = true;

  const TAU = Math.PI * 2;
  const RAD = Math.PI / 180;
  const PINK = '#e4007c';
  const clamp = (v,a,b) => Math.max(a, Math.min(b,v));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let visitor = { lat: -23.5505, lng: -46.6333, city: 'SÃO PAULO' };
  let land = [];

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
      'we-globe-live-v6','we-globe-fallback','we-original-globe-v18','we-globe-v20'
    ].forEach(id=>document.getElementById(id)?.remove());

    if(getComputedStyle(hero).position==='static') hero.style.position='relative';

    const layer=document.createElement('div');
    layer.id='we-globe-v20';
    layer.setAttribute('aria-hidden','true');
    Object.assign(layer.style,{
      position:'absolute',left:'0',right:'0',top:'0',height:'760px',zIndex:'8',
      pointerEvents:'none',overflow:'visible'
    });

    const wrap=document.createElement('div');
    Object.assign(wrap.style,{
      position:'absolute',left:'50%',top:'58px',transform:'translateX(-50%)',
      width:'min(650px,52vw,70vh)',height:'min(650px,52vw,70vh)',
      minWidth:'470px',minHeight:'470px',pointerEvents:'auto',touchAction:'none',
      cursor:'grab',overflow:'visible'
    });

    const canvas=document.createElement('canvas');
    Object.assign(canvas.style,{
      position:'absolute',inset:'0',width:'100%',height:'100%',display:'block',
      opacity:'0',transition:'opacity .45s ease'
    });
    wrap.appendChild(canvas); layer.appendChild(wrap); hero.prepend(layer);

    const style=document.createElement('style');
    style.textContent=`
      @media(max-width:767px){
        #we-globe-v20{height:350px!important}
        #we-globe-v20>div{width:290px!important;height:290px!important;min-width:290px!important;min-height:290px!important;top:18px!important}
      }
      @media(min-width:768px) and (max-width:1100px){
        #we-globe-v20>div{width:500px!important;height:500px!important;min-width:500px!important;min-height:500px!important;top:54px!important}
      }
    `;
    document.head.appendChild(style);

    const ctx=canvas.getContext('2d',{alpha:true,desynchronized:true});
    if(!ctx) return;

    const S=700,CX=350,CY=350,R=262;
    let dpr=1,visible=true;
    let yaw=0,pitch=0,targetYaw=0,targetPitch=0;
    let dragging=false,lastX=0,lastY=0;
    let returning=true;
    let lastT=performance.now();

    function homeAngles(){
      return { yaw:-visitor.lng*RAD, pitch:clamp(visitor.lat*RAD,-1.25,1.25) };
    }

    function centerOnVisitor(immediate=false){
      const h=homeAngles();
      targetYaw=h.yaw;
      targetPitch=h.pitch;
      returning=true;
      if(immediate){ yaw=targetYaw; pitch=targetPitch; }
    }

    function resize(){
      dpr=Math.min(devicePixelRatio||1,2);
      canvas.width=Math.round(S*dpr); canvas.height=Math.round(S*dpr);
      ctx.setTransform(dpr,0,0,dpr,0,0);
    }

    function project(lat,lng,rad=R){
      let [x,y,z]=latLngVec(lat,lng);
      const cy=Math.cos(yaw),sy=Math.sin(yaw);
      const x1=x*cy+z*sy, z1=-x*sy+z*cy;
      const cp=Math.cos(pitch),sp=Math.sin(pitch);
      const y2=y*cp-z1*sp, z2=y*sp+z1*cp;
      return {x:CX+x1*rad,y:CY-y2*rad,z:z2};
    }

    function orbit(angle,flat,offset,color,alpha=.16,width=.62){
      ctx.save();
      ctx.translate(CX,CY); ctx.rotate(angle);
      ctx.beginPath(); ctx.ellipse(0,offset,R*1.08,R*flat,0,0,TAU);
      ctx.strokeStyle=color==='pink'?`rgba(228,0,124,${alpha})`:`rgba(255,255,255,${alpha})`;
      ctx.lineWidth=width; ctx.stroke(); ctx.restore();
    }

    function drawOrbitLines(){
      // Fine white orbital wires.
      orbit(-.78,.22,-R*.08,'white',.18,.58);
      orbit(-.52,.31,R*.08,'white',.13,.52);
      orbit(-.28,.17,-R*.14,'white',.16,.56);
      orbit(.05,.29,R*.02,'white',.13,.50);
      orbit(.34,.20,R*.11,'white',.17,.56);
      orbit(.62,.34,-R*.05,'white',.12,.50);
      // Only two accent wires, still hairline thin.
      orbit(-.10,.23,R*.13,'pink',.50,.72);
      orbit(.46,.16,-R*.10,'pink',.34,.66);
    }

    function drawGlobe(t){
      ctx.clearRect(0,0,S,S);

      const aura=ctx.createRadialGradient(CX,CY,R*.72,CX,CY,R*1.18);
      aura.addColorStop(0,'rgba(255,255,255,.01)');
      aura.addColorStop(.78,'rgba(255,255,255,.005)');
      aura.addColorStop(1,'rgba(255,255,255,0)');
      ctx.fillStyle=aura; ctx.beginPath(); ctx.arc(CX,CY,R*1.18,0,TAU); ctx.fill();

      drawOrbitLines();

      // Transparent body, no heavy dark fill.
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
      const p=project(visitor.lat,visitor.lng,R*1.01);
      if(p.z<-.02) return;

      // One and only one pink point. Smooth pulse.
      const pulse=.5+.5*Math.sin(t*.0042);
      const core=3.2+pulse*.7;
      const halo=8+pulse*7;

      ctx.save();
      ctx.globalAlpha=.18+.16*pulse;
      ctx.fillStyle=PINK; ctx.shadowColor=PINK; ctx.shadowBlur=18;
      ctx.beginPath(); ctx.arc(p.x,p.y,halo,0,TAU); ctx.fill();
      ctx.globalAlpha=1;
      ctx.shadowBlur=12;
      ctx.beginPath(); ctx.arc(p.x,p.y,core,0,TAU); ctx.fillStyle=PINK; ctx.fill();
      ctx.shadowBlur=0;

      const text='ONLINE · '+visitor.city;
      ctx.font='9px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace';
      ctx.textBaseline='middle';
      const tw=ctx.measureText(text).width,bw=tw+20,bh=22;
      let lx=p.x+10,ly=p.y-bh*.5;
      if(lx+bw>S-10) lx=p.x-bw-10;
      ly=clamp(ly,8,S-bh-8);
      ctx.beginPath(); ctx.roundRect(lx,ly,bw,bh,11);
      ctx.fillStyle='rgba(18,18,20,.92)'; ctx.fill();
      ctx.strokeStyle='rgba(255,255,255,.10)'; ctx.lineWidth=.55; ctx.stroke();
      ctx.fillStyle='rgba(245,245,248,.66)';
      ctx.fillText(text,lx+10,ly+bh/2+.2);
      ctx.restore();
    }

    function shortestDelta(a,b){
      let d=(b-a)%(TAU);
      if(d>Math.PI)d-=TAU;
      if(d<-Math.PI)d+=TAU;
      return d;
    }

    function frame(t){
      requestAnimationFrame(frame);
      if(!visible||document.hidden) return;
      lastT=t;

      if(!dragging){
        if(returning){
          const dy=shortestDelta(yaw,targetYaw);
          yaw += dy*.075;
          pitch += (targetPitch-pitch)*.075;
          if(Math.abs(dy)<.0015 && Math.abs(targetPitch-pitch)<.0015){
            yaw=targetYaw; pitch=targetPitch; returning=false;
          }
        }else if(!reduced){
          // Very slight idle drift around the centered visitor, never random.
          const h=homeAngles();
          targetYaw=h.yaw + Math.sin(t*.00018)*.035;
          targetPitch=h.pitch + Math.sin(t*.00014)*.012;
          yaw += shortestDelta(yaw,targetYaw)*.018;
          pitch += (targetPitch-pitch)*.018;
        }
      }

      drawGlobe(t);
      canvas.style.opacity='1';
    }

    function down(e){
      dragging=true; returning=false; lastX=e.clientX; lastY=e.clientY;
      wrap.style.cursor='grabbing';
      try{wrap.setPointerCapture(e.pointerId)}catch(_){}
    }

    function move(e){
      if(!dragging) return;
      const dx=e.clientX-lastX,dy=e.clientY-lastY; lastX=e.clientX; lastY=e.clientY;
      // Unlimited yaw = full 360° horizontal rotation.
      yaw += dx*.0072;
      // Wide pitch range lets the user inspect almost the entire sphere vertically.
      pitch = clamp(pitch-dy*.0062,-1.48,1.48);
    }

    function up(e){
      if(!dragging) return;
      dragging=false; wrap.style.cursor='grab';
      try{wrap.releasePointerCapture(e.pointerId)}catch(_){}
      // Always return to the visitor after release.
      centerOnVisitor(false);
    }

    wrap.addEventListener('pointerdown',down);
    wrap.addEventListener('pointermove',move);
    wrap.addEventListener('pointerup',up);
    wrap.addEventListener('pointercancel',up);
    wrap.addEventListener('lostpointercapture',up);

    const io=new IntersectionObserver(es=>visible=!!es[0]?.isIntersecting,{rootMargin:'180px'});
    io.observe(hero);
    addEventListener('resize',resize,{passive:true});

    Promise.all([loadLand(),loadVisitor()]).finally(()=>{
      centerOnVisitor(true);
      canvas.style.opacity='1';
      requestAnimationFrame(frame);
    });
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
