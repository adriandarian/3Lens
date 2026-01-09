import type * as THREE from 'three';

/**
 * Unique identifier for a logical entity
 */
export type EntityId = string;

/**
 * Module identifier (e.g., '@game/feature-player', 'ui/hud')
 */
export type ModuleId = string;

/**
 * Options for registering a logical entity
 */
export interface LogicalEntityOptions {
  /**
   * Unique identifier for the entity (auto-generated if not provided)
   */
  id?: EntityId;

  /**
   * Human-readable name for the entity
   */
  name: string;

  /**
   * Module this entity belongs to (for grouping and filtering)
   * Format: '@scope/library-name' or 'category/name'
   */
  module?: ModuleId;

  /**
   * Component type/class name (for framework integration)
   */
  componentType?: string;

  /**
   * Component instance ID (for React/Vue/Angular component tracking)
   */
  componentId?: string;

  /**
   * Tags for filtering and categorization
   */
  tags?: string[];

  /**
   * Custom metadata to display in inspector
   */
  metadata?: Record<string, unknown>;

  /**
   * Parent entity ID (for hierarchical entities)
   */
  parentEntityId?: EntityId;
}

/**
 * A registered logical entity
 */
export interface LogicalEntity {
  /**
   * Unique identifier
   */
  id: EntityId;

  /**
   * Human-readable name
   */
  name: string;

  /**
   * Module this entity belongs to
   */
  module: ModuleId | null;

  /**
   * Component type name
   */
  componentType: string | null;

  /**
   * Component instance ID
   */
  componentId: string | null;

  /**
   * Tags for filtering
   */
  tags: string[];

  /**
   * Custom metadata
   */
  metadata: Record<string, unknown>;

  /**
   * Three.js objects associated with this entity
   */
  objects: THREE.Object3D[];

  /**
   * Object UUIDs (for serialization)
   */
  objectUuids: string[];

  /**
   * Parent entity ID
   */
  parentEntityId: EntityId | null;

  /**
   * Child entity IDs
   */
  childEntityIds: EntityId[];

  /**
   * When the entity was registered
   */
  registeredAt: number;

  /**
   * When the entity was last updated
   */
  updatedAt: number;
}

/**
 * Module information with aggregated metrics
 */
export interface ModuleInfo {
  /**
   * Module identifier
   */
  id: ModuleId;

  /**
   * Number of entities in this module
   */
  entityCount: number;

  /**
   * Entity IDs in this module
   */
  entityIds: EntityId[];

  /**
   * Total object count across all entities
   */
  objectCount: number;

  /**
   * Aggregated metrics
   */
  metrics: ModuleMetrics;

  /**
   * Child modules (for hierarchical modules like '@scope/lib/component')
   */
  childModules: ModuleId[];

  /**
   * Tags used by entities in this module
   */
  tags: string[];
}

/**
 * Aggregated metrics for a module
 */
export interface ModuleMetrics {
  /**
   * Total triangle count
   */
  triangles: number;

  /**
   * Total draw calls (estimated)
   */
  drawCalls: number;

  /**
   * Estimated GPU memory usage (bytes)
   */
  gpuMemory: number;

  /**
   * Texture count
   */
  textureCount: number;

  /**
   * Geometry count
   */
  geometryCount: number;

  /**
   * Material count
   */
  materialCount: number;

  /**
   * Visible object count
   */
  visibleObjects: number;

  /**
   * Total object count
   */
  totalObjects: number;
}

/**
 * Filter options for querying entities
 */
export interface EntityFilter {
  /**
   * Filter by module (exact match or prefix)
   */
  module?: ModuleId;

  /**
   * Filter by module prefix (e.g., '@game/' matches all game modules)
   */
  modulePrefix?: string;

  /**
   * Filter by tags (entities must have ALL specified tags)
   */
  tags?: string[];

  /**
   * Filter by any tag (entities must have AT LEAST ONE specified tag)
   */
  anyTag?: string[];

  /**
   * Filter by component type
   */
  componentType?: string;

  /**
   * Filter by name (partial match)
   */
  nameContains?: string;

  /**
   * Filter by metadata key existence
   */
  hasMetadata?: string[];

  /**
   * Only include entities with objects
   */
  hasObjects?: boolean;
}

/**
 * Navigation result for component ↔ object navigation
 */
export interface NavigationResult {
  /**
   * The logical entity
   */
  entity: LogicalEntity | null;

  /**
   * Related objects
   */
  objects: THREE.Object3D[];

  /**
   * Module info
   */
  module: ModuleInfo | null;

  /**
   * Parent entity chain (from root to parent)
   */
  ancestors: LogicalEntity[];

  /**
   * Child entities
   */
  children: LogicalEntity[];
}

/**
 * Event types for entity lifecycle
 */
export type EntityEventType =
  | 'registered'
  | 'updated'
  | 'unregistered'
  | 'object-added'
  | 'object-removed';

/**
 * Entity lifecycle event
 */
export interface EntityEvent {
  type: EntityEventType;
  entityId: EntityId;
  entity: LogicalEntity;
  timestamp: number;
  details?: Record<string, unknown>;
}

/**
 * Callback for entity events
 */
export type EntityEventCallback = (event: EntityEvent) => void;
