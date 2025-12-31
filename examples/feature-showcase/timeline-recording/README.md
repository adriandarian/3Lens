# Timeline Recording Demo

This example demonstrates 3Lens's performance timeline recording features for Three.js scenes.

## Features Demonstrated

### Real-time Frame Time Visualization
- Live frame time chart showing CPU time per frame
- GPU time overlay when available (via `EXT_disjoint_timer_query`)
- Automatic scaling based on frame time range

### Spike Detection
- Frames exceeding 33.33ms (30 FPS threshold) highlighted in red
- Spike counter in the timeline controls
- Visual warning indicators

### Frame Recording
- Click the record button (⏺) to start capturing frames
- Up to 30 seconds of frame data (1800 frames at 60fps)
- View recording duration and frame count
- Clear recordings to start fresh

### Timeline Navigation
- **Zoom**: Use +/- buttons or mouse wheel on chart
- **Pan**: Drag the timeline chart to scroll through history
- **Buffer Size**: Choose 2s, 5s, or 10s of live history
- **Reset**: Return to default zoom level

### Frame Selection
- Click any bar in the timeline to select that frame
- View detailed stats for the selected frame:
  - CPU time
  - GPU time (if available)
  - FPS equivalent
  - Draw calls
  - Triangle count

## Running the Example

```bash
# From the repository root
pnpm install

# Navigate to this example
cd examples/feature-showcase/timeline-recording

# Start development server
pnpm dev
```

## Performance Scenarios

The demo includes four preset scenarios to demonstrate different performance patterns:

### 🟢 Smooth 60fps
- 50 objects with simple box geometry
- No shadows
- Consistent frame times around 1-5ms
- Great for baseline comparison

### 🟠 Heavy Load
- 1000 objects with complex torus knot geometry
- Medium shadow quality (1024x1024 shadow map)
- Frame times typically 10-25ms
- Shows sustained heavy workload

### 🔴 Random Spikes
- 200 objects with sphere geometry
- Low shadow quality
- Random artificial frame spikes (50-150ms)
- Demonstrates spike detection and timeline highlighting

### 🗑️ GC Pressure
- 300 objects with simple geometry
- Periodic large memory allocations
- Simulates garbage collection stalls
- Shows irregular spike patterns

## Interactive Controls

### Load Sliders
- **Object Count** (10-2000): Number of animated meshes
- **Animation Complexity**: 
  - Low: Rotation only
  - Medium: Rotation + floating animation
  - High: Rotation + floating + position oscillation
- **Shadow Quality**: Off / Low (512) / Medium (1024) / High (2048)

### Action Buttons
- **Trigger Spike**: Force a single frame spike
- **Force GC**: Simulate garbage collection pressure
- **Reset to Default**: Return to initial settings

## Using 3Lens DevTools

1. Press **F9** to open the 3Lens overlay
2. Go to the **Performance** panel (⚡ icon)
3. Click the **Timeline** tab
4. Use the controls:
   - ⏺ Start/stop recording
   - 🗑 Clear recording
   - +/- Zoom in/out
   - ↺ Reset view

## Understanding the Timeline Chart

```
┌─────────────────────────────────────────────────────┐
│     60fps target line (green dashed)                │
│  ┌─┐                                                │
│  │ │ ┌─┐     ┌─┐                                   │
│  │ │ │ │ ┌─┐ │ │ ┌─┐                              │
│──│─│─│─│─│─│─│─│─│─│─────  30fps threshold         │
│  │ │ │ │ │ │ │ │ │ │ ┌─┐                          │
│  │ │ │ │ │ │ │ │ │ │ │█│ ← Spike (red)            │
│  └─┘ └─┘ └─┘ └─┘ └─┘ └─┘                          │
│  CPU bars (blue)                                    │
└─────────────────────────────────────────────────────┘
```

### Color Legend
- **Blue bars**: CPU frame time
- **Green bars**: GPU frame time (overlay)
- **Red bars**: Frame spikes (>33ms)
- **Green dashed line**: 60fps target (16.67ms)
- **Yellow dashed line**: 30fps threshold (33.33ms)

## Performance Tips

Based on timeline analysis, common optimizations include:

1. **Reduce Object Count**: If frame times scale linearly with objects
2. **Simplify Geometry**: Use LOD for distant objects
3. **Optimize Shadows**: Lower resolution or disable for small objects
4. **Batch Draw Calls**: Use instancing for repeated geometry
5. **Profile GC**: Look for irregular spike patterns indicating memory issues

## API Integration

You can access frame stats programmatically:

```typescript
import { DevtoolProbe } from '@3lens/core';

const probe = new DevtoolProbe();
probe.init({ scenes: [scene] });

// Subscribe to frame stats
probe.onFrameStats((stats) => {
  console.log(`Frame ${stats.frame}: ${stats.cpuTimeMs.toFixed(2)}ms`);
  
  if (stats.cpuTimeMs > 16.67) {
    console.warn('Frame budget exceeded!');
  }
});

// Get history
const history = probe.getFrameStatsHistory(60); // Last 60 frames
const latest = probe.getLatestFrameStats();
```
