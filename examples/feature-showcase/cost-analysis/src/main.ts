/**
 * Cost Analysis Visualization Demo
 * 
 * Demonstrates 3Lens cost analysis features:
 * - Triangle count per object (normalized to 1 point per 1000 triangles)
 * - Material complexity scoring (1-10 based on type, textures, features)
 * - Cost heatmap overlay (color-coded tree nodes)
 * - Cost ranking (objects sorted by total cost)
 * - Detailed cost breakdown per object
 * 
 * Open the 3Lens overlay (Ctrl+Shift+D) to see cost analysis in action!
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createProbe } from '@3lens/core';
import { bootstrapOverlay } from '@3lens/overlay';
import '@3lens/themes/styles.css';

// ─────────────────────────────────────────────────────────────────
// Scene Setup
// ─────────────────────────────────────────────────────────────────

const app = document.getElementById('app')!;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);
scene.name = 'CostAnalysisDemo';

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(15, 12, 15);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
app.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// ─────────────────────────────────────────────────────────────────
// Lighting
// ─────────────────────────────────────────────────────────────────

const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.position.set(10, 20, 10);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
scene.add(directionalLight);

const pointLight = new THREE.PointLight(0x22d3ee, 1, 20);
pointLight.position.set(-5, 5, 5);
scene.add(pointLight);

// ─────────────────────────────────────────────────────────────────
// Texture Creation
// ─────────────────────────────────────────────────────────────────

function createCheckerTexture(size = 256, checks = 8): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  
  const checkSize = size / checks;
  for (let i = 0; i < checks; i++) {
    for (let j = 0; j < checks; j++) {
      ctx.fillStyle = (i + j) % 2 === 0 ? '#ffffff' : '#888888';
      ctx.fillRect(i * checkSize, j * checkSize, checkSize, checkSize);
    }
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

function createNormalMapTexture(size = 256): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  
  const imageData = ctx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const noise = Math.sin(x * 0.1) * Math.cos(y * 0.1);
      imageData.data[i] = 128 + noise * 20;
      imageData.data[i + 1] = 128 + noise * 20;
      imageData.data[i + 2] = 255;
      imageData.data[i + 3] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);
  
  return new THREE.CanvasTexture(canvas);
}

function createRoughnessTexture(size = 256): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  
  for (let y = 0; y < size; y += 4) {
    for (let x = 0; x < size; x += 4) {
      const roughness = Math.random() * 0.5 + 0.3;
      const gray = Math.floor(roughness * 255);
      ctx.fillStyle = `rgb(${gray}, ${gray}, ${gray})`;
      ctx.fillRect(x, y, 4, 4);
    }
  }
  
  return new THREE.CanvasTexture(canvas);
}

const checkerTexture = createCheckerTexture();
const normalMapTexture = createNormalMapTexture();
const roughnessTexture = createRoughnessTexture();

// ─────────────────────────────────────────────────────────────────
// Scene Objects with Varying Costs
// ─────────────────────────────────────────────────────────────────

// Ground plane (low cost)
const groundGeometry = new THREE.PlaneGeometry(30, 30);
const groundMaterial = new THREE.MeshStandardMaterial({
  color: 0x1a1a1a,
  roughness: 0.9,
  metalness: 0.1
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.01;
ground.receiveShadow = true;
ground.name = 'Ground Plane';
scene.add(ground);

// ─── LOW COST OBJECTS ────────────────────────────────────────────

// Simple cube (MeshBasicMaterial - lowest complexity)
const simpleCubeGeo = new THREE.BoxGeometry(1, 1, 1);
const simpleCubeMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
const simpleCube = new THREE.Mesh(simpleCubeGeo, simpleCubeMat);
simpleCube.position.set(-8, 0.5, -6);
simpleCube.name = 'Simple Cube (Low Cost)';
scene.add(simpleCube);

// Low-poly sphere (MeshLambertMaterial)
const lowPolySphereGeo = new THREE.SphereGeometry(0.8, 8, 6);
const lowPolySphereMat = new THREE.MeshLambertMaterial({ color: 0x4ade80 });
const lowPolySphere = new THREE.Mesh(lowPolySphereGeo, lowPolySphereMat);
lowPolySphere.position.set(-5, 0.8, -6);
lowPolySphere.name = 'Low-Poly Sphere (Low Cost)';
scene.add(lowPolySphere);

// ─── MEDIUM COST OBJECTS ─────────────────────────────────────────

// Standard sphere with shadows
const standardSphereGeo = new THREE.SphereGeometry(1, 32, 32);
const standardSphereMat = new THREE.MeshStandardMaterial({
  color: 0xeab308,
  roughness: 0.4,
  metalness: 0.6
});
const standardSphere = new THREE.Mesh(standardSphereGeo, standardSphereMat);
standardSphere.position.set(-2, 1, -6);
standardSphere.castShadow = true;
standardSphere.receiveShadow = true;
standardSphere.name = 'Standard Sphere (Medium Cost)';
scene.add(standardSphere);

// Textured torus
const texturedTorusGeo = new THREE.TorusGeometry(0.8, 0.3, 32, 64);
const texturedTorusMat = new THREE.MeshStandardMaterial({
  color: 0xfbbf24,
  map: checkerTexture,
  roughness: 0.5,
  metalness: 0.3
});
const texturedTorus = new THREE.Mesh(texturedTorusGeo, texturedTorusMat);
texturedTorus.position.set(1, 1.1, -6);
texturedTorus.castShadow = true;
texturedTorus.name = 'Textured Torus (Medium Cost)';
scene.add(texturedTorus);

// ─── HIGH COST OBJECTS ───────────────────────────────────────────

// Complex material sphere
const complexSphereGeo = new THREE.SphereGeometry(1.2, 64, 64);
const complexSphereMat = new THREE.MeshStandardMaterial({
  color: 0xf97316,
  map: checkerTexture,
  normalMap: normalMapTexture,
  roughnessMap: roughnessTexture,
  roughness: 0.5,
  metalness: 0.8
});
const complexSphere = new THREE.Mesh(complexSphereGeo, complexSphereMat);
complexSphere.position.set(4, 1.2, -6);
complexSphere.castShadow = true;
complexSphere.receiveShadow = true;
complexSphere.name = 'Complex Sphere (High Cost)';
scene.add(complexSphere);

// High-poly torus knot
const torusKnotGeo = new THREE.TorusKnotGeometry(0.8, 0.25, 128, 32);
const torusKnotMat = new THREE.MeshStandardMaterial({
  color: 0xfb923c,
  roughness: 0.3,
  metalness: 0.9
});
const torusKnot = new THREE.Mesh(torusKnotGeo, torusKnotMat);
torusKnot.position.set(7, 1, -6);
torusKnot.castShadow = true;
torusKnot.receiveShadow = true;
torusKnot.name = 'Torus Knot (High Cost)';
scene.add(torusKnot);

// ─── CRITICAL COST OBJECTS ───────────────────────────────────────

// Ultra high-poly sphere with physical material
const ultraSphereGeo = new THREE.SphereGeometry(1.5, 128, 128);
const ultraSphereMat = new THREE.MeshPhysicalMaterial({
  color: 0xef4444,
  roughness: 0.1,
  metalness: 0.9,
  clearcoat: 1.0,
  clearcoatRoughness: 0.1,
  map: checkerTexture,
  normalMap: normalMapTexture,
  roughnessMap: roughnessTexture
});
const ultraSphere = new THREE.Mesh(ultraSphereGeo, ultraSphereMat);
ultraSphere.position.set(-4, 1.5, 0);
ultraSphere.castShadow = true;
ultraSphere.receiveShadow = true;
ultraSphere.name = 'Ultra Sphere (Critical Cost)';
scene.add(ultraSphere);

// Dense icosahedron with transmission
const denseIcosaGeo = new THREE.IcosahedronGeometry(1.2, 5);
const denseIcosaMat = new THREE.MeshPhysicalMaterial({
  color: 0xf87171,
  roughness: 0.2,
  metalness: 0.8,
  transmission: 0.3,
  thickness: 0.5,
  map: checkerTexture,
  normalMap: normalMapTexture
});
const denseIcosa = new THREE.Mesh(denseIcosaGeo, denseIcosaMat);
denseIcosa.position.set(0, 1.2, 0);
denseIcosa.castShadow = true;
denseIcosa.receiveShadow = true;
denseIcosa.name = 'Dense Icosahedron (Critical Cost)';
scene.add(denseIcosa);

// Complex mesh array (many objects with unique materials)
const complexArrayGroup = new THREE.Group();
complexArrayGroup.name = 'Cube Array (Critical Cost)';
const smallCubeGeo = new THREE.BoxGeometry(0.3, 0.3, 0.3);
for (let x = 0; x < 5; x++) {
  for (let z = 0; z < 5; z++) {
    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color().setHSL(x * 0.05 + z * 0.05, 0.8, 0.5),
      roughness: 0.3,
      metalness: 0.7,
      map: checkerTexture
    });
    const cube = new THREE.Mesh(smallCubeGeo, mat);
    cube.position.set(x * 0.5 - 1, 0.15, z * 0.5 - 1);
    cube.castShadow = true;
    cube.receiveShadow = true;
    cube.name = `ArrayCube_${x}_${z}`;
    complexArrayGroup.add(cube);
  }
}
complexArrayGroup.position.set(5, 0, 2);
scene.add(complexArrayGroup);

// ─────────────────────────────────────────────────────────────────
// 3Lens DevTools Setup
// ─────────────────────────────────────────────────────────────────

const probe = createProbe({
  name: 'CostAnalysisDemo',
  sampling: {
    frameStatsInterval: 1,
    sceneSnapshotInterval: 30,
  },
});

probe.observeRenderer(renderer);
probe.observeScene(scene);

// Register logical entity for cost categories
probe.registerLogicalEntity('cost-overview', {
  name: 'Cost Overview',
  type: 'analysis',
  metadata: {
    categories: {
      low: ['Simple Cube', 'Low-Poly Sphere', 'Ground Plane'],
      medium: ['Standard Sphere', 'Textured Torus'],
      high: ['Complex Sphere', 'Torus Knot'],
      critical: ['Ultra Sphere', 'Dense Icosahedron', 'Cube Array'],
    },
    description: 'Objects categorized by rendering cost',
  },
});

bootstrapOverlay({
  probe,
  position: 'right',
  defaultWidth: 400,
  defaultOpen: true,
});

// ─────────────────────────────────────────────────────────────────
// Console Controls
// ─────────────────────────────────────────────────────────────────

let addedObjectCount = 0;

(window as any).costDemo = {
  // Add a high-cost object
  addExpensive: () => {
    const geo = new THREE.SphereGeometry(1, 128, 128);
    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color().setHSL(Math.random(), 0.8, 0.5),
      roughness: 0.1,
      metalness: 0.9,
      clearcoat: 1.0,
      map: checkerTexture,
      normalMap: normalMapTexture,
      roughnessMap: roughnessTexture
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(
      (Math.random() - 0.5) * 10,
      1,
      (Math.random() - 0.5) * 10 + 6
    );
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.name = `Expensive Object ${++addedObjectCount}`;
    scene.add(mesh);
    
    console.log(`Added expensive object: ${mesh.name}`);
  },
  
  // Add a low-cost object
  addCheap: () => {
    const geo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(Math.random(), 0.6, 0.6)
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(
      (Math.random() - 0.5) * 10,
      0.25,
      (Math.random() - 0.5) * 10 + 6
    );
    mesh.name = `Simple Object ${++addedObjectCount}`;
    scene.add(mesh);
    
    console.log(`Added cheap object: ${mesh.name}`);
  },
  
  // List objects by cost category
  listByCost: () => {
    console.log('\n📊 Objects by Cost Category:\n');
    console.log('🟢 LOW COST:');
    console.log('  - Simple Cube (MeshBasicMaterial, 12 tris)');
    console.log('  - Low-Poly Sphere (MeshLambertMaterial, ~48 tris)');
    console.log('\n🟡 MEDIUM COST:');
    console.log('  - Standard Sphere (MeshStandardMaterial, ~2K tris, shadows)');
    console.log('  - Textured Torus (MeshStandardMaterial + texture)');
    console.log('\n🟠 HIGH COST:');
    console.log('  - Complex Sphere (MeshStandardMaterial + 3 textures)');
    console.log('  - Torus Knot (~8K tris, shadows)');
    console.log('\n🔴 CRITICAL COST:');
    console.log('  - Ultra Sphere (MeshPhysicalMaterial + clearcoat + 3 textures, ~32K tris)');
    console.log('  - Dense Icosahedron (MeshPhysicalMaterial + transmission, ~20K tris)');
    console.log('  - Cube Array (25 meshes with unique PhysicalMaterials)');
  },
};

// ─────────────────────────────────────────────────────────────────
// Animation Loop
// ─────────────────────────────────────────────────────────────────

let time = 0;

function animate() {
  requestAnimationFrame(animate);
  
  time += 0.01;
  
  // Subtle rotation for some objects
  torusKnot.rotation.y = time * 0.3;
  denseIcosa.rotation.x = time * 0.2;
  denseIcosa.rotation.y = time * 0.3;
  texturedTorus.rotation.x = time * 0.5;
  
  controls.update();
  renderer.render(scene, camera);
}

// ─────────────────────────────────────────────────────────────────
// Resize Handler
// ─────────────────────────────────────────────────────────────────

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ─────────────────────────────────────────────────────────────────
// Initialize
// ─────────────────────────────────────────────────────────────────

animate();

console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                 Cost Analysis Visualization                    ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  Open 3Lens DevTools (Ctrl+Shift+D) to explore:              ║
║                                                               ║
║  Scene Panel:                                                 ║
║    • View objects in the scene tree                          ║
║    • Select objects to see their properties                  ║
║    • Cost indicators show relative rendering cost            ║
║                                                               ║
║  Performance Panel:                                           ║
║    • See total triangle count and draw calls                 ║
║    • Monitor frame time and FPS                              ║
║                                                               ║
║  Cost Levels:                                                 ║
║    🟢 Low: Basic materials, few triangles                    ║
║    🟡 Medium: Standard materials, textures, shadows          ║
║    🟠 High: Multiple textures, high poly count               ║
║    🔴 Critical: Physical materials, many unique materials    ║
║                                                               ║
║  Console commands:                                            ║
║    costDemo.addExpensive()  - Add high-cost object           ║
║    costDemo.addCheap()      - Add low-cost object            ║
║    costDemo.listByCost()    - List objects by category       ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`);
