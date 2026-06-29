const state = {
  tab: 'objects',
  objectMode: 'tree',
  selectedObjectId: 'room-open-space',
  selectedSystemId: 'sys-ac-sota',
  selectedEquipmentId: 'eq-ac-os-001',
  selectedTcId: 'tc-open-space-inspection',
  selectedFloorId: 'floor-4',
  modal: null,
  dragId: null
};

const dictionaries = {
  objectTypes: ['БЦ', 'Этаж', 'Офис', 'Зона', 'Помещение', 'Техническое помещение', 'Кровля', 'Паркинг'],
  systemTypes: ['Электроснабжение', 'Пожарная безопасность', 'Кондиционирование', 'СКС', 'Освещение', 'СКУД'],
  equipmentTypes: ['ВРУ', 'Щит', 'ИБП', 'Внутренний блок', 'Точка доступа', 'Светильник', 'Турникет'],
  workTypes: ['Осмотр', 'Проверка', 'Регламентное обслуживание'],
  units: ['шт', 'м2', 'комплект'],
  statuses: ['Заполнено', 'Частично заполнено', 'Требует данных', 'Требует заполнения'],
  criticality: ['Низкая', 'Средняя', 'Высокая']
};

const data = {
  objects: [
    { id: 'bc-lucky', parentId: null, name: 'БЦ Lucky', type: 'БЦ', code: 'OBJ-001', status: 'Заполнено', owner: 'УК', area: '18 400 м2', purpose: 'Главный объект', description: 'Пространственная структура ведется отдельно от инженерных систем.' },
    { id: 'floor--1', parentId: 'bc-lucky', name: '-1 этаж', type: 'Этаж', code: 'FL--001', status: 'Частично заполнено', area: '3 200 м2' },
    { id: 'parking-a', parentId: 'floor--1', name: 'Паркинг А', type: 'Паркинг', code: 'PRK-A', status: 'Требует данных', area: '2 400 м2' },
    { id: 'pump-room', parentId: 'floor--1', name: 'Насосная', type: 'Техническое помещение', code: 'ROOM-PUMP', status: 'Частично заполнено', area: '84 м2' },
    { id: 'itp', parentId: 'floor--1', name: 'ИТП', type: 'Техническое помещение', code: 'ROOM-ITP', status: 'Частично заполнено', area: '96 м2' },
    { id: 'floor-1', parentId: 'bc-lucky', name: '1 этаж', type: 'Этаж', code: 'FL-001', status: 'Частично заполнено', area: '2 100 м2' },
    { id: 'lobby', parentId: 'floor-1', name: 'Лобби', type: 'Помещение', code: 'ROOM-LOBBY', status: 'Частично заполнено', area: '310 м2' },
    { id: 'guard-post', parentId: 'floor-1', name: 'Пост охраны', type: 'Помещение', code: 'ROOM-GUARD', status: 'Требует данных', area: '18 м2' },
    { id: 'floor-4', parentId: 'bc-lucky', name: '4 этаж', type: 'Этаж', code: 'FL-004', status: 'Заполнено', area: '2 250 м2' },
    { id: 'office-sota', parentId: 'floor-4', name: 'Офис СОТА', type: 'Офис', code: 'OFF-SOTA', status: 'Заполнено', area: '820 м2' },
    { id: 'room-open-space', parentId: 'office-sota', name: 'Open space', type: 'Помещение', code: 'SOTA-OS', status: 'Заполнено', area: '420 м2', plan: { floorId: 'floor-4', x: 6, y: 8, w: 46, h: 42 } },
    { id: 'room-server', parentId: 'office-sota', name: 'Серверная', type: 'Помещение', code: 'SOTA-SRV', status: 'Частично заполнено', area: '38 м2', plan: { floorId: 'floor-4', x: 55, y: 8, w: 18, h: 22 } },
    { id: 'room-meeting', parentId: 'office-sota', name: 'Переговорная', type: 'Помещение', code: 'SOTA-MTG', status: 'Частично заполнено', area: '46 м2', plan: { floorId: 'floor-4', x: 55, y: 34, w: 22, h: 24 } },
    { id: 'room-kitchen', parentId: 'office-sota', name: 'Кухня', type: 'Помещение', code: 'SOTA-KIT', status: 'Требует данных', area: '32 м2', plan: { floorId: 'floor-4', x: 80, y: 34, w: 14, h: 24 } },
    { id: 'mop-4', parentId: 'floor-4', name: 'МОП 4 этажа', type: 'Зона', code: 'MOP-004', status: 'Частично заполнено', area: '190 м2', plan: { floorId: 'floor-4', x: 55, y: 64, w: 39, h: 24 } },
    { id: 'floor-7', parentId: 'bc-lucky', name: '7 этаж', type: 'Этаж', code: 'FL-007', status: 'Частично заполнено', area: '1 920 м2' },
    { id: 'vent-chamber', parentId: 'floor-7', name: 'Венткамера', type: 'Техническое помещение', code: 'ROOM-VENT', status: 'Частично заполнено', area: '130 м2' },
    { id: 'roof', parentId: 'floor-7', name: 'Кровля', type: 'Кровля', code: 'ROOF', status: 'Требует данных', area: '1 140 м2' }
  ],
  systems: [
    { id: 'sys-power', parentId: null, locationId: 'bc-lucky', name: 'Электроснабжение здания', type: 'Электроснабжение', status: 'Заполнено', scope: 'Все дочерние уровни', criticality: 'Высокая', owner: 'Главный энергетик' },
    { id: 'sys-vru', parentId: 'sys-power', locationId: 'itp', name: 'ВРУ БЦ Lucky', type: 'Электроснабжение', status: 'Частично заполнено', scope: 'ИТП', criticality: 'Высокая' },
    { id: 'sys-fire', parentId: null, locationId: 'bc-lucky', name: 'Пожарная сигнализация', type: 'Пожарная безопасность', status: 'Заполнено', scope: 'Все дочерние уровни', criticality: 'Высокая', owner: 'Инженер ПБ' },
    { id: 'sys-access', parentId: null, locationId: 'bc-lucky', name: 'СКУД здания', type: 'СКУД', status: 'Частично заполнено', scope: 'Входные группы', criticality: 'Средняя' },
    { id: 'sys-ac-sota', parentId: null, locationId: 'office-sota', name: 'Кондиционирование Офиса СОТА', type: 'Кондиционирование', status: 'Заполнено', scope: 'Офис СОТА и дочерние помещения', criticality: 'Средняя', owner: 'Инженер ОВиК' },
    { id: 'sys-scs-sota', parentId: null, locationId: 'office-sota', name: 'Локальная СКС Офиса СОТА', type: 'СКС', status: 'Частично заполнено', scope: 'Офис СОТА', criticality: 'Средняя' },
    { id: 'sys-light-sota', parentId: null, locationId: 'office-sota', name: 'Освещение Офиса СОТА', type: 'Освещение', status: 'Частично заполнено', scope: 'Офис СОТА', criticality: 'Низкая' },
    { id: 'sys-ac-server', parentId: 'sys-ac-sota', locationId: 'room-server', name: 'Кондиционирование серверной', type: 'Кондиционирование', status: 'Требует данных', scope: 'Серверная', criticality: 'Высокая' }
  ],
  equipment: [
    { id: 'eq-ac-open-group', parentId: null, systemId: 'sys-ac-sota', locationId: 'room-open-space', name: 'Кондиционер Open space СОТА', level: 'Группа / агрегат', type: 'Внутренний блок', qty: 4, unit: 'шт', code: 'EQ-GRP-AC-OS', status: 'Заполнено', manufacturer: 'Daichi' },
    { id: 'eq-ac-os-001', parentId: 'eq-ac-open-group', systemId: 'sys-ac-sota', locationId: 'room-open-space', name: 'AC-SOTA-OS-001', level: 'Конкретная единица', type: 'Внутренний блок', qty: 1, unit: 'шт', code: 'AC-SOTA-OS-001', status: 'Заполнено', manufacturer: 'Daichi' },
    { id: 'eq-ac-os-002', parentId: 'eq-ac-open-group', systemId: 'sys-ac-sota', locationId: 'room-open-space', name: 'AC-SOTA-OS-002', level: 'Конкретная единица', type: 'Внутренний блок', qty: 1, unit: 'шт', code: 'AC-SOTA-OS-002', status: 'Заполнено', manufacturer: 'Daichi' },
    { id: 'eq-ac-os-003', parentId: 'eq-ac-open-group', systemId: 'sys-ac-sota', locationId: 'room-open-space', name: 'AC-SOTA-OS-003', level: 'Конкретная единица', type: 'Внутренний блок', qty: 1, unit: 'шт', code: 'AC-SOTA-OS-003', status: 'Заполнено', manufacturer: 'Daichi' },
    { id: 'eq-ac-os-004', parentId: 'eq-ac-open-group', systemId: 'sys-ac-sota', locationId: 'room-open-space', name: 'AC-SOTA-OS-004', level: 'Конкретная единица', type: 'Внутренний блок', qty: 1, unit: 'шт', code: 'AC-SOTA-OS-004', status: 'Заполнено', manufacturer: 'Daichi' },
    { id: 'eq-ac-srv-001', parentId: null, systemId: 'sys-ac-server', locationId: 'room-server', name: 'AC-SOTA-SRV-001', level: 'Конкретная единица', type: 'Внутренний блок', qty: 1, unit: 'шт', code: 'AC-SOTA-SRV-001', status: 'Частично заполнено' },
    { id: 'eq-ap-os', parentId: null, systemId: 'sys-scs-sota', locationId: 'room-open-space', name: 'Точка доступа Open space', level: 'Конкретная единица', type: 'Точка доступа', qty: 1, unit: 'шт', code: 'AP-SOTA-OS-001', status: 'Частично заполнено' },
    { id: 'eq-light-os-1', parentId: null, systemId: 'sys-light-sota', locationId: 'room-open-space', name: 'Светильник Open space 1', level: 'Конкретная единица', type: 'Светильник', qty: 1, unit: 'шт', code: 'LT-SOTA-OS-001', status: 'Частично заполнено' },
    { id: 'eq-light-os-2', parentId: null, systemId: 'sys-light-sota', locationId: 'room-open-space', name: 'Светильник Open space 2', level: 'Конкретная единица', type: 'Светильник', qty: 1, unit: 'шт', code: 'LT-SOTA-OS-002', status: 'Частично заполнено' },
    { id: 'eq-mobile-lift', parentId: null, systemId: null, locationId: 'mop-4', name: 'Передвижной подъемник', level: 'Конкретная единица', type: 'Оборудование без системы', qty: 1, unit: 'шт', code: 'NO-SYS-001', status: 'Требует данных', noSystem: true }
  ],
  techCards: [
    { id: 'tc-open-space-inspection', entityType: 'object', entityId: 'room-open-space', name: 'Осмотр Open space', workType: 'Осмотр', periodicity: 'Еженедельно', status: 'Требует заполнения', goal: 'Проверить состояние помещения и размещенного оборудования.' },
    { id: 'tc-ac-service', entityType: 'equipment', entityId: 'eq-ac-open-group', name: 'Регламент кондиционеров Open space', workType: 'Регламентное обслуживание', periodicity: 'Ежеквартально', status: 'Частично заполнено', goal: 'Обслуживание группы внутренних блоков.' },
    { id: 'tc-fire-check', entityType: 'system', entityId: 'sys-fire', name: 'Проверка пожарной сигнализации', workType: 'Проверка', periodicity: 'Ежемесячно', status: 'Заполнено', goal: 'Проверить доступность и состояние системы.' }
  ],
  history: [
    { entityId: 'room-open-space', text: 'Создано помещение и размещены 4 единицы кондиционирования.' },
    { entityId: 'sys-ac-sota', text: 'Система создана на уровне Офис СОТА и наследуется ниже.' }
  ]
};

