# RenderTargetData Interface

The `RenderTargetData` interface represents serialized render target information for display in the devtools UI. It includes dimensions, format, depth/stencil buffers, MSAA settings, and usage information.

## Overview

```typescript
import type { RenderTargetData, RenderTargetsSummary } from '@3lens/core';

// Access render targets from a snapshot
const snapshot = probe.getSceneSnapshot();

snapshot.renderTargets?.forEach((rt: RenderTargetData) => {
  console.log(`${rt.name}: ${rt.type}`);
  console.log(`  Size: ${rt.dimensions.width}x${rt.dimensions.height}`);
  console.log(`  Usage: ${rt.usage}`);
  console.log(`  Memory: ${(rt.memoryBytes / 1024 / 1024).toFixed(2)} MB`);
});
```

## Interface Definition

```typescript
interface RenderTargetData {
  // Identity
  uuid: string;
  name: string;
  type: string;
  
  // Dimensions
  dimensions: {
    width: number;
    height: number;
  };
  
  // Viewport/Scissor
  viewport?: { x: number; y: number; width: number; height: number };
  scissor?: { x: number; y: number; width: number; height: number };
  scissorTest: boolean;
  
  // Buffers
  depthBuffer: boolean;
  stencilBuffer: boolean;
  hasDepthTexture: boolean;
  
  // Type
  isCubeTarget: boolean;
  
  // MSAA
  samples: number;
  
  // MRT (Multiple Render Targets)
  colorAttachmentCount: number;
  
  // Texture format
  textureFormat: number;
  textureFormatName: string;
  textureType: number;
  textureTypeName: string;
  
  // Depth texture format
  depthTextureFormat?: number;
  depthTextureFormatName?: string;
  
  // Settings
  colorSpace: string;
  filtering: {
    mag: number;
    min: number;
    magName: string;
    minName: string;
  };
  wrap: {
    s: number;
    t: number;
    sName: string;
    tName: string;
  };
  generateMipmaps: boolean;
  
  // Memory
  memoryBytes: number;
  
  // Previews
  thumbnail?: string;
  depthThumbnail?: string;
  
  // Usage
  usage: RenderTargetUsage;
  lastRenderTimestamp?: number;
  renderCount: number;
}

type RenderTargetUsage = 
  | 'shadow-map'
  | 'post-process'
  | 'reflection'
  | 'refraction'
  | 'environment'
  | 'picker'
  | 'custom'
  | 'unknown';
```

## Properties

### Identity

| Property | Type | Description |
|----------|------|-------------|
| `uuid` | `string` | Render target UUID |
| `name` | `string` | Render target name |
| `type` | `string` | e.g., `'WebGLRenderTarget'`, `'WebGLMultipleRenderTargets'` |

### Dimensions

| Property | Type | Description |
|----------|------|-------------|
| `dimensions.width` | `number` | Width in pixels |
| `dimensions.height` | `number` | Height in pixels |

### Viewport & Scissor

| Property | Type | Description |
|----------|------|-------------|
| `viewport` | `object?` | Viewport settings (if different from full size) |
| `scissor` | `object?` | Scissor test rectangle |
| `scissorTest` | `boolean` | Whether scissor test is enabled |

### Buffers

| Property | Type | Description |
|----------|------|-------------|
| `depthBuffer` | `boolean` | Depth buffer enabled |
| `stencilBuffer` | `boolean` | Stencil buffer enabled |
| `hasDepthTexture` | `boolean` | Has readable depth texture |

### Type Flags

| Property | Type | Description |
|----------|------|-------------|
| `isCubeTarget` | `boolean` | Is a cube render target |

### Multi-sampling (MSAA)

| Property | Type | Description |
|----------|------|-------------|
| `samples` | `number` | MSAA sample count (1 = no MSAA) |

### Multiple Render Targets (MRT)

| Property | Type | Description |
|----------|------|-------------|
| `colorAttachmentCount` | `number` | Number of color attachments |

### Texture Format

| Property | Type | Description |
|----------|------|-------------|
| `textureFormat` | `number` | Three.js format constant |
| `textureFormatName` | `string` | e.g., `'RGBA'`, `'RGBAFormat'` |
| `textureType` | `number` | Three.js type constant |
| `textureTypeName` | `string` | e.g., `'UnsignedByte'`, `'HalfFloat'` |

### Depth Texture Format

| Property | Type | Description |
|----------|------|-------------|
| `depthTextureFormat` | `number?` | Depth texture format constant |
| `depthTextureFormatName` | `string?` | e.g., `'DepthFormat'`, `'DepthStencilFormat'` |

### Settings

| Property | Type | Description |
|----------|------|-------------|
| `colorSpace` | `string` | Color space (e.g., `'srgb-linear'`) |
| `filtering` | `object` | Mag/min filtering modes |
| `wrap` | `object` | S/T wrapping modes |
| `generateMipmaps` | `boolean` | Auto-generate mipmaps |

### Memory

| Property | Type | Description |
|----------|------|-------------|
| `memoryBytes` | `number` | Estimated GPU memory usage |

### Previews

