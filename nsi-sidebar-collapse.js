(function () {
  const sidebarKey = 'nsi-sidebar-collapsed';
  const widthKey = 'nsi-side-pane-width';
  const themeKey = 'nsi-theme';

  function readSidebarCollapsed() {
    try {
      return localStorage.getItem(sidebarKey) === '1';
    } catch (error) {
      return !!state.sidebarCollapsed;
    }
  }

  function saveSidebarCollapsed(value) {
    state.sidebarCollapsed = !!value;
    document.documentElement.style.setProperty('--sidebar-width', state.sidebarCollapsed ? '72px' : '230px');
    try {
      localStorage.setItem(sidebarKey, state.sidebarCollapsed ? '1' : '0');
    } catch (error) {}
  }

  function readPaneWidth() {
    try {
      return Number(localStorage.getItem(widthKey)) || state.sidePaneWidth || 380;
    } catch (error) {
      return state.sidePaneWidth || 380;
    }
  }

  function applyPaneWidth(width) {
    const next = Math.min(760, Math.max(280, Number(width) || 380));
    state.sidePaneWidth = next;
    document.documentElement.style.setProperty('--side-pane-width', `${next}px`);
  }

  function readTheme() {
    try {
      return localStorage.getItem(themeKey) || state.theme || 'light';
    } catch (error) {
      return state.theme || 'light';
    }
  }

  function applyTheme(theme) {
    state.theme = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.dataset.theme = state.theme;
  }

  function renderNavButtons() {
    return tabs.map(([id, label]) => {
      const short = label.trim().slice(0, 1).toUpperCase();
      return `<button class="${state.tab === id ? 'active' : ''}" title="${escapeHtml(label)}" onclick="setTab('${id}')"><span class="nav-full">${escapeHtml(label)}</span><span class="nav-short">${escapeHtml(short)}</span></button>`;
    }).join('');
  }

  function renderThemeControls() {
    const theme = state.theme || readTheme();
    return `
      <div class="theme-switcher">
        <div class="theme-switcher-title">Тема</div>
        <div class="theme-buttons">
          <button class="small ${theme === 'light' ? 'active' : ''}" title="Светлая тема" onclick="setNsiTheme('light')"><span class="theme-label">Светлая</span><span class="nav-short">☀</span></button>
          <button class="small ${theme === 'dark' ? 'active' : ''}" title="Темная тема" onclick="setNsiTheme('dark')"><span class="theme-label">Темная</span><span class="nav-short">☾</span></button>
        </div>
      </div>
    `;
  }

  window.toggleNsiSidebar = function () {
    saveSidebarCollapsed(!state.sidebarCollapsed);
    render();
  };

  state.sidebarCollapsed = readSidebarCollapsed();
  saveSidebarCollapsed(state.sidebarCollapsed);
  applyPaneWidth(readPaneWidth());
  applyTheme(readTheme());

  render = function () {
    saveSidebarCollapsed(!!state.sidebarCollapsed);
    applyPaneWidth(state.sidePaneWidth || readPaneWidth());
    applyTheme(state.theme || readTheme());
    const collapsed = !!state.sidebarCollapsed;
    document.getElementById('app').innerHTML = `
      <div class="app adjustable-side-pane ${collapsed ? 'sidebar-collapsed' : ''}">
        <aside class="sidebar">
          <div class="sidebar-header">
            <div class="logo" title="НСИ">НСИ</div>
            <button class="sidebar-toggle" onclick="toggleNsiSidebar()" title="${collapsed ? 'Развернуть меню' : 'Свернуть меню'}">${collapsed ? '›' : '‹'}</button>
          </div>
          <nav class="nav">${renderNavButtons()}</nav>
          ${renderThemeControls()}
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