const tabs = [
  ['objects', 'Объекты и помещения'],
  ['systems', 'Системы и оборудование'],
  ['techcards', 'Техкарты'],
  ['dicts', 'Справочники']
];

function byId(list, id) { return list.find(item => item.id === id); }
function objectById(id) { return byId(data.objects, id); }
function systemById(id) { return byId(data.systems, id); }
function equipmentById(id) { return byId(data.equipment, id); }
function techCardById(id) { return byId(data.techCards, id); }
function children(list, parentId) { return list.filter(item => item.parentId === parentId); }
function statusClass(status) {
  if (status === 'Заполнено') return 'ok';
  if (status === 'Требует данных' || status === 'Требует заполнения') return 'bad';
  return 'warn';
}
function pathToObject(id) {
  const path = [];
  let current = objectById(id);
  while (current) { path.unshift(current.name); current = objectById(current.parentId); }
  return path.join(' / ');
}
function objectAncestors(id) {
  const ids = [];
  let current = objectById(id);
  while (current && current.parentId) { ids.push(current.parentId); current = objectById(current.parentId); }
  return ids;
}
function objectDescendants(id) {
  const result = [];
  const walk = parentId => children(data.objects, parentId).forEach(child => { result.push(child.id); walk(child.id); });
  walk(id);
  return result;
}
function systemDescendants(id) {
  const result = [];
  const walk = parentId => children(data.systems, parentId).forEach(child => { result.push(child.id); walk(child.id); });
  walk(id);
  return result;
}
function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[char]));
}
function idFromName(prefix, name) {
  return `${prefix}-${String(name).toLowerCase().replace(/[^a-zа-я0-9]+/gi, '-').replace(/^-|-$/g, '')}-${Date.now().toString(36)}`;
}
function nextCode(prefix, count) { return `${prefix}-${String(count + 1).padStart(3, '0')}`; }

