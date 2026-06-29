(function () {
  const minWidth = 280;
  const maxWidth = 760;
  const storageKey = 'nsi-details-width';

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, Number(value) || min));
  }

  function readSavedWidth() {
    try {
      return clamp(localStorage.getItem(storageKey), minWidth, maxWidth);
    } catch (error) {
      return state.detailsWidth || 380;
    }
  }

  function applyDetailsWidth(width) {
    state.detailsWidth = clamp(width, minWidth, maxWidth);
    document.documentElement.style.setProperty('--details-width', `${state.detailsWidth}px`);
    try {
      localStorage.setItem(storageKey, String(state.detailsWidth));
    } catch (error) {}
  }

  applyDetailsWidth(state.detailsWidth || readSavedWidth());

  window.startDetailsWidthChange = function (event) {
    event.preventDefault();
    event.stopPropagation();
    const divider = event.currentTarget;
    divider.classList.add('active');
    document.body.classList.add('details-width-change');

    function move(pointerEvent) {
      const nextWidth = window.innerWidth - pointerEvent.clientX;
      applyDetailsWidth(nextWidth);
    }

    function stop() {
      divider.classList.remove('active');
      document.body.classList.remove('details-width-change');
      document.removeEventListener('pointermove', move);
      render();
    }

    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', stop, { once: true });
  };

  render = function () {
    applyDetailsWidth(state.detailsWidth || readSavedWidth());
    document.getElementById('app').innerHTML = `
      <div class="app adjustable-details">
        <aside class="sidebar">
          <div class="logo">НСИ</div>
          <nav class="nav">${tabs.map(([id, label]) => `<button class="${state.tab === id ? 'active' : ''}" onclick="setTab('${id}')">${label}</button>`).join('')}</nav>
        </aside>
        <main class="work">${renderWork()}</main>
        <div class="details-divider" onpointerdown="startDetailsWidthChange(event)" title="Изменить ширину карточки"></div>
        <aside class="details">${renderDetails()}</aside>
      </div>
      ${state.modal ? renderModal() : ''}
    `;
  };

  render();
})();
