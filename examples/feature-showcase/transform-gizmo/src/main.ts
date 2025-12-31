import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { createProbe } from '@3lens/core';
import { bootstrapOverlay } from '@3lens/overlay';

/**
 * Transform Gizmo Demo
 * 
 * Showcases the transform gizmo features of 3Lens:
 * - Translate, rotate, scale modes
 * - World vs local coordinate space
 * - Snap to grid functionality
 * - Full undo/redo history
 */

// =============================================================================
// SCENE SETUP
// =============================================================================

const scene = new THREE.Scene();
scene.name = 'TransformGizmoScene';
scene.background = new THREE.Color(0x0a0a0f);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(8, 6, 10);
camera.name = 'MainCamera';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('app')!.appendChild(renderer.domElement);

const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = true;
orbitControls.target.set(0, 1, 0);

// =============================================================================
// TRANSFORM CONTROLS
// =============================================================================

const transformControls = new TransformControls(camera, renderer.domElement);
transformControls.name = 'TransformControls';
scene.add(transformControls);

// Disable orbit controls while transforming
transformControls.addEventListener('dragging-changed', (event) => {
  orbitControls.enabled = !event.value;
  
  if (!event.value && selectedObject) {
    // Dragging ended - record the change
    recordTransformChange();
  }
});

// =============================================================================
// HISTORY SYSTEM
// =============================================================================

interface TransformState {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
}

interface HistoryEntry {
  objectName: string;
  objectUuid: string;
  action: 'translate' | 'rotate' | 'scale';
  before: TransformState;
  after: TransformState;
  timestamp: number;
}

const history: HistoryEntry[] = [];
let historyIndex = -1;
let pendingTransformStart: TransformState | null = null;

function captureTransformState(obj: THREE.Object3D): TransformState {
  return {
    position: obj.position.clone(),
    rotation: obj.rotation.clone(),
    scale: obj.scale.clone(),
  };
}

function applyTransformState(obj: THREE.Object3D, state: TransformState) {
  obj.position.copy(state.position);
  obj.rotation.copy(state.rotation);
  obj.scale.copy(state.scale);
}

function startTransformTracking() {
  if (selectedObject) {
    pendingTransformStart = captureTransformState(selectedObject);
  }
}

function recordTransformChange() {
  if (!selectedObject || !pendingTransformStart) return;
  
  const after = captureTransformState(selectedObject);
  
  // Check if anything actually changed
  const posChanged = !pendingTransformStart.position.equals(after.position);
  const rotChanged = !pendingTransformStart.rotation.equals(after.rotation);
  const scaleChanged = !pendingTransformStart.scale.equals(after.scale);
  
  if (!posChanged && !rotChanged && !scaleChanged) {
    pendingTransformStart = null;
    return;
  }
  
  // Determine action type
  let action: 'translate' | 'rotate' | 'scale' = 'translate';
  if (rotChanged) action = 'rotate';
  if (scaleChanged) action = 'scale';
  
  // Remove any redo history
  if (historyIndex < history.length - 1) {
    history.splice(historyIndex + 1);
  }
  
  // Add new entry
  history.push({
    objectName: selectedObject.name,
    objectUuid: selectedObject.uuid,
    action,
    before: pendingTransformStart,
    after,
    timestamp: Date.now(),
  });
  
  historyIndex = history.length - 1;
  pendingTransformStart = null;
  
  // Limit history size
  if (history.length > 50) {
    history.shift();
    historyIndex--;
  }
  
  updateHistoryUI();
}

function undo() {
  if (historyIndex < 0) return;
  
  const entry = history[historyIndex];
  const obj = scene.getObjectByProperty('uuid', entry.objectUuid);
  
  if (obj) {
    applyTransformState(obj, entry.before);
    if (selectedObject === obj) {
      updateTransformDisplay();
    }
  }
  
  historyIndex--;
  updateHistoryUI();
}

function redo() {
  if (historyIndex >= history.length - 1) return;
  
  historyIndex++;
  const entry = history[historyIndex];
  const obj = scene.getObjectByProperty('uuid', entry.objectUuid);
  
  if (obj) {
    applyTransformState(obj, entry.after);
    if (selectedObject === obj) {
      updateTransformDisplay();
    }
  }
  
  updateHistoryUI();
}

