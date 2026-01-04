# Chart Components

The 3Lens overlay includes chart components for visualizing frame time performance data. These charts help identify performance issues, frame spikes, and overall rendering health.

## Overview

The frame time chart provides:

- **Real-time visualization** - Live updating as frames render
- **Performance thresholds** - Visual indicators for 60fps and 30fps targets
- **Zoom and pan** - Navigate through frame history
- **Hover tooltips** - Detailed information on individual frames
- **Statistical overlay** - Min, max, average, and jitter metrics

## Frame Time Chart

The primary chart renders frame times as a combination bar graph and line chart.

### Visual Elements

```
┌─────────────────────────────────────────────────────────────┐
│  ---- 60fps target (16.67ms) ----                           │
│  ╭─╮                                                        │
│  │ │ ╭─╮ ╭─╮     ╭─╮                 ╭─╮                    │
│  │ │ │ │ │ │ ╭─╮ │ │ ╭─╮ ╭─╮ ╭─╮ ╭─╮│ │                    │
│  │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ ││ │                    │
│──│─│─│─│─│─│─│─│─│─│─│─│─│─│─│─│─│─││─│─── avg line ───    │
│  │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ ││ │                    │
│  ╰─╯ ╰─╯ ╰─╯ ╰─╯ ╰─╯ ╰─╯ ╰─╯ ╰─╯ ╰─╯╰─╯                    │
├─────────────────────────────────────────────────────────────┤
│ Min: 8.2ms  Avg: 12.4ms  Max: 24.1ms  Jitter: 3.2ms  [60f] │
└─────────────────────────────────────────────────────────────┘
```

### Color Coding

| Frame Time | Color | Meaning |
|-----------|-------|---------|
| ≤ 16.67ms | Green/Cyan gradient | Good - hitting 60fps |
| 16.67ms - 33.33ms | Yellow/Amber gradient | Warning - below 60fps |
| > 33.33ms | Red gradient | Bad - below 30fps |
| Hovered | Blue | Currently inspected frame |

### Reference Lines

- **Green dashed line** - 60fps target (16.67ms)
- **Yellow dashed line** - Average frame time
- **Gray lines** - Grid at 16.67ms and 33.33ms intervals

## Chart Implementation

### Rendering Function

The chart uses HTML5 Canvas for efficient rendering:

```typescript
private renderChart(): void {
  const canvas = document.getElementById('three-lens-stats-chart') as HTMLCanvasElement;
  const data = this.getVisibleFrameData();
  
  if (!canvas || data.length < 2) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Handle high-DPI displays
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * window.devicePixelRatio;
  canvas.height = rect.height * window.devicePixelRatio;
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

  const { width, height } = rect;
  
  // Calculate scale
  const dataMax = Math.max(...data, 16.67);
  const maxValue = Math.ceil(dataMax / 8.33) * 8.33;
  
  // Draw bars and line graph
  // ...
}
```

### Data Management

Frame data is managed with a circular buffer:

```typescript
class Overlay {
  private frameHistory: number[] = [];
  private maxHistoryLength = 300;
  private frameBufferSize = 300;
  
  // Add new frame time
  private recordFrame(frameTime: number): void {
    this.frameHistory.push(frameTime);
    if (this.frameHistory.length > this.maxHistoryLength) {
      this.frameHistory.shift();
    }
  }
  
  // Get visible portion of frame data
  private getVisibleFrameData(): number[] {
    const visibleCount = this.getVisibleFrameCount();
    const endIndex = this.frameHistory.length - this.chartOffset;
    const startIndex = Math.max(0, endIndex - visibleCount);
    return this.frameHistory.slice(startIndex, endIndex);
  }
}
```

### Statistics Calculation

