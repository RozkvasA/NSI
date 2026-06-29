(function () {
  function put(list, item) {
    const index = list.findIndex(existing => existing.id === item.id);
    if (index >= 0) list[index] = { ...list[index], ...item };
    else list.push(item);
  }

  function dictPush(key, value) {
    if (dictionaries[key] && !dictionaries[key].includes(value)) dictionaries[key].push(value);
  }

  ['Офисный блок', 'Кабинет', 'Переговорная', 'Open space', 'Коридор', 'Сервисное ядро'].forEach(type => dictPush('objectTypes', type));
  ['Видеонаблюдение', 'Вентиляция', 'Водоснабжение', 'Канализация', 'Отопление'].forEach(type => dictPush('systemTypes', type));
  ['Камера', 'Вентилятор', 'Приточная установка', 'Насос', 'Тепловой узел', 'Экран переговорной', 'Контроллер доступа'].forEach(type => dictPush('equipmentTypes', type));

  put(data.objects, {
    id: 'bc-lucky',
    name: 'БЦ Lucky',
    type: 'БЦ',
    code: 'LUCKY-2ZV-12',
    status: 'Заполнено',
    owner: 'УК Lucky',
    area: '5 335 м2 коммерческие помещения',
    purpose: 'Офисы и коммерческие помещения в квартале Lucky',
    description: 'Москва, 2-я Звенигородская ул., 12. Паспорт демо-объекта собран по открытым данным: участок 4,43 га, общая площадь квартала 142 993 м2, коммерческие помещения 5 335 м2.'
  });

  [2, 3, 5, 6].forEach(floor => {
    put(data.objects, {
      id: `floor-${floor}`,
      parentId: 'bc-lucky',
      name: `${floor} этаж`,
      type: 'Этаж',
      code: `FL-${String(floor).padStart(3, '0')}`,
      status: 'Частично заполнено',
      area: '1 120 м2'
    });
  });

  function addTypicalFloor(floor) {
    const parentId = `floor-${floor}`;
    const base = [
      ['left', `Левое крыло ${floor} этажа`, 'Офисный блок', 5, 10, 39, 72, '520 м2'],
      ['right', `Правое крыло ${floor} этажа`, 'Офисный блок', 56, 10, 38, 72, '470 м2'],
      ['corridor', `Центральный коридор ${floor} этажа`, 'Коридор', 45, 10, 9, 72, '95 м2'],
      ['core', `Сервисное ядро ${floor} этажа`, 'Сервисное ядро', 42, 39, 16, 17, '70 м2'],
      ['wc', `Санузлы ${floor} этажа`, 'Помещение', 42, 59, 16, 10, '34 м2'],
      ['tech', `Техническая ${floor} этажа`, 'Техническое помещение', 42, 72, 16, 10, '28 м2']
    ];
    base.forEach(([suffix, name, type, x, y, w, h, area]) => put(data.objects, {
      id: `floor-${floor}-${suffix}`,
      parentId,
      name,
      type,
      code: `FL${floor}-${suffix.toUpperCase()}`,
      status: suffix === 'left' || suffix === 'right' ? 'Требует данных' : 'Частично заполнено',
      area,
      plan: { floorId: parentId, x, y, w, h, color: suffix === 'corridor' ? '#eef3f8' : '#ffffff' }
    }));
  }

  [-1, 1, 2, 3, 5, 6, 7].forEach(floor => {
    if (floor > 1 && floor < 7) addTypicalFloor(floor);
  });

  put(data.objects, {
    id: 'office-sota',
    parentId: 'floor-4',
    name: 'Офис СОТА, левое крыло',
    type: 'Офис',
    code: 'SOTA-FL4-LW',
    status: 'Заполнено',
    area: '640 м2',
    purpose: 'Левое крыло 4 этажа: 10 кабинетов, 6 open space, 5 переговорок'
  });

  put(data.objects, { id: 'floor-4-right-wing', parentId: 'floor-4', name: 'Правое крыло 4 этажа', type: 'Офисный блок', code: 'FL4-RW', status: 'Требует данных', area: '420 м2', plan: { floorId: 'floor-4', x: 56, y: 10, w: 38, h: 54, color: '#ffffff' } });
  put(data.objects, { id: 'floor-4-core', parentId: 'floor-4', name: 'Сервисное ядро 4 этажа', type: 'Сервисное ядро', code: 'FL4-CORE', status: 'Частично заполнено', area: '76 м2', plan: { floorId: 'floor-4', x: 50, y: 34, w: 7, h: 18, color: '#eef3f8' } });
  put(data.objects, { id: 'mop-4', parentId: 'floor-4', name: 'МОП 4 этажа', type: 'Зона', code: 'MOP-004', status: 'Частично заполнено', area: '160 м2', plan: { floorId: 'floor-4', x: 56, y: 68, w: 38, h: 16, color: '#eef3f8' } });
  put(data.objects, { id: 'corridor-4', parentId: 'office-sota', name: 'Коридор левого крыла СОТА', type: 'Коридор', code: 'SOTA-COR', status: 'Частично заполнено', area: '62 м2', plan: { floorId: 'floor-4', x: 5, y: 88, w: 44, h: 7, color: '#eef3f8' } });
  put(data.objects, { id: 'room-server', parentId: 'office-sota', name: 'Серверная СОТА', type: 'Техническое помещение', code: 'SOTA-SRV', status: 'Частично заполнено', area: '24 м2', plan: { floorId: 'floor-4', x: 50, y: 10, w: 6, h: 11, color: '#f3eef8' } });
  put(data.objects, { id: 'room-kitchen', parentId: 'office-sota', name: 'Кухня СОТА', type: 'Помещение', code: 'SOTA-KIT', status: 'Частично заполнено', area: '28 м2', plan: { floorId: 'floor-4', x: 50, y: 23, w: 6, h: 9, color: '#fbf4e4' } });

  const openSpaces = [
    ['room-open-space', 'Open space 1', 5, 9],
    ['sota-open-2', 'Open space 2', 20, 9],
    ['sota-open-3', 'Open space 3', 35, 9],
    ['sota-open-4', 'Open space 4', 5, 25],
    ['sota-open-5', 'Open space 5', 20, 25],
    ['sota-open-6', 'Open space 6', 35, 25]
  ];
  openSpaces.forEach(([id, name, x, y], index) => put(data.objects, {
    id,
    parentId: 'office-sota',
    name,
    type: 'Open space',
    code: `SOTA-OS-${String(index + 1).padStart(2, '0')}`,
    status: 'Заполнено',
    area: '44 м2',
    plan: { floorId: 'floor-4', x, y, w: 14, h: 13, color: '#eef6f1' }
  }));

  for (let i = 1; i <= 10; i++) {
    const col = (i - 1) % 5;
    const row = Math.floor((i - 1) / 5);
    put(data.objects, {
      id: `sota-cabinet-${String(i).padStart(2, '0')}`,
      parentId: 'office-sota',
      name: `Кабинет СОТА ${String(i).padStart(2, '0')}`,
      type: 'Кабинет',
      code: `SOTA-CAB-${String(i).padStart(2, '0')}`,
      status: i <= 6 ? 'Частично заполнено' : 'Требует данных',
      area: '14 м2',
      plan: { floorId: 'floor-4', x: 5 + col * 9, y: 43 + row * 10, w: 8, h: 8, color: '#ffffff' }
    });
  }

  const meetings = [
    ['room-meeting', 'Переговорная СОТА 1', 5, 65],
    ['sota-meeting-2', 'Переговорная СОТА 2', 18, 65],
    ['sota-meeting-3', 'Переговорная СОТА 3', 31, 65],
    ['sota-meeting-4', 'Переговорная СОТА 4', 5, 77],
    ['sota-meeting-5', 'Переговорная СОТА 5', 18, 77]
  ];
  meetings.forEach(([id, name, x, y], index) => put(data.objects, {
    id,
    parentId: 'office-sota',
    name,
    type: 'Переговорная',
    code: `SOTA-MTG-${String(index + 1).padStart(2, '0')}`,
    status: 'Частично заполнено',
    area: '20 м2',
    plan: { floorId: 'floor-4', x, y, w: 12, h: 10, color: '#e8f0f7' }
  }));

  [
    { id: 'sys-sota-office-light', parentId: 'sys-light-sota', locationId: 'office-sota', name: 'Освещение рабочих зон СОТА', type: 'Освещение', status: 'Частично заполнено', scope: 'Кабинеты, open space и переговорные левого крыла', criticality: 'Низкая', owner: 'Главный энергетик' },
    { id: 'sys-sota-meeting-av', parentId: null, locationId: 'office-sota', name: 'AV переговорных СОТА', type: 'СКС', status: 'Требует данных', scope: '5 переговорных СОТА', criticality: 'Средняя', owner: 'IT-инженер' },
    { id: 'sys-sota-access', parentId: 'sys-access', locationId: 'office-sota', name: 'СКУД Офиса СОТА', type: 'СКУД', status: 'Частично заполнено', scope: 'Входы, серверная, кабинеты руководителей', criticality: 'Средняя', owner: 'Служба безопасности' },
    { id: 'sys-floor-typical-vent', parentId: 'sys-vent', locationId: 'bc-lucky', name: 'Типовая вентиляция офисных этажей', type: 'Вентиляция', status: 'Частично заполнено', scope: '2, 3, 5, 6 этажи', criticality: 'Средняя', owner: 'Инженер ОВиК' }
  ].forEach(item => put(data.systems, item));

  openSpaces.forEach(([id, name], index) => {
    const n = index + 1;
    put(data.equipment, { id: `eq-ac-sota-os-${n}`, parentId: 'eq-ac-open-group', systemId: 'sys-ac-sota', locationId: id, name: `Внутренний блок ${name}`, level: 'Конкретная единица', type: 'Внутренний блок', qty: 1, unit: 'шт', code: `AC-SOTA-OS-${String(n).padStart(3, '0')}`, status: 'Заполнено', manufacturer: 'Daichi' });
    put(data.equipment, { id: `eq-ap-sota-os-${n}`, parentId: null, systemId: 'sys-scs-sota', locationId: id, name: `Точка доступа ${name}`, level: 'Конкретная единица', type: 'Точка доступа', qty: 1, unit: 'шт', code: `AP-SOTA-OS-${String(n).padStart(3, '0')}`, status: 'Частично заполнено' });
  });

  meetings.forEach(([id, name], index) => {
    const n = index + 1;
    put(data.equipment, { id: `eq-screen-mtg-${n}`, parentId: null, systemId: 'sys-sota-meeting-av', locationId: id, name: `Экран ${name}`, level: 'Конкретная единица', type: 'Экран переговорной', qty: 1, unit: 'шт', code: `AV-MTG-${String(n).padStart(3, '0')}`, status: 'Требует данных' });
  });

  for (let i = 1; i <= 10; i++) {
    const locationId = `sota-cabinet-${String(i).padStart(2, '0')}`;
    put(data.equipment, { id: `eq-lock-cab-${String(i).padStart(2, '0')}`, parentId: null, systemId: 'sys-sota-access', locationId, name: `Контроллер доступа кабинет ${String(i).padStart(2, '0')}`, level: 'Конкретная единица', type: 'Контроллер доступа', qty: 1, unit: 'шт', code: `ACS-CAB-${String(i).padStart(3, '0')}`, status: i <= 4 ? 'Частично заполнено' : 'Требует данных' });
  }

  const linkedTargets = [...openSpaces.map(item => ['object', item[0], item[1]]), ...meetings.map(item => ['object', item[0], item[1]])];
  linkedTargets.forEach(([entityType, entityId, label], index) => {
    put(data.techCards, { id: `tc-lucky-sota-room-${entityId}`, entityType, entityId, name: `Осмотр: ${label}`, workType: 'Осмотр', periodicity: 'Еженедельно', status: index % 3 === 0 ? 'Требует заполнения' : 'Частично заполнено', goal: `Проверка помещения ${label} и связанных инженерных систем.` });
  });

  state.selectedFloorId = 'floor-4';
  state.selectedObjectId = 'office-sota';
  state.planSelectedId = 'room-open-space';
  render();
})();
