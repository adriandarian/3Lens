---
name: example-operations
description: Creating and maintaining examples for 3Lens. Use when creating example code, documenting features, or providing usage demonstrations.
---

# Example Operations

Example operations cover creating, maintaining, and documenting examples that demonstrate 3Lens features and integration patterns.

## When to Use

- Creating example code for features
- Documenting integration patterns
- Providing usage demonstrations
- Maintaining example quality

## Example Structure

Every example MUST follow this structure:

```
examples/[category]/[name]/
├── README.md           # Example documentation
├── package.json        # Dependencies
├── index.html          # Entry point
├── src/
│   └── main.ts         # Example code
└── vite.config.ts      # Build config
```

## Example Categories

### Feature Showcase

Examples that demonstrate specific features:

```
examples/feature-showcase/
├── inspector/
├── performance/
├── shader-debugging/
└── memory-tracking/
```

### Framework Integration

Examples for framework integration:

```
examples/framework-integration/
├── react-three-fiber/
├── vue-tresjs/
├── angular-threejs/
└── svelte-threlte/
```

### Real-World Scenarios

Examples for common use cases:

```
examples/real-world-scenarios/
├── 3d-model-viewer/
├── particle-system/
├── post-processing/
└── vr-xr-debugging/
```

## Example Requirements

Every example MUST:

1. **Be Complete and Runnable**
   - Include all dependencies
   - Work out of the box
   - Include setup instructions

2. **Include Documentation**
   - README.md with description
   - Setup instructions
   - Code walkthrough
   - Related links

3. **Demonstrate Best Practices**
   - Show correct patterns
   - Include error handling
   - Use TypeScript with strict types

4. **Include Comments**
   - Explain key concepts
   - Document non-obvious code
   - Reference related docs

## Example Template

```typescript
// examples/feature-showcase/inspector/src/main.ts
import * as THREE from 'three';
import { createLens } from '@3lens/runtime';

// Create a 3Lens instance with STANDARD capture mode
const lens = createLens({
  capture: {
    mode: 'STANDARD'  // Captures render events and resources
  }
});

// Create three.js scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Register the renderer context with 3Lens
lens.registerContext({
  id: 'main',
  renderer: renderer,
  scenes: [scene],
  cameras: [camera]
});

// Create a mesh
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// Render loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

// Example: Inspect the mesh
async function inspectMesh() {
  const entityId = `mesh:main:${mesh.uuid}`;
  const info = await lens.inspect(entityId, { include: ['info', 'cost'] });
  console.log('Mesh info:', info);
}
```

## README Template

```markdown
# Example: [Name]

## Description

[What this example demonstrates]

## Features

- Feature 1
- Feature 2
- Feature 3

## Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Run the example:
   ```bash
   pnpm dev
   ```

3. Open http://localhost:5173

## Code Walkthrough

[Explanation of key code]

## Related

- [Related documentation](link)
- [Related examples](link)
```

## Agent Use Cases

1. **New feature**: "Create an example for the new inspector feature"
2. **Integration**: "Create an example showing React integration"
3. **Documentation**: "Update example README"
4. **Maintenance**: "Fix broken example"

## Example Quality Checklist

- [ ] Example is complete and runnable
- [ ] README includes setup instructions
- [ ] Code includes explanatory comments
- [ ] Demonstrates best practices
- [ ] Links to related documentation
- [ ] Uses TypeScript with strict types
- [ ] Includes error handling

## Additional Resources

- Rule: [.cursor/rules/example-standards.mdc](../../../rules/example-standards.mdc)
- Project Guide: [agents.md](../../../agents.md)
- Skills: [.cursor/skills/](../../../skills/)