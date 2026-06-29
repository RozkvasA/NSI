(function () {
  state.planCanvas = state.planCanvas || { x: 0, y: 0, dragging: null };

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

  function tileStyle(room) {
    const plan = room.plan;
    const depth = depthOfObject(room.id);
    const z = 10 + depth * 10;
    const bg = plan.color ? `background:${plan.color};` : '';
    return `left:${plan.x}%;top:${plan.y}%;width:${plan.w}%;height:${plan.h}%;z-index:${z};${bg}`;
  }

  function isVerticalTile(room) {
    const plan = room.plan;
    return plan.w <= 7 && plan.h >= plan.w * 1.7;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, Number(value) || 0));
  }

  window.resetPlanCanvas = function () {
    state.planCanvas.x = 0;
    state.planCanvas.y = 0;
    render();
  };

  window.beginPlanCanvasDrag = function (event) {
    if (event.target.closest('.room') || event.target.closest('button') || event.target.closest('input') || event.target.closest('select')) return;
    event.preventDefault();
    state.planCanvas.dragging = {
      startX: event.clientX,
      startY: event.clientY,
      baseX: state.planCanvas.x || 0,
      baseY: state.planCanvas.y || 0
    };
    document.addEventListener('pointermove', movePlanCanvas);
    document.addEventListener('pointerup', endPlanCanvas, { once: true });
  };

  function movePlanCanvas(event) {
    const drag = state.planCanvas.dragging;
    if (!drag) return;
    state.planCanvas.x = drag.baseX + event.clientX - drag.startX;
    state.planCanvas.y = drag.baseY + event.clientY - drag.startY;
    const canvas = document.querySelector('.plan-canvas');
    if (canvas) canvas.style.transform = `translate(${state.planCanvas.x}px, ${state.planCanvas.y}px)`;
  }

  function endPlanCanvas() {
    document.removeEventListener('pointermove', movePlanCanvas);
    state.planCanvas.dragging = null;
  }

  const originalBeginPlanDrag = window.beginPlanDrag;
  window.beginPlanDrag = function (event, id, mode) {
    if (!state.planEditing) return;
    event.preventDefault();
    event.stopPropagation();
    const room = objectById(id);
    const canvas = event.currentTarget.closest('.plan-canvas');
    if (!room || !room.plan || !canvas) return;
    state.planSelectedId = id;
    state.selectedObjectId = id;
    const rect = canvas.getBoundingClientRect();
    state.planDrag = {
      id,
      mode,
      rect,
      startX: event.clientX,
      startY: event.clientY,
      startPlan: { ...room.plan }
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
      el.classList.toggle('vertical-label', isVerticalTile(room));
    }
  }

  function endTilePointer() {
    document.removeEventListener('pointermove', moveTilePointer);
    state.planDrag = null;
    render();
  }

  renderPlan = function () {
    const floors = data.objects.filter(item => item.type === 'Этаж');
    const rooms = roomsOnCurrentFloor();
    const currentFloor = objectById(state.selectedFloorId);
    const offsetX = state.planCanvas.x || 0;
    const offsetY = state.planCanvas.y || 0;
    const tiles = rooms.length ? rooms.map(room => {
      const isContainer = hasPlannedChildren(room);
      const depth = depthOfObject(room.id);
      const verticalClass = isVerticalTile(room) ? 'vertical-label' : '';
      return `
        <div data-plan-room="${room.id}" class="room plan-level-${depth} ${isContainer ? 'plan-container' : 'plan-leaf'} ${verticalClass} ${state.selectedObjectId === room.id ? 'active' : ''} ${state.planSelectedId === room.id && state.planEditing ? 'editing' : ''} ${statusClass(room.status)}" onclick="pickPlanRoom(event,'${room.id}')" onpointerdown="beginPlanDrag(event,'${room.id}','move')" style="${tileStyle(room)}">
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
          <div><strong>${escapeHtml(currentFloor?.name || 'Этаж')}</strong><span>${rooms.length} зон и помещений · поле можно двигать</span></div>
          <div class="plan-actions">
            <button class="ghost" onclick="resetPlanCanvas()">В центр</button>
            ${state.planEditing ? '<button onclick="togglePlanEditor()">Сохранить</button><button class="ghost" onclick="cancelPlanEditor()">Отменить</button>' : '<button onclick="togglePlanEditor()">Редактировать</button>'}
          </div>
        </div>
        ${typeof renderPlanEditorPanel === 'function' ? renderPlanEditorPanel() : ''}
        <div class="plan-map detailed layered free-canvas" onpointerdown="beginPlanCanvasDrag(event)">
          <div class="plan-canvas" style="transform:translate(${offsetX}px, ${offsetY}px)">
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
