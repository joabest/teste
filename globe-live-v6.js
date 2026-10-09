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
  for(let lat=-72;lat<=80;lat+=.88){
    const step=.84/Math.max(.34,Math.cos(deg(lat)));
    for(let lon=-180;lon<180;lon+=step){
      if(CONTINENTS.some(p=>inPoly(lon,lat,p))) land.push([lon,lat]);
    }
  }

  let visitor=null;
  const valid=d=>d&&Number.isFinite(+d.lat)&&Number.isFinite(+d.lng);
  async function locate(){
    const providers=[
      async()=>{const d=await fetch('https://ipapi.co/json/?v=8',{cache:'no-store'}).then(r=>{if(!r.ok)throw 0;return r.json()});return {lat:+d.latitude,lng:+d.longitude,city:d.city||d.region||'',country:d.country_code||''}},
      async()=>{const d=await fetch('https://ipwho.is/?v=8',{cache:'no-store'}).then(r=>r.json());if(d.success===false)throw 0;return {lat:+d.latitude,lng:+d.longitude,city:d.city||d.region||'',country:d.country_code||''}},
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
    document.getElementById('we-globe-live-v6')?.remove();

    const layer=document.createElement('div');
    layer.id='we-globe-live-v6';
    layer.setAttribute('aria-hidden','true');
    Object.assign(layer.style,{position:'absolute',left:'0',width:'100%',height:'min(940px,100svh)',minHeight:'620px',zIndex:'9',pointerEvents:'none',overflow:'hidden'});

    const cv=document.createElement('canvas');
    Object.assign(cv.style,{position:'absolute',inset:'0',width:'100%',height:'100%',pointerEvents:'auto',touchAction:'pan-y',cursor:'default'});
    layer.appendChild(cv);document.body.appendChild(layer);
    const c=cv.getContext('2d',{alpha:true});if(!c)return;

    let W=0,H=0,D=1,cx=0,cy=0,R=0,baseTop=0,drag=0,tiltDrag=0,vx=0,vy=0,down=false,lx=0,ly=0,lt=0,raf=0;

    function sync(){const h=document.querySelector('[data-hero-section="true"]');if(!h)return;const r=h.getBoundingClientRect();baseTop=Math.max(0,r.top+scrollY);layer.style.top=baseTop+'px';}
    function resize(){
      sync();W=Math.max(320,innerWidth);H=Math.max(620,Math.min(940,innerHeight));D=Math.min(2,devicePixelRatio||1);
      cv.width=Math.round(W*D);cv.height=Math.round(H*D);c.setTransform(D,0,0,D,0,0);
      const m=W<760;
      R=m?Math.min(W*.41,190):Math.min(W*.215,H*.315,292);
      cx=W*.5;cy=m?Math.min(295,H*.39):H*.455;
    }

    function proj(lon,lat,rot,tilt){
      const la=deg(lat),lo=deg(lon)+rot,x0=Math.cos(la)*Math.sin(lo),z0=Math.cos(la)*Math.cos(lo),y0=-Math.sin(la),ct=Math.cos(tilt),st=Math.sin(tilt),y=y0*ct-z0*st,z=y0*st+z0*ct;
      return{x:cx+x0*R,y:cy+y*R,z};
    }

    function orbit(rx,ry,a,alpha,phase,t){
      c.save();c.translate(cx,cy);c.rotate(a+Math.sin(t*.00007+phase)*.035);
      c.beginPath();c.ellipse(0,0,rx,ry,0,0,TAU);
      c.strokeStyle=`rgba(240,240,248,${alpha})`;c.lineWidth=.52;c.stroke();c.restore();
    }

    function pill(p,text){
      if(!text||p.z<-.08)return;
      c.save();c.font=(W<760?'8px':'10px')+' ui-monospace,monospace';
      const tw=c.measureText(text).width,bw=tw+34,bh=23;let x=p.x+13,y=p.y-34;
      if(x+bw>W-12)x=p.x-bw-13;
      c.beginPath();c.roundRect(x,y,bw,bh,11.5);c.fillStyle='rgba(18,18,18,.92)';c.fill();
      c.strokeStyle='rgba(255,255,255,.11)';c.lineWidth=.7;c.stroke();
      c.beginPath();c.arc(x+12,y+11.5,3,0,TAU);c.fillStyle='#e4007c';c.shadowBlur=11;c.shadowColor='#e4007c';c.fill();c.shadowBlur=0;
      c.fillStyle='rgba(240,240,248,.62)';c.textBaseline='middle';c.fillText(text,x+21,y+11.5);c.restore();
    }

    function route(a,b,t){
      if(a.z<-.35&&b.z<-.35)return;
      c.save();
      const mx=(a.x+b.x)/2,my=(a.y+b.y)/2-R*.20;
      c.beginPath();c.moveTo(a.x,a.y);c.quadraticCurveTo(mx,my,b.x,b.y);
      c.strokeStyle='rgba(228,0,124,.43)';c.lineWidth=.72;c.stroke();
      const q=(t*.0001)%1,ix=(1-q)*(1-q)*a.x+2*(1-q)*q*mx+q*q*b.x,iy=(1-q)*(1-q)*a.y+2*(1-q)*q*my+q*q*b.y;
      c.beginPath();c.arc(ix,iy,1.8,0,TAU);c.fillStyle='#e4007c';c.shadowBlur=8;c.shadowColor='#e4007c';c.fill();c.restore();
    }

    function inside(x,y){return Math.hypot(x-cx,y-cy)<R*1.12}
    cv.addEventListener('pointerdown',e=>{const r=cv.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;if(!inside(x,y))return;down=true;lx=e.clientX;ly=e.clientY;lt=performance.now();vx=vy=0;cv.setPointerCapture(e.pointerId);cv.style.cursor='grabbing';e.preventDefault()});
    cv.addEventListener('pointermove',e=>{const r=cv.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;if(!down){cv.style.cursor=inside(x,y)?'grab':'default';return}const n=performance.now(),dt=Math.max(8,n-lt),dx=e.clientX-lx,dy=e.clientY-ly,dr=dx/Math.max(150,R),dv=dy/Math.max(150,R)*.58;drag+=dr;tiltDrag=clamp(tiltDrag+dv,-.75,.75);vx=dr*16/dt;vy=dv*16/dt;lx=e.clientX;ly=e.clientY;lt=n;e.preventDefault()});
    const up=e=>{if(!down)return;down=false;cv.style.cursor='grab';try{cv.releasePointerCapture(e.pointerId)}catch{}};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);

    function frame(t){
      if(!down){drag+=vx;tiltDrag=clamp(tiltDrag+vy,-.75,.75);vx*=.95;vy*=.92}
      const focus=visitor?-deg(visitor.lng):deg(-25);
      const geoTilt=visitor?deg(-visitor.lat*.42):deg(-7);
      const rot=focus+drag+t*.000024,tilt=geoTilt+tiltDrag;
      c.clearRect(0,0,W,H);

      // Dark glass sphere, then a soft illuminated rim like the live reference.
      const body=c.createRadialGradient(cx-R*.30,cy-R*.34,R*.05,cx,cy,R*1.03);
      body.addColorStop(0,'rgba(255,255,255,.035)');body.addColorStop(.42,'rgba(34,34,36,.16)');body.addColorStop(.82,'rgba(10,10,12,.28)');body.addColorStop(1,'rgba(0,0,0,.48)');
      c.fillStyle=body;c.beginPath();c.arc(cx,cy,R,0,TAU);c.fill();

      const halo=c.createRadialGradient(cx-R*.28,cy-R*.30,R*.08,cx,cy,R*1.18);
      halo.addColorStop(0,'rgba(255,255,255,.055)');halo.addColorStop(.78,'rgba(255,255,255,.01)');halo.addColorStop(1,'transparent');
      c.fillStyle=halo;c.beginPath();c.arc(cx,cy,R*1.19,0,TAU);c.fill();

      // Multiple faint live orbital traces.
      orbit(R*1.30,R*.32,-.25,.065,.1,t);orbit(R*1.26,R*.24,.38,.05,.9,t);orbit(R*1.20,R*.43,.08,.040,1.6,t);
      orbit(R*1.17,R*.17,-.67,.033,2.2,t);orbit(R*1.24,R*.29,.73,.036,2.8,t);orbit(R*1.18,R*.38,-1.02,.028,3.4,t);
      orbit(R*1.10,R*.52,.48,.022,4.1,t);orbit(R*1.14,R*.21,1.18,.026,4.7,t);

      c.save();c.beginPath();c.arc(cx,cy,R,0,TAU);c.clip();
      for(const d of land){
        const p=proj(d[0],d[1],rot,tilt);
        if(p.z<-.30)continue;
        const front=clamp((p.z+.30)/1.30,0,1);
        const rr=Math.hypot(p.x-cx,p.y-cy)/R;
        const rim=clamp((rr-.66)/.34,0,1);
        const alpha=.055+front*.68+rim*.16;
        const size=.22+front*.48+rim*.16;
        c.beginPath();c.arc(p.x,p.y,size,0,TAU);
        c.fillStyle=`rgba(240,240,248,${Math.min(.92,alpha)})`;c.fill();
      }
      c.restore();

      // Layered rim: brighter at the upper-left and lower edge, subtler elsewhere.
      c.save();
      c.beginPath();c.arc(cx,cy,R+.4,0,TAU);c.strokeStyle='rgba(240,240,248,.18)';c.lineWidth=.7;c.stroke();
      c.beginPath();c.arc(cx,cy,R+1.2,deg(195),deg(338));c.strokeStyle='rgba(240,240,248,.34)';c.lineWidth=1.1;c.shadowBlur=7;c.shadowColor='rgba(255,255,255,.22)';c.stroke();
      c.beginPath();c.arc(cx,cy,R+1.0,deg(18),deg(108));c.strokeStyle='rgba(240,240,248,.23)';c.lineWidth=.9;c.stroke();
      c.restore();

      if(visitor){
        const a=proj(-100.3161,25.6866,rot,tilt),b=proj(visitor.lng,visitor.lat,rot,tilt);
        route(a,b,t);
        if(b.z>-.16){
          c.beginPath();c.arc(b.x,b.y,2.5,0,TAU);c.fillStyle='#e4007c';c.shadowBlur=8;c.shadowColor='#e4007c';c.fill();c.shadowBlur=0;
          pill(b,'ONLINE · '+String(visitor.city||visitor.country||'ONLINE').toUpperCase());
        }
      }

      raf=requestAnimationFrame(frame);
    }

    resize();addEventListener('resize',resize,{passive:true});raf=requestAnimationFrame(frame);
    const keep=setInterval(()=>{const h=document.querySelector('[data-hero-section="true"]');if(!h){layer.style.display='none';return}layer.style.display='block';sync();if(layer.parentNode!==document.body)document.body.appendChild(layer)},800);
    addEventListener('pagehide',()=>{clearInterval(keep);cancelAnimationFrame(raf)},{once:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
