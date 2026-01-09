import { useThreeLensContext, useThreeLensContextOptional } from '../context';
import type { DevtoolProbe } from '@3lens/core';

/**
 * Hook to access the 3Lens probe instance
 *
 * @returns The probe instance
 * @throws Error if used outside ThreeLensProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const probe = useThreeLensProbe();
 *
 *   const handleClick = () => {
 *     const snapshot = probe.takeSnapshot();
 *     console.log('Scene has', snapshot.root.children.length, 'top-level objects');
 *   };
 *
 *   return <button onClick={handleClick}>Take Snapshot</button>;
 * }
 * ```
 */
export function useThreeLensProbe(): DevtoolProbe {
  const { probe } = useThreeLensContext();
  if (!probe) {
    throw new Error('Probe not initialized. Wait for isReady to be true.');
  }
  return probe;
}

/**
 * Hook to optionally access the probe (returns null if not available)
 *
 * @returns The probe instance or null
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const probe = useThreeLensProbeOptional();
 *
 *   // Safe to use even outside provider
 *   if (probe) {
 *     probe.takeSnapshot();
 *   }
 * }
 * ```
 */
export function useThreeLensProbeOptional(): DevtoolProbe | null {
  const context = useThreeLensContextOptional();
  return context?.probe ?? null;
}
