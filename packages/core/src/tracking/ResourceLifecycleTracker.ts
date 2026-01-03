/**
 * Resource Lifecycle Tracker
 * 
 * Tracks creation and disposal of Three.js resources (geometries, materials, textures)
 * with optional stack traces for debugging memory leaks.
 */

/**
 * Types of resources that can be tracked
 */
export type ResourceType = 'geometry' | 'material' | 'texture';

/**
 * Types of lifecycle events
 */
export type LifecycleEventType = 'created' | 'disposed' | 'attached' | 'detached';

/**
 * A lifecycle event for a tracked resource
 */
export interface ResourceLifecycleEvent {
  id: string;                    // Unique event ID
  resourceType: ResourceType;    // Type of resource
  resourceUuid: string;          // UUID of the resource
  resourceName?: string;         // Optional name of the resource
  resourceSubtype?: string;      // e.g., 'MeshStandardMaterial', 'BoxGeometry'
  eventType: LifecycleEventType; // What happened
  timestamp: number;             // When it happened (ms since page load)
  stackTrace?: string;           // Optional stack trace for debugging
  metadata?: {                   // Additional context
    meshUuid?: string;           // UUID of mesh this was attached to/detached from
    meshName?: string;           // Name of the mesh
    textureSlot?: string;        // For textures: 'map', 'normalMap', etc.
    estimatedMemory?: number;    // Estimated memory in bytes
    vertexCount?: number;        // For geometries
    faceCount?: number;          // For geometries
  };
}

/**
 * Summary of resource lifecycle
 */
export interface ResourceLifecycleSummary {
  geometries: {
    created: number;
    disposed: number;
    active: number;             // created - disposed
    leaked: number;             // Potentially leaked (old, not disposed)
  };
  materials: {
    created: number;
    disposed: number;
    active: number;
    leaked: number;
  };
  textures: {
    created: number;
    disposed: number;
    active: number;
    leaked: number;
  };
  totalEvents: number;
  oldestActiveResource?: {
    type: ResourceType;
    uuid: string;
    name?: string;
    ageMs: number;
  };
}

/**
 * Options for the ResourceLifecycleTracker
 */
export interface ResourceTrackerOptions {
  captureStackTraces?: boolean;  // Whether to capture stack traces (performance impact)
  maxEvents?: number;            // Maximum events to keep in history
  leakThresholdMs?: number;      // Time after which an undisposed resource is considered leaked
  orphanCheckIntervalMs?: number; // How often to check for orphaned resources
  memoryGrowthThresholdBytes?: number; // Alert threshold for memory growth
}

/**
 * Leak detection alert severity
 */
export type LeakAlertSeverity = 'info' | 'warning' | 'critical';

/**
 * Types of leak alerts
 */
export type LeakAlertType = 
  | 'orphaned_resource'     // Resource not attached to any mesh
  | 'undisposed_resource'   // Resource older than threshold, not disposed
  | 'memory_growth'         // Memory usage growing consistently
  | 'resource_accumulation' // Too many resources of one type
  | 'detached_not_disposed'; // Resource detached but never disposed

/**
 * A leak detection alert
 */
export interface LeakAlert {
  id: string;
  type: LeakAlertType;
  severity: LeakAlertSeverity;
  resourceType?: ResourceType;
  resourceUuid?: string;
  resourceName?: string;
  message: string;
  details: string;
  timestamp: number;
  stackTrace?: string;
  suggestion: string;
}

/**
 * Leak detection report
 */
export interface LeakReport {
  generatedAt: number;
  sessionDurationMs: number;
  summary: {
    totalAlerts: number;
    criticalAlerts: number;
    warningAlerts: number;
    infoAlerts: number;
    estimatedLeakedMemoryBytes: number;
  };
  alerts: LeakAlert[];
  resourceStats: {
    geometries: { created: number; disposed: number; orphaned: number; leaked: number };
    materials: { created: number; disposed: number; orphaned: number; leaked: number };
    textures: { created: number; disposed: number; orphaned: number; leaked: number };
  };
  memoryHistory: Array<{ timestamp: number; estimatedBytes: number }>;
  recommendations: string[];
}

