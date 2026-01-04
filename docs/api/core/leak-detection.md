# Leak Detection System

The 3Lens leak detection system automatically identifies memory leaks in your Three.js application by monitoring resource lifecycle patterns. It detects orphaned resources, undisposed objects, and abnormal memory growth, providing actionable alerts to help you maintain optimal performance.

## Overview

```typescript
import { ResourceLifecycleTracker } from '@3lens/core';

const tracker = new ResourceLifecycleTracker({
  leakThresholdMs: 60000,              // Flag resources older than 60s
  memoryGrowthThresholdBytes: 50 * 1024 * 1024, // Alert at 50MB growth
});

// Subscribe to leak alerts
tracker.onAlert((alert) => {
  console.warn(`[${alert.severity}] ${alert.message}`);
  console.log(alert.suggestion);
});

// Run detection manually
const alerts = tracker.runLeakDetection();
```

## Alert Types

The system detects five types of potential leaks:

```typescript
type LeakAlertType = 
  | 'orphaned_resource'      // Created but never attached
  | 'undisposed_resource'    // Active longer than threshold
  | 'memory_growth'          // Consistent memory increase
  | 'resource_accumulation'  // Too many resources of one type
  | 'detached_not_disposed'; // Removed from mesh but not freed
```

### Orphaned Resources

Resources created but never attached to any mesh within 5 seconds.

```typescript
// This geometry is created but never used
const orphanedGeometry = new THREE.BoxGeometry(1, 1, 1);
// After 5 seconds: Alert! "Orphaned geometry: BoxGeometry"
```

**Alert:**
```typescript
{
  type: 'orphaned_resource',
  severity: 'warning',
  message: 'Orphaned geometry: PlayerBox',
  details: 'Created 10.5s ago but never attached to any mesh',
  suggestion: 'Ensure this geometry is attached to a mesh or dispose it if unused'
}
```

### Undisposed Resources

Resources that remain active longer than the configured threshold.

```typescript
// Created 2 minutes ago, still active
// Alert! "Long-lived material: MainMaterial"
```

**Severity Levels:**
- `warning`: Active > threshold (default 60s)
- `critical`: Active > 3× threshold (180s)

### Memory Growth

Detected when memory consistently increases over 10 consecutive samples.

```typescript
{
  type: 'memory_growth',
  severity: 'critical',
  message: 'Memory growing: +52.4MB',
  details: 'Memory increased by 52.4MB over 45.2s (1.16MB/s)',
  suggestion: 'Review resource creation patterns. Ensure resources are being disposed when no longer needed.'
}
```

### Resource Accumulation

Triggered when resource counts exceed thresholds:

| Resource Type | Threshold | Critical |
|---------------|-----------|----------|
| Geometry | 100 | 200 |
| Material | 200 | 400 |
| Texture | 100 | 200 |

### Detached Not Disposed

Resources removed from meshes but not properly disposed within 10 seconds.

```typescript
mesh.material = newMaterial;  // oldMaterial detached
// 15 seconds later, oldMaterial still exists
// Alert! "Detached but not disposed: OldMaterial"
```

## Alert Interface

```typescript
interface LeakAlert {
  id: string;                    // Unique alert ID
  type: LeakAlertType;           // Type of leak detected
  severity: LeakAlertSeverity;   // 'info' | 'warning' | 'critical'
  resourceType?: ResourceType;   // 'geometry' | 'material' | 'texture'
  resourceUuid?: string;         // UUID of affected resource
  resourceName?: string;         // Name if available
  message: string;               // Short description
  details: string;               // Detailed explanation
  timestamp: number;             // When alert was generated
  stackTrace?: string;           // If stack traces enabled
  suggestion: string;            // Recommended fix
}
```

## Subscribing to Alerts

### onAlert()

Subscribe to leak alerts in real-time.

```typescript
const unsubscribe = tracker.onAlert((alert) => {
  // Handle based on severity
  switch (alert.severity) {
    case 'critical':
      console.error('🔴 CRITICAL:', alert.message);
      notifyDeveloper(alert);
      break;
    case 'warning':
      console.warn('🟡 WARNING:', alert.message);
      break;
    case 'info':
      console.info('🔵 INFO:', alert.message);
      break;
  }
});

// Later: unsubscribe();
```

