from pathlib import Path

ROOT = Path('.')
RAW = 'https://raw.githubusercontent.com/joabest/teste/test/'

# Asset rescue: use the repository's own binary files through GitHub's raw CDN.
# This bypasses the static asset delivery issue seen on the Vercel mirror.
asset_paths = [
    'logos/clients/abrasivos-y-conversiones-ideal.webp',
    'logos/clients/zebra-technologies.webp',
    'logos/clients/divacup.webp',
    'logos/clients/enviaflores.webp',
    'logos/clients/heli.webp',
    'logos/clients/phonix-global.webp',
    'logos/clients/stwst.webp',
    'logos/clients/kpnp.webp',
    'logos/clients/neg.webp',
    'logos/clients/br.webp',
    'logos/clients/ht.webp',
    'logos/clients/tnf.webp',
    'images/page-covers/og-ai-business-check-EN.jpg',
    'images/page-covers/og-ai-check-EN.jpg',
    'images/page-covers/og-seo-check-EN.jpg',
]
map_lines = ',\n'.join(f"    '/{p}': '{RAW}{p}'" for p in asset_paths)
ui_js = f"""(() => {{
  'use strict';
  if (window.__WE_ASSET_RESCUE__) return;
  window.__WE_ASSET_RESCUE__ = true;
  const MAP = {{\n{map_lines}\n  }};

  function getPath(img) {{
    if (img.dataset.mirrorAssetPath) return img.dataset.mirrorAssetPath;
    let raw = img.getAttribute('src') || '';
    try {{
      const u = new URL(raw, location.href);
      if (u.pathname === '/_next/image') {{
        const nested = u.searchParams.get('url');
        if (nested) raw = nested;
      }}
      const path = new URL(raw, location.href).pathname;
      img.dataset.mirrorAssetPath = path;
      return path;
    }} catch {{ return raw; }}
  }}

  function fix(img) {{
    if (!(img instanceof HTMLImageElement)) return;
    const path = getPath(img);
    const rescued = MAP[path];
    if (!rescued) return;
    if (path.startsWith('/logos/clients/')) img.classList.add('mirror-client-logo');
    if (img.src === rescued) return;
    img.removeAttribute('srcset');
    img.removeAttribute('sizes');
    img.src = rescued;
  }}

  function scan(node=document) {{
    if (node instanceof HTMLImageElement) fix(node);
    if (node.querySelectorAll) node.querySelectorAll('img').forEach(fix);
  }}

  function start() {{
    scan();
    new MutationObserver(list => {{
      for (const m of list) {{
        if (m.type === 'attributes') fix(m.target);
        m.addedNodes && m.addedNodes.forEach(scan);
      }}
    }}).observe(document.documentElement, {{subtree:true, childList:true, attributes:true, attributeFilter:['src','srcset']}});
  }}
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {{once:true}}); else start();
}})();
"""
Path('mirror-ui-fixes.js').write_text(ui_js, encoding='utf-8')

# Make existing canvas globe location-aware.
gp = Path('globe-fallback.js')
g = gp.read_text(encoding='utf-8')
if 'let visitor = {' not in g:
    g = g.replace(
        "  function deg(v) { return v * Math.PI / 180; }",
        "  let visitor = { lat: -23.5505, lng: -46.6333, city: 'São Paulo' };\n"
        "  fetch('https://ipapi.co/json/').then(r => r.ok ? r.json() : null).then(d => {\n"
        "    if (!d) return; const lat=Number(d.latitude), lng=Number(d.longitude);\n"
        "    if (Number.isFinite(lat) && Number.isFinite(lng)) visitor={lat,lng,city:String(d.city||d.region||'ONLINE').trim()||'ONLINE'};\n"
        "  }).catch(()=>{});\n\n"
        "  function deg(v) { return v * Math.PI / 180; }"
    )
g = g.replace("const a = { lon: -46.6333, lat: -23.5505 };", "const a = { lon: visitor.lng, lat: visitor.lat };")
g = g.replace(
    "if (pa.z > 0.05) drawLabel(pa.x, pa.y, cssW < 760 ? 'ONLINE · SP' : 'ONLINE · SÃO PAULO');",
    "if (pa.z > -0.05) drawLabel(pa.x, pa.y, 'ONLINE · ' + String(visitor.city || 'ONLINE').toUpperCase());"
)
g = g.replace(
    "const rotation = deg(-15) + (reduced ? 0 : t * 0.000055) + mouseX * 0.085;",
    "const rotation = -deg(visitor.lng) + (reduced ? 0 : Math.sin(t * 0.00018) * 0.05) + mouseX * 0.085;"
)
gp.write_text(g, encoding='utf-8')

