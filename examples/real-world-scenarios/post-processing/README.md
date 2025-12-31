# Post-Processing Analyzer

A comprehensive post-processing effects showcase demonstrating 3Lens integration for analyzing and debugging render pipelines, effect chains, and GPU performance.

## Features

### Post-Processing Effects
- **Bloom**: HDR glow effect with configurable intensity and threshold
- **Depth of Field**: Bokeh blur with focus distance and aperture control
- **Vignette**: Screen edge darkening
- **Chromatic Aberration**: RGB channel separation
- **Film Grain**: Animated noise overlay
- **Color Grading**: Saturation, contrast, and brightness adjustments
- **SMAA**: Subpixel morphological anti-aliasing

### Debug Visualization
- **Final**: Full post-processing pipeline
- **Scene Only**: Bypass all effects
- **Depth**: Depth buffer visualization
- **Normals**: Surface normal visualization
- **Bloom Only**: Isolated bloom contribution
- **Compare**: Side-by-side comparison slider

### Presets
- **Cinematic**: Balanced film-like look
- **Retro**: Vintage film with grain and vignette
- **Dream**: Heavy bloom and blur for ethereal effect
- **Noir**: Desaturated high-contrast look
- **Vibrant**: Saturated and bright
- **Minimal**: Effects disabled for baseline

### Performance Monitoring
- Real-time FPS tracking
- Estimated GPU time per effect
- Active effect count
- Render target count
- Shader pass breakdown

## Getting Started

### Installation

```bash
cd examples/real-world-scenarios/post-processing
pnpm install
```

### Development

```bash
pnpm dev
```

Open http://localhost:3011 to view the example.

## Usage

### Effect Controls

Each effect can be toggled on/off with the switch next to its name. The estimated GPU cost is shown below each effect name:

| Effect | Est. GPU Time | Description |
|--------|--------------|-------------|
| **Bloom** | ~0.8ms | Glow around bright areas |
| **SSAO** | ~2.1ms | Ambient occlusion (placeholder) |
| **Depth of Field** | ~1.2ms | Focus blur effect |
| **Vignette** | ~0.1ms | Edge darkening |
| **Chromatic Aberration** | ~0.2ms | Color fringing |
| **Film Grain** | ~0.1ms | Noise overlay |
| **Color Grading** | ~0.2ms | Color adjustments |
| **SMAA** | ~0.3ms | Anti-aliasing |

### Parameter Controls

#### Bloom
| Parameter | Range | Description |
|-----------|-------|-------------|
| Intensity | 0 - 3 | Glow brightness |
| Threshold | 0 - 1 | Minimum brightness to bloom |

#### Depth of Field
| Parameter | Range | Description |
|-----------|-------|-------------|
| Focus Distance | 1 - 20 | Distance to focus plane |
| Aperture | f/0.5 - f/16 | Blur amount (lower = more blur) |

#### Vignette
| Parameter | Range | Description |
|-----------|-------|-------------|
| Darkness | 0 - 1 | Edge darkening intensity |

#### Chromatic Aberration
| Parameter | Range | Description |
|-----------|-------|-------------|
| Offset | 0 - 0.01 | RGB separation amount |

#### Film Grain
| Parameter | Range | Description |
|-----------|-------|-------------|
| Intensity | 0 - 0.5 | Noise visibility |

#### Color Grading
| Parameter | Range | Description |
|-----------|-------|-------------|
| Saturation | 0 - 2 | Color intensity |
| Contrast | 0.5 - 2 | Light/dark separation |
| Brightness | -0.5 - 0.5 | Overall brightness |

### Debug Views

| View | Description |
|------|-------------|
| **Final** | Full effect chain output |
| **Scene Only** | Raw render without effects |
| **Depth** | Depth buffer visualization |
| **Normals** | Surface normal colors |
| **Bloom Only** | Isolated bloom layer |
| **Compare** | Split-screen comparison |

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Toggle all effects on/off |
| `1` | Toggle Bloom |
| `2` | Toggle SSAO (disabled) |
| `3` | Toggle Depth of Field |
| `4` | Toggle Vignette |
| `5` | Toggle Chromatic Aberration |
| `6` | Toggle Film Grain |
| `7` | Toggle Color Grading |
| `8` | Toggle SMAA |
| `C` | Compare mode |
| `Ctrl+Shift+D` | Toggle 3Lens devtools |

## Scene Structure

