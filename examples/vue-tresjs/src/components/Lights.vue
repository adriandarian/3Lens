<script setup lang="ts">
</script>

<template>
  <!-- Ambient light -->
  <TresAmbientLight :intensity="0.3" />
  
  <!-- Main directional light with shadows -->
  <TresDirectionalLight
    :position="[5, 10, 5]"
    :intensity="1.5"
    cast-shadow
    :shadow-mapSize-width="2048"
    :shadow-mapSize-height="2048"
    :shadow-camera-far="50"
    :shadow-camera-left="-10"
    :shadow-camera-right="10"
    :shadow-camera-top="10"
    :shadow-camera-bottom="-10"
  />
  
  <!-- Accent point light -->
  <TresPointLight
    :position="[-3, 3, 2]"
    :intensity="0.5"
    color="#ff7f50"
  />
</template>

