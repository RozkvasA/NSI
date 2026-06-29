(function () {
  const floors = ['floor--1', 'floor-1', 'floor-2', 'floor-3', 'floor-5', 'floor-6', 'floor-7'];
  const floorOrder = { 'floor--1': -1, 'floor-1': 1, 'floor-2': 2, 'floor-3': 3, 'floor-4': 4, 'floor-5': 5, 'floor-6': 6, 'floor-7': 7 };
  const childOrder = {
    'right-wing': 10,
    'mop': 20,
    'left-wing': 30,
    'parking-right': 10,
    'parking-left': 30,
    'office-sota': 40
  };

  function put(item) {
    const index = data.objects.findIndex(existing => existing.id === item.id);
    if (index >= 0) data.objects[index] = { ...data.objects[index], ...item };
    else data.objects.push(item);
  }

  function removeNonFourthPlanObjects() {
    data.objects = data.objects.filter(item => !(item.plan && floors.includes(item.plan.floorId)));
  }

  function plan(floorId, x, y, w, h, color) {
    return { floorId, x, y, w, h, color };
  }

  function zone(floorId, suffix, name, type, code, x, y, w, h, color, status = 'Частично заполнено') {
    const id = `${floorId}-${suffix}`;
    put({ id, parentId: floorId, name, type, code, status, area: 'уточнить', plan: plan(floorId, x, y, w, h, color) });
    return id;
  }

  function room(id, parentId, floorId, name, type, code, x, y, w, h, color, status = 'Частично заполнено', area = 'уточнить') {
    put({ id, parentId, name, type, code, status, area, plan: plan(floorId, x, y, w, h, color) });
  }

  function baseFloor(floorId, names = {}) {
    const right = zone(floorId, 'right-wing', names.right || 'Правое крыло', names.rightType || 'Зона', `${floorId.toUpperCase()}-RW`, 1.2, 6, 26, 86, '#ffffff');
    const mop = zone(floorId, 'mop', names.mop || 'МОП / лифты', 'Зона', `${floorId.toUpperCase()}-MOP`, 28.2, 6, 8, 86, '#eef3f8', 'Заполнено');
    const left = zone(floorId, 'left-wing', names.left || 'Левое крыло', names.leftType || 'Зона', `${floorId.toUpperCase()}-LW`, 37.4, 6, 60.8, 86, '#f7fafc');
    return { right, mop, left };
  }

  function addMopRooms(floorId, mopId, prefix) {
    room(`${prefix}-lift-1`, mopId, floorId, 'Лифт 1', 'Помещение', `${prefix.toUpperCase()}-L1`, 29.0, 14, 2.6, 10, '#ffffff', 'Заполнено');
    room(`${prefix}-lift-2`, mopId, floorId, 'Лифт 2', 'Помещение', `${prefix.toUpperCase()}-L2`, 33.7, 14, 2.6, 10, '#ffffff', 'Заполнено');
    room(`${prefix}-lift-3`, mopId, floorId, 'Лифт 3', 'Помещение', `${prefix.toUpperCase()}-L3`, 29.0, 28, 2.6, 10, '#ffffff', 'Заполнено');
    room(`${prefix}-lift-4`, mopId, floorId, 'Лифт 4', 'Помещение', `${prefix.toUpperCase()}-L4`, 33.7, 28, 2.6, 10, '#ffffff', 'Заполнено');
    room(`${prefix}-hall`, mopId, floorId, 'Лифтовой холл', 'Коридор', `${prefix.toUpperCase()}-HALL`, 29.0, 46, 7.3, 18, '#eef3f8', 'Заполнено');
  }

  function typicalOfficeFloor(floorId, title) {
    const ids = baseFloor(floorId, { right: `${title} / правое крыло`, left: `${title} / левое крыло` });
    addMopRooms(floorId, ids.mop, floorId.replace('floor-', 'fl'));

    room(`${floorId}-rw-os`, ids.right, floorId, 'Open space правого крыла', 'Помещение', `${floorId.toUpperCase()}-RW-OS`, 3.2, 14, 20.5, 18, '#eef6f1');
    room(`${floorId}-rw-cab-01`, ids.right, floorId, 'Кабинет правого крыла 01', 'Кабинет', `${floorId.toUpperCase()}-RW-CAB01`, 3.2, 42, 9.2, 17, '#ffffff');
    room(`${floorId}-rw-cab-02`, ids.right, floorId, 'Кабинет правого крыла 02', 'Кабинет', `${floorId.toUpperCase()}-RW-CAB02`, 14.4, 42, 9.2, 17, '#ffffff');
    room(`${floorId}-rw-tech`, ids.right, floorId, 'Тех. помещение правого крыла', 'Техническое помещение', `${floorId.toUpperCase()}-RW-TECH`, 3.2, 68, 20.5, 12, '#f3eef8');

    room(`${floorId}-lw-os`, ids.left, floorId, 'Open space левого крыла', 'Помещение', `${floorId.toUpperCase()}-LW-OS`, 40.0, 14, 26.5, 18, '#eef6f1');
    room(`${floorId}-lw-meeting`, ids.left, floorId, 'Переговорка левого крыла', 'Помещение', `${floorId.toUpperCase()}-LW-MTG`, 69.0, 14, 13.0, 18, '#e8f0f7');
    room(`${floorId}-lw-cab-01`, ids.left, floorId, 'Кабинет левого крыла 01', 'Кабинет', `${floorId.toUpperCase()}-LW-CAB01`, 40.0, 45, 10.5, 17, '#ffffff');
    room(`${floorId}-lw-cab-02`, ids.left, floorId, 'Кабинет левого крыла 02', 'Кабинет', `${floorId.toUpperCase()}-LW-CAB02`, 52.5, 45, 10.5, 17, '#ffffff');
    room(`${floorId}-lw-cab-03`, ids.left, floorId, 'Кабинет левого крыла 03', 'Кабинет', `${floorId.toUpperCase()}-LW-CAB03`, 65.0, 45, 10.5, 17, '#ffffff');
    room(`${floorId}-lw-tech`, ids.left, floorId, 'Сервис левого крыла', 'Техническое помещение', `${floorId.toUpperCase()}-LW-TECH`, 79.0, 45, 12.0, 17, '#f3eef8');
  }

  function parkingFloor() {
    const ids = baseFloor('floor--1', {
      right: 'Паркинг правое крыло',
      rightType: 'Паркинг',
      mop: 'МОП / лифты',
      left: 'Паркинг левое крыло',
      leftType: 'Паркинг'
    });
    addMopRooms('floor--1', ids.mop, 'flm1');
    room('floor--1-rw-parking', ids.right, 'floor--1', 'Парковочные места правого крыла', 'Паркинг', 'PARK-R-ZONE', 3.2, 16, 20.5, 26, '#ffffff');
    room('floor--1-rw-drive', ids.right, 'floor--1', 'Проезд правого крыла', 'Коридор', 'PARK-R-DRIVE', 3.2, 56, 20.5, 14, '#eef3f8');
    room('parking-a', ids.left, 'floor--1', 'Паркинг А', 'Паркинг', 'PRK-A', 40.0, 16, 32.0, 26, '#ffffff', 'Частично заполнено', '2 400 м2');
    room('floor--1-lw-drive', ids.left, 'floor--1', 'Проезд левого крыла', 'Коридор', 'PARK-L-DRIVE', 40.0, 56, 32.0, 14, '#eef3f8');
    room('pump-room', ids.mop, 'floor--1', 'Насосная', 'Техническое помещение', 'ROOM-PUMP', 29.0, 68, 3.2, 12, '#f3eef8', 'Частично заполнено', '84 м2');
    room('itp', ids.mop, 'floor--1', 'ИТП', 'Техническое помещение', 'ROOM-ITP', 33.2, 68, 3.2, 12, '#f3eef8', 'Частично заполнено', '96 м2');
  }

  function firstFloor() {
    const ids = baseFloor('floor-1', { right: 'Правое крыло / арендаторы', left: 'Левое крыло / входная группа' });
    addMopRooms('floor-1', ids.mop, 'fl1');
    room('floor-1-rw-rent', ids.right, 'floor-1', 'Арендный блок', 'Помещение', 'FL1-RW-RENT', 3.2, 16, 20.5, 24, '#eef6f1');
    room('floor-1-rw-tech', ids.right, 'floor-1', 'Сервис правого крыла', 'Техническое помещение', 'FL1-RW-TECH', 3.2, 56, 20.5, 14, '#f3eef8');
    room('lobby', ids.left, 'floor-1', 'Лобби', 'Помещение', 'ROOM-LOBBY', 40.0, 16, 23.0, 24, '#eef3f8', 'Частично заполнено', '310 м2');
    room('guard-post', ids.left, 'floor-1', 'Пост охраны', 'Помещение', 'ROOM-GUARD', 66.0, 16, 10.0, 16, '#ffffff', 'Требует данных', '18 м2');
    room('floor-1-reception', ids.left, 'floor-1', 'Ресепшн', 'Помещение', 'FL1-RECEPTION', 79.0, 16, 12.0, 16, '#eef3f8');
    room('floor-1-waiting', ids.left, 'floor-1', 'Зона ожидания', 'Зона', 'FL1-WAIT', 40.0, 54, 51.0, 16, '#eef6f1');
  }

  function techFloor() {
    const ids = baseFloor('floor-7', { right: 'Правое крыло / техзоны', left: 'Левое крыло / техзоны' });
    addMopRooms('floor-7', ids.mop, 'fl7');
    room('floor-7-rw-tech', ids.right, 'floor-7', 'Техзона правого крыла', 'Техническое помещение', 'FL7-RW-TECH', 3.2, 16, 20.5, 24, '#f3eef8');
    room('floor-7-rw-service', ids.right, 'floor-7', 'Сервис правого крыла', 'Техническое помещение', 'FL7-RW-SRV', 3.2, 56, 20.5, 14, '#f3eef8');
    room('vent-chamber', ids.left, 'floor-7', 'Венткамера', 'Техническое помещение', 'ROOM-VENT', 40.0, 16, 22.0, 24, '#f3eef8', 'Частично заполнено', '130 м2');
    room('roof', ids.left, 'floor-7', 'Кровля', 'Кровля', 'ROOF', 65.0, 16, 26.0, 24, '#eef3f8', 'Требует данных', '1 140 м2');
  }

  function addFourthMopRooms() {
    room('lift-4-1', 'mop-4', 'floor-4', 'Лифт 1', 'Помещение', 'LIFT-4-1', 29.0, 14, 2.6, 10, '#ffffff', 'Заполнено');
    room('lift-4-2', 'mop-4', 'floor-4', 'Лифт 2', 'Помещение', 'LIFT-4-2', 33.7, 14, 2.6, 10, '#ffffff', 'Заполнено');
    room('lift-4-3', 'mop-4', 'floor-4', 'Лифт 3', 'Помещение', 'LIFT-4-3', 29.0, 28, 2.6, 10, '#ffffff', 'Заполнено');
    room('lift-4-4', 'mop-4', 'floor-4', 'Лифт 4', 'Помещение', 'LIFT-4-4', 33.7, 28, 2.6, 10, '#ffffff', 'Заполнено');
    room('lift-hall-4', 'mop-4', 'floor-4', 'Лифтовой холл', 'Коридор', 'LIFT-HALL-4', 29.0, 46, 7.3, 18, '#eef3f8', 'Заполнено');
  }

  function sortObjectsForTree() {
    data.objects.sort((a, b) => {
      if (a.parentId === 'bc-lucky' && b.parentId === 'bc-lucky' && a.type === 'Этаж' && b.type === 'Этаж') {
        return (floorOrder[a.id] ?? 999) - (floorOrder[b.id] ?? 999);
      }
      if (a.parentId === b.parentId) {
        const ao = Object.entries(childOrder).find(([key]) => a.id.includes(key))?.[1] ?? 100;
        const bo = Object.entries(childOrder).find(([key]) => b.id.includes(key))?.[1] ?? 100;
        if (ao !== bo) return ao - bo;
        return String(a.code || a.name).localeCompare(String(b.code || b.name), 'ru');
      }
      return 0;
    });
  }

  removeNonFourthPlanObjects();
  parkingFloor();
  firstFloor();
  typicalOfficeFloor('floor-2', '2 этаж');
  typicalOfficeFloor('floor-3', '3 этаж');
  typicalOfficeFloor('floor-5', '5 этаж');
  typicalOfficeFloor('floor-6', '6 этаж');
  techFloor();
  addFourthMopRooms();
  sortObjectsForTree();
  render();
})();
