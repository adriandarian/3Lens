/**
 * Context Discovery System
 *
 * Automatic detection of three.js contexts with fidelity labels.
 *
 * @packageDocumentation
 */

import type { Fidelity } from '@3lens/kernel';
import type { DiscoveryMode, Backend } from './types';
import type { ContextRegistration, ContextOptions } from './context';
import { generateContextId } from './context';

/**
 * Discovery configuration
 */
export interface DiscoveryConfig {
  /** Discovery mode */
  mode: DiscoveryMode;
  /** Allow late attachment */
  attachLate: boolean;
  /** Context naming configuration */
  naming: ContextNamingConfig;
  /** Auto-register discovered contexts */
  autoRegister: boolean;
  /** Polling interval for observe mode (ms) */
  pollInterval?: number;
}

/**
 * Context naming configuration
 */
export interface ContextNamingConfig {
  /** Naming strategy */
  strategy: 'canvasId' | 'containerSelector' | 'frameworkRoot' | 'manual';
  /** Fallback prefix for unnamed contexts */
  fallbackPrefix: string;
}

/**
 * Discovered context info
 */
export interface DiscoveredContext {
  /** Auto-generated ID */
  id: string;
  /** Display name */
  displayName: string;
  /** Canvas element */
  canvas: HTMLCanvasElement;
  /** WebGL/WebGPU context */
  glContext: WebGLRenderingContext | WebGL2RenderingContext | GPUCanvasContext | null;
  /** Backend type */
  backend: Backend;
  /** Discovery method */
  discovery: DiscoveryMode;
  /** Discovery fidelity */
  fidelity: Fidelity;
  /** Fidelity reason */
  fidelityReason?: string;
  /** Timestamp */
  timestamp: number;
  /** Additional metadata */
  metadata: Record<string, unknown>;
}

/**
 * Discovery event
 */
export interface DiscoveryEvent {
  type: 'context_discovered' | 'context_promoted' | 'context_lost';
  context: DiscoveredContext;
  timestamp: number;
}

/**
 * Discovery handler
 */
export type DiscoveryHandler = (event: DiscoveryEvent) => void;

/**
 * Context discovery system
 */
export interface ContextDiscovery {
  /** Start discovery */
  start(): void;
  /** Stop discovery */
  stop(): void;
  /** Whether discovery is running */
  isRunning(): boolean;
  /** Get discovered contexts */
  getDiscoveredContexts(): DiscoveredContext[];
  /** Promote a context (upgrade fidelity after manual registration) */
  promoteContext(contextId: string, registration: Partial<ContextRegistration>): void;
  /** Subscribe to discovery events */
  onDiscovery(handler: DiscoveryHandler): () => void;
  /** Get doctor report for discovery */
  getDoctorReport(): DiscoveryDoctorReport;
}

/**
 * Doctor report for discovery
 */
export interface DiscoveryDoctorReport {
  canvases_found: number;
  contexts_discovered: number;
  contexts_manual: number;
  fidelity_breakdown: {
    exact: number;
    estimated: number;
    unavailable: number;
  };
  warnings: string[];
  recommendations: string[];
}

/**
 * Create context discovery system
 */
