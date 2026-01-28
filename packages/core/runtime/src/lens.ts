/**
 * Lens Creation and Management
 *
 * @packageDocumentation
 */

import type {
  CaptureMode,
  Event,
  EntityGraph,
  EntityId,
  createEntityGraph,
  createCaptureContext,
  createQueryRegistry,
  createTraceManager,
  registerBuiltInQueries,
} from '@3lens/kernel';

import type { Selection, UISurface, DiscoveryMode, ExportProfile } from './types';
import type { ContextRegistration, ContextOptions } from './context';
import type { Host } from './host';
import type { LensClient } from './client';
import type { LensTransport } from './transport';
import type { Addon } from './addon';
import type { DoctorReport } from './doctor';

/**
 * Lens configuration
 */
export interface LensConfig {
  /** Enable Lens (default: true in dev, false in prod) */
  enabled?: boolean;
  /** UI surface mode */
  ui?: UISurface | null;
  /** Addons to load */
  addons?: string[] | Addon[];
  /** Capture mode */
  captureMode?: CaptureMode;
  /** Auto-discover contexts */
  autoDiscover?: boolean;
  /** Discovery mode */
  discoveryMode?: DiscoveryMode;
  /** Persist enabled state to localStorage */
  persist?: boolean;
  /** Context naming strategy */
  contextNameStrategy?: 'canvasId' | 'containerSelector' | 'manual';
  /** Log level */
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  /** CSP options */
  csp?: CSPOptions;
}

/**
 * CSP options for secure environments
 */
export interface CSPOptions {
  /** Nonce for style injection */
  styleNonce?: string;
  /** External CSS URL */
  cssUrl?: string;
  /** Enable CSP-safe mode */
  safeMode?: boolean;
}

/**
 * Lens instance - the main entry point
 */
export interface Lens {
  // Lifecycle
  /** Attach the lens (start capture) */
  attach(): void;
  /** Detach the lens (stop capture) */
  detach(): void;
  /** Whether lens is attached */
  isAttached(): boolean;
  /** Dispose the lens completely */
  dispose(): void;

  // Context Management
  /** Register a context */
  registerContext(registration: ContextRegistration): void;
  /** Unregister a context */
  unregisterContext(contextId: string): void;
  /** Get all registered contexts */
  getContexts(): ContextRegistration[];
  /** Get the active context */
  getActiveContext(): ContextRegistration | undefined;
  /** Set the active context */
  setActiveContext(contextId: string): void;

  // Selection
  /** Select entities */
  select(entityIds: EntityId | EntityId[], options?: { source?: string }): void;
  /** Get current selection */
  getSelection(): Selection;
  /** Subscribe to selection changes */
  onSelectionChange(handler: (selection: Selection) => void): () => void;

  // Query
  /** Execute a query */
  query<T>(name: string, params?: Record<string, unknown>): T | undefined;
  /** Get the entity graph */
  getGraph(): EntityGraph;
  /** Get a node by ID */
  getNode(id: EntityId): Node | undefined;

  // Addons
  /** Register an addon */
  registerAddon(addon: Addon): Promise<void>;
  /** Unregister an addon */
  unregisterAddon(addonId: string): void;
  /** Get registered addons */
  getAddons(): Addon[];
  /** Check if addon is registered */
  hasAddon(addonId: string): boolean;

  // Capabilities
  /** Check if a capability is available */
  hasCapability(capability: string): boolean;
  /** Get capability status */
  getCapabilityStatus(capability: string): { available: boolean; fidelity: Fidelity };

  // Trace
  /** Start recording a trace */
  startRecording(): void;
  /** Stop recording */
  stopRecording(): void;
  /** Export trace */
  exportTrace(options?: { profile?: ExportProfile }): Promise<Blob>;
  /** Load a trace */
  loadTrace(trace: Blob | File): Promise<void>;

  // Doctor
  /** Run diagnostics */
  doctor(): DoctorReport;

  // UI
  /** Show the UI */
  showUI(): void;
  /** Hide the UI */
  hideUI(): void;
  /** Toggle UI visibility */
  toggleUI(): void;
  /** Get UI surface mode */
  getUISurface(): UISurface | null;

