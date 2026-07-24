'use strict';

const { app, BrowserWindow, shell, ipcMain, dialog, Menu, nativeTheme } = require('electron');
const path = require('path');
const fs = require('fs');

const isDev = process.env.ELECTRON_DEV === 'true';
const APP_VERSION = app.getVersion();

// ── Allow-list de caminhos ───────────────────────────────────────────────────
// O renderer só pode ler/escrever/abrir caminhos que o utilizador escolheu
// explicitamente num diálogo nativo. Sem isto, qualquer path do renderer chegava
// a fs/shell sem validação (superfície ampla atrás dos sinks de HTML).
const dialogPaths = new Set();

function allowPath(filePath) {
  if (filePath) dialogPaths.add(path.resolve(String(filePath)));
  return filePath;
}

function assertAllowed(filePath) {
  const p = path.resolve(String(filePath || ''));
  if (!dialogPaths.has(p)) throw new Error('Caminho não autorizado');
  return p;
}

// ── Persistent window state ─────────────────────────────────────────────────
const stateFile = path.join(app.getPath('userData'), 'window-state.json');

function loadWindowState() {
  try {
    return JSON.parse(fs.readFileSync(stateFile, 'utf8'));
  } catch {
    return { width: 1280, height: 800, x: undefined, y: undefined, maximized: false };
  }
}

function saveWindowState(win) {
  if (win.isMaximized()) {
    fs.writeFileSync(stateFile, JSON.stringify({ ...loadWindowState(), maximized: true }));
    return;
  }
  const b = win.getBounds();
  fs.writeFileSync(stateFile, JSON.stringify({ ...b, maximized: false }));
}

// ── Auto-updater (produção apenas) ───────────────────────────────────────────
let autoUpdater = null;

function setupAutoUpdater(win) {
  try {
    autoUpdater = require('electron-updater').autoUpdater;
  } catch {
    return; // electron-updater não instalado → skip silencioso
  }

  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('update-available', (info) => {
    win.webContents.send('update:available', { version: info.version });
  });

  autoUpdater.on('update-not-available', () => {
    win.webContents.send('update:not-available');
  });

  autoUpdater.on('download-progress', (progress) => {
    win.webContents.send('update:progress', { percent: Math.round(progress.percent) });
  });

  autoUpdater.on('update-downloaded', () => {
    win.webContents.send('update:downloaded');
  });

  autoUpdater.on('error', (err) => {
    win.webContents.send('update:error', { message: err.message });
  });

  // Verificar 30 segundos após arranque
  setTimeout(() => autoUpdater.checkForUpdates().catch(() => {}), 30_000);
}

// ── IPC Handlers ─────────────────────────────────────────────────────────────
function registerIPC() {
  // Info da app
  ipcMain.handle('app:info', () => ({
    version: APP_VERSION,
    platform: process.platform,
    userDataPath: app.getPath('userData'),
  }));

  // Diálogo abrir ficheiro Excel
  ipcMain.handle('dialog:open-excel', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
      title: 'Importar Excel',
      filters: [{ name: 'Excel / CSV', extensions: ['xlsx', 'xls', 'csv'] }],
      properties: ['openFile'],
    });
    if (canceled || !filePaths.length) return null;
    return allowPath(filePaths[0]);
  });

  // Ler ficheiro do disco (só caminhos escolhidos num diálogo)
  ipcMain.handle('fs:read-file', async (_event, filePath) => {
    try {
      const buf = fs.readFileSync(assertAllowed(filePath));
      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
    } catch (err) {
      throw new Error(`Não foi possível ler o ficheiro: ${err.message}`);
    }
  });

  // Diálogo guardar Excel
  ipcMain.handle('dialog:save-excel', async (event, defaultName) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    const { canceled, filePath } = await dialog.showSaveDialog(win, {
      title: 'Exportar Excel',
      defaultPath: defaultName || 'etiquetas.xlsx',
      filters: [{ name: 'Excel', extensions: ['xlsx'] }],
    });
    return canceled ? null : allowPath(filePath);
  });

  // Escrever ficheiro no disco (só caminhos escolhidos num diálogo)
  ipcMain.handle('fs:write-file', async (_event, filePath, data) => {
    try {
      const buf = Buffer.from(data);
      fs.writeFileSync(assertAllowed(filePath), buf);
      return true;
    } catch (err) {
      throw new Error(`Não foi possível guardar: ${err.message}`);
    }
  });

  // Diálogo guardar Word
  ipcMain.handle('dialog:save-word', async (event, defaultName) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    const { canceled, filePath } = await dialog.showSaveDialog(win, {
      title: 'Exportar Word',
      defaultPath: defaultName || 'etiquetas.docx',
      filters: [{ name: 'Word', extensions: ['docx'] }],
    });
    return canceled ? null : allowPath(filePath);
  });

  // Diálogo guardar PDF
  ipcMain.handle('dialog:save-pdf', async (event, defaultName) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    const { canceled, filePath } = await dialog.showSaveDialog(win, {
      title: 'Exportar PDF',
      defaultPath: defaultName || 'etiquetas.pdf',
      filters: [{ name: 'PDF', extensions: ['pdf'] }],
    });
    return canceled ? null : allowPath(filePath);
  });

  // Diálogo guardar CSV
  ipcMain.handle('dialog:save-csv', async (event, defaultName) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    const { canceled, filePath } = await dialog.showSaveDialog(win, {
      title: 'Exportar CSV',
      defaultPath: defaultName || 'etiquetas.csv',
      filters: [{ name: 'CSV', extensions: ['csv'] }],
    });
    return canceled ? null : allowPath(filePath);
  });

  // Abrir pasta no explorador (só caminhos escolhidos num diálogo)
  ipcMain.handle('shell:show-item', (_event, filePath) => {
    shell.showItemInFolder(assertAllowed(filePath));
  });

  // Abrir ficheiro no programa padrão (só caminhos escolhidos num diálogo)
  ipcMain.handle('shell:open-path', (_event, filePath) => {
    return shell.openPath(assertAllowed(filePath));
  });

  // Auto-updater
  ipcMain.handle('update:download', () => {
    if (autoUpdater) autoUpdater.downloadUpdate().catch(() => {});
  });

  ipcMain.handle('update:install', () => {
    if (autoUpdater) autoUpdater.quitAndInstall();
  });

  ipcMain.handle('update:check', () => {
    if (autoUpdater) autoUpdater.checkForUpdates().catch(() => {});
  });

  // Tema nativo
  ipcMain.handle('theme:get', () => nativeTheme.shouldUseDarkColors);
  ipcMain.handle('theme:set', (_event, dark) => {
    nativeTheme.themeSource = dark ? 'dark' : 'light';
  });
}

