/**
 * Lens Creation and Management
 *
 * @packageDocumentation
 */

import {
  createEntityGraph, createCaptureContext, createQueryRegistry, registerBuiltInQueries,
  createTraceManager, applyCaptureEvent, validateGraphCheckpoint, deserializeTrace,
  KERNEL_VERSION, TRACE_VERSION,
  type CaptureMode, type Event, type EntityGraph, type EntityId, type Node,
  type Fidelity, type CaptureContext, type GraphSnapshot, type Trace, type TraceManager,
} from '@3lens/kernel';
import type { Selection, UISurface, DiscoveryMode, ExportProfile } from './types';
import type { ContextRegistration, PipelineDescriptor } from './context';
import type { Host } from './host';
import type { LensTransport, TransportMessage } from './transport';
import type { Addon } from './addon';
import type { DoctorReport } from './doctor';
import { runDoctor } from './doctor';
import { checkAddonCompatibility } from './addon';

/** UI ownership is injected by the composition layer; runtime never imports UI. */
export interface LensUIAdapter {
  show(lens: Lens): void;
  hide(): void;
  dispose(): void;
}

export type { EntityChange } from '@3lens/kernel';

/**
 * Lens configuration
 */
export interface LensConfig {
  /** Enable Lens (default: true in dev, false in prod) */
  enabled?: boolean;
  /** UI surface mode */
  ui?: UISurface | null;
  /** Optional UI implementation supplied by a UI or devtools package. */
  uiAdapter?: LensUIAdapter;
  /** Addons to load */
  addons?: string[] | Addon[];
  /** Capture mode */
  captureMode?: CaptureMode;
  /** Bounds the retained event history; graph replay state is checkpointed on eviction. */
  recording?: { maxEvents?: number; maxBytes?: number };
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
  /** Current data source; offline mode never reads live renderer objects. */
  getMode(): 'live' | 'offline';
  /** Set the before-state for subsequent entity change queries. */
  captureBaseline(): void;
  /** Select recorded state; null resumes the latest live/offline state. */
  setFrame(frame: number | null, contextId?: string): boolean;
  getSelectedFrame(): number | null;
  setCaptureMode(mode: CaptureMode): void;
  isRecording(): boolean;
  /** Record a user marker for trace alignment; unavailable in offline mode. */
  addMarker(label: string): boolean;
  registerPipeline(contextId: string, descriptor: PipelineDescriptor): void;
  pick(x: number, y: number, contextId?: string): EntityId | null;
  focus(entityId?: EntityId): boolean;
  highlight(entityId: EntityId | null): boolean;
  getViewportBounds(): { x: number; y: number; width: number; height: number } | null;
  getSelectionBounds(entityId?: EntityId): { x: number; y: number; width: number; height: number } | null;
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
  let disposed = false;
  let mode: 'live' | 'offline' = 'live';
  let uiVisible = false;
  let loadedTrace: Trace | null = null;
  let selectedFrame: number | null = null;
  let historicalGraph: EntityGraph | null = null;
  const captureContexts = new Map<string, CaptureContext>();
  const captureSubscriptions = new Map<string, () => void>();
  const registeredCaptureContexts = new Set<string>();
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
  let transport: LensTransport | null = null;
  const transportHandlers = new Set<(message: TransportMessage) => void>();

