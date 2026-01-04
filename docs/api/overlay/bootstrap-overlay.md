# bootstrapOverlay()

The `bootstrapOverlay()` function provides one-call setup for creating both a probe and overlay in a single step.

## Overview

```typescript
import { bootstrapOverlay } from '@3lens/overlay';

const { probe, overlay } = bootstrapOverlay({
  renderer,
  scene,
  appName: 'My App',
});
```

## Signature

```typescript
function bootstrapOverlay(options: OverlayBootstrapOptions): {
  probe: DevtoolProbe;
  overlay: ThreeLensOverlay;
};
```

## Parameters

### OverlayBootstrapOptions

```typescript
interface OverlayBootstrapOptions {
  /** The Three.js WebGLRenderer instance */
  renderer: WebGLRenderer;
  
  /** The Three.js Scene to observe */
  scene: Scene;
  
  /** Application name shown in the overlay */
  appName?: string;
  
  /** Configuration passed to createProbe() */
  probeConfig?: Partial<ProbeConfig>;
  
  /** Configuration passed to createOverlay() */
  overlay?: Partial<Omit<OverlayOptions, 'probe'>>;
  
  /** Reference to Three.js library for enhanced inspection */
  three?: typeof import('three');
}
```

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `renderer` | `WebGLRenderer` | ✅ | The Three.js renderer to observe |
| `scene` | `Scene` | ✅ | The Three.js scene to observe |
| `appName` | `string` | ❌ | App name (defaults to `document.title` or `'3Lens App'`) |
| `probeConfig` | `Partial<ProbeConfig>` | ❌ | Custom probe configuration |
| `overlay` | `Partial<OverlayOptions>` | ❌ | Custom overlay options |
| `three` | `typeof THREE` | ❌ | Three.js reference for enhanced inspection |

## Returns

An object containing:

| Property | Type | Description |
|----------|------|-------------|
| `probe` | `DevtoolProbe` | The created probe instance |
| `overlay` | `ThreeLensOverlay` | The created overlay instance |

## Usage Examples

### Minimal Setup

```typescript
import { bootstrapOverlay } from '@3lens/overlay';
import * as THREE from 'three';

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// One-line 3Lens setup
const { probe, overlay } = bootstrapOverlay({ renderer, scene });

// Start rendering
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
```

### With Full Configuration

```typescript
import { bootstrapOverlay } from '@3lens/overlay';
import * as THREE from 'three';

const { probe, overlay } = bootstrapOverlay({
  renderer,
  scene,
  appName: 'My 3D Viewer',
  
  // Pass Three.js reference for enhanced inspection
  three: THREE,
  
  // Probe configuration
  probeConfig: {
    enableGPUTiming: true,
    thresholds: {
      maxDrawCalls: 200,
      maxTriangles: 1_000_000,
      maxTextureMemory: 256 * 1024 * 1024,
    },
    sampling: {
      frameInterval: 1,
      snapshotThrottle: 500,
    },
  },
  
  // Overlay configuration
  overlay: {
    panels: [
      {
        id: 'custom-debug',
        title: 'Debug Info',
        icon: '🐛',
        iconClass: 'debug',
        defaultWidth: 320,
        defaultHeight: 200,
        render: () => '<div>Custom debug panel</div>',
      },
    ],
  },
});
```

### In a React Application

```tsx
import { useEffect, useRef } from 'react';
import { bootstrapOverlay } from '@3lens/overlay';
import * as THREE from 'three';

function ThreeScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const lensRef = useRef<{ probe: DevtoolProbe; overlay: ThreeLensOverlay }>();

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);
    const renderer = new THREE.WebGLRenderer();
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Initialize 3Lens
    lensRef.current = bootstrapOverlay({
      renderer,
      scene,
      appName: 'React Three App',
      three: THREE,
    });

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }
    animate();

    // Cleanup
    return () => {
      lensRef.current?.probe.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} />;
}
```

### With Multiple Scenes

```typescript
import { bootstrapOverlay } from '@3lens/overlay';

// Bootstrap with main scene
const { probe, overlay } = bootstrapOverlay({
  renderer,
  scene: mainScene,
  appName: 'Multi-Scene App',
});

// Observe additional scenes
probe.observeScene(secondaryScene);
probe.observeScene(hudScene);
```

## Comparison with createOverlay()

| Approach | Use Case |
|----------|----------|
| `bootstrapOverlay()` | Quick setup, single scene, minimal configuration |
| `createProbe()` + `createOverlay()` | Custom probe lifecycle, multiple scenes, advanced configuration |

### Using createOverlay() (More Control)

```typescript
import { createProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';

// Create probe separately for more control
const probe = createProbe({
  appName: 'My App',
  enableGPUTiming: true,
});

// Set up observers
probe.observeRenderer(renderer);
probe.observeScene(mainScene);
probe.observeScene(uiScene);

// Create overlay
const overlay = createOverlay(probe);

// Later: dispose in specific order
overlay.destroy();
probe.dispose();
```

### Using bootstrapOverlay() (Quick Start)

```typescript
import { bootstrapOverlay } from '@3lens/overlay';

// All-in-one setup
const { probe, overlay } = bootstrapOverlay({
  renderer,
  scene,
});
```

## What bootstrapOverlay() Does

Internally, `bootstrapOverlay()` performs these steps:

1. Creates a probe with `createProbe()`
2. Sets the Three.js reference (if provided)
3. Calls `probe.observeRenderer(renderer)`
4. Calls `probe.observeScene(scene)`
5. Creates the overlay with `createOverlay(probe, overlayOptions)`
6. Returns both instances

```typescript
// This bootstrapOverlay call:
const { probe, overlay } = bootstrapOverlay({
  renderer,
  scene,
  appName: 'My App',
  three: THREE,
  probeConfig: { enableGPUTiming: true },
  overlay: { panels: customPanels },
});

// Is equivalent to:
const probe = createProbe({
  appName: 'My App',
  enableGPUTiming: true,
});
probe.setThreeReference(THREE);
probe.observeRenderer(renderer);
probe.observeScene(scene);
const overlay = createOverlay(probe, { panels: customPanels });
```

## See Also

- [createOverlay()](./create-overlay.md) - Manual overlay creation
- [createProbe()](/api/core/create-probe.md) - Probe factory function
- [ProbeConfig](/api/core/probe-config.md) - Probe configuration options
