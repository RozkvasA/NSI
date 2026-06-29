(function () {
  function put(list, item) {
    const index = list.findIndex(existing => existing.id === item.id);
    if (index >= 0) list[index] = { ...list[index], ...item };
    else list.push(item);
  }

  function addPlanData() {
    const plannedObjects = [
      { id: 'parking-a', plan: { floorId: 'floor--1', x: 5, y: 12, w: 56, h: 58 } },
      { id: 'pump-room', plan: { floorId: 'floor--1', x: 66, y: 12, w: 27, h: 21 } },
      { id: 'itp', plan: { floorId: 'floor--1', x: 66, y: 38, w: 27, h: 24 } },
      { id: 'corridor--1', parentId: 'floor--1', name: 'Технический коридор', type: 'Зона', code: 'COR--001', status: 'Частично заполнено', area: '180 м2', plan: { floorId: 'floor--1', x: 5, y: 75, w: 88, h: 12 } },
      { id: 'service-store--1', parentId: 'floor--1', name: 'Сервисная зона', type: 'Техническое помещение', code: 'SRV--001', status: 'Требует данных', area: '72 м2', plan: { floorId: 'floor--1', x: 36, y: 12, w: 25, h: 20 } },

      { id: 'lobby', plan: { floorId: 'floor-1', x: 5, y: 10, w: 36, h: 46 } },
      { id: 'guard-post', plan: { floorId: 'floor-1', x: 45, y: 10, w: 16, h: 18 } },
      { id: 'hall-1', parentId: 'floor-1', name: 'Холл 1 этажа', type: 'Зона', code: 'HALL-001', status: 'Частично заполнено', area: '210 м2', plan: { floorId: 'floor-1', x: 45, y: 34, w: 48, h: 22 } },
      { id: 'waiting-1', parentId: 'floor-1', name: 'Зона ожидания', type: 'Зона', code: 'WAIT-001', status: 'Требует данных', area: '64 м2', plan: { floorId: 'floor-1', x: 5, y: 64, w: 24, h: 22 } },
      { id: 'wc-1', parentId: 'floor-1', name: 'Санузел 1 этажа', type: 'Помещение', code: 'WC-001', status: 'Требует данных', area: '34 м2', plan: { floorId: 'floor-1', x: 33, y: 64, w: 16, h: 22 } },
      { id: 'tech-1', parentId: 'floor-1', name: 'Техническое помещение 1 этажа', type: 'Техническое помещение', code: 'TECH-001', status: 'Частично заполнено', area: '52 м2', plan: { floorId: 'floor-1', x: 53, y: 64, w: 40, h: 22 } },

      { id: 'room-open-space', plan: { floorId: 'floor-4', x: 5, y: 10, w: 45, h: 48 } },
      { id: 'room-server', plan: { floorId: 'floor-4', x: 55, y: 10, w: 17, h: 20 } },
      { id: 'room-meeting', plan: { floorId: 'floor-4', x: 76, y: 10, w: 18, h: 20 } },
      { id: 'room-kitchen', plan: { floorId: 'floor-4', x: 76, y: 36, w: 18, h: 20 } },
      { id: 'mop-4', plan: { floorId: 'floor-4', x: 55, y: 62, w: 39, h: 22 } },
      { id: 'corridor-4', parentId: 'office-sota', name: 'Коридор офиса СОТА', type: 'Зона', code: 'SOTA-COR', status: 'Частично заполнено', area: '84 м2', plan: { floorId: 'floor-4', x: 5, y: 64, w: 45, h: 20 } },

      { id: 'roof', plan: { floorId: 'floor-7', x: 5, y: 9, w: 54, h: 74 } },
      { id: 'vent-chamber', plan: { floorId: 'floor-7', x: 64, y: 9, w: 29, h: 26 } },
      { id: 'tech-7', parentId: 'floor-7', name: 'Техническая зона 7 этажа', type: 'Техническое помещение', code: 'TECH-007', status: 'Частично заполнено', area: '170 м2', plan: { floorId: 'floor-7', x: 64, y: 41, w: 29, h: 22 } },
      { id: 'service-access-7', parentId: 'floor-7', name: 'Сервисный доступ', type: 'Зона', code: 'ACCESS-007', status: 'Требует данных', area: '96 м2', plan: { floorId: 'floor-7', x: 64, y: 69, w: 29, h: 14 } }
    ];
    plannedObjects.forEach(item => put(data.objects, item));
  }

  function addSystemsAndEquipment() {
    [
      { id: 'sys-cctv', parentId: null, locationId: 'bc-lucky', name: 'Видеонаблюдение здания', type: 'СКУД', status: 'Частично заполнено', scope: 'Периметр, лобби, паркинг, МОП', criticality: 'Средняя', owner: 'Служба безопасности' },
      { id: 'sys-vent', parentId: null, locationId: 'bc-lucky', name: 'Вентиляция здания', type: 'Вентиляция', status: 'Частично заполнено', scope: 'Все этажи и технические зоны', criticality: 'Высокая', owner: 'Инженер ОВиК' },
      { id: 'sys-water', parentId: null, locationId: 'bc-lucky', name: 'Водоснабжение здания', type: 'Водоснабжение', status: 'Частично заполнено', scope: 'Санузлы, кухни, технические помещения', criticality: 'Средняя', owner: 'Инженер ВК' },
      { id: 'sys-sewer', parentId: null, locationId: 'bc-lucky', name: 'Канализация здания', type: 'Канализация', status: 'Частично заполнено', scope: 'Мокрые зоны здания', criticality: 'Средняя', owner: 'Инженер ВК' },
      { id: 'sys-heating', parentId: null, locationId: 'bc-lucky', name: 'Отопление здания', type: 'Отопление', status: 'Частично заполнено', scope: 'Офисы, МОП, технические зоны', criticality: 'Средняя', owner: 'Инженер ОВиК' },
      { id: 'sys-light-common', parentId: null, locationId: 'bc-lucky', name: 'Освещение общих зон', type: 'Освещение', status: 'Частично заполнено', scope: 'Лобби, МОП, паркинг, кровля', criticality: 'Низкая', owner: 'Главный энергетик' },
      { id: 'sys-server-power', parentId: 'sys-power', locationId: 'room-server', name: 'Питание серверной СОТА', type: 'Электроснабжение', status: 'Частично заполнено', scope: 'Серверная', criticality: 'Высокая', owner: 'IT-инженер' },
      { id: 'sys-cctv-parking', parentId: 'sys-cctv', locationId: 'parking-a', name: 'Видеонаблюдение паркинга А', type: 'СКУД', status: 'Требует данных', scope: 'Паркинг А', criticality: 'Средняя', owner: 'Служба безопасности' },
      { id: 'sys-vent-office', parentId: 'sys-vent', locationId: 'office-sota', name: 'Вентиляция Офиса СОТА', type: 'Вентиляция', status: 'Частично заполнено', scope: 'Офис СОТА', criticality: 'Средняя', owner: 'Инженер ОВиК' }
    ].forEach(item => put(data.systems, item));

    [
      { id: 'eq-vru-main', parentId: null, systemId: 'sys-power', locationId: 'itp', name: 'ВРУ-1 БЦ Lucky', level: 'Конкретная единица', type: 'ВРУ', qty: 1, unit: 'шт', code: 'PWR-VRU-001', status: 'Заполнено', manufacturer: 'IEK' },
      { id: 'eq-ups-server', parentId: null, systemId: 'sys-server-power', locationId: 'room-server', name: 'ИБП серверной СОТА', level: 'Конкретная единица', type: 'ИБП', qty: 1, unit: 'шт', code: 'UPS-SOTA-SRV-001', status: 'Частично заполнено', manufacturer: 'APC' },
      { id: 'eq-panel-server', parentId: null, systemId: 'sys-server-power', locationId: 'room-server', name: 'Электрощит серверной', level: 'Конкретная единица', type: 'Щит', qty: 1, unit: 'шт', code: 'PANEL-SOTA-SRV-001', status: 'Частично заполнено', manufacturer: 'DKC' },
      { id: 'eq-cctv-lobby-group', parentId: null, systemId: 'sys-cctv', locationId: 'lobby', name: 'Камеры лобби', level: 'Группа / агрегат', type: 'Камера', qty: 3, unit: 'шт', code: 'CCTV-LOBBY-GRP', status: 'Частично заполнено', manufacturer: 'Hikvision' },
      { id: 'eq-cctv-lobby-001', parentId: 'eq-cctv-lobby-group', systemId: 'sys-cctv', locationId: 'lobby', name: 'Камера лобби 1', level: 'Конкретная единица', type: 'Камера', qty: 1, unit: 'шт', code: 'CCTV-LOBBY-001', status: 'Частично заполнено', manufacturer: 'Hikvision' },
      { id: 'eq-cctv-lobby-002', parentId: 'eq-cctv-lobby-group', systemId: 'sys-cctv', locationId: 'lobby', name: 'Камера лобби 2', level: 'Конкретная единица', type: 'Камера', qty: 1, unit: 'шт', code: 'CCTV-LOBBY-002', status: 'Частично заполнено', manufacturer: 'Hikvision' },
      { id: 'eq-cctv-lobby-003', parentId: 'eq-cctv-lobby-group', systemId: 'sys-cctv', locationId: 'guard-post', name: 'Камера поста охраны', level: 'Конкретная единица', type: 'Камера', qty: 1, unit: 'шт', code: 'CCTV-GUARD-001', status: 'Требует данных', manufacturer: 'Hikvision' },
      { id: 'eq-fan-roof-001', parentId: null, systemId: 'sys-vent', locationId: 'vent-chamber', name: 'Вытяжной вентилятор кровли', level: 'Конкретная единица', type: 'Вентилятор', qty: 1, unit: 'шт', code: 'VENT-ROOF-001', status: 'Частично заполнено', manufacturer: 'Systemair' },
      { id: 'eq-ah--1', parentId: null, systemId: 'sys-vent', locationId: 'service-store--1', name: 'Приточная установка паркинга', level: 'Конкретная единица', type: 'Приточная установка', qty: 1, unit: 'шт', code: 'VENT-PARK-001', status: 'Частично заполнено', manufacturer: 'VTS' },
      { id: 'eq-pump-water-001', parentId: null, systemId: 'sys-water', locationId: 'pump-room', name: 'Насос ХВС 1', level: 'Конкретная единица', type: 'Насос', qty: 1, unit: 'шт', code: 'WTR-PUMP-001', status: 'Частично заполнено', manufacturer: 'Grundfos' },
      { id: 'eq-heat-node-001', parentId: null, systemId: 'sys-heating', locationId: 'itp', name: 'Тепловой узел ИТП', level: 'Конкретная единица', type: 'Тепловой узел', qty: 1, unit: 'шт', code: 'HEAT-ITP-001', status: 'Частично заполнено', manufacturer: 'Danfoss' },
      { id: 'eq-light-mop-group', parentId: null, systemId: 'sys-light-common', locationId: 'mop-4', name: 'Светильники МОП 4 этажа', level: 'Группа / агрегат', type: 'Светильник', qty: 8, unit: 'шт', code: 'LT-MOP4-GRP', status: 'Требует данных', manufacturer: 'Световые технологии' },
      { id: 'eq-light-mop-001', parentId: 'eq-light-mop-group', systemId: 'sys-light-common', locationId: 'mop-4', name: 'Светильник МОП 4-1', level: 'Конкретная единица', type: 'Светильник', qty: 1, unit: 'шт', code: 'LT-MOP4-001', status: 'Требует данных', manufacturer: 'Световые технологии' },
      { id: 'eq-light-mop-002', parentId: 'eq-light-mop-group', systemId: 'sys-light-common', locationId: 'mop-4', name: 'Светильник МОП 4-2', level: 'Конкретная единица', type: 'Светильник', qty: 1, unit: 'шт', code: 'LT-MOP4-002', status: 'Требует данных', manufacturer: 'Световые технологии' },
      { id: 'eq-ladder-roof', parentId: null, systemId: null, locationId: 'service-access-7', name: 'Сервисная лестница на кровлю', level: 'Конкретная единица', type: 'Оборудование без системы', qty: 1, unit: 'шт', code: 'NO-SYS-ROOF-001', status: 'Требует данных', noSystem: true }
    ].forEach(item => put(data.equipment, item));
  }

  function addTechCards() {
    const targets = [
      ['object', 'room-open-space', 'Open space'], ['object', 'room-server', 'Серверная'], ['object', 'lobby', 'Лобби'], ['object', 'parking-a', 'Паркинг А'], ['object', 'mop-4', 'МОП 4 этажа'], ['object', 'vent-chamber', 'Венткамера'],
      ['system', 'sys-power', 'Электроснабжение здания'], ['system', 'sys-fire', 'Пожарная сигнализация'], ['system', 'sys-cctv', 'Видеонаблюдение'], ['system', 'sys-vent', 'Вентиляция'], ['system', 'sys-water', 'Водоснабжение'], ['system', 'sys-ac-sota', 'Кондиционирование офиса'],
      ['equipment', 'eq-ups-server', 'ИБП серверной'], ['equipment', 'eq-vru-main', 'ВРУ'], ['equipment', 'eq-fan-roof-001', 'Вентилятор кровли'], ['equipment', 'eq-pump-water-001', 'Насос ХВС'], ['equipment', 'eq-ac-open-group', 'Кондиционеры Open space'], ['equipment', 'eq-cctv-lobby-group', 'Камеры лобби']
    ];
    const works = ['Осмотр', 'Проверка', 'Регламентное обслуживание'];
    targets.forEach((target, targetIndex) => {
      works.forEach((work, workIndex) => {
        const id = `tc-demo-${target[1]}-${workIndex}`;
        put(data.techCards, {
          id,
          entityType: target[0],
          entityId: target[1],
          name: `${work}: ${target[2]}`,
          workType: work,
          periodicity: workIndex === 0 ? 'Еженедельно' : workIndex === 1 ? 'Ежемесячно' : 'Ежеквартально',
          status: (targetIndex + workIndex) % 5 === 0 ? 'Требует заполнения' : (targetIndex + workIndex) % 3 === 0 ? 'Частично заполнено' : 'Заполнено',
          goal: `Плановая техкарта для ${target[2]}.`
        });
      });
    });
  }

  function targetName(tc) {
    if (tc.entityType === 'object') return objectById(tc.entityId)?.name || 'Без помещения';
    if (tc.entityType === 'system') return systemById(tc.entityId)?.name || 'Без системы';
    if (tc.entityType === 'equipment') return equipmentById(tc.entityId)?.name || 'Без оборудования';
    return 'Не привязано';
  }

  function groupName(tc, mode) {
    if (mode === 'object') {
      if (tc.entityType === 'object') return targetName(tc);
      const equipment = tc.entityType === 'equipment' ? equipmentById(tc.entityId) : null;
      return equipment?.locationId ? objectById(equipment.locationId)?.name || 'Без помещения' : 'Не привязано к помещению';
    }
    if (mode === 'equipment') return tc.entityType === 'equipment' ? targetName(tc) : 'Не по оборудованию';
    if (mode === 'system') return tc.entityType === 'system' ? targetName(tc) : 'Не по системе';
    if (mode === 'status') return tc.status;
    return tc.workType;
  }

  renderTechCardsWork = function () {
    state.tcGroupBy = state.tcGroupBy || 'object';
    const groups = data.techCards.reduce((acc, tc) => {
      const key = groupName(tc, state.tcGroupBy) || 'Не привязано';
      acc[key] = acc[key] || [];
      acc[key].push(tc);
      return acc;
    }, {});
    const groupRows = Object.entries(groups)
      .sort((a, b) => a[0].localeCompare(b[0], 'ru'))
      .map(([name, items]) => `
        <details class="tc-group" open>
          <summary><span>${escapeHtml(name)}</span><span class="badge">${items.length} ТК</span></summary>
          <div class="tc-list">
            ${items.map(tc => `
              <button class="tc-row ${state.selectedTcId === tc.id ? 'active' : ''}" onclick="selectTechCard('${tc.id}')">
                <span>${escapeHtml(tc.name)}</span>
                <span class="badge ${statusClass(tc.status)}">${escapeHtml(tc.status)}</span>
              </button>
            `).join('')}
          </div>
        </details>
      `).join('');

    return `
      <div class="head">
        <div class="title"><h1>Техкарты</h1><p>Один режим группировки вместо четырех больших списков.</p></div>
        <div class="actions"><button onclick="openModal('techcard')">Создать ТК</button></div>
      </div>
      <section class="panel workspace techcards-work">
        <div class="toolbar-line">
          <label>Группировка
            <select onchange="state.tcGroupBy=this.value;render()">
              <option value="object" ${state.tcGroupBy === 'object' ? 'selected' : ''}>По помещениям</option>
              <option value="equipment" ${state.tcGroupBy === 'equipment' ? 'selected' : ''}>По оборудованию</option>
              <option value="work" ${state.tcGroupBy === 'work' ? 'selected' : ''}>По видам работ</option>
              <option value="system" ${state.tcGroupBy === 'system' ? 'selected' : ''}>По системам</option>
              <option value="status" ${state.tcGroupBy === 'status' ? 'selected' : ''}>По статусам</option>
            </select>
          </label>
          <span class="badge">Всего: ${data.techCards.length}</span>
        </div>
        <div class="tc-groups">${groupRows}</div>
      </section>
    `;
  };

  renderPlan = function () {
    const floors = data.objects.filter(item => item.type === 'Этаж');
    const rooms = data.objects.filter(item => item.plan && item.plan.floorId === state.selectedFloorId);
    const currentFloor = objectById(state.selectedFloorId);
    return `
      <div class="plan enhanced-plan">
        <div class="floor-tabs">${floors.map(f => `<button class="${state.selectedFloorId === f.id ? 'active' : ''}" onclick="state.selectedFloorId='${f.id}';render()">${escapeHtml(f.name)}</button>`).join('')}</div>
        <div class="plan-caption"><strong>${escapeHtml(currentFloor?.name || 'Этаж')}</strong><span>${rooms.length} зон и помещений на схеме</span></div>
        <div class="plan-map detailed">
          <div class="plan-core core-a">Лифты / лестница</div>
          <div class="plan-core core-b">Инженерный стояк</div>
          ${rooms.length ? rooms.map(room => `<div class="room ${state.selectedObjectId === room.id ? 'active' : ''} ${statusClass(room.status)}" onclick="selectObject('${room.id}')" style="left:${room.plan.x}%;top:${room.plan.y}%;width:${room.plan.w}%;height:${room.plan.h}%;"><div class="room-name">${escapeHtml(room.name)}</div><div class="room-status">${escapeHtml(room.type)} · ${escapeHtml(room.status)}</div></div>`).join('') : '<div class="empty">На выбранном этаже планировка пока не заполнена</div>'}
        </div>
      </div>
    `;
  };

  addPlanData();
  addSystemsAndEquipment();
  addTechCards();
  render();
})();
