(() => {
  'use strict';
  if (window.__WE_STATIC_GLOBE_V9__) return;
  window.__WE_STATIC_GLOBE_V9__ = true;

  const TAU = Math.PI * 2;
  const deg = v => v * Math.PI / 180;
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

  let visitor=null;

  function boot(){
    const hero=document.querySelector('[data-hero-section="true"]');
    if(!hero) return;

    ['we-globe-live-v6','we-globe-live-v5','we-globe-layer-v3','we-globe-layer','we-globe-fallback'].forEach(id=>document.getElementById(id)?.remove());

    const layer=document.createElement('div');
    layer.id='we-globe-static-v9';
    layer.setAttribute('aria-hidden','true');
    Object.assign(layer.style,{position:'absolute',left:'0',width:'100%',height:'min(940px,100svh)',minHeight:'620px',zIndex:'8',pointerEvents:'none',overflow:'hidden'});

    const cv=document.createElement('canvas');
    Object.assign(cv.style,{position:'absolute',inset:'0',width:'100%',height:'100%',pointerEvents:'none'});
    layer.appendChild(cv);
    document.body.appendChild(layer);
    const c=cv.getContext('2d',{alpha:true});
    if(!c) return;

    function sync(){
      const r=hero.getBoundingClientRect();
      layer.style.top=Math.max(0,r.top+scrollY)+'px';
    }

    function draw(){
      sync();
      const W=Math.max(320,innerWidth);
      const H=Math.max(620,Math.min(940,innerHeight));
      const D=Math.min(1.35,devicePixelRatio||1);
      cv.width=Math.round(W*D); cv.height=Math.round(H*D);
      c.setTransform(D,0,0,D,0,0);
      c.clearRect(0,0,W,H);

      const mobile=W<760;
      const R=mobile?Math.min(W*.41,186):Math.min(W*.205,H*.31,285);
      const cx=W*.5;
      const cy=mobile?Math.min(300,H*.39):H*.47;
      const rot=visitor ? -deg(visitor.lng) : deg(58);
      const tilt=deg(-8);

      const project=(lon,lat)=>{
        const la=deg(lat), lo=deg(lon)+rot;
        const x0=Math.cos(la)*Math.sin(lo), z0=Math.cos(la)*Math.cos(lo), y0=-Math.sin(la);
        const ct=Math.cos(tilt), st=Math.sin(tilt);
        return {x:cx+x0*R,y:cy+(y0*ct-z0*st)*R,z:y0*st+z0*ct};
      };

      const halo=c.createRadialGradient(cx-R*.25,cy-R*.28,R*.08,cx,cy,R*1.14);
      halo.addColorStop(0,'rgba(255,255,255,.065)');
      halo.addColorStop(.72,'rgba(255,255,255,.014)');
      halo.addColorStop(1,'rgba(255,255,255,0)');
      c.fillStyle=halo; c.beginPath(); c.arc(cx,cy,R*1.16,0,TAU); c.fill();

      const orbit=(rx,ry,a,alpha)=>{
        c.save(); c.translate(cx,cy); c.rotate(a); c.beginPath(); c.ellipse(0,0,rx,ry,0,0,TAU);
        c.strokeStyle=`rgba(240,240,248,${alpha})`; c.lineWidth=.55; c.stroke(); c.restore();
      };
      orbit(R*1.22,R*.34,-.22,.07); orbit(R*1.18,R*.26,.42,.055); orbit(R*1.12,R*.46,.08,.042);

      c.save(); c.beginPath(); c.arc(cx,cy,R,0,TAU); c.clip();
      for(const d of land){
        const p=project(d[0],d[1]);
        if(p.z<-.04) continue;
        const z=Math.max(0,Math.min(1,(p.z+.04)/1.04));
        c.beginPath(); c.arc(p.x,p.y,.34+z*.74,0,TAU);
        c.fillStyle=`rgba(240,240,248,${.12+z*.76})`; c.fill();
      }
      c.restore();

      c.beginPath(); c.arc(cx,cy,R+.4,0,TAU); c.strokeStyle='rgba(240,240,248,.19)'; c.lineWidth=.7; c.stroke();
      c.beginPath(); c.arc(cx-R*.21,cy-R*.18,R*.96,deg(205),deg(318)); c.strokeStyle='rgba(255,255,255,.24)'; c.lineWidth=1.05; c.stroke();

      if(visitor){
        const p=project(visitor.lng,visitor.lat);
        if(p.z>-.08){
          c.beginPath(); c.arc(p.x,p.y,2.5,0,TAU); c.fillStyle='#e4007c'; c.fill();
          const text='ONLINE · '+String(visitor.city||visitor.country||'ONLINE').toUpperCase();
          c.font=(mobile?'9px':'10px')+' ui-monospace,monospace';
          const tw=c.measureText(text).width, bw=tw+32, bh=23;
          let x=p.x+12, y=p.y-32;
          if(x+bw>W-10) x=p.x-bw-12;
          c.beginPath(); c.roundRect(x,y,bw,bh,11.5); c.fillStyle='rgba(18,18,18,.92)'; c.fill();
          c.strokeStyle='rgba(255,255,255,.14)'; c.stroke();
          c.beginPath(); c.arc(x+11,y+11.5,3,0,TAU); c.fillStyle='#e4007c'; c.fill();
          c.fillStyle='rgba(240,240,248,.7)'; c.textBaseline='middle'; c.fillText(text,x+20,y+11.5);
        }
      }
    }

    let resizeTimer;
    addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(draw,120)},{passive:true});
    draw();

    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),1800);
    fetch('https://ipapi.co/json/',{cache:'no-store',signal:controller.signal})
      .then(r=>r.ok?r.json():Promise.reject())
      .then(d=>{
        const lat=+d.latitude,lng=+d.longitude;
        if(Number.isFinite(lat)&&Number.isFinite(lng)){
          visitor={lat,lng,city:d.city||d.region||'',country:d.country_code||''};
          draw();
        }
      })
      .catch(()=>{})
      .finally(()=>clearTimeout(timeout));
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
})();
