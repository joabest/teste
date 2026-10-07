(() => {
  'use strict';

  if (window.__WE_CUSTOM_GLOBE__) return;
  window.__WE_CUSTOM_GLOBE__ = true;

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

  function pointInPoly(lon, lat, poly) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i][0], yi = poly[i][1];
      const xj = poly[j][0], yj = poly[j][1];
      const hit = ((yi > lat) !== (yj > lat)) &&
        (lon < (xj - xi) * (lat - yi) / ((yj - yi) || 1e-6) + xi);
      if (hit) inside = !inside;
    }
    return inside;
  }

  function isLand(lon, lat) {
    for (const p of CONTINENTS) if (pointInPoly(lon, lat, p)) return true;
    return false;
  }

  function deg(v) { return v * Math.PI / 180; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  const landDots = [];
  for (let lat = -70; lat <= 78; lat += 2.15) {
    const lonStep = 2.05 / Math.max(0.42, Math.cos(deg(lat)));
    for (let lon = -180; lon < 180; lon += lonStep) {
      const jitter = Math.sin((lon + lat) * 1.73) * 0.35;
      const jl = lon + jitter;
      const jt = lat + Math.cos((lon - lat) * 1.17) * 0.22;
      if (isLand(jl, jt)) landDots.push([jl, jt]);
    }
  }

  const stars = Array.from({ length: 115 }, (_, i) => ({
    x: ((i * 73) % 997) / 997,
    y: ((i * 193) % 991) / 991,
    a: 0.12 + ((i * 17) % 31) / 100,
    r: 0.45 + ((i * 11) % 8) / 10
  }));

  function init() {
    const hero = document.querySelector('[data-hero-section="true"]');
    if (!hero) {
      setTimeout(init, 250);
      return;
    }
    if (document.getElementById('we-custom-globe')) return;

    const canvas = document.createElement('canvas');
    canvas.id = 'we-custom-globe';
    canvas.setAttribute('aria-hidden', 'true');
    Object.assign(canvas.style, {
      position: 'absolute',
      inset: '0 0 auto 0',
      width: '100%',
      height: '100svh',
      minHeight: '620px',
      maxHeight: '900px',
      zIndex: '1',
      pointerEvents: 'none',
      opacity: '0',
      transition: 'opacity 900ms ease',
      mixBlendMode: 'normal'
    });
    hero.prepend(canvas);

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let cssW = 0, cssH = 0, dpr = 1;
    let mouseX = 0, mouseY = 0, targetMouseX = 0, targetMouseY = 0;
    let raf = 0;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

    function resize() {
      cssW = Math.max(320, hero.clientWidth || innerWidth);
      cssH = clamp(innerHeight || 800, 620, 900);
      dpr = Math.min(2, devicePixelRatio || 1);
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      canvas.style.height = cssH + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function project(lon, lat, rotY, tilt, cx, cy, r) {
      const la = deg(lat);
      const lo = deg(lon) + rotY;
      const x0 = Math.cos(la) * Math.sin(lo);
      const z0 = Math.cos(la) * Math.cos(lo);
      const y0 = -Math.sin(la);
      const ct = Math.cos(tilt), st = Math.sin(tilt);
      const y = y0 * ct - z0 * st;
      const z = y0 * st + z0 * ct;
      return { x: cx + x0 * r, y: cy + y * r, z };
    }

    function drawGrid(rotY, tilt, cx, cy, r) {
      ctx.save();
      ctx.lineWidth = 0.55;
      for (let lat = -60; lat <= 60; lat += 20) {
        ctx.beginPath();
        let started = false;
        for (let lon = -180; lon <= 180; lon += 3) {
          const p = project(lon, lat, rotY, tilt, cx, cy, r);
          if (p.z > -0.03) {
            if (!started) { ctx.moveTo(p.x, p.y); started = true; }
            else ctx.lineTo(p.x, p.y);
          } else started = false;
        }
        ctx.strokeStyle = 'rgba(240,240,248,0.065)';
        ctx.stroke();
      }
      for (let lon = -180; lon < 180; lon += 20) {
        ctx.beginPath();
        let started = false;
        for (let lat = -88; lat <= 88; lat += 2) {
          const p = project(lon, lat, rotY, tilt, cx, cy, r);
          if (p.z > -0.03) {
            if (!started) { ctx.moveTo(p.x, p.y); started = true; }
            else ctx.lineTo(p.x, p.y);
          } else started = false;
        }
        ctx.strokeStyle = 'rgba(240,240,248,0.055)';
        ctx.stroke();
      }
      ctx.restore();
    }

    function drawRoute(rotY, tilt, cx, cy, r) {
      const a = { lon: -46.6333, lat: -23.5505 };
      const b = { lon: -100.3161, lat: 25.6866 };
      const pa = project(a.lon, a.lat, rotY, tilt, cx, cy, r);
      const pb = project(b.lon, b.lat, rotY, tilt, cx, cy, r);
      if (pa.z < -0.18 && pb.z < -0.18) return;

      const mx = (pa.x + pb.x) / 2;
      const my = (pa.y + pb.y) / 2 - r * 0.16;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(pa.x, pa.y);
      ctx.quadraticCurveTo(mx, my, pb.x, pb.y);
      const g = ctx.createLinearGradient(pa.x, pa.y, pb.x, pb.y);
      g.addColorStop(0, 'rgba(228,0,124,0.15)');
      g.addColorStop(0.55, 'rgba(228,0,124,0.82)');
      g.addColorStop(1, 'rgba(240,240,248,0.35)');
      ctx.strokeStyle = g;
      ctx.lineWidth = 1.1;
      ctx.stroke();

      for (const p of [pa, pb]) {
        if (p.z > -0.18) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 3.2, 0, Math.PI * 2);
          ctx.fillStyle = '#e4007c';
          ctx.shadowBlur = 12;
          ctx.shadowColor = '#e4007c';
          ctx.fill();
        }
      }
      ctx.restore();

      if (pa.z > 0.05) drawLabel(pa.x, pa.y, cssW < 760 ? 'ONLINE · SP' : 'ONLINE · SÃO PAULO');
    }

    function drawLabel(x, y, text) {
      ctx.save();
      ctx.font = cssW < 760 ? '9px ui-monospace, SFMono-Regular, Menlo, monospace' : '10px ui-monospace, SFMono-Regular, Menlo, monospace';
      ctx.textBaseline = 'middle';
      const tw = ctx.measureText(text).width;
      const w = tw + 34;
      const h = 24;
      let lx = x + 14;
      let ly = y - 34;
      if (lx + w > cssW - 12) lx = x - w - 14;
      const rr = 12;
      ctx.beginPath();
      ctx.roundRect(lx, ly, w, h, rr);
      ctx.fillStyle = 'rgba(18,18,18,0.88)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(240,240,248,0.12)';
      ctx.lineWidth = 0.75;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(lx + 12, ly + h / 2, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#e4007c';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#e4007c';
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(240,240,248,0.62)';
      ctx.fillText(text, lx + 21, ly + h / 2 + 0.5);
      ctx.restore();
    }

    function frame(t) {
      mouseX += (targetMouseX - mouseX) * 0.035;
      mouseY += (targetMouseY - mouseY) * 0.035;
      ctx.clearRect(0, 0, cssW, cssH);

      const mobile = cssW < 760;
      const radius = mobile ? Math.min(cssW * 0.43, 185) : Math.min(cssW * 0.245, cssH * 0.34, 295);
      const cx = cssW / 2 + mouseX * (mobile ? 4 : 12);
      const cy = mobile ? Math.min(265, cssH * 0.35) : Math.min(338, cssH * 0.39) + mouseY * 6;
      const rotation = deg(-15) + (reduced ? 0 : t * 0.000055) + mouseX * 0.085;
      const tilt = deg(-8 + mouseY * 2.5);

      const bg = ctx.createRadialGradient(cx, cy, radius * 0.1, cx, cy, radius * 1.35);
      bg.addColorStop(0, 'rgba(255,255,255,0.028)');
      bg.addColorStop(0.48, 'rgba(255,255,255,0.012)');
      bg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.35, 0, Math.PI * 2);
      ctx.fill();

      const sphere = ctx.createRadialGradient(cx - radius * 0.25, cy - radius * 0.33, radius * 0.04, cx, cy, radius);
      sphere.addColorStop(0, 'rgba(245,245,250,0.055)');
      sphere.addColorStop(0.5, 'rgba(70,70,80,0.025)');
      sphere.addColorStop(1, 'rgba(0,0,0,0.03)');
      ctx.fillStyle = sphere;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.clip();

      for (const s of stars) {
        const sx = s.x * cssW;
        const sy = s.y * cssH;
        if (Math.hypot(sx - cx, sy - cy) < radius * 1.08) continue;
        ctx.beginPath();
        ctx.arc(sx, sy, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(240,240,248,${s.a * 0.34})`;
        ctx.fill();
      }

      drawGrid(rotation, tilt, cx, cy, radius);

      const sizeBase = mobile ? 0.8 : 0.95;
      for (const d of landDots) {
        const p = project(d[0], d[1], rotation, tilt, cx, cy, radius);
        if (p.z < -0.08) continue;
        const depth = clamp((p.z + 0.08) / 1.08, 0, 1);
        const edge = Math.sqrt(Math.max(0, 1 - ((p.x - cx) / radius) ** 2 - ((p.y - cy) / radius) ** 2));
        const alpha = (0.12 + depth * 0.72) * clamp(edge * 1.8, 0.28, 1);
        ctx.beginPath();
        ctx.arc(p.x, p.y, sizeBase * (0.72 + depth * 0.65), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(239,239,247,${alpha})`;
        ctx.fill();
      }
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius + 0.5, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(240,240,248,0.14)';
      ctx.lineWidth = 0.8;
      ctx.stroke();
      ctx.restore();

      drawRoute(rotation, tilt, cx, cy, radius);

      if (!reduced) raf = requestAnimationFrame(frame);
    }

    function onPointer(e) {
      targetMouseX = clamp((e.clientX / innerWidth - 0.5) * 2, -1, 1);
      targetMouseY = clamp((e.clientY / innerHeight - 0.5) * 2, -1, 1);
    }

    addEventListener('resize', resize, { passive: true });
    addEventListener('pointermove', onPointer, { passive: true });
    resize();
    requestAnimationFrame(() => { canvas.style.opacity = '1'; });
    frame(performance.now());

    if (reduced) {
      cancelAnimationFrame(raf);
      frame(0);
    }

    // Mirror safety: if Next hydration never completes, keep the captured page visible.
    setTimeout(() => {
      const main = document.querySelector('main[data-home-main="true"]');
      if (main && getComputedStyle(main).visibility === 'hidden') main.style.visibility = 'visible';
      const nav = document.querySelector('header[data-nav-root="true"]');
      if (nav && Number(getComputedStyle(nav).opacity) < 0.1) {
        nav.style.opacity = '1';
        nav.style.pointerEvents = 'auto';
      }
    }, 1800);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
