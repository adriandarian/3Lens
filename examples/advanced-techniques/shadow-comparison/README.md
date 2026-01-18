# Shadow Technique Comparison

This example demonstrates different shadow mapping techniques in Three.js and how to use **3Lens** to inspect and debug shadow configurations.

## Shadow Techniques

The scene showcases four shadow mapping types:

- **Basic Shadow Map** - Hard shadows, fast performance, aliasing artifacts
- **PCF (Percentage-Closer Filtering)** - Soft shadow edges, balanced quality
- **PCSS (Percentage-Closer Soft Shadows)** - Contact-hardening shadows, higher quality
- **VSM (Variance Shadow Mapping)** - Smooth shadows, may have light bleeding

## Using 3Lens to Debug Shadows

### Open the 3Lens Overlay

Press the 3Lens hotkey or click the overlay button to open the devtools panel.

### Inspect Shadow Lights

In the **Scene** panel, look for the registered shadow lights:
- `DirectionalLight` - Main scene light with large shadow frustum
- `SpotLight_Red` / `SpotLight_Blue` - Colored spot lights
- `PointLight_Amber` - Point light with cube shadow map

### What to Examine

1. **Shadow Map Size** - Each light shows its shadow map resolution in metadata
2. **Shadow Bias** - Check bias values to understand shadow acne prevention
3. **Light Intensity** - See how each light contributes to the scene
4. **Memory Usage** - The shadow system entity shows total shadow map memory

### Performance Analysis

Use the **Performance** panel to observe:
- Draw call impact when shadows are enabled
- GPU time differences between shadow types
- Frame time consistency

### Common Issues to Debug

| Shadow Type | Potential Issues | What to Look For in 3Lens |
|-------------|------------------|---------------------------|
| Basic | Shadow acne, aliasing | Low bias values, small map size |
| PCF | Banding in soft edges | Sample count (filter radius) |
| PCSS | Noise, performance | High sample counts |
| VSM | Light bleeding | Thin objects casting shadows |

## Scene Objects

The scene includes test objects for evaluating shadow quality:
- **ThinBox_LightBleedTest** - Tests VSM light bleeding
- **FloatingSphere_ContactTest** - Tests PCSS contact hardening
- Various geometric shapes to observe shadow edge quality

## Key Files

- `src/main.ts` - Shadow setup and 3Lens integration
- `index.html` - Minimal UI for shadow type switching

## Running the Example

```bash
cd examples/advanced-techniques/shadow-comparison
npm install
npm run dev
```