```
PostProcessingScene
├── MainCamera
├── AmbientLight
├── SunLight (DirectionalLight + shadows)
├── RimLight
├── OrangeLight (PointLight)
├── GreenLight (PointLight)
├── OrangeLightSphere
├── GreenLightSphere
├── Ground
├── GridHelper
├── Pedestal
├── HeroSphere (reflective)
├── OrbitGroup
│   ├── OrbitCube_0 (red)
│   ├── OrbitCube_1 (green)
│   ├── OrbitCube_2 (blue)
│   ├── OrbitCube_3 (orange)
│   └── OrbitCube_4 (purple)
├── Pillar_0..5
├── PillarTop_0..5
└── TorusKnot
```

## Post-Processing Pipeline

The effect chain is processed in this order:

1. **Render Pass** - Scene rendering
2. **Bloom Pass** - HDR glow extraction and blur
3. **DoF Pass** - Circle of confusion and blur
4. **Vignette Pass** - Edge darkening
5. **Chromatic Pass** - Color channel separation
6. **Noise Pass** - Film grain overlay
7. **Color Grade Pass** - Saturation/contrast/brightness
8. **Tone Mapping Pass** - ACES filmic conversion
9. **SMAA Pass** - Anti-aliasing

## Technical Details

### postprocessing Library

This example uses the [postprocessing](https://github.com/pmndrs/postprocessing) library for efficient effect composition:

```typescript
import {
  EffectComposer,
  EffectPass,
  RenderPass,
  BloomEffect,
  VignetteEffect,
  // ... more effects
} from 'postprocessing';

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new EffectPass(camera, bloomEffect));
```

### Effect Configuration

```typescript
const bloomEffect = new BloomEffect({
  intensity: 1.0,
  luminanceThreshold: 0.8,
  luminanceSmoothing: 0.075,
  mipmapBlur: true,
});
```

### Dynamic Pipeline

Effects can be added/removed at runtime:

```typescript
function rebuildComposer() {
  while (composer.passes.length > 0) {
    composer.removePass(composer.passes[0]);
  }
  
  composer.addPass(renderPass);
  if (effects.bloom.enabled) composer.addPass(bloomPass);
  // ... add other enabled effects
}
```

## Performance Tips

### GPU Budget

Target post-processing time based on your frame budget:

| Target FPS | Total Budget | Suggested Post Budget |
|------------|--------------|----------------------|
| 60 FPS | 16.67ms | < 4ms |
| 30 FPS | 33.33ms | < 8ms |

### Effect Costs

Typical GPU costs (vary by resolution and hardware):

| Cost Level | Time | Examples |
|------------|------|----------|
| **Low** | < 0.3ms | Vignette, noise, color grading |
| **Medium** | 0.3-1ms | Bloom, chromatic aberration |
| **High** | 1-3ms | DoF, SSAO, motion blur |
| **Very High** | > 3ms | SSR, volumetrics |

### Optimization Strategies

1. **Resolution scaling**: Render effects at lower resolution
2. **Effect culling**: Disable effects based on quality settings
3. **Temporal techniques**: Spread work across frames
4. **Half-resolution**: Process bloom/DoF at half res

## 3Lens Integration

The post-processing analyzer integrates with 3Lens for:

- **Scene Graph**: View all scene objects and their properties
- **Render Targets**: Inspect intermediate buffers
- **Performance**: Monitor frame times and GPU usage
- **Materials**: Inspect effect shader properties

```typescript
const probe = createProbe({
  appName: 'Post-Processing Analyzer',
});

probe.observeRenderer(renderer);
probe.observeScene(scene);

const overlay = createOverlay(probe);
```

## Presets Reference

### Cinematic
Balanced film look with subtle bloom and vignette.
- Bloom: 1.0 intensity, 0.8 threshold
- Vignette: 0.5 darkness
- Color: +0.1 saturation, +0.1 contrast

### Retro
Vintage film aesthetic with grain and aberration.
- Bloom: 0.5 intensity
- Chromatic: 0.005 offset
- Noise: 0.25 intensity
- Color: -0.3 saturation, +0.2 contrast

### Dream
Ethereal soft look with heavy bloom and blur.
- Bloom: 2.0 intensity, 0.4 threshold
- DoF: f/1.4 aperture
- Color: +0.2 saturation, -0.1 contrast

### Noir
Classic black and white high contrast.
- Vignette: 0.8 darkness
- Noise: 0.2 intensity
- Color: -1.0 saturation, +0.3 contrast

### Vibrant
Saturated and punchy look.
- Bloom: 1.5 intensity
- Color: +0.4 saturation, +0.15 contrast

### Minimal
Baseline without effects (SMAA only).

## Dependencies

- Three.js ^0.160.0
- postprocessing ^6.34.1
- @3lens/core (workspace)
- @3lens/overlay (workspace)
