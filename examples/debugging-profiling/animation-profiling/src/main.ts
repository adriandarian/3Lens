import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createProbe } from '@3lens/core';
import { bootstrapOverlay } from '@3lens/overlay';

/**
 * Animation Profiling Example
 * 
 * This example demonstrates common Three.js animation performance issues
 * that can be identified and diagnosed using 3Lens:
 * 
 * - Skeletal animation with varying bone complexity
 * - Morph target animations
 * - Animation mixer overhead
 * - Keyframe interpolation density
 */

// =============================================================================
// SCENE SETUP
// =============================================================================

const scene = new THREE.Scene();
scene.name = 'AnimationProfilingScene';
scene.background = new THREE.Color(0x0a0a0f);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(15, 10, 15);
camera.name = 'MainCamera';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('app')!.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 2, 0);

const clock = new THREE.Clock();

// =============================================================================
// BASE SCENE
// =============================================================================

function createBaseScene() {
  // Ground with grid
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 50),
    new THREE.MeshStandardMaterial({ 
      color: 0x1a1a2e, 
      roughness: 0.8,
      metalness: 0.2
    })
  );
  ground.name = 'Ground';
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Grid helper
  const grid = new THREE.GridHelper(50, 50, 0x333355, 0x222244);
  grid.name = 'GridHelper';
  scene.add(grid);

  // Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  ambient.name = 'AmbientLight';
  scene.add(ambient);

  const directional = new THREE.DirectionalLight(0xffffff, 1);
  directional.name = 'DirectionalLight';
  directional.position.set(10, 20, 10);
  directional.castShadow = true;
  directional.shadow.mapSize.width = 2048;
  directional.shadow.mapSize.height = 2048;
  directional.shadow.camera.near = 0.5;
  directional.shadow.camera.far = 50;
  directional.shadow.camera.left = -20;
  directional.shadow.camera.right = 20;
  directional.shadow.camera.top = 20;
  directional.shadow.camera.bottom = -20;
  scene.add(directional);

  // Point lights for atmosphere
  const pointLight1 = new THREE.PointLight(0x9b59b6, 0.5, 20);
  pointLight1.name = 'PointLight_Purple';
  pointLight1.position.set(-10, 5, 0);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0x3498db, 0.5, 20);
  pointLight2.name = 'PointLight_Blue';
  pointLight2.position.set(10, 5, 0);
  scene.add(pointLight2);
}

createBaseScene();

// =============================================================================
// ANIMATION STATE TRACKING
// =============================================================================

interface AnimationStats {
  activeMixers: number;
  activeActions: number;
  totalBones: number;
  morphInfluences: number;
  animationUpdateTime: number;
}

const animationStats: AnimationStats = {
  activeMixers: 0,
  activeActions: 0,
  totalBones: 0,
  morphInfluences: 0,
  animationUpdateTime: 0,
};

const mixers: THREE.AnimationMixer[] = [];
const animatedObjects: THREE.Object3D[] = [];

let isPaused = false;
let timeScale = 1.0;

// =============================================================================
// SKELETON CREATION UTILITIES
// =============================================================================

/**
 * Creates a skeleton with the specified number of bones in a chain
 */
function createSkeleton(boneCount: number): { skeleton: THREE.Skeleton; rootBone: THREE.Bone } {
  const bones: THREE.Bone[] = [];
  
  // Create bone chain
  let prevBone: THREE.Bone | null = null;
  for (let i = 0; i < boneCount; i++) {
    const bone = new THREE.Bone();
    bone.name = `Bone_${i}`;
    
    if (i === 0) {
      bone.position.set(0, 0, 0);
    } else {
      bone.position.set(0, 0.5, 0); // Each bone 0.5 units above parent
    }
    
    if (prevBone) {
      prevBone.add(bone);
    }
    
    bones.push(bone);
    prevBone = bone;
  }
  
  const skeleton = new THREE.Skeleton(bones);
  return { skeleton, rootBone: bones[0] };
}

