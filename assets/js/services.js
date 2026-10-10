(() => {
  'use strict';
  const grid = document.querySelector('[data-services-grid]');
  if (grid) {
    const filters = [...document.querySelectorAll('[data-service-filter]')];
    filters.forEach(button => button.addEventListener('click', () => {
      const filter = button.dataset.serviceFilter;
      filters.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      [...grid.children].forEach(card => {
        card.hidden = filter !== 'all' && (filter === 'ai' ? card.dataset.serviceAi !== 'true' : card.dataset.serviceGroup !== filter);
      });
    }));
    const views = [...document.querySelectorAll('[data-service-view]')];
    views.forEach(button => button.addEventListener('click', () => {
      grid.classList.toggle('services-list-view', button.dataset.serviceView === 'list');
      views.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    }));
  }
  document.querySelectorAll('[data-service-steps]').forEach(group => {
    const figures = [...group.querySelectorAll('figure')];
    const buttons = [...group.querySelectorAll('button')];
    buttons.forEach((button, active) => button.addEventListener('click', () => {
      figures.forEach((figure, index) => {
        figure.style.opacity = index === active ? '1' : '0';
        figure.style.transform = 'none';
        figure.style.zIndex = index === active ? '1' : '0';
        figure.setAttribute('aria-hidden', String(index !== active));
      });
      buttons.forEach((item, index) => item.setAttribute('aria-pressed', String(index === active)));
    }));
  });
})();