function render() {
  document.getElementById('app').innerHTML = `
    <div class="app">
      <aside class="sidebar">
        <div class="logo">НСИ</div>
        <nav class="nav">${tabs.map(([id, label]) => `<button class="${state.tab === id ? 'active' : ''}" onclick="setTab('${id}')">${label}</button>`).join('')}</nav>
      </aside>
      <main class="work">${renderWork()}</main>
      <aside class="details">${renderDetails()}</aside>
    </div>
    ${state.modal ? renderModal() : ''}
  `;
}

function setTab(tab) { state.tab = tab; render(); }
function selectObject(id) { state.selectedObjectId = id; state.tab = 'objects'; render(); }
function selectSystem(id) { state.selectedSystemId = id; state.tab = 'systems'; render(); }
function selectEquipment(id) { state.selectedEquipmentId = id; state.tab = 'systems'; render(); }
function selectTechCard(id) { state.selectedTcId = id; state.tab = 'techcards'; render(); }
function openModal(type) { state.modal = { type }; render(); }
function closeModal() { state.modal = null; render(); }

function renderWork() {
  if (state.tab === 'objects') return renderObjectsWork();
  if (state.tab === 'systems') return renderSystemsWork();
  if (state.tab === 'techcards') return renderTechCardsWork();
  return renderDictionariesWork();
}

function renderObjectsWork() {
  return `
    <div class="head">
      <div class="title"><h1>Объекты и помещения</h1><p>Пространственная структура: где находится сущность.</p></div>
      <div class="actions">
        <div class="segment">
          <button class="${state.objectMode === 'tree' ? 'active' : ''}" onclick="state.objectMode='tree';render()">Дерево</button>
          <button class="${state.objectMode === 'plan' ? 'active' : ''}" onclick="state.objectMode='plan';render()">Планировка</button>
        </div>
        <button onclick="openModal('object')">Создать объект</button>
        <button onclick="openModal('bulkObject')">Массово создать</button>
      </div>
    </div>
    <section class="panel workspace">${state.objectMode === 'tree' ? renderObjectTree() : renderPlan()}</section>
  `;
}

