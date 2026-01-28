/**
 * 3Lens Entity Graph Schema
 *
 * This file defines the entity graph structure including node types,
 * edge types, and graph operations.
 *
 * @packageDocumentation
 */

import type { Fidelity } from './events';

// =============================================================================
// Entity ID
// =============================================================================

/**
 * Entity ID format: `{context_id}:{type}:{local_id}`
 *
 * Examples:
 * - `main:Mesh:abc123`
 * - `minimap:Texture:tex_001`
 * - `main:Material:mat_default`
 */
export type EntityId = string;

/**
 * Parse an entity ID into its components
 */
export function parseEntityId(id: EntityId): {
  context_id: string;
  type: string;
  local_id: string;
} {
  const parts = id.split(':');
  if (parts.length < 3) {
    throw new Error(`Invalid entity ID format: ${id}`);
  }
  return {
    context_id: parts[0],
    type: parts[1],
    local_id: parts.slice(2).join(':'), // Handle local_ids with colons
  };
}

/**
 * Create an entity ID from components
 */
export function createEntityId(context_id: string, type: string, local_id: string): EntityId {
  return `${context_id}:${type}:${local_id}`;
}

// =============================================================================
// Node Types
// =============================================================================

/**
 * Base interface for all entity nodes
 */
export interface BaseNode {
  /** Unique entity ID */
  id: EntityId;
  /** Node type discriminator */
  type: NodeType;
  /** Context this entity belongs to */
  context_id: string;
  /** Human-readable name */
  name?: string;
  /** When this entity was created (event seq) */
  created_at: number;
  /** When this entity was last modified (event seq) */
  modified_at: number;
  /** Origin of this entity */
  origin: 'created' | 'preexisting';
  /** Whether entity is currently active */
  active: boolean;
}

// -----------------------------------------------------------------------------
// Core Types
// -----------------------------------------------------------------------------

export interface RendererNode extends BaseNode {
  type: 'renderer';
  backend: 'webgl1' | 'webgl2' | 'webgpu';
  canvas_width: number;
  canvas_height: number;
  pixel_ratio: number;
  antialias: boolean;
  capabilities?: RendererCapabilities;
}

export interface RendererCapabilities {
  max_textures: number;
  max_vertex_uniforms: number;
  max_fragment_uniforms: number;
  max_texture_size: number;
  compressed_textures: string[];
  float_textures: boolean;
  depth_textures: boolean;
}

export interface SceneNode extends BaseNode {
  type: 'scene';
  background_type?: 'color' | 'texture' | 'cubemap' | 'none';
  environment_type?: 'texture' | 'cubemap' | 'none';
  fog_type?: 'linear' | 'exp' | 'exp2' | 'none';
  child_count: number;
}

export interface CameraNode extends BaseNode {
  type: 'camera';
  camera_type: 'perspective' | 'orthographic' | 'cube' | 'stereo' | 'array';
  near: number;
  far: number;
  fov?: number; // For perspective
  zoom?: number; // For orthographic
  aspect?: number;
}

// -----------------------------------------------------------------------------
// Object Types
// -----------------------------------------------------------------------------

export interface Object3DNode extends BaseNode {
  type: 'object3d';
  object_type: string; // 'Group', 'Mesh', 'Light', etc.
  visible: boolean;
  frustum_culled: boolean;
  render_order: number;
  layer_mask: number;
  parent_id?: EntityId;
  child_count: number;
}

export interface MeshNode extends Object3DNode {
  object_type: 'Mesh';
  geometry_id?: EntityId;
  material_id?: EntityId | EntityId[]; // Array for multi-material
  instance_count?: number;
}

export interface LightNode extends Object3DNode {
  object_type: 'Light';
  light_type: 'ambient' | 'directional' | 'point' | 'spot' | 'hemisphere' | 'rect';
  color: number;
  intensity: number;
  cast_shadow: boolean;
  shadow_map_id?: EntityId;
}

