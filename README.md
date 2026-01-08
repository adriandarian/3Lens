<h1 align="center">3Lens</h1>

<p align="center">
  <img src="./docs/public/3Lens_logo_no_bg.png" alt="3Lens Logo" width="200" />
</p>

<p align="center">
  <strong>The definitive developer toolkit for three.js</strong>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License" /></a>
  <a href="https://threejs.org/"><img src="https://img.shields.io/badge/three.js-≥0.150-orange" alt="Three.js" /></a>
  <img src="https://img.shields.io/badge/version-alpha-yellow" alt="Version" />
  <a href="https://github.com/adriandarian/3Lens/actions/workflows/ci.yml"><img src="https://github.com/adriandarian/3Lens/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
</p>

<p align="center">
  Inspect scenes, track performance, and debug WebGL/WebGPU apps without leaving the browser.
</p>

---

## ✨ Features

- **Scene Inspector** — Explore the scene graph with a tree view, select objects, and inspect properties
- **Performance Monitoring** — Real-time stats for FPS, draw calls, triangles, and frame timing
- **Memory Profiling** — Track GPU memory, textures, geometries, and detect potential leaks
- **Transform Gizmos** — Translate, rotate, scale objects with visual gizmos and undo/redo
- **Camera Controls** — Focus on objects, fly-to animations, camera switching, and home position
- **Object Cost Analysis** — Per-mesh cost scoring with heatmap visualization
- **Resource Lifecycle Tracking** — Monitor creation/disposal of geometries, materials, and textures
- **Leak Detection** — Detect orphaned resources, undisposed objects, and memory growth
- **Rule Violations** — Set thresholds and get warned when performance degrades
- **Zero Config** — Works out of the box with any three.js application

## 📦 Packages

| Package | Description |
|---------|-------------|
| `@3lens/core` | Probe SDK that collects stats, manages scene observation, and exposes events |
| `@3lens/overlay` | In-app floating panel UI with full devtools functionality |
| `@3lens/react-bridge` | React and React Three Fiber integration with hooks and components |
| `@3lens/angular-bridge` | Angular integration with services, directives, and Nx workspace helpers |
| `@3lens/vue-bridge` | Vue 3 and TresJS integration with composables and plugin |

---

## 🚀 Quick Start

### Installation

```bash
npm install @3lens/core @3lens/overlay
# or
pnpm add @3lens/core @3lens/overlay
# or
yarn add @3lens/core @3lens/overlay
# or
bun add @3lens/core @3lens/overlay
```

