(function () {
  function put(list, item) {
    const index = list.findIndex(existing => existing.id === item.id);
    if (index >= 0) list[index] = { ...list[index], ...item };
    else list.push(item);
  }

  function place(id, name, type, area, code, x, y, w, h, color) {
    put(data.objects, {
      id,
      parentId: 'office-sota',
      name,
      type,
      code,
      status: 'Заполнено',
      area: area ? `${area} м2` : 'уточнить',
      plan: { floorId: 'floor-4', x, y, w, h, color }
    });
  }

  data.objects.forEach(item => {
    if (item.plan && item.plan.floorId === 'floor-4') delete item.plan;
  });

  const office = objectById('office-sota');
  if (office) {
    office.name = 'Офис СОТА, левое крыло';
    office.type = 'Офис';
    office.status = 'Заполнено';
    office.area = 'примерно 860 м2';
    office.description = 'Планировка по скриншоту пользователя: вход слева, верхний ряд, верхний коридор, центральный блок, нижний коридор и нижний ряд.';
    office.plan = { floorId: 'floor-4', x: 1.2, y: 3.5, w: 97.2, h: 92.5, color: '#f7fafc' };
  }

  state.planContentBase = { w: 2920, h: 760 };
  state.planCanvas = { ...(state.planCanvas || {}), w: 3150, h: 880, x: 0, y: 0 };
  state.planViewport = { ...(state.planViewport || {}), w: 1880, h: 820 };
  state.planZoom = 1;

  place('sota-top-dispatch', 'Диспетчеризация', 'Помещение', 27.9, 'SOTA-TOP-001', 6.4, 5.0, 10.8, 21.0, '#e8f0f7');
  place('sota-top-os-01', 'ОС 49.9', 'Помещение', 49.9, 'SOTA-TOP-002', 17.9, 4.7, 9.0, 21.3, '#eef6f1');
  place('sota-top-cab-01', 'Кабинет 12.1', 'Кабинет', 12.1, 'SOTA-TOP-003', 27.3, 4.7, 4.7, 21.3, '#ffffff');
  place('sota-top-os-02', 'ОС 24.5', 'Помещение', 24.5, 'SOTA-TOP-004', 32.4, 4.7, 4.2, 21.3, '#eef6f1');
  place('sota-top-os-03', 'ОС 30.3', 'Помещение', 30.3, 'SOTA-TOP-005', 36.9, 4.7, 8.6, 21.3, '#eef6f1');
  place('sota-top-os-04', 'ОС 15.9', 'Помещение', 15.9, 'SOTA-TOP-006', 45.8, 4.7, 5.8, 21.3, '#eef6f1');
  place('sota-top-evac-stairs', 'Эвак. лестница', 'Сервисное ядро', null, 'SOTA-TOP-007', 52.0, 4.7, 13.4, 21.3, '#eef3f8');
  place('sota-top-cab-02', 'Кабинет 21.9', 'Кабинет', 21.9, 'SOTA-TOP-008', 65.6, 4.7, 4.9, 21.3, '#ffffff');
  place('sota-top-cab-03', 'Кабинет 12.6', 'Кабинет', 12.6, 'SOTA-TOP-009', 70.8, 4.7, 3.8, 21.3, '#ffffff');
  place('sota-top-cab-04', 'Кабинет 12.9', 'Кабинет', 12.9, 'SOTA-TOP-010', 74.9, 4.7, 3.8, 21.3, '#ffffff');
  place('sota-top-cab-05', 'Кабинет 12.1', 'Кабинет', 12.1, 'SOTA-TOP-011', 79.0, 4.7, 3.8, 21.3, '#ffffff');
  place('sota-top-cab-06', 'Кабинет 12.2', 'Кабинет', 12.2, 'SOTA-TOP-012', 83.1, 4.7, 3.8, 21.3, '#ffffff');
  place('sota-top-cab-07', 'Кабинет 12.9', 'Кабинет', 12.9, 'SOTA-TOP-013', 87.2, 4.7, 4.0, 21.3, '#ffffff');
  place('sota-top-cab-08', 'Кабинет 19.1', 'Кабинет', 19.1, 'SOTA-TOP-014', 91.5, 4.7, 6.7, 21.3, '#ffffff');

  place('sota-corridor-upper', 'Коридор верхний', 'Коридор', null, 'SOTA-COR-UP', 6.3, 27.7, 91.8, 7.8, '#eef3f8');
  place('sota-entrance-left', 'Вход в офис', 'Зона', null, 'SOTA-ENTRY', 6.0, 42.8, 2.4, 13.0, '#eef3f8');

  place('sota-mid-meeting-01', 'Перег. 13.1', 'Помещение', 13.1, 'SOTA-MID-001', 15.2, 38.6, 5.9, 22.0, '#e8f0f7');
  place('sota-mid-server', 'Серверная 6.9', 'Техническое помещение', 6.9, 'SOTA-MID-002', 21.6, 38.6, 3.0, 22.0, '#f3eef8');
  place('sota-mid-meeting-02', 'Перег. 13.1', 'Помещение', 13.1, 'SOTA-MID-003', 24.9, 38.6, 5.9, 22.0, '#e8f0f7');
  place('sota-mid-print', 'Печать 8.2', 'Техническое помещение', 8.2, 'SOTA-MID-004', 31.1, 38.6, 3.3, 22.0, '#f3eef8');
  place('sota-mid-wc-02', 'С/у 8.6', 'Помещение', 8.6, 'SOTA-MID-006', 39.5, 38.9, 5.0, 10.6, '#f3eef8');
  place('sota-mid-wc-01', 'С/у 4.2', 'Помещение', 4.2, 'SOTA-MID-005', 39.5, 50.0, 5.0, 10.6, '#f3eef8');
  place('sota-mid-tech-01', 'Тех. 5', 'Техническое помещение', 5, 'SOTA-MID-007', 45.0, 38.9, 4.5, 10.6, '#f3eef8');
  place('sota-mid-tech-02', 'Тех. 3.9', 'Техническое помещение', 3.9, 'SOTA-MID-008', 45.0, 50.0, 4.5, 10.6, '#f3eef8');
  place('sota-mid-kitchen', 'Кухня 32.1', 'Помещение', 32.1, 'SOTA-MID-009', 50.1, 38.2, 10.5, 23.0, '#fbf4e4');
  place('sota-mid-meeting-03', 'Перег. 2.7', 'Помещение', 2.7, 'SOTA-MID-010', 60.8, 38.2, 3.6, 10.9, '#e8f0f7');
  place('sota-mid-meeting-04', 'Перег. 2.7', 'Помещение', 2.7, 'SOTA-MID-011', 60.8, 49.8, 3.6, 10.9, '#e8f0f7');
  place('sota-mid-os-01', 'ОС 34.1', 'Помещение', 34.1, 'SOTA-MID-012', 65.8, 38.2, 5.1, 23.0, '#eef6f1');
  place('sota-mid-wc-03', 'С/у 2.5', 'Помещение', 2.5, 'SOTA-MID-013', 71.4, 38.2, 3.6, 6.5, '#f3eef8');
  place('sota-mid-wc-04', 'С/у 2.5', 'Помещение', 2.5, 'SOTA-MID-014', 71.4, 45.5, 3.6, 6.5, '#f3eef8');
  place('sota-mid-wc-05', 'С/у 3.7', 'Помещение', 3.7, 'SOTA-MID-015', 75.2, 38.2, 3.8, 10.2, '#f3eef8');
  place('sota-mid-wc-06', 'С/у 2.4', 'Помещение', 2.4, 'SOTA-MID-016', 71.4, 52.8, 3.6, 6.5, '#f3eef8');
  place('sota-mid-wc-07', 'С/у 2.4', 'Помещение', 2.4, 'SOTA-MID-017', 75.2, 49.2, 3.8, 10.2, '#f3eef8');
  place('sota-mid-meeting-05', 'Перег. 21.8', 'Помещение', 21.8, 'SOTA-MID-018', 79.4, 37.9, 9.5, 23.3, '#e8f0f7');
  place('sota-mid-reception', 'Ресепшн 47', 'Помещение', 47, 'SOTA-MID-019', 89.1, 37.9, 4.0, 23.3, '#eef3f8');
  place('sota-mid-cab-01', 'Кабинет 15', 'Кабинет', 15, 'SOTA-MID-020', 93.4, 37.9, 4.8, 23.3, '#ffffff');

  place('sota-corridor-lower', 'Коридор нижний', 'Коридор', null, 'SOTA-COR-DOWN', 5.8, 64.2, 92.4, 7.8, '#eef3f8');

  place('sota-bottom-cab-01', 'Кабинет 29.1', 'Кабинет', 29.1, 'SOTA-BOT-001', 0.8, 59.4, 5.8, 34.8, '#ffffff');
  place('sota-bottom-cab-02', 'Кабинет 11.9', 'Кабинет', 11.9, 'SOTA-BOT-002', 6.8, 72.8, 4.0, 21.5, '#ffffff');
  place('sota-bottom-cab-03', 'Кабинет 12.9', 'Кабинет', 12.9, 'SOTA-BOT-003', 11.2, 72.8, 4.8, 21.5, '#ffffff');
  place('sota-bottom-cab-04', 'Кабинет 12.1', 'Кабинет', 12.1, 'SOTA-BOT-004', 16.2, 72.8, 4.8, 21.5, '#ffffff');
  place('sota-bottom-os-01', 'ОС 53.9', 'Помещение', 53.9, 'SOTA-BOT-005', 21.2, 72.8, 14.3, 21.5, '#eef6f1');
  place('sota-bottom-os-02', 'ОС 54.5', 'Помещение', 54.5, 'SOTA-BOT-006', 35.7, 72.8, 14.0, 21.5, '#eef6f1');
  place('sota-bottom-cab-05', 'Кабинет 11.5', 'Кабинет', 11.5, 'SOTA-BOT-007', 50.0, 72.8, 3.6, 21.5, '#ffffff');
  place('sota-bottom-os-03', 'ОС 37.3', 'Помещение', 37.3, 'SOTA-BOT-008', 53.9, 72.8, 6.2, 21.5, '#eef6f1');
  place('sota-bottom-os-04', 'ОС 24.6', 'Помещение', 24.6, 'SOTA-BOT-009', 60.3, 72.8, 6.4, 21.5, '#eef6f1');
  place('sota-bottom-cab-06', 'Кабинет 15.9', 'Кабинет', 15.9, 'SOTA-BOT-010', 67.0, 72.8, 4.7, 21.5, '#ffffff');
  place('sota-bottom-cab-07', 'Кабинет 18.2', 'Кабинет', 18.2, 'SOTA-BOT-011', 71.9, 72.8, 5.5, 21.5, '#ffffff');
  place('sota-bottom-cab-08', 'Кабинет 18.8', 'Кабинет', 18.8, 'SOTA-BOT-012', 77.7, 72.8, 5.6, 21.5, '#ffffff');
  place('sota-bottom-cab-09', 'Кабинет 17.7', 'Кабинет', 17.7, 'SOTA-BOT-013', 83.6, 72.8, 5.4, 21.5, '#ffffff');
  place('sota-bottom-cab-10', 'Кабинет 29.1', 'Кабинет', 29.1, 'SOTA-BOT-014', 89.3, 72.8, 8.9, 21.5, '#ffffff');

  state.tab = 'objects';
  state.objectMode = 'plan';
  state.selectedFloorId = 'floor-4';
  state.selectedObjectId = 'office-sota';
  state.planSelectedId = 'office-sota';
  state.planParentWarning = null;

  render();
})();