/**
 * Creates a skinned mesh character with the given skeleton
 */
function createSkinnedCharacter(
  boneCount: number,
  position: THREE.Vector3,
  name: string
): { mesh: THREE.SkinnedMesh; mixer: THREE.AnimationMixer } {
  // Create geometry - a simple cylinder-like shape
  const height = boneCount * 0.5;
  const geometry = new THREE.CylinderGeometry(0.3, 0.4, height, 16, boneCount * 2);
  geometry.translate(0, height / 2, 0);
  
  // Create skin indices and weights
  const position_attr = geometry.attributes.position;
  const skinIndices: number[] = [];
  const skinWeights: number[] = [];
  
  for (let i = 0; i < position_attr.count; i++) {
    const y = position_attr.getY(i);
    const boneIndex = Math.min(Math.floor(y / 0.5), boneCount - 1);
    const nextBone = Math.min(boneIndex + 1, boneCount - 1);
    const weight = (y % 0.5) / 0.5;
    
    skinIndices.push(boneIndex, nextBone, 0, 0);
    skinWeights.push(1 - weight, weight, 0, 0);
  }
  
  geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndices, 4));
  geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinWeights, 4));
  
  // Create material
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color().setHSL(Math.random(), 0.7, 0.5),
    roughness: 0.5,
    metalness: 0.3,
  });
  
  // Create skeleton
  const { skeleton, rootBone } = createSkeleton(boneCount);
  
  // Create skinned mesh
  const mesh = new THREE.SkinnedMesh(geometry, material);
  mesh.name = name;
  mesh.add(rootBone);
  mesh.bind(skeleton);
  mesh.position.copy(position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  
  // Create animation
  const times = [0, 1, 2, 3, 4];
  const tracks: THREE.KeyframeTrack[] = [];
  
  // Animate each bone with a wave motion
  for (let i = 1; i < boneCount; i++) {
    const boneName = `Bone_${i}`;
    const amplitude = 0.1 + (i / boneCount) * 0.3;
    const phase = i * 0.3;
    
    const values = times.map(t => {
      const angle = Math.sin(t * Math.PI * 0.5 + phase) * amplitude;
      const quat = new THREE.Quaternion().setFromEuler(new THREE.Euler(angle, 0, angle * 0.5));
      return [quat.x, quat.y, quat.z, quat.w];
    }).flat();
    
    tracks.push(new THREE.QuaternionKeyframeTrack(
      `${boneName}.quaternion`,
      times,
      values
    ));
  }
  
  const clip = new THREE.AnimationClip(`${name}_Wave`, 4, tracks);
  const mixer = new THREE.AnimationMixer(mesh);
  const action = mixer.clipAction(clip);
  action.play();
  
  return { mesh, mixer };
}

// =============================================================================
// MORPH TARGET UTILITIES
// =============================================================================

/**
 * Creates a mesh with morph targets
 */
