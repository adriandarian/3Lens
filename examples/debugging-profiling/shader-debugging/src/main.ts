/**
 * 3Lens Shader Debugging Example
 * 
 * This example demonstrates how to debug custom GLSL shaders in Three.js:
 * 
 * 1. View shader source code in 3Lens
 * 2. Live edit and recompile shaders
 * 3. Catch and display shader errors
 * 4. Inspect uniforms and varyings
 * 5. Understand common shader issues
 */

import * as THREE from 'three';
import { createProbe } from '@3lens/core';
import { bootstrapOverlay } from '@3lens/overlay';
import '@3lens/themes/styles.css';

// ============================================================================
// Shader Definitions
// ============================================================================

interface ShaderDefinition {
  id: string;
  name: string;
  description: string;
  type: 'vertex' | 'fragment' | 'both';
  vertex: string;
  fragment: string;
  uniforms: Record<string, THREE.IUniform>;
  uniformControls?: UniformControl[];
}

interface UniformControl {
  name: string;
  type: 'range' | 'color';
  min?: number;
  max?: number;
  step?: number;
}

const SHADERS: ShaderDefinition[] = [
  {
    id: 'gradient',
    name: 'Simple Gradient',
    description: 'Basic gradient shader using UV coordinates',
    type: 'fragment',
    vertex: `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
    `.trim(),
    fragment: `
varying vec2 vUv;
uniform vec3 uColorA;
uniform vec3 uColorB;

void main() {
  vec3 color = mix(uColorA, uColorB, vUv.y);
  gl_FragColor = vec4(color, 1.0);
}
    `.trim(),
    uniforms: {
      uColorA: { value: new THREE.Color(0xff6b6b) },
      uColorB: { value: new THREE.Color(0x4ecdc4) },
    },
    uniformControls: [
      { name: 'uColorA', type: 'color' },
      { name: 'uColorB', type: 'color' },
    ]
  },
  {
    id: 'wave',
    name: 'Animated Wave',
    description: 'Vertex displacement with sine wave animation',
    type: 'vertex',
    vertex: `
uniform float uTime;
uniform float uAmplitude;
uniform float uFrequency;

varying vec2 vUv;
varying float vElevation;

void main() {
  vUv = uv;
  
  vec3 pos = position;
  float elevation = sin(pos.x * uFrequency + uTime) * uAmplitude;
  elevation += sin(pos.y * uFrequency * 0.5 + uTime * 0.7) * uAmplitude * 0.5;
  pos.z += elevation;
  
  vElevation = elevation;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
    `.trim(),
    fragment: `
varying vec2 vUv;
varying float vElevation;

uniform vec3 uLowColor;
uniform vec3 uHighColor;

void main() {
  float mixValue = (vElevation + 0.5) * 0.5 + 0.5;
  vec3 color = mix(uLowColor, uHighColor, mixValue);
  gl_FragColor = vec4(color, 1.0);
}
    `.trim(),
    uniforms: {
      uTime: { value: 0 },
      uAmplitude: { value: 0.3 },
      uFrequency: { value: 3.0 },
      uLowColor: { value: new THREE.Color(0x1a1a2e) },
      uHighColor: { value: new THREE.Color(0x16213e) },
    },
    uniformControls: [
      { name: 'uAmplitude', type: 'range', min: 0, max: 1, step: 0.01 },
      { name: 'uFrequency', type: 'range', min: 1, max: 10, step: 0.1 },
      { name: 'uLowColor', type: 'color' },
      { name: 'uHighColor', type: 'color' },
    ]
  },
  {
    id: 'fresnel',
    name: 'Fresnel Effect',
    description: 'View-dependent edge glow effect',
    type: 'both',
    vertex: `
varying vec3 vNormal;
varying vec3 vViewPosition;

void main() {
  vNormal = normalize(normalMatrix * normal);
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  vViewPosition = -mvPosition.xyz;
  gl_Position = projectionMatrix * mvPosition;
}
    `.trim(),
    fragment: `
varying vec3 vNormal;
varying vec3 vViewPosition;

uniform vec3 uBaseColor;
uniform vec3 uFresnelColor;
uniform float uFresnelPower;

void main() {
  vec3 viewDir = normalize(vViewPosition);
  float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), uFresnelPower);
  
  vec3 color = mix(uBaseColor, uFresnelColor, fresnel);
  gl_FragColor = vec4(color, 1.0);
}
    `.trim(),
    uniforms: {
      uBaseColor: { value: new THREE.Color(0x1a1a2e) },
      uFresnelColor: { value: new THREE.Color(0x58a6ff) },
      uFresnelPower: { value: 2.0 },
    },
    uniformControls: [
      { name: 'uBaseColor', type: 'color' },
      { name: 'uFresnelColor', type: 'color' },
      { name: 'uFresnelPower', type: 'range', min: 0.5, max: 5, step: 0.1 },
    ]
  },
  {
    id: 'noise',
    name: 'Procedural Noise',
    description: 'Classic Perlin-style noise pattern',
    type: 'fragment',
    vertex: `
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vUv = uv;
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
    `.trim(),
    fragment: `
varying vec2 vUv;
varying vec3 vPosition;

uniform float uTime;
uniform float uScale;
uniform vec3 uColor1;
uniform vec3 uColor2;

// Simple hash function
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

// Value noise
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

// Fractal Brownian Motion
float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 5; i++) {
    value += amplitude * noise(p);
    p *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  vec2 p = vUv * uScale + uTime * 0.1;
  float n = fbm(p);
  
  vec3 color = mix(uColor1, uColor2, n);
  gl_FragColor = vec4(color, 1.0);
}
    `.trim(),
    uniforms: {
      uTime: { value: 0 },
      uScale: { value: 5.0 },
      uColor1: { value: new THREE.Color(0x0d1117) },
      uColor2: { value: new THREE.Color(0x238636) },
    },
    uniformControls: [
      { name: 'uScale', type: 'range', min: 1, max: 20, step: 0.5 },
      { name: 'uColor1', type: 'color' },
      { name: 'uColor2', type: 'color' },
    ]
  },
  {
    id: 'hologram',
    name: 'Hologram Effect',
    description: 'Sci-fi holographic scanline effect',
    type: 'both',
    vertex: `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
    `.trim(),
    fragment: `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

uniform float uTime;
uniform vec3 uColor;
uniform float uScanlineSpeed;
uniform float uScanlineCount;
uniform float uGlitchIntensity;

float random(vec2 st) {
  return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  // Base color with fresnel
  vec3 viewDir = normalize(cameraPosition - vPosition);
  float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 2.0);
  
  // Scanlines
  float scanline = sin(vPosition.y * uScanlineCount + uTime * uScanlineSpeed) * 0.5 + 0.5;
  scanline = pow(scanline, 0.5);
  
  // Glitch effect
  float glitch = 0.0;
  if (uGlitchIntensity > 0.0) {
    float glitchTime = floor(uTime * 10.0);
    glitch = step(0.95 - uGlitchIntensity * 0.1, random(vec2(glitchTime, vUv.y * 10.0)));
  }
  
  // Combine effects
  float alpha = fresnel * 0.5 + scanline * 0.3 + 0.2;
  alpha += glitch * 0.5;
  
  vec3 color = uColor * (0.5 + fresnel * 0.5);
  color += glitch * vec3(0.5, 0.0, 0.5);
  
  gl_FragColor = vec4(color, alpha);
}
    `.trim(),
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(0x00ffff) },
      uScanlineSpeed: { value: 5.0 },
      uScanlineCount: { value: 50.0 },
      uGlitchIntensity: { value: 0.3 },
    },
    uniformControls: [
      { name: 'uColor', type: 'color' },
      { name: 'uScanlineSpeed', type: 'range', min: 0, max: 20, step: 0.5 },
      { name: 'uScanlineCount', type: 'range', min: 10, max: 100, step: 5 },
      { name: 'uGlitchIntensity', type: 'range', min: 0, max: 1, step: 0.05 },
    ]
  },
  {
    id: 'toon',
    name: 'Toon Shading',
    description: 'Cel-shaded/cartoon style lighting',
    type: 'fragment',
    vertex: `
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  vNormal = normalize(normalMatrix * normal);
  vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
    `.trim(),
    fragment: `
varying vec3 vNormal;
varying vec3 vPosition;

uniform vec3 uColor;
uniform vec3 uLightDirection;
uniform float uSteps;

void main() {
  vec3 lightDir = normalize(uLightDirection);
  float intensity = dot(vNormal, lightDir);
  
  // Quantize the lighting
  intensity = floor(intensity * uSteps) / uSteps;
  intensity = max(0.2, intensity); // Ambient minimum
  
  vec3 color = uColor * intensity;
  
  // Add rim light
  vec3 viewDir = normalize(-vPosition);
  float rim = 1.0 - max(0.0, dot(viewDir, vNormal));
  rim = smoothstep(0.6, 1.0, rim);
  color += rim * 0.3;
  
  gl_FragColor = vec4(color, 1.0);
}
    `.trim(),
    uniforms: {
      uColor: { value: new THREE.Color(0xff6b6b) },
      uLightDirection: { value: new THREE.Vector3(1, 1, 1) },
      uSteps: { value: 4.0 },
    },
    uniformControls: [
      { name: 'uColor', type: 'color' },
      { name: 'uSteps', type: 'range', min: 2, max: 10, step: 1 },
    ]
  }
];

