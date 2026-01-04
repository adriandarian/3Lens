/**
 * ThreeLensProvider Test Suite
 *
 * Tests for the React provider component that initializes and provides the 3Lens probe context.
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, render, screen, waitFor } from '@testing-library/react';
import React, { createElement, useContext } from 'react';
import { ThreeLensContext, useThreeLensContext, useThreeLensContextOptional } from './context';

// Mock @3lens/core
const mockFrameStats = {
  fps: 60,
  frameTimeMs: 16.67,
  drawCalls: 100,
  triangles: 50000,
  memory: { gpuMemoryEstimate: 128 },
};

const mockSnapshot = {
  root: { children: [] },
  timestamp: Date.now(),
};

const mockSceneNode = {
  ref: { uuid: 'test-uuid', name: 'Test Object', type: 'Mesh' },
  children: [],
};

let frameStatsCallback: ((stats: any) => void) | null = null;
let snapshotCallback: ((snapshot: any) => void) | null = null;
let selectionCallback: ((node: any) => void) | null = null;

const mockProbe = {
  onFrameStats: vi.fn((cb: (stats: any) => void) => {
    frameStatsCallback = cb;
    return () => { frameStatsCallback = null; };
  }),
  onSnapshot: vi.fn((cb: (snapshot: any) => void) => {
    snapshotCallback = cb;
    return () => { snapshotCallback = null; };
  }),
  onSelectionChanged: vi.fn((cb: (node: any) => void) => {
    selectionCallback = cb;
    return () => { selectionCallback = null; };
  }),
  observeRenderer: vi.fn(),
  observeScene: vi.fn(),
  selectObjectByUuid: vi.fn(),
  clearSelection: vi.fn(),
  takeSnapshot: vi.fn(() => mockSnapshot),
  focusOnSelected: vi.fn(),
  flyToSelected: vi.fn(),
  dispose: vi.fn(),
  config: { debug: false },
};

vi.mock('@3lens/core', () => ({
  createProbe: vi.fn(() => mockProbe),
}));

import { ThreeLensProvider, ThreeLensProviderProps } from './ThreeLensProvider';
import { type ThreeLensContextValue } from './types';

describe('ThreeLensProvider', () => {
  let keydownHandler: ((e: KeyboardEvent) => void) | null = null;

  beforeEach(() => {
    vi.clearAllMocks();
    frameStatsCallback = null;
    snapshotCallback = null;
    selectionCallback = null;

    // Capture keydown handler
    vi.spyOn(window, 'addEventListener').mockImplementation((event, handler) => {
      if (event === 'keydown') {
        keydownHandler = handler as (e: KeyboardEvent) => void;
      }
    });
    vi.spyOn(window, 'removeEventListener').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    keydownHandler = null;
  });

  // Helper component to consume context
  function ContextConsumer({ onContext }: { onContext: (ctx: ThreeLensContextValue | null) => void }) {
    const context = useContext(ThreeLensContext);
    React.useEffect(() => {
      onContext(context);
    }, [context, onContext]);
    return null;
  }

  describe('initialization', () => {
    it('should render children', () => {
      render(
        createElement(ThreeLensProvider, {},
          createElement('div', { 'data-testid': 'child' }, 'Child content')
        )
      );
      expect(screen.getByTestId('child').textContent).toBe('Child content');
    });

    it('should create probe with default config', async () => {
      let capturedContext: ThreeLensContextValue | null = null;

      render(
        createElement(ThreeLensProvider, {},
          createElement(ContextConsumer, {
            onContext: (ctx) => { capturedContext = ctx; }
          })
        )
      );

      await waitFor(() => {
        expect(capturedContext).not.toBeNull();
        expect(capturedContext?.probe).toBe(mockProbe);
      });
    });

    it('should use external probe when provided', async () => {
      const externalProbe = { ...mockProbe, id: 'external' } as any;
      let capturedContext: ThreeLensContextValue | null = null;

      render(
        createElement(ThreeLensProvider, { probe: externalProbe },
          createElement(ContextConsumer, {
            onContext: (ctx) => { capturedContext = ctx; }
          })
        )
      );

      await waitFor(() => {
        expect(capturedContext?.probe).toBe(externalProbe);
      });
    });

    it('should subscribe to probe events', () => {
      render(createElement(ThreeLensProvider, {}, createElement('div')));

      expect(mockProbe.onFrameStats).toHaveBeenCalled();
      expect(mockProbe.onSnapshot).toHaveBeenCalled();
      expect(mockProbe.onSelectionChanged).toHaveBeenCalled();
    });
  });

  describe('context values', () => {
    it('should provide frameStats when emitted', async () => {
      let capturedContext: ThreeLensContextValue | null = null;

      render(
        createElement(ThreeLensProvider, {},
          createElement(ContextConsumer, {
            onContext: (ctx) => { capturedContext = ctx; }
          })
        )
      );

      // Emit frame stats
      act(() => {
        frameStatsCallback?.(mockFrameStats);
      });

      await waitFor(() => {
        expect(capturedContext?.frameStats).toEqual(mockFrameStats);
      });
    });

    it('should provide snapshot when emitted', async () => {
      let capturedContext: ThreeLensContextValue | null = null;

      render(
        createElement(ThreeLensProvider, {},
          createElement(ContextConsumer, {
            onContext: (ctx) => { capturedContext = ctx; }
          })
        )
      );

      // Emit snapshot
      act(() => {
        snapshotCallback?.(mockSnapshot);
      });

      await waitFor(() => {
        expect(capturedContext?.snapshot).toEqual(mockSnapshot);
        expect(capturedContext?.isReady).toBe(true);
      });
    });

    it('should provide selectedNode when selection changes', async () => {
      let capturedContext: ThreeLensContextValue | null = null;

      render(
        createElement(ThreeLensProvider, {},
          createElement(ContextConsumer, {
            onContext: (ctx) => { capturedContext = ctx; }
          })
        )
      );

      // Emit selection
      act(() => {
        selectionCallback?.(mockSceneNode);
      });

      await waitFor(() => {
        expect(capturedContext?.selectedNode).toEqual(mockSceneNode);
      });
    });
  });

  describe('actions', () => {
    it('should call selectObjectByUuid on probe', async () => {
      let capturedContext: ThreeLensContextValue | null = null;

      render(
        createElement(ThreeLensProvider, {},
          createElement(ContextConsumer, {
            onContext: (ctx) => { capturedContext = ctx; }
          })
        )
      );

      await waitFor(() => {
        expect(capturedContext).not.toBeNull();
      });

      act(() => {
        capturedContext?.selectObject('test-uuid');
      });

      expect(mockProbe.selectObjectByUuid).toHaveBeenCalledWith('test-uuid');
    });

    it('should call clearSelection on probe', async () => {
      let capturedContext: ThreeLensContextValue | null = null;

      render(
        createElement(ThreeLensProvider, {},
          createElement(ContextConsumer, {
            onContext: (ctx) => { capturedContext = ctx; }
          })
        )
      );

      await waitFor(() => {
        expect(capturedContext).not.toBeNull();
      });

      act(() => {
        capturedContext?.clearSelection();
      });

      expect(mockProbe.clearSelection).toHaveBeenCalled();
    });

    it('should toggle overlay visibility', async () => {
      let capturedContext: ThreeLensContextValue | null = null;

      render(
        createElement(ThreeLensProvider, { config: { showOverlay: true } },
          createElement(ContextConsumer, {
            onContext: (ctx) => { capturedContext = ctx; }
          })
        )
      );

      await waitFor(() => {
        expect(capturedContext).not.toBeNull();
        expect(capturedContext?.isOverlayVisible).toBe(true);
      });

      act(() => {
        capturedContext?.toggleOverlay();
      });

      await waitFor(() => {
        expect(capturedContext?.isOverlayVisible).toBe(false);
      });
    });

    it('should show overlay', async () => {
      let capturedContext: ThreeLensContextValue | null = null;

      render(
        createElement(ThreeLensProvider, { config: { showOverlay: false } },
          createElement(ContextConsumer, {
            onContext: (ctx) => { capturedContext = ctx; }
          })
        )
      );

      await waitFor(() => {
        expect(capturedContext).not.toBeNull();
      });

      act(() => {
        capturedContext?.showOverlay();
      });

      await waitFor(() => {
        expect(capturedContext?.isOverlayVisible).toBe(true);
      });
    });

    it('should hide overlay', async () => {
      let capturedContext: ThreeLensContextValue | null = null;

      render(
        createElement(ThreeLensProvider, { config: { showOverlay: true } },
          createElement(ContextConsumer, {
            onContext: (ctx) => { capturedContext = ctx; }
          })
        )
      );

      await waitFor(() => {
        expect(capturedContext).not.toBeNull();
      });

      act(() => {
        capturedContext?.hideOverlay();
      });

      await waitFor(() => {
        expect(capturedContext?.isOverlayVisible).toBe(false);
      });
    });
  });

  describe('keyboard shortcuts', () => {
    it('should set up keyboard shortcut handler', () => {
      render(createElement(ThreeLensProvider, {}, createElement('div')));
      expect(window.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('should respond to default shortcut (ctrl+shift+d)', async () => {
      let capturedContext: ThreeLensContextValue | null = null;

      render(
        createElement(ThreeLensProvider, { config: { showOverlay: true } },
          createElement(ContextConsumer, {
            onContext: (ctx) => { capturedContext = ctx; }
          })
        )
      );

      await waitFor(() => {
        expect(capturedContext?.isOverlayVisible).toBe(true);
      });

      // Simulate keyboard shortcut
      if (keydownHandler) {
        const event = {
          ctrlKey: true,
          shiftKey: true,
          altKey: false,
          key: 'd',
          preventDefault: vi.fn(),
        } as unknown as KeyboardEvent;

        act(() => {
          keydownHandler!(event);
        });

        await waitFor(() => {
          expect(capturedContext?.isOverlayVisible).toBe(false);
        });
      }
    });

    it('should respond to custom shortcut', async () => {
      let capturedContext: ThreeLensContextValue | null = null;

      render(
        createElement(ThreeLensProvider, { config: { toggleShortcut: 'alt+t', showOverlay: true } },
          createElement(ContextConsumer, {
            onContext: (ctx) => { capturedContext = ctx; }
          })
        )
      );

      await waitFor(() => {
        expect(capturedContext?.isOverlayVisible).toBe(true);
      });

      if (keydownHandler) {
        const event = {
          ctrlKey: false,
          shiftKey: false,
          altKey: true,
          key: 't',
          preventDefault: vi.fn(),
        } as unknown as KeyboardEvent;

        act(() => {
          keydownHandler!(event);
        });

        await waitFor(() => {
          expect(capturedContext?.isOverlayVisible).toBe(false);
        });
      }
    });
  });

  describe('cleanup', () => {
    it('should dispose probe on unmount', () => {
      const { unmount } = render(createElement(ThreeLensProvider, {}, createElement('div')));
      
      unmount();
      
      expect(mockProbe.dispose).toHaveBeenCalled();
    });

    it('should not dispose external probe on unmount', () => {
      const externalProbe = { ...mockProbe, id: 'external' } as any;
      const { unmount } = render(
        createElement(ThreeLensProvider, { probe: externalProbe },
          createElement('div')
        )
      );
      
      unmount();
      
      // External probe should not be disposed
      expect(externalProbe.dispose).not.toHaveBeenCalled();
    });

    it('should remove keyboard listener on unmount', () => {
      const { unmount } = render(createElement(ThreeLensProvider, {}, createElement('div')));
      
      unmount();
      
      expect(window.removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    });
  });
});
