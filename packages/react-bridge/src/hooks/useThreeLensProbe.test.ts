/**
 * useThreeLensProbe Hook Test Suite
 *
 * Tests for the React hook that provides access to the 3Lens probe.
 */

import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { ThreeLensContext } from '../context';
import { useThreeLensProbe, useThreeLensProbeOptional } from './useThreeLensProbe';
import type { ThreeLensContextValue } from '../types';

// Mock probe
function createMockProbe(): any {
  return {
    takeSnapshot: vi.fn(),
    getLatestStats: vi.fn(),
    onFrameStats: vi.fn(() => () => {}),
  };
}

// Create full context
function createContext(probe: any): ThreeLensContextValue {
  return {
    probe,
    isReady: !!probe,
    frameStats: null,
    snapshot: null,
    selectedNode: null,
    selectObject: vi.fn(),
    clearSelection: vi.fn(),
    toggleOverlay: vi.fn(),
    showOverlay: vi.fn(),
    hideOverlay: vi.fn(),
    isOverlayVisible: false,
  };
}

// Context wrapper factory
function createWrapper(contextValue: ThreeLensContextValue | null) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(ThreeLensContext.Provider, { value: contextValue }, children);
  };
}

describe('useThreeLensProbe', () => {
  it('should return the probe instance', () => {
    const mockProbe = createMockProbe();
    const wrapper = createWrapper(createContext(mockProbe));

    const { result } = renderHook(() => useThreeLensProbe(), { wrapper });

    expect(result.current).toBe(mockProbe);
  });

  it('should throw when used outside provider', () => {
    expect(() => {
      renderHook(() => useThreeLensProbe());
    }).toThrow('useThreeLensContext must be used within a ThreeLensProvider');
  });

  it('should throw when probe is not initialized', () => {
    const wrapper = createWrapper(createContext(null));

    expect(() => {
      renderHook(() => useThreeLensProbe(), { wrapper });
    }).toThrow('Probe not initialized');
  });
});

describe('useThreeLensProbeOptional', () => {
  it('should return probe when available', () => {
    const mockProbe = createMockProbe();
    const wrapper = createWrapper(createContext(mockProbe));

    const { result } = renderHook(() => useThreeLensProbeOptional(), { wrapper });

    expect(result.current).toBe(mockProbe);
  });

  it('should return null when context not available', () => {
    const wrapper = createWrapper(null);

    const { result } = renderHook(() => useThreeLensProbeOptional(), { wrapper });

    expect(result.current).toBeNull();
  });

  it('should return null when probe is null in context', () => {
    const wrapper = createWrapper(createContext(null));

    const { result } = renderHook(() => useThreeLensProbeOptional(), { wrapper });

    expect(result.current).toBeNull();
  });
});
