(() => {
  'use strict';
  document.querySelectorAll('img').forEach(img => {
    img.decoding = 'async';
    if (!img.closest('[data-nav-root], [data-hero-section]')) img.loading = 'lazy';
  });
  const videos = [...document.querySelectorAll('video')];
  if (!videos.length) return;
  const autoplay = new WeakSet();
  const hovered = new WeakSet();
  const visible = new Set();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  function play(video) {
    if ((autoplay.has(video) || hovered.has(video)) && visible.has(video) && !document.hidden && !reduced.matches) video.play().catch(() => {});
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const video = entry.target;
      if (entry.isIntersecting) {
        visible.add(video);
        video.preload = 'metadata';
        video.querySelectorAll('source[data-src]').forEach(source => { source.src = source.dataset.src; delete source.dataset.src; });
        if (video.dataset.src) { video.src = video.dataset.src; delete video.dataset.src; }
        if (!video.dataset.loaded) { video.load(); video.dataset.loaded = 'true'; }
        play(video);
      } else { visible.delete(video); video.pause(); video.preload = 'none'; }
    });
  }, { threshold: .1 });
  videos.forEach(video => {
    if (video.hasAttribute('autoplay') || video.dataset.autoplay === 'true') autoplay.add(video);
    video.removeAttribute('autoplay');
    video.pause();
    video.preload = 'none';
    video.playsInline = true;
    if (autoplay.has(video)) video.muted = true;
    if (!autoplay.has(video)) {
      const card = video.closest('a, article, li') || video.parentElement;
      card.addEventListener('pointerenter', event => { if (event.pointerType !== 'touch') { hovered.add(video); play(video); } });
      card.addEventListener('pointerleave', () => { hovered.delete(video); video.pause(); });
    }
    observer.observe(video);
  });
  document.addEventListener('visibilitychange', () => videos.forEach(video => { if (document.hidden) video.pause(); else if (visible.has(video)) play(video); }));
  reduced.addEventListener('change', () => visible.forEach(video => { if (reduced.matches) video.pause(); else play(video); }));
  addEventListener('pagehide', () => { observer.disconnect(); videos.forEach(video => video.pause()); });
  addEventListener('pageshow', event => { if (event.persisted) videos.forEach(video => observer.observe(video)); });
})();
