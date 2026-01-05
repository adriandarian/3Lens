import { useCallback } from 'react';
import { useThreeLensContext } from '../context';
import type * as THREE from 'three';

export interface UseSelectedObjectResult {
  /**
   * The currently selected object (null if nothing selected)
   */
  selectedNode: THREE.Object3D | null;

  /**
   * The selected object's UUID (null if nothing selected)
   */
  selectedUuid: string | null;

  /**
   * The selected object's name (null if nothing selected)
   */
  selectedName: string | null;

  /**
   * The selected object's type (null if nothing selected)
   */
  selectedType: string | null;

  /**
   * Whether an object is currently selected
   */
  hasSelection: boolean;

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
 * Hook to access and manage the currently selected object
 *
 * @returns Selection state and controls
 *
 * @example
 * ```tsx
 * function SelectionInfo() {
 *   const { selectedNode, hasSelection, clear } = useSelectedObject();
 *
 *   if (!hasSelection) {
 *     return <div>Nothing selected</div>;
 *   }
 *
 *   return (
 *     <div>
 *       <h3>Selected: {selectedNode?.name || 'Unnamed'}</h3>
 *       <p>Type: {selectedNode?.type}</p>
 *       <button onClick={clear}>Deselect</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useSelectedObject(): UseSelectedObjectResult {
  const { selectedNode, selectObject, clearSelection } = useThreeLensContext();

  const isSelected = useCallback(
    (uuid: string) => {
      return selectedNode?.uuid === uuid;
    },
    [selectedNode]
  );

  return {
    selectedNode,
    selectedUuid: selectedNode?.uuid ?? null,
    selectedName: selectedNode?.name ?? null,
    selectedType: selectedNode?.type ?? null,
    hasSelection: selectedNode !== null,
    select: selectObject,
    clear: clearSelection,
    isSelected,
  };
}

