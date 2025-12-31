import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';

/**
 * Electron Main Process
 * 
 * Creates the application window and handles IPC communication.
 */

let mainWindow: BrowserWindow | null = null;

// Determine if we're in development mode
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#0a0a0f',
  });

  // Load the app
  if (isDev) {
    // In development, load from Vite dev server
    mainWindow.loadURL('http://localhost:3009');
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load the built files
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Log GPU info
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow?.webContents.send('app-info', {
      electronVersion: process.versions.electron,
      chromeVersion: process.versions.chrome,
      nodeVersion: process.versions.node,
      platform: process.platform,
    });
  });
}

// Handle app lifecycle
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers
ipcMain.handle('get-gpu-info', async () => {
  const gpuInfo = await app.getGPUInfo('complete');
  return gpuInfo;
});

ipcMain.handle('get-app-metrics', () => {
  return app.getAppMetrics();
});