// -----------------------------------------------------------------------------
// Resource Types
// -----------------------------------------------------------------------------

export interface GeometryNode extends BaseNode {
  type: 'geometry';
  is_indexed: boolean;
  vertex_count: number;
  index_count?: number;
  attributes: GeometryAttribute[];
  bounding_box?: BoundingBox;
  bounding_sphere?: BoundingSphere;
  memory_bytes: number;
  memory_fidelity: Fidelity;
}

export interface GeometryAttribute {
  name: string;
  item_size: number;
  count: number;
  normalized: boolean;
  dynamic: boolean;
}

export interface BoundingBox {
  min: [number, number, number];
  max: [number, number, number];
}

export interface BoundingSphere {
  center: [number, number, number];
  radius: number;
}

export interface MaterialNode extends BaseNode {
  type: 'material';
  material_type: string; // 'MeshBasicMaterial', 'ShaderMaterial', etc.
  is_custom: boolean;
  transparent: boolean;
  opacity: number;
  side: 'front' | 'back' | 'double';
  depth_test: boolean;
  depth_write: boolean;
  blending: string;
  texture_ids: EntityId[];
  shader_id?: EntityId;
  defines: Record<string, string | number | boolean>;
  variant_count: number;
}

export interface TextureNode extends BaseNode {
  type: 'texture';
  texture_type: 'texture2d' | 'texture3d' | 'cubemap' | 'data' | 'compressed' | 'video';
  width: number;
  height: number;
  depth?: number; // For 3D textures
  format: string;
  internal_format?: string;
  mag_filter: string;
  min_filter: string;
  wrap_s: string;
  wrap_t: string;
  anisotropy: number;
  mipmaps: boolean;
  memory_bytes: number;
  memory_fidelity: Fidelity;
  source_url?: string; // Redacted in export
}

export interface RenderTargetNode extends BaseNode {
  type: 'render_target';
  width: number;
  height: number;
  samples?: number; // MSAA
  depth_buffer: boolean;
  stencil_buffer: boolean;
  color_attachments: number;
  texture_ids: EntityId[];
  memory_bytes: number;
  memory_fidelity: Fidelity;
}

// -----------------------------------------------------------------------------
// Shader Types
// -----------------------------------------------------------------------------

export interface ShaderNode extends BaseNode {
  type: 'shader';
  shader_type: 'builtin' | 'custom' | 'raw';
  vertex_source?: string; // May be omitted in minimal exports
  fragment_source?: string;
  vertex_source_hash?: string;
  fragment_source_hash?: string;
  variant_count: number;
  uniform_count: number;
  attribute_count: number;
}

export interface ShaderVariantNode extends BaseNode {
  type: 'shader_variant';
  parent_shader_id: EntityId;
  defines: Record<string, string | number | boolean>;
  define_hash: string;
  compiled: boolean;
  compile_time_ms?: number;
  compile_time_fidelity?: Fidelity;
}

export interface PipelineNode extends BaseNode {
  type: 'pipeline';
  pass_ids: EntityId[];
  render_target_ids: EntityId[];
  edge_count: number;
}

export interface PassNode extends BaseNode {
  type: 'pass';
  pass_name: string;
  tags: ('main' | 'shadow' | 'probe' | 'post' | 'ui' | 'mrt' | 'custom')[];
  input_target_ids: EntityId[];
  output_target_id?: EntityId;
  pipeline_id?: EntityId;
  order: number;
}

// -----------------------------------------------------------------------------
// Rendering Types
// -----------------------------------------------------------------------------

export interface FrameNode extends BaseNode {
  type: 'frame';
  frame_number: number;
  duration_ms?: number;
  duration_fidelity?: Fidelity;
  render_count: number;
  draw_call_count: number;
  triangle_count: number;
}

