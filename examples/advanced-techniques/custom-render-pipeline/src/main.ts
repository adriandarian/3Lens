/**
 * Custom Render Pipeline Example
 * 
 * This example demonstrates a deferred rendering pipeline with multiple passes.
 * Use 3Lens to inspect:
 * - Render passes as logical entities
 * - Scene objects and their materials
 * - Performance stats and timing
 * 
 * The scenario: A multi-pass deferred renderer with:
 * - G-Buffer pass (MRT: albedo, normal, position, depth)
 * - SSAO pass (screen-space ambient occlusion)
 * - Lighting pass (deferred PBR shading)
 * - Bloom pass (bright extraction + blur)
 * - Composite pass (tone mapping, vignette)
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
  description: string;
}

type DebugView = 'final' | 'gbuffer' | 'depth' | 'normals' | 'position';

// ============================================================================
// SHADER CODE
// ============================================================================

// G-Buffer vertex shader (GLSL ES 3.0)
const gBufferVertexShader = `
in vec3 position;
in vec3 normal;
in vec2 uv;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;

out vec3 vWorldPosition;
out vec3 vNormal;
out vec2 vUv;

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
precision highp float;

uniform vec3 uColor;
uniform float uRoughness;
uniform float uMetalness;

in vec3 vWorldPosition;
in vec3 vNormal;
in vec2 vUv;

layout(location = 0) out vec4 fragColor;
layout(location = 1) out vec4 fragNormal;
layout(location = 2) out vec4 fragPosition;

void main() {
  vec3 normal = normalize(vNormal);
  fragColor = vec4(uColor, uMetalness);
  fragNormal = vec4(normal * 0.5 + 0.5, uRoughness);
  fragPosition = vec4(vWorldPosition, 1.0);
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

vec3 getKernelSample(int i) {
  if (i == 0) return vec3(0.04977, -0.04471, 0.04996);
  if (i == 1) return vec3(0.01457, 0.01653, 0.00224);
  if (i == 2) return vec3(-0.04065, -0.01937, 0.03193);
  if (i == 3) return vec3(0.01378, -0.09158, 0.04092);
  if (i == 4) return vec3(0.05599, 0.05979, 0.05766);
  if (i == 5) return vec3(0.09227, 0.04428, 0.01545);
  if (i == 6) return vec3(-0.00204, -0.05212, 0.0612);
  if (i == 7) return vec3(0.00408, 0.02303, 0.02478);
  if (i == 8) return vec3(-0.05294, -0.00419, 0.03337);
  if (i == 9) return vec3(-0.01464, 0.03244, 0.01464);
  if (i == 10) return vec3(0.06529, -0.02441, 0.02353);
  if (i == 11) return vec3(-0.01401, 0.04474, 0.03553);
  if (i == 12) return vec3(0.06607, 0.02579, 0.05057);
  if (i == 13) return vec3(-0.02616, 0.08153, 0.03673);
  if (i == 14) return vec3(0.07424, -0.05006, 0.01989);
  return vec3(0.00799, -0.00232, 0.08776);
}

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
  
  float randomAngle = rand(vUv) * 6.28318;
  vec3 randomVec = vec3(cos(randomAngle), sin(randomAngle), 0.0);
  vec3 tangent = normalize(randomVec - normal * dot(randomVec, normal));
  vec3 bitangent = cross(normal, tangent);
  mat3 TBN = mat3(tangent, bitangent, normal);
  
  float occlusion = 0.0;
  for (int i = 0; i < SAMPLES; i++) {
    vec3 samplePos = position + TBN * getKernelSample(i) * uRadius;
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

float getWeight(int i) {
  if (i == 0) return 0.227027;
  if (i == 1) return 0.1945946;
  if (i == 2) return 0.1216216;
  if (i == 3) return 0.054054;
  return 0.016216;
}

void main() {
  vec2 texelSize = 1.0 / uResolution;
  vec3 result = texture2D(tDiffuse, vUv).rgb * getWeight(0);
  
  for (int i = 1; i < 5; i++) {
    float weight = getWeight(i);
    vec2 offset = uDirection * texelSize * float(i) * 2.0;
    result += texture2D(tDiffuse, vUv + offset).rgb * weight;
    result += texture2D(tDiffuse, vUv - offset).rgb * weight;
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
  vec3 color = scene + bloom * uBloomIntensity;
  color *= uExposure;
  color = ACESFilm(color);
  vec2 uv = vUv * (1.0 - vUv);
  float vig = uv.x * uv.y * 15.0;
  vig = pow(vig, uVignette);
  color *= vig;
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
uniform vec3 uCameraPosition;
uniform int uMode;

varying vec2 vUv;

void main() {
  if (uMode == 0) {
    gl_FragColor = texture2D(tColor, vUv);
  } else if (uMode == 1) {
    gl_FragColor = texture2D(tNormal, vUv);
  } else if (uMode == 2) {
    float depth = texture2D(tDepth, vUv).r;
    depth = 1.0 - pow(depth, 0.5);
    gl_FragColor = vec4(vec3(depth), 1.0);
  } else {
    vec3 pos = texture2D(tPosition, vUv).xyz;
    if (length(pos) < 0.001) {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    } else {
      float dist = length(pos - uCameraPosition);
      float normalizedDist = clamp(dist / 20.0, 0.0, 1.0);
      vec3 color;
      if (normalizedDist < 0.33) {
        color = mix(vec3(0.0, 0.0, 1.0), vec3(0.0, 1.0, 1.0), normalizedDist / 0.33);
      } else if (normalizedDist < 0.66) {
        color = mix(vec3(0.0, 1.0, 1.0), vec3(1.0, 1.0, 0.0), (normalizedDist - 0.33) / 0.33);
      } else {
        color = mix(vec3(1.0, 1.0, 0.0), vec3(1.0, 0.0, 0.0), (normalizedDist - 0.66) / 0.34);
      }
      gl_FragColor = vec4(color, 1.0);
    }
  }
}
`;

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
let gBufferScene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: OrbitControls;
let probe: ReturnType<typeof createProbe>;

// Render targets
let gBufferTarget: THREE.WebGLMultipleRenderTargets;
let depthTexture: THREE.DepthTexture;
let ssaoTarget: THREE.WebGLRenderTarget;
let lightingTarget: THREE.WebGLRenderTarget;
let bloomExtractTarget: THREE.WebGLRenderTarget;
let bloomBlurTargets: THREE.WebGLRenderTarget[];

// Materials
let gBufferMaterials: THREE.RawShaderMaterial[] = [];
let ssaoMaterial: THREE.ShaderMaterial;
let lightingMaterial: THREE.ShaderMaterial;
let bloomExtractMaterial: THREE.ShaderMaterial;
let blurMaterial: THREE.ShaderMaterial;
let compositeMaterial: THREE.ShaderMaterial;
let debugMaterial: THREE.ShaderMaterial;

// Scene objects
let sceneObjects: THREE.Mesh[] = [];
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

// Render passes for 3Lens registration
let passes: RenderPass[] = [];

// ============================================================================
// INITIALIZATION
// ============================================================================

function init(): void {
  scene = new THREE.Scene();
  scene.name = 'MainScene';
  scene.background = new THREE.Color(0x000000);
  
  gBufferScene = new THREE.Scene();
  gBufferScene.name = 'GBufferScene';

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.name = 'MainCamera';
  camera.position.set(8, 6, 8);

  renderer = new THREE.WebGLRenderer({ antialias: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(1);
  renderer.debug = { checkShaderErrors: true };
  document.getElementById('app')!.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 3;
  controls.maxDistance = 30;

  createFullscreenQuad();
  initRenderTargets();
  createMaterials();
  createSceneObjects();
  setupLights();
  initProbe();
  initPasses();
  setupUI();

  window.addEventListener('resize', onWindowResize);
  window.addEventListener('keydown', onKeyDown);

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

  depthTexture = new THREE.DepthTexture(width, height);
  depthTexture.format = THREE.DepthFormat;
  depthTexture.type = THREE.UnsignedIntType;

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

  ssaoTarget = new THREE.WebGLRenderTarget(width / 2, height / 2, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
    type: THREE.UnsignedByteType,
  });

  lightingTarget = new THREE.WebGLRenderTarget(width, height, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
    type: THREE.HalfFloatType,
  });

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
}

function createMaterials(): void {
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

  bloomExtractMaterial = new THREE.ShaderMaterial({
    vertexShader: quadVertexShader,
    fragmentShader: bloomExtractFragmentShader,
    uniforms: {
      tDiffuse: { value: lightingTarget.texture },
      uThreshold: { value: bloomThreshold },
    },
  });

  blurMaterial = new THREE.ShaderMaterial({
    vertexShader: quadVertexShader,
    fragmentShader: blurFragmentShader,
    uniforms: {
      tDiffuse: { value: null },
      uDirection: { value: new THREE.Vector2(1, 0) },
      uResolution: { value: new THREE.Vector2(window.innerWidth / 4, window.innerHeight / 4) },
    },
  });

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

  debugMaterial = new THREE.ShaderMaterial({
    vertexShader: quadVertexShader,
    fragmentShader: debugFragmentShader,
    uniforms: {
      tColor: { value: gBufferTarget.texture[0] },
      tNormal: { value: gBufferTarget.texture[1] },
      tPosition: { value: gBufferTarget.texture[2] },
      tDepth: { value: depthTexture },
      uCameraPosition: { value: camera.position },
      uMode: { value: 0 },
    },
  });
}

function createSceneObjects(): void {
  // Floor
  const floorGeom = new THREE.PlaneGeometry(20, 20);
  const floorMat = createGBufferMaterial(new THREE.Color(0.15, 0.15, 0.18), 0.9, 0.0);
  const floor = new THREE.Mesh(floorGeom, floorMat);
  floor.name = 'Floor';
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.5;
  gBufferScene.add(floor);
  sceneObjects.push(floor);

  // Create various objects with PBR materials
  const objectConfigs = [
    { pos: [0, 0.5, 0], size: 1, color: 0xff4444, roughness: 0.3, metalness: 0.0, name: 'RedCube' },
    { pos: [3, 0.75, 0], size: 1.5, color: 0x44ff44, roughness: 0.1, metalness: 0.9, name: 'GreenSphere' },
    { pos: [-3, 0.5, 0], size: 1, color: 0x4444ff, roughness: 0.6, metalness: 0.0, name: 'BlueCube' },
    { pos: [0, 0.5, 3], size: 1, color: 0xffff44, roughness: 0.2, metalness: 0.5, name: 'YellowCube' },
    { pos: [0, 0.5, -3], size: 1, color: 0xff44ff, roughness: 0.8, metalness: 0.0, name: 'MagentaCube' },
    { pos: [2, 1.5, 2], size: 0.8, color: 0x44ffff, roughness: 0.4, metalness: 0.7, name: 'CyanKnot' },
    { pos: [-2, 0.75, -2], size: 1.2, color: 0xffffff, roughness: 0.05, metalness: 1.0, name: 'ChromeSphere' },
    { pos: [4, 0.4, -3], size: 0.8, color: 0xff8844, roughness: 0.5, metalness: 0.3, name: 'OrangeCylinder' },
  ];

  objectConfigs.forEach((config, i) => {
    let geometry: THREE.BufferGeometry;
    switch (i % 4) {
      case 0: geometry = new THREE.BoxGeometry(config.size, config.size, config.size); break;
      case 1: geometry = new THREE.SphereGeometry(config.size * 0.5, 32, 32); break;
      case 2: geometry = new THREE.TorusKnotGeometry(config.size * 0.3, config.size * 0.1, 100, 16); break;
      default: geometry = new THREE.CylinderGeometry(config.size * 0.4, config.size * 0.4, config.size, 32);
    }

    const material = createGBufferMaterial(new THREE.Color(config.color), config.roughness, config.metalness);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = config.name;
    mesh.position.set(config.pos[0], config.pos[1], config.pos[2]);
    gBufferScene.add(mesh);
    sceneObjects.push(mesh);
  });
}

function createGBufferMaterial(color: THREE.Color, roughness: number, metalness: number): THREE.RawShaderMaterial {
  const material = new THREE.RawShaderMaterial({
    vertexShader: gBufferVertexShader,
    fragmentShader: gBufferFragmentShader,
    glslVersion: THREE.GLSL3,
    uniforms: {
      uColor: { value: color },
      uRoughness: { value: roughness },
      uMetalness: { value: metalness },
    },
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

  lights.forEach((light, i) => {
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 16, 16),
      new THREE.MeshBasicMaterial({ color: light.color })
    );
    sphere.name = `LightIndicator_${i}`;
    sphere.position.copy(light.position);
    scene.add(sphere);
  });

  lightingMaterial.uniforms.uLightPositions.value = lights.map(l => l.position);
  lightingMaterial.uniforms.uLightColors.value = lights.map(l => l.color);
}

// ============================================================================
// 3LENS INTEGRATION
// ============================================================================

function initProbe(): void {
  probe = createProbe({ appName: 'Custom-Render-Pipeline' });
  probe.observeRenderer(renderer);
  probe.observeScene(gBufferScene);
  
  // Only show panels relevant to this example
  createOverlay({
    probe,
    enabledPanels: ['scene', 'stats', 'materials', 'render-targets'],
  });

  // Register the pipeline as a logical entity
  probe.registerLogicalEntity({
    id: 'deferred-pipeline',
    name: 'Deferred Render Pipeline',
    type: 'pipeline',
    object3D: scene,
    metadata: {
      technique: 'Deferred Shading',
      gBufferAttachments: 3,
      postProcessing: ['SSAO', 'Bloom', 'Vignette', 'ACES Tonemapping'],
    }
  });

  // Register all render targets with the probe so they appear in the Render Targets panel
  registerRenderTargets();
}

function registerRenderTargets(): void {
  // G-Buffer (MRT with 3 color attachments + depth)
  gBufferTarget.texture[0].name = 'G-Buffer: Albedo + Metalness';
  gBufferTarget.texture[1].name = 'G-Buffer: Normal + Roughness';
  gBufferTarget.texture[2].name = 'G-Buffer: World Position';
  probe.observeRenderTarget(gBufferTarget, 'custom');

  // SSAO target (half resolution)
  ssaoTarget.texture.name = 'SSAO';
  probe.observeRenderTarget(ssaoTarget, 'post-process');

  // Lighting pass result
  lightingTarget.texture.name = 'Deferred Lighting';
  probe.observeRenderTarget(lightingTarget, 'post-process');

  // Bloom extraction
  bloomExtractTarget.texture.name = 'Bloom Extract';
  probe.observeRenderTarget(bloomExtractTarget, 'post-process');

  // Bloom blur ping-pong targets
  bloomBlurTargets[0].texture.name = 'Bloom Blur H';
  bloomBlurTargets[1].texture.name = 'Bloom Blur V';
  probe.observeRenderTarget(bloomBlurTargets[0], 'post-process');
  probe.observeRenderTarget(bloomBlurTargets[1], 'post-process');
}

function initPasses(): void {
  passes = [
    { id: 'geometry', name: 'Geometry Pass (G-Buffer)', enabled: true, renderTarget: gBufferTarget, material: null, description: 'Renders geometry to MRT: albedo, normals, position' },
    { id: 'ssao', name: 'SSAO Pass', enabled: true, renderTarget: ssaoTarget, material: ssaoMaterial, description: 'Screen-space ambient occlusion at half resolution' },
    { id: 'lighting', name: 'Lighting Pass', enabled: true, renderTarget: lightingTarget, material: lightingMaterial, description: 'Deferred PBR lighting with 4 point lights' },
    { id: 'bloom-extract', name: 'Bloom Extract', enabled: true, renderTarget: bloomExtractTarget, material: bloomExtractMaterial, description: 'Extracts bright areas above threshold' },
    { id: 'bloom-blur', name: 'Bloom Blur', enabled: true, renderTarget: bloomBlurTargets[0], material: blurMaterial, description: 'Two-pass Gaussian blur at quarter resolution' },
    { id: 'composite', name: 'Composite Pass', enabled: true, renderTarget: null, material: compositeMaterial, description: 'Final composition with tone mapping and vignette' },
  ];

  // Register each pass as a logical entity in 3Lens
  passes.forEach((pass, index) => {
    const rt = pass.renderTarget;
    let resolution = 'Screen';
    let format = 'RGBA8';
    
    if (rt instanceof THREE.WebGLMultipleRenderTargets) {
      resolution = `${rt.width}×${rt.height}`;
      format = 'MRT (3× RGBA16F)';
    } else if (rt) {
      resolution = `${rt.width}×${rt.height}`;
      format = rt.texture.type === THREE.HalfFloatType ? 'RGBA16F' : 'RGBA8';
    }

    probe.registerLogicalEntity({
      id: `pass-${pass.id}`,
      name: pass.name,
      type: 'render-pass',
      metadata: {
        order: index + 1,
        enabled: pass.enabled,
        description: pass.description,
        resolution,
        format,
      }
    });
  });
}

// ============================================================================
// RENDER PIPELINE
// ============================================================================

function renderPipeline(): void {
  // 1. Geometry Pass
  if (passes[0].enabled) {
    renderer.setRenderTarget(gBufferTarget);
    renderer.clear();
    renderer.render(gBufferScene, camera);
  }

  // 2. SSAO Pass
  if (passes[1].enabled) {
    ssaoMaterial.uniforms.uRadius.value = ssaoRadius;
    ssaoMaterial.uniforms.uProjectionMatrix.value.copy(camera.projectionMatrix);
    quadMesh.material = ssaoMaterial;
    renderer.setRenderTarget(ssaoTarget);
    renderer.render(quadScene, quadCamera);
  }

  // 3. Lighting Pass
  if (passes[2].enabled) {
    lightingMaterial.uniforms.uCameraPosition.value.copy(camera.position);
    quadMesh.material = lightingMaterial;
    renderer.setRenderTarget(lightingTarget);
    renderer.render(quadScene, quadCamera);
  }

  // 4. Bloom Extract
  if (passes[3].enabled) {
    bloomExtractMaterial.uniforms.uThreshold.value = bloomThreshold;
    quadMesh.material = bloomExtractMaterial;
    renderer.setRenderTarget(bloomExtractTarget);
    renderer.render(quadScene, quadCamera);
  }

  // 5. Bloom Blur (two-pass)
  if (passes[4].enabled) {
    blurMaterial.uniforms.tDiffuse.value = bloomExtractTarget.texture;
    blurMaterial.uniforms.uDirection.value.set(1, 0);
    quadMesh.material = blurMaterial;
    renderer.setRenderTarget(bloomBlurTargets[0]);
    renderer.render(quadScene, quadCamera);
    
    blurMaterial.uniforms.tDiffuse.value = bloomBlurTargets[0].texture;
    blurMaterial.uniforms.uDirection.value.set(0, 1);
    renderer.setRenderTarget(bloomBlurTargets[1]);
    renderer.render(quadScene, quadCamera);
  }

  // 6. Composite / Debug View
  renderer.setRenderTarget(null);

  if (debugView === 'final') {
    compositeMaterial.uniforms.uBloomIntensity.value = bloomIntensity;
    compositeMaterial.uniforms.uVignette.value = vignetteAmount;
    quadMesh.material = compositeMaterial;
  } else {
    debugMaterial.uniforms.uMode.value = 
      debugView === 'gbuffer' ? 0 : 
      debugView === 'normals' ? 1 : 
      debugView === 'depth' ? 2 : 3;
    debugMaterial.uniforms.uCameraPosition.value.copy(camera.position);
    quadMesh.material = debugMaterial;
  }
  
  renderer.render(quadScene, quadCamera);
}

// ============================================================================
// MINIMAL UI (scenario controls only)
// ============================================================================

function setupUI(): void {
  // Sliders for post-processing settings
  setupSlider('bloom', (v) => { bloomIntensity = v; });
  setupSlider('threshold', (v) => { bloomThreshold = v; });
  setupSlider('ssao', (v) => { ssaoRadius = v; });
  setupSlider('vignette', (v) => { vignetteAmount = v; });

  // Debug view buttons
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      debugView = (btn as HTMLElement).dataset.view as DebugView;
    });
  });
}

function setupSlider(id: string, onChange: (v: number) => void): void {
  const slider = document.getElementById(`${id}-slider`) as HTMLInputElement;
  const valueDisplay = document.getElementById(`${id}-value`)!;

  slider.addEventListener('input', () => {
    const value = parseInt(slider.value) / 100;
    valueDisplay.textContent = value.toFixed(2);
    onChange(value);
  });
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

function onWindowResize(): void {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onKeyDown(e: KeyboardEvent): void {
  if (e.key === 'Tab') {
    e.preventDefault();
    const views: DebugView[] = ['final', 'gbuffer', 'normals', 'position', 'depth'];
    const currentIndex = views.indexOf(debugView);
    debugView = views[(currentIndex + 1) % views.length];
    
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.classList.toggle('active', (btn as HTMLElement).dataset.view === debugView);
    });
  }
}

// ============================================================================
// ANIMATION LOOP
// ============================================================================

function animate(): void {
  requestAnimationFrame(animate);

  // Animate lights
  const time = performance.now() * 0.001;
  lights[0].position.x = Math.sin(time * 0.5) * 5;
  lights[0].position.z = Math.cos(time * 0.5) * 5;
  lights[3].position.x = Math.sin(time * 0.3 + 2) * 4;
  lights[3].position.z = Math.cos(time * 0.3 + 2) * 4;
  lightingMaterial.uniforms.uLightPositions.value = lights.map(l => l.position);

  // Animate some objects
  sceneObjects.forEach((obj, i) => {
    if (i > 0 && i % 2 === 0) {
      obj.rotation.y += 0.01;
    }
  });

  controls.update();
  renderPipeline();
}

// ============================================================================
// START
// ============================================================================

init();
