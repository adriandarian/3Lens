# 3D Chart Visualization Example

Interactive 3D data visualization with multiple chart types, demonstrating 3Lens devtool integration for debugging and inspecting chart components.

## Features

### Chart Types
- **Bar Chart** - 3D extruded bars with labels and values
- **Line Graph** - Smooth curved lines with data points
- **Pie Chart** - Exploded 3D pie slices with percentages
- **Scatter Plot** - 3D point cloud visualization
- **Area Chart** - Filled area with gradient
- **Surface Plot** - 3D mathematical surface with color mapping

### Interactive Controls
- **Bar Spacing** - Adjust gap between bars
- **Height Scale** - Scale data values vertically
- **Data Points** - Change number of data points
- **Animation** - Toggle automatic animation
- **Randomize** - Generate new random data
- **Grid/Axes/Labels** - Toggle visual helpers

### Data Features
- Real-time data statistics (min, max, average, std dev)
- Interactive tooltips on hover
- Click to select and inspect data points
- Dynamic legend generation
- Color-coded data categories

### 3Lens Integration
- Scene entity registration
- Individual chart element tracking
- Data point metadata capture
- Frame capture on interaction

## Running the Example

```bash
# From the repository root
cd examples/data-visualization/3d-charts
pnpm install
pnpm dev
```

Then open http://localhost:3024

## Controls

| Input | Action |
|-------|--------|
| `~` | Toggle 3Lens overlay |
| Left Click | Select data point |
| Mouse Drag | Rotate camera |
| Scroll | Zoom in/out |
| Right Drag | Pan camera |

## Code Structure

```
3d-charts/
├── index.html        # UI layout with panels
├── src/
│   └── main.ts       # Chart visualization logic
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 3Lens Entity Registration

```typescript
// Chart container entity
probe.registerLogicalEntity({
  id: 'chart-bar',
  name: 'Bar Chart',
  type: 'chart',
  object3D: chartGroup,
  metadata: {
    chartType: 'bar',
    dataPointCount: 12,
    totalValue: '624.5'
  }
});

// Individual data point entity
probe.registerLogicalEntity({
  id: 'bar-0',
  name: 'Bar: Jan',
  type: 'data-bar',
  object3D: barMesh,
  metadata: {
    label: 'Jan',
    value: '45.2',
    percentage: '7.2%',
    color: '#4444ff'
  }
});
```

## Chart Implementation Details

### Bar Chart
- BoxGeometry with dynamic height
- Emissive materials for glow effect
- Shadow casting enabled
- Hover/select highlighting

### Line Chart
- CatmullRomCurve3 for smooth interpolation
- TubeGeometry for thick lines
- Sphere markers at data points

### Pie Chart
- ExtrudeGeometry from Shape
- Exploded slice positioning
- Percentage labels

### Scatter Plot
- Random 3D point distribution
- Size variation by value
- Multi-color categories

### Surface Plot
- PlaneGeometry with vertex displacement
- Vertex colors for height mapping
- Wireframe overlay

## Customization

### Adding New Chart Types

```typescript
function buildMyChart(): void {
  // Clear existing
  clearChart();

  // Create geometry
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial({ color: 0x44aaff });
  const mesh = new THREE.Mesh(geometry, material);
  
  chartGroup.add(mesh);

  // Register with 3Lens
  probe.registerLogicalEntity({
    id: 'my-chart',
    name: 'My Custom Chart',
    type: 'custom-chart',
    object3D: mesh,
    metadata: { custom: 'data' }
  });
}
```

### Custom Data Sources

```typescript
// Replace generateRandomData with API call
async function fetchData(): Promise<void> {
  const response = await fetch('/api/data');
  const data = await response.json();
  
  currentData = data.map((item: any) => ({
    label: item.name,
    value: item.value,
    color: item.color || COLORS[0]
  }));
  
  updateDataPanel();
  buildChart();
}
```

## Technologies

- Three.js 0.160.0
- TypeScript 5.3
- Vite 5.0
- @3lens/core
- @3lens/overlay
