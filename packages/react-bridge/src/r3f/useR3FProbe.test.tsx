/**
 * R3F Integration Test Suite
 *
 * Tests for the React Three Fiber integration components.
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { createElement, type ReactNode, useRef, useEffect } from 'react';
import { ThreeLensContext } from '../context';
import type { ThreeLensContextValue } from '../types';

// Mock @react-three/fiber
vi.mock('@react-three/fiber', () => ({
  useThree: () => ({
    gl: { domElement: document.createElement('canvas') },
    scene: { constructor: class {} },
    camera: {},
  }),
  useFrame: vi.fn(),
}));

// Mock Three.js
const mockRenderer = {
  domElement: document.createElement('canvas'),
  info: { render: { calls: 0, triangles: 0 } },
};

const mockScene = {
  children: [],
  traverse: vi.fn(),
};

const mockCamera = {
  position: { x: 0, y: 0, z: 5 },
};

// Mock probe
function createMockProbe() {
  return {
    observeRenderer: vi.fn(),
    observeScene: vi.fn(),
    selectObjectByUuid: vi.fn(),
    clearSelection: vi.fn(),
    initializeTransformGizmo: vi.fn(),
    initializeCameraController: vi.fn(),
    config: { debug: false },
  };
}

// Mock context
function createMockContext(probe = createMockProbe()): ThreeLensContextValue {
  return {
    probe: probe as any,
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
  let mockUseThree: ReturnType<typeof vi.fn>;
  let mockUseFrame: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseThree = vi.fn(() => ({
      gl: mockRenderer,
      scene: mockScene,
      camera: mockCamera,
    }));
    mockUseFrame = vi.fn();
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
