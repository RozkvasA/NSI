(function () {
  const floorOrder = {
    'floor--1': -1,
    'floor-1': 1,
    'floor-2': 2,
    'floor-3': 3,
    'floor-4': 4,
    'floor-5': 5,
    'floor-6': 6,
    'floor-7': 7
  };

  function put(list, item) {
    const index = list.findIndex(existing => existing.id === item.id);
    if (index >= 0) list[index] = { ...list[index], ...item };
    else list.push(item);
  }

  function shell(id, parentId, name, type, code, x, y, w, h, color, status = 'Частично заполнено') {
    put(data.objects, {
      id,
      parentId,
      name,
      type,
      code,
      status,
      area: type === 'Зона' || type === 'Офис' ? 'уточнить' : 'минимально заполнено',
      plan: { floorId: parentId, x, y, w, h, color }
    });
  }

  function lift(id, x, y) {
    shell(id, 'mop-4', `Лифт ${id.slice(-1)}`, 'Помещение', id.toUpperCase(), x, y, 2.3, 10.5, '#ffffff', 'Заполнено');
  }

  function floorNumber(item) {
    if (item.id in floorOrder) return floorOrder[item.id];
    const match = String(item.name || '').match(/-?\d+/);
    return match ? Number(match[0]) : 999;
  }

  function sortFloors() {
    data.objects.sort((a, b) => {
      const aFloor = a.parentId === 'bc-lucky' && a.type === 'Этаж';
      const bFloor = b.parentId === 'bc-lucky' && b.type === 'Этаж';
      if (aFloor && bFloor) return floorNumber(a) - floorNumber(b);
      if (aFloor) return -1;
      if (bFloor) return 1;
      return 0;
    });
  }

  function addGenericFloor(floorId, label, extra = '') {
    shell(`${floorId}-right-wing`, floorId, 'Правое крыло', 'Зона', `${floorId.toUpperCase()}-RW`, 1.2, 6, 26, 86, '#ffffff');
    shell(`${floorId}-mop`, floorId, 'МОП / лифты', 'Зона', `${floorId.toUpperCase()}-MOP`, 28.2, 6, 8, 86, '#eef3f8');
    shell(`${floorId}-left-wing`, floorId, label || 'Левое крыло', 'Зона', `${floorId.toUpperCase()}-LW`, 37.4, 6, 60.8, 86, '#f7fafc');
    if (extra) shell(`${floorId}-extra`, floorId, extra, 'Зона', `${floorId.toUpperCase()}-EXTRA`, 40, 42, 24, 12, '#eef6f1');
  }

  const office = objectById('office-sota');
  if (office?.plan) {
    const officeX = 37.4;
    const officeY = 6;
    const officeW = 60.8;
    const officeH = 86;
    data.objects
      .filter(item => item.parentId === 'office-sota' && item.plan && item.plan.floorId === 'floor-4')
      .forEach(item => {
        item.plan = {
          ...item.plan,
          x: officeX + item.plan.x * officeW / 100,
          y: officeY + item.plan.y * officeH / 100,
          w: item.plan.w * officeW / 100,
          h: item.plan.h * officeH / 100
        };
      });
    office.plan = { floorId: 'floor-4', x: officeX, y: officeY, w: officeW, h: officeH, color: '#f7fafc' };
  }

  shell('floor-4-right-wing', 'floor-4', 'Правое крыло', 'Зона', 'FL4-RIGHT-WING', 1.2, 6, 26, 86, '#ffffff', 'Частично заполнено');
  shell('mop-4', 'floor-4', 'МОП / 4 лифта', 'Зона', 'MOP-004', 28.2, 6, 8, 86, '#eef3f8', 'Заполнено');
  lift('lift-4-1', 29.1, 16);
  lift('lift-4-2', 32.8, 16);
  lift('lift-4-3', 29.1, 31);
  lift('lift-4-4', 32.8, 31);

  const cab10 = objectById('sota-bottom-cab-01');
  if (cab10?.plan && office?.plan) {
    cab10.plan.x = Math.max(cab10.plan.x, office.plan.x + 0.4);
    cab10.plan.y = Math.max(cab10.plan.y, office.plan.y + 0.4);
  }

  addGenericFloor('floor-1', 'Левое крыло / арендаторы', 'Лобби и входная группа');
  addGenericFloor('floor-2', 'Левое крыло / типовой офис');
  addGenericFloor('floor-3', 'Левое крыло / типовой офис');
  addGenericFloor('floor-5', 'Левое крыло / типовой офис');
  addGenericFloor('floor-6', 'Левое крыло / типовой офис');
  addGenericFloor('floor-7', 'Левое крыло / техзоны', 'Венткамеры / кровельные выходы');

  shell('floor--1-parking-left', 'floor--1', 'Паркинг левое крыло', 'Паркинг', 'PARK-L', 1.2, 6, 43, 86, '#ffffff');
  shell('floor--1-mop', 'floor--1', 'МОП / лифты', 'Зона', 'PARK-MOP', 45.5, 6, 8, 86, '#eef3f8');
  shell('floor--1-parking-right', 'floor--1', 'Паркинг правое крыло', 'Паркинг', 'PARK-R', 54.7, 6, 43.5, 86, '#ffffff');

  sortFloors();
  render();
})();
