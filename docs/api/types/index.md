# Type Definitions

This section contains TypeScript type definitions and interfaces used throughout 3Lens.

## Core Types

### Performance & Metrics

| Type | Description |
|------|-------------|
| [FrameStats](./frame-stats.md) | Per-frame performance metrics and statistics |
| [SceneSnapshot](./scene-snapshot.md) | Complete scene graph capture |

### Scene Graph

| Type | Description |
|------|-------------|
| `SceneNode` | Node in the scene hierarchy |
| `TrackedObjectRef` | Reference to a Three.js object |
| `TransformData` | Position, rotation, scale data |
| `MeshNodeData` | Mesh-specific data |
| `LightNodeData` | Light-specific data |
| `CameraNodeData` | Camera-specific data |

### Resources

| Type | Description |
|------|-------------|
| `MaterialData` | Material information |
| `GeometryData` | Geometry information |
| `TextureData` | Texture information |
| `RenderTargetData` | Render target information |

### Configuration

| Type | Description |
|------|-------------|
| `ProbeConfig` | Probe configuration options |
| `EntityOptions` | Entity registration options |
| `RuleViolation` | Performance rule violation |
| `BenchmarkScore` | Performance benchmark score |

### Plugins

| Type | Description |
|------|-------------|
| `DevtoolPlugin` | Plugin interface |
| `PluginContext` | Plugin execution context |
| `PluginMessage` | Inter-plugin messaging |

### Adapters

| Type | Description |
|------|-------------|
| `RendererKind` | `'webgl'` or `'webgpu'` |
| `WebGLFrameExtras` | WebGL-specific frame data |
| `WebGPUFrameExtras` | WebGPU-specific frame data |

## Type Categories

### Performance Types

- `FrameStats` - Frame-level metrics
- `PerformanceMetrics` - Derived performance data
- `MemoryStats` - Memory usage statistics
- `RenderingStats` - Detailed rendering information

### Scene Types

- `SceneSnapshot` - Full scene state
- `SceneNode` - Scene graph node
- `TrackedObjectRef` - Object reference

### Resource Types

- `MaterialData` - Material information
- `GeometryData` - Geometry information
- `TextureData` - Texture information
- `RenderTargetData` - Render target information

### Configuration Types

- `ProbeConfig` - Probe configuration
- `EntityOptions` - Entity registration
- `RuleViolation` - Rule violations
- `BenchmarkScore` - Performance scores

## Usage

Import types from `@3lens/core`:

```typescript
import type {
  FrameStats,
  SceneSnapshot,
  ProbeConfig,
  DevtoolPlugin,
} from '@3lens/core';
```

## Related Documentation

- [API Overview](/api/) - Complete API reference
- [Core Package](/api/core/) - Core package documentation
- [TypeScript Guide](/guide/typescript) - TypeScript usage guide
