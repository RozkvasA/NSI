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

  function isVerticalTile(room) {
    const plan = room.plan;
    return plan.w <= 7 && plan.h >= plan.w * 1.7;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, Number(value) || 0));
  }

  function baseW() {
    return state.planContentBase?.w || 1780;
  }

  function baseH() {
    return state.planContentBase?.h || 720;
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
    document.addEventListener('pointermove', moveTileInExpandedCanvas);
    document.addEventListener('pointerup', endTileInExpandedCanvas, { once: true });
  };

  function moveTileInExpandedCanvas(event) {
    const drag = state.planDrag;
    if (!drag) return;
    const room = objectById(drag.id);
    if (!room || !room.plan) return;
    const dx = toPlanX(event.clientX - drag.startX);
    const dy = toPlanY(event.clientY - drag.startY);
    const maxX = canvasPercentW();
    const maxY = canvasPercentH();

    if (drag.mode === 'resize') {
      room.plan.w = clamp(drag.startPlan.w + dx, 3, maxX - drag.startPlan.x);
      room.plan.h = clamp(drag.startPlan.h + dy, 3, maxY - drag.startPlan.y);
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

  function endTileInExpandedCanvas() {
    document.removeEventListener('pointermove', moveTileInExpandedCanvas);
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
})();
