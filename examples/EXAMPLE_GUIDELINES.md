# 3Lens Example Guidelines

This document defines how examples should be structured to properly demonstrate 3Lens as a debugging and inspection tool.

## Core Principle

**Examples should demonstrate how to USE 3Lens to debug/inspect a scenario, NOT how to build that scenario's debugging tools from scratch.**

## What Examples Should Do

### ✅ DO

1. **Set up a realistic Three.js scenario** (the thing being debugged)
2. **Initialize 3Lens probe and overlay** as the primary debugging tool
3. **Register relevant logical entities** so they appear in 3Lens panels
4. **Use 3Lens helpers** (TransformGizmo, SelectionHelper, InspectMode, etc.)
5. **Include minimal scenario-specific controls** (e.g., "spawn more enemies", "toggle weather")
6. **Document what 3Lens features to explore** in the README

### ❌ DON'T

1. **Build custom stats panels** - Use 3Lens overlay's built-in stats
2. **Build custom scene trees** - Use 3Lens Scene Explorer
3. **Build custom property inspectors** - Use 3Lens property panels
4. **Build custom transform gizmos** - Use 3Lens TransformGizmo helper
5. **Build custom performance monitors** - Use 3Lens performance panels
6. **Duplicate debugging UI that 3Lens provides**

## Example Structure

### Minimal HTML

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Example Name - 3Lens</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { overflow: hidden; background: #000; }
    #app { width: 100vw; height: 100vh; }
    
    /* Only include UI for scenario-specific controls */
    .scenario-controls {
      position: fixed;
      top: 16px;
      left: 16px;
      z-index: 100;
      /* ... minimal styling ... */
    }
  </style>
</head>
<body>
  <div id="app"></div>
  
  <!-- Only scenario-specific controls, NOT debugging UI -->
  <div class="scenario-controls">
    <button id="spawn-enemies">Spawn Enemies</button>
    <!-- Controls that change the SCENARIO, not debug it -->
  </div>
  
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

### TypeScript Pattern

```typescript
import * as THREE from 'three';
import { createProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';
import '@3lens/themes/styles.css';

// 1. Setup Three.js scene (the thing to be debugged)
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(/* ... */);
const renderer = new THREE.WebGLRenderer();

// 2. Build your scenario
function createScenario() {
  // Create the meshes, lights, etc. for your example
}

// 3. Initialize 3Lens as the debugging tool
const probe = createProbe({ appName: 'Example Name' });
probe.observeRenderer(renderer);
probe.observeScene(scene);

const overlay = createOverlay({ probe, theme: 'dark' });

// 4. Register logical entities for domain concepts
probe.registerLogicalEntity({
  id: 'player',
  name: 'Player Character',
  type: 'character',
  object3D: playerMesh,
  metadata: { health: 100, inventory: [] }
});

// 5. Animation loop - NO custom stats UI updates
function animate() {
  requestAnimationFrame(animate);
  
  // Update your scenario
  updateScenario();
  
  renderer.render(scene, camera);
}

animate();
```

## README Template

Each example README should follow this structure:

```markdown
# Example Name

Brief description of what scenario this example demonstrates.

## What This Example Shows

Describe the Three.js scenario (NOT the debugging features).

## Using 3Lens to Debug This

### Recommended Panels

List which 3Lens panels are most useful for this scenario:
- **Scene Explorer**: Navigate the [specific structure]
- **Performance Stats**: Monitor [specific metrics]
- **[Panel Name]**: [What to look for]

### What to Try

Step-by-step exploration guide:
1. Open 3Lens overlay (Ctrl+Shift+D or click the toggle)
2. Navigate to [specific panel]
3. Look for [specific data]
4. Try [specific interaction]

### Entities to Explore

- `entity-id`: What this entity represents
- `another-id`: What to observe about it

## Controls

Only list scenario-specific controls (NOT 3Lens controls).

## Running the Example

```bash
cd examples/category/example-name
pnpm install
pnpm dev
```
```

## Missing Features

If an example requires a 3Lens feature that doesn't exist yet:

1. **Don't build a workaround** - Keep the example simple
2. **Document the missing feature** in `MISSING_FEATURES.md`
3. **Add a TODO comment** in the code:
   ```typescript
   // TODO: 3Lens needs a render pass inspector panel
   // For now, we can see passes as logical entities
   ```

## Example Categories

### debugging-profiling/
Focus: Demonstrate 3Lens for finding and fixing performance issues
- Should create intentional problems (high poly, memory leaks, etc.)
- Use 3Lens to identify and diagnose them

### feature-showcase/
Focus: Demonstrate specific 3Lens features
- Should be minimal scenarios that highlight one 3Lens capability
- Use the feature being showcased, not custom implementations

### framework-integration/
Focus: How to integrate 3Lens with various frameworks
- Minimal working integration
- Framework-specific patterns

### real-world-scenarios/
Focus: Realistic use cases
- Complex enough to need debugging
- Show how 3Lens helps in production-like scenarios

### advanced-techniques/
Focus: Advanced Three.js patterns
- Custom pipelines, compute shaders, etc.
- Show how 3Lens inspects these advanced setups

### data-visualization/
Focus: Data viz scenarios
- Charts, maps, real-time data
- Show how 3Lens helps debug visualization issues

### game-development/
Focus: Game-like scenarios
- Physics, AI, multiplayer concepts
- Show how 3Lens helps debug game logic
