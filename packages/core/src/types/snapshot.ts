import type { TrackedObjectRef } from './objects';

/**
 * Complete scene snapshot
 */
export interface SceneSnapshot {
  /**
   * Unique snapshot ID
   */
  snapshotId: string;

  /**
   * Timestamp when snapshot was taken
   */
  timestamp: number;

  /**
   * All observed scenes
   */
  scenes: SceneNode[];
}

/**
 * Node in the scene graph snapshot
 */
export interface SceneNode {
  /**
   * Object reference
   */
  ref: TrackedObjectRef;

  /**
   * Transform data
   */
  transform: TransformData;

  /**
   * Is object visible
   */
  visible: boolean;

  /**
   * Is frustum culling enabled
   */
  frustumCulled: boolean;

  /**
   * Object layers
   */
  layers: number;

  /**
   * Render order
   */
  renderOrder: number;

  /**
   * Bounding box (if computed)
   */
  boundingBox?: Box3Data;

  /**
   * Bounding sphere (if computed)
   */
  boundingSphere?: SphereData;

  /**
   * Child nodes
   */
  children: SceneNode[];

  /**
   * Mesh-specific data
   */
  meshData?: MeshNodeData;

  /**
   * Light-specific data
   */
  lightData?: LightNodeData;

  /**
   * Camera-specific data
   */
  cameraData?: CameraNodeData;
}

/**
 * Transform data
 */
export interface TransformData {
  position: Vector3Data;
  rotation: EulerData;
  scale: Vector3Data;
  worldMatrix: Matrix4Data;
}

/**
 * 3D vector data
 */
export interface Vector3Data {
  x: number;
  y: number;
  z: number;
}

/**
 * Euler rotation data
 */
export interface EulerData {
  x: number;
  y: number;
  z: number;
  order: string;
}

/**
 * 4x4 matrix data
 */
export interface Matrix4Data {
  elements: number[];
}

/**
 * Axis-aligned bounding box data
 */
export interface Box3Data {
  min: Vector3Data;
  max: Vector3Data;
}

/**
 * Bounding sphere data
 */
export interface SphereData {
  center: Vector3Data;
  radius: number;
}

/**
 * Mesh-specific node data
 */
export interface MeshNodeData {
  geometryRef: string;
  materialRefs: string[];
  vertexCount: number;
  faceCount: number;
  castShadow: boolean;
  receiveShadow: boolean;
}

/**
 * Light-specific node data
 */
export interface LightNodeData {
  lightType:
    | 'ambient'
    | 'directional'
    | 'point'
    | 'spot'
    | 'hemisphere'
    | 'rect';
  color: number;
  intensity: number;
  castShadow: boolean;
  distance?: number;
  decay?: number;
  angle?: number;
  penumbra?: number;
}

/**
 * Camera-specific node data
 */
export interface CameraNodeData {
  cameraType: 'perspective' | 'orthographic';
  near: number;
  far: number;
  fov?: number;
  aspect?: number;
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
}

