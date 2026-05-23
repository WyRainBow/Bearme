const assert = require('assert');
const path = require('path');

const {
  DEFAULT_SKIN,
  PRESET_SKINS,
  getSkinImagePath,
  normalizeSkinSettings
} = require('../src/shared/skins');

const projectRoot = path.resolve(__dirname, '..');

assert.strictEqual(DEFAULT_SKIN, '奔跑');
assert.deepStrictEqual(Object.keys(PRESET_SKINS), ['奔跑', '工作', '睡醒', '贴纸', '海里']);

for (const skinName of Object.keys(PRESET_SKINS)) {
  const imagePath = getSkinImagePath({ skin: skinName }, projectRoot);
  assert.ok(imagePath.startsWith(projectRoot), `${skinName} should resolve inside project`);
  assert.ok(/\.(png|gif|jpg|jpeg)$/.test(imagePath), `${skinName} should resolve to an image`);
}

const customPath = path.join(projectRoot, 'assets', 'pet.gif');
assert.strictEqual(
  getSkinImagePath({ skin: '自定义', customSkinPath: customPath }, projectRoot),
  customPath
);

assert.deepStrictEqual(
  normalizeSkinSettings({ skin: '不存在', customSkinPath: customPath }),
  { skin: DEFAULT_SKIN, customSkinPath: null }
);

assert.deepStrictEqual(
  normalizeSkinSettings({ skin: '自定义', customSkinPath: customPath }),
  { skin: '自定义', customSkinPath: customPath }
);

console.log('skin-utils tests passed');