// Common shader errors for "Break It" feature
const SHADER_BREAKS = {
  vertex: [
    { error: 'Missing semicolon', code: 'gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0)' },
    { error: 'Undefined variable', code: 'gl_Position = projectionMatrix * modelViewMatrix * vec4(undefinedVar, 1.0);' },
    { error: 'Type mismatch', code: 'gl_Position = projectionMatrix * modelViewMatrix * position;' },
    { error: 'Missing main()', code: '// main function removed\nvoid notMain() { }' },
  ],
  fragment: [
    { error: 'Missing semicolon', code: 'gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0)' },
    { error: 'Undefined varying', code: 'gl_FragColor = vec4(vUndefined, 1.0);' },
    { error: 'Wrong component count', code: 'gl_FragColor = vec3(1.0, 0.0, 0.0);' },
    { error: 'Division by zero', code: 'float x = 1.0 / 0.0;\ngl_FragColor = vec4(x);' },
  ]
};

// ============================================================================
// Scene Setup
// ============================================================================

const container = document.getElementById('canvas-container')!;

const scene = new THREE.Scene();
scene.name = 'ShaderDebuggingScene';
scene.background = new THREE.Color(0x0d1117);

const camera = new THREE.PerspectiveCamera(
  60,
  container.clientWidth / container.clientHeight,
  0.1,
  100
);
camera.position.set(0, 0, 4);
camera.name = 'Main Camera';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

