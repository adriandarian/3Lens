import { useCallback, useEffect, useRef, useState } from 'react';
import { useThreeLensContext } from '../context';
import type { FrameStats } from '@3lens/core';
import type { UseMetricOptions, MetricValue } from '../types';

type MetricExtractor<T> = (stats: FrameStats) => T;

/**
 * Hook to extract and track a specific metric from frame stats
 *
 * @param extractor Function to extract the metric value from FrameStats
 * @param options Configuration options
 * @returns The metric value with history and statistics
 *
 * @example
 * ```tsx
 * function FPSDisplay() {
 *   const fps = useMetric((stats) => stats.fps, { smoothed: true });
 *
 *   return (
 *     <div>
 *       <span>FPS: {fps.current.toFixed(0)}</span>
 *       <span>Min: {fps.min.toFixed(0)}</span>
 *       <span>Max: {fps.max.toFixed(0)}</span>
 *     </div>
 *   );
 * }
 * ```
 */
export function useMetric(
  extractor: MetricExtractor<number>,
  options: UseMetricOptions = {}
): MetricValue<number> {
  const { sampleRate = 1, smoothed = false, smoothingSamples = 10 } = options;
  const { frameStats } = useThreeLensContext();

  const [metric, setMetric] = useState<MetricValue<number>>({
    current: 0,
    min: Infinity,
    max: -Infinity,
    avg: 0,
    history: [],
  });

  const frameCountRef = useRef(0);
  const historyRef = useRef<number[]>([]);

  useEffect(() => {
    if (!frameStats) return;

    frameCountRef.current++;

    // Only sample at the specified rate
    if (frameCountRef.current % sampleRate !== 0) return;

    const value = extractor(frameStats);
    historyRef.current.push(value);

    // Keep history bounded
    const maxHistory = 300;
    if (historyRef.current.length > maxHistory) {
      historyRef.current = historyRef.current.slice(-maxHistory);
    }

    const history = historyRef.current;
    const min = Math.min(...history);
    const max = Math.max(...history);
    const avg = history.reduce((a, b) => a + b, 0) / history.length;

    let current = value;
    if (smoothed && history.length >= smoothingSamples) {
      const recentSamples = history.slice(-smoothingSamples);
      current = recentSamples.reduce((a, b) => a + b, 0) / smoothingSamples;
    }

    setMetric({
      current,
      min,
      max,
      avg,
      history: [...history],
    });
  }, [frameStats, extractor, sampleRate, smoothed, smoothingSamples]);

  return metric;
}

/**
 * Hook to get the current FPS
 *
 * @param smoothed Whether to smooth the value
 * @returns FPS metric value
 *
 * @example
 * ```tsx
 * function FPSCounter() {
 *   const fps = useFPS(true);
 *   return <div>FPS: {fps.current.toFixed(0)}</div>;
 * }
 * ```
 */
export function useFPS(smoothed = true): MetricValue<number> {
  return useMetric((stats) => stats.fps, { smoothed, smoothingSamples: 30 });
}

/**
 * Hook to get the current frame time in milliseconds
 *
 * @param smoothed Whether to smooth the value
 * @returns Frame time metric value
 */
export function useFrameTime(smoothed = false): MetricValue<number> {
  return useMetric((stats) => stats.frameTimeMs, { smoothed });
}

/**
 * Hook to get the current draw call count
 *
 * @returns Draw calls metric value
 */
export function useDrawCalls(): MetricValue<number> {
  return useMetric((stats) => stats.drawCalls);
}

/**
 * Hook to get the current triangle count
 *
 * @returns Triangles metric value
 */
export function useTriangles(): MetricValue<number> {
  return useMetric((stats) => stats.triangles);
}

/**
 * Hook to get estimated GPU memory usage
 *
 * @returns GPU memory in bytes
 */
export function useGPUMemory(): MetricValue<number> {
  return useMetric((stats) => stats.memory?.gpuMemoryEstimate ?? 0);
}

/**
 * Hook to get texture count
 *
 * @returns Texture count metric value
 */
export function useTextureCount(): MetricValue<number> {
  return useMetric((stats) => stats.memory?.textureCount ?? 0);
}

/**
 * Hook to get geometry count
 *
 * @returns Geometry count metric value
 */
export function useGeometryCount(): MetricValue<number> {
  return useMetric((stats) => stats.memory?.geometryCount ?? 0);
}

