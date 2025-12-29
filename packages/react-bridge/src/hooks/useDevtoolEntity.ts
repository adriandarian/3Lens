import { useEffect, useRef } from 'react';
import { useThreeLensContextOptional } from '../context';
import type { EntityOptions } from '../types';
import type * as THREE from 'three';

/**
 * Hook to register a Three.js object as a named entity in 3Lens devtools
 *
 * This allows you to give meaningful names and metadata to objects that
 * would otherwise appear as generic Object3D/Mesh in the scene tree.
 *
 * @param object The Three.js object to register (can be null during initialization)
 * @param options Entity options including name, module, and metadata
 *
 * @example
 * ```tsx
 * function Player({ position }) {
 *   const meshRef = useRef<THREE.Mesh>(null);
 *
 *   useDevtoolEntity(meshRef.current, {
 *     name: 'Player',
 *     module: 'game/entities',
 *     metadata: {
 *       health: 100,
 *       level: 5,
 *     },
 *     tags: ['player', 'controllable'],
 *   });
 *
 *   return (
 *     <mesh ref={meshRef} position={position}>
 *       <boxGeometry />
 *       <meshStandardMaterial color="blue" />
 *     </mesh>
 *   );
 * }
 * ```
 */
export function useDevtoolEntity(
  object: THREE.Object3D | null | undefined,
  options: EntityOptions = {}
): void {
  const context = useThreeLensContextOptional();
  const registeredIdRef = useRef<string | null>(null);
  const prevOptionsRef = useRef<EntityOptions>(options);

  useEffect(() => {
    if (!object || !context?.probe) {
      return;
    }

    const probe = context.probe;

    // Set the name on the object itself
    if (options.name && object.name !== options.name) {
      object.name = options.name;
    }

    // Store metadata in userData for the devtools to pick up
    object.userData = {
      ...object.userData,
      __3lens: {
        module: options.module,
        metadata: options.metadata,
        tags: options.tags,
        registeredAt: Date.now(),
      },
    };

    registeredIdRef.current = object.uuid;

    // Trigger a snapshot refresh to pick up the new metadata
    probe.requestSnapshot?.();

    return () => {
      // Clean up metadata when unmounting
      if (object.userData?.__3lens) {
        delete object.userData.__3lens;
      }
      registeredIdRef.current = null;
    };
  }, [object, context?.probe, options.name, options.module]);

  // Update metadata when options change
  useEffect(() => {
    if (!object || !context?.probe) return;

    const optionsChanged =
      JSON.stringify(options.metadata) !== JSON.stringify(prevOptionsRef.current.metadata) ||
      JSON.stringify(options.tags) !== JSON.stringify(prevOptionsRef.current.tags);

    if (optionsChanged && object.userData?.__3lens) {
      object.userData.__3lens = {
        ...object.userData.__3lens,
        metadata: options.metadata,
        tags: options.tags,
      };
      prevOptionsRef.current = options;
    }
  }, [object, context?.probe, options.metadata, options.tags]);
}

/**
 * Hook to register a group of related objects as a logical entity
 *
 * @param objects Array of Three.js objects that form this entity
 * @param options Entity options
 *
 * @example
 * ```tsx
 * function Vehicle() {
 *   const bodyRef = useRef<THREE.Mesh>(null);
 *   const wheel1Ref = useRef<THREE.Mesh>(null);
 *   const wheel2Ref = useRef<THREE.Mesh>(null);
 *
 *   useDevtoolEntityGroup(
 *     [bodyRef.current, wheel1Ref.current, wheel2Ref.current].filter(Boolean),
 *     {
 *       name: 'PlayerVehicle',
 *       module: 'game/vehicles',
 *     }
 *   );
 *
 *   return (
 *     <group>
 *       <mesh ref={bodyRef}>...</mesh>
 *       <mesh ref={wheel1Ref}>...</mesh>
 *       <mesh ref={wheel2Ref}>...</mesh>
 *     </group>
 *   );
 * }
 * ```
 */
export function useDevtoolEntityGroup(
  objects: (THREE.Object3D | null | undefined)[],
  options: EntityOptions = {}
): void {
  const context = useThreeLensContextOptional();

  useEffect(() => {
    if (!context?.probe) return;

    const validObjects = objects.filter((obj): obj is THREE.Object3D => obj != null);
    if (validObjects.length === 0) return;

    // Create a group ID
    const groupId = `group-${options.name || 'unnamed'}-${Date.now()}`;

    // Mark all objects as part of this group
    validObjects.forEach((obj, index) => {
      obj.userData = {
        ...obj.userData,
        __3lens: {
          ...obj.userData?.__3lens,
          groupId,
          groupName: options.name,
          groupIndex: index,
          module: options.module,
          tags: options.tags,
        },
      };
    });

    return () => {
      validObjects.forEach((obj) => {
        if (obj.userData?.__3lens?.groupId === groupId) {
          delete obj.userData.__3lens.groupId;
          delete obj.userData.__3lens.groupName;
          delete obj.userData.__3lens.groupIndex;
        }
      });
    };
  }, [objects, context?.probe, options.name, options.module, options.tags]);
}

