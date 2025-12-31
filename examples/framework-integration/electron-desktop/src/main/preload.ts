import { contextBridge, ipcRenderer } from 'electron';

/**
 * Electron Preload Script
 * 
 * Exposes safe APIs to the renderer process.
 */

// Expose protected methods to the renderer
contextBridge.exposeInMainWorld('electronAPI', {
  // Get GPU information
  getGpuInfo: () => ipcRenderer.invoke('get-gpu-info'),
  
  // Get app metrics
  getAppMetrics: () => ipcRenderer.invoke('get-app-metrics'),
  
  // Listen for app info
  onAppInfo: (callback: (info: unknown) => void) => {
    ipcRenderer.on('app-info', (_, info) => callback(info));
  },
  
  // Platform info
  platform: process.platform,
});

// Type definitions for the exposed API
declare global {
  interface Window {
    electronAPI: {
      getGpuInfo: () => Promise<unknown>;
      getAppMetrics: () => Promise<unknown>;
      onAppInfo: (callback: (info: unknown) => void) => void;
      platform: NodeJS.Platform;
    };
  }
}

