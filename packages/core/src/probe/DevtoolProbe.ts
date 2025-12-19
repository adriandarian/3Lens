import type * as THREE from 'three';

import type {
  ProbeConfig,
  LogicalEntity,
  ObjectMeta,
  TrackedObjectRef,
  FrameStats,
  SceneSnapshot,
  SceneNode,
  RendererAdapter,
  Transport,
  DebugMessage,
  Unsubscribe,
} from '../types';
import { createWebGLAdapter } from '../adapters/webgl-adapter';
import { SceneObserver } from '../observers/SceneObserver';

/**
 * Version of the probe
 */
export const PROBE_VERSION = '0.1.0-alpha.1';

/**
 * Main DevtoolProbe class
 */
export class DevtoolProbe {
  readonly config: ProbeConfig;

  private _threeVersion: string | null = null;
  private _rendererAdapter: RendererAdapter | null = null;
  private _transport: Transport | null = null;
  private _sceneObservers: Map<THREE.Scene, SceneObserver> = new Map();
  private _selectedObject: THREE.Object3D | null = null;
  private _logicalEntities: Map<string, LogicalEntity> = new Map();
  private _frameStatsHistory: FrameStats[] = [];
  private _maxHistorySize = 300;

  // Event callbacks
  private _selectionCallbacks: Array<
    (obj: THREE.Object3D | null, meta?: ObjectMeta) => void
  > = [];
  private _frameStatsCallbacks: Array<(stats: FrameStats) => void> = [];
  private _commandCallbacks: Array<(command: DebugMessage) => void> = [];

  constructor(config: ProbeConfig) {
    this.config = {
      env: 'development',
      debug: false,
      ...config,
      sampling: {
        frameStats: 'every-frame',
        snapshots: 'on-change',
        gpuTiming: true,
        resourceTracking: true,
        ...config.sampling,
      },
    };

    this.log('Probe initialized', { appName: config.appName });
  }

  /**
   * Get the detected three.js version
   */
  get threeVersion(): string | null {
    return this._threeVersion;
  }

  // ─────────────────────────────────────────────────────────────────
  // RENDERER MANAGEMENT
  // ─────────────────────────────────────────────────────────────────

  /**
   * Observe a three.js renderer (auto-detects WebGL/WebGPU)
   */
  observeRenderer(renderer: THREE.WebGLRenderer): void {
    // Detect three.js version
    this._threeVersion = (renderer as unknown as { version?: string }).version ?? null;
    
    // Create appropriate adapter
    const adapter = createWebGLAdapter(renderer);
    this.attachRendererAdapter(adapter);
    
    this.log('Observing renderer', { type: adapter.kind });
  }

  /**
   * Attach a custom renderer adapter
   */
  attachRendererAdapter(adapter: RendererAdapter): void {
    // Dispose old adapter if exists
    if (this._rendererAdapter) {
      this._rendererAdapter.dispose();
    }

    this._rendererAdapter = adapter;

    // Subscribe to frame stats
    adapter.observeFrame((stats) => {
      this.handleFrameStats(stats);
    });
  }

  /**
   * Get the current renderer adapter
   */
  getRendererAdapter(): RendererAdapter | null {
    return this._rendererAdapter;
  }

  // ─────────────────────────────────────────────────────────────────
  // SCENE MANAGEMENT
  // ─────────────────────────────────────────────────────────────────

  /**
   * Start observing a scene
   */
  observeScene(scene: THREE.Scene): void {
    if (this._sceneObservers.has(scene)) {
      this.log('Scene already being observed', { name: scene.name });
      return;
    }

    const observer = new SceneObserver(scene, {
      onSceneChange: () => this.handleSceneChange(),
    });

    this._sceneObservers.set(scene, observer);
    this.log('Observing scene', { name: scene.name || '<unnamed>' });
  }

  /**
   * Stop observing a scene
   */
  unobserveScene(scene: THREE.Scene): void {
    const observer = this._sceneObservers.get(scene);
    if (observer) {
      observer.dispose();
      this._sceneObservers.delete(scene);
      this.log('Stopped observing scene', { name: scene.name });
    }
  }