/**
 * Callback for lifecycle events
 */
export type LifecycleEventCallback = (event: ResourceLifecycleEvent) => void;

/**
 * Callback for leak alerts
 */
export type LeakAlertCallback = (alert: LeakAlert) => void;

/**
 * Tracks resource lifecycle events
 */
export class ResourceLifecycleTracker {
  private events: ResourceLifecycleEvent[] = [];
  private activeResources: Map<string, { 
    type: ResourceType; 
    createdAt: number; 
    name?: string; 
    subtype?: string;
    estimatedMemory?: number;
    attachedMeshes: Set<string>;  // Track which meshes this resource is attached to
    lastAttachmentTime?: number;
    detachedAt?: number;  // When it was last detached (if not disposed)
  }> = new Map();
  private eventIdCounter = 0;
  private alertIdCounter = 0;
  private callbacks: LifecycleEventCallback[] = [];
  private alertCallbacks: LeakAlertCallback[] = [];
  private alerts: LeakAlert[] = [];
  private options: Required<Omit<ResourceTrackerOptions, 'orphanCheckIntervalMs' | 'memoryGrowthThresholdBytes'>> & {
    orphanCheckIntervalMs: number;
    memoryGrowthThresholdBytes: number;
  };
  private sessionStartTime: number;
  private memoryHistory: Array<{ timestamp: number; estimatedBytes: number }> = [];
  private lastMemoryCheck = 0;

  constructor(options: ResourceTrackerOptions = {}) {
    this.options = {
      captureStackTraces: options.captureStackTraces ?? false,
      maxEvents: options.maxEvents ?? 1000,
      leakThresholdMs: options.leakThresholdMs ?? 60000, // 1 minute default
      orphanCheckIntervalMs: options.orphanCheckIntervalMs ?? 10000, // 10 seconds
      memoryGrowthThresholdBytes: options.memoryGrowthThresholdBytes ?? 50 * 1024 * 1024, // 50MB
    };
    this.sessionStartTime = performance.now();
  }

  /**
   * Enable or disable stack trace capture
   */
  setStackTraceCapture(enabled: boolean): void {
    this.options.captureStackTraces = enabled;
  }

  /**
   * Check if stack trace capture is enabled
   */
  isStackTraceCaptureEnabled(): boolean {
    return this.options.captureStackTraces;
  }

  /**
   * Subscribe to lifecycle events
   */
  onEvent(callback: LifecycleEventCallback): () => void {
    this.callbacks.push(callback);
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index !== -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }

  /**
   * Record a resource creation event
   */
  recordCreation(
    resourceType: ResourceType,
    resourceUuid: string,
    options?: {
      name?: string;
      subtype?: string;
      estimatedMemory?: number;
      vertexCount?: number;
      faceCount?: number;
    }
  ): void {
    const event = this.createEvent(resourceType, resourceUuid, 'created', {
      resourceName: options?.name,
      resourceSubtype: options?.subtype,
      metadata: {
        estimatedMemory: options?.estimatedMemory,
        vertexCount: options?.vertexCount,
        faceCount: options?.faceCount,
      },
    });

    // Track as active resource
    this.activeResources.set(resourceUuid, {
      type: resourceType,
      createdAt: event.timestamp,
      name: options?.name,
      subtype: options?.subtype,
      estimatedMemory: options?.estimatedMemory,
      attachedMeshes: new Set(),
    });

    this.addEvent(event);
    this.updateMemoryHistory();
  }

  /**
   * Record a resource disposal event
   */
  recordDisposal(resourceType: ResourceType, resourceUuid: string): void {
    const event = this.createEvent(resourceType, resourceUuid, 'disposed');

    // Remove from active resources
    this.activeResources.delete(resourceUuid);

    this.addEvent(event);
    this.updateMemoryHistory();
  }

