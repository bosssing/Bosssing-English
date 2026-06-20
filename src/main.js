const { app, BrowserWindow, globalShortcut, ipcMain, dialog, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');
const { parseExcelFile, findExcelFile } = require('./utils/excelParser');

let mainWindow = null;
let tray = null;

// 持久化状态文件路径
const stateFilePath = path.join(app.getPath('userData'), 'app-state.json');

function loadState() {
  try {
    if (fs.existsSync(stateFilePath)) {
      return JSON.parse(fs.readFileSync(stateFilePath, 'utf-8'));
    }
  } catch (e) {
    console.error('读取状态失败:', e);
  }
  return {};
}

function saveState(state) {
  try {
    fs.writeFileSync(stateFilePath, JSON.stringify(state, null, 2), 'utf-8');
  } catch (e) {
    console.error('保存状态失败:', e);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 420,
    height: 220,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: true,
    skipTaskbar: true,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, 'renderer', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // 窗口失去焦点时降低透明度（可选行为）
  mainWindow.on('focus', () => {
    mainWindow.setOpacity(1.0);
  });
  mainWindow.on('blur', () => {
    mainWindow.setOpacity(0.85);
  });
}

function createTray() {
  try {
    // 使用 base64 编码的 16x16 蓝色圆形 PNG 图标
    const iconBase64 = 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9zAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAbwAAAG8B8pLRxQAAABl0RVh0U29mdHdhcmUAd3d3LmllYy5jaJWTA0AAABZ6SURBVHicVZJ9bFRVFIa/59xrZjObmZ1MdDOFmhiVGEqU0EojCkqIAo0iRKNRoqgSEUQfFKEPIoLRIiAaFSVCBI0qRIOi0SgYjRrFqFGj0SgYRKNxNEEwGrHh3Oy2s7tfz9x7Z3fuPf9jO7Lf3Xtm9+7M3PvscG5hYcSJEye+OvPMM8+8WyyR4uLi3qWkpKQnOjr6sIe0tLS0pKSkp6SlpY2n5/Lly4dKSkrqSktLO7S0tBw4cODAG+3t7W9KS0t7l5KS0g5paenQoUOHnlZSUtJOUVHRbs3NzT1JcnJyT0pLS3uXlpY2nZKSEhkZ+Z6kpKS2v4K2tNbW1tYdHR0lABITE3NLS0vrXWpra3dJcnJyT0pLS3uXlpbWu6SkpDclJSU9JS0t7V1KSspPUVFR7xITE3O3srLyp7q6ukEHBwd1Z2dn1dXVVTc0NPRWZGRk7y4uLt1P8t9sZ2dnaVVV1cE+ffo0v6mpaW9LS0tvSE5O7s3KytLq6uqqGxoadrmqqqo5RUVFvSsqKu4uKSlp6+DgYNXQ0NBdVlZWd1VV1V1RUVHvCgsLuzc0NPQ2Pj6+Dy4uLt2HhIR0t7Gx8X1hYeFdcXFxn5SUlPQUGRn5jpKSkv7Ky8v7Kygo6C0pKemtpKSkv7Kysv+toKCgt6CgoLegoKC3oKCgt6CgoLegoKC3oKCgt6CgoLegoKC3oKCgt6CgoLegoKC3oKCgt6CgoLegoKC3oKCgt6CgoLegoKC3oKCgt6CgoLegoKC3oKCgt6CgoLegoKC3oKCgt6CgoLef/Afn7F8l0AAAAAElFTkSuQmCC';
    const trayIcon = nativeImage.createFromDataURL('data:image/png;base64,' + iconBase64);
    tray = new Tray(trayIcon);
  } catch (e) {
    console.log('托盘图标加载失败，跳过托盘创建:', e.message);
    return;
  }

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示/隐藏',
      click: () => toggleWindow()
    },
    {
      label: '打开Excel文件',
      click: () => openExcelDialog()
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        app.quit();
      }
    }
  ]);

  tray.setToolTip('单词悬浮提示器');
  tray.setContextMenu(contextMenu);
  tray.on('click', () => toggleWindow());
}

function toggleWindow() {
  if (!mainWindow) return;
  if (mainWindow.isVisible()) {
    mainWindow.hide();
  } else {
    mainWindow.show();
    mainWindow.focus();
  }
}

function openExcelDialog() {
  const result = dialog.showOpenDialogSync(mainWindow, {
    title: '选择Excel文件',
    filters: [
      { name: 'Excel文件', extensions: ['xlsx', 'xls'] },
      { name: '所有文件', extensions: ['*'] }
    ],
    properties: ['openFile']
  });

  if (result && result.length > 0) {
    try {
      const words = parseExcelFile(result[0]);
      if (mainWindow) {
        mainWindow.webContents.send('words-loaded', words);
      }
    } catch (e) {
      dialog.showErrorBox('读取失败', e.message);
    }
  }
}

// IPC处理
ipcMain.handle('load-excel', async (event, filePath) => {
  try {
    // 优先使用传入路径
    let targetPath = filePath;
    // 查找 extraResources 目录（打包后）
    if (!targetPath && app.isPackaged) {
      const resourcePath = path.join(process.resourcesPath, '12.28考研英语词汇乱序版2.xlsx');
      if (require('fs').existsSync(resourcePath)) {
        targetPath = resourcePath;
      }
    }
    // 查找应用目录
    if (!targetPath) {
      targetPath = findExcelFile(app.getAppPath());
    }
    if (!targetPath) {
      targetPath = findExcelFile(path.dirname(app.getPath('exe')));
    }
    if (!targetPath) {
      targetPath = findExcelFile(process.cwd());
    }
    if (!targetPath) return { error: '未找到Excel文件，请手动选择' };
    const words = parseExcelFile(targetPath);
    return { words };
  } catch (e) {
    return { error: e.message };
  }
});

ipcMain.handle('open-excel-dialog', async () => {
  const result = dialog.showOpenDialogSync(mainWindow, {
    title: '选择Excel文件',
    filters: [
      { name: 'Excel文件', extensions: ['xlsx', 'xls'] },
      { name: '所有文件', extensions: ['*'] }
    ],
    properties: ['openFile']
  });

  if (result && result.length > 0) {
    try {
      const words = parseExcelFile(result[0]);
      return { words };
    } catch (e) {
      return { error: e.message };
    }
  }
  return { words: null };
});

ipcMain.handle('toggle-always-on-top', () => {
  if (mainWindow) {
    const isPinned = mainWindow.isAlwaysOnTop();
    mainWindow.setAlwaysOnTop(!isPinned);
    return !isPinned;
  }
  return false;
});

ipcMain.on('set-window-size', (event, width, height) => {
  if (mainWindow) {
    mainWindow.setSize(width, height);
  }
});

// 状态持久化 IPC
ipcMain.handle('load-state', () => {
  return loadState();
});

ipcMain.handle('save-state', (event, state) => {
  saveState(state);
  return true;
});

// 退出前保存状态
app.on('before-quit', () => {
  globalShortcut.unregisterAll();
});
app.whenReady().then(() => {
  createWindow();
  createTray();

  // 注册全局快捷键 Ctrl+Shift+W 显示/隐藏
  globalShortcut.register('CommandOrControl+Shift+W', () => {
    toggleWindow();
  });
});

app.on('window-all-closed', () => {
  // 保持托盘运行
});

app.on('before-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
