# Audio Visualization Scene

An interactive audio visualization example showcasing real-time 3D graphics synchronized to audio input using the Web Audio API and 3Lens devtools.

## Features

### Audio Sources
- **Microphone Input**: Real-time visualization from your microphone
- **File Upload**: Drag and drop or browse for audio files (MP3, WAV, etc.)
- **Demo Track**: Generated procedural music for quick testing

### Visualizers
1. **Bars**: Circular arrangement of frequency bars that pulse with the music
2. **Wave**: Multi-layered waveform display showing time-domain audio data
3. **Circle**: Concentric rings that deform based on frequency spectrum
4. **Particles**: 2000+ particles that expand and contract with audio energy
5. **Terrain**: Scrolling 3D terrain generated from frequency history
6. **Sphere**: Icosahedron mesh that morphs based on audio frequencies

### Audio Analysis
- **FFT Analysis**: Configurable FFT size (32 to 32768 bins)
- **Frequency Bands**: Real-time bass, mid, and high frequency tracking
- **Beat Detection**: Automatic beat detection with sensitivity control
- **BPM Estimation**: Estimates tempo from beat patterns
- **Smoothing**: Adjustable temporal smoothing for analysis

### Visual Features
- **6 Color Schemes**: Neon, Fire, Ocean, Forest, Sunset, Mono
- **Auto-rotating Camera**: Camera orbits around visualization
- **Bloom Effect**: Configurable tone mapping exposure
- **Beat Pulses**: Visual elements react to detected beats
- **Fog**: Atmospheric depth effect

## Setup

```bash
cd examples/real-world-scenarios/audio-visualization
pnpm install
pnpm dev
```

Open http://localhost:3015 in your browser.

## Usage

### Getting Started
1. Click "Use Microphone" or "Play Demo Track" on the splash screen
2. Alternatively, upload an audio file using the file drop zone
3. Press play to start the visualization

### Controls
| Control | Description |
|---------|-------------|
| Play/Pause | Start or pause audio playback |
| Volume Slider | Adjust audio volume |
| Progress Bar | Seek through the audio track |
| Visualizer Grid | Switch between visualization modes |
| Color Presets | Change the color scheme |
| Sensitivity | Adjust beat detection sensitivity |
| Smoothing | Control frequency analysis smoothing |
| FFT Size | Change frequency resolution |

### Keyboard Shortcuts
| Key | Action |
|-----|--------|
| `Space` | Play/Pause |
| `M` | Toggle mute |
| `1-6` | Switch visualizer mode |
| `R` | Toggle camera rotation |
| `B` | Toggle bloom effect |
| `D` | Toggle 3Lens devtools |

## Technical Details

### Web Audio API
```typescript
// Audio context and analyzer setup
const audioContext = new AudioContext();
const analyser = audioContext.createAnalyser();
analyser.fftSize = 2048;
analyser.smoothingTimeConstant = 0.8;

// Get frequency data
const frequencyData = new Uint8Array(analyser.frequencyBinCount);
analyser.getByteFrequencyData(frequencyData);

// Get time domain data
const timeDomainData = new Uint8Array(analyser.fftSize);
analyser.getByteTimeDomainData(timeDomainData);
```

### Frequency Band Extraction
```typescript
// Bass: 0-250Hz (first ~10% of bins)
// Mid: 250-4000Hz (~10-50% of bins)
// High: 4000-20000Hz (~50-100% of bins)
getFrequencyBands(): { bass: number; mid: number; high: number } {
  const data = this.getFrequencyData();
  const len = data.length;
  
  const bassEnd = Math.floor(len * 0.1);
  const midEnd = Math.floor(len * 0.5);
  
  // Calculate averages for each band...
}
```

### Beat Detection
```typescript
detectBeat(sensitivity: number): boolean {
  const energy = bands.bass * 0.6 + bands.mid * 0.3 + bands.high * 0.1;
  
  // Compare to rolling average
  const avgEnergy = this.beatHistory.reduce((a, b) => a + b, 0) / this.beatHistory.length;
  
  return energy > avgEnergy * threshold * sensitivity;
}
```

### Visualizer Interface
```typescript
interface Visualizer {
  init(scene: THREE.Scene): void;
  update(
    frequencyData: Uint8Array,
    timeDomainData: Uint8Array,
    bands: { bass: number; mid: number; high: number },
    beat: boolean,
    colors: { primary: Color; secondary: Color; accent: Color }
  ): void;
  dispose(): void;
}
```

## 3Lens Integration

The example demonstrates 3Lens devtools integration for debugging audio-reactive 3D scenes:

```typescript
import { createProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';

const probe = createProbe();
probe.attach({ scene, renderer });

const overlay = createOverlay();
overlay.attach(probe);

// In animation loop
function animate() {
  probe.update();
  renderer.render(scene, camera);
}
```

### What to Inspect
- **Visualizer meshes**: Geometry, materials, and transformations
- **Particle systems**: Point counts and buffer attributes
- **Performance**: Frame rates during intensive visualizations
- **Materials**: Emissive properties and color changes
- **Scene hierarchy**: Understanding visualizer structure

## Color Schemes

| Scheme | Primary | Secondary | Accent |
|--------|---------|-----------|--------|
| Neon | #8b5cf6 | #06b6d4 | #ec4899 |
| Fire | #ef4444 | #f59e0b | #fbbf24 |
| Ocean | #0ea5e9 | #22d3d1 | #67e8f9 |
| Forest | #22c55e | #84cc16 | #a3e635 |
| Sunset | #f43f5e | #fb923c | #fcd34d |
| Mono | #ffffff | #94a3b8 | #64748b |

## Performance Tips

1. **Lower FFT Size**: Reduce FFT size for better performance (2048 is a good balance)
2. **Disable Beat Detection**: Turn off if not needed
3. **Simpler Visualizers**: Wave and Circle are lighter than Particles
4. **Reduce Smoothing**: Lower smoothing values require less computation

## Browser Compatibility

- Chrome 66+
- Firefox 76+
- Safari 14.1+
- Edge 79+

**Note**: Microphone access requires HTTPS or localhost.

## Supported Audio Formats

- MP3 (.mp3)
- WAV (.wav)
- OGG (.ogg)
- AAC (.aac, .m4a)
- FLAC (.flac)
- WebM Audio (.webm)

## License

MIT
