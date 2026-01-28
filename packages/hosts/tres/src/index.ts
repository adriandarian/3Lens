/**
 * @3lens/host-tres
 *
 * TresJS/Vue host for Tres applications.
 * Provides composables and automatic integration with the Tres render loop.
 *
 * @packageDocumentation
 */

import type { CaptureContext } from '@3lens/kernel';
import { createEntityId } from '@3lens/kernel';
import { BaseHost, type Host, type HostConfig } from '@3lens/runtime';

/**
 * Tres host configuration
 */
export interface TresHostConfig extends HostConfig {
  /** Optional Tres context (provided automatically by composable) */
  tresContext?: TresContext;
}

/**
 * Minimal Tres context interface
 */
interface TresContext {
  renderer: { value: THREE.WebGLRenderer };
  scene: { value: THREE.Scene };
  camera: { value: THREE.Camera };
  invalidate: () => void;
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
 * Create a Tres host
 *
 * @example
 * ```vue
 * <script setup>
 * import { tresHost } from '@3lens/host-tres';
 * import { useLens } from '@3lens/vue-bridge';
 *
 * const host = tresHost();
 * useLens(host);
 * </script>
 * ```
 */
export function tresHost(config: TresHostConfig = {}): Host {
  return new TresHost(config);
}

/**
 * Tres host implementation
 */
class TresHost extends BaseHost {
  private config: TresHostConfig;
  private frameNumber = 0;
  private seenEntities = new Set<string>();
  private loopCallback: ((delta: number) => void) | null = null;

  constructor(config: TresHostConfig) {
    super({ id: 'tres', name: 'TresJS Host', ...config });
    this.config = config;
  }

  /**
   * Set the Tres context (called by composable)
   */
  setTresContext(ctx: TresContext): void {
    this.config.tresContext = ctx;
    this.renderer = ctx.renderer.value;
    this.scene = ctx.scene.value;
    this.camera = ctx.camera.value;
  }

  /**
   * Get the loop callback for onLoop/useRenderLoop
   */
  getLoopCallback(): (delta: number) => void {
    return (delta) => {
      if (this.context) {
        this.onFrame(delta);
      }
    };
  }

  async attach(context: CaptureContext): Promise<void> {
    this.context = context;

    const tresCtx = this.config.tresContext;
    if (!tresCtx) {
      console.warn('[3lens/tres] No Tres context available. Use with useLens composable.');
      return;
    }

    const renderer = tresCtx.renderer.value;
    const scene = tresCtx.scene.value;
    const camera = tresCtx.camera.value;

    // Check if late attach
    const isLateAttach = renderer.info.render.frame > 0;

    // Emit context register
    context.emit({
      type: 'context_register',
      timestamp: performance.now(),
      display_name: 'Tres',
      renderer_id: createEntityId(context.id, 'renderer', '0'),
      scene_id: createEntityId(context.id, 'scene', scene.uuid),
      camera_id: createEntityId(context.id, 'camera', camera.uuid),
      backend: renderer.capabilities.isWebGL2 ? 'webgl2' : 'webgl1',
      discovery: 'tres',
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
    this.loopCallback = null;
    super.detach();
  }

  private onFrame(_delta: number): void {
    if (!this.context || !this.config.tresContext) return;

    const renderer = this.config.tresContext.renderer.value;
    const scene = this.config.tresContext.scene.value;
    const camera = this.config.tresContext.camera.value;

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

export type { TresHostConfig, TresContext };
