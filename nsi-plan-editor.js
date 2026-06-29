(function () {
  const palette = ['#ffffff', '#eef6f1', '#fbf4e4', '#f8eeee', '#e8f0f7', '#f3eef8', '#eef7f7'];
  state.planEditing = false;
  state.planSelectedId = state.selectedObjectId;
  state.planSnapshot = null;
  state.planDrag = null;

  function roomsOnFloor() {
    return data.objects.filter(item => item.plan && item.plan.floorId === state.selectedFloorId);
  }

  function selectedPlanRoom() {
    const current = objectById(state.planSelectedId);
    if (current && current.plan && current.plan.floorId === state.selectedFloorId) return current;
    const fallback = roomsOnFloor()[0];
    if (fallback) state.planSelectedId = fallback.id;
    return fallback;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, Number(value) || 0));
  }

  function snapshotPlans() {
    state.planSnapshot = JSON.stringify(data.objects.map(item => ({ id: item.id, plan: item.plan ? { ...item.plan } : null })));
  }

  function restorePlans() {
    if (!state.planSnapshot) return;
    const saved = JSON.parse(state.planSnapshot);
    saved.forEach(savedItem => {
      const item = objectById(savedItem.id);
      if (!item) return;
      if (savedItem.plan) item.plan = { ...savedItem.plan };
      else delete item.plan;
    });
  }

  window.togglePlanEditor = function () {
    if (!state.planEditing) {
      snapshotPlans();
      state.planEditing = true;
      state.planSelectedId = state.selectedObjectId;
    } else {
      state.planEditing = false;
      state.planSnapshot = null;
    }
    render();
  };

  window.cancelPlanEditor = function () {
    restorePlans();
    state.planEditing = false;
    state.planSnapshot = null;
    render();
  };

  window.pickPlanRoom = function (event, id) {
    if (event) event.stopPropagation();
    state.planSelectedId = id;
    selectObject(id);
  };

  window.updatePlanValue = function (field, value) {
    const room = selectedPlanRoom();
    if (!room || !room.plan) return;
    if (field === 'x') room.plan.x = clamp(value, 0, 100 - room.plan.w);
    if (field === 'y') room.plan.y = clamp(value, 0, 100 - room.plan.h);
    if (field === 'w') room.plan.w = clamp(value, 6, 100 - room.plan.x);
    if (field === 'h') room.plan.h = clamp(value, 6, 100 - room.plan.y);
    render();
  };

  window.updatePlanColor = function (color) {
    const room = selectedPlanRoom();
    if (!room || !room.plan) return;
    room.plan.color = color;
    render();
  };

  window.beginPlanDrag = function (event, id, mode) {
    if (!state.planEditing) return;
    event.preventDefault();
    event.stopPropagation();
    const room = objectById(id);
    const map = event.currentTarget.closest('.plan-map');
    if (!room || !room.plan || !map) return;
    state.planSelectedId = id;
    state.selectedObjectId = id;
    const rect = map.getBoundingClientRect();
    state.planDrag = {
      id,
      mode,
      rect,
      startX: event.clientX,
      startY: event.clientY,
      startPlan: { ...room.plan }
    };
    document.addEventListener('pointermove', movePlanPointer);
    document.addEventListener('pointerup', endPlanPointer, { once: true });
  };

  function movePlanPointer(event) {
    const drag = state.planDrag;
    if (!drag) return;
    const room = objectById(drag.id);
    if (!room || !room.plan) return;
    const dx = ((event.clientX - drag.startX) / drag.rect.width) * 100;
    const dy = ((event.clientY - drag.startY) / drag.rect.height) * 100;
    if (drag.mode === 'resize') {
      room.plan.w = clamp(drag.startPlan.w + dx, 6, 100 - drag.startPlan.x);
      room.plan.h = clamp(drag.startPlan.h + dy, 6, 100 - drag.startPlan.y);
    } else {
      room.plan.x = clamp(drag.startPlan.x + dx, 0, 100 - drag.startPlan.w);
      room.plan.y = clamp(drag.startPlan.y + dy, 0, 100 - drag.startPlan.h);
    }
    const el = document.querySelector(`[data-plan-room="${drag.id}"]`);
    if (el) {
      el.style.left = `${room.plan.x}%`;
      el.style.top = `${room.plan.y}%`;
      el.style.width = `${room.plan.w}%`;
      el.style.height = `${room.plan.h}%`;
    }
  }

  function endPlanPointer() {
    document.removeEventListener('pointermove', movePlanPointer);
    state.planDrag = null;
    render();
  }

  function planTileStyle(room) {
    const plan = room.plan;
    const bg = plan.color ? `background:${plan.color};` : '';
    return `left:${plan.x}%;top:${plan.y}%;width:${plan.w}%;height:${plan.h}%;${bg}`;
  }

  function renderPlanEditorPanel() {
    if (!state.planEditing) return '';
    const room = selectedPlanRoom();
    if (!room || !room.plan) return '<div class="plan-editor-panel">На этаже нет плиток для редактирования</div>';
    return `
      <div class="plan-editor-panel">
        <div class="plan-editor-title">
          <strong>${escapeHtml(room.name)}</strong>
          <span class="badge">редактирование</span>
        </div>
        <div class="plan-editor-grid">
          <label>X<input type="number" value="${Math.round(room.plan.x)}" min="0" max="100" onchange="updatePlanValue('x', this.value)"></label>
          <label>Y<input type="number" value="${Math.round(room.plan.y)}" min="0" max="100" onchange="updatePlanValue('y', this.value)"></label>
          <label>Ширина<input type="number" value="${Math.round(room.plan.w)}" min="6" max="100" onchange="updatePlanValue('w', this.value)"></label>
          <label>Высота<input type="number" value="${Math.round(room.plan.h)}" min="6" max="100" onchange="updatePlanValue('h', this.value)"></label>
        </div>
        <div class="plan-colors">
          ${palette.map(color => `<button class="plan-color ${room.plan.color === color ? 'active' : ''}" style="background:${color}" onclick="updatePlanColor('${color}')" title="${color}"></button>`).join('')}
        </div>
      </div>
    `;
  }

  renderPlan = function () {
    const floors = data.objects.filter(item => item.type === 'Этаж');
    const rooms = roomsOnFloor();
    const currentFloor = objectById(state.selectedFloorId);
    const tiles = rooms.length ? rooms.map(room => `
      <div data-plan-room="${room.id}" class="room ${state.selectedObjectId === room.id ? 'active' : ''} ${state.planSelectedId === room.id && state.planEditing ? 'editing' : ''} ${statusClass(room.status)}" onclick="pickPlanRoom(event,'${room.id}')" onpointerdown="beginPlanDrag(event,'${room.id}','move')" style="${planTileStyle(room)}">
        <div class="room-name">${escapeHtml(room.name)}</div>
        <div class="room-status">${escapeHtml(room.type)} · ${escapeHtml(room.status)}</div>
        ${state.planEditing ? '<span class="resize-handle" onpointerdown="beginPlanDrag(event,\'' + room.id + '\',\'resize\')"></span>' : ''}
      </div>
    `).join('') : '<div class="empty">На выбранном этаже планировка пока не заполнена</div>';

    return `
      <div class="plan enhanced-plan ${state.planEditing ? 'plan-editing' : ''}">
        <div class="floor-tabs">${floors.map(f => `<button class="${state.selectedFloorId === f.id ? 'active' : ''}" onclick="state.selectedFloorId='${f.id}';render()">${escapeHtml(f.name)}</button>`).join('')}</div>
        <div class="plan-caption">
          <div><strong>${escapeHtml(currentFloor?.name || 'Этаж')}</strong><span>${rooms.length} зон и помещений на схеме</span></div>
          <div class="plan-actions">
            ${state.planEditing ? '<button onclick="togglePlanEditor()">Сохранить</button><button class="ghost" onclick="cancelPlanEditor()">Отменить</button>' : '<button onclick="togglePlanEditor()">Редактировать</button>'}
          </div>
        </div>
        ${renderPlanEditorPanel()}
        <div class="plan-map detailed">
          <div class="plan-core core-a">Лифты / лестница</div>
          <div class="plan-core core-b">Инженерный стояк</div>
          ${tiles}
        </div>
      </div>
    `;
  };

  render();
})();
