/**
 * useDevtoolEntity Composable Test Suite
 *
 * Tests for the Vue composables that register Three.js objects as named entities.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref, computed, defineComponent, h, nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import { useDevtoolEntity, useDevtoolEntityGroup } from './useDevtoolEntity';
import { ThreeLensKey, type ThreeLensContext } from '../types';

// Mock Three.js Object3D
function createMockObject3D(
  options: { name?: string; uuid?: string; userData?: any } = {}
) {
  return {
    name: options.name || '',
    uuid: options.uuid || `uuid-${Math.random().toString(36).slice(2)}`,
    userData: options.userData || {},
  } as any;
}

// Helper to create a test context
function createTestContext(
  overrides: Partial<ThreeLensContext> = {}
): ThreeLensContext {
  const mockProbe = {
    takeSnapshot: vi.fn(),
  };

  return {
    probe: ref(mockProbe as any),
    isReady: ref(true),
    frameStats: ref(null),
    snapshot: ref(null),
    selectedNode: ref(null),
    fps: computed(() => 60),
    drawCalls: computed(() => 100),
    triangles: computed(() => 50000),
    frameTime: computed(() => 16.67),
    gpuMemory: computed(() => 128),
    isOverlayVisible: ref(false),
    selectObject: vi.fn(),
    clearSelection: vi.fn(),
    toggleOverlay: vi.fn(),
    showOverlay: vi.fn(),
    hideOverlay: vi.fn(),
    ...overrides,
  };
}

describe('useDevtoolEntity', () => {
  describe('without context', () => {
    it('should not throw when context is not available', () => {
      const mockObject = createMockObject3D();

      const TestComponent = defineComponent({
        setup() {
          useDevtoolEntity(mockObject, { name: 'Test' });
          return () => h('div', 'rendered');
        },
      });

      const wrapper = mount(TestComponent);
      expect(wrapper.text()).toBe('rendered');
    });

    it('should not modify object when context is not available', () => {
      const mockObject = createMockObject3D();

      const TestComponent = defineComponent({
        setup() {
          useDevtoolEntity(mockObject, { name: 'Test' });
          return () => h('div');
        },
      });

      mount(TestComponent);
      expect(mockObject.name).toBe('');
      expect(mockObject.userData.__3lens).toBeUndefined();
    });
  });

  describe('with context', () => {
    it('should set object name when provided', async () => {
      const mockContext = createTestContext();
      const mockObject = createMockObject3D();

      const TestComponent = defineComponent({
        setup() {
          useDevtoolEntity(mockObject, { name: 'Player' });
          return () => h('div');
        },
      });

      mount(TestComponent, {
        global: {
          provide: { [ThreeLensKey as symbol]: mockContext },
        },
      });

      expect(mockObject.name).toBe('Player');
    });

    it('should store metadata in userData', async () => {
      const mockContext = createTestContext();
      const mockObject = createMockObject3D();

      const TestComponent = defineComponent({
        setup() {
          useDevtoolEntity(mockObject, {
            name: 'Enemy',
            module: 'game/entities',
            metadata: { health: 100 },
            tags: ['enemy', 'npc'],
          });
          return () => h('div');
        },
      });

      mount(TestComponent, {
        global: {
          provide: { [ThreeLensKey as symbol]: mockContext },
        },
      });

      expect(mockObject.userData.__3lens).toBeDefined();
      expect(mockObject.userData.__3lens.module).toBe('game/entities');
      expect(mockObject.userData.__3lens.metadata).toEqual({ health: 100 });
      expect(mockObject.userData.__3lens.tags).toEqual(['enemy', 'npc']);
    });

    it('should trigger snapshot refresh', async () => {
      const mockContext = createTestContext();
      const mockObject = createMockObject3D();

      const TestComponent = defineComponent({
        setup() {
          useDevtoolEntity(mockObject, { name: 'Test' });
          return () => h('div');
        },
      });

      mount(TestComponent, {
        global: {
          provide: { [ThreeLensKey as symbol]: mockContext },
        },
      });

      expect(mockContext.probe.value?.takeSnapshot).toHaveBeenCalled();
    });

    it('should handle null object', () => {
      const mockContext = createTestContext();

      const TestComponent = defineComponent({
        setup() {
          useDevtoolEntity(null, { name: 'Test' });
          return () => h('div', 'rendered');
        },
      });

      const wrapper = mount(TestComponent, {
        global: {
          provide: { [ThreeLensKey as symbol]: mockContext },
        },
      });

      expect(wrapper.text()).toBe('rendered');
    });

    it('should work with ref objects', async () => {
      const mockContext = createTestContext();
      const objectRef = ref<any>(null);

      const TestComponent = defineComponent({
        setup() {
          useDevtoolEntity(objectRef, { name: 'RefObject' });
          return () => h('div');
        },
      });

      mount(TestComponent, {
        global: {
          provide: { [ThreeLensKey as symbol]: mockContext },
        },
      });

      // Initially null, no name set
      expect(mockContext.probe.value?.takeSnapshot).not.toHaveBeenCalled();

      // Set the object
      objectRef.value = createMockObject3D();
      await nextTick();

      expect(objectRef.value.name).toBe('RefObject');
      expect(mockContext.probe.value?.takeSnapshot).toHaveBeenCalled();
    });

    it('should preserve existing userData', () => {
      const mockContext = createTestContext();
      const mockObject = createMockObject3D({
        userData: { existingKey: 'existingValue' },
      });

      const TestComponent = defineComponent({
        setup() {
          useDevtoolEntity(mockObject, { name: 'Test' });
          return () => h('div');
        },
      });

      mount(TestComponent, {
        global: {
          provide: { [ThreeLensKey as symbol]: mockContext },
        },
      });

      expect(mockObject.userData.existingKey).toBe('existingValue');
      expect(mockObject.userData.__3lens).toBeDefined();
    });

    it('should clean up metadata on unmount', async () => {
      const mockContext = createTestContext();
      const mockObject = createMockObject3D();

      const TestComponent = defineComponent({
        setup() {
          useDevtoolEntity(mockObject, { name: 'Test' });
          return () => h('div');
        },
      });

      const wrapper = mount(TestComponent, {
        global: {
          provide: { [ThreeLensKey as symbol]: mockContext },
        },
      });

      expect(mockObject.userData.__3lens).toBeDefined();

      wrapper.unmount();

      expect(mockObject.userData.__3lens).toBeUndefined();
    });
  });
});

describe('useDevtoolEntityGroup', () => {
  it('should mark all objects as part of a group', () => {
    const mockContext = createTestContext();
    const objects = [
      createMockObject3D(),
      createMockObject3D(),
      createMockObject3D(),
    ];

    const TestComponent = defineComponent({
      setup() {
        useDevtoolEntityGroup(objects, { name: 'TestGroup' });
        return () => h('div');
      },
    });

    mount(TestComponent, {
      global: {
        provide: { [ThreeLensKey as symbol]: mockContext },
      },
    });

    objects.forEach((obj) => {
      expect(obj.userData.__3lens).toBeDefined();
      expect(obj.userData.__3lens.groupName).toBe('TestGroup');
    });
  });

  it('should filter out null and undefined objects', () => {
    const mockContext = createTestContext();
    const validObject = createMockObject3D();
    const objects = [validObject, null, undefined] as any[];

    const TestComponent = defineComponent({
      setup() {
        useDevtoolEntityGroup(objects, { name: 'TestGroup' });
        return () => h('div', 'rendered');
      },
    });

    const wrapper = mount(TestComponent, {
      global: {
        provide: { [ThreeLensKey as symbol]: mockContext },
      },
    });

    expect(wrapper.text()).toBe('rendered');
    expect(validObject.userData.__3lens).toBeDefined();
  });

  it('should handle context not available', () => {
    const objects = [createMockObject3D()];

    const TestComponent = defineComponent({
      setup() {
        useDevtoolEntityGroup(objects, { name: 'TestGroup' });
        return () => h('div', 'success');
      },
    });

    const wrapper = mount(TestComponent);
    expect(wrapper.text()).toBe('success');
  });

  it('should set index in userData for each group member', () => {
    const mockContext = createTestContext();
    const objects = [createMockObject3D(), createMockObject3D()];

    const TestComponent = defineComponent({
      setup() {
        useDevtoolEntityGroup(objects, { name: 'IndexedGroup' });
        return () => h('div');
      },
    });

    mount(TestComponent, {
      global: {
        provide: { [ThreeLensKey as symbol]: mockContext },
      },
    });

    expect(objects[0].userData.__3lens.groupIndex).toBe(0);
    expect(objects[1].userData.__3lens.groupIndex).toBe(1);
  });
});
