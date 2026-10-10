(() => {
  'use strict';
  const slot = document.querySelector('[data-globe-slot]');
  if (!slot) return;
  const desktop = matchMedia('(min-width: 768px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-label', 'Our global network: Monterrey, Houston and Dubai');
  canvas.setAttribute('role', 'img');
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;
  let points = [], ready = false, loading = false, visible = false, frame = 0, last = 0, yaw = 1.75, size = 0;
  const rad = Math.PI / 180;
  const cities = [{ lat: 25.6866, lng: -100.3161, name: 'MONTERREY' }, { lat: 29.7604, lng: -95.3698, name: 'HOUSTON' }, { lat: 25.2048, lng: 55.2708, name: 'DUBAI' }];
  function project(lat, lng) {
    const a = lat * rad, b = lng * rad + yaw;
    return { x: size / 2 + Math.cos(a) * Math.sin(b) * size * .4, y: size / 2 - Math.sin(a) * size * .4, z: Math.cos(a) * Math.cos(b) };
  }
  function draw() {
    ctx.clearRect(0, 0, size, size);
    points.forEach(([lat, lng]) => {
      const p = project(lat, lng);
      ctx.fillStyle = `rgba(255,255,255,${p.z < 0 ? .12 : .35 + p.z * .5})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.z < 0 ? .65 : 1.1, 0, Math.PI * 2); ctx.fill();
    });
    ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = .7;
    ctx.beginPath(); ctx.arc(size / 2, size / 2, size * .4, 0, Math.PI * 2); ctx.stroke();
    const hubs = cities.map(city => project(city.lat, city.lng));
    [[0, 1], [0, 2]].forEach(([a, b], i) => {
      const A = hubs[a], B = hubs[b];
      ctx.strokeStyle = i === 0 ? '#e4007c' : 'rgba(255,255,255,.28)';
      ctx.lineWidth = i === 0 ? 1.4 : .6;
      ctx.beginPath(); ctx.moveTo(A.x, A.y);
      ctx.quadraticCurveTo((A.x + B.x) / 2, Math.min(A.y, B.y) - size * .12, B.x, B.y); ctx.stroke();
    });
    hubs.forEach((p, i) => {
      ctx.fillStyle = '#e4007c'; ctx.beginPath(); ctx.arc(p.x, p.y, 2.6, 0, Math.PI * 2); ctx.fill();
      if (i === 0) {
        ctx.font = '10px ui-monospace, monospace'; ctx.textAlign = p.x > size * .65 ? 'right' : 'left';
        ctx.fillText(`ONLINE · ${cities[i].name}`, p.x + (p.x > size * .65 ? -10 : 10), p.y - 10);
      }
    });
  }
  function animate(now) {
    frame = 0;
    if (!desktop.matches || !visible || document.hidden || !ready || reduced.matches) return;
    if (now - last >= 33) { yaw += Math.min(now - last, 50) * .000065; last = now; draw(); }
    frame = requestAnimationFrame(animate);
  }
  function sync() {
    cancelAnimationFrame(frame); frame = 0;
    if (!desktop.matches) { canvas.remove(); observer.disconnect(); return; }
    observer.observe(slot);
    if (!slot.contains(canvas)) slot.append(canvas);
    size = Math.min(650, slot.clientWidth);
    const dpr = Math.min(1.5, devicePixelRatio || 1);
    canvas.width = Math.round(size * dpr); canvas.height = Math.round(size * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!ready && !loading) load();
    if (ready) draw();
    last = performance.now();
    if (ready && visible && !document.hidden && !reduced.matches) frame = requestAnimationFrame(animate);
  }
  async function load() {
    loading = true;
    try {
      const response = await fetch('/data/ne_110m_admin_0_countries.geojson');
      if (!response.ok) throw new Error('Globe map unavailable');
      const data = await response.json();
      const map = document.createElement('canvas'); map.width = 720; map.height = 360;
      const c = map.getContext('2d');
      data.features.forEach(feature => {
        const polygons = feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates] : feature.geometry.coordinates;
        polygons.forEach(polygon => {
          c.beginPath();
          polygon.forEach(ring => ring.forEach(([lng, lat], index) => {
            const x = (lng + 180) * 2, y = (90 - lat) * 2;
            if (index === 0) c.moveTo(x, y); else c.lineTo(x, y);
          }));
          c.closePath(); c.fill('evenodd');
        });
      });
      const pixels = c.getImageData(0, 0, 720, 360).data;
      for (let y = 2; y < 360; y += 4) for (let x = 2; x < 720; x += 4) {
        if (pixels[(y * 720 + x) * 4 + 3]) points.push([90 - y / 2, x / 2 - 180]);
      }
      ready = true; sync();
    } catch (error) { canvas.remove(); slot.classList.add('globe-unavailable'); console.warn(error.message); }
  }
  const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); });
  if (desktop.matches) observer.observe(slot);
  desktop.addEventListener('change', sync); reduced.addEventListener('change', sync);
  addEventListener('resize', sync, { passive: true });
  document.addEventListener('visibilitychange', sync);
  addEventListener('pagehide', () => { cancelAnimationFrame(frame); observer.disconnect(); });
  addEventListener('pageshow', event => { if (event.persisted) sync(); });
  sync();
})();
