(function () {
  state.collapsedTreeNodes = state.collapsedTreeNodes || {};
  state.objectTreeDepth = state.objectTreeDepth || 99;

  function isCollapsed(kind, id) {
    return !!state.collapsedTreeNodes[`${kind}:${id}`];
  }

  function nodeToggle(kind, id, hasChildren, collapsed) {
    if (!hasChildren) return '<span class="tree-toggle-spacer"></span>';
    return `<button class="tree-toggle ${collapsed ? 'collapsed' : ''}" onclick="toggleTreeNode(event,'${kind}','${id}')" title="${collapsed ? 'Развернуть' : 'Свернуть'}">▾</button>`;
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

  window.setObjectTreeDepth = function (depth) {
    state.objectTreeDepth = Number(depth) || 99;
    render();
  };

  window.expandObjectTreeFull = function () {
    state.objectTreeDepth = 99;
    render();
  };

  function treeLevelControls() {
    const current = state.objectTreeDepth;
    return `
      <div class="tree-toolbar">
        <span>Дерево</span>
        <button class="small ${current === 1 ? 'active' : ''}" onclick="setObjectTreeDepth(1)">БЦ</button>
        <button class="small ${current === 2 ? 'active' : ''}" onclick="setObjectTreeDepth(2)">Этажи</button>
        <button class="small ${current === 3 ? 'active' : ''}" onclick="setObjectTreeDepth(3)">Зоны</button>
        <button class="small ${current === 4 ? 'active' : ''}" onclick="setObjectTreeDepth(4)">Помещения</button>
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
    return `
      ${treeLevelControls()}
      <div class="tree leveled-tree collapsible-tree">${children(data.objects, null).map(item => renderObjectNode(item)).join('')}</div>
    `;
  };

  window.renderObjectNode = function (item) {
    const nested = children(data.objects, item.id);
    const hasChildren = nested.length > 0;
    const collapsed = isCollapsed('object', item.id);
    const depth = objectDepth(item);
    const blockedByLevel = depth >= state.objectTreeDepth;
    const hidden = collapsed || blockedByLevel ? descendantIds(data.objects, item.id).length : 0;
    return `
      <div class="node level-${depth} ${hasChildren ? 'group-node' : 'leaf-node'} ${collapsed ? 'collapsed-node' : ''} ${state.selectedObjectId === item.id ? 'active' : ''}" draggable="true" ondragstart="startDrag('${item.id}')" ondragover="allowDrop(event)" ondragleave="dropLeave(event)" ondrop="dropObject(event,'${item.id}')">
        <div class="node-title" onclick="selectObject('${item.id}')">
          ${nodeToggle('object', item.id, hasChildren, collapsed)}
          <span>${escapeHtml(item.name)}</span>
          <span class="badge">${escapeHtml(item.type)}</span>
          ${hidden ? `<span class="badge muted">+${hidden}</span>` : ''}
        </div>
        <span class="badge ${statusClass(item.status)}">${escapeHtml(item.status)}</span>
      </div>
      ${hasChildren && !collapsed && !blockedByLevel ? `<div class="node-children">${nested.map(child => renderObjectNode(child)).join('')}</div>` : ''}
    `;
  };

  window.renderSystemNode = function (item) {
    const nested = children(data.systems, item.id);
    const hasChildren = nested.length > 0;
    const collapsed = isCollapsed('system', item.id);
    const relatedEquipment = data.equipment.filter(eq => eq.systemId === item.id && !eq.parentId);
    const hidden = collapsed ? nested.length + relatedEquipment.length : 0;
    return `
      <div class="node ${hasChildren || relatedEquipment.length ? 'group-node' : 'leaf-node'} ${collapsed ? 'collapsed-node' : ''} ${state.selectedSystemId === item.id && !state.selectedEquipmentId ? 'active' : ''}">
        <div class="node-title" onclick="selectSystem('${item.id}')">
          ${nodeToggle('system', item.id, hasChildren || relatedEquipment.length, collapsed)}
          <span>${escapeHtml(item.name)}</span>
          <span class="badge">${escapeHtml(item.type)}</span>
          ${hidden ? `<span class="badge muted">+${hidden}</span>` : ''}
        </div>
        <span class="badge ${statusClass(item.status)}">${escapeHtml(item.status)}</span>
      </div>
      ${relatedEquipment.length && !collapsed ? `<div class="node-children equipment-inline">${relatedEquipment.map(eq => renderEquipmentNode(eq)).join('')}</div>` : ''}
      ${hasChildren && !collapsed ? `<div class="node-children">${nested.map(child => renderSystemNode(child)).join('')}</div>` : ''}
    `;
  };

  window.renderEquipmentNode = function (item) {
    const nested = children(data.equipment, item.id);
    const hasChildren = nested.length > 0;
    const collapsed = isCollapsed('equipment', item.id);
    return `
      <div class="node ${hasChildren ? 'group-node' : 'leaf-node'} ${collapsed ? 'collapsed-node' : ''} ${state.selectedEquipmentId === item.id ? 'active' : ''}">
        <div class="node-title" onclick="selectEquipment('${item.id}')">
          ${nodeToggle('equipment', item.id, hasChildren, collapsed)}
          <span>${escapeHtml(item.name)}</span>
          <span class="badge">${escapeHtml(item.level || item.type)}</span>
          ${hasChildren && collapsed ? `<span class="badge muted">+${nested.length}</span>` : ''}
        </div>
        <span class="badge ${statusClass(item.status)}">${escapeHtml(item.status)}</span>
      </div>
      ${hasChildren && !collapsed ? `<div class="node-children">${nested.map(child => renderEquipmentNode(child)).join('')}</div>` : ''}
    `;
  };

  window.submitModal = function (again) {
    const form = document.getElementById('entityForm');
    if (!form || !state.modal) return;
    const fd = new FormData(form);
    const type = state.modal.type;

    if (type === 'object') {
      const item = { id: idFromName('obj', fd.get('name')), parentId: fd.get('parentId') || null, name: fd.get('name'), type: fd.get('objectType'), code: fd.get('code'), status: fd.get('status'), owner: fd.get('owner'), area: fd.get('area'), description: fd.get('description') };
      data.objects.push(item);
      state.selectedObjectId = item.id;
      state.tab = 'objects';
    } else if (type === 'bulkObject') {
      const count = Math.max(1, Number(fd.get('count') || 1));
      const start = Number(fd.get('start') || 1);
      let lastId = null;
      for (let i = 0; i < count; i++) {
        const number = start + i;
        const item = { id: idFromName('obj', `${fd.get('namePrefix')} ${number}`), parentId: fd.get('parentId') || null, name: `${fd.get('namePrefix')} ${number}`, type: fd.get('objectType'), code: `${fd.get('codePrefix')}-${String(number).padStart(3, '0')}`, status: 'Требует данных', area: '0 м2' };
        data.objects.push(item);
        lastId = item.id;
      }
      if (lastId) state.selectedObjectId = lastId;
      state.tab = 'objects';
    } else if (type === 'system') {
      const item = { id: idFromName('sys', fd.get('name')), parentId: null, locationId: fd.get('locationId'), name: fd.get('name'), type: fd.get('systemType'), status: fd.get('status'), scope: fd.get('scope'), criticality: fd.get('criticality') };
      data.systems.push(item);
      state.selectedSystemId = item.id;
      state.selectedEquipmentId = null;
      state.tab = 'systems';
    } else if (type === 'equipment' || type === 'roomEquipment') {
      createEquipmentFromForm(fd);
    } else if (type === 'techcard') {
      const item = { id: idFromName('tc', fd.get('name')), entityType: fd.get('entityType'), entityId: fd.get('entityId'), name: fd.get('name'), workType: fd.get('workType'), periodicity: fd.get('periodicity'), status: fd.get('status'), goal: fd.get('goal') };
      data.techCards.push(item);
      state.selectedTcId = item.id;
      state.tab = 'techcards';
    } else if (type === 'dictionary') {
      const key = fd.get('dict');
      const value = fd.get('value');
      if (key && value) {
        dictionaries[key] = dictionaries[key] || [];
        if (!dictionaries[key].includes(value)) dictionaries[key].push(value);
      }
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

  runNsiSmokeTest();
  render();
})();
