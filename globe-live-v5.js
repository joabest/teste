(() => {
  'use strict';
  if(window.__WE_LIVE_GLOBE_V5__) return;
  window.__WE_LIVE_GLOBE_V5__=true;

  const TAU=Math.PI*2;
  const deg=v=>v*Math.PI/180;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const CONTINENTS=[
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

  function insidePoly(lon,lat,poly){
    let inside=false;
    for(let i=0,j=poly.length-1;i<poly.length;j=i++){
      const xi=poly[i][0],yi=poly[i][1],xj=poly[j][0],yj=poly[j][1];
      const hit=((yi>lat)!==(yj>lat))&&(lon<(xj-xi)*(lat-yi)/((yj-yi)||1e-6)+xi);
      if(hit)inside=!inside;
    }
    return inside;
  }
  const isLand=(lon,lat)=>CONTINENTS.some(p=>insidePoly(lon,lat,p));
  const land=[];
  for(let lat=-72;lat<=80;lat+=1.45){
    const step=1.42/Math.max(.38,Math.cos(deg(lat)));
    for(let lon=-180;lon<180;lon+=step){
      const jlon=lon+Math.sin((lon+lat)*1.71)*.20;
      const jlat=lat+Math.cos((lon-lat)*1.19)*.14;
      if(isLand(jlon,jlat))land.push([jlon,jlat]);
    }
  }

  const hubs=[
    {name:'MONTERREY',lat:25.6866,lng:-100.3161},
    {name:'HOUSTON',lat:29.7604,lng:-95.3698},
    {name:'DUBAI',lat:25.2048,lng:55.2708},
    {name:'SÃO PAULO',lat:-23.5505,lng:-46.6333}
  ];

  function boot(){
    const hero=document.querySelector('[data-hero-section="true"]');
    if(!hero||!document.body)return setTimeout(boot,140);

    document.getElementById('we-globe-layer-v3')?.remove();
    document.getElementById('we-globe-layer-v5')?.remove();

    const layer=document.createElement('div');
    layer.id='we-globe-layer-v5';
    layer.setAttribute('aria-hidden','true');
    Object.assign(layer.style,{position:'absolute',left:'0',width:'100%',height:'100svh',minHeight:'620px',maxHeight:'940px',zIndex:'9',pointerEvents:'none',overflow:'hidden'});
    const canvas=document.createElement('canvas');
    canvas.id='we-custom-globe-v5';
    Object.assign(canvas.style,{position:'absolute',inset:'0',width:'100%',height:'100%',pointerEvents:'auto',touchAction:'pan-y',opacity:'0',transition:'opacity 500ms ease',cursor:'default'});
    layer.appendChild(canvas);document.body.appendChild(layer);
    const ctx=canvas.getContext('2d',{alpha:true});if(!ctx)return;

    let W=0,H=0,D=1,cx=0,cy=0,R=0,baseTop=0,raf=0;
    let dragRot=0,dragTilt=0,velRot=0,velTilt=0,dragging=false,lastX=0,lastY=0,lastT=0;
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

    function sync(){
      const h=document.querySelector('[data-hero-section="true"]');if(!h)return;
      const r=h.getBoundingClientRect();baseTop=Math.max(0,r.top+scrollY);layer.style.top=baseTop+'px';
      const hh=clamp(innerHeight||800,620,940);layer.style.height=hh+'px';
      if(layer.parentNode!==document.body)document.body.appendChild(layer);
    }
    function resize(){
      sync();W=Math.max(320,innerWidth||document.documentElement.clientWidth||1200);H=clamp(innerHeight||800,620,940);D=Math.min(2,devicePixelRatio||1);
      canvas.width=Math.round(W*D);canvas.height=Math.round(H*D);ctx.setTransform(D,0,0,D,0,0);
      const mobile=W<760;R=mobile?Math.min(W*.435,192):Math.min(W*.205,H*.31,288);cx=W*.5;cy=mobile?Math.min(H*.39,300):H*.47;
    }
    function project(lon,lat,rot,tilt){
      const la=deg(lat),lo=deg(lon)+rot;const x0=Math.cos(la)*Math.sin(lo),z0=Math.cos(la)*Math.cos(lo),y0=-Math.sin(la);
      const ct=Math.cos(tilt),st=Math.sin(tilt);const y=y0*ct-z0*st,z=y0*st+z0*ct;
      return {x:cx+x0*R,y:cy+y*R,z};
    }
    function drawGrid(rot,tilt){
      ctx.save();ctx.lineWidth=.5;
      for(let lat=-60;lat<=60;lat+=20){ctx.beginPath();let s=false;for(let lon=-180;lon<=180;lon+=3){const p=project(lon,lat,rot,tilt);if(p.z>-.02){if(!s){ctx.moveTo(p.x,p.y);s=true}else ctx.lineTo(p.x,p.y)}else s=false}ctx.strokeStyle='rgba(240,240,248,.052)';ctx.stroke()}
      for(let lon=-180;lon<180;lon+=20){ctx.beginPath();let s=false;for(let lat=-88;lat<=88;lat+=2){const p=project(lon,lat,rot,tilt);if(p.z>-.02){if(!s){ctx.moveTo(p.x,p.y);s=true}else ctx.lineTo(p.x,p.y)}else s=false}ctx.strokeStyle='rgba(240,240,248,.042)';ctx.stroke()}
      ctx.restore();
    }
    function quad(a,b,t){const qx=(a.x+b.x)/2,qy=(a.y+b.y)/2-R*.22;const u=1-t;return{x:u*u*a.x+2*u*t*qx+t*t*b.x,y:u*u*a.y+2*u*t*qy+t*t*b.y}}
    function route(a,b,t,phase){
      if(a.z<-.2&&b.z<-.2)return;
      const qx=(a.x+b.x)/2,qy=(a.y+b.y)/2-R*.22;
      ctx.save();ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.quadraticCurveTo(qx,qy,b.x,b.y);ctx.strokeStyle='rgba(228,0,124,.34)';ctx.lineWidth=.75;ctx.stroke();
      const k=(t*.00019+phase)%1;const p=quad(a,b,k);ctx.beginPath();ctx.arc(p.x,p.y,2.4,0,TAU);ctx.fillStyle='#e4007c';ctx.shadowBlur=12;ctx.shadowColor='#e4007c';ctx.fill();ctx.restore();
    }
    function orbit(rx,ry,angle,alpha){ctx.save();ctx.translate(cx,cy);ctx.rotate(angle);ctx.beginPath();ctx.ellipse(0,0,rx,ry,0,0,TAU);ctx.strokeStyle=`rgba(240,240,248,${alpha})`;ctx.lineWidth=.65;ctx.stroke();ctx.restore()}
    function inside(x,y){return Math.hypot(x-cx,y-cy)<=R*1.14}

    canvas.addEventListener('pointerdown',e=>{const r=canvas.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;if(!inside(x,y))return;dragging=true;lastX=e.clientX;lastY=e.clientY;lastT=performance.now();velRot=0;velTilt=0;canvas.setPointerCapture(e.pointerId);canvas.style.cursor='grabbing';e.preventDefault()});
    canvas.addEventListener('pointermove',e=>{const r=canvas.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;if(!dragging){canvas.style.cursor=inside(x,y)?'grab':'default';return}const now=performance.now(),dt=Math.max(8,now-lastT),dx=e.clientX-lastX,dy=e.clientY-lastY;const dr=dx/Math.max(140,R)*1.05,dtl=dy/Math.max(140,R)*.72;dragRot+=dr;dragTilt=clamp(dragTilt+dtl,-.82,.82);velRot=dr*(16/dt);velTilt=dtl*(16/dt);lastX=e.clientX;lastY=e.clientY;lastT=now;e.preventDefault()});
    const release=e=>{if(!dragging)return;dragging=false;canvas.style.cursor='grab';try{canvas.releasePointerCapture(e.pointerId)}catch{}};
    canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);

    function frame(t){
      if(!dragging){dragRot+=velRot;dragTilt=clamp(dragTilt+velTilt,-.82,.82);velRot*=.948;velTilt*=.925}
      const auto=reduced?0:t*.000055;const rot=-deg(20)+dragRot+auto,tilt=deg(-9)+dragTilt;
      ctx.clearRect(0,0,W,H);
      const glow=ctx.createRadialGradient(cx-R*.22,cy-R*.28,R*.08,cx,cy,R*1.25);glow.addColorStop(0,'rgba(245,245,250,.065)');glow.addColorStop(.72,'rgba(90,90,100,.018)');glow.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=glow;ctx.beginPath();ctx.arc(cx,cy,R*1.25,0,TAU);ctx.fill();
      orbit(R*1.23,R*.37,-.20+Math.sin(t*.00022)*.06,.11);orbit(R*1.18,R*.28,.44+t*.000035,.08);orbit(R*1.12,R*.20,-.58-t*.000028,.065);orbit(R*1.08,R*.49,.08+Math.sin(t*.00017)*.04,.05);
      ctx.save();ctx.beginPath();ctx.arc(cx,cy,R,0,TAU);ctx.clip();drawGrid(rot,tilt);
      for(const d of land){const p=project(d[0],d[1],rot,tilt);if(p.z<-.07)continue;const depth=clamp((p.z+.07)/1.07,0,1);const edge=Math.sqrt(Math.max(0,1-((p.x-cx)/R)**2-((p.y-cy)/R)**2));const a=(.12+depth*.82)*clamp(edge*2,.22,1);ctx.beginPath();ctx.arc(p.x,p.y,.50+depth*.98,0,TAU);ctx.fillStyle=`rgba(240,240,248,${a})`;ctx.fill()}
      ctx.restore();
      const rim=ctx.createRadialGradient(cx,cy,R*.72,cx,cy,R*1.04);rim.addColorStop(0,'rgba(240,240,248,0)');rim.addColorStop(.92,'rgba(240,240,248,.024)');rim.addColorStop(1,'rgba(240,240,248,.25)');ctx.fillStyle=rim;ctx.beginPath();ctx.arc(cx,cy,R*1.04,0,TAU);ctx.fill();ctx.beginPath();ctx.arc(cx,cy,R+.5,0,TAU);ctx.strokeStyle='rgba(240,240,248,.18)';ctx.lineWidth=.75;ctx.stroke();
      const p0=project(hubs[0].lng,hubs[0].lat,rot,tilt);
      for(let i=1;i<hubs.length;i++){const pi=project(hubs[i].lng,hubs[i].lat,rot,tilt);route(p0,pi,t,i*.23)}
      for(const h of hubs){const p=project(h.lng,h.lat,rot,tilt);if(p.z<-.08)continue;const pulse=.5+.5*Math.sin(t*.006+h.lng);ctx.beginPath();ctx.arc(p.x,p.y,2.4+pulse*1.2,0,TAU);ctx.fillStyle='#e4007c';ctx.shadowBlur=9+pulse*7;ctx.shadowColor='#e4007c';ctx.fill();ctx.shadowBlur=0}
      raf=requestAnimationFrame(frame);
    }

    addEventListener('resize',resize,{passive:true});resize();requestAnimationFrame(()=>canvas.style.opacity='1');raf=requestAnimationFrame(frame);
    const watch=setInterval(()=>{const h=document.querySelector('[data-hero-section="true"]');if(!h){layer.style.display='none';return}layer.style.display='block';sync();canvas.style.opacity='1'},700);
    addEventListener('pagehide',()=>{clearInterval(watch);cancelAnimationFrame(raf)},{once:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
