<script setup lang="ts">
</script>

<template>
  <TresMesh
    :rotation="[-Math.PI / 2, 0, 0]"
    :position="[0, -0.5, 0]"
    receive-shadow
  >
    <TresPlaneGeometry :args="[20, 20]" />
    <TresMeshStandardMaterial
      color="#1a1a2e"
      :roughness="0.8"
      :metalness="0.2"
    />
  </TresMesh>
</template>

