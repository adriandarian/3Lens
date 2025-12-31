# 3Lens Examples

This directory contains example projects demonstrating 3Lens devtool integration with various Three.js setups and frameworks.

## Available Examples

| Example | Description | Status |
|---------|-------------|--------|
| [vanilla-threejs](./vanilla-threejs) | Vanilla Three.js with no framework | ✅ Complete |
| [react-three-fiber](./react-three-fiber) | React Three Fiber (R3F) integration | 🔜 Coming Soon |
| [angular-threejs](./angular-threejs) | Angular + Three.js integration | 🔜 Coming Soon |
| [vue-tresjs](./vue-tresjs) | Vue 3 + TresJS integration | 🔜 Coming Soon |
| [performance-debugging](./performance-debugging) | Advanced performance debugging techniques | 🔜 Coming Soon |

## Running Examples

### Quick Start

From the 3Lens root directory:

```bash
# Install all dependencies
pnpm install

# Run all examples in dev mode
pnpm dev

# Or run a specific example
cd examples/vanilla-threejs
pnpm dev
```

### Building for Production

```bash
# Build all examples
pnpm build

# Build a specific example
cd examples/vanilla-threejs
pnpm build
```

## Creating a New Example

1. Create a new directory under `examples/`:
   ```bash
   mkdir examples/my-example
   cd examples/my-example
   ```

2. Initialize with package.json:
   ```json
   {
     "name": "@3lens/example-my-example",
     "version": "0.0.0",
     "private": true,
     "type": "module",
     "scripts": {
       "dev": "vite",
       "build": "vite build",
       "preview": "vite preview"
     },
     "dependencies": {
       "@3lens/core": "workspace:*",
       "@3lens/overlay": "workspace:*",
       "three": "^0.160.0"
     },
     "devDependencies": {
       "vite": "^5.0.0"
     }
   }
   ```

3. The pnpm workspace will automatically detect the new example.

## Example Structure

Each example follows a consistent structure:

```
example-name/
├── src/              # Source code
│   └── main.ts       # Entry point
├── public/           # Static assets (optional)
├── index.html        # HTML entry point
├── package.json      # Dependencies and scripts
├── tsconfig.json     # TypeScript config (if using TS)
├── vite.config.ts    # Vite configuration
└── README.md         # Example-specific documentation
```

## Common Patterns

### Basic Integration

```typescript
import * as THREE from 'three';
import { createProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';

// Create scene, camera, renderer...
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

// Initialize 3Lens
const probe = createProbe({ appName: 'My App' });
probe.observeRenderer(renderer);
probe.observeScene(scene);

// Create overlay UI
const overlay = createOverlay(probe);
```

### With React Three Fiber

```tsx
import { ThreeLensProvider, ThreeLensCanvas } from '@3lens/react-bridge';

function App() {
  return (
    <ThreeLensProvider appName="My R3F App">
      <ThreeLensCanvas>
        <Scene />
      </ThreeLensCanvas>
    </ThreeLensProvider>
  );
}
```

### With Vue/TresJS

```vue
<script setup>
import { useTresContext } from '@tresjs/core';
import { useThreeLens } from '@3lens/vue-bridge';

const { scene, renderer } = useTresContext();
useThreeLens({ appName: 'My TresJS App' });
</script>
```

## Contributing

When adding new examples:

1. Keep examples focused on demonstrating specific features
2. Include comprehensive README documentation
3. Add comments explaining key integration points
4. Test across different browsers and devices
5. Update this README with the new example

