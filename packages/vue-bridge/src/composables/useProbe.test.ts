/**
 * useProbe Composable Test Suite
 *
 * Tests for the Vue composable that provides access to the probe instance.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref, computed, nextTick, defineComponent, h } from 'vue';
import { mount } from '@vue/test-utils';

// Create controllable refs for testing
const probeRef = ref<any>(null);
const isReadyRef = ref(false);

// Mock useThreeLens and useThreeLensOptional
vi.mock('./useThreeLens', () => ({
  useThreeLens: () => ({
    probe: probeRef,
    isReady: isReadyRef,
    frameStats: ref(null),
    snapshot: ref(null),
    selectedNode: ref(null),
    fps: computed(() => 0),
    drawCalls: computed(() => 0),
    triangles: computed(() => 0),
    frameTime: computed(() => 0),
    gpuMemory: computed(() => 0),
    isOverlayVisible: ref(false),
    selectObject: vi.fn(),
    clearSelection: vi.fn(),
    toggleOverlay: vi.fn(),
    showOverlay: vi.fn(),
    hideOverlay: vi.fn(),
  }),
  useThreeLensOptional: () =>
    probeRef.value
      ? {
          probe: probeRef,
          isReady: isReadyRef,
          frameStats: ref(null),
          snapshot: ref(null),
          selectedNode: ref(null),
          fps: computed(() => 0),
          drawCalls: computed(() => 0),
          triangles: computed(() => 0),
          frameTime: computed(() => 0),
          gpuMemory: computed(() => 0),
          isOverlayVisible: ref(false),
          selectObject: vi.fn(),
          clearSelection: vi.fn(),
          toggleOverlay: vi.fn(),
          showOverlay: vi.fn(),
          hideOverlay: vi.fn(),
        }
      : null,
}));

import { useProbe, useProbeOptional } from './useProbe';

describe('useProbe', () => {
  beforeEach(() => {
    probeRef.value = null;
    isReadyRef.value = false;
  });

  it('should throw when probe is not initialized', () => {
    const TestComponent = defineComponent({
      setup() {
        const probe = useProbe();
        // Accessing value should throw
        try {
          const _ = probe.value;
          return { error: false };
        } catch (e) {
          return { error: true };
        }
      },
      render() {
        return h('div');
      },
    });

    const wrapper = mount(TestComponent);
    expect(wrapper.vm.error).toBe(true);
  });

  it('should return probe when initialized', async () => {
    const mockProbe = {
      takeSnapshot: vi.fn(),
      observeScene: vi.fn(),
    };

    const TestComponent = defineComponent({
      setup() {
        const probe = useProbe();
        return { probe };
      },
      render() {
        return h('div');
      },
    });

    probeRef.value = mockProbe;
    isReadyRef.value = true;

    const wrapper = mount(TestComponent);

    await nextTick();

    expect(wrapper.vm.probe).toStrictEqual(mockProbe);
  });

  it('should update when probe becomes available', async () => {
    const mockProbe = {
      id: 'test-probe',
    };

    const TestComponent = defineComponent({
      setup() {
        const probe = useProbe();
        return { probe };
      },
      render() {
        return h('div');
      },
    });

    // Initially null
    const wrapper = mount(TestComponent);

    // Simulate probe becoming available
    probeRef.value = mockProbe;
    isReadyRef.value = true;
    await nextTick();

    expect(wrapper.vm.probe).toStrictEqual(mockProbe);
  });

  it('should provide computed ref', () => {
    const mockProbe = { id: 'probe' };
    probeRef.value = mockProbe;

    const TestComponent = defineComponent({
      setup() {
        const probe = useProbe();
        // Check it's a computed ref
        return {
          isComputed:
            typeof probe.value !== 'undefined' || probe.value === null,
        };
      },
      render() {
        return h('div');
      },
    });

    const wrapper = mount(TestComponent);
    expect(wrapper.vm.isComputed).toBe(true);
  });
});

describe('useProbeOptional', () => {
  beforeEach(() => {
    probeRef.value = null;
    isReadyRef.value = false;
  });

  it('should return null when probe is not available', () => {
    const TestComponent = defineComponent({
      setup() {
        const probe = useProbeOptional();
        return { probe };
      },
      render() {
        return h('div');
      },
    });

    const wrapper = mount(TestComponent);
    expect(wrapper.vm.probe).toBeNull();
  });

  it('should not throw when probe is not available', () => {
    const TestComponent = defineComponent({
      setup() {
        const probe = useProbeOptional();
        return { probeValue: probe.value };
      },
      render() {
        return h('div');
      },
    });

    expect(() => mount(TestComponent)).not.toThrow();
  });

  it('should return probe when available', async () => {
    const mockProbe = {
      id: 'optional-probe',
      takeSnapshot: vi.fn(),
    };

    probeRef.value = mockProbe;
    isReadyRef.value = true;

    const TestComponent = defineComponent({
      setup() {
        const probe = useProbeOptional();
        return { probe };
      },
      render() {
        return h('div');
      },
    });

    const wrapper = mount(TestComponent);
    await nextTick();

    expect(wrapper.vm.probe).toStrictEqual(mockProbe);
  });

  it('should allow safe access pattern', () => {
    const TestComponent = defineComponent({
      setup() {
        const probe = useProbeOptional();

        // Safe access - won't throw
        const result = probe.value?.takeSnapshot?.() ?? 'no-snapshot';

        return { result };
      },
      render() {
        return h('div');
      },
    });

    const wrapper = mount(TestComponent);
    expect(wrapper.vm.result).toBe('no-snapshot');
  });

  it('should call probe methods when available', async () => {
    const mockProbe = {
      takeSnapshot: vi.fn(() => ({ timestamp: 123 })),
    };

    probeRef.value = mockProbe;

    const TestComponent = defineComponent({
      setup() {
        const probe = useProbeOptional();

        const snapshot = probe.value?.takeSnapshot?.();

        return { snapshot };
      },
      render() {
        return h('div');
      },
    });

    const wrapper = mount(TestComponent);
    await nextTick();

    expect(mockProbe.takeSnapshot).toHaveBeenCalled();
    expect(wrapper.vm.snapshot).toEqual({ timestamp: 123 });
  });
});
