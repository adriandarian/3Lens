# Morph Target Analyzer Example

This example demonstrates morph target (blend shape) debugging and analysis using 3Lens devtools. It features a procedurally generated face mesh with 16 morph targets for facial expressions, phonemes, and modifiers.

## Features

### Morph Target System
- **16 Shape Keys**: Complete facial animation system
  - Expressions: Smile, Frown, Eyebrow Raise/Furrow, Eye Wide/Squint/Blink (L/R)
  - Phonemes: Mouth Open, Pucker, Wide, Jaw Open
  - Modifiers: Cheek Puff, Nose Scrunch
- **Interactive Sliders**: Real-time weight control for each morph target
- **Procedural Geometry**: Face mesh created entirely in code with vertex-level deformations

### Expression Presets
- 😊 Happy - Smile with squinted eyes
- 😢 Sad - Frown with furrowed brows
- 😠 Angry - Intense frown with nose scrunch
- 😲 Surprised - Wide eyes and open mouth
- 😉 Wink - Asymmetric blink with smile
- 😘 Kiss - Puckered lips
- 🤔 Thinking - Mixed eyebrow expression
- 😐 Neutral - Reset state
- 😴 Sleepy - Drooping eyelids

### Animation System
- **Blink Animation**: Natural periodic blinking
- **Talk Animation**: Lip sync simulation with varied mouth shapes
- **Emote Animation**: Cycle through different expressions
- **Random Mode**: Continuous random morph target changes

### Visualization Modes
1. **Normal**: Standard shaded view
2. **Delta**: Wireframe overlay showing displacement vectors
3. **Heatmap**: Vertex colors based on total displacement magnitude
4. **Wireframe**: Basic wireframe for structure analysis

### Real-time Analysis
- Active morph target count
- Total influence sum
- Maximum influence value
- GPU memory estimate for morph data
- Top 5 active influences with visual bars

## Running the Example

```bash
# From the repository root
cd examples/advanced-techniques/morph-target-analyzer

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The example will open at http://localhost:3033

## Controls

### Mouse
- **Left Click + Drag**: Rotate camera
- **Right Click + Drag**: Pan camera
- **Scroll**: Zoom in/out

### Keyboard
- **1-9**: Quick expression presets
- **R**: Reset all morph targets
- **Space**: Toggle animation playback

## 3Lens Integration

This example showcases:
- Mesh with morph targets registered as logical entity
- Morph target metadata tracking
- Delta visualization helper registration
- Module-based organization (`morph-targets`, `visualization`)

## Technical Details

### Procedural Face Generation
The face mesh is created from a 64×48 sphere with:
- Back flattening for head shape
- Chin narrowing
- Eye socket depressions
- Nose bump
- Mouth depression

### Morph Target Implementation
Each morph target stores delta (displacement) values per vertex:
- Calculated based on distance from facial feature landmarks
- Smooth falloff using influence functions
- Independent left/right controls for eyes

### Memory Calculation
Morph target memory = `numTargets × vertexCount × 3 × 4 bytes`
- 16 targets × ~3000 vertices × 12 bytes ≈ 576 KB

## Code Structure

```
morph-target-analyzer/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
├── src/
│   └── main.ts          # Main application
└── README.md
```

## Key Concepts Demonstrated

1. **BufferGeometry.morphAttributes**: Storing morph target data
2. **mesh.morphTargetInfluences**: Runtime weight array
3. **mesh.morphTargetDictionary**: Name-to-index mapping
4. **Vertex Color Visualization**: Heatmap based on displacement
5. **Keyframe Interpolation**: Smooth animation between states

## Use Cases

- Character facial animation debugging
- Blend shape weight tuning
- Expression library development
- Lip sync visualization
- Morph target optimization analysis
