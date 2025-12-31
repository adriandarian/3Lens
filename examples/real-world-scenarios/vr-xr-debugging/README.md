# VR/XR Debugging Example

A comprehensive WebXR debugging showcase demonstrating 3Lens integration for inspecting VR/AR sessions, controllers, hand tracking, and XR-specific performance metrics.

## Features

### WebXR Support Detection
- **VR Support**: Checks for `immersive-vr` session availability
- **AR Support**: Checks for `immersive-ar` session availability
- **Session Management**: Start/stop VR and AR sessions

### Controller Debugging
- **Controller Models**: Automatic controller model loading via XRControllerModelFactory
- **Hand Tracking**: Hand mesh visualization via XRHandModelFactory
- **Pointer Rays**: Visual ray casting from controllers
- **Real-time Data**: Position, rotation, and button states

### Debug Visualization
- **Floor Grid**: Reference grid for spatial awareness
- **World Axes**: XYZ axis helper
- **Play Bounds**: Guardian/play area boundary visualization
- **View Frustum**: Camera frustum visualization

### XR Performance Metrics
- **Frame Rate**: Current and target Hz
- **Frame Time**: Per-frame timing
- **IPD**: Inter-pupillary distance
- **Resolution**: Per-eye render resolution
- **Head Pose**: Position and rotation tracking

## Getting Started

### Installation

```bash
cd examples/real-world-scenarios/vr-xr-debugging
pnpm install
```

### Development

```bash
pnpm dev
```

Open http://localhost:3012 to view the example.

### Testing Without VR Hardware

