/**
 * TresJS Integration Test Suite
 *
 * Tests for the TresJS integration composables.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref, computed, nextTick, defineComponent, h, onMounted } from 'vue';
import { mount } from '@vue/test-utils';

// Create controllable refs for testing
const probeRef = ref<any>(null);
const isReadyRef = ref(false);

const mockProbe = {
  observeRenderer: vi.fn(),
  observeScene: vi.fn(),
  initializeTransformGizmo: vi.fn(),
  initializeCameraController: vi.fn(),
  config: { debug: false },
};

// Mock useThreeLensOptional
vi.mock('../composables/useThreeLens', () => ({
  useThreeLensOptional: () => probeRef.value ? {
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
  } : null,
}));

import { useTresProbe, createTresConnector, TresProbeOptions, UseTresProbeReturn } from './useTresProbe';

// Mock THREE objects
const mockRenderer = {
  domElement: document.createElement('canvas'),
  info: { render: { calls: 0 } },
};

const mockScene = {
  children: [],
  traverse: vi.fn(),
  constructor: class {},
};

const mockCamera = {
  position: { x: 0, y: 0, z: 5 },
};

describe('useTresProbe', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    probeRef.value = null;
    isReadyRef.value = false;
  });

  describe('initialization', () => {
    it('should return isConnected as false initially', () => {
      const TestComponent = defineComponent({
        setup() {
          const result = useTresProbe();
          return result;
        },
        render() {
          return h('div');
        },
      });

      const wrapper = mount(TestComponent);
      expect(wrapper.vm.isConnected).toBe(false);
    });

    it('should return connect and disconnect functions', () => {
      const TestComponent = defineComponent({
        setup() {
          const result = useTresProbe();
          return {
            hasConnect: typeof result.connect === 'function',
            hasDisconnect: typeof result.disconnect === 'function',
          };
        },
        render() {
          return h('div');
        },
      });

      const wrapper = mount(TestComponent);
      expect(wrapper.vm.hasConnect).toBe(true);
      expect(wrapper.vm.hasDisconnect).toBe(true);
    });

    it('should accept options', () => {
      const TestComponent = defineComponent({
        setup() {
          const result = useTresProbe({ autoConnect: false });
          return result;
        },
        render() {
          return h('div');
        },
      });

      expect(() => mount(TestComponent)).not.toThrow();
    });
  });

  describe('connect', () => {
    it('should not connect without probe', () => {
      const TestComponent = defineComponent({
        setup() {
          const result = useTresProbe();
          
          // Try to connect without probe
          result.connect(
            mockRenderer as any,
            mockScene as any,
            mockCamera as any
          );
          
          return result;
        },
        render() {
          return h('div');
        },
      });

      const wrapper = mount(TestComponent);
      expect(wrapper.vm.isConnected).toBe(false);
    });

    it('should connect when probe is available', async () => {
      probeRef.value = mockProbe;
      isReadyRef.value = true;

      const TestComponent = defineComponent({
        setup() {
          const result = useTresProbe();
          
          // Connect with probe available
          result.connect(
            mockRenderer as any,
            mockScene as any,
            mockCamera as any
          );
          
          return result;
        },
        render() {
          return h('div');
        },
      });

      const wrapper = mount(TestComponent);
      await nextTick();

      expect(wrapper.vm.isConnected).toBe(true);
      expect(mockProbe.observeRenderer).toHaveBeenCalledWith(mockRenderer);
      expect(mockProbe.observeScene).toHaveBeenCalledWith(mockScene);
    });

    it('should not connect twice', async () => {
      probeRef.value = mockProbe;
      isReadyRef.value = true;

      const TestComponent = defineComponent({
        setup() {
          const result = useTresProbe();
          
          // Connect twice
          result.connect(mockRenderer as any, mockScene as any, mockCamera as any);
          result.connect(mockRenderer as any, mockScene as any, mockCamera as any);
          
          return result;
        },
        render() {
          return h('div');
        },
      });

      mount(TestComponent);
      await nextTick();

      // Should only call observe methods once
      expect(mockProbe.observeRenderer).toHaveBeenCalledTimes(1);
      expect(mockProbe.observeScene).toHaveBeenCalledTimes(1);
    });
  });

  describe('disconnect', () => {
    it('should disconnect', async () => {
      probeRef.value = mockProbe;
      isReadyRef.value = true;

      const TestComponent = defineComponent({
        setup() {
          const result = useTresProbe();
          
          result.connect(mockRenderer as any, mockScene as any, mockCamera as any);
          result.disconnect();
          
          return result;
        },
        render() {
          return h('div');
        },
      });

      const wrapper = mount(TestComponent);
      await nextTick();

      expect(wrapper.vm.isConnected).toBe(false);
    });

    it('should allow reconnection after disconnect', async () => {
      probeRef.value = mockProbe;
      isReadyRef.value = true;

      const TestComponent = defineComponent({
        setup() {
          const result = useTresProbe();
          
          result.connect(mockRenderer as any, mockScene as any, mockCamera as any);
          result.disconnect();
          result.connect(mockRenderer as any, mockScene as any, mockCamera as any);
          
          return result;
        },
        render() {
          return h('div');
        },
      });

      const wrapper = mount(TestComponent);
      await nextTick();

      expect(wrapper.vm.isConnected).toBe(true);
    });
  });

  describe('unmount cleanup', () => {
    it('should disconnect on unmount', async () => {
      probeRef.value = mockProbe;
      isReadyRef.value = true;

      let tresResult: UseTresProbeReturn;

      const TestComponent = defineComponent({
        setup() {
          tresResult = useTresProbe();
          tresResult.connect(mockRenderer as any, mockScene as any, mockCamera as any);
          return tresResult;
        },
        render() {
          return h('div');
        },
      });

      const wrapper = mount(TestComponent);
      await nextTick();

      expect(wrapper.vm.isConnected).toBe(true);

      wrapper.unmount();

      expect(tresResult!.isConnected.value).toBe(false);
    });
  });
});

describe('createTresConnector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    probeRef.value = null;
    isReadyRef.value = false;
  });

  it('should create a composable factory function', () => {
    const mockUseTres = vi.fn(() => ({
      renderer: { value: mockRenderer },
      scene: mockScene,
      camera: { value: mockCamera },
    }));

    const useConnector = createTresConnector(mockUseTres);
    expect(typeof useConnector).toBe('function');
  });

  it('should return UseTresProbeReturn when called', () => {
    probeRef.value = mockProbe;
    isReadyRef.value = true;

    const mockUseTres = vi.fn(() => ({
      renderer: { value: mockRenderer },
      scene: mockScene,
      camera: { value: mockCamera },
    }));

    const useConnector = createTresConnector(mockUseTres);

    const TestComponent = defineComponent({
      setup() {
        const result = useConnector();
        return {
          hasIsConnected: 'isConnected' in result,
          hasConnect: 'connect' in result,
          hasDisconnect: 'disconnect' in result,
        };
      },
      render() {
        return h('div');
      },
    });

    const wrapper = mount(TestComponent);
    expect(wrapper.vm.hasIsConnected).toBe(true);
    expect(wrapper.vm.hasConnect).toBe(true);
    expect(wrapper.vm.hasDisconnect).toBe(true);
  });

  it('should auto-connect when useTres returns valid state', async () => {
    probeRef.value = mockProbe;
    isReadyRef.value = true;

    const mockUseTres = vi.fn(() => ({
      renderer: { value: mockRenderer },
      scene: mockScene,
      camera: { value: mockCamera },
    }));

    const useConnector = createTresConnector(mockUseTres);

    const TestComponent = defineComponent({
      setup() {
        const result = useConnector();
        return result;
      },
      render() {
        return h('div');
      },
    });

    const wrapper = mount(TestComponent);
    await nextTick();

    // Should have called useTres
    expect(mockUseTres).toHaveBeenCalled();
  });

  it('should handle useTres throwing error gracefully', async () => {
    probeRef.value = mockProbe;
    isReadyRef.value = true;

    const mockUseTres = vi.fn(() => {
      throw new Error('Not inside TresCanvas');
    });

    const useConnector = createTresConnector(mockUseTres);

    const TestComponent = defineComponent({
      setup() {
        const result = useConnector();
        return result;
      },
      render() {
        return h('div');
      },
    });

    // Should not throw
    expect(() => mount(TestComponent)).not.toThrow();
  });

  it('should handle missing renderer gracefully', async () => {
    probeRef.value = mockProbe;
    isReadyRef.value = true;

    const mockUseTres = vi.fn(() => ({
      renderer: { value: null },
      scene: mockScene,
      camera: { value: mockCamera },
    }));

    const useConnector = createTresConnector(mockUseTres);

    const TestComponent = defineComponent({
      setup() {
        const result = useConnector();
        return result;
      },
      render() {
        return h('div');
      },
    });

    const wrapper = mount(TestComponent);
    await nextTick();

    // Should not crash
    expect(wrapper.vm.isConnected).toBe(false);
  });
});
