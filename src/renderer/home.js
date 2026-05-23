// 引入electron模块
const { ipcRenderer } = require('electron');
const { pathToFileURL } = require('url');

// 窗口控制按钮
const minimizeBtn = document.getElementById('minimize-btn');
const maximizeBtn = document.getElementById('maximize-btn');
const closeBtn = document.getElementById('close-btn');

// 主题切换按钮
const themeToggle = document.getElementById('theme-toggle');

// 互动按钮
const feedBtn = document.getElementById('feed-btn');
const playBtn = document.getElementById('play-btn');
const petBtn = document.getElementById('pet-btn');
const sleepBtn = document.getElementById('sleep-btn');

// 刷新按钮
const refreshBtn = document.querySelector('.refresh-btn');

// 宠物状态元素
const petName = document.getElementById('pet-name');
const petLevel = document.getElementById('pet-level');
const expValue = document.getElementById('exp-value');
const expProgress = document.querySelector('.exp-progress');
const moodIndicator = document.querySelector('.mood-indicator');

// 设置元素
const autoStartCheckbox = document.getElementById('auto-start');
const alwaysOnTopCheckbox = document.getElementById('always-on-top');
const clickThroughCheckbox = document.getElementById('click-through');
const notificationCheckbox = document.getElementById('notification');
const soundCheckbox = document.getElementById('sound');
const volumeSlider = document.getElementById('volume');
const resetBtn = document.getElementById('reset-btn');
const saveBtn = document.getElementById('save-btn');
const skinItems = document.querySelectorAll('.skin-item');
let customSkinPath = null;

// 窗口控制功能
if (minimizeBtn) {
  minimizeBtn.addEventListener('click', () => {
    ipcRenderer.send('window-minimize');
  });
}

if (maximizeBtn) {
  maximizeBtn.addEventListener('click', () => {
    ipcRenderer.send('window-maximize');
  });
}

if (closeBtn) {
  closeBtn.addEventListener('click', () => {
    ipcRenderer.send('window-close');
  });
}

// 主题切换功能
let isDarkMode = false;
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    isDarkMode = !isDarkMode;
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
      document.body.classList.remove('dark-mode');
      themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
    // 保存主题设置
    ipcRenderer.send('save-theme-preference', isDarkMode);
  });
}

// 切换显示内容部分的函数
function switchSection(sectionId) {
  // 隐藏所有内容区域
  document.querySelectorAll('.content-section').forEach(section => {
    section.classList.remove('active');
  });
  
  // 显示目标内容区域
  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.classList.add('active');
  }
}

// 从服务器获取宠物状态
function loadPetStatus() {
  // 在实际应用中，这里应该从服务器或数据库获取宠物状态
  // 这里使用模拟数据演示
  ipcRenderer.send('get-pet-status');
}

// 更新宠物状态显示
function updatePetStatus(status) {
  if (!status) return;
  
  // 更新宠物名称
  if (petName) {
    petName.textContent = status.name || '自嘲熊';
  }
  
  // 更新宠物等级
  if (petLevel) {
    petLevel.textContent = status.level || 1;
  }
  
  // 更新经验值
  if (expValue && expProgress) {
    const current = status.exp || 0;
    const max = status.maxExp || 100;
    const percent = Math.min(100, Math.max(0, (current / max) * 100));
    
    expValue.textContent = `${current}/${max}`;
    expProgress.style.width = `${percent}%`;
  }
  
  // 更新心情状态
  if (moodIndicator) {
    const mood = status.mood || 'happy';
    
    // 移除所有心情类
    moodIndicator.classList.remove('happy', 'normal', 'sad');
    // 添加当前心情类
    moodIndicator.classList.add(mood);
    
    // 更新心情图标和文本
    let moodIcon = '';
    let moodText = '';
    
    if (mood === 'happy') {
      moodIcon = '<i class="fas fa-smile"></i>';
      moodText = '开心';
    } else if (mood === 'normal') {
      moodIcon = '<i class="fas fa-meh"></i>';
      moodText = '一般';
    } else if (mood === 'sad') {
      moodIcon = '<i class="fas fa-frown"></i>';
      moodText = '难过';
    }
    
    moodIndicator.innerHTML = `${moodIcon} ${moodText}`;
  }
}

// 加载设置
function loadSettings() {
  ipcRenderer.send('get-settings');
}

