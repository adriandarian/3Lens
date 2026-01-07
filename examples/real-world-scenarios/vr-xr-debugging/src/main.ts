import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';
import { XRHandModelFactory } from 'three/addons/webxr/XRHandModelFactory.js';
import { createProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';

// ───────────────────────────────────────────────────────────────
// Types
// ───────────────────────────────────────────────────────────────

interface XRState {
  isSupported: boolean;
  vrSupported: boolean;
  arSupported: boolean;
  isSessionActive: boolean;
  sessionType: 'vr' | 'ar' | null;
  referenceSpace: XRReferenceSpaceType;
}

// ───────────────────────────────────────────────────────────────
// Scene Setup
// ───────────────────────────────────────────────────────────────

const container = document.getElementById('canvas-container')!;

// Scene
const scene = new THREE.Scene();
scene.name = 'XRScene';
scene.background = new THREE.Color(0x0a0e14);

// Camera
const camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  0.01,
  100
);
camera.name = 'MainCamera';
camera.position.set(0, 1.6, 3);

// Renderer with XR support
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.xr.enabled = true;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

// Controls (for non-XR mode)
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(0, 1, 0);

// ───────────────────────────────────────────────────────────────
// XR State
// ───────────────────────────────────────────────────────────────

const xrState: XRState = {
  isSupported: false,
  vrSupported: false,
  arSupported: false,
  isSessionActive: false,
  sessionType: null,
  referenceSpace: 'local-floor',
};

// ───────────────────────────────────────────────────────────────
// Lighting
// ───────────────────────────────────────────────────────────────

const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
ambientLight.name = 'AmbientLight';
scene.add(ambientLight);

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
scene.add(directionalLight);

// ───────────────────────────────────────────────────────────────
// Debug Helpers
// ───────────────────────────────────────────────────────────────

const debugGroup = new THREE.Group();
debugGroup.name = 'DebugHelpers';
scene.add(debugGroup);

// Floor grid
const floorGrid = new THREE.GridHelper(10, 20, 0x444444, 0x333333);
floorGrid.name = 'FloorGrid';
debugGroup.add(floorGrid);

// World axes
const axesHelper = new THREE.AxesHelper(2);
axesHelper.name = 'WorldAxes';
axesHelper.visible = false;
debugGroup.add(axesHelper);

// Play area bounds (placeholder)
const boundsGeometry = new THREE.BufferGeometry();
const boundsMaterial = new THREE.LineBasicMaterial({ 
  color: 0x8b5cf6, 
  transparent: true, 
  opacity: 0.5 
});
const boundsHelper = new THREE.LineLoop(boundsGeometry, boundsMaterial);
boundsHelper.name = 'PlayBounds';
boundsHelper.visible = false;
debugGroup.add(boundsHelper);

// ───────────────────────────────────────────────────────────────
// Scene Environment
// ───────────────────────────────────────────────────────────────

// Floor
const floorGeometry = new THREE.PlaneGeometry(10, 10);
floorGeometry.name = 'FloorGeometry';
const floorMaterial = new THREE.MeshStandardMaterial({
  color: 0x1a1a2e,
  roughness: 0.8,
  metalness: 0.2,
  name: 'FloorMaterial',
});
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.name = 'Floor';
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// Interactive objects
const objectsGroup = new THREE.Group();
objectsGroup.name = 'InteractiveObjects';
scene.add(objectsGroup);

// Pedestal with object
const pedestalGeometry = new THREE.CylinderGeometry(0.3, 0.4, 1, 32);
pedestalGeometry.name = 'PedestalGeometry';
const pedestalMaterial = new THREE.MeshStandardMaterial({
  color: 0x333344,
  roughness: 0.4,
  metalness: 0.6,
});
const pedestal = new THREE.Mesh(pedestalGeometry, pedestalMaterial);
pedestal.name = 'Pedestal';
pedestal.position.set(0, 0.5, -2);
pedestal.castShadow = true;
pedestal.receiveShadow = true;
objectsGroup.add(pedestal);

// Floating crystal
const crystalGeometry = new THREE.OctahedronGeometry(0.3, 0);
crystalGeometry.name = 'CrystalGeometry';
const crystalMaterial = new THREE.MeshStandardMaterial({
  color: 0x8b5cf6,
  roughness: 0.2,
  metalness: 0.8,
  emissive: 0x4422aa,
  emissiveIntensity: 0.3,
});
const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
crystal.name = 'FloatingCrystal';
crystal.position.set(0, 1.5, -2);
crystal.castShadow = true;
objectsGroup.add(crystal);