  /**
   * Get all observed scenes
   */
  getObservedScenes(): THREE.Scene[] {
    return Array.from(this._sceneObservers.keys());
  }

  /**
   * Take a manual snapshot of all observed scenes
   */
  takeSnapshot(): SceneSnapshot {
    const scenes: SceneNode[] = [];

    for (const [scene, observer] of this._sceneObservers) {
      scenes.push(observer.createSceneNode(scene));
    }

    const snapshot: SceneSnapshot = {
      snapshotId: this.generateId(),
      timestamp: performance.now(),
      scenes,
    };

    this.sendMessage({
      type: 'snapshot',
      timestamp: performance.now(),
      snapshotId: snapshot.snapshotId,
      trigger: 'manual',
      snapshot,
    });

    return snapshot;
  }

  // ─────────────────────────────────────────────────────────────────
  // OBJECT SELECTION
  // ─────────────────────────────────────────────────────────────────

  /**
   * Select an object (or null to deselect)
   */
  selectObject(obj: THREE.Object3D | null): void {
    const previousObject = this._selectedObject;
    this._selectedObject = obj;

    const previousMeta = previousObject
      ? this.getObjectMeta(previousObject)
      : null;
    const selectedMeta = obj ? this.getObjectMeta(obj) : null;

    // Notify callbacks
    for (const callback of this._selectionCallbacks) {
      callback(obj, selectedMeta ?? undefined);
    }

    // Send message
    this.sendMessage({
      type: 'selection-changed',
      timestamp: performance.now(),
      selectedObject: selectedMeta,
      previousObject: previousMeta,
    });
  }

  /**
   * Get the currently selected object
   */
  getSelectedObject(): THREE.Object3D | null {
    return this._selectedObject;
  }

  /**
   * Subscribe to selection changes
   */
  onSelectionChanged(
    callback: (obj: THREE.Object3D | null, meta?: ObjectMeta) => void
  ): Unsubscribe {
    this._selectionCallbacks.push(callback);
    return () => {
      const index = this._selectionCallbacks.indexOf(callback);
      if (index > -1) {
        this._selectionCallbacks.splice(index, 1);
      }
    };
  }

  // ─────────────────────────────────────────────────────────────────
  // LOGICAL ENTITIES
  // ─────────────────────────────────────────────────────────────────

  /**
   * Register a logical entity (component ↔ three.js mapping)
   */
  registerLogicalEntity(entity: LogicalEntity): void {
    this._logicalEntities.set(entity.id, entity);
    this.log('Registered logical entity', { id: entity.id, label: entity.label });
  }

  /**
   * Update an existing logical entity
   */
  updateLogicalEntity(id: string, updates: Partial<LogicalEntity>): void {
    const entity = this._logicalEntities.get(id);
    if (entity) {
      Object.assign(entity, updates);
    }
  }

  /**
   * Unregister a logical entity
   */
  unregisterLogicalEntity(id: string): void {
    this._logicalEntities.delete(id);
  }

  /**
   * Get all registered logical entities
   */
  getLogicalEntities(): LogicalEntity[] {
    return Array.from(this._logicalEntities.values());
  }

  /**
   * Find entity by three.js object
   */
  findEntityByObject(obj: THREE.Object3D): LogicalEntity | null {
    for (const entity of this._logicalEntities.values()) {
      if (entity.objects.includes(obj)) {
        return entity;
      }
    }
    return null;
  }

  // ─────────────────────────────────────────────────────────────────
  // CUSTOM METRICS
  // ─────────────────────────────────────────────────────────────────

  /**
   * Record a custom metric value
   */
  metric(name: string, value: number, tags?: Record<string, string>): void {
    this.sendMessage({
      type: 'custom-metric' as const,
      timestamp: performance.now(),
      name,
      value,
      tags,
    } as DebugMessage);
  }

