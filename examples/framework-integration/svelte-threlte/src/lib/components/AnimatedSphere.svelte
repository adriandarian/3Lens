<script lang="ts">
  import { T, useTask } from '@threlte/core';
  import * as THREE from 'three';
  
  export let position: [number, number, number] = [0, 0, 0];
  
  let mesh: THREE.Mesh;
  let elapsed = 0;
  const baseY = position[1];
  
  // Animation loop
  useTask((delta) => {
    elapsed += delta;
    if (mesh) {
      mesh.position.y = baseY + Math.abs(Math.sin(elapsed * 2)) * 0.5;
      mesh.rotation.z = Math.sin(elapsed) * 0.2;
    }
  });
</script>

<T.Mesh
  bind:ref={mesh}
  {position}
  castShadow
>
  <T.SphereGeometry args={[0.8, 32, 32]} />
  <T.MeshPhysicalMaterial
    color="#9b59b6"
    roughness={0.1}
    metalness={0.8}
    clearcoat={1}
    clearcoatRoughness={0.1}
  />
</T.Mesh>

