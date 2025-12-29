import { computed, type ComputedRef, type Ref } from 'vue';
import type { SceneNode } from '@3lens/core';
import { useThreeLens } from './useThreeLens';

export interface UseSelectedObjectReturn {
  /**
   * The currently selected scene node
   */
  selectedNode: Ref<SceneNode | null>;

  /**
   * The selected object's UUID
   */
  selectedUuid: ComputedRef<string | null>;

  /**
   * The selected object's name
   */
  selectedName: ComputedRef<string | null>;

  /**
   * The selected object's type
   */
  selectedType: ComputedRef<string | null>;

  /**
   * Whether an object is currently selected
   */
  hasSelection: ComputedRef<boolean>;

  /**
   * Select an object by UUID
   */
  select: (uuid: string) => void;

  /**
   * Clear the current selection
   */
  clear: () => void;

  /**
   * Check if a specific object is selected
   */
  isSelected: (uuid: string) => boolean;
}

/**
 * Composable to access and manage the currently selected object
 *
 * @returns Selection state and controls
 *
 * @example
 * ```vue
 * <script setup>
 * import { useSelectedObject } from '@3lens/vue-bridge';
 *
 * const { selectedNode, hasSelection, clear } = useSelectedObject();
 * </script>
 *
 * <template>
 *   <div v-if="hasSelection">
 *     <h3>{{ selectedNode?.ref.name || 'Unnamed' }}</h3>
 *     <p>Type: {{ selectedNode?.ref.type }}</p>
 *     <button @click="clear">Deselect</button>
 *   </div>
 *   <div v-else>Nothing selected</div>
 * </template>
 * ```
 */
export function useSelectedObject(): UseSelectedObjectReturn {
  const { selectedNode, selectObject, clearSelection } = useThreeLens();

  const selectedUuid = computed(() => selectedNode.value?.ref.uuid ?? null);
  const selectedName = computed(() => selectedNode.value?.ref.name ?? null);
  const selectedType = computed(() => selectedNode.value?.ref.type ?? null);
  const hasSelection = computed(() => selectedNode.value !== null);

  const isSelected = (uuid: string): boolean => {
    return selectedNode.value?.ref.uuid === uuid;
  };

  return {
    selectedNode,
    selectedUuid,
    selectedName,
    selectedType,
    hasSelection,
    select: selectObject,
    clear: clearSelection,
    isSelected,
  };
}