  // Events
  /** Subscribe to events */
  onEvent(handler: (event: Event) => void): () => void;
  /** Subscribe to specific event type */
  on<T extends string>(type: T, handler: (event: Event & { type: T }) => void): () => void;

  // Transport (for remote UI)
  /** Connect a transport */
  connectTransport(transport: LensTransport): void;
  /** Disconnect transport */
  disconnectTransport(): void;

  // Overhead
  /** Get overhead metrics */
  getOverheadMetrics(): OverheadMetrics;
}

/**
 * Overhead metrics
 */
export interface OverheadMetrics {
  captureTimeMs: number;
  eventRate: number;
  bufferUsedBytes: number;
  bufferCapacityBytes: number;
  dropCount: number;
  currentMode: CaptureMode;
}

/**
 * Create a Lens instance
 */
export function createLens(config: LensConfig = {}): Lens {
  // Check if enabled
  const enabled = config.enabled ?? isDevEnvironment();
  if (!enabled) {
    return createNoOpLens();
  }

  // State
  let attached = false;
  const contexts = new Map<string, ContextRegistration>();
  let activeContextId: string | null = null;
  let currentSelection: Selection = {
    entity_ids: [],
    context_id: 'all',
    source: 'external',
    timestamp: Date.now(),
  };

  const selectionHandlers = new Set<(selection: Selection) => void>();
  const eventHandlers = new Set<(event: Event) => void>();
  const addons = new Map<string, Addon>();

  // Placeholder implementations - these will be properly implemented
  // when the kernel modules are fully wired up
  let graph: EntityGraph | null = null;

  const lens: Lens = {
    // Lifecycle
    attach() {
      attached = true;
      // TODO: Start capture contexts
    },

    detach() {
      attached = false;
      // TODO: Stop capture contexts
    },

    isAttached() {
      return attached;
    },

    dispose() {
      lens.detach();
      contexts.clear();
      addons.clear();
      selectionHandlers.clear();
      eventHandlers.clear();
    },

    // Context Management
    registerContext(registration: ContextRegistration) {
      contexts.set(registration.id, registration);
      if (!activeContextId) {
        activeContextId = registration.id;
      }
    },

    unregisterContext(contextId: string) {
      contexts.delete(contextId);
      if (activeContextId === contextId) {
        activeContextId = contexts.keys().next().value ?? null;
      }
    },

    getContexts() {
      return Array.from(contexts.values());
    },

    getActiveContext() {
      return activeContextId ? contexts.get(activeContextId) : undefined;
    },

    setActiveContext(contextId: string) {
      if (contexts.has(contextId)) {
        activeContextId = contextId;
      }
    },

    // Selection
    select(entityIds: EntityId | EntityId[], options?: { source?: string }) {
      const ids = Array.isArray(entityIds) ? entityIds : [entityIds];
      currentSelection = {
        entity_ids: ids,
        context_id: activeContextId ?? 'all',
        source: (options?.source as Selection['source']) ?? 'external',
        timestamp: Date.now(),
      };

      for (const handler of selectionHandlers) {
        handler(currentSelection);
      }
    },

    getSelection() {
      return currentSelection;
    },

    onSelectionChange(handler: (selection: Selection) => void) {
      selectionHandlers.add(handler);
      return () => selectionHandlers.delete(handler);
    },

    // Query
    query<T>(name: string, params?: Record<string, unknown>): T | undefined {
      // TODO: Implement query execution
      return undefined;
    },

    getGraph() {
      // TODO: Return actual graph
      return graph!;
    },

    getNode(id: EntityId) {
      return graph?.getNode(id);
    },

    // Addons
    async registerAddon(addon: Addon) {
      // TODO: Check compatibility
      addons.set(addon.id, addon);
      await addon.register?.(lens);
    },

    unregisterAddon(addonId: string) {
      const addon = addons.get(addonId);
      if (addon) {
        addon.unregister?.(lens);
        addons.delete(addonId);
      }
    },

    getAddons() {
      return Array.from(addons.values());
    },

    hasAddon(addonId: string) {
      return addons.has(addonId);
    },

    // Capabilities
    hasCapability(capability: string) {
      // TODO: Implement capability checking
      return true;
    },

    getCapabilityStatus(capability: string) {
      // TODO: Implement capability status
      return { available: true, fidelity: 'EXACT' as const };
    },

    // Trace
    startRecording() {
      // TODO: Implement trace recording
    },

    stopRecording() {
      // TODO: Implement trace recording
    },

    async exportTrace(options?: { profile?: ExportProfile }) {
      // TODO: Implement trace export
      return new Blob(['{}'], { type: 'application/json' });
    },

    async loadTrace(trace: Blob | File) {
      // TODO: Implement trace loading
    },

    // Doctor
    doctor(): DoctorReport {
      return {
        environment: {
          three_version: 'unknown',
          three_tier: 'UNKNOWN',
          backend: 'webgl2',
          is_worker: false,
          csp_restrictions: [],
          capabilities: {},
        },
        capability_matrix: {},
        actionable_fixes: [],
        warnings: [],
      };
    },

    // UI
    showUI() {
      // TODO: Implement UI show
    },

    hideUI() {
      // TODO: Implement UI hide
    },

    toggleUI() {
      // TODO: Implement UI toggle
    },

    getUISurface() {
      return config.ui ?? null;
    },

    // Events
    onEvent(handler: (event: Event) => void) {
      eventHandlers.add(handler);
      return () => eventHandlers.delete(handler);
    },

    on<T extends string>(type: T, handler: (event: Event & { type: T }) => void) {
      const wrappedHandler = (event: Event) => {
        if (event.type === type) {
          handler(event as Event & { type: T });
        }
      };
      eventHandlers.add(wrappedHandler);
      return () => eventHandlers.delete(wrappedHandler);
    },

    // Transport
    connectTransport(transport: LensTransport) {
      // TODO: Implement transport connection
    },

    disconnectTransport() {
      // TODO: Implement transport disconnection
    },

    // Overhead
    getOverheadMetrics(): OverheadMetrics {
      return {
        captureTimeMs: 0,
        eventRate: 0,
        bufferUsedBytes: 0,
        bufferCapacityBytes: 0,
        dropCount: 0,
        currentMode: config.captureMode ?? 'STANDARD',
      };
    },
  };

  return lens;
}

