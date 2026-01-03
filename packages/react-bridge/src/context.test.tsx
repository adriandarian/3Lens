/**
 * Context Test Suite
 *
 * Tests for the React context and context hooks.
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { ThreeLensContext, useThreeLensContext, useThreeLensContextOptional } from './context';
import type { ThreeLensContextValue } from './types';

// Mock context value
function createMockContextValue(): ThreeLensContextValue {
  return {
    probe: {
      observeRenderer: vi.fn(),
      observeScene: vi.fn(),
      selectObjectByUuid: vi.fn(),
      clearSelection: vi.fn(),
    } as any,
    isReady: true,
    frameStats: {
      fps: 60,
      frameTimeMs: 16.67,
      drawCalls: 100,
      triangles: 50000,
    } as any,
    snapshot: { root: { children: [] }, timestamp: Date.now() } as any,
    selectedNode: null,
    selectObject: vi.fn(),
    clearSelection: vi.fn(),
    toggleOverlay: vi.fn(),
    showOverlay: vi.fn(),
    hideOverlay: vi.fn(),
    isOverlayVisible: true,
  };
}

// Context wrapper factory
function createWrapper(contextValue: ThreeLensContextValue | null) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(ThreeLensContext.Provider, { value: contextValue }, children);
  };
}

describe('ThreeLensContext', () => {
  it('should be defined', () => {
    expect(ThreeLensContext).toBeDefined();
  });

  it('should default to null', () => {
    const { result } = renderHook(() => useThreeLensContextOptional());
    expect(result.current).toBeNull();
  });
});

describe('useThreeLensContext', () => {
  it('should throw when used outside provider', () => {
    expect(() => {
      renderHook(() => useThreeLensContext());
    }).toThrow('useThreeLensContext must be used within a ThreeLensProvider');
  });

  it('should throw with helpful error message', () => {
    try {
      renderHook(() => useThreeLensContext());
    } catch (e: any) {
      expect(e.message).toContain('ThreeLensProvider');
      expect(e.message).toContain('ThreeLensCanvas');
    }
  });

  it('should return context when provided', () => {
    const mockContext = createMockContextValue();
    const wrapper = createWrapper(mockContext);

    const { result } = renderHook(() => useThreeLensContext(), { wrapper });

    expect(result.current).toBe(mockContext);
  });

  it('should provide access to probe', () => {
    const mockContext = createMockContextValue();
    const wrapper = createWrapper(mockContext);

    const { result } = renderHook(() => useThreeLensContext(), { wrapper });

    expect(result.current.probe).toBe(mockContext.probe);
  });

  it('should provide access to frameStats', () => {
    const mockContext = createMockContextValue();
    const wrapper = createWrapper(mockContext);

    const { result } = renderHook(() => useThreeLensContext(), { wrapper });

    expect(result.current.frameStats).toBe(mockContext.frameStats);
    expect(result.current.frameStats?.fps).toBe(60);
  });

  it('should provide access to snapshot', () => {
    const mockContext = createMockContextValue();
    const wrapper = createWrapper(mockContext);

    const { result } = renderHook(() => useThreeLensContext(), { wrapper });

    expect(result.current.snapshot).toBe(mockContext.snapshot);
  });

  it('should provide access to selectedNode', () => {
    const mockContext = createMockContextValue();
    const wrapper = createWrapper(mockContext);

    const { result } = renderHook(() => useThreeLensContext(), { wrapper });

    expect(result.current.selectedNode).toBeNull();
  });

  it('should provide access to actions', () => {
    const mockContext = createMockContextValue();
    const wrapper = createWrapper(mockContext);

    const { result } = renderHook(() => useThreeLensContext(), { wrapper });

    expect(typeof result.current.selectObject).toBe('function');
    expect(typeof result.current.clearSelection).toBe('function');
    expect(typeof result.current.toggleOverlay).toBe('function');
    expect(typeof result.current.showOverlay).toBe('function');
    expect(typeof result.current.hideOverlay).toBe('function');
  });

  it('should provide overlay visibility state', () => {
    const mockContext = createMockContextValue();
    const wrapper = createWrapper(mockContext);

    const { result } = renderHook(() => useThreeLensContext(), { wrapper });

    expect(result.current.isOverlayVisible).toBe(true);
  });
});

describe('useThreeLensContextOptional', () => {
  it('should return null when used outside provider', () => {
    const { result } = renderHook(() => useThreeLensContextOptional());
    expect(result.current).toBeNull();
  });

  it('should return context when provided', () => {
    const mockContext = createMockContextValue();
    const wrapper = createWrapper(mockContext);

    const { result } = renderHook(() => useThreeLensContextOptional(), { wrapper });

    expect(result.current).toBe(mockContext);
  });

  it('should not throw when used outside provider', () => {
    expect(() => {
      renderHook(() => useThreeLensContextOptional());
    }).not.toThrow();
  });

  it('should allow safe access pattern', () => {
    const { result } = renderHook(() => {
      const ctx = useThreeLensContextOptional();
      return ctx?.probe ?? null;
    });

    expect(result.current).toBeNull();
  });
});
