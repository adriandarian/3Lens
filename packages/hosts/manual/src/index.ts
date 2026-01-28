/**
 * @3lens/host-manual
 *
 * Manual host for vanilla three.js setups.
 * Works with any three.js configuration where user provides renderer/scene/camera.
 *
 * @packageDocumentation
 */

import type { CaptureContext } from '@3lens/kernel';
import { createEntityId } from '@3lens/kernel';
import { BaseHost, type Host, type HostConfig } from '@3lens/runtime';

/**
 * Manual host configuration
 */
export interface ManualHostConfig extends HostConfig {
  /** three.js renderer */
  renderer: THREE.WebGLRenderer;
  /** three.js scene */
  scene: THREE.Scene;
  /** three.js camera */
  camera: THREE.Camera;
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
 * Create a manual host
 */
export function manualHost(config: ManualHostConfig): Host {
  const host = new ManualHost(config);
  return host;
}

/**
 * Manual host implementation
 */
class ManualHost extends BaseHost {
  private config: ManualHostConfig;
  private originalRender: typeof THREE.WebGLRenderer.prototype.render | null = null;
  private frameNumber = 0;
  private seenEntities = new Set<string>();

  constructor(config: ManualHostConfig) {
    super({ id: 'manual', name: 'Manual Host' });
    this.config = config;
    this.renderer = config.renderer;
    this.scene = config.scene;
    this.camera = config.camera;
  }

  async attach(context: CaptureContext): Promise<void> {
    this.context = context;

    const renderer = this.config.renderer;
    const scene = this.config.scene;
    const camera = this.config.camera;

    // Check if late attach
    const isLateAttach = renderer.info.render.frame > 0;

    // Emit context register
    context.emit({
      type: 'context_register',
      timestamp: performance.now(),
      display_name: 'Main',
      renderer_id: createEntityId(context.id, 'renderer', '0'),
      scene_id: createEntityId(context.id, 'scene', scene.uuid),
      camera_id: createEntityId(context.id, 'camera', camera.uuid),
      backend: renderer.capabilities.isWebGL2 ? 'webgl2' : 'webgl1',
      discovery: 'manual',
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
    // Scan scene hierarchy
    this.scanObject(context, scene, null);
  }

  private scanObject(
    context: CaptureContext,
    obj: THREE.Object3D,
    parentId: string | null
  ): void {
    const entityId = createEntityId(context.id, 'object3d', obj.uuid);

    if (!this.seenEntities.has(entityId)) {
      this.seenEntities.add(entityId);

      context.emit({
        type: 'object_added',
        timestamp: performance.now(),
        entity_id: entityId,
        object_type: obj.type,
        parent_id: parentId ?? createEntityId(context.id, 'scene', (obj.parent as THREE.Scene)?.uuid ?? ''),
        name: obj.name || undefined,
      });
    }

    // Recurse into children
    for (const child of obj.children) {
      this.scanObject(context, child, entityId);
    }
  }
}

export type { ManualHostConfig };
