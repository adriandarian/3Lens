# Playbook: Add a Host

This playbook describes how to create a new host for 3Lens to support different runtime environments.

## Prerequisites

- [ ] Understand the runtime-boundaries contract
- [ ] Know how the target environment manages renderer/scene/camera
- [ ] Understand the render loop ownership

## What is a Host?

A Host is responsible for:
- Attaching to a three.js runtime
- Discovering renderer, scene, camera
- Observing the render loop
- Emitting events to the kernel

A Host is NOT responsible for:
- Rendering UI
- Processing queries
- Managing traces

## Steps

### 1. Define the Host's Purpose

Answer these questions:
- What environment does this host support? (e.g., R3F, TresJS, Worker)
- Who owns the render loop?
- How do we get renderer/scene/camera references?
- What special considerations exist?

### 2. Create the Host Package

```bash
# In packages/
mkdir host-myenv
cd host-myenv
```

```json
// package.json
{
  "name": "@3lens/host-myenv",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "peerDependencies": {
    "@3lens/kernel": "^1.0.0",
    "three": ">=0.150.0"
  }
}
```

### 3. Implement the Host Interface

```typescript
// src/index.ts
import { Host, HostConfig, CaptureContext } from '@3lens/kernel';
import * as THREE from 'three';

export interface MyEnvHostConfig extends HostConfig {
  // Environment-specific config
}

export function myEnvHost(config: MyEnvHostConfig): Host {
  let context: CaptureContext | null = null;
  let renderer: THREE.WebGLRenderer | null = null;
  let scene: THREE.Scene | null = null;
  let camera: THREE.Camera | null = null;
  
  return {
    id: 'myenv',
    name: 'My Environment Host',
    
    async attach(captureContext: CaptureContext) {
      context = captureContext;
      
      // Discover renderer/scene/camera
      // This is environment-specific
      renderer = discoverRenderer();
      scene = discoverScene();
      camera = discoverCamera();
      
      if (!renderer || !scene || !camera) {
        context.emit({
          type: 'warning_event',
          message: 'Could not discover all required objects',
        });
        return;
      }
      
      // Hook render loop
      hookRenderLoop();
      
      // Emit context registered event
      context.emit({
        type: 'context_register',
        context_id: context.id,
        renderer_id: generateEntityId(context.id, 'renderer', 0),
        scene_id: generateEntityId(context.id, 'scene', 0),
        camera_id: generateEntityId(context.id, 'camera', 0),
      });
    },
    
    detach() {
      unhookRenderLoop();
      context = null;
      renderer = null;
      scene = null;
      camera = null;
    },
    
    getRenderer() { return renderer; },
    getScene() { return scene; },
    getCamera() { return camera; },
  };
}
```

### 4. Hook the Render Loop

```typescript
function hookRenderLoop() {
  // Option 1: Wrap renderer.render
  const originalRender = renderer.render.bind(renderer);
  renderer.render = (scene: THREE.Scene, camera: THREE.Camera) => {
    context?.emit({
      type: 'frame_begin',
      context_id: context.id,
      timestamp: performance.now(),
    });
    
    const result = originalRender(scene, camera);
    
    context?.emit({
      type: 'render_event',
      context_id: context.id,
      timestamp: performance.now(),
      scene_id: getEntityId(scene),
      camera_id: getEntityId(camera),
    });
    
    context?.emit({
      type: 'frame_end',
      context_id: context.id,
      timestamp: performance.now(),
    });
    
    return result;
  };
  
  // Option 2: Use environment-specific hooks
  // e.g., R3F's useFrame, TresJS lifecycle
}
```

### 5. Handle Multiple Contexts

If the environment can have multiple renderers:

```typescript
export function myEnvHost(config: MyEnvHostConfig): Host {
  const contexts = new Map<string, ContextState>();
  
  return {
    // ...
    
    registerContext(id: string, renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera) {
      contexts.set(id, { renderer, scene, camera });
      // Hook this specific context
    },
    
    unregisterContext(id: string) {
      contexts.delete(id);
    }
  };
}
```

### 6. Support Late Attach

```typescript
async attach(captureContext: CaptureContext) {
  context = captureContext;
  
  // Check if app already running
  const isLateAttach = renderer && renderer.info.render.frame > 0;
  
  if (isLateAttach) {
    context.emit({
      type: 'attach_point',
      context_id: context.id,
      timestamp: performance.now(),
      frame: renderer.info.render.frame,
    });
    
    // Scan existing entities
    await scanExistingEntities();
  }
  
  // Hook render loop
  hookRenderLoop();
}
```

### 7. Emit Resource Events

Track resource creation/disposal:

```typescript
function hookResourceLifecycle() {
  // Hook texture creation
  const originalSetTexture = renderer.setTexture2D.bind(renderer);
  renderer.setTexture2D = (texture, slot) => {
    if (!texturesSeen.has(texture.uuid)) {
      texturesSeen.add(texture.uuid);
      context?.emit({
        type: 'resource_create',
        context_id: context.id,
        entity_id: generateEntityId(context.id, 'texture', texture.uuid),
        resource_type: 'texture',
        timestamp: performance.now(),
      });
    }
    return originalSetTexture(texture, slot);
  };
}
```

### 8. Add Tests

```typescript
// tests/host-myenv.test.ts
describe('MyEnv Host', () => {
  it('attaches to renderer', async () => {
    const host = myEnvHost({});
    const context = createMockCaptureContext();
    
    await host.attach(context);
    
    expect(host.getRenderer()).toBeDefined();
  });
  
  it('emits render events', async () => {
    const events: Event[] = [];
    const context = createMockCaptureContext({
      emit: (e) => events.push(e)
    });
    
    const host = myEnvHost({});
    await host.attach(context);
    
    // Trigger render
    renderer.render(scene, camera);
    
    expect(events.some(e => e.type === 'render_event')).toBe(true);
  });
  
  it('handles late attach', async () => {
    // Setup already-running app
    renderer.render(scene, camera); // Frame 1
    
    const events: Event[] = [];
    const context = createMockCaptureContext({
      emit: (e) => events.push(e)
    });
    
    const host = myEnvHost({});
    await host.attach(context);
    
    expect(events.some(e => e.type === 'attach_point')).toBe(true);
  });
});
```

## Checklist

Before submitting:

- [ ] Host discovers renderer/scene/camera correctly
- [ ] Render loop is hooked properly
- [ ] Events include context_id
- [ ] Entity IDs are stable and namespaced
- [ ] Late attach is handled
- [ ] Resource lifecycle is tracked
- [ ] No UI code in host
- [ ] Has tests
- [ ] Documented compatibility

## Anti-patterns to Avoid

- ❌ UI rendering code in host
- ❌ Assuming single renderer/scene/camera
- ❌ Events without context_id
- ❌ Crashing on missing hooks
- ❌ Blocking the render loop
