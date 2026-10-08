(() => {
  'use strict';

  if (window.__WE_GLOBE_V3__) return;
  window.__WE_GLOBE_V3__ = true;

  const old = document.getElementById('we-custom-globe');
  if (old) old.remove();

  const CONTINENTS = [
    [[-168,72],[-150,70],[-135,58],[-125,50],[-124,40],[-117,32],[-106,24],[-97,19],[-88,20],[-82,25],[-80,31],[-75,39],[-66,45],[-60,52],[-63,60],[-78,68],[-95,73],[-115,75],[-140,72]],
    [[-81,12],[-72,10],[-63,7],[-55,2],[-50,-8],[-48,-18],[-54,-28],[-60,-38],[-68,-52],[-74,-50],[-76,-36],[-72,-20],[-78,-5],[-81,12]],
    [[-12,36],[-5,44],[4,50],[12,56],[22,60],[31,58],[40,53],[50,50],[59,55],[70,58],[82,56],[95,62],[112,58],[126,52],[140,50],[155,58],[170,60],[178,52],[165,44],[150,40],[135,34],[123,26],[112,18],[102,8],[92,10],[82,22],[72,25],[62,30],[52,28],[43,32],[36,36],[28,38],[21,34],[15,38],[7,43],[-2,43],[-12,36]],
    [[-17,36],[-5,36],[10,33],[23,32],[33,28],[43,12],[50,2],[43,-10],[35,-20],[29,-31],[18,-35],[10,-34],[3,-27],[-5,-20],[-12,-8],[-17,5],[-12,18],[-17,36]],
    [[112,-11],[121,-18],[134,-15],[145,-19],[153,-28],[151,-39],[140,-44],[129,-40],[118,-34],[113,-24],[112,-11]],
    [[45,-12],[50,-14],[51,-24],[47,-26],[44,-20],[45,-12]],
    [[-55,83],[-25,82],[-16,72],[-28,60],[-45,60],[-60,68],[-55,83]],
    [[-8,58],[-4,50],[1,50],[2,58],[-3,61],[-8,58]],
    [[130,46],[143,43],[146,36],[140,32],[132,35],[130,46]],
    [[96,6],[105,0],[118,-8],[126,-7],[119,4],[108,8],[96,6]]
  ];

  const deg = v => v * Math.PI / 180;
  const clamp = (v,a,b) => Math.max(a, Math.min(b,v));

  function pointInPoly(lon, lat, poly) {
    let inside = false;
    for (let i=0, j=poly.length-1; i<poly.length; j=i++) {
      const xi=poly[i][0], yi=poly[i][1], xj=poly[j][0], yj=poly[j][1];
      const hit=((yi>lat)!==(yj>lat)) && (lon < (xj-xi)*(lat-yi)/((yj-yi)||1e-6)+xi);
      if (hit) inside=!inside;
    }
    return inside;
  }
  const isLand = (lon,lat) => CONTINENTS.some(p => pointInPoly(lon,lat,p));

  const landDots=[];
  for (let lat=-72; lat<=80; lat+=1.55) {
    const step=1.5/Math.max(.38,Math.cos(deg(lat)));
    for (let lon=-180; lon<180; lon+=step) {
      const jl=lon+Math.sin((lon+lat)*1.73)*.24;
      const jt=lat+Math.cos((lon-lat)*1.17)*.16;
      if (isLand(jl,jt)) landDots.push([jl,jt]);
    }
  }

  const stars=Array.from({length:150},(_,i)=>({
    x:((i*73)%997)/997,
    y:((i*193)%991)/991,
    a:.08+((i*17)%31)/115,
    r:.35+((i*11)%8)/12
  }));

  let visitor={lat:-23.5505,lng:-46.6333,city:'São Paulo'};
  fetch('https://ipapi.co/json/').then(r=>r.ok?r.json():null).then(d=>{
    if (!d) return;
    const lat=Number(d.latitude), lng=Number(d.longitude);
    if (Number.isFinite(lat)&&Number.isFinite(lng)) visitor={lat,lng,city:String(d.city||d.region||'ONLINE').trim()||'ONLINE'};
  }).catch(()=>{});

  function boot() {
    const hero=document.querySelector('[data-hero-section="true"]');
    if (!hero || !document.body) return setTimeout(boot,120);
    if (document.getElementById('we-globe-layer-v3')) return;

    const layer=document.createElement('div');
    layer.id='we-globe-layer-v3';
    layer.setAttribute('aria-hidden','true');
    Object.assign(layer.style,{
      position:'absolute',left:'0',width:'100%',height:'100svh',minHeight:'620px',maxHeight:'940px',
      zIndex:'9',pointerEvents:'none',overflow:'hidden',opacity:'1'
    });

    const canvas=document.createElement('canvas');
    canvas.id='we-custom-globe-v3';
    Object.assign(canvas.style,{
      position:'absolute',inset:'0',width:'100%',height:'100%',pointerEvents:'auto',touchAction:'pan-y',
      opacity:'0',transition:'opacity 650ms ease',cursor:'default'
    });
    layer.appendChild(canvas);
    document.body.appendChild(layer);

    const ctx=canvas.getContext('2d',{alpha:true});
    if (!ctx) return;

    let W=0,H=0,D=1,cx=0,cy=0,radius=0;
    let dragRot=0, dragTilt=0, velRot=0, velTilt=0;
    let dragging=false,lastX=0,lastY=0,lastT=0;
    let baseTop=0, raf=0;
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

    function syncLayer() {
      const current=document.querySelector('[data-hero-section="true"]');
      if (!current) return;
      const rect=current.getBoundingClientRect();
      baseTop=Math.max(0,rect.top+scrollY);
      layer.style.top=baseTop+'px';
      const hh=clamp(innerHeight||800,620,940);
      layer.style.height=hh+'px';
      if (layer.parentNode!==document.body) document.body.appendChild(layer);
    }

    function resize() {
      syncLayer();
      W=Math.max(320,innerWidth||document.documentElement.clientWidth||1200);
      H=clamp(innerHeight||800,620,940);
      D=Math.min(2,devicePixelRatio||1);
      canvas.width=Math.round(W*D); canvas.height=Math.round(H*D);
      ctx.setTransform(D,0,0,D,0,0);
      const mobile=W<760;
      radius=mobile?Math.min(W*.43,190):Math.min(W*.205,H*.31,285);
      cx=W*.5;
      cy=mobile?Math.min(H*.39,300):H*.47;
    }

    function project(lon,lat,rotY,tilt) {
      const la=deg(lat), lo=deg(lon)+rotY;
      const x0=Math.cos(la)*Math.sin(lo);
      const z0=Math.cos(la)*Math.cos(lo);
      const y0=-Math.sin(la);
      const ct=Math.cos(tilt), st=Math.sin(tilt);
      const y=y0*ct-z0*st, z=y0*st+z0*ct;
      return {x:cx+x0*radius,y:cy+y*radius,z};
    }

    function orbit(rx,ry,angle,alpha,offset=0) {
      ctx.save();
      ctx.translate(cx,cy); ctx.rotate(angle);
      ctx.beginPath(); ctx.ellipse(0,offset,rx,ry,0,0,Math.PI*2);
      ctx.strokeStyle=`rgba(240,240,248,${alpha})`; ctx.lineWidth=.65; ctx.stroke();
      ctx.restore();
    }

    function drawGrid(rot,tilt) {
      ctx.save(); ctx.lineWidth=.5;
      for (let lat=-60;lat<=60;lat+=20) {
        ctx.beginPath(); let started=false;
        for (let lon=-180;lon<=180;lon+=3) {
          const p=project(lon,lat,rot,tilt);
          if (p.z>-0.02) { if(!started){ctx.moveTo(p.x,p.y);started=true}else ctx.lineTo(p.x,p.y); }
          else started=false;
        }
        ctx.strokeStyle='rgba(240,240,248,.052)'; ctx.stroke();
      }
      for (let lon=-180;lon<180;lon+=20) {
        ctx.beginPath(); let started=false;
        for (let lat=-88;lat<=88;lat+=2) {
          const p=project(lon,lat,rot,tilt);
          if (p.z>-0.02) { if(!started){ctx.moveTo(p.x,p.y);started=true}else ctx.lineTo(p.x,p.y); }
          else started=false;
        }
        ctx.strokeStyle='rgba(240,240,248,.045)'; ctx.stroke();
      }
      ctx.restore();
    }

    function label(x,y,text) {
      ctx.save();
      ctx.font=(W<760?'9px':'10px')+' ui-monospace,SFMono-Regular,Menlo,monospace';
      ctx.textBaseline='middle';
      const tw=ctx.measureText(text).width, bw=tw+34,bh=24;
      let lx=x+14,ly=y-34;
      if(lx+bw>W-14) lx=x-bw-14;
      ctx.beginPath(); ctx.roundRect(lx,ly,bw,bh,12); ctx.fillStyle='rgba(18,18,18,.92)';ctx.fill();
      ctx.strokeStyle='rgba(240,240,248,.16)';ctx.lineWidth=.75;ctx.stroke();
      ctx.beginPath();ctx.arc(lx+12,ly+bh/2,3,0,Math.PI*2);ctx.fillStyle='#e4007c';ctx.shadowBlur=12;ctx.shadowColor='#e4007c';ctx.fill();
      ctx.shadowBlur=0;ctx.fillStyle='rgba(240,240,248,.68)';ctx.fillText(text,lx+21,ly+bh/2+.5);ctx.restore();
    }

    function drawRoute(rot,tilt) {
      const a=project(visitor.lng,visitor.lat,rot,tilt);
      const b=project(-100.3161,25.6866,rot,tilt);
      if (a.z<-.18&&b.z<-.18) return;
      ctx.save();ctx.beginPath();ctx.moveTo(a.x,a.y);
      ctx.quadraticCurveTo((a.x+b.x)/2,(a.y+b.y)/2-radius*.22,b.x,b.y);
      const g=ctx.createLinearGradient(a.x,a.y,b.x,b.y);g.addColorStop(0,'rgba(228,0,124,.18)');g.addColorStop(.55,'rgba(228,0,124,.82)');g.addColorStop(1,'rgba(240,240,248,.26)');
      ctx.strokeStyle=g;ctx.lineWidth=1;ctx.stroke();
      for(const p of [a,b]) if(p.z>-.18){ctx.beginPath();ctx.arc(p.x,p.y,3,0,Math.PI*2);ctx.fillStyle='#e4007c';ctx.shadowBlur=11;ctx.shadowColor='#e4007c';ctx.fill();ctx.shadowBlur=0;}
      ctx.restore();
      if(a.z>-.08) label(a.x,a.y,'ONLINE · '+String(visitor.city||'ONLINE').toUpperCase());
    }

    function insideGlobe(x,y) { return Math.hypot(x-cx,y-cy)<=radius*1.12; }
    canvas.addEventListener('pointerdown',e=>{
      const rect=canvas.getBoundingClientRect(), x=e.clientX-rect.left,y=e.clientY-rect.top;
      if(!insideGlobe(x,y)) return;
      dragging=true;lastX=e.clientX;lastY=e.clientY;lastT=performance.now();velRot=0;velTilt=0;
      canvas.setPointerCapture(e.pointerId);canvas.style.cursor='grabbing';e.preventDefault();
    });
    canvas.addEventListener('pointermove',e=>{
      const rect=canvas.getBoundingClientRect(), x=e.clientX-rect.left,y=e.clientY-rect.top;
      if(!dragging){canvas.style.cursor=insideGlobe(x,y)?'grab':'default';return;}
      const now=performance.now(),dt=Math.max(8,now-lastT),dx=e.clientX-lastX,dy=e.clientY-lastY;
      const dr=dx/Math.max(140,radius)*1.05, dtilt=dy/Math.max(140,radius)*.72;
      dragRot+=dr;dragTilt=clamp(dragTilt+dtilt,-.82,.82);velRot=dr*(16/dt);velTilt=dtilt*(16/dt);
      lastX=e.clientX;lastY=e.clientY;lastT=now;e.preventDefault();
    });
    const release=e=>{
      if(!dragging)return;dragging=false;canvas.style.cursor='grab';
      try{canvas.releasePointerCapture(e.pointerId)}catch{}
    };
    canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);

    function frame(t) {
      if(!dragging){dragRot+=velRot;dragTilt=clamp(dragTilt+velTilt,-.82,.82);velRot*=.945;velTilt*=.92;}
      const auto=reduced?0:t*.000018;
      const rot=-deg(visitor.lng)+dragRot+auto;
      const tilt=deg(-8)+dragTilt;
      ctx.clearRect(0,0,W,H);

      const glow=ctx.createRadialGradient(cx-radius*.22,cy-radius*.28,radius*.08,cx,cy,radius*1.2);
      glow.addColorStop(0,'rgba(245,245,250,.06)');glow.addColorStop(.72,'rgba(80,80,90,.018)');glow.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=glow;ctx.beginPath();ctx.arc(cx,cy,radius*1.22,0,Math.PI*2);ctx.fill();

      orbit(radius*1.22,radius*.37,-.18,.11,-radius*.03);
      orbit(radius*1.18,radius*.29,.42,.09,radius*.02);
      orbit(radius*1.14,radius*.22,-.57,.075,0);
      orbit(radius*1.08,radius*.48,.08,.055,0);

      ctx.save();ctx.beginPath();ctx.arc(cx,cy,radius,0,Math.PI*2);ctx.clip();
      for(const s of stars){const sx=s.x*W,sy=s.y*H;if(Math.hypot(sx-cx,sy-cy)<radius*.95){ctx.beginPath();ctx.arc(sx,sy,s.r,0,Math.PI*2);ctx.fillStyle=`rgba(240,240,248,${s.a*.22})`;ctx.fill();}}
      drawGrid(rot,tilt);
      for(const d of landDots){const p=project(d[0],d[1],rot,tilt);if(p.z<-.07)continue;const depth=clamp((p.z+.07)/1.07,0,1);const edge=Math.sqrt(Math.max(0,1-((p.x-cx)/radius)**2-((p.y-cy)/radius)**2));const a=(.13+depth*.79)*clamp(edge*2,.25,1);ctx.beginPath();ctx.arc(p.x,p.y,.55+depth*.92,0,Math.PI*2);ctx.fillStyle=`rgba(240,240,248,${a})`;ctx.fill();}
      ctx.restore();

      const rim=ctx.createRadialGradient(cx,cy,radius*.72,cx,cy,radius*1.03);rim.addColorStop(0,'rgba(240,240,248,0)');rim.addColorStop(.92,'rgba(240,240,248,.025)');rim.addColorStop(1,'rgba(240,240,248,.24)');ctx.fillStyle=rim;ctx.beginPath();ctx.arc(cx,cy,radius*1.03,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.arc(cx,cy,radius+.5,0,Math.PI*2);ctx.strokeStyle='rgba(240,240,248,.17)';ctx.lineWidth=.75;ctx.stroke();
      drawRoute(rot,tilt);
      raf=requestAnimationFrame(frame);
    }

    addEventListener('resize',resize,{passive:true});
    resize();requestAnimationFrame(()=>canvas.style.opacity='1');raf=requestAnimationFrame(frame);

    const watchdog=setInterval(()=>{
      const h=document.querySelector('[data-hero-section="true"]');
      if(!h){layer.style.display='none';return;}
      layer.style.display='block';
      if(layer.parentNode!==document.body) document.body.appendChild(layer);
      syncLayer();canvas.style.opacity='1';
    },700);
    addEventListener('pagehide',()=>{clearInterval(watchdog);cancelAnimationFrame(raf)},{once:true});
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
})();
