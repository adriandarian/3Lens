# Render Targets Panel

The Render Targets panel provides inspection of all WebGLRenderTarget and framebuffer objects, enabling debugging of post-processing, shadow maps, and off-screen rendering.

## Overview

```typescript
// Open the Render Targets panel
overlay.showPanel('render-targets');
```

Render targets are essential for advanced rendering techniques. This panel helps you:

- **Visualize FBO contents** in real-time
- **Inspect shadow maps** and depth buffers
- **Debug post-processing** pipelines
- **Monitor memory usage** of render targets
- **Identify unused targets** for cleanup

## Panel Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  🎯 Render Targets                      [Search...    ] ─ □ ✕   │
├─────────────────────────────────────────────────────────────────┤
│  Summary: 8 Targets | 45 MB | 3 Shadow Maps                     │
├─────────────────────────────────────────────────────────────────┤
│                                │                                │
│  🎯 Main Render Buffer         │  WebGLRenderTarget             │
│    1920×1080 • 8 MB            │  ─────────────────────         │
│                                │                                │
│  🎯 Shadow Map (Sun)      ◀   │  [Live Preview]                │
│    2048×2048 • 16 MB           │                                │
│    Depth                       │  Resolution: 2048 × 2048       │
│                                │  Format: Depth                 │
│  🎯 SSAO Buffer                │  Memory: 16 MB                 │
│    960×540 • 2 MB              │  Samples: 1                    │
│    Half-res                    │  Depth Buffer: Yes             │
│                                │  Stencil: No                   │
│  🎯 Bloom Blur H               │                                │
│    480×270 • 0.5 MB            │  Properties:                   │
│    Quarter-res                 │  ├─ Min Filter: Nearest        │
│                                │  ├─ Mag Filter: Nearest        │
│  🎯 Bloom Blur V               │  └─ Generate Mipmaps: No       │
│    480×270 • 0.5 MB            │                                │
│                                │  Used by:                      │
│  🎯 G-Buffer Normal            │  • DirectionalLight shadow     │
│    1920×1080 • 15 MB           │                                │
│    RGBA16F                     │  [View Full] [Export] [Log]    │
│                                │                                │
└─────────────────────────────────────────────────────────────────┘
```

## Render Target List

### Summary Bar

Aggregate information:

```
8 Targets | 45 MB | 3 Shadow Maps
    ↑         ↑          ↑
  Total   Memory     Depth-only
```

### List Items

Each render target shows:

```
┌─────────────────────────────────────────────┐
│ 🎯 RenderTargetName                   8 MB  │
│   1920×1080 • RGBA • 4 samples              │
│   [Shadow] [MRT]                            │
└─────────────────────────────────────────────┘
```

**Badges:**
- `Shadow` - Used for shadow mapping
- `MRT` - Multiple Render Targets
- `HDR` - High dynamic range format
- `Depth` - Depth-only target
- `Cube` - Cubemap render target

### Search & Filter

Filter by:
- Target name
- Resolution
- Format type
- Usage pattern

## Render Target Inspector

### Basic Properties

```typescript
interface RenderTargetInfo {
  uuid: string;
  name: string;
  width: number;
  height: number;
  format: PixelFormat;
  type: TextureDataType;
  samples: number;           // MSAA samples
  depthBuffer: boolean;
  stencilBuffer: boolean;
  estimatedMemoryBytes: number;
  isMultiRenderTarget: boolean;
  textureCount: number;      // For MRT
}
```

### Live Preview

Real-time visualization of render target contents:

```
┌─────────────────────────────────────────────┐
│              [Live Preview]                 │
│                                             │
│    Shows current FBO contents               │
│    Updated each frame                       │
│                                             │
│    [Pause] [Refresh] [Channel: RGBA ▼]     │
└─────────────────────────────────────────────┘
```

**Preview Modes:**
- **RGBA** - Full color
- **RGB** - Color only
- **R** - Red channel
- **G** - Green channel
- **B** - Blue channel
- **A** - Alpha channel
- **Depth** - Depth buffer visualization
- **Luminance** - Grayscale conversion

### Format Details

```
Format Information:
├─ Type: WebGLRenderTarget
├─ Color Format: RGBA
├─ Color Type: HalfFloat
├─ Internal Format: RGBA16F
├─ Depth Format: Depth24Stencil8
├─ Encoding: Linear
└─ Color Space: LinearSRGB
```

### Sampling Configuration

```
Sampling:
├─ MSAA Samples: 4
├─ Mag Filter: Linear
├─ Min Filter: Linear
├─ Wrap S: ClampToEdge
├─ Wrap T: ClampToEdge
└─ Generate Mipmaps: No
```

## Render Target Types

### Standard Render Target

```typescript
const target = new THREE.WebGLRenderTarget(1920, 1080, {
  format: THREE.RGBAFormat,
  type: THREE.HalfFloatType,
  samples: 4,
});
```

Display:
```
WebGLRenderTarget
├─ Resolution: 1920 × 1080
├─ Format: RGBA16F
├─ MSAA: 4 samples
└─ Memory: 15.8 MB
```

### Shadow Map

```typescript
// Created internally by THREE.js for shadow-casting lights
light.shadow.mapSize.set(2048, 2048);
```

Display:
```
Shadow Map (DirectionalLight)
├─ Resolution: 2048 × 2048
├─ Format: Depth
├─ Type: UnsignedInt
├─ Bias: 0.0001
├─ Normal Bias: 0
└─ Memory: 16 MB