// Grabbable objects
const grabbableColors = [0xef4444, 0x22c55e, 0x3b82f6, 0xf59e0b];
const grabbablePositions = [
  [-1.5, 1, -1],
  [1.5, 1, -1],
  [-1, 1, -2.5],
  [1, 1, -2.5],
];

grabbablePositions.forEach((pos, i) => {
  const geo = i % 2 === 0 
    ? new THREE.BoxGeometry(0.15, 0.15, 0.15)
    : new THREE.SphereGeometry(0.1, 16, 16);
  geo.name = `Grabbable${i}Geometry`;
  
  const mat = new THREE.MeshStandardMaterial({
    color: grabbableColors[i],
    roughness: 0.3,
    metalness: 0.7,
  });
  
  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = `Grabbable_${i}`;
  mesh.position.set(pos[0], pos[1], pos[2]);
  mesh.castShadow = true;
  mesh.userData.grabbable = true;
  objectsGroup.add(mesh);
});

// Info panels
function createInfoPanel(text: string, position: THREE.Vector3) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  
  ctx.fillStyle = 'rgba(20, 25, 35, 0.9)';
  ctx.roundRect(0, 0, 512, 256, 16);
  ctx.fill();
  
  ctx.strokeStyle = 'rgba(139, 92, 246, 0.5)';
  ctx.lineWidth = 4;
  ctx.roundRect(2, 2, 508, 252, 14);
  ctx.stroke();
  
  ctx.fillStyle = '#e6e6e6';
  ctx.font = '32px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  const lines = text.split('\n');
  lines.forEach((line, i) => {
    ctx.fillText(line, 256, 128 + (i - (lines.length - 1) / 2) * 40);
  });
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.name = `InfoPanelTexture_${text.substring(0, 10)}`;
  
  const geometry = new THREE.PlaneGeometry(1, 0.5);
  geometry.name = 'InfoPanelGeometry';
  const material = new THREE.MeshBasicMaterial({ 
    map: texture, 
    transparent: true,
    side: THREE.DoubleSide,
  });
  
  const panel = new THREE.Mesh(geometry, material);
  panel.name = `InfoPanel_${text.substring(0, 10)}`;
  panel.position.copy(position);
  panel.lookAt(camera.position);
  
  return panel;
}

const infoPanel1 = createInfoPanel('Welcome to VR/XR\nDebugging Demo', new THREE.Vector3(0, 2.5, -3));
scene.add(infoPanel1);

const infoPanel2 = createInfoPanel('Use controllers to\ninteract with objects', new THREE.Vector3(-2, 2, -2));
scene.add(infoPanel2);

const infoPanel3 = createInfoPanel('Check 3Lens devtools\nfor XR metrics', new THREE.Vector3(2, 2, -2));
scene.add(infoPanel3);

// ───────────────────────────────────────────────────────────────
// XR Controllers
// ───────────────────────────────────────────────────────────────

const controllerModelFactory = new XRControllerModelFactory();
const handModelFactory = new XRHandModelFactory();

// Controller groups
const controllerGroup = new THREE.Group();
controllerGroup.name = 'Controllers';
scene.add(controllerGroup);

// Pointer rays
const rayMaterial = new THREE.LineBasicMaterial({
  color: 0x8b5cf6,
  linewidth: 2,
});

function createControllerRay() {
  const points = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, -5),
  ];
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  geometry.name = 'ControllerRayGeometry';
  const line = new THREE.Line(geometry, rayMaterial);
  line.name = 'ControllerRay';
  return line;
}

// Setup controllers
const controller1 = renderer.xr.getController(0);
controller1.name = 'Controller_Left';
controller1.add(createControllerRay());
controllerGroup.add(controller1);

const controller2 = renderer.xr.getController(1);
controller2.name = 'Controller_Right';
controller2.add(createControllerRay());
controllerGroup.add(controller2);

// Controller models
const controllerGrip1 = renderer.xr.getControllerGrip(0);
controllerGrip1.name = 'ControllerGrip_Left';
controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1));
controllerGroup.add(controllerGrip1);

const controllerGrip2 = renderer.xr.getControllerGrip(1);
controllerGrip2.name = 'ControllerGrip_Right';
controllerGrip2.add(controllerModelFactory.createControllerModel(controllerGrip2));
controllerGroup.add(controllerGrip2);