export function createContextDiscovery(config: DiscoveryConfig): ContextDiscovery {
  let running = false;
  let pollHandle: number | null = null;
  const discovered = new Map<string, DiscoveredContext>();
  const handlers = new Set<DiscoveryHandler>();
  const manualContexts = new Set<string>();

  function emit(event: DiscoveryEvent): void {
    for (const handler of handlers) {
      try {
        handler(event);
      } catch (e) {
        console.error('[3Lens Discovery] Handler error:', e);
      }
    }
  }

  function generateDisplayName(canvas: HTMLCanvasElement, index: number): string {
    const { strategy, fallbackPrefix } = config.naming;

    switch (strategy) {
      case 'canvasId':
        if (canvas.id) return canvas.id;
        break;
      case 'containerSelector':
        if (canvas.parentElement?.id) return canvas.parentElement.id;
        break;
      case 'frameworkRoot':
        // Look for framework root markers
        const r3fRoot = canvas.closest('[data-r3f]');
        if (r3fRoot?.id) return r3fRoot.id;
        const tresRoot = canvas.closest('[data-tres]');
        if (tresRoot?.id) return tresRoot.id;
        break;
    }

    return `${fallbackPrefix}${index}`;
  }

  function detectBackend(canvas: HTMLCanvasElement): { backend: Backend; context: any } {
    // Try WebGPU first
    if ('gpu' in navigator) {
      // Note: Can't actually get GPU context without async, so we check for context attributes
      const gpuContext = canvas.getContext('webgpu') as GPUCanvasContext | null;
      if (gpuContext) {
        return { backend: 'webgpu', context: gpuContext };
      }
    }

    // Try WebGL2
    const gl2 = canvas.getContext('webgl2');
    if (gl2) {
      return { backend: 'webgl2', context: gl2 };
    }

    // Fall back to WebGL1
    const gl1 = canvas.getContext('webgl');
    if (gl1) {
      return { backend: 'webgl1', context: gl1 };
    }

    return { backend: 'webgl2', context: null }; // Assume webgl2 if can't detect
  }

  function scanCanvases(): void {
    const canvases = document.querySelectorAll('canvas');
    const seen = new Set<string>();
    let index = 0;

    canvases.forEach((canvas) => {
      // Skip non-3D canvases (check for WebGL context)
      const { backend, context } = detectBackend(canvas as HTMLCanvasElement);
      if (!context) return;

      // Generate ID
      const canvasKey = canvas.id || `canvas_${index}`;
      const id = generateContextId();

      // Check if already discovered
      if (discovered.has(canvasKey)) {
        seen.add(canvasKey);
        return;
      }

      // Determine fidelity based on discovery mode
      let fidelity: Fidelity = 'ESTIMATED';
      let fidelityReason = 'Auto-discovered context. Manual registration recommended for full fidelity.';

      if (config.mode === 'hook') {
        // Hook mode can detect more reliably
        fidelity = 'ESTIMATED';
        fidelityReason = 'Detected via constructor hooks. Some details may be inferred.';
      } else if (config.mode === 'observe') {
        fidelity = 'ESTIMATED';
        fidelityReason = 'Detected via canvas observation. Renderer/scene/camera may be inferred.';
      }

      const discoveredContext: DiscoveredContext = {
        id,
        displayName: generateDisplayName(canvas as HTMLCanvasElement, index),
        canvas: canvas as HTMLCanvasElement,
        glContext: context,
        backend,
        discovery: config.mode,
        fidelity,
        fidelityReason,
        timestamp: Date.now(),
        metadata: {},
      };

      discovered.set(canvasKey, discoveredContext);
      seen.add(canvasKey);

      emit({
        type: 'context_discovered',
        context: discoveredContext,
        timestamp: Date.now(),
      });

      index++;
    });

    // Check for lost contexts
    for (const [key, context] of discovered) {
      if (!seen.has(key) && !manualContexts.has(key)) {
        discovered.delete(key);
        emit({
          type: 'context_lost',
          context,
          timestamp: Date.now(),
        });
      }
    }
  }

  function hookRendererConstructor(): void {
    // Hook THREE.WebGLRenderer if available
    if (typeof (globalThis as any).THREE !== 'undefined') {
      const THREE = (globalThis as any).THREE;
      const OriginalRenderer = THREE.WebGLRenderer;

      THREE.WebGLRenderer = function (...args: any[]) {
        const renderer = new OriginalRenderer(...args);

        // Emit discovery with higher confidence
        const canvas = renderer.domElement;
        const id = generateContextId();
        const discoveredContext: DiscoveredContext = {
          id,
          displayName: canvas.id || `renderer_${Date.now()}`,
          canvas,
          glContext: renderer.getContext(),
          backend: renderer.capabilities.isWebGL2 ? 'webgl2' : 'webgl1',
          discovery: 'hook',
          fidelity: 'ESTIMATED',
          fidelityReason: 'Detected via renderer constructor hook.',
          timestamp: Date.now(),
          metadata: {
            renderer,
          },
        };

        const key = canvas.id || `canvas_${discovered.size}`;
        discovered.set(key, discoveredContext);

        emit({
          type: 'context_discovered',
          context: discoveredContext,
          timestamp: Date.now(),
        });

        return renderer;
      };

      // Copy static properties
      Object.setPrototypeOf(THREE.WebGLRenderer, OriginalRenderer);
      Object.assign(THREE.WebGLRenderer, OriginalRenderer);
    }
  }

  return {
    start() {
      if (running) return;
      running = true;

      if (config.mode === 'off') {
        return;
      }

      // Initial scan
      scanCanvases();

      // Set up polling for observe mode
      if (config.mode === 'observe') {
        const interval = config.pollInterval ?? 1000;
        pollHandle = window.setInterval(scanCanvases, interval);
      }

      // Set up hooks for hook mode
      if (config.mode === 'hook') {
        hookRendererConstructor();
      }
    },

    stop() {
      running = false;
      if (pollHandle) {
        clearInterval(pollHandle);
        pollHandle = null;
      }
    },

    isRunning() {
      return running;
    },

    getDiscoveredContexts() {
      return Array.from(discovered.values());
    },

    promoteContext(contextId: string, registration: Partial<ContextRegistration>) {
      // Find context by ID
      for (const [key, context] of discovered) {
        if (context.id === contextId) {
          // Upgrade fidelity
          context.fidelity = 'EXACT';
          context.fidelityReason = undefined;
          manualContexts.add(key);

          emit({
            type: 'context_promoted',
            context,
            timestamp: Date.now(),
          });
          break;
        }
      }
    },

    onDiscovery(handler: DiscoveryHandler) {
      handlers.add(handler);
      return () => handlers.delete(handler);
    },

    getDoctorReport(): DiscoveryDoctorReport {
      const contexts = Array.from(discovered.values());
      const warnings: string[] = [];
      const recommendations: string[] = [];

      const fidelityBreakdown = {
        exact: contexts.filter((c) => c.fidelity === 'EXACT').length,
        estimated: contexts.filter((c) => c.fidelity === 'ESTIMATED').length,
        unavailable: contexts.filter((c) => c.fidelity === 'UNAVAILABLE').length,
      };

      // Generate warnings
      if (fidelityBreakdown.estimated > 0) {
        warnings.push(
          `${fidelityBreakdown.estimated} context(s) have ESTIMATED fidelity. ` +
            `Manual registration is recommended for full introspection.`
        );
      }

      if (config.mode === 'off' && contexts.length === 0) {
        warnings.push(
          'Discovery mode is "off" and no contexts are registered. ' +
            'Use registerContext() or enable discovery.'
        );
      }

      // Generate recommendations
      if (config.mode === 'observe') {
        recommendations.push(
          'Consider using "hook" mode for better fidelity, or manual registration for best results.'
        );
      }

      if (contexts.some((c) => !c.glContext)) {
        recommendations.push(
          'Some canvases could not have their WebGL context detected. ' +
            'These may not be three.js canvases.'
        );
      }

      return {
        canvases_found: document.querySelectorAll('canvas').length,
        contexts_discovered: contexts.length,
        contexts_manual: manualContexts.size,
        fidelity_breakdown: fidelityBreakdown,
        warnings,
        recommendations,
      };
    },
  };
}

/**
 * Default discovery configuration
 */
export const DEFAULT_DISCOVERY_CONFIG: DiscoveryConfig = {
  mode: 'observe',
  attachLate: true,
  autoRegister: true,
  naming: {
    strategy: 'canvasId',
    fallbackPrefix: 'context_',
  },
  pollInterval: 1000,
};
