<script setup lang="ts">
import { ref } from 'vue';
import { useRenderLoop } from '@tresjs/core';

defineProps<{
  position?: [number, number, number];
}>();

const groupRef = ref();
const torus1Ref = ref();
const torus2Ref = ref();
const torus3Ref = ref();

// Animation loop
const { onLoop } = useRenderLoop();

onLoop(({ elapsed }) => {
  if (groupRef.value) {
    groupRef.value.rotation.y = elapsed * 0.3;
  }
  
  if (torus1Ref.value) {
    torus1Ref.value.rotation.x = elapsed * 2;
  }
  if (torus2Ref.value) {
    torus2Ref.value.rotation.x = elapsed * 2 + Math.PI * 0.66;
  }
  if (torus3Ref.value) {
    torus3Ref.value.rotation.x = elapsed * 2 + Math.PI * 1.33;
  }
});

const torusArgs: [number, number, number, number] = [0.5, 0.15, 16, 32];
</script>

<template>
  <TresGroup ref="groupRef" :position="position">
    <!-- Red torus -->
    <TresMesh ref="torus1Ref" :position="[1.5, 0, 0]" cast-shadow>
      <TresTorusGeometry :args="torusArgs" />
      <TresMeshStandardMaterial color="#e74c3c" :roughness="0.4" />
    </TresMesh>
    
    <!-- Green torus -->
    <TresMesh ref="torus2Ref" :position="[-0.75, 1.3, 0]" cast-shadow>
      <TresTorusGeometry :args="torusArgs" />
      <TresMeshStandardMaterial color="#2ecc71" :roughness="0.4" />
    </TresMesh>
    
    <!-- Blue torus -->
    <TresMesh ref="torus3Ref" :position="[-0.75, -1.3, 0]" cast-shadow>
      <TresTorusGeometry :args="torusArgs" />
      <TresMeshStandardMaterial color="#3498db" :roughness="0.4" />
    </TresMesh>
  </TresGroup>
</template>

