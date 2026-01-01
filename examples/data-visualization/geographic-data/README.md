# Geographic Data Viewer Example

Interactive 3D geographic visualization with globe rendering, map projections, and multiple data layers, demonstrating 3Lens devtool integration.

## Features

### View Modes
- **3D Globe** - Interactive rotating Earth sphere
- **Flat Map** - Flattened projection view
- **Mercator** - Cylindrical map projection
- **Orthographic** - Parallel projection view

### Data Layers
- **Major Cities** - 50 world cities with population-based sizing/coloring
- **Population Density** - Color-coded population visualization
- **Flight Routes** - Animated flight path arcs between cities
- **Earthquakes** - Pulsing markers with magnitude-based sizing
- **Temperature Heatmap** - Global temperature overlay

### Interactive Features
- Click to select cities and view details
- Search cities and countries
- Auto-rotation with adjustable speed
- Day/Night mode toggle
- Latitude/Longitude grid overlay
- Real-time coordinate tracking
- Zoom and pan controls

### 3Lens Integration
- Globe entity registration
- Data layer tracking
- Point count monitoring
- Frame capture on selection

## Running the Example

```bash
# From the repository root
cd examples/data-visualization/geographic-data
pnpm install
pnpm dev
```

Then open http://localhost:3025

## Controls

| Input | Action |
|-------|--------|
| `~` | Toggle 3Lens overlay |
| Left Click | Select city/location |
| Mouse Drag | Rotate globe |
| Scroll | Zoom in/out |
| Search Box | Find cities by name |

## Code Structure

```
geographic-data/
├── index.html        # UI with layer controls
├── src/
│   └── main.ts       # Globe and data visualization
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Data Sources

### Cities Dataset
50 major world cities with:
- Name and country
- Latitude/Longitude coordinates
- Population figures

### Flight Routes
10 major international routes with arc visualization

### Earthquake Data
85 simulated earthquake points with:
- Location (Ring of Fire bias)
- Magnitude (3-8)
- Depth

## 3Lens Entity Registration

```typescript
// Globe entity
probe.registerLogicalEntity({
  id: 'earth-globe',
  name: 'Earth Globe',
  type: 'globe',
  object3D: globe,
  metadata: {
    radius: 5,
    segments: 64,
    viewMode: 'globe'
  }
});

// Data layer entity
probe.registerLogicalEntity({
  id: 'cities-layer',
  name: 'City Markers',
  type: 'data-layer',
  object3D: cityPoints,
  metadata: {
    pointCount: 50,
    visible: true
  }
});
```

## Technical Implementation

### Globe Rendering
- THREE.SphereGeometry with procedural texture
- Atmosphere glow using custom shader
- Starfield background with random distribution

### Coordinate System
```typescript
function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}
```

### City Markers
- THREE.Points with custom shader material
- Size based on population
- Color gradient: green (small) → red (large)
- Additive blending for glow effect

### Flight Routes
- Quadratic Bezier curves for arcs
- Arc height proportional to distance
- Semi-transparent orange lines

### Earthquake Visualization
- Pulsing animation via shader uniform
- Size based on magnitude
- Red color intensity by severity

## Customization

### Adding Custom Data

```typescript
const MY_LOCATIONS: City[] = [
  { 
    name: 'Custom City',
    country: 'Country',
    lat: 40.0,
    lon: -75.0,
    population: 1000000
  }
];

// Add to CITIES array or create new layer
```

### Custom Layers

```typescript
function createCustomLayer(data: any[]): THREE.Points {
  const geometry = new THREE.BufferGeometry();
  const positions: number[] = [];
  
  data.forEach(item => {
    const pos = latLonToVector3(item.lat, item.lon, GLOBE_RADIUS);
    positions.push(pos.x, pos.y, pos.z);
  });
  
  geometry.setAttribute('position', 
    new THREE.Float32BufferAttribute(positions, 3));
  
  return new THREE.Points(geometry, material);
}
```

## Performance Notes

- Uses GPU instancing for point clouds
- Shader-based point rendering for efficiency
- Layer toggling for selective rendering
- LOD consideration for zoom levels

## Technologies

- Three.js 0.160.0
- TypeScript 5.3
- Vite 5.0
- @3lens/core
- @3lens/overlay