/**
 * Create a no-op lens for when disabled
 */
function createNoOpLens(): Lens {
  const noop = () => {};
  const noopAsync = async () => {};
  const noopReturn = <T>(val: T) => () => val;

  return {
    attach: noop,
    detach: noop,
    isAttached: () => false,
    dispose: noop,
    registerContext: noop,
    unregisterContext: noop,
    getContexts: () => [],
    getActiveContext: () => undefined,
    setActiveContext: noop,
    select: noop,
    getSelection: () => ({
      entity_ids: [],
      context_id: 'all',
      source: 'external',
      timestamp: Date.now(),
    }),
    onSelectionChange: () => noop,
    query: () => undefined,
    getGraph: () => null as any,
    getNode: () => undefined,
    registerAddon: noopAsync,
    unregisterAddon: noop,
    getAddons: () => [],
    hasAddon: () => false,
    hasCapability: () => false,
    getCapabilityStatus: () => ({ available: false, fidelity: 'UNAVAILABLE' }),
    startRecording: noop,
    stopRecording: noop,
    exportTrace: async () => new Blob(),
    loadTrace: noopAsync,
    doctor: () => ({
      environment: {} as any,
      capability_matrix: {},
      actionable_fixes: [],
      warnings: [],
    }),
    showUI: noop,
    hideUI: noop,
    toggleUI: noop,
    getUISurface: () => null,
    onEvent: () => noop,
    on: () => noop,
    connectTransport: noop,
    disconnectTransport: noop,
    getOverheadMetrics: () => ({
      captureTimeMs: 0,
      eventRate: 0,
      bufferUsedBytes: 0,
      bufferCapacityBytes: 0,
      dropCount: 0,
      currentMode: 'MINIMAL',
    }),
  };
}

/**
 * Check if running in a dev environment
 */
function isDevEnvironment(): boolean {
  // Check Vite
  if (typeof import.meta !== 'undefined' && (import.meta as any).env?.DEV === true) {
    return true;
  }

  // Check hostname
  if (typeof location !== 'undefined') {
    return location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  }

  return false;
}
