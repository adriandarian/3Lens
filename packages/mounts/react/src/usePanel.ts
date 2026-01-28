/**
 * usePanel Hook
 *
 * @packageDocumentation
 */

import { useEffect, useRef } from 'react';
import type { Panel } from '@3lens/ui-core';
import { useThreeLens } from './useThreeLens';

/**
 * Hook for registering custom panels
 *
 * @example
 * ```tsx
 * function MyCustomPanel() {
 *   const panel = useMemo(() => ({
 *     id: 'my-panel',
 *     name: 'My Panel',
 *     render(container, client) {
 *       container.innerHTML = '<div>Custom Panel Content</div>';
 *     },
 *   }), []);
 *
 *   usePanel(panel);
 *
 *   return null; // Panel renders via UI adapter
 * }
 * ```
 */
export function usePanel(panel: Panel): void {
  const { registerPanel, unregisterPanel } = useThreeLens();
  const registeredRef = useRef(false);

  useEffect(() => {
    if (registeredRef.current) return;

    registerPanel(panel);
    registeredRef.current = true;

    return () => {
      unregisterPanel(panel.id);
      registeredRef.current = false;
    };
  }, [panel, registerPanel, unregisterPanel]);
}
