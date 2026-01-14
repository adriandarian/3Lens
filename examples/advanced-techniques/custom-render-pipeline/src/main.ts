/**
 * Custom Render Pipeline Example
 * 
 * Demonstrates a deferred rendering pipeline with 3Lens integration:
 * - G-Buffer pass (MRT: albedo, normal, position, depth)
 * - SSAO pass (screen-space ambient occlusion)
 * - Lighting pass (deferred shading)
 * - Bloom pass (bright extraction + blur)
 * - Composite pass (final combine with vignette)
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';
import '@3lens/themes/styles.css';

// ============================================================================
// TYPES
// ============================================================================

interface RenderPass {
  id: string;
  name: string;
  enabled: boolean;
  renderTarget: THREE.WebGLRenderTarget | THREE.WebGLMultipleRenderTargets | null;
  material: THREE.ShaderMaterial | null;
  gpuTime: number;
  drawCalls: number;
  description: string;
}

type DebugView = 'final' | 'gbuffer' | 'depth' | 'normals';

// ============================================================================
// SHADER CODE
// ============================================================================

// G-Buffer vertex shader
const gBufferVertexShader = `
varying vec3 vWorldPosition;
varying vec3 vNormal;
varying vec2 vUv;

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPos.xyz;
  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
`;

// G-Buffer fragment shader (MRT output)
const gBufferFragmentShader = `
uniform vec3 uColor;
uniform float uRoughness;
uniform float uMetalness;

varying vec3 vWorldPosition;
varying vec3 vNormal;
varying vec2 vUv;

layout(location = 0) out vec4 gColor;
layout(location = 1) out vec4 gNormal;
layout(location = 2) out vec4 gPosition;

void main() {
  vec3 normal = normalize(vNormal);
  
  // Output to G-Buffer
  gColor = vec4(uColor, uMetalness);
  gNormal = vec4(normal * 0.5 + 0.5, uRoughness);
  gPosition = vec4(vWorldPosition, 1.0);
}
`;

// SSAO shader
const ssaoFragmentShader = `
uniform sampler2D tNormal;
uniform sampler2D tPosition;
uniform sampler2D tDepth;
uniform vec2 uResolution;
uniform float uRadius;
uniform mat4 uProjectionMatrix;

varying vec2 vUv;

const int SAMPLES = 16;
const vec3 KERNEL[16] = vec3[](
  vec3(0.04977, -0.04471, 0.04996),
  vec3(0.01457, 0.01653, 0.00224),
  vec3(-0.04065, -0.01937, 0.03193),
  vec3(0.01378, -0.09158, 0.04092),
  vec3(0.05599, 0.05979, 0.05766),
  vec3(0.09227, 0.04428, 0.01545),
  vec3(-0.00204, -0.05212, 0.0612),
  vec3(0.00408, 0.02303, 0.02478),
  vec3(-0.05294, -0.00419, 0.03337),
  vec3(-0.01464, 0.03244, 0.01464),
  vec3(0.06529, -0.02441, 0.02353),
  vec3(-0.01401, 0.04474, 0.03553),
  vec3(0.06607, 0.02579, 0.05057),
  vec3(-0.02616, 0.08153, 0.03673),
  vec3(0.07424, -0.05006, 0.01989),
  vec3(0.00799, -0.00232, 0.08776)
);

float rand(vec2 co) {
  return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec3 position = texture2D(tPosition, vUv).xyz;
  vec3 normal = texture2D(tNormal, vUv).xyz * 2.0 - 1.0;
  float depth = texture2D(tDepth, vUv).r;
  
  if (depth >= 1.0) {
    gl_FragColor = vec4(1.0);
    return;
  }
  
  // Random rotation
  float randomAngle = rand(vUv) * 6.28318;
  vec3 randomVec = vec3(cos(randomAngle), sin(randomAngle), 0.0);
  
  // Create TBN
  vec3 tangent = normalize(randomVec - normal * dot(randomVec, normal));
  vec3 bitangent = cross(normal, tangent);
  mat3 TBN = mat3(tangent, bitangent, normal);
  
  float occlusion = 0.0;
  for (int i = 0; i < SAMPLES; i++) {
    vec3 samplePos = position + TBN * KERNEL[i] * uRadius;
    
    vec4 offset = uProjectionMatrix * vec4(samplePos, 1.0);
    offset.xyz /= offset.w;
    offset.xyz = offset.xyz * 0.5 + 0.5;
    
    float sampleDepth = texture2D(tPosition, offset.xy).z;
    float rangeCheck = smoothstep(0.0, 1.0, uRadius / abs(position.z - sampleDepth));
    occlusion += (sampleDepth >= samplePos.z + 0.025 ? 1.0 : 0.0) * rangeCheck;
  }
  
  occlusion = 1.0 - (occlusion / float(SAMPLES));
  gl_FragColor = vec4(vec3(occlusion), 1.0);
}
`;

// Deferred lighting shader
const lightingFragmentShader = `
uniform sampler2D tColor;
uniform sampler2D tNormal;
uniform sampler2D tPosition;
uniform sampler2D tSSAO;
uniform vec3 uLightPositions[4];
uniform vec3 uLightColors[4];
uniform vec3 uCameraPosition;
uniform float uAmbientIntensity;

varying vec2 vUv;

const float PI = 3.14159265359;

// PBR functions
float DistributionGGX(vec3 N, vec3 H, float roughness) {
  float a = roughness * roughness;
  float a2 = a * a;
  float NdotH = max(dot(N, H), 0.0);
  float NdotH2 = NdotH * NdotH;
  
  float nom = a2;
  float denom = (NdotH2 * (a2 - 1.0) + 1.0);
  denom = PI * denom * denom;
  
  return nom / denom;
}

float GeometrySchlickGGX(float NdotV, float roughness) {
  float r = (roughness + 1.0);
  float k = (r * r) / 8.0;
  return NdotV / (NdotV * (1.0 - k) + k);
}

float GeometrySmith(vec3 N, vec3 V, vec3 L, float roughness) {
  float NdotV = max(dot(N, V), 0.0);
  float NdotL = max(dot(N, L), 0.0);
  return GeometrySchlickGGX(NdotV, roughness) * GeometrySchlickGGX(NdotL, roughness);
}

vec3 FresnelSchlick(float cosTheta, vec3 F0) {
  return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}

void main() {
  vec4 colorData = texture2D(tColor, vUv);
  vec4 normalData = texture2D(tNormal, vUv);
  vec3 position = texture2D(tPosition, vUv).xyz;
  float ao = texture2D(tSSAO, vUv).r;
  
  vec3 albedo = colorData.rgb;
  float metalness = colorData.a;
  vec3 normal = normalData.rgb * 2.0 - 1.0;
  float roughness = normalData.a;
  
  if (length(position) < 0.001) {
    gl_FragColor = vec4(0.02, 0.02, 0.03, 1.0);
    return;
  }
  
  vec3 V = normalize(uCameraPosition - position);
  vec3 F0 = mix(vec3(0.04), albedo, metalness);
  
  vec3 Lo = vec3(0.0);
  
  for (int i = 0; i < 4; i++) {
    vec3 L = normalize(uLightPositions[i] - position);
    vec3 H = normalize(V + L);
    float distance = length(uLightPositions[i] - position);
    float attenuation = 1.0 / (distance * distance);
    vec3 radiance = uLightColors[i] * attenuation * 50.0;
    
    float NDF = DistributionGGX(normal, H, roughness);
    float G = GeometrySmith(normal, V, L, roughness);
    vec3 F = FresnelSchlick(max(dot(H, V), 0.0), F0);
    
    vec3 kS = F;
    vec3 kD = (1.0 - kS) * (1.0 - metalness);
    
    vec3 numerator = NDF * G * F;
    float denominator = 4.0 * max(dot(normal, V), 0.0) * max(dot(normal, L), 0.0) + 0.0001;
    vec3 specular = numerator / denominator;
    
    float NdotL = max(dot(normal, L), 0.0);
    Lo += (kD * albedo / PI + specular) * radiance * NdotL;
  }
  
  vec3 ambient = vec3(uAmbientIntensity) * albedo * ao;
  vec3 color = ambient + Lo;
  
  gl_FragColor = vec4(color, 1.0);
}
`;

// Bloom bright extraction
const bloomExtractFragmentShader = `
uniform sampler2D tDiffuse;
uniform float uThreshold;

varying vec2 vUv;

void main() {
  vec4 color = texture2D(tDiffuse, vUv);
  float brightness = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
  
  if (brightness > uThreshold) {
    gl_FragColor = vec4(color.rgb * (brightness - uThreshold), 1.0);
  } else {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
  }
}
`;

// Gaussian blur
const blurFragmentShader = `
uniform sampler2D tDiffuse;
uniform vec2 uDirection;
uniform vec2 uResolution;

varying vec2 vUv;

const float WEIGHTS[5] = float[](0.227027, 0.1945946, 0.1216216, 0.054054, 0.016216);

void main() {
  vec2 texelSize = 1.0 / uResolution;
  vec3 result = texture2D(tDiffuse, vUv).rgb * WEIGHTS[0];
  
  for (int i = 1; i < 5; i++) {
    vec2 offset = uDirection * texelSize * float(i) * 2.0;
    result += texture2D(tDiffuse, vUv + offset).rgb * WEIGHTS[i];
    result += texture2D(tDiffuse, vUv - offset).rgb * WEIGHTS[i];
  }
  
  gl_FragColor = vec4(result, 1.0);
}
`;

// Final composite shader
const compositeFragmentShader = `
uniform sampler2D tScene;
uniform sampler2D tBloom;
uniform float uBloomIntensity;
uniform float uVignette;
uniform float uExposure;

varying vec2 vUv;

vec3 ACESFilm(vec3 x) {
  float a = 2.51;
  float b = 0.03;
  float c = 2.43;
  float d = 0.59;
  float e = 0.14;
  return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
}

void main() {
  vec3 scene = texture2D(tScene, vUv).rgb;
  vec3 bloom = texture2D(tBloom, vUv).rgb;
  
  // Add bloom
  vec3 color = scene + bloom * uBloomIntensity;
  
  // Exposure
  color *= uExposure;
  
  // Tone mapping
  color = ACESFilm(color);
  
  // Vignette
  vec2 uv = vUv * (1.0 - vUv);
  float vig = uv.x * uv.y * 15.0;
  vig = pow(vig, uVignette);
  color *= vig;
  
  // Gamma correction
  color = pow(color, vec3(1.0 / 2.2));
  
  gl_FragColor = vec4(color, 1.0);
}
`;

// Debug view shader
const debugFragmentShader = `
uniform sampler2D tColor;
uniform sampler2D tNormal;
uniform sampler2D tPosition;
uniform sampler2D tDepth;
uniform int uMode;

varying vec2 vUv;

void main() {
  if (uMode == 0) {
    // G-Buffer color
    gl_FragColor = texture2D(tColor, vUv);
  } else if (uMode == 1) {
    // Normals
    gl_FragColor = texture2D(tNormal, vUv);
  } else if (uMode == 2) {
    // Depth
    float depth = texture2D(tDepth, vUv).r;
    depth = 1.0 - pow(depth, 0.5);
    gl_FragColor = vec4(vec3(depth), 1.0);
  } else {
    // Position
    vec3 pos = texture2D(tPosition, vUv).xyz;
    gl_FragColor = vec4(pos * 0.1 + 0.5, 1.0);
  }
}
`;

// Simple fullscreen quad vertex shader
const quadVertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// ============================================================================
// GLOBAL STATE
// ============================================================================

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: OrbitControls;
let probe: ReturnType<typeof createProbe>;

// Render pipeline
let passes: RenderPass[] = [];
let gBufferTarget: THREE.WebGLMultipleRenderTargets;
let depthTexture: THREE.DepthTexture;
let ssaoTarget: THREE.WebGLRenderTarget;
let lightingTarget: THREE.WebGLRenderTarget;
let bloomExtractTarget: THREE.WebGLRenderTarget;
let bloomBlurTargets: THREE.WebGLRenderTarget[];
let compositeTarget: THREE.WebGLRenderTarget;

// Materials
let gBufferMaterials: THREE.ShaderMaterial[] = [];
let ssaoMaterial: THREE.ShaderMaterial;
let lightingMaterial: THREE.ShaderMaterial;
let bloomExtractMaterial: THREE.ShaderMaterial;
let blurMaterial: THREE.ShaderMaterial;
let compositeMaterial: THREE.ShaderMaterial;
let debugMaterial: THREE.ShaderMaterial;

// Scene objects
let sceneObjects: THREE.Mesh[] = [];
let originalMaterials: Map<THREE.Mesh, THREE.Material> = new Map();
let quadMesh: THREE.Mesh;
let quadScene: THREE.Scene;
let quadCamera: THREE.OrthographicCamera;

// Lights
let lights: { position: THREE.Vector3; color: THREE.Color }[] = [];

// Settings
let bloomIntensity = 0.5;
let bloomThreshold = 0.8;
let ssaoRadius = 0.5;
let vignetteAmount = 0.3;
let debugView: DebugView = 'final';
let selectedPassIndex = 0;

// Stats
let frameCount = 0;
let lastFpsTime = performance.now();
let currentFps = 60;
let passTimings: number[] = [];

// ============================================================================
// INITIALIZATION
// ============================================================================

function init(): void {
  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  // Camera
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(8, 6, 8);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: false }); // No AA for deferred
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(1); // Fixed pixel ratio for render targets
  document.getElementById('app')!.appendChild(renderer.domElement);

  // Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 3;
  controls.maxDistance = 30;

  // Create quad for full-screen passes
  createFullscreenQuad();

  // Initialize render targets
  initRenderTargets();

  // Create materials
  createMaterials();

  // Setup scene
  createSceneObjects();
  setupLights();

  // Initialize 3Lens
  initProbe();

  // Setup render passes
  initPasses();

  // Setup UI
  setupUI();

  // Event listeners
  window.addEventListener('resize', onWindowResize);
  window.addEventListener('keydown', onKeyDown);

  // Start animation
  animate();
}

function createFullscreenQuad(): void {
  quadScene = new THREE.Scene();
  quadCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  
  const geometry = new THREE.PlaneGeometry(2, 2);
  quadMesh = new THREE.Mesh(geometry);
  quadScene.add(quadMesh);
}

function initRenderTargets(): void {
  const width = window.innerWidth;
  const height = window.innerHeight;

  // Depth texture shared across passes
  depthTexture = new THREE.DepthTexture(width, height);
  depthTexture.format = THREE.DepthFormat;
  depthTexture.type = THREE.UnsignedIntType;

  // G-Buffer MRT (color, normal, position)
  gBufferTarget = new THREE.WebGLMultipleRenderTargets(width, height, 3);
  for (let i = 0; i < 3; i++) {
    gBufferTarget.texture[i].minFilter = THREE.NearestFilter;
    gBufferTarget.texture[i].magFilter = THREE.NearestFilter;
    gBufferTarget.texture[i].type = THREE.HalfFloatType;
    gBufferTarget.texture[i].format = THREE.RGBAFormat;
  }
  gBufferTarget.texture[0].name = 'gColor';
  gBufferTarget.texture[1].name = 'gNormal';
  gBufferTarget.texture[2].name = 'gPosition';
  gBufferTarget.depthTexture = depthTexture;

  // SSAO target
  ssaoTarget = new THREE.WebGLRenderTarget(width / 2, height / 2, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
    type: THREE.UnsignedByteType,
  });

  // Lighting target
  lightingTarget = new THREE.WebGLRenderTarget(width, height, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
    type: THREE.HalfFloatType,
  });

  // Bloom targets
  bloomExtractTarget = new THREE.WebGLRenderTarget(width / 2, height / 2, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
    type: THREE.HalfFloatType,
  });

  bloomBlurTargets = [
    new THREE.WebGLRenderTarget(width / 4, height / 4, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.HalfFloatType,
    }),
    new THREE.WebGLRenderTarget(width / 4, height / 4, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.HalfFloatType,
    }),
  ];

  // Final composite target
  compositeTarget = new THREE.WebGLRenderTarget(width, height, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
    type: THREE.UnsignedByteType,
  });
}

function createMaterials(): void {
  // SSAO material
  ssaoMaterial = new THREE.ShaderMaterial({
    vertexShader: quadVertexShader,
    fragmentShader: ssaoFragmentShader,
    uniforms: {
      tNormal: { value: gBufferTarget.texture[1] },
      tPosition: { value: gBufferTarget.texture[2] },
      tDepth: { value: depthTexture },
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      uRadius: { value: ssaoRadius },
      uProjectionMatrix: { value: camera.projectionMatrix },
    },
  });

  // Lighting material
  lightingMaterial = new THREE.ShaderMaterial({
    vertexShader: quadVertexShader,
    fragmentShader: lightingFragmentShader,
    uniforms: {
      tColor: { value: gBufferTarget.texture[0] },
      tNormal: { value: gBufferTarget.texture[1] },
      tPosition: { value: gBufferTarget.texture[2] },
      tSSAO: { value: ssaoTarget.texture },
      uLightPositions: { value: [] },
      uLightColors: { value: [] },
      uCameraPosition: { value: camera.position },
      uAmbientIntensity: { value: 0.03 },
    },
  });

  // Bloom extract material
  bloomExtractMaterial = new THREE.ShaderMaterial({
    vertexShader: quadVertexShader,
    fragmentShader: bloomExtractFragmentShader,
    uniforms: {
      tDiffuse: { value: lightingTarget.texture },
      uThreshold: { value: bloomThreshold },
    },
  });

  // Blur material
  blurMaterial = new THREE.ShaderMaterial({
    vertexShader: quadVertexShader,
    fragmentShader: blurFragmentShader,
    uniforms: {
      tDiffuse: { value: null },
      uDirection: { value: new THREE.Vector2(1, 0) },
      uResolution: { value: new THREE.Vector2(window.innerWidth / 4, window.innerHeight / 4) },
    },
  });

  // Composite material
  compositeMaterial = new THREE.ShaderMaterial({
    vertexShader: quadVertexShader,
    fragmentShader: compositeFragmentShader,
    uniforms: {
      tScene: { value: lightingTarget.texture },
      tBloom: { value: bloomBlurTargets[1].texture },
      uBloomIntensity: { value: bloomIntensity },
      uVignette: { value: vignetteAmount },
      uExposure: { value: 1.0 },
    },
  });

  // Debug material
  debugMaterial = new THREE.ShaderMaterial({
    vertexShader: quadVertexShader,
    fragmentShader: debugFragmentShader,
    uniforms: {
      tColor: { value: gBufferTarget.texture[0] },
      tNormal: { value: gBufferTarget.texture[1] },
      tPosition: { value: gBufferTarget.texture[2] },
      tDepth: { value: depthTexture },
      uMode: { value: 0 },
    },
  });
}

function createSceneObjects(): void {
  // Floor
  const floorGeom = new THREE.PlaneGeometry(20, 20);
  const floorMat = createGBufferMaterial(new THREE.Color(0.15, 0.15, 0.18), 0.9, 0.0);
  const floor = new THREE.Mesh(floorGeom, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.5;
  scene.add(floor);
  sceneObjects.push(floor);
  originalMaterials.set(floor, floorMat);

  // Create objects with various materials
  const objectConfigs = [
    { pos: [0, 0.5, 0], size: 1, color: 0xff4444, roughness: 0.3, metalness: 0.0 },
    { pos: [3, 0.75, 0], size: 1.5, color: 0x44ff44, roughness: 0.1, metalness: 0.9 },
    { pos: [-3, 0.5, 0], size: 1, color: 0x4444ff, roughness: 0.6, metalness: 0.0 },
    { pos: [0, 0.5, 3], size: 1, color: 0xffff44, roughness: 0.2, metalness: 0.5 },
    { pos: [0, 0.5, -3], size: 1, color: 0xff44ff, roughness: 0.8, metalness: 0.0 },
    { pos: [2, 1.5, 2], size: 0.8, color: 0x44ffff, roughness: 0.4, metalness: 0.7 },
    { pos: [-2, 0.75, -2], size: 1.2, color: 0xffffff, roughness: 0.05, metalness: 1.0 },
    { pos: [4, 0.4, -3], size: 0.8, color: 0xff8844, roughness: 0.5, metalness: 0.3 },
  ];

  objectConfigs.forEach((config, i) => {
    let geometry: THREE.BufferGeometry;
    
    // Alternate between different geometries
    switch (i % 4) {
      case 0:
        geometry = new THREE.BoxGeometry(config.size, config.size, config.size);
        break;
      case 1:
        geometry = new THREE.SphereGeometry(config.size * 0.5, 32, 32);
        break;
      case 2:
        geometry = new THREE.TorusKnotGeometry(config.size * 0.3, config.size * 0.1, 100, 16);
        break;
      default:
        geometry = new THREE.CylinderGeometry(config.size * 0.4, config.size * 0.4, config.size, 32);
    }

    const material = createGBufferMaterial(
      new THREE.Color(config.color),
      config.roughness,
      config.metalness
    );

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(config.pos[0], config.pos[1], config.pos[2]);
    scene.add(mesh);
    sceneObjects.push(mesh);
    originalMaterials.set(mesh, material);
  });
}

function createGBufferMaterial(color: THREE.Color, roughness: number, metalness: number): THREE.ShaderMaterial {
  const material = new THREE.ShaderMaterial({
    vertexShader: gBufferVertexShader,
    fragmentShader: gBufferFragmentShader,
    uniforms: {
      uColor: { value: color },
      uRoughness: { value: roughness },
      uMetalness: { value: metalness },
    },
    glslVersion: THREE.GLSL3,
  });
  gBufferMaterials.push(material);
  return material;
}

function setupLights(): void {
  lights = [
    { position: new THREE.Vector3(5, 5, 5), color: new THREE.Color(1, 0.9, 0.8) },
    { position: new THREE.Vector3(-5, 3, -5), color: new THREE.Color(0.8, 0.9, 1) },
    { position: new THREE.Vector3(0, 8, 0), color: new THREE.Color(1, 1, 1) },
    { position: new THREE.Vector3(-3, 2, 4), color: new THREE.Color(1, 0.5, 0.3) },
  ];

  // Create visual representations
  lights.forEach((light, i) => {
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 16, 16),
      new THREE.MeshBasicMaterial({ color: light.color })
    );
    sphere.position.copy(light.position);
    scene.add(sphere);
  });

  // Update lighting uniforms
  lightingMaterial.uniforms.uLightPositions.value = lights.map(l => l.position);
  lightingMaterial.uniforms.uLightColors.value = lights.map(l => l.color);
}

function initProbe(): void {
  probe = createProbe({ appName: 'Custom-Render-Pipeline' });
  createOverlay({ probe, theme: 'dark' });

  probe.registerLogicalEntity({
    id: 'render-pipeline',
    name: 'Deferred Render Pipeline',
    type: 'pipeline',
    object3D: scene,
    metadata: {
      type: 'Deferred Shading',
      passes: passes.length,
      renderTargets: 6
    }
  });
}

function initPasses(): void {
  passes = [
    {
      id: 'geometry',
      name: 'Geometry Pass',
      enabled: true,
      renderTarget: gBufferTarget,
      material: null,
      gpuTime: 0,
      drawCalls: 0,
      description: 'Renders scene geometry to G-Buffer (albedo, normal, position)',
    },
    {
      id: 'ssao',
      name: 'SSAO Pass',
      enabled: true,
      renderTarget: ssaoTarget,
      material: ssaoMaterial,
      gpuTime: 0,
      drawCalls: 0,
      description: 'Screen-space ambient occlusion',
    },
    {
      id: 'lighting',
      name: 'Lighting Pass',
      enabled: true,
      renderTarget: lightingTarget,
      material: lightingMaterial,
      gpuTime: 0,
      drawCalls: 0,
      description: 'Deferred PBR lighting with multiple lights',
    },
    {
      id: 'bloom-extract',
      name: 'Bloom Extract',
      enabled: true,
      renderTarget: bloomExtractTarget,
      material: bloomExtractMaterial,
      gpuTime: 0,
      drawCalls: 0,
      description: 'Extracts bright areas for bloom effect',
    },
    {
      id: 'bloom-blur',
      name: 'Bloom Blur',
      enabled: true,
      renderTarget: bloomBlurTargets[0],
      material: blurMaterial,
      gpuTime: 0,
      drawCalls: 0,
      description: 'Two-pass Gaussian blur for bloom',
    },
    {
      id: 'composite',
      name: 'Composite',
      enabled: true,
      renderTarget: null, // Renders to screen
      material: compositeMaterial,
      gpuTime: 0,
      drawCalls: 0,
      description: 'Final composition with tone mapping and vignette',
    },
  ];

  // Register passes with 3Lens
  passes.forEach((pass, i) => {
    probe.registerLogicalEntity({
      id: `pass-${pass.id}`,
      name: pass.name,
      type: 'render-pass',
      metadata: {
        index: i,
        enabled: pass.enabled,
        description: pass.description
      }
    });
  });

  updatePassList();
  updatePipelineFlow();
}

// ============================================================================
// RENDER PIPELINE
// ============================================================================

function renderPipeline(): void {
  passTimings = [];
  let totalDrawCalls = 0;

  // 1. Geometry Pass (G-Buffer)
  if (passes[0].enabled) {
    const startTime = performance.now();
    renderer.setRenderTarget(gBufferTarget);
    renderer.clear();
    renderer.render(scene, camera);
    passes[0].gpuTime = performance.now() - startTime;
    passes[0].drawCalls = renderer.info.render.calls;
    totalDrawCalls += passes[0].drawCalls;
  }

  // 2. SSAO Pass
  if (passes[1].enabled) {
    const startTime = performance.now();
    ssaoMaterial.uniforms.uRadius.value = ssaoRadius;
    ssaoMaterial.uniforms.uProjectionMatrix.value.copy(camera.projectionMatrix);
    quadMesh.material = ssaoMaterial;
    renderer.setRenderTarget(ssaoTarget);
    renderer.render(quadScene, quadCamera);
    passes[1].gpuTime = performance.now() - startTime;
    passes[1].drawCalls = 1;
    totalDrawCalls += 1;
  }

  // 3. Lighting Pass
  if (passes[2].enabled) {
    const startTime = performance.now();
    lightingMaterial.uniforms.uCameraPosition.value.copy(camera.position);
    quadMesh.material = lightingMaterial;
    renderer.setRenderTarget(lightingTarget);
    renderer.render(quadScene, quadCamera);
    passes[2].gpuTime = performance.now() - startTime;
    passes[2].drawCalls = 1;
    totalDrawCalls += 1;
  }

  // 4. Bloom Extract
  if (passes[3].enabled) {
    const startTime = performance.now();
    bloomExtractMaterial.uniforms.uThreshold.value = bloomThreshold;
    quadMesh.material = bloomExtractMaterial;
    renderer.setRenderTarget(bloomExtractTarget);
    renderer.render(quadScene, quadCamera);
    passes[3].gpuTime = performance.now() - startTime;
    passes[3].drawCalls = 1;
    totalDrawCalls += 1;
  }

  // 5. Bloom Blur (two-pass)
  if (passes[4].enabled) {
    const startTime = performance.now();
    
    // Horizontal blur
    blurMaterial.uniforms.tDiffuse.value = bloomExtractTarget.texture;
    blurMaterial.uniforms.uDirection.value.set(1, 0);
    quadMesh.material = blurMaterial;
    renderer.setRenderTarget(bloomBlurTargets[0]);
    renderer.render(quadScene, quadCamera);
    
    // Vertical blur
    blurMaterial.uniforms.tDiffuse.value = bloomBlurTargets[0].texture;
    blurMaterial.uniforms.uDirection.value.set(0, 1);
    renderer.setRenderTarget(bloomBlurTargets[1]);
    renderer.render(quadScene, quadCamera);
    
    passes[4].gpuTime = performance.now() - startTime;
    passes[4].drawCalls = 2;
    totalDrawCalls += 2;
  }

  // 6. Composite / Debug View
  const startTime = performance.now();
  renderer.setRenderTarget(null);

  if (debugView === 'final') {
    compositeMaterial.uniforms.uBloomIntensity.value = bloomIntensity;
    compositeMaterial.uniforms.uVignette.value = vignetteAmount;
    quadMesh.material = compositeMaterial;
  } else {
    debugMaterial.uniforms.uMode.value = 
      debugView === 'gbuffer' ? 0 : debugView === 'normals' ? 1 : 2;
    quadMesh.material = debugMaterial;
  }
  
  renderer.render(quadScene, quadCamera);
  passes[5].gpuTime = performance.now() - startTime;
  passes[5].drawCalls = 1;
  totalDrawCalls += 1;

  // Update stats
  document.getElementById('draw-calls')!.textContent = totalDrawCalls.toString();
}

// ============================================================================
// UI
// ============================================================================

function setupUI(): void {
  // Pass toggles
  updatePassList();

  // Sliders
  setupSlider('bloom', (v) => { bloomIntensity = v; }, v => v.toFixed(2));
  setupSlider('threshold', (v) => { bloomThreshold = v; }, v => v.toFixed(2));
  setupSlider('ssao', (v) => { ssaoRadius = v; }, v => v.toFixed(2));
  setupSlider('vignette', (v) => { vignetteAmount = v; }, v => v.toFixed(2));

  // Debug view buttons
  ['final', 'gbuffer', 'depth', 'normals'].forEach(view => {
    document.getElementById(`view-${view}`)!.addEventListener('click', () => {
      debugView = view as DebugView;
      document.querySelectorAll('.control-buttons .ctrl-btn').forEach(btn => {
        btn.classList.toggle('active', btn.id === `view-${view}`);
      });
    });
  });
}

function setupSlider(id: string, onChange: (v: number) => void, format: (v: number) => string): void {
  const slider = document.getElementById(`${id}-slider`) as HTMLInputElement;
  const valueDisplay = document.getElementById(`${id}-value`)!;

  slider.addEventListener('input', () => {
    const value = parseInt(slider.value) / 100;
    valueDisplay.textContent = format(value);
    onChange(value);
  });
}

function updatePassList(): void {
  const container = document.getElementById('pass-list')!;
  container.innerHTML = '';

  passes.forEach((pass, i) => {
    const item = document.createElement('div');
    item.className = `pass-item${i === selectedPassIndex ? ' active' : ''}${!pass.enabled ? ' disabled' : ''}`;
    item.innerHTML = `
      <div class="pass-header">
        <span class="pass-name">
          ${i + 1}. ${pass.name}
        </span>
        <div class="pass-toggle${pass.enabled ? ' active' : ''}" data-pass="${i}"></div>
      </div>
      <div class="pass-time">${pass.gpuTime.toFixed(2)} ms | ${pass.drawCalls} draws</div>
    `;

    item.addEventListener('click', (e) => {
      if (!(e.target as HTMLElement).classList.contains('pass-toggle')) {
        selectedPassIndex = i;
        updatePassList();
        updatePassDetails();
      }
    });

    const toggle = item.querySelector('.pass-toggle')!;
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      pass.enabled = !pass.enabled;
      toggle.classList.toggle('active');
      item.classList.toggle('disabled');
      updatePipelineFlow();
    });

    container.appendChild(item);
  });
}

function updatePipelineFlow(): void {
  const container = document.getElementById('pipeline-flow')!;
  container.innerHTML = '';

  passes.forEach((pass, i) => {
    const node = document.createElement('div');
    node.className = `flow-node${i === selectedPassIndex ? ' active' : ''}${!pass.enabled ? ' disabled' : ''}`;
    node.textContent = pass.name.split(' ')[0];
    container.appendChild(node);

    if (i < passes.length - 1) {
      const arrow = document.createElement('span');
      arrow.className = 'flow-arrow';
      arrow.textContent = '→';
      container.appendChild(arrow);
    }
  });
}

function updatePassDetails(): void {
  const pass = passes[selectedPassIndex];
  
  document.getElementById('selected-pass-name')!.textContent = pass.name;
  document.getElementById('pass-type')!.textContent = pass.id === 'geometry' ? 'G-Buffer' : 'Full-screen';
  
  const rt = pass.renderTarget;
  if (rt instanceof THREE.WebGLMultipleRenderTargets) {
    document.getElementById('pass-rt')!.textContent = `MRT (${rt.texture.length} attachments)`;
    document.getElementById('pass-resolution')!.textContent = `${rt.width}×${rt.height}`;
    document.getElementById('pass-format')!.textContent = 'RGBA16F';
  } else if (rt) {
    document.getElementById('pass-rt')!.textContent = 'Single';
    document.getElementById('pass-resolution')!.textContent = `${rt.width}×${rt.height}`;
    document.getElementById('pass-format')!.textContent = rt.texture.type === THREE.HalfFloatType ? 'RGBA16F' : 'RGBA8';
  } else {
    document.getElementById('pass-rt')!.textContent = 'Screen';
    document.getElementById('pass-resolution')!.textContent = `${window.innerWidth}×${window.innerHeight}`;
    document.getElementById('pass-format')!.textContent = 'RGBA8';
  }
  
  document.getElementById('pass-gpu-time')!.textContent = `${pass.gpuTime.toFixed(2)} ms`;
  document.getElementById('pass-draws')!.textContent = pass.drawCalls.toString();
}

function updateStats(): void {
  const enabledPasses = passes.filter(p => p.enabled).length;
  document.getElementById('pass-count')!.textContent = enabledPasses.toString();
  document.getElementById('rt-count')!.textContent = '6';
  
  const totalGpuTime = passes.reduce((sum, p) => sum + p.gpuTime, 0);
  document.getElementById('gpu-time')!.textContent = `${totalGpuTime.toFixed(1)} ms`;
  document.getElementById('total-gpu')!.textContent = `${totalGpuTime.toFixed(1)} ms`;
  document.getElementById('fps')!.textContent = currentFps.toString();
  document.getElementById('triangles')!.textContent = renderer.info.render.triangles.toLocaleString();
  
  // Estimate RT memory (rough calculation)
  const rtMemory = (
    window.innerWidth * window.innerHeight * 3 * 8 + // G-Buffer (3x RGBA16F)
    window.innerWidth * window.innerHeight * 4 + // Depth
    (window.innerWidth / 2) * (window.innerHeight / 2) * 4 + // SSAO
    window.innerWidth * window.innerHeight * 8 + // Lighting
    (window.innerWidth / 2) * (window.innerHeight / 2) * 8 + // Bloom
    (window.innerWidth / 4) * (window.innerHeight / 4) * 8 * 2 // Blur
  ) / (1024 * 1024);
  document.getElementById('rt-memory')!.textContent = `${rtMemory.toFixed(1)} MB`;
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

function onWindowResize(): void {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  
  // Resize render targets would go here
}

function onKeyDown(e: KeyboardEvent): void {
  if (e.key === 'Tab') {
    e.preventDefault();
    const views: DebugView[] = ['final', 'gbuffer', 'depth', 'normals'];
    const currentIndex = views.indexOf(debugView);
    debugView = views[(currentIndex + 1) % views.length];
    
    document.querySelectorAll('.control-buttons .ctrl-btn').forEach(btn => {
      btn.classList.toggle('active', btn.id === `view-${debugView}`);
    });
  }
}

// ============================================================================
// ANIMATION LOOP
// ============================================================================

function animate(): void {
  requestAnimationFrame(animate);

  // FPS counter
  frameCount++;
  const now = performance.now();
  if (now - lastFpsTime >= 1000) {
    currentFps = frameCount;
    frameCount = 0;
    lastFpsTime = now;
  }

  // Animate lights
  const time = now * 0.001;
  lights[0].position.x = Math.sin(time * 0.5) * 5;
  lights[0].position.z = Math.cos(time * 0.5) * 5;
  lights[3].position.x = Math.sin(time * 0.3 + 2) * 4;
  lights[3].position.z = Math.cos(time * 0.3 + 2) * 4;

  // Update light uniforms
  lightingMaterial.uniforms.uLightPositions.value = lights.map(l => l.position);

  // Animate some objects
  sceneObjects.forEach((obj, i) => {
    if (i > 0 && i % 2 === 0) {
      obj.rotation.y += 0.01;
    }
  });

  controls.update();

  // Render
  renderPipeline();

  // Update UI
  updatePassList();
  updatePassDetails();
  updateStats();
}

// ============================================================================
// START
// ============================================================================

init();
