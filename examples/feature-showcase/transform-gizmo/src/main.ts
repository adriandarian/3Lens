/**
 * Transform Gizmo Demo
 * 
 * This example showcases 3Lens's TransformGizmo helper for manipulating scene objects.
 * 
 * Features demonstrated:
 * - Click to select objects in the scene
 * - Transform gizmo with translate/rotate/scale modes
 * - World vs local coordinate space
 * - Snap to grid functionality
 * - Full undo/redo history
 * 
 * All transform controls are managed through 3Lens - no custom UI needed.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createProbe, TransformGizmo, SelectionHelper } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';
import '@3lens/themes/styles.css';

// ============================================================================
// SCENE SETUP
// ============================================================================

const scene = new THREE.Scene();
scene.name = 'TransformGizmoScene';
scene.background = new THREE.Color(0x0a0a0f);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.name = 'MainCamera';
camera.position.set(8, 6, 10);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('app')!.appendChild(renderer.domElement);

const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = true;
orbitControls.target.set(0, 1, 0);

// ============================================================================
// SCENE OBJECTS
// ============================================================================

function createScene() {
  // Ground
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.8 })
  );
  ground.name = 'Ground';
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Grid
  const grid = new THREE.GridHelper(20, 20, 0x333355, 0x222244);
  grid.name = 'GridHelper';
  scene.add(grid);

  // Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  ambient.name = 'AmbientLight';
  scene.add(ambient);

  const directional = new THREE.DirectionalLight(0xffffff, 1);
  directional.name = 'DirectionalLight';
  directional.position.set(5, 10, 5);
  directional.castShadow = true;
  directional.shadow.mapSize.width = 2048;
  directional.shadow.mapSize.height = 2048;
  scene.add(directional);

  // Demo objects - various shapes with distinct colors
  const objects = [
    { geometry: new THREE.BoxGeometry(1.5, 1.5, 1.5), color: 0xe74c3c, position: [-3, 0.75, 0], name: 'RedCube' },
    { geometry: new THREE.SphereGeometry(0.8, 32, 32), color: 0x2ecc71, position: [0, 0.8, 0], name: 'GreenSphere' },
    { geometry: new THREE.CylinderGeometry(0.6, 0.6, 2, 24), color: 0x3498db, position: [3, 1, 0], name: 'BlueCylinder' },
    { geometry: new THREE.TorusGeometry(0.7, 0.3, 16, 32), color: 0xf39c12, position: [0, 1, 3], name: 'YellowTorus', rotation: [Math.PI / 2, 0, 0] },
    { geometry: new THREE.ConeGeometry(0.7, 1.5, 16), color: 0x9b59b6, position: [0, 0.75, -3], name: 'PurpleCone' },
  ];

  objects.forEach(config => {
    const material = new THREE.MeshStandardMaterial({ 
      color: config.color, 
      roughness: 0.3,
      metalness: 0.1
    });
    const mesh = new THREE.Mesh(config.geometry, material);
    mesh.name = config.name;
    mesh.position.set(config.position[0], config.position[1], config.position[2]);
    if (config.rotation) {
      mesh.rotation.set(config.rotation[0], config.rotation[1], config.rotation[2]);
    }
    mesh.castShadow = true;
    scene.add(mesh);
  });
}

createScene();

// ============================================================================
// 3LENS INTEGRATION
// ============================================================================

const probe = createProbe({ appName: 'Transform-Gizmo-Demo' });
probe.setThreeReference(THREE);
probe.observeRenderer(renderer);
probe.observeScene(scene);

// Create the overlay
createOverlay({ probe, theme: 'dark' });

// Initialize the TransformGizmo helper
const transformGizmo = new TransformGizmo(probe);
transformGizmo.initialize(scene, camera, renderer.domElement, THREE);

// Create selection helper for click-to-select
const selectionHelper = new SelectionHelper(probe, camera, renderer.domElement);

// Enable transform gizmo
transformGizmo.enable();

// When an object is selected, the transform gizmo automatically attaches to it
// The 3Lens overlay provides UI controls for mode/space/snap settings

// Disable orbit controls when dragging the transform gizmo
transformGizmo.onDraggingChanged((isDragging) => {
  orbitControls.enabled = !isDragging;
});

// Log transform changes (these are also tracked in 3Lens history)
transformGizmo.onTransformChanged((entry) => {
  console.log(`[3Lens] Transform: ${entry.objectName} - ${entry.after.position.x.toFixed(2)}, ${entry.after.position.y.toFixed(2)}, ${entry.after.position.z.toFixed(2)}`);
});

// ============================================================================
// KEYBOARD SHORTCUTS
// ============================================================================

window.addEventListener('keydown', (e) => {
  // Don't handle if typing in an input
  if (e.target instanceof HTMLInputElement) return;

  switch (e.key.toLowerCase()) {
    case 'w':
      transformGizmo.setMode('translate');
      break;
    case 'e':
      transformGizmo.setMode('rotate');
      break;
    case 'r':
      transformGizmo.setMode('scale');
      break;
    case 'q':
      transformGizmo.toggleSpace();
      break;
    case 'z':
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        if (e.shiftKey) {
          transformGizmo.redo();
        } else {
          transformGizmo.undo();
        }
      }
      break;
    case 'escape':
      probe.selectObject(null);
      break;
  }
});

// ============================================================================
// ANIMATION LOOP
// ============================================================================

function animate() {
  requestAnimationFrame(animate);
  orbitControls.update();
  transformGizmo.update();
  renderer.render(scene, camera);
}

// ============================================================================
// RESIZE HANDLING
// ============================================================================

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ============================================================================
// START
// ============================================================================

animate();

console.log(`
🔧 Transform Gizmo Demo
=======================
Click objects to select them. Use 3Lens transform controls to manipulate.

Keyboard Shortcuts:
- W: Translate mode
- E: Rotate mode
- R: Scale mode
- Q: Toggle world/local space
- Ctrl+Z: Undo
- Ctrl+Shift+Z: Redo
- Esc: Deselect

Open 3Lens overlay for additional controls and history.
`);
