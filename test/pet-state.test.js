const assert = require('assert');
const {
  ACTION_SKIN_MAP,
  ACTION_ANIMATION_MAP,
  normalizePetAction
} = require('../src/shared/pet-state');

assert.strictEqual(normalizePetAction('jump'), 'jump');
assert.strictEqual(normalizePetAction('missing'), 'default');
assert.strictEqual(ACTION_SKIN_MAP.default, '奔跑');
assert.strictEqual(ACTION_SKIN_MAP.sleep, '睡醒');
assert.strictEqual(ACTION_ANIMATION_MAP.jump, 'bounce');
assert.strictEqual(ACTION_ANIMATION_MAP.play, 'shake');

console.log('pet-state tests passed');