// ── Menu nativo ───────────────────────────────────────────────────────────────
function buildMenu(win) {
  const template = [
    {
      label: 'NOVA-ERP Etiquetas',
      submenu: [
        {
          label: `Versão ${APP_VERSION}`,
          enabled: false,
        },
        { type: 'separator' },
        {
          label: 'Verificar atualizações',
          click: () => {
            if (autoUpdater) autoUpdater.checkForUpdates().catch(() => {});
            else dialog.showMessageBox(win, { type: 'info', message: 'Verificação de atualizações não disponível nesta versão.' });
          },
        },
        { type: 'separator' },
        { role: 'quit', label: 'Sair' },
      ],
    },
    {
      label: 'Editar',
      submenu: [
        { role: 'undo', label: 'Desfazer' },
        { role: 'redo', label: 'Refazer' },
        { type: 'separator' },
        { role: 'cut', label: 'Cortar' },
        { role: 'copy', label: 'Copiar' },
        { role: 'paste', label: 'Colar' },
        { role: 'selectAll', label: 'Selecionar Tudo' },
      ],
    },
    {
      label: 'Ver',
      submenu: [
        { role: 'reload', label: 'Recarregar' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Zoom Normal' },
        { role: 'zoomIn', label: 'Aumentar Zoom' },
        { role: 'zoomOut', label: 'Diminuir Zoom' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Ecrã Inteiro' },
        ...(isDev ? [{ type: 'separator' }, { role: 'toggleDevTools', label: 'DevTools' }] : []),
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// ── Janela principal ──────────────────────────────────────────────────────────
function createWindow() {
  const state = loadWindowState();

  const iconPath = isDev
    ? path.join(__dirname, '../build/icon.png')
    : path.join(process.resourcesPath, 'icon.png');

  const win = new BrowserWindow({
    width: state.width,
    height: state.height,
    x: state.x,
    y: state.y,
    minWidth: 960,
    minHeight: 640,
    title: 'NOVA-ERP Etiquetas',
    icon: iconPath,
    backgroundColor: '#0f0f0f',
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
    autoHideMenuBar: false,
  });

  if (state.maximized) win.maximize();

  if (isDev) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  win.once('ready-to-show', () => win.show());

  // Guardar estado ao fechar
  win.on('close', () => saveWindowState(win));

  // Links externos → browser do sistema
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Bloquear navegação para fora da app
  win.webContents.on('will-navigate', (event, url) => {
    const appUrl = isDev ? 'http://localhost:5173' : `file://${path.join(__dirname, '../dist')}`;
    if (!url.startsWith(appUrl)) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  buildMenu(win);

  if (!isDev) setupAutoUpdater(win);

  return win;
}

// ── App lifecycle ─────────────────────────────────────────────────────────────
registerIPC();

app.whenReady().then(() => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// Forçar instância única
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    const wins = BrowserWindow.getAllWindows();
    if (wins.length) {
      if (wins[0].isMinimized()) wins[0].restore();
      wins[0].focus();
    }
  });
}