function renderObjectTree() {
  return `<div class="tree">${children(data.objects, null).map(item => renderObjectNode(item)).join('')}</div>`;
}
function renderObjectNode(item) {
  const nested = children(data.objects, item.id);
  return `
    <div class="node ${state.selectedObjectId === item.id ? 'active' : ''}" draggable="true" ondragstart="startDrag('${item.id}')" ondragover="allowDrop(event)" ondragleave="dropLeave(event)" ondrop="dropObject(event,'${item.id}')">
      <div class="node-title" onclick="selectObject('${item.id}')"><span>${escapeHtml(item.name)}</span><span class="badge">${escapeHtml(item.type)}</span></div>
      <span class="badge ${statusClass(item.status)}">${escapeHtml(item.status)}</span>
    </div>
    ${nested.length ? `<div class="node-children">${nested.map(child => renderObjectNode(child)).join('')}</div>` : ''}
  `;
}

function renderPlan() {
  const floors = data.objects.filter(item => item.type === 'Этаж');
  const rooms = data.objects.filter(item => item.plan && item.plan.floorId === state.selectedFloorId);
  return `
    <div class="plan">
      <div class="floor-tabs">${floors.map(f => `<button class="${state.selectedFloorId === f.id ? 'active' : ''}" onclick="state.selectedFloorId='${f.id}';render()">${escapeHtml(f.name)}</button>`).join('')}</div>
      <div class="plan-map">
        ${rooms.length ? rooms.map(room => `<div class="room ${state.selectedObjectId === room.id ? 'active' : ''}" onclick="selectObject('${room.id}')" style="left:${room.plan.x}%;top:${room.plan.y}%;width:${room.plan.w}%;height:${room.plan.h}%;"><div class="room-name">${escapeHtml(room.name)}</div><div class="room-status">${escapeHtml(room.status)}</div></div>`).join('') : '<div class="empty">На выбранном этаже планировка пока не заполнена</div>'}
      </div>
    </div>
  `;
}

function startDrag(id) { state.dragId = id; }
function allowDrop(event) { event.preventDefault(); event.currentTarget.classList.add('drag-over'); }
function dropLeave(event) { event.currentTarget.classList.remove('drag-over'); }
function dropObject(event, targetId) {
  event.preventDefault();
  event.currentTarget.classList.remove('drag-over');
  const sourceId = state.dragId;
  if (!sourceId || sourceId === targetId || objectDescendants(sourceId).includes(targetId)) return;
  objectById(sourceId).parentId = targetId;
  state.selectedObjectId = sourceId;
  render();
}

function renderSystemsWork() {
  return `
    <div class="head">
      <div class="title"><h1>Системы и оборудование</h1><p>Инженерная структура: что работает и что обслуживается.</p></div>
      <div class="actions"><button onclick="openModal('system')">Создать систему</button><button onclick="openModal('equipment')">Создать оборудование</button><button onclick="openModal('roomEquipment')">Добавить в помещение</button></div>
    </div>
    <section class="grid two">
      <div class="panel workspace"><h3>Иерархия систем</h3><div class="tree">${children(data.systems, null).map(item => renderSystemNode(item)).join('')}</div></div>
      <div class="panel workspace"><h3>Оборудование без системы</h3>${renderNoSystemEquipment()}<h3>Единицы оборудования</h3>${renderEquipmentList(data.equipment.filter(e => e.level === 'Конкретная единица'))}</div>
    </section>
  `;
}
function renderSystemNode(item) {
  const nested = children(data.systems, item.id);
  const eq = data.equipment.filter(e => e.systemId === item.id && !e.parentId);
  return `
    <div class="node ${state.selectedSystemId === item.id ? 'active' : ''}">
      <div class="node-title" onclick="selectSystem('${item.id}')"><span>${escapeHtml(item.name)}</span><span class="badge">${escapeHtml(item.type)}</span></div>
      <span class="badge ${statusClass(item.status)}">${escapeHtml(item.status)}</span>
    </div>
    ${eq.length ? `<div class="node-children">${eq.map(e => renderEquipmentNode(e)).join('')}</div>` : ''}
    ${nested.length ? `<div class="node-children">${nested.map(child => renderSystemNode(child)).join('')}</div>` : ''}
  `;
}
function renderEquipmentNode(item) {
  const nested = children(data.equipment, item.id);
  return `
    <div class="node ${state.selectedEquipmentId === item.id ? 'active' : ''}">
      <div class="node-title" onclick="selectEquipment('${item.id}')"><span>${escapeHtml(item.name)}</span><span class="badge">${escapeHtml(item.level)}</span></div>
      <span class="badge">${escapeHtml(item.code)}</span>
    </div>
    ${nested.length ? `<div class="node-children">${nested.map(child => renderEquipmentNode(child)).join('')}</div>` : ''}
  `;
}
function renderNoSystemEquipment() {
  const items = data.equipment.filter(item => item.noSystem || !item.systemId);
  return items.length ? renderEquipmentList(items) : '<div class="empty">Нет оборудования без системы</div>';
}
function renderEquipmentList(items) {
  return `<div class="card-list">${items.map(e => `<div class="item" onclick="selectEquipment('${e.id}')"><div class="item-row"><div><div class="item-title">${escapeHtml(e.name)}</div><div class="item-meta">${escapeHtml(e.type)} · ${escapeHtml(e.code)} · ${escapeHtml(objectById(e.locationId)?.name || 'Без размещения')}</div></div><span class="badge ${statusClass(e.status)}">${escapeHtml(e.status)}</span></div></div>`).join('')}</div>`;
}

