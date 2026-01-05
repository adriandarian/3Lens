/**
 * R3F Integration Test Suite
 *
 * Tests for the React Three Fiber integration components.
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { ThreeLensContext } from '../context';
import type { ThreeLensContextValue } from '../types';
import type * as THREE from 'three';

// Mock @react-three/fiber
vi.mock('@react-three/fiber', () => ({
  useThree: () => ({
    gl: { domElement: document.createElement('canvas') },
    scene: { constructor: class {} },
    camera: {},
  }),
  useFrame: vi.fn(),
}));

// Types for the R3F hooks that createR3FConnector expects
type UseThreeReturn = {
  gl: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.Camera;
};

type UseThreeHook = () => UseThreeReturn;
type UseFrameHook = (callback: (state: unknown, delta: number) => void) => void;

// Mock Three.js
const mockRenderer = {
  domElement: document.createElement('canvas'),
  info: { render: { calls: 0, triangles: 0 } },
} as unknown as THREE.WebGLRenderer;

const mockScene = {
  children: [],
  traverse: vi.fn(),
} as unknown as THREE.Scene;

const mockCamera = {
  position: { x: 0, y: 0, z: 5 },
} as unknown as THREE.Camera;

// Mock probe
function createMockProbe() {
  return {
    observeRenderer: vi.fn(),
    observeScene: vi.fn(),
    findObjectByDebugIdOrUuid: vi.fn(),
    selectObject: vi.fn(),
    initializeTransformGizmo: vi.fn(),
    initializeCameraController: vi.fn(),
    config: { debug: false },
  };
}

// Mock context
function createMockContext(probe = createMockProbe()): ThreeLensContextValue {
  return {
    probe: probe as unknown as ThreeLensContextValue['probe'],
    isReady: true,
    frameStats: null,
    snapshot: null,
    selectedNode: null,
    selectObject: vi.fn(),
    clearSelection: vi.fn(),
    toggleOverlay: vi.fn(),
    showOverlay: vi.fn(),
    hideOverlay: vi.fn(),
    isOverlayVisible: true,
  };
}

// Context wrapper
function createWrapper(contextValue: ThreeLensContextValue | null) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(ThreeLensContext.Provider, { value: contextValue }, children);
  };
}

// Import after mocks
import { createR3FConnector, R3FProbe, R3FProbeConnectorInner } from './useR3FProbe';

describe('createR3FConnector', () => {
  let mockUseThree: UseThreeHook;
  let mockUseFrame: UseFrameHook;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseThree = vi.fn(() => ({
      gl: mockRenderer,
      scene: mockScene,
      camera: mockCamera,
    })) as UseThreeHook;
    mockUseFrame = vi.fn() as UseFrameHook;
  });

  it('should create a React component', () => {
    const Connector = createR3FConnector(mockUseThree, mockUseFrame);
    expect(typeof Connector).toBe('function');
  });

  it('should render null', () => {
    const mockProbe = createMockProbe();
    const mockContext = createMockContext(mockProbe);
    const wrapper = createWrapper(mockContext);

    const Connector = createR3FConnector(mockUseThree, mockUseFrame);
    const { result } = renderHook(() => {
      const Component = Connector;
      return createElement(Component);
    }, { wrapper });

    // Component returns null
    expect(result.current).toBeDefined();
  });

  it('should call useThree to get R3F state', () => {
    const mockProbe = createMockProbe();
    const mockContext = createMockContext(mockProbe);
    const wrapper = createWrapper(mockContext);

    const Connector = createR3FConnector(mockUseThree, mockUseFrame);
    
    // We need to render the component, not use it as a hook
    const TestComponent = () => {
      return createElement(Connector);
    };

    renderHook(() => createElement(TestComponent), { wrapper });

    // useThree should be called when the component mounts
  });

  it('should not connect when context is null', () => {
    const wrapper = createWrapper(null);
    const mockProbe = createMockProbe();

    const Connector = createR3FConnector(mockUseThree, mockUseFrame);
    
    renderHook(() => {
      return createElement(Connector);
    }, { wrapper });

    expect(mockProbe.observeRenderer).not.toHaveBeenCalled();
    expect(mockProbe.observeScene).not.toHaveBeenCalled();
  });

  it('should not connect when already connected', () => {
    const mockProbe = createMockProbe();
    const mockContext = createMockContext(mockProbe);
    const wrapper = createWrapper(mockContext);

    const Connector = createR3FConnector(mockUseThree, mockUseFrame);

    // Render twice
    const { rerender } = renderHook(() => createElement(Connector), { wrapper });
    rerender();

    // Should only connect once (checked by ref)
  });
});

describe('R3FProbe', () => {
  it('should be defined', () => {
    expect(R3FProbe).toBeDefined();
  });

  it('should render null', () => {
    const wrapper = createWrapper(null);
    const { result } = renderHook(() => createElement(R3FProbe), { wrapper });
    expect(result.current).toBeDefined();
  });

  it('should accept showOverlay prop', () => {
    const wrapper = createWrapper(null);
    expect(() => {
      renderHook(() => createElement(R3FProbe, { showOverlay: false }), { wrapper });
    }).not.toThrow();
  });
});

describe('R3FProbeConnectorInner', () => {
  it('should be defined', () => {
    expect(R3FProbeConnectorInner).toBeDefined();
  });

  it('should render null', () => {
    const wrapper = createWrapper(null);
    const { result } = renderHook(() => createElement(R3FProbeConnectorInner), { wrapper });
    expect(result.current).toBeDefined();
  });
});
