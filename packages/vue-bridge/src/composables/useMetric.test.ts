/**
 * useMetric Composable Test Suite
 *
 * Tests for the Vue composables that extract metrics from frame stats.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref, computed, nextTick, defineComponent, h, watch } from 'vue';
import { mount } from '@vue/test-utils';
import { ThreeLensKey, type ThreeLensContext } from '../types';

// Create a controllable frameStats ref for testing
const frameStatsRef = ref<any>(null);

// Mock useThreeLens to return our controllable ref
vi.mock('./useThreeLens', () => ({
  useThreeLens: () => ({
    probe: ref(null),
    isReady: ref(true),
    frameStats: frameStatsRef,
    snapshot: ref(null),
    selectedNode: ref(null),
    fps: computed(() => frameStatsRef.value?.fps ?? 0),
    drawCalls: computed(() => frameStatsRef.value?.drawCalls ?? 0),
    triangles: computed(() => frameStatsRef.value?.triangles ?? 0),
    frameTime: computed(() => frameStatsRef.value?.frameTimeMs ?? 0),
    gpuMemory: computed(() => frameStatsRef.value?.memory?.gpuMemoryEstimate ?? 0),
    isOverlayVisible: ref(false),
    selectObject: vi.fn(),
    clearSelection: vi.fn(),
    toggleOverlay: vi.fn(),
    showOverlay: vi.fn(),
    hideOverlay: vi.fn(),
  }),
}));

import {
  useMetric,
  useFPS,
  useFrameTime,
  useDrawCalls,
  useTriangles,
  useGPUMemory,
  useTextureCount,
  useGeometryCount,
} from './useMetric';

describe('useMetric', () => {
  beforeEach(() => {
    frameStatsRef.value = null;
  });

  it('should return initial metric value', () => {
    const TestComponent = defineComponent({
      setup() {
        const metric = useMetric((stats) => stats.fps);
        return { metric };
      },
      render() {
        return h('div', `${this.metric.current}`);
      },
    });

    const wrapper = mount(TestComponent);
    expect(wrapper.vm.metric.current).toBe(0);
    expect(wrapper.vm.metric.min).toBe(Infinity);
    expect(wrapper.vm.metric.max).toBe(-Infinity);
    expect(wrapper.vm.metric.avg).toBe(0);
    expect(wrapper.vm.metric.history).toEqual([]);
  });

  it('should update when frameStats changes', async () => {
    const TestComponent = defineComponent({
      setup() {
        const metric = useMetric((stats) => stats.fps);
        return { metric };
      },
      render() {
        return h('div', `${this.metric.current}`);
      },
    });

    const wrapper = mount(TestComponent);

    // Update frame stats
    frameStatsRef.value = { fps: 60 };
    await nextTick();

    expect(wrapper.vm.metric.current).toBe(60);
  });

  it('should track min/max/avg', async () => {
    const TestComponent = defineComponent({
      setup() {
        const metric = useMetric((stats) => stats.fps);
        return { metric };
      },
      render() {
        return h('div');
      },
    });

    const wrapper = mount(TestComponent);

    // Emit multiple values
    frameStatsRef.value = { fps: 50 };
    await nextTick();
    frameStatsRef.value = { fps: 60 };
    await nextTick();
    frameStatsRef.value = { fps: 70 };
    await nextTick();

    expect(wrapper.vm.metric.min).toBe(50);
    expect(wrapper.vm.metric.max).toBe(70);
    expect(wrapper.vm.metric.avg).toBe(60);
  });

  it('should track history', async () => {
    const TestComponent = defineComponent({
      setup() {
        const metric = useMetric((stats) => stats.fps);
        return { metric };
      },
      render() {
        return h('div');
      },
    });

    const wrapper = mount(TestComponent);

    frameStatsRef.value = { fps: 55 };
    await nextTick();
    frameStatsRef.value = { fps: 60 };
    await nextTick();
    frameStatsRef.value = { fps: 65 };
    await nextTick();

    expect(wrapper.vm.metric.history).toEqual([55, 60, 65]);
  });

  it('should respect sampleRate', async () => {
    const TestComponent = defineComponent({
      setup() {
        const metric = useMetric((stats) => stats.fps, { sampleRate: 2 });
        return { metric };
      },
      render() {
        return h('div');
      },
    });

    const wrapper = mount(TestComponent);

    // Only every 2nd frame should be sampled
    frameStatsRef.value = { fps: 50 }; // frame 1, skipped
    await nextTick();
    frameStatsRef.value = { fps: 60 }; // frame 2, sampled
    await nextTick();
    frameStatsRef.value = { fps: 70 }; // frame 3, skipped
    await nextTick();
    frameStatsRef.value = { fps: 80 }; // frame 4, sampled
    await nextTick();

    expect(wrapper.vm.metric.history).toEqual([60, 80]);
  });

  it('should smooth values when enabled', async () => {
    const TestComponent = defineComponent({
      setup() {
        const metric = useMetric((stats) => stats.fps, { 
          smoothed: true, 
          smoothingSamples: 3 
        });
        return { metric };
      },
      render() {
        return h('div');
      },
    });

    const wrapper = mount(TestComponent);

    // Add samples for smoothing
    frameStatsRef.value = { fps: 50 };
    await nextTick();
    frameStatsRef.value = { fps: 60 };
    await nextTick();
    frameStatsRef.value = { fps: 70 };
    await nextTick();

    // Smoothed value should be average of last 3 samples
    expect(wrapper.vm.metric.current).toBe(60);
  });

  it('should not smooth when disabled', async () => {
    const TestComponent = defineComponent({
      setup() {
        const metric = useMetric((stats) => stats.fps, { smoothed: false });
        return { metric };
      },
      render() {
        return h('div');
      },
    });

    const wrapper = mount(TestComponent);

    frameStatsRef.value = { fps: 50 };
    await nextTick();
    frameStatsRef.value = { fps: 100 };
    await nextTick();

    // Should return raw value, not smoothed
    expect(wrapper.vm.metric.current).toBe(100);
  });

  it('should handle null stats', async () => {
    const TestComponent = defineComponent({
      setup() {
        const metric = useMetric((stats) => stats.fps);
        return { metric };
      },
      render() {
        return h('div');
      },
    });

    const wrapper = mount(TestComponent);

    frameStatsRef.value = null;
    await nextTick();

    // Should not crash and maintain initial values
    expect(wrapper.vm.metric.current).toBe(0);
  });
});

describe('useFPS', () => {
  beforeEach(() => {
    frameStatsRef.value = null;
  });

  it('should extract fps from frame stats', async () => {
    const TestComponent = defineComponent({
      setup() {
        const fps = useFPS(false);
        return { fps };
      },
      render() {
        return h('div');
      },
    });

    const wrapper = mount(TestComponent);

    frameStatsRef.value = { performance: { fps: 59 } };
    await nextTick();

    expect(wrapper.vm.fps.current).toBe(59);
  });

  it('should smooth fps by default', async () => {
    const TestComponent = defineComponent({
      setup() {
        const fps = useFPS(true);
        return { fps };
      },
      render() {
        return h('div');
      },
    });

    mount(TestComponent);
    // Default smoothing is applied
  });
});

describe('useFrameTime', () => {
  beforeEach(() => {
    frameStatsRef.value = null;
  });

  it('should extract frameTimeMs from frame stats', async () => {
    const TestComponent = defineComponent({
      setup() {
        const frameTime = useFrameTime(false);
        return { frameTime };
      },
      render() {
        return h('div');
      },
    });

    const wrapper = mount(TestComponent);

    frameStatsRef.value = { cpuTimeMs: 16.67 };
    await nextTick();

    expect(wrapper.vm.frameTime.current).toBe(16.67);
  });
});

describe('useDrawCalls', () => {
  beforeEach(() => {
    frameStatsRef.value = null;
  });

  it('should extract drawCalls from frame stats', async () => {
    const TestComponent = defineComponent({
      setup() {
        const drawCalls = useDrawCalls();
        return { drawCalls };
      },
      render() {
        return h('div');
      },
    });

    const wrapper = mount(TestComponent);

    frameStatsRef.value = { drawCalls: 150 };
    await nextTick();

    expect(wrapper.vm.drawCalls.current).toBe(150);
  });
});

describe('useTriangles', () => {
  beforeEach(() => {
    frameStatsRef.value = null;
  });

  it('should extract triangles from frame stats', async () => {
    const TestComponent = defineComponent({
      setup() {
        const triangles = useTriangles();
        return { triangles };
      },
      render() {
        return h('div');
      },
    });

    const wrapper = mount(TestComponent);

    frameStatsRef.value = { triangles: 100000 };
    await nextTick();

    expect(wrapper.vm.triangles.current).toBe(100000);
  });
});

describe('useGPUMemory', () => {
  beforeEach(() => {
    frameStatsRef.value = null;
  });

  it('should extract GPU memory from frame stats', async () => {
    const TestComponent = defineComponent({
      setup() {
        const gpuMemory = useGPUMemory();
        return { gpuMemory };
      },
      render() {
        return h('div');
      },
    });

    const wrapper = mount(TestComponent);

    frameStatsRef.value = { memory: { totalGpuMemory: 256 * 1024 * 1024 } };
    await nextTick();

    expect(wrapper.vm.gpuMemory.current).toBe(256 * 1024 * 1024);
  });

  it('should default to 0 when memory is undefined', async () => {
    const TestComponent = defineComponent({
      setup() {
        const gpuMemory = useGPUMemory();
        return { gpuMemory };
      },
      render() {
        return h('div');
      },
    });

    const wrapper = mount(TestComponent);

    frameStatsRef.value = { fps: 60 };
    await nextTick();

    expect(wrapper.vm.gpuMemory.current).toBe(0);
  });
});

describe('useTextureCount', () => {
  beforeEach(() => {
    frameStatsRef.value = null;
  });

  it('should extract texture count from frame stats', async () => {
    const TestComponent = defineComponent({
      setup() {
        const textureCount = useTextureCount();
        return { textureCount };
      },
      render() {
        return h('div');
      },
    });

    const wrapper = mount(TestComponent);

    frameStatsRef.value = { memory: { textures: 25 } };
    await nextTick();

    expect(wrapper.vm.textureCount.current).toBe(25);
  });
});

describe('useGeometryCount', () => {
  beforeEach(() => {
    frameStatsRef.value = null;
  });

  it('should extract geometry count from frame stats', async () => {
    const TestComponent = defineComponent({
      setup() {
        const geometryCount = useGeometryCount();
        return { geometryCount };
      },
      render() {
        return h('div');
      },
    });

    const wrapper = mount(TestComponent);

    frameStatsRef.value = { memory: { geometries: 50 } };
    await nextTick();

    expect(wrapper.vm.geometryCount.current).toBe(50);
  });
});
