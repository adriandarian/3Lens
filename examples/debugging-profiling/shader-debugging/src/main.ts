/**
 * 3Lens Shader Debugging Example
 * 
 * This example demonstrates custom GLSL shaders in Three.js.
 * Use the 3Lens overlay to:
 * - Inspect materials and their shader properties
 * - View uniform values in the Materials panel
 * - Monitor shader compilation
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';
import '@3lens/themes/styles.css';

// =============================================================================
// Scene Setup
// =============================================================================

const scene = new THREE.Scene();
scene.name = 'ShaderDebuggingScene';
scene.background = new THREE.Color(0x0d1117);

const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 2, 5);
camera.name = 'MainCamera';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.getElementById('app')!.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 0, 0);

const clock = new THREE.Clock();

// =============================================================================
// Custom Shaders
// =============================================================================

// Gradient Shader
const gradientShader = {
  uniforms: {
    uColorA: { value: new THREE.Color(0xff6b6b) },
    uColorB: { value: new THREE.Color(0x4ecdc4) },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    void main() {
      vec3 color = mix(uColorA, uColorB, vUv.y);
      gl_FragColor = vec4(color, 1.0);
    }
  `,
};

// Wave Shader
const waveShader = {
  uniforms: {
    uTime: { value: 0 },
    uAmplitude: { value: 0.3 },
    uFrequency: { value: 3.0 },
  },
  vertexShader: `
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
  `,
  fragmentShader: `
    varying vec2 vUv;
    varying float vElevation;
    
    void main() {
      vec3 lowColor = vec3(0.1, 0.3, 0.5);
      vec3 highColor = vec3(0.9, 0.5, 0.3);
      float t = (vElevation + 0.3) / 0.6;
      vec3 color = mix(lowColor, highColor, t);
      gl_FragColor = vec4(color, 1.0);
    }
  `,
};

// Fresnel Shader
const fresnelShader = {
  uniforms: {
    uFresnelPower: { value: 2.0 },
    uFresnelColor: { value: new THREE.Color(0x00ffff) },
    uBaseColor: { value: new THREE.Color(0x1a1a2e) },
  },
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vViewDir;
    
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vViewDir = normalize(cameraPosition - worldPos.xyz);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec3 vNormal;
    varying vec3 vViewDir;
    uniform float uFresnelPower;
    uniform vec3 uFresnelColor;
    uniform vec3 uBaseColor;
    
    void main() {
      float fresnel = pow(1.0 - dot(vNormal, vViewDir), uFresnelPower);
      vec3 color = mix(uBaseColor, uFresnelColor, fresnel);
      gl_FragColor = vec4(color, 1.0);
    }
  `,
};

// Noise Shader
const noiseShader = {
  uniforms: {
    uTime: { value: 0 },
    uScale: { value: 5.0 },
    uSpeed: { value: 1.0 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    uniform float uTime;
    uniform float uScale;
    uniform float uSpeed;
    
    // Simple noise function
    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }
    
    float noise(vec2 st) {
      vec2 i = floor(st);
      vec2 f = fract(st);
      float a = random(i);
      float b = random(i + vec2(1.0, 0.0));
      float c = random(i + vec2(0.0, 1.0));
      float d = random(i + vec2(1.0, 1.0));
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }
    
    void main() {
      vec2 st = vUv * uScale;
      st += uTime * uSpeed * 0.1;
      float n = noise(st);
      vec3 color = vec3(n * 0.5 + 0.2, n * 0.3 + 0.4, n * 0.8 + 0.2);
      gl_FragColor = vec4(color, 1.0);
    }
  `,
};

// =============================================================================
// Create Shader Meshes
// =============================================================================

const shadersGroup = new THREE.Group();
shadersGroup.name = 'ShaderMeshes';
scene.add(shadersGroup);

// Gradient sphere
const gradientMaterial = new THREE.ShaderMaterial(gradientShader);
gradientMaterial.name = 'GradientMaterial';
const gradientMesh = new THREE.Mesh(new THREE.SphereGeometry(0.8, 64, 64), gradientMaterial);
gradientMesh.position.set(-2.5, 0, 0);
gradientMesh.name = 'GradientSphere';
shadersGroup.add(gradientMesh);

// Wave plane
const waveMaterial = new THREE.ShaderMaterial(waveShader);
waveMaterial.name = 'WaveMaterial';
waveMaterial.side = THREE.DoubleSide;
const waveMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2, 64, 64), waveMaterial);
waveMesh.position.set(-0.8, 0, 0);
waveMesh.name = 'WavePlane';
shadersGroup.add(waveMesh);

// Fresnel torus
const fresnelMaterial = new THREE.ShaderMaterial(fresnelShader);
fresnelMaterial.name = 'FresnelMaterial';
const fresnelMesh = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.2, 32, 64), fresnelMaterial);
fresnelMesh.position.set(1, 0, 0);
fresnelMesh.name = 'FresnelTorus';
shadersGroup.add(fresnelMesh);

// Noise box
const noiseMaterial = new THREE.ShaderMaterial(noiseShader);
noiseMaterial.name = 'NoiseMaterial';
const noiseMesh = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 1.2), noiseMaterial);
noiseMesh.position.set(2.8, 0, 0);
noiseMesh.name = 'NoiseBox';
shadersGroup.add(noiseMesh);

// =============================================================================
// 3Lens Integration
// =============================================================================

const probe = createProbe({
  name: 'ShaderDebuggingProbe',
  sampling: {
    frameStatsInterval: 1,
    sceneSnapshotInterval: 30,
  },
});

probe.observeRenderer(renderer);
probe.observeScene(scene);
probe.setAppName('Shader Debugging');

// Register shader info as logical entity
probe.registerLogicalEntity('shader-gallery', 'Shader Gallery', {
  category: 'Materials',
  shaders: [
    { name: 'Gradient', type: 'Fragment', mesh: 'GradientSphere' },
    { name: 'Wave', type: 'Vertex', mesh: 'WavePlane' },
    { name: 'Fresnel', type: 'Both', mesh: 'FresnelTorus' },
    { name: 'Noise', type: 'Fragment', mesh: 'NoiseBox' },
  ],
  description: 'Click on meshes in 3Lens to inspect shader uniforms',
});

createOverlay({ probe, theme: 'dark' });

// =============================================================================
// Animation Loop
// =============================================================================

function animate() {
  requestAnimationFrame(animate);
  
  const elapsed = clock.getElapsedTime();
  
  // Update time uniforms
  waveMaterial.uniforms.uTime.value = elapsed;
  noiseMaterial.uniforms.uTime.value = elapsed;
  
  // Rotate meshes
  gradientMesh.rotation.y = elapsed * 0.3;
  fresnelMesh.rotation.x = elapsed * 0.5;
  fresnelMesh.rotation.y = elapsed * 0.3;
  noiseMesh.rotation.y = elapsed * 0.2;
  noiseMesh.rotation.x = elapsed * 0.1;
  
  controls.update();
  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();

console.log(`
🎨 Shader Debugging Example
============================
This example shows 4 custom GLSL shaders:
- Gradient (fragment shader)
- Wave (vertex displacement)
- Fresnel (rim lighting)
- Noise (procedural texture)

Open the 3Lens overlay to:
- Select meshes and inspect shader materials
- View uniform values in the Materials panel
- See shader properties and types
`);