### getAlerts()

Get all alerts generated during the session.

```typescript
const alerts = tracker.getAlerts();
const criticalCount = alerts.filter(a => a.severity === 'critical').length;
```

### clearAlerts()

Clear all stored alerts.

```typescript
tracker.clearAlerts();
```

## Manual Detection

### runLeakDetection()

Manually trigger leak detection and return new alerts.

```typescript
// Run detection and get new alerts
const newAlerts = tracker.runLeakDetection();

newAlerts.forEach(alert => {
  console.log(`New alert: ${alert.message}`);
});
```

### getPotentialLeaks()

Get resources that may be leaked (older than threshold).

```typescript
const potentialLeaks = tracker.getPotentialLeaks();

potentialLeaks.forEach(leak => {
  console.log(`${leak.type} "${leak.name}" - ${(leak.ageMs / 1000).toFixed(0)}s old`);
});
```

**Returns:**
```typescript
Array<{
  type: ResourceType;
  uuid: string;
  name?: string;
  subtype?: string;
  ageMs: number;
}>
```

### getOrphanedResources()

Get resources not attached to any mesh.

```typescript
const orphans = tracker.getOrphanedResources();

if (orphans.length > 0) {
  console.warn(`${orphans.length} orphaned resources found`);
  orphans.forEach(o => {
    console.log(`  - ${o.type}: ${o.name || o.uuid.substring(0, 8)}`);
  });
}
```

## Leak Report

### generateLeakReport()

Generate a comprehensive leak analysis report.

```typescript
const report = tracker.generateLeakReport();
```

**Report Structure:**

```typescript
interface LeakReport {
  generatedAt: number;           // Timestamp
  sessionDurationMs: number;     // How long the session has been running
  
  summary: {
    totalAlerts: number;
    criticalAlerts: number;
    warningAlerts: number;
    infoAlerts: number;
    estimatedLeakedMemoryBytes: number;
  };
  
  alerts: LeakAlert[];           // All alerts
  
  resourceStats: {
    geometries: { created: number; disposed: number; orphaned: number; leaked: number };
    materials: { created: number; disposed: number; orphaned: number; leaked: number };
    textures: { created: number; disposed: number; orphaned: number; leaked: number };
  };
  
  memoryHistory: Array<{ timestamp: number; estimatedBytes: number }>;
  
  recommendations: string[];     // Actionable suggestions
}
```

**Example Usage:**

```typescript
const report = tracker.generateLeakReport();

console.log('=== LEAK REPORT ===');
console.log(`Session Duration: ${(report.sessionDurationMs / 1000 / 60).toFixed(1)} minutes`);
console.log(`Total Alerts: ${report.summary.totalAlerts}`);
console.log(`  Critical: ${report.summary.criticalAlerts}`);
console.log(`  Warning: ${report.summary.warningAlerts}`);
console.log(`Estimated Leaked Memory: ${formatBytes(report.summary.estimatedLeakedMemoryBytes)}`);

console.log('\nResource Stats:');
console.log(`  Geometries: ${report.resourceStats.geometries.created} created, ${report.resourceStats.geometries.disposed} disposed, ${report.resourceStats.geometries.leaked} leaked`);

console.log('\nRecommendations:');
report.recommendations.forEach((rec, i) => {
  console.log(`  ${i + 1}. ${rec}`);
});
```

## Detection Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    Leak Detection Pipeline                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐                                            │
│  │ Active Resources │                                           │
│  │     Map          │                                           │
│  └────────┬────────┘                                            │
│           │                                                     │
│           ▼                                                     │
│  ┌────────────────────────────────────────────────────┐         │
│  │              Detection Checks                      │         │
│  │  ┌──────────────┐  ┌──────────────┐               │         │
│  │  │   Orphaned   │  │  Undisposed  │               │         │
│  │  │  (no mesh)   │  │  (too old)   │               │         │
│  │  └──────────────┘  └──────────────┘               │         │
│  │  ┌──────────────┐  ┌──────────────┐               │         │
│  │  │  Detached    │  │ Accumulation │               │         │
│  │  │ Not Disposed │  │  (too many)  │               │         │
│  │  └──────────────┘  └──────────────┘               │         │
│  │  ┌──────────────┐                                 │         │
│  │  │   Memory     │                                 │         │
│  │  │   Growth     │                                 │         │
│  │  └──────────────┘                                 │         │
│  └────────────────────────────────────────────────────┘         │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────┐    ┌─────────────────┐                    │
│  │    Generate     │───▶│  Alert Queue    │                    │
│  │     Alerts      │    │  & Callbacks    │                    │
│  └─────────────────┘    └─────────────────┘                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Common Leak Patterns

