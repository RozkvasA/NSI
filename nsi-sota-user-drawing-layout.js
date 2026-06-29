(function () {
  function put(list, item) {
    const index = list.findIndex(existing => existing.id === item.id);
    if (index >= 0) list[index] = { ...list[index], ...item };
    else list.push(item);
  }

  function clearFloor4Plan() {
    data.objects.forEach(item => {
      if (item.plan && item.plan.floorId === 'floor-4') delete item.plan;
    });
  }

  function room(id, name, type, area, code, color) {
    return {
      id,
      parentId: 'office-sota',
      name,
      type,
      code,
      status: 'Заполнено',
      area: area ? `${area} м2` : 'уточнить',
      plan: null,
      color
    };
  }

  function drawRow(items, y, h, options = {}) {
    const x0 = options.x ?? 5;
    const totalW = options.w ?? 91;
    const gap = options.gap ?? 0.32;
    const totalGap = gap * (items.length - 1);
    const freeW = totalW - totalGap;
    const sum = items.reduce((acc, item) => acc + (Number(item.weight || item.area) || 10), 0);
    let x = x0;
    items.forEach((item, index) => {
      const width = index === items.length - 1 ? x0 + totalW - x : ((Number(item.weight || item.area) || 10) / sum) * freeW;
      const entity = room(item.id, item.name, item.type, item.area, item.code, item.color);
      entity.plan = { floorId: 'floor-4', x, y, w: width, h, color: item.color };
      put(data.objects, entity);
      x += width + gap;
    });
  }

  clearFloor4Plan();

  const office = objectById('office-sota');
  if (office) {
    office.name = 'Офис СОТА, левое крыло';
    office.type = 'Офис';
    office.status = 'Заполнено';
    office.area = 'примерно 860 м2';
    office.description = 'Планировка по пользовательскому чертежу: вход слева, верхний ряд помещений, коридор, центральный блок, коридор, нижний ряд помещений.';
    office.plan = { floorId: 'floor-4', x: 2, y: 8, w: 96, h: 82, color: '#f7fafc' };
  }

  const floor = objectById('floor-4');
  if (floor) {
    floor.status = 'Заполнено';
    floor.area = '2 250 м2';
  }

  state.planContentBase = { w: 2800, h: 760 };
  state.planCanvas = { ...(state.planCanvas || {}), w: 3000, h: 860, x: 0, y: 0 };
  state.planViewport = { ...(state.planViewport || {}), w: 1880, h: 820 };
  state.planZoom = 1;

  put(data.objects, {
    id: 'sota-entrance-left',
    parentId: 'office-sota',
    name: 'Вход в офис',
    type: 'Зона',
    code: 'SOTA-ENTRY',
    status: 'Заполнено',
    area: 'входная зона',
    plan: { floorId: 'floor-4', x: 2.6, y: 43, w: 2.1, h: 10, color: '#eef3f8' }
  });

  drawRow([
    { id: 'sota-top-dispatch', name: 'Диспетчеризация', type: 'Помещение', area: 27.9, code: 'SOTA-TOP-001', color: '#e8f0f7' },
    { id: 'sota-top-os-01', name: 'ОС 49.9', type: 'Помещение', area: 49.9, code: 'SOTA-TOP-002', color: '#eef6f1' },
    { id: 'sota-top-cab-01', name: 'Кабинет 12.1', type: 'Кабинет', area: 12.1, code: 'SOTA-TOP-003', color: '#ffffff' },
    { id: 'sota-top-os-02', name: 'ОС 24.5', type: 'Помещение', area: 24.5, code: 'SOTA-TOP-004', color: '#eef6f1' },
    { id: 'sota-top-os-03', name: 'ОС 30.3', type: 'Помещение', area: 30.3, code: 'SOTA-TOP-005', color: '#eef6f1' },
    { id: 'sota-top-os-04', name: 'ОС 15.9', type: 'Помещение', area: 15.9, code: 'SOTA-TOP-006', color: '#eef6f1' },
    { id: 'sota-top-evac-stairs', name: 'Эвак. лестница', type: 'Сервисное ядро', area: null, weight: 15, code: 'SOTA-TOP-007', color: '#eef3f8' },
    { id: 'sota-top-cab-02', name: 'Кабинет 21.9', type: 'Кабинет', area: 21.9, code: 'SOTA-TOP-008', color: '#ffffff' },
    { id: 'sota-top-cab-03', name: 'Кабинет 12.6', type: 'Кабинет', area: 12.6, code: 'SOTA-TOP-009', color: '#ffffff' },
    { id: 'sota-top-cab-04', name: 'Кабинет 12.9', type: 'Кабинет', area: 12.9, code: 'SOTA-TOP-010', color: '#ffffff' },
    { id: 'sota-top-cab-05', name: 'Кабинет 12.1', type: 'Кабинет', area: 12.1, code: 'SOTA-TOP-011', color: '#ffffff' },
    { id: 'sota-top-cab-06', name: 'Кабинет 12.2', type: 'Кабинет', area: 12.2, code: 'SOTA-TOP-012', color: '#ffffff' },
    { id: 'sota-top-cab-07', name: 'Кабинет 12.9', type: 'Кабинет', area: 12.9, code: 'SOTA-TOP-013', color: '#ffffff' },
    { id: 'sota-top-cab-08', name: 'Кабинет 19.1', type: 'Кабинет', area: 19.1, code: 'SOTA-TOP-014', color: '#ffffff' }
  ], 12, 15.5);

  put(data.objects, {
    id: 'sota-corridor-upper',
    parentId: 'office-sota',
    name: 'Коридор верхний',
    type: 'Коридор',
    code: 'SOTA-COR-UP',
    status: 'Заполнено',
    area: 'проходная зона',
    plan: { floorId: 'floor-4', x: 5, y: 30, w: 91, h: 6, color: '#eef3f8' }
  });

  drawRow([
    { id: 'sota-mid-meeting-01', name: 'Перег. 13.1', type: 'Помещение', area: 13.1, code: 'SOTA-MID-001', color: '#e8f0f7' },
    { id: 'sota-mid-server', name: 'Серверная 6.9', type: 'Техническое помещение', area: 6.9, code: 'SOTA-MID-002', color: '#f3eef8' },
    { id: 'sota-mid-meeting-02', name: 'Перег. 13.1', type: 'Помещение', area: 13.1, code: 'SOTA-MID-003', color: '#e8f0f7' },
    { id: 'sota-mid-print', name: 'Печать 8.2', type: 'Техническое помещение', area: 8.2, code: 'SOTA-MID-004', color: '#f3eef8' },
    { id: 'sota-mid-wc-01', name: 'С/у 4.2', type: 'Помещение', area: 4.2, code: 'SOTA-MID-005', color: '#f3eef8' },
    { id: 'sota-mid-wc-02', name: 'С/у 8.6', type: 'Помещение', area: 8.6, code: 'SOTA-MID-006', color: '#f3eef8' },
    { id: 'sota-mid-tech-01', name: 'Тех. 5', type: 'Техническое помещение', area: 5, code: 'SOTA-MID-007', color: '#f3eef8' },
    { id: 'sota-mid-tech-02', name: 'Тех. 3.9', type: 'Техническое помещение', area: 3.9, code: 'SOTA-MID-008', color: '#f3eef8' },
    { id: 'sota-mid-kitchen', name: 'Кухня 32.1', type: 'Помещение', area: 32.1, code: 'SOTA-MID-009', color: '#fbf4e4' },
    { id: 'sota-mid-meeting-03', name: 'Перег. 2.7', type: 'Помещение', area: 2.7, weight: 4.5, code: 'SOTA-MID-010', color: '#e8f0f7' },
    { id: 'sota-mid-meeting-04', name: 'Перег. 2.7', type: 'Помещение', area: 2.7, weight: 4.5, code: 'SOTA-MID-011', color: '#e8f0f7' },
    { id: 'sota-mid-os-01', name: 'ОС 34.1', type: 'Помещение', area: 34.1, code: 'SOTA-MID-012', color: '#eef6f1' },
    { id: 'sota-mid-wc-03', name: 'С/у 2.5', type: 'Помещение', area: 2.5, weight: 4.2, code: 'SOTA-MID-013', color: '#f3eef8' },
    { id: 'sota-mid-wc-04', name: 'С/у 2.5', type: 'Помещение', area: 2.5, weight: 4.2, code: 'SOTA-MID-014', color: '#f3eef8' },
    { id: 'sota-mid-wc-05', name: 'С/у 3.7', type: 'Помещение', area: 3.7, weight: 4.5, code: 'SOTA-MID-015', color: '#f3eef8' },
    { id: 'sota-mid-wc-06', name: 'С/у 2.4', type: 'Помещение', area: 2.4, weight: 4.2, code: 'SOTA-MID-016', color: '#f3eef8' },
    { id: 'sota-mid-wc-07', name: 'С/у 2.4', type: 'Помещение', area: 2.4, weight: 4.2, code: 'SOTA-MID-017', color: '#f3eef8' },
    { id: 'sota-mid-meeting-05', name: 'Перег. 21.8', type: 'Помещение', area: 21.8, code: 'SOTA-MID-018', color: '#e8f0f7' },
    { id: 'sota-mid-reception', name: 'Ресепшн 47', type: 'Помещение', area: 47, code: 'SOTA-MID-019', color: '#eef3f8' },
    { id: 'sota-mid-cab-01', name: 'Кабинет 15', type: 'Кабинет', area: 15, code: 'SOTA-MID-020', color: '#ffffff' }
  ], 39, 15.5);

  put(data.objects, {
    id: 'sota-corridor-lower',
    parentId: 'office-sota',
    name: 'Коридор нижний',
    type: 'Коридор',
    code: 'SOTA-COR-DOWN',
    status: 'Заполнено',
    area: 'проходная зона',
    plan: { floorId: 'floor-4', x: 5, y: 57, w: 91, h: 6, color: '#eef3f8' }
  });

  drawRow([
    { id: 'sota-bottom-cab-01', name: 'Кабинет 29.1', type: 'Кабинет', area: 29.1, code: 'SOTA-BOT-001', color: '#ffffff' },
    { id: 'sota-bottom-cab-02', name: 'Кабинет 11.9', type: 'Кабинет', area: 11.9, code: 'SOTA-BOT-002', color: '#ffffff' },
    { id: 'sota-bottom-cab-03', name: 'Кабинет 12.9', type: 'Кабинет', area: 12.9, code: 'SOTA-BOT-003', color: '#ffffff' },
    { id: 'sota-bottom-cab-04', name: 'Кабинет 12.1', type: 'Кабинет', area: 12.1, code: 'SOTA-BOT-004', color: '#ffffff' },
    { id: 'sota-bottom-os-01', name: 'ОС 53.9', type: 'Помещение', area: 53.9, code: 'SOTA-BOT-005', color: '#eef6f1' },
    { id: 'sota-bottom-os-02', name: 'ОС 54.5', type: 'Помещение', area: 54.5, code: 'SOTA-BOT-006', color: '#eef6f1' },
    { id: 'sota-bottom-cab-05', name: 'Кабинет 11.5', type: 'Кабинет', area: 11.5, code: 'SOTA-BOT-007', color: '#ffffff' },
    { id: 'sota-bottom-os-03', name: 'ОС 37.3', type: 'Помещение', area: 37.3, code: 'SOTA-BOT-008', color: '#eef6f1' },
    { id: 'sota-bottom-os-04', name: 'ОС 24.6', type: 'Помещение', area: 24.6, code: 'SOTA-BOT-009', color: '#eef6f1' },
    { id: 'sota-bottom-cab-06', name: 'Кабинет 15.9', type: 'Кабинет', area: 15.9, code: 'SOTA-BOT-010', color: '#ffffff' },
    { id: 'sota-bottom-cab-07', name: 'Кабинет 18.2', type: 'Кабинет', area: 18.2, code: 'SOTA-BOT-011', color: '#ffffff' },
    { id: 'sota-bottom-cab-08', name: 'Кабинет 18.8', type: 'Кабинет', area: 18.8, code: 'SOTA-BOT-012', color: '#ffffff' },
    { id: 'sota-bottom-cab-09', name: 'Кабинет 17.7', type: 'Кабинет', area: 17.7, code: 'SOTA-BOT-013', color: '#ffffff' },
    { id: 'sota-bottom-cab-10', name: 'Кабинет 29.1', type: 'Кабинет', area: 29.1, code: 'SOTA-BOT-014', color: '#ffffff' }
  ], 66, 16);

  state.tab = 'objects';
  state.objectMode = 'plan';
  state.selectedFloorId = 'floor-4';
  state.selectedObjectId = 'office-sota';
  state.planSelectedId = 'office-sota';
  state.planParentWarning = null;

  render();
})();
