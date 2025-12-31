# Cost Analysis Visualization Example

This example demonstrates 3Lens's cost analysis features for Three.js scenes.

## Features Demonstrated

### Triangle Cost Analysis
- Objects are scored based on triangle count
- Formula: `triangleCost = triangleCount / 1000`
- High-poly objects like `Dense Icosahedron` (~20K triangles) score higher

### Material Complexity Scoring
- Materials scored 1-10 based on type and features:
  - `MeshBasicMaterial`: +0 (simplest)
  - `MeshLambertMaterial`: +1
  - `MeshPhongMaterial`: +2
  - `MeshStandardMaterial`: +3
  - `MeshPhysicalMaterial`: +4 (most complex)
- Additional +0.5 per texture map (diffuse, normal, roughness, etc.)

### Cost Heatmap Overlay
- Scene tree nodes are color-coded by cost:
  - 🟢 **Low** (< 2): Efficient objects
  - 🟡 **Medium** (2-10): Moderate cost
  - 🟠 **High** (10-50): Needs attention
  - 🔴 **Critical** (> 50): Performance concern

### Cost Ranking
- Objects sorted by total cost
- Top 5 most expensive objects shown in overlay
- Click to select and inspect detailed breakdown

## Running the Example

```bash
# From the repository root
pnpm install

# Navigate to this example
cd examples/feature-showcase/cost-analysis

# Start development server
pnpm dev
```

## Scene Objects

The demo includes objects at various cost levels:

### Low Cost (Green)
- **Simple Cube**: `MeshBasicMaterial`, 12 triangles
- **Low-Poly Sphere**: `MeshLambertMaterial`, ~48 triangles

### Medium Cost (Yellow)
- **Standard Sphere**: `MeshStandardMaterial` with shadows, ~2000 triangles
- **Textured Torus**: `MeshStandardMaterial` + diffuse texture

### High Cost (Orange)
- **Complex Sphere**: `MeshStandardMaterial` + 3 texture maps (diffuse, normal, roughness)
- **Torus Knot**: High polygon count (~8000 triangles) with shadows

### Critical Cost (Red)
- **Ultra Sphere**: `MeshPhysicalMaterial` + clearcoat + 3 textures, ~32K triangles
- **Dense Icosahedron**: `MeshPhysicalMaterial` + transmission, ~20K triangles
- **Cube Array**: 25 individual meshes with unique `MeshPhysicalMaterial`

## Interactive Controls

- **Add High-Cost Object**: Spawns a new expensive `MeshPhysicalMaterial` sphere
- **Add Low-Cost Object**: Spawns a simple `MeshBasicMaterial` cube
- **Optimize Critical Objects**: Downgrades critical objects to reduce cost
- **Reset Scene**: Removes all dynamically added objects

## Using 3Lens DevTools

Press **F9** to open the 3Lens overlay and explore:

1. **Scene Tree**: See cost indicators (colored dots) next to each mesh
2. **Global Tools > Cost Ranking**: View top 5 most expensive objects
3. **Inspector > Cost Analysis**: Select any mesh to see detailed breakdown
4. **Performance Tab**: Monitor how cost affects frame times

## Cost Formula

The total cost is calculated as:

```
totalCost = (triangleCost × 1.0) + 
            (materialComplexity × 0.5) + 
            (textureCost × 0.3) + 
            (shadowCost × 0.2)
```

Where:
- `triangleCost` = triangleCount / 1000
- `materialComplexity` = 1-10 based on material type and features
- `textureCost` = textureCount × 2
- `shadowCost` = +2 for castShadow, +1 for receiveShadow

## Optimization Tips

Based on cost analysis, common optimizations include:

1. **Reduce triangle count** for high-poly meshes (use LOD)
2. **Simplify materials** (e.g., `MeshPhysicalMaterial` → `MeshStandardMaterial`)
3. **Consolidate textures** using texture atlases
4. **Disable shadows** on objects where not visible
5. **Instance meshes** instead of unique materials per object
