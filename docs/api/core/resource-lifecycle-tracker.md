# ResourceLifecycleTracker

The `ResourceLifecycleTracker` class monitors the creation, attachment, detachment, and disposal of Three.js resources (geometries, materials, and textures). It provides detailed lifecycle events, optional stack traces for debugging, and automatic leak detection.

## Overview

```typescript
import { ResourceLifecycleTracker } from '@3lens/core';

// Create with default options
const tracker = new ResourceLifecycleTracker();

// Or with custom configuration
const customTracker = new ResourceLifecycleTracker({
  captureStackTraces: true,        // Enable stack traces (performance impact)
  maxEvents: 1000,                 // Keep last 1000 events
  leakThresholdMs: 60000,          // Consider leaked after 60s
  orphanCheckIntervalMs: 10000,    // Check for orphans every 10s
  memoryGrowthThresholdBytes: 50 * 1024 * 1024, // 50MB growth threshold
});
```

## Constructor Options

```typescript
interface ResourceTrackerOptions {
  captureStackTraces?: boolean;       // Default: false
  maxEvents?: number;                 // Default: 1000
  leakThresholdMs?: number;           // Default: 60000 (1 minute)
  orphanCheckIntervalMs?: number;     // Default: 10000 (10 seconds)
  memoryGrowthThresholdBytes?: number; // Default: 52428800 (50MB)
}
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `captureStackTraces` | `boolean` | `false` | Capture stack traces for each event (performance impact) |
| `maxEvents` | `number` | `1000` | Maximum number of events to keep in history |
| `leakThresholdMs` | `number` | `60000` | Time after which undisposed resources are flagged as leaked |
| `orphanCheckIntervalMs` | `number` | `10000` | Interval for orphan detection checks |
| `memoryGrowthThresholdBytes` | `number` | `52428800` | Alert threshold for memory growth |

## Resource Types

The tracker monitors three types of resources:

```typescript
type ResourceType = 'geometry' | 'material' | 'texture';
```

## Lifecycle Event Types

```typescript
type LifecycleEventType = 'created' | 'disposed' | 'attached' | 'detached';
```

| Event Type | Description |
|------------|-------------|
| `created` | Resource was instantiated |
| `disposed` | Resource's `dispose()` method was called |
| `attached` | Resource was assigned to a mesh |
| `detached` | Resource was removed from a mesh |

## Recording Events

### recordCreation()

Record when a resource is created.

```typescript
recordCreation(
  resourceType: ResourceType,
  resourceUuid: string,
  options?: {
    name?: string;
    subtype?: string;
    estimatedMemory?: number;
    vertexCount?: number;
    faceCount?: number;
  }
): void
```

**Example:**

```typescript
const geometry = new THREE.BoxGeometry(1, 1, 1);

tracker.recordCreation('geometry', geometry.uuid, {
  name: 'PlayerBox',
  subtype: 'BoxGeometry',
  estimatedMemory: 1024,
  vertexCount: 24,
  faceCount: 12,
});
```

### recordDisposal()

Record when a resource is disposed.

```typescript
recordDisposal(resourceType: ResourceType, resourceUuid: string): void
```

**Example:**

```typescript
geometry.dispose();
tracker.recordDisposal('geometry', geometry.uuid);
```

### recordAttachment()

Record when a resource is attached to a mesh.

```typescript
recordAttachment(
  resourceType: ResourceType,
  resourceUuid: string,
  meshUuid: string,
  options?: {
    meshName?: string;
    textureSlot?: string;
  }
): void
```

**Example:**

```typescript
mesh.material = material;

tracker.recordAttachment('material', material.uuid, mesh.uuid, {
  meshName: mesh.name,
});

// For textures, specify the slot
tracker.recordAttachment('texture', texture.uuid, mesh.uuid, {
  meshName: mesh.name,
  textureSlot: 'map',
});
```

### recordDetachment()

Record when a resource is detached from a mesh.

```typescript
recordDetachment(
  resourceType: ResourceType,
  resourceUuid: string,
  meshUuid: string,
  options?: {
    meshName?: string;
    textureSlot?: string;
  }
): void
```

**Example:**

```typescript
// Old material being replaced
tracker.recordDetachment('material', oldMaterial.uuid, mesh.uuid);
mesh.material = newMaterial;
```

## Querying Events

### getEvents()

Get all recorded events.

```typescript
getEvents(): ResourceLifecycleEvent[]
```

### getEventsByType()

Filter events by resource type.

```typescript
getEventsByType(resourceType: ResourceType): ResourceLifecycleEvent[]
```

**Example:**

```typescript
const textureEvents = tracker.getEventsByType('texture');
```

### getEventsByEventType()

Filter events by lifecycle event type.

```typescript
getEventsByEventType(eventType: LifecycleEventType): ResourceLifecycleEvent[]
```

**Example:**

```typescript
const disposalEvents = tracker.getEventsByEventType('disposed');
console.log(`${disposalEvents.length} resources disposed`);
```

### getEventsInRange()

Get events within a time range.

```typescript
getEventsInRange(startMs: number, endMs: number): ResourceLifecycleEvent[]
```

**Example:**

```typescript
const now = performance.now();
const lastMinuteEvents = tracker.getEventsInRange(now - 60000, now);
```

## Event Interface

```typescript
interface ResourceLifecycleEvent {
  id: string;                     // Unique event ID (e.g., "evt_123")
  resourceType: ResourceType;     // 'geometry' | 'material' | 'texture'
  resourceUuid: string;           // Three.js UUID
  resourceName?: string;          // Optional name
  resourceSubtype?: string;       // e.g., 'MeshStandardMaterial'
  eventType: LifecycleEventType;  // 'created' | 'disposed' | etc.
  timestamp: number;              // performance.now() value
  stackTrace?: string;            // Stack trace if enabled
  metadata?: {
    meshUuid?: string;            // For attach/detach events
    meshName?: string;
    textureSlot?: string;         // e.g., 'map', 'normalMap'
    estimatedMemory?: number;     // Memory in bytes
    vertexCount?: number;         // For geometries
    faceCount?: number;           // For geometries
  };
}
```

## Event Subscriptions

### onEvent()

Subscribe to lifecycle events in real-time.

```typescript
onEvent(callback: LifecycleEventCallback): () => void
```

**Returns:** Unsubscribe function.

**Example:**

```typescript
const unsubscribe = tracker.onEvent((event) => {
  if (event.eventType === 'created') {
    console.log(`Created ${event.resourceType}: ${event.resourceName || event.resourceUuid}`);
  }
});

