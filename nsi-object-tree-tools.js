(function () {
  state.objectTreeDepth = state.objectTreeDepth || 4;

  function objectChildren(parentId) {
    return data.objects.filter(item => item.parentId === parentId);
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

  function descendantsOf(parentId) {
    const result = [];
    const walk = id => objectChildren(id).forEach(child => {
      result.push(child.id);
      walk(child.id);
    });
    walk(parentId);
    return result;
  }

  function cleanOfficeSotaTree() {
    const office = objectById('office-sota');
    if (!office) return;
    const ids = new Set(descendantsOf('office-sota'));
    const visibleOnPlan = new Set(
      data.objects
        .filter(item => item.parentId === 'office-sota' && item.plan && item.plan.floorId === 'floor-4')
        .map(item => item.id)
    );

    data.objects = data.objects.filter(item => {
      if (!ids.has(item.id)) return true;
      return visibleOnPlan.has(item.id);
    });

    if (!objectById(state.selectedObjectId)) {
      state.selectedObjectId = 'office-sota';
    }
  }

  function hiddenChildCount(item, depth) {
    if (depth < state.objectTreeDepth) return 0;
    return descendantsOf(item.id).length;
  }

  window.setObjectTreeDepth = function (depth) {
    state.objectTreeDepth = depth;
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

  window.renderObjectTree = function () {
    cleanOfficeSotaTree();
    return `
      ${treeLevelControls()}
      <div class="tree leveled-tree">${objectChildren(null).map(item => renderObjectNode(item)).join('')}</div>
    `;
  };

  window.renderObjectNode = function (item) {
    const depth = objectDepth(item);
    const nested = depth < state.objectTreeDepth ? objectChildren(item.id) : [];
    const hidden = hiddenChildCount(item, depth);
    return `
      <div class="node level-${depth} ${state.selectedObjectId === item.id ? 'active' : ''}" draggable="true" ondragstart="startDrag('${item.id}')" ondragover="allowDrop(event)" ondragleave="dropLeave(event)" ondrop="dropObject(event,'${item.id}')">
        <div class="node-title" onclick="selectObject('${item.id}')">
          <span>${escapeHtml(item.name)}</span>
          <span class="badge">${escapeHtml(item.type)}</span>
          ${hidden ? `<span class="badge muted">+${hidden}</span>` : ''}
        </div>
        <span class="badge ${statusClass(item.status)}">${escapeHtml(item.status)}</span>
      </div>
      ${nested.length ? `<div class="node-children">${nested.map(child => renderObjectNode(child)).join('')}</div>` : ''}
    `;
  };

  cleanOfficeSotaTree();
  render();
})();