  /**
   * Record a custom event
   */
  event(name: string, data?: Record<string, unknown>): void {
    this.sendMessage({
      type: 'custom-event' as const,
      timestamp: performance.now(),
      name,
      data,
    } as DebugMessage);
  }

  // ─────────────────────────────────────────────────────────────────
  // FRAME STATS
  // ─────────────────────────────────────────────────────────────────

  /**
   * Get the latest frame stats
   */
  getLatestFrameStats(): FrameStats | null {
    return this._frameStatsHistory[this._frameStatsHistory.length - 1] ?? null;
  }

  /**
   * Get frame stats history
   */
  getFrameStatsHistory(count?: number): FrameStats[] {
    if (count) {
      return this._frameStatsHistory.slice(-count);
    }
    return [...this._frameStatsHistory];
  }

  /**
   * Subscribe to frame stats updates
   */
  onFrameStats(callback: (stats: FrameStats) => void): Unsubscribe {
    this._frameStatsCallbacks.push(callback);
    return () => {
      const index = this._frameStatsCallbacks.indexOf(callback);
      if (index > -1) {
        this._frameStatsCallbacks.splice(index, 1);
      }
    };
  }

  // ─────────────────────────────────────────────────────────────────
  // COMMANDS
  // ─────────────────────────────────────────────────────────────────

  /**
   * Handle commands from the devtool UI
   */
  onCommand(handler: (command: DebugMessage) => void): Unsubscribe {
    this._commandCallbacks.push(handler);
    return () => {
      const index = this._commandCallbacks.indexOf(handler);
      if (index > -1) {
        this._commandCallbacks.splice(index, 1);
      }
    };
  }

  // ─────────────────────────────────────────────────────────────────
  // TRANSPORT
  // ─────────────────────────────────────────────────────────────────

  /**
   * Connect to a transport
   */
  connect(transport: Transport): void {
    if (this._transport) {
      this._transport.close();
    }

    this._transport = transport;

    transport.onReceive((message) => {
      this.handleMessage(message);
    });

    this.log('Connected to transport');
  }

  /**
   * Disconnect from transport
   */
  disconnect(): void {
    if (this._transport) {
      this._transport.close();
      this._transport = null;
    }
  }

  /**
   * Check if connected to a devtool UI
   */
  isConnected(): boolean {
    return this._transport?.isConnected() ?? false;
  }

  // ─────────────────────────────────────────────────────────────────
  // LIFECYCLE
  // ─────────────────────────────────────────────────────────────────

  /**
   * Dispose of the probe and clean up
   */
  dispose(): void {
    // Dispose renderer adapter
    if (this._rendererAdapter) {
      this._rendererAdapter.dispose();
      this._rendererAdapter = null;
    }

    // Dispose scene observers
    for (const observer of this._sceneObservers.values()) {
      observer.dispose();
    }
    this._sceneObservers.clear();

    // Close transport
    if (this._transport) {
      this._transport.close();
      this._transport = null;
    }

    // Clear callbacks
    this._selectionCallbacks = [];
    this._frameStatsCallbacks = [];
    this._commandCallbacks = [];

    this.log('Probe disposed');
  }

  // ─────────────────────────────────────────────────────────────────
  // PRIVATE METHODS
  // ─────────────────────────────────────────────────────────────────

  private handleFrameStats(stats: FrameStats): void {
    // Check rules
    const violations = this.checkRules(stats);
    if (violations.length > 0) {
      stats.violations = violations;
    }

    // Store in history
    this._frameStatsHistory.push(stats);
    if (this._frameStatsHistory.length > this._maxHistorySize) {
      this._frameStatsHistory.shift();
    }

    // Notify callbacks
    for (const callback of this._frameStatsCallbacks) {
      callback(stats);
    }

    // Send message
    this.sendMessage({
      type: 'frame-stats',
      timestamp: stats.timestamp,
      stats,
    });
  }

  private handleSceneChange(): void {
    if (this.config.sampling?.snapshots === 'on-change') {
      this.takeSnapshot();
    }
  }

