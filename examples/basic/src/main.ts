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

// Renderer
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0x0a0e14);
container.appendChild(renderer.domElement);

// ───────────────────────────────────────────────────────────────
// Lights
// ───────────────────────────────────────────────────────────────

const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
ambientLight.name = 'AmbientLight';
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.name = 'DirectionalLight';
directionalLight.position.set(5, 10, 5);
directionalLight.castShadow = true;
scene.add(directionalLight);

const pointLight = new THREE.PointLight(0x22d3ee, 2, 20);
pointLight.name = 'PointLight_Cyan';
pointLight.position.set(-3, 3, 3);
scene.add(pointLight);

// ───────────────────────────────────────────────────────────────
// Objects
// ───────────────────────────────────────────────────────────────

// Ground plane
const groundGeometry = new THREE.PlaneGeometry(20, 20);
const groundMaterial = new THREE.MeshStandardMaterial({
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
const sphereMaterial = new THREE.MeshStandardMaterial({
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

const colors = [0xfbbf24, 0x34d399, 0xfb7185, 0xa78bfa, 0xf472b6];
for (let i = 0; i < 5; i++) {
  const cubeGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
  const cubeMaterial = new THREE.MeshStandardMaterial({
    color: colors[i],
    roughness: 0.3,
    metalness: 0.6,
  });
  const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  cube.name = `Cube_${i + 1}`;
  cube.position.set(
    Math.cos((i / 5) * Math.PI * 2) * 3,
    0,
    Math.sin((i / 5) * Math.PI * 2) * 3
  );
  cube.castShadow = true;
  cubeGroup.add(cube);
}

// Torus knot
const torusKnotGeometry = new THREE.TorusKnotGeometry(0.6, 0.2, 100, 16);
const torusKnotMaterial = new THREE.MeshStandardMaterial({
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
// 3Lens Integration
// ───────────────────────────────────────────────────────────────

// Create the probe with performance rules
const probe = createProbe({
  appName: 'Basic Example',
  debug: true,
  rules: {
    maxDrawCalls: 100,
    maxTriangles: 100000,
    maxFrameTimeMs: 16.67,
  },
});

// Attach renderer and scene
probe.observeRenderer(renderer);
probe.observeScene(scene);

// Create the floating panel overlay UI
const overlay = createOverlay(probe);

// ───────────────────────────────────────────────────────────────
// Animation Loop
// ───────────────────────────────────────────────────────────────

let time = 0;

function animate() {
  requestAnimationFrame(animate);
  time += 0.016;

  // Rotate cubes
  cubeGroup.children.forEach((cube, i) => {
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.02;
    cube.position.y = Math.sin(time * 2 + i) * 0.3;
  });

  // Rotate torus knot
  torusKnot.rotation.x += 0.005;
  torusKnot.rotation.y += 0.01;

  // Pulse sphere
  const scale = 1 + Math.sin(time * 3) * 0.1;
  sphere.scale.set(scale, scale, scale);

  // Move point light
  pointLight.position.x = Math.sin(time) * 5;
  pointLight.position.z = Math.cos(time) * 5;

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
// Keyboard shortcut for overlay
// ───────────────────────────────────────────────────────────────

window.addEventListener('keydown', (e) => {
  if (e.key === 'd' && e.ctrlKey && e.shiftKey) {
    overlay.toggle();
    e.preventDefault();
  }
});

// Log that we're ready
console.log('🔍 3Lens initialized. Press Ctrl+Shift+D to toggle the devtool.');