// Hands
const hand1 = renderer.xr.getHand(0);
hand1.name = 'Hand_Left';
hand1.add(handModelFactory.createHandModel(hand1, 'mesh'));
controllerGroup.add(hand1);

const hand2 = renderer.xr.getHand(1);
hand2.name = 'Hand_Right';
hand2.add(handModelFactory.createHandModel(hand2, 'mesh'));
controllerGroup.add(hand2);

// Controller data storage
const controllerData = {
  left: { connected: false, position: new THREE.Vector3(), rotation: new THREE.Euler(), buttons: [] as boolean[] },
  right: { connected: false, position: new THREE.Vector3(), rotation: new THREE.Euler(), buttons: [] as boolean[] },
};

// Controller events
controller1.addEventListener('connected', (event) => {
  controllerData.left.connected = true;
  updateControllerUI('left', true);
  console.log('Left controller connected:', event.data);
});

controller1.addEventListener('disconnected', () => {
  controllerData.left.connected = false;
  updateControllerUI('left', false);
});

controller2.addEventListener('connected', (event) => {
  controllerData.right.connected = true;
  updateControllerUI('right', true);
  console.log('Right controller connected:', event.data);
});

controller2.addEventListener('disconnected', () => {
  controllerData.right.connected = false;
  updateControllerUI('right', false);
});

// Select events (trigger press)
controller1.addEventListener('selectstart', () => {
  controllerData.left.buttons[0] = true;
});

controller1.addEventListener('selectend', () => {
  controllerData.left.buttons[0] = false;
});

controller2.addEventListener('selectstart', () => {
  controllerData.right.buttons[0] = true;
});

controller2.addEventListener('selectend', () => {
  controllerData.right.buttons[0] = false;
});

// ───────────────────────────────────────────────────────────────
// 3Lens Integration
// ───────────────────────────────────────────────────────────────

const probe = createProbe({
  appName: 'VR/XR Debugging Demo',
});

probe.observeRenderer(renderer);
probe.observeScene(scene);
probe.setThreeReference(THREE);

probe.initializeTransformGizmo(scene, camera, renderer.domElement, THREE);
probe.initializeCameraController(camera, THREE, { x: 0, y: 1.6, z: 3 });

createOverlay(probe);

// ───────────────────────────────────────────────────────────────
// WebXR Session Management
// ───────────────────────────────────────────────────────────────

async function checkXRSupport() {
  if (!navigator.xr) {
    xrState.isSupported = false;
    updateXRStatusUI();
    document.getElementById('xr-banner')!.classList.add('visible');
    return;
  }
  
  xrState.isSupported = true;
  
  try {
    xrState.vrSupported = await navigator.xr.isSessionSupported('immersive-vr');
  } catch (e) {
    xrState.vrSupported = false;
  }
  
  try {
    xrState.arSupported = await navigator.xr.isSessionSupported('immersive-ar');
  } catch (e) {
    xrState.arSupported = false;
  }
  
  updateXRStatusUI();
  
  // Update button states
  (document.getElementById('btn-vr') as HTMLButtonElement).disabled = !xrState.vrSupported;
  (document.getElementById('btn-ar') as HTMLButtonElement).disabled = !xrState.arSupported;
}

async function startXRSession(mode: 'immersive-vr' | 'immersive-ar') {
  if (!navigator.xr) return;
  
  const sessionInit: XRSessionInit = {
    optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking', 'layers'],
  };
  
  if (mode === 'immersive-ar') {
    sessionInit.optionalFeatures!.push('hit-test');
  }
  
  try {
    const session = await navigator.xr.requestSession(mode, sessionInit);
    
    renderer.xr.setReferenceSpaceType(xrState.referenceSpace);
    await renderer.xr.setSession(session);
    
    xrState.isSessionActive = true;
    xrState.sessionType = mode === 'immersive-vr' ? 'vr' : 'ar';
    
    // Update UI
    updateXRStatusUI();
    (document.getElementById('btn-exit') as HTMLButtonElement).disabled = false;
    
    // Hide non-XR UI in actual XR
    if (mode === 'immersive-ar') {
      scene.background = null;
    }
    
    session.addEventListener('end', () => {
      xrState.isSessionActive = false;
      xrState.sessionType = null;
      updateXRStatusUI();
      (document.getElementById('btn-exit') as HTMLButtonElement).disabled = true;
      scene.background = new THREE.Color(0x0a0e14);
    });
    
    console.log(`${mode} session started`);
  } catch (error) {
    console.error('Failed to start XR session:', error);
  }
}

