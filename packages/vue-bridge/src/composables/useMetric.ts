import { ref, watch, type Ref } from 'vue';
import type { FrameStats } from '@3lens/core';
import { useThreeLens } from './useThreeLens';
import type { UseMetricOptions, MetricValue } from '../types';

type MetricExtractor<T> = (stats: FrameStats) => T;

/**
 * Composable to extract and track a specific metric from frame stats
 *
 * @param extractor Function to extract the metric value from FrameStats
 * @param options Configuration options
 * @returns Reactive metric value with history and statistics
 *
 * @example
 * ```vue
 * <script setup>
 * import { useMetric } from '@3lens/vue-bridge';
 *
 * const gpuTime = useMetric(
 *   (stats) => stats.gpuTimeMs ?? 0,
 *   { smoothed: true }
 * );
 * </script>
 *
 * <template>
 *   <div>GPU Time: {{ gpuTime.current.toFixed(2) }}ms</div>
 *   <div>Min: {{ gpuTime.min.toFixed(2) }}ms</div>
 *   <div>Max: {{ gpuTime.max.toFixed(2) }}ms</div>
 * </template>
 * ```
 */
export function useMetric(
  extractor: MetricExtractor<number>,
  options: UseMetricOptions = {}
): Ref<MetricValue<number>> {
  const { sampleRate = 1, smoothed = false, smoothingSamples = 10 } = options;
  const { frameStats } = useThreeLens();

  const metric = ref<MetricValue<number>>({
    current: 0,
    min: Infinity,
    max: -Infinity,
    avg: 0,
    history: [],
  });

  let frameCount = 0;
  const history: number[] = [];
  const maxHistory = 300;

  watch(frameStats, (stats) => {
    if (!stats) return;

    frameCount++;
    if (frameCount % sampleRate !== 0) return;

    const value = extractor(stats);
    history.push(value);

    if (history.length > maxHistory) {
      history.splice(0, history.length - maxHistory);
    }

    const min = Math.min(...history);
    const max = Math.max(...history);
    const avg = history.reduce((a, b) => a + b, 0) / history.length;

    let current = value;
    if (smoothed && history.length >= smoothingSamples) {
      const recentSamples = history.slice(-smoothingSamples);
      current = recentSamples.reduce((a, b) => a + b, 0) / smoothingSamples;
    }

    metric.value = {
      current,
      min,
      max,
      avg,
      history: [...history],
    };
  });

  return metric;
}

/**
 * Composable to get the current FPS
 *
 * @param smoothed Whether to smooth the value
 * @returns Reactive FPS metric value
 *
 * @example
 * ```vue
 * <script setup>
 * import { useFPS } from '@3lens/vue-bridge';
 *
 * const fps = useFPS(true);
 * </script>
 *
 * <template>
 *   <div>FPS: {{ fps.current.toFixed(0) }}</div>
 * </template>
 * ```
 */
export function useFPS(smoothed = true): Ref<MetricValue<number>> {
  return useMetric((stats) => stats.performance?.fps ?? 0, {
    smoothed,
    smoothingSamples: 30,
  });
}

/**
 * Composable to get the current frame time
 *
 * @param smoothed Whether to smooth the value
 * @returns Reactive frame time metric value
 */
export function useFrameTime(smoothed = false): Ref<MetricValue<number>> {
  return useMetric((stats) => stats.cpuTimeMs, { smoothed });
}

/**
 * Composable to get the current draw call count
 *
 * @returns Reactive draw calls metric value
 */
export function useDrawCalls(): Ref<MetricValue<number>> {
  return useMetric((stats) => stats.drawCalls);
}

/**
 * Composable to get the current triangle count
 *
 * @returns Reactive triangles metric value
 */
export function useTriangles(): Ref<MetricValue<number>> {
  return useMetric((stats) => stats.triangles);
}

/**
 * Composable to get estimated GPU memory usage
 *
 * @returns Reactive GPU memory metric value (in bytes)
 */
export function useGPUMemory(): Ref<MetricValue<number>> {
  return useMetric((stats) => stats.memory?.totalGpuMemory ?? 0);
}

/**
 * Composable to get texture count
 *
 * @returns Reactive texture count metric value
 */
export function useTextureCount(): Ref<MetricValue<number>> {
  return useMetric((stats) => stats.memory?.textures ?? 0);
}

/**
 * Composable to get geometry count
 *
 * @returns Reactive geometry count metric value
 */
export function useGeometryCount(): Ref<MetricValue<number>> {
  return useMetric((stats) => stats.memory?.geometries ?? 0);
}
