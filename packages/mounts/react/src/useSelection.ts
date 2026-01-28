/**
 * useSelection Hook
 *
 * @packageDocumentation
 */

import { useMemo } from 'react';
import type { Selection, EntityId } from '@3lens/runtime';
import { useThreeLens } from './useThreeLens';

/**
 * Return type for useSelection hook
 */
export interface UseSelectionResult {
  /** Current selection */
  selection: Selection | null;
  /** Selected entity IDs */
  selectedIds: EntityId[];
  /** Whether any entities are selected */
  hasSelection: boolean;
  /** Check if a specific entity is selected */
  isSelected: (entityId: EntityId) => boolean;
  /** Select entities */
  select: (entityIds: EntityId | EntityId[]) => void;
  /** Clear selection */
  clearSelection: () => void;
}

/**
 * Hook for working with entity selection
 *
 * @example
 * ```tsx
 * function EntityList({ entities }) {
 *   const { selectedIds, isSelected, select } = useSelection();
 *
 *   return (
 *     <ul>
 *       {entities.map(entity => (
 *         <li
 *           key={entity.id}
 *           className={isSelected(entity.id) ? 'selected' : ''}
 *           onClick={() => select(entity.id)}
 *         >
 *           {entity.name}
 *         </li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 */
export function useSelection(): UseSelectionResult {
  const { selection, select } = useThreeLens();

  return useMemo(() => {
    const selectedIds = selection?.entity_ids ?? [];
    const selectedSet = new Set(selectedIds);

    return {
      selection,
      selectedIds,
      hasSelection: selectedIds.length > 0,
      isSelected: (entityId: EntityId) => selectedSet.has(entityId),
      select,
      clearSelection: () => select([]),
    };
  }, [selection, select]);
}
