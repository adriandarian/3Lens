/**
 * Material data types for the Materials Inspector
 */

/**
 * Serialized material data for transport to the devtool UI
 */
export interface MaterialData {
  /**
   * Material UUID (from material.uuid)
   */
  uuid: string;

  /**
   * Material name (from material.name)
   */
  name: string;

  /**
   * Material type (e.g., 'MeshStandardMaterial', 'ShaderMaterial')
   */
  type: string;

  /**
   * Whether this is a built-in Three.js material or a custom shader
   */
  isShaderMaterial: boolean;

  /**
   * Base color (hex value)
   */
  color?: number;

  /**
   * Emissive color (hex value)
   */
  emissive?: number;

  /**
   * Opacity (0-1)
   */
  opacity: number;

  /**
   * Whether the material is transparent
   */
  transparent: boolean;

  /**
   * Whether the material is visible
   */
  visible: boolean;

  /**
   * Material side (0=Front, 1=Back, 2=Double)
   */
  side: number;

  /**
   * Depth test enabled
   */
  depthTest: boolean;

  /**
   * Depth write enabled
   */
  depthWrite: boolean;

  /**
   * Wireframe mode
   */
  wireframe: boolean;

  /**
   * PBR properties (for MeshStandardMaterial, MeshPhysicalMaterial)
   */
  pbr?: {
    roughness: number;
    metalness: number;
    reflectivity?: number;
    clearcoat?: number;
    clearcoatRoughness?: number;
    sheen?: number;
    sheenRoughness?: number;
    transmission?: number;
    thickness?: number;
    ior?: number;
  };

  /**
   * Texture references (UUIDs)
   */
  textures: MaterialTextureRef[];

  /**
   * Shader information (for ShaderMaterial, RawShaderMaterial)
   */
  shader?: {
    /**
     * Vertex shader source code
     */
    vertexShader: string;

    /**
     * Fragment shader source code
     */
    fragmentShader: string;

    /**
     * Uniform definitions
     */
    uniforms: UniformData[];

    /**
     * Shader defines
     */
    defines: Record<string, string | number | boolean>;
  };

  /**
   * Number of meshes using this material
   */
  usageCount: number;

  /**
   * Debug IDs of meshes using this material
   */
  usedByMeshes: string[];
}

/**
 * Reference to a texture used by a material
 */
export interface MaterialTextureRef {
  /**
   * Texture slot name (e.g., 'map', 'normalMap', 'roughnessMap')
   */
  slot: string;

  /**
   * Texture UUID
   */
  uuid: string;

  /**
   * Texture name (if any)
   */
  name?: string;
}

/**
 * Uniform data from a shader material
 */
export interface UniformData {
  /**
   * Uniform name
   */
  name: string;

  /**
   * Uniform type (inferred from value)
   */
  type: 'float' | 'int' | 'vec2' | 'vec3' | 'vec4' | 'mat3' | 'mat4' | 'sampler2D' | 'samplerCube' | 'struct' | 'unknown';

  /**
   * Serialized value (primitives, arrays, or null for complex types)
   */
  value: unknown;
}

/**
 * Summary of materials in the scene
 */
export interface MaterialsSummary {
  /**
   * Total number of unique materials
   */
  totalCount: number;

  /**
   * Breakdown by material type
   */
  byType: Record<string, number>;

  /**
   * Number of shader materials (custom shaders)
   */
  shaderMaterialCount: number;

  /**
   * Number of materials with transparency
   */
  transparentCount: number;
}

