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
  MaterialData,
  MaterialTextureRef,
  UniformData,
  MaterialsSummary,
  GeometryData,
  GeometryAttributeData,
  GeometryGroupData,
  GeometrySummary,
  TextureData,
  TextureSourceInfo,
  TextureMaterialUsage,
  TexturesSummary,
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
  private materialsByUuid: Map<string, THREE.Material> = new Map();
  private geometriesByUuid: Map<string, THREE.BufferGeometry> = new Map();
  private texturesByUuid: Map<string, THREE.Texture> = new Map();
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
   * Find a material by its UUID
   */
  findMaterialByUuid(uuid: string): THREE.Material | null {
    return this.materialsByUuid.get(uuid) ?? null;
  }

  /**
   * Find a geometry by its UUID
   */
  findGeometryByUuid(uuid: string): THREE.BufferGeometry | null {
    return this.geometriesByUuid.get(uuid) ?? null;
  }

  /**
   * Collect all materials from the scene
   */
  collectMaterials(): { materials: MaterialData[]; summary: MaterialsSummary } {
    const materialMap = new Map<string, { material: THREE.Material; meshDebugIds: string[] }>();

    // Clear and rebuild material tracking
    this.materialsByUuid.clear();

    // Traverse scene and collect all materials
    this.scene.traverse((obj) => {
      if (this.isMesh(obj)) {
        const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
        const meshRef = this.getOrCreateRef(obj);

        for (const material of materials) {
          if (!material) continue;

          // Track material by UUID for later lookup
          this.materialsByUuid.set(material.uuid, material);

          const existing = materialMap.get(material.uuid);
          if (existing) {
            existing.meshDebugIds.push(meshRef.debugId);
          } else {
            materialMap.set(material.uuid, {
              material,
              meshDebugIds: [meshRef.debugId],
            });
          }
        }
      }
    });

    // Convert to MaterialData array
    const materials: MaterialData[] = [];
    const byType: Record<string, number> = {};
    let shaderMaterialCount = 0;
    let transparentCount = 0;

    for (const [, { material, meshDebugIds }] of materialMap) {
      const data = this.createMaterialData(material, meshDebugIds);
      materials.push(data);

      // Update summary stats
      byType[data.type] = (byType[data.type] || 0) + 1;
      if (data.isShaderMaterial) shaderMaterialCount++;
      if (data.transparent) transparentCount++;
    }

    // Sort materials by type, then by name
    materials.sort((a, b) => {
      if (a.type !== b.type) return a.type.localeCompare(b.type);
      return (a.name || '').localeCompare(b.name || '');
    });

    const summary: MaterialsSummary = {
      totalCount: materials.length,
      byType,
      shaderMaterialCount,
      transparentCount,
    };

    return { materials, summary };
  }

  /**
   * Collect all geometries from the scene
   */
  collectGeometries(): { geometries: GeometryData[]; summary: GeometrySummary } {
    const geometryMap = new Map<string, { geometry: THREE.BufferGeometry; meshDebugIds: string[] }>();

    // Clear and rebuild geometry tracking
    this.geometriesByUuid.clear();

    // Traverse scene and collect all geometries
    this.scene.traverse((obj) => {
      if (this.isMesh(obj)) {
        const geometry = obj.geometry;
        if (!geometry) return;

        const meshRef = this.getOrCreateRef(obj);

        // Track geometry by UUID for later lookup
        this.geometriesByUuid.set(geometry.uuid, geometry);

        const existing = geometryMap.get(geometry.uuid);
        if (existing) {
          existing.meshDebugIds.push(meshRef.debugId);
        } else {
          geometryMap.set(geometry.uuid, {
            geometry,
            meshDebugIds: [meshRef.debugId],
          });
        }
      }
    });

    // Convert to GeometryData array
    const geometries: GeometryData[] = [];
    const byType: Record<string, number> = {};
    let totalVertices = 0;
    let totalTriangles = 0;
    let totalMemoryBytes = 0;
    let indexedCount = 0;
    let morphedCount = 0;

    for (const [, { geometry, meshDebugIds }] of geometryMap) {
      const data = this.createGeometryData(geometry, meshDebugIds);
      geometries.push(data);

      // Update summary stats
      byType[data.type] = (byType[data.type] || 0) + 1;
      totalVertices += data.vertexCount;
      totalTriangles += data.faceCount;
      totalMemoryBytes += data.memoryBytes;
      if (data.isIndexed) indexedCount++;
      if (data.morphAttributes && data.morphAttributes.length > 0) morphedCount++;
    }

    // Sort geometries by memory usage (largest first), then by name
    geometries.sort((a, b) => {
      if (a.memoryBytes !== b.memoryBytes) return b.memoryBytes - a.memoryBytes;
      return (a.name || '').localeCompare(b.name || '');
    });

    const summary: GeometrySummary = {
      totalCount: geometries.length,
      totalVertices,
      totalTriangles,
      totalMemoryBytes,
      byType,
      indexedCount,
      morphedCount,
    };

    return { geometries, summary };
  }

  /**
   * Collect all textures from the scene
   */
  collectTextures(): { textures: TextureData[]; summary: TexturesSummary } {
    // Build a map of texture UUID -> { texture, material usages }
    const textureMap = new Map<string, {
      texture: THREE.Texture;
      usages: TextureMaterialUsage[];
    }>();

    // Clear and rebuild texture tracking
    this.texturesByUuid.clear();

    // Collect materials first to get texture references
    const { materials } = this.collectMaterials();

    // Build texture usage map from materials
    for (const matData of materials) {
      const material = this.materialsByUuid.get(matData.uuid);
      if (!material) continue;

      // Check all texture slots
      const textureSlots = this.getTextureSlots();
      for (const slot of textureSlots) {
        if (slot in material) {
          const texture = (material as Record<string, unknown>)[slot] as THREE.Texture | null;
          if (texture && texture.uuid) {
            // Track texture by UUID
            this.texturesByUuid.set(texture.uuid, texture);

            const existing = textureMap.get(texture.uuid);
            const usage: TextureMaterialUsage = {
              materialUuid: matData.uuid,
              materialName: matData.name || `<${matData.type}>`,
              slot,
            };

            if (existing) {
              existing.usages.push(usage);
            } else {
              textureMap.set(texture.uuid, {
                texture,
                usages: [usage],
              });
            }
          }
        }
      }

      // Also check shader material uniforms for textures
      if (matData.shader?.uniforms) {
        for (const uniform of matData.shader.uniforms) {
          if (uniform.type === 'sampler2D' || uniform.type === 'samplerCube') {
            const uniformValue = uniform.value as { uuid?: string } | null;
            if (uniformValue?.uuid) {
              const texture = this.findTextureInMaterial(material, uniform.name);
              if (texture) {
                this.texturesByUuid.set(texture.uuid, texture);

                const existing = textureMap.get(texture.uuid);
                const usage: TextureMaterialUsage = {
                  materialUuid: matData.uuid,
                  materialName: matData.name || `<${matData.type}>`,
                  slot: uniform.name,
                };

                if (existing) {
                  existing.usages.push(usage);
                } else {
                  textureMap.set(texture.uuid, {
                    texture,
                    usages: [usage],
                  });
                }
              }
            }
          }
        }
      }
    }

    // Convert to TextureData array
    const textures: TextureData[] = [];
    const byType: Record<string, number> = {};
    let totalMemoryBytes = 0;
    let cubeTextureCount = 0;
    let compressedCount = 0;
    let videoTextureCount = 0;
    let renderTargetCount = 0;

    for (const [, { texture, usages }] of textureMap) {
      const data = this.createTextureData(texture, usages);
      textures.push(data);

      // Update summary stats
      byType[data.type] = (byType[data.type] || 0) + 1;
      totalMemoryBytes += data.memoryBytes;
      if (data.isCubeTexture) cubeTextureCount++;
      if (data.isCompressed) compressedCount++;
      if (data.isVideoTexture) videoTextureCount++;
      if (data.isRenderTarget) renderTargetCount++;
    }

    // Sort textures by memory usage (largest first), then by name
    textures.sort((a, b) => {
      if (a.memoryBytes !== b.memoryBytes) return b.memoryBytes - a.memoryBytes;
      return (a.name || '').localeCompare(b.name || '');
    });

    const summary: TexturesSummary = {
      totalCount: textures.length,
      totalMemoryBytes,
      byType,
      cubeTextureCount,
      compressedCount,
      videoTextureCount,
      renderTargetCount,
    };

    return { textures, summary };
  }

  /**
   * Get all texture slot names to check in materials
   */
  private getTextureSlots(): string[] {
    return [
      'map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap',
      'emissiveMap', 'bumpMap', 'displacementMap', 'alphaMap',
      'envMap', 'lightMap', 'specularMap', 'gradientMap',
      'clearcoatMap', 'clearcoatNormalMap', 'clearcoatRoughnessMap',
      'sheenColorMap', 'sheenRoughnessMap', 'transmissionMap', 'thicknessMap',
      'iridescenceMap', 'iridescenceThicknessMap', 'anisotropyMap',
      'specularIntensityMap', 'specularColorMap',
    ];
  }

  /**
   * Find a texture in a material by uniform name
   */
  private findTextureInMaterial(material: THREE.Material, uniformName: string): THREE.Texture | null {
    if ('uniforms' in material) {
      const shaderMat = material as THREE.ShaderMaterial;
      const uniform = shaderMat.uniforms?.[uniformName];
      if (uniform?.value?.isTexture) {
        return uniform.value as THREE.Texture;
      }
    }
    return null;
  }

  /**
   * Find a texture by its UUID
   */
  findTextureByUuid(uuid: string): THREE.Texture | null {
    return this.texturesByUuid.get(uuid) ?? null;
  }

  /**
   * Create TextureData from a three.js Texture
   */
  private createTextureData(texture: THREE.Texture, usages: TextureMaterialUsage[]): TextureData {
    const isCubeTexture = 'isCubeTexture' in texture && (texture as THREE.CubeTexture).isCubeTexture === true;
    const isDataTexture = 'isDataTexture' in texture && (texture as THREE.DataTexture).isDataTexture === true;
    const isCompressedTexture = 'isCompressedTexture' in texture;
    const isVideoTexture = 'isVideoTexture' in texture;
    const isCanvasTexture = 'isCanvasTexture' in texture;
    const isRenderTargetTexture = 'isRenderTargetTexture' in texture;

    // Get dimensions
    const image = texture.image;
    let width = 0;
    let height = 0;
    if (image) {
      if (isCubeTexture && Array.isArray(image) && image.length > 0) {
        width = image[0]?.width || image[0]?.naturalWidth || 0;
        height = image[0]?.height || image[0]?.naturalHeight || 0;
      } else {
        width = image.width || image.naturalWidth || image.videoWidth || 0;
        height = image.height || image.naturalHeight || image.videoHeight || 0;
      }
    }

    // Estimate memory usage
    const memoryBytes = this.estimateTextureMemory(texture, width, height, isCubeTexture);

    // Get source info
    const source = this.getTextureSourceInfo(texture);

    // Generate thumbnail for 2D textures (if possible and small enough)
    let thumbnail: string | undefined;
    if (!isCubeTexture && !isVideoTexture && image && width > 0 && height > 0) {
      thumbnail = this.generateTextureThumbnail(texture, width, height);
    }

    const data: TextureData = {
      uuid: texture.uuid,
      name: texture.name || '',
      type: texture.type || texture.constructor.name || 'Texture',
      source,
      dimensions: { width, height },
      format: texture.format,
      formatName: this.getFormatName(texture.format),
      dataType: texture.type as number,
      dataTypeName: this.getDataTypeName(texture.type as number),
      mipmaps: {
        enabled: texture.generateMipmaps || (texture.mipmaps && texture.mipmaps.length > 0),
        count: texture.mipmaps?.length || 0,
        generateMipmaps: texture.generateMipmaps,
      },
      wrap: {
        s: texture.wrapS,
        t: texture.wrapT,
        sName: this.getWrapName(texture.wrapS),
        tName: this.getWrapName(texture.wrapT),
      },
      filtering: {
        mag: texture.magFilter,
        min: texture.minFilter,
        magName: this.getFilterName(texture.magFilter),
        minName: this.getFilterName(texture.minFilter),
      },
      anisotropy: texture.anisotropy,
      colorSpace: texture.colorSpace || 'srgb',
      flipY: texture.flipY,
      premultiplyAlpha: texture.premultiplyAlpha,
      memoryBytes,
      isCompressed: isCompressedTexture,
      isRenderTarget: isRenderTargetTexture,
      isCubeTexture,
      isDataTexture,
      isVideoTexture,
      isCanvasTexture,
      thumbnail,
      usedByMaterials: usages,
      usageCount: usages.length,
    };

    // Add encoding if present (legacy)
    if ('encoding' in texture) {
      data.encoding = (texture as { encoding: number }).encoding;
    }

    // Add compression format if compressed
    if (isCompressedTexture && texture.mipmaps && texture.mipmaps.length > 0) {
      data.compressionFormat = this.getCompressionFormat(texture.format);
    }

    return data;
  }

  /**
   * Get texture source information
   */
  private getTextureSourceInfo(texture: THREE.Texture): TextureSourceInfo {
    const image = texture.image;
    let type: TextureSourceInfo['type'] = 'unknown';
    let url: string | undefined;
    let isLoaded = false;
    let isReady = false;

    if ('isCompressedTexture' in texture) {
      type = 'compressed';
      isLoaded = texture.mipmaps && texture.mipmaps.length > 0;
      isReady = isLoaded;
    } else if ('isDataTexture' in texture) {
      type = 'data';
      isLoaded = !!image;
      isReady = isLoaded;
    } else if ('isVideoTexture' in texture) {
      type = 'video';
      if (image instanceof HTMLVideoElement) {
        url = image.src || image.currentSrc;
        isLoaded = image.readyState >= 2;
        isReady = !image.paused;
      }
    } else if ('isCanvasTexture' in texture) {
      type = 'canvas';
      isLoaded = !!image;
      isReady = isLoaded;
    } else if (image) {
      if (image instanceof HTMLImageElement) {
        type = 'image';
        url = image.src;
        isLoaded = image.complete;
        isReady = image.complete && image.naturalWidth > 0;
      } else if (image instanceof HTMLCanvasElement) {
        type = 'canvas';
        isLoaded = true;
        isReady = true;
      } else if (image instanceof ImageBitmap) {
        type = 'image';
        isLoaded = true;
        isReady = true;
      } else if (typeof image === 'object' && 'data' in image) {
        type = 'data';
        isLoaded = true;
        isReady = true;
      }
    }

    // Try to get URL from texture source
    if (!url && 'source' in texture && texture.source) {
      const source = texture.source as { data?: { src?: string } };
      if (source.data?.src) {
        url = source.data.src;
      }
    }

    return { type, url, isLoaded, isReady };
  }

  /**
   * Estimate texture memory usage in bytes
   */
  private estimateTextureMemory(texture: THREE.Texture, width: number, height: number, isCube: boolean): number {
    if (width === 0 || height === 0) return 0;

    // Get bytes per pixel based on format and type
    const bytesPerPixel = this.getBytesPerPixel(texture.format, texture.type as number);
    
    // Base memory
    let memory = width * height * bytesPerPixel;
    
    // Cube textures have 6 faces
    if (isCube) {
      memory *= 6;
    }
    
    // Add mipmap memory (roughly 1.33x for full mipchain)
    if (texture.generateMipmaps || (texture.mipmaps && texture.mipmaps.length > 0)) {
      memory = Math.floor(memory * 1.33);
    }

    return memory;
  }

  /**
   * Get bytes per pixel for a format and type combination
   */
  private getBytesPerPixel(format: number, type: number): number {
    // Common format constants (THREE.js uses WebGL constants)
    const ALPHA = 6406;
    const RGB = 6407;
    const RGBA = 6408;
    const LUMINANCE = 6409;
    const LUMINANCE_ALPHA = 6410;
    const RED = 6403;
    const RG = 33319;
    const DEPTH_COMPONENT = 6402;
    const DEPTH_STENCIL = 34041;

    // Type constants
    const UNSIGNED_BYTE = 5121;
    const UNSIGNED_SHORT = 5123;
    const UNSIGNED_INT = 5125;
    const FLOAT = 5126;
    const HALF_FLOAT = 36193;

    let channels = 4; // Default RGBA
    switch (format) {
      case ALPHA:
      case LUMINANCE:
      case RED:
      case DEPTH_COMPONENT:
        channels = 1;
        break;
      case LUMINANCE_ALPHA:
      case RG:
      case DEPTH_STENCIL:
        channels = 2;
        break;
      case RGB:
        channels = 3;
        break;
      case RGBA:
      default:
        channels = 4;
        break;
    }

    let bytesPerChannel = 1;
    switch (type) {
      case UNSIGNED_BYTE:
        bytesPerChannel = 1;
        break;
      case UNSIGNED_SHORT:
      case HALF_FLOAT:
        bytesPerChannel = 2;
        break;
      case UNSIGNED_INT:
      case FLOAT:
        bytesPerChannel = 4;
        break;
      default:
        bytesPerChannel = 1;
    }

    return channels * bytesPerChannel;
  }

  /**
   * Generate a small thumbnail for a texture
   */
  private generateTextureThumbnail(texture: THREE.Texture, width: number, height: number): string | undefined {
    try {
      const image = texture.image;
      if (!image) return undefined;

      // Skip if image is too large or not a valid source
      if (width > 4096 || height > 4096) return undefined;

      const maxSize = 64;
      const scale = Math.min(maxSize / width, maxSize / height, 1);
      const thumbWidth = Math.floor(width * scale);
      const thumbHeight = Math.floor(height * scale);

      // Create canvas for thumbnail
      const canvas = document.createElement('canvas');
      canvas.width = thumbWidth;
      canvas.height = thumbHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return undefined;

      // Try to draw the image
      if (image instanceof HTMLImageElement || image instanceof HTMLCanvasElement || image instanceof ImageBitmap) {
        ctx.drawImage(image, 0, 0, thumbWidth, thumbHeight);
        return canvas.toDataURL('image/png');
      }

      // For data textures, we'd need special handling
      if (image.data && image.width && image.height) {
        // Skip complex data texture rendering for now
        return undefined;
      }

      return undefined;
    } catch {
      // Silently fail if we can't generate thumbnail
      return undefined;
    }
  }

  /**
   * Get human-readable format name
   */
  private getFormatName(format: number): string {
    const formatNames: Record<number, string> = {
      6406: 'Alpha',
      6407: 'RGB',
      6408: 'RGBA',
      6409: 'Luminance',
      6410: 'LuminanceAlpha',
      6402: 'Depth',
      34041: 'DepthStencil',
      6403: 'Red',
      33319: 'RG',
      33320: 'RedInteger',
      33321: 'RGInteger',
      36244: 'RGBInteger',
      36249: 'RGBAInteger',
      // Compressed formats
      33776: 'RGB_S3TC_DXT1',
      33777: 'RGBA_S3TC_DXT1',
      33778: 'RGBA_S3TC_DXT3',
      33779: 'RGBA_S3TC_DXT5',
    };
    return formatNames[format] || `Format(${format})`;
  }

  /**
   * Get human-readable data type name
   */
  private getDataTypeName(type: number): string {
    const typeNames: Record<number, string> = {
      5121: 'UnsignedByte',
      5120: 'Byte',
      5122: 'Short',
      5123: 'UnsignedShort',
      5124: 'Int',
      5125: 'UnsignedInt',
      5126: 'Float',
      36193: 'HalfFloat',
      33635: 'UnsignedShort_4_4_4_4',
      32819: 'UnsignedShort_5_5_5_1',
      32820: 'UnsignedShort_5_6_5',
    };
    return typeNames[type] || `Type(${type})`;
  }

  /**
   * Get human-readable wrap mode name
   */
  private getWrapName(wrap: number): string {
    const wrapNames: Record<number, string> = {
      10497: 'Repeat',
      33071: 'ClampToEdge',
      33648: 'MirroredRepeat',
    };
    return wrapNames[wrap] || `Wrap(${wrap})`;
  }

  /**
   * Get human-readable filter name
   */
  private getFilterName(filter: number): string {
    const filterNames: Record<number, string> = {
      9728: 'Nearest',
      9729: 'Linear',
      9984: 'NearestMipmapNearest',
      9985: 'LinearMipmapNearest',
      9986: 'NearestMipmapLinear',
      9987: 'LinearMipmapLinear',
    };
    return filterNames[filter] || `Filter(${filter})`;
  }

  /**
   * Get compression format name
   */
  private getCompressionFormat(format: number): string {
    const compressionNames: Record<number, string> = {
      33776: 'DXT1 (RGB)',
      33777: 'DXT1 (RGBA)',
      33778: 'DXT3',
      33779: 'DXT5',
      35916: 'ETC1',
      36196: 'PVRTC_4bpp_RGB',
      35840: 'PVRTC_4bpp_RGBA',
      35841: 'PVRTC_2bpp_RGB',
      35842: 'PVRTC_2bpp_RGBA',
      37492: 'ASTC_4x4',
      37496: 'ASTC_5x5',
      37808: 'BPTC',
    };
    return compressionNames[format] || `Compressed(${format})`;
  }

  /**
   * Create GeometryData from a three.js BufferGeometry
   */
  private createGeometryData(geometry: THREE.BufferGeometry, usedByMeshes: string[]): GeometryData {
    const attributes = this.collectGeometryAttributes(geometry);
    const memoryBytes = attributes.reduce((sum, attr) => sum + attr.memoryBytes, 0);

    // Calculate index memory if present
    let indexMemory = 0;
    let indexCount = 0;
    if (geometry.index) {
      indexCount = geometry.index.count;
      indexMemory = this.calculateBufferMemory(geometry.index);
    }

    // Get vertex count from position attribute
    const positionAttr = geometry.attributes.position;
    const vertexCount = positionAttr ? positionAttr.count : 0;

    // Calculate face count
    let faceCount = 0;
    if (geometry.index) {
      faceCount = geometry.index.count / 3;
    } else if (positionAttr) {
      faceCount = positionAttr.count / 3;
    }

    // Collect morph attributes
    const morphAttributes: GeometryData['morphAttributes'] = [];
    if (geometry.morphAttributes) {
      for (const [name, attrs] of Object.entries(geometry.morphAttributes)) {
        if (Array.isArray(attrs) && attrs.length > 0) {
          morphAttributes.push({
            name,
            count: attrs.length,
          });
        }
      }
    }

    // Collect groups
    const groups: GeometryGroupData[] = geometry.groups.map((g) => ({
      start: g.start,
      count: g.count,
      materialIndex: g.materialIndex ?? 0,
    }));

    const data: GeometryData = {
      uuid: geometry.uuid,
      name: geometry.name || '',
      type: geometry.type || 'BufferGeometry',
      vertexCount,
      indexCount,
      faceCount,
      isIndexed: geometry.index !== null,
      attributes,
      memoryBytes: memoryBytes + indexMemory,
      drawRange: {
        start: geometry.drawRange.start,
        count: geometry.drawRange.count,
      },
      groups,
      usageCount: usedByMeshes.length,
      usedByMeshes,
    };

    // Add bounding box if computed
    if (geometry.boundingBox) {
      data.boundingBox = {
        min: { x: geometry.boundingBox.min.x, y: geometry.boundingBox.min.y, z: geometry.boundingBox.min.z },
        max: { x: geometry.boundingBox.max.x, y: geometry.boundingBox.max.y, z: geometry.boundingBox.max.z },
      };
    }

    // Add bounding sphere if computed
    if (geometry.boundingSphere) {
      data.boundingSphere = {
        center: {
          x: geometry.boundingSphere.center.x,
          y: geometry.boundingSphere.center.y,
          z: geometry.boundingSphere.center.z,
        },
        radius: geometry.boundingSphere.radius,
      };
    }

    // Add morph attributes if present
    if (morphAttributes.length > 0) {
      data.morphAttributes = morphAttributes;
    }

    return data;
  }

  /**
   * Collect all attributes from a BufferGeometry
   */
  private collectGeometryAttributes(geometry: THREE.BufferGeometry): GeometryAttributeData[] {
    const attributes: GeometryAttributeData[] = [];

    for (const [name, attr] of Object.entries(geometry.attributes)) {
      if (!attr) continue;
      attributes.push(this.createAttributeData(name, attr as THREE.BufferAttribute));
    }

    // Sort by importance: position, normal, uv first, then others
    const priority = ['position', 'normal', 'uv', 'uv2', 'color', 'tangent'];
    attributes.sort((a, b) => {
      const aPriority = priority.indexOf(a.name);
      const bPriority = priority.indexOf(b.name);
      if (aPriority !== -1 && bPriority !== -1) return aPriority - bPriority;
      if (aPriority !== -1) return -1;
      if (bPriority !== -1) return 1;
      return a.name.localeCompare(b.name);
    });

    return attributes;
  }

  /**
   * Create attribute data from a BufferAttribute
   */
  private createAttributeData(name: string, attr: THREE.BufferAttribute): GeometryAttributeData {
    const isInstanced = 'isInstancedBufferAttribute' in attr;
    const memoryBytes = this.calculateBufferMemory(attr);

    const data: GeometryAttributeData = {
      name,
      count: attr.count,
      itemSize: attr.itemSize,
      normalized: attr.normalized,
      arrayType: attr.array.constructor.name,
      memoryBytes,
      isInstancedAttribute: isInstanced,
    };

    // Add usage hint if available
    if ('usage' in attr) {
      data.usage = this.getUsageName((attr as { usage: number }).usage);
    }

    // Add mesh per attribute for instanced attributes
    if (isInstanced && 'meshPerAttribute' in attr) {
      data.meshPerAttribute = (attr as { meshPerAttribute: number }).meshPerAttribute;
    }

    return data;
  }

  /**
   * Calculate memory usage of a buffer attribute
   */
  private calculateBufferMemory(attr: THREE.BufferAttribute): number {
    const bytesPerElement = attr.array.BYTES_PER_ELEMENT || 4;
    return attr.count * attr.itemSize * bytesPerElement;
  }

  /**
   * Get human-readable name for buffer usage
   */
  private getUsageName(usage: number): string {
    // WebGL usage constants
    const usageNames: Record<number, string> = {
      35044: 'StaticDraw',
      35048: 'DynamicDraw',
      35040: 'StreamDraw',
      35045: 'StaticRead',
      35049: 'DynamicRead',
      35041: 'StreamRead',
      35046: 'StaticCopy',
      35050: 'DynamicCopy',
      35042: 'StreamCopy',
    };
    return usageNames[usage] || `Usage(${usage})`;
  }

  /**
   * Create MaterialData from a three.js material
   */
  private createMaterialData(material: THREE.Material, usedByMeshes: string[]): MaterialData {
    const isShaderMat = this.isShaderMaterial(material);

    const data: MaterialData = {
      uuid: material.uuid,
      name: material.name || '',
      type: material.type || material.constructor.name,
      isShaderMaterial: isShaderMat,
      opacity: material.opacity,
      transparent: material.transparent,
      visible: material.visible,
      side: material.side,
      depthTest: material.depthTest,
      depthWrite: material.depthWrite,
      wireframe: 'wireframe' in material ? (material as THREE.MeshBasicMaterial).wireframe : false,
      textures: this.collectMaterialTextures(material),
      usageCount: usedByMeshes.length,
      usedByMeshes,
    };

    // Extract color if present
    if ('color' in material && material.color) {
      data.color = (material.color as THREE.Color).getHex();
    }

    // Extract emissive if present
    if ('emissive' in material && material.emissive) {
      data.emissive = (material.emissive as THREE.Color).getHex();
    }

    // Extract PBR properties
    if (this.isPBRMaterial(material)) {
      data.pbr = this.extractPBRProperties(material);
    }

    // Extract shader info for ShaderMaterial
    if (isShaderMat) {
      data.shader = this.extractShaderInfo(material as THREE.ShaderMaterial);
    }

    return data;
  }

  /**
   * Collect texture references from a material
   */
  private collectMaterialTextures(material: THREE.Material): MaterialTextureRef[] {
    const textures: MaterialTextureRef[] = [];
    const textureSlots = [
      'map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap',
      'emissiveMap', 'bumpMap', 'displacementMap', 'alphaMap',
      'envMap', 'lightMap', 'specularMap', 'gradientMap',
      'clearcoatMap', 'clearcoatNormalMap', 'clearcoatRoughnessMap',
      'sheenColorMap', 'sheenRoughnessMap', 'transmissionMap', 'thicknessMap',
    ];

    for (const slot of textureSlots) {
      if (slot in material) {
        const texture = (material as Record<string, unknown>)[slot] as THREE.Texture | null;
        if (texture) {
          textures.push({
            slot,
            uuid: texture.uuid,
            name: texture.name || undefined,
          });
        }
      }
    }

    return textures;
  }

  /**
   * Check if material is a ShaderMaterial or RawShaderMaterial
   */
  private isShaderMaterial(material: THREE.Material): boolean {
    return 'isShaderMaterial' in material || 'isRawShaderMaterial' in material;
  }

  /**
   * Check if material is a PBR material (MeshStandardMaterial or MeshPhysicalMaterial)
   */
  private isPBRMaterial(material: THREE.Material): material is THREE.MeshStandardMaterial {
    return 'isMeshStandardMaterial' in material || 'isMeshPhysicalMaterial' in material;
  }

  /**
   * Extract PBR properties from a standard/physical material
   */
  private extractPBRProperties(material: THREE.MeshStandardMaterial): MaterialData['pbr'] {
    const pbr: MaterialData['pbr'] = {
      roughness: material.roughness,
      metalness: material.metalness,
    };

    // Physical material specific properties
    if ('isMeshPhysicalMaterial' in material) {
      const phys = material as THREE.MeshPhysicalMaterial;
      pbr.reflectivity = phys.reflectivity;
      pbr.clearcoat = phys.clearcoat;
      pbr.clearcoatRoughness = phys.clearcoatRoughness;
      pbr.sheen = phys.sheen;
      pbr.sheenRoughness = phys.sheenRoughness;
      pbr.transmission = phys.transmission;
      pbr.thickness = phys.thickness;
      pbr.ior = phys.ior;
    }

    return pbr;
  }

  /**
   * Extract shader information from a ShaderMaterial
   */
  private extractShaderInfo(material: THREE.ShaderMaterial): MaterialData['shader'] {
    const uniforms: UniformData[] = [];

    if (material.uniforms) {
      for (const [name, uniform] of Object.entries(material.uniforms)) {
        uniforms.push(this.serializeUniform(name, uniform));
      }
    }

    return {
      vertexShader: material.vertexShader || '',
      fragmentShader: material.fragmentShader || '',
      uniforms,
      defines: (material.defines as Record<string, string | number | boolean>) || {},
    };
  }

  /**
   * Serialize a uniform value
   */
  private serializeUniform(name: string, uniform: THREE.IUniform): UniformData {
    const value = uniform.value;
    let type: UniformData['type'] = 'unknown';
    let serializedValue: unknown = null;

    if (value === null || value === undefined) {
      type = 'float';
      serializedValue = null;
    } else if (typeof value === 'number') {
      type = 'float';
      serializedValue = value;
    } else if (typeof value === 'boolean') {
      type = 'int';
      serializedValue = value ? 1 : 0;
    } else if (value.isVector2) {
      type = 'vec2';
      serializedValue = { x: value.x, y: value.y };
    } else if (value.isVector3) {
      type = 'vec3';
      serializedValue = { x: value.x, y: value.y, z: value.z };
    } else if (value.isVector4) {
      type = 'vec4';
      serializedValue = { x: value.x, y: value.y, z: value.z, w: value.w };
    } else if (value.isColor) {
      type = 'vec3';
      serializedValue = { r: value.r, g: value.g, b: value.b };
    } else if (value.isMatrix3) {
      type = 'mat3';
      serializedValue = Array.from(value.elements);
    } else if (value.isMatrix4) {
      type = 'mat4';
      serializedValue = Array.from(value.elements);
    } else if (value.isTexture) {
      type = 'sampler2D';
      serializedValue = { uuid: value.uuid, name: value.name };
    } else if (value.isCubeTexture) {
      type = 'samplerCube';
      serializedValue = { uuid: value.uuid, name: value.name };
    } else if (Array.isArray(value)) {
      // Could be an array of numbers or vectors
      if (value.length > 0 && typeof value[0] === 'number') {
        type = 'float';
        serializedValue = value;
      } else {
        type = 'struct';
        serializedValue = `Array[${value.length}]`;
      }
    } else if (typeof value === 'object') {
      type = 'struct';
      serializedValue = Object.keys(value).join(', ');
    }

    return { name, type, value: serializedValue };
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

