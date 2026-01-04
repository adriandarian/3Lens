# Module Metrics

3Lens aggregates performance metrics at the module level, allowing you to understand the rendering cost of different parts of your application. This is especially useful for large applications organized by feature modules.

## Overview

```typescript
import { LogicalEntityManager } from '@3lens/core';

const manager = new LogicalEntityManager();

// Register entities with modules
manager.registerLogicalEntity({
  name: 'Player Character',
  module: '@game/feature-player',
});

manager.registerLogicalEntity({
  name: 'Enemy 1',
  module: '@game/feature-enemies',
});

// Get module metrics
const playerModule = manager.getModuleInfo('@game/feature-player');
console.log('Player triangles:', playerModule?.metrics.triangles);
console.log('Player draw calls:', playerModule?.metrics.drawCalls);
console.log('Player GPU memory:', playerModule?.metrics.gpuMemory);
```

## API Reference

### getModuleInfo

Gets information and aggregated metrics for a specific module.

```typescript
getModuleInfo(moduleId: ModuleId): ModuleInfo | undefined
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `moduleId` | `ModuleId` | The module identifier |

**Returns:** `ModuleInfo | undefined` - Module information or undefined if no entities in module.

### getAllModules

Gets all unique module IDs.

```typescript
getAllModules(): ModuleId[]
```

**Example:**

```typescript
const modules = manager.getAllModules();
console.log(modules);
// ['@game/feature-player', '@game/feature-enemies', '@game/ui', ...]
```

### getAllModuleInfo

Gets information for all modules at once.

```typescript
getAllModuleInfo(): ModuleInfo[]
```

**Example:**

```typescript
const allModules = manager.getAllModuleInfo();

// Sort by triangle count
const sorted = allModules.sort(
  (a, b) => b.metrics.triangles - a.metrics.triangles
);

console.log('Top modules by triangles:');
for (const mod of sorted.slice(0, 5)) {
  console.log(`  ${mod.id}: ${mod.metrics.triangles} triangles`);
}
```

## ModuleInfo Interface

```typescript
interface ModuleInfo {
  /** Module identifier */
  id: ModuleId;
  
  /** Number of entities in this module */
  entityCount: number;
  
  /** Entity IDs in this module */
  entityIds: EntityId[];
  
  /** Total object count across all entities */
  objectCount: number;
  
  /** Aggregated performance metrics */
  metrics: ModuleMetrics;
  
  /** Child modules (hierarchical) */
  childModules: ModuleId[];
  
  /** Tags used by entities in this module */
  tags: string[];
}
```

## ModuleMetrics Interface

```typescript
interface ModuleMetrics {
  /** Total triangle count from all geometries */
  triangles: number;
  
  /** Estimated draw calls (visible meshes) */
  drawCalls: number;
  
  /** Estimated GPU memory usage in bytes */
  gpuMemory: number;
  
  /** Number of textures */
  textureCount: number;
  
  /** Number of unique geometries */
  geometryCount: number;
  
  /** Number of materials */
  materialCount: number;
  
  /** Currently visible objects */
  visibleObjects: number;
  
  /** Total objects (including hidden) */
  totalObjects: number;
}
```

## Metric Calculations

### Triangle Count

Triangles are calculated from geometry attributes:

```typescript
// For indexed geometry
triangles = geometry.index.count / 3;

// For non-indexed geometry  
triangles = geometry.attributes.position.count / 3;
```

### Draw Calls

Draw calls are estimated as one per visible mesh:

```typescript
// Simplified estimation
if (object.isMesh && object.visible) {
  drawCalls++;
}
```

::: info
Actual draw calls may differ due to instancing, batching, and render order optimizations in your application.
:::

### GPU Memory

Memory is estimated from geometry buffer attributes:

```typescript
// For each attribute (position, normal, uv, etc.)
gpuMemory += attribute.count * attribute.itemSize * 4; // Float32 = 4 bytes
```

## Usage Examples

### Performance Dashboard

```typescript
function renderModuleMetrics() {
  const modules = manager.getAllModuleInfo();
  
  // Calculate totals
  const totals = modules.reduce(
    (acc, mod) => ({
      triangles: acc.triangles + mod.metrics.triangles,
      drawCalls: acc.drawCalls + mod.metrics.drawCalls,
      gpuMemory: acc.gpuMemory + mod.metrics.gpuMemory,
    }),
    { triangles: 0, drawCalls: 0, gpuMemory: 0 }
  );
  
  console.log('=== Module Performance ===');
  console.log(`Total: ${totals.triangles} tris, ${totals.drawCalls} draws`);
  console.log(`Memory: ${(totals.gpuMemory / 1024 / 1024).toFixed(2)} MB`);
  console.log('');
  
  // Per-module breakdown
  for (const mod of modules) {
    const pct = ((mod.metrics.triangles / totals.triangles) * 100).toFixed(1);
    console.log(`${mod.id}: ${mod.metrics.triangles} tris (${pct}%)`);
  }
}
```

### Module Comparison

```typescript
function compareModules(moduleA: ModuleId, moduleB: ModuleId) {
  const infoA = manager.getModuleInfo(moduleA);
  const infoB = manager.getModuleInfo(moduleB);
  
  if (!infoA || !infoB) {
    console.log('Module not found');
    return;
  }
  
  console.log(`Comparing ${moduleA} vs ${moduleB}`);
  console.log('');
  console.log('Metric'.padEnd(20) + moduleA.padEnd(15) + moduleB);
  console.log('-'.repeat(50));
  
  const metrics = ['triangles', 'drawCalls', 'gpuMemory', 'materialCount'] as const;
  
  for (const metric of metrics) {
    const valA = infoA.metrics[metric];
    const valB = infoB.metrics[metric];
    const diff = valA - valB;
    const sign = diff > 0 ? '+' : '';
    
    console.log(
      metric.padEnd(20) +
      String(valA).padEnd(15) +
      `${valB} (${sign}${diff})`
    );
  }
}
```

### Finding Heavy Modules

```typescript
function findHeavyModules(threshold: { triangles?: number; memory?: number }) {
  const modules = manager.getAllModuleInfo();
  const heavy: ModuleInfo[] = [];
  
  for (const mod of modules) {
    if (threshold.triangles && mod.metrics.triangles > threshold.triangles) {
      heavy.push(mod);
    }
    if (threshold.memory && mod.metrics.gpuMemory > threshold.memory) {
      if (!heavy.includes(mod)) {
        heavy.push(mod);
      }
    }
  }
  
  return heavy.sort((a, b) => b.metrics.triangles - a.metrics.triangles);
}

