/**
 * useSelectedObject Composable Test Suite
 *
 * Tests for the Vue composable that manages selection state.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref, computed, nextTick, defineComponent, h } from 'vue';
import { mount } from '@vue/test-utils';
import { ThreeLensKey } from '../types';

// Create controllable refs for testing
const selectedNodeRef = ref<any>(null);
const selectObjectMock = vi.fn();
const clearSelectionMock = vi.fn();

// Mock useThreeLens
vi.mock('./useThreeLens', () => ({
  useThreeLens: () => ({
    probe: ref(null),
    isReady: ref(true),
    frameStats: ref(null),
    snapshot: ref(null),
    selectedNode: selectedNodeRef,
    fps: computed(() => 0),
    drawCalls: computed(() => 0),
    triangles: computed(() => 0),
    frameTime: computed(() => 0),
    gpuMemory: computed(() => 0),
    isOverlayVisible: ref(false),
    selectObject: selectObjectMock,
    clearSelection: clearSelectionMock,
    toggleOverlay: vi.fn(),
    showOverlay: vi.fn(),
    hideOverlay: vi.fn(),
  }),
}));

import {
  useSelectedObject,
  UseSelectedObjectReturn,
} from './useSelectedObject';

describe('useSelectedObject', () => {
  beforeEach(() => {
    selectedNodeRef.value = null;
    selectObjectMock.mockClear();
    clearSelectionMock.mockClear();
  });

  describe('selection state', () => {
    it('should return null selectedNode when nothing selected', () => {
      const TestComponent = defineComponent({
        setup() {
          return useSelectedObject();
        },
        render() {
          return h('div');
        },
      });

      const wrapper = mount(TestComponent);
      expect(wrapper.vm.selectedNode).toBeNull();
    });

    it('should return selectedNode when object is selected', async () => {
      const mockNode = {
        uuid: 'test-uuid',
        name: 'TestMesh',
        type: 'Mesh',
      };

      const TestComponent = defineComponent({
        setup() {
          return useSelectedObject();
        },
        render() {
          return h('div');
        },
      });

      const wrapper = mount(TestComponent);

      selectedNodeRef.value = mockNode;
      await nextTick();

      expect(wrapper.vm.selectedNode).toEqual(mockNode);
    });

    it('should return selectedUuid from selected node', async () => {
      const mockNode = {
        uuid: 'my-uuid-123',
        name: 'Object',
        type: 'Group',
      };

      const TestComponent = defineComponent({
        setup() {
          return useSelectedObject();
        },
        render() {
          return h('div');
        },
      });

      const wrapper = mount(TestComponent);

      selectedNodeRef.value = mockNode;
      await nextTick();

      expect(wrapper.vm.selectedUuid).toBe('my-uuid-123');
    });

    it('should return null selectedUuid when nothing selected', () => {
      const TestComponent = defineComponent({
        setup() {
          return useSelectedObject();
        },
        render() {
          return h('div');
        },
      });

      const wrapper = mount(TestComponent);
      expect(wrapper.vm.selectedUuid).toBeNull();
    });

    it('should return selectedName from selected node', async () => {
      const mockNode = {
        uuid: 'uuid',
        name: 'MyObject',
        type: 'Mesh',
      };

      const TestComponent = defineComponent({
        setup() {
          return useSelectedObject();
        },
        render() {
          return h('div');
        },
      });

      const wrapper = mount(TestComponent);

      selectedNodeRef.value = mockNode;
      await nextTick();

      expect(wrapper.vm.selectedName).toBe('MyObject');
    });

    it('should return selectedType from selected node', async () => {
      const mockNode = {
        uuid: 'uuid',
        name: 'Obj',
        type: 'SkinnedMesh',
      };

      const TestComponent = defineComponent({
        setup() {
          return useSelectedObject();
        },
        render() {
          return h('div');
        },
      });

      const wrapper = mount(TestComponent);

      selectedNodeRef.value = mockNode;
      await nextTick();

      expect(wrapper.vm.selectedType).toBe('SkinnedMesh');
    });
  });

  describe('hasSelection computed', () => {
    it('should return false when nothing selected', () => {
      const TestComponent = defineComponent({
        setup() {
          return useSelectedObject();
        },
        render() {
          return h('div');
        },
      });

      const wrapper = mount(TestComponent);
      expect(wrapper.vm.hasSelection).toBe(false);
    });

    it('should return true when something is selected', async () => {
      const mockNode = {
        uuid: 'uuid',
        name: 'Obj',
        type: 'Mesh',
      };

      const TestComponent = defineComponent({
        setup() {
          return useSelectedObject();
        },
        render() {
          return h('div');
        },
      });

      const wrapper = mount(TestComponent);

      selectedNodeRef.value = mockNode;
      await nextTick();

      expect(wrapper.vm.hasSelection).toBe(true);
    });
  });

  describe('actions', () => {
    it('should call selectObject with uuid', () => {
      const TestComponent = defineComponent({
        setup() {
          return useSelectedObject();
        },
        render() {
          return h('div');
        },
      });

      const wrapper = mount(TestComponent);
      wrapper.vm.select('target-uuid');

      expect(selectObjectMock).toHaveBeenCalledWith('target-uuid');
    });

    it('should call clearSelection', () => {
      const TestComponent = defineComponent({
        setup() {
          return useSelectedObject();
        },
        render() {
          return h('div');
        },
      });

      const wrapper = mount(TestComponent);
      wrapper.vm.clear();

      expect(clearSelectionMock).toHaveBeenCalled();
    });
  });

  describe('isSelected helper', () => {
    it('should return false when nothing selected', () => {
      const TestComponent = defineComponent({
        setup() {
          return useSelectedObject();
        },
        render() {
          return h('div');
        },
      });

      const wrapper = mount(TestComponent);
      expect(wrapper.vm.isSelected('any-uuid')).toBe(false);
    });

    it('should return true when uuid matches selected', async () => {
      const mockNode = {
        uuid: 'selected-uuid',
        name: 'Obj',
        type: 'Mesh',
      };

      const TestComponent = defineComponent({
        setup() {
          return useSelectedObject();
        },
        render() {
          return h('div');
        },
      });

      const wrapper = mount(TestComponent);

      selectedNodeRef.value = mockNode;
      await nextTick();

      expect(wrapper.vm.isSelected('selected-uuid')).toBe(true);
    });

    it('should return false when uuid does not match', async () => {
      const mockNode = {
        uuid: 'selected-uuid',
        name: 'Obj',
        type: 'Mesh',
      };

      const TestComponent = defineComponent({
        setup() {
          return useSelectedObject();
        },
        render() {
          return h('div');
        },
      });

      const wrapper = mount(TestComponent);

      selectedNodeRef.value = mockNode;
      await nextTick();

      expect(wrapper.vm.isSelected('different-uuid')).toBe(false);
    });
  });

  describe('reactive updates', () => {
    it('should update when selection changes', async () => {
      const node1 = {
        uuid: 'uuid-1',
        name: 'First',
        type: 'Mesh',
      };
      const node2 = {
        uuid: 'uuid-2',
        name: 'Second',
        type: 'Group',
      };

      const TestComponent = defineComponent({
        setup() {
          return useSelectedObject();
        },
        render() {
          return h('div');
        },
      });

      const wrapper = mount(TestComponent);

      // Select first node
      selectedNodeRef.value = node1;
      await nextTick();
      expect(wrapper.vm.selectedUuid).toBe('uuid-1');
      expect(wrapper.vm.selectedName).toBe('First');

      // Change selection
      selectedNodeRef.value = node2;
      await nextTick();
      expect(wrapper.vm.selectedUuid).toBe('uuid-2');
      expect(wrapper.vm.selectedName).toBe('Second');

      // Clear selection
      selectedNodeRef.value = null;
      await nextTick();
      expect(wrapper.vm.selectedUuid).toBeNull();
      expect(wrapper.vm.hasSelection).toBe(false);
    });
  });
});
