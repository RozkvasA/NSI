(function () {
  state.planStackCounter = state.planStackCounter || 0;
  state.planStackOrder = state.planStackOrder || {};
  state.planParentWarning = null;

  function depthOfObject(id) {
    let depth = 0;
    let current = objectById(id);
    while (current && current.parentId) {
      depth += 1;
      current = objectById(current.parentId);
    }
    return depth;
  }

  function raiseTile(id) {
    state.planStackCounter += 1;
    state.planStackOrder[id] = state.planStackCounter;
  }

  function hasPlannedChildren(item) {
    return data.objects.some(child => child.parentId === item.id && child.plan && child.plan.floorId === item.plan?.floorId);
  }

  function isContainerCandidate(item, child) {
    if (!item || !item.plan || !child || item.id === child.id) return false;
    if (item.plan.floorId !== child.plan.floorId) return false;
    if (depthOfObject(item.id) >= depthOfObject(child.id)) return false;
    if (item.type === 'Этаж') return false;
    return ['Офис', 'Офисный блок', 'Зона', 'Коридор', 'Сервисное ядро', 'Помещение'].includes(item.type) || hasPlannedChildren(item);
  }

  function containsPoint(container, point) {
    const p = container.plan;
    return point.x >= p.x && point.x <= p.x + p.w && point.y >= p.y && point.y <= p.y + p.h;
  }

  function centerOf(room) {
    return { x: room.plan.x + room.plan.w / 2, y: room.plan.y + room.plan.h / 2 };
  }

  function isInsideParent(room) {
    const parent = objectById(room.parentId);
    if (!parent || !parent.plan || parent.plan.floorId !== room.plan.floorId) return true;
    return containsPoint(parent, centerOf(room));
  }

  function suggestedParent(room) {
    const point = centerOf(room);
    return data.objects
      .filter(item => isContainerCandidate(item, room) && containsPoint(item, point))
      .sort((a, b) => depthOfObject(b.id) - depthOfObject(a.id))[0] || objectById(room.plan.floorId);
  }

  function roomsOnCurrentFloor() {
    return data.objects
      .filter(item => item.plan && item.plan.floorId === state.selectedFloorId)
      .sort((a, b) => depthOfObject(a.id) - depthOfObject(b.id));
  }

  function isVerticalTile(room) {
    const plan = room.plan;
    return plan.w <= 7 && plan.h >= plan.w * 1.7;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, Number(value) || 0));
  }

  function tileStyle(room) {
    const plan = room.plan;
    const depth = depthOfObject(room.id);
    const order = state.planStackOrder[room.id] || 0;
    const z = 1000 + depth * 1000 + order;
    const bg = plan.color ? `background:${plan.color};` : '';
    return `left:${plan.x}%;top:${plan.y}%;width:${plan.w}%;height:${plan.h}%;z-index:${z};${bg}`;
  }

  function canvasStyle() {
    const w = state.planCanvas?.w || 1180;
    const h = state.planCanvas?.h || 760;
    const x = state.planCanvas?.x || 0;
    const y = state.planCanvas?.y || 0;
    return `width:${w}px;height:${h}px;margin-left:${-w / 2}px;margin-top:${-h / 2}px;transform:translate(${x}px, ${y}px)`;
  }

  window.pickPlanRoom = function (event, id) {
    if (event) event.stopPropagation();
    raiseTile(id);
    state.planSelectedId = id;
    selectObject(id);
  };

  window.beginPlanDrag = function (event, id, mode) {
    if (!state.planEditing) return;
    event.preventDefault();
    event.stopPropagation();
    const room = objectById(id);
    const canvas = event.currentTarget.closest('.plan-canvas');
    if (!room || !room.plan || !canvas) return;
    raiseTile(id);
    state.planSelectedId = id;
    state.selectedObjectId = id;
    state.planParentWarning = null;
    const rect = canvas.getBoundingClientRect();
    state.planDrag = {
      id,
      mode,
      rect,
      startX: event.clientX,
      startY: event.clientY,
      startPlan: { ...room.plan },
      startParentId: room.parentId || null
    };
    document.addEventListener('pointermove', moveTilePointer);
    document.addEventListener('pointerup', endTilePointer, { once: true });
  };

  function moveTilePointer(event) {
    const drag = state.planDrag;
    if (!drag) return;
    const room = objectById(drag.id);
    if (!room || !room.plan) return;
    const dx = ((event.clientX - drag.startX) / drag.rect.width) * 100;
    const dy = ((event.clientY - drag.startY) / drag.rect.height) * 100;
    if (drag.mode === 'resize') {
      room.plan.w = clamp(drag.startPlan.w + dx, 3, 100 - drag.startPlan.x);
      room.plan.h = clamp(drag.startPlan.h + dy, 3, 100 - drag.startPlan.y);
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
      el.style.zIndex = String(1000 + depthOfObject(room.id) * 1000 + (state.planStackOrder[room.id] || 0));
      el.classList.toggle('vertical-label', isVerticalTile(room));
      el.classList.toggle('out-of-parent', !isInsideParent(room));
    }
  }

  function endTilePointer() {
    document.removeEventListener('pointermove', moveTilePointer);
    const drag = state.planDrag;
    state.planDrag = null;
    if (drag) {
      const room = objectById(drag.id);
      if (room && room.plan && !isInsideParent(room)) {
        const parent = objectById(drag.startParentId);
        const nextParent = suggestedParent(room);
        state.planParentWarning = {
          roomId: room.id,
          roomName: room.name,
          originalParentId: drag.startParentId,
          originalParentName: parent?.name || 'Без родителя',
          suggestedParentId: nextParent?.id || room.plan.floorId,
          suggestedParentName: nextParent?.name || objectById(room.plan.floorId)?.name || 'Этаж',
          originalPlan: drag.startPlan
        };
      }
    }
    render();
  }

  window.confirmPlanParentChange = function () {
    const warning = state.planParentWarning;
    if (!warning) return;
    const room = objectById(warning.roomId);
    if (room) room.parentId = warning.suggestedParentId;
    state.planParentWarning = null;
    render();
  };

  window.cancelPlanParentChange = function () {
    const warning = state.planParentWarning;
    if (!warning) return;
    const room = objectById(warning.roomId);
    if (room) {
      room.parentId = warning.originalParentId;
      room.plan = { ...warning.originalPlan };
    }
    state.planParentWarning = null;
    render();
  };

  window.keepPlanOnly = function () {
    state.planParentWarning = null;
    render();
  };

  function parentWarningBlock() {
    const warning = state.planParentWarning;
    if (!warning) return '';
    return `
      <div class="parent-warning">
        <div>
          <strong>${escapeHtml(warning.roomName)}</strong>
          <span>Плитка вне родителя: ${escapeHtml(warning.originalParentName)}. Новый родитель по положению: ${escapeHtml(warning.suggestedParentName)}.</span>
        </div>
        <div class="parent-warning-actions">
          <button class="primary" onclick="confirmPlanParentChange()">Сменить родителя</button>
          <button onclick="cancelPlanParentChange()">Вернуть назад</button>
          <button class="ghost" onclick="keepPlanOnly()">Оставить только на плане</button>
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
      const verticalClass = isVerticalTile(room) ? 'vertical-label' : '';
      const outClass = !isInsideParent(room) ? 'out-of-parent' : '';
      return `
        <div data-plan-room="${room.id}" class="room plan-level-${depth} ${isContainer ? 'plan-container' : 'plan-leaf'} ${verticalClass} ${outClass} ${state.selectedObjectId === room.id ? 'active' : ''} ${state.planSelectedId === room.id && state.planEditing ? 'editing' : ''} ${statusClass(room.status)}" onclick="pickPlanRoom(event,'${room.id}')" onpointerdown="beginPlanDrag(event,'${room.id}','move')" style="${tileStyle(room)}">
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
          <div><strong>${escapeHtml(currentFloor?.name || 'Этаж')}</strong><span>${rooms.length} зон и помещений · верхний слой по последнему действию</span></div>
          <div class="plan-actions">
            <button class="ghost" onclick="resetPlanCanvas()">В центр</button>
            ${state.planEditing ? '<button onclick="togglePlanEditor()">Сохранить</button><button class="ghost" onclick="cancelPlanEditor()">Отменить</button>' : '<button onclick="togglePlanEditor()">Редактировать</button>'}
          </div>
        </div>
        ${typeof sizeControls === 'function' ? sizeControls() : ''}
        ${parentWarningBlock()}
        ${typeof renderPlanEditorPanel === 'function' ? renderPlanEditorPanel() : ''}
        <div class="plan-map detailed layered free-canvas" onpointerdown="beginPlanCanvasDrag(event)">
          <div class="plan-canvas" style="${canvasStyle()}">
            <div class="plan-core core-a">Лифты / лестница</div>
            <div class="plan-core core-b">Инженерный стояк</div>
            ${tiles}
          </div>
        </div>
      </div>
    `;
  };

  render();
})();
