const { PRESET_SKINS, DEFAULT_SKIN } = require('../shared/skins');

function renderPresetSkins(container, selectedSkin = DEFAULT_SKIN) {
  if (!container) return [];

  const customItem = container.querySelector('.custom-skin-item');
  container.querySelectorAll('.skin-item:not(.custom-skin-item)').forEach((el) => el.remove());

  const items = [];
  Object.entries(PRESET_SKINS).forEach(([skinName, assetPath]) => {
    const item = document.createElement('div');
    item.className = 'skin-item';
    if (skinName === selectedSkin) {
      item.classList.add('selected');
    }
    item.dataset.skin = skinName;
    item.draggable = true;

    const img = document.createElement('img');
    img.src = `../../${assetPath}`;
    img.alt = skinName;

    const span = document.createElement('span');
    span.textContent = skinName;

    item.appendChild(img);
    item.appendChild(span);
    container.insertBefore(item, customItem);
    items.push(item);
  });

  return items;
}

module.exports = {
  renderPresetSkins
};