// Later, to unsubscribe:
unsubscribe();
```

## Summary Statistics

### getSummary()

Get a summary of resource lifecycle statistics.

```typescript
getSummary(): ResourceLifecycleSummary
```

**Returns:**

```typescript
interface ResourceLifecycleSummary {
  geometries: {
    created: number;
    disposed: number;
    active: number;    // created - disposed
    leaked: number;    // Active resources older than threshold
  };
  materials: { /* same structure */ };
  textures: { /* same structure */ };
  totalEvents: number;
  oldestActiveResource?: {
    type: ResourceType;
    uuid: string;
    name?: string;
    ageMs: number;
  };
}
```

**Example:**

```typescript
const summary = tracker.getSummary();

console.log(`Active geometries: ${summary.geometries.active}`);
console.log(`Potentially leaked: ${summary.geometries.leaked}`);

if (summary.oldestActiveResource) {
  const age = summary.oldestActiveResource.ageMs / 1000;
  console.log(`Oldest resource: ${summary.oldestActiveResource.name} (${age.toFixed(0)}s old)`);
}
```

## Stack Trace Control

### setStackTraceCapture()

Enable or disable stack trace capture at runtime.

```typescript
setStackTraceCapture(enabled: boolean): void
```

::: warning Performance Impact
Capturing stack traces has a significant performance impact. Enable only during debugging sessions, not in production.
:::

**Example:**

```typescript
// Enable temporarily for debugging
tracker.setStackTraceCapture(true);

// Do operations you want to trace
createSomeResources();

// Disable to restore performance
tracker.setStackTraceCapture(false);
```

### isStackTraceCaptureEnabled()

Check if stack trace capture is currently enabled.

```typescript
isStackTraceCaptureEnabled(): boolean
```

## Resource Lifecycle Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    Resource Lifecycle                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌──────────┐      ┌──────────┐      ┌──────────┐             │
│   │  CREATE  │─────▶│  ATTACH  │◀────▶│  DETACH  │             │
│   │          │      │          │      │          │             │
│   │ geometry │      │ to mesh  │      │from mesh │             │
│   │ material │      │          │      │          │             │
│   │ texture  │      │          │      │          │             │
│   └────┬─────┘      └──────────┘      └────┬─────┘             │
│        │                                    │                   │
│        │                                    │                   │
│        │         ┌──────────────┐          │                   │
│        └────────▶│   DISPOSE    │◀─────────┘                   │
│                  │              │                               │
│                  │ Free GPU     │                               │
│                  │ memory       │                               │
│                  └──────────────┘                               │
│                                                                 │
│   ⚠️ Problem States:                                            │
│   • Orphaned: Created but never attached                       │
│   • Leaked: Active too long without disposal                   │
│   • Detached-not-disposed: Removed but not freed               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Integration with 3Lens

The `ResourceLifecycleTracker` is used internally by `SceneObserver`:

```typescript
// Access through SceneObserver
const tracker = sceneObserver.getLifecycleTracker();

// Or access through probe
const probe = createProbe({ /* config */ });
probe.observeScene(scene);

// The tracker is automatically populated as resources change
```

## Clearing Data

### clear()

Clear all events, active resources, and alerts.

```typescript
clear(): void
```

**Example:**

```typescript
// Clear when switching contexts
function resetSession() {
  tracker.clear();
}
```

## Best Practices

### Enable Stack Traces Only When Debugging

```typescript
// Development debugging mode
if (process.env.NODE_ENV === 'development' && debugMode) {
  tracker.setStackTraceCapture(true);
}
```

### Monitor Summary for Memory Issues

```typescript
setInterval(() => {
  const summary = tracker.getSummary();
  
  // Check for accumulation
  if (summary.geometries.active > 500) {
    console.warn('High geometry count:', summary.geometries.active);
  }
  
  // Check for potential leaks
  if (summary.materials.leaked > 10) {
    console.warn('Potentially leaked materials:', summary.materials.leaked);
  }
}, 10000);
```

### Log Disposal Failures

```typescript
tracker.onEvent((event) => {
  if (event.eventType === 'disposed' && event.stackTrace) {
    // Keep track of disposal locations for debugging
    console.debug(`Disposed ${event.resourceType} at:`, event.stackTrace);
  }
});
```

## See Also

- [Leak Detection System](./leak-detection) - Automatic leak detection and alerts
- [Memory Tracking](./memory-tracking) - GPU memory estimation
- [SceneObserver](./scene-observer) - Scene graph tracking with lifecycle integration
- [DevtoolProbe](./devtool-probe) - Main probe class
