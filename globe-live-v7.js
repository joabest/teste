(() => {
  'use strict';
  if (window.__WE_GLOBE_V16__) return;
  window.__WE_GLOBE_V16__ = true;

  const TAU=Math.PI*2, RAD=Math.PI/180;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const HQ={lat:25.6866,lng:-100.3161,city:'MONTERREY'};
  const NETWORK=[
    [{lat:25.6866,lng:-100.3161},{lat:40.7128,lng:-74.0060}],
    [{lat:25.6866,lng:-100.3161},{lat:51.5074,lng:-0.1278}],
    [{lat:40.7128,lng:-74.0060},{lat:-23.5505,lng:-46.6333}],
    [{lat:51.5074,lng:-0.1278},{lat:25.2048,lng:55.2708}],
    [{lat:25.2048,lng:55.2708},{lat:1.3521,lng:103.8198}],
    [{lat:1.3521,lng:103.8198},{lat:35.6762,lng:139.6503}],
    [{lat:35.6762,lng:139.6503},{lat:-33.8688,lng:151.2093}],
    [{lat:-33.8688,lng:151.2093},{lat:-23.5505,lng:-46.6333}]
  ];

  let visitor=null, land=[];

  const vec=(lat,lng)=>{const a=lat*RAD,b=lng*RAD,c=Math.cos(a);return[c*Math.sin(b),Math.sin(a),c*Math.cos(b)]};
  const fromVec=v=>{const m=Math.hypot(...v)||1,x=v[0]/m,y=v[1]/m,z=v[2]/m;return{lat:Math.asin(y)/RAD,lng:Math.atan2(x,z)/RAD}};
  const slerp=(a,b,t)=>{
    const A=vec(a.lat,a.lng),B=vec(b.lat,b.lng),d=clamp(A[0]*B[0]+A[1]*B[1]+A[2]*B[2],-1,1),ang=Math.acos(d);
    if(ang<1e-5)return{lat:a.lat,lng:a.lng};
    const s=Math.sin(ang),wa=Math.sin((1-t)*ang)/s,wb=Math.sin(t*ang)/s;
    return fromVec([A[0]*wa+B[0]*wb,A[1]*wa+B[1]*wb,A[2]*wa+B[2]*wb]);
  };

  function rasterizeGeojson(data,mobile){
    const mw=mobile?720:1080,mh=mw/2;
    const c=document.createElement('canvas');c.width=mw;c.height=mh;
    const x=c.getContext('2d');x.fillStyle='#fff';
    const px=lon=>(lon+180)/360*mw, py=lat=>(90-lat)/180*mh;
    const ring=r=>{
      if(!r||r.length<3)return;
      let last=r[0],started=false;
      for(let i=0;i<r.length;i++){
        const p=r[i];
        if(i&&Math.abs(p[0]-last[0])>180){started=false;last=p;continue}
        if(!started){x.moveTo(px(p[0]),py(p[1]));started=true}else x.lineTo(px(p[0]),py(p[1]));
        last=p;
      }
      x.closePath();
    };
    for(const f of data.features||[]){
      const g=f.geometry;if(!g)continue;x.beginPath();
      if(g.type==='Polygon')for(const r of g.coordinates)ring(r);
      else if(g.type==='MultiPolygon')for(const p of g.coordinates)for(const r of p)ring(r);
      x.fill('evenodd');
    }
    const img=x.getImageData(0,0,mw,mh).data,pts=[];
    const step=mobile?3.15:3.2;
    for(let yy=step*.5;yy<mh;yy+=step){
      for(let xx=step*.5;xx<mw;xx+=step){
        if(img[((yy|0)*mw+(xx|0))*4+3]>80){
          const hash=Math.sin(xx*12.9898+yy*78.233)*43758.5453;
          const j=(hash-Math.floor(hash)-.5)*.65;
          pts.push([xx/mw*360-180+j,90-yy/mh*180+j*.35]);
        }
      }
    }
    return pts;
  }

  async function getVisitor(){
    const req=(url,ms=2300)=>{const ac=new AbortController(),id=setTimeout(()=>ac.abort(),ms);return fetch(url,{cache:'no-store',signal:ac.signal}).then(r=>{clearTimeout(id);if(!r.ok)throw 0;return r.json()})};
    try{const d=await req('https://ipapi.co/json/');const lat=+d.latitude,lng=+d.longitude;if(Number.isFinite(lat)&&Number.isFinite(lng))return{lat,lng,city:d.city||d.region||d.country_name||'ONLINE'}}catch{}
    try{const d=await req('https://ipwho.is/');const lat=+d.latitude,lng=+d.longitude;if(d.success!==false&&Number.isFinite(lat)&&Number.isFinite(lng))return{lat,lng,city:d.city||d.region||d.country||'ONLINE'}}catch{}
    return{lat:-23.5505,lng:-46.6333,city:'SÃO PAULO'};
  }

  function boot(){
    const hero=document.querySelector('[data-hero-section="true"]');
    if(!hero)return setTimeout(boot,150);

    ['we-globe-interactive-v13','we-globe-original-v15','we-globe-original-v16','we-globe-live-v6','we-globe-fallback'].forEach(id=>document.getElementById(id)?.remove());

    const layer=document.createElement('div');
    layer.id='we-globe-original-v16';layer.setAttribute('aria-hidden','true');
    Object.assign(layer.style,{position:'absolute',left:'0',width:'100%',height:'min(980px,100svh)',minHeight:'610px',zIndex:'8',pointerEvents:'none',overflow:'hidden'});
    const canvas=document.createElement('canvas');
    Object.assign(canvas.style,{position:'absolute',inset:'0',width:'100%',height:'100%',pointerEvents:'none',opacity:'0',transition:'opacity .45s ease'});
    const hit=document.createElement('div');
    Object.assign(hit.style,{position:'absolute',borderRadius:'50%',pointerEvents:'auto',touchAction:'none',cursor:'grab',background:'transparent'});
    layer.append(canvas,hit);document.body.appendChild(layer);

    const ctx=canvas.getContext('2d',{alpha:true});if(!ctx){layer.remove();return}
    let W=0,H=0,D=1,R=0,cx=0,cy=0,yaw=0,pitch=7*RAD,drag=false,lx=0,ly=0,vx=0,vy=0,auto=0,last=performance.now(),raf=0,visible=true,lastPaint=0;
    const principal=()=>visitor||{lat:-23.5505,lng:-46.6333,city:'SÃO PAULO'};

    function sync(){const r=hero.getBoundingClientRect();layer.style.top=(scrollY+r.top)+'px'}
    function resize(){
      sync();W=Math.max(320,innerWidth);H=Math.max(610,Math.min(980,innerHeight));const mobile=W<760;
      D=Math.min(devicePixelRatio||1,mobile?1.35:1.65);
      R=mobile?Math.min(W*.19,88):Math.min(W*.158,H*.285,270);
      cx=W*.5;cy=mobile?Math.min(H*.19,170):H*.405;
      canvas.width=Math.round(W*D);canvas.height=Math.round(H*D);ctx.setTransform(D,0,0,D,0,0);
      const p=R*.22;Object.assign(hit.style,{left:(cx-R-p)+'px',top:(cy-R-p)+'px',width:(2*(R+p))+'px',height:(2*(R+p))+'px'});
    }

    function orientation(){return -(principal().lng*RAD)+.22+yaw+auto}
    function project(lon,lat,scale=1){
      const la=lat*RAD,lo=lon*RAD+orientation(),c=Math.cos(la),X=c*Math.sin(lo),Z=c*Math.cos(lo),Y=-Math.sin(la),cp=Math.cos(pitch),sp=Math.sin(pitch),yy=Y*cp-Z*sp,zz=Y*sp+Z*cp;
      return{x:cx+X*R*scale,y:cy+yy*R*scale,z:zz};
    }

    function ellipse(rx,ry,a,alpha,shift=0){ctx.save();ctx.translate(cx,cy);ctx.rotate(a);ctx.beginPath();ctx.ellipse(0,shift,rx,ry,0,0,TAU);ctx.lineWidth=.45;ctx.strokeStyle=`rgba(225,225,234,${alpha})`;ctx.stroke();ctx.restore()}
    function drawDecorativeOrbits(){
      ellipse(R*1.24,R*.31,-.22,.10);ellipse(R*1.17,R*.20,.35,.075);ellipse(R*1.12,R*.49,.08,.07);ellipse(R*1.27,R*.16,-.57,.07,R*.03);ellipse(R*1.15,R*.42,.68,.055,-R*.03);ellipse(R*1.07,R*.60,-.79,.05);ellipse(R*1.28,R*.29,.98,.045);
    }

    function drawSphere(){
      const aura=ctx.createRadialGradient(cx,cy,R*.74,cx,cy,R*1.22);aura.addColorStop(0,'rgba(245,245,250,0)');aura.addColorStop(.68,'rgba(245,245,250,.028)');aura.addColorStop(1,'rgba(245,245,250,0)');ctx.fillStyle=aura;ctx.beginPath();ctx.arc(cx,cy,R*1.22,0,TAU);ctx.fill();
      const bg=ctx.createRadialGradient(cx-R*.28,cy-R*.34,R*.06,cx,cy,R*1.03);bg.addColorStop(0,'rgba(54,54,60,.20)');bg.addColorStop(.45,'rgba(16,16,19,.50)');bg.addColorStop(.88,'rgba(5,5,7,.77)');bg.addColorStop(1,'rgba(1,1,2,.91)');ctx.fillStyle=bg;ctx.beginPath();ctx.arc(cx,cy,R,0,TAU);ctx.fill();
      ctx.save();ctx.beginPath();ctx.arc(cx,cy,R-.25,0,TAU);ctx.clip();
      const bins=[[],[],[],[]];
      for(const p of land){const q=project(p[0],p[1]);if(q.z<=.015)continue;bins[Math.min(3,(q.z*4)|0)].push(q)}
      const alpha=[.22,.34,.53,.82],size=[.48,.56,.67,.79];
      for(let b=0;b<4;b++){
        ctx.fillStyle=`rgba(238,238,244,${alpha[b]})`;
        const s=size[b];for(const q of bins[b])ctx.fillRect(q.x-s*.5,q.y-s*.5,s,s);
      }
      ctx.restore();
      const rim=ctx.createLinearGradient(cx-R,cy,cx+R,cy);rim.addColorStop(0,'rgba(255,255,255,.68)');rim.addColorStop(.18,'rgba(255,255,255,.14)');rim.addColorStop(.78,'rgba(255,255,255,.09)');rim.addColorStop(1,'rgba(255,255,255,.52)');ctx.beginPath();ctx.arc(cx,cy,R-.5,0,TAU);ctx.strokeStyle=rim;ctx.lineWidth=1.05;ctx.stroke();
      ctx.beginPath();ctx.arc(cx,cy,R-1.6,198*RAD,315*RAD);ctx.strokeStyle='rgba(255,255,255,.38)';ctx.lineWidth=1.15;ctx.stroke();
      ctx.beginPath();ctx.arc(cx,cy,R-3.2,212*RAD,294*RAD);ctx.strokeStyle='rgba(255,255,255,.24)';ctx.lineWidth=.6;ctx.stroke();
    }

    function drawArc(a,b,stroke,alpha,lift,now,dashed=false){
      const pts=[];
      for(let i=0;i<=42;i++){
        const t=i/42,p=slerp(a,b,t),q=project(p.lng,p.lat),rise=1+Math.sin(Math.PI*t)*lift;
        pts.push({x:cx+(q.x-cx)*rise,y:cy+(q.y-cy)*rise,z:q.z,t});
      }
      ctx.save();ctx.lineCap='round';ctx.lineJoin='round';ctx.lineWidth=.55;ctx.strokeStyle=stroke.replace('ALPHA',alpha.toFixed(3));if(dashed){ctx.setLineDash([2.2,4.2]);ctx.lineDashOffset=-(now*.009)%20}
      ctx.beginPath();let open=false;
      for(const q of pts){if(q.z<-.32){open=false;continue}if(!open){ctx.moveTo(q.x,q.y);open=true}else ctx.lineTo(q.x,q.y)}ctx.stroke();ctx.restore();
    }
    function drawNetwork(now){
      NETWORK.forEach((pair,i)=>drawArc(pair[0],pair[1],'rgba(218,218,226,ALPHA)',.075+(i%3)*.014,.11+(i%4)*.018,now,true));
      drawArc(HQ,principal(),'rgba(228,0,124,ALPHA)',.72,.08,now,false);
    }

    function drawNodeLabel(now){
      const t=principal(),p=project(t.lng,t.lat);if(p.z<-.05)return;
      const pulse=.5+.5*Math.sin(now*.0041);ctx.beginPath();ctx.arc(p.x,p.y,4.5+pulse*4.5,0,TAU);ctx.fillStyle=`rgba(228,0,124,${.06+.045*pulse})`;ctx.fill();ctx.beginPath();ctx.arc(p.x,p.y,2.65,0,TAU);ctx.fillStyle='#e4007c';ctx.fill();
      const mobile=W<760,label='ONLINE · '+String(t.city||'ONLINE').toUpperCase();ctx.font=(mobile?'8px':'10px')+' ui-monospace,SFMono-Regular,Menlo,monospace';const tw=ctx.measureText(label).width,bw=tw+29,bh=mobile?19:22;let x=p.x+10,y=p.y-30;if(x+bw>W-8)x=p.x-bw-10;if(y<8)y=p.y+10;ctx.beginPath();ctx.roundRect(x,y,bw,bh,bh/2);ctx.fillStyle='rgba(15,15,17,.92)';ctx.fill();ctx.strokeStyle='rgba(255,255,255,.11)';ctx.lineWidth=.55;ctx.stroke();ctx.beginPath();ctx.arc(x+10,y+bh/2,2.5,0,TAU);ctx.fillStyle='#e4007c';ctx.fill();ctx.textBaseline='middle';ctx.fillStyle='rgba(235,235,242,.68)';ctx.fillText(label,x+18,y+bh/2+.2);
    }

    function draw(now){
      raf=0;if(!visible||document.hidden)return;const mobile=W<760;if(mobile&&now-lastPaint<31){raf=requestAnimationFrame(draw);return}lastPaint=now;
      const dt=Math.min(40,now-last);last=now;if(!drag){yaw+=vx;pitch=clamp(pitch+vy,-24*RAD,25*RAD);vx*=.935;vy*=.90;if(Math.abs(vx)<.00002)vx=0;if(Math.abs(vy)<.00002)vy=0;if(!vx)auto+=dt*.000017}
      ctx.setTransform(D,0,0,D,0,0);ctx.clearRect(0,0,W,H);drawDecorativeOrbits();drawSphere();drawNetwork(now);drawNodeLabel(now);canvas.style.opacity='1';raf=requestAnimationFrame(draw);
    }

    hit.addEventListener('pointerdown',e=>{drag=true;lx=e.clientX;ly=e.clientY;vx=vy=0;hit.style.cursor='grabbing';hit.setPointerCapture?.(e.pointerId)});
    hit.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-lx,dy=e.clientY-ly;lx=e.clientX;ly=e.clientY;const sx=dx*.0062,sy=dy*.0038;yaw+=sx;pitch=clamp(pitch+sy,-24*RAD,25*RAD);vx=sx*.30;vy=sy*.22});
    const release=e=>{if(!drag)return;drag=false;hit.style.cursor='grab';try{hit.releasePointerCapture?.(e.pointerId)}catch{}};hit.addEventListener('pointerup',release);hit.addEventListener('pointercancel',release);
    const io=new IntersectionObserver(es=>{visible=!!es[0]?.isIntersecting;if(visible&&!raf){last=performance.now();raf=requestAnimationFrame(draw)}},{rootMargin:'150px 0px'});io.observe(layer);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden&&visible&&!raf){last=performance.now();raf=requestAnimationFrame(draw)}});
    addEventListener('resize',resize,{passive:true});resize();raf=requestAnimationFrame(draw);

    Promise.all([
      fetch('/data/ne_110m_admin_0_countries.geojson',{cache:'force-cache'}).then(r=>r.ok?r.json():Promise.reject()).then(d=>{land=rasterizeGeojson(d,W<760)}).catch(()=>{}),
      getVisitor().then(v=>{visitor=v})
    ]).catch(()=>{});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();