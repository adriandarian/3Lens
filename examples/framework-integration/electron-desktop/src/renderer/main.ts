import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';

/**
 * Electron Renderer Process
 * 
 * Creates a Three.js scene with 3Lens integration in an Electron desktop app.
 */

// Scene setup
const scene = new THREE.Scene();
scene.name = 'ElectronScene';
scene.background = new THREE.Color(0x0a0a0f);
scene.fog = new THREE.Fog(0x0a0a0f, 10, 50);

// Camera
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(5, 5, 8);
camera.name = 'MainCamera';

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
document.getElementById('app')!.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 3;
controls.maxDistance = 20;

// Clock
const clock = new THREE.Clock();

// Lights
const ambient = new THREE.AmbientLight(0xffffff, 0.3);
ambient.name = 'AmbientLight';
scene.add(ambient);

const directional = new THREE.DirectionalLight(0xffffff, 1.5);
directional.name = 'DirectionalLight';
directional.position.set(5, 10, 5);
directional.castShadow = true;
directional.shadow.mapSize.width = 2048;
directional.shadow.mapSize.height = 2048;
scene.add(directional);

const point = new THREE.PointLight(0xff7f50, 0.5, 20);
point.name = 'AccentLight';
point.position.set(-3, 3, 2);
scene.add(point);

// Ground
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.8 })
);
ground.name = 'Ground';
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.5;
ground.receiveShadow = true;
scene.add(ground);

// Rotating box
const boxMaterial = new THREE.MeshStandardMaterial({
  color: 0x4ecdc4,
  roughness: 0.3,
  metalness: 0.5,
});
const box = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.5, 1.5), boxMaterial);
box.name = 'RotatingBox';
box.position.set(-2, 1, 0);
box.castShadow = true;
scene.add(box);

// Bouncing sphere
const sphereMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x9b59b6,
  roughness: 0.1,
  metalness: 0.8,
  clearcoat: 1,
});
const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.8, 32, 32), sphereMaterial);
sphere.name = 'BouncingSphere';
sphere.position.set(2, 1, 0);
sphere.castShadow = true;
scene.add(sphere);

// Torus group
const torusGroup = new THREE.Group();
torusGroup.name = 'TorusGroup';
torusGroup.position.set(0, 2, -2);

const torusGeometry = new THREE.TorusGeometry(0.5, 0.15, 16, 32);
const colors = [0xe74c3c, 0x2ecc71, 0x3498db];
const positions = [
  [1.5, 0, 0],
  [-0.75, 1.3, 0],
  [-0.75, -1.3, 0],
];

colors.forEach((color, i) => {
  const material = new THREE.MeshStandardMaterial({ color, roughness: 0.4 });
  const torus = new THREE.Mesh(torusGeometry, material);
  torus.name = `Torus_${['Red', 'Green', 'Blue'][i]}`;
  torus.position.set(positions[i][0], positions[i][1], positions[i][2]);
  torus.castShadow = true;
  torusGroup.add(torus);
});

scene.add(torusGroup);

// 3Lens Probe
const probe = createProbe({
  appName: 'Electron Desktop Example',
});

probe.observeRenderer(renderer);
probe.observeScene(scene);
createOverlay(probe);

// Info panel
interface AppInfo {
  electronVersion: string;
  chromeVersion: string;
  nodeVersion: string;
  platform: string;
}

let appInfo: AppInfo | null = null;

// Listen for app info from main process
if (window.electronAPI) {
  window.electronAPI.onAppInfo((info) => {
    appInfo = info as AppInfo;
    updateInfoPanel();
  });
}

function createInfoPanel() {
  const panel = document.createElement('div');
  panel.className = 'info-panel';
  panel.id = 'info-panel';
  panel.innerHTML = `
    <h3>3Lens Electron</h3>
    <p>FPS: <span id="fps">--</span></p>
    <p>Draw Calls: <span id="draw-calls">--</span></p>
    <p>Triangles: <span id="triangles">--</span></p>
    <div class="system-info" id="system-info">
      Loading system info...
    </div>
  `;
  document.getElementById('app')!.appendChild(panel);
}

function updateInfoPanel() {
  const systemInfoEl = document.getElementById('system-info');
  if (systemInfoEl && appInfo) {
    systemInfoEl.innerHTML = `
      <p><span>Electron:</span> ${appInfo.electronVersion}</p>
      <p><span>Chrome:</span> ${appInfo.chromeVersion}</p>
      <p><span>Node:</span> ${appInfo.nodeVersion}</p>
      <p><span>Platform:</span> ${appInfo.platform}</p>
    `;
  }
}

createInfoPanel();

// Stats tracking
let frameCount = 0;
let lastTime = performance.now();
let currentFps = 0;

function updateStats() {
  document.getElementById('fps')!.textContent = currentFps.toString();
  document.getElementById('draw-calls')!.textContent = renderer.info.render.calls.toString();
  document.getElementById('triangles')!.textContent = renderer.info.render.triangles.toLocaleString();
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  const elapsed = clock.getElapsedTime();
  const delta = clock.getDelta();

  // FPS calculation
  frameCount++;
  const now = performance.now();
  if (now - lastTime >= 1000) {
    currentFps = Math.round((frameCount * 1000) / (now - lastTime));
    frameCount = 0;
    lastTime = now;
    updateStats();
  }

  // Animate box
  box.rotation.x += delta * 0.5;
  box.rotation.y += delta * 0.3;

  // Animate sphere
  sphere.position.y = 1 + Math.abs(Math.sin(elapsed * 2)) * 0.5;
  sphere.rotation.z = Math.sin(elapsed) * 0.2;

  // Animate torus group
  torusGroup.rotation.y = elapsed * 0.3;
  torusGroup.children.forEach((child, i) => {
    child.rotation.x = elapsed * 2 + i * Math.PI * 0.66;
  });

  controls.update();
  renderer.render(scene, camera);
  probe.onFrame();
}

// Handle resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();

