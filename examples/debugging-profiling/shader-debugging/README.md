# Shader Debugging Example

This example demonstrates how to debug custom GLSL shaders in Three.js using **3Lens**, including live editing, error detection, and uniform inspection.

## 🚀 Running the Example

```bash
# From the monorepo root
pnpm install
pnpm --filter @3lens/example-shader-debugging dev

# Or from this directory
pnpm install
pnpm dev
```

Then open http://localhost:3013

## 🎨 Shader Gallery

The example includes 6 different shaders demonstrating various techniques:

| Shader | Type | Description |
|--------|------|-------------|
| **Simple Gradient** | Fragment | UV-based color interpolation |
| **Animated Wave** | Vertex | Sine wave displacement animation |
| **Fresnel Effect** | Both | View-dependent edge glow |
| **Procedural Noise** | Fragment | FBM noise generation |
| **Hologram Effect** | Both | Sci-fi scanlines and glitch |
| **Toon Shading** | Fragment | Cel-shaded lighting |

## ✏️ Live Shader Editing

1. Select a shader from the gallery
2. Switch between Vertex and Fragment tabs
3. Edit the GLSL code
4. Click **Compile** to see changes
5. Use **Reset** to restore original code

## 💥 Common Shader Errors

Click the **Break It** button to intentionally introduce common shader errors:

### Vertex Shader Errors

```glsl
// Missing semicolon
gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0)

// Undefined variable
gl_Position = projectionMatrix * modelViewMatrix * vec4(undefinedVar, 1.0);

// Type mismatch (vec3 instead of vec4)
gl_Position = projectionMatrix * modelViewMatrix * position;
```

### Fragment Shader Errors

```glsl
// Missing semicolon
gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0)

// Undefined varying
gl_FragColor = vec4(vUndefined, 1.0);

// Wrong component count
gl_FragColor = vec3(1.0, 0.0, 0.0);  // Should be vec4
```

## 🔧 Debugging Tips

### 1. Check Variable Types

GLSL is strictly typed. Common mismatches:
- `vec3` vs `vec4` for positions
- `float` vs `int` for uniforms
- Matrix multiplication order

### 2. Validate Varying Names

Varyings must be declared identically in both shaders:

```glsl
// Vertex shader
varying vec2 vUv;

// Fragment shader - must match exactly!
varying vec2 vUv;  // ✅ Correct
varying vec2 vUV;  // ❌ Case mismatch
```

### 3. Check Uniform Declarations

Uniforms must match the JavaScript values:

```javascript
// JavaScript
uniforms: {
  uTime: { value: 0.0 },
  uColor: { value: new THREE.Color(0xff0000) }
}
```

```glsl
// GLSL - types must match
uniform float uTime;      // ✅ matches number
uniform vec3 uColor;      // ✅ matches Color (RGB)
```

### 4. Use Fallback Values

Prevent NaN/Infinity with safe math:

```glsl
// Avoid division by zero
float result = numerator / max(denominator, 0.001);

// Clamp to valid range
color = clamp(color, 0.0, 1.0);

// Normalize vectors
vec3 dir = normalize(direction);
```

## 📊 Using 3Lens for Shader Analysis

1. Press `~` to open the 3Lens panel
2. Navigate to the **Scene** tab
3. Select the shader mesh object
4. View material properties including:
   - Shader type (ShaderMaterial)
   - Uniform values
   - Texture bindings

## 🎛️ Uniform Controls

Each shader includes interactive controls:

- **Color pickers** for `vec3` color uniforms
- **Sliders** for `float` uniforms
- Changes apply in real-time

## 📚 Shader Techniques Explained

### Fresnel Effect

Creates an edge glow based on view angle:

```glsl
float fresnel = pow(1.0 - abs(dot(viewDir, normal)), power);
```

### Value Noise

Hash-based procedural pattern:

```glsl
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
```

### Toon Shading

Quantized lighting for cartoon effect:

```glsl
float intensity = dot(normal, lightDir);
intensity = floor(intensity * steps) / steps;
```

## 🔗 Resources

- [The Book of Shaders](https://thebookofshaders.com/)
- [Shadertoy](https://www.shadertoy.com/)
- [Three.js ShaderMaterial](https://threejs.org/docs/#api/en/materials/ShaderMaterial)
- [GLSL Reference](https://www.khronos.org/opengl/wiki/Data_Type_(GLSL))