```typescript
// Visible frame count based on zoom level
private getVisibleFrameCount(): number {
  return Math.max(10, Math.floor(60 / this.chartZoom));
}

// Minimum frame time in visible range
private getFrameTimeMin(): number {
  const data = this.getVisibleFrameData();
  return data.length > 0 ? Math.min(...data) : 0;
}

// Maximum frame time in visible range
private getFrameTimeMax(): number {
  const data = this.getVisibleFrameData();
  return data.length > 0 ? Math.max(...data) : 0;
}

// Average frame time
private getFrameTimeAvg(): number {
  const data = this.getVisibleFrameData();
  if (data.length === 0) return 0;
  return data.reduce((a, b) => a + b, 0) / data.length;
}

// Frame time jitter (standard deviation)
private getFrameTimeJitter(): number {
  const data = this.getVisibleFrameData();
  if (data.length < 2) return 0;
  const avg = this.getFrameTimeAvg();
  const variance = data.reduce((sum, val) => 
    sum + Math.pow(val - avg, 2), 0) / data.length;
  return Math.sqrt(variance);
}
```

## Zoom and Pan Controls

### Zoom

```typescript
private chartZoom = 1.0;

private handleChartZoomIn(): void {
  if (this.chartZoom < 4) {
    this.chartZoom *= 1.5;
    this.updateChartView();
  }
}

private handleChartZoomOut(): void {
  if (this.chartZoom > 0.5) {
    this.chartZoom /= 1.5;
    // Clamp offset to valid range
    this.chartOffset = Math.max(
      0, 
      Math.min(
        this.chartOffset, 
        this.frameHistory.length - this.getVisibleFrameCount()
      )
    );
    this.updateChartView();
  }
}

private handleChartReset(): void {
  this.chartZoom = 1;
  this.chartOffset = 0;
  this.updateChartView();
}
```

### Zoom Levels

| Zoom | Visible Frames | Use Case |
|------|---------------|----------|
| 0.5x | ~120 frames | Overview of 2 seconds |
| 1.0x | 60 frames | Default - 1 second |
| 1.5x | 40 frames | Detailed view |
| 2.0x | 30 frames | Half-second detail |
| 4.0x | 15 frames | Individual frame analysis |

## Hover Interaction

### Mouse Tracking

```typescript
private chartHoverIndex: number | null = null;

private attachChartEvents(): void {
  const canvas = document.getElementById('three-lens-stats-chart');
  const tooltip = document.getElementById('three-lens-chart-tooltip');
  
  canvas?.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const data = this.getVisibleFrameData();
    const barWidth = rect.width / data.length;
    const index = Math.floor(x / barWidth);
    
    if (index >= 0 && index < data.length) {
      this.chartHoverIndex = index;
      this.showTooltip(tooltip, data[index], e);
      this.renderChart(); // Re-render to highlight bar
    }
  });
  
  canvas?.addEventListener('mouseleave', () => {
    this.chartHoverIndex = null;
    this.hideTooltip(tooltip);
    this.renderChart();
  });
}
```

### Tooltip Display

```typescript
private showTooltip(
  tooltip: HTMLElement, 
  frameTime: number, 
  event: MouseEvent
): void {
  const fps = 1000 / frameTime;
  tooltip.innerHTML = `
    <div class="tooltip-value">${frameTime.toFixed(2)}ms</div>
    <div class="tooltip-fps">${fps.toFixed(0)} FPS</div>
  `;
  
  tooltip.style.left = `${event.clientX + 10}px`;
  tooltip.style.top = `${event.clientY - 30}px`;
  tooltip.style.display = 'block';
}
```

## Timeline Recording

Extended timeline recording for longer analysis sessions:

```typescript
class Overlay {
  private isRecording = false;
  private recordedFrames: FrameRecord[] = [];
  
  interface FrameRecord {
    timestamp: number;
    frameTime: number;
    drawCalls: number;
    triangles: number;
    gpuTime?: number;
  }
  
  private toggleRecording(): void {
    this.isRecording = !this.isRecording;
    if (this.isRecording) {
      this.recordedFrames = [];
    }
  }
  
  private recordFrame(stats: FrameStats): void {
    if (this.isRecording) {
      this.recordedFrames.push({
        timestamp: performance.now(),
        frameTime: stats.frameTime,
        drawCalls: stats.drawCalls,
        triangles: stats.triangles,
        gpuTime: stats.gpuTime,
      });
    }
  }
}
```

## Chart HTML Structure

