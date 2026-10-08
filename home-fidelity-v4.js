(() => {
  'use strict';
  if (window.__WE_HOME_FIDELITY_V4__) return;
  window.__WE_HOME_FIDELITY_V4__ = true;

  const ACCENT = '#e4007c';
  const FG = '#f0f0f8';
  const BG = '#171717';
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const deg = v => v * Math.PI / 180;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --------------------------- HERO GLOBE --------------------------- */
  async function loadLandPoints() {
    try {
      const raw = (await fetch('/globe-land-v4.dat', { cache: 'force-cache' }).then(r => r.ok ? r.text() : Promise.reject(r.status))).trim();
      const bytes = Uint8Array.from(atob(raw), c => c.charCodeAt(0));
      const view = new DataView(bytes.buffer);
      const out = new Array(bytes.length / 4);
      for (let i = 0, n = 0; i + 3 < bytes.length; i += 4, n++) {
        const qlon = view.getUint16(i, false);
        const qlat = view.getUint16(i + 2, false);
        out[n] = [qlon / 65535 * 360 - 180, qlat / 65535 * 180 - 90];
      }
      return out;
    } catch (e) {
      console.warn('[globe-v4] land data unavailable', e);
      return [];
    }
  }

  function findHero() {
    return document.querySelector('[data-hero-section="true"]') ||
      [...document.querySelectorAll('main section, main > div')].find(el => {
        const t = (el.textContent || '').toLowerCase();
        return t.includes('tech partner') || t.includes('evolved');
      }) || document.querySelector('main');
  }

  async function bootGlobe() {
    const hero = findHero();
    if (!hero) return setTimeout(bootGlobe, 180);

    document.getElementById('we-globe-layer-v3')?.remove();
    document.getElementById('we-globe-layer-v4')?.remove();
    document.getElementById('we-custom-globe-v3')?.remove();

    const land = await loadLandPoints();
    if (!document.body.contains(hero)) return;

    if (getComputedStyle(hero).position === 'static') hero.style.position = 'relative';
    const layer = document.createElement('div');
    layer.id = 'we-globe-layer-v4';
    layer.setAttribute('aria-hidden', 'true');
    Object.assign(layer.style, {
      position: 'absolute', inset: '0', overflow: 'visible', pointerEvents: 'none',
      zIndex: '1', minHeight: '620px'
    });

    const canvas = document.createElement('canvas');
    canvas.id = 'we-globe-v4';
    Object.assign(canvas.style, {
      width: '100%', height: 'min(940px,100svh)', display: 'block', pointerEvents: 'none',
      opacity: '0', transition: 'opacity 700ms cubic-bezier(.16,1,.3,1)'
    });
    layer.appendChild(canvas);
    hero.prepend(layer);

    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
    let W = 0, H = 0, DPR = 1, cx = 0, cy = 0, radius = 0;
    let mouseX = 0, mouseY = 0, currentMX = 0, currentMY = 0;
    let visible = true, start = performance.now();

    const ro = new ResizeObserver(resize);
    ro.observe(hero);
    const io = new IntersectionObserver(e => visible = !!e[0]?.isIntersecting, { rootMargin: '180px' });
    io.observe(hero);

    function resize() {
      const r = hero.getBoundingClientRect();
      W = Math.max(320, Math.round(r.width || innerWidth));
      H = clamp(Math.round(Math.min(Math.max(innerHeight, 620), 940)), 620, 940);
      DPR = Math.min(devicePixelRatio || 1, 1.75);
      canvas.width = Math.round(W * DPR);
      canvas.height = Math.round(H * DPR);
      canvas.style.height = H + 'px';
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      const mobile = W < 760;
      radius = mobile ? Math.min(W * .43, 190) : Math.min(W * .207, H * .32, 292);
      cx = W * .5;
      cy = mobile ? Math.min(H * .39, 310) : H * .465;
    }
    resize();

    addEventListener('pointermove', e => {
      mouseX = (e.clientX / Math.max(innerWidth, 1) - .5) * 2;
      mouseY = (e.clientY / Math.max(innerHeight, 1) - .5) * 2;
    }, { passive: true });

    function project(lon, lat, rot, tilt) {
      const la = deg(lat), lo = deg(lon) + rot;
      const x0 = Math.cos(la) * Math.sin(lo);
      const z0 = Math.cos(la) * Math.cos(lo);
      const y0 = -Math.sin(la);
      const ct = Math.cos(tilt), st = Math.sin(tilt);
      const y = y0 * ct - z0 * st;
      const z = y0 * st + z0 * ct;
      return { x: cx + x0 * radius, y: cy + y * radius, z };
    }

    function drawOrbit(i, front) {
      const angle = (-.72 + i * .173) + Math.sin(i * 3.17) * .12;
      const ry = radius * (.19 + (i % 5) * .055);
      const rx = radius * (1.08 + (i % 4) * .045);
      const yoff = radius * (((i * 37) % 19) / 19 - .5) * .26;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.beginPath();
      if (front) ctx.ellipse(0, yoff, rx, ry, 0, -.08, Math.PI * .98);
      else ctx.ellipse(0, yoff, rx, ry, 0, Math.PI, TAU);
      ctx.strokeStyle = `rgba(240,240,248,${front ? .115 : .055})`;
      ctx.lineWidth = .58;
      ctx.stroke();
      ctx.restore();
    }

    function drawSphereBody() {
      const g = ctx.createRadialGradient(cx - radius * .28, cy - radius * .34, radius * .05, cx, cy, radius * 1.04);
      g.addColorStop(0, 'rgba(72,72,78,.18)');
      g.addColorStop(.38, 'rgba(20,20,22,.47)');
      g.addColorStop(.82, 'rgba(6,6,7,.78)');
      g.addColorStop(1, 'rgba(0,0,0,.92)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(cx, cy, radius, 0, TAU); ctx.fill();

      const glass = ctx.createRadialGradient(cx - radius * .44, cy - radius * .46, 0, cx, cy, radius);
      glass.addColorStop(0, 'rgba(255,255,255,.095)');
      glass.addColorStop(.16, 'rgba(255,255,255,.025)');
      glass.addColorStop(.54, 'rgba(255,255,255,0)');
      glass.addColorStop(1, 'rgba(255,255,255,.025)');
      ctx.fillStyle = glass;
      ctx.beginPath(); ctx.arc(cx, cy, radius, 0, TAU); ctx.fill();
    }

    function drawLand(rot, tilt) {
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, radius * .997, 0, TAU); ctx.clip();
      for (let i = 0; i < land.length; i++) {
        const p = project(land[i][0], land[i][1], rot, tilt);
        if (p.z < -.20) continue;
        const front = clamp((p.z + .20) / 1.2, 0, 1);
        const dist = Math.hypot(p.x - cx, p.y - cy) / radius;
        const edge = clamp((1 - dist) * 5.4, .15, 1);
        const alpha = (p.z < 0 ? .08 : .26 + front * .72) * edge;
        const size = p.z < 0 ? .42 : .52 + front * .82;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, TAU);
        ctx.fillStyle = `rgba(240,240,248,${alpha})`;
        ctx.fill();
      }
      ctx.restore();
    }

    function drawRim() {
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, radius * 1.003, 0, TAU);
      ctx.strokeStyle = 'rgba(240,240,248,.24)';
      ctx.lineWidth = 1;
      ctx.shadowColor = 'rgba(240,240,248,.55)';
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.shadowBlur = 0;

      const rg = ctx.createRadialGradient(cx, cy, radius * .83, cx, cy, radius * 1.025);
      rg.addColorStop(0, 'rgba(255,255,255,0)');
      rg.addColorStop(.86, 'rgba(255,255,255,.012)');
      rg.addColorStop(.965, 'rgba(255,255,255,.085)');
      rg.addColorStop(1, 'rgba(255,255,255,.02)');
      ctx.fillStyle = rg;
      ctx.beginPath(); ctx.arc(cx, cy, radius * 1.03, 0, TAU); ctx.fill();
      ctx.restore();
    }

    function drawRoute(rot, tilt) {
      const sp = project(-46.6333, -23.5505, rot, tilt);
      const mty = project(-100.3161, 25.6866, rot, tilt);
      if (sp.z > -.15 || mty.z > -.15) {
        ctx.save();
        ctx.beginPath(); ctx.moveTo(sp.x, sp.y);
        const mx = (sp.x + mty.x) / 2 + radius * .03;
        const my = (sp.y + mty.y) / 2 - radius * .24;
        ctx.quadraticCurveTo(mx, my, mty.x, mty.y);
        const gr = ctx.createLinearGradient(sp.x, sp.y, mty.x, mty.y);
        gr.addColorStop(0, 'rgba(228,0,124,.10)');
        gr.addColorStop(.55, 'rgba(228,0,124,.76)');
        gr.addColorStop(1, 'rgba(228,0,124,.18)');
        ctx.strokeStyle = gr; ctx.lineWidth = .9; ctx.stroke();
        ctx.restore();
      }

      const mobile = W < 760;
      const text = 'ONLINE · SÃO PAULO';
      ctx.save();
      ctx.font = `${mobile ? 8.5 : 9.5}px ui-monospace,SFMono-Regular,Menlo,monospace`;
      ctx.textBaseline = 'middle';
      const tw = ctx.measureText(text).width;
      const bw = tw + 31, bh = 23;
      let lx = cx + radius * .34, ly = cy - radius * .88;
      if (mobile) { lx = cx + radius * .05; ly = cy - radius * .93; }
      ctx.beginPath(); ctx.roundRect(lx, ly, bw, bh, 11.5);
      ctx.fillStyle = 'rgba(15,15,16,.92)'; ctx.fill();
      ctx.strokeStyle = 'rgba(240,240,248,.12)'; ctx.lineWidth = .7; ctx.stroke();
      ctx.beginPath(); ctx.arc(lx + 11.5, ly + bh / 2, 3.2, 0, TAU);
      ctx.fillStyle = ACCENT; ctx.shadowColor = ACCENT; ctx.shadowBlur = 11; ctx.fill();
      ctx.shadowBlur = 0; ctx.fillStyle = 'rgba(240,240,248,.64)';
      ctx.fillText(text, lx + 20, ly + bh / 2 + .2);
      ctx.restore();
    }

    function draw(t) {
      requestAnimationFrame(draw);
      if (!visible || document.hidden) return;
      currentMX += (mouseX - currentMX) * .025;
      currentMY += (mouseY - currentMY) * .025;
      const elapsed = t - start;
      const rot = deg(75) - (reduced ? 0 : elapsed * .0000205) + currentMX * .055;
      const tilt = deg(-7) + currentMY * .04;
      ctx.clearRect(0, 0, W, H);

      const aura = ctx.createRadialGradient(cx, cy, radius * .3, cx, cy, radius * 1.35);
      aura.addColorStop(0, 'rgba(240,240,248,.035)');
      aura.addColorStop(.72, 'rgba(240,240,248,.008)');
      aura.addColorStop(1, 'rgba(240,240,248,0)');
      ctx.fillStyle = aura; ctx.beginPath(); ctx.arc(cx, cy, radius * 1.4, 0, TAU); ctx.fill();

      for (let i = 0; i < 13; i++) drawOrbit(i, false);
      drawSphereBody();
      drawLand(rot, tilt);
      drawRim();
      drawRoute(rot, tilt);
      for (let i = 0; i < 13; i++) drawOrbit(i, true);
    }

    requestAnimationFrame(() => canvas.style.opacity = '1');
    requestAnimationFrame(draw);
  }

  /* ---------------------- FINAL EVOLVE PARTICLES -------------------- */
  function findEvolveHeading() {
    const priority = [...document.querySelectorAll('h1,h2,h3')].filter(el => {
      const t = (el.textContent || '').replace(/\s+/g, ' ').toLowerCase();
      return t.includes('every business') && t.includes('evolve');
    });
    if (priority.length) return priority.sort((a,b) => a.textContent.length - b.textContent.length)[0];
    const all = [...document.querySelectorAll('section,div')].filter(el => {
      const t = (el.textContent || '').replace(/\s+/g, ' ').toLowerCase();
      return t.includes('every business') && t.includes('evolve');
    });
    return all.sort((a,b) => a.textContent.length - b.textContent.length)[0] || null;
  }

  function bootEvolveParticles() {
    if (document.getElementById('we-evolve-particles-v4')) return;
    const heading = findEvolveHeading();
    if (!heading) return setTimeout(bootEvolveParticles, 350);
    const section = heading.closest('section') || heading.parentElement?.parentElement || heading.parentElement;
    if (!section) return;

    const canvas = document.createElement('canvas');
    canvas.id = 'we-evolve-particles-v4';
    canvas.setAttribute('aria-hidden', 'true');
    Object.assign(canvas.style, {
      position: 'fixed', inset: '0', width: '100vw', height: '100vh', zIndex: '2',
      pointerEvents: 'none', opacity: '1'
    });
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });

    if (getComputedStyle(section).position === 'static') section.style.position = 'relative';
    heading.style.position = 'relative';
    heading.style.zIndex = '3';

    const hit = document.createElement('button');
    hit.type = 'button';
    hit.setAttribute('aria-label', 'Activate particle effect');
    hit.title = 'click';
    Object.assign(hit.style, {
      position: 'absolute', border: '0', outline: '0', background: 'transparent', padding: '0',
      zIndex: '2', cursor: 'pointer', borderRadius: '50%', opacity: '0'
    });
    section.appendChild(hit);

    let W = 0, H = 0, DPR = 1, exploded = false, done = false, explodeAt = 0;
    let sphereCenter = { x: 0, y: 0, pageX: 0, pageY: 0, r: 150 };
    let last = performance.now();
    const particles = [];
    const COUNT = innerWidth < 760 ? 460 : 820;

    for (let i = 0; i < COUNT; i++) {
      const y = 1 - (i / (COUNT - 1)) * 2;
      const rr = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = Math.PI * (3 - Math.sqrt(5)) * i;
      const x = Math.cos(theta) * rr;
      const z = Math.sin(theta) * rr;
      particles.push({
        ux: x, uy: y, uz: z,
        x: 0, y: 0, vx: 0, vy: 0,
        size: .55 + ((i * 17) % 11) / 11 * 1.25,
        alpha: .2 + ((i * 13) % 17) / 17 * .72,
        accent: i % 113 === 0 ? ACCENT : (i % 167 === 0 ? '#46d9ff' : FG),
        stopY: 0, landed: false
      });
    }

    function resize() {
      W = innerWidth; H = innerHeight; DPR = Math.min(devicePixelRatio || 1, 1.7);
      canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      positionHit();
    }

    function positionHit() {
      if (exploded) return;
      const hr = heading.getBoundingClientRect();
      const sr = section.getBoundingClientRect();
      const mobile = W < 760;
      const r = mobile ? Math.min(W * .24, 95) : Math.min(hr.width * .20, 190);
      const vx = mobile ? hr.left + hr.width * .68 : hr.left + hr.width * .64;
      const vy = hr.top + hr.height * (mobile ? .57 : .53);
      sphereCenter = { x: vx, y: vy, pageX: vx + scrollX, pageY: vy + scrollY, r };
      const localX = vx - sr.left - r * 1.08;
      const localY = vy - sr.top - r * 1.08;
      Object.assign(hit.style, {
        left: localX + 'px', top: localY + 'px', width: r * 2.16 + 'px', height: r * 2.16 + 'px'
      });
    }

    function explode() {
      if (exploded || reduced) return;
      exploded = true; explodeAt = performance.now();
      hit.style.pointerEvents = 'none';
      const footer = document.querySelector('footer');
      const footerTop = footer ? footer.getBoundingClientRect().top + scrollY : document.documentElement.scrollHeight - 500;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x = sphereCenter.pageX + p.ux * sphereCenter.r;
        p.y = sphereCenter.pageY - p.uy * sphereCenter.r;
        const speed = 1.1 + ((i * 29) % 31) / 31 * 4.4;
        p.vx = p.ux * speed + Math.sin(i * 12.9898) * 1.6;
        p.vy = -p.uy * speed * .65 - 1.5 - ((i * 7) % 13) / 13 * 2.4;
        p.stopY = footerTop + 20 + ((i * 47) % 420);
      }
      section.dispatchEvent(new CustomEvent('we:evolve-explode'));
    }
    hit.addEventListener('click', explode);

    // reveal the last block progressively when it reaches the viewport
    const revealTargets = [heading, ...section.querySelectorAll('p,a')].filter((v,i,a) => a.indexOf(v) === i).slice(0, 12);
    if (!reduced) {
      revealTargets.forEach((el, i) => {
        el.style.transition = `opacity 700ms cubic-bezier(.16,1,.3,1) ${Math.min(i * 55, 330)}ms, transform 900ms cubic-bezier(.16,1,.3,1) ${Math.min(i * 55, 330)}ms`;
        el.style.opacity = '.01'; el.style.transform = 'translateY(22px)';
      });
      const obs = new IntersectionObserver(entries => entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.style.opacity = '1'; e.target.style.transform = 'translateY(0)'; obs.unobserve(e.target);
      }), { threshold: .12, rootMargin: '0px 0px -7% 0px' });
      revealTargets.forEach(el => obs.observe(el));
    }

    function drawIdle(t) {
      positionHit();
      const c = sphereCenter, rot = reduced ? .2 : t * .00016;
      const cos = Math.cos(rot), sin = Math.sin(rot);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const x3 = p.ux * cos - p.uz * sin;
        const z3 = p.ux * sin + p.uz * cos;
        const scale = .83 + (z3 + 1) * .085;
        const x = c.x + x3 * c.r * scale;
        const y = c.y - p.uy * c.r * scale;
        const front = (z3 + 1) * .5;
        ctx.beginPath(); ctx.arc(x, y, p.size * (.7 + front * .55), 0, TAU);
        ctx.fillStyle = p.accent === FG ? `rgba(240,240,248,${.12 + front * .62})` : p.accent;
        ctx.globalAlpha = p.accent === FG ? 1 : .65;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    function drawExplosion(dt, t) {
      const footer = document.querySelector('footer');
      const footerTop = footer ? footer.getBoundingClientRect().top + scrollY : document.documentElement.scrollHeight - 400;
      let alive = 0;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (p.alpha <= .01) continue;
        alive++;
        if (!p.landed) {
          p.vy += .075 * dt;
          p.vx *= Math.pow(.997, dt);
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          const target = Math.max(footerTop + (p.stopY - footerTop), p.stopY);
          if (p.y > target) {
            p.y = target;
            p.vy *= -.18;
            p.vx *= .7;
            if (Math.abs(p.vy) < .45) p.landed = true;
          }
        } else {
          p.alpha *= Math.pow(.985, dt);
        }
        const vx = p.x - scrollX;
        const vy = p.y - scrollY;
        if (vy > -30 && vy < H + 30 && vx > -30 && vx < W + 30) {
          ctx.beginPath(); ctx.arc(vx, vy, p.size, 0, TAU);
          ctx.globalAlpha = clamp(p.alpha, 0, 1);
          ctx.fillStyle = p.accent; ctx.fill();
        }
        if (t - explodeAt > 10500) p.alpha *= Math.pow(.992, dt);
      }
      ctx.globalAlpha = 1;
      if (!alive || t - explodeAt > 17000) done = true;
    }

    function frame(t) {
      requestAnimationFrame(frame);
      if (document.hidden || done) return;
      const dt = clamp((t - last) / 16.667, .25, 3); last = t;
      ctx.clearRect(0, 0, W, H);
      if (!exploded) drawIdle(t); else drawExplosion(dt, t);
    }

    addEventListener('resize', resize, { passive: true });
    addEventListener('scroll', () => { if (!exploded) positionHit(); }, { passive: true });
    resize();
    requestAnimationFrame(frame);
  }

  function boot() {
    bootGlobe();
    bootEvolveParticles();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
