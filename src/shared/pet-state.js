const ACTION_SKIN_MAP = {
  default: '奔跑',
  jump: '奔跑',
  sleep: '睡醒',
  play: '奔跑',
  work: '工作'
};

const ACTION_ANIMATION_MAP = {
  default: null,
  jump: 'bounce',
  sleep: null,
  play: 'shake',
  work: 'flip'
};

function normalizePetAction(action) {
  return Object.prototype.hasOwnProperty.call(ACTION_SKIN_MAP, action) ? action : 'default';
}

module.exports = {
  ACTION_SKIN_MAP,
  ACTION_ANIMATION_MAP,
  normalizePetAction
};