// ============================================================================
// State
// ============================================================================

let currentShader: ShaderDefinition = SHADERS[0];
let currentMaterial: THREE.ShaderMaterial | null = null;
let currentMesh: THREE.Mesh | null = null;
let currentTab: 'vertex' | 'fragment' = 'vertex';
let editedVertex: string = '';
let editedFragment: string = '';

// ============================================================================
// Geometry
// ============================================================================

function getGeometryForShader(shader: ShaderDefinition): THREE.BufferGeometry {
  switch (shader.id) {
    case 'wave':
      return new THREE.PlaneGeometry(4, 4, 64, 64);
    case 'fresnel':
    case 'hologram':
    case 'toon':
      return new THREE.SphereGeometry(1.5, 64, 64);
    case 'noise':
    case 'gradient':
    default:
      return new THREE.BoxGeometry(2, 2, 2, 32, 32, 32);
  }
}

// ============================================================================
// Shader Management
// ============================================================================

function createMaterial(shader: ShaderDefinition, vertex?: string, fragment?: string): THREE.ShaderMaterial {
  const material = new THREE.ShaderMaterial({
    vertexShader: vertex || shader.vertex,
    fragmentShader: fragment || shader.fragment,
    uniforms: JSON.parse(JSON.stringify(shader.uniforms)),
    transparent: shader.id === 'hologram',
    side: shader.id === 'hologram' ? THREE.DoubleSide : THREE.FrontSide,
  });
  
  // Restore uniform values from original
  for (const key in shader.uniforms) {
    const value = shader.uniforms[key].value;
    if (value instanceof THREE.Color) {
      material.uniforms[key].value = value.clone();
    } else if (value instanceof THREE.Vector3) {
      material.uniforms[key].value = value.clone();
    } else {
      material.uniforms[key].value = value;
    }
  }
  
  return material;
}

function loadShader(shader: ShaderDefinition): void {
  // Remove old mesh
  if (currentMesh) {
    scene.remove(currentMesh);
    currentMesh.geometry.dispose();
    if (currentMaterial) {
      currentMaterial.dispose();
    }
  }
  
  currentShader = shader;
  editedVertex = shader.vertex;
  editedFragment = shader.fragment;
  
  try {
    currentMaterial = createMaterial(shader);
    const geometry = getGeometryForShader(shader);
    currentMesh = new THREE.Mesh(geometry, currentMaterial);
    currentMesh.name = `Shader_${shader.id}`;
    scene.add(currentMesh);
    
    hideError();
    updateUI();
  } catch (e) {
    showError(String(e));
  }
}

