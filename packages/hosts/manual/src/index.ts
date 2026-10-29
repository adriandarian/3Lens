import type { BufferGeometry, Camera, Material, Object3D, Scene, Texture, WebGLRenderer } from 'three';
import { Box3, Raycaster, Vector2, Vector3 } from 'three';
import type { CaptureContext, Edge, Node, ResourceType } from '@3lens/kernel';
import { createEntityId } from '@3lens/kernel';
import type { Host, HostConfig } from '@3lens/runtime';

/** Explicit attachment to an application-owned renderer and render loop. */
export interface ManualHostConfig extends HostConfig {
  id?: string;
  name?: string;
  renderer: WebGLRenderer;
  scene: Scene;
  camera: Camera;
  /** Allows application-owned orbit controls to retain a focus operation. */
  onFocus?: (target: { x: number; y: number; z: number }, position: { x: number; y: number; z: number }) => void;
}

export function manualHost(config: ManualHostConfig): Host {
  return new ManualHost(config);
}

type ObservedNode = Node & Record<string, unknown>;
type Resource = BufferGeometry | Material | Texture;

/** Hosts observe runtime objects; only serializable events cross into the kernel. */
class ManualHost implements Host {
  readonly id: string;
  readonly name: string;
  private context: CaptureContext | null = null;
  private originalRender: WebGLRenderer['render'] | null = null;
  private wrappedRender: WebGLRenderer['render'] | null = null;
  private frameNumber = 0;
  private nodes = new Map<string, ObservedNode>();
  private snapshotSignature = '';
  private resourceListeners = new Map<Resource, () => void>();
  private disposedResources = new Set<Resource>();
  private observedPrograms = new Set<string>();
  private programSources = new Map<string,{vertex:string|null;fragment:string|null;defines:Record<string,string|boolean>;definesTruncated:boolean}>();
  private historyTrimmed = false;

  constructor(private config: ManualHostConfig) {
    this.id = config.id ?? 'manual';
    this.name = config.name ?? 'Manual Host';
  }

  attach(context: CaptureContext): void {
    if (this.context === context) return;
    if (this.context) this.detach();
    this.context = context;
    this.nodes.clear();
    this.snapshotSignature = '';
    this.frameNumber = 0;
    this.historyTrimmed = false;
    const { renderer, scene, camera } = this.config;
    const backend = (renderer.capabilities as { isWebGL2?: boolean }).isWebGL2 === false ? 'webgl1' : 'webgl2';
    context.emit({
      type: 'context_register', timestamp: performance.now(), display_name: this.name,
      renderer_id: createEntityId(context.id, 'renderer', '0'),
      scene_id: createEntityId(context.id, 'scene', scene.uuid),
      camera_id: createEntityId(context.id, 'camera', camera.uuid),
      backend, discovery: 'manual', discovery_fidelity: 'EXACT',
    });
    if (renderer.info.render.frame > 0) {
      let count = 0;
      scene.traverse(() => count++);
      context.emit({ type: 'attach_point', timestamp: performance.now(), frame: renderer.info.render.frame, preexisting_count: count });
    }
    this.scan(context, scene, camera);
    const original = renderer.render;
    this.originalRender = original;
    const host = this;
    const wrapped: WebGLRenderer['render'] = function (this: WebGLRenderer, renderedScene: Scene, renderedCamera: Camera) {
      // A later application wrapper may retain this function after detach.
      if (host.wrappedRender !== wrapped) return original.call(this, renderedScene, renderedCamera);
      host.scan(context, renderedScene, renderedCamera);
      const frame = host.frameNumber++;
      const start = performance.now();
      // A render call need not equal an application frame (postprocessing/multiple views).
      context.emit({ type: 'frame_begin', timestamp: start, frame, fidelity: 'ESTIMATED' });
      const result = original.call(this, renderedScene, renderedCamera);
      const end = performance.now();
      context.emit({
        type: 'render_event', timestamp: end, frame,
        scene_id: createEntityId(context.id, 'scene', renderedScene.uuid),
        camera_id: createEntityId(context.id, 'camera', renderedCamera.uuid),
        draw_calls: renderer.info.render.calls, triangles: renderer.info.render.triangles,
        // autoReset=false gives cumulative counters, not this call's draw count.
        metrics_fidelity: renderer.info.autoReset === false ? 'ESTIMATED' : 'EXACT',
      });
      context.emit({ type: 'frame_end', timestamp: end, frame, duration_ms: end - start, duration_fidelity: 'EXACT' });
      return result;
    };
    this.wrappedRender = wrapped;
    renderer.render = wrapped;
    context.emit({
      type: 'warning_event', timestamp: performance.now(), category: 'capability_unavailable',
      message: 'Application frame boundaries are ESTIMATED from render calls. Per-object GPU time and GPU memory are UNAVAILABLE; geometry memory is an ESTIMATED CPU-buffer proxy.',
    });
  }

