/**
 * useSelection Composable
 *
 * @packageDocumentation
 */

import { computed, type ComputedRef } from 'vue';
import type { Selection, EntityId } from '@3lens/runtime';
import { useThreeLens } from './useThreeLens';

/**
 * Return type for useSelection composable
 */
export interface UseSelectionReturn {
  /** Current selection */
  selection: ComputedRef<Selection | null>;
  /** Selected entity IDs */
  selectedIds: ComputedRef<EntityId[]>;
  /** Whether any entities are selected */
  hasSelection: ComputedRef<boolean>;
  /** Check if a specific entity is selected */
  isSelected: (entityId: EntityId) => boolean;
  /** Select entities */
  select: (entityIds: EntityId | EntityId[]) => void;
  /** Clear selection */
  clearSelection: () => void;
}

/**
 * Composable for working with entity selection
 *
 * @example
 * ```vue
 * <script setup>
 * import { useSelection } from '@3lens/mount-vue';
 *
 * const { selectedIds, isSelected, select, clearSelection } = useSelection();
 * </script>
 *
 * <template>
 *   <ul>
 *     <li
 *       v-for="entity in entities"
 *       :key="entity.id"
 *       :class="{ selected: isSelected(entity.id) }"
 *       @click="select(entity.id)"
 *     >
 *       {{ entity.name }}
 *     </li>
 *   </ul>
 *   <button @click="clearSelection">Clear</button>
 * </template>
 * ```
 */
export function useSelection(): UseSelectionReturn {
  const { selection: selectionRef, select } = useThreeLens();

  const selectedIds = computed(() => selectionRef.value?.entity_ids ?? []);

  const hasSelection = computed(() => selectedIds.value.length > 0);

  const selectedSet = computed(() => new Set(selectedIds.value));

  const isSelected = (entityId: EntityId): boolean => {
    return selectedSet.value.has(entityId);
  };

  const clearSelection = () => {
    select([]);
  };

  return {
    selection: computed(() => selectionRef.value),
    selectedIds,
    hasSelection,
    isSelected,
    select,
    clearSelection,
  };
}