// =============================================================================
// SCENE OBJECTS
// =============================================================================

interface SceneObject {
  mesh: THREE.Mesh;
  color: string;
}

const sceneObjects: SceneObject[] = [];

function createBaseScene() {
  // Ground
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshStandardMaterial({ 
      color: 0x1a1a2e, 
      roughness: 0.8 
    })
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

  // Create demo objects
  createDemoObjects();
}

function createDemoObjects() {
  // Red cube
  const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 1.5, 1.5),
    new THREE.MeshStandardMaterial({ color: 0xe74c3c, roughness: 0.3 })
  );
  cube.name = 'RedCube';
  cube.position.set(-3, 0.75, 0);
  cube.castShadow = true;
  scene.add(cube);
  sceneObjects.push({ mesh: cube, color: '#e74c3c' });

  // Green sphere
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.8, 32, 32),
    new THREE.MeshStandardMaterial({ color: 0x2ecc71, roughness: 0.2 })
  );
  sphere.name = 'GreenSphere';
  sphere.position.set(0, 0.8, 0);
  sphere.castShadow = true;
  scene.add(sphere);
  sceneObjects.push({ mesh: sphere, color: '#2ecc71' });

  // Blue cylinder
  const cylinder = new THREE.Mesh(
    new THREE.CylinderGeometry(0.6, 0.6, 2, 24),
    new THREE.MeshStandardMaterial({ color: 0x3498db, roughness: 0.4 })
  );
  cylinder.name = 'BlueCylinder';
  cylinder.position.set(3, 1, 0);
  cylinder.castShadow = true;
  scene.add(cylinder);
  sceneObjects.push({ mesh: cylinder, color: '#3498db' });

  // Yellow torus
  const torus = new THREE.Mesh(
    new THREE.TorusGeometry(0.7, 0.3, 16, 32),
    new THREE.MeshStandardMaterial({ color: 0xf39c12, roughness: 0.3 })
  );
  torus.name = 'YellowTorus';
  torus.position.set(0, 1, 3);
  torus.rotation.x = Math.PI / 2;
  torus.castShadow = true;
  scene.add(torus);
  sceneObjects.push({ mesh: torus, color: '#f39c12' });

  // Purple cone
  const cone = new THREE.Mesh(
    new THREE.ConeGeometry(0.7, 1.5, 16),
    new THREE.MeshStandardMaterial({ color: 0x9b59b6, roughness: 0.4 })
  );
  cone.name = 'PurpleCone';
  cone.position.set(0, 0.75, -3);
  cone.castShadow = true;
  scene.add(cone);
  sceneObjects.push({ mesh: cone, color: '#9b59b6' });
}

createBaseScene();

// =============================================================================
// SELECTION
// =============================================================================

let selectedObject: THREE.Object3D | null = null;

function selectObject(obj: THREE.Object3D | null) {
  selectedObject = obj;
  
  if (obj) {
    transformControls.attach(obj);
    startTransformTracking();
    updateTransformDisplay();
    document.getElementById('transform-display')!.style.display = 'block';
  } else {
    transformControls.detach();
    document.getElementById('transform-display')!.style.display = 'none';
  }
  
  updateObjectListUI();
}

function resetSelectedTransform() {
  if (!selectedObject) return;
  
  const before = captureTransformState(selectedObject);
  
  selectedObject.position.set(0, 0, 0);
  selectedObject.rotation.set(0, 0, 0);
  selectedObject.scale.set(1, 1, 1);
  
  // Find original position for this object type
  const objData = sceneObjects.find(o => o.mesh === selectedObject);
  if (objData) {
    // Re-apply sensible default positions
    if (selectedObject.name === 'RedCube') {
      selectedObject.position.set(-3, 0.75, 0);
    } else if (selectedObject.name === 'GreenSphere') {
      selectedObject.position.set(0, 0.8, 0);
    } else if (selectedObject.name === 'BlueCylinder') {
      selectedObject.position.set(3, 1, 0);
    } else if (selectedObject.name === 'YellowTorus') {
      selectedObject.position.set(0, 1, 3);
      selectedObject.rotation.x = Math.PI / 2;
    } else if (selectedObject.name === 'PurpleCone') {
      selectedObject.position.set(0, 0.75, -3);
    }
  }
  
  const after = captureTransformState(selectedObject);
  
  // Record in history
  if (historyIndex < history.length - 1) {
    history.splice(historyIndex + 1);
  }
  history.push({
    objectName: selectedObject.name,
    objectUuid: selectedObject.uuid,
    action: 'translate',
    before,
    after,
    timestamp: Date.now(),
  });
  historyIndex = history.length - 1;
  
  updateTransformDisplay();
  updateHistoryUI();
}

