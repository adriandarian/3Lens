/**
 * Skinned Mesh Inspector Example
 * 
 * Demonstrates skeletal animation debugging with 3Lens integration.
 * Use 3Lens to inspect:
 * - Bone hierarchy and transforms
 * - Vertex skin weights
 * - Animation playback state
 * - Skeleton visualization
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';
import '@3lens/themes/styles.css';

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

// Animation
let mixer: THREE.AnimationMixer;
let animations: { name: string; duration: number; action: THREE.AnimationAction | null }[] = [];
let currentAnimation = 0;
let isPlaying = true;
let clock: THREE.Clock;

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

  // Event listeners
  window.addEventListener('resize', onWindowResize);

  // Start animation
  animate();
}

function createProceduralHumanoid(): void {
  // Create bone hierarchy
  const bones: THREE.Bone[] = [];
  const bonePositions: [string, number, number, number, number | null][] = [
    ['Hips', 0, 1, 0, null],
    ['Spine', 0, 1.2, 0, 0],
    ['Spine1', 0, 1.4, 0, 1],
    ['Spine2', 0, 1.6, 0, 2],
    ['Neck', 0, 1.75, 0, 3],
    ['Head', 0, 1.9, 0, 4],
    ['LeftShoulder', -0.15, 1.65, 0, 3],
    ['LeftArm', -0.35, 1.55, 0, 6],
    ['LeftForeArm', -0.55, 1.35, 0, 7],
    ['LeftHand', -0.75, 1.15, 0, 8],
    ['RightShoulder', 0.15, 1.65, 0, 3],
    ['RightArm', 0.35, 1.55, 0, 10],
    ['RightForeArm', 0.55, 1.35, 0, 11],
    ['RightHand', 0.75, 1.15, 0, 12],
    ['LeftUpLeg', -0.1, 0.95, 0, 0],
    ['LeftLeg', -0.1, 0.5, 0, 14],
    ['LeftFoot', -0.1, 0.08, 0, 15],
    ['LeftToeBase', -0.1, 0.02, 0.1, 16],
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
      const parent = bones[parentIdx];
      const parentPos = new THREE.Vector3();
      parent.getWorldPosition(parentPos);
      bone.position.sub(parentPos);
      parent.add(bone);
    }
  });

  // Create geometry
  const geometry = createHumanoidGeometry(bones);

  // Create skeleton
  skeleton = new THREE.Skeleton(bones);

  // Create skinned mesh
  const material = new THREE.MeshStandardMaterial({
    color: 0x8b5cf6,
    roughness: 0.6,
    metalness: 0.2,
  });

  skinnedMesh = new THREE.SkinnedMesh(geometry, material);
  skinnedMesh.name = 'Humanoid';
  skinnedMesh.add(bones[0]);
  skinnedMesh.bind(skeleton);
  scene.add(skinnedMesh);

  // Create skeleton helper
  skeletonHelper = new THREE.SkeletonHelper(skinnedMesh);
  (skeletonHelper.material as THREE.LineBasicMaterial).linewidth = 2;
  scene.add(skeletonHelper);

  // Create animations
  createAnimations();
}

function createHumanoidGeometry(bones: THREE.Bone[]): THREE.BufferGeometry {
  const vertices: number[] = [];
  const indices: number[] = [];
  const skinIndices: number[] = [];
  const skinWeights: number[] = [];

  const segmentsPerBone = 8;
  const radius = 0.08;

  bones.forEach((bone, boneIdx) => {
    if (boneIdx === 0) return;

    const parent = bone.parent as THREE.Bone;
    if (!parent || !(parent instanceof THREE.Bone)) return;

    const parentIdx = bones.indexOf(parent);
    if (parentIdx === -1) return;

    const startPos = new THREE.Vector3();
    const endPos = new THREE.Vector3();
    parent.getWorldPosition(startPos);
    bone.getWorldPosition(endPos);

    const direction = endPos.clone().sub(startPos);
    const length = direction.length();
    if (length < 0.01) return;

    direction.normalize();

    const up = new THREE.Vector3(0, 1, 0);
    if (Math.abs(direction.dot(up)) > 0.99) {
      up.set(1, 0, 0);
    }
    const right = new THREE.Vector3().crossVectors(direction, up).normalize();
    const forward = new THREE.Vector3().crossVectors(right, direction).normalize();

    const startVertexIdx = vertices.length / 3;

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

        const w1 = 1 - t;
        const w2 = t;
        skinIndices.push(parentIdx, boneIdx, 0, 0);
        skinWeights.push(w1, w2, 0, 0);
      }
    }

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

  skeleton.bones.forEach(bone => {
    if (bone.name.includes('Spine')) {
      const times = [0, 1, 2];
      const values = [0, 0, 0, 0.02, 0, 0, 0, 0, 0];
      idleTracks.push(new THREE.VectorKeyframeTrack(`${bone.name}.position`, times, values));
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
  });

  const walkClip = new THREE.AnimationClip('Walk', walkDuration, walkTracks);
  const walkAction = mixer.clipAction(walkClip);
  animations.push({ name: 'Walk', duration: walkDuration, action: walkAction });

  // Run animation
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
      maxInfluences: 4,
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
        parentBone: bone.parent instanceof THREE.Bone ? bone.parent.name : 'none',
        childCount: bone.children.filter(c => c instanceof THREE.Bone).length,
      }
    });
  });

  // Register animations
  animations.forEach((anim, i) => {
    probe.registerLogicalEntity({
      id: `animation-${i}`,
      name: anim.name,
      type: 'animation-clip',
      metadata: {
        duration: anim.duration,
        index: i,
      }
    });
  });
}

// ============================================================================
// UI SETUP
// ============================================================================

function setupUI(): void {
  // Play/pause
  document.getElementById('play-pause')!.addEventListener('click', () => {
    isPlaying = !isPlaying;
    const btn = document.getElementById('play-pause')!;
    btn.textContent = isPlaying ? '⏸' : '▶';
    btn.classList.toggle('active', isPlaying);
    
    const anim = animations[currentAnimation];
    if (anim && anim.action) {
      anim.action.paused = !isPlaying;
    }
  });

  // Animation selection
  document.querySelectorAll('.anim-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const animName = btn.getAttribute('data-anim');
      selectAnimation(animName!);
      
      document.querySelectorAll('.anim-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  window.addEventListener('resize', onWindowResize);
}

function selectAnimation(name: string): void {
  const index = animations.findIndex(a => a.name.toLowerCase() === name.toLowerCase());
  if (index === -1) return;

  animations.forEach(a => a.action?.stop());

  currentAnimation = index;
  const anim = animations[index];
  if (anim.action) {
    anim.action.reset();
    anim.action.setLoop(THREE.LoopRepeat, Infinity);
    anim.action.play();
    if (!isPlaying) anim.action.paused = true;
  }

  // Update 3Lens
  probe.updateLogicalEntity('skeleton-system', {
    metadata: {
      boneCount: skeleton.bones.length,
      vertexCount: skinnedMesh.geometry.attributes.position.count,
      animationCount: animations.length,
      currentAnimation: anim.name,
      animationDuration: anim.duration,
    }
  });
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

  const delta = clock.getDelta();

  if (isPlaying) {
    mixer.update(delta);
  }

  // Update bone transforms in 3Lens periodically
  if (Math.random() < 0.05) {
    skeleton.bones.forEach((bone, i) => {
      probe.updateLogicalEntity(`bone-${i}`, {
        metadata: {
          index: i,
          parentBone: bone.parent instanceof THREE.Bone ? bone.parent.name : 'none',
          localPosition: `${bone.position.x.toFixed(2)}, ${bone.position.y.toFixed(2)}, ${bone.position.z.toFixed(2)}`,
          localRotation: `${THREE.MathUtils.radToDeg(bone.rotation.x).toFixed(1)}, ${THREE.MathUtils.radToDeg(bone.rotation.y).toFixed(1)}, ${THREE.MathUtils.radToDeg(bone.rotation.z).toFixed(1)}`,
        }
      });
    });
  }

  controls.update();
  renderer.render(scene, camera);
}

// ============================================================================
// START
// ============================================================================

init();