function createMorphTargetMesh(
  targetCount: number,
  position: THREE.Vector3,
  name: string
): { mesh: THREE.Mesh; mixer: THREE.AnimationMixer } {
  // Base geometry - sphere
  const geometry = new THREE.SphereGeometry(1, 32, 32);
  
  // Create morph targets
  const morphPositions: Float32Array[] = [];
  const positionAttribute = geometry.attributes.position;
  
  for (let t = 0; t < targetCount; t++) {
    const morphArray = new Float32Array(positionAttribute.count * 3);
    
    for (let i = 0; i < positionAttribute.count; i++) {
      const x = positionAttribute.getX(i);
      const y = positionAttribute.getY(i);
      const z = positionAttribute.getZ(i);
      
      // Create unique deformation for each target
      const noise = Math.sin(x * 5 + t) * Math.cos(y * 5 + t * 0.7) * Math.sin(z * 5 + t * 1.3);
      const scale = 1 + noise * 0.3;
      
      morphArray[i * 3] = x * scale;
      morphArray[i * 3 + 1] = y * scale;
      morphArray[i * 3 + 2] = z * scale;
    }
    
    morphPositions.push(morphArray);
  }
  
  geometry.morphAttributes.position = morphPositions.map(
    arr => new THREE.Float32BufferAttribute(arr, 3)
  );
  
  // Material with morphTargets enabled
  const material = new THREE.MeshStandardMaterial({
    color: 0x9b59b6,
    roughness: 0.4,
    metalness: 0.6,
    morphTargets: true,
  });
  
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = name;
  mesh.position.copy(position);
  mesh.castShadow = true;
  mesh.morphTargetInfluences = new Array(targetCount).fill(0);
  
  // Create animation for morph targets
  const times: number[] = [];
  const tracks: THREE.KeyframeTrack[] = [];
  
  const duration = 4;
  const steps = 20;
  for (let i = 0; i <= steps; i++) {
    times.push((i / steps) * duration);
  }
  
  for (let t = 0; t < targetCount; t++) {
    const values = times.map((time) => {
      const phase = t * (Math.PI * 2 / targetCount);
      return Math.max(0, Math.sin(time * Math.PI * 0.5 + phase));
    });
    
    tracks.push(new THREE.NumberKeyframeTrack(
      `.morphTargetInfluences[${t}]`,
      times,
      values
    ));
  }
  
  const clip = new THREE.AnimationClip(`${name}_Morph`, duration, tracks);
  const mixer = new THREE.AnimationMixer(mesh);
  const action = mixer.clipAction(clip);
  action.play();
  
  return { mesh, mixer };
}

// =============================================================================
// ANIMATION CLIP UTILITIES
// =============================================================================

/**
 * Creates an object with animation clips for testing mixer performance
 */
function createAnimatedObject(
  position: THREE.Vector3,
  name: string,
  clipCount: number = 1,
  keyframeCount: number = 10
): { mesh: THREE.Mesh; mixer: THREE.AnimationMixer; actions: THREE.AnimationAction[] } {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color().setHSL(Math.random(), 0.8, 0.5),
    roughness: 0.3,
  });
  
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = name;
  mesh.position.copy(position);
  mesh.castShadow = true;
  
  const mixer = new THREE.AnimationMixer(mesh);
  const actions: THREE.AnimationAction[] = [];
  
  for (let c = 0; c < clipCount; c++) {
    const times: number[] = [];
    const posValues: number[] = [];
    const rotValues: number[] = [];
    const scaleValues: number[] = [];
    
    const duration = 2 + c;
    
    for (let i = 0; i < keyframeCount; i++) {
      const t = (i / (keyframeCount - 1)) * duration;
      times.push(t);
      
      // Position animation
      const angle = (i / keyframeCount) * Math.PI * 2 + c;
      posValues.push(
        Math.sin(angle) * (0.5 + c * 0.2),
        Math.abs(Math.sin(angle * 2)) * 0.5,
        Math.cos(angle) * (0.5 + c * 0.2)
      );
      
      // Rotation animation
      const quat = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(angle * 0.5, angle, angle * 0.3)
      );
      rotValues.push(quat.x, quat.y, quat.z, quat.w);
      
      // Scale animation
      const scale = 1 + Math.sin(angle * 3) * 0.2;
      scaleValues.push(scale, scale, scale);
    }
    
    const tracks = [
      new THREE.VectorKeyframeTrack('.position', times, posValues),
      new THREE.QuaternionKeyframeTrack('.quaternion', times, rotValues),
      new THREE.VectorKeyframeTrack('.scale', times, scaleValues),
    ];
    
    const clip = new THREE.AnimationClip(`${name}_Clip${c}`, duration, tracks);
    const action = mixer.clipAction(clip);
    actions.push(action);
  }
  
  return { mesh, mixer, actions };
}

// =============================================================================
// ISSUE SCENARIOS
// =============================================================================