```html
<div class="three-lens-chart-container" id="three-lens-chart-container">
  <!-- Chart canvas -->
  <canvas id="three-lens-stats-chart"></canvas>
  
  <!-- Tooltip -->
  <div id="three-lens-chart-tooltip" class="chart-tooltip"></div>
  
  <!-- Controls -->
  <div class="chart-controls">
    <button id="three-lens-chart-zoom-in">+</button>
    <span id="three-lens-chart-zoom-label">60f</span>
    <button id="three-lens-chart-zoom-out">-</button>
    <button id="three-lens-chart-reset">Reset</button>
  </div>
  
  <!-- Statistics -->
  <div class="chart-stats">
    <span class="stat">
      <label>Min</label>
      <span id="three-lens-chart-min">0.0ms</span>
    </span>
    <span class="stat">
      <label>Avg</label>
      <span id="three-lens-chart-avg">0.0ms</span>
    </span>
    <span class="stat">
      <label>Max</label>
      <span id="three-lens-chart-max">0.0ms</span>
    </span>
    <span class="stat">
      <label>Jitter</label>
      <span id="three-lens-chart-jitter">0.0ms</span>
    </span>
  </div>
</div>
```

## Chart Styling

```css
.three-lens-chart-container {
  position: relative;
  height: 120px;
  background: var(--3lens-bg-primary);
  border-radius: var(--3lens-radius-md);
  overflow: hidden;
}

#three-lens-stats-chart {
  width: 100%;
  height: 100%;
}

.chart-tooltip {
  position: absolute;
  background: var(--3lens-bg-elevated);
  border: 1px solid var(--3lens-border);
  border-radius: var(--3lens-radius-sm);
  padding: 4px 8px;
  font-family: var(--3lens-font-mono);
  font-size: 11px;
  pointer-events: none;
  z-index: 100;
  display: none;
}

.chart-controls {
  position: absolute;
  top: 4px;
  right: 4px;
  display: flex;
  gap: 4px;
}

.chart-controls button {
  width: 24px;
  height: 24px;
  background: var(--3lens-bg-tertiary);
  border: 1px solid var(--3lens-border);
  border-radius: var(--3lens-radius-sm);
  color: var(--3lens-text-secondary);
  cursor: pointer;
}

.chart-controls button:hover {
  background: var(--3lens-bg-hover);
  color: var(--3lens-text-primary);
}

.chart-stats {
  position: absolute;
  bottom: 4px;
  left: 4px;
  right: 4px;
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  font-family: var(--3lens-font-mono);
}

.chart-stats .stat label {
  color: var(--3lens-text-tertiary);
  margin-right: 4px;
}

.chart-stats .stat span {
  color: var(--3lens-accent-cyan);
}
```

## Performance Best Practices

### 1. Throttle Updates

Don't re-render the chart on every frame:

```typescript
private lastChartUpdate = 0;
private chartUpdateInterval = 100; // ms

private maybeUpdateChart(): void {
  const now = performance.now();
  if (now - this.lastChartUpdate > this.chartUpdateInterval) {
    this.renderChart();
    this.lastChartUpdate = now;
  }
}
```

### 2. Use requestAnimationFrame

```typescript
private scheduleChartRender(): void {
  if (this.chartRenderPending) return;
  this.chartRenderPending = true;
  
  requestAnimationFrame(() => {
    this.chartRenderPending = false;
    this.renderChart();
  });
}
```

### 3. Limit History Size

```typescript
// Cap frame history to prevent memory growth
private maxHistoryLength = 300;

while (this.frameHistory.length > this.maxHistoryLength) {
  this.frameHistory.shift();
}
```

## GPU Time Chart

When available, GPU timing can be displayed alongside CPU frame time:

```typescript
private gpuHistory: number[] = [];

private renderGpuChart(): void {
  // Render secondary chart showing GPU time
  // Uses similar bar/line visualization
  // Color coded: GPU time should be ≤ frame budget
}
```

## See Also

- [Stats Panel](../overlay/stats-panel) - Contains the frame time chart
- [Performance Tracker](../core/performance-tracker) - Provides frame timing data
- [GPU Timing](../core/gpu-timing) - GPU performance measurement
- [Frame Stats](../core/frame-stats) - Frame statistics interface
