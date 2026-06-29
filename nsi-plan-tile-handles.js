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
      .filter(item => {
        if (!item || !item.plan || item.id === room.id) return false;
        if (item.plan.floorId !== room.plan.floorId) return false;
        if (depthOfObject(item.id) >= depthOfObject(room.id)) return false;
        if (item.type === 'Этаж') return false;
        return containsPoint(item, point) && (hasPlannedChildren(item) || ['Офис', 'Офисный блок', 'Зона', 'Коридор', 'Сервисное ядро', 'Помещение'].includes(item.type));
      })
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

  function planTypeClass(room) {
    const value = `${room.type || ''} ${room.name || ''}`.toLowerCase();
    if (value.includes('офис')) return 'plan-type-office';
    if (value.includes('кабинет')) return 'plan-type-cabinet';
    if (value.includes('open') || value.includes('ос ')) return 'plan-type-open-space';
    if (value.includes('переговор')) return 'plan-type-meeting';
    if (value.includes('моп') || value.includes('лифт')) return 'plan-type-mop';
    if (value.includes('коридор') || value.includes('холл') || value.includes('проезд')) return 'plan-type-corridor';
    if (value.includes('тех') || value.includes('сервер') || value.includes('итп') || value.includes('насос') || value.includes('вент')) return 'plan-type-tech';
    if (value.includes('с/у') || value.includes('wc')) return 'plan-type-wc';
    if (value.includes('кух')) return 'plan-type-kitchen';
    if (value.includes('паркинг') || value.includes('парков')) return 'plan-type-parking';
    if (value.includes('зона')) return 'plan-type-zone';
    return 'plan-type-room';
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, Number(value) || 0));
  }

  function zoom() {
    return state.planZoom || 1;
  }

  function baseW() {
    return state.planContentBase?.w || 2920;
  }

  function baseH() {
    return state.planContentBase?.h || 760;
  }

  function canvasPercentW() {
    return ((state.planCanvas?.w || baseW()) / baseW()) * 100;
  }

  function canvasPercentH() {
    return ((state.planCanvas?.h || baseH()) / baseH()) * 100;
  }

  function toPxX(value) {
    return Math.round((value / 100) * baseW());
  }

  function toPxY(value) {
    return Math.round((value / 100) * baseH());
  }

  function toPlanX(px) {
    return (px / baseW()) * 100;
  }

  function toPlanY(px) {
    return (px / baseH()) * 100;
  }

  function tileStyle(room) {
    const plan = room.plan;
    const depth = depthOfObject(room.id);
    const order = state.planStackOrder?.[room.id] || 0;
    const z = 1000 + depth * 1000 + order;
    const bg = plan.color ? `background:${plan.color};` : '';
    return `left:${toPxX(plan.x)}px;top:${toPxY(plan.y)}px;width:${toPxX(plan.w)}px;height:${toPxY(plan.h)}px;z-index:${z};${bg}`;
  }

  function canvasStyle() {
    const w = state.planCanvas?.w || 3150;
    const h = state.planCanvas?.h || 880;
    const x = state.planCanvas?.x || 0;
    const y = state.planCanvas?.y || 0;
    return `width:${w}px;height:${h}px;margin-left:${-w / 2}px;margin-top:${-h / 2}px;transform:translate(${x}px, ${y}px) scale(${zoom()});transform-origin:center center`;
  }

  function applyCanvasTransform() {
    const canvas = document.querySelector('.plan-canvas');
    if (!canvas) return;
    const w = state.planCanvas?.w || 3150;
    const h = state.planCanvas?.h || 880;
    const x = state.planCanvas?.x || 0;
    const y = state.planCanvas?.y || 0;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    canvas.style.marginLeft = `${-w / 2}px`;
    canvas.style.marginTop = `${-h / 2}px`;
    canvas.style.transform = `translate(${x}px, ${y}px) scale(${zoom()})`;
    canvas.style.transformOrigin = 'center center';
  }

  function viewportStyle() {
    const w = state.planViewport?.w || 1880;
    const h = state.planViewport?.h || 820;
    return `width:${w}px;height:${h}px;min-height:${h}px`;
  }

  window.beginPlanCanvasDrag = function (event) {
    if (event.target.closest('.room') || event.target.closest('button') || event.target.closest('input') || event.target.closest('select') || event.target.closest('textarea') || event.target.closest('.resize-handle') || event.target.closest('.canvas-resize-handle') || event.target.closest('.viewport-resize-handle')) return;
    event.preventDefault();
    event.stopPropagation();
    state.planCanvas = state.planCanvas || { w: 3150, h: 880, x: 0, y: 0 };
    state.planCanvas.dragging = {
      startX: event.clientX,
      startY: event.clientY,
      baseX: state.planCanvas.x || 0,
      baseY: state.planCanvas.y || 0,
      zoom: zoom()
    };
    document.addEventListener('pointermove', movePlanCanvasKeepingZoom);
    document.addEventListener('pointerup', endPlanCanvasKeepingZoom, { once: true });
  };

  function movePlanCanvasKeepingZoom(event) {
    const drag = state.planCanvas?.dragging;
    if (!drag) return;
    state.planCanvas.x = drag.baseX + event.clientX - drag.startX;
    state.planCanvas.y = drag.baseY + event.clientY - drag.startY;
    state.planZoom = drag.zoom || state.planZoom || 1;
    applyCanvasTransform();
  }

  function endPlanCanvasKeepingZoom() {
    document.removeEventListener('pointermove', movePlanCanvasKeepingZoom);
    if (state.planCanvas) state.planCanvas.dragging = null;
    applyCanvasTransform();
  }

  window.beginPlanDrag = function (event, id, mode) {
    if (!state.planEditing) return;
    event.preventDefault();
    event.stopPropagation();
    const room = objectById(id);
    const canvas = event.currentTarget.closest('.plan-canvas');
    if (!room || !room.plan || !canvas) return;
    state.planStackCounter = (state.planStackCounter || 0) + 1;
    state.planStackOrder = state.planStackOrder || {};
    state.planStackOrder[id] = state.planStackCounter;
    state.planSelectedId = id;
    state.selectedObjectId = id;
    state.planParentWarning = null;
    state.planDrag = {
      id,
      mode,
      startX: event.clientX,
      startY: event.clientY,
      startPlan: { ...room.plan },
      startParentId: room.parentId || null
    };
    document.addEventListener('pointermove', moveTileWithCornerHandles);
    document.addEventListener('pointerup', endTileWithCornerHandles, { once: true });
  };

  function moveTileWithCornerHandles(event) {
    const drag = state.planDrag;
    if (!drag) return;
    const room = objectById(drag.id);
    if (!room || !room.plan) return;
    const dx = toPlanX((event.clientX - drag.startX) / zoom());
    const dy = toPlanY((event.clientY - drag.startY) / zoom());
    const maxX = canvasPercentW();
    const maxY = canvasPercentH();
    const minSize = 3;

    if (drag.mode === 'resize-nw') {
      const right = drag.startPlan.x + drag.startPlan.w;
      const bottom = drag.startPlan.y + drag.startPlan.h;
      const nextX = clamp(drag.startPlan.x + dx, 0, right - minSize);
      const nextY = clamp(drag.startPlan.y + dy, 0, bottom - minSize);
      room.plan.x = nextX;
      room.plan.y = nextY;
      room.plan.w = right - nextX;
      room.plan.h = bottom - nextY;
    } else if (drag.mode === 'resize-se' || drag.mode === 'resize') {
      room.plan.w = clamp(drag.startPlan.w + dx, minSize, maxX - drag.startPlan.x);
      room.plan.h = clamp(drag.startPlan.h + dy, minSize, maxY - drag.startPlan.y);
    } else {
      room.plan.x = clamp(drag.startPlan.x + dx, 0, maxX - room.plan.w);
      room.plan.y = clamp(drag.startPlan.y + dy, 0, maxY - room.plan.h);
    }

    const el = document.querySelector(`[data-plan-room="${drag.id}"]`);
    if (el) {
      el.style.left = `${toPxX(room.plan.x)}px`;
      el.style.top = `${toPxY(room.plan.y)}px`;
      el.style.width = `${toPxX(room.plan.w)}px`;
      el.style.height = `${toPxY(room.plan.h)}px`;
      el.classList.toggle('vertical-label', isVerticalTile(room));
      el.classList.toggle('out-of-parent', !isInsideParent(room));
    }
  }

  function endTileWithCornerHandles() {
    document.removeEventListener('pointermove', moveTileWithCornerHandles);
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

  function resizeHandles(room) {
    if (!state.planEditing) return '';
    return `
      <span class="resize-handle resize-nw" onpointerdown="beginPlanDrag(event,'${room.id}','resize-nw')"></span>
      <span class="resize-handle resize-se" onpointerdown="beginPlanDrag(event,'${room.id}','resize-se')"></span>
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
        <div data-plan-room="${room.id}" class="room fixed-tile plan-level-${depth} ${planTypeClass(room)} ${isContainer ? 'plan-container' : 'plan-leaf'} ${verticalClass} ${outClass} ${state.selectedObjectId === room.id ? 'active' : ''} ${state.planSelectedId === room.id && state.planEditing ? 'editing' : ''} ${statusClass(room.status)}" onclick="pickPlanRoom(event,'${room.id}')" onpointerdown="beginPlanDrag(event,'${room.id}','move')" style="${tileStyle(room)}">
          <div class="room-name">${escapeHtml(room.name)}</div>
          <div class="room-status">${isContainer ? 'контейнер · ' : ''}${escapeHtml(room.type)} · ${escapeHtml(room.status)}</div>
          ${resizeHandles(room)}
        </div>
      `;
    }).join('') : '<div class="empty">На выбранном этаже планировка пока не заполнена</div>';

    return `
      <div class="plan enhanced-plan ${state.planEditing ? 'plan-editing' : ''}">
        <div class="floor-tabs">${floors.map(f => `<button class="${state.selectedFloorId === f.id ? 'active' : ''}" onclick="state.selectedFloorId='${f.id}';render()">${escapeHtml(f.name)}</button>`).join('')}</div>
        <div class="plan-caption">
          <div><strong>${escapeHtml(currentFloor?.name || 'Этаж')}</strong><span>${rooms.length} зон и помещений · планировка</span></div>
          <div class="plan-actions">
            <button class="ghost" onclick="resetPlanCanvas()">В центр</button>
            <button class="ghost plan-zoom-reset" onclick="resetPlanZoom()"><span class="plan-zoom-badge">${Math.round(zoom() * 100)}%</span></button>
            ${state.planEditing ? '<button onclick="togglePlanEditor()">Сохранить</button><button class="ghost" onclick="cancelPlanEditor()">Отменить</button>' : '<button onclick="togglePlanEditor()">Редактировать</button>'}
          </div>
        </div>
        ${parentWarningBlock()}
        <div class="plan-window-scroll simple-viewport">
          <div class="plan-map detailed layered free-canvas zoomable-plan screenshot-plan" style="${viewportStyle()}" onwheel="handlePlanZoom(event)" onpointerdown="beginPlanCanvasDrag(event)">
            <div class="plan-canvas resizable-canvas fixed-content-canvas" style="${canvasStyle()}">
              <div class="plan-core core-a">Лифты / лестница</div>
              <div class="plan-core core-b">Инженерный стояк</div>
              ${tiles}
              <span class="canvas-resize-handle" onpointerdown="beginCanvasResize(event)" title="Расширить белое поле без изменения плиток"></span>
            </div>
            <span class="viewport-resize-handle" onpointerdown="beginViewportResize(event)" title="Изменить размер окна"></span>
          </div>
        </div>
      </div>
    `;
  };

  render();
})();
