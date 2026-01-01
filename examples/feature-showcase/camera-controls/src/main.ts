/**
 * Camera Controls Showcase Example
 * 
 * Demonstrates 3Lens camera control features:
 * - Focus on object (instant)
 * - Fly-to animation with easing options
 * - Camera switching between multiple cameras
 * - Camera info display
 * - Home position management
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DevtoolProbe, type CameraInfo, type FlyToOptions } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';

// State
let probe: DevtoolProbe;
let scene: THREE.Scene;
let mainCamera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: OrbitControls;
let selectedObject: THREE.Object3D | null = null;
let isAnimating = false;

// Scene objects with metadata
interface SceneObject {
  mesh: THREE.Mesh;
  name: string;
  icon: string;
  color: number;
}

const sceneObjects: SceneObject[] = [];

// Additional cameras in the scene
const sceneCameras: THREE.Camera[] = [];

// DOM Elements
const statusBar = document.getElementById('status-bar')!;
const statusText = document.getElementById('status-text')!;
const camName = document.getElementById('cam-name')!;
const camType = document.getElementById('cam-type')!;
const camFov = document.getElementById('cam-fov')!;
const camAspect = document.getElementById('cam-aspect')!;
const camNear = document.getElementById('cam-near')!;
const camFar = document.getElementById('cam-far')!;
const posX = document.getElementById('pos-x')!;
const posY = document.getElementById('pos-y')!;
const posZ = document.getElementById('pos-z')!;
const cameraListEl = document.getElementById('camera-list')!;
const objectListEl = document.getElementById('object-list')!;

// Create the scene
function createScene(): void {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a2e);
  
  // Main camera
  const container = document.getElementById('canvas-container')!;
  mainCamera = new THREE.PerspectiveCamera(
    60,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  mainCamera.position.set(15, 12, 15);
  mainCamera.name = 'Main Camera';
  
  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);
  
  // OrbitControls
  controls = new OrbitControls(mainCamera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.target.set(0, 0, 0);
  
  // Lights
  const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(20, 30, 20);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 100;
  directionalLight.shadow.camera.left = -30;
  directionalLight.shadow.camera.right = 30;
  directionalLight.shadow.camera.top = 30;
  directionalLight.shadow.camera.bottom = -30;
  scene.add(directionalLight);
  
  // Ground
  const groundGeometry = new THREE.PlaneGeometry(50, 50);
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x16213e,
    roughness: 0.9,
    metalness: 0.1
  });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  ground.name = 'Ground';
  scene.add(ground);
  
  // Grid helper
  const gridHelper = new THREE.GridHelper(50, 50, 0x0f3460, 0x0f3460);
  gridHelper.position.y = 0.01;
  scene.add(gridHelper);
  
  // Create scene objects
  createSceneObjects();
  
  // Create additional cameras
  createAdditionalCameras();
}

// Create demo objects
function createSceneObjects(): void {
  const objects = [
    { name: 'Red Cube', icon: '🟥', geo: new THREE.BoxGeometry(2, 2, 2), color: 0xe94560, pos: [-8, 1, -8] },
    { name: 'Blue Sphere', icon: '🔵', geo: new THREE.SphereGeometry(1.2, 32, 32), color: 0x3b82f6, pos: [8, 1.2, -8] },
    { name: 'Green Torus', icon: '💚', geo: new THREE.TorusGeometry(1, 0.4, 16, 48), color: 0x10b981, pos: [-8, 1, 8] },
    { name: 'Yellow Cone', icon: '🔶', geo: new THREE.ConeGeometry(1, 2.5, 32), color: 0xf59e0b, pos: [8, 1.25, 8] },
    { name: 'Purple Knot', icon: '💜', geo: new THREE.TorusKnotGeometry(0.8, 0.25, 100, 16), color: 0x8b5cf6, pos: [0, 1.5, 0] },
    { name: 'Cyan Cylinder', icon: '🩵', geo: new THREE.CylinderGeometry(0.8, 0.8, 3, 32), color: 0x00d4ff, pos: [0, 1.5, -10] },
  ];
  
  objects.forEach((obj) => {
    const material = new THREE.MeshStandardMaterial({
      color: obj.color,
      roughness: 0.3,
      metalness: 0.7
    });
    
    const mesh = new THREE.Mesh(obj.geo, material);
    mesh.name = obj.name;
    mesh.position.set(obj.pos[0], obj.pos[1], obj.pos[2]);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    scene.add(mesh);
    sceneObjects.push({ mesh, name: obj.name, icon: obj.icon, color: obj.color });
  });
  
  // Update UI
  updateObjectListUI();
}

// Create additional cameras in the scene
function createAdditionalCameras(): void {
  // Top-down camera
  const topCamera = new THREE.PerspectiveCamera(60, 16/9, 0.1, 1000);
  topCamera.position.set(0, 30, 0);
  topCamera.lookAt(0, 0, 0);
  topCamera.name = 'Top View Camera';
  scene.add(topCamera);
  sceneCameras.push(topCamera);
  
  // Side camera
  const sideCamera = new THREE.PerspectiveCamera(50, 16/9, 0.1, 1000);
  sideCamera.position.set(25, 5, 0);
  sideCamera.lookAt(0, 0, 0);
  sideCamera.name = 'Side View Camera';
  scene.add(sideCamera);
  sceneCameras.push(sideCamera);
  
  // Close-up camera
  const closeCamera = new THREE.PerspectiveCamera(35, 16/9, 0.1, 500);
  closeCamera.position.set(5, 3, 5);
  closeCamera.lookAt(0, 1, 0);
  closeCamera.name = 'Close-up Camera';
  scene.add(closeCamera);
  sceneCameras.push(closeCamera);
  
  // Orthographic camera
  const aspect = 16/9;
  const frustumSize = 20;
  const orthoCamera = new THREE.OrthographicCamera(
    -frustumSize * aspect / 2,
    frustumSize * aspect / 2,
    frustumSize / 2,
    -frustumSize / 2,
    0.1,
    1000
  );
  orthoCamera.position.set(20, 20, 20);
  orthoCamera.lookAt(0, 0, 0);
  orthoCamera.name = 'Orthographic Camera';
  scene.add(orthoCamera);
  sceneCameras.push(orthoCamera);
}

// Initialize 3Lens DevtoolProbe
function initDevtools(): void {
  probe = new DevtoolProbe({ debug: true });
  
  // Observe renderer and scene
  probe.observeRenderer(renderer);
  probe.observeScene(scene);
  
  // Initialize camera controller with orbit controls target
  probe.initializeCameraController(mainCamera, THREE, {
    x: controls.target.x,
    y: controls.target.y,
    z: controls.target.z
  });
  
  // Create overlay
  const overlay = createOverlay(probe, {
    defaultWidth: 350
  });
  overlay.showPanel('scene');
  
  // Subscribe to camera changes
  probe.onCameraChanged((camera, info) => {
    updateCameraInfoUI(info);
    console.log('Camera changed to:', info.name);
  });
  
  // Subscribe to animation complete
  probe.onAnimationComplete(() => {
    isAnimating = false;
    updateStatusUI('Animation complete', false);
  });
  
  // Initial UI update
  updateCameraListUI();
  updateCameraInfoUI(probe.getCameraInfo());
}

// Update object list UI
function updateObjectListUI(): void {
  objectListEl.innerHTML = sceneObjects.map((obj, index) => `
    <div class="object-btn" data-index="${index}">
      <span class="icon">${obj.icon}</span>
      <span class="label">${obj.name}</span>
    </div>
  `).join('');
  
  // Add click handlers
  objectListEl.querySelectorAll('.object-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const index = parseInt(btn.getAttribute('data-index')!);
      selectObject(index);
    });
  });
}

// Update camera list UI
function updateCameraListUI(): void {
  const cameras = probe.getAvailableCameras();
  const activeIndex = probe.getActiveCameraIndex();
  
  cameraListEl.innerHTML = cameras.map((cam, index) => `
    <div class="camera-item ${index === activeIndex ? 'active' : ''}" data-index="${index}">
      <div>
        <span class="name">${cam.name}</span>
        <span class="type">${cam.type}</span>
      </div>
    </div>
  `).join('');
  
  // Add click handlers
  cameraListEl.querySelectorAll('.camera-item').forEach(item => {
    item.addEventListener('click', () => {
      const index = parseInt(item.getAttribute('data-index')!);
      switchToCamera(index);
    });
  });
}

// Update camera info UI
function updateCameraInfoUI(info: CameraInfo | null): void {
  if (!info) return;
  
  camName.textContent = info.name;
  camType.textContent = info.type;
  
  if (info.fov !== undefined) {
    camFov.textContent = `${info.fov.toFixed(0)}°`;
  } else {
    camFov.textContent = 'N/A';
  }
  
  if (info.aspect !== undefined) {
    camAspect.textContent = info.aspect.toFixed(2);
  } else {
    camAspect.textContent = 'N/A';
  }
  
  camNear.textContent = info.near.toFixed(2);
  camFar.textContent = info.far.toFixed(0);
  
  // Update position
  posX.textContent = info.position.x.toFixed(2);
  posY.textContent = info.position.y.toFixed(2);
  posZ.textContent = info.position.z.toFixed(2);
}

// Update status UI
function updateStatusUI(message: string, animating: boolean): void {
  statusText.textContent = message;
  statusBar.classList.toggle('animating', animating);
}

// Select an object
function selectObject(index: number): void {
  // Clear previous selection
  objectListEl.querySelectorAll('.object-btn').forEach(btn => {
    btn.classList.remove('selected');
  });
  
  if (index >= 0 && index < sceneObjects.length) {
    selectedObject = sceneObjects[index].mesh;
    probe.selectObject(selectedObject);
    
    // Update UI
    objectListEl.querySelector(`[data-index="${index}"]`)?.classList.add('selected');
    updateStatusUI(`Selected: ${sceneObjects[index].name}`, false);
  }
}

// Switch to a different camera
function switchToCamera(index: number): void {
  if (probe.switchToCamera(index)) {
    updateCameraListUI();
    updateStatusUI(`Switched to camera ${index + 1}`, false);
  }
}

// Get fly-to options from UI
function getFlyToOptions(): FlyToOptions {
  const duration = parseInt((document.getElementById('fly-duration') as HTMLInputElement).value) || 800;
  const easing = (document.getElementById('fly-easing') as HTMLSelectElement).value as FlyToOptions['easing'];
  const padding = parseFloat((document.getElementById('fly-padding') as HTMLInputElement).value) || 1.5;
  
  return {
    duration,
    easing,
    padding,
    onComplete: () => {
      isAnimating = false;
      updateStatusUI('Animation complete', false);
    }
  };
}

// Focus on selected object (instant)
function focusOnSelected(): void {
  if (!selectedObject) {
    updateStatusUI('No object selected', false);
    return;
  }
  
  const padding = parseFloat((document.getElementById('fly-padding') as HTMLInputElement).value) || 1.5;
  
  if (probe.focusOnSelected(padding)) {
    // Update orbit controls target
    const target = probe.getOrbitTarget();
    if (target) {
      controls.target.set(target.x, target.y, target.z);
    }
    updateStatusUI(`Focused on ${selectedObject.name}`, false);
  }
}

// Fly to selected object (animated)
function flyToSelected(): void {
  if (!selectedObject) {
    updateStatusUI('No object selected', false);
    return;
  }
  
  if (isAnimating) {
    updateStatusUI('Animation already in progress', true);
    return;
  }
  
  const options = getFlyToOptions();
  isAnimating = true;
  updateStatusUI(`Flying to ${selectedObject.name}...`, true);
  
  probe.flyToSelected(options);
}

// Go home instantly
function goHome(): void {
  probe.goHome();
  
  // Reset orbit controls target
  const target = probe.getOrbitTarget();
  if (target) {
    controls.target.set(target.x, target.y, target.z);
  }
  
  updateStatusUI('Returned home', false);
}

// Fly home with animation
function flyHome(): void {
  if (isAnimating) {
    updateStatusUI('Animation already in progress', true);
    return;
  }
  
  const options = getFlyToOptions();
  isAnimating = true;
  updateStatusUI('Flying home...', true);
  
  probe.flyHome(options);
}

// Stop any running animation
function stopAnimation(): void {
  probe.stopCameraAnimation();
  isAnimating = false;
  updateStatusUI('Animation stopped', false);
}

// Setup event handlers
function setupEventHandlers(): void {
  // Button handlers
  document.getElementById('btn-focus')!.addEventListener('click', focusOnSelected);
  document.getElementById('btn-fly-to')!.addEventListener('click', flyToSelected);
  document.getElementById('btn-go-home')!.addEventListener('click', goHome);
  document.getElementById('btn-fly-home')!.addEventListener('click', flyHome);
  document.getElementById('btn-stop')!.addEventListener('click', stopAnimation);
  
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Don't handle if typing in an input
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) {
      return;
    }
    
    switch (e.key.toLowerCase()) {
      case 'f':
        if (e.shiftKey) {
          flyToSelected();
        } else {
          focusOnSelected();
        }
        e.preventDefault();
        break;
      case 'h':
        if (e.shiftKey) {
          flyHome();
        } else {
          goHome();
        }
        e.preventDefault();
        break;
      case 'escape':
        stopAnimation();
        e.preventDefault();
        break;
      case 'c':
        // Cycle to next camera
        const cameras = probe.getAvailableCameras();
        const currentIndex = probe.getActiveCameraIndex();
        const nextIndex = (currentIndex + 1) % cameras.length;
        switchToCamera(nextIndex);
        e.preventDefault();
        break;
    }
  });
  
  // Window resize
  window.addEventListener('resize', () => {
    const container = document.getElementById('canvas-container')!;
    mainCamera.aspect = container.clientWidth / container.clientHeight;
    mainCamera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
}

// Animation loop
function animate(): void {
  requestAnimationFrame(animate);
  
  // Update orbit controls
  controls.update();
  
  // Sync orbit controls target with camera controller
  if (!isAnimating) {
    probe.setOrbitTarget({
      x: controls.target.x,
      y: controls.target.y,
      z: controls.target.z
    });
  } else {
    // During animation, sync controls target from camera controller
    const target = probe.getOrbitTarget();
    if (target) {
      controls.target.set(target.x, target.y, target.z);
    }
  }
  
  // Update position display
  const info = probe.getCameraInfo();
  if (info) {
    posX.textContent = info.position.x.toFixed(2);
    posY.textContent = info.position.y.toFixed(2);
    posZ.textContent = info.position.z.toFixed(2);
  }
  
  // Animate objects
  const time = performance.now() * 0.001;
  sceneObjects.forEach((obj, i) => {
    obj.mesh.rotation.y = time * 0.5 * (1 + i * 0.1);
    obj.mesh.position.y = obj.mesh.position.y + Math.sin(time * 2 + i) * 0.002;
  });
  
  renderer.render(scene, mainCamera);
}

// Initialize
function init(): void {
  createScene();
  initDevtools();
  setupEventHandlers();
  animate();
  
  // Select first object by default
  selectObject(0);
  
  console.log('📷 Camera Controls Showcase initialized');
  console.log('   F = Focus on selected (instant)');
  console.log('   Shift+F = Fly to selected (animated)');
  console.log('   H = Go home (instant)');
  console.log('   Shift+H = Fly home (animated)');
  console.log('   Esc = Stop animation');
  console.log('   C = Cycle cameras');
}

init();
