(() => {
  const isModified = (e) => e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0;

  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || isModified(e)) return;
    const a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    if (a.hasAttribute('download') || (a.target && a.target !== '_self')) return;

    const raw = a.getAttribute('href');
    if (!raw || raw.startsWith('#') || raw.startsWith('mailto:') || raw.startsWith('tel:') || raw.startsWith('javascript:')) return;

    let url;
    try { url = new URL(a.href, location.href); } catch { return; }
    if (url.origin !== location.origin) return;

    // Same-document anchors should keep native behavior.
    if (url.pathname === location.pathname && url.search === location.search && url.hash) return;

    // The original Next.js client router expects RSC/server responses that do not
    // exist in this static mirror. Force a normal document request instead.
    e.preventDefault();
    e.stopImmediatePropagation();
    location.assign(url.pathname + url.search + url.hash);
  }, true);

  // If a stale Next runtime throws while attempting a client transition,
  // recover by reloading the current clean URL once.
  let recovering = false;
  const recover = () => {
    if (recovering) return;
    recovering = true;
    const key = 'static-route-recovery:' + location.pathname + location.search;
    try {
      if (sessionStorage.getItem(key) === '1') return;
      sessionStorage.setItem(key, '1');
    } catch {}
    setTimeout(() => location.replace(location.pathname + location.search + location.hash), 20);
  };

  window.addEventListener('unhandledrejection', (e) => {
    const s = String((e.reason && (e.reason.message || e.reason)) || '');
    if (/ChunkLoadError|Failed to fetch dynamically imported module|RSC|flight|NEXT_REDIRECT/i.test(s)) recover();
  });
  window.addEventListener('error', (e) => {
    const s = String((e.error && (e.error.message || e.error)) || e.message || '');
    if (/ChunkLoadError|Loading chunk|dynamically imported module/i.test(s)) recover();
  }, true);
})();
