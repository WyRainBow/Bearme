const { ipcRenderer, contextBridge, remote } = require('electron');
const { pathToFileURL } = require('url');
const { getSkinImagePath, SKIN_IDLE_ANIMATIONS } = require('../shared/skins');

// 获取DOM元素
const pet = document.getElementById('pet');
const interactionButtons = document.getElementById('interaction-buttons');
const messagePopup = document.getElementById('message-popup');
const messageContent = document.querySelector('.message-content');
const closeMessage = document.querySelector('.close-message');

// 名言集合
const quotes = [
  "微笑是最好的名片。",
  "每一天都是新的开始。",
  "做你自己，因为别人都已经有人做了。",
  "学习是一种态度，而不是能力。",
  "简单的事情重复做，你也可以成为专家。",
  "成长的过程总是有些痛苦的。",
  "你的态度决定了你的高度。",
  "一次只做一件事，把它做到最好。",
  "不要等待机会，而要创造机会。",
  "今天的付出，会在未来的某一天得到回报。"
];

// 互动短语集合
const interactions = [
  "好痒啊，别挠我啦！",
  "今天天气真好呢~",
  "主人，我想吃零食！",
  "要不要一起玩游戏？",
  "听说今天有好运气哦！",
  "主人工作辛苦了，要休息一下~",
  "我们一起加油吧！",
  "有什么可以帮到你的吗？",
  "需要我提醒你什么事情吗？",
  "偷偷告诉你一个秘密..."
];

// 创建一个变量来追踪鼠标是否在UI元素上
let isMouseOverUI = false;

// 初始化
function initPet() {
  console.log("初始化宠物...");
  
  // 隐藏互动按钮和所有按钮
  interactionButtons.classList.add('hidden');
  const buttons = document.querySelectorAll('.circular-button');
  buttons.forEach(button => {
    button.classList.add('hidden');
  });
  
  // 初始化隐藏消息框
  messagePopup.classList.add('hidden');
  ipcRenderer.send('get-settings');
  
  // 获取所有互动按钮
  const interactButton = document.querySelector('.circular-button.interact');
  const dailyQuoteButton = document.querySelector('.circular-button.daily-quote');
  const openHomeButton = document.querySelector('.circular-button.open-home');

  interactButton.addEventListener('click', handleInteract);
  dailyQuoteButton.addEventListener('click', handleDailyQuote);
  openHomeButton.addEventListener('click', () => {
    ipcRenderer.send('navigate-to', 'home');
    interactionButtons.classList.add('hidden');
  });

  [interactButton, dailyQuoteButton, openHomeButton].forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation(); // 阻止事件冒泡
    });
  });
  
  // 添加关闭消息按钮的事件处理
  if (closeMessage) {
    closeMessage.addEventListener('click', () => {
      messagePopup.classList.remove('show');
      setTimeout(() => {
        messagePopup.classList.add('hidden');
      }, 300);
    });
  }
  
  console.log("初始化完成");
}

function applySkin(settings) {
  const imagePath = getSkinImagePath(settings);
  pet.style.backgroundImage = `url("${pathToFileURL(imagePath).href}")`;

  pet.classList.remove(...Object.values(SKIN_IDLE_ANIMATIONS));
  const idleAnimation = SKIN_IDLE_ANIMATIONS[settings.skin];
  if (idleAnimation) {
    pet.classList.add(idleAnimation);
  }
}

// 显示消息框
function showMessage(text) {
  const messagePopup = document.querySelector('#message-popup');
  const messageContent = document.querySelector('.message-content');
  
  // 清除之前的消息和定时器
  if (messagePopup._hideTimer) {
    clearTimeout(messagePopup._hideTimer);
  }
  
  // 设置消息内容
  messageContent.textContent = text;
  
  // 直接从隐藏到显示，中间不需要过渡状态
  messagePopup.classList.remove('hidden');
  messagePopup.classList.add('show');
  
  // 设置定时器，在一段时间后隐藏消息
  messagePopup._hideTimer = setTimeout(() => {
    messagePopup.classList.remove('show');
    
    // 淡出后完全隐藏元素
    setTimeout(() => {
      messagePopup.classList.add('hidden');
    }, 700); // 与CSS动画时间匹配
  }, 3000); // 消息显示时间增加到3秒
}

// 互动处理
function handleInteract() {
  // 随机选择一个互动短语
  const randomInteraction = interactions[Math.floor(Math.random() * interactions.length)];
  
  const actions = ['shake', 'bounce', 'flip'];
  const randomAction = actions[Math.floor(Math.random() * actions.length)];
  pet.classList.add(randomAction);
  setTimeout(() => {
    pet.classList.remove(randomAction);
  }, 1000);

  // 隐藏互动按钮
  interactionButtons.classList.add('hidden');
}

