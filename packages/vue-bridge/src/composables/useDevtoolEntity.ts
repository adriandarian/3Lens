import { watch, onUnmounted, type Ref, type MaybeRef, unref } from 'vue';
import { useThreeLensOptional } from './useThreeLens';
import type { EntityOptions } from '../types';
import type * as THREE from 'three';

/**
 * Composable to register a Three.js object as a named entity in 3Lens devtools
 *
 * @param object The Three.js object (or ref to object) to register
 * @param options Entity options including name, module, and metadata
 *
 * @example
 * ```vue
 * <script setup>
 * import { ref, onMounted } from 'vue';
 * import { useDevtoolEntity } from '@3lens/vue-bridge';
 * import * as THREE from 'three';
 *
 * const meshRef = ref<THREE.Mesh | null>(null);
 *
 * useDevtoolEntity(meshRef, {
 *   name: 'Player',
 *   module: 'game/entities',
 *   metadata: { health: 100 },
 *   tags: ['player', 'controllable'],
 * });
 *
 * onMounted(() => {
 *   meshRef.value = new THREE.Mesh(
 *     new THREE.BoxGeometry(),
 *     new THREE.MeshStandardMaterial()
 *   );
 * });
 * </script>
 * ```
 */
export function useDevtoolEntity(
  object: MaybeRef<THREE.Object3D | null | undefined>,
  options: EntityOptions = {}
): void {
  const context = useThreeLensOptional();
  let registeredUuid: string | null = null;

  const register = (obj: THREE.Object3D | null | undefined) => {
    if (!obj || !context?.probe.value) return;

    // Set name on the object
    if (options.name && obj.name !== options.name) {
      obj.name = options.name;
    }

    // Store metadata in userData
    obj.userData = {
      ...obj.userData,
      __3lens: {
        module: options.module,
        metadata: options.metadata,
        tags: options.tags,
        registeredAt: Date.now(),
      },
    };

    registeredUuid = obj.uuid;

    // Trigger snapshot refresh
    context.probe.value.requestSnapshot?.();
  };

  const unregister = (obj: THREE.Object3D | null | undefined) => {
    if (!obj) return;

    if (obj.userData?.__3lens) {
      delete obj.userData.__3lens;
    }
    registeredUuid = null;
  };

  // Watch for object changes
  watch(
    () => unref(object),
    (newObj, oldObj) => {
      if (oldObj) {
        unregister(oldObj);
      }
      if (newObj) {
        register(newObj);
      }
    },
    { immediate: true }
  );

  // Watch for options changes (metadata, tags)
  watch(
    () => [options.metadata, options.tags],
    () => {
      const obj = unref(object);
      if (obj && obj.userData?.__3lens) {
        obj.userData.__3lens = {
          ...obj.userData.__3lens,
          metadata: options.metadata,
          tags: options.tags,
        };
      }
    },
    { deep: true }
  );

  // Cleanup on unmount
  onUnmounted(() => {
    unregister(unref(object));
  });
}

/**
 * Composable to register a group of related objects as a logical entity
 *
 * @param objects Array of Three.js objects (or ref to array)
 * @param options Entity options
 *
 * @example
 * ```vue
 * <script setup>
 * import { ref } from 'vue';
 * import { useDevtoolEntityGroup } from '@3lens/vue-bridge';
 *
 * const vehicleParts = ref<THREE.Object3D[]>([]);
 *
 * useDevtoolEntityGroup(vehicleParts, {
 *   name: 'PlayerVehicle',
 *   module: 'game/vehicles',
 * });
 * </script>
 * ```
 */
export function useDevtoolEntityGroup(
  objects: MaybeRef<(THREE.Object3D | null | undefined)[]>,
  options: EntityOptions = {}
): void {
  const context = useThreeLensOptional();
  const groupId = `group-${options.name || 'unnamed'}-${Date.now()}`;

  const registerGroup = (objs: (THREE.Object3D | null | undefined)[]) => {
    if (!context?.probe.value) return;

    const validObjects = objs.filter((obj): obj is THREE.Object3D => obj != null);

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
  };

  const unregisterGroup = (objs: (THREE.Object3D | null | undefined)[]) => {
    objs.forEach((obj) => {
      if (obj?.userData?.__3lens?.groupId === groupId) {
        delete obj.userData.__3lens.groupId;
        delete obj.userData.__3lens.groupName;
        delete obj.userData.__3lens.groupIndex;
      }
    });
  };

  watch(
    () => unref(objects),
    (newObjs, oldObjs) => {
      if (oldObjs) {
        unregisterGroup(oldObjs);
      }
      if (newObjs) {
        registerGroup(newObjs);
      }
    },
    { immediate: true, deep: true }
  );

  onUnmounted(() => {
    unregisterGroup(unref(objects) ?? []);
  });
}

