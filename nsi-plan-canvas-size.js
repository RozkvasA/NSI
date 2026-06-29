(function () {
  state.planCanvas = state.planCanvas || { x: 0, y: 0 };
  state.planCanvas.w = state.planCanvas.w || 1180;
  state.planCanvas.h = state.planCanvas.h || 760;

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
    const z = 10 + depth * 10;
    const bg = plan.color ? `background:${plan.color};` : '';
    return `left:${plan.x}%;top:${plan.y}%;width:${plan.w}%;height:${plan.h}%;z-index:${z};${bg}`;
  }

  function canvasStyle() {
    const w = state.planCanvas.w || 1180;
    const h = state.planCanvas.h || 760;
    const x = state.planCanvas.x || 0;
    const y = state.planCanvas.y || 0;
    return `width:${w}px;height:${h}px;margin-left:${-w / 2}px;margin-top:${-h / 2}px;transform:translate(${x}px, ${y}px)`;
  }

  window.resizePlanCanvasBy = function (delta) {
    state.planCanvas.w = clamp((state.planCanvas.w || 1180) + delta, 720, 2200);
    state.planCanvas.h = clamp((state.planCanvas.h || 760) + Math.round(delta * 0.65), 480, 1500);
    render();
  };

  window.updatePlanCanvasSize = function (field, value) {
    if (field === 'w') state.planCanvas.w = clamp(value, 720, 2200);
    if (field === 'h') state.planCanvas.h = clamp(value, 480, 1500);
    render();
  };

  window.resetPlanCanvasSize = function () {
    state.planCanvas.w = 1180;
    state.planCanvas.h = 760;
    render();
  };

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

  function sizeControls() {
    return `
      <div class="canvas-size-controls">
        <button class="ghost" onclick="resizePlanCanvasBy(-120)">− поле</button>
        <button class="ghost" onclick="resizePlanCanvasBy(120)">+ поле</button>
        <label>Ширина<input type="number" value="${state.planCanvas.w}" min="720" max="2200" onchange="updatePlanCanvasSize('w', this.value)"></label>
        <label>Высота<input type="number" value="${state.planCanvas.h}" min="480" max="1500" onchange="updatePlanCanvasSize('h', this.value)"></label>
        <button class="ghost" onclick="resetPlanCanvasSize()">Сброс размера</button>
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
          <div><strong>${escapeHtml(currentFloor?.name || 'Этаж')}</strong><span>${rooms.length} зон и помещений · поле можно двигать и менять по размеру</span></div>
          <div class="plan-actions">
            <button class="ghost" onclick="resetPlanCanvas()">В центр</button>
            ${state.planEditing ? '<button onclick="togglePlanEditor()">Сохранить</button><button class="ghost" onclick="cancelPlanEditor()">Отменить</button>' : '<button onclick="togglePlanEditor()">Редактировать</button>'}
          </div>
        </div>
        ${sizeControls()}
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