  detach(): void {
    // Do not overwrite a wrapper installed by the application after our attachment.
    if (this.originalRender && this.config.renderer.render === this.wrappedRender) {
      this.config.renderer.render = this.originalRender;
    }
    this.originalRender = null;
    this.wrappedRender = null;
    for (const [resource, listener] of this.resourceListeners) resource.removeEventListener('dispose', listener);
    this.resourceListeners.clear();
    this.disposedResources.clear();
    this.observedPrograms.clear();
    this.programSources.clear();
    this.context?.emit({ type: 'context_unregister', timestamp: performance.now(), reason: 'detach' });
    this.context = null;
  }

  getRenderer() { return this.config.renderer; }
  getScene() { return this.config.scene; }
  getCamera() { return this.config.camera; }
  isAttached() { return this.context !== null; }

  getViewportBounds() {
    const bounds = this.config.renderer.domElement.getBoundingClientRect?.();
    return bounds ? { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height } : null;
  }

  pick(x: number, y: number): string | null {
    if (!this.context || !Number.isFinite(x) || !Number.isFinite(y) || x < 0 || x > 1 || y < 0 || y > 1) return null;
    this.config.scene.updateMatrixWorld(true);
    this.config.camera.updateMatrixWorld(true);
    const ray = new Raycaster();
    ray.setFromCamera(new Vector2(x * 2 - 1, 1 - y * 2), this.config.camera);
    const hit = ray.intersectObjects(this.config.scene.children, true).find(item => {
      let object: Object3D | null = item.object;
      while (object) { if (!object.visible) return false; object = object.parent; }
      return true;
    });
    return hit ? createEntityId(this.context.id, 'object3d', hit.object.uuid) : null;
  }

  private findObject(entityId: string): Object3D | undefined {
    if (!this.context || !entityId.startsWith(`${this.context.id}:`)) return undefined;
    const uuid = entityId.split(':').slice(2).join(':');
    let found: Object3D | undefined;
    this.config.scene.traverse(object => {
      const mesh = object as Object3D & { geometry?: BufferGeometry; material?: Material | Material[] };
      if (object.uuid === uuid || mesh.geometry?.uuid === uuid ||
          (mesh.material && (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).some(material => material.uuid === uuid))) {
        found ??= object;
      }
    });
    return found;
  }

  focus(entityId: string): boolean {
    const object = this.findObject(entityId);
    if (!object) return false;
    object.updateWorldMatrix(true, true);
    const box = new Box3().setFromObject(object);
    if (box.isEmpty()) return false;
    const target = box.getCenter(new Vector3());
    const size = box.getSize(new Vector3()).length();
    const camera = this.config.camera;
    const direction = camera.position.clone().sub(target).normalize();
    if (!direction.lengthSq()) direction.set(0, 0.6, 1).normalize();
    camera.position.copy(target).addScaledVector(direction, Math.max(1, size * 1.8));
    camera.lookAt(target);
    camera.updateMatrixWorld(true);
    this.config.onFocus?.({x:target.x,y:target.y,z:target.z}, {x:camera.position.x,y:camera.position.y,z:camera.position.z});
    return true;
  }

  highlight(entityId: string | null): boolean { return entityId === null || Boolean(this.findObject(entityId)); }

  getEntityBounds(entityId: string) {
    const object = this.findObject(entityId);
    if (!object) return null;
    object.updateWorldMatrix(true, true);
    const box = new Box3().setFromObject(object);
    if (box.isEmpty()) return null;
    this.config.camera.updateMatrixWorld(true);
    const points: Vector3[] = [];
    for (const x of [box.min.x,box.max.x]) for (const y of [box.min.y,box.max.y]) for (const z of [box.min.z,box.max.z]) {
      points.push(new Vector3(x,y,z).project(this.config.camera));
    }
    if (points.every(point => point.z > 1 || point.z < -1)) return null;
    const left = Math.max(0, Math.min(...points.map(point => (point.x + 1) / 2)));
    const top = Math.max(0, Math.min(...points.map(point => (1 - point.y) / 2)));
    const right = Math.min(1, Math.max(...points.map(point => (point.x + 1) / 2)));
    const bottom = Math.min(1, Math.max(...points.map(point => (1 - point.y) / 2)));
    return right > left && bottom > top ? {x:left,y:top,width:right-left,height:bottom-top} : null;
  }