function compileShader(): void {
  if (!currentShader) return;
  
  try {
    // Test compile by creating material
    const testMaterial = createMaterial(currentShader, editedVertex, editedFragment);
    
    // Force compilation
    const testMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), testMaterial);
    scene.add(testMesh);
    renderer.compile(scene, camera);
    scene.remove(testMesh);
    
    // Check for WebGL errors
    const gl = renderer.getContext();
    const error = gl.getError();
    if (error !== gl.NO_ERROR) {
      throw new Error(`WebGL Error: ${error}`);
    }
    
    // If successful, apply to current mesh
    if (currentMesh && currentMaterial) {
      const oldMaterial = currentMaterial;
      currentMaterial = createMaterial(currentShader, editedVertex, editedFragment);
      currentMesh.material = currentMaterial;
      oldMaterial.dispose();
    }
    
    testMaterial.dispose();
    hideError();
    
    console.log('✅ Shader compiled successfully');
  } catch (e) {
    showError(String(e));
    console.error('❌ Shader compilation failed:', e);
  }
}

function resetShader(): void {
  if (!currentShader) return;
  
  editedVertex = currentShader.vertex;
  editedFragment = currentShader.fragment;
  loadShader(currentShader);
}

function breakShader(): void {
  const breaks = currentTab === 'vertex' ? SHADER_BREAKS.vertex : SHADER_BREAKS.fragment;
  const randomBreak = breaks[Math.floor(Math.random() * breaks.length)];
  
  if (currentTab === 'vertex') {
    editedVertex = randomBreak.code;
  } else {
    editedFragment = randomBreak.code;
  }
  
  updateEditor();
  compileShader();
}

// ============================================================================
// Error Handling
// ============================================================================

function showError(message: string): void {
  const errorPanel = document.getElementById('error-panel')!;
  const errorMessage = document.getElementById('error-message')!;
  
  errorPanel.classList.add('visible');
  errorMessage.textContent = message;
}

function hideError(): void {
  const errorPanel = document.getElementById('error-panel')!;
  errorPanel.classList.remove('visible');
}

// ============================================================================
// UI
// ============================================================================

function populateShaderList(): void {
  const list = document.getElementById('shader-list')!;
  list.innerHTML = SHADERS.map(shader => `
    <div class="shader-item ${shader.id === currentShader.id ? 'active' : ''}" data-id="${shader.id}">
      <h3>
        ${shader.name}
        <span class="shader-badge badge-${shader.type}">${shader.type}</span>
      </h3>
      <p>${shader.description}</p>
    </div>
  `).join('');
  
  // Add click handlers
  list.querySelectorAll('.shader-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = item.getAttribute('data-id');
      const shader = SHADERS.find(s => s.id === id);
      if (shader) {
        loadShader(shader);
        populateShaderList();
      }
    });
  });
}

function updateEditor(): void {
  const textarea = document.getElementById('shader-code') as HTMLTextAreaElement;
  textarea.value = currentTab === 'vertex' ? editedVertex : editedFragment;
}

