import * as THREE from 'three';
import { createProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';

// ───────────────────────────────────────────────────────────────
// Setup Scene
// ───────────────────────────────────────────────────────────────

const container = document.getElementById('canvas-container')!;
const scene = new THREE.Scene();
scene.name = 'MainScene';

// Camera
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.name = 'MainCamera';
camera.position.set(5, 5, 8);
camera.lookAt(0, 0, 0);

// Renderer with shadows enabled
const renderer = new THREE.WebGLRenderer({
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0x0a0e14);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

// ───────────────────────────────────────────────────────────────
// Lights with Shadow Maps (creates render targets!)
// ───────────────────────────────────────────────────────────────

const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
ambientLight.name = 'AmbientLight';
scene.add(ambientLight);

// Directional light with shadow map (2048x2048 render target)
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.name = 'DirectionalLight';
directionalLight.position.set(5, 10, 5);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 50;
directionalLight.shadow.camera.left = -10;
directionalLight.shadow.camera.right = 10;
directionalLight.shadow.camera.top = 10;
directionalLight.shadow.camera.bottom = -10;
directionalLight.shadow.bias = -0.0001;
scene.add(directionalLight);

// Point light with shadow map (512x512 cube render target)
const pointLight = new THREE.PointLight(0x22d3ee, 2, 20);
pointLight.name = 'PointLight_Cyan';
pointLight.position.set(-3, 3, 3);
pointLight.castShadow = true;
pointLight.shadow.mapSize.width = 512;
pointLight.shadow.mapSize.height = 512;
pointLight.shadow.camera.near = 0.5;
pointLight.shadow.camera.far = 20;
scene.add(pointLight);

// Spot light with shadow map (1024x1024 render target)
const spotLight = new THREE.SpotLight(0xf472b6, 3);
spotLight.name = 'SpotLight_Pink';
spotLight.position.set(4, 6, -3);
spotLight.angle = Math.PI / 6;
spotLight.penumbra = 0.3;
spotLight.decay = 2;
spotLight.distance = 30;
spotLight.castShadow = true;
spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;
spotLight.shadow.camera.near = 1;
spotLight.shadow.camera.far = 30;
spotLight.target.position.set(0, 0, 0);
spotLight.target.name = 'SpotLight_Target';
scene.add(spotLight);
scene.add(spotLight.target);

// ───────────────────────────────────────────────────────────────
// Objects
// ───────────────────────────────────────────────────────────────

// Ground plane
const groundGeometry = new THREE.PlaneGeometry(20, 20);
groundGeometry.name = 'GroundPlane';
const groundMaterial = new THREE.MeshStandardMaterial({
  name: 'GroundMaterial',
  color: 0x1a222c,
  roughness: 0.8,
  metalness: 0.2,
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.name = 'Ground';
ground.rotation.x = -Math.PI / 2;
ground.position.y = -1;
ground.receiveShadow = true;
scene.add(ground);

// Central sphere
const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
sphereGeometry.name = 'CentralSphereGeometry';
const sphereMaterial = new THREE.MeshStandardMaterial({
  name: 'BlueSphere',
  color: 0x60a5fa,
  roughness: 0.2,
  metalness: 0.8,
});
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphere.name = 'CentralSphere';
sphere.castShadow = true;
scene.add(sphere);

// Group of cubes
const cubeGroup = new THREE.Group();
cubeGroup.name = 'CubeGroup';
scene.add(cubeGroup);

// Create shared and unique materials for cubes
const goldMaterial = new THREE.MeshStandardMaterial({
  name: 'GoldMaterial',
  color: 0xfbbf24,
  roughness: 0.3,
  metalness: 0.8,
});

const emeraldMaterial = new THREE.MeshStandardMaterial({
  name: 'EmeraldMaterial', 
  color: 0x34d399,
  roughness: 0.2,
  metalness: 0.6,
});

// Shared cube geometry - best practice for performance!
// All 8 cubes share this single geometry instance
const sharedCubeGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
sharedCubeGeometry.name = 'SharedCubeGeometry';

// 8 cubes: some share materials, some have unique materials
const cubeConfigs = [
  { color: 0xfbbf24, material: goldMaterial },
  { color: 0x34d399, material: emeraldMaterial },
  { color: 0xfb7185, material: null },
  { color: 0xfbbf24, material: goldMaterial },
  { color: 0xa78bfa, material: null },
  { color: 0x34d399, material: emeraldMaterial },
  { color: 0xf472b6, material: null },
  { color: 0xfbbf24, material: goldMaterial },
];

for (let i = 0; i < 8; i++) {
  const config = cubeConfigs[i];
  const material = config.material || new THREE.MeshStandardMaterial({
    color: config.color,
    roughness: 0.3,
    metalness: 0.6,
  });
  const cube = new THREE.Mesh(sharedCubeGeometry, material);
  cube.name = `Cube_${i + 1}`;
  cube.position.set(
    Math.cos((i / 8) * Math.PI * 2) * 3,
    0,
    Math.sin((i / 8) * Math.PI * 2) * 3
  );
  cube.castShadow = true;
  cubeGroup.add(cube);
}

// Torus knot
const torusKnotGeometry = new THREE.TorusKnotGeometry(0.6, 0.2, 100, 16);
torusKnotGeometry.name = 'TorusKnotGeometry';
const torusKnotMaterial = new THREE.MeshStandardMaterial({
  name: 'CyanMetal',
  color: 0x22d3ee,
  roughness: 0.1,
  metalness: 0.9,
});
const torusKnot = new THREE.Mesh(torusKnotGeometry, torusKnotMaterial);
torusKnot.name = 'TorusKnot';
torusKnot.position.set(0, 2, 0);
torusKnot.castShadow = true;
scene.add(torusKnot);

// ───────────────────────────────────────────────────────────────
// RENDER TARGET DEMO 1: Reflective Mirror Sphere
// Uses a CubeCamera to capture environment into a cube render target
// ───────────────────────────────────────────────────────────────

const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
  generateMipmaps: true,
  minFilter: THREE.LinearMipmapLinearFilter,
});
cubeRenderTarget.texture.name = 'ReflectionCubeMap';

const cubeCamera = new THREE.CubeCamera(0.1, 100, cubeRenderTarget);
cubeCamera.name = 'ReflectionCubeCamera';
scene.add(cubeCamera);

// Chrome mirror ball
const mirrorSphereGeometry = new THREE.SphereGeometry(0.7, 32, 32);
mirrorSphereGeometry.name = 'MirrorSphereGeometry';
const mirrorMaterial = new THREE.MeshStandardMaterial({
  name: 'ChromeMirrorMaterial',
  color: 0xffffff,
  roughness: 0.0,
  metalness: 1.0,
  envMap: cubeRenderTarget.texture,
  envMapIntensity: 1.0,
});
const mirrorSphere = new THREE.Mesh(mirrorSphereGeometry, mirrorMaterial);
mirrorSphere.name = 'MirrorBall';
mirrorSphere.position.set(-3, 0.7, -2);
mirrorSphere.castShadow = true;
scene.add(mirrorSphere);

// ───────────────────────────────────────────────────────────────
// RENDER TARGET DEMO 2: Floating Monitor with Live Camera Feed
// Shows a bird's eye view of the scene on a floating screen
// ───────────────────────────────────────────────────────────────

// Create render target for the monitor display
const monitorRT = new THREE.WebGLRenderTarget(512, 512, {
  minFilter: THREE.LinearFilter,
  magFilter: THREE.LinearFilter,
});
monitorRT.texture.name = 'MonitorFeed';

// Overhead camera looking down at the scene
const overheadCamera = new THREE.PerspectiveCamera(70, 1, 0.1, 100);
overheadCamera.name = 'OverheadCamera';
overheadCamera.position.set(0, 12, 0);
overheadCamera.lookAt(0, 0, 0);

// Monitor group (screen + frame + stand)
const monitorGroup = new THREE.Group();
monitorGroup.name = 'FloatingMonitor';
monitorGroup.position.set(6, 2.5, 0);
monitorGroup.rotation.y = -Math.PI / 3;
scene.add(monitorGroup);

// Monitor screen (shows the render target)
const screenGeometry = new THREE.PlaneGeometry(2, 1.5);
screenGeometry.name = 'ScreenPlane';
const screenMaterial = new THREE.MeshBasicMaterial({
  name: 'MonitorScreenMaterial',
  map: monitorRT.texture,
});
const monitorScreen = new THREE.Mesh(screenGeometry, screenMaterial);
monitorScreen.name = 'MonitorScreen';
monitorGroup.add(monitorScreen);

// Glowing frame around the monitor
const frameGeometry = new THREE.BoxGeometry(2.2, 1.7, 0.1);
frameGeometry.name = 'FrameBox';
const frameMaterial = new THREE.MeshStandardMaterial({
  name: 'MonitorFrameMaterial',
  color: 0x22d3ee,
  roughness: 0.3,
  metalness: 0.9,
  emissive: 0x22d3ee,
  emissiveIntensity: 0.3,
});
const monitorFrame = new THREE.Mesh(frameGeometry, frameMaterial);
monitorFrame.name = 'MonitorFrame';
monitorFrame.position.z = -0.06;
monitorGroup.add(monitorFrame);

// Monitor stand/pole
const standGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2, 16);
standGeometry.name = 'StandPole';
const standMaterial = new THREE.MeshStandardMaterial({
  name: 'StandMetal',
  color: 0x374151,
  roughness: 0.5,
  metalness: 0.8,
});
const monitorStand = new THREE.Mesh(standGeometry, standMaterial);
monitorStand.name = 'MonitorStand';
monitorStand.position.set(0, -1.6, -0.1);
monitorGroup.add(monitorStand);

// Stand base
const baseGeometry = new THREE.CylinderGeometry(0.3, 0.4, 0.1, 16);
baseGeometry.name = 'StandBase';
const monitorBase = new THREE.Mesh(baseGeometry, standMaterial);
monitorBase.name = 'MonitorBase';
monitorBase.position.set(0, -2.6, -0.1);
monitorGroup.add(monitorBase);

// Label text (using a small plane with emissive material)
const labelGeometry = new THREE.PlaneGeometry(1.5, 0.2);
labelGeometry.name = 'LabelPlane';
const labelMaterial = new THREE.MeshBasicMaterial({
  name: 'LabelGlow',
  color: 0x22d3ee,
  transparent: true,
  opacity: 0.8,
});
const monitorLabel = new THREE.Mesh(labelGeometry, labelMaterial);
monitorLabel.name = 'MonitorLabel';
monitorLabel.position.set(0, -0.95, 0.01);
monitorGroup.add(monitorLabel);

// ───────────────────────────────────────────────────────────────
// 3Lens Integration
// ───────────────────────────────────────────────────────────────

const probe = createProbe({
  appName: 'Basic Example',
  debug: true,
  rules: {
    maxDrawCalls: 100,
    maxTriangles: 100000,
    maxFrameTimeMs: 16.67,
  },
});

probe.setThreeReference(THREE);
probe.observeRenderer(renderer);
probe.observeScene(scene);

// Initialize inspect mode for interactive object selection
probe.initializeInspectMode(renderer.domElement, camera, THREE);
// Note: Inspect mode is disabled by default. Press 'I' key to toggle it on/off.

// Initialize transform gizmo for manipulating objects
probe.initializeTransformGizmo(scene, camera, renderer.domElement, THREE);

// Initialize camera controller for focus/fly-to functionality
probe.initializeCameraController(camera, THREE, { x: 0, y: 0, z: 0 });

// Register our custom render targets for the Render Targets panel
probe.observeRenderTarget(cubeRenderTarget, 'reflection');
probe.observeRenderTarget(monitorRT, 'custom');

const overlay = createOverlay(probe);

// ───────────────────────────────────────────────────────────────
// Animation Loop
// ───────────────────────────────────────────────────────────────

let time = 0;
let frameCount = 0;

function animate() {
  requestAnimationFrame(animate);
  time += 0.016;
  frameCount++;

  // Rotate cubes
  cubeGroup.children.forEach((cube, i) => {
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.02;
    cube.position.y = Math.sin(time * 2 + i) * 0.3;
  });

  // Rotate torus knot
  torusKnot.rotation.x += 0.005;
  torusKnot.rotation.y += 0.01;

  // Pulse central sphere
  const scale = 1 + Math.sin(time * 3) * 0.1;
  sphere.scale.set(scale, scale, scale);

  // Move point light in a circle
  pointLight.position.x = Math.sin(time) * 5;
  pointLight.position.z = Math.cos(time) * 5;

  // Orbit spot light
  spotLight.position.x = Math.cos(time * 0.5) * 6;
  spotLight.position.z = Math.sin(time * 0.5) * 6;

  // Gently bob the mirror sphere
  mirrorSphere.position.y = 0.7 + Math.sin(time * 1.2) * 0.2;

  // Rotate monitor slightly
  monitorGroup.rotation.y = -Math.PI / 3 + Math.sin(time * 0.3) * 0.1;

  // Update cube camera for mirror reflections (every 10 frames)
  if (frameCount % 10 === 0) {
    mirrorSphere.visible = false;
    cubeCamera.position.copy(mirrorSphere.position);
    cubeCamera.update(renderer, scene);
    mirrorSphere.visible = true;
  }

  // Render overhead camera view to monitor (every 5 frames)
  if (frameCount % 5 === 0) {
    monitorScreen.visible = false;
    renderer.setRenderTarget(monitorRT);
    renderer.clear();
    renderer.render(scene, overheadCamera);
    renderer.setRenderTarget(null);
    monitorScreen.visible = true;
  }

  // Main render
  renderer.render(scene, camera);
}

animate();

// ───────────────────────────────────────────────────────────────
// Resize Handler
// ───────────────────────────────────────────────────────────────

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ───────────────────────────────────────────────────────────────
// Keyboard shortcuts
// ───────────────────────────────────────────────────────────────

let inspectModeEnabled = false;

window.addEventListener('keydown', (e) => {
  // Toggle overlay: Ctrl+Shift+D
  if (e.key === 'd' && e.ctrlKey && e.shiftKey) {
    overlay.toggle();
    e.preventDefault();
  }
  
  // Toggle inspect mode: Press 'I' key
  if (e.key === 'i' || e.key === 'I') {
    inspectModeEnabled = !inspectModeEnabled;
    probe.setInspectModeEnabled(inspectModeEnabled);
    
    // Show visual feedback
    const indicator = document.getElementById('inspect-indicator');
    if (indicator) {
      indicator.style.display = inspectModeEnabled ? 'block' : 'none';
    } else if (inspectModeEnabled) {
      // Create indicator if it doesn't exist
      const div = document.createElement('div');
      div.id = 'inspect-indicator';
      div.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(34, 211, 238, 0.9);
        color: #000;
        padding: 12px 24px;
        border-radius: 8px;
        font-family: monospace;
        font-size: 14px;
        font-weight: bold;
        z-index: 1000000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        pointer-events: none;
      `;
      div.textContent = '🔍 INSPECT MODE: Click objects to select them | Press I to disable';
      document.body.appendChild(div);
    }
    
    e.preventDefault();
  }
});

// Create initial indicator (hidden)
const indicator = document.createElement('div');
indicator.id = 'inspect-indicator';
indicator.style.cssText = `
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(34, 211, 238, 0.9);
  color: #000;
  padding: 12px 24px;
  border-radius: 8px;
  font-family: monospace;
  font-size: 14px;
  font-weight: bold;
  z-index: 1000000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  pointer-events: none;
  display: none;
`;
indicator.textContent = '🔍 INSPECT MODE: Click objects to select them | Press I to disable';
document.body.appendChild(indicator);

console.log('🔍 3Lens initialized.');
console.log('');
console.log('⌨️  Keyboard Shortcuts:');
console.log('   • Ctrl+Shift+D - Toggle devtool overlay');
console.log('   • I - Toggle inspect mode (click objects to select)');
console.log('');
console.log('📺 Render Targets in this demo:');
console.log('   • 3x Shadow Maps (DirectionalLight, PointLight, SpotLight)');
console.log('   • 1x Cube Render Target (Mirror Ball reflections)');
console.log('   • 1x 2D Render Target (Floating Monitor feed)');
