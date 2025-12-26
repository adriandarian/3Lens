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
import { SelectionHelper } from '../helpers/SelectionHelper';
import { InspectMode } from '../helpers/InspectMode';

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
  private _registeredRenderTargets: Map<string, { rt: THREE.WebGLRenderTarget; usage: import('../types').RenderTargetUsage }> = new Map();
  private _selectedObject: THREE.Object3D | null = null;
  private _hoveredObject: THREE.Object3D | null = null;
  private _logicalEntities: Map<string, LogicalEntity> = new Map();
  private _frameStatsHistory: FrameStats[] = [];
  private _frameStatsHistoryIndex = 0;
  private _maxHistorySize = 300;
  private _selectionHelper: SelectionHelper = new SelectionHelper();
  private _inspectMode: InspectMode = new InspectMode(this);
  private _threeRef: typeof import('three') | null = null;
  private _visualizationHelpers: Map<string, THREE.Object3D> = new Map();
  private _globalWireframe = false;

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

  /**
   * Get all textures from the renderer adapter
   */
  getTextures(): import('../types').TextureInfo[] {
    return this._rendererAdapter?.getTextures() ?? [];
  }

  /**
   * Get all geometries from the renderer adapter
   */
  getGeometries(): import('../types').GeometryInfo[] {
    return this._rendererAdapter?.getGeometries() ?? [];
  }

  /**
   * Get all materials from the renderer adapter
   */
  getMaterials(): import('../types').MaterialInfo[] {
    return this._rendererAdapter?.getMaterials() ?? [];
  }

  /**
   * Get GPU timing information
   */
  async getGpuTimings(): Promise<import('../types').GpuTimingInfo | null> {
    return this._rendererAdapter?.getGpuTimings?.() ?? null;
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

  // ─────────────────────────────────────────────────────────────────
  // RENDER TARGET MANAGEMENT
  // ─────────────────────────────────────────────────────────────────

  /**
   * Get a unique ID for a render target (uses texture.uuid since WebGLRenderTarget lacks uuid)
   */
  private getRenderTargetId(rt: THREE.WebGLRenderTarget): string {
    // WebGLRenderTarget doesn't have a uuid property, but the texture does
    return (rt as unknown as { uuid?: string }).uuid || rt.texture?.uuid || '';
  }

  /**
   * Register a render target for observation
   * @param renderTarget The WebGLRenderTarget to observe
   * @param usage The usage type for this render target (helps with categorization)
   */
  observeRenderTarget(
    renderTarget: THREE.WebGLRenderTarget,
    usage: import('../types').RenderTargetUsage = 'custom'
  ): void {
    const rtId = this.getRenderTargetId(renderTarget);
    if (!rtId) {
      this.log('Cannot observe render target: no valid ID', { usage });
      return;
    }
    
    if (this._registeredRenderTargets.has(rtId)) {
      this.log('Render target already being observed', { uuid: rtId });
      return;
    }

    this._registeredRenderTargets.set(rtId, { rt: renderTarget, usage });
    this.log('Observing render target', { 
      uuid: rtId,
      name: renderTarget.texture?.name || '<unnamed>',
      size: `${renderTarget.width}x${renderTarget.height}`,
      usage
    });
  }

  /**
   * Stop observing a render target
   */
  unobserveRenderTarget(renderTarget: THREE.WebGLRenderTarget): void {
    const rtId = this.getRenderTargetId(renderTarget);
    if (this._registeredRenderTargets.delete(rtId)) {
      this.log('Stopped observing render target', { uuid: rtId });
    }
  }

  /**
   * Get all registered render targets
   */
  getRegisteredRenderTargets(): Map<string, { rt: THREE.WebGLRenderTarget; usage: import('../types').RenderTargetUsage }> {
    return this._registeredRenderTargets;
  }

  /**
   * Set the THREE.js library reference for selection highlighting
   * This enables visual bounding box highlights around selected objects
   * 
   * @example
   * ```typescript
   * import * as THREE from 'three';
   * const probe = createProbe({ appName: 'My App' });
   * probe.setThreeReference(THREE);
   * ```
   */
  setThreeReference(three: typeof import('three')): void {
    this._threeRef = three;
    this._selectionHelper.initialize(three);
    this.log('THREE.js reference set for selection highlighting');
  }

  /**
   * Update selection highlight (call this in your animation loop for moving objects)
   */
  updateSelectionHighlight(): void {
    this._selectionHelper.update();
  }

  /**
   * Take a manual snapshot of all observed scenes
   */
  takeSnapshot(): SceneSnapshot {
    const scenes: SceneNode[] = [];
    let allMaterials: import('../types').MaterialData[] = [];
    let combinedMaterialSummary: import('../types').MaterialsSummary = {
      totalCount: 0,
      byType: {},
      shaderMaterialCount: 0,
      transparentCount: 0,
    };
    let allGeometries: import('../types').GeometryData[] = [];
    let combinedGeometrySummary: import('../types').GeometrySummary = {
      totalCount: 0,
      totalVertices: 0,
      totalTriangles: 0,
      totalMemoryBytes: 0,
      byType: {},
      indexedCount: 0,
      morphedCount: 0,
    };
    let allTextures: import('../types').TextureData[] = [];
    let combinedTextureSummary: import('../types').TexturesSummary = {
      totalCount: 0,
      totalMemoryBytes: 0,
      byType: {},
      cubeTextureCount: 0,
      compressedCount: 0,
      videoTextureCount: 0,
      renderTargetCount: 0,
    };
    let allRenderTargets: import('../types').RenderTargetData[] = [];
    let combinedRenderTargetsSummary: import('../types').RenderTargetsSummary = {
      totalCount: 0,
      totalMemoryBytes: 0,
      shadowMapCount: 0,
      postProcessCount: 0,
      cubeTargetCount: 0,
      mrtCount: 0,
      msaaCount: 0,
    };

    for (const [scene, observer] of this._sceneObservers) {
      scenes.push(observer.createSceneNode(scene));

      // Collect materials from each scene
      const { materials, summary: matSummary } = observer.collectMaterials();
      
      // Merge materials (deduplicate by UUID)
      const existingMatUuids = new Set(allMaterials.map(m => m.uuid));
      for (const mat of materials) {
        if (!existingMatUuids.has(mat.uuid)) {
          allMaterials.push(mat);
          existingMatUuids.add(mat.uuid);
        }
      }

      // Merge material summary
      combinedMaterialSummary.totalCount = allMaterials.length;
      combinedMaterialSummary.shaderMaterialCount += matSummary.shaderMaterialCount;
      combinedMaterialSummary.transparentCount += matSummary.transparentCount;
      for (const [type, count] of Object.entries(matSummary.byType)) {
        combinedMaterialSummary.byType[type] = (combinedMaterialSummary.byType[type] || 0) + count;
      }

      // Collect geometries from each scene
      const { geometries, summary: geoSummary } = observer.collectGeometries();
      
      // Merge geometries (deduplicate by UUID)
      const existingGeoUuids = new Set(allGeometries.map(g => g.uuid));
      for (const geo of geometries) {
        if (!existingGeoUuids.has(geo.uuid)) {
          allGeometries.push(geo);
          existingGeoUuids.add(geo.uuid);
        }
      }

      // Merge geometry summary
      combinedGeometrySummary.totalCount = allGeometries.length;
      combinedGeometrySummary.totalVertices += geoSummary.totalVertices;
      combinedGeometrySummary.totalTriangles += geoSummary.totalTriangles;
      combinedGeometrySummary.totalMemoryBytes += geoSummary.totalMemoryBytes;
      combinedGeometrySummary.indexedCount += geoSummary.indexedCount;
      combinedGeometrySummary.morphedCount += geoSummary.morphedCount;
      for (const [type, count] of Object.entries(geoSummary.byType)) {
        combinedGeometrySummary.byType[type] = (combinedGeometrySummary.byType[type] || 0) + count;
      }

      // Collect textures from each scene
      const { textures, summary: texSummary } = observer.collectTextures();
      
      // Merge textures (deduplicate by UUID)
      const existingTexUuids = new Set(allTextures.map(t => t.uuid));
      for (const tex of textures) {
        if (!existingTexUuids.has(tex.uuid)) {
          allTextures.push(tex);
          existingTexUuids.add(tex.uuid);
        }
      }

      // Merge texture summary
      combinedTextureSummary.totalCount = allTextures.length;
      combinedTextureSummary.totalMemoryBytes += texSummary.totalMemoryBytes;
      combinedTextureSummary.cubeTextureCount += texSummary.cubeTextureCount;
      combinedTextureSummary.compressedCount += texSummary.compressedCount;
      combinedTextureSummary.videoTextureCount += texSummary.videoTextureCount;
      combinedTextureSummary.renderTargetCount += texSummary.renderTargetCount;
      for (const [type, count] of Object.entries(texSummary.byType)) {
        combinedTextureSummary.byType[type] = (combinedTextureSummary.byType[type] || 0) + count;
      }

      // Collect render targets from each scene
      const { renderTargets, summary: rtSummary } = observer.collectRenderTargets();
      
      // Merge render targets (deduplicate by UUID)
      const existingRtUuids = new Set(allRenderTargets.map(rt => rt.uuid));
      for (const rt of renderTargets) {
        if (!existingRtUuids.has(rt.uuid)) {
          allRenderTargets.push(rt);
          existingRtUuids.add(rt.uuid);
        }
      }

      // Merge render targets summary
      combinedRenderTargetsSummary.totalCount = allRenderTargets.length;
      combinedRenderTargetsSummary.totalMemoryBytes += rtSummary.totalMemoryBytes;
      combinedRenderTargetsSummary.shadowMapCount += rtSummary.shadowMapCount;
      combinedRenderTargetsSummary.postProcessCount += rtSummary.postProcessCount;
      combinedRenderTargetsSummary.cubeTargetCount += rtSummary.cubeTargetCount;
      combinedRenderTargetsSummary.mrtCount += rtSummary.mrtCount;
      combinedRenderTargetsSummary.msaaCount += rtSummary.msaaCount;
    }

    // Add registered render targets (from observeRenderTarget calls)
    const existingRtUuids = new Set(allRenderTargets.map(rt => rt.uuid));
    const firstObserver = this._sceneObservers.values().next().value as SceneObserver | undefined;
    
    for (const [uuid, { rt, usage }] of this._registeredRenderTargets) {
      if (existingRtUuids.has(uuid)) continue;
      
      // Use the first observer to create the render target data
      if (firstObserver) {
        const rtData = firstObserver.createRenderTargetDataPublic(rt, usage);
        allRenderTargets.push(rtData);
        existingRtUuids.add(uuid);
        
        // Update summary
        combinedRenderTargetsSummary.totalMemoryBytes += rtData.memoryBytes;
        if (usage === 'shadow-map') combinedRenderTargetsSummary.shadowMapCount++;
        if (usage === 'post-process') combinedRenderTargetsSummary.postProcessCount++;
        if (rtData.isCubeTarget) combinedRenderTargetsSummary.cubeTargetCount++;
        if (rtData.colorAttachmentCount > 1) combinedRenderTargetsSummary.mrtCount++;
        if (rtData.samples > 0) combinedRenderTargetsSummary.msaaCount++;
      }
    }
    combinedRenderTargetsSummary.totalCount = allRenderTargets.length;

    const snapshot: SceneSnapshot = {
      snapshotId: this.generateId(),
      timestamp: performance.now(),
      scenes,
      materials: allMaterials,
      materialsSummary: combinedMaterialSummary,
      geometries: allGeometries,
      geometriesSummary: combinedGeometrySummary,
      textures: allTextures,
      texturesSummary: combinedTextureSummary,
      renderTargets: allRenderTargets,
      renderTargetsSummary: combinedRenderTargetsSummary,
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

    // Update visual highlight in the 3D scene
    this._selectionHelper.highlight(obj);

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
   * Select an object by its debug ID (used by UI components)
   */
  selectByDebugId(debugId: string | null): boolean {
    if (!debugId) {
      this.selectObject(null);
      return true;
    }

    // Find object across all scene observers
    for (const observer of this._sceneObservers.values()) {
      const obj = observer.findObjectByDebugId(debugId);
      if (obj) {
        this.selectObject(obj);
        return true;
      }
    }

    return false;
  }

  /**
   * Get the currently selected object
   */
  getSelectedObject(): THREE.Object3D | null {
    return this._selectedObject;
  }

  // ─────────────────────────────────────────────────────────────────
  // VISUAL OVERLAYS
  // ─────────────────────────────────────────────────────────────────

  /**
   * Toggle wireframe visualization for an object
   */
  toggleWireframe(obj: THREE.Object3D, enabled: boolean): void {
    if (!('isMesh' in obj) || !(obj as THREE.Mesh).isMesh) {
      return;
    }
    const mesh = obj as THREE.Mesh;
    this.applyGeometryVisualization(mesh, 'wireframe', enabled);
  }

  /**
   * Toggle bounding box visualization for an object
   */
  toggleBoundingBox(obj: THREE.Object3D, enabled: boolean): void {
    if (!('isMesh' in obj) || !(obj as THREE.Mesh).isMesh) {
      return;
    }
    const mesh = obj as THREE.Mesh;
    this.applyGeometryVisualization(mesh, 'boundingBox', enabled);
  }

  /**
   * Toggle wireframe for the currently selected object
   */
  toggleSelectedWireframe(enabled: boolean): void {
    if (this._selectedObject) {
      this.toggleWireframe(this._selectedObject, enabled);
    }
  }

  /**
   * Toggle bounding box for the currently selected object
   */
  toggleSelectedBoundingBox(enabled: boolean): void {
    if (this._selectedObject) {
      this.toggleBoundingBox(this._selectedObject, enabled);
    }
  }

  /**
   * Check if wireframe is enabled for an object
   */
  isWireframeEnabled(obj: THREE.Object3D): boolean {
    const helperKey = `${obj.uuid}_wireframe`;
    return this._visualizationHelpers.has(helperKey);
  }

  /**
   * Check if bounding box is enabled for an object
   */
  isBoundingBoxEnabled(obj: THREE.Object3D): boolean {
    const helperKey = `${obj.uuid}_boundingBox`;
    return this._visualizationHelpers.has(helperKey);
  }

  /**
   * Toggle global wireframe mode for all meshes in all scenes
   */
  toggleGlobalWireframe(enabled: boolean): void {
    this._globalWireframe = enabled;
    for (const scene of this._sceneObservers.keys()) {
      scene.traverse((obj) => {
        if ('isMesh' in obj && (obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          // Skip 3lens helpers
          if (mesh.name.startsWith('3lens_') || mesh.name.startsWith('__3lens')) {
            return;
          }
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          for (const mat of materials) {
            if (mat && 'wireframe' in mat) {
              (mat as THREE.MeshBasicMaterial).wireframe = enabled;
              mat.needsUpdate = true;
            }
          }
        }
      });
    }
  }

  /**
   * Check if global wireframe mode is enabled
   */
  isGlobalWireframeEnabled(): boolean {
    return this._globalWireframe;
  }

  /**
   * Update a material property by UUID
   * Used by the overlay and extension to live-edit materials
   */
  updateMaterialProperty(materialUuid: string, property: string, value: unknown): void {
    for (const observer of this._sceneObservers.values()) {
      const material = observer.findMaterialByUuid(materialUuid);
      if (material) {
        this.applyMaterialPropertyChange(material, property, value);
        return;
      }
    }
    this.log('Material not found for property update', { uuid: materialUuid });
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

  /**
   * Set the hovered object (used by InspectMode for hover highlighting)
   */
  setHoveredObject(obj: THREE.Object3D | null): void {
    this._hoveredObject = obj;
    this._selectionHelper.highlightHover(obj);
  }

  /**
   * Get the currently hovered object
   */
  getHoveredObject(): THREE.Object3D | null {
    return this._hoveredObject;
  }

  // ─────────────────────────────────────────────────────────────────
  // INSPECT MODE (Interactive Debugging)
  // ─────────────────────────────────────────────────────────────────

  /**
   * Initialize inspect mode with canvas and camera
   * This enables interactive object selection via raycasting
   * 
   * @example
   * ```typescript
   * import * as THREE from 'three';
   * const probe = createProbe({ appName: 'My App' });
   * probe.setThreeReference(THREE);
   * probe.observeRenderer(renderer);
   * probe.observeScene(scene);
   * 
   * // Initialize inspect mode
   * probe.initializeInspectMode(renderer.domElement, camera, THREE);
   * 
   * // Enable inspect mode (e.g., via UI toggle)
   * probe.setInspectModeEnabled(true);
   * ```
   */
  initializeInspectMode(
    canvas: HTMLCanvasElement,
    camera: THREE.Camera,
    three: typeof import('three')
  ): void {
    this._inspectMode.initialize(canvas, camera, three);
    this.log('Inspect mode initialized');
  }

  /**
   * Enable or disable inspect mode
   * When enabled, users can click on objects in the 3D scene to select them
   * and hover to see highlights
   */
  setInspectModeEnabled(enabled: boolean): void {
    this._inspectMode.setEnabled(enabled);
    this.log(enabled ? 'Inspect mode enabled' : 'Inspect mode disabled');
  }

  /**
   * Check if inspect mode is currently enabled
   */
  isInspectModeEnabled(): boolean {
    return this._inspectMode.isEnabled();
  }

  /**
   * Update the camera used for raycasting in inspect mode
   * Useful when camera changes during runtime (e.g., camera switching)
   */
  setInspectModeCamera(camera: THREE.Camera): void {
    this._inspectMode.setCamera(camera);
  }

  /**
   * Set specific objects to be pickable in inspect mode
   * If not set, all meshes in observed scenes will be pickable
   */
  setInspectModePickableObjects(objects: THREE.Object3D[]): void {
    this._inspectMode.setPickableObjects(objects);
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
    // Dispose selection helper
    this._selectionHelper.dispose();

    // Dispose inspect mode
    this._inspectMode.dispose();

    // Dispose visualization helpers
    for (const [, helper] of this._visualizationHelpers) {
      helper.parent?.remove(helper);
      if ('geometry' in helper && (helper as THREE.Mesh).geometry) {
        ((helper as THREE.Mesh).geometry as THREE.BufferGeometry).dispose();
      }
      if ('material' in helper && (helper as THREE.Mesh).material) {
        const mat = (helper as THREE.Mesh).material;
        if (Array.isArray(mat)) {
          mat.forEach((m) => m.dispose());
        } else {
          mat.dispose();
        }
      }
    }
    this._visualizationHelpers.clear();

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
    // Store in history using circular buffer (O(1) instead of O(n) with shift)
    if (this._frameStatsHistory.length < this._maxHistorySize) {
      this._frameStatsHistory.push(stats);
    } else {
      this._frameStatsHistory[this._frameStatsHistoryIndex] = stats;
      this._frameStatsHistoryIndex = (this._frameStatsHistoryIndex + 1) % this._maxHistorySize;
    }

    // Skip expensive operations if nothing is listening
    const hasListeners = this._frameStatsCallbacks.length > 0 || this._transport?.isConnected();
    if (!hasListeners && !this.config.rules && !this._selectedObject) {
      return; // Fast path - nothing to do
    }

    // Only check rules if rules are configured
    if (this.config.rules) {
      const violations = this.checkRules(stats);
      if (violations.length > 0) {
        stats.violations = violations;
      }
    }

    // Only update selection highlight if there's a selected object
    if (this._selectedObject) {
      this._selectionHelper.update();
    }

    // Notify callbacks only if there are any
    if (this._frameStatsCallbacks.length > 0) {
      for (const callback of this._frameStatsCallbacks) {
        callback(stats);
      }
    }

    // Only send message if transport is connected
    if (this._transport?.isConnected()) {
      this.sendMessage({
        type: 'frame-stats',
        timestamp: stats.timestamp,
        stats,
      });
    }
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
      case 'hover-object':
        this.handleHoverObject(message);
        break;
      case 'request-snapshot':
        this.takeSnapshot();
        break;
      case 'update-material-property':
        this.handleUpdateMaterialProperty(message);
        break;
      case 'geometry-visualization':
        this.handleGeometryVisualization(message);
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

  private handleHoverObject(message: DebugMessage & { debugId: string | null }): void {
    if (!message.debugId) {
      // Clear hover highlight
      this._hoveredObject = null;
      this._selectionHelper.highlightHover(null);
      return;
    }

    // Find object by debugId and apply hover highlight
    for (const observer of this._sceneObservers.values()) {
      const obj = observer.findObjectByDebugId(message.debugId);
      if (obj) {
        this._hoveredObject = obj;
        this._selectionHelper.highlightHover(obj);
        return;
      }
    }
  }

  private handleUpdateMaterialProperty(
    message: DebugMessage & { materialUuid: string; property: string; value: unknown }
  ): void {
    // Find material by UUID across all observers
    for (const observer of this._sceneObservers.values()) {
      const material = observer.findMaterialByUuid(message.materialUuid);
      if (material) {
        this.applyMaterialPropertyChange(material, message.property, message.value);
        return;
      }
    }

    this.log('Material not found for property update', { uuid: message.materialUuid });
  }

  private handleGeometryVisualization(
    message: DebugMessage & {
      geometryUuid: string;
      visualization: 'wireframe' | 'boundingBox' | 'normals';
      enabled: boolean;
    }
  ): void {
    const { geometryUuid, visualization, enabled } = message;

    // Find geometry and its associated mesh(es) across all observers
    for (const observer of this._sceneObservers.values()) {
      const geometry = observer.findGeometryByUuid(geometryUuid);
      if (!geometry) continue;

      // Find meshes using this geometry
      this._sceneObservers.forEach((obs, scene) => {
        scene.traverse((obj) => {
          if ('isMesh' in obj && (obj as THREE.Mesh).isMesh) {
            const mesh = obj as THREE.Mesh;
            if (mesh.geometry?.uuid === geometryUuid) {
              this.applyGeometryVisualization(mesh, visualization, enabled);
            }
          }
        });
      });
      return;
    }

    this.log('Geometry not found for visualization', { uuid: geometryUuid });
  }

  private applyGeometryVisualization(
    mesh: THREE.Mesh,
    visualization: 'wireframe' | 'boundingBox' | 'normals',
    enabled: boolean
  ): void {
    const THREE = this._threeRef;
    if (!THREE) {
      this.log('THREE.js reference not set - cannot create visualization helpers');
      return;
    }

    const helperKey = `${mesh.uuid}_${visualization}`;

    if (enabled) {
      // Remove existing helper if any
      const existingHelper = this._visualizationHelpers.get(helperKey);
      if (existingHelper) {
        existingHelper.parent?.remove(existingHelper);
        this._visualizationHelpers.delete(helperKey);
      }

      switch (visualization) {
        case 'wireframe': {
          // Toggle wireframe on the material(s)
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          for (const mat of materials) {
            if (mat && 'wireframe' in mat) {
              (mat as THREE.MeshBasicMaterial).wireframe = true;
              mat.needsUpdate = true;
            }
          }
          // Store a marker so we can disable it later
          this._visualizationHelpers.set(helperKey, mesh);
          break;
        }

        case 'boundingBox': {
          // Compute bounding box if not already done
          if (!mesh.geometry.boundingBox) {
            mesh.geometry.computeBoundingBox();
          }
          // Create a BoxHelper
          const boxHelper = new THREE.BoxHelper(mesh, 0x22d3ee); // cyan color
          boxHelper.name = `3lens_bbox_${mesh.uuid}`;
          mesh.parent?.add(boxHelper);
          this._visualizationHelpers.set(helperKey, boxHelper);
          break;
        }

        case 'normals': {
          // Create a VertexNormalsHelper-like visualization
          // Since VertexNormalsHelper is in examples, we'll create a simple version
          const normalHelper = this.createNormalsHelper(mesh, THREE);
          if (normalHelper) {
            normalHelper.name = `3lens_normals_${mesh.uuid}`;
            mesh.parent?.add(normalHelper);
            this._visualizationHelpers.set(helperKey, normalHelper);
          }
          break;
        }
      }
    } else {
      // Disable visualization
      const helper = this._visualizationHelpers.get(helperKey);
      if (helper) {
        if (visualization === 'wireframe') {
          // Restore wireframe state
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          for (const mat of materials) {
            if (mat && 'wireframe' in mat) {
              (mat as THREE.MeshBasicMaterial).wireframe = false;
              mat.needsUpdate = true;
            }
          }
        } else {
          // Remove helper from scene
          helper.parent?.remove(helper);
          // Dispose geometry and material if present
          if ('geometry' in helper && (helper as THREE.Mesh).geometry) {
            ((helper as THREE.Mesh).geometry as THREE.BufferGeometry).dispose();
          }
          if ('material' in helper && (helper as THREE.Mesh).material) {
            const mat = (helper as THREE.Mesh).material;
            if (Array.isArray(mat)) {
              mat.forEach((m) => m.dispose());
            } else {
              mat.dispose();
            }
          }
        }
        this._visualizationHelpers.delete(helperKey);
      }
    }
  }

  private createNormalsHelper(mesh: THREE.Mesh, THREE: typeof import('three')): THREE.LineSegments | null {
    const geometry = mesh.geometry;
    const normalAttribute = geometry.attributes.normal;
    
    if (!normalAttribute) {
      this.log('No normal attribute found on geometry');
      return null;
    }

    const positionAttribute = geometry.attributes.position;
    if (!positionAttribute) {
      return null;
    }

    const normalLength = 0.1;
    const color = 0x34d399; // emerald

    const vertices: number[] = [];
    const count = positionAttribute.count;

    for (let i = 0; i < count; i++) {
      const x = positionAttribute.getX(i);
      const y = positionAttribute.getY(i);
      const z = positionAttribute.getZ(i);

      const nx = normalAttribute.getX(i);
      const ny = normalAttribute.getY(i);
      const nz = normalAttribute.getZ(i);

      // Start point (vertex position)
      vertices.push(x, y, z);
      // End point (vertex + normal * length)
      vertices.push(x + nx * normalLength, y + ny * normalLength, z + nz * normalLength);
    }

    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    const lineMaterial = new THREE.LineBasicMaterial({ color });
    const lineSegments = new THREE.LineSegments(lineGeometry, lineMaterial);

    // Copy the mesh's world transform
    lineSegments.matrixAutoUpdate = false;
    lineSegments.matrix.copy(mesh.matrixWorld);

    return lineSegments;
  }

  private applyMaterialPropertyChange(
    material: THREE.Material,
    property: string,
    value: unknown
  ): void {
    const mat = material as Record<string, unknown>;

    switch (property) {
      case 'color':
      case 'emissive': {
        // Value is a hex number
        if (typeof value === 'number' && mat[property] && typeof (mat[property] as { setHex?: (v: number) => void }).setHex === 'function') {
          (mat[property] as { setHex: (v: number) => void }).setHex(value);
        }
        break;
      }

      case 'opacity':
      case 'roughness':
      case 'metalness':
      case 'reflectivity':
      case 'clearcoat':
      case 'clearcoatRoughness':
      case 'sheen':
      case 'sheenRoughness':
      case 'transmission':
      case 'thickness':
      case 'ior': {
        // Numeric properties
        if (typeof value === 'number' && property in mat) {
          mat[property] = value;
        }
        break;
      }

      case 'transparent':
      case 'visible':
      case 'wireframe':
      case 'depthTest':
      case 'depthWrite':
      case 'flatShading': {
        // Boolean properties
        if (typeof value === 'boolean' && property in mat) {
          mat[property] = value;
        }
        break;
      }

      case 'side': {
        // Side enum (0, 1, 2)
        if (typeof value === 'number' && property in mat) {
          mat[property] = value;
        }
        break;
      }

      default:
        this.log('Unknown material property', { property, value });
    }

    // Mark material as needing update
    material.needsUpdate = true;
  }

  private checkRules(stats: FrameStats): FrameStats['violations'] {
    const violations: NonNullable<FrameStats['violations']> = [];
    const rules = this.config.rules;

    if (!rules) return violations;

    // Frame timing rules
    if (rules.maxDrawCalls && stats.drawCalls > rules.maxDrawCalls) {
      violations.push({
        ruleId: 'maxDrawCalls',
        message: `Draw calls (${stats.drawCalls}) exceeded threshold (${rules.maxDrawCalls})`,
        severity: 'warning',
        value: stats.drawCalls,
        threshold: rules.maxDrawCalls,
        suggestion: 'Consider using instancing or merging geometries',
      });
    }

    if (rules.maxTriangles && stats.triangles > rules.maxTriangles) {
      violations.push({
        ruleId: 'maxTriangles',
        message: `Triangles (${stats.triangles}) exceeded threshold (${rules.maxTriangles})`,
        severity: 'warning',
        value: stats.triangles,
        threshold: rules.maxTriangles,
        suggestion: 'Use LOD or reduce polygon count',
      });
    }

    if (rules.maxFrameTimeMs && stats.cpuTimeMs > rules.maxFrameTimeMs) {
      violations.push({
        ruleId: 'maxFrameTimeMs',
        message: `Frame time (${stats.cpuTimeMs.toFixed(2)}ms) exceeded threshold (${rules.maxFrameTimeMs}ms)`,
        severity: 'warning',
        value: stats.cpuTimeMs,
        threshold: rules.maxFrameTimeMs,
        suggestion: 'Profile and optimize the most expensive operations',
      });
    }

    // Memory rules
    if (rules.maxTextureMemory && stats.memory?.textureMemory > rules.maxTextureMemory) {
      violations.push({
        ruleId: 'maxTextureMemory',
        message: `Texture memory (${this.formatBytes(stats.memory.textureMemory)}) exceeded threshold`,
        severity: 'warning',
        value: stats.memory.textureMemory,
        threshold: rules.maxTextureMemory,
        suggestion: 'Compress textures or reduce resolution',
      });
    }

    if (rules.maxGeometryMemory && stats.memory?.geometryMemory > rules.maxGeometryMemory) {
      violations.push({
        ruleId: 'maxGeometryMemory',
        message: `Geometry memory (${this.formatBytes(stats.memory.geometryMemory)}) exceeded threshold`,
        severity: 'warning',
        value: stats.memory.geometryMemory,
        threshold: rules.maxGeometryMemory,
        suggestion: 'Reduce vertex count or use compression',
      });
    }

    if (rules.maxGpuMemory && stats.memory?.totalGpuMemory > rules.maxGpuMemory) {
      violations.push({
        ruleId: 'maxGpuMemory',
        message: `Total GPU memory (${this.formatBytes(stats.memory.totalGpuMemory)}) exceeded threshold`,
        severity: 'error',
        value: stats.memory.totalGpuMemory,
        threshold: rules.maxGpuMemory,
        suggestion: 'Reduce texture and geometry memory usage',
      });
    }

    // Rendering rules
    if (rules.maxLights && stats.rendering?.totalLights > rules.maxLights) {
      violations.push({
        ruleId: 'maxLights',
        message: `Lights (${stats.rendering.totalLights}) exceeded threshold (${rules.maxLights})`,
        severity: 'warning',
        value: stats.rendering.totalLights,
        threshold: rules.maxLights,
        suggestion: 'Use light probes or baked lighting',
      });
    }

    if (rules.maxShadowLights && stats.rendering?.shadowCastingLights > rules.maxShadowLights) {
      violations.push({
        ruleId: 'maxShadowLights',
        message: `Shadow-casting lights (${stats.rendering.shadowCastingLights}) exceeded threshold`,
        severity: 'warning',
        value: stats.rendering.shadowCastingLights,
        threshold: rules.maxShadowLights,
        suggestion: 'Reduce shadow-casting lights or use baked shadows',
      });
    }

    if (rules.maxSkinnedMeshes && stats.rendering?.skinnedMeshes > rules.maxSkinnedMeshes) {
      violations.push({
        ruleId: 'maxSkinnedMeshes',
        message: `Skinned meshes (${stats.rendering.skinnedMeshes}) exceeded threshold`,
        severity: 'warning',
        value: stats.rendering.skinnedMeshes,
        threshold: rules.maxSkinnedMeshes,
        suggestion: 'Reduce animated character count or use LOD',
      });
    }

    if (rules.maxBones && stats.rendering?.totalBones > rules.maxBones) {
      violations.push({
        ruleId: 'maxBones',
        message: `Total bones (${stats.rendering.totalBones}) exceeded threshold (${rules.maxBones})`,
        severity: 'warning',
        value: stats.rendering.totalBones,
        threshold: rules.maxBones,
        suggestion: 'Reduce bone count in character rigs',
      });
    }

    if (rules.maxTransparentObjects && stats.rendering?.transparentObjects > rules.maxTransparentObjects) {
      violations.push({
        ruleId: 'maxTransparentObjects',
        message: `Transparent objects (${stats.rendering.transparentObjects}) exceeded threshold`,
        severity: 'warning',
        value: stats.rendering.transparentObjects,
        threshold: rules.maxTransparentObjects,
        suggestion: 'Reduce transparent objects or use alpha testing',
      });
    }

    // Performance rules
    if (rules.minFps && stats.performance?.fps < rules.minFps) {
      violations.push({
        ruleId: 'minFps',
        message: `FPS (${stats.performance.fps}) below minimum (${rules.minFps})`,
        severity: 'error',
        value: stats.performance.fps,
        threshold: rules.minFps,
        suggestion: 'Reduce scene complexity or optimize shaders',
      });
    }

    if (rules.min1PercentLowFps && stats.performance?.fps1PercentLow < rules.min1PercentLowFps) {
      violations.push({
        ruleId: 'min1PercentLowFps',
        message: `1% low FPS (${Math.round(stats.performance.fps1PercentLow)}) below minimum`,
        severity: 'warning',
        value: stats.performance.fps1PercentLow,
        threshold: rules.min1PercentLowFps,
        suggestion: 'Investigate frame time spikes',
      });
    }

    if (rules.maxFrameTimeVariance && stats.performance?.frameTimeVariance > rules.maxFrameTimeVariance) {
      violations.push({
        ruleId: 'maxFrameTimeVariance',
        message: `Frame time variance (${stats.performance.frameTimeVariance.toFixed(2)}ms) too high`,
        severity: 'info',
        value: stats.performance.frameTimeVariance,
        threshold: rules.maxFrameTimeVariance,
        suggestion: 'Look for inconsistent workloads or GC pauses',
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

  private formatBytes(bytes: number): string {
    if (bytes >= 1073741824) {
      return (bytes / 1073741824).toFixed(2) + ' GB';
    }
    if (bytes >= 1048576) {
      return (bytes / 1048576).toFixed(2) + ' MB';
    }
    if (bytes >= 1024) {
      return (bytes / 1024).toFixed(2) + ' KB';
    }
    return bytes + ' B';
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

