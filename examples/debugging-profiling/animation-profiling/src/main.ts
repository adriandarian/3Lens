import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';
import '@3lens/themes/styles.css';

/**
 * Animation Profiling Example
 * 
 * This example demonstrates common Three.js animation performance scenarios
 * that can be identified and diagnosed using 3Lens:
 * 
 * - Skeletal animation with varying bone complexity
 * - Morph target animations
 * - Animation mixer overhead
 * - Keyframe interpolation density
 * 
 * Use the 3Lens overlay to:
 * - Monitor frame time and identify animation-related spikes
 * - Inspect animated objects in the Scene panel
 * - View bone hierarchies and morph target influences
 * - Track animation mixer performance
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
// ANIMATION MIXERS
// =============================================================================

const mixers: THREE.AnimationMixer[] = [];

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
      bone.position.set(0, 0.5, 0);
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
  
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color().setHSL(Math.random(), 0.7, 0.5),
    roughness: 0.5,
    metalness: 0.3,
  });
  
  const { skeleton, rootBone } = createSkeleton(boneCount);
  
  const mesh = new THREE.SkinnedMesh(geometry, material);
  mesh.name = name;
  mesh.add(rootBone);
  mesh.bind(skeleton);
  mesh.position.copy(position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  
  // Create wave animation
  const times = [0, 1, 2, 3, 4];
  const tracks: THREE.KeyframeTrack[] = [];
  
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
  const geometry = new THREE.SphereGeometry(1, 32, 32);
  
  const morphPositions: Float32Array[] = [];
  const positionAttribute = geometry.attributes.position;
  
  for (let t = 0; t < targetCount; t++) {
    const morphArray = new Float32Array(positionAttribute.count * 3);
    
    for (let i = 0; i < positionAttribute.count; i++) {
      const x = positionAttribute.getX(i);
      const y = positionAttribute.getY(i);
      const z = positionAttribute.getZ(i);
      
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
  
  // Create morph animation
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
// ANIMATED OBJECTS
// =============================================================================

/**
 * Creates an object with animation clips
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
      
      const angle = (i / keyframeCount) * Math.PI * 2 + c;
      posValues.push(
        Math.sin(angle) * (0.5 + c * 0.2),
        Math.abs(Math.sin(angle * 2)) * 0.5,
        Math.cos(angle) * (0.5 + c * 0.2)
      );
      
      const quat = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(angle * 0.5, angle, angle * 0.3)
      );
      rotValues.push(quat.x, quat.y, quat.z, quat.w);
      
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
// CREATE DEMO ANIMATIONS
// =============================================================================

function createDemoScene() {
  // Create skeletal characters with varying complexity
  const skeletonGroup = new THREE.Group();
  skeletonGroup.name = 'SkeletalAnimations';
  
  // Simple skeleton characters (20 bones each)
  for (let i = 0; i < 3; i++) {
    const { mesh, mixer } = createSkinnedCharacter(
      20,
      new THREE.Vector3(i * 2 - 2, 0, -5),
      `SimpleChar_${i}`
    );
    skeletonGroup.add(mesh);
    mixers.push(mixer);
  }
  
  // Complex skeleton character (100 bones)
  const { mesh: complexChar, mixer: complexMixer } = createSkinnedCharacter(
    100,
    new THREE.Vector3(6, 0, -5),
    'ComplexChar'
  );
  skeletonGroup.add(complexChar);
  mixers.push(complexMixer);
  
  scene.add(skeletonGroup);
  
  // Create morph target meshes
  const morphGroup = new THREE.Group();
  morphGroup.name = 'MorphTargetAnimations';
  
  // Simple morph (4 targets)
  for (let i = 0; i < 3; i++) {
    const { mesh, mixer } = createMorphTargetMesh(
      4,
      new THREE.Vector3(i * 3 - 3, 1.5, 0),
      `SimpleMorph_${i}`
    );
    morphGroup.add(mesh);
    mixers.push(mixer);
  }
  
  // Complex morph (32 targets)
  const { mesh: complexMorph, mixer: morphMixer } = createMorphTargetMesh(
    32,
    new THREE.Vector3(6, 1.5, 0),
    'ComplexMorph'
  );
  morphGroup.add(complexMorph);
  mixers.push(morphMixer);
  
  scene.add(morphGroup);
  
  // Create animated objects with varying keyframe density
  const animGroup = new THREE.Group();
  animGroup.name = 'KeyframeAnimations';
  
  // Sparse keyframes
  const { mesh: sparse, mixer: sparseMixer, actions: sparseActions } = createAnimatedObject(
    new THREE.Vector3(-4, 0.5, 5),
    'SparseKeyframes',
    1,
    10
  );
  sparseActions[0].play();
  animGroup.add(sparse);
  mixers.push(sparseMixer);
  
  // Dense keyframes
  const { mesh: dense, mixer: denseMixer, actions: denseActions } = createAnimatedObject(
    new THREE.Vector3(0, 0.5, 5),
    'DenseKeyframes',
    1,
    500
  );
  denseActions[0].play();
  animGroup.add(dense);
  mixers.push(denseMixer);
  
  // Blended animations
  const { mesh: blended, mixer: blendMixer, actions: blendActions } = createAnimatedObject(
    new THREE.Vector3(4, 0.5, 5),
    'BlendedAnimations',
    3,
    30
  );
  blendActions.forEach((action, i) => {
    action.play();
    action.setEffectiveWeight(1 / blendActions.length);
    action.setEffectiveTimeScale(1 + i * 0.2);
  });
  animGroup.add(blended);
  mixers.push(blendMixer);
  
  scene.add(animGroup);
}

createDemoScene();

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
probe.setAppName('Animation Profiling');

// Register animation system as logical entity
probe.registerLogicalEntity('animation-system', 'Animation System', {
  category: 'Animation',
  mixerCount: () => mixers.length,
  totalBones: () => {
    let count = 0;
    scene.traverse(child => {
      if (child instanceof THREE.SkinnedMesh && child.skeleton) {
        count += child.skeleton.bones.length;
      }
    });
    return count;
  },
  totalMorphTargets: () => {
    let count = 0;
    scene.traverse(child => {
      if (child instanceof THREE.Mesh && child.morphTargetInfluences) {
        count += child.morphTargetInfluences.length;
      }
    });
    return count;
  },
});

createOverlay({ probe, theme: 'dark' });

// =============================================================================
// ANIMATION LOOP
// =============================================================================

function animate() {
  requestAnimationFrame(animate);
  
  const delta = clock.getDelta();
  
  controls.update();
  
  // Update all animation mixers
  mixers.forEach(mixer => {
    mixer.update(delta);
  });
  
  // Update logical entity with current stats
  let totalActions = 0;
  mixers.forEach(mixer => {
    const mixerAny = mixer as any;
    if (mixerAny._actions) {
      totalActions += mixerAny._actions.length;
    }
  });
  
  probe.updateLogicalEntity('animation-system', {
    activeActions: totalActions,
    lastUpdateTime: performance.now(),
  });
  
  renderer.render(scene, camera);
}

animate();

// =============================================================================
// EVENT HANDLERS
// =============================================================================

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

console.log(`
🎬 Animation Profiling Example
==============================
This example demonstrates various animation performance scenarios.

Open the 3Lens overlay to inspect:
- Scene panel: View animated objects, bone hierarchies, morph targets
- Performance panel: Monitor frame time and animation overhead
- Animation system entity: Track mixer count, bones, and morph targets

Animation Scenarios:
- Skeletal animations (20 bones vs 100 bones)
- Morph target animations (4 targets vs 32 targets)  
- Keyframe density (sparse vs dense)
- Animation blending (multiple clips)
`);