### Pattern 1: Event Listener Resources

```typescript
// ❌ BAD: Texture created in callback, never disposed
window.addEventListener('resize', () => {
  const texture = new THREE.DataTexture(data, 256, 256);
  material.map = texture; // Old texture leaked!
});

// ✅ GOOD: Dispose old texture before replacing
window.addEventListener('resize', () => {
  if (material.map) material.map.dispose();
  const texture = new THREE.DataTexture(data, 256, 256);
  material.map = texture;
});
```

### Pattern 2: Component Cleanup

```typescript
// ❌ BAD: Resources not disposed on unmount
class Player {
  constructor() {
    this.geometry = new THREE.BoxGeometry(1, 2, 1);
    this.material = new THREE.MeshStandardMaterial();
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }
  
  remove() {
    this.mesh.removeFromParent();
    // Geometry and material still in GPU memory!
  }
}

// ✅ GOOD: Proper cleanup
class Player {
  remove() {
    this.mesh.removeFromParent();
    this.geometry.dispose();
    this.material.dispose();
  }
}
```

### Pattern 3: Temporary Resources

```typescript
// ❌ BAD: Temporary geometry not disposed
function createExplosion() {
  const geo = new THREE.SphereGeometry(1, 32, 32);
  const mat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);
  
  setTimeout(() => {
    scene.remove(mesh);
    // geo and mat leaked!
  }, 1000);
}

// ✅ GOOD: Dispose temporary resources
function createExplosion() {
  const geo = new THREE.SphereGeometry(1, 32, 32);
  const mat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);
  
  setTimeout(() => {
    scene.remove(mesh);
    geo.dispose();
    mat.dispose();
  }, 1000);
}
```

## Configuration Tips

### Development Mode

```typescript
// Aggressive detection during development
const devTracker = new ResourceLifecycleTracker({
  captureStackTraces: true,       // See where leaks originate
  leakThresholdMs: 30000,         // Flag resources after 30s
  maxEvents: 5000,                // Keep more history
});
```

### Production Mode

```typescript
// Lighter detection for production
const prodTracker = new ResourceLifecycleTracker({
  captureStackTraces: false,      // No performance impact
  leakThresholdMs: 120000,        // More tolerant (2 minutes)
  maxEvents: 500,                 // Less memory overhead
});
```

## Integration Example

```typescript
import { createProbe, ResourceLifecycleTracker } from '@3lens/core';

// Set up leak detection with UI alerts
const tracker = new ResourceLifecycleTracker({
  leakThresholdMs: 60000,
});

tracker.onAlert((alert) => {
  // Show in-app notification
  showNotification({
    type: alert.severity,
    title: alert.message,
    body: alert.suggestion,
  });
  
  // Log for debugging
  console.group(`Leak Alert: ${alert.type}`);
  console.log('Details:', alert.details);
  console.log('Suggestion:', alert.suggestion);
  if (alert.stackTrace) {
    console.log('Stack:', alert.stackTrace);
  }
  console.groupEnd();
});

// Periodic leak check
setInterval(() => {
  tracker.runLeakDetection();
}, 30000);

// Export report on page unload
window.addEventListener('beforeunload', () => {
  const report = tracker.generateLeakReport();
  if (report.summary.criticalAlerts > 0) {
    sendToAnalytics('leak_report', report);
  }
});
```

## See Also

- [ResourceLifecycleTracker](./resource-lifecycle-tracker) - Core lifecycle tracking
- [Memory Tracking](./memory-tracking) - GPU memory estimation
- [PerformanceTracker](./performance-tracker) - Frame timing analysis
- [Performance Thresholds](./performance-thresholds) - Configuring warning levels
