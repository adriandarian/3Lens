---
title: Vanilla Three.js Integration
description: Basic 3Lens setup without any framework - the simplest way to get started
---

# Vanilla Three.js

The simplest way to integrate 3Lens with a standard Three.js application.

<ExampleViewer
  src="/examples/framework-integration/vanilla-threejs/"
  title="Vanilla Three.js Demo"
  description="A basic Three.js scene with 3Lens integration. Click on objects to inspect them, use the overlay to explore scene hierarchy and monitor performance."
  difficulty="beginner"
  github-url="https://github.com/adriandarian/3Lens/tree/main/examples/framework-integration/vanilla-threejs"
  aspect-ratio="16/9"
/>

## Features Demonstrated

- **Basic Setup**: Minimal code to get 3Lens running
- **Scene Inspection**: Browse the scene graph hierarchy
- **Object Selection**: Click to select and inspect objects
- **Performance Monitoring**: Real-time FPS and memory stats
- **Material Editing**: Live material property changes

## Quick Start

```typescript
import * as THREE from 'three';
import { createProbe } from '@3lens/core';
import { bootstrapOverlay } from '@3lens/overlay';

// Create your Three.js scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

// Initialize 3Lens
const probe = createProbe({
  enabled: process.env.NODE_ENV !== 'production'
});

// Connect to your scene and renderer
probe.observeRenderer(renderer);
probe.observeScene(scene);

// Mount the overlay UI
bootstrapOverlay(probe);

// Your render loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
```

## Development-Only Setup

For production builds, conditionally load 3Lens:

```typescript
if (process.env.NODE_ENV !== 'production') {
  const { createProbe } = await import('@3lens/core');
  const { bootstrapOverlay } = await import('@3lens/overlay');
  
  const probe = createProbe();
  probe.observeRenderer(renderer);
  probe.observeScene(scene);
  bootstrapOverlay(probe);
}
```

## Related Examples

- [React Three Fiber](./react-three-fiber) - React integration with R3F
- [Vue + TresJS](./vue-tresjs) - Vue.js integration
- [Performance Debugging](./performance-debugging) - Finding bottlenecks
