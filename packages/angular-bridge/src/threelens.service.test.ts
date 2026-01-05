/**
 * ThreeLensService Test Suite
 *
 * Tests for the Angular service that provides 3Lens integration.
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BehaviorSubject, Subject, take, firstValueFrom } from 'rxjs';

// Mock @angular/core
vi.mock('@angular/core', async () => {
  return {
    Injectable: () => (target: any) => target,
    Inject: () => () => {},
    Optional: () => () => {},
    OnDestroy: class {},
    InjectionToken: class InjectionToken<T> {
      constructor(public description: string) {}
    },
    NgZone: class {
      run<T>(fn: () => T): T {
        return fn();
      }
      runOutsideAngular<T>(fn: () => T): T {
        return fn();
      }
    },
  };
});

// Mock @3lens/core
const mockFrameStats = {
  performance: { fps: 60 },
  cpuTimeMs: 16.67,
  drawCalls: 100,
  triangles: 50000,
  memory: { totalGpuMemory: 128 },
};

const mockSnapshot = {
  root: { children: [] },
  timestamp: Date.now(),
};

const mockSceneNode = {
  ref: { uuid: 'test-uuid', name: 'Test Object', type: 'Mesh' },
  children: [],
};

const mockProbe = {
  onFrameStats: vi.fn((cb: (stats: any) => void) => {
    cb(mockFrameStats);
    return () => {};
  }),
  onSnapshot: vi.fn((cb: (snapshot: any) => void) => {
    cb(mockSnapshot);
    return () => {};
  }),
  onSelectionChanged: vi.fn((cb: (node: any) => void) => {
    return () => {};
  }),
  observeRenderer: vi.fn(),
  observeScene: vi.fn(),
  findObjectByDebugIdOrUuid: vi.fn(() => ({ uuid: 'test-uuid' })),
  selectObject: vi.fn(),
  takeSnapshot: vi.fn(() => mockSnapshot),
  focusOnSelected: vi.fn(),
  flyToSelected: vi.fn(),
  initializeTransformGizmo: vi.fn(),
  initializeCameraController: vi.fn(),
  dispose: vi.fn(),
};

vi.mock('@3lens/core', () => ({
  createProbe: vi.fn(() => mockProbe),
}));

// Import after mocks
import { ThreeLensService, EntityOptions } from './threelens.service';
import { NgZone } from '@angular/core';
import { DEFAULT_THREELENS_CONFIG } from './tokens';

describe('ThreeLensService', () => {
  let service: ThreeLensService;
  let mockNgZone: NgZone;
  let keydownHandler: ((e: KeyboardEvent) => void) | null = null;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Capture the keydown handler
    const originalAddEventListener = window.addEventListener;
    vi.spyOn(window, 'addEventListener').mockImplementation((event, handler) => {
      if (event === 'keydown') {
        keydownHandler = handler as (e: KeyboardEvent) => void;
      }
      return originalAddEventListener.call(window, event, handler as EventListener);
    });

    mockNgZone = new NgZone();
    service = new ThreeLensService(mockNgZone, undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    keydownHandler = null;
  });

  describe('initialization', () => {
    it('should create the service', () => {
      expect(service).toBeDefined();
    });

    it('should create probe with default config', () => {
      expect(service.config.appName).toBe(DEFAULT_THREELENS_CONFIG.appName);
      expect(service.config.showOverlay).toBe(DEFAULT_THREELENS_CONFIG.showOverlay);
    });

    it('should create probe with custom config', () => {
      const customConfig = {
        appName: 'Custom App',
        debug: true,
      };
      const customService = new ThreeLensService(mockNgZone, customConfig);
      expect(customService.config.appName).toBe('Custom App');
      expect(customService.config.debug).toBe(true);
    });

    it('should expose the probe instance', () => {
      expect(service.probe).toBe(mockProbe);
    });

    it('should subscribe to probe events', () => {
      expect(mockProbe.onFrameStats).toHaveBeenCalled();
      expect(mockProbe.onSnapshot).toHaveBeenCalled();
      expect(mockProbe.onSelectionChanged).toHaveBeenCalled();
    });
  });

  describe('reactive observables', () => {
    it('should emit frame stats', async () => {
      const stats = await firstValueFrom(service.frameStats$.pipe(take(1)));
      expect(stats).toEqual(mockFrameStats);
    });

    it('should emit fps from frame stats', async () => {
      const fps = await firstValueFrom(service.fps$.pipe(take(1)));
      expect(fps).toBe(60);
    });

    it('should emit drawCalls from frame stats', async () => {
      const drawCalls = await firstValueFrom(service.drawCalls$.pipe(take(1)));
      expect(drawCalls).toBe(100);
    });

    it('should emit triangles from frame stats', async () => {
      const triangles = await firstValueFrom(service.triangles$.pipe(take(1)));
      expect(triangles).toBe(50000);
    });

    it('should emit frameTime from frame stats', async () => {
      const frameTime = await firstValueFrom(service.frameTime$.pipe(take(1)));
      expect(frameTime).toBe(16.67);
    });

    it('should emit gpuMemory from frame stats', async () => {
      const gpuMemory = await firstValueFrom(service.gpuMemory$.pipe(take(1)));
      expect(gpuMemory).toBe(128);
    });

    it('should emit snapshot', async () => {
      const snapshot = await firstValueFrom(service.snapshot$.pipe(take(1)));
      expect(snapshot).toEqual(mockSnapshot);
    });

    it('should emit isReady when snapshot received', async () => {
      const isReady = await firstValueFrom(service.isReady$.pipe(take(1)));
      expect(isReady).toBe(true);
    });

    it('should emit isOverlayVisible', async () => {
      const isVisible = await firstValueFrom(service.isOverlayVisible$.pipe(take(1)));
      expect(isVisible).toBe(true);
    });
  });

  describe('synchronous getters', () => {
    it('should return current frame stats', () => {
      expect(service.currentFrameStats).toEqual(mockFrameStats);
    });

    it('should return current snapshot', () => {
      expect(service.currentSnapshot).toEqual(mockSnapshot);
    });

    it('should return current selected node', () => {
      expect(service.currentSelectedNode).toBe(null);
    });

    it('should return isReady status', () => {
      expect(service.isReady).toBe(true);
    });
  });

  describe('probe methods', () => {
    it('should call observeRenderer on probe', () => {
      const mockRenderer = {} as any;
      service.observeRenderer(mockRenderer);
      expect(mockProbe.observeRenderer).toHaveBeenCalledWith(mockRenderer);
    });

    it('should call observeScene on probe', () => {
      const mockScene = {} as any;
      service.observeScene(mockScene);
      expect(mockProbe.observeScene).toHaveBeenCalledWith(mockScene);
    });

    it('should call takeSnapshot on probe', () => {
      const result = service.takeSnapshot();
      expect(mockProbe.takeSnapshot).toHaveBeenCalled();
      expect(result).toEqual(mockSnapshot);
    });

    it('should call selectObjectByUuid on probe', () => {
      service.selectObject('test-uuid');
      expect(mockProbe.findObjectByDebugIdOrUuid).toHaveBeenCalledWith('test-uuid');
      expect(mockProbe.selectObject).toHaveBeenCalled();
    });

    it('should call clearSelection on probe', () => {
      service.clearSelection();
      expect(mockProbe.selectObject).toHaveBeenCalledWith(null);
    });

    it('should call focusOnSelected on probe', () => {
      service.focusOnSelected();
      expect(mockProbe.focusOnSelected).toHaveBeenCalled();
    });

    it('should call flyToSelected on probe', () => {
      service.flyToSelected();
      expect(mockProbe.flyToSelected).toHaveBeenCalled();
    });

    it('should call initializeTransformGizmo on probe', () => {
      const scene = {} as any;
      const camera = {} as any;
      const domElement = document.createElement('div');
      const THREE = {} as any;
      service.initializeTransformGizmo(scene, camera, domElement, THREE);
      expect(mockProbe.initializeTransformGizmo).toHaveBeenCalledWith(scene, camera, domElement, THREE);
    });

    it('should call initializeCameraController on probe', () => {
      const camera = {} as any;
      const THREE = {} as any;
      const target = {} as any;
      service.initializeCameraController(camera, THREE, target);
      expect(mockProbe.initializeCameraController).toHaveBeenCalledWith(camera, THREE, target);
    });
  });

  describe('entity registration', () => {
    it('should register entity with name', () => {
      const obj = { uuid: 'test-uuid', name: '', userData: {} } as any;
      service.registerEntity(obj, { name: 'TestEntity' });
      expect(obj.name).toBe('TestEntity');
    });

    it('should store metadata in userData', () => {
      const obj = { uuid: 'test-uuid', name: '', userData: {} } as any;
      const options: EntityOptions = {
        name: 'Player',
        module: 'game/entities',
        metadata: { health: 100 },
        tags: ['player'],
      };
      service.registerEntity(obj, options);

      expect(obj.userData.__3lens).toBeDefined();
      expect(obj.userData.__3lens.module).toBe('game/entities');
      expect(obj.userData.__3lens.metadata).toEqual({ health: 100 });
      expect(obj.userData.__3lens.tags).toEqual(['player']);
      expect(obj.userData.__3lens.registeredAt).toBeDefined();
    });

    it('should preserve existing userData', () => {
      const obj = { uuid: 'test-uuid', name: '', userData: { custom: 'data' } } as any;
      service.registerEntity(obj, { name: 'Test' });
      expect(obj.userData.custom).toBe('data');
      expect(obj.userData.__3lens).toBeDefined();
    });

    it('should unregister entity', () => {
      const obj = { uuid: 'test-uuid', name: '', userData: { __3lens: { module: 'test' } } } as any;
      service.registerEntity(obj, { name: 'Test' });
      service.unregisterEntity(obj);
      expect(obj.userData.__3lens).toBeUndefined();
    });

    it('should handle unregistering non-registered entity', () => {
      const obj = { uuid: 'test-uuid', name: '', userData: {} } as any;
      expect(() => service.unregisterEntity(obj)).not.toThrow();
    });
  });

  describe('overlay management', () => {
    it('should set overlay reference', () => {
      const overlay = { show: vi.fn(), hide: vi.fn(), toggle: vi.fn() };
      service.setOverlay(overlay);
      // No error thrown
      expect(true).toBe(true);
    });

    it('should show overlay', async () => {
      const overlay = { show: vi.fn(), hide: vi.fn(), toggle: vi.fn() };
      service.setOverlay(overlay);
      service.showOverlay();
      expect(overlay.show).toHaveBeenCalled();
      
      const isVisible = await firstValueFrom(service.isOverlayVisible$.pipe(take(1)));
      expect(isVisible).toBe(true);
    });

    it('should hide overlay', async () => {
      const overlay = { show: vi.fn(), hide: vi.fn(), toggle: vi.fn() };
      service.setOverlay(overlay);
      service.hideOverlay();
      expect(overlay.hide).toHaveBeenCalled();
      
      const isVisible = await firstValueFrom(service.isOverlayVisible$.pipe(take(1)));
      expect(isVisible).toBe(false);
    });

    it('should toggle overlay', async () => {
      const overlay = { show: vi.fn(), hide: vi.fn(), toggle: vi.fn() };
      service.setOverlay(overlay);
      
      // Start visible
      let isVisible = await firstValueFrom(service.isOverlayVisible$.pipe(take(1)));
      expect(isVisible).toBe(true);
      
      // Toggle to hidden
      service.toggleOverlay();
      isVisible = await firstValueFrom(service.isOverlayVisible$.pipe(take(1)));
      expect(isVisible).toBe(false);
      
      // Toggle back to visible
      service.toggleOverlay();
      isVisible = await firstValueFrom(service.isOverlayVisible$.pipe(take(1)));
      expect(isVisible).toBe(true);
    });

    it('should handle overlay methods without overlay set', () => {
      expect(() => service.showOverlay()).not.toThrow();
      expect(() => service.hideOverlay()).not.toThrow();
      expect(() => service.toggleOverlay()).not.toThrow();
    });
  });

  describe('cleanup', () => {
    it('should dispose probe on destroy', () => {
      service.ngOnDestroy();
      expect(mockProbe.dispose).toHaveBeenCalled();
    });
  });
});
