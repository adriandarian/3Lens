<script lang="ts">
  import { T } from '@threlte/core';
  import { OrbitControls, ContactShadows } from '@threlte/extras';
  import RotatingBox from './RotatingBox.svelte';
  import AnimatedSphere from './AnimatedSphere.svelte';
  import TorusGroup from './TorusGroup.svelte';
  import Ground from './Ground.svelte';
  import Lights from './Lights.svelte';
</script>

<!-- Camera -->
<T.PerspectiveCamera
  makeDefault
  position={[5, 5, 8]}
  fov={60}
/>

<!-- Lighting -->
<Lights />

<!-- Scene background -->
<T.Color attach="background" args={['#0a0a0f']} />
<T.Fog attach="fog" args={['#0a0a0f', 10, 50]} />

<!-- Ground plane with contact shadows -->
<Ground />
<ContactShadows
  position={[0, -0.49, 0]}
  opacity={0.4}
  scale={10}
  blur={2}
  far={4}
/>

<!-- Animated objects -->
<RotatingBox position={[-2, 1, 0]} />
<AnimatedSphere position={[2, 1, 0]} />
<TorusGroup position={[0, 2, -2]} />

<!-- Camera controls -->
<OrbitControls
  enableDamping
  dampingFactor={0.05}
  minDistance={3}
  maxDistance={20}
/>

