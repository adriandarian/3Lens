import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createProbe } from '@3lens/core';
import { bootstrapOverlay } from '@3lens/overlay';

/**
 * Raycasting Debugger Example
 * 
 * This example demonstrates how to visualize and debug raycasting:
 * - Ray visualization with origin, direction, and hit points
 * - Normal vectors at intersection points
 * - Performance profiling with complex scenes
 * - Different raycast modes (mouse, camera center, custom, grid)
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

const clock = new THREE.Clock();

// =============================================================================
// RAYCASTING STATE
// =============================================================================

interface RaycastOptions {
  showRay: boolean;
  showHits: boolean;
  showNormals: boolean;
  showAllHits: boolean;
  persistent: boolean;
  maxDistance: number;
  recursive: boolean;
  includeBackfaces: boolean;
}

interface RaycastStats {
  objectsTested: number;
  intersections: number;
  raycastTime: number;
  raysPerFrame: number;
}

type RayMode = 'mouse' | 'camera' | 'custom' | 'multi';

const options: RaycastOptions = {
  showRay: true,
  showHits: true,
  showNormals: true,
  showAllHits: false,
  persistent: false,
  maxDistance: 100,
  recursive: true,
  includeBackfaces: false,
};

const stats: RaycastStats = {
  objectsTested: 0,
  intersections: 0,
  raycastTime: 0,
  raysPerFrame: 0,
};

let rayMode: RayMode = 'mouse';
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Visualization objects
const rayVisualsGroup = new THREE.Group();
rayVisualsGroup.name = 'RayVisualsGroup';
scene.add(rayVisualsGroup);

const addedObjectsGroup = new THREE.Group();
addedObjectsGroup.name = 'AddedObjectsGroup';
scene.add(addedObjectsGroup);

// Custom ray origin for 'custom' mode
const customRayOrigin = new THREE.Vector3(5, 5, 5);
const customRayDirection = new THREE.Vector3(-1, -0.5, -1).normalize();

// =============================================================================
// BASE SCENE
// =============================================================================

function createBaseScene() {
  // Ground
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 30),
    new THREE.MeshStandardMaterial({ 
      color: 0x1a1a2e, 
      roughness: 0.8,
      metalness: 0.2 
    })
  );
  ground.name = 'Ground';
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
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
  directional.name = 'DirectionalLight';
  directional.position.set(10, 20, 10);
  directional.castShadow = true;
  directional.shadow.mapSize.width = 2048;
  directional.shadow.mapSize.height = 2048;
  scene.add(directional);

  // Sample objects for raycasting
  createSampleObjects();
}

function createSampleObjects() {
  // Central cube
  const cube = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2, 2),
    new THREE.MeshStandardMaterial({ color: 0xe74c3c, roughness: 0.3 })
  );
  cube.name = 'CentralCube';
  cube.position.set(0, 1, 0);
  cube.castShadow = true;
  scene.add(cube);

  // Sphere
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(1, 32, 32),
    new THREE.MeshStandardMaterial({ color: 0x3498db, roughness: 0.2 })
  );
  sphere.name = 'BlueSphere';
  sphere.position.set(-4, 1, 2);
  sphere.castShadow = true;
  scene.add(sphere);

  // Torus
  const torus = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.4, 16, 32),
    new THREE.MeshStandardMaterial({ color: 0x2ecc71, roughness: 0.4 })
  );
  torus.name = 'GreenTorus';
  torus.position.set(4, 1.5, -2);
  torus.rotation.x = Math.PI / 4;
  torus.castShadow = true;
  scene.add(torus);

  // Cylinder
  const cylinder = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.8, 3, 16),
    new THREE.MeshStandardMaterial({ color: 0xf39c12, roughness: 0.5 })
  );
  cylinder.name = 'YellowCylinder';
  cylinder.position.set(2, 1.5, 4);
  cylinder.castShadow = true;
  scene.add(cylinder);

  // Cone
  const cone = new THREE.Mesh(
    new THREE.ConeGeometry(1, 2, 16),
    new THREE.MeshStandardMaterial({ color: 0x9b59b6, roughness: 0.3 })
  );
  cone.name = 'PurpleCone';
  cone.position.set(-3, 1, -4);
  cone.castShadow = true;
  scene.add(cone);

  // Transparent box (to test seeing through)
  const transparentBox = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 3, 1.5),
    new THREE.MeshStandardMaterial({ 
      color: 0x1abc9c, 
      transparent: true, 
      opacity: 0.5,
      roughness: 0.1 
    })
  );
  transparentBox.name = 'TransparentBox';
  transparentBox.position.set(0, 1.5, 4);
  transparentBox.castShadow = true;
  scene.add(transparentBox);
}

createBaseScene();

// =============================================================================
// RAY VISUALIZATION
// =============================================================================

function clearRayVisuals() {
  while (rayVisualsGroup.children.length > 0) {
    const child = rayVisualsGroup.children[0];
    rayVisualsGroup.remove(child);
    if (child instanceof THREE.Mesh || child instanceof THREE.Line) {
      child.geometry.dispose();
      if (Array.isArray(child.material)) {
        child.material.forEach(m => m.dispose());
      } else {
        (child.material as THREE.Material).dispose();
      }
    }
  }
}

function visualizeRay(
  origin: THREE.Vector3, 
  direction: THREE.Vector3, 
  hits: THREE.Intersection[]
) {
  if (!options.persistent) {
    clearRayVisuals();
  }

  // Ray line
  if (options.showRay) {
    const rayEnd = origin.clone().add(direction.clone().multiplyScalar(options.maxDistance));
    const firstHitDistance = hits.length > 0 ? hits[0].distance : options.maxDistance;
    const hitPoint = origin.clone().add(direction.clone().multiplyScalar(firstHitDistance));

    // Ray before hit (yellow)
    const rayBeforeGeom = new THREE.BufferGeometry().setFromPoints([origin, hitPoint]);
    const rayBeforeMat = new THREE.LineBasicMaterial({ color: 0xffff00, linewidth: 2 });
    const rayBefore = new THREE.Line(rayBeforeGeom, rayBeforeMat);
    rayBefore.name = 'RayLine_BeforeHit';
    rayVisualsGroup.add(rayBefore);

    // Ray after hit (red, dimmer)
    if (hits.length > 0) {
      const rayAfterGeom = new THREE.BufferGeometry().setFromPoints([hitPoint, rayEnd]);
      const rayAfterMat = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 1, transparent: true, opacity: 0.3 });
      const rayAfter = new THREE.Line(rayAfterGeom, rayAfterMat);
      rayAfter.name = 'RayLine_AfterHit';
      rayVisualsGroup.add(rayAfter);
    }

    // Origin point
    const originGeom = new THREE.SphereGeometry(0.08, 8, 8);
    const originMat = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const originMesh = new THREE.Mesh(originGeom, originMat);
    originMesh.position.copy(origin);
    originMesh.name = 'RayOrigin';
    rayVisualsGroup.add(originMesh);
  }

  // Hit points and normals
  if (options.showHits) {
    const hitsToShow = options.showAllHits ? hits : hits.slice(0, 1);
    
    hitsToShow.forEach((hit, index) => {
      // Hit point sphere
      const hitGeom = new THREE.SphereGeometry(0.1, 16, 16);
      const hitMat = new THREE.MeshBasicMaterial({ 
        color: index === 0 ? 0x00ff00 : 0xff6600 
      });
      const hitMesh = new THREE.Mesh(hitGeom, hitMat);
      hitMesh.position.copy(hit.point);
      hitMesh.name = `HitPoint_${index}`;
      rayVisualsGroup.add(hitMesh);

      // Normal arrow
      if (options.showNormals && hit.face) {
        const normalLength = 0.5;
        const normalDir = hit.face.normal.clone();
        
        // Transform normal to world space
        if (hit.object instanceof THREE.Mesh) {
          normalDir.transformDirection(hit.object.matrixWorld);
        }

        const arrowHelper = new THREE.ArrowHelper(
          normalDir,
          hit.point,
          normalLength,
          0x00ffff,
          0.15,
          0.08
        );
        arrowHelper.name = `Normal_${index}`;
        rayVisualsGroup.add(arrowHelper);
      }
    });
  }
}

// =============================================================================
// RAYCASTING LOGIC
// =============================================================================

function performRaycast(origin: THREE.Vector3, direction: THREE.Vector3): THREE.Intersection[] {
  raycaster.set(origin, direction);
  raycaster.far = options.maxDistance;
  
  // Get all meshes to test (excluding our visualization group)
  const objectsToTest: THREE.Object3D[] = [];
  scene.traverse(obj => {
    if (obj instanceof THREE.Mesh && 
        !rayVisualsGroup.children.includes(obj) &&
        obj.parent !== rayVisualsGroup) {
      objectsToTest.push(obj);
    }
  });

  stats.objectsTested = objectsToTest.length;

  const startTime = performance.now();
  const intersections = raycaster.intersectObjects(
    options.recursive ? [scene] : objectsToTest, 
    options.recursive
  ).filter(hit => !rayVisualsGroup.children.includes(hit.object));
  
  stats.raycastTime = performance.now() - startTime;
  stats.intersections = intersections.length;

  return intersections;
}

function castMouseRay(event: MouseEvent) {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const origin = raycaster.ray.origin.clone();
  const direction = raycaster.ray.direction.clone();

  const hits = performRaycast(origin, direction);
  visualizeRay(origin, direction, hits);
  updateUI(origin, direction, hits);
  stats.raysPerFrame = 1;
}

function castCameraRay() {
  // Ray from camera center (0,0 in NDC)
  mouse.set(0, 0);
  raycaster.setFromCamera(mouse, camera);
  const origin = raycaster.ray.origin.clone();
  const direction = raycaster.ray.direction.clone();

  const hits = performRaycast(origin, direction);
  visualizeRay(origin, direction, hits);
  updateUI(origin, direction, hits);
  stats.raysPerFrame = 1;
}

function castCustomRay() {
  const hits = performRaycast(customRayOrigin, customRayDirection);
  visualizeRay(customRayOrigin, customRayDirection, hits);
  updateUI(customRayOrigin, customRayDirection, hits);
  stats.raysPerFrame = 1;
}

function castMultiRay() {
  if (!options.persistent) {
    clearRayVisuals();
  }

  const gridSize = 5;
  const spacing = 0.3;
  let totalHits = 0;
  let totalTime = 0;
  let allHits: THREE.Intersection[] = [];

  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      const ndcX = ((x / (gridSize - 1)) - 0.5) * spacing * 2;
      const ndcY = ((y / (gridSize - 1)) - 0.5) * spacing * 2;
      
      mouse.set(ndcX, ndcY);
      raycaster.setFromCamera(mouse, camera);
      const origin = raycaster.ray.origin.clone();
      const direction = raycaster.ray.direction.clone();

      const startTime = performance.now();
      const hits = performRaycast(origin, direction);
      totalTime += performance.now() - startTime;
      
      totalHits += hits.length;
      allHits = allHits.concat(hits);

      // Visualize each ray (simplified for performance)
      if (options.showRay) {
        const rayLength = hits.length > 0 ? hits[0].distance : options.maxDistance;
        const rayEnd = origin.clone().add(direction.clone().multiplyScalar(rayLength));
        const rayGeom = new THREE.BufferGeometry().setFromPoints([origin, rayEnd]);
        const rayMat = new THREE.LineBasicMaterial({ 
          color: hits.length > 0 ? 0x00ff00 : 0xff0000,
          transparent: true,
          opacity: 0.5
        });
        const rayLine = new THREE.Line(rayGeom, rayMat);
        rayVisualsGroup.add(rayLine);
      }
    }
  }

  stats.raysPerFrame = gridSize * gridSize;
  stats.raycastTime = totalTime;
  stats.intersections = totalHits;
  
  updateUI(camera.position, camera.getWorldDirection(new THREE.Vector3()), allHits);
}

// =============================================================================
// UI UPDATES
// =============================================================================

function updateUI(origin: THREE.Vector3, direction: THREE.Vector3, hits: THREE.Intersection[]) {
  // Update ray info
  const rayInfoEl = document.getElementById('ray-info');
  const rayOriginEl = document.getElementById('ray-origin');
  const rayDirectionEl = document.getElementById('ray-direction');
  
  if (rayInfoEl && rayOriginEl && rayDirectionEl) {
    rayInfoEl.style.display = 'block';
    rayOriginEl.textContent = `(${origin.x.toFixed(2)}, ${origin.y.toFixed(2)}, ${origin.z.toFixed(2)})`;
    rayDirectionEl.textContent = `(${direction.x.toFixed(2)}, ${direction.y.toFixed(2)}, ${direction.z.toFixed(2)})`;
  }

  // Update stats
  const updateStat = (id: string, value: string | number, warn?: number, danger?: number) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = typeof value === 'number' ? value.toString() : value;
    el.classList.remove('warning', 'danger', 'good');
    if (typeof value === 'number' && warn !== undefined && danger !== undefined) {
      if (value >= danger) el.classList.add('danger');
      else if (value >= warn) el.classList.add('warning');
      else el.classList.add('good');
    }
  };

  updateStat('stat-tested', stats.objectsTested, 100, 500);
  updateStat('stat-hits', stats.intersections);
  updateStat('stat-time', `${stats.raycastTime.toFixed(2)} ms`, 1, 5);
  updateStat('stat-rays', stats.raysPerFrame);

  // Update hit list
  const hitListEl = document.getElementById('hit-list');
  if (hitListEl) {
    if (hits.length === 0) {
      hitListEl.innerHTML = '<div style="color: #666; font-size: 11px; text-align: center; padding: 20px;">No intersections</div>';
    } else {
      const hitsToShow = options.showAllHits ? hits : hits.slice(0, 5);
      hitListEl.innerHTML = hitsToShow.map((hit, i) => `
        <div class="hit-item ${i === 0 ? 'first' : ''}">
          <span class="hit-name">${hit.object.name || 'Unnamed'}</span>
          <span class="hit-distance">${hit.distance.toFixed(3)} u</span>
        </div>
      `).join('');
      
      if (!options.showAllHits && hits.length > 5) {
        hitListEl.innerHTML += `<div style="color: #666; font-size: 10px; text-align: center; padding: 4px;">+${hits.length - 5} more hits</div>`;
      }
    }
  }
}

function updateStatsDisplay() {
  const updateStat = (id: string, value: string | number) => {
    const el = document.getElementById(id);
    if (el) el.textContent = typeof value === 'number' ? value.toString() : value;
  };

  updateStat('stat-tested', stats.objectsTested);
  updateStat('stat-hits', stats.intersections);
  updateStat('stat-time', `${stats.raycastTime.toFixed(2)} ms`);
  updateStat('stat-rays', stats.raysPerFrame);
}

// =============================================================================
// SCENE COMPLEXITY HELPERS
// =============================================================================

function addRandomCubes(count: number) {
  for (let i = 0; i < count; i++) {
    const size = 0.3 + Math.random() * 0.5;
    const geometry = new THREE.BoxGeometry(size, size, size);
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(Math.random(), 0.7, 0.5),
      roughness: 0.5,
    });
    const cube = new THREE.Mesh(geometry, material);
    cube.name = `AddedCube_${i}`;
    cube.position.set(
      (Math.random() - 0.5) * 20,
      Math.random() * 5 + 0.25,
      (Math.random() - 0.5) * 20
    );
    cube.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    cube.castShadow = true;
    addedObjectsGroup.add(cube);
  }
}

function addRandomSpheres(count: number) {
  for (let i = 0; i < count; i++) {
    const radius = 0.2 + Math.random() * 0.4;
    const geometry = new THREE.SphereGeometry(radius, 16, 16);
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(Math.random(), 0.7, 0.5),
      roughness: 0.3,
    });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.name = `AddedSphere_${i}`;
    sphere.position.set(
      (Math.random() - 0.5) * 20,
      Math.random() * 5 + radius,
      (Math.random() - 0.5) * 20
    );
    sphere.castShadow = true;
    addedObjectsGroup.add(sphere);
  }
}

function addNestedGroups() {
  const createNestedGroup = (depth: number, parent: THREE.Group) => {
    if (depth <= 0) return;
    
    for (let i = 0; i < 3; i++) {
      const group = new THREE.Group();
      group.name = `NestedGroup_D${depth}_${i}`;
      group.position.set(
        (Math.random() - 0.5) * 4,
        Math.random() * 2,
        (Math.random() - 0.5) * 4
      );
      
      // Add a small mesh to each group
      const geom = new THREE.TetrahedronGeometry(0.2);
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(depth / 5, 0.8, 0.5),
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.name = `NestedMesh_D${depth}_${i}`;
      group.add(mesh);
      
      parent.add(group);
      createNestedGroup(depth - 1, group);
    }
  };
  
  const rootGroup = new THREE.Group();
  rootGroup.name = 'NestedRootGroup';
  rootGroup.position.set(0, 0, 8);
  createNestedGroup(4, rootGroup);
  addedObjectsGroup.add(rootGroup);
}

function addHighPolyMesh() {
  // Create a high-poly mesh to test raycasting performance
  const geometry = new THREE.TorusKnotGeometry(1.5, 0.5, 256, 64);
  const material = new THREE.MeshStandardMaterial({
    color: 0xff6b6b,
    roughness: 0.3,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = 'HighPolyTorusKnot';
  mesh.position.set(-6, 2, -6);
  mesh.castShadow = true;
  addedObjectsGroup.add(mesh);

  // Add info about triangle count
  const triCount = geometry.attributes.position.count / 3;
  console.log(`Added high-poly mesh with ~${triCount.toLocaleString()} triangles`);
}

function clearAddedObjects() {
  while (addedObjectsGroup.children.length > 0) {
    const child = addedObjectsGroup.children[0];
    addedObjectsGroup.remove(child);
    child.traverse(obj => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach(m => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    });
  }
}

// =============================================================================
// UI SETUP
// =============================================================================

function setupUI() {
  // Ray mode buttons
  const modeButtons = ['btn-mouse-ray', 'btn-camera-ray', 'btn-custom-ray', 'btn-multi-ray'];
  const modes: RayMode[] = ['mouse', 'camera', 'custom', 'multi'];
  
  modeButtons.forEach((id, index) => {
    const btn = document.getElementById(id);
    if (!btn) return;
    
    btn.addEventListener('click', () => {
      rayMode = modes[index];
      modeButtons.forEach(btnId => {
        document.getElementById(btnId)?.classList.remove('active');
      });
      btn.classList.add('active');
      
      if (rayMode === 'camera') {
        castCameraRay();
      } else if (rayMode === 'custom') {
        castCustomRay();
      } else if (rayMode === 'multi') {
        castMultiRay();
      }
    });
  });

  // Visualization checkboxes
  const checkboxes: Record<string, keyof RaycastOptions> = {
    'chk-show-ray': 'showRay',
    'chk-show-hits': 'showHits',
    'chk-show-normals': 'showNormals',
    'chk-show-all-hits': 'showAllHits',
    'chk-persistent': 'persistent',
    'chk-recursive': 'recursive',
    'chk-backface': 'includeBackfaces',
  };

  Object.entries(checkboxes).forEach(([id, optionKey]) => {
    const checkbox = document.getElementById(id) as HTMLInputElement;
    if (!checkbox) return;
    
    checkbox.checked = options[optionKey] as boolean;
    checkbox.addEventListener('change', () => {
      (options[optionKey] as boolean) = checkbox.checked;
    });
  });

  // Distance slider
  const distanceSlider = document.getElementById('ray-distance') as HTMLInputElement;
  const distanceDisplay = document.getElementById('distance-display');
  
  if (distanceSlider && distanceDisplay) {
    distanceSlider.value = options.maxDistance.toString();
    distanceDisplay.textContent = options.maxDistance.toString();
    
    distanceSlider.addEventListener('input', () => {
      options.maxDistance = parseInt(distanceSlider.value);
      distanceDisplay.textContent = options.maxDistance.toString();
    });
  }

  // Scene complexity buttons
  document.getElementById('btn-add-cubes')?.addEventListener('click', () => addRandomCubes(100));
  document.getElementById('btn-add-spheres')?.addEventListener('click', () => addRandomSpheres(50));
  document.getElementById('btn-add-nested')?.addEventListener('click', () => addNestedGroups());
  document.getElementById('btn-add-bvh')?.addEventListener('click', () => addHighPolyMesh());
  document.getElementById('btn-clear-scene')?.addEventListener('click', () => {
    clearAddedObjects();
    clearRayVisuals();
  });

  // Mouse click handler for raycasting
  renderer.domElement.addEventListener('click', (event) => {
    if (rayMode === 'mouse') {
      castMouseRay(event);
    }
  });

  // Keyboard shortcuts
  window.addEventListener('keydown', (e) => {
    if (e.key === 'c' || e.key === 'C') {
      clearRayVisuals();
    }
  });
}

// =============================================================================
// CUSTOM RAY ORIGIN VISUALIZATION
// =============================================================================

function createCustomOriginHelper() {
  // Visual indicator for custom ray origin
  const group = new THREE.Group();
  group.name = 'CustomOriginHelper';
  
  const sphereGeom = new THREE.SphereGeometry(0.2, 16, 16);
  const sphereMat = new THREE.MeshBasicMaterial({ color: 0xff00ff, wireframe: true });
  const sphere = new THREE.Mesh(sphereGeom, sphereMat);
  group.add(sphere);
  
  // Direction arrow
  const arrow = new THREE.ArrowHelper(
    customRayDirection,
    new THREE.Vector3(0, 0, 0),
    2,
    0xff00ff,
    0.3,
    0.15
  );
  group.add(arrow);
  
  group.position.copy(customRayOrigin);
  scene.add(group);
  
  return group;
}

const customOriginHelper = createCustomOriginHelper();

// =============================================================================
// 3LENS INTEGRATION
// =============================================================================

const probe = createProbe({
  name: 'RaycastingDebuggerProbe',
  sampling: {
    frameStatsInterval: 1,
    sceneSnapshotInterval: 30,
    enableGPUTiming: true,
  },
});

probe.observeRenderer(renderer);
probe.observeScene(scene);

bootstrapOverlay({
  probe,
  position: 'right',
  defaultWidth: 380,
  defaultOpen: false,
});

// =============================================================================
// ANIMATION LOOP
// =============================================================================

function animate() {
  requestAnimationFrame(animate);
  
  const delta = clock.getDelta();
  controls.update();

  // Continuous raycasting for camera and multi modes
  if (rayMode === 'camera') {
    castCameraRay();
  } else if (rayMode === 'multi') {
    castMultiRay();
  }

  // Animate custom ray origin
  const time = clock.getElapsedTime();
  customRayOrigin.x = 5 + Math.sin(time * 0.5) * 2;
  customRayOrigin.y = 5 + Math.cos(time * 0.3) * 2;
  customOriginHelper.position.copy(customRayOrigin);
  
  if (rayMode === 'custom') {
    castCustomRay();
  }

  renderer.render(scene, camera);
}

// =============================================================================
// INITIALIZATION
// =============================================================================

setupUI();
animate();

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

console.log(`
🎯 Raycasting Debugger Example
==============================
Click in the scene to cast rays (Mouse Ray mode).
Switch modes to test different raycasting scenarios.

Controls:
- Click: Cast ray (in Mouse Ray mode)
- C: Clear all ray visualizations
- Ctrl+Shift+D: Toggle 3Lens overlay

Add objects to test performance with complex scenes!
`);
