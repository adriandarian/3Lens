<h1 align="center">3Lens</h1>

<p align="center">
  <img src="./3Lens_logo_no_bg.png" alt="3Lens Logo" width="200" />
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License" /></a>
 <a href="https://threejs.org/"><img src="https://img.shields.io/badge/Built%20With-Three.js-orange" alt="Three.js" /></a>
</p>

3Lens is a developer toolkit for [three.js](https://threejs.org/) that lets you inspect scenes, track performance, and debug WebGL/WebGPU apps without leaving the browser. It ships as a lightweight probe you embed in your app plus an overlay UI and browser extension so you can explore the scene graph, metrics, and rule violations in real time.

## Features

- Observe renderers and scenes to stream stats about draw calls, triangles, memory, and frame timing
- Floating overlay UI with a scene graph tree, selection inspector, and performance dashboards
- Browser extension transport so devtools can connect automatically via `postMessage`
- Extensible rule system to warn about thresholds (draw calls, triangles, frame time, and more)

## Getting Started

### Repository layout

- `packages/core` – probe SDK that collects stats and exposes events
- `packages/overlay` – in-app overlay UI built on top of the probe
- `packages/extension` – browser extension bundle for Chrome/Firefox devtools
- `examples/basic` – minimal sample showing how to wire the probe and overlay into a three.js scene

### Prerequisites

- Node.js >= 18
- pnpm >= 8

### Install and build

```bash
pnpm install
pnpm build
```

### Run the basic example

```bash
pnpm --filter @3lens/example-basic dev
```

Open the printed local URL (defaults to `http://localhost:5173`) to view the sample scene with the overlay.

### Use 3Lens in your app

```ts
import * as THREE from 'three';
import { createProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';

const renderer = new THREE.WebGLRenderer();
const scene = new THREE.Scene();

// Create a probe and watch your renderer + scene
const probe = createProbe({
  appName: 'My three.js app',
  rules: {
    maxDrawCalls: 1000,
    maxTriangles: 500_000,
    maxFrameTimeMs: 16.67,
  },
});

probe.observeRenderer(renderer);
probe.observeScene(scene);

// Attach the floating overlay
const overlay = createOverlay(probe);

// Optional: wire up a keyboard shortcut
window.addEventListener('keydown', (e) => {
  if (e.key === 'd' && e.ctrlKey && e.shiftKey) {
    overlay.toggle();
    e.preventDefault();
  }
});
```

The probe automatically opens a `postMessage` transport so the browser extension can connect without manual plumbing.

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests if you'd like to help improve 3Lens.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
