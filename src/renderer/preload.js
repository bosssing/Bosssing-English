const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('wordFloater', {
  loadExcel: (filePath) => ipcRenderer.invoke('load-excel', filePath),
  openExcelDialog: () => ipcRenderer.invoke('open-excel-dialog'),
  toggleAlwaysOnTop: () => ipcRenderer.invoke('toggle-always-on-top'),
  setWindowSize: (width, height) => ipcRenderer.send('set-window-size', width, height),
  onWordsLoaded: (callback) => ipcRenderer.on('words-loaded', (event, words) => callback(words)),
  loadState: () => ipcRenderer.invoke('load-state'),
  saveState: (state) => ipcRenderer.invoke('save-state', state)
});
