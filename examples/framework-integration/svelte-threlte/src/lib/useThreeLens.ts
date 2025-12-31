import { writable, type Writable } from 'svelte/store';
import { onMount, onDestroy } from 'svelte';

/**
 * Svelte store for 3Lens metrics
 * 
 * In a full integration, this would connect to the DevtoolProbe.
 * For this example, we track basic FPS metrics.
 */
export function useThreeLens() {
  const fps: Writable<number> = writable(0);
  const drawCalls: Writable<number> = writable(0);
  const triangles: Writable<number> = writable(0);
  
  let frameCount = 0;
  let lastTime = performance.now();
  let animationFrameId: number | null = null;
  
  function updateMetrics() {
    animationFrameId = requestAnimationFrame(updateMetrics);
    
    frameCount++;
    const now = performance.now();
    const elapsed = now - lastTime;
    
    if (elapsed >= 1000) {
      fps.set(Math.round((frameCount * 1000) / elapsed));
      frameCount = 0;
      lastTime = now;
      
      // These would come from renderer.info in a full integration
      drawCalls.set(Math.floor(10 + Math.random() * 5));
      triangles.set(Math.floor(5400 + Math.random() * 200));
    }
  }
  
  onMount(() => {
    updateMetrics();
  });
  
  onDestroy(() => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
  });
  
  return { fps, drawCalls, triangles };
}

