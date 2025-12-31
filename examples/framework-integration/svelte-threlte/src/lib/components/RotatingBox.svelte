<script lang="ts">
  import { T, useTask } from '@threlte/core';
  import * as THREE from 'three';
  
  export let position: [number, number, number] = [0, 0, 0];
  
  let mesh: THREE.Mesh;
  let hovered = false;
  let clicked = false;
  
  // Animation loop
  useTask((delta) => {
    if (mesh) {
      mesh.rotation.x += delta * 0.5;
      mesh.rotation.y += delta * 0.3;
    }
  });
</script>

<T.Mesh
  bind:ref={mesh}
  {position}
  scale={clicked ? 1.2 : 1}
  castShadow
  on:click={() => clicked = !clicked}
  on:pointerenter={() => hovered = true}
  on:pointerleave={() => hovered = false}
>
  <T.BoxGeometry args={[1.5, 1.5, 1.5]} />
  <T.MeshStandardMaterial
    color={hovered ? '#ff6b6b' : '#4ecdc4'}
    roughness={0.3}
    metalness={0.5}
  />
</T.Mesh>