// 每日金句处理
function handleDailyQuote() {
  // 随机选择一条名言
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  
  const actions = ['shake', 'bounce', 'flip'];
  const randomAction = actions[Math.floor(Math.random() * actions.length)];
  pet.classList.add(randomAction);
  setTimeout(() => {
    pet.classList.remove(randomAction);
  }, 1000);

  // 隐藏互动按钮
  interactionButtons.classList.add('hidden');
}

// 拖动相关变量
let isDragging = false;
let lastMouseX = 0, lastMouseY = 0; // 上一次鼠标位置
let offsetX, offsetY; // 鼠标在窗口内的偏移位置
let lastMoveTime = 0; // 上次移动时间
const moveThreshold = 1; // 移动阈值（像素）
let isMouseOverPet = false; // 鼠标是否在宠物上

// 单击事件计时器
let clickTimer = null;
let isDoubleClick = false;

// 鼠标悬停显示UI元素
pet.addEventListener('mouseenter', () => {
  // 进入宠物区域时，禁用点击穿透
  isMouseOverPet = true;
  ipcRenderer.send('set-ignore-mouse-events', false);

  const ringsCanvas = document.getElementById('codex-rings-canvas');
  if (ringsCanvas) ringsCanvas.classList.add('hoverable');
  if (window.codexRings) window.codexRings.show();

  // 显示UI元素
  const interactionButtons = document.querySelector('#interaction-buttons');
  
  // 如果消息弹窗不在显示中才显示UI
  const messagePopup = document.querySelector('#message-popup');
  if (!messagePopup.classList.contains('show')) {
    // 先把元素从display:none改为可见，但保持动画初始状态
    interactionButtons.classList.remove('hidden');
    
    // 确保所有按钮都是可见的但处于初始状态
    const buttons = document.querySelectorAll('.circular-button');
    buttons.forEach(button => {
      button.classList.remove('hidden');
    });
    
    // 立即添加show类触发动画（不需要setTimeout）
    interactionButtons.classList.add('show');
    
    // 依次显示每个按钮
    buttons.forEach(button => {
      button.classList.add('show');
    });
  }
});

// 鼠标离开隐藏UI元素
pet.addEventListener('mouseleave', () => {
  // 离开宠物区域
  isMouseOverPet = false;
  
  // 延迟检查，如果鼠标也不在UI上，才隐藏UI
  setTimeout(() => {
    if (!isMouseOverPet && !isMouseOverUI) {
      hideAllUI();
    }
  }, 100);
});

// 互动按钮鼠标进入事件
interactionButtons.addEventListener('mouseenter', () => {
  // 标记鼠标在UI上
  isMouseOverUI = true;
  ipcRenderer.send('set-ignore-mouse-events', false);
});

// 互动按钮鼠标离开事件
interactionButtons.addEventListener('mouseleave', () => {
  // 标记鼠标不在UI上
  isMouseOverUI = false;
  
  // 延迟检查，如果鼠标既不在宠物上也不在UI上，才隐藏UI
  setTimeout(() => {
    if (!isMouseOverPet && !isMouseOverUI) {
      hideAllUI();
    }
  }, 100);
});

// 提取隐藏UI的逻辑为单独函数
function hideAllUI() {
  const interactionButtons = document.querySelector('#interaction-buttons');
  const messagePopup = document.querySelector('#message-popup');
  const ringsCanvas = document.getElementById('codex-rings-canvas');
  if (ringsCanvas) ringsCanvas.classList.remove('hoverable');
  if (window.codexRings) window.codexRings.hide();
  
  // 如果没有显示消息弹窗，才恢复点击穿透
  if (messagePopup.classList.contains('hidden')) {
    if (!isDragging) {
      ipcRenderer.send('set-ignore-mouse-events', true);
    }
    
    // 移除所有元素的显示类
    interactionButtons.classList.remove('show');
    
    // 隐藏所有按钮
    const buttons = document.querySelectorAll('.circular-button');
    buttons.forEach(button => {
      button.classList.remove('show');
    });
    
    // 延迟后完全隐藏
    setTimeout(() => {
      interactionButtons.classList.add('hidden');
      
      buttons.forEach(button => {
        button.classList.add('hidden');
      });
    }, 700); // 延长时间以匹配动画时长
  }
}

// 鼠标按下事件
pet.addEventListener('mousedown', (e) => {
  // 只处理左键点击的拖动
  if (e.button !== 0) return;
  
  e.preventDefault(); // 防止默认行为
  isDragging = true;
  
  // 记录鼠标在窗口内的点击位置
  offsetX = e.clientX;
  offsetY = e.clientY;
  
  // 记录当前鼠标屏幕位置
  lastMouseX = e.screenX;
  lastMouseY = e.screenY;
  lastMoveTime = Date.now();
  
  pet.style.cursor = 'grabbing';
  
  // 通知主进程开始拖动，并传递偏移量
  ipcRenderer.send('drag-start', { offsetX, offsetY });
});

