import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type * as THREE from 'three';
import { createProbe, type DevtoolProbe, type FrameStats, type SceneSnapshot } from '@3lens/core';
import { ThreeLensContext } from './context';
import type { ThreeLensProviderConfig, ThreeLensContextValue } from './types';

export interface ThreeLensProviderProps {
  /**
   * Configuration for the probe
   */
  config?: ThreeLensProviderConfig;

  /**
   * Children to render
   */
  children?: React.ReactNode;

  /**
   * Optional: Pre-created probe instance (for advanced use cases)
   */
  probe?: DevtoolProbe;
}

/**
 * Provider component that initializes and provides the 3Lens probe context
 *
 * @example
 * ```tsx
 * import { ThreeLensProvider } from '@3lens/react-bridge';
 *
 * function App() {
 *   return (
 *     <ThreeLensProvider config={{ appName: 'My App' }}>
 *       <Canvas>
 *         <MyScene />
 *       </Canvas>
 *     </ThreeLensProvider>
 *   );
 * }
 * ```
 */
export function ThreeLensProvider({
  config = {},
  children,
  probe: externalProbe,
}: ThreeLensProviderProps): React.ReactElement {
  const [probe, setProbe] = useState<DevtoolProbe | null>(externalProbe ?? null);
  const [isReady, setIsReady] = useState(false);
  const [frameStats, setFrameStats] = useState<FrameStats | null>(null);
  const [snapshot, setSnapshot] = useState<SceneSnapshot | null>(null);
  const [selectedNode, setSelectedNode] = useState<THREE.Object3D | null>(null);
  const [isOverlayVisible, setIsOverlayVisible] = useState(config.showOverlay ?? true);

  const overlayRef = useRef<{ show: () => void; hide: () => void; toggle: () => void } | null>(
    null
  );
  const unsubscribeRef = useRef<(() => void)[]>([]);

  // Initialize probe
  useEffect(() => {
    if (externalProbe) {
      setProbe(externalProbe);
      setIsReady(true);
      return;
    }

    const newProbe = createProbe({
      appName: config.appName ?? 'React Three.js App',
      debug: config.debug,
      ...config,
    });

    setProbe(newProbe);

    return () => {
      // Clean up subscriptions
      unsubscribeRef.current.forEach((unsub) => unsub());
      unsubscribeRef.current = [];

      // Don't dispose if it was externally provided
      if (!externalProbe) {
        newProbe.dispose();
      }
    };
  }, [externalProbe, config.appName, config.debug]);

  // Subscribe to probe events
  useEffect(() => {
    if (!probe) return;

    // Subscribe to frame stats
    const unsubStats = probe.onFrameStats((stats) => {
      setFrameStats(stats);
    });
    unsubscribeRef.current.push(unsubStats);

    // Subscribe to snapshots
    const unsubSnapshot = probe.onSnapshot((snap) => {
      setSnapshot(snap);
      setIsReady(true);
    });
    unsubscribeRef.current.push(unsubSnapshot);

    // Subscribe to selection changes
    const unsubSelection = probe.onSelectionChanged((node) => {
      setSelectedNode(node);
    });
    unsubscribeRef.current.push(unsubSelection);

    return () => {
      unsubscribeRef.current.forEach((unsub) => unsub());
      unsubscribeRef.current = [];
    };
  }, [probe]);

  // Set up keyboard shortcut
  useEffect(() => {
    const shortcut = config.toggleShortcut ?? 'ctrl+shift+d';

    const handleKeyDown = (e: KeyboardEvent) => {
      const keys = shortcut.toLowerCase().split('+');
      const needsCtrl = keys.includes('ctrl');
      const needsShift = keys.includes('shift');
      const needsAlt = keys.includes('alt');
      const key = keys.find((k) => !['ctrl', 'shift', 'alt'].includes(k));

      if (
        e.ctrlKey === needsCtrl &&
        e.shiftKey === needsShift &&
        e.altKey === needsAlt &&
        e.key.toLowerCase() === key
      ) {
        e.preventDefault();
        toggleOverlay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [config.toggleShortcut]);

  const selectObject = useCallback(
    (uuid: string) => {
      const obj = probe?.findObjectByDebugIdOrUuid(uuid);
      if (obj) {
        probe?.selectObject(obj);
      }
    },
    [probe]
  );

  const clearSelection = useCallback(() => {
    probe?.selectObject(null);
  }, [probe]);

  const showOverlay = useCallback(() => {
    overlayRef.current?.show();
    setIsOverlayVisible(true);
  }, []);

  const hideOverlay = useCallback(() => {
    overlayRef.current?.hide();
    setIsOverlayVisible(false);
  }, []);

  const toggleOverlay = useCallback(() => {
    if (isOverlayVisible) {
      hideOverlay();
    } else {
      showOverlay();
    }
  }, [isOverlayVisible, showOverlay, hideOverlay]);

  const contextValue = useMemo<ThreeLensContextValue>(
    () => ({
      probe,
      isReady,
      frameStats,
      snapshot,
      selectedNode,
      selectObject,
      clearSelection,
      toggleOverlay,
      showOverlay,
      hideOverlay,
      isOverlayVisible,
    }),
    [
      probe,
      isReady,
      frameStats,
      snapshot,
      selectedNode,
      selectObject,
      clearSelection,
      toggleOverlay,
      showOverlay,
      hideOverlay,
      isOverlayVisible,
    ]
  );

  return <ThreeLensContext.Provider value={contextValue}>{children}</ThreeLensContext.Provider>;
}