  /**
   * Record a resource being attached to a mesh
   */
  recordAttachment(
    resourceType: ResourceType,
    resourceUuid: string,
    meshUuid: string,
    options?: {
      meshName?: string;
      textureSlot?: string;
    }
  ): void {
    const event = this.createEvent(resourceType, resourceUuid, 'attached', {
      metadata: {
        meshUuid,
        meshName: options?.meshName,
        textureSlot: options?.textureSlot,
      },
    });

    // Track attachment
    const resource = this.activeResources.get(resourceUuid);
    if (resource) {
      resource.attachedMeshes.add(meshUuid);
      resource.lastAttachmentTime = event.timestamp;
      resource.detachedAt = undefined; // Clear detached state
    }

    this.addEvent(event);
  }

  /**
   * Record a resource being detached from a mesh
   */
  recordDetachment(
    resourceType: ResourceType,
    resourceUuid: string,
    meshUuid: string,
    options?: {
      meshName?: string;
      textureSlot?: string;
    }
  ): void {
    const event = this.createEvent(resourceType, resourceUuid, 'detached', {
      metadata: {
        meshUuid,
        meshName: options?.meshName,
        textureSlot: options?.textureSlot,
      },
    });

    // Track detachment
    const resource = this.activeResources.get(resourceUuid);
    if (resource) {
      resource.attachedMeshes.delete(meshUuid);
      if (resource.attachedMeshes.size === 0) {
        resource.detachedAt = event.timestamp;
      }
    }

    this.addEvent(event);
  }

  /**
   * Get all events
   */
  getEvents(): ResourceLifecycleEvent[] {
    return [...this.events];
  }

  /**
   * Get events filtered by type
   */
  getEventsByType(resourceType: ResourceType): ResourceLifecycleEvent[] {
    return this.events.filter(e => e.resourceType === resourceType);
  }

  /**
   * Get events filtered by event type
   */
  getEventsByEventType(eventType: LifecycleEventType): ResourceLifecycleEvent[] {
    return this.events.filter(e => e.eventType === eventType);
  }

  /**
   * Get events within a time range
   */
  getEventsInRange(startMs: number, endMs: number): ResourceLifecycleEvent[] {
    return this.events.filter(e => e.timestamp >= startMs && e.timestamp <= endMs);
  }

  /**
   * Get summary of resource lifecycle
   */
  getSummary(): ResourceLifecycleSummary {
    const now = performance.now();
    const leakThreshold = now - this.options.leakThresholdMs;

    const summary: ResourceLifecycleSummary = {
      geometries: { created: 0, disposed: 0, active: 0, leaked: 0 },
      materials: { created: 0, disposed: 0, active: 0, leaked: 0 },
      textures: { created: 0, disposed: 0, active: 0, leaked: 0 },
      totalEvents: this.events.length,
    };

    // Map resource type to summary key
    const typeToKey = (type: ResourceType): 'geometries' | 'materials' | 'textures' => {
      switch (type) {
        case 'geometry': return 'geometries';
        case 'material': return 'materials';
        case 'texture': return 'textures';
      }
    };

    // Count events
    for (const event of this.events) {
      const stats = summary[typeToKey(event.resourceType)];
      if (event.eventType === 'created') {
        stats.created++;
      } else if (event.eventType === 'disposed') {
        stats.disposed++;
      }
    }

    // Calculate active counts and check for leaks
    let oldestActive: { type: ResourceType; uuid: string; name?: string; ageMs: number } | undefined;

    for (const [uuid, info] of this.activeResources) {
      const stats = summary[typeToKey(info.type)];
      stats.active++;

      const ageMs = now - info.createdAt;
      if (info.createdAt < leakThreshold) {
        stats.leaked++;
      }

      if (!oldestActive || ageMs > oldestActive.ageMs) {
        oldestActive = {
          type: info.type,
          uuid,
          name: info.name,
          ageMs,
        };
      }
    }

    summary.oldestActiveResource = oldestActive;

    return summary;
  }