// 鼠标移动事件
document.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  
  // 计算鼠标移动距离
  const deltaX = e.screenX - lastMouseX;
  const deltaY = e.screenY - lastMouseY;
  
  // 检查是否移动超过阈值，并且最小时间间隔
  const now = Date.now();
  const timeDelta = now - lastMoveTime;
  
  if ((Math.abs(deltaX) > moveThreshold || Math.abs(deltaY) > moveThreshold) && timeDelta > 16) {
    // 更新上次移动时间
    lastMoveTime = now;
    
    // 更新上次鼠标位置
    lastMouseX = e.screenX;
    lastMouseY = e.screenY;
    
    // 直接发送鼠标的绝对位置给主进程
    ipcRenderer.send('move-pet-absolute', {
      mouseX: e.screenX,
      mouseY: e.screenY
    });
  }
});

// 鼠标释放事件
document.addEventListener('mouseup', () => {
  if (isDragging) {
    isDragging = false;
    pet.style.cursor = 'grab';
    
    // 通知主进程结束拖动
    ipcRenderer.send('drag-end');
    
    // 如果鼠标不在宠物上，恢复点击穿透
    if (!isMouseOverPet && messagePopup.classList.contains('hidden')) {
      ipcRenderer.send('set-ignore-mouse-events', true);
    }
  }
});

// 确保鼠标离开窗口时也能正确处理拖动结束
document.addEventListener('mouseleave', () => {
  if (isDragging) {
    isDragging = false;
    pet.style.cursor = 'grab';
    
    // 通知主进程结束拖动
    ipcRenderer.send('drag-end');
  }
});

// 右键菜单
pet.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  ipcRenderer.send('show-context-menu');
});

// 双击事件 - 可以触发特殊动画
pet.addEventListener('dblclick', () => {
  // 标记为双击，防止单击事件触发
  isDoubleClick = true;
  
  // 发送双击事件给主进程
  ipcRenderer.send('pet-dblclick');
  
  // 播放特殊动画
  playSpecialAnimation();
  
  // 如果互动按钮已显示，则隐藏（防止冲突）
  if (!interactionButtons.classList.contains('hidden')) {
    interactionButtons.classList.add('hidden');
  }
});

// 特殊动画
function playSpecialAnimation() {
  // 移除现有的动画类
  pet.classList.remove('shake', 'bounce', 'flip', 'special');
  
  // 添加特殊动画类
  pet.classList.add('special');
  
  // 动画结束后移除类
  setTimeout(() => {
    pet.classList.remove('special');
  }, 1200);
}

// 添加宠物行为（简单动画效果）
function randomMovement() {
  // 如果正在拖动或显示互动按钮，不执行随机动作
  if (isDragging || !interactionButtons.classList.contains('hidden') || !messagePopup.classList.contains('hidden')) {
    setTimeout(randomMovement, 2000);
    return;
  }
  
  // 随机选择一个动作
  const actions = ['shake', 'bounce', 'flip'];
  const randomAction = actions[Math.floor(Math.random() * actions.length)];
  
  // 添加动作类
  pet.classList.add(randomAction);
  
  // 一段时间后移除动作类
  setTimeout(() => {
    pet.classList.remove(randomAction);
  }, 1000);
  
  // 设置下一次随机动作的时间
  const nextActionTime = 5000 + Math.random() * 10000; // 5-15秒之间
  setTimeout(randomMovement, nextActionTime);
}

// 监听来自主进程的消息
ipcRenderer.on('play-animation', (event, animation) => {
  // 移除现有的动画类
  pet.classList.remove('shake', 'bounce', 'flip', 'special');
  
  // 添加指定的动画类
  if (animation) {
    pet.classList.add(animation);
    
    // 动画结束后移除类
    setTimeout(() => {
      pet.classList.remove(animation);
    }, 1000);
  }
});

// 监听交互状态更新
ipcRenderer.on('update-interaction', (event, ignoreMouseEvents) => {
  if (ignoreMouseEvents) {
    console.log('点击穿透已启用');
  } else {
    console.log('点击穿透已禁用');
  }
});

ipcRenderer.on('settings', (event, settings) => {
  applySkin(settings);
});

ipcRenderer.on('settings-updated', (event, settings) => {
  applySkin(settings);
});

// 初始化宠物
initPet();

// 启动随机行为
setTimeout(randomMovement, 5000);
