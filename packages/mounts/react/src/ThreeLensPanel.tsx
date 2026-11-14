/**
 * ThreeLens React Panel Component
 *
 * Embeds the full workspace (inspect, performance, memory, changes, shaders) in a
 * container you own, for apps that want a docked panel instead of, or in addition
 * to, the HUD. The container is yours: 3Lens only renders inside it.
 *
 * @packageDocumentation
 */

import { useEffect, useRef, type CSSProperties } from 'react';
import { useThreeLens } from './useThreeLens';

export interface ThreeLensPanelProps {
  className?: string;
  style?: CSSProperties;
  /** Disable all scene-mutating actions. */
  readonly?: boolean;
}

/**
 * @example
 * ```tsx
 * <ThreeLensProvider lens={lens} hud={false}>
 *   <ThreeLensPanel style={{ height: 480 }} />
 * </ThreeLensProvider>
 * ```
 */
export function ThreeLensPanel({ className, style, readonly }: ThreeLensPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { controller } = useThreeLens();

  useEffect(() => {
    if (!controller || !containerRef.current) return;
    return controller.mountWorkspace(containerRef.current, { readonly });
  }, [controller, readonly]);

  return <div ref={containerRef} className={className} style={{ width: '100%', height: '100%', position: 'relative', ...style }} />;
}
