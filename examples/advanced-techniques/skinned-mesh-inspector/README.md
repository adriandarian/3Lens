# Skinned Mesh Inspector Example

Interactive demonstration of skeletal animation debugging with 3Lens integration for inspecting bones, weights, and animation playback.

![Skinned Mesh Inspector](https://img.shields.io/badge/3Lens-Skinned_Mesh_Inspector-8b5cf6)
![Three.js](https://img.shields.io/badge/Three.js-0.160.0-black)
![Skeletal Animation](https://img.shields.io/badge/Animation-Skeletal-blue)

## Overview

This example provides comprehensive tools for debugging skinned meshes and skeletal animations in Three.js.

| Feature | Description |
|---------|-------------|
| **Skeleton Visualization** | Real-time bone hierarchy display |
| **Weight Painting** | Vertex influence heat map |
| **Animation Playback** | Timeline with frame controls |
| **Bone Inspector** | Transform and influence data |

## Features

### Visualization Modes

| Mode | Purpose |
|------|---------|
| **Skeleton** | Show bone hierarchy with SkeletonHelper |
| **Weights** | Color vertices by bone influence |
| **Bind Pose** | Compare current vs rest pose |
| **Bone Axes** | Local coordinate systems per bone |

### Animation Controls

- **Play/Pause** - Toggle animation playback
- **Frame Step** - Step forward/backward by 1/30s
- **Timeline Scrubbing** - Drag to any animation time
- **Loop Toggle** - Enable/disable animation looping
- **Speed Control** - 0.1x to 2.0x playback speed

### Bone Inspection

- Full transform data (position, rotation, scale)
- Bone index and parent/child relationships
- Vertex influence count per bone
- Interactive bone selection (click in 3D or hierarchy)

## Running the Example

```bash
# From the repository root
pnpm install
pnpm --filter skinned-mesh-inspector dev
```

Open [http://localhost:3032](http://localhost:3032) in your browser.

## Scene Setup

The example creates a procedural humanoid skeleton with:

### Bone Hierarchy (22 bones)

```
Hips
├── Spine
│   └── Spine1
│       └── Spine2
│           ├── Neck
│           │   └── Head
│           ├── LeftShoulder
│           │   └── LeftArm
│           │       └── LeftForeArm
│           │           └── LeftHand
│           └── RightShoulder
│               └── RightArm
│                   └── RightForeArm
│                       └── RightHand
├── LeftUpLeg
│   └── LeftLeg
│       └── LeftFoot
│           └── LeftToeBase
└── RightUpLeg
    └── RightLeg
        └── RightFoot
            └── RightToeBase
```

### Included Animations

| Animation | Duration | Description |
|-----------|----------|-------------|
| Idle | 2.0s | Subtle breathing motion |
| Walk | 1.0s | Basic walk cycle |
| Run | 0.8s | Fast locomotion |

## Technical Implementation

### Skinned Mesh Creation

```typescript
// Create skeleton from bones array
const skeleton = new THREE.Skeleton(bones);

// Create skinned mesh with material
const material = new THREE.MeshStandardMaterial({
  skinning: true,
});
const skinnedMesh = new THREE.SkinnedMesh(geometry, material);

// Bind skeleton to mesh
skinnedMesh.add(bones[0]); // Add root bone
skinnedMesh.bind(skeleton);
```

### Skin Weights Setup

```typescript
// Each vertex needs skinIndex and skinWeight attributes
// skinIndex: which 4 bones influence this vertex
// skinWeight: how much each bone influences (sum to 1.0)
geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(indices, 4));
geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(weights, 4));
```

### Animation System

```typescript
// Create animation mixer
const mixer = new THREE.AnimationMixer(skinnedMesh);

// Create keyframe tracks
const track = new THREE.QuaternionKeyframeTrack(
  'BoneName.quaternion',
  [0, 0.5, 1],  // times
  [...q1, ...q2, ...q3]  // quaternion values
);

// Create and play clip
const clip = new THREE.AnimationClip('Walk', 1.0, [track]);
const action = mixer.clipAction(clip);
action.play();

// Update in animation loop
mixer.update(deltaTime);
```

### Weight Visualization

```typescript
function visualizeWeights(): void {
  const skinWeight = geometry.attributes.skinWeight;
  const colors = new Float32Array(vertexCount * 3);

  for (let i = 0; i < vertexCount; i++) {
    // Find highest weight
    let maxWeight = 0;
    for (let j = 0; j < 4; j++) {
      maxWeight = Math.max(maxWeight, skinWeight.getComponent(i, j));
    }
    
    // Map to color (blue→green→yellow→orange→red)
    const color = weightToColor(maxWeight);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
}
```

## Weight Color Legend

| Color | Weight | Meaning |
|-------|--------|---------|
| 🔵 Blue | 0.0 | No influence |
| 🟢 Green | 0.25 | Low influence |
| 🟡 Yellow | 0.5 | Medium influence |
| 🟠 Orange | 0.75 | High influence |
| 🔴 Red | 1.0 | Full influence |

## 3Lens Integration

```typescript
// Register skeleton system
probe.registerLogicalEntity({
  id: 'skeleton-system',
  name: 'Skeletal Animation System',
  type: 'animation',
  object3D: skinnedMesh,
  metadata: {
    boneCount: skeleton.bones.length,
    vertexCount: geometry.attributes.position.count,
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
      parentBone: bone.parent?.name,
    }
  });
});
```

## Performance Considerations

### Vertex Skinning

- **Max 4 influences per vertex** - Standard GPU skinning limit
- **Weights must sum to 1.0** - Normalized for correct deformation
- **Use indexed geometry** - Reduces vertex buffer size

### Animation Optimization

- **Bake animations** - Convert FK to matrices offline
- **LOD skeletons** - Reduce bones for distant objects
- **Animation compression** - Quantize keyframes

## Files

```
skinned-mesh-inspector/
├── src/
│   └── main.ts          # Main implementation
├── index.html           # UI layout
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript config
├── vite.config.ts       # Vite config (port 3032)
└── README.md            # This file
```

## Related Examples

- [Animation Profiling](../../debugging-profiling/animation-profiling/) - Performance analysis
- [Morph Target Analyzer](../morph-target-analyzer/) - Shape key debugging
- [3D Model Viewer](../../real-world-scenarios/3d-model-viewer/) - GLTF loading

## Resources

- [Three.js SkinnedMesh](https://threejs.org/docs/#api/en/objects/SkinnedMesh)
- [Three.js Skeleton](https://threejs.org/docs/#api/en/objects/Skeleton)
- [Three.js AnimationMixer](https://threejs.org/docs/#api/en/animation/AnimationMixer)
- [glTF Skinning Specification](https://www.khronos.org/registry/glTF/specs/2.0/glTF-2.0.html#skins)
