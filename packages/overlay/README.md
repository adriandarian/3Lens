# @3lens/overlay

In-app overlay UI for 3Lens — a floating panel for inspecting three.js scenes.

## Installation

```bash
npm install @3lens/core @3lens/overlay
```

> **Note:** Currently in alpha, not yet published to npm.

## Usage

### With Existing Probe

```typescript
import { createProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';

const probe = createProbe({ appName: 'My App' });
probe.observeRenderer(renderer);
probe.observeScene(scene);

// Create and mount the overlay
const overlay = createOverlay(probe, {
  position: 'right',
});
```

### One-Line Bootstrap

```typescript
import { bootstrapOverlay } from '@3lens/overlay';

const { probe, overlay } = bootstrapOverlay({
  renderer,
  scene,
  appName: 'My App',
  three: THREE, // Enables selection highlighting
});
```

## API

### `createOverlay(probe, options?): ThreeLensOverlay`

Creates and mounts the overlay panel.

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `position` | `'left' \| 'right'` | `'right'` | Panel position |
| `collapsed` | `boolean` | `false` | Start collapsed |

### `bootstrapOverlay(options): { probe, overlay }`

One-call setup for probe + overlay.

**Options:**

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `renderer` | `WebGLRenderer` | Yes | The renderer |
| `scene` | `Scene` | Yes | The scene to observe |
| `appName` | `string` | No | Application name |
| `probeConfig` | `Partial<ProbeConfig>` | No | Probe configuration |
| `overlay` | `Partial<OverlayOptions>` | No | Overlay options |
| `three` | `typeof THREE` | No | THREE reference for helpers |

### `ThreeLensOverlay`

| Method | Description |
|--------|-------------|
| `show()` | Show the panel |
| `hide()` | Hide the panel |
| `toggle()` | Toggle visibility |
| `isVisible` | Whether the panel is visible |
| `destroy()` | Remove from DOM |

## Features

- **Scene Tree** — Expandable tree view of all objects
- **Object Inspector** — View transform, visibility, materials
- **Performance Stats** — FPS, draw calls, triangles
- **Frame Time Chart** — Visual performance history
- **Resizable Panel** — Drag to resize
- **Keyboard Shortcut** — `Ctrl+Shift+D` to toggle

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+D` | Toggle overlay |

## Conditional Loading

Only load in development:

```typescript
if (import.meta.env.DEV) {
  const { bootstrapOverlay } = await import('@3lens/overlay');
  bootstrapOverlay({ renderer, scene });
}
```

## License

MIT

