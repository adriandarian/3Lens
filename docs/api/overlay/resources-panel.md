# Resources Panel

The Resources panel provides lifecycle tracking for all GPU resources, helping identify memory leaks, orphaned objects, and resource management issues.

## Overview

```typescript
// Access via the Performance panel's Resources tab
overlay.showPanel('stats');
// Then click the "Resources" tab
```

The Resources panel monitors the complete lifecycle of three.js resources:

- **Creation tracking** - When resources are allocated
- **Disposal monitoring** - When resources are freed
- **Leak detection** - Resources not properly disposed
- **Lifecycle timeline** - Visual event history
- **Reference counting** - Track resource usage

## Panel Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  Resources                                               ─ □ ✕  │
├─────────────────────────────────────────────────────────────────┤
│  [All] [Textures] [Geometries] [Materials] [RenderTargets]      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Session Summary                                                │
│  ┌─────────┬─────────┬─────────┬─────────┐                     │
│  │ Created │ Disposed│ Active  │ Leaked  │                     │
│  │   145   │   42    │  103    │   0 ✓   │                     │
│  └─────────┴─────────┴─────────┴─────────┘                     │
│                                                                 │
│  ═══════════════════════════════════════════════════════════   │
│  Lifecycle Timeline                                             │
│  ─────────────────────────────────────────────────────────────  │
│  │ ● ● ● ●   ○   ● ●   ○   ● ● ● ●   ○ ○   ● │                │
│  │ ↑create      ↑dispose                      │                │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Recent Events                                                  │
│  ├─ 🟢 12:34:56.123  Texture created "env_hdr"                 │
│  ├─ 🟢 12:34:56.100  Geometry created "PlayerMesh"             │
│  ├─ 🔴 12:34:55.890  Material disposed "OldMaterial"           │
│  ├─ 🟢 12:34:55.800  RenderTarget created "SSAO_Buffer"        │
│  └─ ... 141 more events                                        │
│                                                                 │
│  ⚠️ Potential Leaks (0)                                        │
│  ✓ No leaked resources detected                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Session Summary

### Resource Counts

```
┌─────────────────────────────────────────────────────┐
│  Created    Disposed    Active    Leaked           │
│    145        42         103        0 ✓            │
│                                                     │
│  Balance: +103 (net resources in memory)           │
└─────────────────────────────────────────────────────┘
```

**Indicators:**
- 🟢 `0` leaked - All resources properly managed
- 🟡 `< 5` leaked - Minor leaks, review recommended
- 🔴 `≥ 5` leaked - Significant leaks, action needed

### By Resource Type

```
Resource Breakdown:
┌──────────────┬─────────┬──────────┬────────┬────────┐
│ Type         │ Created │ Disposed │ Active │ Leaked │
├──────────────┼─────────┼──────────┼────────┼────────┤
│ Textures     │    45   │    12    │   33   │   0    │
│ Geometries   │    38   │    15    │   23   │   0    │
│ Materials    │    52   │    10    │   42   │   0    │
│ RenderTargets│    10   │     5    │    5   │   0    │
└──────────────┴─────────┴──────────┴────────┴────────┘
```

## Lifecycle Timeline

### Visual Timeline

```
Timeline (last 60 seconds):
─────────────────────────────────────────────────────────────
│ ●●●●   ○   ●●   ○   ●●●●   ○○   ●│  Now
│                                   │
│ ● = create  ○ = dispose           │
─────────────────────────────────────────────────────────────
        ↑                    ↑
    Scene load          Dynamic unload
```

### Event Categories

| Event | Symbol | Color | Description |
|-------|--------|-------|-------------|
| Create | ● | 🟢 Green | Resource allocated |
| Dispose | ○ | 🔴 Red | Resource freed |
| Leak | ⚠ | 🟡 Yellow | Potential leak detected |
| Error | ✕ | 🔴 Red | Disposal error |

### Hover Details

Hover over timeline markers for details:

```
┌─────────────────────────────────────────────┐
│ Resource Created                            │
│ Time: 12:34:56.123                          │
│ Type: Texture                               │
│ Name: player_diffuse                        │
│ Size: 2048×2048                             │
│ Memory: 16 MB                               │
│ Stack: Scene.js:45 → Loader.js:123          │
└─────────────────────────────────────────────┘
```

