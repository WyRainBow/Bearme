// 获取Electron的ipcRenderer
const { ipcRenderer } = require('electron');

// DOM元素
const closeBtn = document.getElementById('close-btn');
const saveBtn = document.getElementById('save-btn');
const resetBtn = document.getElementById('reset-btn');
const autoStart = document.getElementById('auto-start');
const alwaysOnTop = document.getElementById('always-on-top');
const clickThrough = document.getElementById('click-through');
const notification = document.getElementById('notification');
const sound = document.getElementById('sound');
const volume = document.getElementById('volume');
const skinItems = document.querySelectorAll('.skin-item:not(.locked)');
const header = document.querySelector('.header');

// 当前设置
let currentSettings = {};

// 窗口拖动功能
let isDragging = false;
let startMousePosition = { x: 0, y: 0 };
let startOffset = { x: 0, y: 0 };

// 添加拖动事件监听 - 完全重写
header.addEventListener('mousedown', (e) => {
  isDragging = true;
  
  // 保存鼠标初始位置
  startMousePosition = { x: e.screenX, y: e.screenY };
  startOffset = { x: e.offsetX, y: e.offsetY };
  
  // 添加拖动状态类
  document.body.classList.add('is-dragging');
  
  // 改变光标样式
  header.style.cursor = 'grabbing';
  
  // 防止文本选择
  e.preventDefault();
});

// 使用 mousemove 事件处理拖动
document.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  
  // 使用绝对位置计算
  ipcRenderer.send('move-settings-window', { 
    mouseX: e.screenX, 
    mouseY: e.screenY,
    startX: startOffset.x,
    startY: startOffset.y
  });
});

// 处理拖动结束
document.addEventListener('mouseup', () => {
  if (!isDragging) return;
  
  isDragging = false;
  header.style.cursor = 'grab';
  document.body.classList.remove('is-dragging');
});

// 添加皮肤悬停效果
function setupSkinHoverEffect() {
  skinItems.forEach(item => {
    const img = item.querySelector('img');
    const originalSrc = img.src;
    let isGif = originalSrc.endsWith('.gif');
    
    // 保存原始尺寸
    if (!isGif) {
      item.addEventListener('mouseenter', () => {
        if (!isDragging) {
          img.style.transform = 'scale(1.1)';
        }
      });
      
      item.addEventListener('mouseleave', () => {
        if (!isDragging) {
          img.style.transform = 'scale(1)';
        }
      });
    }
  });
}

// 初始化：从主进程获取当前设置
window.addEventListener('DOMContentLoaded', () => {
  // 设置标题栏样式
  header.style.cursor = 'grab';
  
  // 设置皮肤悬停效果
  setupSkinHoverEffect();
  
  // 添加复选框动画效果
  document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    const label = checkbox.previousElementSibling;
    if (label && label.tagName === 'LABEL') {
      label.addEventListener('click', (e) => {
        e.preventDefault();
        checkbox.checked = !checkbox.checked;
      });
    }
  });
  
  // 为音量滑块添加标签
  const volumeContainer = volume.parentElement;
  const volumeLabel = document.createElement('div');
  volumeLabel.className = 'volume-value';
  volumeLabel.textContent = volume.value + '%';
  volumeContainer.appendChild(volumeLabel);
  
  volume.addEventListener('input', () => {
    volumeLabel.textContent = volume.value + '%';
  });
  
  // 向主进程请求当前设置
  ipcRenderer.send('get-settings');

  // 监听主进程返回的设置
  ipcRenderer.on('settings', (event, settings) => {
    currentSettings = settings;
    updateUIFromSettings(settings);
  });
});

// 根据设置更新UI
function updateUIFromSettings(settings) {
  if (!settings) return;

  // 基本设置
  autoStart.checked = settings.autoStart || false;
  alwaysOnTop.checked = settings.alwaysOnTop !== undefined ? settings.alwaysOnTop : true;
  clickThrough.checked = settings.clickThrough !== undefined ? settings.clickThrough : true;
  
  // 互动设置
  notification.checked = settings.notification !== undefined ? settings.notification : true;
  sound.checked = settings.sound !== undefined ? settings.sound : true;
  volume.value = settings.volume !== undefined ? settings.volume : 50;
  
  // 更新音量标签
  const volumeLabel = document.querySelector('.volume-value');
  if (volumeLabel) {
    volumeLabel.textContent = volume.value + '%';
  }
  
  // 皮肤选择
  if (settings.skin) {
    skinItems.forEach(item => {
      const skinName = item.querySelector('span').textContent;
      if (skinName === settings.skin) {
        selectSkin(item);
      }
    });
  }
}

// 从UI获取当前设置
function getSettingsFromUI() {
  const settings = {
    autoStart: autoStart.checked,
    alwaysOnTop: alwaysOnTop.checked,
    clickThrough: clickThrough.checked,
    notification: notification.checked,
    sound: sound.checked,
    volume: parseInt(volume.value),
    skin: document.querySelector('.skin-item.selected span').textContent
  };
  
  return settings;
}

// 选择皮肤
function selectSkin(selectedItem) {
  // 移除所有选中状态
  skinItems.forEach(item => {
    item.classList.remove('selected');
  });
  
  // 添加选中状态到被点击的项
  selectedItem.classList.add('selected');
}

// 关闭窗口
closeBtn.addEventListener('click', () => {
  ipcRenderer.send('close-settings');
});

// 保存设置
saveBtn.addEventListener('click', () => {
  const newSettings = getSettingsFromUI();
  ipcRenderer.send('save-settings', newSettings);
  
  // 显示保存成功提示
  const savedNotice = document.createElement('div');
  savedNotice.className = 'saved-notice';
  savedNotice.textContent = '设置已保存';
  document.body.appendChild(savedNotice);
  
  setTimeout(() => {
    savedNotice.classList.add('show');
    
    setTimeout(() => {
      savedNotice.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(savedNotice);
      }, 300);
    }, 1500);
  }, 10);
});

// 重置设置
resetBtn.addEventListener('click', () => {
  if (confirm('确定要恢复默认设置吗？')) {
    ipcRenderer.send('reset-settings');
    
    // 监听一次性重置后的设置
    ipcRenderer.once('settings', (event, settings) => {
      updateUIFromSettings(settings);
    });
  }
});

// 皮肤选择
skinItems.forEach(item => {
  item.addEventListener('click', () => {
    selectSkin(item);
  });
});

// 为界面添加一些样式
document.head.insertAdjacentHTML('beforeend', `
  <style>
    .saved-notice {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%) translateY(20px);
      background-color: #4CAF50;
      color: white;
      padding: 10px 20px;
      border-radius: 4px;
      opacity: 0;
      transition: all 0.3s ease;
      z-index: 1000;
    }
    
    .saved-notice.show {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
    
    .volume-value {
      color: var(--primary-color);
      font-weight: 500;
      margin-left: 10px;
      min-width: 40px;
      text-align: right;
    }
    
    .setting-item:has(input[type="range"]) {
      display: flex;
      align-items: center;
    }
  </style>
`); 