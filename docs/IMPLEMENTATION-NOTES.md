# 3Lens Implementation Notes

This document contains detailed implementation guidance, code snippets, and technical notes extracted from the design discussions. Use this as a reference when implementing specific features.

## Table of Contents

1. [Package Naming](#package-naming)
2. [Interactive Inspector Implementation](#interactive-inspector-implementation)
3. [WebGL Adapter Implementation](#webgl-adapter-implementation)
4. [WebGPU Adapter Implementation](#webgpu-adapter-implementation)
5. [Framework Bridge Implementations](#framework-bridge-implementations)
6. [Advanced Features](#advanced-features)
7. [Configuration Examples](#configuration-examples)

---

## Package Naming

The package namespace for 3Lens follows this convention:

```
@3lens/core           # Core probe SDK
@3lens/overlay        # In-app UI overlay (devtools panel)
@3lens/react-bridge   # React/R3F integration
@3lens/angular-bridge # Angular integration
@3lens/vue-bridge     # Vue/TresJS integration
```

---

## Interactive Inspector Implementation

### Inspect Mode with Raycasting

The core of the in-scene object picker:

```typescript
// @3lens/interactive/src/inspect-mode.ts

import * as THREE from 'three';
import type { DevtoolProbe } from '@3lens/core';

export class InspectMode {
  private inspecting = false;
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  
  constructor(
    private canvas: HTMLCanvasElement,
    private camera: THREE.Camera,
    private probe: DevtoolProbe,
    private pickableObjects: THREE.Object3D[] = []
  ) {
    this.setupEventListeners();
  }
  
  setEnabled(enabled: boolean): void {
    this.inspecting = enabled;
    this.canvas.style.cursor = enabled ? 'crosshair' : 'default';
  }
  
  isEnabled(): boolean {
    return this.inspecting;
  }
  
  setPickableObjects(objects: THREE.Object3D[]): void {
    this.pickableObjects = objects;
  }
  
  private setupEventListeners(): void {
    this.canvas.addEventListener('pointerdown', this.handlePointerDown);
    this.canvas.addEventListener('pointermove', this.handlePointerMove);
  }
  
  private handlePointerDown = (event: PointerEvent): void => {
    if (!this.inspecting) return;
    
    const intersection = this.getIntersection(event);
    if (intersection) {
      this.probe.selectObject(intersection.object);
    } else {
      this.probe.selectObject(null);
    }
    
    event.preventDefault();
    event.stopPropagation();
  };
  
  private handlePointerMove = (event: PointerEvent): void => {
    if (!this.inspecting) return;
    
    const intersection = this.getIntersection(event);
    // Emit hover event for highlight
    this.probe.emit('hover', intersection?.object ?? null);
  };
  
  private getIntersection(event: PointerEvent): THREE.Intersection | null {
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const intersects = this.raycaster.intersectObjects(
      this.pickableObjects.length > 0 ? this.pickableObjects : this.getAllObjects(),
      true // recursive
    );
    
    return intersects.length > 0 ? intersects[0] : null;
  }
  
  private getAllObjects(): THREE.Object3D[] {
    const objects: THREE.Object3D[] = [];
    for (const scene of this.probe.getObservedScenes()) {
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          objects.push(obj);
        }
      });
    }
    return objects;
  }
  
  dispose(): void {
    this.canvas.removeEventListener('pointerdown', this.handlePointerDown);
    this.canvas.removeEventListener('pointermove', this.handlePointerMove);
  }
}
```

### Visual Feedback with Gizmos and Overlays

```typescript
// @3lens/interactive/src/selection-overlay.ts

import * as THREE from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import type { DevtoolProbe } from '@3lens/core';

export class SelectionOverlay {
  private selectionBox: THREE.BoxHelper | null = null;
  private transformControls: TransformControls | null = null;
  private outlinePass: any = null; // If using postprocessing
  
  constructor(
    private scene: THREE.Scene,
    private camera: THREE.Camera,
    private renderer: THREE.WebGLRenderer,
    private probe: DevtoolProbe
  ) {
    this.setupSelectionListener();
  }
  
  private setupSelectionListener(): void {
    this.probe.onSelectionChanged((obj, meta) => {
      this.updateSelection(obj);
    });
  }
  
  private updateSelection(obj: THREE.Object3D | null): void {
    if (!obj) {
      this.clearSelection();
      return;
    }
    
    // Update bounding box helper
    if (!this.selectionBox) {
      this.selectionBox = new THREE.BoxHelper(obj, 0x00ff00);
      this.scene.add(this.selectionBox);
    } else {
      this.selectionBox.setFromObject(obj);
      this.selectionBox.visible = true;
    }
    
    // Update transform controls (optional, for editing)
    if (this.transformControls) {
      this.transformControls.attach(obj);
    }
  }
  
  private clearSelection(): void {
    if (this.selectionBox) {
      this.selectionBox.visible = false;
    }
    if (this.transformControls) {
      this.transformControls.detach();
    }
  }
  
  enableTransformControls(mode: 'translate' | 'rotate' | 'scale' = 'translate'): void {
    if (!this.transformControls) {
      this.transformControls = new TransformControls(
        this.camera,
        this.renderer.domElement
      );
      this.scene.add(this.transformControls);
      
      // Prevent orbit controls from interfering
      this.transformControls.addEventListener('dragging-changed', (event) => {
        this.probe.emit('transform-dragging', event.value);
      });
    }
    
    this.transformControls.setMode(mode);
    
    const selected = this.probe.getSelectedObject();
    if (selected) {
      this.transformControls.attach(selected);
    }
  }
  
  disableTransformControls(): void {
    if (this.transformControls) {
      this.transformControls.detach();
    }
  }
  
  dispose(): void {
    if (this.selectionBox) {
      this.scene.remove(this.selectionBox);
      this.selectionBox.dispose();
    }
    if (this.transformControls) {
      this.scene.remove(this.transformControls);
      this.transformControls.dispose();
    }
  }
}
```

### Inline Inspector Popover

Screen-space popover that follows a selected object:

```typescript
// @3lens/interactive/src/object-popover.ts

import * as THREE from 'three';
import type { DevtoolProbe } from '@3lens/core';

export class ObjectPopover {
  private element: HTMLDivElement;
  private animationFrameId: number | null = null;
  private currentObject: THREE.Object3D | null = null;
  
  constructor(
    private container: HTMLElement,
    private camera: THREE.Camera,
    private canvas: HTMLCanvasElement,
    private probe: DevtoolProbe
  ) {
    this.element = this.createPopoverElement();
    this.container.appendChild(this.element);
    
    this.probe.onSelectionChanged((obj, meta) => {
      this.currentObject = obj;
      if (obj) {
        this.show(obj, meta);
        this.startTracking();
      } else {
        this.hide();
        this.stopTracking();
      }
    });
  }
  
  private createPopoverElement(): HTMLDivElement {
    const el = document.createElement('div');
    el.className = 'threelens-popover';
    el.style.cssText = `
      position: absolute;
      pointer-events: auto;
      background: rgba(0, 0, 0, 0.85);
      color: white;
      padding: 12px;
      border-radius: 8px;
      font-family: system-ui, sans-serif;
      font-size: 12px;
      min-width: 200px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      display: none;
      z-index: 10000;
    `;
    return el;
  }
  
  private show(obj: THREE.Object3D, meta?: any): void {
    this.element.style.display = 'block';
    this.element.innerHTML = this.renderContent(obj, meta);
    this.updatePosition(obj);
  }
  
  private hide(): void {
    this.element.style.display = 'none';
  }
  
  private renderContent(obj: THREE.Object3D, meta?: any): string {
    const type = obj.constructor.name;
    const name = obj.name || meta?.label || `<${type}>`;
    
    let triangles = 0;
    if (obj instanceof THREE.Mesh && obj.geometry) {
      const geo = obj.geometry;
      triangles = geo.index 
        ? geo.index.count / 3 
        : (geo.attributes.position?.count ?? 0) / 3;
    }
    
    return `
      <div style="font-weight: bold; margin-bottom: 8px;">${name}</div>
      <div style="color: #888; margin-bottom: 8px;">${type} • ${obj.uuid.slice(0, 8)}</div>
      ${meta?.moduleId ? `<div style="color: #6cf; margin-bottom: 8px;">📦 ${meta.moduleId}</div>` : ''}
      ${meta?.componentId ? `<div style="color: #fc6; margin-bottom: 8px;">⚛️ ${meta.componentId}</div>` : ''}
      <div style="display: flex; gap: 8px; margin-bottom: 8px;">
        <label><input type="checkbox" ${obj.visible ? 'checked' : ''} data-prop="visible"> Visible</label>
        <label><input type="checkbox" ${obj.frustumCulled ? 'checked' : ''} data-prop="frustumCulled"> Cull</label>
      </div>
      ${triangles > 0 ? `<div>🔺 ${triangles.toLocaleString()} triangles</div>` : ''}
      <button style="margin-top: 8px; padding: 4px 8px; cursor: pointer;" data-action="focus">
        📷 Focus Camera
      </button>
      <button style="margin-top: 8px; padding: 4px 8px; cursor: pointer;" data-action="details">
        More...
      </button>
    `;
  }
  
  private updatePosition(obj: THREE.Object3D): void {
    const worldPos = new THREE.Vector3();
    obj.getWorldPosition(worldPos);
    
    const projected = worldPos.clone().project(this.camera);
    
    // Check if behind camera
    if (projected.z > 1) {
      this.element.style.opacity = '0.5';
    } else {
      this.element.style.opacity = '1';
    }
    
    const x = (projected.x * 0.5 + 0.5) * this.canvas.clientWidth;
    const y = (-projected.y * 0.5 + 0.5) * this.canvas.clientHeight;
    
    // Offset to not cover the object
    const offsetX = 20;
    const offsetY = -20;
    
    this.element.style.left = `${x + offsetX}px`;
    this.element.style.top = `${y + offsetY}px`;
  }
  
  private startTracking(): void {
    const track = () => {
      if (this.currentObject) {
        this.updatePosition(this.currentObject);
      }
      this.animationFrameId = requestAnimationFrame(track);
    };
    track();
  }
  
  private stopTracking(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
  
  dispose(): void {
    this.stopTracking();
    this.element.remove();
  }
}
```

---

## WebGL Adapter Implementation

```typescript
// @3lens/core/src/adapters/webgl-adapter.ts

import * as THREE from 'three';
import type { RendererAdapter, FrameStats, Unsubscribe } from '../types';

export function createWebGLAdapter(renderer: THREE.WebGLRenderer): RendererAdapter {
  const frameCallbacks: Array<(stats: FrameStats) => void> = [];
  let frameCount = 0;
  let lastTime = performance.now();
  
  // GPU timing support
  const gl = renderer.getContext();
  const ext = gl.getExtension('EXT_disjoint_timer_query_webgl2');
  let gpuQuery: WebGLQuery | null = null;
  let pendingGpuTime: number | null = null;
  
  // Hook into render
  const originalRender = renderer.render.bind(renderer);
  renderer.render = function(scene: THREE.Scene, camera: THREE.Camera) {
    const startTime = performance.now();
    
    // Start GPU timing query
    if (ext && !gpuQuery) {
      gpuQuery = gl.createQuery()!;
      gl.beginQuery(ext.TIME_ELAPSED_EXT, gpuQuery);
    }
    
    // Call original render
    originalRender(scene, camera);
    
    // End GPU timing query
    if (ext && gpuQuery) {
      gl.endQuery(ext.TIME_ELAPSED_EXT);
      
      // Check if previous query is ready
      const available = gl.getQueryParameter(gpuQuery, gl.QUERY_RESULT_AVAILABLE);
      const disjoint = gl.getParameter(ext.GPU_DISJOINT_EXT);
      
      if (available && !disjoint) {
        const nanoseconds = gl.getQueryParameter(gpuQuery, gl.QUERY_RESULT);
        pendingGpuTime = nanoseconds / 1e6; // Convert to ms
      }
      
      gl.deleteQuery(gpuQuery);
      gpuQuery = null;
    }
    
    const endTime = performance.now();
    const cpuTime = endTime - startTime;
    
    // Collect stats
    const info = renderer.info;
    const stats: FrameStats = {
      frame: frameCount++,
      timestamp: endTime,
      cpuTimeMs: cpuTime,
      gpuTimeMs: pendingGpuTime ?? undefined,
      triangles: info.render.triangles,
      drawCalls: info.render.calls,
      points: info.render.points,
      lines: info.render.lines,
      objectsVisible: info.render.calls, // Approximation
      objectsTotal: info.memory.geometries,
      materialsUsed: info.programs?.length ?? 0,
      backend: 'webgl',
      webglExtras: {
        programSwitches: info.programs?.length ?? 0,
        textureBindings: info.memory.textures,
        geometryCount: info.memory.geometries,
        textureCount: info.memory.textures,
        programs: info.programs?.length ?? 0,
      },
    };
    
    // Reset renderer info for next frame
    info.reset();
    
    // Notify callbacks
    for (const callback of frameCallbacks) {
      callback(stats);
    }
  };
  
  return {
    kind: 'webgl',
    
    observeFrame(callback: (stats: FrameStats) => void): Unsubscribe {
      frameCallbacks.push(callback);
      return () => {
        const index = frameCallbacks.indexOf(callback);
        if (index > -1) {
          frameCallbacks.splice(index, 1);
        }
      };
    },
    
    getRenderTargets() {
      // Would need to track render targets as they're created
      return [];
    },
    
    getTextures() {
      // Access via renderer.properties or tracking
      return [];
    },
    
    getGeometries() {
      return [];
    },
    
    getMaterials() {
      return [];
    },
    
    getPrograms() {
      const programs = renderer.info.programs ?? [];
      return programs.map((program: any) => ({
        id: program.id?.toString() ?? 'unknown',
        vertexShader: program.vertexShader ?? '',
        fragmentShader: program.fragmentShader ?? '',
        uniforms: {},
        attributes: [],
        usedByMaterials: [],
      }));
    },
    
    async getGpuTimings() {
      return {
        totalMs: pendingGpuTime ?? 0,
      };
    },
    
    dispose() {
      // Restore original render method
      renderer.render = originalRender;
    },
  };
}
```

---

## WebGPU Adapter Implementation

```typescript
// @3lens/core/src/adapters/webgpu-adapter.ts

import * as THREE from 'three';
import type { RendererAdapter, FrameStats, PipelineInfo, Unsubscribe } from '../types';

// Note: THREE.WebGPURenderer is experimental as of 2025
// This is a conceptual implementation

export function createWebGPUAdapter(renderer: any /* THREE.WebGPURenderer */): RendererAdapter {
  const frameCallbacks: Array<(stats: FrameStats) => void> = [];
  let frameCount = 0;
  
  // GPU timestamp query setup
  let device: GPUDevice | null = null;
  let querySet: GPUQuerySet | null = null;
  let resolveBuffer: GPUBuffer | null = null;
  let timestampSupported = false;
  
  // Initialize GPU timing if available
  async function initGpuTiming() {
    try {
      device = renderer.backend?.device;
      if (device && device.features.has('timestamp-query')) {
        timestampSupported = true;
        querySet = device.createQuerySet({
          type: 'timestamp',
          count: 2, // start and end
        });
        resolveBuffer = device.createBuffer({
          size: 16, // 2 * BigInt64
          usage: GPUBufferUsage.QUERY_RESOLVE | GPUBufferUsage.COPY_SRC,
        });
      }
    } catch (e) {
      console.warn('3Lens: GPU timestamp queries not available');
    }
  }
  
  initGpuTiming();
  
  // Hook into render
  const originalRender = renderer.render.bind(renderer);
  renderer.render = async function(scene: THREE.Scene, camera: THREE.Camera) {
    const startTime = performance.now();
    
    // Call original render
    await originalRender(scene, camera);
    
    const endTime = performance.now();
    const cpuTime = endTime - startTime;
    
    // Collect stats
    const info = renderer.info;
    const stats: FrameStats = {
      frame: frameCount++,
      timestamp: endTime,
      cpuTimeMs: cpuTime,
      gpuTimeMs: undefined, // Would come from timestamp queries
      triangles: info?.render?.triangles ?? 0,
      drawCalls: info?.render?.calls ?? 0,
      points: info?.render?.points ?? 0,
      lines: info?.render?.lines ?? 0,
      objectsVisible: 0,
      objectsTotal: 0,
      materialsUsed: 0,
      backend: 'webgpu',
      webgpuExtras: {
        pipelinesUsed: 0,
        bindGroupsUsed: 0,
        buffersUsed: 0,
        timestampBreakdown: {},
      },
    };
    
    // Notify callbacks
    for (const callback of frameCallbacks) {
      callback(stats);
    }
  };
  
  return {
    kind: 'webgpu',
    
    observeFrame(callback: (stats: FrameStats) => void): Unsubscribe {
      frameCallbacks.push(callback);
      return () => {
        const index = frameCallbacks.indexOf(callback);
        if (index > -1) {
          frameCallbacks.splice(index, 1);
        }
      };
    },
    
    getRenderTargets() {
      return [];
    },
    
    getTextures() {
      return [];
    },
    
    getGeometries() {
      return [];
    },
    
    getMaterials() {
      return [];
    },
    
    getPipelines(): PipelineInfo[] {
      // Access pipeline cache from renderer
      return [];
    },
    
    async getGpuTimings() {
      // Read back timestamp query results
      return {
        totalMs: 0,
        breakdown: {},
      };
    },
    
    dispose() {
      renderer.render = originalRender;
      querySet?.destroy();
      resolveBuffer?.destroy();
    },
  };
}
```

---

## Framework Bridge Implementations

### React Three Fiber Auto-Detection

```typescript
// @3lens/react-bridge/src/r3f-integration.ts

import { useThree, useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import type { DevtoolProbe } from '@3lens/core';

/**
 * Hook to automatically connect probe to R3F canvas
 */
export function useThreeLensR3F(probe: DevtoolProbe) {
  const { gl, scene, camera } = useThree();
  const initialized = useRef(false);
  
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    
    probe.observeRenderer(gl);
    probe.observeScene(scene);
    
    return () => {
      // Cleanup handled by probe
    };
  }, [gl, scene, probe]);
  
  // Optional: Track frame timing
  useFrame((state, delta) => {
    probe.metric('r3f.delta', delta * 1000);
  });
}

/**
 * Provider component for R3F
 */
export function ThreeLensR3FProvider({ 
  probe, 
  children 
}: { 
  probe: DevtoolProbe; 
  children: React.ReactNode;
}) {
  useThreeLensR3F(probe);
  return <>{children}</>;
}
```

### Angular Service Pattern

```typescript
// @3lens/angular-bridge/src/threelens.service.ts

import { Injectable, Inject, Optional, OnDestroy } from '@angular/core';
import { DevtoolProbe, createProbe, ProbeConfig } from '@3lens/core';
import { THREELENS_CONFIG } from './tokens';

@Injectable({
  providedIn: 'root'
})
export class ThreeLensService implements OnDestroy {
  private _probe: DevtoolProbe | null = null;
  
  constructor(
    @Optional() @Inject(THREELENS_CONFIG) private config?: ProbeConfig
  ) {}
  
  get probe(): DevtoolProbe {
    if (!this._probe) {
      this._probe = createProbe(this.config ?? { appName: 'angular-app' });
    }
    return this._probe;
  }
  
  /**
   * Create a moduleId helper for a specific library
   */
  createModuleHelper(moduleId: string) {
    return {
      registerEntity: (opts: { id: string; label: string; objects: any[] }) => {
        this.probe.registerLogicalEntity({
          ...opts,
          moduleId,
        });
      },
      unregisterEntity: (id: string) => {
        this.probe.unregisterLogicalEntity(id);
      },
    };
  }
  
  ngOnDestroy(): void {
    this._probe?.dispose();
  }
}
```

### Nx Library Module ID Generator

```typescript
// tools/generators/threelens-module-id/index.ts
// Nx generator to create moduleId constants for each library

import { Tree, formatFiles, generateFiles, names } from '@nx/devkit';
import * as path from 'path';

interface Schema {
  project: string;
}

export default async function (tree: Tree, schema: Schema) {
  const projectRoot = `libs/${schema.project}`;
  const moduleId = `libs/${schema.project}`;
  
  generateFiles(
    tree,
    path.join(__dirname, 'files'),
    projectRoot + '/src',
    {
      moduleId,
      className: names(schema.project).className,
    }
  );
  
  await formatFiles(tree);
}

// Template: files/devtool.module-id.ts.template
// export const THREELENS_MODULE_ID = '<%= moduleId %>';
```

---

## Advanced Features

### Multi-Select with Lasso

```typescript
// @3lens/interactive/src/lasso-select.ts

import * as THREE from 'three';
import type { DevtoolProbe } from '@3lens/core';

export class LassoSelect {
  private isDrawing = false;
  private path: THREE.Vector2[] = [];
  private overlayCanvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  
  constructor(
    private canvas: HTMLCanvasElement,
    private camera: THREE.Camera,
    private probe: DevtoolProbe
  ) {
    this.overlayCanvas = this.createOverlay();
    this.ctx = this.overlayCanvas.getContext('2d')!;
    this.setupEvents();
  }
  
  private createOverlay(): HTMLCanvasElement {
    const overlay = document.createElement('canvas');
    overlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
    `;
    this.canvas.parentElement?.appendChild(overlay);
    this.syncSize();
    return overlay;
  }
  
  private syncSize(): void {
    this.overlayCanvas.width = this.canvas.clientWidth;
    this.overlayCanvas.height = this.canvas.clientHeight;
  }
  
  private setupEvents(): void {
    this.canvas.addEventListener('pointerdown', this.onPointerDown);
    this.canvas.addEventListener('pointermove', this.onPointerMove);
    this.canvas.addEventListener('pointerup', this.onPointerUp);
  }
  
  private onPointerDown = (e: PointerEvent): void => {
    if (!e.shiftKey) return; // Require shift for lasso
    this.isDrawing = true;
    this.path = [this.getPoint(e)];
  };
  
  private onPointerMove = (e: PointerEvent): void => {
    if (!this.isDrawing) return;
    this.path.push(this.getPoint(e));
    this.drawPath();
  };
  
  private onPointerUp = (): void => {
    if (!this.isDrawing) return;
    this.isDrawing = false;
    this.selectObjectsInPath();
    this.clearOverlay();
  };
  
  private getPoint(e: PointerEvent): THREE.Vector2 {
    const rect = this.canvas.getBoundingClientRect();
    return new THREE.Vector2(
      e.clientX - rect.left,
      e.clientY - rect.top
    );
  }
  
  private drawPath(): void {
    this.ctx.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);
    this.ctx.beginPath();
    this.ctx.strokeStyle = '#00ff00';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([5, 5]);
    
    if (this.path.length > 0) {
      this.ctx.moveTo(this.path[0].x, this.path[0].y);
      for (let i = 1; i < this.path.length; i++) {
        this.ctx.lineTo(this.path[i].x, this.path[i].y);
      }
      this.ctx.closePath();
      this.ctx.stroke();
      this.ctx.fillStyle = 'rgba(0, 255, 0, 0.1)';
      this.ctx.fill();
    }
  }
  
  private clearOverlay(): void {
    this.ctx.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);
    this.path = [];
  }
  
  private selectObjectsInPath(): void {
    // Sample points inside the lasso and raycast
    // This is a simplified approach
    const selectedObjects: THREE.Object3D[] = [];
    
    // Grid sampling inside bounding box of lasso
    const bounds = this.getPathBounds();
    const step = 20; // pixels
    
    for (let x = bounds.minX; x < bounds.maxX; x += step) {
      for (let y = bounds.minY; y < bounds.maxY; y += step) {
        if (this.isPointInPath(x, y)) {
          const obj = this.raycastAt(x, y);
          if (obj && !selectedObjects.includes(obj)) {
            selectedObjects.push(obj);
          }
        }
      }
    }
    
    // Emit multi-select event
    this.probe.emit('multi-select', selectedObjects);
  }
  
  private getPathBounds() {
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;
    for (const p of this.path) {
      minX = Math.min(minX, p.x);
      minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x);
      maxY = Math.max(maxY, p.y);
    }
    return { minX, minY, maxX, maxY };
  }
  
  private isPointInPath(x: number, y: number): boolean {
    // Point-in-polygon test
    let inside = false;
    for (let i = 0, j = this.path.length - 1; i < this.path.length; j = i++) {
      const xi = this.path[i].x, yi = this.path[i].y;
      const xj = this.path[j].x, yj = this.path[j].y;
      
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    return inside;
  }
  
  private raycastAt(x: number, y: number): THREE.Object3D | null {
    // Similar to InspectMode raycasting
    return null; // Implementation omitted for brevity
  }
  
  dispose(): void {
    this.overlayCanvas.remove();
    this.canvas.removeEventListener('pointerdown', this.onPointerDown);
    this.canvas.removeEventListener('pointermove', this.onPointerMove);
    this.canvas.removeEventListener('pointerup', this.onPointerUp);
  }
}
```

### Time-Travel for Object State

```typescript
// @3lens/core/src/features/time-travel.ts

import * as THREE from 'three';
import type { DevtoolProbe } from '../probe';

interface ObjectSnapshot {
  timestamp: number;
  frame: number;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  visible: boolean;
  material?: {
    color?: number;
    opacity?: number;
    // ... other properties
  };
}

export class ObjectTimeTravel {
  private history: Map<string, ObjectSnapshot[]> = new Map();
  private maxHistoryLength = 300; // ~5 seconds at 60fps
  private isRecording = false;
  
  constructor(private probe: DevtoolProbe) {}
  
  startRecording(objectId: string): void {
    this.isRecording = true;
    this.history.set(objectId, []);
    
    this.probe.onFrameStats((stats) => {
      if (!this.isRecording) return;
      
      const obj = this.probe.getObjectById(objectId);
      if (!obj) return;
      
      const snapshots = this.history.get(objectId)!;
      snapshots.push(this.captureSnapshot(obj, stats.frame, stats.timestamp));
      
      // Limit history size
      if (snapshots.length > this.maxHistoryLength) {
        snapshots.shift();
      }
    });
  }
  
  stopRecording(): void {
    this.isRecording = false;
  }
  
  private captureSnapshot(obj: THREE.Object3D, frame: number, timestamp: number): ObjectSnapshot {
    const snapshot: ObjectSnapshot = {
      timestamp,
      frame,
      position: { x: obj.position.x, y: obj.position.y, z: obj.position.z },
      rotation: { x: obj.rotation.x, y: obj.rotation.y, z: obj.rotation.z },
      scale: { x: obj.scale.x, y: obj.scale.y, z: obj.scale.z },
      visible: obj.visible,
    };
    
    if (obj instanceof THREE.Mesh && obj.material) {
      const mat = obj.material as THREE.MeshStandardMaterial;
      snapshot.material = {
        color: mat.color?.getHex(),
        opacity: mat.opacity,
      };
    }
    
    return snapshot;
  }
  
  getHistory(objectId: string): ObjectSnapshot[] {
    return this.history.get(objectId) ?? [];
  }
  
  applySnapshot(objectId: string, snapshotIndex: number): void {
    const obj = this.probe.getObjectById(objectId);
    const snapshots = this.history.get(objectId);
    
    if (!obj || !snapshots || !snapshots[snapshotIndex]) return;
    
    const snapshot = snapshots[snapshotIndex];
    obj.position.set(snapshot.position.x, snapshot.position.y, snapshot.position.z);
    obj.rotation.set(snapshot.rotation.x, snapshot.rotation.y, snapshot.rotation.z);
    obj.scale.set(snapshot.scale.x, snapshot.scale.y, snapshot.scale.z);
    obj.visible = snapshot.visible;
    
    // Note: Changing material properties would require more care
  }
  
  clear(objectId?: string): void {
    if (objectId) {
      this.history.delete(objectId);
    } else {
      this.history.clear();
    }
  }
}
```

### Pinned Object Metrics

```typescript
// @3lens/overlay/src/features/pinned-metrics.ts

import type { DevtoolProbe, ObjectMeta } from '@3lens/core';

interface PinnedObject {
  objectId: string;
  meta: ObjectMeta;
  position: { x: number; y: number };
}

export class PinnedMetrics {
  private pinnedObjects: Map<string, PinnedObject> = new Map();
  private overlay: HTMLDivElement;
  
  constructor(
    private container: HTMLElement,
    private probe: DevtoolProbe
  ) {
    this.overlay = this.createOverlay();
    this.container.appendChild(this.overlay);
    
    // Update pinned objects on each frame
    this.probe.onFrameStats(() => {
      this.updatePinnedMetrics();
    });
  }
  
  pin(objectId: string): void {
    const meta = this.probe.getObjectMeta(objectId);
    if (!meta) return;
    
    this.pinnedObjects.set(objectId, {
      objectId,
      meta,
      position: { x: 10, y: 10 + this.pinnedObjects.size * 80 },
    });
    
    this.updatePinnedMetrics();
  }
  
  unpin(objectId: string): void {
    this.pinnedObjects.delete(objectId);
    this.updatePinnedMetrics();
  }
  
  private createOverlay(): HTMLDivElement {
    const el = document.createElement('div');
    el.className = 'threelens-pinned-metrics';
    el.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      pointer-events: none;
      z-index: 9998;
    `;
    return el;
  }
  
  private updatePinnedMetrics(): void {
    this.overlay.innerHTML = '';
    
    for (const [id, pinned] of this.pinnedObjects) {
      const stats = this.probe.getObjectStats(id);
      if (!stats) continue;
      
      const badge = document.createElement('div');
      badge.style.cssText = `
        position: absolute;
        left: ${pinned.position.x}px;
        top: ${pinned.position.y}px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        font-family: monospace;
        font-size: 11px;
        pointer-events: auto;
      `;
      badge.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 4px;">📌 ${pinned.meta.name || id.slice(0, 8)}</div>
        <div>🔺 ${stats.triangles?.toLocaleString() ?? '?'} tris</div>
        <div>⚡ ${stats.drawCalls ?? '?'} calls</div>
      `;
      
      this.overlay.appendChild(badge);
    }
  }
  
  dispose(): void {
    this.overlay.remove();
  }
}
```

---

## Configuration Examples

### Full Configuration File

```javascript
// 3lens.config.js

/** @type {import('@3lens/core').ProbeConfig} */
module.exports = {
  appName: 'MyThreeApp',
  env: 'development',
  
  sampling: {
    frameStats: 'every-frame',    // or number for every N frames
    snapshots: 'on-change',       // 'manual' | 'on-change' | 'every-frame'
    gpuTiming: true,
    resourceTracking: true,
  },
  
  rules: {
    maxDrawCalls: 2000,
    maxTriangles: 5_000_000,
    maxFrameTimeMs: 16.67,        // 60fps target
    maxTextures: 100,
    maxTextureMemory: 512 * 1024 * 1024, // 512MB
    
    custom: [
      {
        id: 'no-uncompressed-textures',
        name: 'Uncompressed Texture Warning',
        check: (stats) => {
          // Custom logic here
          return { passed: true };
        },
      },
    ],
  },
  
  tags: {
    environment: 'staging',
    team: 'graphics',
    version: '1.2.3',
  },
  
  // Framework bridges to auto-load
  bridges: ['react', 'r3f'],
  
  // Plugins to load
  plugins: [
    '@3lens/plugin-lod-checker',
    '@3lens/plugin-xr-debug',
  ],
  
  // Overlay settings (for npm mode)
  overlay: {
    position: 'right',
    size: '400px',
    collapsed: false,
    theme: 'dark',
    toggleShortcut: 'ctrl+shift+d',
  },
  
  // CI mode settings
  ci: {
    enabled: process.env.CI === 'true',
    outputPath: './threelens-report.json',
    screenshotOnFailure: true,
    failOnViolation: true,
  },
};
```

### Module-Level Configuration (Nx)

```typescript
// libs/viewer/src/threelens.config.ts

import type { ModuleConfig } from '@3lens/core';

export const VIEWER_CONFIG: ModuleConfig = {
  moduleId: 'libs/viewer',
  displayName: 'Viewer Module',
  
  rules: {
    maxTriangles: 1_500_000,
    maxDrawCalls: 500,
  },
  
  entityConventions: {
    prefix: 'viewer:',
    requiredLabels: true,
  },
};
```

---

## Next Steps

With these implementation notes, you can begin building 3Lens by:

1. **Start with `@3lens/core`** - Implement the basic `DevtoolProbe` class
2. **Add WebGL adapter** - Hook into `renderer.render()` and collect stats
3. **Build the overlay** - Create the dockable panel UI
4. **Add interactive features** - Implement the inspect mode and overlays
5. **Create framework bridges** - Start with React, then Angular
6. **Add advanced features** - Lasso select, time-travel, pinned metrics

Refer to the [DEVELOPMENT-PLAN.md](./DEVELOPMENT-PLAN.md) for the full phased roadmap.

