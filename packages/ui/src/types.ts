/**
 * Shared types for 3Lens UI components
 */

import type {
  DevtoolProbe,
  SceneSnapshot,
  SceneNode,
  FrameStats,
  MaterialData,
  GeometryData,
  TextureData,
  RenderTargetData,
  BenchmarkScore,
} from '@3lens/core';

/**
 * Panel context passed to all panel renderers
 */
export interface PanelContext {
  /** The probe instance for data access and commands */
  probe: DevtoolProbe;
  /** Current snapshot (may be null if not yet available) */
  snapshot: SceneSnapshot | null;
  /** Latest frame stats (may be null if not yet available) */
  stats: FrameStats | null;
  /** Latest benchmark score */
  benchmark: BenchmarkScore | null;
  /** Send a command to the probe (for property updates, etc.) */
  sendCommand: (command: PanelCommand) => void;
  /** Request a fresh snapshot */
  requestSnapshot: () => void;
}

/**
 * Commands that panels can send
 */
export type PanelCommand =
  | { type: 'select-object'; debugId: string | null }
  | { type: 'hover-object'; debugId: string | null }
  | { type: 'toggle-visibility'; debugId: string }
  | { type: 'update-material-property'; materialUuid: string; property: string; value: unknown }
  | { type: 'geometry-visualization'; geometryUuid: string; visualization: 'boundingBox' | 'wireframe' | 'normals'; enabled: boolean };

/**
  isNodeLibraryOpen: boolean;
 * State managed by the UI system
 */
export interface UIState {
  // Selection state
  selectedNodeId: string | null;
  selectedMaterialId: string | null;
  selectedGeometryId: string | null;
  selectedTextureId: string | null;
  selectedRenderTargetId: string | null;
  
  // Expansion state
  expandedNodes: Set<string>;
  
  // Search filters
  materialsSearch: string;
  geometrySearch: string;
  texturesSearch: string;
  renderTargetsSearch: string;
  
  // Visualization state
  geometryVisualization: {
    wireframe: Set<string>;
    boundingBox: Set<string>;
    normals: Set<string>;
  };
  
  // Texture preview
  texturePreviewChannel: 'rgb' | 'r' | 'g' | 'b' | 'a';
  
  // Render target preview
  renderTargetPreviewMode: 'color' | 'depth' | 'r' | 'g' | 'b' | 'a' | 'heatmap';
  renderTargetZoom: number;
  
  // Stats history
  frameHistory: number[];
  fpsHistory: number[];
}

/**
 * Create default UI state
 */
export function createDefaultUIState(): UIState {
  return {
    selectedNodeId: null,
    selectedMaterialId: null,
    selectedGeometryId: null,
    selectedTextureId: null,
    selectedRenderTargetId: null,
    expandedNodes: new Set(),
    materialsSearch: '',
    geometrySearch: '',
    texturesSearch: '',
    renderTargetsSearch: '',
    geometryVisualization: {
      wireframe: new Set(),
      boundingBox: new Set(),
      normals: new Set(),
    },
    texturePreviewChannel: 'rgb',
    renderTargetPreviewMode: 'color',
    renderTargetZoom: 1,
    frameHistory: [],
    fpsHistory: [],
  };
}

/**
 * Panel renderer function signature
 */
export type PanelRenderer = (
  context: PanelContext,
  state: UIState,
  updateState: (updates: Partial<UIState>) => void
) => string;

/**
 * Event handler attachment function
 */
export type PanelEventAttacher = (
  container: HTMLElement,
  context: PanelContext,
  state: UIState,
  updateState: (updates: Partial<UIState>) => void,
  rerender: () => void
) => void;

// Re-export types from core for convenience
export type { SceneSnapshot, SceneNode, FrameStats, MaterialData, GeometryData, TextureData, RenderTargetData, BenchmarkScore };

      isNodeLibraryOpen: true,
