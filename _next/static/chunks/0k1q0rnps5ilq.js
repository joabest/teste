(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,76250,e=>{"use strict";var t=e.i(93072),a=e.i(34416),o=e.i(21348),r=e.i(46154);let n=[{name:"Monterrey",short:"MTY",lat:25.6866,lng:-100.3161,isHQ:!0},{name:"Dubai",short:"DXB",lat:25.2048,lng:55.2708,isHQ:!0},{name:"Boston",lat:42.3601,lng:-71.0589},{name:"New York",lat:40.7128,lng:-74.006},{name:"Washington",lat:38.9072,lng:-77.0369},{name:"San Francisco",lat:37.7749,lng:-122.4194},{name:"Palo Alto",lat:37.4419,lng:-122.143},{name:"Las Vegas",lat:36.1699,lng:-115.1398},{name:"Los Angeles",lat:34.0522,lng:-118.2437},{name:"Corona",lat:33.8753,lng:-117.5664},{name:"Dallas",lat:32.7767,lng:-96.797},{name:"Houston",lat:29.7604,lng:-95.3698},{name:"San Antonio",lat:29.4241,lng:-98.4936},{name:"McAllen",lat:26.2034,lng:-98.23},{name:"Ottawa",lat:45.4215,lng:-75.6972},{name:"Toronto",lat:43.6532,lng:-79.3832},{name:"Saltillo",lat:25.4232,lng:-101.0053},{name:"Los Cabos",lat:22.8905,lng:-109.9167},{name:"Guadalajara",lat:20.6597,lng:-103.3496},{name:"Mexico City",lat:19.4326,lng:-99.1332},{name:"Cancún",lat:21.1619,lng:-86.8515},{name:"Lima",lat:-12.0464,lng:-77.0428},{name:"Santiago",lat:-33.4489,lng:-70.6693},{name:"Buenos Aires",lat:-34.6037,lng:-58.3816},{name:"London",lat:51.5074,lng:-.1278},{name:"Madrid",lat:40.4168,lng:-3.7038},{name:"Paris",lat:48.8566,lng:2.3522},{name:"Berlin",lat:52.52,lng:13.405},{name:"Amsterdam",lat:52.3676,lng:4.9041},{name:"Milan",lat:45.4642,lng:9.19},{name:"Istanbul",lat:41.0082,lng:28.9784},{name:"Mumbai",lat:19.076,lng:72.8777},{name:"Singapore",lat:1.3521,lng:103.8198},{name:"Hong Kong",lat:22.3193,lng:114.1694},{name:"Bangkok",lat:13.7563,lng:100.5018},{name:"Cairo",lat:30.0444,lng:31.2357},{name:"Lagos",lat:6.5244,lng:3.3792},{name:"Johannesburg",lat:-26.2041,lng:28.0473}],i=Object.fromEntries(n.map(e=>[e.name,e])),l=n.filter(e=>e.isHQ),s=[["Monterrey","Boston"],["Monterrey","New York"],["Monterrey","Washington"],["Monterrey","San Francisco"],["Monterrey","Palo Alto"],["Monterrey","Las Vegas"],["Monterrey","Los Angeles"],["Monterrey","Corona"],["Monterrey","Dallas"],["Monterrey","Houston"],["Monterrey","San Antonio"],["Monterrey","McAllen"],["Monterrey","Ottawa"],["Monterrey","Toronto"],["Monterrey","Saltillo"],["Monterrey","Los Cabos"],["Monterrey","Guadalajara"],["Monterrey","Mexico City"],["Monterrey","Cancún"],["Monterrey","Lima"],["Monterrey","Santiago"],["Monterrey","Buenos Aires"],["Dubai","London"],["Dubai","Paris"],["Dubai","Istanbul"],["Dubai","Mumbai"],["Dubai","Singapore"],["Dubai","Hong Kong"],["Dubai","Cairo"],["Dubai","Lagos"],["Dubai","Johannesburg"]];var u=e.i(52257),c=e.i(96640),f=e.i(66112);let m="あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんابتثجحخدذرزسشصضطظعغفقكلمنهوي가나다라마바사아자차카타파하거너더러머버서어저처커터퍼허人大小天地中国王道德文学新水火山风云雷电星空生死爱情家光明亮金银玉龙虎凤马牛羊鸟鱼花草树木林海洋时年月日春夏秋冬东西南北心力气".split(""),d=/[\p{L}\p{N}]/u;function h(e){let{city:o,cycleDelay:r=2.85,resolveDelay:n=3.45}=e,i=(0,u.useTranslations)("hero"),l=`${i("online")} \xb7 ${o.toLowerCase()}`,s=(0,a.useRef)(null),h=(0,a.useRef)([]),p=(0,a.useRef)(-1);return(0,a.useEffect)(()=>{let e=s.current;if(!e)return;p.current<0&&(p.current=globalThis.performance.now());let t=(globalThis.performance.now()-p.current)/1e3,a=()=>{h.current.forEach(e=>globalThis.window.clearTimeout(e)),h.current=[]},o=Array.from(e.children),i=Array.from(l);if((0,f.prefersReducedMotion)())return o.forEach((e,t)=>{e.textContent=i[t]??""}),a;let u=o.map(()=>!1),c=globalThis.window.setTimeout(()=>{o.forEach((e,t)=>{let a=i[t]??"";if(!d.test(a)){e.textContent=" "===a?" ":a;return}let o=()=>{if(u[t])return;e.textContent=m[Math.floor(Math.random()*m.length)];let a=globalThis.window.setTimeout(o,70+40*Math.random());h.current.push(a)};o()})},Math.max(0,(r-t)*1e3));return h.current.push(c),o.forEach((e,a)=>{let o=globalThis.window.setTimeout(()=>{u[a]=!0;let t=i[a]??"";e.textContent=" "===t?" ":t},Math.max(0,(n-t)*1e3)+45*a);h.current.push(o)}),a},[l,r,n]),(0,t.jsx)("div",{"data-globe-status":!0,className:"pointer-events-none absolute right-0 top-2 will-change-transform",children:(0,t.jsx)(c.Badge,{withPulse:!0,children:(0,t.jsx)("span",{ref:s,"aria-label":l,className:"inline-flex items-center leading-none",children:Array.from(l).map((e,a)=>(0,t.jsx)("span",{"aria-hidden":"true",className:"w-[1ch] shrink-0 overflow-hidden text-center leading-none",children:" "},`${a}-${e}`))})})})}var p=e.i(17162);let g="#F0F0F8",v="#E4007C",b=Math.tan(40*Math.PI/360);function y(e){return e>=1?1:1-Math.pow(2,-10*e)}function M(e,t,a){return Math.min(a,Math.max(t,e))}function A(e,t,a){let o=e*Math.PI/180,r=t*Math.PI/180;return[a*Math.cos(o)*Math.cos(r),a*Math.sin(o),-a*Math.cos(o)*Math.sin(r)]}async function w(e){let t=await fetch("/data/ne_110m_admin_0_countries.geojson",{signal:e}),a=await t.json();if(!a?.features)return null;let o=globalThis.document.createElement("canvas");o.width=2048,o.height=1024;let r=o.getContext("2d",{willReadFrequently:!0});if(!r)return null;for(let e of(r.fillStyle="#000",r.fillRect(0,0,2048,1024),r.fillStyle="#fff",a.features)){let t=e.geometry;if(t?.type)for(let e of"Polygon"===t.type?[t.coordinates]:"MultiPolygon"===t.type?t.coordinates:[]){for(let t of(r.beginPath(),e)){for(let e=0;e<t.length;e++){let a=(t[e][0]+180)/360*2048,o=(90-t[e][1])/180*1024;0===e?r.moveTo(a,o):r.lineTo(a,o)}r.closePath()}r.fill("evenodd")}}let n=r.getImageData(0,0,2048,1024).data;return(e,t)=>{let a=M(Math.floor((t+180)/360*2048),0,2047);return n[(2048*M(Math.floor((90-e)/180*1024),0,1023)+a)*4]>127}}function x(e){let t=[],a=[],o=[],r=[];for(let{a:n,b:i,ang:l,sinAng:s,offset:u,freq:c}of e){let e=Math.max(32,Math.round(64*l)),f=0,m=0,d=0,h=0;for(let p=0;p<e;p++){let g=p/(e-1),v=Math.sin((1-g)*l)/s,b=Math.sin(g*l)/s,y=1+.3*Math.sin(Math.PI*g),M=(n[0]*v+i[0]*b)*y,A=(n[1]*v+i[1]*b)*y,w=(n[2]*v+i[2]*b)*y;p>0&&(t.push(f,m,d,M,A,w),a.push(h,g),o.push(u,u),r.push(c,c)),f=M,m=A,d=w,h=g}}return{position:Float32Array.from(t),arcT:Float32Array.from(a),offset:Float32Array.from(o),speed:Float32Array.from(r)}}let T=`
  attribute vec3 aScatter;
  attribute float aDelay;
  attribute float aSize;
  attribute float aPhase;
  attribute float aAccent;
  attribute float aArcT;

  uniform float uTime;
  uniform float uProgress;
  uniform float uArcProgress;
  uniform float uPixelRatio;
  uniform float uScale;
  uniform float uCamZ;
  uniform float uMotion;
  uniform float uRotY;
  uniform float uRotX;

  varying float vAlpha;
  varying float vAccent;

  float expoOut(float x) {
    return x >= 1.0 ? 1.0 : 1.0 - pow(2.0, -10.0 * x);
  }

  // Spin + tilt del drag — el TARGET rota; los or\xedgenes de vuelo quedan
  // fijos en espacio-mundo, clavados al borde de pantalla que los vio nacer.
  vec3 rotYX(vec3 v) {
    float cy = cos(uRotY);
    float sy = sin(uRotY);
    vec3 r = vec3(cy * v.x + sy * v.z, v.y, -sy * v.x + cy * v.z);
    float cx = cos(uRotX);
    float sx = sin(uRotX);
    return vec3(r.x, cx * r.y - sx * r.z, sx * r.y + cx * r.z);
  }

  void main() {
    // 0 = part\xedcula de mundo \xb7 1 = paquete de luz (cabeza del haz de un arco).
    float isPacket = step(0.0, aArcT);

    // — Mundo: vuela del borde de pantalla a su lugar en el globo.
    vec3 tw = rotYX(position);
    float p = clamp((uProgress - aDelay) / 0.45, 0.0, 1.0);
    float e = expoOut(p);
    vec3 worldPos = mix(aScatter, tw, e);
    // Respiraci\xf3n sutil una vez formado (0 bajo reduced motion).
    worldPos += tw * sin(uTime * 0.6 + aPhase * 6.2831) * 0.004 * e * uMotion;

    // — Paquete: viaja por su gran c\xedrculo (position=origen, aScatter=destino,
    //   aArcT=fase, aDelay=REUSADO como frecuencia del ciclo). MISMO reloj
    //   que el haz de la l\xednea → van clavados. Periodo propio por arco
    //   (18–30s) → nunca salen sincronizados; cruce = primer 20% del ciclo
    //   (solo ~1 de cada 5 arcos trae paquete en vuelo a la vez).
    float ang = acos(clamp(dot(position, aScatter), -1.0, 1.0));
    float sa = max(sin(ang), 0.0001);
    float cyc = fract(uTime * aDelay + aArcT);
    float run = step(cyc, 0.20);
    float tr = clamp(cyc / 0.20, 0.0, 1.0);
    float tt = tr * tr * (3.0 - 2.0 * tr);
    vec3 gc = (sin((1.0 - tt) * ang) * position + sin(tt * ang) * aScatter) / sa;
    vec3 packetPos = rotYX(gc * (1.0 + 0.3 * sin(3.14159265 * tt)));

    vec3 pos = mix(worldPos, packetPos, isPacket);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);

    // Factor frente/espalda: da profundidad sin luces (0 = cara oculta).
    float front = clamp((mv.z + uCamZ + 1.0) * 0.5, 0.0, 1.0);

    // El acento (HQ MTY) pulsa suave — el "vivo" de la marca.
    float pulse = 1.0 + aAccent * 0.3 * sin(uTime * 2.2 + aPhase) * uMotion;

    float size = aSize * pulse * mix(0.72, 1.0, front);
    gl_PointSize = size * uScale * uPixelRatio / max(-mv.z, 0.001);

    float twinkle = 0.86 + 0.14 * sin(uTime * 1.4 + aPhase * 12.566) * uMotion;
    float worldA = smoothstep(0.0, 0.12, uProgress) * twinkle;

    // Paquete: aparece cuando los arcos ya terminaron de dibujarse, con
    // fade al salir del HQ y al llegar al destino; oculto durante el
    // descanso del ciclo (run) e invisible bajo reduced motion.
    float gate = smoothstep(0.85, 1.0, uArcProgress) * uMotion;
    float fade = smoothstep(0.0, 0.08, tt) * (1.0 - smoothstep(0.92, 1.0, tt));
    float packetA = gate * fade * run;

    vAlpha = mix(worldA, packetA, isPacket) * mix(0.16, 1.0, front);
    vAccent = aAccent;

    gl_Position = projectionMatrix * mv;
  }
`,P=`
  uniform vec3 uColor;
  uniform vec3 uAccentColor;

  varying float vAlpha;
  varying float vAccent;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    // smoothstep invertido expl\xedcito — edges al rev\xe9s es UB seg\xfan la spec GLSL
    float disc = 1.0 - smoothstep(0.14, 0.5, d);
    if (disc < 0.004) discard;
    vec3 col = mix(uColor, uAccentColor, vAccent);
    gl_FragColor = vec4(col, disc * vAlpha);
  }
`,C=`
  attribute float aArcT;
  attribute float aOffset;
  attribute float aSpeed;

  uniform float uRotY;
  uniform float uRotX;
  uniform float uCamZ;

  varying float vT;
  varying float vOff;
  varying float vSpeed;
  varying float vFront;

  void main() {
    // Misma rotaci\xf3n que los puntos — las l\xedneas siguen al globo y al drag.
    float cy = cos(uRotY);
    float sy = sin(uRotY);
    vec3 t = vec3(
      cy * position.x + sy * position.z,
      position.y,
      -sy * position.x + cy * position.z
    );
    float cx = cos(uRotX);
    float sx = sin(uRotX);
    t = vec3(t.x, cx * t.y - sx * t.z, sx * t.y + cx * t.z);

    vec4 mv = modelViewMatrix * vec4(t, 1.0);
    vFront = clamp((mv.z + uCamZ + 1.0) * 0.5, 0.0, 1.0);
    vT = aArcT;
    vOff = aOffset;
    vSpeed = aSpeed;
    gl_Position = projectionMatrix * mv;
  }
`,S=`
  uniform float uTime;
  uniform float uArcProgress;
  uniform float uMotion;
  uniform vec3 uColor;
  uniform float uBase;

  varying float vT;
  varying float vOff;
  varying float vSpeed;
  varying float vFront;

  void main() {
    // La l\xednea se DIBUJA del HQ (t=0) hacia el destino (t=1).
    float reveal = clamp((uArcProgress - vT * 0.85) / 0.15, 0.0, 1.0);

    // UN solo paquete por arco. Cada arco tiene su PROPIO periodo (vSpeed,
    // 18–30s aleatorio) → nunca se sincronizan y solo ~1 de cada 5 arcos
    // trae haz a la vez. El cruce ocupa el primer 20% del ciclo (~3.6–6s,
    // easeInOut: sale y llega con calma); el resto, la l\xednea descansa.
    float cyc = fract(uTime * vSpeed + vOff);
    float run = step(cyc, 0.20);
    float tr = clamp(cyc / 0.20, 0.0, 1.0);
    float tt = tr * tr * (3.0 - 2.0 * tr);
    float d = tt - vT;
    // Cola corta y tenue — un destello discreto, no una estela dram\xe1tica.
    float beam = (d >= 0.0 ? exp(-d * 40.0) : 0.0) * run;

    // Los haces arrancan cuando el arco termin\xf3 de dibujarse; bajo reduced
    // motion la l\xednea queda est\xe1tica y limpia, sin haz.
    float gate = smoothstep(0.85, 1.0, uArcProgress) * uMotion;

    // uBase = presencia de la l\xednea por material: red blanca 0.30, arco
    // accent del visitante 0.55 (el rosa pierde luminancia en additive y
    // adem\xe1s ES el protagonista — debe leerse a la primera).
    float a = (uBase + beam * 0.42 * gate) * reveal * mix(0.28, 1.0, vFront);
    gl_FragColor = vec4(uColor, a);
  }
`,R=`
  varying vec3 vNormal;
  varying vec3 vView;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`,B=`
  uniform vec3 uColor;
  uniform float uIntensity;

  varying vec3 vNormal;
  varying vec3 vView;

  void main() {
    float rim = pow(1.0 - abs(dot(vView, normalize(vNormal))), 3.5);
    gl_FragColor = vec4(uColor, rim * uIntensity);
  }
`;e.s(["ParticleWorld",0,function(e){let{enabled:u=!0}=e,c=(0,a.useRef)(null),f=(0,a.useRef)(null),[m,d]=(0,a.useState)(!1),[z,F]=(0,a.useState)("Monterrey"),L=(0,a.useRef)(null),Y=(0,a.useRef)(null),j=(0,a.useRef)(u),D=(0,a.useRef)(null);return(0,a.useEffect)(()=>{j.current=u,D.current?.()},[u]),(0,a.useEffect)(()=>{let e=!1,t=new URLSearchParams(globalThis.window.location.search).get("loc");if(t){let[e,a,...o]=t.split(","),r=Number(e),n=Number(a);if(Number.isFinite(r)&&Number.isFinite(n)){let e={city:o.join(",").trim()||"demo",region:"",country:"",countryCode:"",latitude:r,longitude:n};F(e.city),L.current=e,Y.current?.();return}}return(0,p.getUserLocation)().then(t=>{e||(F(t.city),L.current=t,Y.current?.())}),()=>{e=!0}},[]),(0,a.useEffect)(()=>{let e=c.current,t=f.current;if(!e||!t)return;let a=globalThis.window.matchMedia("(prefers-reduced-motion: reduce)").matches,u=globalThis.window.matchMedia("(max-width: 767px)").matches,m=globalThis.window.matchMedia("(hover: hover) and (pointer: fine)").matches,h=new AbortController,p=!1,z=0,F=!1,E=!0,I=new o.Scene,O=new o.PerspectiveCamera(40,1,.1,50),X=null;try{X=new r.WebGLRenderer({canvas:t,alpha:!0,antialias:!1,powerPreference:"high-performance"})}catch{return}X.setClearColor(0,0);let q=new o.SphereGeometry(1.045,48,48),N=new o.ShaderMaterial({vertexShader:R,fragmentShader:B,uniforms:{uColor:{value:new o.Color(g)},uIntensity:{value:0}},transparent:!0,blending:o.AdditiveBlending,depthWrite:!1,depthTest:!1}),k=new o.Mesh(q,N);I.add(k);let _={uTime:{value:0},uProgress:{value:+!!a},uArcProgress:{value:+!!a},uPixelRatio:{value:1},uScale:{value:1},uCamZ:{value:3},uMotion:{value:+!a},uRotY:{value:0},uRotX:{value:0},uColor:{value:new o.Color(g)},uAccentColor:{value:new o.Color(v)}},H=null,Z=null,U=null,G=null,V=function(){let e=[];for(let[t,a]of s){let o=i[t],r=i[a];if(!o||!r)continue;let n=A(o.lat,o.lng,1),l=A(r.lat,r.lng,1),s=Math.acos(M(n[0]*l[0]+n[1]*l[1]+n[2]*l[2],-1,1)),u=Math.sin(s);u<1e-4||e.push({a:n,b:l,ang:s,sinAng:u,offset:Math.random(),freq:1/(18+12*Math.random())})}return e}(),W=!1,Q=null,K=null,$=null,J=()=>{let e=L.current;if(!e||W||p||!Z)return;let t=l.find(e=>(e.short??e.name).toUpperCase().includes("MTY"));if(!t)return;let a=A(t.lat,t.lng,1),r=A(e.latitude,e.longitude,1),n=Math.acos(M(a[0]*r[0]+a[1]*r[1]+a[2]*r[2],-1,1)),i=Math.sin(n);if(n<.02||i<1e-4){W=!0;return}W=!0;let s={a,b:r,ang:n,sinAng:i,offset:Math.random(),freq:1/(12+4*Math.random())},u=x([s]);(Q=new o.BufferGeometry).setAttribute("position",new o.BufferAttribute(u.position,3)),Q.setAttribute("aArcT",new o.BufferAttribute(u.arcT,1)),Q.setAttribute("aOffset",new o.BufferAttribute(u.offset,1)),Q.setAttribute("aSpeed",new o.BufferAttribute(u.speed,1)),K=new o.ShaderMaterial({vertexShader:C,fragmentShader:S,uniforms:{uTime:_.uTime,uArcProgress:_.uArcProgress,uRotY:_.uRotY,uRotX:_.uRotX,uCamZ:_.uCamZ,uMotion:_.uMotion,uColor:{value:new o.Color(v)},uBase:{value:.55}},transparent:!0,blending:o.AdditiveBlending,depthWrite:!1,depthTest:!1});let c=new o.LineSegments(Q,K);c.frustumCulled=!1,I.add(c),($=new o.BufferGeometry).setAttribute("position",new o.BufferAttribute(Float32Array.from(a),3)),$.setAttribute("aScatter",new o.BufferAttribute(Float32Array.from(r),3)),$.setAttribute("aDelay",new o.BufferAttribute(Float32Array.from([s.freq]),1)),$.setAttribute("aSize",new o.BufferAttribute(Float32Array.from([.014]),1)),$.setAttribute("aPhase",new o.BufferAttribute(Float32Array.from([Math.random()]),1)),$.setAttribute("aAccent",new o.BufferAttribute(Float32Array.from([1]),1)),$.setAttribute("aArcT",new o.BufferAttribute(Float32Array.from([s.offset]),1));let f=new o.Points($,Z);f.frustumCulled=!1,I.add(f)};Y.current=J;let ee=1,et=1,ea=3,eo=.24,er=()=>{if(!X)return;ee=Math.max(1,Math.round(e.clientWidth)),et=Math.max(1,Math.round(e.clientHeight));let t=Math.min(globalThis.window.devicePixelRatio||1,2);X.setPixelRatio(t),X.setSize(ee,et,!1),O.aspect=ee/et,O.updateProjectionMatrix();let a=Math.min(512,.66*Math.min(ee,et));ea=et/(b*a),eo=1-Math.max(.38*et,a/2+120)/et*2,_.uPixelRatio.value=t,_.uScale.value=.5*et/b};er(),O.position.z=a?ea:1.145*ea,O.position.y=-eo*b*O.position.z;let en=new ResizeObserver(er);en.observe(e);let ei=l.find(e=>(e.short??e.name).toUpperCase().includes("MTY")),el=0;if(ei){let[e,,t]=A(ei.lat,ei.lng,1);el=-Math.atan2(e,t)}let es=0,eu=!1,ec=!1,ef=!1,em=0,ed=0,eh=0,ep=0,eg=.055*!a,ev=.055*!a,eb=e=>{eu||ec||(ef="touch"===e.pointerType,em=eh=e.clientX,ed=ep=e.clientY,eg=0,ef?ec=!0:(eu=!0,t.setPointerCapture(e.pointerId),t.style.cursor="grabbing"))},ey=e=>{if(ec&&!eu){let t=e.clientX-em,a=e.clientY-ed;if(Math.abs(t)>8&&Math.abs(t)>Math.abs(a))eu=!0,eh=e.clientX,ep=e.clientY;else{if(!(Math.abs(a)>8))return;ec=!1;return}}if(!eu)return;let t=e.clientX-eh,a=e.clientY-ep;if(eh=e.clientX,ep=e.clientY,el+=.0045*t,eg=M(.0045*t*60,-2.2,2.2),!ef){let e=1-Math.min(1,Math.abs(es)/.55);es=M(es+.0035*a*(.35+.65*e),-.55,.55)}},eM=e=>{if(ec=!1,eu&&(eu=!1,!ef)){try{t.releasePointerCapture(e.pointerId)}catch{}t.style.cursor="grab"}};t.style.touchAction="pan-y",m&&(t.style.cursor="grab"),t.addEventListener("pointerdown",eb),t.addEventListener("pointermove",ey),t.addEventListener("pointerup",eM),t.addEventListener("pointercancel",eM);let eA=new o.Clock,ew=2.4*!!a,ex=!1,eT=()=>{if(!X||p)return;z=globalThis.window.requestAnimationFrame(eT);let e=Math.min(eA.getDelta(),.05);ew=Math.min(ew+e,4.4),_.uTime.value+=e,_.uProgress.value=Math.min(ew/2.4,1),_.uArcProgress.value=a?1:M((ew-2.65)/1.3,0,1),a?O.position.z=ea:O.position.z=ea+ea*(1.145-1)*(1-y(Math.min(ew/3,1))),O.position.y=-eo*b*O.position.z,_.uCamZ.value=O.position.z,N.uniforms.uIntensity.value=.32*y(Math.min(ew/2.4,1)),eu||(eg+=(ev-eg)*(1-Math.exp(-(1.6*e))),el+=eg*e,es+=(0-es)*(1-Math.exp(-(.9*e)))),_.uRotY.value=el,_.uRotX.value=es,X.render(I,O),ex||(ex=!0,d(!0))},eP=()=>{F=!1,globalThis.window.cancelAnimationFrame(z)},eC=()=>{j.current&&E&&!globalThis.document.hidden?F||p||!H||(F=!0,eA.getDelta(),z=globalThis.window.requestAnimationFrame(eT)):eP()};D.current=eC;let eS=new globalThis.IntersectionObserver(e=>{for(let t of e)E=t.isIntersecting;eC()},{threshold:0});return eS.observe(e),globalThis.document.addEventListener("visibilitychange",eC),(async()=>{let t=await w(h.signal);if(!t||p)return;let a=function(e,t,a,o){let r=[],i=[],s=[],u=[],c=[],f=[],m=[],d=a.w/a.h,h=1.145*a.camZ,p=-a.ndcY*b*h,g=()=>{let e,t,o=2*Math.random()-1,r=1.06+.28*Math.random();Math.random()<a.w/(a.w+a.h)?(e=o*r,t=.5>Math.random()?r:-r):(e=.5>Math.random()?r:-r,t=o*r);let n=h-1.2+2.8*Math.random(),l=n*b;i.push(e*l*d,t*l+p,h-n)},v=Math.PI*(3-Math.sqrt(5));for(let a=0;a<t;a++){let o=1-a/(t-1)*2,n=Math.sqrt(Math.max(0,1-o*o)),i=v*a,l=Math.cos(i)*n,d=Math.sin(i)*n,h=180*Math.atan2(-d,l)/Math.PI;e(180*Math.asin(o)/Math.PI,h)&&(r.push(l,o,d),g(),s.push((h+180)/360*.33+.22*Math.random()),u.push(.008+.005*Math.random()),c.push(Math.random()),f.push(0),m.push(-1))}for(let e of l){let[t,a,o]=A(e.lat,e.lng,1),n=(e.short??e.name).toUpperCase().includes("MTY");r.push(t,a,o),g(),s.push(.05),u.push(n?.02:.017),c.push(Math.random()),f.push(+!!n),m.push(-1)}for(let e of n){if(e.isHQ)continue;let[t,a,o]=A(e.lat,e.lng,1);r.push(t,a,o),g(),s.push((e.lng+180)/360*.33+.22*Math.random()),u.push(.013),c.push(Math.random()),f.push(0),m.push(-1)}for(let e of o)r.push(e.a[0],e.a[1],e.a[2]),i.push(e.b[0],e.b[1],e.b[2]),s.push(e.freq),u.push(.012),c.push(Math.random()),f.push(0),m.push(e.offset);return{position:Float32Array.from(r),scatter:Float32Array.from(i),delay:Float32Array.from(s),size:Float32Array.from(u),phase:Float32Array.from(c),accent:Float32Array.from(f),arcT:Float32Array.from(m),count:r.length/3}}(t,u?22e3:52e3,{w:ee,h:et,camZ:ea,ndcY:eo},V);if(p)return;(H=new o.BufferGeometry).setAttribute("position",new o.BufferAttribute(a.position,3)),H.setAttribute("aScatter",new o.BufferAttribute(a.scatter,3)),H.setAttribute("aDelay",new o.BufferAttribute(a.delay,1)),H.setAttribute("aSize",new o.BufferAttribute(a.size,1)),H.setAttribute("aPhase",new o.BufferAttribute(a.phase,1)),H.setAttribute("aAccent",new o.BufferAttribute(a.accent,1)),H.setAttribute("aArcT",new o.BufferAttribute(a.arcT,1)),Z=new o.ShaderMaterial({vertexShader:T,fragmentShader:P,uniforms:_,transparent:!0,blending:o.AdditiveBlending,depthWrite:!1,depthTest:!1});let r=new o.Points(H,Z);r.frustumCulled=!1,I.add(r);let i=x(V);(U=new o.BufferGeometry).setAttribute("position",new o.BufferAttribute(i.position,3)),U.setAttribute("aArcT",new o.BufferAttribute(i.arcT,1)),U.setAttribute("aOffset",new o.BufferAttribute(i.offset,1)),U.setAttribute("aSpeed",new o.BufferAttribute(i.speed,1)),G=new o.ShaderMaterial({vertexShader:C,fragmentShader:S,uniforms:{uTime:_.uTime,uArcProgress:_.uArcProgress,uRotY:_.uRotY,uRotX:_.uRotX,uCamZ:_.uCamZ,uMotion:_.uMotion,uColor:_.uColor,uBase:{value:.3}},transparent:!0,blending:o.AdditiveBlending,depthWrite:!1,depthTest:!1});let s=new o.LineSegments(U,G);s.frustumCulled=!1,I.add(s),e.dataset.weParticles=String(a.count),eC(),J()})().catch(()=>{}),()=>{p=!0,Y.current=null,D.current=null,h.abort(),eP(),eS.disconnect(),en.disconnect(),globalThis.document.removeEventListener("visibilitychange",eC),t.removeEventListener("pointerdown",eb),t.removeEventListener("pointermove",ey),t.removeEventListener("pointerup",eM),t.removeEventListener("pointercancel",eM),H?.dispose(),Z?.dispose(),U?.dispose(),G?.dispose(),Q?.dispose(),K?.dispose(),$?.dispose(),q.dispose(),N.dispose(),X?.dispose()}},[]),(0,t.jsxs)("div",{ref:c,className:"relative h-[100svh] w-full transition-opacity duration-1000 ease-out",style:{opacity:+!!m},children:[(0,t.jsx)("canvas",{ref:f,className:"absolute inset-0 h-full w-full","aria-hidden":"true"}),(0,t.jsx)("style",{children:`
        @keyframes hero-badge-in {
          0% {
            opacity: 0;
            transform: scale(0.85);
            clip-path: inset(0 calc(100% - 30px) 0 0 round 999px);
            animation-timing-function: cubic-bezier(0.23, 1, 0.32, 1);
          }
          28% {
            opacity: 1;
            transform: scale(1);
            clip-path: inset(0 calc(100% - 30px) 0 0 round 999px);
            animation-timing-function: linear;
          }
          37% {
            opacity: 1;
            transform: scale(1);
            clip-path: inset(0 calc(100% - 30px) 0 0 round 999px);
            animation-timing-function: cubic-bezier(0.32, 0.72, 0, 1);
          }
          100% {
            opacity: 1;
            transform: scale(1);
            clip-path: inset(0 0 0 0 round 999px);
          }
        }
        @keyframes hero-badge-in-fade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .hero-status-frame [data-globe-status] {
          transform-origin: bottom left;
          animation: hero-badge-in 1.6s 2.3s both;
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-status-frame [data-globe-status] {
            animation: hero-badge-in-fade 0.2s ease-out 0s both;
          }
        }
      `}),m&&(0,t.jsx)("div",{className:"hero-status-frame pointer-events-none absolute [&_[data-globe-status]>span]:bg-bg",style:{width:"min(66vmin, 512px)",height:"min(66vmin, 512px)",left:"50%",top:"max(38svh, min(33vmin, 256px) + 120px)",transform:"translate(-50%, -50%)"},children:(0,t.jsx)(h,{city:z,cycleDelay:2.85,resolveDelay:3.45})})]})}],76250)},93908,e=>{e.n(e.i(76250))}]);