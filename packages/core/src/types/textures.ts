/**
 * Texture data types for the Textures Inspector
 */

/**
 * Serialized texture data for transport to the devtool UI
 */
export interface TextureData {
  /**
   * Texture UUID (from texture.uuid)
   */
  uuid: string;

  /**
   * Texture name (from texture.name)
   */
  name: string;

  /**
   * Texture type (e.g., 'Texture', 'DataTexture', 'CubeTexture')
   */
  type: string;

  /**
   * Source image information
   */
  source: TextureSourceInfo;

  /**
   * Texture dimensions
   */
  dimensions: {
    width: number;
    height: number;
  };

  /**
   * Texture format (THREE.RGBAFormat, THREE.RGBFormat, etc.)
   */
  format: number;

  /**
   * Human-readable format name
   */
  formatName: string;

  /**
   * Texture data type (THREE.UnsignedByteType, THREE.FloatType, etc.)
   */
  dataType: number;

  /**
   * Human-readable data type name
   */
  dataTypeName: string;

  /**
   * Mipmap settings
   */
  mipmaps: {
    enabled: boolean;
    count: number;
    generateMipmaps: boolean;
  };

  /**
   * Wrapping modes
   */
  wrap: {
    s: number;
    t: number;
    sName: string;
    tName: string;
  };

  /**
   * Filtering modes
   */
  filtering: {
    mag: number;
    min: number;
    magName: string;
    minName: string;
  };

  /**
   * Anisotropy level
   */
  anisotropy: number;

  /**
   * Color space (srgb, linear, etc.)
   */
  colorSpace: string;

  /**
   * Flip Y on upload
   */
  flipY: boolean;

  /**
   * Premultiply alpha
   */
  premultiplyAlpha: boolean;

  /**
   * Texture encoding (deprecated, but still used in older Three.js)
   */
  encoding?: number;

  /**
   * Estimated GPU memory usage in bytes
   */
  memoryBytes: number;

  /**
   * Whether texture is compressed
   */
  isCompressed: boolean;

  /**
   * Compression format name (if compressed)
   */
  compressionFormat?: string;

  /**
   * Whether this is a render target texture
   */
  isRenderTarget: boolean;

  /**
   * Whether this is a cube texture
   */
  isCubeTexture: boolean;

  /**
   * Whether this is a data texture
   */
  isDataTexture: boolean;

  /**
   * Whether this is a video texture
   */
  isVideoTexture: boolean;

  /**
   * Whether this is a canvas texture
   */
  isCanvasTexture: boolean;

  /**
   * Preview thumbnail (base64 data URL, small size)
   * Only generated for 2D textures, limited to small size
   */
  thumbnail?: string;

  /**
   * Materials using this texture (slot -> material UUIDs)
   */
  usedByMaterials: TextureMaterialUsage[];

  /**
   * Total usage count across all materials
   */
  usageCount: number;
}

/**
 * Information about texture source
 */
export interface TextureSourceInfo {
  /**
   * Source type
   */
  type: 'image' | 'canvas' | 'video' | 'data' | 'compressed' | 'unknown';

  /**
   * Source URL (if loaded from URL)
   */
  url?: string;

  /**
   * Whether the texture has been loaded
   */
  isLoaded: boolean;

  /**
   * Whether the source is ready
   */
  isReady: boolean;
}

/**
 * Reference to a material using this texture
 */
export interface TextureMaterialUsage {
  /**
   * Material UUID
   */
  materialUuid: string;

  /**
   * Material name
   */
  materialName: string;

  /**
   * Slot name where texture is used (e.g., 'map', 'normalMap')
   */
  slot: string;
}

/**
 * Summary of textures in the scene
 */
export interface TexturesSummary {
  /**
   * Total number of unique textures
   */
  totalCount: number;

  /**
   * Total estimated GPU memory usage
   */
  totalMemoryBytes: number;

  /**
   * Breakdown by texture type
   */
  byType: Record<string, number>;

  /**
   * Number of cube textures
   */
  cubeTextureCount: number;

  /**
   * Number of compressed textures
   */
  compressedCount: number;

  /**
   * Number of video textures
   */
  videoTextureCount: number;

  /**
   * Number of render target textures
   */
  renderTargetCount: number;
}
