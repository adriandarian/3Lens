<script lang="ts">
  import { T, useTask } from '@threlte/core';
  import * as THREE from 'three';
  
  export let position: [number, number, number] = [0, 0, 0];
  
  let group: THREE.Group;
  let torus1: THREE.Mesh;
  let torus2: THREE.Mesh;
  let torus3: THREE.Mesh;
  let elapsed = 0;
  
  const torusArgs: [number, number, number, number] = [0.5, 0.15, 16, 32];
  
  // Animation loop
  useTask((delta) => {
    elapsed += delta;
    
    if (group) {
      group.rotation.y = elapsed * 0.3;
    }
    
    if (torus1) torus1.rotation.x = elapsed * 2;
    if (torus2) torus2.rotation.x = elapsed * 2 + Math.PI * 0.66;
    if (torus3) torus3.rotation.x = elapsed * 2 + Math.PI * 1.33;
  });
</script>

<T.Group bind:ref={group} {position}>
  <!-- Red torus -->
  <T.Mesh bind:ref={torus1} position={[1.5, 0, 0]} castShadow>
    <T.TorusGeometry args={torusArgs} />
    <T.MeshStandardMaterial color="#e74c3c" roughness={0.4} />
  </T.Mesh>
  
  <!-- Green torus -->
  <T.Mesh bind:ref={torus2} position={[-0.75, 1.3, 0]} castShadow>
    <T.TorusGeometry args={torusArgs} />
    <T.MeshStandardMaterial color="#2ecc71" roughness={0.4} />
  </T.Mesh>
  
  <!-- Blue torus -->
  <T.Mesh bind:ref={torus3} position={[-0.75, -1.3, 0]} castShadow>
    <T.TorusGeometry args={torusArgs} />
    <T.MeshStandardMaterial color="#3498db" roughness={0.4} />
  </T.Mesh>
</T.Group>

