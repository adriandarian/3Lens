# Shadow Debugger Plugin

The Shadow Debugger is a built-in 3Lens plugin that analyzes shadow maps and shadow-casting lights to identify performance issues and optimization opportunities.

## Overview

```typescript
import { ShadowDebuggerPlugin } from '@3lens/core/plugins/builtin';

// Register and activate
pluginManager.registerPlugin(ShadowDebuggerPlugin);
await pluginManager.activatePlugin('3lens.shadow-debugger');
```

## Features

- **Shadow map memory analysis** - Calculates total shadow map memory usage
- **Per-light configuration inspection** - Examines each shadow-casting light
- **Issue detection** - Identifies bias, frustum, and resolution problems
- **Caster/receiver counting** - Tracks shadow-casting and receiving objects
- **Optimization suggestions** - Provides actionable recommendations

## Plugin Metadata

| Property | Value |
|----------|-------|
| ID | `3lens.shadow-debugger` |
| Name | Shadow Debugger |
| Version | 1.0.0 |
| Icon | 🔦 |
| Tags | performance, shadows, lighting, debug |

## Settings

### maxRecommendedResolution

Shadow maps above this resolution are flagged.

| Type | Default | Min | Max | Step |
|------|---------|-----|-----|------|
| `number` | 2048 | 512 | 8192 | 256 |

### minRecommendedResolution

Shadow maps below this resolution are flagged.

| Type | Default | Min | Max | Step |
|------|---------|-----|-----|------|
| `number` | 256 | 64 | 1024 | 64 |

### maxFrustumSize

Directional light frustum size warning threshold.

| Type | Default | Min | Max | Step |
|------|---------|-----|-----|------|
| `number` | 100 | 10 | 500 | 10 |

Large frustums waste shadow map resolution and should use Cascaded Shadow Maps (CSM).

### maxCastersPerLight

Warn if more than this many objects cast shadows.

| Type | Default | Min | Max | Step |
|------|---------|-----|-----|------|
| `number` | 100 | 10 | 500 | 10 |

### showFrustumVis

Draw shadow camera frustums in viewport.

| Type | Default |
|------|---------|
| `boolean` | false |

### showShadowMapPreview

Show shadow map textures in corner of viewport.

| Type | Default |
|------|---------|
| `boolean` | false |

## Analysis Results

### ShadowLightAnalysis Interface

```typescript
interface ShadowLightAnalysis {
  /** Light UUID */
  uuid: string;

  /** Light name */
  name: string;

  /** Light type */
  type: 'DirectionalLight' | 'SpotLight' | 'PointLight';

  /** Shadow map resolution */
  mapSize: { width: number; height: number };

  /** Shadow camera near */
  near: number;

  /** Shadow camera far */
  far: number;

  /** Shadow bias */
  bias: number;

  /** Normal bias */
  normalBias: number;

  /** Shadow radius (for soft shadows) */
  radius: number;

  /** Blur samples */
  blurSamples?: number;

  /** For directional lights: frustum size */
  frustumSize?: {
    left: number;
    right: number;
    top: number;
    bottom: number;
  };

  /** For spot lights: angle and penumbra */
  spotSettings?: {
    angle: number;
    penumbra: number;
  };

  /** Estimated shadow map memory (bytes) */
  memoryUsage: number;

  /** Number of objects casting shadows to this light */
  casterCount: number;

  /** Number of objects receiving shadows */
  receiverCount: number;

  /** Issues detected */
  issues: ShadowIssue[];
}
```

### ShadowIssue Interface

```typescript
interface ShadowIssue {
  type: ShadowIssueType;
  severity: 'error' | 'warning' | 'info';
  message: string;
  suggestion: string;
}

type ShadowIssueType =
  | 'high_resolution'
  | 'low_resolution'
  | 'large_frustum'
  | 'small_frustum'
  | 'high_bias'
  | 'low_bias'
  | 'too_many_casters'
  | 'no_receivers'
  | 'far_plane_too_far'
  | 'near_plane_too_close';
```

### ShadowStats Interface

```typescript
interface ShadowStats {
  /** Total shadow map memory */
  totalMemory: number;

  /** Number of shadow-casting lights */
  shadowLightCount: number;

  /** Total shadow map pixels */
  totalPixels: number;

  /** Number of shadow casters */
  totalCasters: number;

  /** Number of shadow receivers */
  totalReceivers: number;

  /** Average shadow map resolution */
  avgResolution: number;

  /** Total issues found */
  issueCount: number;
}
```

## Issue Detection

### Resolution Issues

| Issue Type | Severity | Detection | Suggestion |
|------------|----------|-----------|------------|
| `high_resolution` | warning | Map > maxRecommendedResolution | Reduce resolution or use CSM |
| `low_resolution` | info | Map < minRecommendedResolution | May cause visible aliasing |

### Bias Issues

| Issue Type | Severity | Detection | Suggestion |
|------------|----------|-----------|------------|
| `high_bias` | info | \|bias\| > 0.01 | May cause peter-panning |
| `low_bias` | info | bias = 0 and normalBias = 0 | May cause shadow acne |

