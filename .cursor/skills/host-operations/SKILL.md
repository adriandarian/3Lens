---
name: host-operations
description: Host development workflows for runtime environments. Use when creating hosts, debugging host issues, or understanding host implementation patterns.
---

# Host Operations

Host operations cover creating and maintaining runtime hosts that attach 3Lens to different rendering environments (vanilla three.js, React Three Fiber, TresJS, Workers, etc.).

## When to Use

- Creating a host for a new runtime environment
- Debugging host attachment issues
- Understanding event emission patterns
- Implementing multi-context support

## Host Types

### Manual Host (Vanilla three.js)

```typescript
// packages/hosts/manual/src/index.ts
import { createHost } from '@3lens/runtime';
import * as THREE from 'three';

export const manualHost = createHost({
  name: 'manual',
  
  attach(renderer: THREE.WebGLRenderer) {
    // Hook into render loop
    const originalRender = renderer.render.bind(renderer);
    renderer.render = (scene, camera) => {
      emitRenderEvent(renderer, scene, camera);
      originalRender(scene, camera);
    };
  }
});
```

### React Three Fiber Host

```typescript
// packages/hosts/r3f/src/index.ts
import { useFrame } from '@react-three/fiber';
import { useLens } from '@3lens/mount-react';

export function useThreeLensHost() {
  const lens = useLens();
  
  useFrame((state) => {
    // Emit render event
    lens.emitEvent({
      type: 'render_event',
      context_id: 'main',
      renderer_id: state.gl.domElement.id,
      scene_id: state.scene.uuid,
      camera_id: state.camera.uuid
    });
  });
}
```

### Worker Host

```typescript
// packages/hosts/worker/src/index.ts
// For OffscreenCanvas/Worker environments
export const workerHost = createHost({
  name: 'worker',
  
  attach(canvas: OffscreenCanvas) {
    // Handle worker context
    // Emit events via postMessage
  }
});
```

## Commands

### Scaffold a Host

```bash
# Create a new host
3lens scaffold host my-framework

# Generates host boilerplate
```

Generates:
- Host adapter source
- Context registration
- Lifecycle hooks
- Framework-specific bindings

## Host Implementation

### Host Interface

```typescript
interface Host {
  name: string;
  attach(renderer: Renderer): void;
  detach(): void;
  registerContext(context: RenderContext): void;
  unregisterContext(contextId: string): void;
}
```

### Context Registration

```typescript
// ✅ CORRECT: Proper context registration
client.registerContext({
  id: 'main',
  renderer: renderer,
  scenes: [scene],
  cameras: [camera]
});

// Then emit events with context_id
emitEvent({
  type: 'render_event',
  context_id: 'main',
  seq: seq++,
  // ...
});
```

### Event Emission

```typescript
// Event emission pattern
let seq = 0;

function onRender(renderer, scene, camera) {
  emitEvent({
    type: 'render_event',
    context_id: 'main',
    seq: seq++,
    timestamp: performance.now(),
    renderer_id: `renderer:main:${renderer.id}`,
    scene_id: `scene:main:${scene.uuid}`,
    camera_id: `camera:main:${camera.uuid}`
  });
}
```

### Multi-Context Support

```typescript
// Support multiple renderers/scenes/cameras
const contexts = new Map<string, RenderContext>();

function registerContext(context: RenderContext) {
  contexts.set(context.id, context);
  client.registerContext(context);
}

function onRender(contextId: string) {
  const context = contexts.get(contextId);
  emitEvent({
    type: 'render_event',
    context_id: contextId,
    // ...
  });
}
```

### Late Attach Handling

```typescript
// Mark attach point
emitEvent({
  type: 'attach_point',
  context_id: 'main',
  timestamp: Date.now()
});

// Mark pre-existing entities
scanEntities().forEach(entity => {
  emitEvent({
    type: 'resource_create',
    context_id: 'main',
    entity_id: entity.id,
    origin: 'preexisting'
  });
});
```

## Host Requirements

Every host MUST:

1. **Register Contexts Before Events**
   - Context registration must precede any events
   - Include context metadata

2. **Emit Events in Correct Order**
   - Sequence numbers must be monotonic per context
   - Include context_id in all events

3. **Support Multiple Contexts**
   - Handle multiple renderers/scenes/cameras
   - Track contexts independently

4. **Handle Late Attach**
   - Mark attach point
   - Mark pre-existing entities

5. **Respect Overhead Budgets**
   - Check overhead budget
   - Degrade capture mode if needed

## Agent Use Cases

1. **New host**: "Create a host for Solid.js"
2. **Debugging**: "My host isn't emitting events correctly"
3. **Multi-context**: "How do I support multiple renderers?"
4. **Late attach**: "How do I handle late attachment?"

## Post-Scaffold Steps

After scaffolding, follow the playbook:
- [agents/playbooks/add-a-host.md](../../../agents/playbooks/add-a-host.md)

## Additional Resources

- Contract: [agents/contracts/runtime-boundaries.md](../../../agents/contracts/runtime-boundaries.md)
- Contract: [agents/contracts/capture.md](../../../agents/contracts/capture.md)
- Contract: [agents/contracts/overhead.md](../../../agents/contracts/overhead.md)
- Rule: [.cursor/rules/host-standards.mdc](../../../rules/host-standards.mdc)
- Command: [.cursor/commands/scaffold-host.md](../../../commands/scaffold-host.md)