  private scan(context: CaptureContext, scene: Scene, camera: Camera): void {
    if (context.mode === 'MINIMAL') return;
    const next = new Map<string, ObservedNode>();
    const edges: Edge[] = [];
    const id = (type: string, uuid: string) => createEntityId(context.id, type, uuid);
    const rendererId = id('renderer', '0');
    const add = (type: Node['type'], uuid: string, properties: Record<string, unknown>): string => {
      const entityId = id(type, uuid);
      const old = this.nodes.get(entityId);
      const comparable = { id: entityId, type, context_id: context.id, origin: old?.origin ?? (this.snapshotSignature ? 'created' : 'preexisting'), active: true, ...properties };
      const previous = old && Object.fromEntries(Object.entries(old).filter(([key]) => key !== 'created_at' && key !== 'modified_at'));
      const signatureValue = (key:string,value:unknown) => key === 'vertex_source' || key === 'fragment_source' ? undefined : value;
      const changed = JSON.stringify(comparable,signatureValue) !== JSON.stringify(previous,signatureValue);
      const node = { ...comparable, created_at: old?.created_at ?? context.seq, modified_at: changed ? context.seq : old!.modified_at } as ObservedNode;
      next.set(entityId, node);
      return entityId;
    };
    const edge = (from: string, to: string, type: Edge['type'], extra: Record<string, unknown> = {}) => {
      edges.push({ from, to, type, active: true, created_at: this.nodes.get(from)?.created_at ?? context.seq, ...extra } as Edge);
    };
    const uses = (from: string, to: string, usage: 'geometry' | 'material' | 'texture', slot?: string) => {
      edge(from, to, 'uses', { usage, ...(slot ? { slot } : {}) });
      edge(to, from, 'used_by', { usage, ...(slot ? { slot } : {}) });
    };
    const resource = (value: Resource, type: ResourceType, properties: Record<string, unknown>): string => {
      const resourceId = id(type, value.uuid);
      if (next.has(resourceId)) return resourceId;
      const active = !this.disposedResources.has(value);
      add(type as Node['type'], value.uuid, { name: value.name || value.type, ...properties, active, ownership: 'external' });
      edge(rendererId, resourceId, 'owns', { ownership: 'external' });
      if (!this.resourceListeners.has(value)) {
        const listener = () => {
          this.disposedResources.add(value);
          context.emit({ type: 'resource_dispose', timestamp: performance.now(), entity_id: resourceId, reason: 'explicit' });
          this.scan(context, scene, camera);
        };
        value.addEventListener('dispose', listener);
        this.resourceListeners.set(value, listener);
      }
      return resourceId;
    };
    const geometry = (value: BufferGeometry) => {
      const buffers = new Set<ArrayBufferLike>();
      const attributes = Object.entries(value.attributes).map(([name, attribute]) => {
        const array = 'data' in attribute ? attribute.data.array : attribute.array;
        buffers.add(array.buffer);
        return { name, item_size: attribute.itemSize, count: attribute.count, normalized: attribute.normalized, dynamic: false };
      });
      if (value.index) buffers.add(value.index.array.buffer);
      return resource(value, 'geometry', {
        is_indexed: !!value.index, vertex_count: value.attributes.position?.count ?? 0,
        index_count: value.index?.count, attributes,
        memory_bytes: [...buffers].reduce((sum, buffer) => sum + buffer.byteLength, 0),
        memory_fidelity: 'ESTIMATED', memory_reason: 'CPU backing-buffer bytes; GPU allocation, alignment and driver copies are not observable.',
      });
    };
    const texture = (value: Texture) => resource(value, 'texture', {
      texture_type: 'texture2d', width: (value.image as { width?: number })?.width ?? 0, height: (value.image as { height?: number })?.height ?? 0,
      format: String(value.format), mag_filter: String(value.magFilter), min_filter: String(value.minFilter),
      wrap_s: String(value.wrapS), wrap_t: String(value.wrapT), anisotropy: value.anisotropy,
      mipmaps: value.generateMipmaps, memory_bytes: 0, memory_fidelity: 'UNAVAILABLE',
      memory_reason: 'GPU texture allocation size is not observable through this host.',
      source_url: typeof (value.image as { currentSrc?: unknown })?.currentSrc === 'string'
        ? (value.image as { currentSrc: string }).currentSrc
        : typeof (value.image as { src?: unknown })?.src === 'string' ? (value.image as { src: string }).src : undefined,
    });
    const material = (value: Material) => {
      const textureSlots = Object.entries(value).filter(([, candidate]) => candidate?.isTexture) as [string, Texture][];
      const textureIds = textureSlots.map(([, candidate]) => texture(candidate));
      const details = value as Material & { roughness?: number; metalness?: number; color?: { getHex(): number }; defines?: Record<string, string | number | boolean> };
      const materialId = resource(value, 'material', {
        material_type: value.type, is_custom: value.type.includes('Shader'), transparent: value.transparent,
        opacity: value.opacity, side: value.side === 2 ? 'double' : value.side === 1 ? 'back' : 'front',
        depth_test: value.depthTest, depth_write: value.depthWrite, blending: String(value.blending),
        texture_ids: textureIds, defines: details.defines ?? {},
        variant_count_fidelity: 'UNAVAILABLE', variant_count_reason: 'Shader compilation is not observed by the manual host.',
        roughness: details.roughness, metalness: details.metalness, color: details.color?.getHex(),
      });
      textureSlots.forEach(([slot], index) => uses(materialId, textureIds[index], 'texture', slot));
      // Private renderer program hooks stay inside the host and are feature-detected.
      // Read the actual compiled runtime source; authored material source is not a substitute.
      try {
        const renderer = this.config.renderer as WebGLRenderer & { properties?: { get(value: Material): { currentProgram?: any; programs?: Map<string, any> } } };
        const runtime = renderer.properties?.get(value) as { currentProgram?: any; programs?: Map<string,any> } | undefined;
        const candidates = new Set<any>([runtime?.currentProgram, ...Array.from(runtime?.programs?.values?.() ?? [])]);
        const gl = renderer.getContext?.();
        for (const program of candidates) {
          if (!program || program.id === undefined || !gl?.getShaderSource || !program.vertexShader || !program.fragmentShader) continue;
          const programKey = `program-${program.id}`;
          let source = this.programSources.get(programKey);
          if (!source) {
            const vertex = gl.getShaderSource(program.vertexShader), fragment = gl.getShaderSource(program.fragmentShader);
            const defines: Record<string,string | boolean> = {};
            let definesTruncated = false;
            // Horizontal whitespace is intentional: \s would consume the newline
            // after a valueless flag and incorrectly swallow the next directive.
            const directives = /^[ \t]*#define[ \t]+(USE_[A-Z0-9_]+|STANDARD|PHYSICAL|NUM_[A-Z0-9_]+)(?:[ \t]+([^\r\n]*))?\r?$/gm;
            for (const match of `${vertex ?? ''}\n${fragment ?? ''}`.matchAll(directives)) {
              if (!(match[1] in defines) && Object.keys(defines).length >= 64) { definesTruncated = true; continue; }
              const rawValue = match[2]?.replace(/\/\/.*$/,'').trim();
              if (rawValue && rawValue.length > 64) { definesTruncated = true; continue; }
              defines[match[1]] = rawValue || true;
            }
            source = {vertex,fragment,defines,definesTruncated};
            this.programSources.set(programKey,source);
          }
          const {vertex,fragment,defines,definesTruncated} = source;
          if (!vertex && !fragment) continue;
          const shaderId = add('shader',programKey,{name:`${value.type} / program ${program.id}`,shader_type:value.type.includes('Shader') ? 'custom' : 'builtin',
            vertex_source:vertex ?? undefined,fragment_source:fragment ?? undefined,variant_count:1,uniform_count:0,attribute_count:0,
            binding_count_fidelity:'UNAVAILABLE',source_fidelity:'EXACT',defines,defines_truncated:definesTruncated});
          const variantId = add('shader_variant',programKey,{name:`${value.type} / variant ${program.id}`,parent_shader_id:shaderId,
            defines,defines_truncated:definesTruncated,define_hash:String(program.cacheKey ?? program.id),compiled:true,compile_time_fidelity:'UNAVAILABLE'});
          edge(variantId,shaderId,'variant_of');
          edge(materialId,variantId,'uses',{usage:'shader'});
          edge(variantId,materialId,'used_by',{usage:'shader'});
          if (!this.observedPrograms.has(programKey)) {
            this.observedPrograms.add(programKey);
            context.emit({type:'shader_compile',timestamp:performance.now(),shader_id:shaderId,variant_id:variantId,
              material_id:materialId,defines:Object.keys(defines),timing_fidelity:'UNAVAILABLE'});
          }
        }
      } catch {
        // Unsupported renderer internals never break the application's rendering loop.
      }
      return materialId;
    };
    const { renderer } = this.config;
    add('renderer', '0', {
      name: 'Renderer', backend: (renderer.capabilities as { isWebGL2?: boolean }).isWebGL2 === false ? 'webgl1' : 'webgl2',
      canvas_width: renderer.domElement.width, canvas_height: renderer.domElement.height,
      pixel_ratio: renderer.getPixelRatio?.() ?? 1, antialias: renderer.getContextAttributes?.()?.antialias ?? false,
    });
    const sceneId = add('scene', scene.uuid, { name: scene.name || 'Scene', child_count: scene.children.length });
    const view = camera as Camera & { near?: number; far?: number; fov?: number; zoom?: number; aspect?: number; isOrthographicCamera?: boolean };
    const cameraId = add('camera', camera.uuid, {
      name: camera.name || 'Camera', camera_type: view.isOrthographicCamera ? 'orthographic' : 'perspective',
      near: view.near, far: view.far, fov: view.fov, zoom: view.zoom, aspect: view.aspect,
    });
    edge(rendererId, sceneId, 'references', { ref_type: 'hard' });
    edge(rendererId, cameraId, 'references', { ref_type: 'hard' });
    const visit = (object: Object3D, parentId: string) => {
      const mesh = object as Object3D & { geometry?: BufferGeometry; material?: Material | Material[] };
      const geometryId = mesh.geometry && geometry(mesh.geometry);
      const materialIds = mesh.material && (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).map(material);
      const objectId = add('object3d', object.uuid, {
        name: object.name || object.type, object_type: object.type, visible: object.visible,
        frustum_culled: object.frustumCulled, render_order: object.renderOrder, layer_mask: object.layers.mask,
        parent_id: parentId, child_count: object.children.length,
        ...(geometryId ? { geometry_id: geometryId } : {}),
        ...(materialIds ? { material_id: materialIds.length === 1 ? materialIds[0] : materialIds } : {}),
      });
      edge(parentId, objectId, 'contains');
      edge(objectId, parentId, 'child_of');
      if (geometryId) uses(objectId, geometryId, 'geometry');
      materialIds?.forEach((materialId) => uses(objectId, materialId, 'material'));
      object.children.forEach((child) => visit(child, objectId));
    };
    scene.children.forEach((child) => visit(child, sceneId));
    // A resource leaving the scene is not proof of disposal. Keep a bounded
    // serializable history, but release live dispose-listener references below.
    const currentlyReferenced = new Set(next.keys());
    const historical = [...this.nodes.values()].filter(node =>
      ['geometry','material','texture','render_target'].includes(node.type) && !next.has(node.id));
    if (historical.length > 512 && !this.historyTrimmed) {
      this.historyTrimmed = true;
      context.emit({type:'warning_event',timestamp:performance.now(),category:'buffer_pressure',
        message:'Resource history exceeded 512 unreferenced entries; oldest unreferenced resource states were omitted.'});
    }
    for (const node of historical.slice(-512)) {
      next.set(node.id,{...node,unreferenced:true,modified_at:node.unreferenced ? node.modified_at : context.seq});
    }
    const snapshot = { nodes: [...next.values()], edges: [...new Map(edges.map((edge) => [`${edge.from}|${edge.to}|${edge.type}`, edge])).values()] };
    const signature = JSON.stringify(snapshot,(key,value) => key === 'vertex_source' || key === 'fragment_source' ? undefined : value);
    if (signature !== this.snapshotSignature) {
      this.nodes = next;
      this.snapshotSignature = signature;
      context.emit({ type: 'context_update', timestamp: performance.now(), changes: { metadata: { graph_snapshot: snapshot } } });
    }
    // Stop retaining resources once the scene no longer references them.
    for (const [value, listener] of this.resourceListeners) {
      const type = (value as Texture).isTexture ? 'texture' : (value as Material).isMaterial ? 'material' : 'geometry';
      if (!currentlyReferenced.has(id(type, value.uuid))) {
        value.removeEventListener('dispose', listener);
        this.resourceListeners.delete(value);
        this.disposedResources.delete(value);
      }
    }
  }
}