// =============================================================================
// UI UPDATES
// =============================================================================

function updateTransformDisplay() {
  if (!selectedObject) return;
  
  const pos = selectedObject.position;
  const rot = selectedObject.rotation;
  const scale = selectedObject.scale;
  
  document.getElementById('pos-x')!.textContent = pos.x.toFixed(2);
  document.getElementById('pos-y')!.textContent = pos.y.toFixed(2);
  document.getElementById('pos-z')!.textContent = pos.z.toFixed(2);
  
  document.getElementById('rot-x')!.textContent = `${THREE.MathUtils.radToDeg(rot.x).toFixed(0)}°`;
  document.getElementById('rot-y')!.textContent = `${THREE.MathUtils.radToDeg(rot.y).toFixed(0)}°`;
  document.getElementById('rot-z')!.textContent = `${THREE.MathUtils.radToDeg(rot.z).toFixed(0)}°`;
  
  document.getElementById('scale-x')!.textContent = scale.x.toFixed(2);
  document.getElementById('scale-y')!.textContent = scale.y.toFixed(2);
  document.getElementById('scale-z')!.textContent = scale.z.toFixed(2);
}

function updateObjectListUI() {
  const container = document.getElementById('object-list')!;
  container.innerHTML = sceneObjects.map(obj => `
    <div class="object-item ${selectedObject === obj.mesh ? 'selected' : ''}" data-uuid="${obj.mesh.uuid}">
      <div class="object-color" style="background: ${obj.color}"></div>
      <span class="object-name">${obj.mesh.name}</span>
    </div>
  `).join('');
  
  // Add click handlers
  container.querySelectorAll('.object-item').forEach(item => {
    item.addEventListener('click', () => {
      const uuid = item.getAttribute('data-uuid');
      const obj = sceneObjects.find(o => o.mesh.uuid === uuid);
      if (obj) {
        selectObject(obj.mesh);
      }
    });
  });
}

function updateHistoryUI() {
  const undoBtn = document.getElementById('btn-undo') as HTMLButtonElement;
  const redoBtn = document.getElementById('btn-redo') as HTMLButtonElement;
  
  undoBtn.disabled = historyIndex < 0;
  redoBtn.disabled = historyIndex >= history.length - 1;
  
  const historyList = document.getElementById('history-list')!;
  
  if (history.length === 0) {
    historyList.innerHTML = '<div style="color: #666; font-size: 11px;">No history yet</div>';
    return;
  }
  
  // Show last 5 history entries
  const recentHistory = history.slice(-5).reverse();
  historyList.innerHTML = recentHistory.map((entry, i) => {
    const realIndex = history.length - 1 - i;
    const isCurrent = realIndex === historyIndex;
    const actionIcon = entry.action === 'translate' ? '↔' : entry.action === 'rotate' ? '↻' : '⤢';
    return `
      <div class="history-item ${isCurrent ? 'current' : ''}">
        <span class="history-action">${actionIcon} ${entry.action}</span>
        <span class="history-target">${entry.objectName}</span>
      </div>
    `;
  }).join('');
}

function updateModeUI(mode: 'translate' | 'rotate' | 'scale') {
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.getElementById(`mode-${mode}`)!.classList.add('active');
}

