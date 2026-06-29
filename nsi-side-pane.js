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

  function treeKey(kind, id) {
    return `${kind}:${id}`;
  }

  function collapsed(kind, id) {
    state.collapsedTreeNodes = state.collapsedTreeNodes || {};
    return !!state.collapsedTreeNodes[treeKey(kind, id)];
  }

  function mixedExpanded(kind, id) {
    state.mixedTreeExpanded = state.mixedTreeExpanded || {};
    return !!state.mixedTreeExpanded[treeKey(kind, id)];
  }

  function setMixedExpanded(kind, id, value) {
    state.mixedTreeExpanded = state.mixedTreeExpanded || {};
    if (value) state.mixedTreeExpanded[treeKey(kind, id)] = true;
    else delete state.mixedTreeExpanded[treeKey(kind, id)];
  }

  function descendantIds(list, id) {
    const result = [];
    const walk = parentId => children(list, parentId).forEach(child => {
      result.push(child.id);
      walk(child.id);
    });
    walk(id);
    return result;
  }

  function objectDepth(item) {
    let depth = 1;
    let current = item;
    while (current && current.parentId) {
      depth += 1;
      current = objectById(current.parentId);
    }
    return depth;
  }

  function currentTreeLimit() {
    if (state.objectTreeDepth === 'mixed') return Number(state.objectTreeMixedBaseDepth || 2);
    return Number(state.objectTreeDepth || 99);
  }

  function treeToggle(kind, id, hasChildren, isClosed) {
    if (!hasChildren) return '<span class="tree-toggle-spacer"></span>';
    return `<button class="tree-toggle ${isClosed ? 'collapsed' : ''}" onclick="toggleTreeNode(event,'${kind}','${id}')" title="${isClosed ? 'Развернуть' : 'Свернуть'}">▾</button>`;
  }

  window.toggleTreeNode = function (event, kind, id) {
    event.preventDefault();
    event.stopPropagation();
    state.collapsedTreeNodes = state.collapsedTreeNodes || {};

    if (kind === 'object') {
      const item = objectById(id);
      const depth = item ? objectDepth(item) : 1;
      const limit = currentTreeLimit();
      const limitedByLevel = depth >= limit;

      if (limitedByLevel || state.objectTreeDepth === 'mixed') {
        if (state.objectTreeDepth !== 'mixed') {
          state.objectTreeMixedBaseDepth = limit;
          state.objectTreeDepth = 'mixed';
        }
        setMixedExpanded(kind, id, !mixedExpanded(kind, id));
        delete state.collapsedTreeNodes[treeKey(kind, id)];
        render();
        return;
      }
    }

    state.collapsedTreeNodes[treeKey(kind, id)] = !state.collapsedTreeNodes[treeKey(kind, id)];
    render();
  };

  window.setObjectTreeDepth = function (depth) {
    state.objectTreeDepth = Number(depth) || 99;
    state.objectTreeMixedBaseDepth = null;
    state.mixedTreeExpanded = {};
    render();
  };

  window.setObjectTreeMixed = function () {
    state.objectTreeDepth = 'mixed';
    state.objectTreeMixedBaseDepth = Number(state.objectTreeMixedBaseDepth || 2);
    render();
  };

  window.expandObjectTreeFull = function () {
    state.objectTreeDepth = 99;
    state.objectTreeMixedBaseDepth = null;
    state.mixedTreeExpanded = {};
    render();
  };

  function treeLevelControls() {
    const current = state.objectTreeDepth || 99;
    return `
      <div class="tree-toolbar">
        <span>Дерево</span>
        <button class="small ${current === 1 ? 'active' : ''}" onclick="setObjectTreeDepth(1)">БЦ</button>
        <button class="small ${current === 2 ? 'active' : ''}" onclick="setObjectTreeDepth(2)">Этажи</button>
        <button class="small ${current === 3 ? 'active' : ''}" onclick="setObjectTreeDepth(3)">Зоны</button>
        <button class="small ${current === 4 ? 'active' : ''}" onclick="setObjectTreeDepth(4)">Помещения</button>
        <button class="small ${current === 'mixed' ? 'active' : ''}" onclick="setObjectTreeMixed()">Смешанный</button>
        <button class="small ${current === 99 ? 'active' : ''}" onclick="expandObjectTreeFull()">Все</button>
      </div>
    `;
  }

  window.selectObject = function (id) {
    state.selectedObjectId = id;
    state.tab = 'objects';
    render();
  };

  window.selectSystem = function (id) {
    state.selectedSystemId = id;
    state.selectedEquipmentId = null;
    state.tab = 'systems';
    render();
  };

  window.selectEquipment = function (id) {
    const item = equipmentById(id);
    state.selectedEquipmentId = id;
    if (item?.systemId) state.selectedSystemId = item.systemId;
    state.tab = 'systems';
    render();
  };

  window.renderObjectTree = function () {
    return `${treeLevelControls()}<div class="tree leveled-tree collapsible-tree">${children(data.objects, null).map(item => renderObjectNode(item)).join('')}</div>`;
  };

  window.renderObjectNode = function (item) {
    const nested = children(data.objects, item.id);
    const hasChildren = nested.length > 0;
    const isCollapsed = collapsed('object', item.id);
    const depth = objectDepth(item);
    const limit = currentTreeLimit();
    const openedInMixed = state.objectTreeDepth === 'mixed' && mixedExpanded('object', item.id);
    const blockedByLevel = depth >= limit && !openedInMixed;
    const visuallyClosed = isCollapsed || blockedByLevel;
    const hidden = visuallyClosed ? descendantIds(data.objects, item.id).length : 0;
    return `
      <div class="node level-${depth} ${hasChildren ? 'group-node' : 'leaf-node'} ${visuallyClosed ? 'collapsed-node' : ''} ${state.selectedObjectId === item.id ? 'active' : ''}" draggable="true" ondragstart="startDrag('${item.id}')" ondragover="allowDrop(event)" ondragleave="dropLeave(event)" ondrop="dropObject(event,'${item.id}')">
        <div class="node-title" onclick="selectObject('${item.id}')">
          ${treeToggle('object', item.id, hasChildren, visuallyClosed)}
          <span>${escapeHtml(item.name)}</span>
          <span class="badge">${escapeHtml(item.type)}</span>
          ${hidden ? `<span class="badge muted">+${hidden}</span>` : ''}
        </div>
        <span class="badge ${statusClass(item.status)}">${escapeHtml(item.status)}</span>
      </div>
      ${hasChildren && !visuallyClosed ? `<div class="node-children">${nested.map(child => renderObjectNode(child)).join('')}</div>` : ''}
    `;
  };

  window.renderSystemNode = function (item) {
    const nested = children(data.systems, item.id);
    const relatedEquipment = data.equipment.filter(eq => eq.systemId === item.id && !eq.parentId);
    const hasChildren = nested.length > 0 || relatedEquipment.length > 0;
    const isCollapsed = collapsed('system', item.id);
    const hidden = isCollapsed ? nested.length + relatedEquipment.length : 0;
    return `
      <div class="node ${hasChildren ? 'group-node' : 'leaf-node'} ${isCollapsed ? 'collapsed-node' : ''} ${state.selectedSystemId === item.id && !state.selectedEquipmentId ? 'active' : ''}">
        <div class="node-title" onclick="selectSystem('${item.id}')">
          ${treeToggle('system', item.id, hasChildren, isCollapsed)}
          <span>${escapeHtml(item.name)}</span>
          <span class="badge">${escapeHtml(item.type)}</span>
          ${hidden ? `<span class="badge muted">+${hidden}</span>` : ''}
        </div>
        <span class="badge ${statusClass(item.status)}">${escapeHtml(item.status)}</span>
      </div>
      ${relatedEquipment.length && !isCollapsed ? `<div class="node-children equipment-inline">${relatedEquipment.map(eq => renderEquipmentNode(eq)).join('')}</div>` : ''}
      ${nested.length && !isCollapsed ? `<div class="node-children">${nested.map(child => renderSystemNode(child)).join('')}</div>` : ''}
    `;
  };

  window.renderEquipmentNode = function (item) {
    const nested = children(data.equipment, item.id);
    const hasChildren = nested.length > 0;
    const isCollapsed = collapsed('equipment', item.id);
    return `
      <div class="node ${hasChildren ? 'group-node' : 'leaf-node'} ${isCollapsed ? 'collapsed-node' : ''} ${state.selectedEquipmentId === item.id ? 'active' : ''}">
        <div class="node-title" onclick="selectEquipment('${item.id}')">
          ${treeToggle('equipment', item.id, hasChildren, isCollapsed)}
          <span>${escapeHtml(item.name)}</span>
          <span class="badge">${escapeHtml(item.level || item.type)}</span>
          ${hasChildren && isCollapsed ? `<span class="badge muted">+${nested.length}</span>` : ''}
        </div>
        <span class="badge ${statusClass(item.status)}">${escapeHtml(item.status)}</span>
      </div>
      ${hasChildren && !isCollapsed ? `<div class="node-children">${nested.map(child => renderEquipmentNode(child)).join('')}</div>` : ''}
    `;
  };

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

  window.submitModal = function (again) {
    const form = document.getElementById('entityForm');
    if (!form || !state.modal) return;
    const fd = new FormData(form);
    const type = state.modal.type;
    if (type === 'object') {
      const item = { id: idFromName('obj', fd.get('name')), parentId: fd.get('parentId') || null, name: fd.get('name'), type: fd.get('objectType'), code: fd.get('code'), status: fd.get('status'), owner: fd.get('owner'), area: fd.get('area'), description: fd.get('description') };
      data.objects.push(item); state.selectedObjectId = item.id; state.tab = 'objects';
    } else if (type === 'bulkObject') {
      const count = Math.max(1, Number(fd.get('count') || 1));
      const start = Number(fd.get('start') || 1);
      let lastId = null;
      for (let i = 0; i < count; i++) {
        const number = start + i;
        const item = { id: idFromName('obj', `${fd.get('namePrefix')} ${number}`), parentId: fd.get('parentId') || null, name: `${fd.get('namePrefix')} ${number}`, type: fd.get('objectType'), code: `${fd.get('codePrefix')}-${String(number).padStart(3, '0')}`, status: 'Требует данных', area: '0 м2' };
        data.objects.push(item); lastId = item.id;
      }
      if (lastId) state.selectedObjectId = lastId;
      state.tab = 'objects';
    } else if (type === 'system') {
      const item = { id: idFromName('sys', fd.get('name')), parentId: null, locationId: fd.get('locationId'), name: fd.get('name'), type: fd.get('systemType'), status: fd.get('status'), scope: fd.get('scope'), criticality: fd.get('criticality') };
      data.systems.push(item); state.selectedSystemId = item.id; state.selectedEquipmentId = null; state.tab = 'systems';
    } else if (type === 'equipment' || type === 'roomEquipment') {
      createEquipmentFromForm(fd);
    } else if (type === 'techcard') {
      const item = { id: idFromName('tc', fd.get('name')), entityType: fd.get('entityType'), entityId: fd.get('entityId'), name: fd.get('name'), workType: fd.get('workType'), periodicity: fd.get('periodicity'), status: fd.get('status'), goal: fd.get('goal') };
      data.techCards.push(item); state.selectedTcId = item.id; state.tab = 'techcards';
    } else if (type === 'dictionary') {
      const key = fd.get('dict'); const value = fd.get('value');
      dictionaries[key] = dictionaries[key] || [];
      if (value && !dictionaries[key].includes(value)) dictionaries[key].push(value);
      state.tab = 'dictionaries';
    }
    if (again) openModal(type);
    else closeModal();
  };

  window.runNsiSmokeTest = function () {
    const errors = [];
    const checkIds = (name, list) => {
      const seen = new Set();
      list.forEach(item => {
        if (!item.id) errors.push(`${name}: пустой id`);
        if (seen.has(item.id)) errors.push(`${name}: дубль id ${item.id}`);
        seen.add(item.id);
      });
    };
    checkIds('objects', data.objects);
    checkIds('systems', data.systems);
    checkIds('equipment', data.equipment);
    checkIds('techCards', data.techCards);
    data.objects.forEach(item => { if (item.parentId && !objectById(item.parentId)) errors.push(`objects: нет parentId ${item.parentId}`); });
    data.systems.forEach(item => { if (item.locationId && !objectById(item.locationId)) errors.push(`systems: нет locationId ${item.locationId}`); });
    data.equipment.forEach(item => {
      if (item.locationId && !objectById(item.locationId)) errors.push(`equipment: нет locationId ${item.locationId}`);
      if (item.systemId && !systemById(item.systemId)) errors.push(`equipment: нет systemId ${item.systemId}`);
      if (item.parentId && !equipmentById(item.parentId)) errors.push(`equipment: нет parentId ${item.parentId}`);
    });
    state.qaErrors = errors;
    if (errors.length) console.warn('NSI smoke test found issues', errors);
    else console.info('NSI smoke test passed');
    return errors;
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

  runNsiSmokeTest();
  render();
})();
