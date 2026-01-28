/**
 * ThreeLens React Panel Component
 *
 * @packageDocumentation
 */

import {
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
  type CSSProperties,
} from 'react';
import { useThreeLens } from './useThreeLens';

/**
 * Props for ThreeLensPanel
 */
export interface ThreeLensPanelProps {
  /** CSS class name */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Initial visibility */
  visible?: boolean;
}

/**
 * Ref handle for ThreeLensPanel
 */
export interface ThreeLensPanelRef {
  /** Show the panel */
  show: () => void;
  /** Hide the panel */
  hide: () => void;
  /** Toggle visibility */
  toggle: () => void;
  /** Check if visible */
  isVisible: () => boolean;
}

/**
 * React component for rendering 3Lens UI
 *
 * @example
 * ```tsx
 * function App() {
 *   const panelRef = useRef<ThreeLensPanelRef>(null);
 *
 *   return (
 *     <ThreeLensProvider>
 *       <ThreeLensPanel
 *         ref={panelRef}
 *         className="my-panel"
 *       />
 *       <button onClick={() => panelRef.current?.toggle()}>
 *         Toggle Panel
 *       </button>
 *     </ThreeLensProvider>
 *   );
 * }
 * ```
 */
export const ThreeLensPanel = forwardRef<ThreeLensPanelRef, ThreeLensPanelProps>(
  function ThreeLensPanel({ className, style, visible = true }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const { ui, show, hide, toggle, visible: isVisible } = useThreeLens();
    const mountedRef = useRef(false);

    // Mount UI on container
    useEffect(() => {
      if (!containerRef.current || !ui || mountedRef.current) return;

      ui.mount(containerRef.current);
      mountedRef.current = true;

      // Set initial visibility
      if (!visible) {
        ui.hide();
      }

      return () => {
        ui.unmount();
        mountedRef.current = false;
      };
    }, [ui, visible]);

    // Expose imperative handle
    useImperativeHandle(ref, () => ({
      show,
      hide,
      toggle,
      isVisible: () => isVisible,
    }), [show, hide, toggle, isVisible]);

    return (
      <div
        ref={containerRef}
        className={className}
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          ...style,
        }}
      />
    );
  }
);
