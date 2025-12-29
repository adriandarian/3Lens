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
}

/**
 * Callback for lifecycle events
 */
export type LifecycleEventCallback = (event: ResourceLifecycleEvent) => void;

/**
 * Tracks resource lifecycle events
 */
export class ResourceLifecycleTracker {
  private events: ResourceLifecycleEvent[] = [];
  private activeResources: Map<string, { type: ResourceType; createdAt: number; name?: string; subtype?: string }> = new Map();
  private eventIdCounter = 0;
  private callbacks: LifecycleEventCallback[] = [];
  private options: Required<ResourceTrackerOptions>;

  constructor(options: ResourceTrackerOptions = {}) {
    this.options = {
      captureStackTraces: options.captureStackTraces ?? false,
      maxEvents: options.maxEvents ?? 1000,
      leakThresholdMs: options.leakThresholdMs ?? 60000, // 1 minute default
    };
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
    });

    this.addEvent(event);
  }

  /**
   * Record a resource disposal event
   */
  recordDisposal(resourceType: ResourceType, resourceUuid: string): void {
    const event = this.createEvent(resourceType, resourceUuid, 'disposed');

    // Remove from active resources
    this.activeResources.delete(resourceUuid);

    this.addEvent(event);
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

    // Count events
    for (const event of this.events) {
      const stats = summary[`${event.resourceType}s` as 'geometries' | 'materials' | 'textures'];
      if (event.eventType === 'created') {
        stats.created++;
      } else if (event.eventType === 'disposed') {
        stats.disposed++;
      }
    }

    // Calculate active counts and check for leaks
    let oldestActive: { type: ResourceType; uuid: string; name?: string; ageMs: number } | undefined;

    for (const [uuid, info] of this.activeResources) {
      const stats = summary[`${info.type}s` as 'geometries' | 'materials' | 'textures'];
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

  /**
   * Clear all tracked events
   */
  clear(): void {
    this.events = [];
    this.activeResources.clear();
    this.eventIdCounter = 0;
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