function updateSpaceUI(space: 'world' | 'local') {
  document.querySelectorAll('.space-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.getElementById(`space-${space}`)!.classList.add('active');
}

// =============================================================================
// UI SETUP
// =============================================================================

function setupUI() {
  // Mode buttons
  document.getElementById('mode-translate')!.addEventListener('click', () => {
    transformControls.setMode('translate');
    updateModeUI('translate');
  });
  document.getElementById('mode-rotate')!.addEventListener('click', () => {
    transformControls.setMode('rotate');
    updateModeUI('rotate');
  });
  document.getElementById('mode-scale')!.addEventListener('click', () => {
    transformControls.setMode('scale');
    updateModeUI('scale');
  });
  
  // Space toggle
  document.getElementById('space-world')!.addEventListener('click', () => {
    transformControls.setSpace('world');
    updateSpaceUI('world');
  });
  document.getElementById('space-local')!.addEventListener('click', () => {
    transformControls.setSpace('local');
    updateSpaceUI('local');
  });
  
  // Snap controls
  const snapCheckbox = document.getElementById('snap-enabled') as HTMLInputElement;
  const snapTranslate = document.getElementById('snap-translate') as HTMLInputElement;
  const snapRotate = document.getElementById('snap-rotate') as HTMLInputElement;
  const snapScale = document.getElementById('snap-scale') as HTMLInputElement;
  
  function updateSnap() {
    if (snapCheckbox.checked) {
      transformControls.setTranslationSnap(parseFloat(snapTranslate.value));
      transformControls.setRotationSnap(THREE.MathUtils.degToRad(parseFloat(snapRotate.value)));
      transformControls.setScaleSnap(parseFloat(snapScale.value));
    } else {
      transformControls.setTranslationSnap(null);
      transformControls.setRotationSnap(null);
      transformControls.setScaleSnap(null);
    }
  }
  
  snapCheckbox.addEventListener('change', updateSnap);
  snapTranslate.addEventListener('input', updateSnap);
  snapRotate.addEventListener('input', updateSnap);
  snapScale.addEventListener('input', updateSnap);
  
  // History buttons
  document.getElementById('btn-undo')!.addEventListener('click', undo);
  document.getElementById('btn-redo')!.addEventListener('click', redo);
  
  // Keyboard shortcuts
  window.addEventListener('keydown', (e) => {
    // Don't handle if typing in an input
    if (e.target instanceof HTMLInputElement) return;
    
    switch (e.key.toLowerCase()) {
      case 'w':
        transformControls.setMode('translate');
        updateModeUI('translate');
        break;
      case 'e':
        transformControls.setMode('rotate');
        updateModeUI('rotate');
        break;
      case 'r':
        transformControls.setMode('scale');
        updateModeUI('scale');
        break;
      case 'q':
        const newSpace = transformControls.space === 'world' ? 'local' : 'world';
        transformControls.setSpace(newSpace);
        updateSpaceUI(newSpace);
        break;
      case 'z':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
        }
        break;
      case 'escape':
        selectObject(null);
        break;
      case 'delete':
      case 'backspace':
        if (selectedObject) {
          e.preventDefault();
          resetSelectedTransform();
        }
        break;
    }
  });
  
  // Click to select objects
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  
  renderer.domElement.addEventListener('click', (event) => {
    // Ignore if clicking on transform controls
    if (transformControls.dragging) return;
    
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    
    const meshes = sceneObjects.map(o => o.mesh);
    const intersects = raycaster.intersectObjects(meshes, false);
    
    if (intersects.length > 0) {
      selectObject(intersects[0].object);
    }
  });
  
  // Initialize object list
  updateObjectListUI();
  updateHistoryUI();
}

// Track when transform starts
transformControls.addEventListener('mouseDown', () => {
  startTransformTracking();
});

// =============================================================================
// 3LENS INTEGRATION
// =============================================================================

const probe = createProbe({
  name: 'TransformGizmoProbe',
  sampling: {
    frameStatsInterval: 1,
    sceneSnapshotInterval: 30,
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
  
  orbitControls.update();
  
  // Update transform display while dragging
  if (selectedObject && transformControls.dragging) {
    updateTransformDisplay();
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
🔧 Transform Gizmo Demo
=======================
Click objects to select them, then use the gizmo to transform.

Keyboard Shortcuts:
- W: Translate mode
- E: Rotate mode
- R: Scale mode
- Q: Toggle world/local space
- Ctrl+Z: Undo
- Ctrl+Shift+Z: Redo
- Esc: Deselect
- Del: Reset transform

Open 3Lens overlay (Ctrl+Shift+D) for more inspection tools.
`);