function endXRSession() {
  const session = renderer.xr.getSession();
  if (session) {
    session.end();
  }
}

// ───────────────────────────────────────────────────────────────
// UI Updates
// ───────────────────────────────────────────────────────────────

function updateXRStatusUI() {
  const webxrEl = document.getElementById('webxr-status')!;
  webxrEl.textContent = xrState.isSupported ? 'Available' : 'Not Available';
  webxrEl.className = `status-value ${xrState.isSupported ? 'supported' : 'unsupported'}`;
  
  const vrEl = document.getElementById('vr-status')!;
  vrEl.textContent = xrState.vrSupported ? 'Supported' : 'Not Supported';
  vrEl.className = `status-value ${xrState.vrSupported ? 'supported' : 'unsupported'}`;
  
  const arEl = document.getElementById('ar-status')!;
  arEl.textContent = xrState.arSupported ? 'Supported' : 'Not Supported';
  arEl.className = `status-value ${xrState.arSupported ? 'supported' : 'unsupported'}`;
  
  const sessionEl = document.getElementById('session-status')!;
  if (xrState.isSessionActive) {
    sessionEl.textContent = xrState.sessionType === 'vr' ? 'VR Active' : 'AR Active';
    sessionEl.className = 'status-value active';
  } else {
    sessionEl.textContent = 'None';
    sessionEl.className = 'status-value';
  }
}

function updateControllerUI(hand: 'left' | 'right', connected: boolean) {
  const statusEl = document.getElementById(`${hand}-status`)!;
  statusEl.textContent = connected ? 'Connected' : 'Disconnected';
  statusEl.className = `controller-status ${connected ? '' : 'disconnected'}`;
}

function updateControllerDataUI() {
  // Left controller
  if (controllerData.left.connected) {
    const pos = controllerData.left.position;
    const rot = controllerData.left.rotation;
    document.getElementById('left-data')!.innerHTML = `
      <div>Pos: ${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}, ${pos.z.toFixed(2)}</div>
      <div>Rot: ${(rot.x * 180 / Math.PI).toFixed(0)}°, ${(rot.y * 180 / Math.PI).toFixed(0)}°, ${(rot.z * 180 / Math.PI).toFixed(0)}°</div>
      <div>Trigger: ${controllerData.left.buttons[0] ? '🔴' : '⚪'}</div>
    `;
  }
  
  // Right controller
  if (controllerData.right.connected) {
    const pos = controllerData.right.position;
    const rot = controllerData.right.rotation;
    document.getElementById('right-data')!.innerHTML = `
      <div>Pos: ${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}, ${pos.z.toFixed(2)}</div>
      <div>Rot: ${(rot.x * 180 / Math.PI).toFixed(0)}°, ${(rot.y * 180 / Math.PI).toFixed(0)}°, ${(rot.z * 180 / Math.PI).toFixed(0)}°</div>
      <div>Trigger: ${controllerData.right.buttons[0] ? '🔴' : '⚪'}</div>
    `;
  }
}

// ───────────────────────────────────────────────────────────────
// Stats
// ───────────────────────────────────────────────────────────────

let frameCount = 0;
let lastTime = performance.now();
let fps = 0;

function updateStats() {
  frameCount++;
  const now = performance.now();
  const elapsed = now - lastTime;
  
  if (elapsed >= 500) {
    fps = Math.round((frameCount / elapsed) * 1000);
    frameCount = 0;
    lastTime = now;
  }
  
  const fpsEl = document.getElementById('stat-fps')!;
  fpsEl.textContent = `${fps} Hz`;
  fpsEl.className = `stat-value ${fps >= 70 ? 'good' : fps >= 45 ? 'warn' : 'bad'}`;
  
  document.getElementById('stat-frametime')!.textContent = `${(1000 / Math.max(fps, 1)).toFixed(2)} ms`;
  
  // XR-specific stats
  const session = renderer.xr.getSession();
  if (session) {
    document.getElementById('stat-target')!.textContent = '72 Hz'; // Could get from session
    
    // Get render target size for IPD estimation
    const baseLayer = session.renderState.baseLayer;
    if (baseLayer) {
      const width = baseLayer.framebufferWidth;
      const height = baseLayer.framebufferHeight;
      document.getElementById('stat-resolution')!.textContent = `${Math.round(width/2)}×${height}`;
    }
  }
  
  // Renderer stats
  const info = renderer.info;
  document.getElementById('stat-draws')!.textContent = info.render.calls.toString();
  document.getElementById('stat-triangles')!.textContent = 
    info.render.triangles > 1000 
      ? `${(info.render.triangles / 1000).toFixed(1)}K` 
      : info.render.triangles.toString();
  
  // Head pose (camera in XR)
  const cam = renderer.xr.isPresenting ? renderer.xr.getCamera() : camera;
  const camPos = cam.position;
  const camRot = cam.rotation;
  document.getElementById('head-pose')!.innerHTML = `
    Position: ${camPos.x.toFixed(2)}, ${camPos.y.toFixed(2)}, ${camPos.z.toFixed(2)}<br>
    Rotation: ${(camRot.x * 180 / Math.PI).toFixed(0)}°, ${(camRot.y * 180 / Math.PI).toFixed(0)}°, ${(camRot.z * 180 / Math.PI).toFixed(0)}°
  `;
}