// 更新设置UI
function updateSettingsUI(settings) {
  if (!settings) return;
  
  if (autoStartCheckbox) {
    autoStartCheckbox.checked = settings.autoStart || false;
  }
  
  if (alwaysOnTopCheckbox) {
    alwaysOnTopCheckbox.checked = settings.alwaysOnTop !== undefined ? settings.alwaysOnTop : true;
  }
  
  if (clickThroughCheckbox) {
    clickThroughCheckbox.checked = settings.clickThrough !== undefined ? settings.clickThrough : true;
  }
  
  if (notificationCheckbox) {
    notificationCheckbox.checked = settings.notification !== undefined ? settings.notification : true;
  }
  
  if (soundCheckbox) {
    soundCheckbox.checked = settings.sound !== undefined ? settings.sound : true;
  }
  
  if (volumeSlider) {
    volumeSlider.value = settings.volume || 50;
  }
  
  // 更新皮肤选择
  if (skinItems.length > 0) {
    skinItems.forEach(item => {
      item.classList.remove('selected');
      const skinName = item.dataset.skin || item.querySelector('span').textContent;
      if (skinName === settings.skin) {
        item.classList.add('selected');
      }
    });
  }

  customSkinPath = settings.customSkinPath || null;
  updateCustomSkinPreview(customSkinPath);
}

// 保存设置
function saveSettings() {
  const newSettings = {
    autoStart: autoStartCheckbox ? autoStartCheckbox.checked : false,
    alwaysOnTop: alwaysOnTopCheckbox ? alwaysOnTopCheckbox.checked : true,
    clickThrough: clickThroughCheckbox ? clickThroughCheckbox.checked : true,
    notification: notificationCheckbox ? notificationCheckbox.checked : true,
    sound: soundCheckbox ? soundCheckbox.checked : true,
    volume: volumeSlider ? parseInt(volumeSlider.value) : 50,
    skin: document.querySelector('.skin-item.selected') ? document.querySelector('.skin-item.selected').dataset.skin : '默认',
    customSkinPath: document.querySelector('.skin-item.selected')?.dataset.skin === '自定义' ? customSkinPath : null
  };
  
  ipcRenderer.send('save-settings', newSettings);
  
  // 显示保存成功提示
  showSavedNotice();
}

function updateCustomSkinPreview(imagePath) {
  const customItem = document.querySelector('.custom-skin-item');
  if (!customItem) return;

  let preview = customItem.querySelector('.custom-skin-preview');
  if (!preview) return;

  if (imagePath) {
    preview.innerHTML = `<img src="${pathToFileURL(imagePath).href}" alt="自定义皮肤">`;
  } else {
    preview.textContent = '+';
  }
}

// 显示保存成功提示
function showSavedNotice() {
  const notice = document.createElement('div');
  notice.className = 'saved-notice';
  notice.textContent = '设置已保存';
  document.body.appendChild(notice);
  
  // 添加显示动画
  setTimeout(() => {
    notice.classList.add('show');
  }, 10);
  
  // 自动隐藏
  setTimeout(() => {
    notice.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(notice);
    }, 300);
  }, 2000);
}

// 监听主进程返回的宠物状态
ipcRenderer.on('pet-status', (event, status) => {
  updatePetStatus(status);
});

// 监听主进程返回的设置
ipcRenderer.on('settings', (event, settings) => {
  updateSettingsUI(settings);
});

// 处理宠物互动
function handleInteraction(action) {
  // 发送互动行为到主进程
  ipcRenderer.send('pet-interaction', action);
  
  // 添加一条互动日志
  addInteractionLog(action);
}

// 添加互动日志
function addInteractionLog(action) {
  const logList = document.querySelector('.log-list');
  if (!logList) return;
  
  // 获取当前时间
  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  // 根据动作生成日志消息
  let message = '';
  switch(action) {
    case 'feed':
      message = '宠物正在享用美食，看起来很满足';
      break;
    case 'play':
      message = '宠物和你一起玩耍，非常开心';
      break;
    case 'pet':
      message = '宠物被你抚摸，感到很舒服';
      break;
    case 'sleep':
      message = '宠物进入了睡眠状态，正在休息';
      break;
    default:
      message = '你与宠物进行了互动';
  }
  
  // 创建日志项
  const logItem = document.createElement('div');
  logItem.className = 'log-item';
  logItem.innerHTML = `
    <div class="log-time">${timeStr}</div>
    <div class="log-message">${message}</div>
  `;
  
  // 添加到日志列表顶部
  logList.insertBefore(logItem, logList.firstChild);
  
  // 如果日志项超过20个，移除最旧的
  if (logList.children.length > 20) {
    logList.removeChild(logList.lastChild);
  }
  
  // 给新日志添加动画效果
  logItem.style.animation = 'fadeIn 0.5s';
}

// 绑定互动按钮事件
if (feedBtn) {
  feedBtn.addEventListener('click', () => {
    handleInteraction('feed');
  });
}

if (playBtn) {
  playBtn.addEventListener('click', () => {
    handleInteraction('play');
  });
}

if (petBtn) {
  petBtn.addEventListener('click', () => {
    handleInteraction('pet');
  });
}