particle_js = r"""(() => {
  'use strict';
  if (window.__WE_PARTICLE_OBJECT__) return;
  window.__WE_PARTICLE_OBJECT__ = true;
  function boot() {
    const phrase=document.querySelector('[data-footer-phrase="true"]');
    if(!phrase) return setTimeout(boot,300);
    const section=phrase.closest('section')||phrase.parentElement;
    if(!section||section.querySelector('#we-particle-object')) return;
    section.style.position='relative'; phrase.style.position='relative'; phrase.style.zIndex='2';
    const cv=document.createElement('canvas'); cv.id='we-particle-object'; cv.title='Click to disperse particles';
    Object.assign(cv.style,{position:'absolute',width:'min(48vw,680px)',height:'min(42vw,500px)',right:'1%',top:'50%',transform:'translateY(-50%)',zIndex:'1',cursor:'pointer',pointerEvents:'auto',opacity:'.88'});
    section.appendChild(cv); const c=cv.getContext('2d'); if(!c)return;
    let W=0,H=0,D=1,raf=0,t0=performance.now(),gone=false;
    const pts=[]; for(let u=0;u<48;u++)for(let v=0;v<18;v++)pts.push([u/48*Math.PI*2,v/18*Math.PI*2]);
    function size(){const r=cv.getBoundingClientRect();W=Math.max(260,r.width);H=Math.max(200,r.height);D=Math.min(2,devicePixelRatio||1);cv.width=W*D;cv.height=H*D;c.setTransform(D,0,0,D,0,0)}
    function rot(x,y,z,ay,ax){let cy=Math.cos(ay),sy=Math.sin(ay),cx=Math.cos(ax),sx=Math.sin(ax),X=cy*x+sy*z,Z=-sy*x+cy*z,Y=cx*y-sx*Z;Z=sx*y+cx*Z;return[X,Y,Z]}
    function draw(now){if(gone)return;c.clearRect(0,0,W,H);const tt=(now-t0)*.0003,cx=W*.55,cy=H*.52,sc=Math.min(W,H)*.30;for(const p of pts){let u=p[0],v=p[1],R=1,r=.37,x=(R+r*Math.cos(v))*Math.cos(u),y=r*Math.sin(v),z=(R+r*Math.cos(v))*Math.sin(u);[x,y,z]=rot(x,y,z,tt,-.32+Math.sin(tt*.8)*.07);let dep=(z+1.45)/2.9,px=cx+x*sc,py=cy+y*sc;c.beginPath();c.arc(px,py,.6+dep*1.2,0,Math.PI*2);c.fillStyle=`rgba(240,240,248,${.10+Math.max(0,dep)*.58})`;c.fill()}raf=requestAnimationFrame(draw)}
    function explode(){if(gone)return;gone=true;cancelAnimationFrame(raf);cv.style.opacity='0';const ov=document.createElement('canvas');ov.id='we-particle-rain';Object.assign(ov.style,{position:'fixed',inset:'0',width:'100vw',height:'100vh',zIndex:'30',pointerEvents:'none'});document.body.appendChild(ov);const q=ov.getContext('2d'),d=Math.min(2,devicePixelRatio||1),w=innerWidth,h=innerHeight;ov.width=w*d;ov.height=h*d;q.setTransform(d,0,0,d,0,0);const r=cv.getBoundingClientRect(),ox=r.left+r.width*.55,oy=r.top+r.height*.52;const ps=Array.from({length:620},()=>{const a=Math.random()*Math.PI*2,s=1.5+Math.random()*9;return{x:ox+(Math.random()-.5)*120,y:oy+(Math.random()-.5)*85,vx:Math.cos(a)*s+(Math.random()-.5)*2,vy:Math.sin(a)*s-3-Math.random()*5,g:.055+Math.random()*.09,r:.5+Math.random()*1.7,a:.35+Math.random()*.65,life:1}});const born=performance.now();function fall(now){q.clearRect(0,0,w,h);let alive=0;for(const p of ps){p.vy+=p.g;p.vx*=.997;p.x+=p.vx;p.y+=p.vy;p.life-=.0018;if(p.y>h+30||p.life<=0)continue;alive++;q.beginPath();q.arc(p.x,p.y,p.r,0,Math.PI*2);q.fillStyle=`rgba(240,240,248,${p.a*p.life})`;q.fill()}if(alive&&now-born<7200)requestAnimationFrame(fall);else{ov.remove();gone=false;cv.style.opacity='.88';t0=performance.now();raf=requestAnimationFrame(draw)}}requestAnimationFrame(fall)}
    cv.addEventListener('click',explode);phrase.addEventListener('click',e=>{if(!e.target.closest('a'))explode()});addEventListener('resize',size,{passive:true});size();raf=requestAnimationFrame(draw);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
"""
Path('footer-particle-fallback.js').write_text(particle_js, encoding='utf-8')

# Load the fixes from the guard that is already present in every HTML page.
guard=Path('next-stability-guard.js')
txt=guard.read_text(encoding='utf-8')
marker='/* MIRROR_CRITICAL_VISUAL_FIXES_V2 */'
if marker not in txt:
    txt += r'''

/* MIRROR_CRITICAL_VISUAL_FIXES_V2 */
(() => {
  const load = src => {
    if (document.querySelector(`script[data-mirror-v2="${src}"]`)) return;
    const s=document.createElement('script'); s.src=src; s.defer=true; s.dataset.mirrorV2=src;
    (document.head||document.documentElement).appendChild(s);
  };
  load('/mirror-ui-fixes.js');
  if(location.pathname==='/'||location.pathname==='/index.html'){
    load('/globe-fallback.js');
    load('/footer-particle-fallback.js');
  }
})();
'''
    guard.write_text(txt, encoding='utf-8')

css=Path('mirror-fidelity.css')
s=css.read_text(encoding='utf-8')
if '.mirror-client-logo' not in s:
    s += '\n.mirror-client-logo{filter:grayscale(1)!important;opacity:.72;transition:filter .25s ease,opacity .25s ease}.mirror-client-logo:hover{filter:grayscale(0)!important;opacity:1}\n'
    css.write_text(s, encoding='utf-8')

print('mirror fixes prepared')