// Usage
const heavy = findHeavyModules({ triangles: 100000, memory: 50 * 1024 * 1024 });
console.log('Heavy modules:', heavy.map(m => m.id));
```

### Hierarchical Module Analysis

Modules can be hierarchical using path-like naming:

```typescript
// Register with hierarchical modules
manager.registerLogicalEntity({ name: 'Player', module: '@game/characters/player' });
manager.registerLogicalEntity({ name: 'Enemy 1', module: '@game/characters/enemies' });
manager.registerLogicalEntity({ name: 'NPC 1', module: '@game/characters/npcs' });
manager.registerLogicalEntity({ name: 'Tree', module: '@game/environment/foliage' });

// Get parent module with child info
const charactersInfo = manager.getModuleInfo('@game/characters');
// Note: This only returns info if entities exist with exact module '@game/characters'

// To aggregate child modules, use prefix filtering
const characterEntities = manager.filterEntities({ 
  modulePrefix: '@game/characters/' 
});

function getModuleTreeMetrics(modulePrefix: string): ModuleMetrics {
  const entities = manager.filterEntities({ modulePrefix });
  
  // Calculate aggregated metrics
  return {
    triangles: 0, // Calculate from entities
    drawCalls: 0,
    gpuMemory: 0,
    textureCount: 0,
    geometryCount: 0,
    materialCount: 0,
    visibleObjects: entities.reduce((sum, e) => 
      sum + e.objects.filter(o => o.visible).length, 0),
    totalObjects: entities.reduce((sum, e) => sum + e.objects.length, 0),
  };
}
```

### Real-Time Monitoring

```typescript
class ModuleMonitor {
  private previousMetrics = new Map<ModuleId, ModuleMetrics>();
  
  checkForChanges() {
    const modules = manager.getAllModuleInfo();
    const changes: Array<{ module: ModuleId; metric: string; delta: number }> = [];
    
    for (const mod of modules) {
      const prev = this.previousMetrics.get(mod.id);
      
      if (prev) {
        if (mod.metrics.triangles !== prev.triangles) {
          changes.push({
            module: mod.id,
            metric: 'triangles',
            delta: mod.metrics.triangles - prev.triangles,
          });
        }
        if (mod.metrics.drawCalls !== prev.drawCalls) {
          changes.push({
            module: mod.id,
            metric: 'drawCalls',
            delta: mod.metrics.drawCalls - prev.drawCalls,
          });
        }
      }
      
      this.previousMetrics.set(mod.id, { ...mod.metrics });
    }
    
    return changes;
  }
}

// Usage in game loop
const monitor = new ModuleMonitor();

function gameLoop() {
  // ... game logic ...
  
  const changes = monitor.checkForChanges();
  for (const change of changes) {
    if (Math.abs(change.delta) > 1000) {
      console.warn(
        `${change.module}: ${change.metric} changed by ${change.delta}`
      );
    }
  }
  
  requestAnimationFrame(gameLoop);
}
```

### Export Metrics Report

```typescript
function exportMetricsReport(): string {
  const modules = manager.getAllModuleInfo();
  const report: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    totalModules: modules.length,
    totalEntities: manager.entityCount,
    modules: {},
  };
  
  for (const mod of modules) {
    report.modules[mod.id] = {
      entityCount: mod.entityCount,
      objectCount: mod.objectCount,
      metrics: mod.metrics,
      tags: mod.tags,
    };
  }
  
  return JSON.stringify(report, null, 2);
}

// Save report
const report = exportMetricsReport();
console.log(report);
// Or download as file
```

## Integration with DevtoolProbe

When using `DevtoolProbe`, module metrics are available through the probe:

```typescript
import { createProbe } from '@3lens/core';

const probe = createProbe({ /* config */ });

// Access module info through probe's entity manager
const playerModule = probe.getModuleInfo('@game/feature-player');
const allModules = probe.getAllModuleInfo();
```

## Performance Considerations

- Metrics are calculated on-demand when `getModuleInfo()` is called
- For frequent monitoring, consider caching results
- Large scenes with many geometries may have slower metric calculation
- Use `getAllModuleInfo()` instead of calling `getModuleInfo()` in a loop

## See Also

- [LogicalEntityManager](./logical-entity-manager.md) - Full manager API
- [registerLogicalEntity()](./register-logical-entity.md) - Creating entities with modules
- [Entity Filtering](./entity-filtering.md) - Query by module
- [Performance Tracker](./performance-tracker.md) - Frame-level metrics
