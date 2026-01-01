# Scientific Visualization Example

A comprehensive scientific data visualization example demonstrating molecular structures, volumetric rendering, vector fields, isosurfaces, and particle systems with 3Lens devtool integration.

## Features

### Visualization Modes

1. **Molecular Structure** - Ball-and-stick model rendering
   - Multiple molecule datasets (caffeine, water, ethanol, benzene, DNA helix)
   - Atom spheres with element-specific colors and radii
   - Bond visualization with single/double/triple bond support
   - Interactive atom selection with tooltips

2. **Volumetric Rendering** - 3D scalar field visualization
   - Slice-based volume rendering
   - Colormap-based transfer functions
   - Adjustable opacity for transparency

3. **Vector Field** - 3D flow visualization
   - Arrow-based vector representation
   - Color-coded by magnitude
   - Configurable grid resolution

4. **Isosurface** - Implicit surface extraction
   - Metaball-based scalar field
   - Adjustable iso-value threshold
   - Vertex coloring with colormaps

5. **Particle System** - N-body simulation
   - GPU-accelerated point rendering
   - Additive blending for glow effects
   - Real-time physics simulation

### Color Maps

- **Viridis** - Perceptually uniform, colorblind-friendly
- **Plasma** - High contrast purple-orange-yellow
- **Coolwarm** - Diverging blue-white-red
- **Rainbow** - Classic spectral gradient

### Interactive Controls

- **Auto Rotate** - Continuous Y-axis rotation
- **Wireframe** - Toggle wireframe rendering
- **Show Bonds** - Toggle molecular bonds
- **Show Labels** - Atom label overlay
- **Axes Helper** - XYZ coordinate axes
- **Bounding Box** - Visualization bounds
- **Cross Section** - Clipping plane visualization

### Parameters

- **Resolution** - Grid/particle density (10-100)
- **Iso Value** - Isosurface threshold (0-1)
- **Opacity** - Transparency level (0-1)
- **Scale** - Visualization size multiplier (0.5-2)

## 3Lens Integration

This example demonstrates scientific visualization entity tracking:

```typescript
import { createProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';

// Initialize probe
const probe = createProbe({ appName: 'Scientific-Viz' });
createOverlay({ probe, theme: 'dark' });

// Register visualization scene
probe.registerLogicalEntity({
  id: 'viz-scene',
  name: 'Scientific Visualization',
  type: 'scene',
  object3D: scene,
  metadata: {
    vizMode: currentViz,
    dataset: currentMolecule,
    colorMap: currentColorMap
  }
});

// Register individual atoms
probe.registerLogicalEntity({
  id: `atom-${index}`,
  name: `${atom.element} Atom ${index}`,
  type: 'atom',
  object3D: mesh,
  metadata: {
    element: atom.element,
    position: `(${x}, ${y}, ${z})`,
    radius: atom.radius
  }
});

// Register molecule
probe.registerLogicalEntity({
  id: 'molecule',
  name: molecule.name,
  type: 'molecule',
  object3D: vizGroup,
  metadata: {
    formula: molecule.formula,
    atomCount: molecule.atoms.length,
    bondCount: molecule.bonds.length
  }
});

// Capture frame on atom selection
probe.captureFrame();
```

## Running the Example

```bash
# Navigate to example directory
cd examples/data-visualization/scientific-viz

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The example runs at `http://localhost:3026`.

## Molecule Datasets

### Caffeine (C₈H₁₀N₄O₂)
- 24 atoms, 16 bonds
- Fused ring structure with methyl groups
- Common stimulant found in coffee and tea

### Water (H₂O)
- 3 atoms, 2 bonds
- Classic bent molecular geometry
- 104.5° bond angle

### Ethanol (C₂H₆O)
- 9 atoms, 8 bonds
- Alcohol functional group
- Hydrogen bonding capability

### Benzene (C₆H₆)
- 12 atoms, 12 bonds
- Aromatic ring with alternating bonds
- Planar hexagonal structure

### DNA Helix Segment
- Double helix visualization
- Procedurally generated
- Represents nucleotide backbone

## Technical Implementation

### Molecular Rendering
- `THREE.SphereGeometry` for atoms
- `THREE.CylinderGeometry` for bonds
- Phong shading with specular highlights

### Volumetric Rendering
- Slice-based approach with `THREE.PlaneGeometry`
- Per-vertex color from scalar field sampling
- Alpha blending for transparency

### Vector Field
- `THREE.ConeGeometry` for arrows
- Quaternion-based orientation
- Magnitude-to-color mapping

### Isosurface
- Deformed sphere approximation
- Metaball implicit function
- Vertex color gradient

### Particle System
- Custom shader material
- Point size attenuation
- Additive blending for glow

## Project Structure

```
scientific-viz/
├── src/
│   └── main.ts        # Visualization implementation
├── index.html         # UI and controls
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

- **Education** - Interactive chemistry/physics teaching
- **Research** - Scientific data exploration
- **Analysis** - Molecular dynamics visualization
- **Debugging** - 3D algorithm development
