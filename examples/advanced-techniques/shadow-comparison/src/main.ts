/**
 * Shadow Technique Comparison Example
 * 
 * Demonstrates different shadow mapping techniques with 3Lens integration.
 * Use 3Lens to inspect:
 * - Shadow light configurations (map size, bias, camera settings)
 * - Performance impact of different shadow types
 * - Memory usage for shadow maps
 * - Light objects and their shadow properties
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';
import '@3lens/themes/styles.css';

// ============================================================================
// TYPES
// ============================================================================

type ShadowType = 'basic' | 'pcf' | 'pcss' | 'vsm';

// ============================================================================
// GLOBAL STATE
// ============================================================================

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: OrbitControls;
let probe: ReturnType<typeof createProbe>;

// Lights
let directionalLight: THREE.DirectionalLight;
let spotLight1: THREE.SpotLight;
let spotLight2: THREE.SpotLight;
let pointLight: THREE.PointLight;
let shadowLights: THREE.Light[] = [];

// Scene objects
let sceneObjects: THREE.Mesh[] = [];

// Settings
let currentShadowType: ShadowType = 'basic';
let autoRotate = true;

// ============================================================================
// INITIALIZATION
// ============================================================================

function init(): void {
  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a24);

  // Camera
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(10, 8, 10);

  // Renderer with shadow support
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  document.getElementById('app')!.appendChild(renderer.domElement);

  // Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 5;
  controls.maxDistance = 30;

  // Create scene
  createLights();
  createSceneObjects();

  // Initialize 3Lens
  initProbe();

  // Setup minimal UI
  setupUI();

  // Event listeners
  window.addEventListener('resize', onWindowResize);

  // Start animation
  animate();
}

function createLights(): void {
  // Ambient light
  const ambient = new THREE.AmbientLight(0x404040, 0.3);
  scene.add(ambient);

  // Directional light (main shadow caster)
  directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
  directionalLight.name = 'DirectionalLight';
  directionalLight.position.set(5, 10, 5);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 1024;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 50;
  directionalLight.shadow.camera.left = -15;
  directionalLight.shadow.camera.right = 15;
  directionalLight.shadow.camera.top = 15;
  directionalLight.shadow.camera.bottom = -15;
  directionalLight.shadow.bias = 0.0005;
  directionalLight.shadow.normalBias = 0.02;
  scene.add(directionalLight);
  shadowLights.push(directionalLight);

  // Spot light 1
  spotLight1 = new THREE.SpotLight(0xff6b6b, 1.0);
  spotLight1.name = 'SpotLight_Red';
  spotLight1.position.set(-8, 6, 0);
  spotLight1.angle = Math.PI / 6;
  spotLight1.penumbra = 0.3;
  spotLight1.castShadow = true;
  spotLight1.shadow.mapSize.width = 512;
  spotLight1.shadow.mapSize.height = 512;
  spotLight1.shadow.bias = 0.0005;
  scene.add(spotLight1);
  scene.add(spotLight1.target);
  spotLight1.target.position.set(0, 0, 0);
  shadowLights.push(spotLight1);

  // Spot light 2
  spotLight2 = new THREE.SpotLight(0x6b9dff, 1.0);
  spotLight2.name = 'SpotLight_Blue';
  spotLight2.position.set(8, 6, 0);
  spotLight2.angle = Math.PI / 6;
  spotLight2.penumbra = 0.3;
  spotLight2.castShadow = true;
  spotLight2.shadow.mapSize.width = 512;
  spotLight2.shadow.mapSize.height = 512;
  spotLight2.shadow.bias = 0.0005;
  scene.add(spotLight2);
  scene.add(spotLight2.target);
  spotLight2.target.position.set(0, 0, 0);
  shadowLights.push(spotLight2);

  // Point light (cube shadow map)
  pointLight = new THREE.PointLight(0xfbbf24, 0.8);
  pointLight.name = 'PointLight_Amber';
  pointLight.position.set(0, 4, -5);
  pointLight.castShadow = true;
  pointLight.shadow.mapSize.width = 256;
  pointLight.shadow.mapSize.height = 256;
  pointLight.shadow.bias = 0.0005;
  scene.add(pointLight);
  shadowLights.push(pointLight);

  // Light visual indicators
  const sphereGeom = new THREE.SphereGeometry(0.2, 16, 16);
  
  const dirIndicator = new THREE.Mesh(sphereGeom, new THREE.MeshBasicMaterial({ color: 0xffffff }));
  dirIndicator.name = 'DirectionalLight_Indicator';
  dirIndicator.position.copy(directionalLight.position);
  scene.add(dirIndicator);

  const spot1Indicator = new THREE.Mesh(sphereGeom, new THREE.MeshBasicMaterial({ color: 0xff6b6b }));
  spot1Indicator.name = 'SpotLight_Red_Indicator';
  spot1Indicator.position.copy(spotLight1.position);
  scene.add(spot1Indicator);

  const spot2Indicator = new THREE.Mesh(sphereGeom, new THREE.MeshBasicMaterial({ color: 0x6b9dff }));
  spot2Indicator.name = 'SpotLight_Blue_Indicator';
  spot2Indicator.position.copy(spotLight2.position);
  scene.add(spot2Indicator);

  const pointIndicator = new THREE.Mesh(sphereGeom, new THREE.MeshBasicMaterial({ color: 0xfbbf24 }));
  pointIndicator.name = 'PointLight_Indicator';
  pointIndicator.position.copy(pointLight.position);
  scene.add(pointIndicator);
}

function createSceneObjects(): void {
  // Ground plane
  const groundGeom = new THREE.PlaneGeometry(30, 30);
  const groundMat = new THREE.MeshStandardMaterial({ 
    color: 0x333344,
    roughness: 0.8,
    metalness: 0.2,
  });
  const ground = new THREE.Mesh(groundGeom, groundMat);
  ground.name = 'Ground';
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.5;
  ground.receiveShadow = true;
  scene.add(ground);
  sceneObjects.push(ground);

  // Central pedestal
  const pedestalGeom = new THREE.CylinderGeometry(2, 2.5, 0.5, 32);
  const pedestalMat = new THREE.MeshStandardMaterial({ color: 0x555566, roughness: 0.5 });
  const pedestal = new THREE.Mesh(pedestalGeom, pedestalMat);
  pedestal.name = 'Pedestal';
  pedestal.position.y = -0.25;
  pedestal.castShadow = true;
  pedestal.receiveShadow = true;
  scene.add(pedestal);
  sceneObjects.push(pedestal);

  // Main sphere
  const sphereGeom = new THREE.SphereGeometry(1.2, 64, 64);
  const sphereMat = new THREE.MeshStandardMaterial({ 
    color: 0x8b5cf6,
    roughness: 0.2,
    metalness: 0.8,
  });
  const sphere = new THREE.Mesh(sphereGeom, sphereMat);
  sphere.name = 'MainSphere';
  sphere.position.set(0, 1.2, 0);
  sphere.castShadow = true;
  sphere.receiveShadow = true;
  scene.add(sphere);
  sceneObjects.push(sphere);

  // Surrounding objects for shadow casting
  const objectConfigs = [
    { pos: [3, 0.5, 0], type: 'box', color: 0x22c55e, name: 'Box_Green' },
    { pos: [-3, 0.5, 0], type: 'box', color: 0xef4444, name: 'Box_Red' },
    { pos: [0, 0.5, 3], type: 'cylinder', color: 0x3b82f6, name: 'Cylinder_Blue' },
    { pos: [0, 0.5, -3], type: 'torus', color: 0xfbbf24, name: 'Torus_Amber' },
    { pos: [2.5, 0.75, 2.5], type: 'cone', color: 0xec4899, name: 'Cone_Pink' },
    { pos: [-2.5, 0.5, -2.5], type: 'box', color: 0x06b6d4, name: 'Box_Cyan' },
    { pos: [2.5, 0.5, -2.5], type: 'sphere', color: 0xf97316, name: 'Sphere_Orange' },
    { pos: [-2.5, 0.6, 2.5], type: 'dodeca', color: 0xa855f7, name: 'Dodeca_Purple' },
  ];

  objectConfigs.forEach(config => {
    let geometry: THREE.BufferGeometry;
    
    switch (config.type) {
      case 'box':
        geometry = new THREE.BoxGeometry(1, 1, 1);
        break;
      case 'cylinder':
        geometry = new THREE.CylinderGeometry(0.4, 0.4, 1, 32);
        break;
      case 'torus':
        geometry = new THREE.TorusGeometry(0.5, 0.2, 16, 32);
        break;
      case 'cone':
        geometry = new THREE.ConeGeometry(0.5, 1.5, 32);
        break;
      case 'sphere':
        geometry = new THREE.SphereGeometry(0.5, 32, 32);
        break;
      case 'dodeca':
        geometry = new THREE.DodecahedronGeometry(0.6);
        break;
      default:
        geometry = new THREE.BoxGeometry(1, 1, 1);
    }

    const material = new THREE.MeshStandardMaterial({
      color: config.color,
      roughness: 0.4,
      metalness: 0.3,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = config.name;
    mesh.position.set(config.pos[0], config.pos[1], config.pos[2]);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    sceneObjects.push(mesh);
  });

  // Thin objects for shadow testing (VSM light bleeding)
  const thinBox = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 2, 2),
    new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  thinBox.name = 'ThinBox_LightBleedTest';
  thinBox.position.set(-5, 0.5, 2);
  thinBox.castShadow = true;
  thinBox.receiveShadow = true;
  scene.add(thinBox);
  sceneObjects.push(thinBox);

  // Floating sphere for contact shadow testing
  const floatSphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.4, 32, 32),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, metalness: 0.9 })
  );
  floatSphere.name = 'FloatingSphere_ContactTest';
  floatSphere.position.set(4, 1.5, 3);
  floatSphere.castShadow = true;
  scene.add(floatSphere);
  sceneObjects.push(floatSphere);
}

function initProbe(): void {
  probe = createProbe({ appName: 'Shadow-Comparison' });
  createOverlay({ probe, theme: 'dark' });

  // Register shadow system as logical entity
  probe.registerLogicalEntity({
    id: 'shadow-system',
    name: 'Shadow Mapping System',
    type: 'lighting',
    object3D: scene,
    metadata: {
      shadowType: currentShadowType,
      shadowLightCount: shadowLights.length,
      totalShadowMapMemory: calculateShadowMemory(),
    }
  });

  // Register each shadow light with detailed metadata
  shadowLights.forEach((light, i) => {
    const type = light instanceof THREE.DirectionalLight ? 'Directional' :
                 light instanceof THREE.SpotLight ? 'Spot' :
                 light instanceof THREE.PointLight ? 'Point' : 'Unknown';
    
    probe.registerLogicalEntity({
      id: `shadow-light-${i}`,
      name: light.name || `${type}Light_${i}`,
      type: 'shadow-caster',
      object3D: light,
      metadata: {
        lightType: type,
        mapSize: `${light.shadow?.mapSize.x}x${light.shadow?.mapSize.y}`,
        bias: light.shadow?.bias,
        normalBias: light.shadow?.normalBias,
        castShadow: light.castShadow,
        intensity: light.intensity,
      }
    });
  });
}

function calculateShadowMemory(): string {
  let totalBytes = 0;
  shadowLights.forEach(light => {
    if (light.shadow) {
      // Each shadow map pixel is 4 bytes (depth)
      // Point lights have 6 faces
      const faces = light instanceof THREE.PointLight ? 6 : 1;
      totalBytes += light.shadow.mapSize.x * light.shadow.mapSize.y * 4 * faces;
    }
  });
  return `${(totalBytes / (1024 * 1024)).toFixed(2)} MB`;
}

// ============================================================================
// SHADOW TYPE SWITCHING
// ============================================================================

function setShadowType(type: ShadowType): void {
  currentShadowType = type;

  switch (type) {
    case 'basic':
      renderer.shadowMap.type = THREE.BasicShadowMap;
      break;
    case 'pcf':
      renderer.shadowMap.type = THREE.PCFShadowMap;
      break;
    case 'pcss':
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      break;
    case 'vsm':
      renderer.shadowMap.type = THREE.VSMShadowMap;
      // VSM needs blur radius
      shadowLights.forEach(light => {
        if (light.shadow) {
          light.shadow.radius = 4;
        }
      });
      break;
  }

  // Force shadow map regeneration
  renderer.shadowMap.needsUpdate = true;
  shadowLights.forEach(light => {
    if (light.shadow && light.shadow.map) {
      light.shadow.map.dispose();
      light.shadow.map = null as any;
    }
  });

  // Update UI buttons
  document.querySelectorAll('.shadow-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-type') === type);
  });

  // Update 3Lens metadata
  probe.updateLogicalEntity('shadow-system', {
    metadata: {
      shadowType: type,
      shadowLightCount: shadowLights.length,
      totalShadowMapMemory: calculateShadowMemory(),
    }
  });
}

// ============================================================================
// UI SETUP
// ============================================================================

function setupUI(): void {
  // Shadow type buttons
  document.querySelectorAll('.shadow-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-type') as ShadowType;
      setShadowType(type);
    });
  });

  // Window resize
  window.addEventListener('resize', onWindowResize);
}

function onWindowResize(): void {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// ============================================================================
// ANIMATION LOOP
// ============================================================================

function animate(): void {
  requestAnimationFrame(animate);

  const time = performance.now() * 0.001;

  // Auto-rotate directional light
  if (autoRotate) {
    directionalLight.position.x = Math.sin(time * 0.5) * 8;
    directionalLight.position.z = Math.cos(time * 0.5) * 8;
    
    // Update indicator position
    const indicator = scene.getObjectByName('DirectionalLight_Indicator');
    if (indicator) {
      indicator.position.copy(directionalLight.position);
    }
  }

  // Animate some objects
  sceneObjects.forEach((obj, i) => {
    if (i > 2 && i % 2 === 0) {
      obj.rotation.y = time * 0.5;
    }
  });

  controls.update();
  renderer.render(scene, camera);
}

// ============================================================================
// START
// ============================================================================

init();