if (sleepBtn) {
  sleepBtn.addEventListener('click', () => {
    handleInteraction('sleep');
  });
}

// 刷新宠物状态
if (refreshBtn) {
  refreshBtn.addEventListener('click', () => {
    loadPetStatus();
    
    // 添加旋转动画效果
    refreshBtn.querySelector('i').classList.add('fa-spin');
    setTimeout(() => {
      refreshBtn.querySelector('i').classList.remove('fa-spin');
    }, 500);
  });
}

// 绑定设置保存/重置按钮事件
if (saveBtn) {
  saveBtn.addEventListener('click', () => {
    saveSettings();
  });
}

if (resetBtn) {
  resetBtn.addEventListener('click', () => {
    ipcRenderer.send('reset-settings');
  });
}

// 绑定皮肤选择事件
skinItems.forEach(item => {
  item.addEventListener('click', async () => {
    if (item.dataset.skin === '自定义') {
      const customSkin = await ipcRenderer.invoke('select-custom-skin');
      if (!customSkin) return;
      customSkinPath = customSkin.customSkinPath;
      updateCustomSkinPreview(customSkinPath);
    }

    // 移除之前的选中状态
    skinItems.forEach(i => i.classList.remove('selected'));
    // 设置当前项为选中状态
    item.classList.add('selected');
    saveSettings();
  });
});

// 侧边栏菜单项点击事件
const menuItems = document.querySelectorAll('.menu-item');
menuItems.forEach(item => {
  item.addEventListener('click', () => {
    // 如果已经是当前页面，则不执行操作
    if (item.classList.contains('active')) return;
    
    // 移除之前的活动状态
    menuItems.forEach(i => i.classList.remove('active'));
    // 添加当前活动状态
    item.classList.add('active');
    
    // 切换内容区域
    const sectionId = item.getAttribute('data-section');
    if (sectionId) {
      switchSection(sectionId);
      
      // 若切换到设置页面，加载设置
      if (sectionId === 'settings-section') {
        loadSettings();
      }
      
      // 若切换到宠物管理页面，加载宠物列表
      if (sectionId === 'pets-section') {
        ipcRenderer.send('get-pet-list');
      }
    }
  });
});

// 监听宠物列表更新
ipcRenderer.on('pet-list', (event, pets) => {
  console.log('获取到宠物列表:', pets);
  // 这里可以根据获取到的宠物列表更新UI
});

// 完成任务功能
const taskItems = document.querySelectorAll('.task-item:not(.completed)');
taskItems.forEach(item => {
  const checkbox = item.querySelector('.task-checkbox');
  if (checkbox) {
    checkbox.addEventListener('click', () => {
      // 切换任务完成状态
      item.classList.toggle('completed');
      
      // 更新复选框图标
      if (item.classList.contains('completed')) {
        checkbox.innerHTML = '<i class="fas fa-check-circle"></i>';
        
        // 获取任务奖励
        const rewardText = item.querySelector('.task-reward').textContent;
        const expMatch = rewardText.match(/\+(\d+)\s+经验/);
        if (expMatch && expMatch[1]) {
          const expGained = parseInt(expMatch[1]);
          // 通知主进程任务完成，获得经验
          ipcRenderer.send('task-completed', { exp: expGained });
        }
      } else {
        checkbox.innerHTML = '<i class="far fa-circle"></i>';
      }
    });
  }
});

// 确保应用可拖动
document.addEventListener('mousedown', (e) => {
  // 排除按钮和交互元素
  if (!e.target.closest('button') && 
      !e.target.closest('select') && 
      !e.target.closest('input') &&
      !e.target.closest('.interaction-btn') &&
      !e.target.closest('.task-item') &&
      !e.target.closest('.log-item') &&
      !e.target.closest('.refresh-btn') &&
      !e.target.closest('.skin-item')) {
    // 通知主进程允许拖动
    ipcRenderer.send('allow-window-drag');
  }
});

// 接收主题偏好
ipcRenderer.on('theme-preference', (event, darkMode) => {
  if (darkMode) {
    isDarkMode = true;
    document.body.classList.add('dark-mode');
    if (themeToggle) {
      themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
  }
});

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  // 加载宠物状态
  loadPetStatus();
  
  // 加载主题偏好
  ipcRenderer.send('get-theme-preference');
  
  // 添加自定义动画样式
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .saved-notice {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%) translateY(20px);
      background-color: #4CAF50;
      color: white;
      padding: 10px 20px;
      border-radius: 4px;
      font-weight: 500;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      opacity: 0;
      transition: all 0.3s ease;
      z-index: 1000;
    }
    
    .saved-notice.show {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  `;
  document.head.appendChild(style);
}); 
