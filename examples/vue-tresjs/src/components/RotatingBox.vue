<script setup lang="ts">
import { ref } from 'vue';
import { useRenderLoop } from '@tresjs/core';

defineProps<{
  position?: [number, number, number];
}>();

const boxRef = ref();
const hovered = ref(false);
const clicked = ref(false);

// Animation loop
const { onLoop } = useRenderLoop();

onLoop(({ delta }) => {
  if (boxRef.value) {
    boxRef.value.rotation.x += delta * 0.5;
    boxRef.value.rotation.y += delta * 0.3;
  }
});
</script>

<template>
  <TresMesh
    ref="boxRef"
    :position="position"
    :scale="clicked ? 1.2 : 1"
    cast-shadow
    @click="clicked = !clicked"
    @pointer-over="hovered = true"
    @pointer-out="hovered = false"
  >
    <TresBoxGeometry :args="[1.5, 1.5, 1.5]" />
    <TresMeshStandardMaterial
      :color="hovered ? '#ff6b6b' : '#4ecdc4'"
      :roughness="0.3"
      :metalness="0.5"
    />
  </TresMesh>
</template>

