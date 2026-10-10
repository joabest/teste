(() => {
  'use strict';
  const sections = [...document.querySelectorAll('main > section, main [data-hero-section], main [data-method], main [data-contact-section], footer')]
    .filter((el, i, all) => !all.some((other, j) => i !== j && other.contains(el)));
  if (sections.length < 2) return;
  const nav = document.createElement('nav');
  nav.className = 'mirror-progress';
  nav.setAttribute('aria-label', 'Page sections');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const dots = sections.map((section, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Go to section ${index + 1}`);
    dot.addEventListener('click', () => section.scrollIntoView({ behavior: reduced.matches ? 'instant' : 'smooth', block: 'start' }));
    nav.append(dot);
    return dot;
  });
  document.body.append(nav);
  let frame = 0;
  function update() {
    frame = 0;
    let active = 0;
    sections.forEach((section, index) => { if (section.getBoundingClientRect().top <= innerHeight * .45) active = index; });
    dots.forEach((dot, index) => {
      dot.classList.toggle('is-active', index === active);
      if (index === active) dot.setAttribute('aria-current', 'location');
      else dot.removeAttribute('aria-current');
    });
  }
  addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(update); }, { passive: true });
  addEventListener('resize', update, { passive: true });
  update();
})();
