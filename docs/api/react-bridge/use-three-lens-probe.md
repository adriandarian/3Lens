# useThreeLensProbe

The `useThreeLensProbe` hook provides direct access to the 3Lens `DevtoolProbe` instance for advanced operations.

## Import

```tsx
import { useThreeLensProbe, useThreeLensProbeOptional } from '@3lens/react-bridge';
```

## Usage

### Basic Usage

```tsx
import { useThreeLensProbe } from '@3lens/react-bridge';

function SnapshotButton() {
  const probe = useThreeLensProbe();

  const handleClick = () => {
    const snapshot = probe.takeSnapshot();
    console.log('Scene has', snapshot.root.children.length, 'top-level objects');
  };

  return <button onClick={handleClick}>Take Snapshot</button>;
}
```

### Safe Usage with Optional Hook

```tsx
import { useThreeLensProbeOptional } from '@3lens/react-bridge';

function DebugInfo() {
  const probe = useThreeLensProbeOptional();

  // Safe to use even outside ThreeLensProvider
  if (!probe) {
    return null;
  }

  return (
    <button onClick={() => probe.takeSnapshot()}>
      Debug
    </button>
  );
}
```

## Signatures

### useThreeLensProbe

```tsx
function useThreeLensProbe(): DevtoolProbe
```

Returns the probe instance. **Throws an error** if:
- Used outside of `ThreeLensProvider`
- The probe has not been initialized yet

### useThreeLensProbeOptional

```tsx
function useThreeLensProbeOptional(): DevtoolProbe | null
```

Returns the probe instance or `null` if not available. **Never throws**.

## Return Value

Both hooks return a `DevtoolProbe` instance (or `null` for the optional variant) with these key methods:

| Method | Description |
|--------|-------------|
| `observeRenderer(renderer)` | Start observing a WebGL/WebGPU renderer |
| `observeScene(scene)` | Start observing a Three.js scene |
| `takeSnapshot()` | Take a snapshot of the current scene state |
| `selectObjectByUuid(uuid)` | Select an object by its UUID |
| `clearSelection()` | Clear the current selection |
| `setInspectModeEnabled(enabled)` | Enable/disable click-to-inspect mode |
| `dispose()` | Clean up and release resources |

## Examples

### Manual Scene Observation

```tsx
function SceneSetup() {
  const probe = useThreeLensProbe();
  const { scene, gl } = useThree();

  useEffect(() => {
    probe.observeRenderer(gl);
    probe.observeScene(scene);
  }, [probe, scene, gl]);

  return null;
}
```

### Export Scene Data

```tsx
function ExportButton() {
  const probe = useThreeLensProbe();

  const exportScene = () => {
    const snapshot = probe.takeSnapshot();
    const data = JSON.stringify(snapshot, null, 2);
    
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scene-snapshot.json';
    a.click();
  };

  return <button onClick={exportScene}>Export Scene</button>;
}
```

### Toggle Inspect Mode

```tsx
function InspectModeToggle() {
  const probe = useThreeLensProbe();
  const [inspectMode, setInspectMode] = useState(false);

  const toggle = () => {
    const newState = !inspectMode;
    probe.setInspectModeEnabled(newState);
    setInspectMode(newState);
  };

  return (
    <button onClick={toggle}>
      {inspectMode ? 'Disable' : 'Enable'} Inspect Mode
    </button>
  );
}
```

### Subscribe to Events

```tsx
function EventLogger() {
  const probe = useThreeLensProbe();

  useEffect(() => {
    const unsubscribe = probe.onFrameStats((stats) => {
      if (stats.fps < 30) {
        console.warn('Low FPS detected:', stats.fps);
      }
    });

    return unsubscribe;
  }, [probe]);

  return null;
}
```

### Conditional Rendering Based on Availability

```tsx
function DevTools() {
  const probe = useThreeLensProbeOptional();

  // Only show dev tools if 3Lens is available
  if (!probe) {
    return null;
  }

  return (
    <div className="dev-tools">
      <button onClick={() => probe.takeSnapshot()}>Snapshot</button>
      <button onClick={() => probe.clearSelection()}>Clear Selection</button>
    </div>
  );
}
```

## Error Handling

### useThreeLensProbe Errors

The hook throws descriptive errors:

```tsx
// Error: "useThreeLensContext must be used within a ThreeLensProvider..."
function BadComponent() {
  const probe = useThreeLensProbe(); // Throws if outside provider
}

// Error: "Probe not initialized. Wait for isReady to be true."
function TooEarlyComponent() {
  const probe = useThreeLensProbe(); // Throws if probe not ready
}
```

### Safe Pattern with isReady

```tsx
function SafeComponent() {
  const { probe, isReady } = useThreeLensContext();

  if (!isReady || !probe) {
    return <div>Loading devtools...</div>;
  }

  return <ProbeControls probe={probe} />;
}
```

## When to Use

| Use Case | Recommended Hook |
|----------|------------------|
| Core app components that require the probe | `useThreeLensProbe` |
| Optional debug components | `useThreeLensProbeOptional` |
| Library components that may be used anywhere | `useThreeLensProbeOptional` |
| Test utilities | `useThreeLensProbeOptional` |

## Related

- [ThreeLensProvider](./three-lens-provider.md) - Required context provider
- [DevtoolProbe](/api/core/devtool-probe) - Full probe API reference
- [useSelectedObject](./use-selected-object.md) - For selection management
- [useMetric](./use-metric.md) - For accessing frame stats