  /**
   * Get potentially leaked resources (active resources older than threshold)
   */
  getPotentialLeaks(): Array<{
    type: ResourceType;
    uuid: string;
    name?: string;
    subtype?: string;
    ageMs: number;
  }> {
    const now = performance.now();
    const leakThreshold = now - this.options.leakThresholdMs;
    const leaks: Array<{
      type: ResourceType;
      uuid: string;
      name?: string;
      subtype?: string;
      ageMs: number;
    }> = [];

    for (const [uuid, info] of this.activeResources) {
      if (info.createdAt < leakThreshold) {
        leaks.push({
          type: info.type,
          uuid,
          name: info.name,
          subtype: info.subtype,
          ageMs: now - info.createdAt,
        });
      }
    }

    // Sort by age (oldest first)
    leaks.sort((a, b) => b.ageMs - a.ageMs);

    return leaks;
  }

  // ─────────────────────────────────────────────────────────────────
  // LEAK DETECTION
  // ─────────────────────────────────────────────────────────────────

  /**
   * Subscribe to leak alerts
   */
  onAlert(callback: LeakAlertCallback): () => void {
    this.alertCallbacks.push(callback);
    return () => {
      const index = this.alertCallbacks.indexOf(callback);
      if (index !== -1) {
        this.alertCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Get all leak alerts
   */
  getAlerts(): LeakAlert[] {
    return [...this.alerts];
  }

  /**
   * Clear all alerts
   */
  clearAlerts(): void {
    this.alerts = [];
  }

  /**
   * Run leak detection checks
   */
  runLeakDetection(): LeakAlert[] {
    const newAlerts: LeakAlert[] = [];
    const now = performance.now();

    // Check for orphaned resources (created but never attached)
    newAlerts.push(...this.detectOrphanedResources(now));

    // Check for undisposed resources after threshold
    newAlerts.push(...this.detectUndisposedResources(now));

    // Check for detached but not disposed resources
    newAlerts.push(...this.detectDetachedNotDisposed(now));

    // Check for resource accumulation
    newAlerts.push(...this.detectResourceAccumulation());

    // Check for memory growth
    newAlerts.push(...this.detectMemoryGrowth());

    // Add new alerts and notify callbacks
    for (const alert of newAlerts) {
      this.alerts.push(alert);
      for (const callback of this.alertCallbacks) {
        try {
          callback(alert);
        } catch (e) {
          console.error('[3Lens] Error in leak alert callback:', e);
        }
      }
    }

    // Limit stored alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }

    return newAlerts;
  }

  /**
   * Detect orphaned resources (created but never attached to any mesh)
   */
  private detectOrphanedResources(now: number): LeakAlert[] {
    const alerts: LeakAlert[] = [];
    const orphanThresholdMs = 5000; // 5 seconds to get attached

    for (const [uuid, resource] of this.activeResources) {
      if (resource.attachedMeshes.size === 0 && 
          !resource.lastAttachmentTime &&
          now - resource.createdAt > orphanThresholdMs) {
        
        // Check if we already have an alert for this resource
        if (this.alerts.some(a => a.resourceUuid === uuid && a.type === 'orphaned_resource')) {
          continue;
        }

        alerts.push({
          id: `alert_${++this.alertIdCounter}`,
          type: 'orphaned_resource',
          severity: 'warning',
          resourceType: resource.type,
          resourceUuid: uuid,
          resourceName: resource.name,
          message: `Orphaned ${resource.type}: ${resource.name || resource.subtype || uuid.substring(0, 8)}`,
          details: `Created ${((now - resource.createdAt) / 1000).toFixed(1)}s ago but never attached to any mesh`,
          timestamp: now,
          suggestion: `Ensure this ${resource.type} is attached to a mesh or dispose it if unused`,
        });
      }
    }

    return alerts;
  }

  /**
   * Detect resources that haven't been disposed after the threshold
   */
  private detectUndisposedResources(now: number): LeakAlert[] {
    const alerts: LeakAlert[] = [];

    for (const [uuid, resource] of this.activeResources) {
      const ageMs = now - resource.createdAt;
      
      if (ageMs > this.options.leakThresholdMs) {
        // Check if we already have an alert for this resource
        if (this.alerts.some(a => a.resourceUuid === uuid && a.type === 'undisposed_resource')) {
          continue;
        }

        const severity: LeakAlertSeverity = ageMs > this.options.leakThresholdMs * 3 ? 'critical' : 'warning';

        alerts.push({
          id: `alert_${++this.alertIdCounter}`,
          type: 'undisposed_resource',
          severity,
          resourceType: resource.type,
          resourceUuid: uuid,
          resourceName: resource.name,
          message: `Long-lived ${resource.type}: ${resource.name || resource.subtype || uuid.substring(0, 8)}`,
          details: `Active for ${(ageMs / 1000).toFixed(1)}s (threshold: ${(this.options.leakThresholdMs / 1000).toFixed(0)}s)`,
          timestamp: now,
          suggestion: `Check if this ${resource.type} should be disposed. If it's intentionally persistent, you can ignore this alert.`,
        });
      }
    }

    return alerts;
  }

  /**
   * Detect resources that were detached but never disposed
   */
  private detectDetachedNotDisposed(now: number): LeakAlert[] {
    const alerts: LeakAlert[] = [];
    const detachedThresholdMs = 10000; // 10 seconds after detachment

    for (const [uuid, resource] of this.activeResources) {
      if (resource.detachedAt && 
          now - resource.detachedAt > detachedThresholdMs) {
        
        // Check if we already have an alert for this resource
        if (this.alerts.some(a => a.resourceUuid === uuid && a.type === 'detached_not_disposed')) {
          continue;
        }

        alerts.push({
          id: `alert_${++this.alertIdCounter}`,
          type: 'detached_not_disposed',
          severity: 'warning',
          resourceType: resource.type,
          resourceUuid: uuid,
          resourceName: resource.name,
          message: `Detached but not disposed: ${resource.name || resource.subtype || uuid.substring(0, 8)}`,
          details: `Detached ${((now - resource.detachedAt) / 1000).toFixed(1)}s ago but never disposed`,
          timestamp: now,
          suggestion: `Call .dispose() on this ${resource.type} to free GPU memory`,
        });
      }
    }

    return alerts;
  }

  /**
   * Detect accumulation of too many resources
   */
  private detectResourceAccumulation(): LeakAlert[] {
    const alerts: LeakAlert[] = [];
    const thresholds = {
      geometry: 100,
      material: 200,
      texture: 100,
    };

    const counts = { geometry: 0, material: 0, texture: 0 };
    for (const resource of this.activeResources.values()) {
      counts[resource.type]++;
    }

    for (const [type, count] of Object.entries(counts) as Array<[ResourceType, number]>) {
      const threshold = thresholds[type];
      if (count > threshold) {
        // Check if we already have a recent accumulation alert for this type
        const existingAlert = this.alerts.find(
          a => a.type === 'resource_accumulation' && 
               a.resourceType === type &&
               performance.now() - a.timestamp < 30000 // Within last 30 seconds
        );
        if (existingAlert) continue;

        const severity: LeakAlertSeverity = count > threshold * 2 ? 'critical' : 'warning';

        alerts.push({
          id: `alert_${++this.alertIdCounter}`,
          type: 'resource_accumulation',
          severity,
          resourceType: type,
          message: `High ${type} count: ${count}`,
          details: `${count} active ${type}s exceeds threshold of ${threshold}`,
          timestamp: performance.now(),
          suggestion: `Review your ${type} management. Consider reusing ${type}s or disposing unused ones.`,
        });
      }
    }

    return alerts;
  }

  /**
   * Detect consistent memory growth
   */
  private detectMemoryGrowth(): LeakAlert[] {
    const alerts: LeakAlert[] = [];
    
    if (this.memoryHistory.length < 10) return alerts; // Need enough samples

    const recentHistory = this.memoryHistory.slice(-10);
    const firstSample = recentHistory[0];
    const lastSample = recentHistory[recentHistory.length - 1];
    const growth = lastSample.estimatedBytes - firstSample.estimatedBytes;
    const timeDelta = lastSample.timestamp - firstSample.timestamp;

    // Check if memory is consistently growing
    let isGrowing = true;
    for (let i = 1; i < recentHistory.length; i++) {
      if (recentHistory[i].estimatedBytes < recentHistory[i - 1].estimatedBytes) {
        isGrowing = false;
        break;
      }
    }

    if (isGrowing && growth > this.options.memoryGrowthThresholdBytes) {
      // Check if we already have a recent memory growth alert
      const existingAlert = this.alerts.find(
        a => a.type === 'memory_growth' && 
             performance.now() - a.timestamp < 60000 // Within last minute
      );
      if (!existingAlert) {
        const growthRate = (growth / timeDelta) * 1000; // bytes per second

        alerts.push({
          id: `alert_${++this.alertIdCounter}`,
          type: 'memory_growth',
          severity: 'critical',
          message: `Memory growing: +${this.formatBytes(growth)}`,
          details: `Memory increased by ${this.formatBytes(growth)} over ${(timeDelta / 1000).toFixed(1)}s (${this.formatBytes(growthRate)}/s)`,
          timestamp: performance.now(),
          suggestion: 'Review resource creation patterns. Ensure resources are being disposed when no longer needed.',
        });
      }
    }

    return alerts;
  }

  /**
   * Update memory history tracking
   */
  private updateMemoryHistory(): void {
    const now = performance.now();
    
    // Only update every second to avoid performance impact
    if (now - this.lastMemoryCheck < 1000) return;
    this.lastMemoryCheck = now;

    let totalBytes = 0;
    for (const resource of this.activeResources.values()) {
      totalBytes += resource.estimatedMemory || 0;
    }

    this.memoryHistory.push({ timestamp: now, estimatedBytes: totalBytes });

    // Keep last 60 samples (1 minute of history)
    if (this.memoryHistory.length > 60) {
      this.memoryHistory = this.memoryHistory.slice(-60);
    }
  }

  /**
   * Get estimated total memory of active resources
   */
  getEstimatedMemory(): number {
    let total = 0;
    for (const resource of this.activeResources.values()) {
      total += resource.estimatedMemory || 0;
    }
    return total;
  }

  /**
   * Get memory history for charting
   */
  getMemoryHistory(): Array<{ timestamp: number; estimatedBytes: number }> {
    return [...this.memoryHistory];
  }

  /**
   * Get orphaned resources (not attached to any mesh)
   */
  getOrphanedResources(): Array<{
    type: ResourceType;
    uuid: string;
    name?: string;
    subtype?: string;
    ageMs: number;
  }> {
    const now = performance.now();
    const orphans: Array<{
      type: ResourceType;
      uuid: string;
      name?: string;
      subtype?: string;
      ageMs: number;
    }> = [];

    for (const [uuid, resource] of this.activeResources) {
      if (resource.attachedMeshes.size === 0) {
        orphans.push({
          type: resource.type,
          uuid,
          name: resource.name,
          subtype: resource.subtype,
          ageMs: now - resource.createdAt,
        });
      }
    }

    return orphans.sort((a, b) => b.ageMs - a.ageMs);
  }

  /**
   * Generate comprehensive leak report
   */
  generateLeakReport(): LeakReport {
    const now = performance.now();
    
    // Run leak detection to ensure alerts are up to date
    this.runLeakDetection();

    // Calculate stats
    const resourceStats = {
      geometries: { created: 0, disposed: 0, orphaned: 0, leaked: 0 },
      materials: { created: 0, disposed: 0, orphaned: 0, leaked: 0 },
      textures: { created: 0, disposed: 0, orphaned: 0, leaked: 0 },
    };

    // Map resource type to stats key
    const typeToKey: Record<ResourceType, 'geometries' | 'materials' | 'textures'> = {
      geometry: 'geometries',
      material: 'materials',
      texture: 'textures',
    };

    // Count events
    for (const event of this.events) {
      const key = typeToKey[event.resourceType];
      if (event.eventType === 'created') resourceStats[key].created++;
      if (event.eventType === 'disposed') resourceStats[key].disposed++;
    }

    // Count orphaned and leaked
    for (const resource of this.activeResources.values()) {
      const key = typeToKey[resource.type];
      if (resource.attachedMeshes.size === 0) {
        resourceStats[key].orphaned++;
      }
      if (now - resource.createdAt > this.options.leakThresholdMs) {
        resourceStats[key].leaked++;
      }
    }

    // Calculate estimated leaked memory
    let estimatedLeakedMemory = 0;
    for (const resource of this.activeResources.values()) {
      if (now - resource.createdAt > this.options.leakThresholdMs) {
        estimatedLeakedMemory += resource.estimatedMemory || 0;
      }
    }

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (resourceStats.geometries.orphaned > 0) {
      recommendations.push(`Dispose ${resourceStats.geometries.orphaned} orphaned geometries to free memory`);
    }
    if (resourceStats.materials.orphaned > 0) {
      recommendations.push(`Dispose ${resourceStats.materials.orphaned} orphaned materials`);
    }
    if (resourceStats.textures.orphaned > 0) {
      recommendations.push(`Dispose ${resourceStats.textures.orphaned} orphaned textures`);
    }
    
    const criticalAlerts = this.alerts.filter(a => a.severity === 'critical');
    if (criticalAlerts.length > 0) {
      recommendations.push('Address critical alerts immediately to prevent memory issues');
    }

    if (this.memoryHistory.length > 1) {
      const first = this.memoryHistory[0].estimatedBytes;
      const last = this.memoryHistory[this.memoryHistory.length - 1].estimatedBytes;
      if (last > first * 1.5) {
        recommendations.push('Memory usage has increased significantly. Review resource lifecycle.');
      }
    }

    return {
      generatedAt: now,
      sessionDurationMs: now - this.sessionStartTime,
      summary: {
        totalAlerts: this.alerts.length,
        criticalAlerts: this.alerts.filter(a => a.severity === 'critical').length,
        warningAlerts: this.alerts.filter(a => a.severity === 'warning').length,
        infoAlerts: this.alerts.filter(a => a.severity === 'info').length,
        estimatedLeakedMemoryBytes: estimatedLeakedMemory,
      },
      alerts: this.alerts,
      resourceStats,
      memoryHistory: this.memoryHistory,
      recommendations,
    };
  }

  private formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  }

  /**
   * Clear all tracked events
   */
  clear(): void {
    this.events = [];
    this.activeResources.clear();
    this.eventIdCounter = 0;
    this.alerts = [];
    this.alertIdCounter = 0;
    this.memoryHistory = [];
  }

  /**
   * Create a lifecycle event
   */
  private createEvent(
    resourceType: ResourceType,
    resourceUuid: string,
    eventType: LifecycleEventType,
    options?: {
      resourceName?: string;
      resourceSubtype?: string;
      metadata?: ResourceLifecycleEvent['metadata'];
    }
  ): ResourceLifecycleEvent {
    const event: ResourceLifecycleEvent = {
      id: `evt_${++this.eventIdCounter}`,
      resourceType,
      resourceUuid,
      eventType,
      timestamp: performance.now(),
    };

    if (options?.resourceName) {
      event.resourceName = options.resourceName;
    }

    if (options?.resourceSubtype) {
      event.resourceSubtype = options.resourceSubtype;
    }

    if (options?.metadata) {
      event.metadata = options.metadata;
    }

    // Capture stack trace if enabled
    if (this.options.captureStackTraces) {
      try {
        const stack = new Error().stack;
        if (stack) {
          // Remove the first 3 lines (Error, createEvent, record* method)
          const lines = stack.split('\n').slice(3);
          event.stackTrace = lines.join('\n');
        }
      } catch {
        // Stack traces not available
      }
    }

    return event;
  }

  /**
   * Add an event to the history
   */
  private addEvent(event: ResourceLifecycleEvent): void {
    this.events.push(event);

    // Trim history if needed
    if (this.events.length > this.options.maxEvents) {
      this.events = this.events.slice(-this.options.maxEvents);
    }

    // Notify callbacks
    for (const callback of this.callbacks) {
      try {
        callback(event);
      } catch (e) {
        console.error('[3Lens] Error in lifecycle event callback:', e);
      }
    }
  }
}

