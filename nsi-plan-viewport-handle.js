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

  window.beginViewportResize = function (event) {
    event.preventDefault();
    event.stopPropagation();
    state.planViewportDrag = {
      startX: event.clientX,
      startY: event.clientY,
      startW: state.planViewport.w || 1880,
      startH: state.planViewport.h || 820
    };
    document.addEventListener('pointermove', moveViewportResize);
    document.addEventListener('pointerup', endViewportResize, { once: true });
  };

  function moveViewportResize(event) {
    const drag = state.planViewportDrag;
    if (!drag) return;
    state.planViewport.w = clamp(drag.startW + event.clientX - drag.startX, 720, 3200);
    state.planViewport.h = clamp(drag.startH + event.clientY - drag.startY, 480, 1600);
    const map = document.querySelector('.plan-map.free-canvas');
    if (map) {
      map.style.width = `${state.planViewport.w}px`;
      map.style.height = `${state.planViewport.h}px`;
      map.style.minHeight = `${state.planViewport.h}px`;
    }
  }

  function endViewportResize() {
    document.removeEventListener('pointermove', moveViewportResize);
    state.planViewportDrag = null;
    render();
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
          <div><strong>${escapeHtml(currentFloor?.name || 'Этаж')}</strong><span>${rooms.length} зон и помещений · окно меняется за уголок</span></div>
          <div class="plan-actions">
            <button class="ghost" onclick="resetPlanCanvas()">В центр</button>
            ${state.planEditing ? '<button onclick="togglePlanEditor()">Сохранить</button><button class="ghost" onclick="cancelPlanEditor()">Отменить</button>' : '<button onclick="togglePlanEditor()">Редактировать</button>'}
          </div>
        </div>
        ${parentWarningBlock()}
        <div class="plan-window-scroll simple-viewport">
          <div class="plan-map detailed layered free-canvas" style="${viewportStyle()}" onpointerdown="beginPlanCanvasDrag(event)">
            <div class="plan-canvas" style="${canvasStyle()}">
              <div class="plan-core core-a">Лифты / лестница</div>
              <div class="plan-core core-b">Инженерный стояк</div>
              ${tiles}
            </div>
            <span class="viewport-resize-handle" onpointerdown="beginViewportResize(event)" title="Изменить размер окна"></span>
          </div>
        </div>
      </div>
    `;
  };

  render();
})();
