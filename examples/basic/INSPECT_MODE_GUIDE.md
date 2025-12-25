# How to Use Inspect Mode

Inspect mode allows you to interactively select objects in your 3D scene by clicking on them.

## Quick Start

1. **Open the example**: Run `pnpm dev` in the `examples/basic` directory
2. **Enable Inspect Mode**: Press the **`I`** key
3. **Select Objects**: Click on any object in the 3D scene
4. **See Selection**: Selected objects will show a cyan bounding box
5. **Hover Highlight**: Move your mouse over objects to see a blue highlight
6. **Disable Inspect Mode**: Press **`I`** again to turn it off

## Visual Indicators

- **When Inspect Mode is ON**: 
  - A cyan banner appears at the top: "🔍 INSPECT MODE: Click objects to select them | Press I to disable"
  - Your cursor changes to a crosshair (crosshair icon)
  - Objects show a blue highlight when you hover over them

- **When Inspect Mode is OFF**:
  - Normal cursor
  - No hover highlights
  - Banner disappears

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `I` | Toggle inspect mode on/off |
| `Ctrl+Shift+D` | Toggle devtool overlay |

## What You Can Do

1. **Click to Select**: Click any mesh object in the scene to select it
   - Selected objects show a cyan bounding box
   - Selection appears in the devtool overlay (if open)

2. **Hover to Preview**: Move your mouse over objects to see a blue highlight
   - Helps you see what you're about to select
   - Only works when inspect mode is enabled

3. **Click Empty Space**: Click on empty space to deselect

## Troubleshooting

**Inspect mode doesn't work?**
- Make sure you pressed `I` to enable it (check for the banner at the top)
- Make sure you're clicking on actual mesh objects (not lights, cameras, or helpers)
- Check the browser console for any errors

**Cursor doesn't change?**
- Inspect mode might not be enabled - press `I` again
- Make sure the canvas element is properly initialized

**Objects don't highlight?**
- Make sure `probe.setThreeReference(THREE)` was called
- Make sure inspect mode is enabled (press `I`)

## Code Example

```typescript
import { createProbe } from '@3lens/core';
import * as THREE from 'three';

const probe = createProbe({ appName: 'My App' });
probe.setThreeReference(THREE);
probe.observeRenderer(renderer);
probe.observeScene(scene);

// Initialize inspect mode
probe.initializeInspectMode(renderer.domElement, camera, THREE);

// Enable/disable programmatically
probe.setInspectModeEnabled(true);  // Enable
probe.setInspectModeEnabled(false); // Disable

// Check if enabled
if (probe.isInspectModeEnabled()) {
  console.log('Inspect mode is active');
}
```

