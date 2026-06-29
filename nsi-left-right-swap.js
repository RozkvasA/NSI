(function () {
  function swapLeftRightText(value) {
    return String(value || '')
      .replaceAll('Правое', '__TMP_LEFT_RIGHT_SWAP_1__')
      .replaceAll('правое', '__TMP_LEFT_RIGHT_SWAP_2__')
      .replaceAll('Правого', '__TMP_LEFT_RIGHT_SWAP_3__')
      .replaceAll('правого', '__TMP_LEFT_RIGHT_SWAP_4__')
      .replaceAll('Правый', '__TMP_LEFT_RIGHT_SWAP_5__')
      .replaceAll('правый', '__TMP_LEFT_RIGHT_SWAP_6__')
      .replaceAll('Правом', '__TMP_LEFT_RIGHT_SWAP_7__')
      .replaceAll('правом', '__TMP_LEFT_RIGHT_SWAP_8__')
      .replaceAll('Правой', '__TMP_LEFT_RIGHT_SWAP_9__')
      .replaceAll('правой', '__TMP_LEFT_RIGHT_SWAP_10__')
      .replaceAll('Правую', '__TMP_LEFT_RIGHT_SWAP_11__')
      .replaceAll('правую', '__TMP_LEFT_RIGHT_SWAP_12__')
      .replaceAll('Левое', 'Правое')
      .replaceAll('левое', 'правое')
      .replaceAll('Левого', 'Правого')
      .replaceAll('левого', 'правого')
      .replaceAll('Левый', 'Правый')
      .replaceAll('левый', 'правый')
      .replaceAll('Левом', 'Правом')
      .replaceAll('левом', 'правом')
      .replaceAll('Левой', 'Правой')
      .replaceAll('левой', 'правой')
      .replaceAll('Левую', 'Правую')
      .replaceAll('левую', 'правую')
      .replaceAll('__TMP_LEFT_RIGHT_SWAP_1__', 'Левое')
      .replaceAll('__TMP_LEFT_RIGHT_SWAP_2__', 'левое')
      .replaceAll('__TMP_LEFT_RIGHT_SWAP_3__', 'Левого')
      .replaceAll('__TMP_LEFT_RIGHT_SWAP_4__', 'левого')
      .replaceAll('__TMP_LEFT_RIGHT_SWAP_5__', 'Левый')
      .replaceAll('__TMP_LEFT_RIGHT_SWAP_6__', 'левый')
      .replaceAll('__TMP_LEFT_RIGHT_SWAP_7__', 'Левом')
      .replaceAll('__TMP_LEFT_RIGHT_SWAP_8__', 'левом')
      .replaceAll('__TMP_LEFT_RIGHT_SWAP_9__', 'Левой')
      .replaceAll('__TMP_LEFT_RIGHT_SWAP_10__', 'левой')
      .replaceAll('__TMP_LEFT_RIGHT_SWAP_11__', 'Левую')
      .replaceAll('__TMP_LEFT_RIGHT_SWAP_12__', 'левую');
  }

  function swapEntity(entity) {
    if (!entity) return;
    ['name', 'description', 'purpose', 'scope'].forEach(field => {
      if (typeof entity[field] === 'string') entity[field] = swapLeftRightText(entity[field]);
    });
  }

  data.objects.forEach(swapEntity);
  data.systems.forEach(swapEntity);
  data.equipment.forEach(swapEntity);
  data.techCards.forEach(swapEntity);
  data.history.forEach(item => {
    if (typeof item.text === 'string') item.text = swapLeftRightText(item.text);
  });

  render();
})();
