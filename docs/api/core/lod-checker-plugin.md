# LOD Checker Plugin

The LOD Checker is a built-in 3Lens plugin that analyzes mesh complexity relative to screen space coverage to identify Level of Detail (LOD) optimization opportunities.

## Overview

```typescript
import { LODCheckerPlugin } from '@3lens/core/plugins/builtin';

// Register and activate
pluginManager.registerPlugin(LODCheckerPlugin);
await pluginManager.activatePlugin('3lens.lod-checker');
```

## Features

- **Per-object triangle density analysis** - Measures triangles per screen pixel
- **Screen space coverage calculation** - Estimates object size on screen
- **Over-detailed object detection** - Flags objects with excessive geometry
- **LOD recommendations** - Suggests appropriate LOD levels
- **Distance-based visibility analysis** - Identifies objects too far to see
- **Existing LOD system detection** - Recognizes THREE.LOD objects

## Plugin Metadata

| Property | Value |
|----------|-------|
| ID | `3lens.lod-checker` |
| Name | LOD Checker |
| Version | 1.0.0 |
| Icon | 🔍 |
| Tags | performance, optimization, lod, mesh |

## Settings

### overDetailThreshold

Triangles per pixel threshold to flag objects as over-detailed.

| Type | Default | Min | Max |
|------|---------|-----|-----|
| `number` | 10 | 1 | 100 |

Objects with more triangles per screen pixel than this threshold are flagged for potential LOD optimization.

### minScreenSize

Minimum screen size in pixels to consider an object visible.

| Type | Default | Min | Max |
|------|---------|-----|-----|
| `number` | 5 | 1 | 50 |

Objects smaller than this are flagged as "too small" and may not need detailed geometry.

### maxAnalysisDistance

Maximum distance from camera to include in analysis.

| Type | Default | Min | Max |
|------|---------|-----|-----|
| `number` | 1000 | 10 | 10000 |

Objects beyond this distance are excluded from analysis.

### showOverlayMarkers

Whether to highlight over-detailed objects in the viewport.

| Type | Default |
|------|---------|
| `boolean` | false |

### autoRefreshInterval

Auto-refresh interval in milliseconds. Set to 0 to disable.

| Type | Default | Min | Max |
|------|---------|-----|-----|
| `number` | 0 | 0 | 10000 |

## Analysis Results

### LODAnalysis Interface

```typescript
interface LODAnalysis {
  /** Object UUID */
  uuid: string;

  /** Object name */
  name: string;

  /** Triangle count */
  triangles: number;

  /** Distance from camera */
  distance: number;

  /** Screen space size (approximate pixels) */
  screenSize: number;

  /** Triangles per screen pixel */
  trianglesPerPixel: number;

  /** Suggested LOD level (0 = highest detail, 3 = lowest) */
  suggestedLOD: number;

  /** Is this object potentially over-detailed for its screen size? */
  isOverDetailed: boolean;

  /** Is this object too far to be visible? */
  isTooFar: boolean;

  /** Has LOD system */
  hasLOD: boolean;

  /** Current LOD level (if using LOD) */
  currentLOD?: number;
}
```

## Panel UI

The LOD Checker adds a panel showing:

1. **Summary Statistics**
   - Total objects analyzed
   - Over-detailed objects count
   - Total triangles wasted on over-detailed geometry
   - Potential memory savings

2. **Object List**
   - Sorted by triangles per pixel (worst first)
   - Color-coded by severity
   - Click to select object in scene

3. **Per-Object Details**
   - Triangle count
   - Screen size (pixels)
   - Triangles/pixel ratio
   - Recommended LOD level
   - Current distance from camera

## Usage Example

```typescript
import { createProbe, LODCheckerPlugin } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';

const probe = createProbe({
  name: 'My App',
  sampleInterval: 100,
});

const overlay = createOverlay(probe);

// Register LOD Checker plugin
const pluginManager = probe.getPluginManager();
pluginManager.registerPlugin(LODCheckerPlugin);
await pluginManager.activatePlugin('3lens.lod-checker');

// The LOD Checker panel will now appear in the overlay
```

## How It Works

### Triangle Density Calculation

The plugin calculates triangles per screen pixel:

```
trianglesPerPixel = objectTriangles / screenSizeInPixels²
```

Where screen size is estimated using:
1. Object's bounding sphere radius
2. Distance from camera
3. Camera field of view
4. Viewport dimensions

### LOD Level Recommendations

Based on triangles per pixel:

| Triangles/Pixel | Suggested LOD |
|-----------------|---------------|
| < 1 | LOD 0 (High) |
| 1-5 | LOD 1 (Medium) |
| 5-20 | LOD 2 (Low) |
| > 20 | LOD 3 (Minimal) |

### Over-Detail Detection

An object is flagged as over-detailed when:
- `trianglesPerPixel > overDetailThreshold`
- Object is visible (not culled)
- Object has significant screen presence

## Best Practices

1. **Run analysis after scene loads** - Wait for all assets to load before analyzing

2. **Check from typical camera positions** - Analysis depends on camera distance

3. **Focus on high-triangle objects first** - Sort by triangle count for biggest wins

4. **Consider animation** - Objects may move closer/further during gameplay

5. **Use with LOD system** - Implement THREE.LOD for flagged objects

## Implementing LOD Based on Results

```typescript
// Example: Create LOD for an over-detailed mesh
function createLODForMesh(mesh: THREE.Mesh, analysis: LODAnalysis) {
  const lod = new THREE.LOD();
  
  // LOD 0: Original (high detail)
  lod.addLevel(mesh, 0);
  
  // LOD 1: Medium detail (50% triangles)
  const mediumMesh = createSimplifiedMesh(mesh, 0.5);
  lod.addLevel(mediumMesh, analysis.distance * 0.5);
  
  // LOD 2: Low detail (25% triangles)
  const lowMesh = createSimplifiedMesh(mesh, 0.25);
  lod.addLevel(lowMesh, analysis.distance * 1.5);
  
  // LOD 3: Minimal (10% triangles or billboard)
  const minimalMesh = createSimplifiedMesh(mesh, 0.1);
  lod.addLevel(minimalMesh, analysis.distance * 3);
  
  return lod;
}
```

## Integration with Custom Analysis

Access analysis results programmatically:

```typescript
// Get the plugin's state
const registered = pluginManager.getPlugin('3lens.lod-checker');
const lastAnalysis = registered?.storage.lastAnalysis as LODAnalysis[] | null;

if (lastAnalysis) {
  // Find all over-detailed objects
  const overDetailed = lastAnalysis.filter(a => a.isOverDetailed);
  
  console.log(`Found ${overDetailed.length} over-detailed objects`);
  
  // Calculate total wasted triangles
  const wastedTriangles = overDetailed.reduce((sum, a) => {
    const optimalTriangles = a.screenSize * a.screenSize; // 1 tri per pixel
    return sum + Math.max(0, a.triangles - optimalTriangles);
  }, 0);
  
  console.log(`Potentially ${wastedTriangles.toLocaleString()} wasted triangles`);
}
```

## See Also

- [DevtoolPlugin](./devtool-plugin.md) - Plugin interface
- [Shadow Debugger Plugin](./shadow-debugger-plugin.md) - Another built-in plugin
- [Plugin Development Guide](/guides/PLUGIN-DEVELOPMENT.md) - Creating custom plugins
- [Performance Debugging](/guides/performance-debugging.md) - General performance tips
