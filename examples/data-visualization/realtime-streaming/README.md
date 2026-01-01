# Real-time Data Streaming Example

A comprehensive real-time data streaming visualization example demonstrating live data feeds, buffer management, and performance monitoring with 3Lens integration.

## Features

### Data Sources

1. **Stock Ticker** 📈
   - Simulated market data with Brownian motion
   - Drift and volatility modeling
   - Multiple ticker symbols (AAPL, GOOGL, MSFT, etc.)

2. **IoT Sensors** 🌡️
   - Temperature, humidity, pressure sensors
   - Smooth sine wave patterns with noise
   - Multiple sensor channels

3. **Network Traffic** 🌐
   - HTTP, WebSocket, TCP/UDP monitoring
   - Bursty traffic patterns
   - Baseline with spike simulation

4. **Audio Waves** 🎵
   - Frequency band visualization
   - Amplitude with decay effects
   - Bass to treble spectrum

### Visualization Modes

| Mode | Description |
|------|-------------|
| **Line Chart** | Real-time scrolling line graphs for each channel |
| **Bar Graph** | Dynamic bar heights reflecting data values |
| **Scatter Plot** | Point cloud with per-channel coloring |
| **3D Surface** | Height-mapped surface mesh |
| **Particles** | Flow-based particle system driven by data |

### Stream Controls

- **Update Rate**: 1-120 Hz configurable refresh rate
- **Buffer Size**: 100-2000 data points history
- **Data Channels**: 1-8 simultaneous data streams
- **Pause/Resume**: Control data flow
- **Clear**: Reset all buffers and statistics

### Performance Metrics

- **Throughput**: Messages per second
- **Latency**: End-to-end processing delay
- **Buffer Status**: Visual fill indicator
- **CPU Usage**: Processing load estimate
- **Memory**: Total bytes received
- **Dropped Frames**: Data loss tracking
- **FPS**: Rendering performance

## 3Lens Integration

This example demonstrates streaming data entity tracking:

```typescript
import { createProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';

// Initialize probe
const probe = createProbe({ appName: 'Realtime-Streaming' });
createOverlay({ probe, theme: 'dark' });

// Register streaming scene
probe.registerLogicalEntity({
  id: 'streaming-scene',
  name: 'Real-time Data Stream',
  type: 'scene',
  object3D: scene,
  metadata: {
    source: currentSource,
    vizMode: currentVizMode,
    bufferSize,
    updateRate
  }
});

// Register visualization
probe.registerLogicalEntity({
  id: 'visualization',
  name: 'Line Visualization',
  type: 'visualization',
  object3D: vizGroup,
  metadata: {
    mode: currentVizMode,
    channels: numChannels,
    bufferSize
  }
});

// Register individual channels
probe.registerLogicalEntity({
  id: `line-channel-${i}`,
  name: `Line: ${channel.name}`,
  type: 'data-channel',
  object3D: line,
  metadata: {
    channel: channel.name,
    color: `#${channel.color.getHexString()}`
  }
});

// Update metadata on changes
probe.updateLogicalEntity('streaming-scene', {
  metadata: { source: newSource }
});

// Capture frame on clear
probe.captureFrame();
```

## Running the Example

```bash
# Navigate to example directory
cd examples/data-visualization/realtime-streaming

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The example runs at `http://localhost:3027`.

## Architecture

### Data Pipeline

```
┌──────────────┐    ┌───────────────┐    ┌────────────────┐
│ Data Source  │───►│ Data Processor │───►│ Ring Buffer    │
│ (Generator)  │    │ (Timestamping) │    │ (Per Channel)  │
└──────────────┘    └───────────────┘    └────────┬───────┘
                                                   │
┌──────────────┐    ┌───────────────┐    ┌────────▼───────┐
│  3D Scene    │◄───│ Visualization │◄───│ Data Channels  │
│  (Three.js)  │    │   Builder     │    │ (Normalized)   │
└──────────────┘    └───────────────┘    └────────────────┘
```

### Data Generation

Each source type uses different algorithms:

- **Stock**: `value = prev + drift + volatility * random`
- **Sensor**: `value = base_sine + noise`
- **Network**: `value = baseline + burst_probability * spike`
- **Audio**: `value = amplitude * decay * random`

### Buffer Management

- Ring buffer with configurable size
- Automatic oldest data eviction
- Per-channel min/max tracking
- Efficient array operations

## Technical Implementation

### Line Chart
- `THREE.Line` with `BufferGeometry`
- Dynamic position updates
- Per-channel color coding

### Bar Graph
- `THREE.BoxGeometry` with scale transforms
- Emissive intensity based on value
- Grid layout with spacing

### Scatter Plot
- Custom shader material
- Point size attenuation
- Alpha blending with discard

### 3D Surface
- `THREE.PlaneGeometry` with vertex displacement
- Vertex colors from channel mapping
- Normal recalculation per frame

### Particle System
- `THREE.Points` with velocity simulation
- Data-driven acceleration
- Boundary wrapping

## Project Structure

```
realtime-streaming/
├── src/
│   └── main.ts        # Streaming implementation
├── index.html         # UI with controls
├── package.json       # Dependencies
├── tsconfig.json      # TypeScript config
├── vite.config.ts     # Vite dev server
└── README.md          # Documentation
```

## Dependencies

- `three` - 3D rendering
- `@3lens/core` - Entity tracking
- `@3lens/overlay` - Debug overlay

## Use Cases

- **Financial Dashboards** - Real-time market data visualization
- **IoT Monitoring** - Sensor network visualization
- **Network Operations** - Traffic analysis and monitoring
- **Audio Applications** - Spectrum analyzers, VU meters
- **Scientific Data** - Live experiment data streaming
- **Game Development** - Debug data visualization

## Performance Considerations

- Buffer size affects memory usage
- Higher update rates increase CPU load
- Particle mode is most GPU-intensive
- Line mode is most efficient
- Consider throttling for production use
