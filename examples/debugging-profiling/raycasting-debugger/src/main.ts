import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';
import '@3lens/themes/styles.css';

/**
 * Raycasting Debugger Example
 * 
 * This example demonstrates raycasting visualization and debugging.
 * Use the 3Lens overlay to:
 * - Inspect raycasted objects in the Scene panel
 * - Monitor raycast performance
 * - View intersection details
 */

// =============================================================================
// SCENE SETUP
// =============================================================================

const scene = new THREE.Scene();
scene.name = 'RaycastingDebugScene';
scene.background = new THREE.Color(0x0a0a0f);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(10, 8, 15);
camera.name = 'MainCamera';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('app')!.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 1, 0);

// =============================================================================
// BASE SCENE
// =============================================================================

// Ground
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(30, 30),
  new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.8 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
ground.name = 'Ground';
scene.add(ground);

// Grid
const grid = new THREE.GridHelper(30, 30, 0x333355, 0x222244);
grid.name = 'GridHelper';
scene.add(grid);

// Lighting
const ambient = new THREE.AmbientLight(0xffffff, 0.4);
ambient.name = 'AmbientLight';
scene.add(ambient);

const directional = new THREE.DirectionalLight(0xffffff, 1);
directional.position.set(10, 20, 10);
directional.castShadow = true;
directional.name = 'DirectionalLight';
scene.add(directional);

// =============================================================================
// RAYCASTABLE OBJECTS
// =============================================================================

const objectsGroup = new THREE.Group();
objectsGroup.name = 'RaycastableObjects';
scene.add(objectsGroup);

// Create various objects for raycasting
const geometries = [
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.SphereGeometry(0.5, 32, 32),
  new THREE.ConeGeometry(0.5, 1, 32),
  new THREE.TorusGeometry(0.4, 0.15, 16, 48),
  new THREE.CylinderGeometry(0.3, 0.5, 1, 32),
];

const colors = [0xff6b6b, 0x4ecdc4, 0x45b7d1, 0x96ceb4, 0xffeaa7];

for (let i = 0; i < 20; i++) {
  const geometry = geometries[i % geometries.length];
  const material = new THREE.MeshStandardMaterial({
    color: colors[i % colors.length],
    roughness: 0.5,
    metalness: 0.3,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(
    (Math.random() - 0.5) * 15,
    0.5 + Math.random() * 3,
    (Math.random() - 0.5) * 15
  );
  mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.name = `Object_${i}`;
  objectsGroup.add(mesh);
}

// =============================================================================
// RAYCASTING VISUALIZATION
// =============================================================================

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Visual helpers for raycast
const rayLine = new THREE.Line(
  new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]),
  new THREE.LineBasicMaterial({ color: 0xff0000 })
);
rayLine.name = 'RayLine';
rayLine.visible = false;
scene.add(rayLine);

const hitMarker = new THREE.Mesh(
  new THREE.SphereGeometry(0.1, 16, 16),
  new THREE.MeshBasicMaterial({ color: 0x00ff00 })
);
hitMarker.name = 'HitMarker';
hitMarker.visible = false;
scene.add(hitMarker);

let hoveredObject: THREE.Object3D | null = null;
const originalColors = new Map<THREE.Object3D, THREE.Color>();

function performRaycast(event: MouseEvent) {
  // Calculate mouse position in normalized device coordinates
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  
  // Update ray visualization
  const rayOrigin = raycaster.ray.origin.clone();
  const rayEnd = raycaster.ray.origin.clone().add(raycaster.ray.direction.clone().multiplyScalar(50));
  
  const positions = rayLine.geometry.attributes.position as THREE.BufferAttribute;
  positions.setXYZ(0, rayOrigin.x, rayOrigin.y, rayOrigin.z);
  positions.setXYZ(1, rayEnd.x, rayEnd.y, rayEnd.z);
  positions.needsUpdate = true;
  rayLine.visible = true;

  // Perform raycast
  const intersects = raycaster.intersectObjects(objectsGroup.children, true);

  // Reset previous hover
  if (hoveredObject) {
    const originalColor = originalColors.get(hoveredObject);
    if (originalColor && hoveredObject instanceof THREE.Mesh) {
      (hoveredObject.material as THREE.MeshStandardMaterial).emissive.copy(originalColor);
    }
    hoveredObject = null;
  }

  if (intersects.length > 0) {
    const hit = intersects[0];
    
    // Show hit marker
    hitMarker.position.copy(hit.point);
    hitMarker.visible = true;

    // Highlight hit object
    const obj = hit.object;
    if (obj instanceof THREE.Mesh) {
      const material = obj.material as THREE.MeshStandardMaterial;
      if (!originalColors.has(obj)) {
        originalColors.set(obj, material.emissive.clone());
      }
      material.emissive.setHex(0x333333);
      hoveredObject = obj;
    }

    // Update probe with hit info
    probe.updateLogicalEntity('raycast-info', {
      hitObject: hit.object.name,
      hitDistance: hit.distance.toFixed(3),
      hitPoint: `(${hit.point.x.toFixed(2)}, ${hit.point.y.toFixed(2)}, ${hit.point.z.toFixed(2)})`,
      hitFaceIndex: hit.faceIndex,
      totalIntersections: intersects.length,
    });
  } else {
    hitMarker.visible = false;
    probe.updateLogicalEntity('raycast-info', {
      hitObject: 'None',
      hitDistance: '-',
      hitPoint: '-',
      hitFaceIndex: '-',
      totalIntersections: 0,
    });
  }
}

// =============================================================================
// 3LENS INTEGRATION
// =============================================================================

const probe = createProbe({
  name: 'RaycastingDebuggerProbe',
  sampling: {
    frameStatsInterval: 1,
    sceneSnapshotInterval: 30,
  },
});

probe.observeRenderer(renderer);
probe.observeScene(scene);
probe.setAppName('Raycasting Debugger');

// Register raycast info as logical entity
probe.registerLogicalEntity('raycast-info', 'Raycast Info', {
  category: 'Debugging',
  hitObject: 'None',
  hitDistance: '-',
  hitPoint: '-',
  hitFaceIndex: '-',
  totalIntersections: 0,
});

createOverlay({ probe, theme: 'dark' });

// =============================================================================
// EVENT HANDLERS
// =============================================================================

renderer.domElement.addEventListener('mousemove', performRaycast);

renderer.domElement.addEventListener('click', (event) => {
  performRaycast(event);
  
  if (hoveredObject) {
    probe.selectObject?.(hoveredObject);
    console.log(`Selected: ${hoveredObject.name}`);
  }
});

// =============================================================================
// ANIMATION LOOP
// =============================================================================

function animate() {
  requestAnimationFrame(animate);
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
🎯 Raycasting Debugger Example
==============================
Move your mouse over objects to raycast.
Click to select an object in 3Lens.

Open the 3Lens overlay to:
- View raycast info in the Raycast Info entity
- Select and inspect hit objects
- Monitor performance
`);
