# 3Lens Animation Profiling Example

This example demonstrates how to use 3Lens to identify and diagnose common Three.js animation performance issues. It provides an interactive "lab" where you can toggle various animation scenarios on and off while observing their impact in real-time.

## Getting Started

```bash
# From the monorepo root
pnpm install
pnpm --filter @3lens/example-animation-profiling dev
```

Then open http://localhost:3012 in your browser.

## Animation Issues Demonstrated

### 1. Skeletal Animation (HIGH Impact)

**The Problem:** Skinned mesh animations with many bones require significant CPU processing for bone matrix calculations.

**Scenarios:**
- **Simple Skeleton (20 bones):** Typical character rig complexity
- **Complex Skeleton (100 bones):** Highly detailed rigs (facial bones, fingers, etc.)

**Symptoms:**
- CPU time increases with bone count
- Frame rate drops with multiple characters
- Animation update time visible in stats

**How 3Lens Helps:**
- Performance Panel → Overview shows frame time breakdown
- Scene Panel → Object inspector shows bone hierarchy
- Cost Analysis highlights expensive skinned meshes

**Solutions:**
- Use LOD for distant characters with simplified rigs
- Limit simultaneous animated characters
- Consider GPU skinning for WebGL2

---

### 2. Morph Targets (MEDIUM Impact)

**The Problem:** Morph target animations (blend shapes) require interpolating all vertex positions for each active target.

**Scenarios:**
- **Few Targets (4):** Basic facial expressions
- **Many Targets (32):** Full facial animation system

**Symptoms:**
- GPU memory increases with target count
- Per-frame interpolation overhead
- More noticeable on high-poly meshes

**How 3Lens Helps:**
- Memory Panel → Shows morph target memory usage
- Performance Panel → GPU time increases with active morphs
- Scene Panel → Shows morph influence values

**Solutions:**
- Limit simultaneous active morph targets
- Use lower-poly meshes for morph-heavy objects
- Combine similar expressions into single targets

---

### 3. Animation Mixers (MEDIUM Impact)

**The Problem:** Each AnimationMixer processes its clips independently. Many mixers or blended clips add up.

**Scenarios:**
- **Single Clip:** One animation per object
- **Blended (3 clips):** Multiple animations crossfaded
- **Many Mixers (20):** Many independently animated objects

**Symptoms:**
- Animation update time scales with mixer count
- Blending multiple clips multiplies overhead
- Memory usage for clip data

**How 3Lens Helps:**
- Performance Panel → Animation update timing
- Scene Panel → Shows active animations per object
- Stats display shows mixer/action counts

**Solutions:**
- Share mixers when possible (instanced animations)
- Use additive blending sparingly
- Consider baking animations for background characters

---

### 4. Keyframe Density (LOW Impact)

**The Problem:** Dense keyframe tracks require more interpolation calculations and memory.

**Scenarios:**
- **Sparse (10 keys):** Efficiently keyframed animation
- **Dense (1000 keys):** Every-frame baked animation

**Symptoms:**
- Larger animation file sizes
- Slightly higher interpolation cost
- More memory for keyframe data

**How 3Lens Helps:**
- Memory Panel → Shows animation clip memory
- Scene Panel → Clip details show keyframe counts

**Solutions:**
- Use curves with minimal keyframes
- Bake only when necessary
- Consider procedural animation for simple motions

---

## Using 3Lens for Animation Debugging

### Key Metrics to Watch

1. **Frame Time Chart**
   - Watch for spikes when enabling animations
   - Compare CPU vs GPU time contribution

2. **Animation Update Time**
   - Shown in the control panel stats
   - Should stay under 2ms for smooth performance

3. **Scene Explorer**
   - Inspect individual animated objects
   - View bone hierarchies and morph influences

4. **Memory Panel**
   - Track geometry memory (skinned meshes)
   - Monitor animation clip storage

### Debugging Workflow

1. **Baseline**: Start with all animations disabled
2. **Isolate**: Enable one animation type at a time
3. **Measure**: Note the frame time impact
4. **Scale**: Increase count/complexity gradually
5. **Identify**: Find the threshold where performance degrades
6. **Optimize**: Apply appropriate solutions

### Performance Budgets

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| Active Mixers | < 10 | 10-20 | > 20 |
| Active Actions | < 20 | 20-50 | > 50 |
| Total Bones | < 500 | 500-2000 | > 2000 |
| Morph Influences | < 50 | 50-150 | > 150 |
| Animation Update | < 2ms | 2-5ms | > 5ms |

## Code Examples

### Efficient Skeletal Animation

```typescript
// Use InstancedSkinnedMesh for crowds (Three.js r159+)
import { InstancedSkinnedMesh } from 'three/examples/jsm/objects/InstancedSkinnedMesh.js';

const instances = new InstancedSkinnedMesh(geometry, material, skeleton, 100);
```

### LOD for Animated Characters

```typescript
const lod = new THREE.LOD();

// High detail with full skeleton
lod.addLevel(createCharacter(60), 0);    // 60 bones

// Medium detail with simplified skeleton  
lod.addLevel(createCharacter(30), 20);   // 30 bones

// Low detail with minimal skeleton
lod.addLevel(createCharacter(10), 50);   // 10 bones
```

### Morph Target Optimization

```typescript
// Limit active morph targets
const MAX_ACTIVE_MORPHS = 4;

function updateMorphs(mesh: THREE.Mesh, targets: number[]) {
  // Sort by influence and keep only top N
  const sorted = targets
    .map((v, i) => ({ index: i, value: v }))
    .sort((a, b) => b.value - a.value)
    .slice(0, MAX_ACTIVE_MORPHS);
  
  // Reset all
  mesh.morphTargetInfluences?.fill(0);
  
  // Apply top N
  sorted.forEach(({ index, value }) => {
    mesh.morphTargetInfluences![index] = value;
  });
}
```

### Shared Animation Mixer

```typescript
// Share mixer for objects with same animation
const sharedMixer = new THREE.AnimationMixer(scene);

objects.forEach(obj => {
  const action = sharedMixer.clipAction(clip, obj);
  action.play();
});

// Single update for all
sharedMixer.update(delta);
```

## Further Reading

- [Three.js Animation System](https://threejs.org/docs/#manual/en/introduction/Animation-system)
- [Skeletal Animation Best Practices](https://discoverthreejs.com/book/first-steps/animation-system/)
- [WebGL Skinning Performance](https://www.khronos.org/webgl/wiki/Skinning)
