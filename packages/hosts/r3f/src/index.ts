/**
 * @3lens/host-r3f
 *
 * React Three Fiber host for R3F applications.
 * Provides hooks and automatic integration with the R3F render loop.
 *
 * @packageDocumentation
 */

import type { CaptureContext } from '@3lens/kernel';
import { createEntityId } from '@3lens/kernel';
import { BaseHost, type Host, type HostConfig } from '@3lens/runtime';

/**
 * R3F host configuration
 */
export interface R3FHostConfig extends HostConfig {
  /** Optional root state from useThree (provided automatically by hook) */
  rootState?: R3FRootState;
}

/**
 * Minimal R3F root state interface
 */
interface R3FRootState {
  gl: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.Camera;
  invalidate: () => void;
  clock: { getElapsedTime: () => number };
}

// Type declarations for three.js (to avoid full dependency)
declare namespace THREE {
  class WebGLRenderer {
    render(scene: Scene, camera: Camera): void;
    info: {
      render: {
        frame: number;
        calls: number;
        triangles: number;
      };
      memory: {
        geometries: number;
        textures: number;
      };
    };
    domElement: HTMLCanvasElement;
    capabilities: {
      isWebGL2: boolean;
    };
  }
  class Scene {
    uuid: string;
    name: string;
    children: Object3D[];
  }
  class Camera {
    uuid: string;
    name: string;
  }
  class Object3D {
    uuid: string;
    name: string;
    type: string;
    children: Object3D[];
    parent: Object3D | null;
  }
}

/**
 * Create an R3F host
 *
 * @example
 * ```tsx
 * import { r3fHost } from '@3lens/host-r3f';
 *
 * function Scene() {
 *   const host = r3fHost();
 *   useLens(host);
 *   return <mesh>...</mesh>;
 * }
 * ```
 */
export function r3fHost(config: R3FHostConfig = {}): Host {
  return new R3FHost(config);
}

/**
 * R3F host implementation
 */
class R3FHost extends BaseHost {
  private config: R3FHostConfig;
  private frameNumber = 0;
  private seenEntities = new Set<string>();
  private frameCallback: ((state: R3FRootState, delta: number) => void) | null = null;

  constructor(config: R3FHostConfig) {
    super({ id: 'r3f', name: 'React Three Fiber Host', ...config });
    this.config = config;
  }

  /**
   * Set the R3F root state (called by hook)
   */
  setRootState(state: R3FRootState): void {
    this.config.rootState = state;
    this.renderer = state.gl;
    this.scene = state.scene;
    this.camera = state.camera;
  }

  /**
   * Get the frame callback for useFrame
   */
  getFrameCallback(): (state: R3FRootState, delta: number) => void {
    return (state, delta) => {
      if (this.context) {
        this.onFrame(state, delta);
      }
    };
  }

  async attach(context: CaptureContext): Promise<void> {
    this.context = context;

    const state = this.config.rootState;
    if (!state) {
      console.warn('[3lens/r3f] No root state available. Use with useLens hook.');
      return;
    }

    const { gl: renderer, scene, camera } = state;

    // Check if late attach
    const isLateAttach = renderer.info.render.frame > 0;

    // Emit context register
    context.emit({
      type: 'context_register',
      timestamp: performance.now(),
      display_name: 'R3F',
      renderer_id: createEntityId(context.id, 'renderer', '0'),
      scene_id: createEntityId(context.id, 'scene', scene.uuid),
      camera_id: createEntityId(context.id, 'camera', camera.uuid),
      backend: renderer.capabilities.isWebGL2 ? 'webgl2' : 'webgl1',
      discovery: 'r3f',
      discovery_fidelity: 'EXACT',
    });

    // Emit late attach marker if needed
    if (isLateAttach) {
      context.emit({
        type: 'attach_point',
        timestamp: performance.now(),
        frame: renderer.info.render.frame,
        preexisting_count: this.countSceneObjects(scene),
      });

      // Scan existing entities
      this.scanExistingEntities(context, scene);
    }
  }

  detach(): void {
    this.frameCallback = null;
    super.detach();
  }

  private onFrame(state: R3FRootState, _delta: number): void {
    if (!this.context) return;

    const { gl: renderer, scene, camera } = state;

    // Frame begin
    this.context.emit({
      type: 'frame_begin',
      timestamp: performance.now(),
      frame: this.frameNumber,
      fidelity: 'EXACT',
    });

    // Render event
    this.context.emit({
      type: 'render_event',
      timestamp: performance.now(),
      frame: this.frameNumber,
      scene_id: createEntityId(this.context.id, 'scene', scene.uuid),
      camera_id: createEntityId(this.context.id, 'camera', camera.uuid),
      draw_calls: renderer.info.render.calls,
      triangles: renderer.info.render.triangles,
      metrics_fidelity: 'EXACT',
    });

    // Frame end
    this.context.emit({
      type: 'frame_end',
      timestamp: performance.now(),
      frame: this.frameNumber,
      fidelity: 'EXACT',
    });

    this.frameNumber++;
  }

  private countSceneObjects(scene: THREE.Scene): number {
    let count = 0;
    scene.children.forEach((child) => {
      count += 1 + this.countChildObjects(child);
    });
    return count;
  }

  private countChildObjects(obj: THREE.Object3D): number {
    let count = 0;
    obj.children.forEach((child) => {
      count += 1 + this.countChildObjects(child);
    });
    return count;
  }

  private scanExistingEntities(context: CaptureContext, scene: THREE.Scene): void {
    scene.children.forEach((child) => {
      this.scanObject(context, child, createEntityId(context.id, 'scene', scene.uuid));
    });
  }

  private scanObject(
    context: CaptureContext,
    obj: THREE.Object3D,
    parentId: string
  ): void {
    const entityId = createEntityId(context.id, 'object3d', obj.uuid);

    if (!this.seenEntities.has(entityId)) {
      this.seenEntities.add(entityId);

      context.emit({
        type: 'object_added',
        timestamp: performance.now(),
        entity_id: entityId,
        object_type: obj.type,
        parent_id: parentId,
        name: obj.name || undefined,
      });
    }

    for (const child of obj.children) {
      this.scanObject(context, child, entityId);
    }
  }
}

export type { R3FHostConfig, R3FRootState };