  const graph = createEntityGraph();
  let baseline = structuredClone(graph.snapshot());
  let recordingInitialGraph = structuredClone(graph.snapshot());
  const recordingReplayBase = createEntityGraph();
  let replayBaseTimestamp: number | null = null;
  const registry = createQueryRegistry();
  registerBuiltInQueries(registry);
  const retainedEvents = () => loadedTrace ? loadedTrace.events.flatMap(chunk => chunk.events) : traceManager.getEvents();
  const viewGraph = () => historicalGraph ?? graph;
  // Create trace manager
  const traceManager: TraceManager = createTraceManager({
    sessionId: crypto.randomUUID(),
    environment: {
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      three_version: 'unknown',
      backend: 'webgl2',
      three_tier: 'UNKNOWN', is_worker: false, csp_restrictions: [], capabilities: {},
    },
    captureMode: config.captureMode ?? 'STANDARD',
    chunkSize: 1000,
    snapshotInterval: 60,
    maxEvents: config.recording?.maxEvents,
    maxBytes: config.recording?.maxBytes,
    onDrop(event) {
      applyCaptureEvent(recordingReplayBase,event);
      replayBaseTimestamp = event.timestamp;
    },
  });

  function ingest(event: Event): void {
    if (event.type === 'context_register') registeredCaptureContexts.add(event.context_id);
    else if (!registeredCaptureContexts.has(event.context_id)) {
      throw new Error(`Capture event before context registration: ${event.context_id}`);
    }
    applyCaptureEvent(graph, event);
    traceManager.addEvent(event);
    if (event.type === 'context_unregister') registeredCaptureContexts.delete(event.context_id);
    for (const handler of eventHandlers) handler(event);
  }

  function attachHost(registration: ContextRegistration): void {
    let capture = captureContexts.get(registration.id);
    if (!capture) {
      capture = createCaptureContext({ id: registration.id, mode: config.captureMode ?? 'STANDARD',
        bufferSizeBytes: 4 * 1024 * 1024, autoDegrade: false, overheadBudgetMs: 2 });
      captureContexts.set(registration.id, capture);
      captureSubscriptions.set(registration.id, capture.subscribe(ingest));
    }
    capture.start();
    try {
      const result = registration.host.attach(capture);
      if (result instanceof Promise) result.then(() => {
        if (!attached || contexts.get(registration.id) !== registration) {
          registration.host.detach();
          capture!.stop();
        } else if (registration.pipeline) {
          capture!.emit({type:'context_update',timestamp:performance.now(),changes:{metadata:{pipeline_descriptor:registration.pipeline}}});
        }
      }).catch(error => {
        registration.host.detach();
        capture!.stop();
        console.error('[3Lens] Host attachment failed', error);
      });
      else if (registration.pipeline) capture.emit({type:'context_update',timestamp:performance.now(),changes:{metadata:{pipeline_descriptor:registration.pipeline}}});
    } catch (error) {
      capture.stop();
      throw error;
    }
  }