function renderTechCardsWork() {
  const groups = [
    ['По помещениям', tc => tc.entityType === 'object' ? objectById(tc.entityId)?.name : 'Не привязано'],
    ['По оборудованию', tc => tc.entityType === 'equipment' ? equipmentById(tc.entityId)?.name : 'Не привязано'],
    ['По видам работ', tc => tc.workType],
    ['По системам', tc => tc.entityType === 'system' ? systemById(tc.entityId)?.name : 'Не привязано']
  ];
  return `
    <div class="head"><div class="title"><h1>Техкарты</h1><p>Группировка по помещениям, оборудованию, видам работ и системам.</p></div><div class="actions"><button onclick="openModal('techcard')">Создать ТК</button></div></div>
    <section class="grid two">${groups.map(([name, getter]) => `<div class="panel workspace"><h3>${name}</h3>${renderTcGroup(getter)}</div>`).join('')}</section>
  `;
}
function renderTcGroup(getter) {
  const bucket = {};
  data.techCards.forEach(tc => { const key = getter(tc) || 'Не привязано'; bucket[key] = bucket[key] || []; bucket[key].push(tc); });
  return Object.entries(bucket).map(([name, items]) => `<div class="item"><div class="item-title">${escapeHtml(name)}</div>${items.map(tc => `<div class="line" onclick="selectTechCard('${tc.id}')"><span>${escapeHtml(tc.name)}</span><span class="badge ${statusClass(tc.status)}">${escapeHtml(tc.status)}</span></div>`).join('')}</div>`).join('');
}

function renderDictionariesWork() {
  return `
    <div class="head"><div class="title"><h1>Справочники</h1><p>Значения доступны из форм создания сущностей.</p></div><div class="actions"><button onclick="openModal('dictionary')">Добавить значение</button></div></div>
    <section class="grid three">${Object.entries(dictionaries).map(([key, values]) => `<div class="panel workspace"><h3>${dictTitle(key)}</h3><div class="card-list">${values.map(v => `<div class="line"><span>${escapeHtml(v)}</span><span class="badge">значение</span></div>`).join('')}</div></div>`).join('')}</section>
  `;
}
function dictTitle(key) {
  return { objectTypes: 'Виды объектов', systemTypes: 'Типы систем', equipmentTypes: 'Типы оборудования', workTypes: 'Виды работ', units: 'Единицы измерения', statuses: 'Статусы', criticality: 'Критичность' }[key] || key;
}

function renderDetails() {
  if (state.tab === 'objects') return renderObjectDetails();
  if (state.tab === 'systems') return state.selectedEquipmentId ? renderEquipmentDetails() : renderSystemDetails();
  if (state.tab === 'techcards') return renderTechCardDetails();
  return renderDictionaryDetails();
}
function renderObjectDetails() {
  const item = objectById(state.selectedObjectId) || data.objects[0];
  const directSystems = data.systems.filter(sys => sys.locationId === item.id);
  const inheritedSystems = data.systems.filter(sys => objectAncestors(item.id).includes(sys.locationId));
  const belowSystems = data.systems.filter(sys => objectDescendants(item.id).includes(sys.locationId));
  const units = data.equipment.filter(eq => eq.locationId === item.id && eq.level === 'Конкретная единица');
  const groups = [...new Set(units.map(eq => eq.parentId).filter(Boolean))].map(id => equipmentById(id)).filter(Boolean);
  const tcs = data.techCards.filter(tc => tc.entityType === 'object' && tc.entityId === item.id);
  return `
    <h2>${escapeHtml(item.name)}</h2><div class="type">${escapeHtml(pathToObject(item.id))}</div>
    <div class="section"><h3>Основные данные</h3><div class="kv"><div>Вид</div><div>${escapeHtml(item.type)}</div><div>Код</div><div>${escapeHtml(item.code)}</div><div>Статус</div><div><span class="badge ${statusClass(item.status)}">${escapeHtml(item.status)}</span></div><div>Площадь</div><div>${escapeHtml(item.area || 'Не указана')}</div></div></div>
    <div class="section"><h3>Перемещение</h3><label>Родитель<select onchange="moveSelectedObject(this.value)"><option value="">Без родителя</option>${data.objects.filter(o => o.id !== item.id && !objectDescendants(item.id).includes(o.id)).map(o => `<option value="${o.id}" ${item.parentId === o.id ? 'selected' : ''}>${escapeHtml(pathToObject(o.id))}</option>`).join('')}</select></label></div>
    <div class="section"><h3>Системы</h3><div class="cols"><div><div class="item-meta">Прямые системы</div>${renderSystemLines(directSystems, 'прямо здесь')}</div><div><div class="item-meta">Системы ниже и наследуемые</div>${renderSystemLines(inheritedSystems, 'наследуется')}${renderSystemLines(belowSystems, 'создано ниже')}</div></div></div>
    <div class="section"><h3>Оборудование</h3>${units.length ? units.map(eq => `<div class="line" onclick="selectEquipment('${eq.id}')"><span>${escapeHtml(eq.name)}</span><span class="badge">${escapeHtml(eq.code)}</span></div>`).join('') : '<div class="item-meta">Конкретные единицы не размещены</div>'}${groups.length ? `<div class="item-meta" style="margin-top:10px">Группы раскрываются во вкладке систем: ${groups.map(g => `<button class="small" onclick="selectEquipment('${g.id}')">${escapeHtml(g.name)}</button>`).join(' ')}</div>` : ''}</div>
    <div class="section"><h3>Техкарты</h3>${renderTcLines(tcs)}</div>
    <div class="section"><h3>История / изменения</h3>${data.history.filter(h => h.entityId === item.id).map(h => `<div class="line"><span>${escapeHtml(h.text)}</span></div>`).join('') || '<div class="item-meta">Изменений пока нет</div>'}</div>
  `;
}
function renderSystemLines(items, note) {
  return items.length ? items.map(sys => `<div class="line" onclick="selectSystem('${sys.id}')"><span>${escapeHtml(sys.name)}</span><span class="badge">${note}</span></div>`).join('') : '<div class="item-meta">Нет</div>';
}
function renderTcLines(items) {
  return items.length ? items.map(tc => `<div class="line" onclick="selectTechCard('${tc.id}')"><span>${escapeHtml(tc.name)}</span><span class="badge ${statusClass(tc.status)}">${escapeHtml(tc.status)}</span></div>`).join('') : '<div class="item-meta">ТК не созданы</div>';
}
function moveSelectedObject(parentId) { objectById(state.selectedObjectId).parentId = parentId || null; render(); }

