# Shader Debugging Guide

This guide covers 3Lens's shader debugging tools including GLSL/WGSL inspection, uniform editing, real-time shader recompilation, and visual debugging techniques.

## Table of Contents

- [Overview](#overview)
- [Shader Inspector Panel](#shader-inspector-panel)
- [Viewing Shader Code](#viewing-shader-code)
- [Live Shader Editing](#live-shader-editing)
- [Uniform Debugging](#uniform-debugging)
- [Visual Debug Modes](#visual-debug-modes)
- [Error Handling](#error-handling)
- [Performance Profiling](#performance-profiling)
- [WebGPU/WGSL Support](#webgpuwgsl-support)

---

## Overview

3Lens provides comprehensive shader debugging capabilities:

- **Code inspection** - View compiled vertex and fragment shaders
- **Live editing** - Modify shaders and see changes instantly
- **Uniform debugging** - Inspect and edit shader uniforms
- **Visual modes** - Debug normals, UVs, depth, and more
- **Error reporting** - Clear compilation error messages
- **Performance** - Identify expensive shader operations

---

## Shader Inspector Panel

### Accessing the Panel

1. Select a mesh with a custom shader material
2. Open the **Shader** tab in the inspector
3. Or press `Shift+S` with an object selected

### Panel Layout

```
┌────────────────────────────────────┐
│ 🔧 Shader Inspector                │
├────────────────────────────────────┤
│ Material: CustomMaterial           │
│ Type: ShaderMaterial               │
├────────────────────────────────────┤
│ [Vertex Shader] [Fragment Shader]  │
├────────────────────────────────────┤
│  1│ precision highp float;         │
│  2│                                │
│  3│ uniform mat4 modelViewMatrix;  │
│  4│ uniform mat4 projectionMatrix; │
│  5│ uniform float uTime;           │
│  6│                                │
│  7│ attribute vec3 position;       │
│  8│ attribute vec2 uv;             │
│  9│                                │
│ 10│ varying vec2 vUv;              │
│ 11│                                │
│ 12│ void main() {                  │
│ 13│   vUv = uv;                    │
│ 14│   vec3 pos = position;         │
│ 15│   pos.y += sin(uTime) * 0.1;   │
│   │ ...                            │
├────────────────────────────────────┤
│ ▼ Uniforms (5)                     │
│ ▼ Attributes (3)                   │
│ ▼ Varyings (2)                     │
├────────────────────────────────────┤
│ [Edit] [Reset] [Export] [Copy]     │
└────────────────────────────────────┘
```

---

## Viewing Shader Code

### Built-in Material Shaders

View Three.js's generated shader code:

```typescript
// Get compiled shader for built-in material
const shaderInfo = probe.getCompiledShader(mesh.material);

console.log(shaderInfo.vertexShader);
console.log(shaderInfo.fragmentShader);
```

### Custom ShaderMaterial

For custom shaders, view your original code plus Three.js injections:

```typescript
const material = new THREE.ShaderMaterial({
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    uniform vec3 uColor;
    void main() {
      gl_FragColor = vec4(uColor, 1.0);
    }
  `,
  uniforms: {
    uColor: { value: new THREE.Color('#ff6b6b') }
  }
});
```

### Shader Includes

View resolved shader chunks and includes:

```
┌────────────────────────────────────┐
│ 📁 Shader Chunks                   │
├────────────────────────────────────┤
│ ▶ common                           │
│ ▶ uv_pars_vertex                   │
│ ▶ envmap_pars_vertex               │
│ ▶ lights_pars_begin                │
│ ▶ normal_pars_vertex               │
└────────────────────────────────────┘
```

Click to expand and view chunk contents.

---

## Live Shader Editing

### In-Editor Modifications

Click **[Edit]** to open the shader editor:

```
┌────────────────────────────────────────────────┐
│ Fragment Shader - CustomMaterial    [✓] [✗]   │
├────────────────────────────────────────────────┤
│  1│ precision highp float;                     │
│  2│                                            │
│  3│ varying vec2 vUv;                          │
│  4│ uniform float uTime;                       │
│  5│ uniform vec3 uColor;                       │
│  6│                                            │
│  7│ void main() {                              │
│  8│   vec3 color = uColor;                     │
│  9│   color *= 0.5 + 0.5 * sin(uTime + vUv.x); │
│ 10│   gl_FragColor = vec4(color, 1.0);         │
│ 11│ }                                          │
├────────────────────────────────────────────────┤
│ ✅ Compiled successfully                       │
│ [Apply] [Revert] [Format] [Copy]               │
└────────────────────────────────────────────────┘
```

### Hot Reload

Changes compile and apply instantly:

```typescript
// Enable hot reload (default: on)
probe.setShaderHotReload(true);

// Listen for shader changes
probe.onShaderRecompile((material, success, error) => {
  if (!success) {
    console.error('Shader error:', error);
  }
});
```

### Programmatic Editing

```typescript
// Update shader code
probe.updateShader(material, 'fragment', `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  
  void main() {
    vec3 color = vec3(vUv, 0.5 + 0.5 * sin(uTime));
    gl_FragColor = vec4(color, 1.0);
  }
`);
```

---

## Uniform Debugging

### Uniform Inspector

All uniforms are listed with their current values:

```
┌────────────────────────────────────┐
│ ▼ Uniforms                         │
├────────────────────────────────────┤
│ uTime: float                       │
│   Value: 3.14159                   │
│   [━━━━━━━━●━━] 3.14               │
│                                    │
│ uColor: vec3                       │
│   Value: [1.0, 0.42, 0.42]         │
│   [■ #ff6b6b] Color Picker         │
│                                    │
│ uIntensity: float                  │
│   Value: 0.8                       │
│   [━━━━━━●━━━━] 0.8                │
│                                    │
│ uTexture: sampler2D                │
│   Value: Texture #1234             │
│   [🖼️ Preview] [Swap]              │
│                                    │
│ uMatrix: mat4                      │
│   [View Matrix] [Edit]             │
└────────────────────────────────────┘
```

### Editing Uniforms

```typescript
// Edit through 3Lens
probe.setUniform(material, 'uIntensity', 0.5);
probe.setUniform(material, 'uColor', new THREE.Color('#4ecdc4'));

// Direct editing (works immediately - no needsUpdate required)
material.uniforms.uIntensity.value = 0.5;
material.uniforms.uColor.value = new THREE.Color('#4ecdc4');
```

### Watch Uniforms

Monitor uniform changes over time:

```typescript
// Watch specific uniform
probe.watchUniform(material, 'uTime', (value) => {
  console.log('uTime changed:', value);
});

// Watch all uniforms
probe.watchAllUniforms(material, (name, value) => {
  console.log(`${name} = ${value}`);
});
```

---

## Visual Debug Modes

### Built-in Debug Views

Toggle visual debug modes to diagnose issues:

```
┌────────────────────────────────────┐
│ Visual Debug Modes                 │
├────────────────────────────────────┤
│ ○ Normal                           │
│ ● Normals (World)                  │
│ ○ Normals (View)                   │
│ ○ UVs                              │
│ ○ Depth                            │
│ ○ Wireframe                        │
│ ○ Overdraw                         │
│ ○ Vertex Colors                    │
│ ○ Tangents                         │
│ ○ Bitangents                       │
└────────────────────────────────────┘
```

### Enable Debug Mode

```typescript
// Enable normals visualization
probe.setDebugMode('normals');

// Options: 'normal', 'normals', 'uvs', 'depth', 'wireframe', 'overdraw'
probe.setDebugMode('uvs');

// Reset to normal rendering
probe.setDebugMode('normal');
```

### Custom Debug Shaders

Create your own debug visualizations:

```typescript
// Register custom debug mode
probe.registerDebugMode('custom-ao', {
  fragmentShader: `
    varying vec2 vUv;
    uniform sampler2D aoMap;
    
    void main() {
      float ao = texture2D(aoMap, vUv).r;
      gl_FragColor = vec4(vec3(ao), 1.0);
    }
  `
});

// Use custom mode
probe.setDebugMode('custom-ao');
```

### Debug Mode Gallery

| Mode | Description | Use Case |
|------|-------------|----------|
| Normals (World) | RGB = XYZ directions | Check normal map application |
| Normals (View) | View-space normals | Verify lighting calculations |
| UVs | RG = UV coordinates | Debug texture mapping |
| Depth | Grayscale depth | Check depth buffer precision |
| Wireframe | Edge lines | Verify mesh topology |
| Overdraw | Highlight overlapping | Find overdraw issues |
| Vertex Colors | Per-vertex colors | Debug vertex data |

---

## Error Handling

### Compilation Errors

3Lens displays clear error messages:

```
┌────────────────────────────────────────────────┐
│ ❌ Shader Compilation Error                    │
├────────────────────────────────────────────────┤
│ Fragment Shader                                │
│                                                │
│ ERROR: 0:15: 'undefined_function' : no         │
│ matching overloaded function found             │
│                                                │
│  13│   vec3 color = uColor;                    │
│  14│   color *= calculate_wave(vUv);           │
│> 15│   color = undefined_function(color);      │  ← Error
│  16│   gl_FragColor = vec4(color, 1.0);        │
│  17│ }                                         │
│                                                │
│ [Previous Shader] [Copy Error] [Dismiss]       │
└────────────────────────────────────────────────┘
```

### Runtime Errors

Detect shader precision and rendering issues:

```typescript
// Enable shader validation
probe.setShaderValidation({
  checkPrecision: true,
  checkDivideByZero: true,
  warnOnBranching: true,
});

// Listen for warnings
probe.onShaderWarning((material, warnings) => {
  warnings.forEach(w => console.warn(w));
});
```

### Common Errors and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `undefined variable` | Missing uniform declaration | Add `uniform` declaration |
| `type mismatch` | Wrong data type in operation | Cast or convert types |
| `undeclared identifier` | Using built-in without include | Add shader chunk |
| `precision not specified` | Missing precision qualifier | Add `precision highp float;` |

---

## Performance Profiling

### Shader Complexity Analysis

```
┌────────────────────────────────────┐
│ 📊 Shader Analysis                 │
├────────────────────────────────────┤
│ Instructions:                      │
│   Vertex: 23 ALU, 4 TEX            │
│   Fragment: 45 ALU, 8 TEX          │
│                                    │
│ Complexity: ████████░░ High        │
│                                    │
│ ⚠️ Warnings:                       │
│ • 3 texture samples in loop        │
│ • Dynamic branching detected       │
│ • pow() with non-constant exponent │
└────────────────────────────────────┘
```

### GPU Timing

```typescript
// Enable GPU timing for shader
const timing = probe.getShaderTiming(material);

console.log(`Vertex shader: ${timing.vertex}ms`);
console.log(`Fragment shader: ${timing.fragment}ms`);
```

### Optimization Suggestions

3Lens provides optimization hints:

```
┌────────────────────────────────────────────────┐
│ 💡 Optimization Suggestions                    │
├────────────────────────────────────────────────┤
│ 1. Move texture lookup outside loop            │
│    Line 23: texture2D() called 16x             │
│                                                │
│ 2. Use mediump for color calculations          │
│    highp not needed for 0-1 color range        │
│                                                │
│ 3. Precompute sin/cos in vertex shader         │
│    Fragment shader calculates per-pixel        │
│                                                │
│ 4. Consider using lookup texture               │
│    Complex gradient could be prebaked          │
└────────────────────────────────────────────────┘
```

---

## WebGPU/WGSL Support

### WGSL Shader Inspection

For WebGPU renderers, 3Lens supports WGSL:

```
┌────────────────────────────────────┐
│ 🔧 WGSL Shader Inspector           │
├────────────────────────────────────┤
│  1│ @group(0) @binding(0)          │
│  2│ var<uniform> uniforms: Uniforms│
│  3│                                │
│  4│ struct VertexOutput {          │
│  5│   @builtin(position) pos: vec4f│
│  6│   @location(0) uv: vec2f,      │
│  7│ }                              │
│  8│                                │
│  9│ @vertex                        │
│ 10│ fn vs_main(@builtin(...        │
└────────────────────────────────────┘
```

### WGSL Editing

```typescript
// Update WGSL shader
probe.updateWGSLShader(material, 'vertex', `
  @vertex
  fn vs_main(@builtin(vertex_index) idx: u32) -> @builtin(position) vec4f {
    // ...
  }
`);
```

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Shift+S` | Open shader inspector |
| `Ctrl+Enter` | Compile and apply changes |
| `Ctrl+Z` | Undo shader change |
| `Ctrl+Shift+Z` | Redo shader change |
| `Ctrl+/` | Toggle comment |
| `Ctrl+D` | Duplicate line |
| `F2` | Format code |

### Debug Mode Shortcuts

| Key | Action |
|-----|--------|
| `N` | Toggle normals view |
| `U` | Toggle UV view |
| `Z` | Toggle depth view |
| `W` | Toggle wireframe |
| `O` | Toggle overdraw |
| `Escape` | Return to normal view |

---

## Framework Integration

### React

```tsx
import { useThreeLensProbe, useSelectedObject } from '@3lens/react-bridge';
import { useState } from 'react';

function ShaderEditor() {
  const probe = useThreeLensProbe();
  const { selectedNode } = useSelectedObject();
  const [debugMode, setDebugMode] = useState('normal');
  
  const material = selectedNode?.object?.material;
  const isShaderMaterial = material?.type === 'ShaderMaterial';
  
  if (!isShaderMaterial) {
    return <div>Select a mesh with ShaderMaterial</div>;
  }
  
  return (
    <div className="shader-editor">
      <h3>Debug Modes</h3>
      <select 
        value={debugMode}
        onChange={(e) => {
          setDebugMode(e.target.value);
          probe.setDebugMode(e.target.value);
        }}
      >
        <option value="normal">Normal</option>
        <option value="normals">Normals</option>
        <option value="uvs">UVs</option>
        <option value="depth">Depth</option>
        <option value="wireframe">Wireframe</option>
      </select>
      
      <h3>Uniforms</h3>
      {Object.entries(material.uniforms).map(([name, uniform]) => (
        <div key={name}>
          <label>{name}</label>
          <input
            type="number"
            step="0.1"
            value={uniform.value}
            onChange={(e) => {
              probe.setUniform(material, name, parseFloat(e.target.value));
            }}
          />
        </div>
      ))}
    </div>
  );
}
```

### Vue

```vue
<script setup>
import { useThreeLens, useSelectedObject } from '@3lens/vue-bridge';
import { computed, ref } from 'vue';

const { probe } = useThreeLens();
const { selectedNode } = useSelectedObject();
const debugMode = ref('normal');

const material = computed(() => selectedNode.value?.object?.material);
const isShaderMaterial = computed(() => material.value?.type === 'ShaderMaterial');
const uniforms = computed(() => {
  if (!isShaderMaterial.value) return [];
  return Object.entries(material.value.uniforms);
});

function setDebugMode(mode) {
  debugMode.value = mode;
  probe.value?.setDebugMode(mode);
}

function updateUniform(name, value) {
  probe.value?.setUniform(material.value, name, value);
}
</script>

<template>
  <div v-if="isShaderMaterial" class="shader-editor">
    <h3>Debug Modes</h3>
    <select :value="debugMode" @change="setDebugMode($event.target.value)">
      <option value="normal">Normal</option>
      <option value="normals">Normals</option>
      <option value="uvs">UVs</option>
      <option value="depth">Depth</option>
      <option value="wireframe">Wireframe</option>
    </select>
    
    <h3>Uniforms</h3>
    <div v-for="[name, uniform] in uniforms" :key="name">
      <label>{{ name }}</label>
      <input
        type="number"
        step="0.1"
        :value="uniform.value"
        @input="updateUniform(name, parseFloat($event.target.value))"
      />
    </div>
  </div>
  <div v-else>
    Select a mesh with ShaderMaterial
  </div>
</template>
```

---

## Best Practices

### 1. Use Debug Modes First

Before diving into code, use visual debug modes to identify the issue category.

### 2. Isolate Problematic Code

Comment out sections to narrow down which part of the shader causes issues.

### 3. Check Precision

Use appropriate precision (`lowp`, `mediump`, `highp`) for your data:

```glsl
precision mediump float; // Good for colors
precision highp float;   // Needed for positions
```

### 4. Validate Uniforms

Ensure uniforms are set before first render:

```typescript
const material = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 }, // Always initialize
    uColor: { value: new THREE.Color() }, // Not undefined!
  }
});
```

### 5. Profile on Target Hardware

Shader performance varies significantly across GPUs. Test on your target devices.

---

## Related Guides

- [Material Editing Guide](./MATERIAL-EDITING-GUIDE.md)
- [Performance Debugging Guide](./PERFORMANCE-DEBUGGING-GUIDE.md)

## API Reference

- [Shader API](/api/core/shader-api)
- [Debug Modes](/api/core/debug-modes)
