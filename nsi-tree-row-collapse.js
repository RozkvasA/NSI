(function () {
  state.collapsedTreeNodes = state.collapsedTreeNodes || {};

  function isCollapsed(kind, id) {
    return !!state.collapsedTreeNodes[`${kind}:${id}`];
  }

  function setCollapsed(kind, id, value) {
    state.collapsedTreeNodes[`${kind}:${id}`] = value;
  }

  function toggleCollapsed(kind, id) {
    setCollapsed(kind, id, !isCollapsed(kind, id));
    render();
  }

  window.toggleTreeNode = function (event, kind, id) {
    event.preventDefault();
    event.stopPropagation();
    toggleCollapsed(kind, id);
  };

  function childCount(list, parentId) {
    return list.filter(item => item.parentId === parentId).length;
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

  function objectDescendantCount(id) {
    let count = 0;
    const walk = parentId => children(data.objects, parentId).forEach(child => {
      count += 1;
      walk(child.id);
    });
    walk(id);
    return count;
  }

  function nodeToggle(kind, id, hasChildren, collapsed) {
    if (!hasChildren) return '<span class="tree-toggle-spacer"></span>';
    return `<button class="tree-toggle ${collapsed ? 'collapsed' : ''}" onclick="toggleTreeNode(event,'${kind}','${id}')" title="${collapsed ? 'Развернуть' : 'Свернуть'}">▾</button>`;
  }

  function hiddenBadge(count, collapsed) {
    if (!count || !collapsed) return '';
    return `<span class="badge muted">+${count}</span>`;
  }

  window.renderObjectTree = function () {
    if (typeof cleanOfficeSotaTree === 'function') cleanOfficeSotaTree();
    const controls = typeof treeLevelControls === 'function' ? treeLevelControls() : '';
    return `
      ${controls}
      <div class="tree leveled-tree collapsible-tree">${children(data.objects, null).map(item => renderObjectNode(item)).join('')}</div>
    `;
  };

  window.renderObjectNode = function (item) {
    const nested = children(data.objects, item.id);
    const hasChildren = nested.length > 0;
    const collapsed = isCollapsed('object', item.id);
    const depth = objectDepth(item);
    const hidden = objectDescendantCount(item.id);
    return `
      <div class="node level-${depth} ${hasChildren ? 'group-node' : 'leaf-node'} ${collapsed ? 'collapsed-node' : ''} ${state.selectedObjectId === item.id ? 'active' : ''}" draggable="true" ondragstart="startDrag('${item.id}')" ondragover="allowDrop(event)" ondragleave="dropLeave(event)" ondrop="dropObject(event,'${item.id}')">
        <div class="node-title" onclick="selectObject('${item.id}')">
          ${nodeToggle('object', item.id, hasChildren, collapsed)}
          <span>${escapeHtml(item.name)}</span>
          <span class="badge">${escapeHtml(item.type)}</span>
          ${hiddenBadge(hidden, collapsed)}
        </div>
        <span class="badge ${statusClass(item.status)}">${escapeHtml(item.status)}</span>
      </div>
      ${hasChildren && !collapsed ? `<div class="node-children">${nested.map(child => renderObjectNode(child)).join('')}</div>` : ''}
    `;
  };

  window.renderSystemNode = function (item) {
    const nested = children(data.systems, item.id);
    const hasChildren = nested.length > 0;
    const collapsed = isCollapsed('system', item.id);
    const relatedEquipment = data.equipment.filter(eq => eq.systemId === item.id && !eq.parentId);
    return `
      <div class="node ${hasChildren ? 'group-node' : 'leaf-node'} ${collapsed ? 'collapsed-node' : ''} ${state.selectedSystemId === item.id ? 'active' : ''}">
        <div class="node-title" onclick="selectSystem('${item.id}')">
          ${nodeToggle('system', item.id, hasChildren, collapsed)}
          <span>${escapeHtml(item.name)}</span>
          <span class="badge">${escapeHtml(item.type)}</span>
          ${hiddenBadge(nested.length, collapsed)}
        </div>
        <span class="badge ${statusClass(item.status)}">${escapeHtml(item.status)}</span>
      </div>
      ${relatedEquipment.length ? `<div class="node-children equipment-inline">${relatedEquipment.map(eq => renderEquipmentNode(eq)).join('')}</div>` : ''}
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
          ${hiddenBadge(nested.length, collapsed)}
        </div>
        <span class="badge ${statusClass(item.status)}">${escapeHtml(item.status)}</span>
      </div>
      ${hasChildren && !collapsed ? `<div class="node-children">${nested.map(child => renderEquipmentNode(child)).join('')}</div>` : ''}
    `;
  };

  render();
})();
