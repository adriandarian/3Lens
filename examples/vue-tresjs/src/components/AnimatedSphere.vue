<script setup lang="ts">
import { ref } from 'vue';
import { useRenderLoop } from '@tresjs/core';

const props = defineProps<{
  position?: [number, number, number];
}>();

const sphereRef = ref();
const baseY = props.position?.[1] ?? 1;

// Animation loop
const { onLoop } = useRenderLoop();

onLoop(({ elapsed }) => {
  if (sphereRef.value) {
    sphereRef.value.position.y = baseY + Math.abs(Math.sin(elapsed * 2)) * 0.5;
    sphereRef.value.rotation.z = Math.sin(elapsed) * 0.2;
  }
});
</script>

<template>
  <TresMesh
    ref="sphereRef"
    :position="position"
    cast-shadow
  >
    <TresSphereGeometry :args="[0.8, 32, 32]" />
    <TresMeshPhysicalMaterial
      color="#9b59b6"
      :roughness="0.1"
      :metalness="0.8"
      :clearcoat="1"
      :clearcoatRoughness="0.1"
    />
  </TresMesh>
</template>

