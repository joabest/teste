(() => {
  'use strict';
  if (window.__WE_GLOBE_REF_V26__) return;
  window.__WE_GLOBE_REF_V26__ = true;

  const TAU=Math.PI*2,RAD=Math.PI/180,PINK='#e4007c';
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  let visitor={lat:-23.5505,lng:-46.6333,city:'SÃO PAULO'},land=[];
  const hub={lat:25.6866,lng:-100.3161};
  const nodes=[{lat:51.5074,lng:-.1278},{lat:25.2048,lng:55.2708},{lat:35.6762,lng:139.6503}];
  const ll=(lat,lng)=>{const a=lat*RAD,b=lng*RAD,c=Math.cos(a);return[c*Math.sin(b),Math.sin(a),c*Math.cos(b)]};
  async function j(url){const c=new AbortController(),t=setTimeout(()=>c.abort(),2200);try{const r=await fetch(url,{cache:'no-store',signal:c.signal});if(!r.ok)throw 0;return await r.json()}finally{clearTimeout(t)}}
  async function locate(){try{const d=await j('https://ipapi.co/json/');if(isFinite(+d.latitude)&&isFinite(+d.longitude))visitor={lat:+d.latitude,lng:+d.longitude,city:String(d.city||'ONLINE').toUpperCase()}}catch(_){try{const d=await j('https://ipwho.is/');if(d.success!==false&&isFinite(+d.latitude)&&isFinite(+d.longitude))visitor={lat:+d.latitude,lng:+d.longitude,city:String(d.city||'ONLINE').toUpperCase()}}catch(_){}}}
  function rings(g){if(!g)return[];if(g.type==='Polygon')return g.coordinates;if(g.type==='MultiPolygon')return g.coordinates.flat();return[]}
  function raster(data){const mw=innerWidth<768?760:1200,mh=mw/2,m=document.createElement('canvas');m.width=mw;m.height=mh;const x=m.getContext('2d');if(!x)return[];x.fillStyle='#fff';const px=o=>(o+180)/360*mw,py=a=>(90-a)/180*mh;for(const f of data.features||[])for(const r of rings(f.geometry)){if(!r||r.length<3)continue;x.beginPath();let on=false,last=r[0];for(const p of r){if(on&&Math.abs(p[0]-last[0])>180){on=false;last=p;continue}if(!on){x.moveTo(px(p[0]),py(p[1]));on=true}else x.lineTo(px(p[0]),py(p[1]));last=p}x.closePath();x.fill()}const img=x.getImageData(0,0,mw,mh).data,out=[],step=innerWidth<768?4.6:3.7;for(let y=step/2;y<mh;y+=step)for(let xx=step/2;xx<mw;xx+=step)if(img[((y|0)*mw+(xx|0))*4+3]>80)out.push([xx/mw*360-180,90-y/mh*180]);return out}
  async function loadLand(){try{const r=await fetch('/data/ne_110m_admin_0_countries.geojson',{cache:'force-cache'});if(!r.ok)throw 0;land=raster(await r.json())}catch(_){land=[]}}

  function boot(){
    const hero=document.querySelector('[data-hero-section="true"]');if(!hero)return setTimeout(boot,120);
    document.querySelectorAll('[id^="we-globe"],[id^="we-original-globe"],[id^="we-custom-globe"]').forEach(n=>n.remove());
    const layer=document.createElement('div');layer.id='we-globe-ref-v26';layer.setAttribute('aria-hidden','true');Object.assign(layer.style,{position:'absolute',left:'0',width:'100%',height:'860px',zIndex:'8',pointerEvents:'none',overflow:'visible'});
    const wrap=document.createElement('div');Object.assign(wrap.style,{position:'absolute',left:'50%',top:'16px',transform:'translateX(-50%) scale(1)',transformOrigin:'50% 50%',width:'min(790px,64vw,82vh)',height:'min(790px,64vw,82vh)',minWidth:'590px',minHeight:'590px',pointerEvents:'auto',touchAction:'pan-y',cursor:'grab',overflow:'visible',willChange:'transform'});
    const canvas=document.createElement('canvas');Object.assign(canvas.style,{position:'absolute',inset:'0',width:'100%',height:'100%',display:'block',opacity:'0',transition:'opacity .3s ease'});wrap.appendChild(canvas);layer.appendChild(wrap);document.body.appendChild(layer);
    const st=document.createElement('style');st.textContent=`#we-globe-ref-v26,#we-globe-ref-v26 *{box-sizing:border-box!important}#we-globe-ref-v26{overflow:visible!important;clip:auto!important;contain:none!important}@media(max-width:767px){#we-globe-ref-v26{height:420px!important}#we-globe-ref-v26>div{width:340px!important;height:340px!important;min-width:340px!important;min-height:340px!important;top:4px!important}}@media(min-width:768px) and (max-width:1100px){#we-globe-ref-v26>div{width:590px!important;height:590px!important;min-width:590px!important;min-height:590px!important;top:14px!important}}`;document.head.appendChild(st);
    const ctx=canvas.getContext('2d',{alpha:true,desynchronized:true});if(!ctx)return;
    const S=820,C=S/2,R=318;let dpr=1,yaw=0,pitch=0,drag=false,lastX=0,lastY=0,visible=true,zoom=1,pinchStart=0,pinchZoom=1;const pts=new Map();
    const home=()=>({yaw:-visitor.lng*RAD,pitch:clamp(visitor.lat*RAD,-1.22,1.22)});
    const proj=(lat,lng,rr=R)=>{let[x,y,z]=ll(lat,lng);const cy=Math.cos(yaw),sy=Math.sin(yaw),x1=x*cy+z*sy,z1=-x*sy+z*cy,cp=Math.cos(pitch),sp=Math.sin(pitch),y2=y*cp-z1*sp,z2=y*sp+z1*cp;return{x:C+x1*rr,y:C-y2*rr,z:z2}};
    const sync=()=>{const r=hero.getBoundingClientRect();layer.style.top=(scrollY+r.top)+'px'};
    const applyScale=()=>{wrap.style.transform=`translateX(-50%) scale(${zoom.toFixed(3)})`};
    function resize(){dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(S*dpr);canvas.height=Math.round(S*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);sync();applyScale()}
    function dot(p,r=3.1){ctx.save();ctx.fillStyle=PINK;ctx.shadowColor=PINK;ctx.shadowBlur=11;ctx.beginPath();ctx.arc(p.x,p.y,r,0,TAU);ctx.fill();ctx.restore()}
    function orbit(a,b,pink=false){const A=proj(a.lat,a.lng,R*1.012),B=proj(b.lat,b.lng,R*1.012),mx=(A.x+B.x)/2,my=(A.y+B.y)/2;let vx=mx-C,vy=my-C,l=Math.hypot(vx,vy)||1;vx/=l;vy/=l;const chord=Math.hypot(B.x-A.x,B.y-A.y),lift=28+chord*.16,cp={x:mx+vx*lift,y:my+vy*lift},vis=clamp((A.z+B.z+1.2)/2.2,.42,1);ctx.save();ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.quadraticCurveTo(cp.x,cp.y,B.x,B.y);ctx.strokeStyle=pink?`rgba(228,0,124,${.98*Math.max(vis,.72)})`:`rgba(255,255,255,${.28*vis})`;ctx.lineWidth=pink?1.65:.62;if(pink){ctx.shadowColor='rgba(228,0,124,.7)';ctx.shadowBlur=6}ctx.stroke();ctx.restore();if(pink){dot(A,3);dot(B,3.3)}}
    function network(){orbit(nodes[0],hub);orbit(hub,nodes[1]);orbit(nodes[1],nodes[2]);orbit(visitor,hub,true)}
    function drawLand(back){
      ctx.save();ctx.beginPath();ctx.arc(C,C,R-1,0,TAU);ctx.clip();
      for(const p of land){
        const q=proj(p[1],p[0]);
        if(back ? q.z>=0 : q.z<0) continue;
        const edge=clamp((1-Math.hypot(q.x-C,q.y-C)/R)*6,.18,1);
        if(back){
          const depth=clamp(-q.z,0,1);
          const a=(.055+depth*.12)*edge;
          const s=.42+depth*.18;
          ctx.fillStyle=`rgba(238,238,244,${a})`;
          ctx.beginPath();ctx.arc(q.x,q.y,s,0,TAU);ctx.fill();
        }else{
          const depth=clamp(q.z,0,1);
          const a=(.23+depth*.72)*edge;
          const s=.52+depth*.72;
          ctx.fillStyle=`rgba(248,248,250,${a})`;
          ctx.beginPath();ctx.arc(q.x,q.y,s,0,TAU);ctx.fill();
        }
      }
      ctx.restore();
    }
    function marker(t){const p=proj(visitor.lat,visitor.lng,R*1.009),u=.5+.5*Math.sin(t*.004),core=3.6+u*.45,halo=8+u*5;ctx.save();ctx.fillStyle=PINK;ctx.shadowColor=PINK;ctx.shadowBlur=17;ctx.globalAlpha=.22+.14*u;ctx.beginPath();ctx.arc(p.x,p.y,halo,0,TAU);ctx.fill();ctx.globalAlpha=1;ctx.beginPath();ctx.arc(p.x,p.y,core,0,TAU);ctx.fill();ctx.shadowBlur=0;const text='ONLINE · '+visitor.city;ctx.font='600 10px ui-monospace,monospace';const tw=ctx.measureText(text).width,bw=tw+28,bh=28;let x=p.x+13,y=clamp(p.y-bh/2,10,S-bh-10);if(x+bw>S-12)x=p.x-bw-13;ctx.beginPath();ctx.roundRect(x,y,bw,bh,14);ctx.fillStyle='rgba(17,17,19,.94)';ctx.fill();ctx.strokeStyle='rgba(228,0,124,.5)';ctx.lineWidth=1;ctx.stroke();ctx.fillStyle=PINK;ctx.beginPath();ctx.arc(x+12,y+14,3.2,0,TAU);ctx.fill();ctx.fillStyle='rgba(250,250,252,.86)';ctx.textBaseline='middle';ctx.fillText(text,x+20,y+14);ctx.restore()}
    function globe(t){
      ctx.clearRect(0,0,S,S);
      const halo=ctx.createRadialGradient(C,C,R*.72,C,C,R*1.16);halo.addColorStop(0,'rgba(255,255,255,0)');halo.addColorStop(.83,'rgba(255,255,255,.035)');halo.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=halo;ctx.beginPath();ctx.arc(C,C,R*1.16,0,TAU);ctx.fill();
      drawLand(true);
      const glass=ctx.createRadialGradient(C-R*.34,C-R*.36,R*.06,C,C,R);glass.addColorStop(0,'rgba(255,255,255,.022)');glass.addColorStop(.48,'rgba(255,255,255,.004)');glass.addColorStop(.82,'rgba(255,255,255,.010)');glass.addColorStop(1,'rgba(255,255,255,.040)');ctx.fillStyle=glass;ctx.beginPath();ctx.arc(C,C,R,0,TAU);ctx.fill();
      drawLand(false);
      network();
      const rim=ctx.createLinearGradient(C-R,C-R*.3,C+R,C+R*.2);rim.addColorStop(0,'rgba(255,255,255,.28)');rim.addColorStop(.22,'rgba(255,255,255,.09)');rim.addColorStop(.70,'rgba(255,255,255,.08)');rim.addColorStop(1,'rgba(255,255,255,.58)');ctx.strokeStyle=rim;ctx.lineWidth=1.15;ctx.beginPath();ctx.arc(C,C,R-.5,0,TAU);ctx.stroke();marker(t)
    }
    function frame(t){requestAnimationFrame(frame);if(!visible||document.hidden)return;globe(t);if(canvas.style.opacity!=='1')canvas.style.opacity='1'}
    const distance=()=>{const a=[...pts.values()];return a.length<2?0:Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)};
    wrap.addEventListener('wheel',e=>{if(!(e.ctrlKey||e.metaKey))return;e.preventDefault();zoom=clamp(zoom+(e.deltaY>0?-.06:.06),.88,1.32);applyScale()},{passive:false});
    wrap.addEventListener('dblclick',e=>{e.preventDefault();zoom=Math.abs(zoom-1)<.04?1.18:1;applyScale()});
    wrap.addEventListener('pointerdown',e=>{pts.set(e.pointerId,{x:e.clientX,y:e.clientY});try{wrap.setPointerCapture(e.pointerId)}catch(_){ }if(pts.size===1){drag=true;lastX=e.clientX;lastY=e.clientY;wrap.style.cursor='grabbing'}else{drag=false;pinchStart=distance();pinchZoom=zoom}});
    wrap.addEventListener('pointermove',e=>{if(!pts.has(e.pointerId))return;pts.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pts.size>=2){const d=distance();if(pinchStart>0){zoom=clamp(pinchZoom*(d/pinchStart),.88,1.32);applyScale()}return}if(!drag)return;const dx=e.clientX-lastX,dy=e.clientY-lastY;lastX=e.clientX;lastY=e.clientY;yaw+=dx*.0065;pitch=clamp(pitch+dy*.0048,-1.45,1.45)});
    const up=e=>{pts.delete(e.pointerId);if(pts.size<2)pinchStart=0;if(pts.size===0){drag=false;wrap.style.cursor='grab'}};['pointerup','pointercancel','lostpointercapture'].forEach(n=>wrap.addEventListener(n,up));
    new IntersectionObserver(es=>{visible=es.some(e=>e.isIntersecting)},{rootMargin:'180px'}).observe(hero);addEventListener('resize',resize,{passive:true});addEventListener('scroll',sync,{passive:true});
    Promise.all([loadLand(),locate()]).finally(()=>{const h=home();yaw=h.yaw;pitch=h.pitch;resize();requestAnimationFrame(frame)});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();