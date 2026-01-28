/**
 * useThreeLens Hook
 *
 * @packageDocumentation
 */

import { useContext } from 'react';
import { ThreeLensContext, type ThreeLensContextValue } from './context';

/**
 * Hook to access the 3Lens context
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { client, selection, select } = useThreeLens();
 *
 *   return (
 *     <button onClick={() => select('entity-id')}>
 *       Select Entity
 *     </button>
 *   );
 * }
 * ```
 */
export function useThreeLens(): ThreeLensContextValue {
  const context = useContext(ThreeLensContext);

  if (!context) {
    throw new Error(
      'useThreeLens must be used within a ThreeLensProvider. ' +
      'Wrap your component tree with <ThreeLensProvider>.'
    );
  }

  return context;
}
