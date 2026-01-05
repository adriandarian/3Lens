/**
 * useDevtoolEntity Hook Test Suite
 *
 * Tests for the React hook that registers Three.js objects with 3Lens devtools.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { ThreeLensContext } from '../context';
import { useDevtoolEntity, useDevtoolEntityGroup } from './useDevtoolEntity';
import type { ThreeLensContextValue } from '../types';

// Mock Three.js Object3D
function createMockObject3D(uuid = 'test-uuid'): any {
  return {
    uuid,
    name: '',
    userData: {},
  };
}

// Mock probe
function createMockProbe(): any {
  return {
    takeSnapshot: vi.fn(),
    onFrameStats: vi.fn(() => () => {}),
    onSnapshot: vi.fn(() => () => {}),
    onSelectionChanged: vi.fn(() => () => {}),
    getLatestStats: vi.fn(() => null),
  };
}

// Context wrapper factory
function createWrapper(contextValue: ThreeLensContextValue | null) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(ThreeLensContext.Provider, { value: contextValue }, children);
  };
}

describe('useDevtoolEntity', () => {
  let mockProbe: ReturnType<typeof createMockProbe>;
  let mockContext: ThreeLensContextValue;

  beforeEach(() => {
    mockProbe = createMockProbe();
    mockContext = {
      probe: mockProbe,
      frameStats: null,
      snapshot: null,
      selectedObject: null,
      selectObject: vi.fn(),
      clearSelection: vi.fn(),
    };
  });

  describe('without context', () => {
    it('should not throw when context is not available', () => {
      const obj = createMockObject3D();
      const wrapper = createWrapper(null);

      expect(() => {
        renderHook(() => useDevtoolEntity(obj, { name: 'Test' }), { wrapper });
      }).not.toThrow();
    });

    it('should not modify object when context is not available', () => {
      const obj = createMockObject3D();
      const wrapper = createWrapper(null);

      renderHook(() => useDevtoolEntity(obj, { name: 'Test' }), { wrapper });

      expect(obj.name).toBe('');
      expect(obj.userData.__3lens).toBeUndefined();
    });
  });

  describe('with context', () => {
    it('should set object name when provided', () => {
      const obj = createMockObject3D();
      const wrapper = createWrapper(mockContext);

      renderHook(() => useDevtoolEntity(obj, { name: 'TestEntity' }), { wrapper });

      expect(obj.name).toBe('TestEntity');
    });

    it('should not override name if already set to same value', () => {
      const obj = createMockObject3D();
      obj.name = 'TestEntity';
      const wrapper = createWrapper(mockContext);

      renderHook(() => useDevtoolEntity(obj, { name: 'TestEntity' }), { wrapper });

      expect(obj.name).toBe('TestEntity');
    });

    it('should store metadata in userData', () => {
      const obj = createMockObject3D();
      const wrapper = createWrapper(mockContext);

      renderHook(
        () =>
          useDevtoolEntity(obj, {
            name: 'Player',
            module: 'game/entities',
            metadata: { health: 100 },
            tags: ['player'],
          }),
        { wrapper }
      );

      expect(obj.userData.__3lens).toBeDefined();
      expect(obj.userData.__3lens.module).toBe('game/entities');
      expect(obj.userData.__3lens.metadata).toEqual({ health: 100 });
      expect(obj.userData.__3lens.tags).toEqual(['player']);
      expect(obj.userData.__3lens.registeredAt).toBeDefined();
    });

    it('should trigger snapshot refresh', () => {
      const obj = createMockObject3D();
      const wrapper = createWrapper(mockContext);

      renderHook(() => useDevtoolEntity(obj, { name: 'Test' }), { wrapper });

      expect(mockProbe.takeSnapshot).toHaveBeenCalled();
    });

    it('should clean up metadata on unmount', () => {
      const obj = createMockObject3D();
      const wrapper = createWrapper(mockContext);

      const { unmount } = renderHook(() => useDevtoolEntity(obj, { name: 'Test' }), { wrapper });

      expect(obj.userData.__3lens).toBeDefined();

      unmount();

      expect(obj.userData.__3lens).toBeUndefined();
    });

    it('should handle null object', () => {
      const wrapper = createWrapper(mockContext);

      expect(() => {
        renderHook(() => useDevtoolEntity(null, { name: 'Test' }), { wrapper });
      }).not.toThrow();

      expect(mockProbe.takeSnapshot).not.toHaveBeenCalled();
    });

    it('should handle undefined object', () => {
      const wrapper = createWrapper(mockContext);

      expect(() => {
        renderHook(() => useDevtoolEntity(undefined, { name: 'Test' }), { wrapper });
      }).not.toThrow();
    });

    it('should update metadata when options change', () => {
      const obj = createMockObject3D();
      const wrapper = createWrapper(mockContext);

      const { rerender } = renderHook(
        ({ metadata, tags }) => useDevtoolEntity(obj, { name: 'Test', metadata, tags }),
        {
          wrapper,
          initialProps: { metadata: { level: 1 }, tags: ['enemy'] },
        }
      );

      expect(obj.userData.__3lens.metadata).toEqual({ level: 1 });
      expect(obj.userData.__3lens.tags).toEqual(['enemy']);

      rerender({ metadata: { level: 5 }, tags: ['enemy', 'boss'] });

      expect(obj.userData.__3lens.metadata).toEqual({ level: 5 });
      expect(obj.userData.__3lens.tags).toEqual(['enemy', 'boss']);
    });

    it('should preserve existing userData', () => {
      const obj = createMockObject3D();
      obj.userData = { customData: 'keep this' };
      const wrapper = createWrapper(mockContext);

      renderHook(() => useDevtoolEntity(obj, { name: 'Test' }), { wrapper });

      expect(obj.userData.customData).toBe('keep this');
      expect(obj.userData.__3lens).toBeDefined();
    });
  });

  describe('with probe missing requestSnapshot', () => {
    it('should handle probe without requestSnapshot method', () => {
      const probeWithoutSnapshot = {
        ...createMockProbe(),
        requestSnapshot: undefined,
      };
      const context = { ...mockContext, probe: probeWithoutSnapshot };
      const wrapper = createWrapper(context);
      const obj = createMockObject3D();

      expect(() => {
        renderHook(() => useDevtoolEntity(obj, { name: 'Test' }), { wrapper });
      }).not.toThrow();
    });
  });
});

describe('useDevtoolEntityGroup', () => {
  let mockProbe: ReturnType<typeof createMockProbe>;
  let mockContext: ThreeLensContextValue;

  beforeEach(() => {
    mockProbe = createMockProbe();
    mockContext = {
      probe: mockProbe,
      frameStats: null,
      snapshot: null,
      selectedObject: null,
      selectObject: vi.fn(),
      clearSelection: vi.fn(),
    };
  });

  it('should mark all objects as part of a group', () => {
    const obj1 = createMockObject3D('uuid-1');
    const obj2 = createMockObject3D('uuid-2');
    const obj3 = createMockObject3D('uuid-3');
    const wrapper = createWrapper(mockContext);

    renderHook(
      () =>
        useDevtoolEntityGroup([obj1, obj2, obj3], {
          name: 'Vehicle',
          module: 'game/vehicles',
          tags: ['vehicle'],
        }),
      { wrapper }
    );

    expect(obj1.userData.__3lens.groupName).toBe('Vehicle');
    expect(obj2.userData.__3lens.groupName).toBe('Vehicle');
    expect(obj3.userData.__3lens.groupName).toBe('Vehicle');

    expect(obj1.userData.__3lens.groupIndex).toBe(0);
    expect(obj2.userData.__3lens.groupIndex).toBe(1);
    expect(obj3.userData.__3lens.groupIndex).toBe(2);

    expect(obj1.userData.__3lens.module).toBe('game/vehicles');
    expect(obj1.userData.__3lens.tags).toEqual(['vehicle']);
  });

  it('should generate unique group IDs', () => {
    const obj1 = createMockObject3D('uuid-1');
    const obj2 = createMockObject3D('uuid-2');
    const wrapper = createWrapper(mockContext);

    renderHook(() => useDevtoolEntityGroup([obj1], { name: 'Group1' }), { wrapper });
    renderHook(() => useDevtoolEntityGroup([obj2], { name: 'Group2' }), { wrapper });

    expect(obj1.userData.__3lens.groupId).not.toBe(obj2.userData.__3lens.groupId);
  });

  it('should filter out null and undefined objects', () => {
    const obj1 = createMockObject3D('uuid-1');
    const wrapper = createWrapper(mockContext);

    renderHook(() => useDevtoolEntityGroup([obj1, null, undefined], { name: 'Partial' }), {
      wrapper,
    });

    expect(obj1.userData.__3lens.groupName).toBe('Partial');
    expect(obj1.userData.__3lens.groupIndex).toBe(0);
  });

  it('should not throw when all objects are null', () => {
    const wrapper = createWrapper(mockContext);

    expect(() => {
      renderHook(() => useDevtoolEntityGroup([null, undefined], { name: 'Empty' }), { wrapper });
    }).not.toThrow();
  });

  it('should clean up group data on unmount', () => {
    const obj1 = createMockObject3D('uuid-1');
    const obj2 = createMockObject3D('uuid-2');
    const wrapper = createWrapper(mockContext);

    const { unmount } = renderHook(() => useDevtoolEntityGroup([obj1, obj2], { name: 'Group' }), {
      wrapper,
    });

    const groupId = obj1.userData.__3lens.groupId;
    expect(groupId).toBeDefined();

    unmount();

    expect(obj1.userData.__3lens.groupId).toBeUndefined();
    expect(obj1.userData.__3lens.groupName).toBeUndefined();
    expect(obj2.userData.__3lens.groupId).toBeUndefined();
  });

  it('should handle context not available', () => {
    const obj = createMockObject3D();
    const wrapper = createWrapper(null);

    expect(() => {
      renderHook(() => useDevtoolEntityGroup([obj], { name: 'Test' }), { wrapper });
    }).not.toThrow();

    expect(obj.userData.__3lens).toBeUndefined();
  });

  it('should use unnamed for group without name', () => {
    const obj = createMockObject3D();
    const wrapper = createWrapper(mockContext);

    renderHook(() => useDevtoolEntityGroup([obj], {}), { wrapper });

    expect(obj.userData.__3lens.groupId).toContain('unnamed');
  });
});