function renderSystemDetails() {
  const item = systemById(state.selectedSystemId) || data.systems[0];
  const location = objectById(item.locationId);
  const scopeObjects = [location, ...objectDescendants(item.locationId).map(objectById)].filter(Boolean);
  const systemIds = [item.id, ...systemDescendants(item.id)];
  const eq = data.equipment.filter(e => systemIds.includes(e.systemId));
  const rooms = [...new Set(eq.map(e => e.locationId).filter(Boolean))].map(objectById).filter(Boolean);
  const tcs = data.techCards.filter(tc => tc.entityType === 'system' && tc.entityId === item.id);
  return `
    <h2>${escapeHtml(item.name)}</h2><div class="type">${escapeHtml(item.type)}</div>
    <div class="section"><h3>Основные данные</h3><div class="kv"><div>Создана на</div><div>${escapeHtml(location?.name || 'Не указано')}</div><div>Действует</div><div>${escapeHtml(item.scope)}</div><div>Критичность</div><div>${escapeHtml(item.criticality)}</div><div>Статус</div><div><span class="badge ${statusClass(item.status)}">${escapeHtml(item.status)}</span></div></div></div>
    <div class="section"><h3>Где действует система</h3>${scopeObjects.slice(0, 8).map(o => `<div class="line" onclick="selectObject('${o.id}')"><span>${escapeHtml(o.name)}</span><span class="badge">${escapeHtml(o.type)}</span></div>`).join('')}</div>
    <div class="section"><h3>Оборудование системы</h3>${eq.map(e => `<div class="line" onclick="selectEquipment('${e.id}')"><span>${escapeHtml(e.name)}</span><span class="badge">${escapeHtml(e.level)}</span></div>`).join('') || '<div class="item-meta">Нет оборудования</div>'}</div>
    <div class="section"><h3>Помещения, где размещено оборудование</h3>${rooms.map(r => `<div class="line" onclick="selectObject('${r.id}')"><span>${escapeHtml(r.name)}</span><span class="badge">${escapeHtml(r.type)}</span></div>`).join('') || '<div class="item-meta">Нет размещения</div>'}</div>
    <div class="section"><h3>Техкарты</h3>${renderTcLines(tcs)}</div>
  `;
}
function renderEquipmentDetails() {
  const item = equipmentById(state.selectedEquipmentId) || data.equipment[0];
  const system = systemById(item.systemId);
  const parent = equipmentById(item.parentId);
  const location = objectById(item.locationId);
  const nested = children(data.equipment, item.id);
  const tcs = data.techCards.filter(tc => tc.entityType === 'equipment' && tc.entityId === item.id);
  return `
    <h2>${escapeHtml(item.name)}</h2><div class="type">${escapeHtml(item.level)}</div>
    <div class="section"><h3>Основные данные</h3><div class="kv"><div>Тип</div><div>${escapeHtml(item.type)}</div><div>Код</div><div>${escapeHtml(item.code)}</div><div>Количество</div><div>${escapeHtml(item.qty)} ${escapeHtml(item.unit)}</div><div>Статус</div><div><span class="badge ${statusClass(item.status)}">${escapeHtml(item.status)}</span></div></div></div>
    <div class="section"><h3>Система</h3>${system ? `<div class="line" onclick="selectSystem('${system.id}')"><span>${escapeHtml(system.name)}</span><span class="badge">Открыть</span></div>` : '<div class="item-meta">Оборудование без системы</div>'}</div>
    <div class="section"><h3>Родительское оборудование</h3>${parent ? `<div class="line" onclick="selectEquipment('${parent.id}')"><span>${escapeHtml(parent.name)}</span><span class="badge">Открыть</span></div>` : '<div class="item-meta">Нет родителя</div>'}</div>
    <div class="section"><h3>Дочерние единицы</h3>${nested.map(e => `<div class="line" onclick="selectEquipment('${e.id}')"><span>${escapeHtml(e.name)}</span><span class="badge">${escapeHtml(e.code)}</span></div>`).join('') || '<div class="item-meta">Нет дочерних единиц</div>'}</div>
    <div class="section"><h3>Размещение</h3>${location ? `<div class="line" onclick="selectObject('${location.id}')"><span>${escapeHtml(pathToObject(location.id))}</span><span class="badge">Открыть</span></div>` : '<div class="item-meta">Не размещено</div>'}</div>
    <div class="section"><h3>Техкарты</h3>${renderTcLines(tcs)}</div>
  `;
}
function renderTechCardDetails() {
  const item = techCardById(state.selectedTcId) || data.techCards[0];
  const target = item.entityType === 'object' ? objectById(item.entityId) : item.entityType === 'system' ? systemById(item.entityId) : equipmentById(item.entityId);
  return `
    <h2>${escapeHtml(item.name)}</h2><div class="type">${escapeHtml(item.workType)}</div>
    <div class="section"><h3>Основные данные</h3><div class="kv"><div>Цель</div><div>${escapeHtml(item.goal)}</div><div>Периодичность</div><div>${escapeHtml(item.periodicity)}</div><div>Статус</div><div><span class="badge ${statusClass(item.status)}">${escapeHtml(item.status)}</span></div><div>Привязка</div><div>${escapeHtml(target?.name || 'Не привязано')}</div></div></div>
    <div class="section"><h3>Операции</h3><div class="item-meta">Пустая ТК ожидает заполнения методологом.</div></div>
    <div class="section"><h3>Материалы, персонал, СИЗ</h3><div class="item-meta">Блоки подготовлены для заполнения.</div></div>
  `;
}
function renderDictionaryDetails() {
  return `<h2>Справочники</h2><div class="type">Единые значения для форм создания</div><div class="section"><h3>Что доступно</h3><div class="kv"><div>Виды объектов</div><div>${dictionaries.objectTypes.length}</div><div>Типы систем</div><div>${dictionaries.systemTypes.length}</div><div>Типы оборудования</div><div>${dictionaries.equipmentTypes.length}</div><div>Виды работ</div><div>${dictionaries.workTypes.length}</div></div></div>`;
}

