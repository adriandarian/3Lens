<script lang="ts">
  import { T } from '@threlte/core';
</script>

<!-- Ambient light -->
<T.AmbientLight intensity={0.3} />

<!-- Main directional light with shadows -->
<T.DirectionalLight
  position={[5, 10, 5]}
  intensity={1.5}
  castShadow
  shadow.mapSize.width={2048}
  shadow.mapSize.height={2048}
  shadow.camera.far={50}
  shadow.camera.left={-10}
  shadow.camera.right={10}
  shadow.camera.top={10}
  shadow.camera.bottom={-10}
/>

<!-- Accent point light -->
<T.PointLight
  position={[-3, 3, 2]}
  intensity={0.5}
  color="#ff7f50"
/>