function updateUI(): void {
  // Update info panel
  document.getElementById('info-name')!.textContent = currentShader.name;
  document.getElementById('info-type')!.textContent = currentShader.type;
  document.getElementById('info-uniforms')!.textContent = Object.keys(currentShader.uniforms).length.toString();
  
  // Count varyings in vertex shader
  const varyingMatches = currentShader.vertex.match(/varying\s+\w+\s+\w+/g);
  document.getElementById('info-varyings')!.textContent = (varyingMatches?.length || 0).toString();
  
  // Update uniform controls
  const controlsContainer = document.getElementById('uniform-controls')!;
  if (currentShader.uniformControls && currentShader.uniformControls.length > 0) {
    controlsContainer.innerHTML = '<h4>Uniform Controls</h4>' + currentShader.uniformControls.map(control => {
      if (control.type === 'color') {
        const colorValue = currentMaterial?.uniforms[control.name]?.value as THREE.Color;
        const hexColor = colorValue ? '#' + colorValue.getHexString() : '#ffffff';
        return `
          <div class="uniform-control">
            <label>${control.name}</label>
            <input type="color" data-uniform="${control.name}" value="${hexColor}">
          </div>
        `;
      } else {
        const value = currentMaterial?.uniforms[control.name]?.value || 0;
        return `
          <div class="uniform-control">
            <label>${control.name}: <span id="value-${control.name}">${value.toFixed(2)}</span></label>
            <input type="range" data-uniform="${control.name}" 
              min="${control.min}" max="${control.max}" step="${control.step}" value="${value}">
          </div>
        `;
      }
    }).join('');
    
    // Add event listeners
    controlsContainer.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        const uniformName = target.getAttribute('data-uniform')!;
        
        if (target.type === 'color') {
          if (currentMaterial) {
            currentMaterial.uniforms[uniformName].value = new THREE.Color(target.value);
          }
        } else {
          const value = parseFloat(target.value);
          if (currentMaterial) {
            currentMaterial.uniforms[uniformName].value = value;
          }
          const valueSpan = document.getElementById(`value-${uniformName}`);
          if (valueSpan) {
            valueSpan.textContent = value.toFixed(2);
          }
        }
      });
    });
  } else {
    controlsContainer.innerHTML = '<h4>Uniform Controls</h4><p style="font-size: 10px; color: #8b949e;">No controls for this shader</p>';
  }
  
  updateEditor();
}

// Tab switching
document.querySelectorAll('.editor-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const tabType = tab.getAttribute('data-tab') as 'vertex' | 'fragment';
    currentTab = tabType;
    
    document.querySelectorAll('.editor-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    
    updateEditor();
  });
});

// Editor changes
document.getElementById('shader-code')!.addEventListener('input', (e) => {
  const value = (e.target as HTMLTextAreaElement).value;
  if (currentTab === 'vertex') {
    editedVertex = value;
  } else {
    editedFragment = value;
  }
});

// Buttons
document.getElementById('btn-compile')!.addEventListener('click', compileShader);
document.getElementById('btn-reset')!.addEventListener('click', resetShader);
document.getElementById('btn-break')!.addEventListener('click', breakShader);

// ============================================================================
// 3Lens Integration
// ============================================================================

const probe = createProbe({
  renderer,
  scene,
  camera,
  name: 'ShaderDebugging'
});

bootstrapOverlay(probe, {
  theme: 'dark',
  defaultPanel: 'scene',
  keyboardShortcuts: true
});

// ============================================================================
// Animation
// ============================================================================

let isDragging = false;
let previousMouseX = 0;
let previousMouseY = 0;

container.addEventListener('mousedown', (e) => {
  isDragging = true;
  previousMouseX = e.clientX;
  previousMouseY = e.clientY;
});

container.addEventListener('mousemove', (e) => {
  if (!isDragging || !currentMesh) return;
  
  const deltaX = e.clientX - previousMouseX;
  const deltaY = e.clientY - previousMouseY;
  
  currentMesh.rotation.y += deltaX * 0.01;
  currentMesh.rotation.x += deltaY * 0.01;
  
  previousMouseX = e.clientX;
  previousMouseY = e.clientY;
});

container.addEventListener('mouseup', () => {
  isDragging = false;
});

container.addEventListener('mouseleave', () => {
  isDragging = false;
});

function animate(): void {
  requestAnimationFrame(animate);
  
  const time = performance.now() * 0.001;
  
  // Update time uniform if present
  if (currentMaterial && currentMaterial.uniforms.uTime) {
    currentMaterial.uniforms.uTime.value = time;
  }
  
  // Auto-rotate if not dragging
  if (!isDragging && currentMesh) {
    currentMesh.rotation.y += 0.002;
  }
  
  renderer.render(scene, camera);
  probe.onFrame();
}

// ============================================================================
// Resize
// ============================================================================

window.addEventListener('resize', () => {
  const width = container.clientWidth;
  const height = container.clientHeight;
  
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
});

// ============================================================================
// Initialize
// ============================================================================

populateShaderList();
loadShader(SHADERS[0]);
animate();

console.log(`
╔═══════════════════════════════════════════════════════════════╗
║            3Lens Shader Debugging Example                     ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  This example demonstrates shader debugging techniques:       ║
║                                                               ║
║  • Select different shader effects from the gallery           ║
║  • Edit vertex and fragment shaders live                      ║
║  • Click "Break It" to see common shader errors               ║
║  • Adjust uniforms with the control sliders                   ║
║                                                               ║
║  Press ~ to open 3Lens for shader analysis                    ║
║  Drag on the canvas to rotate the object                      ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`);

