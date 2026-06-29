(function () {
  const nonFourthFloors = ['floor--1', 'floor-1', 'floor-2', 'floor-3', 'floor-5', 'floor-6', 'floor-7'];

  function put(item) {
    const index = data.objects.findIndex(existing => existing.id === item.id);
    if (index >= 0) data.objects[index] = { ...data.objects[index], ...item };
    else data.objects.push(item);
  }

  function deleteByIds(ids) {
    const remove = new Set(ids);
    data.objects = data.objects.filter(item => !remove.has(item.id));
  }

  function clearNonFourthGeneratedPlan() {
    const generated = data.objects.filter(item => {
      if (!item.plan || !nonFourthFloors.includes(item.plan.floorId)) return false;
      if (item.id === 'parking-a' || item.id === 'pump-room' || item.id === 'itp' || item.id === 'lobby' || item.id === 'guard-post' || item.id === 'vent-chamber' || item.id === 'roof') return false;
      return item.id.includes('-rw-') || item.id.includes('-lw-') || item.id.includes('-lift-') || item.id.endsWith('-hall') || item.id.endsWith('-mop') || item.id.endsWith('-right-wing') || item.id.endsWith('-left-wing') || item.id.includes('parking-right-zone') || item.id.includes('-reception');
    }).map(item => item.id);
    deleteByIds(generated);
  }

  function zone(id, floorId, name, type, code, x, y, w, h, color, status = 'Частично заполнено') {
    put({
      id,
      parentId: floorId,
      name,
      type,
      code,
      status,
      area: 'уточнить',
      plan: { floorId, x, y, w, h, color }
    });
  }

  function child(id, parentId, name, type, code, x, y, w, h, color, status = 'Частично заполнено', area = 'уточнить') {
    const parent = objectById(parentId);
    const floorId = parent?.plan?.floorId || parentId;
    put({
      id,
      parentId,
      name,
      type,
      code,
      status,
      area,
      plan: { floorId, x, y, w, h, color }
    });
  }

  function baseFloor(floorId, rightName = 'Правое крыло', leftName = 'Левое крыло', mopName = 'МОП / лифты') {
    zone(`${floorId}-right-wing`, floorId, rightName, 'Зона', `${floorId.toUpperCase()}-RW`, 2, 8, 25, 82, '#ffffff');
    zone(`${floorId}-mop`, floorId, mopName, 'Зона', `${floorId.toUpperCase()}-MOP`, 29, 8, 9, 82, '#eef3f8', 'Заполнено');
    zone(`${floorId}-left-wing`, floorId, leftName, 'Зона', `${floorId.toUpperCase()}-LW`, 40, 8, 56, 82, '#f7fafc');
  }

  function mopChildren(floorId, prefix) {
    child(`${prefix}-lift-1`, `${floorId}-mop`, 'Лифт 1', 'Помещение', `${prefix.toUpperCase()}-L1`, 30.0, 16, 2.5, 9, '#ffffff', 'Заполнено');
    child(`${prefix}-lift-2`, `${floorId}-mop`, 'Лифт 2', 'Помещение', `${prefix.toUpperCase()}-L2`, 34.0, 16, 2.5, 9, '#ffffff', 'Заполнено');
    child(`${prefix}-lift-3`, `${floorId}-mop`, 'Лифт 3', 'Помещение', `${prefix.toUpperCase()}-L3`, 30.0, 29, 2.5, 9, '#ffffff', 'Заполнено');
    child(`${prefix}-lift-4`, `${floorId}-mop`, 'Лифт 4', 'Помещение', `${prefix.toUpperCase()}-L4`, 34.0, 29, 2.5, 9, '#ffffff', 'Заполнено');
    child(`${prefix}-hall`, `${floorId}-mop`, 'Лифтовой холл', 'Коридор', `${prefix.toUpperCase()}-HALL`, 30.0, 44, 6.5, 20, '#eef3f8', 'Заполнено');
  }

  function officeFloor(floorId, title) {
    baseFloor(floorId, `${title} / правое крыло`, `${title} / левое крыло`);
    mopChildren(floorId, floorId.replace('floor-', 'fl'));

    child(`${floorId}-rw-open`, `${floorId}-right-wing`, 'Open space правого крыла', 'Помещение', `${floorId.toUpperCase()}-RW-OS`, 4, 16, 20, 20, '#eef6f1');
    child(`${floorId}-rw-cab-1`, `${floorId}-right-wing`, 'Кабинет правого крыла 01', 'Кабинет', `${floorId.toUpperCase()}-RW-CAB1`, 4, 44, 9, 18, '#ffffff');
    child(`${floorId}-rw-cab-2`, `${floorId}-right-wing`, 'Кабинет правого крыла 02', 'Кабинет', `${floorId.toUpperCase()}-RW-CAB2`, 15, 44, 9, 18, '#ffffff');
    child(`${floorId}-rw-service`, `${floorId}-right-wing`, 'Подсобное правого крыла', 'Техническое помещение', `${floorId.toUpperCase()}-RW-SRV`, 4, 68, 20, 12, '#f3eef8');

    child(`${floorId}-lw-open`, `${floorId}-left-wing`, 'Open space левого крыла', 'Помещение', `${floorId.toUpperCase()}-LW-OS`, 42, 16, 26, 20, '#eef6f1');
    child(`${floorId}-lw-meeting`, `${floorId}-left-wing`, 'Переговорка левого крыла', 'Помещение', `${floorId.toUpperCase()}-LW-MTG`, 70, 16, 12, 20, '#e8f0f7');
    child(`${floorId}-lw-cab-1`, `${floorId}-left-wing`, 'Кабинет левого крыла 01', 'Кабинет', `${floorId.toUpperCase()}-LW-CAB1`, 42, 48, 10, 18, '#ffffff');
    child(`${floorId}-lw-cab-2`, `${floorId}-left-wing`, 'Кабинет левого крыла 02', 'Кабинет', `${floorId.toUpperCase()}-LW-CAB2`, 54, 48, 10, 18, '#ffffff');
    child(`${floorId}-lw-cab-3`, `${floorId}-left-wing`, 'Кабинет левого крыла 03', 'Кабинет', `${floorId.toUpperCase()}-LW-CAB3`, 66, 48, 10, 18, '#ffffff');
    child(`${floorId}-lw-service`, `${floorId}-left-wing`, 'Сервис левого крыла', 'Техническое помещение', `${floorId.toUpperCase()}-LW-SRV`, 78, 48, 12, 18, '#f3eef8');
  }

  function parkingFloor() {
    zone('floor--1-parking-right', 'floor--1', 'Паркинг правое крыло', 'Паркинг', 'PARK-R', 2, 8, 36, 82, '#ffffff');
    zone('floor--1-mop', 'floor--1', 'МОП / лифты', 'Зона', 'PARK-MOP', 40, 8, 9, 82, '#eef3f8', 'Заполнено');
    zone('floor--1-parking-left', 'floor--1', 'Паркинг левое крыло', 'Паркинг', 'PARK-L', 51, 8, 45, 82, '#ffffff');

    child('floor--1-parking-right-zone', 'floor--1-parking-right', 'Парковочные места правого крыла', 'Паркинг', 'PARK-R-ZONE', 4, 18, 30, 28, '#ffffff');
    child('floor--1-drive-right', 'floor--1-parking-right', 'Проезд правого крыла', 'Коридор', 'PARK-R-DRIVE', 4, 56, 30, 14, '#eef3f8');
    child('parking-a', 'floor--1-parking-left', 'Паркинг А', 'Паркинг', 'PRK-A', 54, 18, 34, 28, '#ffffff', 'Частично заполнено', '2 400 м2');
    child('floor--1-drive-left', 'floor--1-parking-left', 'Проезд левого крыла', 'Коридор', 'PARK-L-DRIVE', 54, 56, 34, 14, '#eef3f8');
    child('pump-room', 'floor--1-mop', 'Насосная', 'Техническое помещение', 'ROOM-PUMP', 41, 50, 3, 12, '#f3eef8', 'Частично заполнено', '84 м2');
    child('itp', 'floor--1-mop', 'ИТП', 'Техническое помещение', 'ROOM-ITP', 45, 50, 3, 12, '#f3eef8', 'Частично заполнено', '96 м2');
  }

  function firstFloor() {
    baseFloor('floor-1', 'Правое крыло / арендаторы', 'Левое крыло / входная группа');
    mopChildren('floor-1', 'fl1');
    child('floor-1-rw-rent', 'floor-1-right-wing', 'Арендный блок', 'Помещение', 'FL1-RW-RENT', 4, 16, 20, 24, '#eef6f1');
    child('floor-1-rw-service', 'floor-1-right-wing', 'Сервис правого крыла', 'Техническое помещение', 'FL1-RW-SRV', 4, 52, 20, 18, '#f3eef8');
    child('lobby', 'floor-1-left-wing', 'Лобби', 'Помещение', 'ROOM-LOBBY', 42, 16, 24, 24, '#eef3f8', 'Частично заполнено', '310 м2');
    child('guard-post', 'floor-1-left-wing', 'Пост охраны', 'Помещение', 'ROOM-GUARD', 68, 16, 10, 16, '#ffffff', 'Требует данных', '18 м2');
    child('floor-1-reception', 'floor-1-left-wing', 'Ресепшн', 'Помещение', 'FL1-RECEPTION', 80, 16, 10, 16, '#eef3f8');
    child('floor-1-waiting', 'floor-1-left-wing', 'Зона ожидания', 'Зона', 'FL1-WAIT', 42, 52, 48, 18, '#eef6f1');
  }

  function seventhFloor() {
    baseFloor('floor-7', 'Правое крыло / техзоны', 'Левое крыло / техзоны');
    mopChildren('floor-7', 'fl7');
    child('floor-7-rw-tech', 'floor-7-right-wing', 'Техзона правого крыла', 'Техническое помещение', 'FL7-RW-TECH', 4, 16, 20, 24, '#f3eef8');
    child('floor-7-rw-service', 'floor-7-right-wing', 'Сервис правого крыла', 'Техническое помещение', 'FL7-RW-SRV', 4, 52, 20, 18, '#f3eef8');
    child('vent-chamber', 'floor-7-left-wing', 'Венткамера', 'Техническое помещение', 'ROOM-VENT', 42, 16, 22, 24, '#f3eef8', 'Частично заполнено', '130 м2');
    child('roof', 'floor-7-left-wing', 'Кровля', 'Кровля', 'ROOF', 66, 16, 24, 24, '#eef3f8', 'Требует данных', '1 140 м2');
  }

  function fourthFloorMop() {
    child('lift-4-1', 'mop-4', 'Лифт 1', 'Помещение', 'LIFT-4-1', 29.1, 16, 2.3, 9, '#ffffff', 'Заполнено');
    child('lift-4-2', 'mop-4', 'Лифт 2', 'Помещение', 'LIFT-4-2', 32.8, 16, 2.3, 9, '#ffffff', 'Заполнено');
    child('lift-4-3', 'mop-4', 'Лифт 3', 'Помещение', 'LIFT-4-3', 29.1, 29, 2.3, 9, '#ffffff', 'Заполнено');
    child('lift-4-4', 'mop-4', 'Лифт 4', 'Помещение', 'LIFT-4-4', 32.8, 29, 2.3, 9, '#ffffff', 'Заполнено');
    child('lift-hall-4', 'mop-4', 'Лифтовой холл', 'Коридор', 'LIFT-HALL-4', 29.1, 43, 6.4, 18, '#eef3f8', 'Заполнено');
  }

  clearNonFourthGeneratedPlan();
  parkingFloor();
  firstFloor();
  officeFloor('floor-2', '2 этаж');
  officeFloor('floor-3', '3 этаж');
  officeFloor('floor-5', '5 этаж');
  officeFloor('floor-6', '6 этаж');
  seventhFloor();
  fourthFloorMop();

  render();
})();
