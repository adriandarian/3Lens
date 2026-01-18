# Skinned Mesh Inspector

This example demonstrates skeletal animation debugging with **3Lens** integration for inspecting bone hierarchies, transforms, and animation state.

## Features

- Procedural humanoid with 22 bones
- Three animations: Idle, Walk, Run
- Skeleton visualization helper
- Bone transform inspection via 3Lens

## Using 3Lens for Skeleton Debugging

### Open the 3Lens Overlay

Press the 3Lens hotkey to access the devtools panel.

### Inspect Skeleton System

The **Skeletal Animation System** entity shows:
- Total bone count
- Vertex count
- Animation count
- Max influences per vertex
- Current animation and duration

### Inspect Individual Bones

Each bone is registered as a logical entity with:
- Bone index
- Parent bone name
- Child count
- Local position (updated during animation)
- Local rotation (updated during animation)

### Bone Hierarchy

The skeleton follows a standard humanoid rig:

```
Hips
├── Spine
│   └── Spine1
│       └── Spine2
│           ├── Neck → Head
│           ├── LeftShoulder → LeftArm → LeftForeArm → LeftHand
│           └── RightShoulder → RightArm → RightForeArm → RightHand
├── LeftUpLeg → LeftLeg → LeftFoot → LeftToeBase
└── RightUpLeg → RightLeg → RightFoot → RightToeBase
```

### What to Look For

1. **Bone Transforms** - Watch how position/rotation change during animation
2. **Hierarchy** - Explore parent-child relationships
3. **Skinning** - Each vertex is influenced by up to 4 bones
4. **Animation Clips** - Inspect registered animation entities

## Controls

- **Play/Pause** - Toggle animation playback
- **Idle/Walk/Run** - Switch between animations

## Key Files

- `src/main.ts` - Skeleton creation and 3Lens integration
- `index.html` - Minimal UI

## Running the Example

```bash
cd examples/advanced-techniques/skinned-mesh-inspector
npm install
npm run dev
```
