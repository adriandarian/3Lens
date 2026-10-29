import * as THREE from 'three';
import { bootstrap3Lens, manualHost } from '@3lens/devtools';

// --- Scene setup ---
const canvas = document.getElementById('canvas') as HTMLCanvasElement;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight, false);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0f);
scene.fog = new THREE.FogExp2(0x0a0a0f, 0.035);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  200
);
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
const floorMat = new THREE.MeshStandardMaterial({
  color: 0x111122,
  roughness: 0.9,
  metalness: 0.1,
});
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.name = 'Floor';
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// Central cube
const cubeGeo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
const cubeMat = new THREE.MeshStandardMaterial({
  color: 0x4488ff,
  roughness: 0.3,
  metalness: 0.8,
});
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
const torusMat = new THREE.MeshStandardMaterial({
  color: 0x8855ff,
  roughness: 0.4,
  metalness: 0.7,
});
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
      color: new THREE.Color().setHSL(
        ((x + 3) * 7 + (z + 3) * 11) / 100,
        0.7,
        0.5
      ),
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

const pointerDown = (e: MouseEvent) => {
  isDragging = true;
  prevMouse = { x: e.clientX, y: e.clientY };
};
const pointerUp = () => {
  isDragging = false;
};
const pointerMove = (e: MouseEvent) => {
  if (!isDragging) return;
  const dx = e.clientX - prevMouse.x;
  const dy = e.clientY - prevMouse.y;
  spherical.theta -= dx * 0.005;
  spherical.phi = Math.max(
    0.1,
    Math.min(Math.PI / 2.2, spherical.phi - dy * 0.005)
  );
  prevMouse = { x: e.clientX, y: e.clientY };
};
const wheel = (e: WheelEvent) => {
  spherical.radius = Math.max(
    4,
    Math.min(30, spherical.radius + e.deltaY * 0.01)
  );
};
canvas.addEventListener('mousedown', pointerDown);
window.addEventListener('mouseup', pointerUp);
window.addEventListener('mousemove', pointerMove);
canvas.addEventListener('wheel', wheel);

// --- 3Lens devtools ---
const lens = bootstrap3Lens({
  ui: 'overlay',
  viewport: document.getElementById('app-viewport')!,
  layout: 'workspace',
  autoDiscover: false,
  logLevel: 'info',
});
lens.registerContext({
  id: 'main',
  displayName: 'Vanilla three.js',
  host: manualHost({
    name: 'Vanilla three.js',
    renderer,
    scene,
    camera,
    onFocus(target, position) {
      const offset = new THREE.Vector3(
        position.x - target.x,
        position.y - target.y,
        position.z - target.z
      );
      const orbit = new THREE.Spherical().setFromVector3(offset);
      spherical = { theta: orbit.theta, phi: orbit.phi, radius: orbit.radius };
      orbitTarget.set(target.x, target.y, target.z);
    },
  }),
});
lens.select(`main:object3d:${cube.uuid}`);

const openTools = document.getElementById('open-tools')!;
const toggleCube = document.getElementById('toggle-cube') as HTMLButtonElement;
const pauseMotion = document.getElementById(
  'pause-motion'
) as HTMLButtonElement;
const openHandler = () => lens.showUI();
const cubeHandler = () => {
  if (lens.getMode() === 'offline') return;
  cube.visible = !cube.visible;
  toggleCube.textContent = cube.visible ? 'Hide MainCube' : 'Show MainCube';
};
let paused = false;
let animationTime = 0;
const orbitTarget = new THREE.Vector3(0, 1, 0);
const pauseHandler = () => {
  paused = !paused;
  pauseMotion.textContent = paused ? 'Resume motion' : 'Pause motion';
};
openTools.addEventListener('click', openHandler);
toggleCube.addEventListener('click', cubeHandler);
pauseMotion.addEventListener('click', pauseHandler);

// --- Animation loop ---
const clock = new THREE.Clock();
let animationFrame = 0;
let initialBaseline = false;

function animate() {
  animationFrame = requestAnimationFrame(animate);
  const delta = clock.getDelta();
  if (!paused) animationTime += delta;
  const t = animationTime;
  toggleCube.disabled = lens.getMode() === 'offline';

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
      Math.sin(angle) * r
    );
  });

  // Pulse point light
  pointLight.intensity = 2 + Math.sin(t * 2) * 0.8;

  // Orbit camera
  camera.position.set(
    orbitTarget.x +
      Math.sin(spherical.theta) * Math.sin(spherical.phi) * spherical.radius,
    orbitTarget.y + Math.cos(spherical.phi) * spherical.radius,
    orbitTarget.z +
      Math.cos(spherical.theta) * Math.sin(spherical.phi) * spherical.radius
  );
  camera.lookAt(orbitTarget);

  renderer.render(scene, camera);
  if (!initialBaseline) {
    lens.captureBaseline();
    initialBaseline = true;
  }
}

// --- Resize handler ---
const resizeHandler = () => {
  const bounds = canvas.getBoundingClientRect();
  if (!bounds.width || !bounds.height) return;
  camera.aspect = bounds.width / bounds.height;
  camera.updateProjectionMatrix();
  renderer.setSize(bounds.width, bounds.height, false);
};
window.addEventListener('resize', resizeHandler);
const resizeObserver = new ResizeObserver(resizeHandler);
resizeObserver.observe(canvas);
resizeHandler();

// Bootstrap owns the F2 listener and tears it down when the lens is disposed.
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    cancelAnimationFrame(animationFrame);
    lens.dispose();
    openTools.removeEventListener('click', openHandler);
    toggleCube.removeEventListener('click', cubeHandler);
    pauseMotion.removeEventListener('click', pauseHandler);
    window.removeEventListener('resize', resizeHandler);
    resizeObserver.disconnect();
    canvas.removeEventListener('mousedown', pointerDown);
    window.removeEventListener('mouseup', pointerUp);
    window.removeEventListener('mousemove', pointerMove);
    canvas.removeEventListener('wheel', wheel);
    const geometries = new Set<THREE.BufferGeometry>();
    const materials = new Set<THREE.Material>();
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        geometries.add(object.geometry);
        for (const material of Array.isArray(object.material)
          ? object.material
          : [object.material])
          materials.add(material);
      }
    });
    for (const geometry of geometries) geometry.dispose();
    for (const material of materials) material.dispose();
    dirLight.shadow.map?.dispose();
    renderer.dispose();
  });
}

animate();
