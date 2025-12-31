# Multi-Scene Management Example

This example demonstrates managing multiple Three.js scenes simultaneously with 3Lens devtool integration. It showcases scene switching, cross-scene communication, object transfer, and coordinated debugging across multiple rendering contexts.

## Features

### Multi-Scene Architecture
- **Multiple Independent Scenes**: Four default scenes with different content types
- **Per-Scene Rendering**: Each scene has its own renderer, camera, and controls
- **Shared Resources**: Geometries and materials can be shared across scenes
- **Scene Lifecycle**: Add, remove, pause, and reset scenes dynamically

### Layout System
- **2x2 Grid**: Default quad-view showing all four scenes
- **2x1 Horizontal**: Two scenes side by side
- **1-2 Split**: Main view with two smaller views
- **3x1 Row**: Three scenes in a row
- **Single View**: Focus on one scene
- **Tabbed Mode**: Browser-style tabs for scene switching

### Cross-Scene Features
- **Object Transfer**: Move objects between scenes
- **Camera Synchronization**: Optional camera sync across all scenes
- **Message System**: Inter-scene communication with message log
- **Auto-Pause**: Automatically pause hidden scenes for performance

### Scene Types
1. **Geometry Lab** 🔷 - Grid of primitive shapes with hover animations
2. **Particle Field** ✨ - Multiple particle systems with central emitter
3. **Animation Stage** 🎬 - Orbiting spheres and rotating torus knot
4. **Environment** 🌍 - Terrain, trees, water, and sky dome

## Installation

```bash
cd examples/real-world-scenarios/multi-scene-management
pnpm install
```

## Running the Example

```bash
pnpm dev
```

Opens at [http://localhost:3013](http://localhost:3013)

## Controls

### Mouse
- **Click viewport** - Select scene
- **Double-click viewport** - Toggle fullscreen
- **Orbit controls** - Rotate, pan, zoom within each scene

### Keyboard Shortcuts
| Key | Action |
|-----|--------|
| `1-4` | Select scene by index |
| `F` | Toggle fullscreen for selected scene |
| `Tab` | Cycle through scenes |
| `Space` | Pause/resume selected scene |
| `R` | Reset all scenes |
| `D` | Toggle 3Lens overlay |

## Usage Examples

### Adding a New Scene
```typescript
// Click "+ Add Scene" button or programmatically:
sceneManager.addNewScene();
```

### Transferring Objects
1. Select source scene in "Object Transfer" panel
2. Select target scene
3. Choose object to transfer
4. Click "Transfer Object"

Objects marked as `transferable` in their userData can be moved between scenes.

### Enabling Camera Sync
Toggle "Sync cameras" to make all scenes follow the active scene's camera position.

### Using Tab Mode
Select the "Tabs" layout to switch between scenes using browser-style tabs - ideal for focusing on one scene at a time.

## Architecture

### Scene Manager
```typescript
class MultiSceneManager {
  private scenes: Map<string, ManagedScene>;
  private probe: DevtoolProbe;
  
  // Scene lifecycle
  createScene(config: SceneConfig): ManagedScene;
  removeScene(sceneId: string): void;
  selectScene(sceneId: string): void;
  
  // Cross-scene features
  sendMessage(from: string, to: string, type: string, data: any): void;
  handleObjectTransfer(): void;
  syncCameraToAll(sourceCamera: THREE.Camera): void;
}
```

### ManagedScene Structure
```typescript
interface ManagedScene {
  config: SceneConfig;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  container: HTMLElement;
  active: boolean;
  paused: boolean;
  objects: THREE.Object3D[];
  clock: THREE.Clock;
  stats: { objects: number; triangles: number; drawCalls: number };
}
```

## 3Lens Integration

Each scene and renderer is registered with 3Lens:

```typescript
this.probe = createProbe({
  name: 'Multi-Scene Manager',
  captureStackTraces: false,
});

createOverlay(this.probe, {
  position: 'bottom-right',
  defaultOpen: true,
});

// Register each scene
this.probe.observeScene(scene);
this.probe.observeRenderer(renderer);
```

3Lens provides:
- Combined view of all scene hierarchies
- Per-scene resource tracking
- Cross-scene object selection
- Performance metrics per renderer
- Memory tracking across all scenes

## Performance Considerations

### Auto-Pause Hidden Scenes
When enabled, scenes not currently visible (in single/tab mode) are automatically paused to save GPU resources.

### Shared Resources
Geometries and materials are pooled and reused across scenes:
```typescript
const boxGeometry = this.getSharedGeometry('box', 
  () => new THREE.BoxGeometry(1, 1, 1)
);
```

### Efficient Rendering
- Each scene maintains its own render loop timing
- Delta time is calculated per-scene for smooth animations
- Pixel ratio is capped at 2 to prevent performance issues on high-DPI displays

## Scene Communication Protocol

Scenes can send messages to each other:

```typescript
// Send to specific scene
sendMessage('geometry', 'particles', 'camera_sync', { position: camera.position });

// Broadcast to all scenes
sendMessage('system', 'all', 'reset', { timestamp: Date.now() });
```

Message types:
- `object_transferred` - Object moved between scenes
- `camera_sync` - Camera position update
- `paused` / `resumed` - Scene state change
- `reset` - Scene reset notification

## Customization

### Adding Custom Scene Types
```typescript
const customConfig: SceneConfig = {
  id: 'custom',
  name: 'Custom Scene',
  icon: '🎨',
  color: '#ff6b6b',
  type: 'geometry', // Use existing type or add new
};

manager.createScene(customConfig);
```

### Custom Layouts
Modify the CSS grid in `setLayout()` for custom viewport arrangements.

## Related Examples

- [Particle System](../particle-system) - Deep dive into particle debugging
- [Physics Inspector](../physics-inspector) - Physics scene debugging
- [Post-Processing](../post-processing) - Effect chain analysis
- [VR/XR Debugging](../vr-xr-debugging) - WebXR session management

## Troubleshooting

### Scenes Not Rendering
- Check if scene is paused (status indicator turns gray)
- Verify viewport has non-zero dimensions
- Check browser console for WebGL errors

### Object Transfer Fails
- Ensure object has `userData.transferable = true`
- Check that source and target scenes are different
- Verify object exists in source scene

### Camera Sync Lag
- Camera sync happens on OrbitControls 'change' event
- Reduce scene complexity for smoother sync
- Consider disabling sync for performance-intensive scenes
