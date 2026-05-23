const path = require('path');

const DEFAULT_SKIN = '默认';

const PRESET_SKINS = {
  默认: 'assets/pet.png',
  奔跑: 'assets/自嘲熊run.gif',
  工作: 'assets/自嘲熊work.gif',
  睡醒: 'assets/自嘲熊睡醒.gif',
  贴纸: 'assets/自嘲熊sticker.gif',
  海里: 'assets/自嘲熊海里.jpg'
};

function normalizeSkinSettings(settings = {}) {
  const skin = settings.skin || DEFAULT_SKIN;

  if (skin === '自定义' && settings.customSkinPath) {
    return { skin, customSkinPath: settings.customSkinPath };
  }

  if (Object.prototype.hasOwnProperty.call(PRESET_SKINS, skin)) {
    return { skin, customSkinPath: null };
  }

  return { skin: DEFAULT_SKIN, customSkinPath: null };
}

function getSkinImagePath(settings = {}, projectRoot = path.resolve(__dirname, '../..')) {
  const normalized = normalizeSkinSettings(settings);

  if (normalized.skin === '自定义') {
    return normalized.customSkinPath;
  }

  return path.join(projectRoot, PRESET_SKINS[normalized.skin]);
}

module.exports = {
  DEFAULT_SKIN,
  PRESET_SKINS,
  normalizeSkinSettings,
  getSkinImagePath
};