Shadow Camera:
├─ Type: Orthographic
├─ Near: 0.5
├─ Far: 500
└─ Frustum: 100 × 100
```

### Multiple Render Targets (MRT)

```typescript
const mrt = new THREE.WebGLMultipleRenderTargets(1920, 1080, 3);
```

Display:
```
WebGLMultipleRenderTargets
├─ Resolution: 1920 × 1080
├─ Attachments: 3
│  ├─ [0] Color (RGBA16F)
│  ├─ [1] Normal (RGBA16F)
│  └─ [2] Position (RGBA32F)
├─ Shared Depth: Yes
└─ Total Memory: 47 MB
```

### Cubemap Render Target

```typescript
const cubeTarget = new THREE.WebGLCubeRenderTarget(512);
```

Display:
```
WebGLCubeRenderTarget
├─ Face Size: 512 × 512
├─ Format: RGBA
├─ Total Faces: 6
└─ Memory: 6 MB

Faces:
┌─────────────────────────────────┐
│      [+Y]                       │
│ [−X] [+Z] [+X] [−Z]            │
│      [−Y]                       │
└─────────────────────────────────┘
```

## Memory Analysis

### Memory Breakdown

```
Memory: 16 MB
├─ Color Buffer: 16 MB (2048×2048×4 bytes)
├─ Depth Buffer: 16 MB (2048×2048×4 bytes)
└─ Total: 32 MB

With MSAA (4 samples):
└─ Effective: 128 MB
```

### Render Target Memory Summary

```
All Render Targets: 45 MB
┌────────────────────────────────────┐
│███████████░░░░░░░│ Shadow Maps (60%)
│████░░░░░░░░░░░░░░│ Post-Process (15%)
│███░░░░░░░░░░░░░░░│ G-Buffer (12%)
│██░░░░░░░░░░░░░░░░│ Other (13%)
└────────────────────────────────────┘
```

### Optimization Suggestions

```
💡 Optimization Suggestions:
├─ Shadow map 4096×4096 is very large
│  Consider 2048×2048 for similar quality (−75% memory)
│
├─ 3 unused render targets detected
│  These may be leaked resources
│
└─ SSAO at full resolution
   Half-resolution usually sufficient (−75% memory)
```

## Usage Tracking

### Reference Count

```
Used by:
├─ EffectComposer → RenderPass (read/write)
├─ SSAOPass → input (read)
└─ BloomPass → intermediate (read/write)

Last Updated: 16ms ago
Update Frequency: Every frame
```

### Render Pipeline Position

```
Render Pipeline:
1. [Scene Render] → Main Buffer
2. [SSAO] Main Buffer → SSAO Buffer
3. [Bloom Extract] Main Buffer → Bloom Buffer
4. [Bloom Blur H] → Bloom Blur H
5. [Bloom Blur V] → Bloom Blur V
6. [Composite] → Screen
```

## Depth Buffer Visualization

Special handling for depth textures:

```
┌─────────────────────────────────────────────┐
│ Depth Visualization                         │
├─────────────────────────────────────────────┤
│                                             │
│    [Depth Preview - Grayscale]              │
│                                             │
│    Near: 0.1    Far: 1000                   │
│    Log Scale: [✓]                           │
│                                             │
│    Value at cursor: 0.9823 (245 units)      │
└─────────────────────────────────────────────┘
```

## Actions

### View Full

Opens full-resolution preview with controls:

```
┌─────────────────────────────────────────────────────┐
│  Shadow Map Preview                          [✕]   │
├─────────────────────────────────────────────────────┤
│                                                     │
│             [Full Size Preview]                     │
│                                                     │
│  Channel: [RGBA ▼]  Scale: [1:1 ▼]                 │
│  Exposure: [═══●═══] 0.0                           │
│  Range: [0.0 ════════ 1.0]                         │
└─────────────────────────────────────────────────────┘
```

### Export

Save render target contents:
- **PNG** - Full color/depth
- **EXR** - HDR format (for float targets)
- **Raw** - Binary pixel data

### Log

Output to console:

```typescript
console.log('3Lens RenderTarget:', renderTarget);
// Full THREE.WebGLRenderTarget with textures
```

## API Integration

```typescript
// Get all render targets
const targets = probe.getRenderTargets();

// Find shadow maps
const shadowMaps = targets.filter(t => t.name.includes('shadow'));

// Get memory usage
const totalMemory = targets.reduce(
  (sum, t) => sum + t.estimatedMemoryBytes, 0
);

// Subscribe to render target changes
probe.on('renderTargetUpdate', (target) => {
  console.log('RT updated:', target.name);
});
```

## Best Practices

1. **Name your render targets** - Easier debugging
   ```typescript
   renderTarget.texture.name = 'SSAO_Output';
   ```

2. **Use appropriate resolution** - Match to visual requirements
   ```typescript
   // SSAO often fine at half resolution
   const ssaoTarget = new THREE.WebGLRenderTarget(
     width / 2, height / 2
   );
   ```

3. **Clean up unused targets** - Dispose when done
   ```typescript
   renderTarget.dispose();
   ```

4. **Consider format requirements** - Don't use HDR where not needed
   ```typescript
   // Standard targets: RGBAFormat + UnsignedByteType
   // HDR: RGBAFormat + HalfFloatType
   ```

5. **Monitor shadow map sizes** - Balance quality vs memory
   ```typescript
   // 1024 for small/distant, 2048 for main, 4096 rarely needed
   ```

6. **Reuse targets when possible** - Ping-pong buffers
   ```typescript
   const [bufferA, bufferB] = createPingPongTargets();
   ```

## Related

- [Textures Panel](./textures-panel.md)
- [Memory Panel](./memory-panel.md)
- [Render Target Info Type](../core/render-target-info.md)
