(() => {
  'use strict';
  if (window.__WE_INTERACTIVE_GLOBE_V13__) return;
  window.__WE_INTERACTIVE_GLOBE_V13__ = true;

  const TAU = Math.PI * 2;
  const deg = v => v * Math.PI / 180;
  const clamp = (v,min,max) => Math.max(min,Math.min(max,v));

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

  function inPoly(lon,lat,p){
    let inside=false;
    for(let i=0,j=p.length-1;i<p.length;j=i++){
      const xi=p[i][0], yi=p[i][1], xj=p[j][0], yj=p[j][1];
      if(((yi>lat)!=(yj>lat)) && lon < (xj-xi)*(lat-yi)/((yj-yi)||1e-6)+xi) inside=!inside;
    }
    return inside;
  }

  const land=[];
  for(let lat=-72;lat<=80;lat+=1.12){
    const step=1.08/Math.max(.38,Math.cos(deg(lat)));
    for(let lon=-180;lon<180;lon+=step){
      if(CONTINENTS.some(p=>inPoly(lon,lat,p))) land.push([lon,lat]);
    }
  }

  // Secondary nodes are visual network anchors only. The principal node is replaced
  // by the visitor's approximate IP location when that lookup is available.
  const SECONDARY = [
    {lat:40.7128,lng:-74.0060,phase:.4,speed:.00075},
    {lat:51.5074,lng:-.1278,phase:1.7,speed:.00062},
    {lat:25.2048,lng:55.2708,phase:2.9,speed:.00069},
    {lat:35.6762,lng:139.6503,phase:4.1,speed:.00058},
    {lat:1.3521,lng:103.8198,phase:5.3,speed:.00072},
    {lat:-33.8688,lng:151.2093,phase:6.2,speed:.00064}
  ];
  const FALLBACK_MAIN={lat:19.4326,lng:-99.1332,city:'ONLINE',country:''};

  let visitor=null;

  function boot(){
    const hero=document.querySelector('[data-hero-section="true"]');
    if(!hero) return;

    ['we-globe-static-v9','we-globe-live-v6','we-globe-live-v5','we-globe-layer-v3','we-globe-layer','we-globe-fallback'].forEach(id=>document.getElementById(id)?.remove());

    const layer=document.createElement('div');
    layer.id='we-globe-interactive-v13';
    layer.setAttribute('aria-hidden','true');
    Object.assign(layer.style,{position:'absolute',left:'0',width:'100%',height:'min(940px,100svh)',minHeight:'620px',zIndex:'8',pointerEvents:'none',overflow:'hidden'});

    const base=document.createElement('canvas');
    const fx=document.createElement('canvas');
    for(const cv of [base,fx]) Object.assign(cv.style,{position:'absolute',inset:'0',width:'100%',height:'100%',pointerEvents:'none'});
    layer.append(base,fx);

    const hit=document.createElement('div');
    hit.setAttribute('role','presentation');
    Object.assign(hit.style,{position:'absolute',borderRadius:'50%',pointerEvents:'auto',touchAction:'none',cursor:'grab',background:'transparent'});
    layer.appendChild(hit);
    document.body.appendChild(layer);

    const b=base.getContext('2d',{alpha:true});
    const f=fx.getContext('2d',{alpha:true});
    if(!b||!f){ layer.remove(); return; }

    let W=0,H=0,D=1,R=0,cx=0,cy=0;
    let rotOffset=0;
    let tilt=deg(-8);
    let dragging=false,lastX=0,lastY=0;
    let baseRAF=0;
    let fxRAF=0,lastFx=0,inView=true;

    const principal=()=>visitor||FALLBACK_MAIN;
    const rotation=()=>-deg(principal().lng)+rotOffset;

    function project(lon,lat){
      const la=deg(lat), lo=deg(lon)+rotation();
      const x0=Math.cos(la)*Math.sin(lo), z0=Math.cos(la)*Math.cos(lo), y0=-Math.sin(la);
      const ct=Math.cos(tilt), st=Math.sin(tilt);
      return {x:cx+x0*R,y:cy+(y0*ct-z0*st)*R,z:y0*st+z0*ct};
    }

    function sync(){
      const r=hero.getBoundingClientRect();
      layer.style.top=Math.max(0,r.top+scrollY)+'px';
    }

    function geometry(){
      sync();
      W=Math.max(320,innerWidth);
      H=Math.max(620,Math.min(940,innerHeight));
      D=Math.min(W<760?1.18:1.35,devicePixelRatio||1);
      const mobile=W<760;
      R=mobile?Math.min(W*.41,186):Math.min(W*.205,H*.31,285);
      cx=W*.5;
      cy=mobile?Math.min(300,H*.39):H*.47;

      for(const cv of [base,fx]){
        cv.width=Math.round(W*D); cv.height=Math.round(H*D);
        cv.getContext('2d').setTransform(D,0,0,D,0,0);
      }
      const pad=R*.12;
      Object.assign(hit.style,{left:(cx-R-pad)+'px',top:(cy-R-pad)+'px',width:(R*2+pad*2)+'px',height:(R*2+pad*2)+'px'});
    }

    function drawNetworkLines(){
      const main=project(principal().lng,principal().lat);
      if(main.z<.02) return;
      b.save();
      b.lineWidth=.55;
      b.lineCap='round';
      for(const node of SECONDARY){
        const p=project(node.lng,node.lat);
        if(p.z<.02) continue;
        const dx=p.x-main.x, dy=p.y-main.y;
        const mx=(main.x+p.x)/2, my=(main.y+p.y)/2;
        const len=Math.hypot(dx,dy)||1;
        const bend=Math.min(R*.16,len*.13);
        const qx=mx-dy/len*bend;
        const qy=my+dx/len*bend;
        b.beginPath();
        b.moveTo(main.x,main.y);
        b.quadraticCurveTo(qx,qy,p.x,p.y);
        b.strokeStyle='rgba(248,248,252,.24)';
        b.stroke();
      }
      b.restore();
    }

    function drawBaseNow(){
      b.setTransform(D,0,0,D,0,0);
      b.clearRect(0,0,W,H);

      const halo=b.createRadialGradient(cx-R*.25,cy-R*.28,R*.08,cx,cy,R*1.14);
      halo.addColorStop(0,'rgba(255,255,255,.055)');
      halo.addColorStop(.72,'rgba(255,255,255,.012)');
      halo.addColorStop(1,'rgba(255,255,255,0)');
      b.fillStyle=halo; b.beginPath(); b.arc(cx,cy,R*1.16,0,TAU); b.fill();

      const orbit=(rx,ry,a,alpha)=>{
        b.save(); b.translate(cx,cy); b.rotate(a); b.beginPath(); b.ellipse(0,0,rx,ry,0,0,TAU);
        b.strokeStyle=`rgba(240,240,248,${alpha})`; b.lineWidth=.48; b.stroke(); b.restore();
      };
      orbit(R*1.22,R*.34,-.22,.055);
      orbit(R*1.18,R*.26,.42,.045);
      orbit(R*1.12,R*.46,.08,.035);

      b.save(); b.beginPath(); b.arc(cx,cy,R,0,TAU); b.clip();
      for(const d of land){
        const p=project(d[0],d[1]);
        if(p.z<-.04) continue;
        const z=clamp((p.z+.04)/1.04,0,1);
        b.beginPath(); b.arc(p.x,p.y,.34+z*.74,0,TAU);
        b.fillStyle=`rgba(240,240,248,${.12+z*.76})`; b.fill();
      }
      b.restore();

      drawNetworkLines();

      b.beginPath(); b.arc(cx,cy,R+.4,0,TAU); b.strokeStyle='rgba(240,240,248,.17)'; b.lineWidth=.65; b.stroke();
      b.beginPath(); b.arc(cx-R*.21,cy-R*.18,R*.96,deg(205),deg(318)); b.strokeStyle='rgba(255,255,255,.21)'; b.lineWidth=.9; b.stroke();

      if(visitor){
        const p=project(visitor.lng,visitor.lat);
        if(p.z>.02){
          const mobile=W<760;
          const text='ONLINE · '+String(visitor.city||visitor.country||'ONLINE').toUpperCase();
          b.font=(mobile?'9px':'10px')+' ui-monospace,monospace';
          const tw=b.measureText(text).width, bw=tw+32, bh=23;
          let x=p.x+12, y=p.y-34;
          if(x+bw>W-10) x=p.x-bw-12;
          b.beginPath(); b.roundRect(x,y,bw,bh,11.5); b.fillStyle='rgba(18,18,18,.88)'; b.fill();
          b.strokeStyle='rgba(255,255,255,.11)'; b.lineWidth=.6; b.stroke();
          b.beginPath(); b.arc(x+11,y+11.5,2.7,0,TAU); b.fillStyle='#ff2b93'; b.fill();
          b.fillStyle='rgba(240,240,248,.68)'; b.textBaseline='middle'; b.fillText(text,x+20,y+11.5);
        }
      }
    }

    function scheduleBase(){
      if(baseRAF) return;
      baseRAF=requestAnimationFrame(()=>{baseRAF=0;drawBaseNow();});
    }

    function dot(ctx,p,r,color,alpha,glow){
      if(p.z<.015) return;
      const depth=clamp((p.z-.015)/.985,0,1);
      const a=alpha*(.42+.58*depth);
      if(glow){
        ctx.beginPath(); ctx.arc(p.x,p.y,r*3.1,0,TAU);
        ctx.fillStyle=color.replace('1)',`${Math.min(.12,a*.14)})`); ctx.fill();
      }
      ctx.beginPath(); ctx.arc(p.x,p.y,r,0,TAU);
      ctx.fillStyle=color.replace('1)',`${a})`); ctx.fill();
    }

    function drawFx(now){
      fxRAF=0;
      if(!inView||document.hidden) return;
      if(now-lastFx<48){ fxRAF=requestAnimationFrame(drawFx); return; }
      lastFx=now;
      f.setTransform(D,0,0,D,0,0);
      f.clearRect(0,0,W,H);

      const main=project(principal().lng,principal().lat);
      const mainPulse=.82+.10*Math.sin(now*.00068);
      dot(f,main,3.15,'rgba(255,43,147,1)',mainPulse,true);

      SECONDARY.forEach(node=>{
        const p=project(node.lng,node.lat);
        const pulse=.56+.12*Math.sin(now*node.speed+node.phase);
        dot(f,p,2.05,'rgba(255,255,255,1)',pulse,true);
      });

      fxRAF=requestAnimationFrame(drawFx);
    }

    function startFx(){
      if(fxRAF||!inView||document.hidden) return;
      fxRAF=requestAnimationFrame(drawFx);
    }
    function stopFx(){
      if(fxRAF) cancelAnimationFrame(fxRAF);
      fxRAF=0;
    }

    hit.addEventListener('pointerdown',e=>{
      dragging=true; lastX=e.clientX; lastY=e.clientY;
      hit.setPointerCapture?.(e.pointerId);
      hit.style.cursor='grabbing';
    });
    hit.addEventListener('pointermove',e=>{
      if(!dragging) return;
      const dx=e.clientX-lastX, dy=e.clientY-lastY;
      lastX=e.clientX; lastY=e.clientY;
      rotOffset+=dx*.0062;
      tilt=clamp(tilt+dy*.0038,deg(-24),deg(20));
      scheduleBase();
    });
    const release=e=>{
      if(!dragging) return;
      dragging=false;
      try{hit.releasePointerCapture?.(e.pointerId)}catch{}
      hit.style.cursor='grab';
      scheduleBase();
    };
    hit.addEventListener('pointerup',release);
    hit.addEventListener('pointercancel',release);

    let resizeTimer;
    addEventListener('resize',()=>{
      clearTimeout(resizeTimer);
      resizeTimer=setTimeout(()=>{geometry();drawBaseNow();},120);
    },{passive:true});

    const io=new IntersectionObserver(entries=>{
      inView=!!entries[0]?.isIntersecting;
      if(inView) startFx(); else stopFx();
    },{rootMargin:'160px 0px'});
    io.observe(layer);
    document.addEventListener('visibilitychange',()=>document.hidden?stopFx():startFx());

    geometry();
    drawBaseNow();
    startFx();

    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),1800);
    fetch('https://ipapi.co/json/',{cache:'no-store',signal:controller.signal})
      .then(r=>r.ok?r.json():Promise.reject())
      .then(d=>{
        const lat=+d.latitude,lng=+d.longitude;
        if(Number.isFinite(lat)&&Number.isFinite(lng)){
          visitor={lat,lng,city:d.city||d.region||'',country:d.country_code||''};
          rotOffset=0;
          drawBaseNow();
        }
      })
      .catch(()=>{})
      .finally(()=>clearTimeout(timeout));
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
})();
