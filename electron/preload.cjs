'use strict';

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // ── App ──────────────────────────────────────────────────────────────────
  getAppInfo: () => ipcRenderer.invoke('app:info'),

  // ── Ficheiros ────────────────────────────────────────────────────────────
  openExcelDialog: () => ipcRenderer.invoke('dialog:open-excel'),
  readFile: (filePath) => ipcRenderer.invoke('fs:read-file', filePath),
  saveExcelDialog: (defaultName) => ipcRenderer.invoke('dialog:save-excel', defaultName),
  saveWordDialog: (defaultName) => ipcRenderer.invoke('dialog:save-word', defaultName),
  savePdfDialog: (defaultName) => ipcRenderer.invoke('dialog:save-pdf', defaultName),
  saveCsvDialog: (defaultName) => ipcRenderer.invoke('dialog:save-csv', defaultName),
  writeFile: (filePath, data) => ipcRenderer.invoke('fs:write-file', filePath, data),
  showItemInFolder: (filePath) => ipcRenderer.invoke('shell:show-item', filePath),
  openPath: (filePath) => ipcRenderer.invoke('shell:open-path', filePath),

  // ── Atualizações ─────────────────────────────────────────────────────────
  checkForUpdates: () => ipcRenderer.invoke('update:check'),
  downloadUpdate: () => ipcRenderer.invoke('update:download'),
  installUpdate: () => ipcRenderer.invoke('update:install'),

  onUpdateAvailable: (cb) => {
    ipcRenderer.on('update:available', (_e, info) => cb(info));
    return () => ipcRenderer.removeAllListeners('update:available');
  },
  onUpdateProgress: (cb) => {
    ipcRenderer.on('update:progress', (_e, info) => cb(info));
    return () => ipcRenderer.removeAllListeners('update:progress');
  },
  onUpdateDownloaded: (cb) => {
    ipcRenderer.on('update:downloaded', () => cb());
    return () => ipcRenderer.removeAllListeners('update:downloaded');
  },
  onUpdateError: (cb) => {
    ipcRenderer.on('update:error', (_e, info) => cb(info));
    return () => ipcRenderer.removeAllListeners('update:error');
  },

  // ── Tema ─────────────────────────────────────────────────────────────────
  getSystemTheme: () => ipcRenderer.invoke('theme:get'),
  setTheme: (dark) => ipcRenderer.invoke('theme:set', dark),

  // ── Utilidades ───────────────────────────────────────────────────────────
  isElectron: true,
  platform: process.platform,
});
