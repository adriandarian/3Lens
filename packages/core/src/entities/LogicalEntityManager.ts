import type * as THREE from 'three';
import type {
  EntityId,
  ModuleId,
  LogicalEntityOptions,
  LogicalEntity,
  ModuleInfo,
  ModuleMetrics,
  EntityFilter,
  NavigationResult,
  EntityEvent,
  EntityEventType,
  EntityEventCallback,
} from './types';

/**
 * Generates a unique entity ID
 */
function generateEntityId(): EntityId {
  return `entity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Creates empty module metrics
 */
function createEmptyMetrics(): ModuleMetrics {
  return {
    triangles: 0,
    drawCalls: 0,
    gpuMemory: 0,
    textureCount: 0,
    geometryCount: 0,
    materialCount: 0,
    visibleObjects: 0,
    totalObjects: 0,
  };
}

/**
 * Manager for logical entities in the scene
 *
 * Logical entities allow you to group Three.js objects by their semantic meaning
 * (e.g., "Player", "Enemy", "Terrain") rather than just their scene hierarchy.
 *
 * This enables:
 * - Framework integration (React/Angular/Vue component → Three.js object mapping)
 * - Module-level metrics and filtering
 * - Two-way navigation between application code and scene objects
 *
 * @example
 * ```typescript
 * const manager = new LogicalEntityManager();
 *
 * // Register a player entity
 * const playerId = manager.registerLogicalEntity({
 *   name: 'Player',
 *   module: '@game/feature-player',
 *   componentType: 'PlayerComponent',
 *   tags: ['controllable', 'saveable'],
 *   metadata: { health: 100 },
 * });
 *
 * // Add objects to the entity
 * manager.addObjectToEntity(playerId, playerMesh);
 * manager.addObjectToEntity(playerId, weaponMesh);
 *
 * // Query entities
 * const gameEntities = manager.filterEntities({ modulePrefix: '@game/' });
 * const controllables = manager.filterEntities({ tags: ['controllable'] });
 *
 * // Get module metrics
 * const playerModuleInfo = manager.getModuleInfo('@game/feature-player');
 * console.log('Player module triangles:', playerModuleInfo?.metrics.triangles);
 * ```
 */
export class LogicalEntityManager {
  private readonly _entities = new Map<EntityId, LogicalEntity>();
  private readonly _objectToEntity = new Map<string, EntityId>(); // uuid -> entityId
  private readonly _componentToEntity = new Map<string, EntityId>(); // componentId -> entityId
  private readonly _moduleEntities = new Map<ModuleId, Set<EntityId>>();
  private readonly _eventListeners: EntityEventCallback[] = [];

  /**
   * Register a new logical entity
   *
   * @param options Entity options
   * @returns The entity ID
   */
  registerLogicalEntity(options: LogicalEntityOptions): EntityId {
    const id = options.id || generateEntityId();

    if (this._entities.has(id)) {
      throw new Error(`Entity with ID "${id}" already exists`);
    }

    const entity: LogicalEntity = {
      id,
      name: options.name,
      module: options.module ?? null,
      componentType: options.componentType ?? null,
      componentId: options.componentId ?? null,
      tags: options.tags ?? [],
      metadata: options.metadata ?? {},
      objects: [],
      objectUuids: [],
      parentEntityId: options.parentEntityId ?? null,
      childEntityIds: [],
      registeredAt: Date.now(),
      updatedAt: Date.now(),
    };

    this._entities.set(id, entity);

    // Track by component ID
    if (options.componentId) {
      this._componentToEntity.set(options.componentId, id);
    }

    // Track by module
    if (options.module) {
      if (!this._moduleEntities.has(options.module)) {
        this._moduleEntities.set(options.module, new Set());
      }
      this._moduleEntities.get(options.module)!.add(id);
    }

    // Link to parent entity
    if (options.parentEntityId) {
      const parent = this._entities.get(options.parentEntityId);
      if (parent) {
        parent.childEntityIds.push(id);
        parent.updatedAt = Date.now();
      }
    }

    this._emitEvent('registered', entity);

    return id;
  }

  /**
   * Update an existing logical entity
   *
   * @param entityId Entity ID
   * @param updates Partial updates to apply
   */
  updateLogicalEntity(
    entityId: EntityId,
    updates: Partial<Omit<LogicalEntityOptions, 'id'>>
  ): void {
    const entity = this._entities.get(entityId);
    if (!entity) {
      throw new Error(`Entity "${entityId}" not found`);
    }

    // Update module tracking
    if (updates.module !== undefined && updates.module !== entity.module) {
      // Remove from old module
      if (entity.module) {
        this._moduleEntities.get(entity.module)?.delete(entityId);
      }
      // Add to new module
      if (updates.module) {
        if (!this._moduleEntities.has(updates.module)) {
          this._moduleEntities.set(updates.module, new Set());
        }
        this._moduleEntities.get(updates.module)!.add(entityId);
      }
      entity.module = updates.module;
    }

    // Update component ID tracking
    if (
      updates.componentId !== undefined &&
      updates.componentId !== entity.componentId
    ) {
      if (entity.componentId) {
        this._componentToEntity.delete(entity.componentId);
      }
      if (updates.componentId) {
        this._componentToEntity.set(updates.componentId, entityId);
      }
      entity.componentId = updates.componentId;
    }

    // Apply other updates
    if (updates.name !== undefined) entity.name = updates.name;
    if (updates.componentType !== undefined)
      entity.componentType = updates.componentType;
    if (updates.tags !== undefined) entity.tags = updates.tags;
    if (updates.metadata !== undefined)
      entity.metadata = { ...entity.metadata, ...updates.metadata };

    // Handle parent change
    if (
      updates.parentEntityId !== undefined &&
      updates.parentEntityId !== entity.parentEntityId
    ) {
      // Remove from old parent
      if (entity.parentEntityId) {
        const oldParent = this._entities.get(entity.parentEntityId);
        if (oldParent) {
          oldParent.childEntityIds = oldParent.childEntityIds.filter(
            (id) => id !== entityId
          );
          oldParent.updatedAt = Date.now();
        }
      }
      // Add to new parent
      if (updates.parentEntityId) {
        const newParent = this._entities.get(updates.parentEntityId);
        if (newParent) {
          newParent.childEntityIds.push(entityId);
          newParent.updatedAt = Date.now();
        }
      }
      entity.parentEntityId = updates.parentEntityId;
    }

    entity.updatedAt = Date.now();
    this._emitEvent('updated', entity);
  }

  /**
   * Unregister a logical entity
   *
   * @param entityId Entity ID
   * @param recursive Whether to also unregister child entities
   */
  unregisterLogicalEntity(entityId: EntityId, recursive = false): void {
    const entity = this._entities.get(entityId);
    if (!entity) {
      return; // Already unregistered
    }

    // Recursively unregister children if requested
    if (recursive) {
      for (const childId of [...entity.childEntityIds]) {
        this.unregisterLogicalEntity(childId, true);
      }
    } else {
      // Move children to parent
      for (const childId of entity.childEntityIds) {
        const child = this._entities.get(childId);
        if (child) {
          child.parentEntityId = entity.parentEntityId;
          if (entity.parentEntityId) {
            const newParent = this._entities.get(entity.parentEntityId);
            if (newParent) {
              newParent.childEntityIds.push(childId);
            }
          }
        }
      }
    }

    // Remove from parent
    if (entity.parentEntityId) {
      const parent = this._entities.get(entity.parentEntityId);
      if (parent) {
        parent.childEntityIds = parent.childEntityIds.filter(
          (id) => id !== entityId
        );
        parent.updatedAt = Date.now();
      }
    }

    // Remove object mappings
    for (const uuid of entity.objectUuids) {
      this._objectToEntity.delete(uuid);
    }

    // Remove component mapping
    if (entity.componentId) {
      this._componentToEntity.delete(entity.componentId);
    }

    // Remove from module
    if (entity.module) {
      this._moduleEntities.get(entity.module)?.delete(entityId);
    }

    this._entities.delete(entityId);
    this._emitEvent('unregistered', entity);
  }

  /**
   * Add a Three.js object to an entity
   *
   * @param entityId Entity ID
   * @param object Three.js object
   */
  addObjectToEntity(entityId: EntityId, object: THREE.Object3D): void {
    const entity = this._entities.get(entityId);
    if (!entity) {
      throw new Error(`Entity "${entityId}" not found`);
    }

    if (entity.objectUuids.includes(object.uuid)) {
      return; // Already added
    }

    entity.objects.push(object);
    entity.objectUuids.push(object.uuid);
    entity.updatedAt = Date.now();

    this._objectToEntity.set(object.uuid, entityId);

    // Store entity reference in object userData
    object.userData = {
      ...object.userData,
      __3lens_entity: {
        entityId,
        entityName: entity.name,
        module: entity.module,
      },
    };

    this._emitEvent('object-added', entity, { objectUuid: object.uuid });
  }

  /**
   * Remove a Three.js object from an entity
   *
   * @param entityId Entity ID
   * @param object Three.js object
   */
  removeObjectFromEntity(entityId: EntityId, object: THREE.Object3D): void {
    const entity = this._entities.get(entityId);
    if (!entity) {
      return;
    }

    const index = entity.objectUuids.indexOf(object.uuid);
    if (index === -1) {
      return; // Not in entity
    }

    entity.objects.splice(index, 1);
    entity.objectUuids.splice(index, 1);
    entity.updatedAt = Date.now();

    this._objectToEntity.delete(object.uuid);

    // Remove entity reference from object userData
    if (object.userData?.__3lens_entity) {
      delete object.userData.__3lens_entity;
    }

    this._emitEvent('object-removed', entity, { objectUuid: object.uuid });
  }

  /**
   * Get an entity by ID
   */
  getEntity(entityId: EntityId): LogicalEntity | undefined {
    return this._entities.get(entityId);
  }

  /**
   * Get all registered entities
   */
  getAllEntities(): LogicalEntity[] {
    return Array.from(this._entities.values());
  }

  /**
   * Get entity by Three.js object
   */
  getEntityByObject(object: THREE.Object3D): LogicalEntity | undefined {
    const entityId = this._objectToEntity.get(object.uuid);
    return entityId ? this._entities.get(entityId) : undefined;
  }

  /**
   * Get entity by component ID
   */
  getEntityByComponentId(componentId: string): LogicalEntity | undefined {
    const entityId = this._componentToEntity.get(componentId);
    return entityId ? this._entities.get(entityId) : undefined;
  }

  /**
   * Navigate from an object to its entity and related info
   */
  navigateFromObject(object: THREE.Object3D): NavigationResult {
    const entity = this.getEntityByObject(object);
    return this._buildNavigationResult(entity);
  }

  /**
   * Navigate from a component ID to its entity and related info
   */
  navigateFromComponent(componentId: string): NavigationResult {
    const entity = this.getEntityByComponentId(componentId);
    return this._buildNavigationResult(entity);
  }

  /**
   * Navigate from an entity ID to full navigation info
   */
  navigateFromEntity(entityId: EntityId): NavigationResult {
    const entity = this._entities.get(entityId);
    return this._buildNavigationResult(entity);
  }

  /**
   * Filter entities by criteria
   */
  filterEntities(filter: EntityFilter): LogicalEntity[] {
    let entities = Array.from(this._entities.values());

    if (filter.module) {
      entities = entities.filter((e) => e.module === filter.module);
    }

    if (filter.modulePrefix) {
      entities = entities.filter(
        (e) => e.module?.startsWith(filter.modulePrefix!) ?? false
      );
    }

    if (filter.tags && filter.tags.length > 0) {
      entities = entities.filter((e) =>
        filter.tags!.every((tag) => e.tags.includes(tag))
      );
    }

    if (filter.anyTag && filter.anyTag.length > 0) {
      entities = entities.filter((e) =>
        filter.anyTag!.some((tag) => e.tags.includes(tag))
      );
    }

    if (filter.componentType) {
      entities = entities.filter(
        (e) => e.componentType === filter.componentType
      );
    }

    if (filter.nameContains) {
      const searchLower = filter.nameContains.toLowerCase();
      entities = entities.filter((e) =>
        e.name.toLowerCase().includes(searchLower)
      );
    }

    if (filter.hasMetadata && filter.hasMetadata.length > 0) {
      entities = entities.filter((e) =>
        filter.hasMetadata!.every((key) => key in e.metadata)
      );
    }

    if (filter.hasObjects) {
      entities = entities.filter((e) => e.objects.length > 0);
    }

    return entities;
  }

  /**
   * Get all unique module IDs
   */
  getAllModules(): ModuleId[] {
    return Array.from(this._moduleEntities.keys());
  }

  /**
   * Get module information with aggregated metrics
   */
  getModuleInfo(moduleId: ModuleId): ModuleInfo | undefined {
    const entityIds = this._moduleEntities.get(moduleId);
    if (!entityIds || entityIds.size === 0) {
      return undefined;
    }

    const entities = Array.from(entityIds)
      .map((id) => this._entities.get(id))
      .filter((e): e is LogicalEntity => e !== undefined);

    const metrics = this._calculateModuleMetrics(entities);
    const allTags = new Set<string>();
    entities.forEach((e) => e.tags.forEach((t) => allTags.add(t)));

    // Find child modules
    const childModules = Array.from(this._moduleEntities.keys()).filter(
      (m) => m !== moduleId && m.startsWith(moduleId + '/')
    );

    return {
      id: moduleId,
      entityCount: entities.length,
      entityIds: entities.map((e) => e.id),
      objectCount: entities.reduce((sum, e) => sum + e.objects.length, 0),
      metrics,
      childModules,
      tags: Array.from(allTags),
    };
  }

  /**
   * Get all modules with their info
   */
  getAllModuleInfo(): ModuleInfo[] {
    return this.getAllModules()
      .map((m) => this.getModuleInfo(m))
      .filter((m): m is ModuleInfo => m !== undefined);
  }

  /**
   * Subscribe to entity events
   */
  onEntityEvent(callback: EntityEventCallback): () => void {
    this._eventListeners.push(callback);
    return () => {
      const index = this._eventListeners.indexOf(callback);
      if (index !== -1) {
        this._eventListeners.splice(index, 1);
      }
    };
  }

  /**
   * Clear all entities
   */
  clear(): void {
    const entities = Array.from(this._entities.values());
    for (const entity of entities) {
      this.unregisterLogicalEntity(entity.id);
    }
  }

  /**
   * Get entity count
   */
  get entityCount(): number {
    return this._entities.size;
  }

  /**
   * Get module count
   */
  get moduleCount(): number {
    return this._moduleEntities.size;
  }

  private _buildNavigationResult(
    entity: LogicalEntity | undefined
  ): NavigationResult {
    if (!entity) {
      return {
        entity: null,
        objects: [],
        module: null,
        ancestors: [],
        children: [],
      };
    }

    // Build ancestor chain
    const ancestors: LogicalEntity[] = [];
    let currentParentId = entity.parentEntityId;
    while (currentParentId) {
      const parent = this._entities.get(currentParentId);
      if (parent) {
        ancestors.unshift(parent); // Add to beginning for root-first order
        currentParentId = parent.parentEntityId;
      } else {
        break;
      }
    }

    // Get children
    const children = entity.childEntityIds
      .map((id) => this._entities.get(id))
      .filter((e): e is LogicalEntity => e !== undefined);

    // Get module info
    const module = entity.module
      ? (this.getModuleInfo(entity.module) ?? null)
      : null;

    return {
      entity,
      objects: [...entity.objects],
      module,
      ancestors,
      children,
    };
  }

  private _calculateModuleMetrics(entities: LogicalEntity[]): ModuleMetrics {
    const metrics = createEmptyMetrics();

    for (const entity of entities) {
      for (const object of entity.objects) {
        metrics.totalObjects++;

        if (object.visible) {
          metrics.visibleObjects++;
        }

        // Count triangles for meshes
        if ((object as THREE.Mesh).isMesh) {
          const mesh = object as THREE.Mesh;
          const geometry = mesh.geometry;
          if (geometry) {
            const position = geometry.attributes?.position;
            if (position) {
              const vertexCount = position.count;
              const index = geometry.index;
              if (index) {
                metrics.triangles += index.count / 3;
              } else {
                metrics.triangles += vertexCount / 3;
              }
            }
            metrics.geometryCount++;

            // Estimate GPU memory for geometry
            for (const key in geometry.attributes) {
              const attr = geometry.attributes[key];
              if (attr) {
                metrics.gpuMemory += attr.count * attr.itemSize * 4; // Assume Float32
              }
            }
          }

          // Count materials
          if (mesh.material) {
            if (Array.isArray(mesh.material)) {
              metrics.materialCount += mesh.material.length;
            } else {
              metrics.materialCount++;
            }
          }
        }

        // Estimate draw calls (simplified: 1 per visible mesh with geometry)
        if ((object as THREE.Mesh).isMesh && object.visible) {
          metrics.drawCalls++;
        }
      }
    }

    return metrics;
  }

  private _emitEvent(
    type: EntityEventType,
    entity: LogicalEntity,
    details?: Record<string, unknown>
  ): void {
    const event: EntityEvent = {
      type,
      entityId: entity.id,
      entity,
      timestamp: Date.now(),
      details,
    };

    for (const listener of this._eventListeners) {
      try {
        listener(event);
      } catch (e) {
        console.error('[3Lens] Entity event listener error:', e);
      }
    }
  }
}
