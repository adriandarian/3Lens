# 3Lens Electron Desktop Example

This example demonstrates how to integrate 3Lens devtools with an Electron desktop application.

## Features Demonstrated

- **Electron Main Process**: App window creation and IPC communication
- **Preload Script**: Secure API bridge between main and renderer
- **Context Isolation**: Secure renderer with contextBridge
- **GPU Info Access**: Electron-specific GPU information
- **Native Title Bar**: Custom draggable title bar
- **3Lens Integration**: Full devtool overlay in desktop app

## Getting Started

```bash
# From the monorepo root
pnpm install

# Development mode (runs Vite + Electron)
pnpm --filter @3lens/example-electron-desktop dev

# Build for production
pnpm --filter @3lens/example-electron-desktop build

# Package as distributable
pnpm --filter @3lens/example-electron-desktop package
```

## Code Structure

```
src/
├── main/
│   ├── main.ts          # Electron main process
│   └── preload.ts       # Preload script for IPC bridge
└── renderer/
    ├── index.html       # Renderer HTML
    └── main.ts          # Three.js scene with 3Lens
```

## Key Electron Patterns

### 1. Main Process Setup

```typescript
// src/main/main.ts
import { app, BrowserWindow } from 'electron';

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Load Vite dev server or built files
  if (isDev) {
    mainWindow.loadURL('http://localhost:3009');
  } else {
    mainWindow.loadFile('dist/renderer/index.html');
  }
}
```

### 2. Preload Script for Secure IPC

```typescript
// src/main/preload.ts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getGpuInfo: () => ipcRenderer.invoke('get-gpu-info'),
  getAppMetrics: () => ipcRenderer.invoke('get-app-metrics'),
});
```

### 3. Renderer with 3Lens

```typescript
// src/renderer/main.ts
import { createProbe } from '@3lens/core';
import { bootstrapOverlay } from '@3lens/overlay';

const probe = createProbe({ renderer, scene, camera });
probe.setAppName('My Electron App');
bootstrapOverlay(probe);
```

### 4. Accessing Electron APIs from Renderer

```typescript
// In renderer, use the exposed API
if (window.electronAPI) {
  window.electronAPI.onAppInfo((info) => {
    console.log('Electron:', info.electronVersion);
    console.log('Chrome:', info.chromeVersion);
  });

  const gpuInfo = await window.electronAPI.getGpuInfo();
}
```

## Electron-Specific Features

### GPU Information

Electron provides access to detailed GPU information not available in browsers:

```typescript
// Main process
ipcMain.handle('get-gpu-info', async () => {
  return app.getGPUInfo('complete');
});
```

### App Metrics

Monitor Electron process metrics:

```typescript
ipcMain.handle('get-app-metrics', () => {
  return app.getAppMetrics();
});
```

### Native Window Controls

```css
/* Custom title bar with drag region */
.title-bar {
  -webkit-app-region: drag;
  height: 32px;
}

/* Buttons should not be draggable */
.title-bar button {
  -webkit-app-region: no-drag;
}
```

## Building for Distribution

The example uses `electron-builder` for packaging:

```bash
# Build for current platform
pnpm --filter @3lens/example-electron-desktop package
```

Output locations:
- **macOS**: `release/*.dmg`
- **Windows**: `release/*.exe`
- **Linux**: `release/*.AppImage`

## Security Considerations

1. **Context Isolation**: Enabled by default for security
2. **Node Integration**: Disabled in renderer
3. **CSP**: Content Security Policy configured
4. **Preload Bridge**: Only expose necessary APIs

## Dependencies

- `@3lens/core` - Core devtool probe
- `@3lens/overlay` - Floating overlay UI
- `electron` - Desktop application framework
- `electron-builder` - App packaging
- `three` - Three.js library
- `vite` - Renderer bundler

