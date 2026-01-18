/**
 * WebGPU Features Example
 * 
 * Demonstrates 3Lens WebGPU-specific features:
 * - WebGPU renderer detection and adapter info
 * - GPU timing with timestamp queries
 * - Pipeline tracking (render and compute)
 * - Device capabilities inspection
 * - WebGPU-specific frame stats
 * 
 * Open the 3Lens overlay (Ctrl+Shift+D) and check the WebGPU panel!
 */

import * as THREE from 'three';
import { createProbe } from '@3lens/core';
import { bootstrapOverlay } from '@3lens/overlay';
import '@3lens/themes/styles.css';

// Type declarations for WebGPU renderer
interface WebGPURenderer extends THREE.Renderer {
  readonly isWebGPURenderer: true;
  init(): Promise<void>;
  renderAsync(scene: THREE.Scene, camera: THREE.Camera): Promise<void>;
  setSize(width: number, height: number): void;
  setPixelRatio(ratio: number): void;
  domElement: HTMLCanvasElement;
}

// State
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: WebGPURenderer | THREE.WebGLRenderer;
let animationPaused = false;
let objects: THREE.Mesh[] = [];
let useWebGPU = false;

// Check WebGPU support
async function checkWebGPUSupport(): Promise<boolean> {
  if (!navigator.gpu) {
    return false;
  }
  
  try {
    const adapter = await navigator.gpu.requestAdapter();
    return adapter !== null;
  } catch {
    return false;
  }
}

// Initialize renderer (WebGPU or fallback to WebGL)
async function initRenderer(): Promise<void> {
  const container = document.getElementById('app')!;
  const isSupported = await checkWebGPUSupport();
  
  if (isSupported) {
    try {
      // Dynamically import WebGPURenderer from Three.js
      const { WebGPURenderer } = await import('three/webgpu');
      
      renderer = new WebGPURenderer({ antialias: true }) as WebGPURenderer;
      await (renderer as WebGPURenderer).init();
      useWebGPU = true;
      
      console.log('✅ WebGPU renderer initialized');
    } catch (error) {
      console.warn('WebGPU init failed, falling back to WebGL:', error);
      renderer = new THREE.WebGLRenderer({ antialias: true });
    }
  } else {
    console.log('WebGPU not supported, using WebGL');
    renderer = new THREE.WebGLRenderer({ antialias: true });
  }
  
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);
}

// Create scene
function createScene(): void {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a2e);
  scene.name = 'WebGPUFeaturesDemo';
  
  // Camera
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 10, 25);
  camera.lookAt(0, 0, 0);
  
  // Lights
  const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(10, 20, 10);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  scene.add(directionalLight);
  
  const pointLight1 = new THREE.PointLight(0x00d4ff, 1, 50);
  pointLight1.position.set(-10, 5, 10);
  scene.add(pointLight1);
  
  const pointLight2 = new THREE.PointLight(0xe94560, 1, 50);
  pointLight2.position.set(10, 5, -10);
  scene.add(pointLight2);
  
  // Ground plane
  const groundGeometry = new THREE.PlaneGeometry(50, 50);
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x16213e,
    roughness: 0.8,
    metalness: 0.2
  });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  ground.name = 'Ground';
  scene.add(ground);
  
  // Create initial objects
  createObjects(20);
}

