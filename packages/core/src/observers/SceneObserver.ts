import type * as THREE from 'three';

import type {
  TrackedObjectRef,
  SceneNode,
  TransformData,
  Vector3Data,
  EulerData,
  MeshNodeData,
  LightNodeData,
  CameraNodeData,
} from '../types';

export interface SceneObserverOptions {
  onSceneChange?: () => void;
}

/**
 * Observes a three.js scene and tracks object changes
 */
export class SceneObserver {
  private scene: THREE.Scene;
  private options: SceneObserverOptions;
  private objectRefs: Map<THREE.Object3D, TrackedObjectRef> = new Map();
  private debugIdToObject: Map<string, THREE.Object3D> = new Map();
  private originalAdd: typeof THREE.Object3D.prototype.add;
  private originalRemove: typeof THREE.Object3D.prototype.remove;

  constructor(scene: THREE.Scene, options: SceneObserverOptions = {}) {
    this.scene = scene;
    this.options = options;

    // Store original methods
    this.originalAdd = scene.add.bind(scene);
    this.originalRemove = scene.remove.bind(scene);

    // Patch methods to observe changes
    this.patchSceneMethods();

    // Initial traversal
    this.traverseScene();
  }

  /**
   * Get the object reference for a three.js object
   */
  getObjectRef(obj: THREE.Object3D): TrackedObjectRef | null {
    return this.objectRefs.get(obj) ?? null;
  }

  /**
   * Find an object by its debug ID
   */
  findObjectByDebugId(debugId: string): THREE.Object3D | null {
    return this.debugIdToObject.get(debugId) ?? null;
  }

  /**
   * Create a scene node snapshot for an object
   */
  createSceneNode(obj: THREE.Object3D): SceneNode {
    const ref = this.getOrCreateRef(obj);

    const node: SceneNode = {
      ref,
      transform: this.getTransformData(obj),
      visible: obj.visible,
      frustumCulled: obj.frustumCulled,
      layers: obj.layers.mask,
      renderOrder: obj.renderOrder,
      children: [],
    };

    // Add type-specific data
    if (this.isMesh(obj)) {
      node.meshData = this.getMeshData(obj);
    } else if (this.isLight(obj)) {
      node.lightData = this.getLightData(obj);
    } else if (this.isCamera(obj)) {
      node.cameraData = this.getCameraData(obj);
    }

    // Recursively add children
    for (const child of obj.children) {
      node.children.push(this.createSceneNode(child));
    }

    return node;
  }

  /**
   * Dispose the observer
   */
  dispose(): void {
    // Restore original methods
    this.scene.add = this.originalAdd;
    this.scene.remove = this.originalRemove;

    this.objectRefs.clear();
    this.debugIdToObject.clear();
  }

  // ─────────────────────────────────────────────────────────────────
  // PRIVATE METHODS
  // ─────────────────────────────────────────────────────────────────

  private patchSceneMethods(): void {
    const self = this;

    // Patch add
    this.scene.add = function (...objects: THREE.Object3D[]) {
      const result = self.originalAdd.apply(this, objects);
      for (const obj of objects) {
        self.trackObject(obj);
      }
      self.options.onSceneChange?.();
      return result;
    };

    // Patch remove
    this.scene.remove = function (...objects: THREE.Object3D[]) {
      const result = self.originalRemove.apply(this, objects);
      for (const obj of objects) {
        self.untrackObject(obj);
      }
      self.options.onSceneChange?.();
      return result;
    };
  }

  private traverseScene(): void {
    this.scene.traverse((obj) => {
      this.trackObject(obj);
    });
  }

  private trackObject(obj: THREE.Object3D): void {
    if (this.objectRefs.has(obj)) return;

    const ref = this.createRef(obj);
    this.objectRefs.set(obj, ref);
    this.debugIdToObject.set(ref.debugId, obj);

    // Track children
    for (const child of obj.children) {
      this.trackObject(child);
    }
  }

  private untrackObject(obj: THREE.Object3D): void {
    const ref = this.objectRefs.get(obj);
    if (ref) {
      this.debugIdToObject.delete(ref.debugId);
      this.objectRefs.delete(obj);
    }

    // Untrack children
    for (const child of obj.children) {
      this.untrackObject(child);
    }
  }

  private createRef(obj: THREE.Object3D): TrackedObjectRef {
    return {
      debugId: this.generateDebugId(),
      threeUuid: obj.uuid,
      type: obj.type || obj.constructor.name,
      name: obj.name || undefined,
      path: this.computePath(obj),
    };
  }

