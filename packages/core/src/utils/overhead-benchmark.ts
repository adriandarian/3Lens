import type { Camera, Scene, WebGLRenderer } from 'three';

import { createProbe } from '../probe/createProbe';
import type { ProbeConfig } from '../types/config';

export interface OverheadBenchmarkOptions {
  frames?: number;
  warmupFrames?: number;
  appName?: string;
  probeConfig?: Partial<ProbeConfig>;
}

export interface OverheadBenchmarkResult {
  baselineAvgMs: number;
  instrumentedAvgMs: number;
  overheadPct: number;
  frames: number;
}

/**
 * Measure the average render time with and without the probe attached.
 * Intended for quick local validation that overhead stays within budget (<5%).
 */
export function measureProbeOverhead(
  renderer: WebGLRenderer,
  scene: Scene,
  camera: Camera,
  options: OverheadBenchmarkOptions = {}
): OverheadBenchmarkResult {
  const frames = options.frames ?? 120;
  const warmupFrames = options.warmupFrames ?? 30;

  // Baseline run (no instrumentation)
  warmup(renderer, scene, camera, warmupFrames);
  const baselineAvgMs = sample(renderer, scene, camera, frames);

  // Instrumented run
  const probe = createProbe({
    appName: options.appName ?? document.title ?? '3Lens App',
    ...options.probeConfig,
  });
  probe.observeRenderer(renderer);
  probe.observeScene(scene);

  warmup(renderer, scene, camera, warmupFrames);
  const instrumentedAvgMs = sample(renderer, scene, camera, frames);

  probe.dispose();

  return {
    baselineAvgMs,
    instrumentedAvgMs,
    overheadPct:
      baselineAvgMs > 0
        ? ((instrumentedAvgMs - baselineAvgMs) / baselineAvgMs) * 100
        : 0,
    frames,
  };
}

function warmup(
  renderer: WebGLRenderer,
  scene: Scene,
  camera: Camera,
  frames: number
): void {
  for (let i = 0; i < frames; i++) {
    renderer.render(scene, camera);
  }
}

function sample(
  renderer: WebGLRenderer,
  scene: Scene,
  camera: Camera,
  frames: number
): number {
  const times: number[] = [];
  for (let i = 0; i < frames; i++) {
    const start = performance.now();
    renderer.render(scene, camera);
    times.push(performance.now() - start);
  }
  const total = times.reduce((sum, t) => sum + t, 0);
  return total / Math.max(1, times.length);
}
