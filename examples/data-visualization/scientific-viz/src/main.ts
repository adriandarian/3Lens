/**
 * Scientific Visualization Example
 * 
 * Demonstrates scientific data visualization with 3Lens integration.
 * Use 3Lens overlay (~) to inspect molecular structures, volume data, and visualization parameters.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';
import '@3lens/themes/styles.css';

// ============================================================================
// TYPES & DATA
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

const ELEMENT_COLORS: Record<string, number> = {
  'H': 0xffffff,
  'C': 0x444444,
  'N': 0x3333ff,
  'O': 0xff3333,
};

const ELEMENT_RADII: Record<string, number> = {
  'H': 0.25,
  'C': 0.4,
  'N': 0.38,
  'O': 0.35,
};

// Caffeine molecule
const CAFFEINE: Molecule = {
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
    { element: 'C', position: new THREE.Vector3(-0.7, 3.6, 0), color: ELEMENT_COLORS['C'], radius: ELEMENT_RADII['C'] },
    { element: 'C', position: new THREE.Vector3(1.4, -2.4, 0), color: ELEMENT_COLORS['C'], radius: ELEMENT_RADII['C'] },
    { element: 'C', position: new THREE.Vector3(5.6, 0, 0), color: ELEMENT_COLORS['C'], radius: ELEMENT_RADII['C'] },
    { element: 'H', position: new THREE.Vector3(-0.5, -0.8, 0), color: ELEMENT_COLORS['H'], radius: ELEMENT_RADII['H'] },
    { element: 'H', position: new THREE.Vector3(2.1, 3.3, 0), color: ELEMENT_COLORS['H'], radius: ELEMENT_RADII['H'] },
    { element: 'H', position: new THREE.Vector3(4.2, -2.1, 0), color: ELEMENT_COLORS['H'], radius: ELEMENT_RADII['H'] },
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
};

// ============================================================================
// GLOBAL STATE
// ============================================================================

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: OrbitControls;
let probe: ReturnType<typeof createProbe>;

let vizGroup: THREE.Group;
let atomMeshes: THREE.Mesh[] = [];

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

  // Build molecular visualization
  buildMolecular();

  // Initialize 3Lens
  initProbe();

  // Event listeners
  window.addEventListener('resize', onWindowResize);

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
      visualization: 'Molecular Structure',
      molecule: CAFFEINE.name,
      formula: CAFFEINE.formula
    }
  });

  // Register molecule
  probe.registerLogicalEntity({
    id: 'molecule',
    name: CAFFEINE.name,
    type: 'molecule',
    object3D: vizGroup,
    metadata: {
      formula: CAFFEINE.formula,
      atomCount: CAFFEINE.atoms.length,
      bondCount: CAFFEINE.bonds.length
    }
  });
}

// ============================================================================
// MOLECULAR VISUALIZATION
// ============================================================================

function buildMolecular(): void {
  const molecule = CAFFEINE;

  // Create atoms
  molecule.atoms.forEach((atom, index) => {
    const geometry = new THREE.SphereGeometry(atom.radius, 32, 32);
    const material = new THREE.MeshPhongMaterial({
      color: atom.color,
      shininess: 80,
      specular: 0x444444,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(atom.position);
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
  molecule.bonds.forEach((bond, index) => {
    const atom1 = molecule.atoms[bond.atom1];
    const atom2 = molecule.atoms[bond.atom2];
    
    const start = atom1.position.clone();
    const end = atom2.position.clone();
    const direction = end.clone().sub(start);
    const length = direction.length();
    
    const bondRadius = bond.order === 2 ? 0.08 : bond.order === 3 ? 0.06 : 0.1;
    const geometry = new THREE.CylinderGeometry(bondRadius, bondRadius, length, 8);
    const material = new THREE.MeshPhongMaterial({ color: 0x888888 });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(start).add(direction.multiplyScalar(0.5));
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());
    mesh.userData = { type: 'bond', index, bond };
    vizGroup.add(mesh);

    // Double bonds
    if (bond.order >= 2) {
      const offset = new THREE.Vector3(0.15, 0, 0);
      offset.applyQuaternion(mesh.quaternion);
      
      const mesh2 = mesh.clone();
      mesh2.position.add(offset);
      vizGroup.add(mesh2);

      const mesh3 = mesh.clone();
      mesh3.position.sub(offset.multiplyScalar(2));
      vizGroup.add(mesh3);
    }
  });

  // Center the molecule
  const box = new THREE.Box3().setFromObject(vizGroup);
  const center = box.getCenter(new THREE.Vector3());
  vizGroup.position.sub(center);
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

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

  // Auto rotation
  vizGroup.rotation.y += 0.005;

  controls.update();
  renderer.render(scene, camera);
}

// ============================================================================
// START
// ============================================================================

init();
