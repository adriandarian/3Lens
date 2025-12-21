/**
 * Render target data types for the Render Targets Inspector
 */

/**
 * Serialized render target data for transport to the devtool UI
 */
export interface RenderTargetData {
  /**
   * Render target UUID
   */
  uuid: string;

  /**
   * Render target name (if set)
   */
  name: string;

  /**
   * Render target type (e.g., 'WebGLRenderTarget', 'WebGLMultipleRenderTargets')
   */
  type: string;

  /**
   * Dimensions
   */
  dimensions: {
    width: number;
    height: number;
  };

  /**
   * Viewport (if different from full dimensions)
   */
  viewport?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };

  /**
   * Scissor test settings
   */
  scissor?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };

  /**
   * Whether scissor test is enabled
   */
  scissorTest: boolean;

  /**
   * Depth buffer enabled
   */
  depthBuffer: boolean;

  /**
   * Stencil buffer enabled
   */
  stencilBuffer: boolean;

  /**
   * Whether this is a cube render target
   */
  isCubeTarget: boolean;

  /**
   * Sample count for MSAA render targets
   */
  samples: number;

  /**
   * Number of color attachments (for MRT)
   */
  colorAttachmentCount: number;

  /**
   * Texture format for color attachment(s)
   */
  textureFormat: number;

  /**
   * Human-readable texture format name
   */
  textureFormatName: string;

  /**
   * Texture data type
   */
  textureType: number;

  /**
   * Human-readable texture data type name
   */
  textureTypeName: string;

  /**
   * Depth texture format (if using depth texture)
   */
  depthTextureFormat?: number;

  /**
   * Human-readable depth texture format name
   */
  depthTextureFormatName?: string;

  /**
   * Whether depth texture is attached
   */
  hasDepthTexture: boolean;

  /**
   * Color space
   */
  colorSpace: string;

  /**
   * Filtering modes for the texture
   */
  filtering: {
    mag: number;
    min: number;
    magName: string;
    minName: string;
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
   * Whether mipmaps are generated
   */
  generateMipmaps: boolean;

  /**
   * Estimated GPU memory usage in bytes
   */
  memoryBytes: number;

  /**
   * Preview thumbnail (base64 data URL)
   */
  thumbnail?: string;

  /**
   * Depth thumbnail (base64 data URL, grayscale)
   */
  depthThumbnail?: string;

  /**
   * Usage information - what this render target is used for
   */
  usage: RenderTargetUsage;

  /**
   * Last render timestamp
   */
  lastRenderTimestamp?: number;

  /**
   * Render count since observation started
   */
  renderCount: number;
}

/**
 * Usage categories for render targets
 */
export type RenderTargetUsage =
  | 'shadow-map'
  | 'post-process'
  | 'reflection'
  | 'refraction'
  | 'environment'
  | 'picker'
  | 'custom'
  | 'unknown';

/**
 * Summary of render targets in the scene
 */
export interface RenderTargetsSummary {
  /**
   * Total number of render targets
   */
  totalCount: number;

  /**
   * Total estimated GPU memory usage
   */
  totalMemoryBytes: number;

  /**
   * Number of shadow maps
   */
  shadowMapCount: number;

  /**
   * Number of post-processing targets
   */
  postProcessCount: number;

  /**
   * Number of cube render targets
   */
  cubeTargetCount: number;

  /**
   * Number of MRT (multiple render targets)
   */
  mrtCount: number;

  /**
   * Number of MSAA targets
   */
  msaaCount: number;
}

