(() => {
  'use strict';
  const cleanup = () => {
    document.querySelectorAll('#we-globe-layer-v3,#we-globe-live-v5,#we-globe-live-v6,#we-globe-fallback').forEach(node=>node.remove());
    const hero=document.querySelector('[data-hero-section="true"]');
    hero?.querySelectorAll('canvas').forEach(canvas=>canvas.remove());
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',cleanup,{once:true});
  else cleanup();
})();
