import type * as THREE from 'three';

/**
 * Reference to a tracked three.js object
 */
export interface TrackedObjectRef {
  /**
   * Stable debug ID for the devtool
   */
  debugId: string;

  /**
   * three.js uuid
   */
  threeUuid: string;

  /**
   * Object type (e.g., 'Mesh', 'Scene', 'PerspectiveCamera')
   */
  type: string;

  /**
   * Object name (from object.name)
   */
  name?: string;

  /**
   * Scene path (e.g., "/Root/World/Terrain/Mesh_001")
   */
  path?: string;
}

/**
 * Extended object metadata including logical entity info
 */
export interface ObjectMeta extends TrackedObjectRef {
  /**
   * Module/library ID (for Nx/ngLib support)
   */
  moduleId?: string;

  /**
   * Framework component ID (e.g., 'React:HealthBar#123')
   */
  componentId?: string;

  /**
   * Logical entity ID if registered
   */
  entityId?: string;
}

/**
 * Logical entity mapping between framework components and three.js objects
 */
export interface LogicalEntity {
  /**
   * Unique identifier for this entity
   */
  id: string;

  /**
   * Human-readable label
   */
  label: string;

  /**
   * Module/library identifier (for Nx/ngLib)
   */
  moduleId?: string;

  /**
   * Framework component identifier
   */
  componentId?: string;

  /**
   * Associated three.js objects
   */
  objects: THREE.Object3D[];

  /**
   * Custom metadata
   */
  metadata?: Record<string, unknown>;
}
