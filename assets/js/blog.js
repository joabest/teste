(() => {
  'use strict';
  const grid = document.querySelector('[data-blog-grid]');
  if (!grid) return;
  const cards = [...grid.children];
  const button = document.querySelector('[data-blog-more]');
  if (!button) return;
  let visible = Math.min(20, cards.length);
  function render() {
    cards.forEach((card, index) => { card.hidden = index >= visible; });
    const remaining = cards.length - visible;
    button.hidden = remaining === 0;
    const next = Math.min(20, remaining);
    button.textContent = document.documentElement.lang === 'es' ? `Mostrar ${next} artículos más` : `Show ${next} more articles`;
  }
  button.addEventListener('click', () => {
    const firstNew = visible;
    visible = Math.min(cards.length, visible + 20);
    render();
    const link = cards[firstNew]?.querySelector('a');
    link?.focus({ preventScroll: true });
    document.querySelector('[data-blog-status]').textContent = `${visible} / ${cards.length}`;
  });
  render();
})();
