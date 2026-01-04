# Events API Reference

The DevtoolProbe provides a comprehensive event system for subscribing to real-time updates about frame statistics, scene changes, selections, resource lifecycle, and rule violations.

## Table of Contents

- [Event Subscription Pattern](#event-subscription-pattern)
- [Frame Stats Events](#frame-stats-events)
- [Snapshot Events](#snapshot-events)
- [Selection Events](#selection-events)
- [Resource Events](#resource-events)
- [Rule Violation Events](#rule-violation-events)
- [Entity Events](#entity-events)
- [Command Events](#command-events)
- [Transform Events](#transform-events)

---

## Event Subscription Pattern

All event subscriptions follow a consistent pattern:

```typescript
// Subscribe to an event
const unsubscribe = probe.onEventName((data) => {
  // Handle the event
});

// Later: cleanup the subscription
unsubscribe();
```

Each `on*` method returns an `Unsubscribe` function that removes the callback when called. Always clean up subscriptions to prevent memory leaks, especially in component-based frameworks.

### React Example

```tsx
import { useEffect } from 'react';

function FrameStatsDisplay({ probe }) {
  const [fps, setFps] = useState(0);

  useEffect(() => {
    const unsubscribe = probe.onFrameStats((stats) => {
      setFps(stats.performance?.fps ?? 0);
    });
    
    return () => unsubscribe(); // Cleanup on unmount
  }, [probe]);

  return <div>FPS: {fps.toFixed(1)}</div>;
}
```

---

## Frame Stats Events

### `onFrameStats(callback)`

Subscribe to per-frame performance statistics.

```typescript
const unsubscribe = probe.onFrameStats((stats) => {
  console.log('Frame stats:', stats);
});
```

**Callback Parameter: `FrameStats`**

| Property | Type | Description |
|----------|------|-------------|
| `timestamp` | `number` | High-precision timestamp (ms) |
| `frameNumber` | `number` | Sequential frame counter |
| `drawCalls` | `number` | Draw calls in this frame |
| `triangles` | `number` | Triangles rendered |
| `points` | `number` | Points rendered |
| `lines` | `number` | Lines rendered |
| `textures` | `number` | Active textures |
| `shaders` | `number` | Active shader programs |
| `geometries` | `number` | Active geometries |
| `performance` | `PerformanceMetrics` | Timing and FPS data |
| `memory` | `MemoryMetrics` | Memory usage info |
| `violations` | `RuleViolation[]` | Any rule violations this frame |

**PerformanceMetrics:**

| Property | Type | Description |
|----------|------|-------------|
| `fps` | `number` | Frames per second |
| `frameTimeMs` | `number` | Frame duration (ms) |
| `cpuTimeMs` | `number` | CPU time (ms) |
| `gpuTimeMs` | `number \| null` | GPU time if available |
| `jank` | `boolean` | True if frame took >50ms |

**MemoryMetrics:**

| Property | Type | Description |
|----------|------|-------------|
| `totalGpuMemory` | `number` | Total GPU memory (bytes) |
| `textureMemory` | `number` | Texture memory (bytes) |
| `geometryMemory` | `number` | Geometry memory (bytes) |
| `jsHeapUsed` | `number` | JS heap used (bytes) |

### `getLatestFrameStats()`

Get the most recent frame stats without subscribing.

```typescript
const stats = probe.getLatestFrameStats();
if (stats) {
  console.log('Current FPS:', stats.performance?.fps);
}
```

### `getFrameStatsHistory(count?)`

Get historical frame stats.

```typescript
// Get all history
const allHistory = probe.getFrameStatsHistory();

// Get last 60 frames
const recent = probe.getFrameStatsHistory(60);
```

---

## Snapshot Events

### `onSnapshot(callback)`

Subscribe to scene snapshot updates (periodic or on-demand).

```typescript
const unsubscribe = probe.onSnapshot((snapshot) => {
  console.log('Snapshot:', snapshot.snapshotId);
  console.log('Scene count:', snapshot.scenes.length);
});
```

**Callback Parameter: `SceneSnapshot`**

| Property | Type | Description |
|----------|------|-------------|
| `snapshotId` | `string` | Unique snapshot identifier |
| `timestamp` | `number` | Snapshot time (ms) |
| `scenes` | `SceneData[]` | Array of scene data |
| `frameNumber` | `number` | Frame when snapshot was taken |

**SceneData:**

| Property | Type | Description |
|----------|------|-------------|
| `uuid` | `string` | Scene UUID |
| `name` | `string` | Scene name |
| `children` | `ObjectData[]` | Root-level objects |
| `objectCount` | `number` | Total object count |
| `meshCount` | `number` | Mesh count |
| `lightCount` | `number` | Light count |

**ObjectData:**

| Property | Type | Description |
|----------|------|-------------|
| `debugId` | `string` | Unique debug identifier |
| `uuid` | `string` | three.js UUID |
| `name` | `string` | Object name |
| `type` | `string` | Object type (Mesh, Light, etc.) |
| `visible` | `boolean` | Visibility state |
| `children` | `ObjectData[]` | Child objects |
| `position` | `[x, y, z]` | World position |
| `rotation` | `[x, y, z]` | Euler rotation |
| `scale` | `[x, y, z]` | Scale factors |
| `geometryUuid` | `string \| undefined` | Geometry UUID for meshes |
| `materialUuid` | `string \| string[] \| undefined` | Material UUID(s) |

---

## Selection Events

### `onSelectionChanged(callback)`

Subscribe to object selection changes.

```typescript
const unsubscribe = probe.onSelectionChanged((object, meta) => {
  if (object) {
    console.log('Selected:', meta?.name);
    console.log('Type:', meta?.type);
    console.log('Debug ID:', meta?.debugId);
  } else {
    console.log('Selection cleared');
  }
});
```

**Callback Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `object` | `THREE.Object3D \| null` | The selected object (or null if deselected) |
| `meta` | `ObjectMeta \| null` | Metadata about the object |

**ObjectMeta:**

| Property | Type | Description |
|----------|------|-------------|
| `debugId` | `string` | Debug identifier |
| `uuid` | `string` | three.js UUID |
| `name` | `string` | Object name |
| `type` | `string` | Object type |
| `moduleId` | `string \| undefined` | Module ID if part of entity |
| `componentId` | `string \| undefined` | Component ID if part of entity |
| `entityId` | `string \| undefined` | Entity ID if registered |

---

## Resource Events

### `onResourceEvent(callback)`

Subscribe to resource lifecycle events (creation, disposal, updates).

```typescript
const unsubscribe = probe.onResourceEvent((event) => {
  console.log(`${event.eventType}: ${event.resourceType}`);
  console.log('UUID:', event.uuid);
  console.log('Age:', event.ageMs, 'ms');
});
```

**Callback Parameter: `ResourceLifecycleEvent`**

| Property | Type | Description |
|----------|------|-------------|
| `eventType` | `LifecycleEventType` | `'created' \| 'disposed' \| 'updated' \| 'orphaned'` |
| `resourceType` | `ResourceType` | `'geometry' \| 'material' \| 'texture'` |
| `uuid` | `string` | Resource UUID |
| `name` | `string \| undefined` | Resource name |
| `subtype` | `string \| undefined` | Specific type (e.g., `'BoxGeometry'`) |
| `timestamp` | `number` | Event time (ms) |
| `ageMs` | `number` | Resource age since creation |
| `metadata` | `object \| undefined` | Additional metadata |

### Resource Query Methods

```typescript
// Get all resource events
const allEvents = probe.getResourceEvents();

// Filter by resource type
const textureEvents = probe.getResourceEventsByType('texture');
const geometryEvents = probe.getResourceEventsByType('geometry');
const materialEvents = probe.getResourceEventsByType('material');

// Filter by event type
const creations = probe.getResourceEventsByEventType('created');
const disposals = probe.getResourceEventsByEventType('disposed');
const orphaned = probe.getResourceEventsByEventType('orphaned');

// Filter by time range (last 5 seconds)
const now = performance.now();
const recentEvents = probe.getResourceEventsInRange(now - 5000, now);

// Get lifecycle summary
const summary = probe.getResourceLifecycleSummary();
console.log('Active geometries:', summary.geometries.active);
console.log('Potentially leaked:', summary.geometries.leaked);

// Get potential memory leaks
const leaks = probe.getPotentialResourceLeaks();
for (const leak of leaks) {
  console.warn(`Potential leak: ${leak.type} ${leak.uuid} (${leak.ageMs}ms old)`);
}
```

---

## Rule Violation Events

### `onRuleViolation(callback)`

Subscribe to performance rule violations.

```typescript
const unsubscribe = probe.onRuleViolation((violation) => {
  console.warn(`Rule: ${violation.ruleId}`);
  console.warn(`Message: ${violation.message}`);
  console.warn(`Severity: ${violation.severity}`);
});
```

**Callback Parameter: `RuleViolation`**

| Property | Type | Description |
|----------|------|-------------|
| `ruleId` | `string` | Rule identifier (e.g., `'maxDrawCalls'`) |
| `message` | `string` | Human-readable message |
| `severity` | `'info' \| 'warning' \| 'error' \| 'critical'` | Violation severity |
| `value` | `number` | Actual value |
| `threshold` | `number` | Configured threshold |
| `timestamp` | `number` | When violation occurred |

### Rule Check Configuration

```typescript
const probe = createProbe({
  appName: 'My App',
  rules: {
    maxDrawCalls: 500,
    maxTriangles: 200000,
    maxFrameTimeMs: 16,
    // Violations are checked and reported automatically
  },
});
```

---

## Entity Events

### `onEntityEvent(callback)`

Subscribe to logical entity events (registration, updates, destruction).

```typescript
const unsubscribe = probe.onEntityEvent((event) => {
  switch (event.type) {
    case 'entity-registered':
      console.log('New entity:', event.entity.name);
      break;
    case 'entity-updated':
      console.log('Entity updated:', event.entity.name);
      break;
    case 'entity-destroyed':
      console.log('Entity destroyed:', event.entityId);
      break;
    case 'object-added':
      console.log(`Object added to ${event.entityId}`);
      break;
    case 'object-removed':
      console.log(`Object removed from ${event.entityId}`);
      break;
  }
});
```

**Callback Parameter: `EntityEvent`**

| Property | Type | Description |
|----------|------|-------------|
| `type` | `EntityEventType` | Event type |
| `entityId` | `string` | Entity identifier |
| `entity` | `LogicalEntity \| undefined` | Entity data (for registration/update) |
| `objectUuid` | `string \| undefined` | Object UUID (for add/remove) |
| `timestamp` | `number` | Event time |

**EntityEventType Values:**

- `'entity-registered'` - New entity registered
- `'entity-updated'` - Entity metadata changed
- `'entity-destroyed'` - Entity unregistered
- `'object-added'` - Object added to entity
- `'object-removed'` - Object removed from entity

---

## Command Events

### `onCommand(handler)`

Subscribe to commands from the devtool UI (for custom integrations).

```typescript
const unsubscribe = probe.onCommand((command) => {
  console.log('Command received:', command.type);
  
  // Handle custom commands
  if (command.type === 'custom-action') {
    handleCustomAction(command.payload);
  }
});
```

**Callback Parameter: `DebugMessage`**

Commands are generic messages that can contain various types of requests from the UI.

---

## Transform Events

### `onTransformChange(callback)`

Subscribe to transform gizmo changes (requires gizmo initialization).

```typescript
const unsubscribe = probe.onTransformChange((event) => {
  console.log('Transform changed:', event.mode);
  console.log('Object:', event.objectUuid);
  console.log('Before:', event.before);
  console.log('After:', event.after);
});
```

**Callback Parameter: `TransformChangeEvent`**

| Property | Type | Description |
|----------|------|-------------|
| `objectUuid` | `string` | Transformed object UUID |
| `mode` | `'translate' \| 'rotate' \| 'scale'` | Transform mode |
| `before` | `TransformState` | State before change |
| `after` | `TransformState` | State after change |
| `timestamp` | `number` | Event time |

**TransformState:**

| Property | Type | Description |
|----------|------|-------------|
| `position` | `{ x, y, z }` | Object position |
| `rotation` | `{ x, y, z }` | Euler rotation (radians) |
| `scale` | `{ x, y, z }` | Scale factors |

---

## Best Practices

### 1. Always Cleanup Subscriptions

```typescript
// ❌ Bad - memory leak
probe.onFrameStats((stats) => {
  updateUI(stats);
});

// ✅ Good - proper cleanup
const cleanup = probe.onFrameStats((stats) => {
  updateUI(stats);
});
// Call cleanup() when done
```

### 2. Throttle Heavy Callbacks

```typescript
import { throttle } from 'lodash';

// Throttle expensive UI updates
const updateUI = throttle((stats) => {
  renderComplexChart(stats);
}, 100);

const unsubscribe = probe.onFrameStats(updateUI);
```

### 3. Use Multiple Subscriptions for Different Concerns

```typescript
// Separate concerns into different handlers
const unsubFps = probe.onFrameStats(updateFpsDisplay);
const unsubMemory = probe.onFrameStats(updateMemoryChart);
const unsubViolations = probe.onRuleViolation(showWarning);

// Cleanup all
function cleanup() {
  unsubFps();
  unsubMemory();
  unsubViolations();
}
```

### 4. Check for Null Values

```typescript
probe.onSelectionChanged((obj, meta) => {
  // Always check for null
  if (!obj || !meta) {
    clearInspector();
    return;
  }
  showInspector(obj, meta);
});
```

---

## See Also

- [Probe API](./probe-api.md) - Main probe reference
- [Configuration API](./config-api.md) - Configuration options
- [Plugin API](./plugin-api.md) - Plugin development
- [Memory Profiling Guide](../guides/MEMORY-PROFILING-GUIDE.md) - Resource tracking guide