export interface DrawCallNode extends BaseNode {
  type: 'draw_call';
  frame_id: EntityId;
  pass_id?: EntityId;
  mesh_id: EntityId;
  material_id: EntityId;
  shader_variant_id?: EntityId;
  instance_count: number;
  vertex_count: number;
  index_count?: number;
  mode: string; // 'TRIANGLES', 'LINES', etc.
}

// =============================================================================
// Node Union
// =============================================================================

export type NodeType =
  | 'renderer'
  | 'scene'
  | 'camera'
  | 'object3d'
  | 'geometry'
  | 'material'
  | 'texture'
  | 'render_target'
  | 'shader'
  | 'shader_variant'
  | 'pipeline'
  | 'pass'
  | 'frame'
  | 'draw_call';

export type Node =
  | RendererNode
  | SceneNode
  | CameraNode
  | Object3DNode
  | MeshNode
  | LightNode
  | GeometryNode
  | MaterialNode
  | TextureNode
  | RenderTargetNode
  | ShaderNode
  | ShaderVariantNode
  | PipelineNode
  | PassNode
  | FrameNode
  | DrawCallNode;

// =============================================================================
// Edge Types
// =============================================================================

/**
 * Base interface for all edges
 */
export interface BaseEdge {
  /** Source entity ID */
  from: EntityId;
  /** Target entity ID */
  to: EntityId;
  /** Edge type discriminator */
  type: EdgeType;
  /** When this edge was created (event seq) */
  created_at: number;
  /** Whether edge is currently active */
  active: boolean;
}

// -----------------------------------------------------------------------------
// Structural Edges
// -----------------------------------------------------------------------------

/**
 * Parent-child relationship in scene graph
 */
export interface ContainsEdge extends BaseEdge {
  type: 'contains';
  /** Child index in parent */
  index?: number;
}

/**
 * Reverse of contains (child -> parent)
 */
export interface ChildOfEdge extends BaseEdge {
  type: 'child_of';
}

// -----------------------------------------------------------------------------
// Usage Edges
// -----------------------------------------------------------------------------

/**
 * Resource usage relationship
 */
export interface UsesEdge extends BaseEdge {
  type: 'uses';
  /** How the resource is used */
  usage: ResourceUsage;
  /** Slot/channel (for textures) */
  slot?: string;
}

export type ResourceUsage =
  | 'material' // Mesh uses material
  | 'texture' // Material uses texture
  | 'geometry' // Mesh uses geometry
  | 'render_target' // Pass uses render target
  | 'shader' // Material uses shader
  | 'environment' // Scene uses environment map
  | 'shadow_map'; // Light uses shadow map

/**
 * Reverse of uses (resource -> consumer)
 */
export interface UsedByEdge extends BaseEdge {
  type: 'used_by';
  usage: ResourceUsage;
  slot?: string;
}

// -----------------------------------------------------------------------------
// Rendering Edges
// -----------------------------------------------------------------------------

/**
 * Draw call associations
 */
export interface RendersWithEdge extends BaseEdge {
  type: 'renders_with';
  /** What aspect is associated */
  aspect: 'material' | 'shader_variant' | 'geometry';
}

/**
 * Rendering context
 */
export interface RenderedInEdge extends BaseEdge {
  type: 'rendered_in';
  /** What container */
  container: 'pass' | 'frame' | 'pipeline';
}

// -----------------------------------------------------------------------------
// Ownership Edges
// -----------------------------------------------------------------------------

/**
 * Ownership relationship
 */
export interface OwnsEdge extends BaseEdge {
  type: 'owns';
  /** Ownership type */
  ownership: 'context_owned' | 'shared' | 'external';
}

/**
 * Non-owning reference
 */
export interface ReferencesEdge extends BaseEdge {
  type: 'references';
  /** Reference type */
  ref_type: 'soft' | 'hard';
}

// -----------------------------------------------------------------------------
// Variant Edges
// -----------------------------------------------------------------------------