function renderModal() {
  const type = state.modal.type;
  const titles = { object: 'Создать объект', bulkObject: 'Массовое создание объектов', system: 'Создать систему', equipment: 'Создать оборудование', roomEquipment: 'Добавить оборудование в помещение', techcard: 'Создать техкарту', dictionary: 'Добавить значение справочника' };
  return `
    <div class="modal-backdrop"><div class="modal">
      <header><strong>${titles[type]}</strong><button class="small" onclick="closeModal()">Закрыть</button></header>
      <main><form id="entityForm" class="form-grid">${modalFields(type)}</form></main>
      <footer><button onclick="submitModal(false)">Создать</button><button class="primary" onclick="submitModal(true)">Создать ещё</button><button class="ghost" onclick="closeModal()">Закрыть</button></footer>
    </div></div>
  `;
}
function options(list, selected) { return list.map(v => `<option value="${escapeHtml(v)}" ${v === selected ? 'selected' : ''}>${escapeHtml(v)}</option>`).join(''); }
function objectOptions(selected) { return data.objects.map(o => `<option value="${o.id}" ${o.id === selected ? 'selected' : ''}>${escapeHtml(pathToObject(o.id))}</option>`).join(''); }
function systemOptions(selected) { return data.systems.map(s => `<option value="${s.id}" ${s.id === selected ? 'selected' : ''}>${escapeHtml(s.name)}</option>`).join(''); }
function equipmentOptions(selected) { return data.equipment.map(e => `<option value="${e.id}" ${e.id === selected ? 'selected' : ''}>${escapeHtml(e.name)}</option>`).join(''); }
function modalFields(type) {
  if (type === 'object') return `
    <label>Название<input name="name" value="Новое помещение"></label><label>Вид объекта<select name="objectType">${options(dictionaries.objectTypes, 'Помещение')}</select></label>
    <label class="wide">Родитель<select name="parentId">${objectOptions(state.selectedObjectId)}</select></label><label>Код / внешний ID<input name="code" value="${nextCode('OBJ', data.objects.length)}"></label><label>Статус<select name="status">${options(dictionaries.statuses, 'Требует данных')}</select></label>
    <label>Ответственный<input name="owner" value="Инженер"></label><label>Площадь / размер<input name="area" value="0 м2"></label><label class="wide">Описание<textarea name="description">Создано из формы НСИ.</textarea></label>
  `;
  if (type === 'bulkObject') return `
    <label>Родитель<select name="parentId">${objectOptions(state.selectedObjectId)}</select></label><label>Вид объекта<select name="objectType">${options(dictionaries.objectTypes, 'Этаж')}</select></label>
    <label>Префикс названия<input name="namePrefix" value="Этаж"></label><label>Префикс кода<input name="codePrefix" value="FL"></label><label>Начальный номер<input name="start" type="number" value="1"></label><label>Количество<input name="count" type="number" value="3"></label>
  `;
  if (type === 'system') return `
    <label>Название<input name="name" value="Новая система"></label><label>Тип системы<select name="systemType">${options(dictionaries.systemTypes, 'Электроснабжение')}</select></label>
    <label>Родительский объект / помещение<select name="locationId">${objectOptions(state.selectedObjectId)}</select></label><label>Область действия<input name="scope" value="Все дочерние уровни"></label><label>Критичность<select name="criticality">${options(dictionaries.criticality, 'Средняя')}</select></label><label>Статус<select name="status">${options(dictionaries.statuses, 'Требует данных')}</select></label>
  `;
  if (type === 'equipment' || type === 'roomEquipment') return `
    <label>Название<input name="name" value="Новое оборудование"></label><label>Уровень оборудования<select name="level"><option>Группа / агрегат</option><option>Модель / типовая позиция</option><option selected>Конкретная единица</option></select></label>
    <label>Тип / класс<select name="equipmentType">${options(dictionaries.equipmentTypes, 'Внутренний блок')}</select></label><label>Система<select name="systemId"><option value="">Без системы</option>${systemOptions(state.selectedSystemId)}</select></label>
    <label>Родительское оборудование<select name="parentId"><option value="">Нет</option>${equipmentOptions('')}</select></label><label>Размещение<select name="locationId">${objectOptions(state.selectedObjectId)}</select></label>
    <label>Количество<input name="qty" type="number" value="1"></label><label>Код / инвентарный номер<input name="code" value="${nextCode('EQ', data.equipment.length)}"></label><label>Статус<select name="status">${options(dictionaries.statuses, 'Требует данных')}</select></label><label>Производитель<input name="manufacturer" value=""></label>
  `;
  if (type === 'techcard') return `
    <label>Название<input name="name" value="Новая техкарта"></label><label>Вид работ<select name="workType">${options(dictionaries.workTypes, 'Осмотр')}</select></label>
    <label>Привязка<select name="entityType"><option value="object">Помещение / объект</option><option value="system">Система</option><option value="equipment">Оборудование</option></select></label><label>ID цели<input name="entityId" value="${state.selectedObjectId}"></label><label>Периодичность<input name="periodicity" value="Ежемесячно"></label><label>Статус<select name="status">${options(dictionaries.statuses, 'Требует заполнения')}</select></label><label class="wide">Цель ТК<textarea name="goal">Пустой шаблон требует заполнения.</textarea></label>
  `;
  return `<label>Справочник<select name="dict"><option value="objectTypes">Виды объектов</option><option value="systemTypes">Типы систем</option><option value="equipmentTypes">Типы оборудования</option><option value="workTypes">Виды работ</option><option value="units">Единицы измерения</option><option value="statuses">Статусы</option><option value="criticality">Критичность</option></select></label><label>Новое значение<input name="value" value="Новое значение"></label>`;
}

