---
title: Migration from lil-gui to 3Lens
description: Guide for migrating from lil-gui or dat.GUI to 3Lens for Three.js debugging
---

# Migration from lil-gui to 3Lens

This guide helps you migrate from [lil-gui](https://lil-gui.georgealways.com/) (or its predecessor dat.GUI) to 3Lens for Three.js debugging and development.

## Table of Contents

- [Overview](#overview)
- [Why Migrate?](#why-migrate)
- [Quick Migration](#quick-migration)
- [Feature Mapping](#feature-mapping)
- [Common Patterns](#common-patterns)
- [Advanced Migration](#advanced-migration)
- [Coexistence Strategy](#coexistence-strategy)
- [Troubleshooting](#troubleshooting)

---

## Overview

lil-gui is a lightweight GUI library for changing JavaScript variables, commonly used with Three.js for tweaking parameters during development. While excellent for simple parameter controls, 3Lens offers a more comprehensive debugging experience specifically designed for Three.js applications.

### Key Differences

| Feature | lil-gui | 3Lens |
|---------|---------|-------|
| **Purpose** | General parameter tweaking | Three.js-specific debugging |
| **Scene Inspection** | ❌ Manual setup required | ✅ Automatic scene tree |
| **Performance Metrics** | ❌ Not included | ✅ FPS, draw calls, memory |
| **Memory Tracking** | ❌ Not included | ✅ Leak detection, disposal |
| **Object Selection** | ❌ Manual binding | ✅ Click-to-select in viewport |
| **Material Editing** | ⚠️ Manual property binding | ✅ Auto-detected properties |
| **Transform Gizmos** | ❌ Not included | ✅ Built-in translate/rotate/scale |
| **Framework Support** | ❌ Vanilla only | ✅ React, Vue, Angular bridges |

---

## Why Migrate?

### Limitations of lil-gui for Three.js

```javascript
// lil-gui: Manual setup for every object
const gui = new GUI();
const cubeFolder = gui.addFolder('Cube');
cubeFolder.add(cube.position, 'x', -10, 10);
cubeFolder.add(cube.position, 'y', -10, 10);
cubeFolder.add(cube.position, 'z', -10, 10);
cubeFolder.add(cube.rotation, 'x', 0, Math.PI * 2);
cubeFolder.add(cube.rotation, 'y', 0, Math.PI * 2);
cubeFolder.add(cube.rotation, 'z', 0, Math.PI * 2);
// Repeat for every object...

// Material properties need manual binding
const materialFolder = gui.addFolder('Material');
materialFolder.addColor({ color: '#ff0000' }, 'color')
  .onChange(value => cube.material.color.set(value));
materialFolder.add(cube.material, 'metalness', 0, 1);
materialFolder.add(cube.material, 'roughness', 0, 1);
// Many more properties...
```

```javascript
// 3Lens: Automatic inspection of everything
import { createProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';

const probe = createProbe({ renderer, scene, camera });
createOverlay(probe);
// Done! All objects, materials, and properties are automatically available
```

### Benefits of 3Lens

1. **Zero Configuration** - Automatically discovers all scene objects
2. **Performance Insights** - Built-in FPS, draw calls, memory tracking
3. **Memory Safety** - Detects resource leaks automatically
4. **Visual Selection** - Click objects in the viewport to inspect
5. **Framework Integration** - Native hooks/composables for React/Vue/Angular
6. **Production Safety** - Tree-shakeable, conditional loading

---

## Quick Migration

### Step 1: Install 3Lens

```bash
npm install @3lens/core @3lens/overlay
```

### Step 2: Replace lil-gui Initialization

**Before (lil-gui):**
```javascript
import GUI from 'lil-gui';
import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

// lil-gui setup
const gui = new GUI();

// Manual folder for each object type
const sceneFolder = gui.addFolder('Scene');
const lightFolder = gui.addFolder('Lights');
const meshFolder = gui.addFolder('Meshes');

// Manually add controls for each property
meshFolder.add(cube.position, 'x', -10, 10).name('Position X');
meshFolder.add(cube.position, 'y', -10, 10).name('Position Y');
// ... hundreds more lines
```

**After (3Lens):**
```javascript
import * as THREE from 'three';
import { createProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

// 3Lens setup - that's it!
const probe = createProbe({ renderer, scene, camera });
createOverlay(probe);
```

### Step 3: Remove lil-gui

```bash
npm uninstall lil-gui
```

---

## Feature Mapping

### Property Controls

**lil-gui pattern:**
```javascript
const gui = new GUI();

// Number slider
gui.add(object, 'speed', 0, 100);

// Color picker
gui.addColor(object, 'color');

// Dropdown
gui.add(object, 'type', ['option1', 'option2', 'option3']);

// Checkbox
gui.add(object, 'visible');

// Button
gui.add({ reset: () => resetScene() }, 'reset');
```

**3Lens equivalent:**

3Lens automatically provides appropriate controls based on the Three.js object type. For custom controls, use the plugin system:

```javascript
import { createProbe, DevtoolPlugin } from '@3lens/core';

// Custom controls via plugin
const customControlsPlugin: DevtoolPlugin = {
  name: 'custom-controls',
  
  initialize(context) {
    // Register custom properties
    context.registerProperty('speed', {
      get: () => gameState.speed,
      set: (value) => gameState.speed = value,
      min: 0,
      max: 100,
      step: 1
    });
    
    // Register actions (like lil-gui buttons)
    context.registerAction('reset', {
      label: 'Reset Scene',
      execute: () => resetScene()
    });
  }
};

const probe = createProbe({
  renderer, scene, camera,
  plugins: [customControlsPlugin]
});
```

### Folders and Organization

**lil-gui pattern:**
```javascript
const gui = new GUI();
const folder = gui.addFolder('Transform');
folder.add(mesh.position, 'x');
folder.add(mesh.position, 'y');
folder.add(mesh.position, 'z');

const nested = folder.addFolder('Rotation');
nested.add(mesh.rotation, 'x');
```

**3Lens equivalent:**

3Lens automatically organizes properties by:
- Scene hierarchy (Scene Explorer panel)
- Object type (Meshes, Lights, Cameras)
- Property category (Transform, Material, Geometry)

For custom grouping:
```javascript
import { createProbe } from '@3lens/core';

const probe = createProbe({ renderer, scene, camera });

// Group related objects as logical entities
probe.registerLogicalEntity('Player', {
  objects: [playerMesh, playerCollider, playerShadow],
  metadata: { type: 'character', team: 'blue' }
});

probe.registerLogicalEntity('Enemy', {
  objects: [enemyMesh, enemyCollider],
  metadata: { type: 'character', team: 'red' }
});
```

### Color Controls

**lil-gui pattern:**
```javascript
const params = { color: '#ff0000' };
gui.addColor(params, 'color').onChange(value => {
  material.color.set(value);
});
```

**3Lens equivalent:**

Colors are automatically detected and editable:
1. Select any mesh in the Scene Explorer
2. Expand the Material section in Object Inspector
3. Click the color swatch to open the color picker

For programmatic access:
```javascript
// React
import { useSelectedObject } from '@3lens/react-bridge';

function ColorEditor() {
  const { object } = useSelectedObject();
  
  if (object?.material?.color) {
    return (
      <input 
        type="color" 
        value={'#' + object.material.color.getHexString()}
        onChange={e => object.material.color.set(e.target.value)}
      />
    );
  }
}
```

### Transform Controls

**lil-gui pattern:**
```javascript
const transformFolder = gui.addFolder('Transform');
transformFolder.add(mesh.position, 'x', -10, 10);
transformFolder.add(mesh.position, 'y', -10, 10);
transformFolder.add(mesh.position, 'z', -10, 10);
transformFolder.add(mesh.rotation, 'x', 0, Math.PI * 2);
transformFolder.add(mesh.rotation, 'y', 0, Math.PI * 2);
transformFolder.add(mesh.rotation, 'z', 0, Math.PI * 2);
transformFolder.add(mesh.scale, 'x', 0.1, 5);
transformFolder.add(mesh.scale, 'y', 0.1, 5);
transformFolder.add(mesh.scale, 'z', 0.1, 5);
```

**3Lens equivalent:**

Transform controls are built-in:
- **Visual gizmos**: Press `W` (translate), `E` (rotate), `R` (scale)
- **Numeric input**: Object Inspector shows all transform properties
- **Coordinate space**: Toggle local/world with `L`

```javascript
// Programmatic transform editing
probe.on('objectSelected', (object) => {
  // Access transform directly
  console.log(object.position, object.rotation, object.scale);
});
```

---

## Common Patterns

### Pattern 1: Debug Parameters Object

**lil-gui pattern:**
```javascript
const debugParams = {
  wireframe: false,
  shadows: true,
  fogDensity: 0.01,
  timeScale: 1.0
};

const gui = new GUI();
gui.add(debugParams, 'wireframe').onChange(updateMaterials);
gui.add(debugParams, 'shadows').onChange(updateShadows);
gui.add(debugParams, 'fogDensity', 0, 0.1).onChange(updateFog);
gui.add(debugParams, 'timeScale', 0, 2);
```

**3Lens equivalent:**

Use a custom plugin for debug parameters:

```javascript
// debug-params-plugin.ts
import type { DevtoolPlugin } from '@3lens/core';

interface DebugParams {
  wireframe: boolean;
  shadows: boolean;
  fogDensity: number;
  timeScale: number;
}

export function createDebugParamsPlugin(
  params: DebugParams,
  callbacks: Partial<Record<keyof DebugParams, (value: any) => void>>
): DevtoolPlugin {
  return {
    name: 'debug-params',
    
    initialize(context) {
      // Register each parameter
      Object.entries(params).forEach(([key, value]) => {
        context.registerProperty(key, {
          get: () => params[key as keyof DebugParams],
          set: (newValue) => {
            (params as any)[key] = newValue;
            callbacks[key as keyof DebugParams]?.(newValue);
          },
          // Auto-detect control type
          ...(typeof value === 'boolean' ? { type: 'boolean' } : {}),
          ...(typeof value === 'number' ? { 
            type: 'number',
            min: 0,
            max: key === 'fogDensity' ? 0.1 : 2,
            step: 0.01
          } : {})
        });
      });
    },
    
    // Add panel to UI
    panels: [{
      id: 'debug-params',
      title: 'Debug Parameters',
      render: (container) => {
        // Custom UI rendering
      }
    }]
  };
}

// Usage
const debugParams = {
  wireframe: false,
  shadows: true,
  fogDensity: 0.01,
  timeScale: 1.0
};

const probe = createProbe({
  renderer, scene, camera,
  plugins: [
    createDebugParamsPlugin(debugParams, {
      wireframe: (v) => scene.traverse(obj => {
        if (obj.material) obj.material.wireframe = v;
      }),
      shadows: (v) => renderer.shadowMap.enabled = v,
      fogDensity: (v) => scene.fog.density = v
    })
  ]
});
```

### Pattern 2: Per-Object Controls

**lil-gui pattern:**
```javascript
function addMeshControls(mesh, gui) {
  const folder = gui.addFolder(mesh.name || 'Mesh');
  folder.add(mesh, 'visible');
  folder.add(mesh.position, 'x', -10, 10);
  folder.add(mesh.position, 'y', -10, 10);
  folder.add(mesh.position, 'z', -10, 10);
  
  if (mesh.material) {
    const matFolder = folder.addFolder('Material');
    matFolder.add(mesh.material, 'wireframe');
    matFolder.add(mesh.material, 'opacity', 0, 1);
  }
  
  return folder;
}

// Add controls for each mesh
scene.traverse(obj => {
  if (obj.isMesh) addMeshControls(obj, gui);
});
```

**3Lens equivalent:**

This is automatic! 3Lens discovers and provides controls for all objects:

```javascript
// Just initialize 3Lens - all objects are automatically available
const probe = createProbe({ renderer, scene, camera });
createOverlay(probe);

// Objects added later are also automatically tracked
scene.add(newMesh); // Appears in Scene Explorer immediately
```

### Pattern 3: Animation Control

**lil-gui pattern:**
```javascript
const animParams = {
  playing: true,
  speed: 1.0,
  currentTime: 0
};

const animFolder = gui.addFolder('Animation');
animFolder.add(animParams, 'playing');
animFolder.add(animParams, 'speed', 0, 2);
animFolder.add(animParams, 'currentTime', 0, animation.duration)
  .listen()
  .onChange(t => animation.time = t);

// Update in render loop
function animate() {
  animParams.currentTime = animation.time;
}
```

**3Lens equivalent:**

```javascript
// Animation controls are built into 3Lens
// Select any object with AnimationMixer to see controls

// For custom animation systems, register metrics
probe.registerMetric('animation.time', {
  get: () => animation.time,
  set: (t) => animation.time = t,
  min: 0,
  max: animation.duration
});

probe.registerMetric('animation.speed', {
  get: () => animation.timeScale,
  set: (s) => animation.timeScale = s,
  min: 0,
  max: 2
});
```

---

## Advanced Migration

### Migrating Custom lil-gui Controllers

If you have custom lil-gui controllers, convert them to 3Lens plugins:

**lil-gui custom controller:**
```javascript
class Vector3Controller extends Controller {
  constructor(parent, object, property) {
    super(parent, object, property);
    // Custom Vector3 UI...
  }
}

gui.add(mesh, 'position', Vector3Controller);
```

**3Lens custom editor:**
```javascript
// plugins/vector3-editor.ts
import type { DevtoolPlugin, PropertyEditor } from '@3lens/core';
import * as THREE from 'three';

const Vector3Editor: PropertyEditor = {
  type: 'vector3',
  
  matches: (value) => value instanceof THREE.Vector3,
  
  render: (container, value, onChange) => {
    const inputs = ['x', 'y', 'z'].map(axis => {
      const input = document.createElement('input');
      input.type = 'number';
      input.value = value[axis];
      input.addEventListener('change', () => {
        value[axis] = parseFloat(input.value);
        onChange(value);
      });
      return input;
    });
    
    container.append(...inputs);
  }
};

export const vector3Plugin: DevtoolPlugin = {
  name: 'vector3-editor',
  
  initialize(context) {
    context.registerPropertyEditor(Vector3Editor);
  }
};
```

### Migrating Save/Load Presets

**lil-gui pattern:**
```javascript
gui.save(); // Returns JSON object
gui.load(presetObject);
```

**3Lens equivalent:**
```javascript
// Save current scene state
const snapshot = probe.createSnapshot();
localStorage.setItem('scenePreset', JSON.stringify(snapshot));

// Load preset
const preset = JSON.parse(localStorage.getItem('scenePreset'));
probe.applySnapshot(preset);

// Or use built-in preset system
probe.savePreset('my-preset');
probe.loadPreset('my-preset');
```

### Migrating onChange Handlers

**lil-gui pattern:**
```javascript
gui.add(params, 'intensity', 0, 2)
  .onChange(value => {
    lights.forEach(light => light.intensity = value);
  });
```

**3Lens equivalent:**
```javascript
// Option 1: Use probe events
probe.on('propertyChanged', ({ object, property, value }) => {
  if (property === 'intensity') {
    lights.forEach(light => light.intensity = value);
  }
});

// Option 2: Use watchers (React)
import { useWatch } from '@3lens/react-bridge';

function LightIntensitySync() {
  useWatch('light.intensity', (value) => {
    lights.forEach(light => light.intensity = value);
  });
  return null;
}

// Option 3: Use computed properties
probe.registerComputedProperty('globalIntensity', {
  get: () => lights[0]?.intensity ?? 1,
  set: (value) => lights.forEach(l => l.intensity = value)
});
```

---

## Coexistence Strategy

You don't have to migrate everything at once. 3Lens and lil-gui can coexist:

```javascript
import GUI from 'lil-gui';
import { createProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';

// Keep lil-gui for custom app controls
const gui = new GUI({ title: 'App Settings' });
gui.add(appSettings, 'quality', ['low', 'medium', 'high']);
gui.add(appSettings, 'musicVolume', 0, 1);

// Use 3Lens for Three.js debugging
const probe = createProbe({ renderer, scene, camera });
createOverlay(probe);

// Position them to not overlap
gui.domElement.style.top = '10px';
gui.domElement.style.right = '10px';
```

### Gradual Migration Plan

1. **Phase 1**: Install 3Lens alongside lil-gui
   - Use 3Lens for scene inspection
   - Keep lil-gui for custom controls

2. **Phase 2**: Migrate object controls
   - Remove per-object lil-gui folders
   - Use 3Lens Scene Explorer instead

3. **Phase 3**: Migrate custom controls to plugins
   - Convert lil-gui controllers to 3Lens plugins
   - Add custom panels as needed

4. **Phase 4**: Remove lil-gui
   - All functionality now in 3Lens
   - Remove lil-gui dependency

---

## Troubleshooting

### "I miss the compact lil-gui interface"

3Lens overlay can be minimized:
- Press `H` to hide/show the overlay
- Press `M` to minimize to stats-only mode
- Configure initial state: `createOverlay(probe, { minimized: true })`

### "I need controls for non-Three.js properties"

Use custom plugins to expose any JavaScript properties:

```javascript
const appStatePlugin: DevtoolPlugin = {
  name: 'app-state',
  
  initialize(context) {
    // Expose any properties
    context.registerProperty('game.score', {
      get: () => gameState.score,
      set: (v) => gameState.score = v
    });
    
    context.registerProperty('audio.volume', {
      get: () => audioContext.globalVolume,
      set: (v) => audioContext.globalVolume = v,
      min: 0, max: 1
    });
  }
};
```

### "I need lil-gui's programmatic API"

3Lens provides a full programmatic API:

```javascript
// Get/set any property
const value = probe.getProperty('mesh.position.x');
probe.setProperty('mesh.position.x', 5);

// Select objects programmatically
probe.selectObject(myMesh);

// Listen to changes
probe.on('propertyChanged', handleChange);

// Trigger updates
probe.refresh();
```

### "My lil-gui styling doesn't match"

3Lens supports theming:

```javascript
createOverlay(probe, {
  theme: 'dark', // or 'light'
  
  // Custom colors
  styles: {
    '--3lens-bg': '#1a1a1a',
    '--3lens-text': '#ffffff',
    '--3lens-accent': '#00ff00'
  }
});
```

---

## Migration Checklist

- [ ] Install @3lens/core and @3lens/overlay
- [ ] Replace GUI initialization with createProbe/createOverlay
- [ ] Remove per-object folder creation (automatic in 3Lens)
- [ ] Migrate color controls (automatic in 3Lens)
- [ ] Migrate transform controls (use gizmos: W/E/R keys)
- [ ] Convert custom controllers to plugins
- [ ] Migrate onChange handlers to probe events
- [ ] Convert save/load to snapshots
- [ ] Remove lil-gui dependency
- [ ] Update documentation

---

## Next Steps

- [Getting Started Guide](/guide/getting-started) - 3Lens fundamentals
- [Plugin Development](/guides/PLUGIN-DEVELOPMENT) - Create custom plugins
- [Material Editing Guide](/guides/MATERIAL-EDITING-GUIDE) - Live material editing
- [Transform Gizmos Guide](/guides/TRANSFORM-GIZMOS-GUIDE) - Visual transform controls

---

## Keyboard Shortcuts Reference

| lil-gui | 3Lens | Action |
|---------|-------|--------|
| N/A | `H` | Toggle overlay visibility |
| N/A | `W` | Translate gizmo |
| N/A | `E` | Rotate gizmo |
| N/A | `R` | Scale gizmo |
| N/A | `F` | Focus selected object |
| N/A | `Delete` | Delete selected object |
| N/A | `Ctrl+Z` | Undo |
| N/A | `Ctrl+Shift+Z` | Redo |
