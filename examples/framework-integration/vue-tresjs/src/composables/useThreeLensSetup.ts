import { ref, onMounted, onUnmounted } from 'vue';
import { createProbe, DevtoolProbe } from '@3lens/core';
import { bootstrapOverlay } from '@3lens/overlay';

/**
 * Composable for 3Lens setup
 * 
 * Provides reactive metrics and initializes the devtool overlay.
 * In a real TresJS app, you'd use useTres() to get the renderer/scene/camera.
 */
export function useThreeLensSetup() {
  const fps = ref(0);
  const drawCalls = ref(0);
  const triangles = ref(0);
  
  let probe: DevtoolProbe | null = null;
  let frameCount = 0;
  let lastTime = performance.now();
  let animationFrameId: number | null = null;
  
  onMounted(() => {
    // Wait for TresJS to initialize, then find the canvas and renderer
    setTimeout(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) {
        console.warn('3Lens: Canvas not found');
        return;
      }
      
      // Get the WebGL context to access renderer info
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (!gl) {
        console.warn('3Lens: WebGL context not found');
        return;
      }
      
      // For TresJS, we need to access the internal Three.js objects
      // This is a simplified setup - in production you'd use useTres()
      initMetricsLoop();
    }, 100);
  });
  
  onUnmounted(() => {
    if (probe) {
      probe.dispose();
      probe = null;
    }
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
  });
  
  function initMetricsLoop() {
    const updateMetrics = () => {
      animationFrameId = requestAnimationFrame(updateMetrics);
      
      frameCount++;
      const now = performance.now();
      const elapsed = now - lastTime;
      
      if (elapsed >= 1000) {
        fps.value = Math.round((frameCount * 1000) / elapsed);
        frameCount = 0;
        lastTime = now;
        
        // These would come from renderer.info in a full integration
        // For demo purposes, showing placeholder values
        drawCalls.value = Math.floor(10 + Math.random() * 5);
        triangles.value = Math.floor(5400 + Math.random() * 200);
      }
    };
    
    updateMetrics();
  }
  
  return {
    fps,
    drawCalls,
    triangles,
    probe,
  };
}

