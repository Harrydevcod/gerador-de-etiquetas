// Superfície da bridge exposta em electron/preload.cjs (contextBridge → window.electronAPI).
// Fonte única de verdade — substitui os casts `(window as any).electronAPI`.

export interface AppInfo {
  version: string;
  platform: string;
  userDataPath: string;
}

export interface ElectronAPI {
  // App
  getAppInfo(): Promise<AppInfo>;

  // Ficheiros
  openExcelDialog(): Promise<string | null>;
  readFile(filePath: string): Promise<ArrayBuffer>;
  saveExcelDialog(defaultName?: string): Promise<string | null>;
  saveWordDialog(defaultName?: string): Promise<string | null>;
  savePdfDialog(defaultName?: string): Promise<string | null>;
  saveCsvDialog(defaultName?: string): Promise<string | null>;
  writeFile(filePath: string, data: ArrayBufferLike): Promise<boolean>;
  showItemInFolder(filePath: string): Promise<void>;
  openPath(filePath: string): Promise<string>;

  // Atualizações
  checkForUpdates(): Promise<void>;
  downloadUpdate(): Promise<void>;
  installUpdate(): Promise<void>;
  onUpdateAvailable(cb: (info: { version: string }) => void): () => void;
  onUpdateProgress(cb: (info: { percent: number }) => void): () => void;
  onUpdateDownloaded(cb: () => void): () => void;
  onUpdateError(cb: (info: { message: string }) => void): () => void;

  // Tema
  getSystemTheme(): Promise<boolean>;
  setTheme(dark: boolean): Promise<void>;

  // Utilidades
  isElectron: true;
  platform: string;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
