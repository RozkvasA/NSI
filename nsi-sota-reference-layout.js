(function () {
  function put(list, item) {
    const index = list.findIndex(existing => existing.id === item.id);
    if (index >= 0) list[index] = { ...list[index], ...item };
    else list.push(item);
  }

  function setPlan(id, x, y, w, h, color) {
    const item = objectById(id);
    if (!item) return;
    item.parentId = item.parentId || 'office-sota';
    item.plan = { floorId: 'floor-4', x, y, w, h, color };
  }

  function ensureRoom(id, name, type, code, area, x, y, w, h, color) {
    put(data.objects, {
      id,
      parentId: 'office-sota',
      name,
      type,
      code,
      status: 'Частично заполнено',
      area,
      plan: { floorId: 'floor-4', x, y, w, h, color }
    });
  }

  const office = objectById('office-sota');
  if (office) {
    office.name = 'Офис СОТА, левое крыло';
    office.area = '640 м2';
    office.description = 'Демо-планировка по референсу: вытянутый горизонтальный офис, верхняя и нижняя линии помещений, центральный коридор, переговорки и сервисные зоны.';
    office.plan = { floorId: 'floor-4', x: 3, y: 16, w: 94, h: 66, color: '#f7fafc' };
  }

  if (state.planCanvas) {
    state.planCanvas.w = 1780;
    state.planCanvas.h = 720;
    state.planCanvas.x = 0;
    state.planCanvas.y = 0;
  }

  setPlan('floor-4-right-wing', 77, 84, 20, 9, '#ffffff');
  setPlan('floor-4-core', 48, 16, 9, 22, '#eef3f8');
  setPlan('mop-4', 45, 40, 10, 10, '#eef3f8');

  ensureRoom('sota-lift-core', 'Лифты', 'Сервисное ядро', 'SOTA-LIFT', '46 м2', 4, 20, 7, 24, '#eef3f8');
  ensureRoom('sota-stair-core', 'Лестница', 'Сервисное ядро', 'SOTA-STAIR', '38 м2', 47, 18, 8, 18, '#eef3f8');
  ensureRoom('sota-wc-core', 'Санузлы', 'Помещение', 'SOTA-WC', '36 м2', 56, 40, 8, 10, '#f3eef8');
  ensureRoom('sota-service-1', 'Сервис', 'Техническое помещение', 'SOTA-SRV-ZONE', '24 м2', 65, 40, 7, 10, '#f3eef8');

  [
    'room-open-space', 'sota-open-2', 'sota-open-3', 'sota-open-4', 'sota-open-5', 'sota-open-6',
    'sota-cabinet-01', 'sota-cabinet-02', 'sota-cabinet-03', 'sota-cabinet-04', 'sota-cabinet-05',
    'sota-cabinet-06', 'sota-cabinet-07', 'sota-cabinet-08', 'sota-cabinet-09', 'sota-cabinet-10',
    'room-meeting', 'sota-meeting-2', 'sota-meeting-3', 'sota-meeting-4', 'sota-meeting-5',
    'room-kitchen', 'room-server', 'corridor-4', 'sota-lift-core', 'sota-stair-core', 'sota-wc-core', 'sota-service-1'
  ].forEach(id => {
    const item = objectById(id);
    if (item) item.parentId = 'office-sota';
  });

  setPlan('sota-cabinet-01', 12, 20, 6, 12, '#ffffff');
  setPlan('room-open-space', 19, 20, 8, 12, '#eef6f1');
  setPlan('sota-cabinet-05', 28, 20, 6, 12, '#ffffff');
  setPlan('sota-open-2', 35, 20, 10, 12, '#eef6f1');
  setPlan('sota-cabinet-02', 58, 20, 6, 12, '#ffffff');
  setPlan('sota-open-3', 65, 20, 9, 12, '#eef6f1');
  setPlan('sota-cabinet-09', 75, 20, 6, 12, '#ffffff');
  setPlan('sota-cabinet-10', 82, 20, 6, 12, '#ffffff');
  setPlan('sota-cabinet-04', 89, 20, 6, 12, '#ffffff');

  setPlan('sota-cabinet-03', 4, 66, 6, 11, '#ffffff');
  setPlan('sota-cabinet-07', 11, 66, 6, 11, '#ffffff');
  setPlan('sota-open-5', 18, 63, 11, 14, '#eef6f1');
  setPlan('sota-cabinet-06', 30, 66, 6, 11, '#ffffff');
  setPlan('sota-open-6', 37, 63, 10, 14, '#eef6f1');
  setPlan('sota-cabinet-08', 48, 66, 6, 11, '#ffffff');
  setPlan('sota-open-4', 55, 63, 11, 14, '#eef6f1');
  setPlan('room-server', 67, 66, 6, 11, '#f3eef8');
  setPlan('room-kitchen', 74, 66, 8, 11, '#fbf4e4');
  setPlan('room-meeting', 83, 66, 12, 11, '#e8f0f7');

  setPlan('corridor-4', 10, 45, 84, 8, '#eef3f8');
  setPlan('sota-meeting-2', 18, 37, 10, 8, '#e8f0f7');
  setPlan('sota-meeting-3', 30, 37, 10, 8, '#e8f0f7');
  setPlan('sota-meeting-4', 74, 37, 10, 8, '#e8f0f7');
  setPlan('sota-meeting-5', 85, 37, 9, 8, '#e8f0f7');

  ensureRoom('sota-focus-1', 'Фокус 1', 'Кабинет', 'SOTA-FOCUS-01', '8 м2', 12, 35, 5, 9, '#ffffff');
  ensureRoom('sota-focus-2', 'Фокус 2', 'Кабинет', 'SOTA-FOCUS-02', '8 м2', 42, 35, 5, 9, '#ffffff');
  ensureRoom('sota-focus-3', 'Фокус 3', 'Кабинет', 'SOTA-FOCUS-03', '8 м2', 58, 35, 5, 9, '#ffffff');
  ensureRoom('sota-print', 'Печать', 'Техническое помещение', 'SOTA-PRINT', '10 м2', 65, 53, 7, 8, '#f3eef8');
  ensureRoom('sota-storage', 'Склад', 'Техническое помещение', 'SOTA-STORAGE', '12 м2', 74, 53, 8, 8, '#f3eef8');

  state.selectedFloorId = 'floor-4';
  state.selectedObjectId = 'office-sota';
  state.planSelectedId = 'office-sota';
  state.planParentWarning = null;
  render();
})();