> **Note:** 3Lens is currently in alpha. The packages are not yet published to npm. See [Development Setup](#development-setup) to try it locally.

### Basic Usage

```typescript
import * as THREE from 'three';
import { createProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';

// Your three.js setup
const renderer = new THREE.WebGLRenderer();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Create the probe and start observing
const probe = createProbe({
  appName: 'My three.js App',
  rules: {
    maxDrawCalls: 1000,
    maxTriangles: 500_000,
    maxFrameTimeMs: 16.67,
  },
});

probe.observeRenderer(renderer);
probe.observeScene(scene);

// Mount the overlay UI
const overlay = createOverlay(probe);

// Optional: toggle with keyboard shortcut
window.addEventListener('keydown', (e) => {
  if (e.key === 'd' && e.ctrlKey && e.shiftKey) {
    overlay.toggle();
  }
});
```

### One-Line Bootstrap

For quick setup, use the `bootstrapOverlay` helper:

```typescript
import * as THREE from 'three';
import { bootstrapOverlay } from '@3lens/overlay';

const renderer = new THREE.WebGLRenderer();
const scene = new THREE.Scene();

// One call does it all
const { probe, overlay } = bootstrapOverlay({
  renderer,
  scene,
  appName: 'My App',
});
```

### React Three Fiber Usage

```tsx
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { ThreeLensProvider, createR3FConnector, useFPS } from '@3lens/react-bridge';

// Create the R3F connector with R3F's hooks
const ThreeLensR3F = createR3FConnector(useThree, useFrame);

function PerformanceHUD() {
  const fps = useFPS(true);
  return <div className="hud">FPS: {fps.current.toFixed(0)}</div>;
}

function App() {
  return (
    <ThreeLensProvider config={{ appName: 'My R3F App' }}>
      <PerformanceHUD />
      <Canvas>
        <ThreeLensR3F />
        <ambientLight />
        <mesh>
          <boxGeometry />
          <meshStandardMaterial color="orange" />
        </mesh>
      </Canvas>
    </ThreeLensProvider>
  );
}
```

---

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+
- pnpm 8+

### Clone and Install

```bash
git clone https://github.com/adriandarian/3Lens.git
cd 3lens
pnpm install
```

### Build All Packages

```bash
pnpm build
```

### Run the Example App

```bash
pnpm --filter @3lens/example-basic dev
```

Open `http://localhost:5173` to see the example scene with the overlay panel.

### Development Mode

Run packages in watch mode with the base example app:

```bash
pnpm dev
```

This starts the core packages in watch mode along with the vanilla-threejs example.

### Running Examples

```bash
# List all available examples
pnpm example:list

# Interactive example selector
pnpm example

# Run specific example(s) by name
pnpm example vanilla-threejs
pnpm example react-three-fiber vue-tresjs

# Run by number (from example:list)
pnpm example 1 5 12

# Run a range of examples
pnpm example 1-5
```

---

## 🔧 Configuration

### Probe Options

```typescript
interface ProbeConfig {
  appName: string;              // Application name for identification
  env?: string;                 // Environment: 'development' | 'staging' | 'production'
  debug?: boolean;              // Enable verbose logging
  rules?: RulesConfig;          // Performance thresholds
  sampling?: SamplingConfig;    // How often to collect stats
}

interface RulesConfig {
  maxDrawCalls?: number;        // Warn when draw calls exceed this
  maxTriangles?: number;        // Warn when triangles exceed this
  maxFrameTimeMs?: number;      // Warn when frame time exceeds this (ms)
  maxTextures?: number;         // Warn when texture count exceeds this
}
```

### Overlay Options

```typescript
interface OverlayOptions {
  probe: DevtoolProbe;          // The probe instance
  position?: 'left' | 'right';  // Panel position (default: 'right')
  collapsed?: boolean;          // Start collapsed (default: false)
}
```

---

## 📖 API Reference

See the full [API Documentation](./docs/API.md) for detailed usage.

### Core API

```typescript
import { createProbe, DevtoolProbe } from '@3lens/core';

const probe = createProbe({ appName: 'My App' });

// Observe renderer and scene
probe.observeRenderer(renderer);
probe.observeScene(scene);

// Get current stats
const stats = probe.getLatestFrameStats();

// Subscribe to frame updates
const unsubscribe = probe.onFrameStats((stats) => {
  console.log(`Frame ${stats.frame}: ${stats.triangles} triangles`);
});

// Take a scene snapshot
const snapshot = probe.takeSnapshot();

// Clean up
probe.dispose();
```

### Overlay API

```typescript
import { createOverlay, ThreeLensOverlay } from '@3lens/overlay';

const overlay = createOverlay(probe);

overlay.show();      // Show the panel
overlay.hide();      // Hide the panel
overlay.toggle();    // Toggle visibility
overlay.destroy();   // Remove from DOM
```

---

## 🎮 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+D` | Toggle overlay panel |

---

## 📁 Project Structure

```
3lens/
├── packages/
│   ├── core/            # Probe SDK - data collection, scene observation, helpers
│   ├── overlay/         # In-app floating panel UI with full devtools
│   ├── react-bridge/    # React and R3F integration (hooks, components)
│   ├── angular-bridge/  # Angular integration (services, directives, Nx helpers)
│   ├── vue-bridge/      # Vue 3 and TresJS integration (composables, plugin)
│   └── ui/              # Shared UI components
├── examples/
│   └── basic/           # Vanilla three.js example
└── docs/                # Documentation
```

---

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for guidelines.

```bash
# Run tests
pnpm test

# Type check
pnpm typecheck

# Lint
pnpm lint

# Format code
pnpm format
```

---

## 📄 License

MIT © [3Lens Contributors](./LICENSE)

---

<p align="center">
  <sub>Built with ❤️ for the three.js community</sub>
</p>
