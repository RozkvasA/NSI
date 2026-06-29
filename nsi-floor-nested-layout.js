(function () {
  const floorIds = ['floor--1', 'floor-1', 'floor-2', 'floor-3', 'floor-5', 'floor-6', 'floor-7'];

  function put(item) {
    const index = data.objects.findIndex(existing => existing.id === item.id);
    if (index >= 0) data.objects[index] = { ...data.objects[index], ...item };
    else data.objects.push(item);
  }

  function removeGeneratedFloorItems() {
    const generatedPrefixes = [
      'floor--1-parking-left', 'floor--1-parking-right', 'floor--1-mop',
      'floor-1-right-wing', 'floor-1-left-wing', 'floor-1-mop', 'floor-1-extra',
      'floor-2-right-wing', 'floor-2-left-wing', 'floor-2-mop', 'floor-2-extra',
      'floor-3-right-wing', 'floor-3-left-wing', 'floor-3-mop', 'floor-3-extra',
      'floor-5-right-wing', 'floor-5-left-wing', 'floor-5-mop', 'floor-5-extra',
      'floor-6-right-wing', 'floor-6-left-wing', 'floor-6-mop', 'floor-6-extra',
      'floor-7-right-wing', 'floor-7-left-wing', 'floor-7-mop', 'floor-7-extra'
    ];
    data.objects = data.objects.filter(item => {
      if (!item.id) return true;
      if (generatedPrefixes.some(prefix => item.id === prefix || item.id.startsWith(`${prefix}-`))) return false;
      return true;
    });
  }

  function item(id, parentId, name, type, code, x, y, w, h, color, status = 'Частично заполнено', area = 'уточнить') {
    put({
      id,
      parentId,
      name,
      type,
      code,
      status,
      area,
      plan: { floorId: parentId.startsWith('floor-') ? parentId : objectById(parentId)?.plan?.floorId || parentId, x, y, w, h, color }
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

  function baseFloor(floorId, leftLabel = 'Левое крыло', rightLabel = 'Правое крыло', mopLabel = 'МОП / лифты') {
    item(`${floorId}-right-wing`, floorId, rightLabel, 'Зона', `${floorId.toUpperCase()}-RW`, 1.2, 6, 26, 86, '#ffffff');
    item(`${floorId}-mop`, floorId, mopLabel, 'Зона', `${floorId.toUpperCase()}-MOP`, 28.2, 6, 8, 86, '#eef3f8');
    item(`${floorId}-left-wing`, floorId, leftLabel, 'Зона', `${floorId.toUpperCase()}-LW`, 37.4, 6, 60.8, 86, '#f7fafc');
  }

  function lifts(parentId, prefix) {
    child(`${prefix}-lift-1`, parentId, 'Лифт 1', 'Помещение', `${prefix.toUpperCase()}-L1`, 29.1, 16, 2.3, 10.5, '#ffffff', 'Заполнено');
    child(`${prefix}-lift-2`, parentId, 'Лифт 2', 'Помещение', `${prefix.toUpperCase()}-L2`, 32.8, 16, 2.3, 10.5, '#ffffff', 'Заполнено');
    child(`${prefix}-lift-3`, parentId, 'Лифт 3', 'Помещение', `${prefix.toUpperCase()}-L3`, 29.1, 31, 2.3, 10.5, '#ffffff', 'Заполнено');
    child(`${prefix}-lift-4`, parentId, 'Лифт 4', 'Помещение', `${prefix.toUpperCase()}-L4`, 32.8, 31, 2.3, 10.5, '#ffffff', 'Заполнено');
    child(`${prefix}-hall`, parentId, 'Лифтовой холл', 'Коридор', `${prefix.toUpperCase()}-HALL`, 28.9, 45, 6.5, 18, '#eef3f8');
  }

  function officeFloor(floorId, levelName, extra = '') {
    baseFloor(floorId, `${levelName} / левое крыло`, `${levelName} / правое крыло`);
    lifts(`${floorId}-mop`, floorId.replace('floor-', 'fl'));

    child(`${floorId}-rw-open`, `${floorId}-right-wing`, 'Open space правого крыла', 'Помещение', `${floorId.toUpperCase()}-RW-OS`, 3, 14, 20, 28, '#eef6f1');
    child(`${floorId}-rw-cab-1`, `${floorId}-right-wing`, 'Кабинет правого крыла 01', 'Кабинет', `${floorId.toUpperCase()}-RW-CAB1`, 3, 48, 8, 20, '#ffffff');
    child(`${floorId}-rw-cab-2`, `${floorId}-right-wing`, 'Кабинет правого крыла 02', 'Кабинет', `${floorId.toUpperCase()}-RW-CAB2`, 12, 48, 8, 20, '#ffffff');

    child(`${floorId}-lw-open`, `${floorId}-left-wing`, 'Open space левого крыла', 'Помещение', `${floorId.toUpperCase()}-LW-OS`, 40, 14, 28, 28, '#eef6f1');
    child(`${floorId}-lw-meeting`, `${floorId}-left-wing`, 'Переговорка левого крыла', 'Помещение', `${floorId.toUpperCase()}-LW-MTG`, 70, 14, 12, 18, '#e8f0f7');
    child(`${floorId}-lw-cab-1`, `${floorId}-left-wing`, 'Кабинет левого крыла 01', 'Кабинет', `${floorId.toUpperCase()}-LW-CAB1`, 40, 50, 10, 22, '#ffffff');
    child(`${floorId}-lw-cab-2`, `${floorId}-left-wing`, 'Кабинет левого крыла 02', 'Кабинет', `${floorId.toUpperCase()}-LW-CAB2`, 52, 50, 10, 22, '#ffffff');
    if (extra) child(`${floorId}-lw-extra`, `${floorId}-left-wing`, extra, 'Зона', `${floorId.toUpperCase()}-LW-EXTRA`, 70, 50, 18, 16, '#eef3f8');
  }

  function parkingFloor() {
    item('floor--1-parking-right', 'floor--1', 'Паркинг правое крыло', 'Паркинг', 'PARK-R', 1.2, 6, 43, 86, '#ffffff');
    item('floor--1-mop', 'floor--1', 'МОП / лифты', 'Зона', 'PARK-MOP', 45.5, 6, 8, 86, '#eef3f8');
    item('floor--1-parking-left', 'floor--1', 'Паркинг левое крыло', 'Паркинг', 'PARK-L', 54.7, 6, 43.5, 86, '#ffffff');

    child('parking-a', 'floor--1-parking-left', 'Паркинг А', 'Паркинг', 'PRK-A', 57, 14, 34, 30, '#ffffff', 'Частично заполнено', '2 400 м2');
    child('pump-room', 'floor--1-mop', 'Насосная', 'Техническое помещение', 'ROOM-PUMP', 46.1, 55, 2.8, 12, '#f3eef8', 'Частично заполнено', '84 м2');
    child('itp', 'floor--1-mop', 'ИТП', 'Техническое помещение', 'ROOM-ITP', 49.3, 55, 2.8, 12, '#f3eef8', 'Частично заполнено', '96 м2');
    child('floor--1-parking-right-zone', 'floor--1-parking-right', 'Парковочные места правого крыла', 'Паркинг', 'PARK-R-ZONE', 4, 14, 34, 30, '#ffffff');
  }

  function firstFloor() {
    baseFloor('floor-1', 'Левое крыло / входная группа', 'Правое крыло / арендаторы', 'МОП / лифты');
    lifts('floor-1-mop', 'fl1');
    child('lobby', 'floor-1-left-wing', 'Лобби', 'Помещение', 'ROOM-LOBBY', 40, 12, 24, 30, '#eef3f8', 'Частично заполнено', '310 м2');
    child('guard-post', 'floor-1-left-wing', 'Пост охраны', 'Помещение', 'ROOM-GUARD', 66, 12, 10, 18, '#ffffff', 'Требует данных', '18 м2');
    child('floor-1-reception', 'floor-1-left-wing', 'Ресепшн', 'Помещение', 'FL1-RECEPTION', 78, 12, 12, 18, '#eef3f8');
    child('floor-1-rw-rent', 'floor-1-right-wing', 'Арендный блок', 'Помещение', 'FL1-RW-RENT', 3, 14, 20, 34, '#eef6f1');
  }

  function seventhFloor() {
    baseFloor('floor-7', 'Левое крыло / техзоны', 'Правое крыло / техзоны', 'МОП / лифты');
    lifts('floor-7-mop', 'fl7');
    child('vent-chamber', 'floor-7-left-wing', 'Венткамера', 'Техническое помещение', 'ROOM-VENT', 40, 14, 22, 24, '#f3eef8', 'Частично заполнено', '130 м2');
    child('roof', 'floor-7-left-wing', 'Кровля', 'Кровля', 'ROOF', 64, 14, 24, 24, '#eef3f8', 'Требует данных', '1 140 м2');
    child('floor-7-rw-tech', 'floor-7-right-wing', 'Техзона правого крыла', 'Техническое помещение', 'FL7-RW-TECH', 3, 14, 20, 28, '#f3eef8');
  }

  removeGeneratedFloorItems();
  parkingFloor();
  firstFloor();
  officeFloor('floor-2', '2 этаж');
  officeFloor('floor-3', '3 этаж');
  officeFloor('floor-5', '5 этаж');
  officeFloor('floor-6', '6 этаж');
  seventhFloor();

  if (state.selectedFloorId !== 'floor-4' && !floorIds.includes(state.selectedFloorId)) {
    state.selectedFloorId = 'floor-4';
  }

  render();
})();
