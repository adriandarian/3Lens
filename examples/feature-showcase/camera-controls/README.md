# Camera Controls Showcase

Demonstrates 3Lens DevTools camera control features including instant focus, fly-to animations with easing, camera switching, and real-time camera info display.

## Features Demonstrated

### Focus on Object (Instant)
- Instantly moves camera to frame an object
- Automatic distance calculation based on object size
- Configurable padding around the object

### Fly-To Animation
- Smooth animated camera transitions
- Multiple easing options: linear, easeOut, easeInOut
- Configurable duration and padding
- Callback on animation complete

### Camera Switching
- List all cameras in the scene
- Switch between multiple cameras
- Support for PerspectiveCamera and OrthographicCamera

### Camera Info Display
- Real-time camera position tracking
- FOV, aspect ratio, near/far display
- Camera type identification

### Home Position
- Save camera "home" position on initialization
- Return to home instantly or with animation

## Running the Example

```bash
# From the repository root
cd examples/feature-showcase/camera-controls
pnpm install
pnpm dev
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `F` | Focus on selected object (instant) |
| `Shift+F` | Fly to selected object (animated) |
| `H` | Go to home position (instant) |
| `Shift+H` | Fly to home position (animated) |
| `Esc` | Stop current animation |
| `C` | Cycle to next camera |

## Key Code Concepts

### Initializing Camera Controller

```typescript
import * as THREE from 'three';
import { DevtoolProbe } from '@3lens/core';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const probe = new DevtoolProbe();
probe.observeRenderer(renderer);
probe.observeScene(scene);

// Initialize with camera, THREE namespace, and optional orbit target
probe.initializeCameraController(camera, THREE, {
  x: controls.target.x,
  y: controls.target.y,
  z: controls.target.z
});
```

### Focus on Object (Instant)

```typescript
// Focus on a specific object
probe.focusOnObject(myObject, padding);

// Focus on the currently selected object
if (probe.focusOnSelected(1.5)) {
  console.log('Focused on selected object');
}
```

### Fly-To Animation

```typescript
import type { FlyToOptions } from '@3lens/core';

const options: FlyToOptions = {
  duration: 800,           // Animation duration in ms
  easing: 'easeInOut',     // 'linear' | 'easeOut' | 'easeInOut'
  padding: 1.5,            // Padding multiplier around object
  onComplete: () => {
    console.log('Animation finished');
  }
};

// Fly to a specific object
probe.flyToObject(myObject, options);

// Fly to the currently selected object
probe.flyToSelected(options);

// Fly back to home position
probe.flyHome(options);
```

### Camera Switching

```typescript
// Get all available cameras
const cameras = probe.getAvailableCameras();

cameras.forEach((cam, index) => {
  console.log(`${index}: ${cam.name} (${cam.type})`);
});

// Switch to a camera by index
probe.switchToCamera(2);

// Get the current camera index
const activeIndex = probe.getActiveCameraIndex();
```

### Camera Info

```typescript
// Get current camera info
const info = probe.getCameraInfo();

if (info) {
  console.log('Camera:', info.name);
  console.log('Type:', info.type);
  console.log('Position:', info.position);
  console.log('FOV:', info.fov);
  console.log('Near/Far:', info.near, info.far);
}

// Subscribe to camera changes
probe.onCameraChanged((camera, info) => {
  console.log('Camera changed to:', info.name);
  updateUI(info);
});
```

### Animation Control

```typescript
// Check if animation is running
if (probe.isCameraAnimating()) {
  console.log('Camera is animating');
}

// Stop any running animation
probe.stopCameraAnimation();

// Subscribe to animation complete
probe.onAnimationComplete(() => {
  console.log('Animation finished');
});
```

### Home Position Management

```typescript
// Go to home position instantly
probe.goHome();

// Fly to home position with animation
probe.flyHome({
  duration: 1000,
  easing: 'easeOut'
});

// Update orbit controls target after going home
const target = probe.getOrbitTarget();
if (target) {
  controls.target.set(target.x, target.y, target.z);
}
```

## API Reference

### `initializeCameraController(camera, three, orbitTarget?)`

Initialize the camera controller for focus/fly operations.

```typescript
function initializeCameraController(
  camera: THREE.Camera,
  three: typeof import('three'),
  orbitTarget?: { x: number; y: number; z: number }
): void
```

### `focusOnObject(object, padding?)`

Instantly focus the camera on an object.

```typescript
function focusOnObject(object: THREE.Object3D, padding?: number): void
```

### `flyToObject(object, options?)`

Animate the camera to focus on an object.

```typescript
function flyToObject(object: THREE.Object3D, options?: FlyToOptions): void
```

### `FlyToOptions`

```typescript
interface FlyToOptions {
  duration?: number;    // Default: 800ms
  easing?: 'linear' | 'easeInOut' | 'easeOut';  // Default: 'easeInOut'
  padding?: number;     // Default: 1.5
  onComplete?: () => void;
}
```

### `CameraInfo`

```typescript
interface CameraInfo {
  uuid: string;
  name: string;
  type: 'PerspectiveCamera' | 'OrthographicCamera' | string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  fov?: number;
  aspect?: number;
  near: number;
  far: number;
  zoom: number;
  // Orthographic-specific
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
}
```

## Integration with OrbitControls

When using OrbitControls, sync the orbit target with the camera controller:

```typescript
// During animation, update OrbitControls target
probe.onAnimationComplete(() => {
  const target = probe.getOrbitTarget();
  if (target) {
    controls.target.set(target.x, target.y, target.z);
  }
});

// When not animating, sync camera controller from OrbitControls
if (!probe.isCameraAnimating()) {
  probe.setOrbitTarget({
    x: controls.target.x,
    y: controls.target.y,
    z: controls.target.z
  });
}
```

## Scene Setup

The example includes:
- **Main Camera**: Initial perspective camera with OrbitControls
- **Top View Camera**: Looking straight down
- **Side View Camera**: Looking from the side
- **Close-up Camera**: Narrow FOV for detail view
- **Orthographic Camera**: Parallel projection view

Objects to focus on:
- Red Cube
- Blue Sphere
- Green Torus
- Yellow Cone
- Purple Torus Knot
- Cyan Cylinder

## Related Documentation

- [Camera Controls Progress](../../../docs/PROGRESS.md#camera-controls)
- [Transform Gizmo Example](../transform-gizmo)
