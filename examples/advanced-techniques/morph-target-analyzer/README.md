# Morph Target Analyzer

This example demonstrates morph target (blend shape) debugging with **3Lens** integration for inspecting shape keys and influence values.

## Features

- Procedural face mesh with 16 morph targets
- Expression presets (Happy, Sad, Angry, Surprised, Wink, Neutral)
- Animation modes (Blink, Talk, Random)
- Real-time influence tracking via 3Lens

## Using 3Lens for Morph Target Debugging

### Open the 3Lens Overlay

Press the 3Lens hotkey to access the devtools panel.

### Inspect Morph Target System

The **Morph Target System** entity shows:
- Total morph target count
- Vertex count
- Memory usage for morph data
- Currently active morph count
- Animation mode

### Inspect Individual Morph Targets

Each morph target is registered with:
- Index in the morph array
- Category (expression, phoneme, modifier)
- Current influence value (0.0 - 1.0)

### Morph Target Categories

| Category | Targets |
|----------|---------|
| **Expression** | Smile, Frown, Eyebrow Raise/Furrow, Eye Wide/Squint/Blink |
| **Phoneme** | Mouth Open/Pucker/Wide, Jaw Open |
| **Modifier** | Cheek Puff, Nose Scrunch |

### What to Look For

1. **Active Morphs** - How many targets have non-zero influence
2. **Influence Values** - Current weight for each shape key
3. **Memory** - Total bytes used for morph position deltas
4. **Combinations** - How presets combine multiple targets

## Controls

- **Expression Buttons** - Apply preset expression combinations
- **Blink** - Toggle automatic blink animation
- **Talk** - Toggle mouth movement animation
- **Random** - Toggle random morph animation

## Technical Details

Each morph target stores position deltas for all vertices:
- 16 morph targets × ~3000 vertices × 3 floats × 4 bytes ≈ 576 KB

## Key Files

- `src/main.ts` - Morph target creation and 3Lens integration
- `index.html` - Minimal UI

## Running the Example

```bash
cd examples/advanced-techniques/morph-target-analyzer
npm install
npm run dev
```
