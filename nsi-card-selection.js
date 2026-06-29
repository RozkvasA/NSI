function selectSystem(id) {
  state.selectedSystemId = id;
  state.selectedEquipmentId = null;
  state.tab = 'systems';
  render();
}

function selectEquipment(id) {
  state.selectedEquipmentId = id;
  state.tab = 'systems';
  render();
}
