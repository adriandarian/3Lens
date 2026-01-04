# Logical Entities Guide

This guide covers 3Lens's Logical Entity system for tracking module-level metrics, grouping related objects, and debugging high-level game concepts rather than individual Three.js objects.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [What Are Logical Entities?](#what-are-logical-entities)
- [Registering Entities](#registering-entities)
- [Entity Groups](#entity-groups)
- [Entity Metrics](#entity-metrics)
- [Entity Filtering](#entity-filtering)
- [Framework Integration](#framework-integration)
- [Custom Entity Types](#custom-entity-types)
- [Entity Lifecycle](#entity-lifecycle)
- [Best Practices](#best-practices)

---

## Overview

Logical Entities allow you to:

- Group related Three.js objects under meaningful names
- Track performance per game entity (Player, Enemy, Particle System)
- Debug at a higher abstraction level than raw meshes
- Monitor module-level memory and render costs
- Create custom entity types for your domain

---

## Quick Start

Register a logical entity in under 2 minutes:

```typescript
import { createProbe } from '@3lens/core';
import * as THREE from 'three';

const probe = createProbe({ appName: 'My Game' });

// Create a player with multiple meshes
const playerGroup = new THREE.Group();
const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
const head = new THREE.Mesh(headGeometry, headMaterial);
const weapon = new THREE.Mesh(weaponGeometry, weaponMaterial);

playerGroup.add(body, head, weapon);
scene.add(playerGroup);

// Register as a logical entity
probe.registerEntity('player', {
  name: 'Player',
  type: 'character',
  objects: [playerGroup], // Includes all children
  metadata: {
    health: 100,
    level: 5,
  },
});

// Now 3Lens shows "Player" in the UI instead of unnamed groups/meshes
```

---

## What Are Logical Entities?

### Problem: Raw Scene Graph

Without entities, your 3Lens view shows:

```
Scene
├── Group (unnamed)
│   ├── Mesh (unnamed)
│   ├── Mesh (unnamed)
│   └── Mesh (unnamed)
├── Group (unnamed)
│   ├── Mesh (unnamed)
│   └── Mesh (unnamed)
└── ... 500 more unnamed objects
```

### Solution: Logical Entities

With entities registered:

```
Scene
├── 👤 Player (3 meshes, 12K tris)
│   ├── Body
│   ├── Head
│   └── Weapon
├── 👾 Enemy #1 (2 meshes, 8K tris)
├── 👾 Enemy #2 (2 meshes, 8K tris)
├── 🎆 ParticleSystem (1K particles)
└── 🏠 Environment (45 meshes, 180K tris)
```

### Entity Inspector

```
┌─────────────────────────────────────────────────┐
│ 👤 Player                                       │
├─────────────────────────────────────────────────┤
│ Type: character                                 │
│ Status: active                                  │
├─────────────────────────────────────────────────┤
│ Render Cost:                                    │
│   Draw Calls: 3                                 │
│   Triangles: 12,450                             │
│   Materials: 3                                  │
│   Textures: 5 (24 MB)                           │
├─────────────────────────────────────────────────┤
│ Custom Metrics:                                 │
│   health: 100                                   │
│   level: 5                                      │
│   position: (12.4, 0, -8.2)                     │
├─────────────────────────────────────────────────┤
│ Objects:                                        │
│   ▶ Body (Mesh)                                 │
│   ▶ Head (Mesh)                                 │
│   ▶ Weapon (Mesh)                               │
└─────────────────────────────────────────────────┘
```

---

## Registering Entities

### Basic Registration

```typescript
probe.registerEntity('entity-id', {
  name: 'Display Name',
  type: 'category',
  objects: [threeJsObject],
});
```

### Registration Options

```typescript
interface EntityRegistration {
  /**
   * Display name in 3Lens UI
   */
  name: string;

  /**
   * Entity category/type
   */
  type: string;

  /**
   * Three.js objects belonging to this entity
   */
  objects: THREE.Object3D[];

  /**
   * Include children of objects automatically
   */
  includeChildren?: boolean; // default: true

  /**
   * Entity icon (emoji or URL)
   */
  icon?: string;

  /**
   * Custom metadata to display
   */
  metadata?: Record<string, unknown>;

  /**
   * Tags for filtering
   */
  tags?: string[];

  /**
   * Parent entity ID for hierarchy
   */
  parent?: string;
}
```

### Full Example

```typescript
probe.registerEntity('enemy-001', {
  name: 'Goblin Warrior',
  type: 'enemy',
  icon: '👾',
  objects: [goblinGroup],
  includeChildren: true,
  metadata: {
    health: 50,
    damage: 10,
    aiState: 'patrol',
    spawnPoint: { x: 10, z: 20 },
  },
  tags: ['enemy', 'goblin', 'melee'],
  parent: 'enemy-manager',
});
```

---

## Entity Groups

### Creating Groups

Group related entities together:

```typescript
// Register a group entity
probe.registerEntityGroup('enemies', {
  name: 'Enemies',
  type: 'group',
  icon: '👾',
});

// Register individual entities under the group
enemies.forEach((enemy, i) => {
  probe.registerEntity(`enemy-${i}`, {
    name: enemy.name,
    type: 'enemy',
    objects: [enemy.mesh],
    parent: 'enemies', // Links to group
    metadata: {
      health: enemy.health,
    },
  });
});
```

### Group Statistics

```
┌─────────────────────────────────────────────────┐
│ 👾 Enemies (Group)                              │
├─────────────────────────────────────────────────┤
│ Count: 45 enemies                               │
│                                                 │
│ Aggregate Stats:                                │
│   Total Draw Calls: 90                          │
│   Total Triangles: 360K                         │
│   Total Memory: 48 MB                           │
│                                                 │
│ By Type:                                        │
│   Goblins: 20 (160K tris)                       │
│   Orcs: 15 (150K tris)                          │
│   Skeletons: 10 (50K tris)                      │
├─────────────────────────────────────────────────┤
│ ⚠️ Performance Note:                            │
│ Consider LOD for distant enemies                │
│ 12 enemies using high-detail at >50 units      │
└─────────────────────────────────────────────────┘
```

---

## Entity Metrics

### Automatic Metrics

3Lens automatically tracks for each entity:

| Metric | Description |
|--------|-------------|
| `drawCalls` | Number of draw calls |
| `triangles` | Total triangle count |
| `vertices` | Total vertex count |
| `materials` | Number of materials |
| `textures` | Number of textures |
| `textureMemory` | Texture memory usage |
| `geometryMemory` | Geometry memory usage |
| `visible` | Whether currently visible |
| `inFrustum` | Whether in camera frustum |

### Custom Metrics

Add your own metrics:

```typescript
// Register with initial metrics
probe.registerEntity('player', {
  name: 'Player',
  type: 'character',
  objects: [playerGroup],
  metadata: {
    health: 100,
    mana: 50,
    stamina: 100,
  },
});

// Update metrics dynamically
probe.updateEntityMetadata('player', {
  health: player.health,
  mana: player.mana,
  stamina: player.stamina,
  position: player.position.toArray(),
  velocity: player.velocity.length(),
});

// Add metric with formatting
probe.defineEntityMetric('player', 'dps', {
  label: 'Damage Per Second',
  value: player.dps,
  format: 'number',
  precision: 1,
  unit: '/s',
});
```

### Metric History

```typescript
// Enable metric history for graphs
probe.trackEntityMetricHistory('player', ['health', 'mana'], {
  historySize: 300, // Keep last 300 frames
});

// Access history
const healthHistory = probe.getEntityMetricHistory('player', 'health');
// Returns: [100, 98, 95, 90, ...]
```

---

## Entity Filtering

### Filter by Type

```typescript
// Get all enemy entities
const enemies = probe.getEntitiesByType('enemy');

// Get entities matching multiple types
const characters = probe.getEntitiesByType(['player', 'npc', 'enemy']);
```

### Filter by Tags

```typescript
// Get entities with specific tag
const meleeEnemies = probe.getEntitiesByTag('melee');

// Get entities matching all tags
const goblinsWithRanged = probe.getEntitiesByTags(['goblin', 'ranged'], 'all');

// Get entities matching any tag
const anyGoblin = probe.getEntitiesByTags(['goblin', 'orc'], 'any');
```

### Filter by Metrics

```typescript
// Find entities over performance budget
const expensive = probe.filterEntities((entity) => {
  return entity.metrics.triangles > 50000;
});

// Find entities with low health
const lowHealth = probe.filterEntities((entity) => {
  return entity.metadata.health < 20;
});
```

### UI Filtering

```
┌─────────────────────────────────────────────────┐
│ 🔍 Entity Filter                                │
├─────────────────────────────────────────────────┤
│ Type: [All ▼] [enemy ▼] [npc ▼]                │
│                                                 │
│ Tags: [melee] [x] [ranged] [x]                 │
│                                                 │
│ Search: [                    ] 🔍               │
│                                                 │
│ Show:                                           │
│ ☑ Visible Only                                  │
│ ☐ In Frustum Only                               │
│ ☐ Over Budget Only                              │
├─────────────────────────────────────────────────┤
│ Results: 23 entities                            │
└─────────────────────────────────────────────────┘
```

---

## Framework Integration

### React with R3F

```tsx
import { useDevtoolEntity } from '@3lens/react-bridge';
import { useRef } from 'react';

function Enemy({ id, health, position }) {
  const groupRef = useRef();
  
  // Automatically registers and updates entity
  useDevtoolEntity(`enemy-${id}`, {
    name: `Enemy ${id}`,
    type: 'enemy',
    icon: '👾',
    ref: groupRef,
    metadata: {
      health,
      position: position.toArray(),
    },
    tags: ['enemy'],
  });
  
  return (
    <group ref={groupRef} position={position}>
      <mesh>
        <boxGeometry />
        <meshStandardMaterial color="red" />
      </mesh>
    </group>
  );
}

// For multiple entities
function EnemyManager({ enemies }) {
  return (
    <DevtoolEntityGroup id="enemies" name="Enemies" type="group">
      {enemies.map(enemy => (
        <Enemy key={enemy.id} {...enemy} />
      ))}
    </DevtoolEntityGroup>
  );
}
```

### Vue with TresJS

```vue
<script setup>
import { useDevtoolEntity, useDevtoolEntityGroup } from '@3lens/vue-bridge';
import { ref, watch } from 'vue';

const props = defineProps(['id', 'health', 'position']);
const groupRef = ref();

// Register entity
const { updateMetadata } = useDevtoolEntity(`enemy-${props.id}`, {
  name: `Enemy ${props.id}`,
  type: 'enemy',
  ref: groupRef,
  metadata: {
    health: props.health,
  },
});

// Update when health changes
watch(() => props.health, (newHealth) => {
  updateMetadata({ health: newHealth });
});
</script>

<template>
  <TresGroup ref="groupRef">
    <TresMesh>
      <TresBoxGeometry />
      <TresMeshStandardMaterial color="red" />
    </TresMesh>
  </TresGroup>
</template>
```

### Angular

```typescript
import { Component, Input, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { ThreeLensService } from '@3lens/angular-bridge';

@Component({
  selector: 'app-enemy',
  template: `<div #container></div>`,
})
export class EnemyComponent implements OnInit, OnDestroy {
  @Input() id: string;
  @Input() health: number;
  @ViewChild('container') container: ElementRef;
  
  private group: THREE.Group;
  
  constructor(private threeLens: ThreeLensService) {}
  
  ngOnInit() {
    this.group = this.createEnemyMesh();
    
    // Register entity
    this.threeLens.registerEntity(`enemy-${this.id}`, {
      name: `Enemy ${this.id}`,
      type: 'enemy',
      objects: [this.group],
      metadata: { health: this.health },
    });
  }
  
  ngOnDestroy() {
    // Auto-cleanup
    this.threeLens.unregisterEntity(`enemy-${this.id}`);
  }
  
  updateHealth(newHealth: number) {
    this.health = newHealth;
    this.threeLens.updateEntityMetadata(`enemy-${this.id}`, {
      health: newHealth,
    });
  }
}
```

---

## Custom Entity Types

### Defining Types

```typescript
// Register custom entity types
probe.defineEntityType('particle-system', {
  name: 'Particle System',
  icon: '🎆',
  color: '#ff9800',
  defaultMetrics: ['particleCount', 'emissionRate', 'lifetime'],
  inspector: {
    sections: [
      {
        title: 'Emitter',
        fields: ['position', 'emissionRate', 'lifetime'],
      },
      {
        title: 'Particles',
        fields: ['particleCount', 'maxParticles', 'size'],
      },
    ],
  },
});

// Use the custom type
probe.registerEntity('explosion-fx', {
  name: 'Explosion Effect',
  type: 'particle-system',
  objects: [particleSystem],
  metadata: {
    particleCount: 1000,
    emissionRate: 100,
    lifetime: 2.0,
    maxParticles: 5000,
  },
});
```

### Type-Specific Visualization

```typescript
probe.defineEntityType('audio-source', {
  name: 'Audio Source',
  icon: '🔊',
  
  // Custom visualization in 3D view
  visualize: (entity, scene) => {
    const helper = new THREE.SphereHelper(entity.position, entity.range);
    helper.material.color.setHex(0x00ff00);
    return helper;
  },
  
  // Custom inspector widget
  inspectorWidget: (entity) => {
    return `
      <div class="audio-controls">
        <button data-action="play">▶ Play</button>
        <button data-action="stop">⏹ Stop</button>
        <input type="range" data-property="volume" 
               min="0" max="1" step="0.1" value="${entity.metadata.volume}">
      </div>
    `;
  },
});
```

---

## Entity Lifecycle

### Registration

```typescript
// Register
probe.registerEntity('player', { ... });

// Check if registered
const exists = probe.hasEntity('player');

// Get entity info
const player = probe.getEntity('player');
```

### Updates

```typescript
// Update metadata
probe.updateEntityMetadata('player', {
  health: 80,
  lastDamageTime: Date.now(),
});

// Update objects (e.g., after equipping item)
probe.updateEntityObjects('player', [playerGroup, newWeapon]);

// Add object to entity
probe.addObjectToEntity('player', petMesh);

// Remove object from entity
probe.removeObjectFromEntity('player', oldWeapon);
```

### Unregistration

```typescript
// Unregister single entity
probe.unregisterEntity('enemy-001');

// Unregister all entities of type
probe.unregisterEntitiesByType('enemy');

// Unregister with cleanup callback
probe.unregisterEntity('player', {
  onUnregister: (entity) => {
    console.log(`${entity.name} removed from tracking`);
  },
});
```

### Lifecycle Events

```typescript
// Listen for entity events
probe.onEntityRegistered((entity) => {
  console.log(`Entity registered: ${entity.name}`);
});

probe.onEntityUnregistered((entity) => {
  console.log(`Entity unregistered: ${entity.name}`);
});

probe.onEntityMetadataChanged((entity, changes) => {
  console.log(`${entity.name} metadata changed:`, changes);
});
```

---

## Best Practices

### 1. Use Meaningful IDs

```typescript
// ❌ Bad - Non-descriptive IDs
probe.registerEntity('e1', { ... });
probe.registerEntity('obj123', { ... });

// ✅ Good - Descriptive, hierarchical IDs
probe.registerEntity('player-main', { ... });
probe.registerEntity('enemy-goblin-001', { ... });
probe.registerEntity('environment-forest-trees', { ... });
```

### 2. Group Related Entities

```typescript
// ❌ Bad - Flat structure
enemies.forEach((e, i) => {
  probe.registerEntity(`enemy-${i}`, { ... });
});

// ✅ Good - Hierarchical structure
probe.registerEntityGroup('enemies', { name: 'All Enemies', type: 'group' });

enemies.forEach((e, i) => {
  probe.registerEntity(`enemy-${i}`, { 
    ..., 
    parent: 'enemies',
    tags: [e.type, e.aiState],
  });
});
```

### 3. Keep Metadata Minimal

```typescript
// ❌ Bad - Storing large objects
probe.updateEntityMetadata('player', {
  entireInventory: player.inventory, // 1000+ items
  fullState: player.serialize(), // Large object
});

// ✅ Good - Store summaries
probe.updateEntityMetadata('player', {
  inventoryCount: player.inventory.length,
  equippedWeapon: player.weapon?.name,
  healthPercent: (player.health / player.maxHealth) * 100,
});
```

### 4. Clean Up On Destroy

```typescript
// ❌ Bad - Entity persists after object destroyed
enemy.destroy(); // Object gone, entity still tracked

// ✅ Good - Unregister when destroyed
enemy.destroy();
probe.unregisterEntity(`enemy-${enemy.id}`);

// Or use automatic cleanup
probe.registerEntity(`enemy-${enemy.id}`, {
  ...,
  autoUnregister: true, // Unregister when objects removed from scene
});
```

### 5. Use Tags for Cross-Cutting Concerns

```typescript
// Tags enable filtering across types
probe.registerEntity('player', {
  type: 'character',
  tags: ['selectable', 'saveable', 'damageable'],
});

probe.registerEntity('npc-shopkeeper', {
  type: 'npc',
  tags: ['selectable', 'interactable'],
});

// Find all selectable entities
const selectable = probe.getEntitiesByTag('selectable');
```

---

## Debugging Tips

### Visualize Entity Bounds

```typescript
// Show bounding boxes for entities
probe.setEntityVisualization({
  showBounds: true,
  boundsColor: 0x00ff00,
  showLabels: true,
});
```

### Entity Performance Audit

```typescript
// Get performance breakdown by entity
const audit = probe.getEntityPerformanceAudit();

audit.byType.forEach(typeStats => {
  console.log(`${typeStats.type}: ${typeStats.count} entities`);
  console.log(`  Triangles: ${typeStats.totalTriangles}`);
  console.log(`  Draw Calls: ${typeStats.totalDrawCalls}`);
});

audit.expensive.forEach(entity => {
  console.log(`Expensive: ${entity.name} - ${entity.triangles} tris`);
});
```

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `E` | Open entity browser |
| `G` | Group selected objects as entity |
| `U` | Ungroup selected entity |
| `Ctrl+Click` | Select entity in 3D view |
| `F` | Focus on selected entity |

---

## Related Guides

- [Scene Inspection Guide](./SCENE-INSPECTION-GUIDE.md)
- [Performance Debugging Guide](./PERFORMANCE-DEBUGGING-GUIDE.md)
- [React/R3F Guide](./REACT-R3F-GUIDE.md)
- [Vue/TresJS Guide](./VUE-TRESJS-GUIDE.md)

## API Reference

- [LogicalEntityManager](/api/core/logical-entity-manager)
- [registerLogicalEntity](/api/core/register-logical-entity)
- [Entity Object Mapping](/api/core/entity-object-mapping)
- [Module Metrics](/api/core/module-metrics)
