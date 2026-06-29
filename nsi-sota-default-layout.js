(function () {
  function setPlan(id, x, y, w, h, color) {
    const item = objectById(id);
    if (!item) return;
    item.plan = { floorId: 'floor-4', x, y, w, h, color };
  }

  function setParent(id, parentId) {
    const item = objectById(id);
    if (item) item.parentId = parentId;
  }

  setPlan('office-sota', 4, 7, 48, 88, '#f7fafc');
  setPlan('floor-4-right-wing', 56, 10, 38, 54, '#ffffff');
  setPlan('floor-4-core', 50, 35, 6, 18, '#eef3f8');
  setPlan('mop-4', 56, 68, 38, 16, '#eef3f8');

  [
    'room-open-space', 'sota-open-2', 'sota-open-3', 'sota-open-4', 'sota-open-5', 'sota-open-6',
    'sota-cabinet-01', 'sota-cabinet-02', 'sota-cabinet-03', 'sota-cabinet-04', 'sota-cabinet-05',
    'sota-cabinet-06', 'sota-cabinet-07', 'sota-cabinet-08', 'sota-cabinet-09', 'sota-cabinet-10',
    'room-meeting', 'sota-meeting-2', 'sota-meeting-3', 'sota-meeting-4', 'sota-meeting-5',
    'room-kitchen', 'room-server', 'corridor-4'
  ].forEach(id => setParent(id, 'office-sota'));

  setPlan('sota-cabinet-01', 6, 10, 8, 10, '#ffffff');
  setPlan('sota-cabinet-02', 42, 10, 8, 10, '#ffffff');
  setPlan('sota-cabinet-03', 6, 82, 8, 10, '#ffffff');
  setPlan('sota-cabinet-04', 42, 82, 8, 10, '#ffffff');

  setPlan('room-open-space', 15, 10, 11, 12, '#eef6f1');
  setPlan('sota-cabinet-05', 27, 10, 7, 10, '#ffffff');
  setPlan('sota-open-2', 35, 10, 6, 18, '#eef6f1');

  setPlan('sota-open-5', 15, 80, 11, 12, '#eef6f1');
  setPlan('sota-cabinet-06', 27, 82, 7, 10, '#ffffff');
  setPlan('sota-open-6', 35, 74, 6, 18, '#eef6f1');

  setPlan('sota-cabinet-07', 6, 24, 8, 10, '#ffffff');
  setPlan('sota-open-3', 6, 36, 8, 18, '#eef6f1');
  setPlan('sota-cabinet-08', 6, 56, 8, 10, '#ffffff');
  setPlan('sota-cabinet-09', 42, 24, 8, 10, '#ffffff');
  setPlan('sota-open-4', 42, 36, 8, 18, '#eef6f1');
  setPlan('sota-cabinet-10', 42, 56, 8, 10, '#ffffff');

  setPlan('room-meeting', 18, 31, 10, 10, '#e8f0f7');
  setPlan('sota-meeting-2', 29, 31, 10, 10, '#e8f0f7');
  setPlan('sota-meeting-3', 18, 43, 10, 10, '#e8f0f7');
  setPlan('sota-meeting-4', 29, 43, 10, 10, '#e8f0f7');
  setPlan('sota-meeting-5', 18, 55, 10, 10, '#e8f0f7');
  setPlan('room-kitchen', 29, 55, 10, 10, '#fbf4e4');

  setPlan('room-server', 44, 68, 6, 10, '#f3eef8');
  setPlan('corridor-4', 15, 68, 27, 8, '#eef3f8');

  state.selectedFloorId = 'floor-4';
  state.selectedObjectId = 'office-sota';
  state.planSelectedId = 'office-sota';
  render();
})();
