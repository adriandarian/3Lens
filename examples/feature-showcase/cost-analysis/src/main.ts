/**
 * Cost Analysis Visualization Demo
 * 
 * Demonstrates 3Lens cost analysis features:
 * - Triangle count per object (normalized to 1 point per 1000 triangles)
 * - Material complexity scoring (1-10 based on type, textures, features)
 * - Cost heatmap overlay (color-coded tree nodes)
 * - Cost ranking (objects sorted by total cost)
 * - Detailed cost breakdown per object
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DevtoolProbe } from '@3lens/core';
import { ThreeLensOverlay } from '@3lens/overlay';
import '@3lens/themes/styles.css';

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

interface SceneObject {
  mesh: THREE.Mesh;
  name: string;
  category: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

interface CostData {
  triangleCost: number;
  materialComplexity: number;
  textureCost: number;
  shadowCost: number;
  totalCost: number;
  costLevel: 'low' | 'medium' | 'high' | 'critical';
}

// ─────────────────────────────────────────────────────────────────
// Scene Setup
// ─────────────────────────────────────────────────────────────────

const app = document.getElementById('app')!;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);
scene.name = 'Cost Analysis Demo';

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
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 50;
directionalLight.shadow.camera.left = -20;
directionalLight.shadow.camera.right = 20;
directionalLight.shadow.camera.top = 20;
directionalLight.shadow.camera.bottom = -20;
scene.add(directionalLight);

const pointLight = new THREE.PointLight(0x22d3ee, 1, 20);
pointLight.position.set(-5, 5, 5);
scene.add(pointLight);

// ─────────────────────────────────────────────────────────────────
// Texture Loader
// ─────────────────────────────────────────────────────────────────

const textureLoader = new THREE.TextureLoader();
const textureCache = new Map<string, THREE.Texture>();

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
  
  // Create a simple bump pattern (encoded as normal map)
  const imageData = ctx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const noise = Math.sin(x * 0.1) * Math.cos(y * 0.1);
      imageData.data[i] = 128 + noise * 20;     // R (X direction)
      imageData.data[i + 1] = 128 + noise * 20; // G (Y direction)
      imageData.data[i + 2] = 255;              // B (Z direction)
      imageData.data[i + 3] = 255;              // A
    }
  }
  ctx.putImageData(imageData, 0, 0);
  
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

function createRoughnessTexture(size = 256): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  
  // Create varied roughness pattern
  for (let y = 0; y < size; y += 4) {
    for (let x = 0; x < size; x += 4) {
      const roughness = Math.random() * 0.5 + 0.3;
      const gray = Math.floor(roughness * 255);
      ctx.fillStyle = `rgb(${gray}, ${gray}, ${gray})`;
      ctx.fillRect(x, y, 4, 4);
    }
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// Pre-create textures
const checkerTexture = createCheckerTexture();
const normalMapTexture = createNormalMapTexture();
const roughnessTexture = createRoughnessTexture();

// ─────────────────────────────────────────────────────────────────
// Scene Objects
// ─────────────────────────────────────────────────────────────────

const sceneObjects: SceneObject[] = [];

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
sceneObjects.push({
  mesh: ground,
  name: 'Ground Plane',
  category: 'low',
  description: 'Simple plane with basic material'
});

// ─── LOW COST OBJECTS ────────────────────────────────────────────

// Simple cube (MeshBasicMaterial - lowest complexity)
const simpleCubeGeo = new THREE.BoxGeometry(1, 1, 1);
const simpleCubeMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
const simpleCube = new THREE.Mesh(simpleCubeGeo, simpleCubeMat);
simpleCube.position.set(-8, 0.5, -6);
simpleCube.name = 'Simple Cube';
scene.add(simpleCube);
sceneObjects.push({
  mesh: simpleCube,
  name: 'Simple Cube',
  category: 'low',
  description: 'MeshBasicMaterial, no lighting, 12 triangles'
});

// Low-poly sphere (MeshLambertMaterial)
const lowPolySphereGeo = new THREE.SphereGeometry(0.8, 8, 6);
const lowPolySphereMat = new THREE.MeshLambertMaterial({ color: 0x4ade80 });
const lowPolySphere = new THREE.Mesh(lowPolySphereGeo, lowPolySphereMat);
lowPolySphere.position.set(-5, 0.8, -6);
lowPolySphere.name = 'Low-Poly Sphere';
scene.add(lowPolySphere);
sceneObjects.push({
  mesh: lowPolySphere,
  name: 'Low-Poly Sphere',
  category: 'low',
  description: 'MeshLambertMaterial, ~48 triangles'
});

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
standardSphere.name = 'Standard Sphere';
scene.add(standardSphere);
sceneObjects.push({
  mesh: standardSphere,
  name: 'Standard Sphere',
  category: 'medium',
  description: 'MeshStandardMaterial, shadows, ~2000 triangles'
});

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
texturedTorus.name = 'Textured Torus';
scene.add(texturedTorus);
sceneObjects.push({
  mesh: texturedTorus,
  name: 'Textured Torus',
  category: 'medium',
  description: 'MeshStandardMaterial + diffuse texture'
});

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
complexSphere.name = 'Complex Sphere';
scene.add(complexSphere);
sceneObjects.push({
  mesh: complexSphere,
  name: 'Complex Sphere',
  category: 'high',
  description: 'MeshStandardMaterial + multiple textures (diffuse, normal, roughness)'
});

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
torusKnot.name = 'Torus Knot';
scene.add(torusKnot);
sceneObjects.push({
  mesh: torusKnot,
  name: 'Torus Knot',
  category: 'high',
  description: 'High polygon count (~8000 triangles), shadows'
});

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
ultraSphere.name = 'Ultra Sphere';
scene.add(ultraSphere);
sceneObjects.push({
  mesh: ultraSphere,
  name: 'Ultra Sphere',
  category: 'critical',
  description: 'MeshPhysicalMaterial + clearcoat + 3 textures, ~32K triangles'
});

// Dense icosahedron
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
denseIcosa.name = 'Dense Icosahedron';
scene.add(denseIcosa);
sceneObjects.push({
  mesh: denseIcosa,
  name: 'Dense Icosahedron',
  category: 'critical',
  description: 'MeshPhysicalMaterial + transmission, ~20K triangles'
});

// Complex mesh array (many objects)
const complexArrayGroup = new THREE.Group();
complexArrayGroup.name = 'Complex Array Group';
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
sceneObjects.push({
  mesh: complexArrayGroup as unknown as THREE.Mesh, // Group reference
  name: 'Cube Array (25 items)',
  category: 'critical',
  description: '25 individual meshes with unique PhysicalMaterials'
});

// ─────────────────────────────────────────────────────────────────
// 3Lens DevTools Setup
// ─────────────────────────────────────────────────────────────────

const probe = new DevtoolProbe();
probe.init({
  scenes: [scene],
  enableKeyboardShortcuts: true
});
probe.observeRenderer(renderer);

const overlay = new ThreeLensOverlay(probe);
overlay.init();

// ─────────────────────────────────────────────────────────────────
// Cost Calculation Helpers
// ─────────────────────────────────────────────────────────────────

function calculateMeshCost(mesh: THREE.Mesh): CostData {
  const geometry = mesh.geometry;
  const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  
  // Triangle count
  let faceCount = 0;
  if (geometry.index) {
    faceCount = geometry.index.count / 3;
  } else if (geometry.attributes.position) {
    faceCount = geometry.attributes.position.count / 3;
  }
  
  const triangleCost = faceCount / 1000;
  
  // Material complexity
  let totalComplexity = 0;
  let textureCount = 0;
  
  for (const mat of materials) {
    let complexity = 1;
    
    // Material type complexity
    if (mat.type === 'MeshBasicMaterial') complexity += 0;
    else if (mat.type === 'MeshLambertMaterial') complexity += 1;
    else if (mat.type === 'MeshPhongMaterial') complexity += 2;
    else if (mat.type === 'MeshStandardMaterial') complexity += 3;
    else if (mat.type === 'MeshPhysicalMaterial') complexity += 4;
    
    // Check textures
    const stdMat = mat as THREE.MeshStandardMaterial;
    if ('map' in stdMat && stdMat.map) { textureCount++; complexity += 0.5; }
    if ('normalMap' in stdMat && stdMat.normalMap) { textureCount++; complexity += 0.5; }
    if ('roughnessMap' in stdMat && stdMat.roughnessMap) { textureCount++; complexity += 0.5; }
    if ('metalnessMap' in stdMat && stdMat.metalnessMap) { textureCount++; complexity += 0.5; }
    if ('envMap' in stdMat && stdMat.envMap) { textureCount++; complexity += 0.5; }
    if ('aoMap' in stdMat && stdMat.aoMap) { textureCount++; complexity += 0.5; }
    
    totalComplexity += Math.min(complexity, 10);
  }
  
  const materialComplexity = totalComplexity / materials.length;
  const textureCost = textureCount * 2;
  
  // Shadow cost
  let shadowCost = 0;
  if (mesh.castShadow) shadowCost += 2;
  if (mesh.receiveShadow) shadowCost += 1;
  
  // Total cost
  const totalCost = (triangleCost * 1) + (materialComplexity * 0.5) + (textureCost * 0.3) + (shadowCost * 0.2);
  
  // Cost level
  let costLevel: 'low' | 'medium' | 'high' | 'critical';
  if (totalCost < 2) costLevel = 'low';
  else if (totalCost < 10) costLevel = 'medium';
  else if (totalCost < 50) costLevel = 'high';
  else costLevel = 'critical';
  
  return {
    triangleCost,
    materialComplexity,
    textureCost,
    shadowCost,
    totalCost,
    costLevel
  };
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

function getTriangleCount(mesh: THREE.Mesh | THREE.Group): number {
  if (mesh instanceof THREE.Group) {
    let total = 0;
    mesh.traverse((child) => {
      if (child instanceof THREE.Mesh && child.geometry) {
        const geo = child.geometry;
        if (geo.index) {
          total += geo.index.count / 3;
        } else if (geo.attributes.position) {
          total += geo.attributes.position.count / 3;
        }
      }
    });
    return total;
  }
  
  const geometry = mesh.geometry;
  if (!geometry) return 0;
  
  if (geometry.index) {
    return geometry.index.count / 3;
  } else if (geometry.attributes.position) {
    return geometry.attributes.position.count / 3;
  }
  return 0;
}

// ─────────────────────────────────────────────────────────────────
// UI Updates
// ─────────────────────────────────────────────────────────────────

const objectList = document.getElementById('object-list')!;
const breakdownSection = document.getElementById('breakdown-section')!;
const costBreakdown = document.getElementById('cost-breakdown')!;
const totalCostEl = document.getElementById('total-cost')!;
const totalTrianglesEl = document.getElementById('total-triangles')!;
const meshCountEl = document.getElementById('mesh-count')!;
const materialCountEl = document.getElementById('material-count')!;

let selectedObjectIndex = -1;

function updateUI() {
  // Calculate costs for all objects
  const objectData = sceneObjects.map((obj, index) => {
    let cost: CostData;
    let triangles: number;
    
    if (obj.mesh instanceof THREE.Group) {
      // For groups, sum up child costs
      triangles = getTriangleCount(obj.mesh);
      const triangleCost = triangles / 1000;
      
      // Count unique materials in group
      const materials = new Set<THREE.Material>();
      obj.mesh.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          mats.forEach(m => materials.add(m));
        }
      });
      
      // Estimate complexity
      let complexity = 0;
      materials.forEach((mat) => {
        if (mat.type === 'MeshPhysicalMaterial') complexity += 4;
        else if (mat.type === 'MeshStandardMaterial') complexity += 3;
        else complexity += 1;
      });
      complexity = complexity / materials.size;
      
      const textureCost = materials.size * 2;
      const shadowCost = 3;
      const totalCost = triangleCost + complexity * 0.5 + textureCost * 0.3 + shadowCost * 0.2;
      
      cost = {
        triangleCost,
        materialComplexity: complexity,
        textureCost,
        shadowCost,
        totalCost,
        costLevel: totalCost < 2 ? 'low' : totalCost < 10 ? 'medium' : totalCost < 50 ? 'high' : 'critical'
      };
    } else {
      cost = calculateMeshCost(obj.mesh);
      triangles = getTriangleCount(obj.mesh);
    }
    
    return { ...obj, cost, triangles, index };
  });
  
  // Sort by cost (descending)
  objectData.sort((a, b) => b.cost.totalCost - a.cost.totalCost);
  
  // Calculate totals
  const totalCost = objectData.reduce((sum, obj) => sum + obj.cost.totalCost, 0);
  const totalTriangles = objectData.reduce((sum, obj) => sum + obj.triangles, 0);
  const meshCount = objectData.length;
  
  // Count unique materials
  const allMaterials = new Set<THREE.Material>();
  sceneObjects.forEach(obj => {
    if (obj.mesh instanceof THREE.Group) {
      obj.mesh.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          mats.forEach(m => allMaterials.add(m));
        }
      });
    } else {
      const mats = Array.isArray(obj.mesh.material) ? obj.mesh.material : [obj.mesh.material];
      mats.forEach(m => allMaterials.add(m));
    }
  });
  
  // Update stats
  totalCostEl.textContent = totalCost.toFixed(1);
  totalTrianglesEl.textContent = formatNumber(totalTriangles);
  meshCountEl.textContent = meshCount.toString();
  materialCountEl.textContent = allMaterials.size.toString();
  
  // Get max cost for bar scaling
  const maxCost = Math.max(...objectData.map(o => o.cost.totalCost), 1);
  
  // Render object list
  objectList.innerHTML = objectData.map((obj, rank) => {
    const isSelected = obj.index === selectedObjectIndex;
    const costPercent = (obj.cost.totalCost / maxCost) * 100;
    const barColor = getCostColor(obj.cost.costLevel);
    
    return `
      <div class="object-item ${isSelected ? 'selected' : ''}" data-index="${obj.index}">
        <span class="object-rank">#${rank + 1}</span>
        <div class="object-info">
          <div class="object-name">${obj.name}</div>
          <div class="object-stats">${formatNumber(obj.triangles)} tris</div>
        </div>
        <div class="cost-bar-container">
          <div class="cost-bar" style="width: ${costPercent}%; background: ${barColor}"></div>
        </div>
        <span class="cost-badge cost-${obj.cost.costLevel}">${obj.cost.totalCost.toFixed(1)}</span>
      </div>
    `;
  }).join('');
  
  // Add click handlers
  objectList.querySelectorAll('.object-item').forEach((item) => {
    item.addEventListener('click', () => {
      const index = parseInt(item.getAttribute('data-index')!, 10);
      selectObject(index);
    });
  });
  
  // Update breakdown if object selected
  if (selectedObjectIndex >= 0) {
    const selectedData = objectData.find(o => o.index === selectedObjectIndex);
    if (selectedData) {
      updateBreakdown(selectedData);
    }
  }
}

function getCostColor(level: string): string {
  switch (level) {
    case 'low': return '#22c55e';
    case 'medium': return '#eab308';
    case 'high': return '#f97316';
    case 'critical': return '#ef4444';
    default: return '#737373';
  }
}

function selectObject(index: number) {
  selectedObjectIndex = index;
  
  // Select in 3Lens
  const obj = sceneObjects[index];
  if (obj && obj.mesh) {
    probe.selectObject(obj.mesh);
  }
  
  updateUI();
}

function updateBreakdown(obj: { name: string; description: string; cost: CostData; triangles: number }) {
  breakdownSection.style.display = 'block';
  
  const { cost } = obj;
  const total = cost.triangleCost + cost.materialComplexity + cost.textureCost + cost.shadowCost;
  const maxComponent = Math.max(cost.triangleCost, cost.materialComplexity, cost.textureCost, cost.shadowCost, 1);
  
  costBreakdown.innerHTML = `
    <div class="breakdown-header">
      <span class="breakdown-title">${obj.name}</span>
      <span class="breakdown-total cost-${cost.costLevel}">${cost.totalCost.toFixed(2)}</span>
    </div>
    <div style="font-size: 11px; color: #737373; margin-bottom: 12px;">
      ${obj.description}
    </div>
    <div class="breakdown-row">
      <span class="breakdown-label">Triangles (${formatNumber(Math.round(cost.triangleCost * 1000))})</span>
      <span class="breakdown-value">${cost.triangleCost.toFixed(2)}</span>
      <div class="breakdown-bar">
        <div class="breakdown-bar-fill" style="width: ${(cost.triangleCost / maxComponent) * 100}%; background: #22d3ee"></div>
      </div>
    </div>
    <div class="breakdown-row">
      <span class="breakdown-label">Material Complexity</span>
      <span class="breakdown-value">${cost.materialComplexity.toFixed(2)}</span>
      <div class="breakdown-bar">
        <div class="breakdown-bar-fill" style="width: ${(cost.materialComplexity / maxComponent) * 100}%; background: #a855f7"></div>
      </div>
    </div>
    <div class="breakdown-row">
      <span class="breakdown-label">Texture Cost</span>
      <span class="breakdown-value">${cost.textureCost.toFixed(2)}</span>
      <div class="breakdown-bar">
        <div class="breakdown-bar-fill" style="width: ${(cost.textureCost / maxComponent) * 100}%; background: #f59e0b"></div>
      </div>
    </div>
    <div class="breakdown-row">
      <span class="breakdown-label">Shadow Cost</span>
      <span class="breakdown-value">${cost.shadowCost.toFixed(2)}</span>
      <div class="breakdown-bar">
        <div class="breakdown-bar-fill" style="width: ${(cost.shadowCost / maxComponent) * 100}%; background: #10b981"></div>
      </div>
    </div>
  `;
}

// ─────────────────────────────────────────────────────────────────
// Scene Actions
// ─────────────────────────────────────────────────────────────────

let addedObjectCount = 0;

document.getElementById('add-expensive')!.addEventListener('click', () => {
  // Add a high-cost object
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
  
  sceneObjects.push({
    mesh,
    name: mesh.name,
    category: 'critical',
    description: 'Dynamically added high-cost object'
  });
  
  updateUI();
});

document.getElementById('add-cheap')!.addEventListener('click', () => {
  // Add a low-cost object
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
  
  sceneObjects.push({
    mesh,
    name: mesh.name,
    category: 'low',
    description: 'Dynamically added low-cost object'
  });
  
  updateUI();
});

document.getElementById('optimize-scene')!.addEventListener('click', () => {
  // "Optimize" critical objects by reducing their complexity
  sceneObjects.forEach(obj => {
    if (obj.category === 'critical' && obj.mesh instanceof THREE.Mesh) {
      // Reduce shadow casting
      obj.mesh.castShadow = false;
      
      // Simplify material if MeshPhysicalMaterial
      if (obj.mesh.material instanceof THREE.MeshPhysicalMaterial) {
        const newMat = new THREE.MeshStandardMaterial({
          color: (obj.mesh.material as THREE.MeshPhysicalMaterial).color,
          roughness: 0.5,
          metalness: 0.5
        });
        obj.mesh.material.dispose();
        obj.mesh.material = newMat;
        obj.category = 'high';
        obj.description = 'Optimized: downgraded to MeshStandardMaterial, shadows disabled';
      }
    }
  });
  
  updateUI();
});

const initialObjects = [...sceneObjects];
const initialMaterials = new Map<THREE.Mesh, THREE.Material | THREE.Material[]>();
initialObjects.forEach(obj => {
  if (obj.mesh instanceof THREE.Mesh) {
    initialMaterials.set(obj.mesh, obj.mesh.material);
  }
});

document.getElementById('reset-scene')!.addEventListener('click', () => {
  // Remove dynamically added objects
  const toRemove: SceneObject[] = [];
  sceneObjects.forEach((obj, index) => {
    if (index >= initialObjects.length) {
      if (obj.mesh instanceof THREE.Mesh) {
        obj.mesh.geometry.dispose();
        if (Array.isArray(obj.mesh.material)) {
          obj.mesh.material.forEach(m => m.dispose());
        } else {
          obj.mesh.material.dispose();
        }
      }
      scene.remove(obj.mesh);
      toRemove.push(obj);
    }
  });
  
  toRemove.forEach(obj => {
    const idx = sceneObjects.indexOf(obj);
    if (idx >= 0) sceneObjects.splice(idx, 1);
  });
  
  addedObjectCount = 0;
  selectedObjectIndex = -1;
  breakdownSection.style.display = 'none';
  
  updateUI();
});

// ─────────────────────────────────────────────────────────────────
// Animation Loop
// ─────────────────────────────────────────────────────────────────

let time = 0;

function animate() {
  requestAnimationFrame(animate);
  
  time += 0.01;
  
  // Subtle rotation for some objects
  sceneObjects.forEach((obj) => {
    if (obj.name === 'Torus Knot' && obj.mesh instanceof THREE.Mesh) {
      obj.mesh.rotation.y = time * 0.3;
    }
    if (obj.name === 'Dense Icosahedron' && obj.mesh instanceof THREE.Mesh) {
      obj.mesh.rotation.x = time * 0.2;
      obj.mesh.rotation.y = time * 0.3;
    }
    if (obj.name === 'Textured Torus' && obj.mesh instanceof THREE.Mesh) {
      obj.mesh.rotation.x = time * 0.5;
    }
  });
  
  controls.update();
  probe.capture();
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

updateUI();
animate();

console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                 Cost Analysis Visualization                    ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  This demo showcases 3Lens cost analysis features:           ║
║                                                               ║
║  • Triangle Cost: 1 point per 1000 triangles                 ║
║  • Material Complexity: 1-10 based on shader type            ║
║  • Texture Cost: 2 points per texture map                    ║
║  • Shadow Cost: +2 for cast, +1 for receive                  ║
║                                                               ║
║  Cost Levels:                                                 ║
║  • Low (green): < 2 total cost                               ║
║  • Medium (yellow): 2-10 total cost                          ║
║  • High (orange): 10-50 total cost                           ║
║  • Critical (red): > 50 total cost                           ║
║                                                               ║
║  Press F9 to open the 3Lens DevTools overlay                 ║
║  and see the cost heatmap in the scene tree!                 ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`);