  private getOrCreateRef(obj: THREE.Object3D): TrackedObjectRef {
    let ref = this.objectRefs.get(obj);
    if (!ref) {
      ref = this.createRef(obj);
      this.objectRefs.set(obj, ref);
      this.debugIdToObject.set(ref.debugId, obj);
    }
    return ref;
  }

  private computePath(obj: THREE.Object3D): string {
    const parts: string[] = [];
    let current: THREE.Object3D | null = obj;

    while (current) {
      parts.unshift(current.name || `<${current.type}>`);
      current = current.parent;
    }

    return '/' + parts.join('/');
  }

  private getTransformData(obj: THREE.Object3D): TransformData {
    return {
      position: this.toVector3Data(obj.position),
      rotation: this.toEulerData(obj.rotation),
      scale: this.toVector3Data(obj.scale),
      worldMatrix: { elements: Array.from(obj.matrixWorld.elements) },
    };
  }

  private toVector3Data(v: THREE.Vector3): Vector3Data {
    return { x: v.x, y: v.y, z: v.z };
  }

  private toEulerData(e: THREE.Euler): EulerData {
    return { x: e.x, y: e.y, z: e.z, order: e.order };
  }

  private isMesh(obj: THREE.Object3D): obj is THREE.Mesh {
    return 'isMesh' in obj && (obj as THREE.Mesh).isMesh === true;
  }

  private isLight(obj: THREE.Object3D): obj is THREE.Light {
    return 'isLight' in obj && (obj as THREE.Light).isLight === true;
  }

  private isCamera(obj: THREE.Object3D): obj is THREE.Camera {
    return 'isCamera' in obj && (obj as THREE.Camera).isCamera === true;
  }

  private getMeshData(mesh: THREE.Mesh): MeshNodeData {
    const geometry = mesh.geometry;
    const materials = Array.isArray(mesh.material)
      ? mesh.material
      : [mesh.material];

    let vertexCount = 0;
    let faceCount = 0;

    if (geometry) {
      const position = geometry.attributes?.position;
      if (position) {
        vertexCount = position.count;
      }
      if (geometry.index) {
        faceCount = geometry.index.count / 3;
      } else if (position) {
        faceCount = position.count / 3;
      }
    }

    return {
      geometryRef: geometry?.uuid ?? '',
      materialRefs: materials.map((m) => m?.uuid ?? ''),
      vertexCount,
      faceCount,
      castShadow: mesh.castShadow,
      receiveShadow: mesh.receiveShadow,
    };
  }

  private getLightData(light: THREE.Light): LightNodeData {
    const lightType = this.getLightType(light);

    const data: LightNodeData = {
      lightType,
      color: 'color' in light ? (light.color as THREE.Color).getHex() : 0xffffff,
      intensity: light.intensity,
      castShadow: light.castShadow,
    };

    // Add type-specific properties
    if ('distance' in light) {
      data.distance = (light as THREE.PointLight).distance;
    }
    if ('decay' in light) {
      data.decay = (light as THREE.PointLight).decay;
    }
    if ('angle' in light) {
      data.angle = (light as THREE.SpotLight).angle;
    }
    if ('penumbra' in light) {
      data.penumbra = (light as THREE.SpotLight).penumbra;
    }

    return data;
  }

  private getLightType(
    light: THREE.Light
  ): LightNodeData['lightType'] {
    if ('isAmbientLight' in light) return 'ambient';
    if ('isDirectionalLight' in light) return 'directional';
    if ('isPointLight' in light) return 'point';
    if ('isSpotLight' in light) return 'spot';
    if ('isHemisphereLight' in light) return 'hemisphere';
    if ('isRectAreaLight' in light) return 'rect';
    return 'point';
  }

  private getCameraData(camera: THREE.Camera): CameraNodeData {
    const isPerspective = 'isPerspectiveCamera' in camera;

    if (isPerspective) {
      const perspCam = camera as THREE.PerspectiveCamera;
      return {
        cameraType: 'perspective',
        near: perspCam.near,
        far: perspCam.far,
        fov: perspCam.fov,
        aspect: perspCam.aspect,
      };
    } else {
      const orthoCam = camera as THREE.OrthographicCamera;
      return {
        cameraType: 'orthographic',
        near: orthoCam.near,
        far: orthoCam.far,
        left: orthoCam.left,
        right: orthoCam.right,
        top: orthoCam.top,
        bottom: orthoCam.bottom,
      };
    }
  }

  private generateDebugId(): string {
    return 'obj_' + Math.random().toString(36).substring(2, 11);
  }
}

