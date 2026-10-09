(() => {
  'use strict';
  const cleanup=()=>{
    document.querySelectorAll('[id^="we-particle-"]').forEach(node=>node.remove());
    const phrase=document.querySelector('[data-footer-phrase="true"]');
    const section=phrase&&(phrase.closest('section')||phrase.parentElement);
    section?.querySelectorAll('canvas').forEach(canvas=>canvas.remove());
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',cleanup,{once:true});
  else cleanup();
})();
