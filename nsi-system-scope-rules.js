(function () {
  function localChildSystems(objectId) {
    const descendantIds = objectDescendants(objectId);
    return data.systems.filter(system => descendantIds.includes(system.locationId));
  }

  function inheritedParentSystems(objectId) {
    const ancestorIds = objectAncestors(objectId);
    return data.systems.filter(system => ancestorIds.includes(system.locationId));
  }

  function directObjectSystems(objectId) {
    return data.systems.filter(system => system.locationId === objectId);
  }

  function renderScopedSystemLines(items, note, empty = 'Нет') {
    return items.length
      ? items.map(system => `<div class="line" onclick="selectSystem('${system.id}')"><span>${escapeHtml(system.name)}</span><span class="badge">${note}</span></div>`).join('')
      : `<div class="item-meta">${empty}</div>`;
  }

  function renderObjectSystemsBlock(item) {
    const directSystems = directObjectSystems(item.id);
    const inheritedSystems = inheritedParentSystems(item.id);
    const childSystems = localChildSystems(item.id);

    return `
      <div class="section">
        <h3>Системы</h3>
        <div class="cols system-scope-cols">
          <div>
            <div class="item-meta">Прямые системы объекта</div>
            ${renderScopedSystemLines(directSystems, 'прямо здесь')}
          </div>
          <div>
            <div class="item-meta">Наследуется от родителей</div>
            ${renderScopedSystemLines(inheritedSystems, 'наследуется')}
          </div>
        </div>
        <div class="child-local-systems">
          <div class="item-meta">Локальные системы дочерних помещений</div>
          ${renderScopedSystemLines(childSystems, 'локально ниже', 'Нет локальных систем ниже')}
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
      ${renderObjectSystemsBlock(item)}
      <div class="section"><h3>Оборудование</h3>${units.length ? units.map(eq => `<div class="line" onclick="selectEquipment('${eq.id}')"><span>${escapeHtml(eq.name)}</span><span class="badge">${escapeHtml(eq.code)}</span></div>`).join('') : '<div class="item-meta">Конкретные единицы не размещены</div>'}${groups.length ? `<div class="item-meta" style="margin-top:10px">Группы раскрываются во вкладке систем: ${groups.map(g => `<button class="small" onclick="selectEquipment('${g.id}')">${escapeHtml(g.name)}</button>`).join(' ')}</div>` : ''}</div>
      <div class="section"><h3>Техкарты</h3>${renderTcLines(tcs)}</div>
      <div class="section"><h3>История / изменения</h3>${data.history.filter(h => h.entityId === item.id).map(h => `<div class="line"><span>${escapeHtml(h.text)}</span></div>`).join('') || '<div class="item-meta">Изменений пока нет</div>'}</div>
    `;
  };

  render();
})();
