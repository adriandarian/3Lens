/**
 * useThreeLens Composable Test Suite
 *
 * Tests for the Vue composables that access the 3Lens context.
 */

import { describe, it, expect, vi } from 'vitest';
import { ref, computed, defineComponent, h } from 'vue';
import { mount } from '@vue/test-utils';
import { useThreeLens, useThreeLensOptional } from './useThreeLens';
import { ThreeLensKey, type ThreeLensContext } from '../types';

// Helper to create a test context
function createTestContext(overrides: Partial<ThreeLensContext> = {}): ThreeLensContext {
  return {
    probe: ref(null),
    isReady: ref(false),
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

describe('useThreeLens', () => {
  it('should throw when used outside of provider', () => {
    const TestComponent = defineComponent({
      setup() {
        // This should throw
        try {
          useThreeLens();
          return () => h('div', 'should not render');
        } catch (e) {
          return () => h('div', 'error caught');
        }
      },
    });

    // The component catches the error internally
    const wrapper = mount(TestComponent);
    expect(wrapper.text()).toBe('error caught');
  });

  it('should throw with correct error message', () => {
    let errorMessage = '';
    const TestComponent = defineComponent({
      setup() {
        try {
          useThreeLens();
        } catch (e: any) {
          errorMessage = e.message;
        }
        return () => h('div');
      },
    });

    mount(TestComponent);
    expect(errorMessage).toContain('useThreeLens must be used within a component');
    expect(errorMessage).toContain('ThreeLensPlugin');
  });

  it('should return context when provided', () => {
    const mockContext = createTestContext();
    let capturedContext: ThreeLensContext | null = null;

    const TestComponent = defineComponent({
      setup() {
        capturedContext = useThreeLens();
        return () => h('div');
      },
    });

    mount(TestComponent, {
      global: {
        provide: {
          [ThreeLensKey as symbol]: mockContext,
        },
      },
    });

    expect(capturedContext).toBe(mockContext);
  });

  it('should access probe from context', () => {
    const mockProbe = { id: 'test-probe' } as any;
    const mockContext = createTestContext({ probe: ref(mockProbe) });
    let probeValue: any = null;

    const TestComponent = defineComponent({
      setup() {
        const ctx = useThreeLens();
        probeValue = ctx.probe.value;
        return () => h('div');
      },
    });

    mount(TestComponent, {
      global: {
        provide: {
          [ThreeLensKey as symbol]: mockContext,
        },
      },
    });

    expect(probeValue).toStrictEqual(mockProbe);
  });

  it('should access isReady from context', () => {
    const mockContext = createTestContext({ isReady: ref(true) });
    let isReadyValue: boolean | null = null;

    const TestComponent = defineComponent({
      setup() {
        const ctx = useThreeLens();
        isReadyValue = ctx.isReady.value;
        return () => h('div');
      },
    });

    mount(TestComponent, {
      global: {
        provide: {
          [ThreeLensKey as symbol]: mockContext,
        },
      },
    });

    expect(isReadyValue).toBe(true);
  });

  it('should access computed fps', () => {
    const mockContext = createTestContext({ fps: computed(() => 59) });
    let fpsValue: number | null = null;

    const TestComponent = defineComponent({
      setup() {
        const ctx = useThreeLens();
        fpsValue = ctx.fps.value;
        return () => h('div');
      },
    });

    mount(TestComponent, {
      global: {
        provide: {
          [ThreeLensKey as symbol]: mockContext,
        },
      },
    });

    expect(fpsValue).toBe(59);
  });

  it('should provide selectObject function', () => {
    const selectObjectMock = vi.fn();
    const mockContext = createTestContext({ selectObject: selectObjectMock });

    const TestComponent = defineComponent({
      setup() {
        const ctx = useThreeLens();
        ctx.selectObject('test-uuid');
        return () => h('div');
      },
    });

    mount(TestComponent, {
      global: {
        provide: {
          [ThreeLensKey as symbol]: mockContext,
        },
      },
    });

    expect(selectObjectMock).toHaveBeenCalledWith('test-uuid');
  });
});

describe('useThreeLensOptional', () => {
  it('should return undefined when used outside of provider', () => {
    let contextValue: ThreeLensContext | undefined;

    const TestComponent = defineComponent({
      setup() {
        contextValue = useThreeLensOptional();
        return () => h('div');
      },
    });

    mount(TestComponent);
    expect(contextValue).toBeUndefined();
  });

  it('should not throw when used outside provider', () => {
    const TestComponent = defineComponent({
      setup() {
        // Should not throw
        useThreeLensOptional();
        return () => h('div', 'success');
      },
    });

    const wrapper = mount(TestComponent);
    expect(wrapper.text()).toBe('success');
  });

  it('should return context when provided', () => {
    const mockContext = createTestContext();
    let capturedContext: ThreeLensContext | undefined;

    const TestComponent = defineComponent({
      setup() {
        capturedContext = useThreeLensOptional();
        return () => h('div');
      },
    });

    mount(TestComponent, {
      global: {
        provide: {
          [ThreeLensKey as symbol]: mockContext,
        },
      },
    });

    expect(capturedContext).toBe(mockContext);
  });

  it('should allow safe property access when undefined', () => {
    let fpsValue: number | undefined;

    const TestComponent = defineComponent({
      setup() {
        const ctx = useThreeLensOptional();
        fpsValue = ctx?.fps.value;
        return () => h('div');
      },
    });

    mount(TestComponent);
    expect(fpsValue).toBeUndefined();
  });

  it('should allow safe function calls when provided', () => {
    const toggleMock = vi.fn();
    const mockContext = createTestContext({ toggleOverlay: toggleMock });

    const TestComponent = defineComponent({
      setup() {
        const ctx = useThreeLensOptional();
        ctx?.toggleOverlay();
        return () => h('div');
      },
    });

    mount(TestComponent, {
      global: {
        provide: {
          [ThreeLensKey as symbol]: mockContext,
        },
      },
    });

    expect(toggleMock).toHaveBeenCalled();
  });
});
