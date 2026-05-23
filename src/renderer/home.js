// 引入electron模块
const { ipcRenderer } = require('electron');
const { pathToFileURL } = require('url');
const { getSkinImagePath, DEFAULT_SKIN } = require('../shared/skins');
const { renderPresetSkins } = require('./preset-skin-ui');

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
let skinItems = [];
const avatarImage = document.getElementById('avatar-image');
const avatarUploadBtn = document.getElementById('avatar-upload-btn');
const petActionSelect = document.querySelector('.pet-action-select');
const managedPetImage = document.getElementById('managed-pet-image');
const statusPetImage = document.getElementById('status-pet-image');
let customSkinPath = null;

function initPresetSkins(selectedSkin = DEFAULT_SKIN) {
  const container = document.querySelector('.pet-skins');
  skinItems = renderPresetSkins(container, selectedSkin);
  bindSkinItemClicks();
}

function bindSkinItemClicks() {
  skinItems.forEach(item => {
    item.replaceWith(item.cloneNode(true));
  });
  skinItems = document.querySelectorAll('.skin-item');

  skinItems.forEach(item => {
    item.addEventListener('click', async () => {
      if (item.dataset.skin === '自定义') {
        const customSkin = await ipcRenderer.invoke('select-custom-skin');
        if (!customSkin) return;
        customSkinPath = customSkin.customSkinPath;
        updateCustomSkinPreview(customSkinPath);
      }

      skinItems.forEach(i => i.classList.remove('selected'));
      item.classList.add('selected');
      saveSettings();
    });
  });
}

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
  updateAvatarPreview(settings.avatarPath || null);
  updatePetImages(settings);

  if (petActionSelect && settings.currentAction) {
    petActionSelect.value = settings.currentAction;
  }
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
    skin: document.querySelector('.skin-item.selected') ? document.querySelector('.skin-item.selected').dataset.skin : DEFAULT_SKIN,
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

function toImageUrl(imagePath) {
  return pathToFileURL(imagePath).href;
}

function updateAvatarPreview(imagePath) {
  if (!avatarImage) return;
  avatarImage.src = imagePath ? toImageUrl(imagePath) : '../../assets/pet.png';
}

function updatePetImages(settings) {
  const imageUrl = toImageUrl(getSkinImagePath(settings));

  if (statusPetImage) {
    statusPetImage.src = imageUrl;
  }

  if (managedPetImage) {
    managedPetImage.src = imageUrl;
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

ipcRenderer.on('settings-updated', (event, settings) => {
  updateSettingsUI(settings);
});

ipcRenderer.on('pet-action-updated', (event, state) => {
  updatePetImages(state);
});

// 处理宠物互动
function handleInteraction(action) {
  ipcRenderer.send('pet-interaction', action);
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

// 皮肤拖拽排序
(function initSkinDragSort() {
  const container = document.querySelector('.pet-skins');
  if (!container) return;

  let dragItem = null;

  container.addEventListener('dragstart', (e) => {
    const item = e.target.closest('.skin-item');
    if (!item || item.classList.contains('custom-skin-item')) { e.preventDefault(); return; }
    dragItem = item;
    item.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
  });

  container.addEventListener('dragend', () => {
    if (dragItem) dragItem.classList.remove('dragging');
    dragItem = null;
  });

  container.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const target = e.target.closest('.skin-item');
    if (!target || target === dragItem || target.classList.contains('custom-skin-item')) return;

    const rect = target.getBoundingClientRect();
    const midX = rect.left + rect.width / 2;
    if (e.clientX < midX) {
      container.insertBefore(dragItem, target);
    } else {
      container.insertBefore(dragItem, target.nextSibling);
    }
  });
})();

// 绑定皮肤选择事件（预设皮肤在 initPresetSkins 中绑定）

if (avatarUploadBtn) {
  avatarUploadBtn.addEventListener('click', async (event) => {
    event.stopPropagation();
    const avatar = await ipcRenderer.invoke('select-custom-avatar');
    if (!avatar) return;
    updateAvatarPreview(avatar.avatarPath);
  });
}

if (petActionSelect) {
  petActionSelect.addEventListener('change', (event) => {
    const petCard = event.target.closest('.pet-card');
    const petName = petCard?.querySelector('.pet-name')?.textContent || '自嘲熊';
    ipcRenderer.send('pet-action', {
      name: petName,
      action: event.target.value
    });
  });
}

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
      !e.target.closest('.skin-item') &&
      !e.target.closest('.avatar-container')) {
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
  initPresetSkins();
  // 加载宠物状态
  loadPetStatus();
  loadSettings();

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