  private handleMessage(message: DebugMessage): void {
    switch (message.type) {
      case 'handshake-request':
        this.handleHandshake(message);
        break;
      case 'select-object':
        this.handleSelectObject(message);
        break;
      case 'request-snapshot':
        this.takeSnapshot();
        break;
      case 'ping':
        this.sendMessage({
          type: 'pong',
          timestamp: performance.now(),
          requestId: message.id ?? '',
        });
        break;
      default:
        // Forward to command handlers
        for (const handler of this._commandCallbacks) {
          handler(message);
        }
    }
  }

  private handleHandshake(message: DebugMessage): void {
    this.sendMessage({
      type: 'handshake-response',
      timestamp: performance.now(),
      requestId: message.id ?? '',
      appId: this.generateId(),
      appName: this.config.appName,
      threeVersion: this._threeVersion ?? 'unknown',
      probeVersion: PROBE_VERSION,
      backend: this._rendererAdapter?.kind ?? 'webgl',
      capabilities: ['scene-graph', 'frame-stats', 'selection'],
    });
  }

  private handleSelectObject(message: DebugMessage & { debugId: string | null }): void {
    if (!message.debugId) {
      this.selectObject(null);
      return;
    }

    // Find object by debugId
    for (const observer of this._sceneObservers.values()) {
      const obj = observer.findObjectByDebugId(message.debugId);
      if (obj) {
        this.selectObject(obj);
        return;
      }
    }
  }

  private checkRules(stats: FrameStats): FrameStats['violations'] {
    const violations: NonNullable<FrameStats['violations']> = [];
    const rules = this.config.rules;

    if (!rules) return violations;

    if (rules.maxDrawCalls && stats.drawCalls > rules.maxDrawCalls) {
      violations.push({
        ruleId: 'maxDrawCalls',
        message: `Draw calls (${stats.drawCalls}) exceeded threshold (${rules.maxDrawCalls})`,
        severity: 'warning',
        value: stats.drawCalls,
        threshold: rules.maxDrawCalls,
      });
    }

    if (rules.maxTriangles && stats.triangles > rules.maxTriangles) {
      violations.push({
        ruleId: 'maxTriangles',
        message: `Triangles (${stats.triangles}) exceeded threshold (${rules.maxTriangles})`,
        severity: 'warning',
        value: stats.triangles,
        threshold: rules.maxTriangles,
      });
    }

    if (rules.maxFrameTimeMs && stats.cpuTimeMs > rules.maxFrameTimeMs) {
      violations.push({
        ruleId: 'maxFrameTimeMs',
        message: `Frame time (${stats.cpuTimeMs.toFixed(2)}ms) exceeded threshold (${rules.maxFrameTimeMs}ms)`,
        severity: 'warning',
        value: stats.cpuTimeMs,
        threshold: rules.maxFrameTimeMs,
      });
    }

    // Check custom rules
    for (const customRule of rules.custom ?? []) {
      const result = customRule.check(stats);
      if (!result.passed) {
        violations.push({
          ruleId: customRule.id,
          message: result.message ?? `Custom rule '${customRule.name}' failed`,
          severity: result.severity ?? 'warning',
        });
      }
    }

    return violations;
  }

  private getObjectMeta(obj: THREE.Object3D): ObjectMeta | null {
    // Find the observer that contains this object
    for (const observer of this._sceneObservers.values()) {
      const ref = observer.getObjectRef(obj);
      if (ref) {
        const entity = this.findEntityByObject(obj);
        return {
          ...ref,
          moduleId: entity?.moduleId,
          componentId: entity?.componentId,
          entityId: entity?.id,
        };
      }
    }
    return null;
  }

  private sendMessage(message: DebugMessage): void {
    if (this._transport?.isConnected()) {
      this._transport.send(message);
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 11);
  }

  private log(message: string, data?: Record<string, unknown>): void {
    if (this.config.debug) {
      // eslint-disable-next-line no-console
      console.log(`[3Lens] ${message}`, data ?? '');
    }
  }
}

