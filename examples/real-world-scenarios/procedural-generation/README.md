# Procedural Generation Debugger

This example demonstrates procedural content generation with 3Lens devtool integration. It showcases various generation algorithms including terrain, caves, cities, and dungeons with real-time parameter adjustment and debug visualization.

## Features

### Generator Types

1. **Terrain** ⛰️
   - Fractal Brownian Motion (fBm) noise-based heightmap
   - Multiple octaves for detail at different scales
   - Configurable height, frequency, persistence, and lacunarity

2. **Caves** 🕳️
   - 3D noise-based isosurface generation
   - Marching cubes-like voxel representation
   - Depth-based coloring

3. **City** 🏙️
   - Noise-driven building placement
   - Procedural building heights and dimensions
   - Automatic road grid generation

4. **Dungeon** 🏰
   - Cellular automata-based layout
   - Room and corridor generation
   - Iterative refinement passes

### Generation Modes

- **Real-time**: Single mesh, immediate generation
- **Chunked**: Multiple chunks with progressive loading
- **LOD**: Level-of-detail based on distance

### Debug Visualization

| Toggle | Description |
|--------|-------------|
| Normals | Display vertex normal vectors as green lines |
| Wireframe | Show mesh edges |
| Chunk Bounds | Visualize chunk boundaries (chunked mode) |
| Height Map | Raw height visualization |
| Noise Layers | Individual noise octave display |
| LOD Colors | Color-code chunks by LOD level |

### Color Schemes

- **Natural**: Water → Sand → Grass → Forest → Rock → Snow
- **Desert**: Sandy browns and tans
- **Alien**: Purple, cyan, and pink gradients
- **Volcanic**: Black rock with lava highlights
- **Arctic**: Ice blues and whites
- **Grayscale**: Black to white gradient

## Installation

```bash
cd examples/real-world-scenarios/procedural-generation
pnpm install
```

## Running the Example

```bash
pnpm dev
```

Opens at [http://localhost:3014](http://localhost:3014)

## Controls

### Mouse
- **Left drag** - Rotate camera
- **Right drag** - Pan camera
- **Scroll** - Zoom in/out

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Regenerate with current settings |
| `R` | Random seed and regenerate |
| `W` | Toggle wireframe |
| `N` | Toggle normals display |
| `C` | Toggle chunk bounds |
| `1` | Switch to Terrain generator |
| `2` | Switch to Caves generator |
| `3` | Switch to City generator |
| `4` | Switch to Dungeon generator |
| `D` | Toggle 3Lens overlay |

## Parameters

### Terrain Parameters

| Parameter | Range | Description |
|-----------|-------|-------------|
| Height Scale | 1-50 | Maximum terrain elevation |
| Octaves | 1-10 | Number of noise layers for detail |
| Frequency | 0.001-0.1 | Base noise frequency (scale) |
| Persistence | 0-1 | Amplitude decay per octave |
| Lacunarity | 1-4 | Frequency multiplier per octave |

### Seed

The seed value deterministically controls all random generation. Same seed = same output.

## Architecture

### Simplex Noise

Custom implementation with seeded PRNG for deterministic results:

```typescript
class SimplexNoise {
  constructor(seed: number);
  noise2D(x: number, y: number): number;
  fbm(x: number, y: number, octaves: number, 
      persistence: number, lacunarity: number): number;
}
```

### Generator Class

```typescript
class ProceduralGenerator {
  private noise: SimplexNoise;
  private params: GenerationParams;
  
  generate(): void;
  generateTerrain(): GenerationResult;
  generateCaves(): GenerationResult;
  generateCity(): GenerationResult;
  generateDungeon(): GenerationResult;
}
```

### Chunk System

```typescript
interface ChunkData {
  x: number;           // Chunk X coordinate
  z: number;           // Chunk Z coordinate
  mesh: THREE.Mesh;    // Three.js mesh
  lod: number;         // Level of detail (0-3)
  vertices: number;    // Vertex count
  triangles: number;   // Triangle count
}
```

## 3Lens Integration

The generator integrates with 3Lens for debugging:

```typescript
this.probe = createProbe({
  name: 'Procedural Generation Debugger',
  captureStackTraces: false,
});

this.probe.observeScene(this.scene);
this.probe.observeRenderer(this.renderer);

createOverlay(this.probe, {
  position: 'bottom-right',
  defaultOpen: true,
});
```

3Lens provides:
- Scene hierarchy with all generated meshes
- Per-object selection and inspection
- Real-time statistics (vertices, triangles, draw calls)
- Memory tracking for generated geometries
- Performance timeline for generation spikes

## Generation History

Each generation is recorded with:
- Seed value
- Generator type
- Timestamp
- Generation statistics

Click any history entry to regenerate with that seed.

## Export

Export generated meshes as OBJ files:
- Preserves vertex positions
- Includes object names
- Records seed and generator type in comments

## Algorithms

### Fractal Brownian Motion (fBm)

Combines multiple octaves of noise:

```
value = Σ (amplitude[i] × noise(x × frequency[i], y × frequency[i]))
```

Where:
- `amplitude[i] = persistence^i`
- `frequency[i] = lacunarity^i`

### Cellular Automata (Dungeon)

Rules applied iteratively:
1. Count neighbors (including diagonals)
2. Cell becomes wall if neighbors ≥ 5
3. Cell stays wall if wall AND neighbors ≥ 4
4. Repeat 4 iterations

### LOD System

Distance-based level of detail:
- LOD 0: Full resolution (distance < 1 chunk)
- LOD 1: 1/2 resolution (distance < 2 chunks)
- LOD 2: 1/3 resolution (distance < 3 chunks)
- LOD 3: 1/4 resolution (distance ≥ 3 chunks)

## Performance Tips

1. **Lower octaves** for faster generation (4-6 recommended)
2. **Use chunked mode** for large terrains
3. **Enable LOD** for optimal performance with many chunks
4. **Disable normals** visualization for better frame rate

## Related Examples

- [Large Scene Optimization](../../debugging-profiling/large-scene-optimization) - Performance with many objects
- [Memory Leak Detection](../../debugging-profiling/memory-leak-detection) - Tracking geometry disposal
- [Multi-Scene Management](../multi-scene-management) - Multiple scenes with different generators

## Troubleshooting

### Generation is slow
- Reduce octaves (4-6 is usually sufficient)
- Lower resolution in chunked/LOD mode
- Use simpler generator (city/dungeon vs terrain)

### Memory usage is high
- Dispose old geometry when regenerating
- Use chunked mode with view distance
- Export and reload to free WebGL resources

### Visual artifacts
- Ensure persistence is between 0.4-0.6
- Check frequency isn't too high (causes aliasing)
- Verify lacunarity is reasonable (1.5-2.5)