Install a WebXR emulator browser extension:
- [WebXR API Emulator](https://chrome.google.com/webstore/detail/webxr-api-emulator/mjddjgeghkdijejnciaefnkjmkafnnje) (Chrome)
- [WebXR API Emulator](https://addons.mozilla.org/en-US/firefox/addon/webxr-api-emulator/) (Firefox)

The emulator allows you to:
- Simulate VR headset and controllers
- Control head and hand positions
- Test controller inputs
- Debug XR applications without hardware

## Usage

### Session Controls

| Button | Action |
|--------|--------|
| **Enter VR** | Start immersive-vr session |
| **Enter AR** | Start immersive-ar session |
| **Exit XR** | End current XR session |

### Debug Visualization Toggles

| Toggle | Description |
|--------|-------------|
| **Controllers** | Show/hide controller models |
| **Pointer Rays** | Show/hide pointing rays |
| **Hand Models** | Show/hide hand tracking meshes |
| **Play Bounds** | Show/hide play area boundary |
| **Floor Grid** | Show/hide reference grid |
| **World Axes** | Show/hide XYZ axis helper |
| **View Frustum** | Show/hide camera frustum |
| **Perf Overlay** | Show/hide in-VR performance stats |

### Reference Space Types

| Type | Description | Use Case |
|------|-------------|----------|
| **local-floor** | Floor-level origin, no bounds | Recommended default |
| **local** | Head-level origin | Seated experiences |
| **bounded-floor** | Floor with boundaries | Room-scale VR |
| **unbounded** | World-scale tracking | AR experiences |

## Scene Structure

```
XRScene
├── MainCamera
├── AmbientLight
├── DirectionalLight
├── DebugHelpers
│   ├── FloorGrid
│   ├── WorldAxes
│   └── PlayBounds
├── Floor
├── InteractiveObjects
│   ├── Pedestal
│   ├── FloatingCrystal
│   └── Grabbable_0..3
├── InfoPanel_Welcome
├── InfoPanel_Use
├── InfoPanel_Check
└── Controllers
    ├── Controller_Left
    ├── Controller_Right
    ├── ControllerGrip_Left
    ├── ControllerGrip_Right
    ├── Hand_Left
    └── Hand_Right
```

## Technical Details

### WebXR Setup

```typescript
// Enable XR on renderer
renderer.xr.enabled = true;

// Check support
const vrSupported = await navigator.xr?.isSessionSupported('immersive-vr');
const arSupported = await navigator.xr?.isSessionSupported('immersive-ar');

// Start session
const session = await navigator.xr.requestSession('immersive-vr', {
  optionalFeatures: ['local-floor', 'hand-tracking', 'layers'],
});

renderer.xr.setReferenceSpaceType('local-floor');
await renderer.xr.setSession(session);
```

### Controller Setup

```typescript
import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';
import { XRHandModelFactory } from 'three/addons/webxr/XRHandModelFactory.js';

const controllerModelFactory = new XRControllerModelFactory();
const handModelFactory = new XRHandModelFactory();

// Get controllers
const controller1 = renderer.xr.getController(0);
const controller2 = renderer.xr.getController(1);

// Add controller models
const grip1 = renderer.xr.getControllerGrip(0);
grip1.add(controllerModelFactory.createControllerModel(grip1));

// Add hand tracking
const hand1 = renderer.xr.getHand(0);
hand1.add(handModelFactory.createHandModel(hand1, 'mesh'));
```

### Controller Events

```typescript
controller.addEventListener('connected', (event) => {
  console.log('Controller connected:', event.data);
});

controller.addEventListener('selectstart', () => {
  // Trigger pressed
});

controller.addEventListener('selectend', () => {
  // Trigger released
});

controller.addEventListener('squeezestart', () => {
  // Grip pressed
});
```

### Animation Loop

```typescript
// Use XR animation loop instead of requestAnimationFrame
renderer.setAnimationLoop((time, frame) => {
  // frame is XRFrame when in XR session
  if (frame) {
    const pose = frame.getViewerPose(referenceSpace);
    // Access pose data
  }
  
  renderer.render(scene, camera);
});
```

## XR Performance Guidelines

### Target Frame Rates

| Device | Target FPS | Frame Budget |
|--------|-----------|--------------|
| Quest 2/3 | 72/90/120 Hz | 13.9/11.1/8.3 ms |
| PSVR2 | 90/120 Hz | 11.1/8.3 ms |
| Valve Index | 90/120/144 Hz | 11.1/8.3/6.9 ms |
| HoloLens 2 | 60 Hz | 16.7 ms |

### Optimization Tips

1. **Draw Calls**: Keep under 100 for mobile VR
2. **Triangle Count**: Under 100K for mobile, 1M+ for PC VR
3. **Texture Memory**: Under 1GB for mobile
4. **Single Pass Stereo**: Use when available
5. **Foveated Rendering**: Enable for supported devices

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Judder | Missed frames | Reduce scene complexity |
| Drift | IMU calibration | Recenter view |
| Controller lag | Input prediction | Check tracking quality |
| Double vision | IPD mismatch | Adjust headset IPD |

## 3Lens Integration

The example integrates with 3Lens for:

- **Scene Graph**: View all XR objects including controllers
- **Performance**: Monitor frame times and GPU usage
- **Materials**: Inspect controller and hand model materials
- **Transform Gizmo**: Manipulate objects in desktop mode

```typescript
const probe = createProbe({
  appName: 'VR/XR Debugging Demo',
});

probe.observeRenderer(renderer);
probe.observeScene(scene);

const overlay = createOverlay(probe);
```

## WebXR Reference Spaces

### local-floor
- Origin at floor level
- Tracks head position relative to starting point
- Best for standing/room-scale experiences

### local
- Origin at head level at session start
- No floor reference
- Best for seated experiences

### bounded-floor
- Includes boundary polygon
- Tracks within defined play area
- Guardian/chaperone integration

### unbounded
- World-scale tracking
- Used for AR experiences
- May drift over large distances

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Ctrl+Shift+D` | Toggle 3Lens devtools |

## Browser Requirements

- Chrome 79+ with WebXR flag or hardware
- Firefox Reality / Wolvic for VR browsing
- Safari 15.4+ for WebXR (limited)
- Edge 79+ with WebXR support

### Required Features

- `navigator.xr` API
- `XRSession.requestReferenceSpace()`
- `XRFrame.getViewerPose()`
- Optional: `XRHand` for hand tracking

## Dependencies

- Three.js ^0.160.0
- @3lens/core (workspace)
- @3lens/overlay (workspace)

## Recommended Extensions

- [WebXR API Emulator](https://chrome.google.com/webstore/detail/webxr-api-emulator/mjddjgeghkdijejnciaefnkjmkafnnje)
- [Immersive Web Emulator](https://chrome.google.com/webstore/detail/immersive-web-emulator/cgffilbpcibhmcfbgggfhfolhkfbhmik)

## Troubleshooting

### "WebXR not available"
- Check browser support
- Install WebXR emulator extension
- Ensure HTTPS (required for some devices)

### Controllers not showing
- Check controller batteries
- Verify pairing with headset
- Try reconnecting controllers

### Poor tracking
- Ensure adequate lighting
- Clear tracking camera lenses
- Check for reflective surfaces