| Property | Type | Description |
|----------|------|-------------|
| `thumbnail` | `string?` | Color buffer preview (base64 data URL) |
| `depthThumbnail` | `string?` | Depth buffer preview (grayscale) |

### Usage Tracking

| Property | Type | Description |
|----------|------|-------------|
| `usage` | `RenderTargetUsage` | Categorized purpose |
| `lastRenderTimestamp` | `number?` | Last time rendered to |
| `renderCount` | `number` | Times rendered since observation |

## RenderTargetsSummary

Summary statistics for all render targets:

```typescript
interface RenderTargetsSummary {
  totalCount: number;         // Total render targets
  totalMemoryBytes: number;   // Total memory usage
  shadowMapCount: number;     // Shadow map count
  postProcessCount: number;   // Post-processing targets
  cubeTargetCount: number;    // Cube render targets
  mrtCount: number;           // MRT targets
  msaaCount: number;          // MSAA targets
}
```

## Usage Examples

### List All Render Targets

```typescript
function listRenderTargets(snapshot: SceneSnapshot) {
  const summary = snapshot.renderTargetsSummary;
  
  console.log(`=== Render Targets (${summary?.totalCount ?? 0}) ===`);
  console.log(`Total Memory: ${((summary?.totalMemoryBytes ?? 0) / 1024 / 1024).toFixed(2)} MB`);
  
  snapshot.renderTargets?.forEach(rt => {
    console.log(`\n${rt.name || '(unnamed)'} [${rt.type}]`);
    console.log(`  Size: ${rt.dimensions.width}x${rt.dimensions.height}`);
    console.log(`  Format: ${rt.textureFormatName} (${rt.textureTypeName})`);
    console.log(`  Usage: ${rt.usage}`);
    console.log(`  Memory: ${(rt.memoryBytes / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Render count: ${rt.renderCount}`);
    
    if (rt.samples > 1) {
      console.log(`  MSAA: ${rt.samples}x`);
    }
    if (rt.colorAttachmentCount > 1) {
      console.log(`  MRT: ${rt.colorAttachmentCount} attachments`);
    }
    if (rt.hasDepthTexture) {
      console.log(`  Depth texture: ${rt.depthTextureFormatName}`);
    }
  });
}
```

### Analyze Shadow Maps

```typescript
function analyzeShadowMaps(snapshot: SceneSnapshot) {
  const shadowMaps = snapshot.renderTargets?.filter(rt => 
    rt.usage === 'shadow-map'
  ) ?? [];
  
  if (shadowMaps.length === 0) {
    console.log('No shadow maps found.');
    return;
  }
  
  console.log(`Shadow Maps (${shadowMaps.length}):`);
  
  let totalMemory = 0;
  shadowMaps.forEach(sm => {
    totalMemory += sm.memoryBytes;
    
    console.log(`\n  ${sm.name || sm.uuid}`);
    console.log(`    Resolution: ${sm.dimensions.width}x${sm.dimensions.height}`);
    console.log(`    Format: ${sm.textureTypeName}`);
    console.log(`    Memory: ${(sm.memoryBytes / 1024 / 1024).toFixed(2)} MB`);
    
    // Quality suggestions
    if (sm.dimensions.width < 1024) {
      console.log(`    ⚠️ Low resolution - may cause shadow aliasing`);
    }
    if (sm.textureTypeName === 'UnsignedByte') {
      console.log(`    💡 Consider using HalfFloat for better precision`);
    }
  });
  
  console.log(`\nTotal shadow map memory: ${(totalMemory / 1024 / 1024).toFixed(2)} MB`);
}
```

### Find Oversized Render Targets

```typescript
function findOversizedRenderTargets(snapshot: SceneSnapshot) {
  const screenWidth = window.innerWidth * window.devicePixelRatio;
  const screenHeight = window.innerHeight * window.devicePixelRatio;
  const screenArea = screenWidth * screenHeight;
  
  const oversized = snapshot.renderTargets?.filter(rt => {
    const rtArea = rt.dimensions.width * rt.dimensions.height;
    return rtArea > screenArea * 2; // More than 2x screen resolution
  }) ?? [];
  
  if (oversized.length > 0) {
    console.log('Potentially oversized render targets:');
    oversized.forEach(rt => {
      const ratio = (rt.dimensions.width * rt.dimensions.height) / screenArea;
      console.log(`  ${rt.name}: ${rt.dimensions.width}x${rt.dimensions.height}`);
      console.log(`    ${ratio.toFixed(1)}x screen resolution`);
      console.log(`    Usage: ${rt.usage}`);
      console.log(`    Memory: ${(rt.memoryBytes / 1024 / 1024).toFixed(2)} MB`);
    });
  }
}
```

### Identify Unused Render Targets

```typescript
function findUnusedRenderTargets(snapshot: SceneSnapshot, frameThreshold = 60) {
  const now = performance.now();
  
  const unused = snapshot.renderTargets?.filter(rt => {
    // No renders or not rendered recently
    if (rt.renderCount === 0) return true;
    if (rt.lastRenderTimestamp) {
      const timeSinceRender = now - rt.lastRenderTimestamp;
      return timeSinceRender > (frameThreshold * 16.67); // ~1 second at 60fps
    }
    return false;
  }) ?? [];
  
  if (unused.length > 0) {
    let wastedMemory = 0;
    console.log('Potentially unused render targets:');
    
    unused.forEach(rt => {
      wastedMemory += rt.memoryBytes;
      console.log(`  ${rt.name || rt.uuid}`);
      console.log(`    Size: ${rt.dimensions.width}x${rt.dimensions.height}`);
      console.log(`    Render count: ${rt.renderCount}`);
      console.log(`    Memory: ${(rt.memoryBytes / 1024 / 1024).toFixed(2)} MB`);
    });
    
    console.log(`\nPotentially wasted: ${(wastedMemory / 1024 / 1024).toFixed(2)} MB`);
  }
}
```

### Post-Processing Chain Analysis

```typescript
function analyzePostProcessChain(snapshot: SceneSnapshot) {
  const postProcess = snapshot.renderTargets?.filter(rt => 
    rt.usage === 'post-process'
  ) ?? [];
  
  if (postProcess.length === 0) {
    console.log('No post-processing render targets found.');
    return;
  }
  
  console.log(`Post-Processing Chain (${postProcess.length} targets):`);
  
  let totalMemory = 0;
  const formats = new Map<string, number>();
  
  postProcess.forEach(rt => {
    totalMemory += rt.memoryBytes;
    
    const formatKey = `${rt.textureFormatName} ${rt.textureTypeName}`;
    formats.set(formatKey, (formats.get(formatKey) ?? 0) + 1);
    
    console.log(`  ${rt.name || rt.uuid}: ${rt.dimensions.width}x${rt.dimensions.height}`);
  });
  
  console.log('\nFormat breakdown:');
  formats.forEach((count, format) => {
    console.log(`  ${format}: ${count}`);
  });
  
  console.log(`\nTotal post-processing memory: ${(totalMemory / 1024 / 1024).toFixed(2)} MB`);
  
  // Optimization suggestions
  if (postProcess.some(rt => rt.textureTypeName === 'Float')) {
    console.log('\n💡 Consider using HalfFloat instead of Float for post-processing');
  }
}
```

### Memory Budget Check

```typescript
function checkRenderTargetBudget(snapshot: SceneSnapshot, budgetMB = 128) {
  const summary = snapshot.renderTargetsSummary;
  const usedMB = (summary?.totalMemoryBytes ?? 0) / 1024 / 1024;
  const percentage = (usedMB / budgetMB) * 100;
  
  console.log(`Render Target Memory Budget:`);
  console.log(`  Used: ${usedMB.toFixed(2)} MB / ${budgetMB} MB (${percentage.toFixed(1)}%)`);
  
  // Visual bar
  const barLength = 40;
  const filled = Math.round((percentage / 100) * barLength);
  const bar = '█'.repeat(Math.min(filled, barLength)) + '░'.repeat(Math.max(0, barLength - filled));
  console.log(`  [${bar}]`);
  
  if (percentage > 100) {
    console.log(`  ⚠️ OVER BUDGET by ${(usedMB - budgetMB).toFixed(2)} MB`);
  } else if (percentage > 80) {
    console.log(`  ⚠️ Approaching budget limit`);
  } else {
    console.log(`  ✓ Within budget`);
  }
  
  // Breakdown
  console.log('\nBreakdown:');
  console.log(`  Shadow maps: ${summary?.shadowMapCount ?? 0}`);
  console.log(`  Post-process: ${summary?.postProcessCount ?? 0}`);
  console.log(`  Cube targets: ${summary?.cubeTargetCount ?? 0}`);
  console.log(`  MRT targets: ${summary?.mrtCount ?? 0}`);
  console.log(`  MSAA targets: ${summary?.msaaCount ?? 0}`);
}
```

### Find MSAA Targets

```typescript
function findMSAATargets(snapshot: SceneSnapshot) {
  const msaa = snapshot.renderTargets?.filter(rt => rt.samples > 1) ?? [];
  
  if (msaa.length === 0) {
    console.log('No MSAA render targets found.');
    return;
  }
  
  console.log(`MSAA Render Targets (${msaa.length}):`);
  msaa.forEach(rt => {
    console.log(`  ${rt.name || rt.uuid}`);
    console.log(`    Samples: ${rt.samples}x`);
    console.log(`    Size: ${rt.dimensions.width}x${rt.dimensions.height}`);
    console.log(`    Memory: ${(rt.memoryBytes / 1024 / 1024).toFixed(2)} MB`);
    
    // MSAA memory is multiplied by sample count
    const baseMemory = rt.memoryBytes / rt.samples;
    const msaaOverhead = rt.memoryBytes - baseMemory;
    console.log(`    MSAA overhead: ${(msaaOverhead / 1024 / 1024).toFixed(2)} MB`);
  });
}
```

## See Also

- [TextureData](./texture-info.md) - Texture information
- [FrameStats](./frame-stats.md) - Frame statistics including RT switches
- [SceneSnapshot](./scene-snapshot.md) - Full scene snapshot
