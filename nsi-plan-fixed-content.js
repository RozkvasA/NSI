(function () {
  state.planCanvas = state.planCanvas || { w: 1780, h: 720, x: 0, y: 0 };
  state.planContentBase = state.planContentBase || { w: 1780, h: 720 };

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

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, Number(value) || 0));
  }

  function toPxX(value) {
    return Math.round((value / 100) * state.planContentBase.w);
  }

  function toPxY(value) {
    return Math.round((value / 100) * state.planContentBase.h);
  }

  function toPlanX(px) {
    return (px / state.planContentBase.w) * 100;
  }

  function toPlanY(px) {
    return (px / state.planContentBase.h) * 100;
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
    const w = state.planCanvas?.w || 1780;
    const h = state.planCanvas?.h || 720;
    const x = state.planCanvas?.x || 0;
    const y = state.planCanvas?.y || 0;
    return `width:${w}px;height:${h}px;margin-left:${-w / 2}px;margin-top:${-h / 2}px;transform:translate(${x}px, ${y}px)`;
  }

  function viewportStyle() {
    const w = state.planViewport?.w || 1880;
    const h = state.planViewport?.h || 820;
    return `width:${w}px;height:${h}px;min-height:${h}px`;
  }

  window.beginCanvasResize = function (event) {
    event.preventDefault();
    event.stopPropagation();
    state.planCanvasResizeDrag = {
      startX: event.clientX,
      startY: event.clientY,
      startW: state.planCanvas.w || 1780,
      startH: state.planCanvas.h || 720
    };
    document.addEventListener('pointermove', moveCanvasResizeFixedContent);
    document.addEventListener('pointerup', endCanvasResizeFixedContent, { once: true });
  };

  function moveCanvasResizeFixedContent(event) {
    const drag = state.planCanvasResizeDrag;
    if (!drag) return;
    state.planCanvas.w = clamp(drag.startW + event.clientX - drag.startX, state.planContentBase.w, 4200);
    state.planCanvas.h = clamp(drag.startH + event.clientY - drag.startY, state.planContentBase.h, 2200);
    const canvas = document.querySelector('.plan-canvas');
    if (canvas) {
      canvas.style.width = `${state.planCanvas.w}px`;
      canvas.style.height = `${state.planCanvas.h}px`;
      canvas.style.marginLeft = `${-state.planCanvas.w / 2}px`;
      canvas.style.marginTop = `${-state.planCanvas.h / 2}px`;
    }
  }

  function endCanvasResizeFixedContent() {
    document.removeEventListener('pointermove', moveCanvasResizeFixedContent);
    state.planCanvasResizeDrag = null;
    render();
  }

  window.beginPlanDrag = function (event, id, mode) {
    if (!state.planEditing) return;
    event.preventDefault();
    event.stopPropagation();
    const room = objectById(id);
    const canvas = event.currentTarget.closest('.plan-canvas');
    if (!room || !room.plan || !canvas) return;
    if (typeof state.planStackCounter === 'number') {
      state.planStackCounter += 1;
      state.planStackOrder = state.planStackOrder || {};
      state.planStackOrder[id] = state.planStackCounter;
    }
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
    document.addEventListener('pointermove', moveTileFixedContent);
    document.addEventListener('pointerup', endTileFixedContent, { once: true });
  };

  function moveTileFixedContent(event) {
    const drag = state.planDrag;
    if (!drag) return;
    const room = objectById(drag.id);
    if (!room || !room.plan) return;
    const dx = toPlanX(event.clientX - drag.startX);
    const dy = toPlanY(event.clientY - drag.startY);
    if (drag.mode === 'resize') {
      room.plan.w = clamp(drag.startPlan.w + dx, 3, 100 - drag.startPlan.x);
      room.plan.h = clamp(drag.startPlan.h + dy, 3, 100 - drag.startPlan.y);
    } else {
      room.plan.x = clamp(drag.startPlan.x + dx, 0, 100 - room.plan.w);
      room.plan.y = clamp(drag.startPlan.y + dy, 0, 100 - room.plan.h);
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

  function endTileFixedContent() {
    document.removeEventListener('pointermove', moveTileFixedContent);
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
        <div data-plan-room="${room.id}" class="room fixed-tile plan-level-${depth} ${isContainer ? 'plan-container' : 'plan-leaf'} ${verticalClass} ${outClass} ${state.selectedObjectId === room.id ? 'active' : ''} ${state.planSelectedId === room.id && state.planEditing ? 'editing' : ''} ${statusClass(room.status)}" onclick="pickPlanRoom(event,'${room.id}')" onpointerdown="beginPlanDrag(event,'${room.id}','move')" style="${tileStyle(room)}">
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
          <div><strong>${escapeHtml(currentFloor?.name || 'Этаж')}</strong><span>${rooms.length} зон и помещений · белое поле расширяется без масштабирования плиток</span></div>
          <div class="plan-actions">
            <button class="ghost" onclick="resetPlanCanvas()">В центр</button>
            ${state.planEditing ? '<button onclick="togglePlanEditor()">Сохранить</button><button class="ghost" onclick="cancelPlanEditor()">Отменить</button>' : '<button onclick="togglePlanEditor()">Редактировать</button>'}
          </div>
        </div>
        ${parentWarningBlock()}
        <div class="plan-window-scroll simple-viewport">
          <div class="plan-map detailed layered free-canvas" style="${viewportStyle()}" onpointerdown="beginPlanCanvasDrag(event)">
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
