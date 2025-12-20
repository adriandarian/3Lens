/**
 * Geometry data types for the Geometry Inspector
 */

/**
 * Serialized geometry data for transport to the devtool UI
 */
export interface GeometryData {
  /**
   * Geometry UUID (from geometry.uuid)
   */
  uuid: string;

  /**
   * Geometry name (from geometry.name)
   */
  name: string;

  /**
   * Geometry type (e.g., 'BufferGeometry', 'BoxGeometry')
   */
  type: string;

  /**
   * Number of vertices
   */
  vertexCount: number;

  /**
   * Number of indices (0 if non-indexed)
   */
  indexCount: number;

  /**
   * Number of triangles/faces
   */
  faceCount: number;

  /**
   * Whether the geometry is indexed
   */
  isIndexed: boolean;

  /**
   * Geometry attributes
   */
  attributes: GeometryAttributeData[];

  /**
   * Total estimated GPU memory usage in bytes
   */
  memoryBytes: number;

  /**
   * Bounding box (if computed)
   */
  boundingBox?: {
    min: { x: number; y: number; z: number };
    max: { x: number; y: number; z: number };
  };

  /**
   * Bounding sphere (if computed)
   */
  boundingSphere?: {
    center: { x: number; y: number; z: number };
    radius: number;
  };

  /**
   * Draw range
   */
  drawRange: {
    start: number;
    count: number;
  };

  /**
   * Morph attributes info
   */
  morphAttributes?: {
    name: string;
    count: number;
  }[];

  /**
   * Groups for multi-material rendering
   */
  groups: GeometryGroupData[];

  /**
   * Number of meshes using this geometry
   */
  usageCount: number;

  /**
   * Debug IDs of meshes using this geometry
   */
  usedByMeshes: string[];
}

/**
 * Geometry attribute data
 */
export interface GeometryAttributeData {
  /**
   * Attribute name (e.g., 'position', 'normal', 'uv')
   */
  name: string;

  /**
   * Number of items in the attribute
   */
  count: number;

  /**
   * Number of components per item (e.g., 3 for position, 2 for uv)
   */
  itemSize: number;

  /**
   * Whether the attribute is normalized
   */
  normalized: boolean;

  /**
   * Data type (e.g., 'Float32Array', 'Uint16Array')
   */
  arrayType: string;

  /**
   * Estimated memory usage in bytes
   */
  memoryBytes: number;

  /**
   * Usage hint (e.g., 'StaticDrawUsage', 'DynamicDrawUsage')
   */
  usage?: string;

  /**
   * Whether this is an instanced attribute
   */
  isInstancedAttribute: boolean;

  /**
   * Instance divisor for instanced attributes
   */
  meshPerAttribute?: number;
}

/**
 * Geometry group data (for multi-material support)
 */
export interface GeometryGroupData {
  /**
   * Start index
   */
  start: number;

  /**
   * Number of indices in the group
   */
  count: number;

  /**
   * Material index
   */
  materialIndex: number;
}

/**
 * Summary of geometries in the scene
 */
export interface GeometrySummary {
  /**
   * Total number of unique geometries
   */
  totalCount: number;

  /**
   * Total vertex count across all geometries
   */
  totalVertices: number;

  /**
   * Total triangle count across all geometries
   */
  totalTriangles: number;

  /**
   * Total estimated memory usage in bytes
   */
  totalMemoryBytes: number;

  /**
   * Breakdown by geometry type
   */
  byType: Record<string, number>;

  /**
   * Number of indexed geometries
   */
  indexedCount: number;

  /**
   * Number of geometries with morph targets
   */
  morphedCount: number;
}

