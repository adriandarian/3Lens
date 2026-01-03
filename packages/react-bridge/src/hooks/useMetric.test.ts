/**
 * useMetric Hook Test Suite
 *
 * Tests for the React hooks that track frame metrics.
 * Note: These hooks have complex state management with useEffect that
 * makes full testing challenging in a unit test environment.
 */

import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { createElement, type ReactNode, useState, useCallback } from 'react';
import { ThreeLensContext } from '../context';
import { useFPS, useDrawCalls, useTriangles, useFrameTime } from './useMetric';
import type { ThreeLensContextValue } from '../types';
import type { FrameStats } from '@3lens/core';

// Create basic frame stats
function createFrameStats(overrides: Partial<FrameStats> = {}): FrameStats {
  return {
    fps: 60,
    frameTime: 16.67,
    drawCalls: 100,
    triangles: 50000,
    textureMemory: 0,
    geometryMemory: 0,
    programs: 0,
    ...overrides,
  } as FrameStats;
}

describe('useMetric convenience hooks exports', () => {
  it('should export useFPS', () => {
    expect(useFPS).toBeDefined();
    expect(typeof useFPS).toBe('function');
  });

  it('should export useDrawCalls', () => {
    expect(useDrawCalls).toBeDefined();
    expect(typeof useDrawCalls).toBe('function');
  });

  it('should export useTriangles', () => {
    expect(useTriangles).toBeDefined();
    expect(typeof useTriangles).toBe('function');
  });

  it('should export useFrameTime', () => {
    expect(useFrameTime).toBeDefined();
    expect(typeof useFrameTime).toBe('function');
  });
});

describe('useMetric hooks throw without provider', () => {
  it('useFPS should throw when used outside provider', () => {
    expect(() => {
      renderHook(() => useFPS());
    }).toThrow('useThreeLensContext must be used within a ThreeLensProvider');
  });

  it('useDrawCalls should throw when used outside provider', () => {
    expect(() => {
      renderHook(() => useDrawCalls());
    }).toThrow('useThreeLensContext must be used within a ThreeLensProvider');
  });

  it('useTriangles should throw when used outside provider', () => {
    expect(() => {
      renderHook(() => useTriangles());
    }).toThrow('useThreeLensContext must be used within a ThreeLensProvider');
  });

  it('useFrameTime should throw when used outside provider', () => {
    expect(() => {
      renderHook(() => useFrameTime());
    }).toThrow('useThreeLensContext must be used within a ThreeLensProvider');
  });
});
