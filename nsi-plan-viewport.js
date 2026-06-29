(function () {
  state.planViewport = state.planViewport || { w: 1880, h: 820 };

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

  function roomsOnCurrentFloor() {
    return data.objects
      .filter(item => item.plan && item.plan.floorId === state.selectedFloorId)
      .sort((a, b) => depthOfObject(a.id) - depthOfObject(b.id));
  }

  function isVerticalTile(room) {
    const plan = room.plan;
    return plan.w <= 7 && plan.h >= plan.w * 1.7;
  }

  function tileStyle(room) {
    const plan = room.plan;
    const depth = depthOfObject(room.id);
    const order = state.planStackOrder?.[room.id] || 0;
    const z = 1000 + depth * 1000 + order;
    const bg = plan.color ? `background:${plan.color};` : '';
    return `left:${plan.x}%;top:${plan.y}%;width:${plan.w}%;height:${plan.h}%;z-index:${z};${bg}`;
  }

  function canvasStyle() {
    const w = state.planCanvas?.w || 1780;
    const h = state.planCanvas?.h || 720;
    const x = state.planCanvas?.x || 0;
    const y = state.planCanvas?.y || 0;
    return `width:${w}px;height:${h}px;margin-left:${-w / 2}px;margin-top:${-h / 2}px;transform:translate(${x}px, ${y}px)`;
  }

  function viewportStyle() {
    const w = state.planViewport.w || 1880;
    const h = state.planViewport.h || 820;
    return `width:${w}px;height:${h}px;min-height:${h}px`;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, Number(value) || 0));
  }

  window.resizePlanViewportBy = function (delta) {
    state.planViewport.w = clamp((state.planViewport.w || 1880) + delta, 720, 3200);
    state.planViewport.h = clamp((state.planViewport.h || 820) + Math.round(delta * 0.35), 480, 1600);
    render();
  };

  window.updatePlanViewportSize = function (field, value) {
    if (field === 'w') state.planViewport.w = clamp(value, 720, 3200);
    if (field === 'h') state.planViewport.h = clamp(value, 480, 1600);
    render();
  };

  window.setWidePlanViewport = function () {
    state.planViewport.w = 2360;
    state.planViewport.h = 900;
    if (state.planCanvas) {
      state.planCanvas.w = Math.max(state.planCanvas.w || 1780, 2200);
      state.planCanvas.h = Math.max(state.planCanvas.h || 720, 760);
    }
    render();
  };

  window.resetPlanViewport = function () {
    state.planViewport.w = 1880;
    state.planViewport.h = 820;
    render();
  };

  function viewportControls() {
    return `
      <div class="viewport-controls">
        <div class="control-caption">Окно просмотра</div>
        <button class="ghost" onclick="resizePlanViewportBy(-160)">− окно</button>
        <button class="ghost" onclick="resizePlanViewportBy(160)">+ окно</button>
        <button class="ghost" onclick="setWidePlanViewport()">Широкий БЦ</button>
        <label>Ширина<input type="number" value="${state.planViewport.w}" min="720" max="3200" onchange="updatePlanViewportSize('w', this.value)"></label>
        <label>Высота<input type="number" value="${state.planViewport.h}" min="480" max="1600" onchange="updatePlanViewportSize('h', this.value)"></label>
        <button class="ghost" onclick="resetPlanViewport()">Сброс окна</button>
      </div>
    `;
  }

  function canvasControls() {
    return `
      <div class="canvas-size-controls">
        <div class="control-caption">Поле планировки</div>
        <button class="ghost" onclick="resizePlanCanvasBy(-120)">− поле</button>
        <button class="ghost" onclick="resizePlanCanvasBy(120)">+ поле</button>
        <label>Ширина<input type="number" value="${state.planCanvas?.w || 1780}" min="720" max="2200" onchange="updatePlanCanvasSize('w', this.value)"></label>
        <label>Высота<input type="number" value="${state.planCanvas?.h || 720}" min="480" max="1500" onchange="updatePlanCanvasSize('h', this.value)"></label>
        <button class="ghost" onclick="resetPlanCanvasSize()">Сброс поля</button>
      </div>
    `;
  }

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
          <div><strong>${escapeHtml(currentFloor?.name || 'Этаж')}</strong><span>${rooms.length} зон и помещений · отдельно настраиваются окно и поле</span></div>
          <div class="plan-actions">
            <button class="ghost" onclick="resetPlanCanvas()">В центр</button>
            ${state.planEditing ? '<button onclick="togglePlanEditor()">Сохранить</button><button class="ghost" onclick="cancelPlanEditor()">Отменить</button>' : '<button onclick="togglePlanEditor()">Редактировать</button>'}
          </div>
        </div>
        <div class="plan-control-stack">
          ${viewportControls()}
          ${canvasControls()}
        </div>
        ${parentWarningBlock()}
        <div class="plan-window-scroll">
          <div class="plan-map detailed layered free-canvas" style="${viewportStyle()}" onpointerdown="beginPlanCanvasDrag(event)">
            <div class="plan-canvas" style="${canvasStyle()}">
              <div class="plan-core core-a">Лифты / лестница</div>
              <div class="plan-core core-b">Инженерный стояк</div>
              ${tiles}
            </div>
          </div>
        </div>
      </div>
    `;
  };

  render();
})();
