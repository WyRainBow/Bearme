const path = require('path');

const DEFAULT_SKIN = '奔跑';

const PRESET_SKINS = {
  奔跑: 'assets/自嘲熊run.gif',
  工作: 'assets/自嘲熊work.gif',
  睡醒: 'assets/自嘲熊睡醒.gif',
  贴纸: 'assets/zichao-bear-sticker.gif',
  海里: 'assets/自嘲熊海里.jpg',
  大厨: 'assets/bear-chef.png'
};

const SKIN_IDLE_ANIMATIONS = {
  海里: 'ocean-float',
  大厨: 'chef-present'
};

function normalizeSkinSettings(settings = {}) {
  let skin = settings.skin || DEFAULT_SKIN;
  if (skin === '默认') {
    skin = DEFAULT_SKIN;
  }

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
  SKIN_IDLE_ANIMATIONS,
  normalizeSkinSettings,
  getSkinImagePath
};
