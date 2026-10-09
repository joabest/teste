(() => {
  'use strict';
  if(window.__WE_GLOBE_V6__) return;
  window.__WE_GLOBE_V6__=true;

  const TAU=Math.PI*2,deg=v=>v*Math.PI/180,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
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
  function inPoly(lon,lat,p){let inside=false;for(let i=0,j=p.length-1;i<p.length;j=i++){const xi=p[i][0],yi=p[i][1],xj=p[j][0],yj=p[j][1];if(((yi>lat)!=(yj>lat))&&(lon<(xj-xi)*(lat-yi)/((yj-yi)||1e-6)+xi))inside=!inside}return inside}
  const land=[];
  for(let lat=-72;lat<=80;lat+=1.45){const step=1.42/Math.max(.38,Math.cos(deg(lat)));for(let lon=-180;lon<180;lon+=step)if(CONTINENTS.some(p=>inPoly(lon,lat,p)))land.push([lon,lat]);}

  let visitor=null;
  const valid=d=>d&&Number.isFinite(+d.lat)&&Number.isFinite(+d.lng);
  async function locate(){
    const providers=[
      async()=>{const d=await fetch('https://ipapi.co/json/?v=6',{cache:'no-store'}).then(r=>{if(!r.ok)throw 0;return r.json()});return {lat:+d.latitude,lng:+d.longitude,city:d.city||d.region||'',country:d.country_code||''}},
      async()=>{const d=await fetch('https://ipwho.is/?v=6',{cache:'no-store'}).then(r=>r.json());if(d.success===false)throw 0;return {lat:+d.latitude,lng:+d.longitude,city:d.city||d.region||'',country:d.country_code||''}},
      async()=>{const d=await fetch('https://freeipapi.com/api/json/',{cache:'no-store'}).then(r=>{if(!r.ok)throw 0;return r.json()});return {lat:+d.latitude,lng:+d.longitude,city:d.cityName||d.regionName||'',country:d.countryCode||''}}
    ];
    for(const p of providers){try{const v=await p();if(valid(v)){visitor=v;window.__WE_VISITOR_GEO__=v;return}}catch{}}
  }
  locate();

  function boot(){
    const hero=document.querySelector('[data-hero-section="true"]');
    if(!hero||!document.body) return setTimeout(boot,150);
    document.getElementById('we-globe-live-v5')?.remove();
    document.getElementById('we-globe-layer-v3')?.remove();
    if(document.getElementById('we-globe-live-v6')) return;

    const layer=document.createElement('div');layer.id='we-globe-live-v6';layer.setAttribute('aria-hidden','true');
    Object.assign(layer.style,{position:'absolute',left:'0',width:'100%',height:'min(940px,100svh)',minHeight:'620px',zIndex:'9',pointerEvents:'none',overflow:'hidden'});
    const cv=document.createElement('canvas');
    Object.assign(cv.style,{position:'absolute',inset:'0',width:'100%',height:'100%',pointerEvents:'auto',touchAction:'pan-y',cursor:'default'});
    layer.appendChild(cv);document.body.appendChild(layer);
    const c=cv.getContext('2d',{alpha:true});if(!c)return;

    let W=0,H=0,D=1,cx=0,cy=0,R=0,baseTop=0,drag=0,tiltDrag=0,vx=0,vy=0,down=false,lx=0,ly=0,lt=0,raf=0;
    function sync(){const h=document.querySelector('[data-hero-section="true"]');if(!h)return;const r=h.getBoundingClientRect();baseTop=Math.max(0,r.top+scrollY);layer.style.top=baseTop+'px';}
    function resize(){sync();W=Math.max(320,innerWidth);H=Math.max(620,Math.min(940,innerHeight));D=Math.min(2,devicePixelRatio||1);cv.width=W*D;cv.height=H*D;c.setTransform(D,0,0,D,0,0);const m=W<760;R=m?Math.min(W*.42,190):Math.min(W*.205,H*.31,285);cx=W*.5;cy=m?Math.min(300,H*.39):H*.47;}
    function proj(lon,lat,rot,tilt){const la=deg(lat),lo=deg(lon)+rot,x0=Math.cos(la)*Math.sin(lo),z0=Math.cos(la)*Math.cos(lo),y0=-Math.sin(la),ct=Math.cos(tilt),st=Math.sin(tilt),y=y0*ct-z0*st,z=y0*st+z0*ct;return{x:cx+x0*R,y:cy+y*R,z};}
    function lineOrbit(rx,ry,a,alpha){c.save();c.translate(cx,cy);c.rotate(a);c.beginPath();c.ellipse(0,0,rx,ry,0,0,TAU);c.strokeStyle=`rgba(240,240,248,${alpha})`;c.lineWidth=.65;c.stroke();c.restore();}
    function pill(p,text){if(!text||p.z<-.05)return;c.save();c.font=(W<760?'9px':'10px')+' ui-monospace,monospace';const tw=c.measureText(text).width,bw=tw+34,bh=24;let x=p.x+13,y=p.y-35;if(x+bw>W-12)x=p.x-bw-13;c.beginPath();c.roundRect(x,y,bw,bh,12);c.fillStyle='rgba(18,18,18,.94)';c.fill();c.strokeStyle='rgba(255,255,255,.16)';c.stroke();c.beginPath();c.arc(x+12,y+12,3,0,TAU);c.fillStyle='#e4007c';c.shadowBlur=12;c.shadowColor='#e4007c';c.fill();c.shadowBlur=0;c.fillStyle='rgba(240,240,248,.72)';c.textBaseline='middle';c.fillText(text,x+21,y+12);c.restore();}
    function route(a,b,t){if(a.z<-.2&&b.z<-.2)return;c.save();c.beginPath();c.moveTo(a.x,a.y);c.quadraticCurveTo((a.x+b.x)/2,(a.y+b.y)/2-R*.26,b.x,b.y);c.strokeStyle='rgba(228,0,124,.48)';c.lineWidth=.8;c.stroke();const q=(t*.00012)%1,ix=(1-q)*(1-q)*a.x+2*(1-q)*q*((a.x+b.x)/2)+q*q*b.x,iy=(1-q)*(1-q)*a.y+2*(1-q)*q*((a.y+b.y)/2-R*.26)+q*q*b.y;c.beginPath();c.arc(ix,iy,2.3,0,TAU);c.fillStyle='#e4007c';c.shadowBlur=10;c.shadowColor='#e4007c';c.fill();c.restore();}
    function inside(x,y){return Math.hypot(x-cx,y-cy)<R*1.12}
    cv.addEventListener('pointerdown',e=>{const r=cv.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;if(!inside(x,y))return;down=true;lx=e.clientX;ly=e.clientY;lt=performance.now();vx=vy=0;cv.setPointerCapture(e.pointerId);cv.style.cursor='grabbing';e.preventDefault()});
    cv.addEventListener('pointermove',e=>{const r=cv.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;if(!down){cv.style.cursor=inside(x,y)?'grab':'default';return}const n=performance.now(),dt=Math.max(8,n-lt),dx=e.clientX-lx,dy=e.clientY-ly,dr=dx/Math.max(150,R),dv=dy/Math.max(150,R)*.65;drag+=dr;tiltDrag=clamp(tiltDrag+dv,-.8,.8);vx=dr*16/dt;vy=dv*16/dt;lx=e.clientX;ly=e.clientY;lt=n;e.preventDefault()});
    const up=e=>{if(!down)return;down=false;cv.style.cursor='grab';try{cv.releasePointerCapture(e.pointerId)}catch{}};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);

    function frame(t){
      if(!down){drag+=vx;tiltDrag=clamp(tiltDrag+vy,-.8,.8);vx*=.95;vy*=.92}
      const focus=visitor? -deg(visitor.lng):deg(-20);
      const rot=focus+drag+t*.000035,tilt=deg(-8)+tiltDrag;
      c.clearRect(0,0,W,H);
      const glow=c.createRadialGradient(cx-R*.25,cy-R*.28,R*.06,cx,cy,R*1.15);glow.addColorStop(0,'rgba(255,255,255,.075)');glow.addColorStop(.8,'rgba(255,255,255,.015)');glow.addColorStop(1,'transparent');c.fillStyle=glow;c.beginPath();c.arc(cx,cy,R*1.18,0,TAU);c.fill();
      lineOrbit(R*1.22,R*.34,-.22+t*.00001,.10);lineOrbit(R*1.18,R*.26,.42-t*.000008,.08);lineOrbit(R*1.12,R*.46,.08+t*.000006,.055);
      c.save();c.beginPath();c.arc(cx,cy,R,0,TAU);c.clip();
      for(const d of land){const p=proj(d[0],d[1],rot,tilt);if(p.z<-.05)continue;const z=clamp((p.z+.05)/1.05,0,1);c.beginPath();c.arc(p.x,p.y,.55+z*.92,0,TAU);c.fillStyle=`rgba(240,240,248,${.16+z*.78})`;c.fill()}
      c.restore();
      c.beginPath();c.arc(cx,cy,R+.5,0,TAU);c.strokeStyle='rgba(240,240,248,.22)';c.lineWidth=.8;c.stroke();
      if(visitor){const a=proj(-100.3161,25.6866,rot,tilt),b=proj(visitor.lng,visitor.lat,rot,tilt);route(a,b,t);if(b.z>-.08){c.beginPath();c.arc(b.x,b.y,3,0,TAU);c.fillStyle='#e4007c';c.fill();pill(b,'ONLINE · '+String(visitor.city||visitor.country||'ONLINE').toUpperCase())}}
      raf=requestAnimationFrame(frame);
    }
    resize();addEventListener('resize',resize,{passive:true});raf=requestAnimationFrame(frame);
    const keep=setInterval(()=>{const h=document.querySelector('[data-hero-section="true"]');if(!h){layer.style.display='none';return}layer.style.display='block';sync();if(layer.parentNode!==document.body)document.body.appendChild(layer)},800);
    addEventListener('pagehide',()=>{clearInterval(keep);cancelAnimationFrame(raf)},{once:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
