# ThreeLensProvider

The `ThreeLensProvider` component is the main entry point for using 3Lens in a React application. It initializes the devtool probe and provides context to all child components.

## Import

```tsx
import { ThreeLensProvider } from '@3lens/react-bridge';
```

## Usage

Wrap your application (or the part containing your Three.js canvas) with `ThreeLensProvider`:

```tsx
import { ThreeLensProvider } from '@3lens/react-bridge';
import { Canvas } from '@react-three/fiber';

function App() {
  return (
    <ThreeLensProvider config={{ appName: 'My 3D App' }}>
      <Canvas>
        <MyScene />
      </Canvas>
    </ThreeLensProvider>
  );
}
```

## Props

### `ThreeLensProviderProps`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `config` | `ThreeLensProviderConfig` | `{}` | Configuration options for the probe |
| `children` | `React.ReactNode` | Required | Child components to render |
| `probe` | `DevtoolProbe` | `undefined` | Optional pre-created probe instance for advanced use cases |

### `ThreeLensProviderConfig`

Extends `Partial<ProbeConfig>` with additional React-specific options:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `appName` | `string` | `'React Three.js App'` | Name displayed in the devtools UI |
| `autoDetectR3F` | `boolean` | `true` | Automatically detect and set up React Three Fiber observation |
| `showOverlay` | `boolean` | `true` | Whether to show the overlay UI on initialization |
| `toggleShortcut` | `string` | `'ctrl+shift+d'` | Keyboard shortcut to toggle the overlay visibility |
| `debug` | `boolean` | `false` | Enable debug logging |

## Context Value

The provider exposes a `ThreeLensContextValue` object via React Context:

```tsx
interface ThreeLensContextValue {
  // Core
  probe: DevtoolProbe | null;
  isReady: boolean;

  // State
  frameStats: FrameStats | null;
  snapshot: SceneSnapshot | null;
  selectedNode: SceneNode | null;

  // Selection
  selectObject: (uuid: string) => void;
  clearSelection: () => void;

  // Overlay
  toggleOverlay: () => void;
  showOverlay: () => void;
  hideOverlay: () => void;
  isOverlayVisible: boolean;
}
```

## Examples

### Basic Setup

```tsx
import { ThreeLensProvider } from '@3lens/react-bridge';

function App() {
  return (
    <ThreeLensProvider>
      <YourApp />
    </ThreeLensProvider>
  );
}
```

### With Configuration

```tsx
import { ThreeLensProvider } from '@3lens/react-bridge';

function App() {
  return (
    <ThreeLensProvider
      config={{
        appName: 'My Game',
        showOverlay: true,
        toggleShortcut: 'ctrl+shift+i',
        debug: process.env.NODE_ENV === 'development',
        thresholds: {
          maxFPS: 60,
          maxDrawCalls: 500,
          maxTriangles: 1000000,
        },
      }}
    >
      <GameCanvas />
    </ThreeLensProvider>
  );
}
```

### With Pre-created Probe

For advanced scenarios where you need more control over the probe lifecycle:

```tsx
import { ThreeLensProvider } from '@3lens/react-bridge';
import { createProbe } from '@3lens/core';

const probe = createProbe({
  appName: 'Custom Probe',
  plugins: [myCustomPlugin],
});

function App() {
  return (
    <ThreeLensProvider probe={probe}>
      <YourApp />
    </ThreeLensProvider>
  );
}
```

### Accessing Context Directly

While hooks are preferred, you can access the context directly:

```tsx
import { ThreeLensContext } from '@3lens/react-bridge';
import { useContext } from 'react';

function MyComponent() {
  const context = useContext(ThreeLensContext);
  
  if (!context) {
    return <div>3Lens not available</div>;
  }
  
  return <div>FPS: {context.frameStats?.fps ?? 0}</div>;
}
```

## Keyboard Shortcuts

The provider automatically sets up keyboard shortcuts:

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+D` (default) | Toggle overlay visibility |

Customize the shortcut via `config.toggleShortcut`:

```tsx
<ThreeLensProvider config={{ toggleShortcut: 'ctrl+alt+d' }}>
```

## Lifecycle

1. **Initialization**: When mounted, creates a new `DevtoolProbe` instance (unless `probe` prop is provided)
2. **Subscription**: Subscribes to probe events (frame stats, snapshots, selection changes)
3. **Ready State**: Sets `isReady` to `true` once the first snapshot is received
4. **Cleanup**: On unmount, unsubscribes from events and disposes the probe (unless externally provided)

## Related

- [useThreeLensProbe](./use-three-lens-probe.md) - Hook to access the probe instance
- [useSelectedObject](./use-selected-object.md) - Hook for selection state
- [ThreeLensCanvas](./three-lens-canvas.md) - R3F Canvas wrapper with built-in 3Lens integration