function submitModal(again) {
  const form = document.getElementById('entityForm');
  const fd = new FormData(form);
  const type = state.modal.type;
  if (type === 'object') {
    const item = { id: idFromName('obj', fd.get('name')), parentId: fd.get('parentId'), name: fd.get('name'), type: fd.get('objectType'), code: fd.get('code'), status: fd.get('status'), owner: fd.get('owner'), area: fd.get('area'), description: fd.get('description') };
    data.objects.push(item); state.selectedObjectId = item.id;
  } else if (type === 'bulkObject') {
    const count = Number(fd.get('count') || 0); const start = Number(fd.get('start') || 1);
    for (let i = 0; i < count; i++) data.objects.push({ id: idFromName('obj', `${fd.get('namePrefix')} ${start + i}`), parentId: fd.get('parentId'), name: `${fd.get('namePrefix')} ${start + i}`, type: fd.get('objectType'), code: `${fd.get('codePrefix')}-${String(start + i).padStart(3, '0')}`, status: 'Требует данных', area: '0 м2' });
  } else if (type === 'system') {
    const item = { id: idFromName('sys', fd.get('name')), parentId: null, locationId: fd.get('locationId'), name: fd.get('name'), type: fd.get('systemType'), status: fd.get('status'), scope: fd.get('scope'), criticality: fd.get('criticality') };
    data.systems.push(item); state.selectedSystemId = item.id; state.selectedEquipmentId = null;
  } else if (type === 'equipment' || type === 'roomEquipment') {
    createEquipmentFromForm(fd);
  } else if (type === 'techcard') {
    const item = { id: idFromName('tc', fd.get('name')), entityType: fd.get('entityType'), entityId: fd.get('entityId'), name: fd.get('name'), workType: fd.get('workType'), periodicity: fd.get('periodicity'), status: fd.get('status'), goal: fd.get('goal') };
    data.techCards.push(item); state.selectedTcId = item.id;
  } else if (type === 'dictionary') {
    const key = fd.get('dict'); const value = fd.get('value'); if (value && !dictionaries[key].includes(value)) dictionaries[key].push(value);
  }
  if (again) { openModal(type); } else { closeModal(); }
}

function createEquipmentFromForm(fd) {
  const qty = Math.max(1, Number(fd.get('qty') || 1));
  const base = { systemId: fd.get('systemId') || null, locationId: fd.get('locationId'), type: fd.get('equipmentType'), unit: 'шт', status: fd.get('status'), manufacturer: fd.get('manufacturer'), noSystem: !fd.get('systemId') };
  if (qty > 1 && fd.get('level') !== 'Конкретная единица') {
    const group = { ...base, id: idFromName('eq', fd.get('name')), parentId: fd.get('parentId') || null, name: fd.get('name'), level: 'Группа / агрегат', qty, code: fd.get('code') };
    data.equipment.push(group);
    for (let i = 1; i <= qty; i++) data.equipment.push({ ...base, id: idFromName('eq', `${fd.get('code')}-${i}`), parentId: group.id, name: `${fd.get('name')} ${i}`, level: 'Конкретная единица', qty: 1, code: `${fd.get('code')}-${String(i).padStart(3, '0')}` });
    state.selectedEquipmentId = group.id;
  } else {
    const item = { ...base, id: idFromName('eq', fd.get('name')), parentId: fd.get('parentId') || null, name: fd.get('name'), level: fd.get('level'), qty, code: fd.get('code') };
    data.equipment.push(item); state.selectedEquipmentId = item.id;
  }
  state.tab = 'systems';
}

render();
