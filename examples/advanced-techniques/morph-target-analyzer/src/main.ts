/**
 * Morph Target Analyzer Example
 * 
 * Demonstrates morph target (blend shape) debugging and analysis with 3Lens:
 * - Procedural face mesh with multiple morph targets
 * - Interactive weight sliders for each shape key
 * - Expression presets and animation sequences
 * - Delta visualization showing vertex displacement
 * - Heatmap visualization of morph influence
 * - Memory and performance analysis
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';

// ============================================================================
// Scene Setup
// ============================================================================

const container = document.getElementById('app')!;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a2e);

const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 0, 4);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(0, 0, 0);

// ============================================================================
// Lighting
// ============================================================================

const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight(0xffffff, 1);
keyLight.position.set(5, 5, 5);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0x4ecdc4, 0.3);
fillLight.position.set(-5, 0, 5);
scene.add(fillLight);

const rimLight = new THREE.DirectionalLight(0xff6b6b, 0.2);
rimLight.position.set(0, -5, -5);
scene.add(rimLight);

// ============================================================================
// Morph Target Definitions
// ============================================================================

interface MorphTargetDef {
  name: string;
  displayName: string;
  category: 'expression' | 'phoneme' | 'modifier';
}

const MORPH_TARGETS: MorphTargetDef[] = [
  // Expressions
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
  
  // Phonemes
  { name: 'mouthOpen', displayName: 'Mouth Open', category: 'phoneme' },
  { name: 'mouthPucker', displayName: 'Mouth Pucker', category: 'phoneme' },
  { name: 'mouthWide', displayName: 'Mouth Wide', category: 'phoneme' },
  { name: 'jawOpen', displayName: 'Jaw Open', category: 'phoneme' },
  
  // Modifiers
  { name: 'cheekPuff', displayName: 'Cheek Puff', category: 'modifier' },
  { name: 'noseScrunch', displayName: 'Nose Scrunch', category: 'modifier' },
];

// Expression presets combining multiple morph targets
interface ExpressionPreset {
  name: string;
  emoji: string;
  weights: Record<string, number>;
}

const EXPRESSION_PRESETS: ExpressionPreset[] = [
  {
    name: 'Happy',
    emoji: '😊',
    weights: { smile: 1, eyeSquintL: 0.3, eyeSquintR: 0.3, cheekPuff: 0.2 }
  },
  {
    name: 'Sad',
    emoji: '😢',
    weights: { frown: 1, eyebrowFurrow: 0.5, mouthOpen: 0.2 }
  },
  {
    name: 'Angry',
    emoji: '😠',
    weights: { frown: 0.8, eyebrowFurrow: 1, eyeSquintL: 0.5, eyeSquintR: 0.5, noseScrunch: 0.6 }
  },
  {
    name: 'Surprised',
    emoji: '😲',
    weights: { eyebrowRaise: 1, eyeWideL: 1, eyeWideR: 1, mouthOpen: 0.8, jawOpen: 0.5 }
  },
  {
    name: 'Wink',
    emoji: '😉',
    weights: { smile: 0.7, eyeBlinkL: 1, eyebrowRaise: 0.3 }
  },
  {
    name: 'Kiss',
    emoji: '😘',
    weights: { mouthPucker: 1, eyeSquintL: 0.3, eyeSquintR: 0.3 }
  },
  {
    name: 'Thinking',
    emoji: '🤔',
    weights: { eyebrowRaise: 0.5, eyebrowFurrow: 0.3, mouthPucker: 0.3 }
  },
  {
    name: 'Neutral',
    emoji: '😐',
    weights: {}
  },
  {
    name: 'Sleepy',
    emoji: '😴',
    weights: { eyeBlinkL: 0.7, eyeBlinkR: 0.7, mouthOpen: 0.3, jawOpen: 0.2 }
  }
];

// Animation sequences
interface AnimationSequence {
  name: string;
  keyframes: Array<{ time: number; weights: Record<string, number> }>;
  loop: boolean;
  duration: number;
}

const ANIMATION_SEQUENCES: AnimationSequence[] = [
  {
    name: 'Blink',
    loop: true,
    duration: 3,
    keyframes: [
      { time: 0, weights: {} },
      { time: 0.9, weights: {} },
      { time: 1, weights: { eyeBlinkL: 1, eyeBlinkR: 1 } },
      { time: 1.1, weights: {} },
      { time: 3, weights: {} }
    ]
  },
  {
    name: 'Talk',
    loop: true,
    duration: 2,
    keyframes: [
      { time: 0, weights: { mouthOpen: 0.1 } },
      { time: 0.2, weights: { mouthOpen: 0.6, jawOpen: 0.3 } },
      { time: 0.4, weights: { mouthOpen: 0.2 } },
      { time: 0.6, weights: { mouthWide: 0.5, mouthOpen: 0.4 } },
      { time: 0.8, weights: { mouthPucker: 0.4 } },
      { time: 1.0, weights: { mouthOpen: 0.7, jawOpen: 0.4 } },
      { time: 1.2, weights: { mouthOpen: 0.1 } },
      { time: 1.5, weights: { mouthWide: 0.3, mouthOpen: 0.3 } },
      { time: 2, weights: { mouthOpen: 0.1 } }
    ]
  },
  {
    name: 'Emote',
    loop: true,
    duration: 8,
    keyframes: [
      { time: 0, weights: {} },
      { time: 1, weights: { smile: 1, eyeSquintL: 0.3, eyeSquintR: 0.3 } },
      { time: 3, weights: { eyebrowRaise: 1, eyeWideL: 0.8, eyeWideR: 0.8 } },
      { time: 5, weights: { frown: 0.6, eyebrowFurrow: 0.5 } },
      { time: 7, weights: { smile: 0.5 } },
      { time: 8, weights: {} }
    ]
  }
];

// ============================================================================
// Procedural Face Mesh with Morph Targets
// ============================================================================

function createFaceMesh(): THREE.Mesh {
  // Create a detailed sphere-based face geometry
  const baseGeometry = new THREE.SphereGeometry(1, 64, 48);
  const positionAttr = baseGeometry.getAttribute('position');
  const positions = positionAttr.array as Float32Array;
  const vertexCount = positionAttr.count;
  
  // Deform base sphere into face shape
  for (let i = 0; i < vertexCount; i++) {
    const x = positions[i * 3];
    const y = positions[i * 3 + 1];
    const z = positions[i * 3 + 2];
    
    // Flatten the back
    if (z < -0.3) {
      positions[i * 3 + 2] = z * 0.5;
    }
    
    // Slight chin narrowing
    if (y < -0.3) {
      const chinFactor = Math.max(0, (-y - 0.3) / 0.7);
      positions[i * 3] *= 1 - chinFactor * 0.3;
    }
    
    // Forehead shape
    if (y > 0.5) {
      positions[i * 3 + 2] *= 0.95;
    }
    
    // Eye socket depressions
    const eyeY = 0.15;
    const eyeSpacing = 0.35;
    const leftEyeDist = Math.sqrt((x + eyeSpacing) ** 2 + (y - eyeY) ** 2);
    const rightEyeDist = Math.sqrt((x - eyeSpacing) ** 2 + (y - eyeY) ** 2);
    const eyeRadius = 0.2;
    
    if (leftEyeDist < eyeRadius && z > 0.5) {
      const depth = (1 - leftEyeDist / eyeRadius) * 0.15;
      positions[i * 3 + 2] -= depth;
    }
    if (rightEyeDist < eyeRadius && z > 0.5) {
      const depth = (1 - rightEyeDist / eyeRadius) * 0.15;
      positions[i * 3 + 2] -= depth;
    }
    
    // Nose bump
    const noseDist = Math.sqrt(x ** 2 + (y + 0.1) ** 2);
    if (noseDist < 0.15 && z > 0.7) {
      positions[i * 3 + 2] += (1 - noseDist / 0.15) * 0.2;
    }
    
    // Mouth depression
    const mouthDist = Math.sqrt(x ** 2 + (y + 0.45) ** 2);
    if (mouthDist < 0.25 && z > 0.5) {
      positions[i * 3 + 2] -= (1 - mouthDist / 0.25) * 0.05;
    }
  }
  
  baseGeometry.computeVertexNormals();
  
  // Create morph target attributes
  const morphAttributes: Record<string, THREE.BufferAttribute> = {};
  
  for (const morphDef of MORPH_TARGETS) {
    const morphPositions = new Float32Array(vertexCount * 3);
    
    // Calculate deltas for each morph target
    for (let i = 0; i < vertexCount; i++) {
      const x = positions[i * 3];
      const y = positions[i * 3 + 1];
      const z = positions[i * 3 + 2];
      
      let dx = 0, dy = 0, dz = 0;
      
      switch (morphDef.name) {
        case 'smile': {
          // Raise mouth corners, compress cheeks
          const mouthCornerL = Math.sqrt((x + 0.35) ** 2 + (y + 0.4) ** 2);
          const mouthCornerR = Math.sqrt((x - 0.35) ** 2 + (y + 0.4) ** 2);
          if (mouthCornerL < 0.2 && z > 0.3) {
            const influence = 1 - mouthCornerL / 0.2;
            dy += influence * 0.1;
            dz += influence * 0.05;
          }
          if (mouthCornerR < 0.2 && z > 0.3) {
            const influence = 1 - mouthCornerR / 0.2;
            dy += influence * 0.1;
            dz += influence * 0.05;
          }
          // Cheek bulge
          const cheekL = Math.sqrt((x + 0.5) ** 2 + (y - 0) ** 2);
          const cheekR = Math.sqrt((x - 0.5) ** 2 + (y - 0) ** 2);
          if (cheekL < 0.3 && z > 0.3) {
            dz += (1 - cheekL / 0.3) * 0.08;
          }
          if (cheekR < 0.3 && z > 0.3) {
            dz += (1 - cheekR / 0.3) * 0.08;
          }
          break;
        }
        
        case 'frown': {
          // Lower mouth corners
          const mouthCornerL = Math.sqrt((x + 0.35) ** 2 + (y + 0.4) ** 2);
          const mouthCornerR = Math.sqrt((x - 0.35) ** 2 + (y + 0.4) ** 2);
          if (mouthCornerL < 0.2 && z > 0.3) {
            dy -= (1 - mouthCornerL / 0.2) * 0.08;
          }
          if (mouthCornerR < 0.2 && z > 0.3) {
            dy -= (1 - mouthCornerR / 0.2) * 0.08;
          }
          break;
        }
        
        case 'eyebrowRaise': {
          // Raise eyebrows
          if (y > 0.3 && y < 0.6 && Math.abs(x) > 0.15 && Math.abs(x) < 0.6 && z > 0.5) {
            const influence = Math.sin((y - 0.3) / 0.3 * Math.PI) * 0.5;
            dy += influence * 0.12;
            dz += influence * 0.03;
          }
          break;
        }
        
        case 'eyebrowFurrow': {
          // Lower and pinch eyebrows
          if (y > 0.25 && y < 0.5 && Math.abs(x) < 0.5 && z > 0.5) {
            const centerDist = Math.abs(x);
            dy -= (1 - centerDist / 0.5) * 0.08;
            dx -= Math.sign(x) * (1 - centerDist / 0.5) * 0.05;
          }
          break;
        }
        
        case 'eyeWideL': {
          // Widen left eye
          const eyeDist = Math.sqrt((x + 0.35) ** 2 + (y - 0.15) ** 2);
          if (eyeDist < 0.2 && z > 0.5) {
            const influence = 1 - eyeDist / 0.2;
            if (y > 0.15) {
              dy += influence * 0.06;
            } else {
              dy -= influence * 0.04;
            }
          }
          break;
        }
        
        case 'eyeWideR': {
          // Widen right eye
          const eyeDist = Math.sqrt((x - 0.35) ** 2 + (y - 0.15) ** 2);
          if (eyeDist < 0.2 && z > 0.5) {
            const influence = 1 - eyeDist / 0.2;
            if (y > 0.15) {
              dy += influence * 0.06;
            } else {
              dy -= influence * 0.04;
            }
          }
          break;
        }
        
        case 'eyeSquintL': {
          // Squint left eye
          const eyeDist = Math.sqrt((x + 0.35) ** 2 + (y - 0.15) ** 2);
          if (eyeDist < 0.2 && z > 0.5) {
            const influence = 1 - eyeDist / 0.2;
            if (y > 0.15) {
              dy -= influence * 0.04;
            } else {
              dy += influence * 0.03;
            }
          }
          break;
        }
        
        case 'eyeSquintR': {
          // Squint right eye
          const eyeDist = Math.sqrt((x - 0.35) ** 2 + (y - 0.15) ** 2);
          if (eyeDist < 0.2 && z > 0.5) {
            const influence = 1 - eyeDist / 0.2;
            if (y > 0.15) {
              dy -= influence * 0.04;
            } else {
              dy += influence * 0.03;
            }
          }
          break;
        }
        
        case 'eyeBlinkL': {
          // Close left eye
          const eyeDist = Math.sqrt((x + 0.35) ** 2 + (y - 0.15) ** 2);
          if (eyeDist < 0.18 && z > 0.5) {
            const influence = 1 - eyeDist / 0.18;
            if (y > 0.15) {
              dy -= influence * 0.08;
            } else {
              dy += influence * 0.06;
            }
          }
          break;
        }
        
        case 'eyeBlinkR': {
          // Close right eye
          const eyeDist = Math.sqrt((x - 0.35) ** 2 + (y - 0.15) ** 2);
          if (eyeDist < 0.18 && z > 0.5) {
            const influence = 1 - eyeDist / 0.18;
            if (y > 0.15) {
              dy -= influence * 0.08;
            } else {
              dy += influence * 0.06;
            }
          }
          break;
        }
        
        case 'mouthOpen': {
          // Open mouth (lips part)
          const mouthDist = Math.sqrt(x ** 2 + (y + 0.45) ** 2);
          if (mouthDist < 0.25 && z > 0.4) {
            const influence = 1 - mouthDist / 0.25;
            if (y < -0.45) {
              dy -= influence * 0.1;
            } else {
              dy += influence * 0.05;
            }
          }
          break;
        }
        
        case 'mouthPucker': {
          // Pucker lips (kiss shape)
          const mouthDist = Math.sqrt(x ** 2 + (y + 0.45) ** 2);
          if (mouthDist < 0.3 && z > 0.4) {
            const influence = 1 - mouthDist / 0.3;
            dx -= Math.sign(x) * influence * 0.08;
            dz += influence * 0.12;
          }
          break;
        }
        
        case 'mouthWide': {
          // Widen mouth
          const mouthDist = Math.sqrt(x ** 2 + (y + 0.45) ** 2);
          if (mouthDist < 0.3 && z > 0.4 && Math.abs(x) > 0.1) {
            const influence = 1 - mouthDist / 0.3;
            dx += Math.sign(x) * influence * 0.1;
          }
          break;
        }
        
        case 'jawOpen': {
          // Open jaw (lower face moves down)
          if (y < -0.2 && z > 0) {
            const influence = Math.min(1, (-y - 0.2) / 0.6);
            dy -= influence * 0.15;
            dz -= influence * 0.05;
          }
          break;
        }
        
        case 'cheekPuff': {
          // Puff cheeks
          const cheekL = Math.sqrt((x + 0.45) ** 2 + (y + 0.1) ** 2);
          const cheekR = Math.sqrt((x - 0.45) ** 2 + (y + 0.1) ** 2);
          if (cheekL < 0.25 && z > 0.3) {
            const influence = 1 - cheekL / 0.25;
            dz += influence * 0.15;
            dx -= influence * 0.05;
          }
          if (cheekR < 0.25 && z > 0.3) {
            const influence = 1 - cheekR / 0.25;
            dz += influence * 0.15;
            dx += influence * 0.05;
          }
          break;
        }
        
        case 'noseScrunch': {
          // Scrunch nose
          const noseDist = Math.sqrt(x ** 2 + y ** 2);
          if (noseDist < 0.3 && z > 0.6) {
            const influence = 1 - noseDist / 0.3;
            dy += influence * 0.05;
            dz -= influence * 0.03;
          }
          break;
        }
      }
      
      morphPositions[i * 3] = dx;
      morphPositions[i * 3 + 1] = dy;
      morphPositions[i * 3 + 2] = dz;
    }
    
    morphAttributes[morphDef.name] = new THREE.BufferAttribute(morphPositions, 3);
  }
  
  // Apply morph attributes
  baseGeometry.morphAttributes.position = Object.values(morphAttributes);
  
  // Create material with morph targets enabled
  const material = new THREE.MeshStandardMaterial({
    color: 0xffcc99,
    roughness: 0.6,
    metalness: 0.1,
    morphTargets: true
  });
  
  const mesh = new THREE.Mesh(baseGeometry, material);
  mesh.name = 'FaceWithMorphTargets';
  
  // Store morph target names for reference
  mesh.userData.morphTargetNames = MORPH_TARGETS.map(m => m.name);
  mesh.userData.morphTargetDefs = MORPH_TARGETS;
  
  // Initialize morph target influences
  mesh.morphTargetInfluences = new Array(MORPH_TARGETS.length).fill(0);
  
  // Create morph target dictionary
  mesh.morphTargetDictionary = {};
  MORPH_TARGETS.forEach((morphDef, index) => {
    mesh.morphTargetDictionary![morphDef.name] = index;
  });
  
  return mesh;
}

// ============================================================================
// Create Face Mesh
// ============================================================================

const faceMesh = createFaceMesh();
scene.add(faceMesh);

// Add reference axes
const axesHelper = new THREE.AxesHelper(0.5);
axesHelper.position.set(-2, -1.5, 0);
scene.add(axesHelper);

// ============================================================================
// Visualization State
// ============================================================================

type VizMode = 'normal' | 'delta' | 'heatmap' | 'wireframe';
let currentVizMode: VizMode = 'normal';

// Delta visualization mesh (shows morph target displacement)
const deltaGeometry = faceMesh.geometry.clone();
const deltaMaterial = new THREE.MeshBasicMaterial({
  color: 0x4ecdc4,
  wireframe: true,
  transparent: true,
  opacity: 0.5,
  visible: false
});
const deltaMesh = new THREE.Mesh(deltaGeometry, deltaMaterial);
deltaMesh.name = 'DeltaVisualization';
scene.add(deltaMesh);

// Heatmap material for influence visualization
const heatmapMaterial = new THREE.ShaderMaterial({
  uniforms: {
    morphInfluences: { value: new Float32Array(16) },
    baseColor: { value: new THREE.Color(0x333333) },
    hotColor: { value: new THREE.Color(0xff6b6b) }
  },
  vertexShader: `
    uniform float morphInfluences[16];
    varying float vInfluence;
    
    void main() {
      vInfluence = 0.0;
      vec3 transformed = position;
      
      #ifdef USE_MORPHTARGETS
        for (int i = 0; i < 16; i++) {
          if (morphInfluences[i] > 0.001) {
            vInfluence = max(vInfluence, morphInfluences[i]);
          }
        }
      #endif
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 baseColor;
    uniform vec3 hotColor;
    varying float vInfluence;
    
    void main() {
      vec3 color = mix(baseColor, hotColor, vInfluence);
      gl_FragColor = vec4(color, 1.0);
    }
  `,
  visible: false
});

// Store original material for mode switching
const originalMaterial = faceMesh.material as THREE.MeshStandardMaterial;

// ============================================================================
// Animation State
// ============================================================================

interface AnimationState {
  isPlaying: boolean;
  currentSequence: AnimationSequence | null;
  time: number;
  randomizing: boolean;
  randomTargets: Record<string, number>;
  randomTime: number;
}

const animState: AnimationState = {
  isPlaying: false,
  currentSequence: null,
  time: 0,
  randomizing: false,
  randomTargets: {},
  randomTime: 0
};

// ============================================================================
// UI Controls
// ============================================================================

// Create morph target sliders
const slidersContainer = document.getElementById('morph-sliders')!;
const sliders: Record<string, HTMLInputElement> = {};

MORPH_TARGETS.forEach((morphDef, index) => {
  const div = document.createElement('div');
  div.className = 'morph-slider';
  div.innerHTML = `
    <label>
      <span>${morphDef.displayName}</span>
      <span class="value" id="value-${morphDef.name}">0.00</span>
    </label>
    <input type="range" min="0" max="1" step="0.01" value="0" id="slider-${morphDef.name}">
  `;
  slidersContainer.appendChild(div);
  
  const slider = document.getElementById(`slider-${morphDef.name}`) as HTMLInputElement;
  sliders[morphDef.name] = slider;
  
  slider.addEventListener('input', () => {
    const value = parseFloat(slider.value);
    setMorphTarget(morphDef.name, value);
    updateSliderDisplay(morphDef.name, value);
  });
});

function setMorphTarget(name: string, value: number): void {
  const index = faceMesh.morphTargetDictionary![name];
  if (index !== undefined && faceMesh.morphTargetInfluences) {
    faceMesh.morphTargetInfluences[index] = value;
  }
}

function getMorphTarget(name: string): number {
  const index = faceMesh.morphTargetDictionary![name];
  if (index !== undefined && faceMesh.morphTargetInfluences) {
    return faceMesh.morphTargetInfluences[index];
  }
  return 0;
}

function updateSliderDisplay(name: string, value: number): void {
  const valueEl = document.getElementById(`value-${name}`);
  if (valueEl) {
    valueEl.textContent = value.toFixed(2);
  }
}

function updateAllSliders(): void {
  MORPH_TARGETS.forEach(morphDef => {
    const value = getMorphTarget(morphDef.name);
    sliders[morphDef.name].value = value.toString();
    updateSliderDisplay(morphDef.name, value);
  });
}

function resetAllMorphTargets(): void {
  MORPH_TARGETS.forEach(morphDef => {
    setMorphTarget(morphDef.name, 0);
  });
  updateAllSliders();
}

// Create preset buttons
const presetsContainer = document.getElementById('presets')!;
let activePresetBtn: HTMLElement | null = null;

EXPRESSION_PRESETS.forEach(preset => {
  const btn = document.createElement('button');
  btn.className = 'preset-btn';
  btn.textContent = `${preset.emoji} ${preset.name}`;
  btn.addEventListener('click', () => {
    applyPreset(preset);
    if (activePresetBtn) activePresetBtn.classList.remove('active');
    btn.classList.add('active');
    activePresetBtn = btn;
  });
  presetsContainer.appendChild(btn);
});

function applyPreset(preset: ExpressionPreset): void {
  // Reset all first
  MORPH_TARGETS.forEach(morphDef => {
    setMorphTarget(morphDef.name, 0);
  });
  
  // Apply preset weights
  Object.entries(preset.weights).forEach(([name, value]) => {
    setMorphTarget(name, value);
  });
  
  updateAllSliders();
}

// Create animation sequence buttons
const sequenceContainer = document.getElementById('sequence-controls')!;

ANIMATION_SEQUENCES.forEach(seq => {
  const btn = document.createElement('button');
  btn.textContent = seq.name;
  btn.addEventListener('click', () => {
    startSequence(seq);
    // Update UI
    sequenceContainer.querySelectorAll('button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
  sequenceContainer.appendChild(btn);
});

function startSequence(seq: AnimationSequence): void {
  animState.isPlaying = true;
  animState.currentSequence = seq;
  animState.time = 0;
  animState.randomizing = false;
  
  // Update play button
  document.getElementById('btn-play')!.classList.add('active');
  document.getElementById('btn-stop')!.classList.remove('active');
}

function stopAnimation(): void {
  animState.isPlaying = false;
  animState.currentSequence = null;
  animState.randomizing = false;
  
  // Update buttons
  document.getElementById('btn-play')!.classList.remove('active');
  document.getElementById('btn-stop')!.classList.add('active');
  sequenceContainer.querySelectorAll('button').forEach(b => b.classList.remove('active'));
}

// Animation control buttons
document.getElementById('btn-play')!.addEventListener('click', () => {
  if (!animState.currentSequence) {
    startSequence(ANIMATION_SEQUENCES[0]);
  } else {
    animState.isPlaying = true;
    document.getElementById('btn-play')!.classList.add('active');
    document.getElementById('btn-stop')!.classList.remove('active');
  }
});

document.getElementById('btn-stop')!.addEventListener('click', stopAnimation);

document.getElementById('btn-random')!.addEventListener('click', () => {
  animState.randomizing = true;
  animState.isPlaying = true;
  animState.currentSequence = null;
  animState.randomTime = 0;
  
  // Generate random targets
  animState.randomTargets = {};
  MORPH_TARGETS.forEach(morphDef => {
    animState.randomTargets[morphDef.name] = Math.random() * 0.8;
  });
  
  document.getElementById('btn-play')!.classList.add('active');
  document.getElementById('btn-stop')!.classList.remove('active');
  sequenceContainer.querySelectorAll('button').forEach(b => b.classList.remove('active'));
});

// Visualization mode buttons
const vizButtons = document.querySelectorAll('.viz-btn');
vizButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    vizButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentVizMode = (btn as HTMLElement).dataset.mode as VizMode;
    updateVisualization();
  });
});

function updateVisualization(): void {
  const material = faceMesh.material as THREE.MeshStandardMaterial;
  
  switch (currentVizMode) {
    case 'normal':
      faceMesh.material = originalMaterial;
      originalMaterial.wireframe = false;
      deltaMaterial.visible = false;
      break;
      
    case 'delta':
      faceMesh.material = originalMaterial;
      originalMaterial.wireframe = false;
      deltaMaterial.visible = true;
      // Update delta mesh to show displacement
      updateDeltaMesh();
      break;
      
    case 'heatmap':
      // Use vertex colors based on influence
      updateHeatmapVisualization();
      break;
      
    case 'wireframe':
      faceMesh.material = originalMaterial;
      originalMaterial.wireframe = true;
      deltaMaterial.visible = false;
      break;
  }
}

function updateDeltaMesh(): void {
  // Copy current morphed positions to delta mesh
  deltaMesh.morphTargetInfluences = faceMesh.morphTargetInfluences?.slice() || [];
  deltaMesh.position.copy(faceMesh.position);
  deltaMesh.rotation.copy(faceMesh.rotation);
  deltaMesh.scale.copy(faceMesh.scale);
}

function updateHeatmapVisualization(): void {
  // For heatmap, we'll use vertex colors based on total displacement
  const geometry = faceMesh.geometry;
  const basePositions = geometry.getAttribute('position').array as Float32Array;
  const morphAttrs = geometry.morphAttributes.position;
  const influences = faceMesh.morphTargetInfluences || [];
  
  const vertexCount = geometry.getAttribute('position').count;
  const colors = new Float32Array(vertexCount * 3);
  
  for (let i = 0; i < vertexCount; i++) {
    let totalDisplacement = 0;
    
    // Calculate total displacement for this vertex
    morphAttrs.forEach((attr, morphIndex) => {
      const influence = influences[morphIndex] || 0;
      if (influence > 0.001) {
        const dx = (attr.array as Float32Array)[i * 3] * influence;
        const dy = (attr.array as Float32Array)[i * 3 + 1] * influence;
        const dz = (attr.array as Float32Array)[i * 3 + 2] * influence;
        totalDisplacement += Math.sqrt(dx * dx + dy * dy + dz * dz);
      }
    });
    
    // Map displacement to color (blue -> cyan -> yellow -> red)
    const t = Math.min(1, totalDisplacement * 10);
    
    if (t < 0.33) {
      const s = t / 0.33;
      colors[i * 3] = 0.2;
      colors[i * 3 + 1] = 0.2 + s * 0.6;
      colors[i * 3 + 2] = 0.8 - s * 0.4;
    } else if (t < 0.66) {
      const s = (t - 0.33) / 0.33;
      colors[i * 3] = 0.2 + s * 0.8;
      colors[i * 3 + 1] = 0.8;
      colors[i * 3 + 2] = 0.4 - s * 0.4;
    } else {
      const s = (t - 0.66) / 0.34;
      colors[i * 3] = 1;
      colors[i * 3 + 1] = 0.8 - s * 0.4;
      colors[i * 3 + 2] = 0;
    }
  }
  
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  
  // Use material with vertex colors
  const heatmapMat = new THREE.MeshBasicMaterial({
    vertexColors: true,
    morphTargets: true
  });
  faceMesh.material = heatmapMat;
  deltaMaterial.visible = false;
}

// ============================================================================
// Analysis Display
// ============================================================================

function updateAnalysis(): void {
  const statsContainer = document.getElementById('analysis-stats')!;
  const influenceBars = document.getElementById('influence-bars')!;
  
  // Calculate stats
  const influences = faceMesh.morphTargetInfluences || [];
  const activeCount = influences.filter(i => i > 0.01).length;
  const totalInfluence = influences.reduce((sum, i) => sum + i, 0);
  const maxInfluence = Math.max(...influences);
  
  // Memory estimate: each morph target stores delta positions
  const vertexCount = faceMesh.geometry.getAttribute('position').count;
  const morphMemory = MORPH_TARGETS.length * vertexCount * 3 * 4; // 3 floats * 4 bytes
  
  statsContainer.innerHTML = `
    <div class="stat-row">
      <span class="label">Active Targets</span>
      <span class="value">${activeCount} / ${MORPH_TARGETS.length}</span>
    </div>
    <div class="stat-row">
      <span class="label">Total Influence</span>
      <span class="value">${totalInfluence.toFixed(2)}</span>
    </div>
    <div class="stat-row">
      <span class="label">Max Influence</span>
      <span class="value">${maxInfluence.toFixed(2)}</span>
    </div>
    <div class="stat-row">
      <span class="label">Morph Memory</span>
      <span class="value">${(morphMemory / 1024).toFixed(1)} KB</span>
    </div>
  `;
  
  // Update influence bars
  const activeInfluences = MORPH_TARGETS
    .map((def, index) => ({ name: def.displayName, value: influences[index] || 0 }))
    .filter(item => item.value > 0.01)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
  
  if (activeInfluences.length === 0) {
    influenceBars.innerHTML = '<div style="color: #666; font-size: 11px;">No active morphs</div>';
  } else {
    influenceBars.innerHTML = activeInfluences.map(item => `
      <div class="influence-bar">
        <div class="header">
          <span>${item.name}</span>
          <span>${(item.value * 100).toFixed(0)}%</span>
        </div>
        <div class="bar">
          <div class="fill" style="width: ${item.value * 100}%"></div>
        </div>
      </div>
    `).join('');
  }
  
  // Update info badge
  document.getElementById('morph-count')!.textContent = MORPH_TARGETS.length.toString();
  document.getElementById('vertex-count')!.textContent = vertexCount.toLocaleString();
  document.getElementById('memory-estimate')!.textContent = (morphMemory / 1024).toFixed(1);
}

// ============================================================================
// Animation Loop Helpers
// ============================================================================

function interpolateKeyframes(
  keyframes: AnimationSequence['keyframes'],
  time: number
): Record<string, number> {
  // Find surrounding keyframes
  let prevFrame = keyframes[0];
  let nextFrame = keyframes[keyframes.length - 1];
  
  for (let i = 0; i < keyframes.length - 1; i++) {
    if (time >= keyframes[i].time && time < keyframes[i + 1].time) {
      prevFrame = keyframes[i];
      nextFrame = keyframes[i + 1];
      break;
    }
  }
  
  // Interpolate
  const t = (time - prevFrame.time) / (nextFrame.time - prevFrame.time);
  const result: Record<string, number> = {};
  
  // Get all morph target names from both frames
  const allNames = new Set([
    ...Object.keys(prevFrame.weights),
    ...Object.keys(nextFrame.weights)
  ]);
  
  allNames.forEach(name => {
    const prevVal = prevFrame.weights[name] || 0;
    const nextVal = nextFrame.weights[name] || 0;
    result[name] = prevVal + (nextVal - prevVal) * t;
  });
  
  return result;
}

function updateAnimation(deltaTime: number): void {
  if (!animState.isPlaying) return;
  
  if (animState.randomizing) {
    // Random mode: smoothly interpolate to random targets
    animState.randomTime += deltaTime;
    
    MORPH_TARGETS.forEach(morphDef => {
      const current = getMorphTarget(morphDef.name);
      const target = animState.randomTargets[morphDef.name] || 0;
      const newVal = current + (target - current) * deltaTime * 2;
      setMorphTarget(morphDef.name, newVal);
    });
    
    // Generate new random targets periodically
    if (animState.randomTime > 2) {
      animState.randomTime = 0;
      MORPH_TARGETS.forEach(morphDef => {
        animState.randomTargets[morphDef.name] = Math.random() * 0.8;
      });
    }
    
    updateAllSliders();
    return;
  }
  
  if (!animState.currentSequence) return;
  
  const seq = animState.currentSequence;
  animState.time += deltaTime;
  
  // Loop or stop
  if (animState.time >= seq.duration) {
    if (seq.loop) {
      animState.time = animState.time % seq.duration;
    } else {
      stopAnimation();
      return;
    }
  }
  
  // Interpolate and apply
  const weights = interpolateKeyframes(seq.keyframes, animState.time);
  
  // Reset all, then apply interpolated weights
  MORPH_TARGETS.forEach(morphDef => {
    const value = weights[morphDef.name] || 0;
    setMorphTarget(morphDef.name, value);
  });
  
  updateAllSliders();
}

// ============================================================================
// 3Lens Integration
// ============================================================================

const probe = createProbe({ appName: 'Morph Target Analyzer' });
probe.observeScene(scene);
probe.observeRenderer(renderer);

// Register face mesh with metadata
probe.registerEntity(faceMesh, {
  name: 'Face Mesh',
  module: 'morph-targets',
  metadata: {
    morphTargetCount: MORPH_TARGETS.length,
    vertexCount: faceMesh.geometry.getAttribute('position').count
  },
  tags: ['morph', 'face', 'animated']
});

// Register delta visualization
probe.registerEntity(deltaMesh, {
  name: 'Delta Visualization',
  module: 'visualization',
  tags: ['helper', 'debug']
});

const overlay = createOverlay(probe, {
  defaultWidth: 400
});

// ============================================================================
// Animation Loop
// ============================================================================

const clock = new THREE.Clock();

function animate(): void {
  requestAnimationFrame(animate);
  
  const deltaTime = clock.getDelta();
  
  // Update animation
  updateAnimation(deltaTime);
  
  // Gentle face rotation
  if (!controls.enabled) {
    faceMesh.rotation.y = Math.sin(clock.getElapsedTime() * 0.3) * 0.2;
  }
  
  // Update visualization
  if (currentVizMode === 'delta') {
    updateDeltaMesh();
  } else if (currentVizMode === 'heatmap') {
    updateHeatmapVisualization();
  }
  
  // Update analysis display
  updateAnalysis();
  
  // Update controls
  controls.update();
  
  // Update 3Lens
  probe.capture();
  
  // Render
  renderer.render(scene, camera);
}

animate();

// ============================================================================
// Window Resize
// ============================================================================

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ============================================================================
// Keyboard Shortcuts
// ============================================================================

window.addEventListener('keydown', (e) => {
  // Number keys 1-9 for presets
  const num = parseInt(e.key);
  if (num >= 1 && num <= EXPRESSION_PRESETS.length) {
    applyPreset(EXPRESSION_PRESETS[num - 1]);
  }
  
  // R to reset
  if (e.key === 'r' || e.key === 'R') {
    resetAllMorphTargets();
    if (activePresetBtn) activePresetBtn.classList.remove('active');
    activePresetBtn = null;
  }
  
  // Space to toggle animation
  if (e.key === ' ') {
    e.preventDefault();
    if (animState.isPlaying) {
      stopAnimation();
    } else {
      startSequence(ANIMATION_SEQUENCES[0]);
    }
  }
});

console.log(`
🎭 Morph Target Analyzer

This example demonstrates morph target (blend shape) debugging with 3Lens.

Features:
- 16 facial morph targets (expressions, phonemes, modifiers)
- Interactive weight sliders for each shape key
- 9 expression presets with combined morphs
- 3 animation sequences (Blink, Talk, Emote)
- Random animation mode
- 4 visualization modes (Normal, Delta, Heatmap, Wireframe)
- Real-time influence analysis

Keyboard Shortcuts:
- 1-9: Quick expression presets
- R: Reset all morphs
- Space: Toggle animation

Press F12 to open browser DevTools and see 3Lens in action!
`);
