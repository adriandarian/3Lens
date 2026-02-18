import * as THREE from 'three';
import { bootstrap3Lens } from '@3lens/devtools';

// --- Scene setup ---
const canvas = document.getElementById('canvas') as HTMLCanvasElement;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0f);
scene.fog = new THREE.FogExp2(0x0a0a0f, 0.035);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(0, 4, 10);
camera.lookAt(0, 0, 0);

// --- Lighting ---
const ambientLight = new THREE.AmbientLight(0x334466, 1.5);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0x88aaff, 3);
dirLight.position.set(5, 10, 5);
dirLight.castShadow = true;
dirLight.shadow.mapSize.set(1024, 1024);
dirLight.shadow.camera.near = 0.5;
dirLight.shadow.camera.far = 50;
dirLight.shadow.camera.left = -10;
dirLight.shadow.camera.right = 10;
dirLight.shadow.camera.top = 10;
dirLight.shadow.camera.bottom = -10;
scene.add(dirLight);

const pointLight = new THREE.PointLight(0xff6644, 2, 12);
pointLight.position.set(-3, 3, 3);
scene.add(pointLight);

// --- Geometry ---
const floorGeo = new THREE.PlaneGeometry(20, 20);
const floorMat = new THREE.MeshStandardMaterial({ color: 0x111122, roughness: 0.9, metalness: 0.1 });
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.name = 'Floor';
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// Central cube
const cubeGeo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
const cubeMat = new THREE.MeshStandardMaterial({ color: 0x4488ff, roughness: 0.3, metalness: 0.8 });
const cube = new THREE.Mesh(cubeGeo, cubeMat);
cube.name = 'MainCube';
cube.position.y = 0.75;
cube.castShadow = true;
cube.receiveShadow = true;
scene.add(cube);

// Orbiting spheres
const sphereGeo = new THREE.SphereGeometry(0.4, 32, 32);
const sphereColors = [0xff4455, 0x44ff88, 0xffcc00];
const spheres: THREE.Mesh[] = [];

for (let i = 0; i < 3; i++) {
  const mat = new THREE.MeshStandardMaterial({
    color: sphereColors[i],
    roughness: 0.2,
    metalness: 0.6,
    emissive: sphereColors[i],
    emissiveIntensity: 0.15,
  });
  const sphere = new THREE.Mesh(sphereGeo, mat);
  sphere.name = `Sphere_${i}`;
  sphere.castShadow = true;
  scene.add(sphere);
  spheres.push(sphere);
}

// Torus
const torusGeo = new THREE.TorusGeometry(2.5, 0.12, 16, 80);
const torusMat = new THREE.MeshStandardMaterial({ color: 0x8855ff, roughness: 0.4, metalness: 0.7 });
const torus = new THREE.Mesh(torusGeo, torusMat);
torus.name = 'Torus';
torus.rotation.x = Math.PI / 2;
torus.position.y = 0.05;
scene.add(torus);

// Grid of small cubes
const smallCubeGeo = new THREE.BoxGeometry(0.3, 0.3, 0.3);
for (let x = -3; x <= 3; x += 1.5) {
  for (let z = -3; z <= 3; z += 1.5) {
    if (Math.abs(x) < 0.5 && Math.abs(z) < 0.5) continue;
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(Math.random(), 0.7, 0.5),
      roughness: 0.5,
      metalness: 0.4,
    });
    const small = new THREE.Mesh(smallCubeGeo, mat);
    small.name = `SmallCube_${x}_${z}`;
    small.position.set(x, 0.15, z);
    small.castShadow = true;
    scene.add(small);
  }
}

// --- Orbit controls (simple manual implementation) ---
let isDragging = false;
let prevMouse = { x: 0, y: 0 };
let spherical = { theta: 0, phi: Math.PI / 4, radius: 12 };

canvas.addEventListener('mousedown', (e) => {
  isDragging = true;
  prevMouse = { x: e.clientX, y: e.clientY };
});
window.addEventListener('mouseup', () => { isDragging = false; });
window.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  const dx = e.clientX - prevMouse.x;
  const dy = e.clientY - prevMouse.y;
  spherical.theta -= dx * 0.005;
  spherical.phi = Math.max(0.1, Math.min(Math.PI / 2.2, spherical.phi - dy * 0.005));
  prevMouse = { x: e.clientX, y: e.clientY };
});
canvas.addEventListener('wheel', (e) => {
  spherical.radius = Math.max(4, Math.min(30, spherical.radius + e.deltaY * 0.01));
});

// --- 3Lens devtools ---
bootstrap3Lens({
  ui: 'overlay',
  autoDiscover: true,
  logLevel: 'info',
});

// --- Animation loop ---
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  // Rotate cube
  cube.rotation.y = t * 0.6;
  cube.rotation.x = Math.sin(t * 0.4) * 0.3;

  // Orbit spheres
  spheres.forEach((sphere, i) => {
    const angle = t * 0.8 + (i * Math.PI * 2) / 3;
    const r = 2.8;
    sphere.position.set(
      Math.cos(angle) * r,
      0.5 + Math.sin(t * 1.2 + i) * 0.4,
      Math.sin(angle) * r,
    );
  });

  // Pulse point light
  pointLight.intensity = 2 + Math.sin(t * 2) * 0.8;

  // Orbit camera
  camera.position.set(
    Math.sin(spherical.theta) * Math.sin(spherical.phi) * spherical.radius,
    Math.cos(spherical.phi) * spherical.radius,
    Math.cos(spherical.theta) * Math.sin(spherical.phi) * spherical.radius,
  );
  camera.lookAt(0, 1, 0);

  renderer.render(scene, camera);
}

// --- Resize handler ---
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- F2 toggle for devtools ---
window.addEventListener('keydown', (e) => {
  if (e.key === 'F2') {
    e.preventDefault();
    const panel = document.querySelector('three-lens-panel') as any;
    if (panel) panel.toggle?.();
  }
});

animate();
