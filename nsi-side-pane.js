(function () {
  const minWidth = 280;
  const maxWidth = 760;
  const storageKey = 'nsi-side-pane-width';

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, Number(value) || min));
  }

  function readWidth() {
    try {
      return clamp(localStorage.getItem(storageKey), minWidth, maxWidth);
    } catch (error) {
      return state.sidePaneWidth || 380;
    }
  }

  function applyWidth(width) {
    state.sidePaneWidth = clamp(width, minWidth, maxWidth);
    document.documentElement.style.setProperty('--side-pane-width', `${state.sidePaneWidth}px`);
    try {
      localStorage.setItem(storageKey, String(state.sidePaneWidth));
    } catch (error) {}
  }

  applyWidth(state.sidePaneWidth || readWidth());

  window.startSidePaneChange = function (event) {
    event.preventDefault();
    event.stopPropagation();
    const divider = event.currentTarget;
    divider.classList.add('active');
    document.body.classList.add('side-pane-changing');

    function move(pointerEvent) {
      applyWidth(window.innerWidth - pointerEvent.clientX);
    }

    function stop() {
      divider.classList.remove('active');
      document.body.classList.remove('side-pane-changing');
      document.removeEventListener('pointermove', move);
      render();
    }

    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', stop, { once: true });
  };

  render = function () {
    applyWidth(state.sidePaneWidth || readWidth());
    document.getElementById('app').innerHTML = `
      <div class="app adjustable-side-pane">
        <aside class="sidebar">
          <div class="logo">НСИ</div>
          <nav class="nav">${tabs.map(([id, label]) => `<button class="${state.tab === id ? 'active' : ''}" onclick="setTab('${id}')">${label}</button>`).join('')}</nav>
        </aside>
        <main class="work">${renderWork()}</main>
        <div class="side-pane-divider" onpointerdown="startSidePaneChange(event)" title="Изменить ширину карточки"></div>
        <aside class="details">${renderDetails()}</aside>
      </div>
      ${state.modal ? renderModal() : ''}
    `;
  };

  render();
})();
