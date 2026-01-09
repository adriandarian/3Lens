import type { TrackedObjectRef } from './objects';
import type { MaterialData, MaterialsSummary } from './materials';
import type { GeometryData, GeometrySummary } from './geometry';
import type { TextureData, TexturesSummary } from './textures';
import type { RenderTargetData, RenderTargetsSummary } from './renderTargets';

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

  /**
   * All materials in the observed scenes
   */
  materials?: MaterialData[];

  /**
   * Summary of materials
   */
  materialsSummary?: MaterialsSummary;

  /**
   * All geometries in the observed scenes
   */
  geometries?: GeometryData[];

  /**
   * Summary of geometries
   */
  geometriesSummary?: GeometrySummary;

  /**
   * All textures in the observed scenes
   */
  textures?: TextureData[];

  /**
   * Summary of textures
   */
  texturesSummary?: TexturesSummary;

  /**
   * All render targets in the observed scenes
   */
  renderTargets?: RenderTargetData[];

  /**
   * Summary of render targets
   */
  renderTargetsSummary?: RenderTargetsSummary;
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
 * Material complexity info for cost analysis
 */
export interface MaterialComplexityInfo {
  type: string;
  textureCount: number;
  hasNormalMap: boolean;
  hasEnvMap: boolean;
  hasDisplacementMap: boolean;
  hasAoMap: boolean;
  transparent: boolean;
  alphaTest: boolean;
  doubleSided: boolean;
  complexityScore: number; // 1-10 scale
}

/**
 * Object cost analysis data
 */
export interface ObjectCostData {
  triangleCost: number; // Triangle count contribution
  materialComplexity: number; // Material complexity score (1-10)
  textureCost: number; // Estimated texture memory cost
  shadowCost: number; // Shadow casting/receiving cost
  totalCost: number; // Combined cost score
  costLevel: 'low' | 'medium' | 'high' | 'critical'; // Categorized cost level
  materials: MaterialComplexityInfo[];
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
  costData?: ObjectCostData;
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
