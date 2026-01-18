/**
 * Morph Target Analyzer Example
 * 
 * Demonstrates morph target (blend shape) debugging with 3Lens integration.
 * Use 3Lens to inspect:
 * - All morph target definitions
 * - Current influence values
 * - Memory usage for morph data
 * - Active morph count
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';
import '@3lens/themes/styles.css';

// ============================================================================
// TYPES
// ============================================================================

interface MorphTargetDef {
  name: string;
  displayName: string;
  category: 'expression' | 'phoneme' | 'modifier';
}

interface ExpressionPreset {
  name: string;
  weights: Record<string, number>;
}

// ============================================================================
// MORPH TARGET DEFINITIONS
// ============================================================================

const MORPH_TARGETS: MorphTargetDef[] = [
  { name: 'smile', displayName: 'Smile', category: 'expression' },
  { name: 'frown', displayName: 'Frown', category: 'expression' },
  { name: 'eyebrowRaise', displayName: 'Eyebrow Raise', category: 'expression' },
  { name: 'eyebrowFurrow', displayName: 'Eyebrow Furrow', category: 'expression' },
  { name: 'eyeWideL', displayName: 'Eye Wide (L)', category: 'expression' },
  { name: 'eyeWideR', displayName: 'Eye Wide (R)', category: 'expression' },
  { name: 'eyeSquintL', displayName: 'Eye Squint (L)', category: 'expression' },
  { name: 'eyeSquintR', displayName: 'Eye Squint (R)', category: 'expression' },
  { name: 'eyeBlinkL', displayName: 'Blink (L)', category: 'expression' },
  { name: 'eyeBlinkR', displayName: 'Blink (R)', category: 'expression' },
  { name: 'mouthOpen', displayName: 'Mouth Open', category: 'phoneme' },
  { name: 'mouthPucker', displayName: 'Mouth Pucker', category: 'phoneme' },
  { name: 'mouthWide', displayName: 'Mouth Wide', category: 'phoneme' },
  { name: 'jawOpen', displayName: 'Jaw Open', category: 'phoneme' },
  { name: 'cheekPuff', displayName: 'Cheek Puff', category: 'modifier' },
  { name: 'noseScrunch', displayName: 'Nose Scrunch', category: 'modifier' },
];

const EXPRESSION_PRESETS: ExpressionPreset[] = [
  { name: 'happy', weights: { smile: 1, eyeSquintL: 0.3, eyeSquintR: 0.3, cheekPuff: 0.2 } },
  { name: 'sad', weights: { frown: 1, eyebrowFurrow: 0.5, mouthOpen: 0.2 } },
  { name: 'angry', weights: { frown: 0.8, eyebrowFurrow: 1, eyeSquintL: 0.5, eyeSquintR: 0.5, noseScrunch: 0.6 } },
  { name: 'surprised', weights: { eyebrowRaise: 1, eyeWideL: 1, eyeWideR: 1, mouthOpen: 0.8, jawOpen: 0.5 } },
  { name: 'wink', weights: { smile: 0.7, eyeBlinkL: 1, eyebrowRaise: 0.3 } },
  { name: 'neutral', weights: {} },
];

// ============================================================================
// GLOBAL STATE
// ============================================================================

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: OrbitControls;
let probe: ReturnType<typeof createProbe>;
let faceMesh: THREE.Mesh;

// Animation state
let animationMode: 'none' | 'blink' | 'talk' | 'random' = 'none';
let animTime = 0;
let randomTargets: Record<string, number> = {};

// ============================================================================
// SCENE SETUP
// ============================================================================

function init(): void {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a2e);

  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 4);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  document.getElementById('app')!.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.target.set(0, 0, 0);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xffffff, 1);
  keyLight.position.set(5, 5, 5);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x4ecdc4, 0.3);
  fillLight.position.set(-5, 0, 5);
  scene.add(fillLight);

  // Create face mesh
  faceMesh = createFaceMesh();
  scene.add(faceMesh);

  // Initialize 3Lens
  initProbe();

  // Setup UI
  setupUI();

  // Event listeners
  window.addEventListener('resize', onWindowResize);

  // Start animation
  animate();
}

function createFaceMesh(): THREE.Mesh {
  const baseGeometry = new THREE.SphereGeometry(1, 64, 48);
  const positionAttr = baseGeometry.getAttribute('position');
  const positions = positionAttr.array as Float32Array;
  const vertexCount = positionAttr.count;
  
  // Deform into face shape
  for (let i = 0; i < vertexCount; i++) {
    const x = positions[i * 3];
    const y = positions[i * 3 + 1];
    const z = positions[i * 3 + 2];
    
    // Flatten the back
    if (z < -0.3) positions[i * 3 + 2] = z * 0.5;
    
    // Chin narrowing
    if (y < -0.3) {
      const chinFactor = Math.max(0, (-y - 0.3) / 0.7);
      positions[i * 3] *= 1 - chinFactor * 0.3;
    }
    
    // Eye sockets
    const eyeY = 0.15;
    const eyeSpacing = 0.35;
    const leftEyeDist = Math.sqrt((x + eyeSpacing) ** 2 + (y - eyeY) ** 2);
    const rightEyeDist = Math.sqrt((x - eyeSpacing) ** 2 + (y - eyeY) ** 2);
    
    if (leftEyeDist < 0.2 && z > 0.5) positions[i * 3 + 2] -= (1 - leftEyeDist / 0.2) * 0.15;
    if (rightEyeDist < 0.2 && z > 0.5) positions[i * 3 + 2] -= (1 - rightEyeDist / 0.2) * 0.15;
    
    // Nose bump
    const noseDist = Math.sqrt(x ** 2 + (y + 0.1) ** 2);
    if (noseDist < 0.15 && z > 0.7) positions[i * 3 + 2] += (1 - noseDist / 0.15) * 0.2;
  }
  
  baseGeometry.computeVertexNormals();
  
  // Create morph targets
  const morphAttributes: THREE.BufferAttribute[] = [];
  
  for (const morphDef of MORPH_TARGETS) {
    const morphPositions = new Float32Array(vertexCount * 3);
    
    for (let i = 0; i < vertexCount; i++) {
      const x = positions[i * 3];
      const y = positions[i * 3 + 1];
      const z = positions[i * 3 + 2];
      
      let dx = 0, dy = 0, dz = 0;
      
      // Simplified morph target deltas
      switch (morphDef.name) {
        case 'smile': {
          const mouthCornerL = Math.sqrt((x + 0.35) ** 2 + (y + 0.4) ** 2);
          const mouthCornerR = Math.sqrt((x - 0.35) ** 2 + (y + 0.4) ** 2);
          if (mouthCornerL < 0.2 && z > 0.3) { dy += (1 - mouthCornerL / 0.2) * 0.1; dz += (1 - mouthCornerL / 0.2) * 0.05; }
          if (mouthCornerR < 0.2 && z > 0.3) { dy += (1 - mouthCornerR / 0.2) * 0.1; dz += (1 - mouthCornerR / 0.2) * 0.05; }
          break;
        }
        case 'frown': {
          const mouthCornerL = Math.sqrt((x + 0.35) ** 2 + (y + 0.4) ** 2);
          const mouthCornerR = Math.sqrt((x - 0.35) ** 2 + (y + 0.4) ** 2);
          if (mouthCornerL < 0.2 && z > 0.3) dy -= (1 - mouthCornerL / 0.2) * 0.08;
          if (mouthCornerR < 0.2 && z > 0.3) dy -= (1 - mouthCornerR / 0.2) * 0.08;
          break;
        }
        case 'eyebrowRaise': {
          if (y > 0.3 && y < 0.6 && Math.abs(x) > 0.15 && Math.abs(x) < 0.6 && z > 0.5) {
            const influence = Math.sin((y - 0.3) / 0.3 * Math.PI) * 0.5;
            dy += influence * 0.12;
          }
          break;
        }
        case 'eyebrowFurrow': {
          if (y > 0.25 && y < 0.5 && Math.abs(x) < 0.5 && z > 0.5) {
            dy -= (1 - Math.abs(x) / 0.5) * 0.08;
          }
          break;
        }
        case 'eyeBlinkL':
        case 'eyeBlinkR': {
          const eyeX = morphDef.name === 'eyeBlinkL' ? -0.35 : 0.35;
          const eyeDist = Math.sqrt((x - eyeX) ** 2 + (y - 0.15) ** 2);
          if (eyeDist < 0.18 && z > 0.5) {
            const influence = 1 - eyeDist / 0.18;
            dy += (y > 0.15 ? -influence * 0.08 : influence * 0.06);
          }
          break;
        }
        case 'mouthOpen': {
          const mouthDist = Math.sqrt(x ** 2 + (y + 0.45) ** 2);
          if (mouthDist < 0.25 && z > 0.4) {
            const influence = 1 - mouthDist / 0.25;
            dy += (y < -0.45 ? -influence * 0.1 : influence * 0.05);
          }
          break;
        }
        case 'jawOpen': {
          if (y < -0.2 && z > 0) {
            const influence = Math.min(1, (-y - 0.2) / 0.6);
            dy -= influence * 0.15;
          }
          break;
        }
      }
      
      morphPositions[i * 3] = dx;
      morphPositions[i * 3 + 1] = dy;
      morphPositions[i * 3 + 2] = dz;
    }
    
    morphAttributes.push(new THREE.BufferAttribute(morphPositions, 3));
  }
  
  baseGeometry.morphAttributes.position = morphAttributes;
  
  const material = new THREE.MeshStandardMaterial({
    color: 0xffcc99,
    roughness: 0.6,
    metalness: 0.1,
    morphTargets: true
  });
  
  const mesh = new THREE.Mesh(baseGeometry, material);
  mesh.name = 'FaceWithMorphTargets';
  mesh.morphTargetInfluences = new Array(MORPH_TARGETS.length).fill(0);
  mesh.morphTargetDictionary = {};
  
  MORPH_TARGETS.forEach((morphDef, index) => {
    mesh.morphTargetDictionary![morphDef.name] = index;
  });
  
  return mesh;
}

function initProbe(): void {
  probe = createProbe({ appName: 'Morph-Target-Analyzer' });
  createOverlay({ probe, theme: 'dark' });

  const vertexCount = faceMesh.geometry.getAttribute('position').count;
  const morphMemory = MORPH_TARGETS.length * vertexCount * 3 * 4; // bytes

  // Register morph target system
  probe.registerLogicalEntity({
    id: 'morph-system',
    name: 'Morph Target System',
    type: 'morph-targets',
    object3D: faceMesh,
    metadata: {
      morphTargetCount: MORPH_TARGETS.length,
      vertexCount,
      memoryKB: (morphMemory / 1024).toFixed(1),
      activeMorphs: 0,
    }
  });

  // Register each morph target
  MORPH_TARGETS.forEach((morphDef, index) => {
    probe.registerLogicalEntity({
      id: `morph-${index}`,
      name: morphDef.displayName,
      type: 'morph-target',
      metadata: {
        index,
        category: morphDef.category,
        influence: 0,
      }
    });
  });
}

// ============================================================================
// MORPH TARGET CONTROL
// ============================================================================

function setMorphTarget(name: string, value: number): void {
  const index = faceMesh.morphTargetDictionary![name];
  if (index !== undefined && faceMesh.morphTargetInfluences) {
    faceMesh.morphTargetInfluences[index] = Math.max(0, Math.min(1, value));
  }
}

function getMorphTarget(name: string): number {
  const index = faceMesh.morphTargetDictionary![name];
  if (index !== undefined && faceMesh.morphTargetInfluences) {
    return faceMesh.morphTargetInfluences[index];
  }
  return 0;
}

function resetAllMorphTargets(): void {
  MORPH_TARGETS.forEach(morphDef => setMorphTarget(morphDef.name, 0));
}

function applyPreset(presetName: string): void {
  const preset = EXPRESSION_PRESETS.find(p => p.name === presetName);
  if (!preset) return;

  resetAllMorphTargets();
  Object.entries(preset.weights).forEach(([name, value]) => {
    setMorphTarget(name, value);
  });
  
  animationMode = 'none';
}

// ============================================================================
// UI SETUP
// ============================================================================

function setupUI(): void {
  // Preset buttons
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const presetName = btn.getAttribute('data-preset');
      if (presetName) {
        applyPreset(presetName);
        document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('.control-btn').forEach(b => b.classList.remove('active'));
      }
    });
  });

  // Animation buttons
  document.getElementById('btn-blink')!.addEventListener('click', (e) => {
    const btn = e.currentTarget as HTMLElement;
    animationMode = animationMode === 'blink' ? 'none' : 'blink';
    document.querySelectorAll('.control-btn').forEach(b => b.classList.remove('active'));
    if (animationMode === 'blink') btn.classList.add('active');
    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
  });

  document.getElementById('btn-talk')!.addEventListener('click', (e) => {
    const btn = e.currentTarget as HTMLElement;
    animationMode = animationMode === 'talk' ? 'none' : 'talk';
    document.querySelectorAll('.control-btn').forEach(b => b.classList.remove('active'));
    if (animationMode === 'talk') btn.classList.add('active');
    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
  });

  document.getElementById('btn-random')!.addEventListener('click', (e) => {
    const btn = e.currentTarget as HTMLElement;
    animationMode = animationMode === 'random' ? 'none' : 'random';
    document.querySelectorAll('.control-btn').forEach(b => b.classList.remove('active'));
    if (animationMode === 'random') {
      btn.classList.add('active');
      // Generate random targets
      MORPH_TARGETS.forEach(morphDef => {
        randomTargets[morphDef.name] = Math.random() * 0.8;
      });
    }
    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
  });

  window.addEventListener('resize', onWindowResize);
}

function onWindowResize(): void {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// ============================================================================
// ANIMATION
// ============================================================================

function updateAnimation(deltaTime: number): void {
  animTime += deltaTime;

  switch (animationMode) {
    case 'blink': {
      const blinkCycle = animTime % 3;
      const blinkValue = blinkCycle > 0.9 && blinkCycle < 1.1 ? Math.sin((blinkCycle - 0.9) / 0.2 * Math.PI) : 0;
      setMorphTarget('eyeBlinkL', blinkValue);
      setMorphTarget('eyeBlinkR', blinkValue);
      break;
    }
    case 'talk': {
      const talkCycle = (animTime * 8) % 1;
      setMorphTarget('mouthOpen', 0.3 + Math.sin(talkCycle * Math.PI * 2) * 0.3);
      setMorphTarget('jawOpen', 0.2 + Math.sin(talkCycle * Math.PI * 2) * 0.2);
      break;
    }
    case 'random': {
      MORPH_TARGETS.forEach(morphDef => {
        const current = getMorphTarget(morphDef.name);
        const target = randomTargets[morphDef.name] || 0;
        setMorphTarget(morphDef.name, current + (target - current) * deltaTime * 2);
      });
      // Change targets periodically
      if (animTime % 2 < deltaTime) {
        MORPH_TARGETS.forEach(morphDef => {
          randomTargets[morphDef.name] = Math.random() * 0.8;
        });
      }
      break;
    }
  }
}

function update3LensMetadata(): void {
  const influences = faceMesh.morphTargetInfluences || [];
  const activeCount = influences.filter(i => i > 0.01).length;

  probe.updateLogicalEntity('morph-system', {
    metadata: {
      morphTargetCount: MORPH_TARGETS.length,
      vertexCount: faceMesh.geometry.getAttribute('position').count,
      memoryKB: (MORPH_TARGETS.length * faceMesh.geometry.getAttribute('position').count * 3 * 4 / 1024).toFixed(1),
      activeMorphs: activeCount,
      animationMode,
    }
  });

  // Update individual morph targets
  MORPH_TARGETS.forEach((morphDef, index) => {
    probe.updateLogicalEntity(`morph-${index}`, {
      metadata: {
        index,
        category: morphDef.category,
        influence: (influences[index] || 0).toFixed(2),
      }
    });
  });
}

// ============================================================================
// ANIMATION LOOP
// ============================================================================

const clock = new THREE.Clock();

function animate(): void {
  requestAnimationFrame(animate);
  
  const deltaTime = clock.getDelta();
  
  updateAnimation(deltaTime);
  
  // Update 3Lens periodically
  if (Math.random() < 0.1) {
    update3LensMetadata();
  }
  
  controls.update();
  renderer.render(scene, camera);
}

// ============================================================================
// START
// ============================================================================

init();