## Recent Events Log

### Event List

```
Recent Events (showing 20 of 145):

🟢 12:34:56.123  Texture created
   name: "env_hdr"
   size: 1024×1024
   memory: 4 MB

🟢 12:34:56.100  Geometry created
   name: "PlayerMesh"
   vertices: 12,450
   memory: 2.4 MB

🔴 12:34:55.890  Material disposed
   name: "OldMaterial"
   type: MeshStandardMaterial
   freed: 0.1 MB

🟢 12:34:55.800  RenderTarget created
   name: "SSAO_Buffer"
   size: 1920×1080
   memory: 8 MB
```

### Event Filtering

Filter events by:
- **Type**: Textures, Geometries, Materials, RenderTargets
- **Action**: Create, Dispose, Leak
- **Time Range**: Last minute, session, custom
- **Search**: By name or UUID

```
[All ▼] [Create ▼] [Last 5 min ▼] [Search...]
```

## Leak Detection

### How Leaks Are Detected

Resources are flagged as potential leaks when:

1. **Removed from scene but not disposed** - Object removed but `.dispose()` not called
2. **Orphaned textures** - Textures no longer referenced by any material
3. **Orphaned geometries** - Geometries no longer used by any mesh
4. **Stale render targets** - Render targets from removed post-processing passes

### Leak Alerts

```
┌─────────────────────────────────────────────────────────────────┐
│ ⚠️ Potential Leaks Detected (3)                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 🟡 Texture: "enemy_diffuse"                                    │
│    Created: 5 minutes ago                                       │
│    Last referenced: 3 minutes ago                               │
│    Memory: 8 MB                                                 │
│    Status: No material references                               │
│    [Dispose] [Ignore] [Details]                                 │
│                                                                 │
│ 🟡 Geometry: "BulletMesh"                                      │
│    Created: 2 minutes ago                                       │
│    Last referenced: 1 minute ago                                │
│    Memory: 0.5 MB                                               │
│    Status: No mesh references (was removed from scene)          │
│    [Dispose] [Ignore] [Details]                                 │
│                                                                 │
│ 🟡 RenderTarget: "OldBloom_Buffer"                             │
│    Created: 10 minutes ago                                      │
│    Memory: 4 MB                                                 │
│    Status: Not used in render pipeline                          │
│    [Dispose] [Ignore] [Details]                                 │
│                                                                 │
│ Total Leaked Memory: ~12.5 MB                                   │
│ [Dispose All Leaks]                                             │
└─────────────────────────────────────────────────────────────────┘
```

### Leak Report

Generate a detailed leak report:

```typescript
interface LeakReport {
  timestamp: number;
  totalLeaks: number;
  totalLeakedMemory: number;
  leaks: LeakAlert[];
}

interface LeakAlert {
  resourceType: 'texture' | 'geometry' | 'material' | 'renderTarget';
  resourceId: string;
  name: string;
  createdAt: number;
  lastReferencedAt: number;
  estimatedMemory: number;
  reason: string;
  stackTrace?: string;
}
```

## Resource Details

### Click to Inspect

Click any resource in the event log for details:

```
┌─────────────────────────────────────────────────────────────────┐
│ Texture Details                                          [✕]   │
├─────────────────────────────────────────────────────────────────┤
│ Name: player_diffuse                                            │
│ UUID: abc123-def456-...                                         │
│                                                                 │
│ Lifecycle:                                                      │
│ ├─ Created: 12:34:56.123 (5 min ago)                           │
│ ├─ Status: Active                                               │
│ └─ References: 2 materials                                      │
│                                                                 │
│ Properties:                                                     │
│ ├─ Size: 2048 × 2048                                           │
│ ├─ Format: RGBA                                                 │
│ ├─ Memory: 16 MB                                                │
│ └─ Mipmaps: Yes                                                 │
│                                                                 │
│ Referenced By:                                                  │
│ ├─ PlayerSkin (map)                                            │
│ └─ PlayerSkin (emissiveMap)                                    │
│                                                                 │
│ Creation Stack Trace:                                           │
│ ├─ loadTexture() at AssetLoader.js:45                          │
│ ├─ loadPlayer() at Player.js:23                                │
│ └─ init() at Game.js:100                                       │
│                                                                 │
│ [Open in Textures Panel] [Log to Console] [Dispose]            │
└─────────────────────────────────────────────────────────────────┘
```

