/**
 * Scientific Visualization Example
 * 
 * Demonstrates scientific data visualization with 3Lens integration:
 * - Molecular structure rendering (ball-and-stick)
 * - Volume rendering with transfer functions
 * - Vector field visualization
 * - Isosurface extraction
 * - Particle system simulation
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';
import '@3lens/themes/styles.css';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface Atom {
  element: string;
  position: THREE.Vector3;
  color: number;
  radius: number;
}

interface Bond {
  atom1: number;
  atom2: number;
  order: number;
}

interface Molecule {
  name: string;
  formula: string;
  atoms: Atom[];
  bonds: Bond[];
}

type VizMode = 'molecular' | 'volumetric' | 'vector' | 'isosurface' | 'particles';
type ColorMap = 'viridis' | 'plasma' | 'coolwarm' | 'rainbow';

// ============================================================================
// ELEMENT DATA
// ============================================================================

const ELEMENT_COLORS: Record<string, number> = {
  'H': 0xffffff,  // White
  'C': 0x444444,  // Dark gray
  'N': 0x3333ff,  // Blue
  'O': 0xff3333,  // Red
  'S': 0xffff33,  // Yellow
  'P': 0xff8800,  // Orange
  'F': 0x00ff00,  // Green
  'Cl': 0x00ff00, // Green
  'Br': 0x882200, // Brown
  'I': 0x660066,  // Purple
};

const ELEMENT_RADII: Record<string, number> = {
  'H': 0.25,
  'C': 0.4,
  'N': 0.38,
  'O': 0.35,
  'S': 0.5,
  'P': 0.45,
  'F': 0.3,
  'Cl': 0.45,
  'Br': 0.5,
  'I': 0.55,
};

// ============================================================================
// MOLECULAR DATA
// ============================================================================

const MOLECULES: Record<string, Molecule> = {
  caffeine: {
    name: 'Caffeine',
    formula: 'C₈H₁₀N₄O₂',
    atoms: [
      { element: 'C', position: new THREE.Vector3(0, 0, 0), color: ELEMENT_COLORS['C'], radius: ELEMENT_RADII['C'] },
      { element: 'C', position: new THREE.Vector3(1.4, 0, 0), color: ELEMENT_COLORS['C'], radius: ELEMENT_RADII['C'] },
      { element: 'N', position: new THREE.Vector3(2.1, 1.2, 0), color: ELEMENT_COLORS['N'], radius: ELEMENT_RADII['N'] },
      { element: 'C', position: new THREE.Vector3(1.4, 2.4, 0), color: ELEMENT_COLORS['C'], radius: ELEMENT_RADII['C'] },
      { element: 'N', position: new THREE.Vector3(0, 2.4, 0), color: ELEMENT_COLORS['N'], radius: ELEMENT_RADII['N'] },
      { element: 'C', position: new THREE.Vector3(-0.7, 1.2, 0), color: ELEMENT_COLORS['C'], radius: ELEMENT_RADII['C'] },
      { element: 'O', position: new THREE.Vector3(-1.9, 1.2, 0), color: ELEMENT_COLORS['O'], radius: ELEMENT_RADII['O'] },
      { element: 'N', position: new THREE.Vector3(2.1, -1.2, 0), color: ELEMENT_COLORS['N'], radius: ELEMENT_RADII['N'] },
      { element: 'C', position: new THREE.Vector3(3.5, -1.2, 0), color: ELEMENT_COLORS['C'], radius: ELEMENT_RADII['C'] },
      { element: 'N', position: new THREE.Vector3(4.2, 0, 0), color: ELEMENT_COLORS['N'], radius: ELEMENT_RADII['N'] },
      { element: 'C', position: new THREE.Vector3(3.5, 1.2, 0), color: ELEMENT_COLORS['C'], radius: ELEMENT_RADII['C'] },
      { element: 'O', position: new THREE.Vector3(4.2, 2.4, 0), color: ELEMENT_COLORS['O'], radius: ELEMENT_RADII['O'] },
      // Methyl groups (H atoms simplified)
      { element: 'C', position: new THREE.Vector3(-0.7, 3.6, 0), color: ELEMENT_COLORS['C'], radius: ELEMENT_RADII['C'] },
      { element: 'C', position: new THREE.Vector3(1.4, -2.4, 0), color: ELEMENT_COLORS['C'], radius: ELEMENT_RADII['C'] },
      { element: 'C', position: new THREE.Vector3(5.6, 0, 0), color: ELEMENT_COLORS['C'], radius: ELEMENT_RADII['C'] },
      // Hydrogen atoms
      { element: 'H', position: new THREE.Vector3(-0.5, -0.8, 0), color: ELEMENT_COLORS['H'], radius: ELEMENT_RADII['H'] },
      { element: 'H', position: new THREE.Vector3(2.1, 3.3, 0), color: ELEMENT_COLORS['H'], radius: ELEMENT_RADII['H'] },
      { element: 'H', position: new THREE.Vector3(4.2, -2.1, 0), color: ELEMENT_COLORS['H'], radius: ELEMENT_RADII['H'] },
      { element: 'H', position: new THREE.Vector3(-1.5, 4.1, 0.5), color: ELEMENT_COLORS['H'], radius: ELEMENT_RADII['H'] },
      { element: 'H', position: new THREE.Vector3(-0.7, 4.1, -0.8), color: ELEMENT_COLORS['H'], radius: ELEMENT_RADII['H'] },
      { element: 'H', position: new THREE.Vector3(0.2, 4.1, 0.3), color: ELEMENT_COLORS['H'], radius: ELEMENT_RADII['H'] },
      { element: 'H', position: new THREE.Vector3(0.5, -2.9, 0.5), color: ELEMENT_COLORS['H'], radius: ELEMENT_RADII['H'] },
      { element: 'H', position: new THREE.Vector3(2.2, -3.1, 0), color: ELEMENT_COLORS['H'], radius: ELEMENT_RADII['H'] },
      { element: 'H', position: new THREE.Vector3(1.0, -2.9, -0.8), color: ELEMENT_COLORS['H'], radius: ELEMENT_RADII['H'] },
    ],
    bonds: [
      { atom1: 0, atom2: 1, order: 2 },
      { atom1: 1, atom2: 2, order: 1 },
      { atom1: 2, atom2: 3, order: 1 },
      { atom1: 3, atom2: 4, order: 2 },
      { atom1: 4, atom2: 5, order: 1 },
      { atom1: 5, atom2: 0, order: 1 },
      { atom1: 5, atom2: 6, order: 2 },
      { atom1: 1, atom2: 7, order: 1 },
      { atom1: 7, atom2: 8, order: 1 },
      { atom1: 8, atom2: 9, order: 2 },
      { atom1: 9, atom2: 10, order: 1 },
      { atom1: 10, atom2: 2, order: 1 },
      { atom1: 10, atom2: 11, order: 2 },
      { atom1: 4, atom2: 12, order: 1 },
      { atom1: 7, atom2: 13, order: 1 },
      { atom1: 9, atom2: 14, order: 1 },
    ]
  },
  water: {
    name: 'Water',
    formula: 'H₂O',
    atoms: [
      { element: 'O', position: new THREE.Vector3(0, 0, 0), color: ELEMENT_COLORS['O'], radius: ELEMENT_RADII['O'] },
      { element: 'H', position: new THREE.Vector3(0.76, 0.59, 0), color: ELEMENT_COLORS['H'], radius: ELEMENT_RADII['H'] },
      { element: 'H', position: new THREE.Vector3(-0.76, 0.59, 0), color: ELEMENT_COLORS['H'], radius: ELEMENT_RADII['H'] },
    ],
    bonds: [
      { atom1: 0, atom2: 1, order: 1 },
      { atom1: 0, atom2: 2, order: 1 },
    ]
  },
  ethanol: {
    name: 'Ethanol',
    formula: 'C₂H₆O',
    atoms: [
      { element: 'C', position: new THREE.Vector3(0, 0, 0), color: ELEMENT_COLORS['C'], radius: ELEMENT_RADII['C'] },
      { element: 'C', position: new THREE.Vector3(1.5, 0, 0), color: ELEMENT_COLORS['C'], radius: ELEMENT_RADII['C'] },
      { element: 'O', position: new THREE.Vector3(2.25, 1.1, 0), color: ELEMENT_COLORS['O'], radius: ELEMENT_RADII['O'] },
      { element: 'H', position: new THREE.Vector3(-0.5, 0.9, 0.3), color: ELEMENT_COLORS['H'], radius: ELEMENT_RADII['H'] },
      { element: 'H', position: new THREE.Vector3(-0.5, -0.5, 0.8), color: ELEMENT_COLORS['H'], radius: ELEMENT_RADII['H'] },
      { element: 'H', position: new THREE.Vector3(-0.5, -0.4, -0.9), color: ELEMENT_COLORS['H'], radius: ELEMENT_RADII['H'] },
      { element: 'H', position: new THREE.Vector3(2.0, -0.5, 0.8), color: ELEMENT_COLORS['H'], radius: ELEMENT_RADII['H'] },
      { element: 'H', position: new THREE.Vector3(2.0, -0.5, -0.8), color: ELEMENT_COLORS['H'], radius: ELEMENT_RADII['H'] },
      { element: 'H', position: new THREE.Vector3(3.1, 0.9, 0), color: ELEMENT_COLORS['H'], radius: ELEMENT_RADII['H'] },
    ],
    bonds: [
      { atom1: 0, atom2: 1, order: 1 },
      { atom1: 1, atom2: 2, order: 1 },
      { atom1: 0, atom2: 3, order: 1 },
      { atom1: 0, atom2: 4, order: 1 },
      { atom1: 0, atom2: 5, order: 1 },
      { atom1: 1, atom2: 6, order: 1 },
      { atom1: 1, atom2: 7, order: 1 },
      { atom1: 2, atom2: 8, order: 1 },
    ]
  },
  benzene: {
    name: 'Benzene',
    formula: 'C₆H₆',
    atoms: [
      // Carbon ring
      { element: 'C', position: new THREE.Vector3(1.4, 0, 0), color: ELEMENT_COLORS['C'], radius: ELEMENT_RADII['C'] },
      { element: 'C', position: new THREE.Vector3(0.7, 1.21, 0), color: ELEMENT_COLORS['C'], radius: ELEMENT_RADII['C'] },
      { element: 'C', position: new THREE.Vector3(-0.7, 1.21, 0), color: ELEMENT_COLORS['C'], radius: ELEMENT_RADII['C'] },
      { element: 'C', position: new THREE.Vector3(-1.4, 0, 0), color: ELEMENT_COLORS['C'], radius: ELEMENT_RADII['C'] },
      { element: 'C', position: new THREE.Vector3(-0.7, -1.21, 0), color: ELEMENT_COLORS['C'], radius: ELEMENT_RADII['C'] },
      { element: 'C', position: new THREE.Vector3(0.7, -1.21, 0), color: ELEMENT_COLORS['C'], radius: ELEMENT_RADII['C'] },
      // Hydrogens
      { element: 'H', position: new THREE.Vector3(2.5, 0, 0), color: ELEMENT_COLORS['H'], radius: ELEMENT_RADII['H'] },
      { element: 'H', position: new THREE.Vector3(1.25, 2.16, 0), color: ELEMENT_COLORS['H'], radius: ELEMENT_RADII['H'] },
      { element: 'H', position: new THREE.Vector3(-1.25, 2.16, 0), color: ELEMENT_COLORS['H'], radius: ELEMENT_RADII['H'] },
      { element: 'H', position: new THREE.Vector3(-2.5, 0, 0), color: ELEMENT_COLORS['H'], radius: ELEMENT_RADII['H'] },
      { element: 'H', position: new THREE.Vector3(-1.25, -2.16, 0), color: ELEMENT_COLORS['H'], radius: ELEMENT_RADII['H'] },
      { element: 'H', position: new THREE.Vector3(1.25, -2.16, 0), color: ELEMENT_COLORS['H'], radius: ELEMENT_RADII['H'] },
    ],
    bonds: [
      { atom1: 0, atom2: 1, order: 2 },
      { atom1: 1, atom2: 2, order: 1 },
      { atom1: 2, atom2: 3, order: 2 },
      { atom1: 3, atom2: 4, order: 1 },
      { atom1: 4, atom2: 5, order: 2 },
      { atom1: 5, atom2: 0, order: 1 },
      { atom1: 0, atom2: 6, order: 1 },
      { atom1: 1, atom2: 7, order: 1 },
      { atom1: 2, atom2: 8, order: 1 },
      { atom1: 3, atom2: 9, order: 1 },
      { atom1: 4, atom2: 10, order: 1 },
      { atom1: 5, atom2: 11, order: 1 },
    ]
  },
  dna: {
    name: 'DNA Helix Segment',
    formula: 'DNA',
    atoms: generateDNAHelix(),
    bonds: []  // Bonds generated dynamically
  }
};

function generateDNAHelix(): Atom[] {
  const atoms: Atom[] = [];
  const turns = 2;
  const pointsPerTurn = 20;
  const radius = 2;
  const height = 6;

  for (let i = 0; i < turns * pointsPerTurn; i++) {
    const t = i / pointsPerTurn;
    const angle = t * Math.PI * 2;
    const y = (i / (turns * pointsPerTurn)) * height - height / 2;

    // Strand 1
    atoms.push({
      element: i % 4 === 0 ? 'N' : i % 4 === 1 ? 'C' : i % 4 === 2 ? 'O' : 'P',
      position: new THREE.Vector3(
        Math.cos(angle) * radius,
        y,
        Math.sin(angle) * radius
      ),
      color: ELEMENT_COLORS[i % 4 === 0 ? 'N' : i % 4 === 1 ? 'C' : i % 4 === 2 ? 'O' : 'P'] || 0xff8800,
      radius: 0.3
    });

    // Strand 2 (offset by π)
    atoms.push({
      element: i % 4 === 0 ? 'C' : i % 4 === 1 ? 'N' : i % 4 === 2 ? 'P' : 'O',
      position: new THREE.Vector3(
        Math.cos(angle + Math.PI) * radius,
        y,
        Math.sin(angle + Math.PI) * radius
      ),
      color: ELEMENT_COLORS[i % 4 === 0 ? 'C' : i % 4 === 1 ? 'N' : i % 4 === 2 ? 'P' : 'O'] || 0xff8800,
      radius: 0.3
    });
  }

  return atoms;
}

// ============================================================================
// GLOBAL STATE
// ============================================================================

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: OrbitControls;
let probe: ReturnType<typeof createProbe>;

let currentViz: VizMode = 'molecular';
let currentMolecule: string = 'caffeine';
let currentColorMap: ColorMap = 'viridis';

let vizGroup: THREE.Group;
let atomMeshes: THREE.Mesh[] = [];
let bondMeshes: THREE.Mesh[] = [];
let axesHelper: THREE.AxesHelper;
let boundingBox: THREE.BoxHelper;

let autoRotate = true;
let showWireframe = false;
let showBonds = true;
let showLabels = false;
let showAxes = false;
let showBBox = false;
let showCrossSection = false;

let resolution = 50;
let isoValue = 0.5;
let opacity = 0.8;
let scale = 1.0;

let lastFrameTime = performance.now();
let frameCount = 0;
let fps = 60;

// ============================================================================
// COLOR MAPS
// ============================================================================

const COLOR_MAPS: Record<ColorMap, THREE.Color[]> = {
  viridis: [
    new THREE.Color(0x440154),
    new THREE.Color(0x31688e),
    new THREE.Color(0x35b779),
    new THREE.Color(0xfde725)
  ],
  plasma: [
    new THREE.Color(0x0d0887),
    new THREE.Color(0x7e03a8),
    new THREE.Color(0xcc4778),
    new THREE.Color(0xf89540),
    new THREE.Color(0xf0f921)
  ],
  coolwarm: [
    new THREE.Color(0x3b4cc0),
    new THREE.Color(0xb1b5d8),
    new THREE.Color(0xf7f7f7),
    new THREE.Color(0xe8c0b0),
    new THREE.Color(0xb40426)
  ],
  rainbow: [
    new THREE.Color(0xff0000),
    new THREE.Color(0xff8800),
    new THREE.Color(0xffff00),
    new THREE.Color(0x00ff00),
    new THREE.Color(0x0000ff),
    new THREE.Color(0x4b0082),
    new THREE.Color(0x9400d3)
  ]
};

function sampleColorMap(t: number, colorMap: ColorMap): THREE.Color {
  const colors = COLOR_MAPS[colorMap];
  const scaledT = t * (colors.length - 1);
  const index = Math.floor(scaledT);
  const frac = scaledT - index;
  
  if (index >= colors.length - 1) return colors[colors.length - 1].clone();
  
  return colors[index].clone().lerp(colors[index + 1], frac);
}

// ============================================================================
// INITIALIZATION
// ============================================================================

function init(): void {
  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050510);

  // Camera
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(8, 6, 8);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  document.getElementById('app')!.appendChild(renderer.domElement);

  // Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 3;
  controls.maxDistance = 50;

  // Lighting
  setupLighting();

  // Visualization group
  vizGroup = new THREE.Group();
  scene.add(vizGroup);

  // Helpers
  axesHelper = new THREE.AxesHelper(5);
  axesHelper.visible = showAxes;
  scene.add(axesHelper);

  // Initialize 3Lens
  initProbe();

  // Build initial visualization
  buildVisualization();

  // Setup UI
  setupUI();

  // Event listeners
  window.addEventListener('resize', onWindowResize);
  renderer.domElement.addEventListener('click', onVizClick);
  renderer.domElement.addEventListener('mousemove', onVizHover);

  // Start animation
  animate();
}

function setupLighting(): void {
  const ambient = new THREE.AmbientLight(0x404060, 0.6);
  scene.add(ambient);

  const keyLight = new THREE.DirectionalLight(0xffffff, 1);
  keyLight.position.set(10, 10, 10);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x8888ff, 0.4);
  fillLight.position.set(-10, 5, -10);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xff88ff, 0.3);
  rimLight.position.set(0, -10, 0);
  scene.add(rimLight);
}

function initProbe(): void {
  probe = createProbe({ appName: 'Scientific-Viz' });
  createOverlay({ probe, theme: 'dark' });

  probe.registerLogicalEntity({
    id: 'viz-scene',
    name: 'Scientific Visualization',
    type: 'scene',
    object3D: scene,
    metadata: {
      vizMode: currentViz,
      dataset: currentMolecule,
      colorMap: currentColorMap
    }
  });
}

// ============================================================================
// VISUALIZATION BUILDERS
// ============================================================================

function buildVisualization(): void {
  clearVisualization();

  switch (currentViz) {
    case 'molecular':
      buildMolecular();
      break;
    case 'volumetric':
      buildVolumetric();
      break;
    case 'vector':
      buildVectorField();
      break;
    case 'isosurface':
      buildIsosurface();
      break;
    case 'particles':
      buildParticleSystem();
      break;
  }

  // Update bounding box
  if (boundingBox) scene.remove(boundingBox);
  boundingBox = new THREE.BoxHelper(vizGroup, 0x888888);
  boundingBox.visible = showBBox;
  scene.add(boundingBox);

  updateDataPanel();
  updateStats();
}

function clearVisualization(): void {
  while (vizGroup.children.length > 0) {
    const child = vizGroup.children[0];
    vizGroup.remove(child);
    if (child instanceof THREE.Mesh) {
      child.geometry.dispose();
      if (Array.isArray(child.material)) {
        child.material.forEach(m => m.dispose());
      } else {
        child.material.dispose();
      }
    }
  }
  atomMeshes = [];
  bondMeshes = [];
}

function buildMolecular(): void {
  const molecule = MOLECULES[currentMolecule];
  if (!molecule) return;

  // Create atoms
  molecule.atoms.forEach((atom, index) => {
    const geometry = new THREE.SphereGeometry(atom.radius * scale, 32, 32);
    const material = new THREE.MeshPhongMaterial({
      color: atom.color,
      shininess: 80,
      specular: 0x444444,
      wireframe: showWireframe
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(atom.position).multiplyScalar(scale);
    mesh.userData = { type: 'atom', index, element: atom.element, atom };
    vizGroup.add(mesh);
    atomMeshes.push(mesh);

    // Register each atom
    probe.registerLogicalEntity({
      id: `atom-${index}`,
      name: `${atom.element} Atom ${index}`,
      type: 'atom',
      object3D: mesh,
      metadata: {
        element: atom.element,
        position: `(${atom.position.x.toFixed(2)}, ${atom.position.y.toFixed(2)}, ${atom.position.z.toFixed(2)})`,
        radius: atom.radius
      }
    });
  });

  // Create bonds
  if (showBonds) {
    molecule.bonds.forEach((bond, index) => {
      const atom1 = molecule.atoms[bond.atom1];
      const atom2 = molecule.atoms[bond.atom2];
      
      const start = atom1.position.clone().multiplyScalar(scale);
      const end = atom2.position.clone().multiplyScalar(scale);
      const direction = end.clone().sub(start);
      const length = direction.length();
      
      const bondRadius = bond.order === 2 ? 0.08 : bond.order === 3 ? 0.06 : 0.1;
      const geometry = new THREE.CylinderGeometry(bondRadius * scale, bondRadius * scale, length, 8);
      const material = new THREE.MeshPhongMaterial({
        color: 0x888888,
        wireframe: showWireframe
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(start).add(direction.multiplyScalar(0.5));
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());
      mesh.userData = { type: 'bond', index, bond };
      vizGroup.add(mesh);
      bondMeshes.push(mesh);

      // Double/triple bonds
      if (bond.order >= 2) {
        const offset = new THREE.Vector3(0.15 * scale, 0, 0);
        offset.applyQuaternion(mesh.quaternion);
        
        const mesh2 = mesh.clone();
        mesh2.position.add(offset);
        vizGroup.add(mesh2);
        bondMeshes.push(mesh2);

        const mesh3 = mesh.clone();
        mesh3.position.sub(offset.multiplyScalar(2));
        vizGroup.add(mesh3);
        bondMeshes.push(mesh3);
      }
    });
  }

  // Register molecule
  probe.registerLogicalEntity({
    id: 'molecule',
    name: molecule.name,
    type: 'molecule',
    object3D: vizGroup,
    metadata: {
      formula: molecule.formula,
      atomCount: molecule.atoms.length,
      bondCount: molecule.bonds.length
    }
  });
}

function buildVolumetric(): void {
  const size = resolution;
  const data = new Float32Array(size * size * size);

  // Generate volumetric data (3D scalar field)
  for (let z = 0; z < size; z++) {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const nx = (x / size - 0.5) * 4;
        const ny = (y / size - 0.5) * 4;
        const nz = (z / size - 0.5) * 4;
        
        // Example: Gaussian blob
        const value = Math.exp(-(nx * nx + ny * ny + nz * nz));
        data[x + y * size + z * size * size] = value;
      }
    }
  }

  // Create volume slices
  const sliceCount = 32;
  for (let i = 0; i < sliceCount; i++) {
    const t = i / (sliceCount - 1);
    const z = (t - 0.5) * 4 * scale;

    const geometry = new THREE.PlaneGeometry(4 * scale, 4 * scale, size - 1, size - 1);
    const positions = geometry.attributes.position;
    const colors: number[] = [];

    for (let j = 0; j < positions.count; j++) {
      const x = positions.getX(j);
      const y = positions.getY(j);
      
      // Sample data
      const dx = (x / (4 * scale) + 0.5) * size;
      const dy = (y / (4 * scale) + 0.5) * size;
      const dz = t * size;
      
      const ix = Math.floor(Math.min(Math.max(dx, 0), size - 1));
      const iy = Math.floor(Math.min(Math.max(dy, 0), size - 1));
      const iz = Math.floor(Math.min(Math.max(dz, 0), size - 1));
      
      const value = data[ix + iy * size + iz * size * size];
      const color = sampleColorMap(value, currentColorMap);
      colors.push(color.r, color.g, color.b);
    }

    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.MeshBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: opacity * 0.3,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.z = z;
    mesh.userData = { type: 'volume-slice', index: i };
    vizGroup.add(mesh);
  }

  document.getElementById('equation')!.textContent = 'f(x,y,z) = exp(-(x² + y² + z²))';
}

function buildVectorField(): void {
  const gridSize = Math.floor(resolution / 5);
  const spacing = 4 / gridSize * scale;

  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      for (let z = 0; z < gridSize; z++) {
        const px = (x - gridSize / 2 + 0.5) * spacing;
        const py = (y - gridSize / 2 + 0.5) * spacing;
        const pz = (z - gridSize / 2 + 0.5) * spacing;

        // Vector field function (curl of potential)
        const vx = -py;
        const vy = px;
        const vz = Math.sin(px) * 0.5;

        const magnitude = Math.sqrt(vx * vx + vy * vy + vz * vz);
        if (magnitude < 0.1) continue;

        // Arrow
        const arrowLength = Math.min(magnitude, spacing * 0.8);
        const geometry = new THREE.ConeGeometry(0.08 * scale, arrowLength, 8);
        geometry.translate(0, arrowLength / 2, 0);

        const color = sampleColorMap(magnitude / 3, currentColorMap);
        const material = new THREE.MeshPhongMaterial({
          color: color,
          transparent: true,
          opacity: opacity
        });

        const arrow = new THREE.Mesh(geometry, material);
        arrow.position.set(px, py, pz);
        
        // Orient arrow
        const direction = new THREE.Vector3(vx, vy, vz).normalize();
        arrow.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
        
        arrow.userData = { 
          type: 'vector', 
          position: { x: px, y: py, z: pz },
          vector: { x: vx, y: vy, z: vz },
          magnitude 
        };
        vizGroup.add(arrow);
      }
    }
  }

  document.getElementById('equation')!.textContent = 'V(x,y,z) = (-y, x, sin(x)/2)';

  probe.registerLogicalEntity({
    id: 'vector-field',
    name: 'Vector Field',
    type: 'field',
    object3D: vizGroup,
    metadata: {
      gridSize: `${gridSize}³`,
      vectorCount: vizGroup.children.length,
      equation: 'V = (-y, x, sin(x)/2)'
    }
  });
}

function buildIsosurface(): void {
  // Marching cubes-like isosurface (simplified)
  const gridSize = resolution;
  const step = 4 / gridSize * scale;

  // Sample scalar field
  const field = (x: number, y: number, z: number): number => {
    // Metaballs
    const d1 = Math.sqrt(x * x + y * y + z * z);
    const d2 = Math.sqrt((x - 1) * (x - 1) + y * y + z * z);
    const d3 = Math.sqrt(x * x + (y - 1) * (y - 1) + z * z);
    return 1 / (d1 + 0.1) + 0.5 / (d2 + 0.1) + 0.5 / (d3 + 0.1);
  };

  // Create surface using sphere approximation
  const geometry = new THREE.SphereGeometry(1.5 * scale, 64, 64);
  const positions = geometry.attributes.position;

  // Deform sphere based on field
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);
    
    const normal = new THREE.Vector3(x, y, z).normalize();
    const value = field(x, y, z);
    const targetValue = isoValue * 3;
    
    // Adjust radius based on field value
    const factor = Math.min(Math.max(value / targetValue, 0.5), 2);
    positions.setXYZ(i, x * factor, y * factor, z * factor);
  }

  geometry.computeVertexNormals();

  // Add vertex colors
  const colors: number[] = [];
  for (let i = 0; i < positions.count; i++) {
    const y = positions.getY(i);
    const t = (y / (3 * scale) + 0.5);
    const color = sampleColorMap(t, currentColorMap);
    colors.push(color.r, color.g, color.b);
  }
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  const material = new THREE.MeshPhongMaterial({
    vertexColors: true,
    shininess: 100,
    specular: 0x444444,
    transparent: true,
    opacity: opacity,
    wireframe: showWireframe,
    side: THREE.DoubleSide
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.userData = { type: 'isosurface' };
  vizGroup.add(mesh);

  document.getElementById('equation')!.textContent = `f = Σ(1/d_i), iso = ${isoValue.toFixed(2)}`;

  probe.registerLogicalEntity({
    id: 'isosurface',
    name: 'Isosurface',
    type: 'surface',
    object3D: mesh,
    metadata: {
      isoValue: isoValue.toFixed(2),
      vertices: positions.count,
      equation: 'Σ(1/d_i) metaballs'
    }
  });
}

function buildParticleSystem(): void {
  const particleCount = resolution * 100;
  const positions: number[] = [];
  const colors: number[] = [];
  const sizes: number[] = [];
  const velocities: THREE.Vector3[] = [];

  for (let i = 0; i < particleCount; i++) {
    // Initial position (spherical distribution)
    const r = Math.random() * 2 * scale;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);

    positions.push(x, y, z);

    // Color based on position
    const t = r / (2 * scale);
    const color = sampleColorMap(t, currentColorMap);
    colors.push(color.r, color.g, color.b);

    sizes.push(0.05 + Math.random() * 0.1);

    // Velocity for animation
    velocities.push(new THREE.Vector3(
      (Math.random() - 0.5) * 0.02,
      (Math.random() - 0.5) * 0.02,
      (Math.random() - 0.5) * 0.02
    ));
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

  const material = new THREE.ShaderMaterial({
    vertexShader: `
      attribute float size;
      attribute vec3 color;
      varying vec3 vColor;
      void main() {
        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * 300.0 / -mvPosition.z;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      void main() {
        float dist = length(gl_PointCoord - vec2(0.5));
        if (dist > 0.5) discard;
        float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
        gl_FragColor = vec4(vColor, alpha * ${opacity.toFixed(2)});
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  const particles = new THREE.Points(geometry, material);
  particles.userData = { type: 'particles', velocities };
  vizGroup.add(particles);

  document.getElementById('equation')!.textContent = `N = ${particleCount} particles`;

  probe.registerLogicalEntity({
    id: 'particle-system',
    name: 'Particle System',
    type: 'particles',
    object3D: particles,
    metadata: {
      particleCount,
      distribution: 'Spherical',
      blending: 'Additive'
    }
  });
}

// ============================================================================
// UI SETUP
// ============================================================================

function setupUI(): void {
  // Visualization mode buttons
  document.querySelectorAll('.viz-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.viz-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentViz = btn.getAttribute('data-viz') as VizMode;
      document.getElementById('viz-name')!.textContent = btn.textContent || '';
      buildVisualization();
    });
  });

  // Dataset selector
  const datasetSelect = document.getElementById('dataset-select') as HTMLSelectElement;
  datasetSelect.addEventListener('change', () => {
    currentMolecule = datasetSelect.value;
    document.getElementById('dataset-name')!.textContent = 
      MOLECULES[currentMolecule]?.name || currentMolecule;
    if (currentViz === 'molecular') {
      buildVisualization();
    }
  });

  // Color map selector
  document.querySelectorAll('.colormap-option').forEach(option => {
    option.addEventListener('click', () => {
      document.querySelectorAll('.colormap-option').forEach(o => o.classList.remove('active'));
      option.classList.add('active');
      currentColorMap = option.getAttribute('data-colormap') as ColorMap;
      updateLegendGradient();
      if (currentViz !== 'molecular') {
        buildVisualization();
      }
    });
  });

  // Sliders
  setupSlider('resolution', (v) => { resolution = v; buildVisualization(); }, v => v.toString());
  setupSlider('iso', (v) => { isoValue = v / 100; buildVisualization(); }, v => (v / 100).toFixed(2));
  setupSlider('opacity', (v) => { opacity = v / 100; buildVisualization(); }, v => (v / 100).toFixed(2));
  setupSlider('scale', (v) => { scale = v / 100; buildVisualization(); }, v => (v / 100).toFixed(1));

  // Control buttons
  setupToggleButton('rotate-btn', () => autoRotate, v => autoRotate = v);
  setupToggleButton('wireframe-btn', () => showWireframe, v => { showWireframe = v; buildVisualization(); });
  setupToggleButton('bonds-btn', () => showBonds, v => { showBonds = v; buildVisualization(); });
  setupToggleButton('labels-btn', () => showLabels, v => showLabels = v);
  setupToggleButton('axes-btn', () => showAxes, v => { showAxes = v; axesHelper.visible = v; });
  setupToggleButton('bbox-btn', () => showBBox, v => { showBBox = v; if (boundingBox) boundingBox.visible = v; });
  setupToggleButton('slice-btn', () => showCrossSection, v => { showCrossSection = v; updateCrossSection(); });
}

function setupSlider(id: string, onChange: (v: number) => void, format: (v: number) => string): void {
  const slider = document.getElementById(`${id}-slider`) as HTMLInputElement;
  const valueDisplay = document.getElementById(`${id}-value`)!;
  
  slider.addEventListener('input', () => {
    const value = parseInt(slider.value);
    valueDisplay.textContent = format(value);
    onChange(value);
  });
}

function setupToggleButton(id: string, getter: () => boolean, setter: (v: boolean) => void): void {
  const btn = document.getElementById(id)!;
  btn.addEventListener('click', () => {
    const newValue = !getter();
    setter(newValue);
    btn.classList.toggle('active', newValue);
  });
}

function updateLegendGradient(): void {
  const colors = COLOR_MAPS[currentColorMap];
  const gradient = colors.map((c, i) => `#${c.getHexString()}`).join(', ');
  document.getElementById('legend-gradient')!.style.background = `linear-gradient(90deg, ${gradient})`;
}

function updateCrossSection(): void {
  vizGroup.children.forEach(child => {
    if (child instanceof THREE.Mesh) {
      const material = child.material as THREE.MeshPhongMaterial;
      if (showCrossSection) {
        material.clippingPlanes = [new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)];
      } else {
        material.clippingPlanes = [];
      }
    }
  });
  renderer.localClippingEnabled = showCrossSection;
}

function updateDataPanel(): void {
  const molecule = MOLECULES[currentMolecule];
  
  document.getElementById('dataset-name')!.textContent = molecule?.name || currentMolecule;
  document.getElementById('atom-count')!.textContent = molecule?.atoms.length.toString() || '-';
  document.getElementById('bond-count')!.textContent = molecule?.bonds.length.toString() || '-';
  document.getElementById('formula')!.textContent = molecule?.formula || '-';
}

function updateStats(): void {
  let vertexCount = 0;
  let triCount = 0;

  vizGroup.traverse(obj => {
    if (obj instanceof THREE.Mesh || obj instanceof THREE.Points) {
      const geom = obj.geometry;
      vertexCount += geom.attributes.position?.count || 0;
      if (geom.index) {
        triCount += geom.index.count / 3;
      } else if (geom.attributes.position) {
        triCount += geom.attributes.position.count / 3;
      }
    }
  });

  document.getElementById('vertex-count')!.textContent = vertexCount.toLocaleString();
  document.getElementById('tri-count')!.textContent = Math.floor(triCount).toLocaleString();
  document.getElementById('draw-calls')!.textContent = renderer.info.render.calls.toString();
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

function onWindowResize(): void {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onVizClick(event: MouseEvent): void {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(atomMeshes);

  if (intersects.length > 0) {
    const mesh = intersects[0].object as THREE.Mesh;
    if (mesh.userData.atom) {
      const atom = mesh.userData.atom as Atom;
      console.log('Selected atom:', atom.element, 'at', atom.position);
      probe.captureFrame();
    }
  }
}

function onVizHover(event: MouseEvent): void {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(atomMeshes);

  const tooltip = document.getElementById('tooltip')!;

  if (intersects.length > 0) {
    const mesh = intersects[0].object as THREE.Mesh;
    if (mesh.userData.atom) {
      const atom = mesh.userData.atom as Atom;
      
      document.getElementById('tooltip-title')!.textContent = `${atom.element} Atom`;
      document.getElementById('tooltip-content')!.innerHTML = 
        `Element: ${atom.element}<br>` +
        `Radius: ${atom.radius.toFixed(2)} Å<br>` +
        `Position: (${atom.position.x.toFixed(2)}, ${atom.position.y.toFixed(2)}, ${atom.position.z.toFixed(2)})`;

      tooltip.style.left = `${event.clientX + 15}px`;
      tooltip.style.top = `${event.clientY + 15}px`;
      tooltip.classList.add('visible');
      return;
    }
  }

  tooltip.classList.remove('visible');
}

// ============================================================================
// ANIMATION LOOP
// ============================================================================

function animate(): void {
  requestAnimationFrame(animate);

  const time = performance.now() * 0.001;

  // Auto rotation
  if (autoRotate) {
    vizGroup.rotation.y += 0.005;
  }

  // Animate particles
  if (currentViz === 'particles') {
    const particles = vizGroup.children.find(c => c.userData.type === 'particles') as THREE.Points;
    if (particles) {
      const positions = particles.geometry.attributes.position;
      const velocities = particles.userData.velocities as THREE.Vector3[];

      for (let i = 0; i < positions.count; i++) {
        let x = positions.getX(i) + velocities[i].x;
        let y = positions.getY(i) + velocities[i].y;
        let z = positions.getZ(i) + velocities[i].z;

        // Boundary bounce
        const r = Math.sqrt(x * x + y * y + z * z);
        if (r > 2.5 * scale) {
          velocities[i].multiplyScalar(-1);
        }

        positions.setXYZ(i, x, y, z);
      }
      positions.needsUpdate = true;
    }
  }

  // FPS counter
  frameCount++;
  if (time - lastFrameTime >= 1) {
    fps = frameCount;
    frameCount = 0;
    lastFrameTime = time;
    document.getElementById('fps')!.textContent = fps.toString();
  }

  controls.update();
  renderer.render(scene, camera);
  updateStats();
}

// ============================================================================
// START
// ============================================================================

init();
