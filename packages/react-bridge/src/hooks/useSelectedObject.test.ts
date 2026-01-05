/**
 * useSelectedObject Hook Test Suite
 *
 * Tests for the React hook that provides access to the selected object.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { ThreeLensContext } from '../context';
import { useSelectedObject } from './useSelectedObject';
import type { ThreeLensContextValue } from '../types';

// Context wrapper factory
function createWrapper(contextValue: ThreeLensContextValue) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(ThreeLensContext.Provider, { value: contextValue }, children);
  };
}

describe('useSelectedObject', () => {
  let mockContext: ThreeLensContextValue;
  let selectObject: ReturnType<typeof vi.fn>;
  let clearSelection: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    selectObject = vi.fn();
    clearSelection = vi.fn();
    mockContext = {
      probe: {} as any,
      isReady: true,
      frameStats: null,
      snapshot: null,
      selectedNode: null,
      selectObject,
      clearSelection,
      toggleOverlay: vi.fn(),
      showOverlay: vi.fn(),
      hideOverlay: vi.fn(),
      isOverlayVisible: false,
    };
  });

  it('should return no selection when nothing is selected', () => {
    const wrapper = createWrapper(mockContext);
    const { result } = renderHook(() => useSelectedObject(), { wrapper });

    expect(result.current.selectedNode).toBeNull();
    expect(result.current.selectedUuid).toBeNull();
    expect(result.current.selectedName).toBeNull();
    expect(result.current.selectedType).toBeNull();
    expect(result.current.hasSelection).toBe(false);
  });

  it('should return selection info when an object is selected', () => {
    mockContext.selectedNode = {
      uuid: 'test-uuid',
      name: 'TestMesh',
      type: 'Mesh',
    } as any;

    const wrapper = createWrapper(mockContext);
    const { result } = renderHook(() => useSelectedObject(), { wrapper });

    expect(result.current.selectedNode).toBeDefined();
    expect(result.current.selectedUuid).toBe('test-uuid');
    expect(result.current.selectedName).toBe('TestMesh');
    expect(result.current.selectedType).toBe('Mesh');
    expect(result.current.hasSelection).toBe(true);
  });

  it('should provide select function', () => {
    const wrapper = createWrapper(mockContext);
    const { result } = renderHook(() => useSelectedObject(), { wrapper });

    act(() => {
      result.current.select('some-uuid');
    });

    expect(selectObject).toHaveBeenCalledWith('some-uuid');
  });

  it('should provide clear function', () => {
    const wrapper = createWrapper(mockContext);
    const { result } = renderHook(() => useSelectedObject(), { wrapper });

    act(() => {
      result.current.clear();
    });

    expect(clearSelection).toHaveBeenCalled();
  });

  it('should return isSelected function that checks UUID', () => {
    mockContext.selectedNode = {
      uuid: 'selected-uuid',
      name: 'Selected',
      type: 'Mesh',
    } as any;

    const wrapper = createWrapper(mockContext);
    const { result } = renderHook(() => useSelectedObject(), { wrapper });

    expect(result.current.isSelected('selected-uuid')).toBe(true);
    expect(result.current.isSelected('other-uuid')).toBe(false);
  });

  it('should handle null selectedNode in isSelected', () => {
    const wrapper = createWrapper(mockContext);
    const { result } = renderHook(() => useSelectedObject(), { wrapper });

    expect(result.current.isSelected('any-uuid')).toBe(false);
  });

  it('should throw when used outside provider', () => {
    expect(() => {
      renderHook(() => useSelectedObject());
    }).toThrow('useThreeLensContext must be used within a ThreeLensProvider');
  });
});
