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

  function directLinks(objectId) {
    return data.systems.filter(item => item.locationId === objectId);
  }

  function nearestScopeObject(objectId, types) {
    return objectAncestors(objectId)
      .map(objectById)
      .filter(Boolean)
      .find(item => types.includes(item.type));
  }

  function officeLinks(objectId) {
    const office = nearestScopeObject(objectId, ['Офис']);
    if (!office) return [];
    return data.systems.filter(item => item.locationId === office.id);
  }

  function buildingLinks(objectId) {
    const office = nearestScopeObject(objectId, ['Офис']);
    const parentIds = objectAncestors(objectId).filter(id => id !== office?.id);
    return data.systems.filter(item => parentIds.includes(item.locationId));
  }

  function childLocalLinks(objectId) {
    const childIds = objectDescendants(objectId);
    return data.systems.filter(item => childIds.includes(item.locationId));
  }

  function renderLinkLines(items, note, empty = 'Нет') {
    return items.length
      ? items.map(item => `<div class="line" onclick="selectSystem('${item.id}')"><span>${escapeHtml(item.name)}</span><span class="badge">${note}</span></div>`).join('')
      : `<div class="item-meta">${empty}</div>`;
  }

  function renderLinksBlock(item) {
    const direct = directLinks(item.id);
    const ownOffice = officeLinks(item.id);
    const inherited = buildingLinks(item.id);
    const insideChildren = childLocalLinks(item.id);
    return `
      <div class="section">
        <h3>Системы</h3>
        <div class="cols">
          <div><div class="item-meta">Собственные системы объекта</div>${renderLinkLines(direct, 'собственная')}</div>
          <div><div class="item-meta">Системы офисного контура</div>${renderLinkLines(ownOffice, 'система офиса')}</div>
        </div>
        <div style="margin-top:12px">
          <div class="item-meta">Наследуется от здания / верхнего объекта</div>
          ${renderLinkLines(inherited, 'наследуется')}
        </div>
        <div style="margin-top:12px">
          <div class="item-meta">Локальные системы дочерних помещений</div>
          ${renderLinkLines(insideChildren, 'локально ниже', 'Нет локальных систем ниже')}
        </div>
      </div>
    `;
  }

  window.renderObjectDetails = function () {
    const item = objectById(state.selectedObjectId) || data.objects[0];
    const units = data.equipment.filter(eq => eq.locationId === item.id && eq.level === 'Конкретная единица');
    const groups = [...new Set(units.map(eq => eq.parentId).filter(Boolean))].map(id => equipmentById(id)).filter(Boolean);
    const tcs = data.techCards.filter(tc => tc.entityType === 'object' && tc.entityId === item.id);
    return `
      <h2>${escapeHtml(item.name)}</h2><div class="type">${escapeHtml(pathToObject(item.id))}</div>
      <div class="section"><h3>Основные данные</h3><div class="kv"><div>Вид</div><div>${escapeHtml(item.type)}</div><div>Код</div><div>${escapeHtml(item.code)}</div><div>Статус</div><div><span class="badge ${statusClass(item.status)}">${escapeHtml(item.status)}</span></div><div>Площадь</div><div>${escapeHtml(item.area || 'Не указана')}</div></div></div>
      <div class="section"><h3>Перемещение</h3><label>Родитель<select onchange="moveSelectedObject(this.value)"><option value="">Без родителя</option>${data.objects.filter(o => o.id !== item.id && !objectDescendants(item.id).includes(o.id)).map(o => `<option value="${o.id}" ${item.parentId === o.id ? 'selected' : ''}>${escapeHtml(pathToObject(o.id))}</option>`).join('')}</select></label></div>
      ${renderLinksBlock(item)}
      <div class="section"><h3>Оборудование</h3>${units.length ? units.map(eq => `<div class="line" onclick="selectEquipment('${eq.id}')"><span>${escapeHtml(eq.name)}</span><span class="badge">${escapeHtml(eq.code)}</span></div>`).join('') : '<div class="item-meta">Конкретные единицы не размещены</div>'}${groups.length ? `<div class="item-meta" style="margin-top:10px">Группы раскрываются во вкладке систем: ${groups.map(g => `<button class="small" onclick="selectEquipment('${g.id}')">${escapeHtml(g.name)}</button>`).join(' ')}</div>` : ''}</div>
      <div class="section"><h3>Техкарты</h3>${renderTcLines(tcs)}</div>
      <div class="section"><h3>История / изменения</h3>${data.history.filter(h => h.entityId === item.id).map(h => `<div class="line"><span>${escapeHtml(h.text)}</span></div>`).join('') || '<div class="item-meta">Изменений пока нет</div>'}</div>
    `;
  };

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