// Create demo objects
function createObjects(count: number): void {
  const geometries = [
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.SphereGeometry(0.5, 32, 32),
    new THREE.TorusGeometry(0.4, 0.15, 16, 48),
    new THREE.ConeGeometry(0.5, 1, 32),
    new THREE.OctahedronGeometry(0.5),
    new THREE.TorusKnotGeometry(0.3, 0.1, 64, 8)
  ];
  
  const colors = [0x00d4ff, 0xe94560, 0x10b981, 0xf59e0b, 0x8b5cf6, 0xef4444];
  
  for (let i = 0; i < count; i++) {
    const geometry = geometries[i % geometries.length];
    const material = new THREE.MeshStandardMaterial({
      color: colors[i % colors.length],
      roughness: 0.3 + Math.random() * 0.4,
      metalness: 0.5 + Math.random() * 0.5
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = `Object_${objects.length + 1}`;
    
    // Random position in a sphere
    const radius = 5 + Math.random() * 10;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    
    mesh.position.x = radius * Math.sin(phi) * Math.cos(theta);
    mesh.position.y = 1 + Math.random() * 5;
    mesh.position.z = radius * Math.sin(phi) * Math.sin(theta);
    
    mesh.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    scene.add(mesh);
    objects.push(mesh);
  }
}

// Initialize 3Lens DevtoolProbe
function initDevtools(): void {
  const probe = createProbe({
    name: 'WebGPUFeaturesDemo',
    sampling: {
      frameStatsInterval: 1,
      sceneSnapshotInterval: 30,
      enableGPUTiming: true,
    },
  });
  
  // Observe the renderer
  probe.observeRenderer(renderer as THREE.WebGLRenderer);
  probe.observeScene(scene);
  
  // Register logical entity for renderer info
  probe.registerLogicalEntity('renderer-info', {
    name: 'Renderer Info',
    type: 'system',
    metadata: {
      type: useWebGPU ? 'WebGPU' : 'WebGL',
      webgpuSupported: useWebGPU,
    },
  });
  
  bootstrapOverlay({
    probe,
    position: 'right',
    defaultWidth: 400,
    defaultOpen: true,
  });
}

// Animation loop
function animate(): void {
  requestAnimationFrame(animate);
  
  if (!animationPaused) {
    const time = performance.now() * 0.001;
    
    objects.forEach((obj, i) => {
      // Gentle rotation
      obj.rotation.x += 0.005 * (1 + (i % 3) * 0.2);
      obj.rotation.y += 0.007 * (1 + (i % 2) * 0.3);
      
      // Floating motion
      obj.position.y += Math.sin(time * 2 + i) * 0.003;
    });
    
    // Orbit camera slightly
    camera.position.x = Math.sin(time * 0.1) * 25;
    camera.position.z = Math.cos(time * 0.1) * 25;
    camera.lookAt(0, 0, 0);
  }
  
  // Use async rendering for WebGPU if available
  if (useWebGPU && (renderer as WebGPURenderer).renderAsync) {
    (renderer as WebGPURenderer).renderAsync(scene, camera);
  } else {
    renderer.render(scene, camera);
  }
}

// Setup event handlers
function setupEventHandlers(): void {
  // Handle resize
  window.addEventListener('resize', () => {
    const container = document.getElementById('app')!;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
}

// Expose controls for console testing
(window as any).webgpuDemo = {
  addObjects: (count = 10) => {
    createObjects(count);
    console.log(`Added ${count} objects (total: ${objects.length})`);
  },
  
  toggleAnimation: () => {
    animationPaused = !animationPaused;
    console.log(`Animation ${animationPaused ? 'paused' : 'resumed'}`);
  },
  
  runStressTest: async () => {
    console.log('Running stress test...');
    const initialCount = objects.length;
    
    // Add many objects
    for (let i = 0; i < 5; i++) {
      createObjects(50);
      await new Promise(r => setTimeout(r, 100));
    }
    
    console.log(`Added 250 objects for stress test`);
    
    // Wait then cleanup
    await new Promise(r => setTimeout(r, 2000));
    
    while (objects.length > initialCount) {
      const obj = objects.pop()!;
      scene.remove(obj);
      obj.geometry.dispose();
      (obj.material as THREE.Material).dispose();
    }
    
    console.log('Stress test complete, cleaned up extra objects');
  },
  
  getRendererType: () => useWebGPU ? 'WebGPU' : 'WebGL',
};

// Initialize
async function init(): Promise<void> {
  await initRenderer();
  createScene();
  initDevtools();
  setupEventHandlers();
  animate();
  
  console.log(`
🔮 WebGPU Features Example
═══════════════════════════════════════

Renderer: ${useWebGPU ? 'WebGPU ✅' : 'WebGL (fallback)'}

Open 3Lens DevTools (Ctrl+Shift+D) to explore:
• Performance panel - Frame stats and GPU timing
• WebGPU panel - Device capabilities and pipelines
• Resources panel - Textures, geometries, materials

Console commands:
  webgpuDemo.addObjects(10)    - Add more objects
  webgpuDemo.toggleAnimation() - Pause/resume animation
  webgpuDemo.runStressTest()   - Run performance test
  webgpuDemo.getRendererType() - Check renderer type

═══════════════════════════════════════
`);
}

init();