interface IssueState {
  active: boolean;
  cleanup: () => void;
}

const issues: Record<string, IssueState> = {
  'simple-skeleton': { active: false, cleanup: () => {} },
  'complex-skeleton': { active: false, cleanup: () => {} },
  'morph-simple': { active: false, cleanup: () => {} },
  'morph-complex': { active: false, cleanup: () => {} },
  'single-clip': { active: false, cleanup: () => {} },
  'blended': { active: false, cleanup: () => {} },
  'many-mixers': { active: false, cleanup: () => {} },
  'sparse-keys': { active: false, cleanup: () => {} },
  'dense-keys': { active: false, cleanup: () => {} },
};

let skeletonCount = 1;

// Simple Skeleton (20 bones)
function enableSimpleSkeleton() {
  const group = new THREE.Group();
  group.name = 'SimpleSkeleton_Group';
  
  for (let i = 0; i < skeletonCount; i++) {
    const x = (i % 10) * 2 - (Math.min(skeletonCount, 10) - 1);
    const z = Math.floor(i / 10) * 2 - 5;
    const { mesh, mixer } = createSkinnedCharacter(
      20,
      new THREE.Vector3(x, 0, z),
      `SimpleChar_${i}`
    );
    group.add(mesh);
    mixers.push(mixer);
  }
  
  scene.add(group);
  animatedObjects.push(group);
  updateAnimationStats();
  
  issues['simple-skeleton'].cleanup = () => {
    scene.remove(group);
    group.traverse(child => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
    const index = animatedObjects.indexOf(group);
    if (index > -1) animatedObjects.splice(index, 1);
    // Remove associated mixers
    mixers.length = 0;
    updateAnimationStats();
  };
}

// Complex Skeleton (100 bones)
function enableComplexSkeleton() {
  const group = new THREE.Group();
  group.name = 'ComplexSkeleton_Group';
  
  for (let i = 0; i < skeletonCount; i++) {
    const x = (i % 10) * 3 - (Math.min(skeletonCount, 10) - 1) * 1.5;
    const z = Math.floor(i / 10) * 3 - 5;
    const { mesh, mixer } = createSkinnedCharacter(
      100,
      new THREE.Vector3(x, 0, z),
      `ComplexChar_${i}`
    );
    group.add(mesh);
    mixers.push(mixer);
  }
  
  scene.add(group);
  animatedObjects.push(group);
  updateAnimationStats();
  
  issues['complex-skeleton'].cleanup = () => {
    scene.remove(group);
    group.traverse(child => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
    const index = animatedObjects.indexOf(group);
    if (index > -1) animatedObjects.splice(index, 1);
    mixers.length = 0;
    updateAnimationStats();
  };
}

// Simple Morph (4 targets)
function enableMorphSimple() {
  const group = new THREE.Group();
  group.name = 'SimpleMorph_Group';
  
  for (let i = 0; i < 5; i++) {
    const { mesh, mixer } = createMorphTargetMesh(
      4,
      new THREE.Vector3(i * 3 - 6, 1.5, -5),
      `SimpleMorph_${i}`
    );
    group.add(mesh);
    mixers.push(mixer);
  }
  
  scene.add(group);
  animatedObjects.push(group);
  updateAnimationStats();
  
  issues['morph-simple'].cleanup = () => {
    scene.remove(group);
    group.traverse(child => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
    const index = animatedObjects.indexOf(group);
    if (index > -1) animatedObjects.splice(index, 1);
    mixers.length = 0;
    updateAnimationStats();
  };
}

// Complex Morph (32 targets)
function enableMorphComplex() {
  const group = new THREE.Group();
  group.name = 'ComplexMorph_Group';
  
  for (let i = 0; i < 5; i++) {
    const { mesh, mixer } = createMorphTargetMesh(
      32,
      new THREE.Vector3(i * 3 - 6, 1.5, 5),
      `ComplexMorph_${i}`
    );
    group.add(mesh);
    mixers.push(mixer);
  }
  
  scene.add(group);
  animatedObjects.push(group);
  updateAnimationStats();
  
  issues['morph-complex'].cleanup = () => {
    scene.remove(group);
    group.traverse(child => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
    const index = animatedObjects.indexOf(group);
    if (index > -1) animatedObjects.splice(index, 1);
    mixers.length = 0;
    updateAnimationStats();
  };
}

// Single Animation Clip
function enableSingleClip() {
  const { mesh, mixer, actions } = createAnimatedObject(
    new THREE.Vector3(-5, 0.5, 0),
    'SingleClipObject',
    1,
    30
  );
  
  actions[0].play();
  
  scene.add(mesh);
  mixers.push(mixer);
  animatedObjects.push(mesh);
  updateAnimationStats();
  
  issues['single-clip'].cleanup = () => {
    scene.remove(mesh);
    mesh.geometry.dispose();
    (mesh.material as THREE.Material).dispose();
    const objIndex = animatedObjects.indexOf(mesh);
    if (objIndex > -1) animatedObjects.splice(objIndex, 1);
    const mixerIndex = mixers.indexOf(mixer);
    if (mixerIndex > -1) mixers.splice(mixerIndex, 1);
    updateAnimationStats();
  };
}

// Blended Animation Clips
function enableBlended() {
  const { mesh, mixer, actions } = createAnimatedObject(
    new THREE.Vector3(0, 0.5, 0),
    'BlendedObject',
    3,
    30
  );
  
  // Play all clips with crossfade
  actions.forEach((action, i) => {
    action.play();
    action.setEffectiveWeight(1 / actions.length);
    action.setEffectiveTimeScale(1 + i * 0.2);
  });
  
  scene.add(mesh);
  mixers.push(mixer);
  animatedObjects.push(mesh);
  updateAnimationStats();
  
  issues['blended'].cleanup = () => {
    scene.remove(mesh);
    mesh.geometry.dispose();
    (mesh.material as THREE.Material).dispose();
    const objIndex = animatedObjects.indexOf(mesh);
    if (objIndex > -1) animatedObjects.splice(objIndex, 1);
    const mixerIndex = mixers.indexOf(mixer);
    if (mixerIndex > -1) mixers.splice(mixerIndex, 1);
    updateAnimationStats();
  };
}

// Many Animation Mixers
function enableManyMixers() {
  const group = new THREE.Group();
  group.name = 'ManyMixers_Group';
  const localMixers: THREE.AnimationMixer[] = [];
  
  for (let i = 0; i < 20; i++) {
    const x = (i % 5) * 2 - 4;
    const z = Math.floor(i / 5) * 2 + 3;
    const { mesh, mixer, actions } = createAnimatedObject(
      new THREE.Vector3(x, 0.5, z),
      `ManyMixer_${i}`,
      2,
      20
    );
    actions.forEach(a => a.play());
    group.add(mesh);
    mixers.push(mixer);
    localMixers.push(mixer);
  }
  
  scene.add(group);
  animatedObjects.push(group);
  updateAnimationStats();
  
  issues['many-mixers'].cleanup = () => {
    scene.remove(group);
    group.traverse(child => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
    const index = animatedObjects.indexOf(group);
    if (index > -1) animatedObjects.splice(index, 1);
    localMixers.forEach(m => {
      const idx = mixers.indexOf(m);
      if (idx > -1) mixers.splice(idx, 1);
    });
    updateAnimationStats();
  };
}

// Sparse Keyframes
function enableSparseKeys() {
  const { mesh, mixer, actions } = createAnimatedObject(
    new THREE.Vector3(5, 0.5, -3),
    'SparseKeysObject',
    1,
    10 // Only 10 keyframes
  );
  
  actions[0].play();
  
  scene.add(mesh);
  mixers.push(mixer);
  animatedObjects.push(mesh);
  updateAnimationStats();
  
  issues['sparse-keys'].cleanup = () => {
    scene.remove(mesh);
    mesh.geometry.dispose();
    (mesh.material as THREE.Material).dispose();
    const objIndex = animatedObjects.indexOf(mesh);
    if (objIndex > -1) animatedObjects.splice(objIndex, 1);
    const mixerIndex = mixers.indexOf(mixer);
    if (mixerIndex > -1) mixers.splice(mixerIndex, 1);
    updateAnimationStats();
  };
}

// Dense Keyframes
function enableDenseKeys() {
  const { mesh, mixer, actions } = createAnimatedObject(
    new THREE.Vector3(5, 0.5, 3),
    'DenseKeysObject',
    1,
    1000 // 1000 keyframes!
  );
  
  actions[0].play();
  
  scene.add(mesh);
  mixers.push(mixer);
  animatedObjects.push(mesh);
  updateAnimationStats();
  
  issues['dense-keys'].cleanup = () => {
    scene.remove(mesh);
    mesh.geometry.dispose();
    (mesh.material as THREE.Material).dispose();
    const objIndex = animatedObjects.indexOf(mesh);
    if (objIndex > -1) animatedObjects.splice(objIndex, 1);
    const mixerIndex = mixers.indexOf(mixer);
    if (mixerIndex > -1) mixers.splice(mixerIndex, 1);
    updateAnimationStats();
  };
}

// =============================================================================
// UI SETUP
// =============================================================================

function setupUI() {
  // Toggle buttons
  const toggleButtons: Record<string, { enable: () => void; disable: () => void }> = {
    'btn-simple-skeleton': { enable: enableSimpleSkeleton, disable: () => issues['simple-skeleton'].cleanup() },
    'btn-complex-skeleton': { enable: enableComplexSkeleton, disable: () => issues['complex-skeleton'].cleanup() },
    'btn-morph-simple': { enable: enableMorphSimple, disable: () => issues['morph-simple'].cleanup() },
    'btn-morph-complex': { enable: enableMorphComplex, disable: () => issues['morph-complex'].cleanup() },
    'btn-single-clip': { enable: enableSingleClip, disable: () => issues['single-clip'].cleanup() },
    'btn-blended': { enable: enableBlended, disable: () => issues['blended'].cleanup() },
    'btn-many-mixers': { enable: enableManyMixers, disable: () => issues['many-mixers'].cleanup() },
    'btn-sparse-keys': { enable: enableSparseKeys, disable: () => issues['sparse-keys'].cleanup() },
    'btn-dense-keys': { enable: enableDenseKeys, disable: () => issues['dense-keys'].cleanup() },
  };
  
  const issueKeyMap: Record<string, string> = {
    'btn-simple-skeleton': 'simple-skeleton',
    'btn-complex-skeleton': 'complex-skeleton',
    'btn-morph-simple': 'morph-simple',
    'btn-morph-complex': 'morph-complex',
    'btn-single-clip': 'single-clip',
    'btn-blended': 'blended',
    'btn-many-mixers': 'many-mixers',
    'btn-sparse-keys': 'sparse-keys',
    'btn-dense-keys': 'dense-keys',
  };
  
  Object.entries(toggleButtons).forEach(([id, { enable, disable }]) => {
    const btn = document.getElementById(id);
    if (!btn) return;
    
    btn.addEventListener('click', () => {
      const issueKey = issueKeyMap[id];
      const issue = issues[issueKey];
      
      if (issue.active) {
        disable();
        issue.active = false;
        btn.classList.remove('active');
      } else {
        enable();
        issue.active = true;
        btn.classList.add('active');
      }
    });
  });
  
  // Skeleton count slider
  const skeletonCountSlider = document.getElementById('skeleton-count') as HTMLInputElement;
  const skeletonCountDisplay = document.getElementById('skeleton-count-display');
  
  skeletonCountSlider?.addEventListener('input', () => {
    skeletonCount = parseInt(skeletonCountSlider.value);
    if (skeletonCountDisplay) {
      skeletonCountDisplay.textContent = skeletonCount.toString();
    }
    
    // Re-enable active skeleton scenarios with new count
    if (issues['simple-skeleton'].active) {
      issues['simple-skeleton'].cleanup();
      enableSimpleSkeleton();
    }
    if (issues['complex-skeleton'].active) {
      issues['complex-skeleton'].cleanup();
      enableComplexSkeleton();
    }
  });
  
  // Time scale slider
  const timescaleSlider = document.getElementById('timescale') as HTMLInputElement;
  const timescaleDisplay = document.getElementById('timescale-display');
  
  timescaleSlider?.addEventListener('input', () => {
    timeScale = parseFloat(timescaleSlider.value);
    if (timescaleDisplay) {
      timescaleDisplay.textContent = `${timeScale.toFixed(1)}x`;
    }
  });
  
  // Pause button
  const pauseBtn = document.getElementById('btn-pause');
  pauseBtn?.addEventListener('click', () => {
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? '▶ Play' : '⏸ Pause';
  });
  
  // Step frame button
  const stepBtn = document.getElementById('btn-step');
  stepBtn?.addEventListener('click', () => {
    if (isPaused) {
      const delta = 1 / 60; // Step one frame at 60fps
      mixers.forEach(mixer => mixer.update(delta));
    }
  });
  
  // Reset button
  const resetBtn = document.getElementById('btn-reset');
  resetBtn?.addEventListener('click', () => {
    // Disable all active issues
    Object.entries(issues).forEach(([key, issue]) => {
      if (issue.active) {
        issue.cleanup();
        issue.active = false;
      }
    });
    
    // Reset UI
    document.querySelectorAll('.toggle').forEach(btn => {
      btn.classList.remove('active');
    });
    
    // Reset sliders
    if (skeletonCountSlider) {
      skeletonCountSlider.value = '1';
      skeletonCount = 1;
      if (skeletonCountDisplay) skeletonCountDisplay.textContent = '1';
    }
    if (timescaleSlider) {
      timescaleSlider.value = '1';
      timeScale = 1;
      if (timescaleDisplay) timescaleDisplay.textContent = '1.0x';
    }
    
    isPaused = false;
    if (pauseBtn) pauseBtn.textContent = '⏸ Pause';
    
    updateAnimationStats();
  });
}

// =============================================================================
// STATS UPDATE
// =============================================================================

function updateAnimationStats() {
  let totalBones = 0;
  let totalMorphs = 0;
  let totalActions = 0;
  
  animatedObjects.forEach(obj => {
    obj.traverse(child => {
      if (child instanceof THREE.SkinnedMesh && child.skeleton) {
        totalBones += child.skeleton.bones.length;
      }
      if (child instanceof THREE.Mesh && child.morphTargetInfluences) {
        totalMorphs += child.morphTargetInfluences.length;
      }
    });
  });
  
  mixers.forEach(mixer => {
    // Count active actions (accessing internal _actions)
    const mixerAny = mixer as any;
    if (mixerAny._actions) {
      totalActions += mixerAny._actions.length;
    }
  });
  
  animationStats.activeMixers = mixers.length;
  animationStats.activeActions = totalActions;
  animationStats.totalBones = totalBones;
  animationStats.morphInfluences = totalMorphs;
  
  // Update UI
  const updateStat = (id: string, value: number | string, warn?: number, danger?: number) => {
    const el = document.getElementById(id);
    if (!el) return;
    
    el.textContent = typeof value === 'number' ? value.toString() : value;
    el.classList.remove('warning', 'danger', 'good');
    
    if (typeof value === 'number' && warn !== undefined && danger !== undefined) {
      if (value >= danger) {
        el.classList.add('danger');
      } else if (value >= warn) {
        el.classList.add('warning');
      } else if (value > 0) {
        el.classList.add('good');
      }
    }
  };
  
  updateStat('stat-mixers', animationStats.activeMixers, 10, 20);
  updateStat('stat-actions', animationStats.activeActions, 20, 50);
  updateStat('stat-bones', animationStats.totalBones, 500, 2000);
  updateStat('stat-morphs', animationStats.morphInfluences, 50, 150);
}

function updateTimelineBar() {
  // Simplified timeline visualization based on active features
  const skelTime = issues['simple-skeleton'].active || issues['complex-skeleton'].active ? 30 : 0;
  const morphTime = issues['morph-simple'].active || issues['morph-complex'].active ? 25 : 0;
  const mixerTime = (issues['single-clip'].active ? 10 : 0) + 
                    (issues['blended'].active ? 15 : 0) + 
                    (issues['many-mixers'].active ? 20 : 0);
  
  const total = Math.max(skelTime + morphTime + mixerTime, 1);
  
  const skelSeg = document.getElementById('seg-skeleton');
  const morphSeg = document.getElementById('seg-morph');
  const mixerSeg = document.getElementById('seg-mixer');
  
  if (skelSeg) {
    skelSeg.style.width = `${(skelTime / total) * 100}%`;
    skelSeg.style.left = '0%';
  }
  if (morphSeg) {
    morphSeg.style.width = `${(morphTime / total) * 100}%`;
    morphSeg.style.left = `${(skelTime / total) * 100}%`;
  }
  if (mixerSeg) {
    mixerSeg.style.width = `${(mixerTime / total) * 100}%`;
    mixerSeg.style.left = `${((skelTime + morphTime) / total) * 100}%`;
  }
}

// =============================================================================
// 3LENS INTEGRATION
// =============================================================================

const probe = createProbe({
  name: 'AnimationProfilingProbe',
  sampling: {
    frameStatsInterval: 1,
    sceneSnapshotInterval: 30,
    enableGPUTiming: true,
  },
});

probe.observeRenderer(renderer);
probe.observeScene(scene);

bootstrapOverlay({
  probe,
  position: 'right',
  defaultWidth: 380,
  defaultOpen: false,
});

// =============================================================================
// ANIMATION LOOP
// =============================================================================

function animate() {
  requestAnimationFrame(animate);
  
  const delta = clock.getDelta();
  
  // Update controls
  controls.update();
  
  // Update animations
  if (!isPaused) {
    const animStart = performance.now();
    
    mixers.forEach(mixer => {
      mixer.update(delta * timeScale);
    });
    
    animationStats.animationUpdateTime = performance.now() - animStart;
    
    // Update animation time stat
    const animTimeEl = document.getElementById('stat-anim-time');
    if (animTimeEl) {
      const time = animationStats.animationUpdateTime;
      animTimeEl.textContent = `${time.toFixed(2)} ms`;
      animTimeEl.classList.remove('warning', 'danger', 'good');
      if (time > 5) {
        animTimeEl.classList.add('danger');
      } else if (time > 2) {
        animTimeEl.classList.add('warning');
      } else {
        animTimeEl.classList.add('good');
      }
    }
  }
  
  // Update timeline visualization
  updateTimelineBar();
  
  // Render
  renderer.render(scene, camera);
}

// =============================================================================
// INITIALIZATION
// =============================================================================

setupUI();
animate();

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Keyboard shortcut for 3Lens overlay
window.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.key === 'D') {
    e.preventDefault();
    // Overlay toggle is handled by 3Lens
  }
});

console.log(`
🎬 Animation Profiling Example
==============================
Toggle animation scenarios using the control panel on the left.
Open 3Lens overlay (Ctrl+Shift+D) to inspect performance metrics.

Scenarios:
- Simple/Complex Skeleton: Compare bone count impact
- Morph Targets: See morph influence overhead
- Animation Mixers: Test blending and multiple clips
- Keyframe Density: Sparse vs dense keyframe tracks
`);
