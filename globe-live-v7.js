(() => {
  'use strict';

  if (window.__WE_FLOW_GLOBE_V17__) return;
  window.__WE_FLOW_GLOBE_V17__ = true;

  const TAU = Math.PI * 2;
  const RAD = Math.PI / 180;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const HQ = { lat: 25.6866, lng: -100.3161 };
  const DUBAI = { lat: 25.2048, lng: 55.2708 };
  const TOKYO = { lat: 35.6762, lng: 139.6503 };
  const LONDON = { lat: 51.5074, lng: -0.1278 };
  let visitor = { lat: -23.5505, lng: -46.6333 };
  let land = [];

  function latLngVec(lat, lng) {
    const la = lat * RAD;
    const lo = lng * RAD;
    const c = Math.cos(la);
    return [c * Math.sin(lo), Math.sin(la), c * Math.cos(lo)];
  }

  async function loadVisitor() {
    const get = async (url, timeout = 2200) => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);
      try {
        const r = await fetch(url, { cache: 'no-store', signal: controller.signal });
        if (!r.ok) throw new Error('location');
        return await r.json();
      } finally {
        clearTimeout(timer);
      }
    };
    try {
      const d = await get('https://ipapi.co/json/');
      if (Number.isFinite(+d.latitude) && Number.isFinite(+d.longitude)) {
        visitor = { lat: +d.latitude, lng: +d.longitude };
        return;
      }
    } catch (_) {}
    try {
      const d = await get('https://ipwho.is/');
      if (d.success !== false && Number.isFinite(+d.latitude) && Number.isFinite(+d.longitude)) {
        visitor = { lat: +d.latitude, lng: +d.longitude };
      }
    } catch (_) {}
  }

  function ringsFromGeometry(g) {
    if (!g) return [];
    if (g.type === 'Polygon') return g.coordinates;
    if (g.type === 'MultiPolygon') return g.coordinates.flat();
    return [];
  }

  function rasterizeGeoJSON(data) {
    const mw = innerWidth < 768 ? 720 : 960;
    const mh = mw / 2;
    const mask = document.createElement('canvas');
    mask.width = mw;
    mask.height = mh;
    const m = mask.getContext('2d');
    if (!m) return [];
    m.fillStyle = '#fff';
    const px = lon => (lon + 180) / 360 * mw;
    const py = lat => (90 - lat) / 180 * mh;

    for (const feature of data.features || []) {
      for (const ring of ringsFromGeometry(feature.geometry)) {
        if (!ring || ring.length < 3) continue;
        m.beginPath();
        let started = false;
        let last = ring[0];
        for (const p of ring) {
          if (started && Math.abs(p[0] - last[0]) > 180) {
            started = false;
            last = p;
            continue;
          }
          if (!started) {
            m.moveTo(px(p[0]), py(p[1]));
            started = true;
          } else {
            m.lineTo(px(p[0]), py(p[1]));
          }
          last = p;
        }
        m.closePath();
        m.fill();
      }
    }

    const image = m.getImageData(0, 0, mw, mh).data;
    const pts = [];
    const step = innerWidth < 768 ? 5.8 : 5.2;
    for (let y = step * .5; y < mh; y += step) {
      for (let x = step * .5; x < mw; x += step) {
        if (image[((y | 0) * mw + (x | 0)) * 4 + 3] > 90) {
          pts.push([x / mw * 360 - 180, 90 - y / mh * 180]);
        }
      }
    }
    return pts;
  }

  async function loadLand() {
    try {
      const r = await fetch('/data/ne_110m_admin_0_countries.geojson', { cache: 'force-cache' });
      if (!r.ok) throw new Error('geo');
      land = rasterizeGeoJSON(await r.json());
    } catch (_) {
      land = [];
    }
  }

  function boot() {
    const hero = document.querySelector('[data-hero-section="true"]');
    if (!hero) return setTimeout(boot, 120);

    [
      'we-globe-interactive-v13',
      'we-globe-original-v15',
      'we-globe-original-v16',
      'we-globe-flow-v17',
      'we-globe-live-v6',
      'we-globe-fallback'
    ].forEach(id => document.getElementById(id)?.remove());

    const layer = document.createElement('div');
    layer.id = 'we-globe-flow-v17';
    layer.setAttribute('aria-hidden', 'true');
    Object.assign(layer.style, {
      position: 'absolute',
      left: '0',
      width: '100%',
      height: '720px',
      zIndex: '8',
      pointerEvents: 'none',
      overflow: 'visible'
    });

    const wrap = document.createElement('div');
    Object.assign(wrap.style, {
      position: 'absolute',
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'min(600px, 44vw, 62vh)',
      height: 'min(600px, 44vw, 62vh)',
      minWidth: '430px',
      minHeight: '430px',
      top: '92px',
      pointerEvents: 'auto',
      touchAction: 'none',
      cursor: 'grab',
      overflow: 'visible'
    });

    const canvas = document.createElement('canvas');
    Object.assign(canvas.style, {
      position: 'absolute',
      inset: '0',
      width: '100%',
      height: '100%',
      opacity: '0',
      transition: 'opacity .5s ease',
      willChange: 'transform'
    });

    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 600 600');
    Object.assign(svg.style, {
      position: 'absolute',
      inset: '0',
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      overflow: 'visible'
    });

    const arcs = [
      { from: HQ, to: DUBAI, stroke: 'rgb(249,115,22)', dot: 'rgb(251,146,60)', delay: '0s' },
      { from: HQ, to: visitor, stroke: 'rgb(236,72,153)', dot: 'rgb(244,114,182)', delay: '1.7s', visitor: true },
      { from: LONDON, to: TOKYO, stroke: 'rgb(6,182,212)', dot: 'rgb(34,211,238)', delay: '3.4s' }
    ];

    const arcEls = arcs.map((a, i) => {
      const g = document.createElementNS(NS, 'g');
      const path = document.createElementNS(NS, 'path');
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', a.stroke);
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('pathLength', '1');
      path.setAttribute('stroke-dasharray', '1');
      path.setAttribute('stroke-dashoffset', '1');
      path.setAttribute('stroke-width', '1.25');
      path.style.setProperty('--target-opacity', '.82');
      path.style.animation = `we-flow-arc 6.2s ease-in-out ${a.delay} infinite`;

      const fromDot = document.createElementNS(NS, 'circle');
      fromDot.setAttribute('r', '6');
      fromDot.setAttribute('fill', a.dot);
      fromDot.style.filter = `drop-shadow(0 0 12px ${a.dot})`;

      const toDot = document.createElementNS(NS, 'circle');
      toDot.setAttribute('r', '6');
      toDot.setAttribute('fill', a.dot);
      toDot.style.filter = `drop-shadow(0 0 12px ${a.dot})`;

      g.append(path, fromDot, toDot);
      svg.appendChild(g);
      return { g, path, fromDot, toDot, data: a };
    });

    const style = document.createElement('style');
    style.textContent = `
      @keyframes we-flow-arc {
        0% { stroke-dashoffset:1; opacity:0; }
        2% { opacity:var(--target-opacity,.82); }
        35% { stroke-dashoffset:0; opacity:var(--target-opacity,.82); }
        65% { stroke-dashoffset:0; opacity:var(--target-opacity,.82); }
        98% { opacity:var(--target-opacity,.82); }
        100% { stroke-dashoffset:1; opacity:0; }
      }
      @media (max-width: 767px) {
        #we-globe-flow-v17 { height: 300px !important; }
        #we-globe-flow-v17 > div {
          width: 230px !important;
          height: 230px !important;
          min-width: 230px !important;
          min-height: 230px !important;
          top: 22px !important;
        }
      }
      @media (min-width:768px) and (max-width:1100px) {
        #we-globe-flow-v17 > div {
          width: 430px !important;
          height: 430px !important;
          min-width: 430px !important;
          min-height: 430px !important;
          top: 72px !important;
        }
      }
    `;
    document.head.appendChild(style);

    wrap.append(canvas, svg);
    layer.appendChild(wrap);
    document.body.appendChild(layer);

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const LOGICAL = 600;
    const CX = 300;
    const CY = 300;
    const R = 238;
    let yaw = .18;
    let pitch = -.08;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let velX = 0;
    let velY = 0;
    let lastTime = performance.now();
    let dpr = 1;
    let visible = true;

    function syncTop() {
      const r = hero.getBoundingClientRect();
      layer.style.top = (window.scrollY + r.top) + 'px';
    }

    function resize() {
      syncTop();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(LOGICAL * dpr);
      canvas.height = Math.round(LOGICAL * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function rotatePoint(lat, lng) {
      let [x, y, z] = latLngVec(lat, lng);
      const cy = Math.cos(yaw), sy = Math.sin(yaw);
      const x1 = x * cy + z * sy;
      const z1 = -x * sy + z * cy;
      const cp = Math.cos(pitch), sp = Math.sin(pitch);
      const y2 = y * cp - z1 * sp;
      const z2 = y * sp + z1 * cp;
      return { x: CX + x1 * R, y: CY - y2 * R, z: z2 };
    }

    function drawSphere() {
      ctx.clearRect(0, 0, LOGICAL, LOGICAL);

      const halo = ctx.createRadialGradient(CX, CY, R * .82, CX, CY, R * 1.16);
      halo.addColorStop(0, 'rgba(255,255,255,0)');
      halo.addColorStop(.70, 'rgba(148,163,184,.025)');
      halo.addColorStop(1, 'rgba(148,163,184,0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(CX, CY, R * 1.16, 0, TAU);
      ctx.fill();

      const sphere = ctx.createRadialGradient(CX - R * .28, CY - R * .34, R * .03, CX, CY, R);
      sphere.addColorStop(0, 'rgba(31,41,55,.38)');
      sphere.addColorStop(.44, 'rgba(9,14,18,.76)');
      sphere.addColorStop(.84, 'rgba(3,7,8,.94)');
      sphere.addColorStop(1, 'rgba(1,3,4,.99)');
      ctx.fillStyle = sphere;
      ctx.beginPath();
      ctx.arc(CX, CY, R, 0, TAU);
      ctx.fill();

      ctx.save();
      ctx.beginPath();
      ctx.arc(CX, CY, R - 1, 0, TAU);
      ctx.clip();

      for (const p of land) {
        const q = rotatePoint(p[1], p[0]);
        if (q.z <= 0) continue;
        const depth = .18 + q.z * .82;
        const a = .10 + depth * .64;
        const s = .65 + depth * .8;
        ctx.fillStyle = `rgba(226,232,240,${a})`;
        ctx.fillRect(q.x - s * .5, q.y - s * .5, s, s);
      }
      ctx.restore();

      const rim = ctx.createLinearGradient(CX - R, CY, CX + R, CY);
      rim.addColorStop(0, 'rgba(226,232,240,.48)');
      rim.addColorStop(.16, 'rgba(226,232,240,.08)');
      rim.addColorStop(.76, 'rgba(226,232,240,.05)');
      rim.addColorStop(1, 'rgba(226,232,240,.40)');
      ctx.strokeStyle = rim;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.arc(CX, CY, R - .5, 0, TAU);
      ctx.stroke();
    }

    function updateArcs() {
      arcs[1].to = visitor;
      for (const item of arcEls) {
        const a = rotatePoint(item.data.from.lat, item.data.from.lng);
        const b = rotatePoint(item.data.to.lat, item.data.to.lng);
        const front = Math.max(0, Math.min(1, (a.z + b.z + .45) / 1.45));
        item.g.style.opacity = String(.16 + front * .84);

        const mx = (a.x + b.x) * .5;
        const my = (a.y + b.y) * .5;
        let dx = mx - CX;
        let dy = my - CY;
        const len = Math.hypot(dx, dy) || 1;
        dx /= len;
        dy /= len;
        const chord = Math.hypot(b.x - a.x, b.y - a.y);
        const lift = 34 + chord * .20;
        const cpx = mx + dx * lift;
        const cpy = my + dy * lift;

        item.path.setAttribute('d', `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} Q ${cpx.toFixed(1)} ${cpy.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`);
        item.fromDot.setAttribute('cx', a.x.toFixed(1));
        item.fromDot.setAttribute('cy', a.y.toFixed(1));
        item.toDot.setAttribute('cx', b.x.toFixed(1));
        item.toDot.setAttribute('cy', b.y.toFixed(1));
        item.fromDot.style.opacity = a.z > -.15 ? '1' : '.15';
        item.toDot.style.opacity = b.z > -.15 ? '1' : '.15';
      }
    }

    function frame(now) {
      if (!visible || document.hidden) return;
      const dt = Math.min(40, now - lastTime);
      lastTime = now;

      if (!dragging) {
        yaw += velX;
        pitch = clamp(pitch + velY, -.62, .62);
        velX *= .92;
        velY *= .88;
        if (Math.abs(velX) < .00002) velX = 0;
        if (Math.abs(velY) < .00002) velY = 0;
        if (!reduced && Math.abs(velX) < .0001) yaw += dt * .000075;
      }

      drawSphere();
      updateArcs();
      canvas.style.opacity = '1';
      requestAnimationFrame(frame);
    }

    wrap.addEventListener('pointerdown', e => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      velX = velY = 0;
      wrap.style.cursor = 'grabbing';
      wrap.setPointerCapture?.(e.pointerId);
    });

    wrap.addEventListener('pointermove', e => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      const sx = dx * .0066;
      const sy = dy * .0046;
      yaw += sx;
      pitch = clamp(pitch + sy, -.62, .62);
      velX = sx * .18;
      velY = sy * .12;
    });

    const release = e => {
      if (!dragging) return;
      dragging = false;
      wrap.style.cursor = 'grab';
      try { wrap.releasePointerCapture?.(e.pointerId); } catch (_) {}
    };
    wrap.addEventListener('pointerup', release);
    wrap.addEventListener('pointercancel', release);
    wrap.addEventListener('lostpointercapture', release);

    const io = new IntersectionObserver(entries => {
      visible = entries.some(e => e.isIntersecting);
      if (visible) requestAnimationFrame(frame);
    }, { rootMargin: '150px' });
    io.observe(hero);

    addEventListener('resize', resize, { passive: true });
    addEventListener('scroll', syncTop, { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && visible) {
        lastTime = performance.now();
        requestAnimationFrame(frame);
      }
    });

    resize();
    Promise.all([loadLand(), loadVisitor()]).finally(() => requestAnimationFrame(frame));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();