### Frustum Issues

| Issue Type | Severity | Detection | Suggestion |
|------------|----------|-----------|------------|
| `large_frustum` | warning | Size > maxFrustumSize | Use CSM or tighter bounds |
| `large_frustum` | warning | < 10 texels/unit | Reduce frustum or increase resolution |

### Range Issues

| Issue Type | Severity | Detection | Suggestion |
|------------|----------|-----------|------------|
| `far_plane_too_far` | info | far > 1000 | Large depth range reduces precision |
| `too_many_casters` | warning | casters > maxCastersPerLight | Consider culling or LOD |

## Panel UI

The Shadow Debugger adds a panel showing:

1. **Summary Statistics**
   - Shadow light count
   - Total shadow memory usage
   - Caster/receiver counts
   - Issue count (color-coded by severity)

2. **Lights with Issues**
   - Lights that have detected problems
   - Color-coded by severity (error/warning/info)
   - Expandable issue details

3. **All Shadow Lights**
   - Complete list of shadow-casting lights
   - Click to select light in scene
   - Per-light configuration details

## Usage Example

```typescript
import { createProbe, ShadowDebuggerPlugin } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';

const probe = createProbe({
  name: 'My App',
  sampleInterval: 100,
});

const overlay = createOverlay(probe);

// Register Shadow Debugger plugin
const pluginManager = probe.getPluginManager();
pluginManager.registerPlugin(ShadowDebuggerPlugin);
await pluginManager.activatePlugin('3lens.shadow-debugger');

// The Shadow Debugger panel will now appear in the overlay
```

## How It Works

### Memory Calculation

Shadow map memory is calculated as:

```
memoryUsage = width × height × 4 bytes (32-bit depth)
```

For example, a 2048×2048 shadow map uses ~16MB.

### Texel Density

For directional lights, the plugin calculates texels per world unit:

```
texelsPerUnit = mapWidth / frustumWidth
```

Low texel density (< 10) causes blurry shadows and should be addressed by:
- Reducing frustum size
- Increasing shadow map resolution
- Using Cascaded Shadow Maps (CSM)

### Issue Severity

- **Error**: Critical issues affecting visual quality
- **Warning**: Performance concerns or potential problems
- **Info**: Suggestions for optimization

## Common Issues and Solutions

### Shadow Acne

**Symptom**: Striped patterns on surfaces  
**Cause**: No bias or insufficient bias  
**Solution**: Add small bias (0.0001-0.001)

```typescript
light.shadow.bias = 0.0001;
light.shadow.normalBias = 0.02;
```

### Peter Panning

**Symptom**: Shadows detached from objects  
**Cause**: Excessive bias  
**Solution**: Reduce bias, use normal bias instead

```typescript
light.shadow.bias = 0;
light.shadow.normalBias = 0.02;
```

### Blurry Shadows

**Symptom**: Low-resolution, pixelated shadows  
**Cause**: Low texel density  
**Solution**: Tighten frustum or increase resolution

```typescript
// Tighter frustum
const d = 50; // world units
light.shadow.camera.left = -d;
light.shadow.camera.right = d;
light.shadow.camera.top = d;
light.shadow.camera.bottom = -d;

// Or higher resolution
light.shadow.mapSize.width = 2048;
light.shadow.mapSize.height = 2048;
```

### Large Scenes

**Symptom**: Shadows don't cover entire scene  
**Cause**: Single shadow map insufficient  
**Solution**: Use Cascaded Shadow Maps

```typescript
import { CSM } from 'three/addons/csm/CSM.js';

const csm = new CSM({
  maxFar: params.far,
  cascades: 4,
  mode: 'practical',
  parent: scene,
  shadowMapSize: 1024,
  lightDirection: new THREE.Vector3(-1, -1, -1),
  camera: camera,
});
```

## Integration with Custom Analysis

Access analysis results programmatically:

```typescript
// Get the plugin's state
const registered = pluginManager.getPlugin('3lens.shadow-debugger');
const lastAnalysis = registered?.storage.lastAnalysis as ShadowLightAnalysis[] | null;
const stats = registered?.storage.stats as ShadowStats | null;

if (lastAnalysis) {
  // Find lights with issues
  const lightsWithIssues = lastAnalysis.filter(a => a.issues.length > 0);
  
  // Count errors vs warnings
  const errorCount = lastAnalysis.reduce(
    (sum, a) => sum + a.issues.filter(i => i.severity === 'error').length,
    0
  );
  
  console.log(`Found ${lightsWithIssues.length} lights with issues`);
  console.log(`Total shadow memory: ${stats?.totalMemory.toLocaleString()} bytes`);
}
```

## See Also

- [DevtoolPlugin](./devtool-plugin.md) - Plugin interface
- [LOD Checker Plugin](./lod-checker-plugin.md) - Another built-in plugin
- [Plugin Development Guide](/guides/PLUGIN-DEVELOPMENT.md) - Creating custom plugins
- [Shadow Comparison Example](/examples/advanced-techniques/shadow-comparison/) - Shadow technique comparison
