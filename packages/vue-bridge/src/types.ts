import type { InjectionKey, Ref, ComputedRef } from 'vue';
import type { DevtoolProbe, FrameStats, SceneSnapshot, SceneNode, ProbeConfig } from '@3lens/core';

/**
 * Configuration for the 3Lens Vue plugin
 */
export interface ThreeLensPluginConfig extends Partial<ProbeConfig> {
  /**
   * Whether to show the overlay UI
   * @default true
   */
  showOverlay?: boolean;

  /**
   * Keyboard shortcut to toggle the overlay (e.g., 'ctrl+shift+d')
   * @default 'ctrl+shift+d'
   */
  toggleShortcut?: string;

  /**
   * Whether to enable debug logging
   * @default false
   */
  debug?: boolean;
}

/**
 * Context value provided via Vue's provide/inject
 */
export interface ThreeLensContext {
  /**
   * The probe instance
   */
  probe: Ref<DevtoolProbe | null>;

  /**
   * Whether the probe is ready and observing
   */
  isReady: Ref<boolean>;

  /**
   * The latest frame stats
   */
  frameStats: Ref<FrameStats | null>;

  /**
   * The current scene snapshot
   */
  snapshot: Ref<SceneSnapshot | null>;

  /**
   * The currently selected scene node
   */
  selectedNode: Ref<SceneNode | null>;

  /**
   * Current FPS (computed)
   */
  fps: ComputedRef<number>;

  /**
   * Current draw calls (computed)
   */
  drawCalls: ComputedRef<number>;

  /**
   * Current triangle count (computed)
   */
  triangles: ComputedRef<number>;

  /**
   * Current frame time in ms (computed)
   */
  frameTime: ComputedRef<number>;

  /**
   * GPU memory estimate (computed)
   */
  gpuMemory: ComputedRef<number>;

  /**
   * Whether the overlay is visible
   */
  isOverlayVisible: Ref<boolean>;

  /**
   * Select an object by UUID
   */
  selectObject: (uuid: string) => void;

  /**
   * Clear the current selection
   */
  clearSelection: () => void;

  /**
   * Toggle overlay visibility
   */
  toggleOverlay: () => void;

  /**
   * Show the overlay
   */
  showOverlay: () => void;

  /**
   * Hide the overlay
   */
  hideOverlay: () => void;
}

/**
 * Entity registration options
 */
export interface EntityOptions {
  /**
   * Custom name for the entity in the devtools
   */
  name?: string;

  /**
   * Module/category the entity belongs to
   */
  module?: string;

  /**
   * Custom metadata to display in inspector
   */
  metadata?: Record<string, unknown>;

  /**
   * Tags for filtering and grouping
   */
  tags?: string[];
}

/**
 * Options for useMetric composable
 */
export interface UseMetricOptions {
  /**
   * How often to sample the metric (in frames)
   * @default 1
   */
  sampleRate?: number;

  /**
   * Whether to smooth the value over time
   * @default false
   */
  smoothed?: boolean;

  /**
   * Number of samples to use for smoothing
   * @default 10
   */
  smoothingSamples?: number;
}

/**
 * Metric value with history and statistics
 */
export interface MetricValue<T = number> {
  current: T;
  min: T;
  max: T;
  avg: T;
  history: T[];
}

/**
 * Injection key for the 3Lens context
 */
export const ThreeLensKey: InjectionKey<ThreeLensContext> = Symbol('ThreeLens');