## API Integration

### Event Subscription

```typescript
// Subscribe to resource lifecycle events
probe.on('resourceCreated', (event: ResourceLifecycleEvent) => {
  console.log(`Created ${event.type}: ${event.name}`);
});

probe.on('resourceDisposed', (event: ResourceLifecycleEvent) => {
  console.log(`Disposed ${event.type}: ${event.name}`);
});

probe.on('leakDetected', (alert: LeakAlert) => {
  console.warn(`Potential leak: ${alert.name}`);
});
```

### Get Resource Summary

```typescript
const summary: ResourceLifecycleSummary = probe.getResourceSummary();
console.log('Active textures:', summary.textures.active);
console.log('Leaked geometries:', summary.geometries.leaked);
```

### Manual Leak Check

```typescript
// Trigger manual leak detection
const leaks = probe.detectLeaks();
if (leaks.length > 0) {
  console.warn('Leaks found:', leaks);
}
```

### Dispose Leaked Resources

```typescript
// Dispose specific leak
probe.disposeLeakedResource(leakAlert.resourceId);

// Dispose all leaks
probe.disposeAllLeaks();
```

## Configuration

### Enable Stack Traces

```typescript
const probe = createProbe({
  tracking: {
    captureStackTraces: true,  // Capture creation stack traces
    stackTraceDepth: 10,       // Max stack depth
  },
});
```

### Leak Detection Settings

```typescript
const probe = createProbe({
  leakDetection: {
    enabled: true,
    checkInterval: 5000,       // Check every 5 seconds
    graceperiod: 10000,        // Wait 10s before flagging as leak
    ignorePatterns: [          // Ignore specific resources
      /^__internal_/,
      /^debug_/,
    ],
  },
});
```

## Common Leak Patterns

### Dynamic Object Creation

```typescript
// ❌ Leak: geometry not disposed
function createBullet() {
  const geometry = new THREE.SphereGeometry(0.1);
  const material = new THREE.MeshBasicMaterial();
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  return mesh;
}

// ✅ Fixed: dispose when removed
function removeBullet(mesh) {
  scene.remove(mesh);
  mesh.geometry.dispose();
  mesh.material.dispose();
}
```

### Texture Loading

```typescript
// ❌ Leak: old texture not disposed
function updateTexture(mesh, newUrl) {
  const texture = textureLoader.load(newUrl);
  mesh.material.map = texture;  // Old texture leaked!
}

// ✅ Fixed: dispose old texture
function updateTexture(mesh, newUrl) {
  const oldTexture = mesh.material.map;
  const newTexture = textureLoader.load(newUrl);
  mesh.material.map = newTexture;
  if (oldTexture) oldTexture.dispose();
}
```

### Effect Composer

```typescript
// ❌ Leak: render targets not disposed
function removePostProcessing() {
  composer = null;  // Render targets leaked!
}

// ✅ Fixed: dispose composer properly
function removePostProcessing() {
  composer.renderTarget1.dispose();
  composer.renderTarget2.dispose();
  composer.passes.forEach(pass => pass.dispose?.());
  composer = null;
}
```

## Best Practices

1. **Always dispose** - Call `.dispose()` when removing resources
   ```typescript
   mesh.geometry.dispose();
   mesh.material.dispose();
   texture.dispose();
   renderTarget.dispose();
   ```

2. **Track ownership** - Know which code owns each resource

3. **Use resource pools** - Reuse objects instead of creating/destroying
   ```typescript
   const bulletPool = new ObjectPool(createBullet, 100);
   ```

4. **Enable stack traces in development** - Easier leak debugging

5. **Regular leak checks** - Run leak detection during testing

6. **Clean up on scene transitions** - Dispose all scene-specific resources

## Related

- [Memory Panel](./memory-panel.md)
- [Resource Lifecycle Tracker](../core/resource-lifecycle-tracker.md)
- [Leak Detection](../core/leak-detection.md)
