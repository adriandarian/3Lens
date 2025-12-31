<script lang="ts">
  import { Canvas } from '@threlte/core';
  import Scene from './lib/components/Scene.svelte';
  import InfoPanel from './lib/components/InfoPanel.svelte';
  import { useThreeLens } from './lib/useThreeLens';
  
  const { fps, drawCalls, triangles } = useThreeLens();
</script>

<div class="app-container">
  <Canvas>
    <Scene />
  </Canvas>
  
  <InfoPanel {fps} {drawCalls} {triangles} />
</div>

<style>
  .app-container {
    width: 100vw;
    height: 100vh;
    position: relative;
  }
</style>

