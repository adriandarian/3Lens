/**
 * @3lens/host-worker
 *
 * Worker/OffscreenCanvas host for three.js rendering in Web Workers.
 * Enables devtools integration when rendering happens off the main thread.
 *
 * @packageDocumentation
 */

import type { CaptureContext } from '@3lens/kernel';
import { createEntityId } from '@3lens/kernel';
import { BaseHost, type Host, type HostConfig } from '@3lens/runtime';

/**
 * Worker host configuration
 */
export interface WorkerHostConfig extends HostConfig {
  /** The OffscreenCanvas to render to */
  canvas: OffscreenCanvas;
  /** three.js renderer (created with OffscreenCanvas) */
  renderer: THREE.WebGLRenderer;
  /** three.js scene */
  scene: THREE.Scene;
  /** three.js camera */
  camera: THREE.Camera;
  /** Optional MessagePort for communicating with main thread */
  port?: MessagePort;
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
    domElement: HTMLCanvasElement | OffscreenCanvas;
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
 * Create a worker host
 *
 * @example
 * ```ts
 * // In worker.ts
 * import { workerHost } from '@3lens/host-worker';
 *
 * const canvas = /* transferred OffscreenCanvas *\/;
 * const renderer = new THREE.WebGLRenderer({ canvas });
 * const scene = new THREE.Scene();
 * const camera = new THREE.PerspectiveCamera();
 *
 * const host = workerHost({ canvas, renderer, scene, camera });
 * ```
 */
export function workerHost(config: WorkerHostConfig): Host {
  return new WorkerHost(config);
}

/**
 * Worker host implementation
 */
class WorkerHost extends BaseHost {
  private config: WorkerHostConfig;
  private originalRender: typeof THREE.WebGLRenderer.prototype.render | null = null;
  private frameNumber = 0;
  private seenEntities = new Set<string>();

  constructor(config: WorkerHostConfig) {
    super({ id: 'worker', name: 'Worker Host', ...config });
    this.config = config;
    this.renderer = config.renderer;
    this.scene = config.scene;
    this.camera = config.camera;
  }

  async attach(context: CaptureContext): Promise<void> {
    this.context = context;

    const { renderer, scene, camera } = this.config;

    // Check if late attach
    const isLateAttach = renderer.info.render.frame > 0;

    // Emit context register
    context.emit({
      type: 'context_register',
      timestamp: performance.now(),
      display_name: 'Worker',
      renderer_id: createEntityId(context.id, 'renderer', '0'),
      scene_id: createEntityId(context.id, 'scene', scene.uuid),
      camera_id: createEntityId(context.id, 'camera', camera.uuid),
      backend: renderer.capabilities.isWebGL2 ? 'webgl2' : 'webgl1',
      discovery: 'worker',
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

    // Hook render
    this.hookRender(context);

    // Set up port communication if provided
    if (this.config.port) {
      this.setupPortCommunication(this.config.port);
    }
  }

  detach(): void {
    // Restore original render
    if (this.originalRender) {
      this.config.renderer.render = this.originalRender;
      this.originalRender = null;
    }

    super.detach();
  }

  private hookRender(context: CaptureContext): void {
    const renderer = this.config.renderer;
    const self = this;

    // Store original
    this.originalRender = renderer.render.bind(renderer);
    const originalRender = this.originalRender;

    // Override render
    renderer.render = function (scene: THREE.Scene, camera: THREE.Camera) {
      // Frame begin
      context.emit({
        type: 'frame_begin',
        timestamp: performance.now(),
        frame: self.frameNumber,
        fidelity: 'EXACT',
      });

      // Call original
      const result = originalRender(scene, camera);

      // Render event
      context.emit({
        type: 'render_event',
        timestamp: performance.now(),
        frame: self.frameNumber,
        scene_id: createEntityId(context.id, 'scene', scene.uuid),
        camera_id: createEntityId(context.id, 'camera', camera.uuid),
        draw_calls: renderer.info.render.calls,
        triangles: renderer.info.render.triangles,
        metrics_fidelity: 'EXACT',
      });

      // Frame end
      context.emit({
        type: 'frame_end',
        timestamp: performance.now(),
        frame: self.frameNumber,
        fidelity: 'EXACT',
      });

      self.frameNumber++;

      return result;
    };
  }

  private setupPortCommunication(port: MessagePort): void {
    // Listen for messages from main thread
    port.onmessage = (event) => {
      const { type, payload } = event.data;

      switch (type) {
        case 'ping':
          port.postMessage({ type: 'pong', payload: { frame: this.frameNumber } });
          break;

        case 'get_stats':
          if (this.config.renderer) {
            const info = this.config.renderer.info;
            port.postMessage({
              type: 'stats',
              payload: {
                frame: this.frameNumber,
                drawCalls: info.render.calls,
                triangles: info.render.triangles,
                geometries: info.memory.geometries,
                textures: info.memory.textures,
              },
            });
          }
          break;

        default:
          // Unknown message type
          break;
      }
    };

    // Notify main thread that worker host is ready
    port.postMessage({ type: 'ready', payload: { hostId: this.id } });
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

/**
 * Helper to create a MessageChannel for worker communication
 */
export function createWorkerChannel(): {
  mainPort: MessagePort;
  workerPort: MessagePort;
} {
  const channel = new MessageChannel();
  return {
    mainPort: channel.port1,
    workerPort: channel.port2,
  };
}

export type { WorkerHostConfig };