/**
 * Shader variant relationship
 */
export interface VariantOfEdge extends BaseEdge {
  type: 'variant_of';
}

// =============================================================================
// Edge Union
// =============================================================================

export type EdgeType =
  | 'contains'
  | 'child_of'
  | 'uses'
  | 'used_by'
  | 'renders_with'
  | 'rendered_in'
  | 'owns'
  | 'references'
  | 'variant_of';

export type Edge =
  | ContainsEdge
  | ChildOfEdge
  | UsesEdge
  | UsedByEdge
  | RendersWithEdge
  | RenderedInEdge
  | OwnsEdge
  | ReferencesEdge
  | VariantOfEdge;

// =============================================================================
// Graph Interface
// =============================================================================

/**
 * Entity graph query result
 */
export interface QueryResult<T = Node> {
  nodes: T[];
  fidelity: Fidelity;
  truncated: boolean;
  total_count: number;
}

/**
 * Entity graph interface
 */
export interface EntityGraph {
  // Node operations
  getNode(id: EntityId): Node | undefined;
  addNode(node: Node): void;
  updateNode(id: EntityId, updates: Partial<Node>): void;
  removeNode(id: EntityId): void;
  hasNode(id: EntityId): boolean;

  // Edge operations
  getEdge(from: EntityId, to: EntityId, type: EdgeType): Edge | undefined;
  addEdge(edge: Edge): void;
  removeEdge(from: EntityId, to: EntityId, type: EdgeType): void;
  hasEdge(from: EntityId, to: EntityId, type: EdgeType): boolean;

  // Queries
  getNodes(filter?: NodeFilter): QueryResult;
  getEdges(filter?: EdgeFilter): Edge[];
  getIncomingEdges(id: EntityId, type?: EdgeType): Edge[];
  getOutgoingEdges(id: EntityId, type?: EdgeType): Edge[];
  getNeighbors(id: EntityId, direction?: 'in' | 'out' | 'both', type?: EdgeType): Node[];

  // Traversal
  traverse(
    startId: EntityId,
    direction: 'in' | 'out' | 'both',
    edgeTypes?: EdgeType[],
    maxDepth?: number
  ): Node[];

  // Snapshot
  snapshot(): GraphSnapshot;
  restore(snapshot: GraphSnapshot): void;

  // Stats
  nodeCount(): number;
  edgeCount(): number;
  nodeCountByType(): Record<NodeType, number>;
}

/**
 * Node filter for queries
 */
export interface NodeFilter {
  types?: NodeType[];
  context_id?: string;
  active?: boolean;
  name_contains?: string;
  created_after?: number;
  created_before?: number;
  limit?: number;
  offset?: number;
}

/**
 * Edge filter for queries
 */
export interface EdgeFilter {
  types?: EdgeType[];
  from?: EntityId;
  to?: EntityId;
  active?: boolean;
}

/**
 * Serializable graph snapshot
 */
export interface GraphSnapshot {
  version: string;
  timestamp: number;
  nodes: Node[];
  edges: Edge[];
  context_ids: string[];
}

// =============================================================================
// Graph Utilities
// =============================================================================

/**
 * Check if a node is a resource node
 */
export function isResourceNode(
  node: Node
): node is GeometryNode | MaterialNode | TextureNode | RenderTargetNode | ShaderNode {
  return (
    node.type === 'geometry' ||
    node.type === 'material' ||
    node.type === 'texture' ||
    node.type === 'render_target' ||
    node.type === 'shader'
  );
}

/**
 * Check if a node is an object node
 */
export function isObjectNode(node: Node): node is Object3DNode | MeshNode | LightNode {
  return node.type === 'object3d';
}

/**
 * Check if a node is a shader-related node
 */
export function isShaderNode(node: Node): node is ShaderNode | ShaderVariantNode {
  return node.type === 'shader' || node.type === 'shader_variant';
}