// ───────────────────────────────────────────────────────────────
// UI Event Handlers
// ───────────────────────────────────────────────────────────────

document.getElementById('btn-vr')!.addEventListener('click', () => {
  startXRSession('immersive-vr');
});

document.getElementById('btn-ar')!.addEventListener('click', () => {
  startXRSession('immersive-ar');
});

document.getElementById('btn-exit')!.addEventListener('click', () => {
  endXRSession();
});

// Reference space selection
document.getElementById('ref-space-select')!.addEventListener('change', (e) => {
  const value = (e.target as HTMLSelectElement).value as XRReferenceSpaceType;
  xrState.referenceSpace = value;
  document.getElementById('current-ref-space')!.textContent = value;
  
  // If session is active, we'd need to restart to change reference space
  if (xrState.isSessionActive) {
    console.log('Note: Reference space change will apply to next session');
  }
});

// Debug toggles
document.querySelectorAll('.toggle-item').forEach(item => {
  item.addEventListener('click', () => {
    const checkbox = item.querySelector('input') as HTMLInputElement;
    checkbox.checked = !checkbox.checked;
    item.classList.toggle('active', checkbox.checked);
    
    const toggle = (item as HTMLElement).dataset.toggle;
    switch (toggle) {
      case 'controllers':
        controllerGroup.visible = checkbox.checked;
        break;
      case 'rays':
        controller1.children[0].visible = checkbox.checked;
        controller2.children[0].visible = checkbox.checked;
        break;
      case 'hands':
        hand1.visible = checkbox.checked;
        hand2.visible = checkbox.checked;
        break;
      case 'bounds':
        boundsHelper.visible = checkbox.checked;
        break;
      case 'floor':
        floorGrid.visible = checkbox.checked;
        break;
      case 'axes':
        axesHelper.visible = checkbox.checked;
        break;
    }
  });
});

// ───────────────────────────────────────────────────────────────
// Window Resize
// ───────────────────────────────────────────────────────────────

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ───────────────────────────────────────────────────────────────
// Animation Loop
// ───────────────────────────────────────────────────────────────

const clock = new THREE.Clock();

function animate() {
  const elapsed = clock.getElapsedTime();
  
  // Animate crystal
  crystal.rotation.y = elapsed * 0.5;
  crystal.position.y = 1.5 + Math.sin(elapsed * 2) * 0.1;
  
  // Update controller data
  if (controllerData.left.connected) {
    controller1.getWorldPosition(controllerData.left.position);
    controllerData.left.rotation.copy(controller1.rotation);
  }
  if (controllerData.right.connected) {
    controller2.getWorldPosition(controllerData.right.position);
    controllerData.right.rotation.copy(controller2.rotation);
  }
  
  // Update info panels to face camera
  const cam = renderer.xr.isPresenting ? renderer.xr.getCamera() : camera;
  [infoPanel1, infoPanel2, infoPanel3].forEach(panel => {
    panel.lookAt(cam.position);
  });
  
  // Only update controls in non-XR mode
  if (!renderer.xr.isPresenting) {
    controls.update();
  }
  
  // Update UI
  updateStats();
  updateControllerDataUI();
  
  renderer.render(scene, camera);
}

// Use XR animation loop
renderer.setAnimationLoop(animate);

// ───────────────────────────────────────────────────────────────
// Initialize
// ───────────────────────────────────────────────────────────────

checkXRSupport();

console.log('🥽 VR/XR Debugging Demo with 3Lens DevTools');
console.log('📱 Use WebXR Emulator extension if no VR hardware');
console.log('⌨️ Press Ctrl+Shift+D to toggle devtools');
