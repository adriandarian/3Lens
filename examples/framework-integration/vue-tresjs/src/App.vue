<script setup lang="ts">
import { TresCanvas } from '@tresjs/core';
import Scene from './components/Scene.vue';
import InfoPanel from './components/InfoPanel.vue';
import { useThreeLensSetup } from './composables/useThreeLensSetup';

// Initialize 3Lens probe
const { fps, drawCalls, triangles } = useThreeLensSetup();
</script>

<template>
  <div class="app-container">
    <TresCanvas 
      shadows 
      :camera="{ position: [5, 5, 8], fov: 60 }"
      :renderer="{ antialias: true, toneMapping: 4, toneMappingExposure: 1.2 }"
    >
      <Scene />
    </TresCanvas>
    
    <InfoPanel 
      :fps="fps" 
      :draw-calls="drawCalls" 
      :triangles="triangles" 
    />
  </div>
</template>

<style scoped>
.app-container {
  width: 100vw;
  height: 100vh;
  position: relative;
}
</style>

