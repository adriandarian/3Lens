/**
 * Skinned Mesh Inspector Example
 * 
 * Demonstrates skeletal animation debugging with 3Lens integration:
 * - Skeleton visualization
 * - Bone hierarchy inspection
 * - Weight painting visualization
 * - Animation playback controls
 * - Bind pose comparison
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';

// ============================================================================
// TYPES
// ============================================================================

type VisualizationMode = 'skeleton' | 'weights' | 'bindpose' | 'axes';

interface BoneInfo {
  name: string;
  index: number;
  bone: THREE.Bone;
  children: BoneInfo[];
}

interface AnimationConfig {
  name: string;
  duration: number;
  action: THREE.AnimationAction | null;
}

// ============================================================================
// GLOBAL STATE
// ============================================================================

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: OrbitControls;
let probe: ReturnType<typeof createProbe>;

// Skinned mesh
let skinnedMesh: THREE.SkinnedMesh;
let skeleton: THREE.Skeleton;
let skeletonHelper: THREE.SkeletonHelper;
let bindPoseHelper: THREE.SkeletonHelper | null = null;

// Animation
let mixer: THREE.AnimationMixer;
let animations: AnimationConfig[] = [];
let currentAnimation = 0;
let isPlaying = true;
let playbackSpeed = 1.0;
let loopEnabled = true;
let clock: THREE.Clock;

// Visualization
let vizMode: VisualizationMode = 'skeleton';
let showMesh = true;
let showBindPose = false;
let showBoneAxes = false;
let autoRotate = false;
let boneSize = 1.0;

// Selection
let selectedBone: THREE.Bone | null = null;
let boneHelpers: THREE.Object3D[] = [];
let weightColors: THREE.Color[] = [];

// ============================================================================
// INITIALIZATION
// ============================================================================

function init(): void {
  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a24);

  // Camera
  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 1.5, 4);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  document.getElementById('app')!.appendChild(renderer.domElement);

  // Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.target.set(0, 1, 0);
  controls.update();

  // Clock
  clock = new THREE.Clock();

  // Lights
  const ambient = new THREE.AmbientLight(0x404040, 0.5);
  scene.add(ambient);

  const directional = new THREE.DirectionalLight(0xffffff, 1.0);
  directional.position.set(5, 10, 5);
  scene.add(directional);

  // Ground
  const groundGeom = new THREE.PlaneGeometry(10, 10);
  const groundMat = new THREE.MeshStandardMaterial({ 
    color: 0x333344,
    roughness: 0.8,
  });
  const ground = new THREE.Mesh(groundGeom, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Create procedural humanoid
  createProceduralHumanoid();

  // Initialize 3Lens
  initProbe();

  // Setup UI
  setupUI();
  updateBoneTree();

  // Event listeners
  window.addEventListener('resize', onWindowResize);
  renderer.domElement.addEventListener('click', onCanvasClick);

  // Start animation
  animate();
}

function createProceduralHumanoid(): void {
  // Create bone hierarchy
  const bones: THREE.Bone[] = [];
  const bonePositions: [string, number, number, number, number | null][] = [
    // [name, x, y, z, parent index]
    ['Hips', 0, 1, 0, null],
    ['Spine', 0, 1.2, 0, 0],
    ['Spine1', 0, 1.4, 0, 1],
    ['Spine2', 0, 1.6, 0, 2],
    ['Neck', 0, 1.75, 0, 3],
    ['Head', 0, 1.9, 0, 4],
    // Left arm
    ['LeftShoulder', -0.15, 1.65, 0, 3],
    ['LeftArm', -0.35, 1.55, 0, 6],
    ['LeftForeArm', -0.55, 1.35, 0, 7],
    ['LeftHand', -0.75, 1.15, 0, 8],
    // Right arm
    ['RightShoulder', 0.15, 1.65, 0, 3],
    ['RightArm', 0.35, 1.55, 0, 10],
    ['RightForeArm', 0.55, 1.35, 0, 11],
    ['RightHand', 0.75, 1.15, 0, 12],
    // Left leg
    ['LeftUpLeg', -0.1, 0.95, 0, 0],
    ['LeftLeg', -0.1, 0.5, 0, 14],
    ['LeftFoot', -0.1, 0.08, 0, 15],
    ['LeftToeBase', -0.1, 0.02, 0.1, 16],
    // Right leg
    ['RightUpLeg', 0.1, 0.95, 0, 0],
    ['RightLeg', 0.1, 0.5, 0, 18],
    ['RightFoot', 0.1, 0.08, 0, 19],
    ['RightToeBase', 0.1, 0.02, 0.1, 20],
  ];

  bonePositions.forEach(([name, x, y, z, parentIdx], i) => {
    const bone = new THREE.Bone();
    bone.name = name;
    bone.position.set(x, y, z);
    bones.push(bone);

    if (parentIdx !== null) {
      // Position relative to parent
      const parent = bones[parentIdx];
      const parentPos = new THREE.Vector3();
      parent.getWorldPosition(parentPos);
      bone.position.sub(parentPos);
      parent.add(bone);
    }
  });

  // Create geometry (cylinder-based humanoid)
  const geometry = createHumanoidGeometry(bones);

  // Create skeleton
  skeleton = new THREE.Skeleton(bones);

  // Create skinned mesh
  const material = new THREE.MeshStandardMaterial({
    color: 0x8b5cf6,
    roughness: 0.6,
    metalness: 0.2,
    skinning: true,
  });

  skinnedMesh = new THREE.SkinnedMesh(geometry, material);
  skinnedMesh.add(bones[0]); // Add root bone
  skinnedMesh.bind(skeleton);
  skinnedMesh.name = 'Humanoid';
  scene.add(skinnedMesh);

  // Create skeleton helper
  skeletonHelper = new THREE.SkeletonHelper(skinnedMesh);
  (skeletonHelper.material as THREE.LineBasicMaterial).linewidth = 2;
  scene.add(skeletonHelper);

  // Create animations
  createAnimations();

  // Initialize weight colors for visualization
  initWeightColors();
}

function createHumanoidGeometry(bones: THREE.Bone[]): THREE.BufferGeometry {
  // Create a simple capsule-based humanoid geometry
  const vertices: number[] = [];
  const indices: number[] = [];
  const skinIndices: number[] = [];
  const skinWeights: number[] = [];

  const segmentsPerBone = 8;
  const radius = 0.08;

  bones.forEach((bone, boneIdx) => {
    if (boneIdx === 0) return; // Skip root

    const parent = bone.parent as THREE.Bone;
    if (!parent || !(parent instanceof THREE.Bone)) return;

    const parentIdx = bones.indexOf(parent);
    if (parentIdx === -1) return;

    // Get world positions
    const startPos = new THREE.Vector3();
    const endPos = new THREE.Vector3();
    parent.getWorldPosition(startPos);
    bone.getWorldPosition(endPos);

    const direction = endPos.clone().sub(startPos);
    const length = direction.length();
    if (length < 0.01) return;

    direction.normalize();

    // Create perpendicular vectors
    const up = new THREE.Vector3(0, 1, 0);
    if (Math.abs(direction.dot(up)) > 0.99) {
      up.set(1, 0, 0);
    }
    const right = new THREE.Vector3().crossVectors(direction, up).normalize();
    const forward = new THREE.Vector3().crossVectors(right, direction).normalize();

    const startVertexIdx = vertices.length / 3;

    // Create cylinder vertices
    for (let s = 0; s <= 1; s++) {
      const t = s;
      const pos = startPos.clone().add(direction.clone().multiplyScalar(length * t));
      const r = radius * (bone.name.includes('Hand') || bone.name.includes('Foot') ? 0.7 : 1);

      for (let i = 0; i < segmentsPerBone; i++) {
        const angle = (i / segmentsPerBone) * Math.PI * 2;
        const x = pos.x + Math.cos(angle) * r * right.x + Math.sin(angle) * r * forward.x;
        const y = pos.y + Math.cos(angle) * r * right.y + Math.sin(angle) * r * forward.y;
        const z = pos.z + Math.cos(angle) * r * right.z + Math.sin(angle) * r * forward.z;

        vertices.push(x, y, z);

        // Skin weights - blend between parent and child bone
        const w1 = 1 - t;
        const w2 = t;
        skinIndices.push(parentIdx, boneIdx, 0, 0);
        skinWeights.push(w1, w2, 0, 0);
      }
    }

    // Create faces
    for (let i = 0; i < segmentsPerBone; i++) {
      const a = startVertexIdx + i;
      const b = startVertexIdx + ((i + 1) % segmentsPerBone);
      const c = startVertexIdx + segmentsPerBone + i;
      const d = startVertexIdx + segmentsPerBone + ((i + 1) % segmentsPerBone);

      indices.push(a, b, c);
      indices.push(b, d, c);
    }
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndices, 4));
  geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinWeights, 4));
  geometry.computeVertexNormals();

  return geometry;
}

function createAnimations(): void {
  mixer = new THREE.AnimationMixer(skinnedMesh);

  // Idle animation
  const idleTracks: THREE.KeyframeTrack[] = [];
  const idleDuration = 2.0;

  // Breathing motion for spine
  skeleton.bones.forEach(bone => {
    if (bone.name.includes('Spine')) {
      const times = [0, 1, 2];
      const values = [0, 0, 0, 0.02, 0, 0, 0, 0, 0];
      idleTracks.push(new THREE.VectorKeyframeTrack(
        `${bone.name}.position`,
        times,
        values
      ));
    }
  });

  const idleClip = new THREE.AnimationClip('Idle', idleDuration, idleTracks);
  const idleAction = mixer.clipAction(idleClip);
  idleAction.play();

  animations.push({ name: 'Idle', duration: idleDuration, action: idleAction });

  // Walk animation
  const walkTracks: THREE.KeyframeTrack[] = [];
  const walkDuration = 1.0;

  skeleton.bones.forEach(bone => {
    if (bone.name === 'LeftUpLeg') {
      walkTracks.push(new THREE.QuaternionKeyframeTrack(
        `${bone.name}.quaternion`,
        [0, 0.25, 0.5, 0.75, 1],
        [
          ...new THREE.Quaternion().setFromEuler(new THREE.Euler(0.3, 0, 0)).toArray(),
          ...new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0)).toArray(),
          ...new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.3, 0, 0)).toArray(),
          ...new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0)).toArray(),
          ...new THREE.Quaternion().setFromEuler(new THREE.Euler(0.3, 0, 0)).toArray(),
        ]
      ));
    }
    if (bone.name === 'RightUpLeg') {
      walkTracks.push(new THREE.QuaternionKeyframeTrack(
        `${bone.name}.quaternion`,
        [0, 0.25, 0.5, 0.75, 1],
        [
          ...new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.3, 0, 0)).toArray(),
          ...new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0)).toArray(),
          ...new THREE.Quaternion().setFromEuler(new THREE.Euler(0.3, 0, 0)).toArray(),
          ...new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0)).toArray(),
          ...new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.3, 0, 0)).toArray(),
        ]
      ));
    }
    if (bone.name === 'LeftArm') {
      walkTracks.push(new THREE.QuaternionKeyframeTrack(
        `${bone.name}.quaternion`,
        [0, 0.25, 0.5, 0.75, 1],
        [
          ...new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.2, 0, 0)).toArray(),
          ...new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0)).toArray(),
          ...new THREE.Quaternion().setFromEuler(new THREE.Euler(0.2, 0, 0)).toArray(),
          ...new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0)).toArray(),
          ...new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.2, 0, 0)).toArray(),
        ]
      ));
    }
  });

  const walkClip = new THREE.AnimationClip('Walk', walkDuration, walkTracks);
  const walkAction = mixer.clipAction(walkClip);
  animations.push({ name: 'Walk', duration: walkDuration, action: walkAction });

  // Run animation (faster walk)
  const runTracks: THREE.KeyframeTrack[] = [];
  const runDuration = 0.8;

  skeleton.bones.forEach(bone => {
    if (bone.name === 'LeftUpLeg') {
      runTracks.push(new THREE.QuaternionKeyframeTrack(
        `${bone.name}.quaternion`,
        [0, 0.2, 0.4, 0.6, 0.8],
        [
          ...new THREE.Quaternion().setFromEuler(new THREE.Euler(0.5, 0, 0)).toArray(),
          ...new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0)).toArray(),
          ...new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.5, 0, 0)).toArray(),
          ...new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0)).toArray(),
          ...new THREE.Quaternion().setFromEuler(new THREE.Euler(0.5, 0, 0)).toArray(),
        ]
      ));
    }
    if (bone.name === 'RightUpLeg') {
      runTracks.push(new THREE.QuaternionKeyframeTrack(
        `${bone.name}.quaternion`,
        [0, 0.2, 0.4, 0.6, 0.8],
        [
          ...new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.5, 0, 0)).toArray(),
          ...new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0)).toArray(),
          ...new THREE.Quaternion().setFromEuler(new THREE.Euler(0.5, 0, 0)).toArray(),
          ...new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0)).toArray(),
          ...new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.5, 0, 0)).toArray(),
        ]
      ));
    }
  });

  const runClip = new THREE.AnimationClip('Run', runDuration, runTracks);
  const runAction = mixer.clipAction(runClip);
  animations.push({ name: 'Run', duration: runDuration, action: runAction });

  // Update UI
  updateAnimationList();
}

function initWeightColors(): void {
  // Create gradient colors for weight visualization
  weightColors = [
    new THREE.Color(0x3b82f6), // 0.0 - blue
    new THREE.Color(0x22c55e), // 0.25 - green
    new THREE.Color(0xfbbf24), // 0.5 - yellow
    new THREE.Color(0xf97316), // 0.75 - orange
    new THREE.Color(0xef4444), // 1.0 - red
  ];
}

function initProbe(): void {
  probe = createProbe({ appName: 'Skinned-Mesh-Inspector' });
  createOverlay({ probe, theme: 'dark' });

  // Register skeleton system
  probe.registerLogicalEntity({
    id: 'skeleton-system',
    name: 'Skeletal Animation System',
    type: 'animation',
    object3D: skinnedMesh,
    metadata: {
      boneCount: skeleton.bones.length,
      vertexCount: skinnedMesh.geometry.attributes.position.count,
      animationCount: animations.length,
    }
  });

  // Register individual bones
  skeleton.bones.forEach((bone, i) => {
    probe.registerLogicalEntity({
      id: `bone-${i}`,
      name: bone.name,
      type: 'bone',
      object3D: bone,
      metadata: {
        index: i,
        parentBone: bone.parent?.name || 'none',
      }
    });
  });
}

// ============================================================================
// UI SETUP
// ============================================================================

function setupUI(): void {
  // Playback controls
  document.getElementById('play-pause')!.addEventListener('click', togglePlayback);
  document.getElementById('prev-frame')!.addEventListener('click', () => stepFrame(-1));
  document.getElementById('next-frame')!.addEventListener('click', () => stepFrame(1));
  document.getElementById('loop-toggle')!.addEventListener('click', toggleLoop);

  // Timeline slider
  const timeline = document.getElementById('timeline') as HTMLInputElement;
  timeline.addEventListener('input', () => {
    const anim = animations[currentAnimation];
    if (anim && anim.action) {
      const time = (parseFloat(timeline.value) / 100) * anim.duration;
      anim.action.time = time;
      mixer.update(0);
      updateTimeDisplay();
    }
  });

  // Animation list
  document.querySelectorAll('.animation-item').forEach(item => {
    item.addEventListener('click', () => {
      const animName = item.getAttribute('data-anim');
      selectAnimation(animName!);
    });
  });

  // Visualization options
  document.querySelectorAll('.viz-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-viz') as VisualizationMode;
      setVisualizationMode(mode);
      document.querySelectorAll('.viz-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Bone size slider
  const boneSizeSlider = document.getElementById('bone-size') as HTMLInputElement;
  boneSizeSlider.addEventListener('input', () => {
    boneSize = parseInt(boneSizeSlider.value) / 10;
    document.getElementById('bone-size-value')!.textContent = boneSize.toFixed(1);
    // Update skeleton helper scale would go here
  });

  // Speed slider
  const speedSlider = document.getElementById('speed') as HTMLInputElement;
  speedSlider.addEventListener('input', () => {
    playbackSpeed = parseInt(speedSlider.value) / 100;
    document.getElementById('speed-value')!.textContent = `${playbackSpeed.toFixed(1)}x`;
  });

  // Toggles
  document.getElementById('mesh-toggle')!.addEventListener('click', (e) => {
    const toggle = e.currentTarget as HTMLElement;
    showMesh = !showMesh;
    toggle.classList.toggle('active', showMesh);
    skinnedMesh.visible = showMesh;
  });

  document.getElementById('rotate-toggle')!.addEventListener('click', (e) => {
    const toggle = e.currentTarget as HTMLElement;
    autoRotate = !autoRotate;
    toggle.classList.toggle('active', autoRotate);
  });

  // Window resize
  window.addEventListener('resize', onWindowResize);
}

function updateBoneTree(): void {
  const container = document.getElementById('bone-tree')!;

  function buildBoneHTML(bone: THREE.Bone, depth: number = 0): string {
    const isSelected = bone === selectedBone;
    let html = `<div class="bone-node ${isSelected ? 'selected' : ''}" data-bone="${bone.name}">
      <span class="bone-icon">🦴</span>
      <span>${bone.name}</span>
    </div>`;

    const childBones = bone.children.filter(c => c instanceof THREE.Bone) as THREE.Bone[];
    if (childBones.length > 0) {
      html += '<div class="bone-children">';
      childBones.forEach(child => {
        html += buildBoneHTML(child, depth + 1);
      });
      html += '</div>';
    }

    return html;
  }

  const rootBone = skeleton.bones[0];
  container.innerHTML = buildBoneHTML(rootBone);

  // Add click handlers
  container.querySelectorAll('.bone-node').forEach(node => {
    node.addEventListener('click', (e) => {
      e.stopPropagation();
      const boneName = node.getAttribute('data-bone');
      const bone = skeleton.bones.find(b => b.name === boneName);
      if (bone) selectBone(bone);
    });
  });
}

function updateAnimationList(): void {
  const container = document.getElementById('animation-list')!;
  container.innerHTML = animations.map((anim, i) => `
    <div class="animation-item ${i === currentAnimation ? 'active' : ''}" data-anim="${anim.name.toLowerCase()}">
      <span class="animation-name">${anim.name}</span>
      <span class="animation-duration">${anim.duration.toFixed(1)}s</span>
    </div>
  `).join('');

  // Re-add click handlers
  container.querySelectorAll('.animation-item').forEach(item => {
    item.addEventListener('click', () => {
      const animName = item.getAttribute('data-anim');
      selectAnimation(animName!);
    });
  });
}

function selectAnimation(name: string): void {
  const index = animations.findIndex(a => a.name.toLowerCase() === name.toLowerCase());
  if (index === -1) return;

  // Stop current
  animations.forEach(a => a.action?.stop());

  currentAnimation = index;
  const anim = animations[index];
  if (anim.action) {
    anim.action.reset();
    anim.action.setLoop(loopEnabled ? THREE.LoopRepeat : THREE.LoopOnce, Infinity);
    anim.action.play();
    if (!isPlaying) anim.action.paused = true;
  }

  // Update UI
  document.querySelectorAll('.animation-item').forEach((item, i) => {
    item.classList.toggle('active', i === index);
  });

  document.getElementById('total-time')!.textContent = `${anim.duration.toFixed(2)}s`;
  updateTimeDisplay();
}

function selectBone(bone: THREE.Bone): void {
  selectedBone = bone;
  updateBoneTree();
  updateBoneInspector();
}

function updateBoneInspector(): void {
  if (!selectedBone) return;

  document.getElementById('selected-bone-name')!.textContent = selectedBone.name;

  // Position
  const pos = selectedBone.position;
  document.getElementById('pos-x')!.textContent = pos.x.toFixed(2);
  document.getElementById('pos-y')!.textContent = pos.y.toFixed(2);
  document.getElementById('pos-z')!.textContent = pos.z.toFixed(2);

  // Rotation (in degrees)
  const rot = selectedBone.rotation;
  document.getElementById('rot-x')!.textContent = THREE.MathUtils.radToDeg(rot.x).toFixed(1);
  document.getElementById('rot-y')!.textContent = THREE.MathUtils.radToDeg(rot.y).toFixed(1);
  document.getElementById('rot-z')!.textContent = THREE.MathUtils.radToDeg(rot.z).toFixed(1);

  // Scale
  const scale = selectedBone.scale;
  document.getElementById('scale-x')!.textContent = scale.x.toFixed(2);
  document.getElementById('scale-y')!.textContent = scale.y.toFixed(2);
  document.getElementById('scale-z')!.textContent = scale.z.toFixed(2);

  // Index
  const boneIndex = skeleton.bones.indexOf(selectedBone);
  document.getElementById('bone-index')!.textContent = boneIndex.toString();

  // Children count
  const childBones = selectedBone.children.filter(c => c instanceof THREE.Bone);
  document.getElementById('bone-children')!.textContent = childBones.length.toString();

  // Influenced vertices (approximate)
  const vertCount = countInfluencedVertices(boneIndex);
  document.getElementById('bone-verts')!.textContent = vertCount.toString();
}

function countInfluencedVertices(boneIndex: number): number {
  const skinIndex = skinnedMesh.geometry.attributes.skinIndex;
  const skinWeight = skinnedMesh.geometry.attributes.skinWeight;
  let count = 0;

  for (let i = 0; i < skinIndex.count; i++) {
    for (let j = 0; j < 4; j++) {
      if (skinIndex.getComponent(i, j) === boneIndex && skinWeight.getComponent(i, j) > 0) {
        count++;
        break;
      }
    }
  }

  return count;
}

function setVisualizationMode(mode: VisualizationMode): void {
  vizMode = mode;

  // Reset
  skeletonHelper.visible = false;
  if (bindPoseHelper) bindPoseHelper.visible = false;
  clearBoneHelpers();

  switch (mode) {
    case 'skeleton':
      skeletonHelper.visible = true;
      break;
    case 'weights':
      visualizeWeights();
      break;
    case 'bindpose':
      showBindPoseComparison();
      break;
    case 'axes':
      displayBoneAxes();
      break;
  }
}

function visualizeWeights(): void {
  // Color mesh based on weights
  const geometry = skinnedMesh.geometry;
  const skinIndex = geometry.attributes.skinIndex;
  const skinWeight = geometry.attributes.skinWeight;
  const positions = geometry.attributes.position;

  const colors = new Float32Array(positions.count * 3);

  for (let i = 0; i < positions.count; i++) {
    // Find the bone with highest weight
    let maxWeight = 0;
    let maxBoneIndex = 0;

    for (let j = 0; j < 4; j++) {
      const weight = skinWeight.getComponent(i, j);
      if (weight > maxWeight) {
        maxWeight = weight;
        maxBoneIndex = skinIndex.getComponent(i, j);
      }
    }

    // Color based on weight
    const colorIdx = Math.min(4, Math.floor(maxWeight * 5));
    const color = weightColors[colorIdx];
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  (skinnedMesh.material as THREE.MeshStandardMaterial).vertexColors = true;
  (skinnedMesh.material as THREE.MeshStandardMaterial).needsUpdate = true;

  skeletonHelper.visible = true;
}

function showBindPoseComparison(): void {
  skeletonHelper.visible = true;
  // In a real implementation, we'd show the bind pose skeleton alongside current
  // For now, just show the skeleton
}

function displayBoneAxes(): void {
  skeleton.bones.forEach(bone => {
    const axesHelper = new THREE.AxesHelper(0.1 * boneSize);
    bone.add(axesHelper);
    boneHelpers.push(axesHelper);
  });
  skeletonHelper.visible = true;
}

function clearBoneHelpers(): void {
  boneHelpers.forEach(helper => {
    helper.parent?.remove(helper);
  });
  boneHelpers = [];

  // Reset vertex colors
  (skinnedMesh.material as THREE.MeshStandardMaterial).vertexColors = false;
  (skinnedMesh.material as THREE.MeshStandardMaterial).needsUpdate = true;
}

// ============================================================================
// PLAYBACK CONTROLS
// ============================================================================

function togglePlayback(): void {
  isPlaying = !isPlaying;
  const btn = document.getElementById('play-pause')!;
  btn.textContent = isPlaying ? '⏸' : '▶';
  btn.classList.toggle('active', isPlaying);

  const anim = animations[currentAnimation];
  if (anim && anim.action) {
    anim.action.paused = !isPlaying;
  }
}

function stepFrame(direction: number): void {
  const anim = animations[currentAnimation];
  if (!anim || !anim.action) return;

  const frameTime = 1 / 30; // 30 fps
  anim.action.time = Math.max(0, Math.min(anim.duration, anim.action.time + frameTime * direction));
  mixer.update(0);
  updateTimeDisplay();
}

function toggleLoop(): void {
  loopEnabled = !loopEnabled;
  const btn = document.getElementById('loop-toggle')!;
  btn.classList.toggle('active', loopEnabled);

  const anim = animations[currentAnimation];
  if (anim && anim.action) {
    anim.action.setLoop(loopEnabled ? THREE.LoopRepeat : THREE.LoopOnce, Infinity);
  }
}

function updateTimeDisplay(): void {
  const anim = animations[currentAnimation];
  if (!anim || !anim.action) return;

  const currentTime = anim.action.time;
  document.getElementById('current-time')!.textContent = `${currentTime.toFixed(2)}s`;

  const timeline = document.getElementById('timeline') as HTMLInputElement;
  timeline.value = ((currentTime / anim.duration) * 100).toString();
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

function onWindowResize(): void {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onCanvasClick(event: MouseEvent): void {
  // Raycast to select bones
  const rect = renderer.domElement.getBoundingClientRect();
  const mouse = new THREE.Vector2(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1
  );

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);

  // Check intersection with bone positions
  let closestBone: THREE.Bone | null = null;
  let closestDist = Infinity;

  skeleton.bones.forEach(bone => {
    const bonePos = new THREE.Vector3();
    bone.getWorldPosition(bonePos);

    const dist = raycaster.ray.distanceToPoint(bonePos);
    if (dist < 0.2 && dist < closestDist) {
      closestDist = dist;
      closestBone = bone;
    }
  });

  if (closestBone) {
    selectBone(closestBone);
  }
}

// ============================================================================
// ANIMATION LOOP
// ============================================================================

function animate(): void {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();

  // Update animation mixer
  if (isPlaying) {
    mixer.update(delta * playbackSpeed);
    updateTimeDisplay();
  }

  // Auto rotate
  if (autoRotate) {
    skinnedMesh.rotation.y += delta * 0.5;
  }

  // Update bone inspector if bone selected
  if (selectedBone) {
    updateBoneInspector();
  }

  controls.update();
  renderer.render(scene, camera);

  // Update stats
  updateStats();
}

function updateStats(): void {
  document.getElementById('bone-count')!.textContent = skeleton.bones.length.toString();
  document.getElementById('vertex-count')!.textContent = 
    (skinnedMesh.geometry.attributes.position.count / 1000).toFixed(1) + 'K';
  document.getElementById('influences')!.textContent = '4';
  document.getElementById('animation-count')!.textContent = animations.length.toString();
}

// ============================================================================
// START
// ============================================================================

init();