  const lens: Lens = {
    // Lifecycle
    attach() {
      if (disposed || attached || mode === 'offline') return;
      attached = true;
      recordingInitialGraph = structuredClone(graph.snapshot());
      recordingReplayBase.restore(structuredClone(recordingInitialGraph)); replayBaseTimestamp = null;
      traceManager.startRecording();
      try {
        for (const registration of contexts.values()) attachHost(registration);
      } catch (error) {
        lens.detach();
        throw error;
      }
    },

    detach() {
      if (!attached) return;
      for (const registration of contexts.values()) registration.host.detach();
      for (const capture of captureContexts.values()) capture.stop();
      attached = false;
      traceManager.stopRecording();
    },

    isAttached() {
      return attached;
    },

    getMode() { return mode; },

    captureBaseline() {
      baseline = structuredClone(viewGraph().snapshot());
    },

    getSelectedFrame() { return selectedFrame; },
    setFrame(frame, contextId = activeContextId ?? undefined) {
      if (frame === null) {
        selectedFrame = null; historicalGraph = null;
        for (const handler of selectionHandlers) handler(currentSelection);
        return true;
      }
      const events = retainedEvents();
      const end = [...events].reverse().find(event => 'frame' in event && event.frame === frame && (!contextId || event.context_id === contextId));
      if (!end) return false;
      const checkpoint = loadedTrace?.snapshots.filter(snapshot => snapshot.timestamp <= end.timestamp).at(-1);
      const restored = createEntityGraph();
      restored.restore(structuredClone(checkpoint?.graph ?? (mode === 'live' ? recordingReplayBase.snapshot() : recordingInitialGraph)));
      const after = checkpoint?.event_index ?? 0;
      for (const event of events.slice(after)) {
        if (event.timestamp > end.timestamp) break;
        applyCaptureEvent(restored,event);
      }
      historicalGraph = restored; selectedFrame = frame;
      if (contextId && contexts.has(contextId)) activeContextId = contextId;
      for (const handler of selectionHandlers) handler(currentSelection);
      return true;
    },
    setCaptureMode(captureMode) {
      if (!['MINIMAL','STANDARD','DEEP'].includes(captureMode)) throw new Error('Invalid capture mode');
      if (mode === 'offline') throw new Error('Capture mode cannot change while inspecting a saved trace');
      config.captureMode = captureMode;
      for (const capture of captureContexts.values()) {
        capture.setMode(captureMode);
        capture.emit({type:'context_update',timestamp:performance.now(),changes:{metadata:{capture_mode:captureMode}}});
      }
    },
    isRecording() { return mode === 'live' && traceManager.isRecording(); },
    addMarker(label) {
      if (mode === 'offline' || !attached || !activeContextId || !label.trim()) return false;
      captureContexts.get(activeContextId)?.emit({type:'context_update',timestamp:performance.now(),
        changes:{metadata:{marker:label.trim().slice(0,200)}}});
      return true;
    },
    registerPipeline(contextId,descriptor) {
      if (mode === 'offline') throw new Error('Pipeline registration is unavailable in offline mode');
      const registration = contexts.get(contextId);
      if (!registration) throw new Error(`Unknown context: ${contextId}`);
      registration.pipeline = descriptor;
      captureContexts.get(contextId)?.emit({type:'context_update',timestamp:performance.now(),changes:{metadata:{pipeline_descriptor:descriptor}}});
    },
    pick(x,y,contextId = activeContextId ?? undefined) {
      if (mode === 'offline' || !attached || selectedFrame !== null || !contextId) return null;
      const id = contexts.get(contextId)?.host.pick?.(x,y) ?? null;
      if (id && graph.hasNode(id)) lens.select(id,{source:'user_click'});
      return id;
    },
    focus(entityId = currentSelection.entity_ids[0]) {
      if (!entityId || mode === 'offline' || selectedFrame !== null) return false;
      const contextId = graph.getNode(entityId)?.context_id;
      return contextId ? contexts.get(contextId)?.host.focus?.(entityId) ?? false : false;
    },
    highlight(entityId) {
      if (mode === 'offline' || selectedFrame !== null) return false;
      const contextId = entityId ? graph.getNode(entityId)?.context_id : activeContextId;
      return contextId ? contexts.get(contextId)?.host.highlight?.(entityId) ?? false : false;
    },
    getViewportBounds() {
      return mode === 'live' && activeContextId ? contexts.get(activeContextId)?.host.getViewportBounds?.() ?? null : null;
    },
    getSelectionBounds(entityId = currentSelection.entity_ids[0]) {
      if (!entityId || mode === 'offline' || selectedFrame !== null) return null;
      const contextId = graph.getNode(entityId)?.context_id;
      return contextId ? contexts.get(contextId)?.host.getEntityBounds?.(entityId) ?? null : null;
    },

    dispose() {
      if (disposed) return;
      lens.detach();
      config.uiAdapter?.dispose();
      uiVisible = false;
      lens.disconnectTransport();
      for (const unsubscribe of captureSubscriptions.values()) unsubscribe();
      captureSubscriptions.clear();
      captureContexts.clear();
      for (const addon of addons.values()) addon.unregister?.(lens);
      disposed = true;
      contexts.clear();
      addons.clear();
      selectionHandlers.clear();
      eventHandlers.clear();
    },

    // Context Management
    registerContext(registration: ContextRegistration) {
      if (disposed) throw new Error('Lens is disposed');
      if (mode === 'offline') throw new Error('Cannot register a live host while inspecting an offline trace');
      if (contexts.has(registration.id)) throw new Error(`Context already registered: ${registration.id}`);
      contexts.set(registration.id, registration);
      if (attached) attachHost(registration);
      if (!activeContextId) {
        activeContextId = registration.id;
      }
    },

    unregisterContext(contextId: string) {
      contexts.get(contextId)?.host.detach();
      captureContexts.get(contextId)?.stop();
      captureSubscriptions.get(contextId)?.();
      captureSubscriptions.delete(contextId);
      captureContexts.delete(contextId);
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
        context_id: ids.length && new Set(ids.map(id => graph.getNode(id)?.context_id)).size === 1
          ? graph.getNode(ids[0])?.context_id ?? activeContextId ?? 'all'
          : activeContextId ?? 'all',
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
      const queryParams = name === 'entity_changes' || name === 'platform_diff' ? {baseline,...params}
        : name === 'platform_snapshot' ? {...params,events:retainedEvents(),
          dropped_events:loadedTrace?.header.dropped_events ?? traceManager.getStats().droppedEvents} : params ?? {};
      return registry.execute(name, viewGraph(), queryParams) as T | undefined;
    },

    getGraph() {
      return viewGraph();
    },

    getNode(id: EntityId) {
      return viewGraph().getNode(id);
    },

    // Addons
    async registerAddon(addon: Addon) {
      // Check compatibility
      const doctorReport = runDoctor();
      const capabilities: Record<string, boolean> = {};
      
      // Build capabilities map from doctor report
      for (const [capName, status] of Object.entries(doctorReport.capability_matrix)) {
        capabilities[capName] = status.available;
      }

      const compatibility = checkAddonCompatibility(addon, {
        kernelVersion: KERNEL_VERSION,
        traceVersion: TRACE_VERSION,
        capabilities,
      });

      if (!compatibility.compatible) {
        const errorMsg = `Addon ${addon.id} is incompatible: ${compatibility.errors.join(', ')}`;
        console.error(`[3Lens] ${errorMsg}`);
        throw new Error(errorMsg);
      }

      if (compatibility.warnings.length > 0) {
        console.warn(`[3Lens] Addon ${addon.id} has warnings: ${compatibility.warnings.join(', ')}`);
      }

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
      return lens.getCapabilityStatus(capability).available;
    },

    getCapabilityStatus(capability: string) {
      if (mode === 'offline') return loadedTrace?.header.environment.capabilities[capability] ??
        {available: false, fidelity: 'UNAVAILABLE' as const};
      if (capability === 'timing.gpu') return {available: false, fidelity: 'UNAVAILABLE' as const};
      if (capability === 'capture.renderEvents') return {
        available: graph.getNodes({types: ['renderer']}).nodes.length > 0,
        fidelity: graph.getNodes({types: ['renderer']}).nodes.length > 0 ? 'EXACT' : 'UNAVAILABLE',
      };
      return runDoctor().capability_matrix[capability] ?? { available: false, fidelity: 'UNAVAILABLE' as const };
    },

    // Trace
    startRecording() {
      if (mode === 'offline') throw new Error('Cannot record while inspecting an offline trace');
      recordingInitialGraph = structuredClone(graph.snapshot());
      recordingReplayBase.restore(structuredClone(recordingInitialGraph)); replayBaseTimestamp = null;
      traceManager.startRecording();
      traceManager.addSnapshot(graph, 0);
    },

    stopRecording() {
      traceManager.stopRecording();
    },

    async exportTrace(options?: { profile?: ExportProfile }) {
      const profile = options?.profile ?? 'STANDARD';
      if (profile === 'FULL_REDACTED') throw new Error('Redacted investigation export is not supported; use STANDARD locally');
      const trace = loadedTrace ? structuredClone(loadedTrace) : traceManager.export({ profile });
      trace.header.export_profile = profile;
      if (!loadedTrace) {
        trace.header.environment.capabilities['capture.renderEvents'] = lens.getCapabilityStatus('capture.renderEvents');
        trace.header.environment.capabilities['timing.gpu'] = { available: false, fidelity: 'UNAVAILABLE' };
      }
      // The final checkpoint is a detached copy: later frames must not mutate exported state.
      const finalGraph = structuredClone(graph.snapshot());
      if (profile !== 'MINIMAL') {
        const eventCount = trace.events.reduce((sum, chunk) => sum + chunk.events.length, 0);
        const initial = loadedTrace?.snapshots.find(snapshot => snapshot.is_initial);
        trace.snapshots = [initial ?? {
          timestamp: replayBaseTimestamp ?? trace.header.time_range.start, frame: trace.header.frame_range.start, seq: 0,
          graph: structuredClone(recordingReplayBase.snapshot()), is_initial: true,
          context_ids: recordingReplayBase.snapshot().context_ids, event_index: 0,
        }, { timestamp: trace.header.time_range.end, frame: trace.header.frame_range.end,
          seq: Math.max(0, ...finalGraph.nodes.map(n => n.modified_at)), graph: finalGraph,
          is_initial: false, context_ids: finalGraph.context_ids, event_index: eventCount }];
        trace.investigation = {
          selection: {entity_ids: [...currentSelection.entity_ids], context_id: currentSelection.context_id},
          baseline: structuredClone(baseline),
          frame: selectedFrame,
        };
      } else {
        trace.snapshots = [];
        trace.events = [];
        delete trace.investigation;
      }
      trace.header.stats.node_count = profile === 'MINIMAL' ? 0 : finalGraph.nodes.length;
      trace.header.stats.edge_count = profile === 'MINIMAL' ? 0 : finalGraph.edges.length;
      trace.header.stats.event_count = trace.events.reduce((sum, chunk) => sum + chunk.events.length, 0);
      trace.header.stats.chunk_count = trace.events.length;
      trace.header.stats.snapshot_count = trace.snapshots.length;
      return new Blob([JSON.stringify(trace)], { type: 'application/json' });
    },

    async loadTrace(file: Blob | File) {
      // Validate before detaching or mutating the current live investigation.
      const trace = deserializeTrace(await file.text());
      if (!Array.isArray(trace.events) || !Array.isArray(trace.snapshots) ||
          !Array.isArray(trace.header.contexts)) throw new Error('Invalid trace collections');
      for (const snapshot of trace.snapshots) {
        validateGraphCheckpoint(snapshot.graph);
        if (snapshot.event_index !== undefined && (!Number.isInteger(snapshot.event_index) || snapshot.event_index < 0)) {
          throw new Error('Invalid checkpoint event cursor');
        }
      }
      const restored = createEntityGraph();
      const allEvents = trace.events.flatMap(chunk => {
        if (!Array.isArray(chunk.events)) throw new Error('Invalid event chunk');
        return chunk.events;
      });
      if (trace.investigation) {
        validateGraphCheckpoint(trace.investigation.baseline);
        if (!Array.isArray(trace.investigation.selection?.entity_ids) ||
            trace.investigation.selection.entity_ids.some(id => typeof id !== 'string')) {
          throw new Error('Invalid investigation selection');
        }
      }
      const checkpoint = trace.snapshots.at(-1);
      if (checkpoint?.event_index !== undefined && checkpoint.event_index > allEvents.length) {
        throw new Error('Checkpoint event cursor exceeds event count');
      }
      if (checkpoint) restored.restore(structuredClone(checkpoint.graph));
      const tail = checkpoint ? checkpoint.event_index !== undefined
        ? allEvents.slice(checkpoint.event_index)
        : allEvents.filter(event => event.timestamp > checkpoint.timestamp) : allEvents;
      for (const event of tail) applyCaptureEvent(restored, event);
      lens.detach();
      for (const unsubscribe of captureSubscriptions.values()) unsubscribe();
      captureSubscriptions.clear();
      captureContexts.clear();
      registeredCaptureContexts.clear();
      mode = 'offline';
      loadedTrace = structuredClone(trace);
      selectedFrame = null; historicalGraph = null;
      graph.restore(restored.snapshot());
      baseline = structuredClone(trace.investigation?.baseline ?? graph.snapshot());
      contexts.clear();
      // Offline context descriptors carry no renderer references and cannot attach.
      for (const context of trace.header.contexts) {
        contexts.set(context.id, { id: context.id, displayName: context.display_name,
          host: offlineHost(context.id) });
      }
      activeContextId = trace.investigation?.selection.context_id ?? trace.header.contexts[0]?.id ?? null;
      if (activeContextId && !contexts.has(activeContextId)) activeContextId = trace.header.contexts[0]?.id ?? null;
      const selection = trace.investigation?.selection.entity_ids ?? currentSelection.entity_ids;
      lens.select(selection.filter(id => graph.hasNode(id)), {source: 'external'});
      if (typeof trace.investigation?.frame === 'number') lens.setFrame(trace.investigation.frame,activeContextId ?? undefined);
    },

    // Doctor
    doctor(): DoctorReport {
      return runDoctor();
    },

    // UI
    showUI() {
      if (disposed || config.ui === null || !config.uiAdapter) return;
      config.uiAdapter.show(lens);
      uiVisible = true;
    },

    hideUI() {
      config.uiAdapter?.hide();
      uiVisible = false;
    },

    toggleUI() {
      if (uiVisible) lens.hideUI();
      else lens.showUI();
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
    connectTransport(newTransport: LensTransport) {
      // Disconnect existing transport if any
      if (transport) {
        lens.disconnectTransport();
      }

      transport = newTransport;

      // Set up message handler
      const unsubscribe = transport.onMessage((message: TransportMessage) => {
        // Forward messages to all handlers
        for (const handler of transportHandlers) {
          handler(message);
        }
      });

      // Store unsubscribe function (would need to track this if we want to clean up properly)
      // For now, transport.close() will handle cleanup
    },

    disconnectTransport() {
      if (transport) {
        transport.close();
        transport = null;
        transportHandlers.clear();
      }
    },

    // Overhead
    getOverheadMetrics(): OverheadMetrics {
      const metrics = [...captureContexts.values()].map(context => context.getOverheadMetrics());
      return {
        captureTimeMs: metrics.reduce((sum, m) => sum + m.captureTimeMs, 0),
        eventRate: metrics.reduce((sum, m) => sum + m.eventRate, 0),
        bufferUsedBytes: metrics.reduce((sum, m) => sum + m.bufferUsedBytes, 0),
        bufferCapacityBytes: metrics.reduce((sum, m) => sum + m.bufferCapacityBytes, 0),
        dropCount: metrics.reduce((sum, m) => sum + m.dropCount, 0) + (loadedTrace?.header.dropped_events ?? traceManager.getStats().droppedEvents),
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
    getMode: () => 'live',
    captureBaseline: noop,
    setFrame: () => false,
    getSelectedFrame: () => null,
    setCaptureMode: noop,
    isRecording: () => false,
    addMarker: () => false,
    registerPipeline: noop,
    pick: () => null,
    focus: () => false,
    highlight: () => false,
    getViewportBounds: () => null,
    getSelectionBounds: () => null,
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

function offlineHost(id: string): Host {
  return { id, name: 'Offline trace', attach() { throw new Error('Offline contexts cannot attach'); },
    detach() {}, getRenderer: () => null, getScene: () => null, getCamera: () => null,
    isAttached: () => false };
}
