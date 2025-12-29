import type { DevtoolProbe, ProbeConfig, FrameStats, SceneSnapshot, SceneNode } from '@3lens/core';

/**
 * Configuration for the ThreeLensProvider
 */
export interface ThreeLensProviderConfig extends Partial<ProbeConfig> {
  /**
   * Whether to automatically detect React Three Fiber and set up observation
   * @default true
   */
  autoDetectR3F?: boolean;

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
 * Context value provided by ThreeLensProvider
 */
export interface ThreeLensContextValue {
  /**
   * The probe instance (null if not initialized)
   */
  probe: DevtoolProbe | null;

  /**
   * Whether the probe is ready and observing
   */
  isReady: boolean;

  /**
   * The latest frame stats
   */
  frameStats: FrameStats | null;

  /**
   * The current scene snapshot
   */
  snapshot: SceneSnapshot | null;

  /**
   * The currently selected object's scene node
   */
  selectedNode: SceneNode | null;

  /**
   * Select an object by UUID
   */
  selectObject: (uuid: string) => void;

  /**
   * Clear the current selection
   */
  clearSelection: () => void;

  /**
   * Toggle the overlay visibility
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

  /**
   * Whether the overlay is currently visible
   */
  isOverlayVisible: boolean;
}

/**
 * Options for useMetric hook
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
 * A metric value with optional history
 */
export interface MetricValue<T = number> {
  current: T;
  min: T;
  max: T;
  avg: T;
  history: T[];
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
 * Registered entity info
 */
export interface RegisteredEntity {
  id: string;
  object: THREE.Object3D;
  options: EntityOptions;
}

