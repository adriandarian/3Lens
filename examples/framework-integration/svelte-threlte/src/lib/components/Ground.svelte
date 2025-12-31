<script lang="ts">
  import { T } from '@threlte/core';
</script>

<T.Mesh
  rotation={[-Math.PI / 2, 0, 0]}
  position={[0, -0.5, 0]}
  receiveShadow
>
  <T.PlaneGeometry args={[20, 20]} />
  <T.MeshStandardMaterial
    color="#1a1a2e"
    roughness={0.8}
    metalness={0.2}
  />
</T.Mesh>

