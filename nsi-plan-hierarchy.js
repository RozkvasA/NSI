(function () {
  function depthOfObject(id) {
    let depth = 0;
    let current = objectById(id);
    while (current && current.parentId) {
      depth += 1;
      current = objectById(current.parentId);
    }
    return depth;
  }

  function hasPlannedChildren(item) {
    return data.objects.some(child => child.parentId === item.id && child.plan && child.plan.floorId === item.plan?.floorId);
  }

  function roomsOnCurrentFloor() {
    return data.objects
      .filter(item => item.plan && item.plan.floorId === state.selectedFloorId)
      .sort((a, b) => depthOfObject(a.id) - depthOfObject(b.id));
  }

  function selectedRoom() {
    const current = objectById(state.planSelectedId);
    if (current && current.plan && current.plan.floorId === state.selectedFloorId) return current;
    const fallback = roomsOnCurrentFloor()[0];
    if (fallback) state.planSelectedId = fallback.id;
    return fallback;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, Number(value) || 0));
  }

  function tileStyle(room) {
    const plan = room.plan;
    const depth = depthOfObject(room.id);
    const z = 10 + depth * 10;
    const bg = plan.color ? `background:${plan.color};` : '';
    return `left:${plan.x}%;top:${plan.y}%;width:${plan.w}%;height:${plan.h}%;z-index:${z};${bg}`;
  }

  function updateValue(field, value) {
    const room = selectedRoom();
    if (!room || !room.plan) return;
    if (field === 'x') room.plan.x = clamp(value, 0, 100 - room.plan.w);
    if (field === 'y') room.plan.y = clamp(value, 0, 100 - room.plan.h);
    if (field === 'w') room.plan.w = clamp(value, 6, 100 - room.plan.x);
    if (field === 'h') room.plan.h = clamp(value, 6, 100 - room.plan.y);
    render();
  }

  window.updatePlanValue = updateValue;

  function editorPanel() {
    if (!state.planEditing) return '';
    const room = selectedRoom();
    if (!room || !room.plan) return '<div class="plan-editor-panel">На этаже нет плиток для редактирования</div>';
    const colors = ['#ffffff', '#eef6f1', '#fbf4e4', '#f8eeee', '#e8f0f7', '#f3eef8', '#eef7f7'];
    return `
      <div class="plan-editor-panel">
        <div class="plan-editor-title">
          <strong>${escapeHtml(room.name)}</strong>
          <span class="badge">слой ${depthOfObject(room.id)}</span>
        </div>
        <div class="plan-editor-grid">
          <label>X<input type="number" value="${Math.round(room.plan.x)}" min="0" max="100" onchange="updatePlanValue('x', this.value)"></label>
          <label>Y<input type="number" value="${Math.round(room.plan.y)}" min="0" max="100" onchange="updatePlanValue('y', this.value)"></label>
          <label>Ширина<input type="number" value="${Math.round(room.plan.w)}" min="6" max="100" onchange="updatePlanValue('w', this.value)"></label>
          <label>Высота<input type="number" value="${Math.round(room.plan.h)}" min="6" max="100" onchange="updatePlanValue('h', this.value)"></label>
        </div>
        <div class="plan-colors">
          ${colors.map(color => `<button class="plan-color ${room.plan.color === color ? 'active' : ''}" style="background:${color}" onclick="updatePlanColor('${color}')" title="${color}"></button>`).join('')}
        </div>
      </div>
    `;
  }

  renderPlan = function () {
    const floors = data.objects.filter(item => item.type === 'Этаж');
    const rooms = roomsOnCurrentFloor();
    const currentFloor = objectById(state.selectedFloorId);
    const tiles = rooms.length ? rooms.map(room => {
      const isContainer = hasPlannedChildren(room);
      const depth = depthOfObject(room.id);
      return `
        <div data-plan-room="${room.id}" class="room plan-level-${depth} ${isContainer ? 'plan-container' : 'plan-leaf'} ${state.selectedObjectId === room.id ? 'active' : ''} ${state.planSelectedId === room.id && state.planEditing ? 'editing' : ''} ${statusClass(room.status)}" onclick="pickPlanRoom(event,'${room.id}')" onpointerdown="beginPlanDrag(event,'${room.id}','move')" style="${tileStyle(room)}">
          <div class="room-name">${escapeHtml(room.name)}</div>
          <div class="room-status">${isContainer ? 'контейнер · ' : ''}${escapeHtml(room.type)} · ${escapeHtml(room.status)}</div>
          ${state.planEditing ? '<span class="resize-handle" onpointerdown="beginPlanDrag(event,\'' + room.id + '\',\'resize\')"></span>' : ''}
        </div>
      `;
    }).join('') : '<div class="empty">На выбранном этаже планировка пока не заполнена</div>';

    return `
      <div class="plan enhanced-plan ${state.planEditing ? 'plan-editing' : ''}">
        <div class="floor-tabs">${floors.map(f => `<button class="${state.selectedFloorId === f.id ? 'active' : ''}" onclick="state.selectedFloorId='${f.id}';render()">${escapeHtml(f.name)}</button>`).join('')}</div>
        <div class="plan-caption">
          <div><strong>${escapeHtml(currentFloor?.name || 'Этаж')}</strong><span>${rooms.length} зон и помещений на схеме · слои по дереву</span></div>
          <div class="plan-actions">
            ${state.planEditing ? '<button onclick="togglePlanEditor()">Сохранить</button><button class="ghost" onclick="cancelPlanEditor()">Отменить</button>' : '<button onclick="togglePlanEditor()">Редактировать</button>'}
          </div>
        </div>
        ${editorPanel()}
        <div class="plan-map detailed layered">
          <div class="plan-core core-a">Лифты / лестница</div>
          <div class="plan-core core-b">Инженерный стояк</div>
          ${tiles}
        </div>
      </div>
    `;
  };

  putOfficeSotaContainer();

  function putOfficeSotaContainer() {
    const office = objectById('office-sota');
    if (!office) return;
    office.plan = { floorId: 'floor-4', x: 4, y: 7, w: 47, h: 89, color: '#f7fafc' };
  }

  render();
})();
