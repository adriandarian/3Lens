<script lang="ts">
  import type { Writable } from 'svelte/store';
  
  export let fps: Writable<number>;
  export let drawCalls: Writable<number>;
  export let triangles: Writable<number>;
</script>

<div class="info-panel">
  <h3>3Lens Svelte + Threlte</h3>
  <p>FPS: {$fps}</p>
  <p>Draw Calls: {$drawCalls}</p>
  <p>Triangles: {$triangles.toLocaleString()}</p>
</div>

<style>
  .info-panel {
    position: absolute;
    top: 20px;
    left: 20px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    font-size: 14px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    z-index: 100;
  }

  .info-panel h3 {
    margin: 0 0 12px 0;
    font-size: 16px;
    color: #4ecdc4;
  }

  .info-panel p {
    margin: 4px 0;
    opacity: 0.9;
  }
</style>

