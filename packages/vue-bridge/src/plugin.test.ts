/**
 * Vue Plugin Test Suite
 *
 * Tests for the Vue plugin that provides 3Lens integration.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createApp, ref, computed, defineComponent, h, inject } from 'vue';
import { mount } from '@vue/test-utils';
import { ThreeLensKey, type ThreeLensContext } from './types';

// Mock @3lens/core
const mockFrameStats = {
  fps: 60,
  frameTimeMs: 16.67,
  drawCalls: 100,
  triangles: 50000,
  memory: { gpuMemoryEstimate: 128 },
};

const mockSnapshot = {
  root: { children: [] },
  timestamp: Date.now(),
};

let frameStatsCallback: ((stats: any) => void) | null = null;
let snapshotCallback: ((snapshot: any) => void) | null = null;
let selectionCallback: ((node: any) => void) | null = null;

const mockProbe = {
  onFrameStats: vi.fn((cb: (stats: any) => void) => {
    frameStatsCallback = cb;
    return () => { frameStatsCallback = null; };
  }),
  onSnapshot: vi.fn((cb: (snapshot: any) => void) => {
    snapshotCallback = cb;
    return () => { snapshotCallback = null; };
  }),
  onSelectionChanged: vi.fn((cb: (node: any) => void) => {
    selectionCallback = cb;
    return () => { selectionCallback = null; };
  }),
  selectObjectByUuid: vi.fn(),
  clearSelection: vi.fn(),
  dispose: vi.fn(),
  config: { debug: false },
};

vi.mock('@3lens/core', () => ({
  createProbe: vi.fn(() => mockProbe),
}));

import { ThreeLensPlugin, createThreeLens } from './plugin';

describe('ThreeLensPlugin', () => {
  let keydownHandler: ((e: KeyboardEvent) => void) | null = null;

  beforeEach(() => {
    vi.clearAllMocks();
    frameStatsCallback = null;
    snapshotCallback = null;
    selectionCallback = null;

    vi.spyOn(window, 'addEventListener').mockImplementation((event, handler) => {
      if (event === 'keydown') {
        keydownHandler = handler as (e: KeyboardEvent) => void;
      }
    });
    vi.spyOn(window, 'removeEventListener').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    keydownHandler = null;
  });

  describe('plugin installation', () => {
    it('should install plugin on app', () => {
      const app = createApp({ render: () => h('div') });
      
      expect(() => {
        app.use(ThreeLensPlugin);
      }).not.toThrow();
    });

    it('should install with custom config', () => {
      const app = createApp({ render: () => h('div') });
      
      expect(() => {
        app.use(ThreeLensPlugin, { appName: 'Custom App', debug: true });
      }).not.toThrow();
    });

    it('should provide context via injection', () => {
      let capturedContext: ThreeLensContext | undefined;

      const TestComponent = defineComponent({
        setup() {
          capturedContext = inject(ThreeLensKey);
          return () => h('div');
        },
      });

      const wrapper = mount(TestComponent, {
        global: {
          plugins: [[ThreeLensPlugin, { appName: 'Test App' }]],
        },
      });

      expect(capturedContext).toBeDefined();
      expect(capturedContext?.probe).toBeDefined();
    });
  });

  describe('context values', () => {
    it('should provide reactive frameStats', async () => {
      let capturedContext: ThreeLensContext | undefined;

      const TestComponent = defineComponent({
        setup() {
          capturedContext = inject(ThreeLensKey);
          return () => h('div');
        },
      });

      mount(TestComponent, {
        global: {
          plugins: [[ThreeLensPlugin]],
        },
      });

      // Emit frame stats
      frameStatsCallback?.(mockFrameStats);

      expect(capturedContext?.frameStats.value).toEqual(mockFrameStats);
    });

    it('should provide reactive snapshot', async () => {
      let capturedContext: ThreeLensContext | undefined;

      const TestComponent = defineComponent({
        setup() {
          capturedContext = inject(ThreeLensKey);
          return () => h('div');
        },
      });

      mount(TestComponent, {
        global: {
          plugins: [[ThreeLensPlugin]],
        },
      });

      // Emit snapshot
      snapshotCallback?.(mockSnapshot);

      expect(capturedContext?.snapshot.value).toEqual(mockSnapshot);
      expect(capturedContext?.isReady.value).toBe(true);
    });

    it('should provide computed metrics', () => {
      let capturedContext: ThreeLensContext | undefined;

      const TestComponent = defineComponent({
        setup() {
          capturedContext = inject(ThreeLensKey);
          return () => h('div');
        },
      });

      mount(TestComponent, {
        global: {
          plugins: [[ThreeLensPlugin]],
        },
      });

      // Emit frame stats
      frameStatsCallback?.(mockFrameStats);

      expect(capturedContext?.fps.value).toBe(60);
      expect(capturedContext?.drawCalls.value).toBe(100);
      expect(capturedContext?.triangles.value).toBe(50000);
      expect(capturedContext?.frameTime.value).toBe(16.67);
      expect(capturedContext?.gpuMemory.value).toBe(128);
    });
  });

  describe('selection actions', () => {
    it('should call selectObjectByUuid on probe', () => {
      let capturedContext: ThreeLensContext | undefined;

      const TestComponent = defineComponent({
        setup() {
          capturedContext = inject(ThreeLensKey);
          return () => h('div');
        },
      });

      mount(TestComponent, {
        global: {
          plugins: [[ThreeLensPlugin]],
        },
      });

      capturedContext?.selectObject('test-uuid');

      expect(mockProbe.selectObjectByUuid).toHaveBeenCalledWith('test-uuid');
    });

    it('should call clearSelection on probe', () => {
      let capturedContext: ThreeLensContext | undefined;

      const TestComponent = defineComponent({
        setup() {
          capturedContext = inject(ThreeLensKey);
          return () => h('div');
        },
      });

      mount(TestComponent, {
        global: {
          plugins: [[ThreeLensPlugin]],
        },
      });

      capturedContext?.clearSelection();

      expect(mockProbe.clearSelection).toHaveBeenCalled();
    });
  });

  describe('overlay management', () => {
    it('should provide overlay visibility state', () => {
      let capturedContext: ThreeLensContext | undefined;

      const TestComponent = defineComponent({
        setup() {
          capturedContext = inject(ThreeLensKey);
          return () => h('div');
        },
      });

      mount(TestComponent, {
        global: {
          plugins: [[ThreeLensPlugin, { showOverlay: true }]],
        },
      });

      expect(capturedContext?.isOverlayVisible.value).toBe(true);
    });

    it('should toggle overlay visibility', () => {
      let capturedContext: ThreeLensContext | undefined;

      const TestComponent = defineComponent({
        setup() {
          capturedContext = inject(ThreeLensKey);
          return () => h('div');
        },
      });

      mount(TestComponent, {
        global: {
          plugins: [[ThreeLensPlugin, { showOverlay: true }]],
        },
      });

      expect(capturedContext?.isOverlayVisible.value).toBe(true);

      capturedContext?.toggleOverlay();

      expect(capturedContext?.isOverlayVisible.value).toBe(false);
    });

    it('should show overlay', () => {
      let capturedContext: ThreeLensContext | undefined;

      const TestComponent = defineComponent({
        setup() {
          capturedContext = inject(ThreeLensKey);
          return () => h('div');
        },
      });

      mount(TestComponent, {
        global: {
          plugins: [[ThreeLensPlugin, { showOverlay: false }]],
        },
      });

      capturedContext?.showOverlay();

      expect(capturedContext?.isOverlayVisible.value).toBe(true);
    });

    it('should hide overlay', () => {
      let capturedContext: ThreeLensContext | undefined;

      const TestComponent = defineComponent({
        setup() {
          capturedContext = inject(ThreeLensKey);
          return () => h('div');
        },
      });

      mount(TestComponent, {
        global: {
          plugins: [[ThreeLensPlugin, { showOverlay: true }]],
        },
      });

      capturedContext?.hideOverlay();

      expect(capturedContext?.isOverlayVisible.value).toBe(false);
    });
  });

  describe('keyboard shortcuts', () => {
    it('should set up keyboard listener', () => {
      const TestComponent = defineComponent({
        setup() {
          inject(ThreeLensKey);
          return () => h('div');
        },
      });

      mount(TestComponent, {
        global: {
          plugins: [[ThreeLensPlugin]],
        },
      });

      expect(window.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('should respond to default shortcut', () => {
      let capturedContext: ThreeLensContext | undefined;

      const TestComponent = defineComponent({
        setup() {
          capturedContext = inject(ThreeLensKey);
          return () => h('div');
        },
      });

      mount(TestComponent, {
        global: {
          plugins: [[ThreeLensPlugin, { showOverlay: true }]],
        },
      });

      expect(capturedContext?.isOverlayVisible.value).toBe(true);

      // Simulate keyboard shortcut
      if (keydownHandler) {
        keydownHandler({
          ctrlKey: true,
          shiftKey: true,
          altKey: false,
          key: 'd',
          preventDefault: vi.fn(),
        } as unknown as KeyboardEvent);
      }

      expect(capturedContext?.isOverlayVisible.value).toBe(false);
    });

    it('should respond to custom shortcut', () => {
      let capturedContext: ThreeLensContext | undefined;

      const TestComponent = defineComponent({
        setup() {
          capturedContext = inject(ThreeLensKey);
          return () => h('div');
        },
      });

      mount(TestComponent, {
        global: {
          plugins: [[ThreeLensPlugin, { toggleShortcut: 'alt+shift+t', showOverlay: true }]],
        },
      });

      // Simulate custom shortcut
      if (keydownHandler) {
        keydownHandler({
          ctrlKey: false,
          shiftKey: true,
          altKey: true,
          key: 't',
          preventDefault: vi.fn(),
        } as unknown as KeyboardEvent);
      }

      expect(capturedContext?.isOverlayVisible.value).toBe(false);
    });

    it('should not toggle on wrong shortcut', () => {
      let capturedContext: ThreeLensContext | undefined;

      const TestComponent = defineComponent({
        setup() {
          capturedContext = inject(ThreeLensKey);
          return () => h('div');
        },
      });

      mount(TestComponent, {
        global: {
          plugins: [[ThreeLensPlugin, { showOverlay: true }]],
        },
      });

      // Simulate wrong shortcut
      if (keydownHandler) {
        keydownHandler({
          ctrlKey: true,
          shiftKey: false, // Missing shift
          altKey: false,
          key: 'd',
          preventDefault: vi.fn(),
        } as unknown as KeyboardEvent);
      }

      // Should still be visible
      expect(capturedContext?.isOverlayVisible.value).toBe(true);
    });
  });
});

describe('createThreeLens', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should be exported', () => {
    expect(createThreeLens).toBeDefined();
  });
});
