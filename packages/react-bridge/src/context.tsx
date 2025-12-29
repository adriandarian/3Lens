import { createContext, useContext } from 'react';
import type { ThreeLensContextValue } from './types';

/**
 * React context for 3Lens
 */
export const ThreeLensContext = createContext<ThreeLensContextValue | null>(null);

/**
 * Hook to access the 3Lens context
 * @throws Error if used outside of ThreeLensProvider
 */
export function useThreeLensContext(): ThreeLensContextValue {
  const context = useContext(ThreeLensContext);
  if (!context) {
    throw new Error(
      'useThreeLensContext must be used within a ThreeLensProvider. ' +
        'Wrap your app with <ThreeLensProvider> or use <ThreeLensCanvas> for R3F.'
    );
  }
  return context;
}

/**
 * Hook to optionally access the 3Lens context (returns null if not available)
 */
export function useThreeLensContextOptional(): ThreeLensContextValue | null {
  return useContext(ThreeLensContext);
}

