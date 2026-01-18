import type * as THREE from 'three';
import { memoize } from '../utils/Memoization';

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
  RenderTargetData,
  RenderTargetsSummary,
  RenderTargetUsage,
} from '../types';
import type { ObjectCostData, MaterialComplexityInfo } from '../types/snapshot';
import {
  ResourceLifecycleTracker,
  type ResourceLifecycleEvent,
} from '../tracking/ResourceLifecycleTracker';

// ============================================================================
// Memoized lookup functions for WebGL/texture constants
// These are called frequently during scene observation and benefit from caching
// ============================================================================

/** Lookup table for texture format names */
const FORMAT_NAMES: Record<number, string> = {
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
  33776: 'RGB_S3TC_DXT1',
  33777: 'RGBA_S3TC_DXT1',
  33778: 'RGBA_S3TC_DXT3',
  33779: 'RGBA_S3TC_DXT5',
};

/** Lookup table for data type names */
const DATA_TYPE_NAMES: Record<number, string> = {
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

/** Lookup table for wrap mode names */
const WRAP_NAMES: Record<number, string> = {
  10497: 'Repeat',
  33071: 'ClampToEdge',
  33648: 'MirroredRepeat',
};

/** Lookup table for filter names */
const FILTER_NAMES: Record<number, string> = {
  9728: 'Nearest',
  9729: 'Linear',
  9984: 'NearestMipmapNearest',
  9985: 'LinearMipmapNearest',
  9986: 'NearestMipmapLinear',
  9987: 'LinearMipmapLinear',
};

/** Lookup table for buffer usage names */
const USAGE_NAMES: Record<number, string> = {
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

/** Lookup table for compression format names */
const COMPRESSION_NAMES: Record<number, string> = {
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

/** Memoized format name lookup */
const getFormatNameMemo = memoize(
  (format: number): string => FORMAT_NAMES[format] || `Format(${format})`,
  { maxSize: 50, name: 'formatNameLookup' }
);

/** Memoized data type name lookup */
const getDataTypeNameMemo = memoize(
  (type: number): string => DATA_TYPE_NAMES[type] || `Type(${type})`,
  { maxSize: 30, name: 'dataTypeNameLookup' }
);

/** Memoized wrap mode name lookup */
const getWrapNameMemo = memoize(
  (wrap: number): string => WRAP_NAMES[wrap] || `Wrap(${wrap})`,
  { maxSize: 10, name: 'wrapNameLookup' }
);

/** Memoized filter name lookup */
const getFilterNameMemo = memoize(
  (filter: number): string => FILTER_NAMES[filter] || `Filter(${filter})`,
  { maxSize: 10, name: 'filterNameLookup' }
);

/** Memoized usage name lookup */
const getUsageNameMemo = memoize(
  (usage: number): string => USAGE_NAMES[usage] || `Usage(${usage})`,
  { maxSize: 15, name: 'usageNameLookup' }
);

/** Memoized compression format name lookup */
const getCompressionFormatMemo = memoize(
  (format: number): string =>
    COMPRESSION_NAMES[format] || `Compressed(${format})`,
  { maxSize: 20, name: 'compressionFormatLookup' }
);

export interface SceneObserverOptions {
  onSceneChange?: () => void;
  onResourceEvent?: (event: ResourceLifecycleEvent) => void;
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
  private originalAdd: THREE.Scene['add'];
  private originalRemove: THREE.Scene['remove'];

  // Resource lifecycle tracking
  private lifecycleTracker: ResourceLifecycleTracker;
  private trackedResourceUuids: Set<string> = new Set();

  constructor(scene: THREE.Scene, options: SceneObserverOptions = {}) {
    this.scene = scene;
    this.options = options;

    // Initialize lifecycle tracker
    this.lifecycleTracker = new ResourceLifecycleTracker();
    if (options.onResourceEvent) {
      this.lifecycleTracker.onEvent(options.onResourceEvent);
    }

    // Store original methods
    this.originalAdd = scene.add.bind(scene);
    this.originalRemove = scene.remove.bind(scene);

    // Patch methods to observe changes
    this.patchSceneMethods();

    // Initial traversal
    this.traverseScene();
  }

  /**
   * Get the lifecycle tracker for this observer
   */
  getLifecycleTracker(): ResourceLifecycleTracker {
    return this.lifecycleTracker;
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
    const materialMap = new Map<
      string,
      { material: THREE.Material; meshDebugIds: string[] }
    >();

    // Clear and rebuild material tracking
    this.materialsByUuid.clear();

    // Traverse scene and collect all materials
    this.scene.traverse((obj) => {
      if (this.isMesh(obj)) {
        const materials = Array.isArray(obj.material)
          ? obj.material
          : [obj.material];
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
  collectGeometries(): {
    geometries: GeometryData[];
    summary: GeometrySummary;
  } {
    const geometryMap = new Map<
      string,
      { geometry: THREE.BufferGeometry; meshDebugIds: string[] }
    >();

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
      if (data.morphAttributes && data.morphAttributes.length > 0)
        morphedCount++;
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
    const textureMap = new Map<
      string,
      {
        texture: THREE.Texture;
        usages: TextureMaterialUsage[];
      }
    >();

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
          const texture = (material as unknown as Record<string, unknown>)[
            slot
          ] as THREE.Texture | null;
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
              const texture = this.findTextureInMaterial(
                material,
                uniform.name
              );
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
   * Collect all render targets from the scene
   */
  collectRenderTargets(): {
    renderTargets: RenderTargetData[];
    summary: RenderTargetsSummary;
  } {
    const renderTargetMap = new Map<string, THREE.WebGLRenderTarget>();

    // Helper to get render target ID (WebGLRenderTarget doesn't have uuid, use texture.uuid)
    const getRtId = (rt: THREE.WebGLRenderTarget): string => {
      return (
        (rt as unknown as { uuid?: string }).uuid || rt.texture?.uuid || ''
      );
    };

    // Traverse scene to find render targets used by lights (shadow maps)
    this.scene.traverse((obj) => {
      // Check for shadow-casting lights with shadow maps
      if (this.isLight(obj) && obj.castShadow && 'shadow' in obj) {
        const shadow = (
          obj as THREE.DirectionalLight | THREE.SpotLight | THREE.PointLight
        ).shadow;
        if (shadow?.map) {
          const rt = shadow.map as THREE.WebGLRenderTarget;
          const rtId = getRtId(rt);
          if (rtId && !renderTargetMap.has(rtId)) {
            // Mark as shadow map
            (rt as unknown as { _3lensUsage?: RenderTargetUsage })._3lensUsage =
              'shadow-map';
            renderTargetMap.set(rtId, rt);
          }
        }
      }

      // Check for meshes with materials that use render targets (env maps, reflection probes, etc.)
      if (this.isMesh(obj)) {
        const materials = Array.isArray(obj.material)
          ? obj.material
          : [obj.material];
        for (const material of materials) {
          if (!material) continue;

          // Check for envMap that might be from a render target
          if ('envMap' in material && material.envMap) {
            const tex = material.envMap as THREE.Texture;
            if ('isRenderTargetTexture' in tex && tex.isRenderTargetTexture) {
              // Try to find the parent render target
              // (Note: This is tricky since the texture doesn't have a direct reference to its RT)
            }
          }
        }
      }
    });

    // Convert to RenderTargetData array
    const renderTargets: RenderTargetData[] = [];
    let totalMemoryBytes = 0;
    let shadowMapCount = 0;
    let postProcessCount = 0;
    let cubeTargetCount = 0;
    let mrtCount = 0;
    let msaaCount = 0;

    for (const [, rt] of renderTargetMap) {
      const data = this.createRenderTargetData(rt);
      renderTargets.push(data);

      // Update summary stats
      totalMemoryBytes += data.memoryBytes;
      if (data.usage === 'shadow-map') shadowMapCount++;
      if (data.usage === 'post-process') postProcessCount++;
      if (data.isCubeTarget) cubeTargetCount++;
      if (data.colorAttachmentCount > 1) mrtCount++;
      if (data.samples > 0) msaaCount++;
    }

    // Sort by memory usage (largest first)
    renderTargets.sort((a, b) => b.memoryBytes - a.memoryBytes);

    const summary: RenderTargetsSummary = {
      totalCount: renderTargets.length,
      totalMemoryBytes,
      shadowMapCount,
      postProcessCount,
      cubeTargetCount,
      mrtCount,
      msaaCount,
    };

    return { renderTargets, summary };
  }

  /**
   * Create RenderTargetData from a three.js WebGLRenderTarget (public version)
   * Used by DevtoolProbe for registered render targets
   */
  createRenderTargetDataPublic(
    rt: THREE.WebGLRenderTarget,
    usage: RenderTargetUsage = 'custom'
  ): RenderTargetData {
    // Set usage marker before creating data
    (rt as unknown as { _3lensUsage?: RenderTargetUsage })._3lensUsage = usage;
    return this.createRenderTargetData(rt);
  }

  /**
   * Create RenderTargetData from a three.js WebGLRenderTarget
   */
  private createRenderTargetData(
    rt: THREE.WebGLRenderTarget
  ): RenderTargetData {
    const isCube = 'isWebGLCubeRenderTarget' in rt;
    const isMultiple = 'isWebGLMultipleRenderTargets' in rt;

    // For WebGLMultipleRenderTargets, texture is an array - use first texture for properties
    const texture = Array.isArray(rt.texture) ? rt.texture[0] : rt.texture;
    const colorAttachmentCount = isMultiple
      ? Array.isArray(rt.texture)
        ? rt.texture.length
        : 1
      : 1;

    // Get usage from our marker or try to detect
    const usage =
      (rt as unknown as { _3lensUsage?: RenderTargetUsage })._3lensUsage ||
      'unknown';

    // Estimate memory
    const bytesPerPixel = this.getBytesPerPixel(
      texture.format,
      texture.type as number
    );
    let memoryBytes =
      rt.width * rt.height * bytesPerPixel * colorAttachmentCount;

    // Add depth buffer memory
    if (rt.depthBuffer) {
      memoryBytes += rt.width * rt.height * 4; // Assume 32-bit depth
    }
    if (rt.stencilBuffer) {
      memoryBytes += rt.width * rt.height * 1; // 8-bit stencil
    }

    // MSAA multiplier
    if (rt.samples > 0) {
      memoryBytes *= rt.samples;
    }

    // Cube faces
    if (isCube) {
      memoryBytes *= 6;
    }

    // Generate thumbnail
    let thumbnail: string | undefined;
    // Note: Generating thumbnails from render targets requires reading back from GPU
    // which is expensive. For now, we skip this - thumbnails would need to be
    // generated during the render pass when the RT is active.

    // WebGLRenderTarget doesn't have a uuid property - use the texture's uuid
    const rtUuid = (rt as unknown as { uuid?: string }).uuid || texture?.uuid;

    // Build name for MRT - combine all texture names or use first one
    let rtName = '';
    if (isMultiple && Array.isArray(rt.texture)) {
      const names = rt.texture.map((t) => t.name).filter(Boolean);
      rtName = names.length > 0 ? names.join(', ') : '';
    } else {
      rtName = texture?.name || '';
    }

    const data: RenderTargetData = {
      uuid: rtUuid,
      name: rtName,
      type: rt.constructor.name || 'WebGLRenderTarget',
      dimensions: {
        width: rt.width,
        height: rt.height,
      },
      scissorTest: rt.scissorTest,
      depthBuffer: rt.depthBuffer,
      stencilBuffer: rt.stencilBuffer,
      isCubeTarget: isCube,
      samples: rt.samples || 0,
      colorAttachmentCount,
      textureFormat: texture?.format ?? 0,
      textureFormatName: texture
        ? this.getFormatName(texture.format)
        : 'Unknown',
      textureType: (texture?.type as number) ?? 0,
      textureTypeName: texture
        ? this.getDataTypeName(texture.type as number)
        : 'Unknown',
      hasDepthTexture:
        rt.depthTexture !== null && rt.depthTexture !== undefined,
      colorSpace: texture?.colorSpace || 'srgb',
      filtering: {
        mag: texture?.magFilter ?? 0,
        min: texture?.minFilter ?? 0,
        magName: texture ? this.getFilterName(texture.magFilter) : 'Unknown',
        minName: texture ? this.getFilterName(texture.minFilter) : 'Unknown',
      },
      wrap: {
        s: texture?.wrapS ?? 0,
        t: texture?.wrapT ?? 0,
        sName: texture ? this.getWrapName(texture.wrapS) : 'Unknown',
        tName: texture ? this.getWrapName(texture.wrapT) : 'Unknown',
      },
      generateMipmaps: texture?.generateMipmaps ?? false,
      memoryBytes,
      thumbnail,
      usage,
      renderCount: 0, // Would need to track this separately
    };

    // Add depth texture format if present
    if (rt.depthTexture) {
      data.depthTextureFormat = rt.depthTexture.format;
      data.depthTextureFormatName = this.getFormatName(rt.depthTexture.format);
    }

    // Add viewport if different from full size
    if (rt.viewport) {
      data.viewport = {
        x: rt.viewport.x,
        y: rt.viewport.y,
        width: rt.viewport.width,
        height: rt.viewport.height,
      };
    }

    // Add scissor if enabled
    if (rt.scissorTest && rt.scissor) {
      data.scissor = {
        x: rt.scissor.x,
        y: rt.scissor.y,
        width: rt.scissor.width,
        height: rt.scissor.height,
      };
    }

    return data;
  }

  /**
   * Get all texture slot names to check in materials
   */
  private getTextureSlots(): string[] {
    return [
      'map',
      'normalMap',
      'roughnessMap',
      'metalnessMap',
      'aoMap',
      'emissiveMap',
      'bumpMap',
      'displacementMap',
      'alphaMap',
      'envMap',
      'lightMap',
      'specularMap',
      'gradientMap',
      'clearcoatMap',
      'clearcoatNormalMap',
      'clearcoatRoughnessMap',
      'sheenColorMap',
      'sheenRoughnessMap',
      'transmissionMap',
      'thicknessMap',
      'iridescenceMap',
      'iridescenceThicknessMap',
      'anisotropyMap',
      'specularIntensityMap',
      'specularColorMap',
    ];
  }

  /**
   * Find a texture in a material by uniform name
   */
  private findTextureInMaterial(
    material: THREE.Material,
    uniformName: string
  ): THREE.Texture | null {
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
  private createTextureData(
    texture: THREE.Texture,
    usages: TextureMaterialUsage[]
  ): TextureData {
    const isCubeTexture =
      'isCubeTexture' in texture &&
      (texture as THREE.CubeTexture).isCubeTexture === true;
    const isDataTexture =
      'isDataTexture' in texture &&
      (texture as THREE.DataTexture).isDataTexture === true;
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
    const memoryBytes = this.estimateTextureMemory(
      texture,
      width,
      height,
      isCubeTexture
    );

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
      type: texture.constructor.name || 'Texture',
      source,
      dimensions: { width, height },
      format: texture.format,
      formatName: this.getFormatName(texture.format),
      dataType: texture.type as number,
      dataTypeName: this.getDataTypeName(texture.type as number),
      mipmaps: {
        enabled:
          texture.generateMipmaps ||
          (texture.mipmaps && texture.mipmaps.length > 0),
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
  private estimateTextureMemory(
    texture: THREE.Texture,
    width: number,
    height: number,
    isCube: boolean
  ): number {
    if (width === 0 || height === 0) return 0;

    // Get bytes per pixel based on format and type
    const bytesPerPixel = this.getBytesPerPixel(
      texture.format,
      texture.type as number
    );

    // Base memory
    let memory = width * height * bytesPerPixel;

    // Cube textures have 6 faces
    if (isCube) {
      memory *= 6;
    }

    // Add mipmap memory (roughly 1.33x for full mipchain)
    if (
      texture.generateMipmaps ||
      (texture.mipmaps && texture.mipmaps.length > 0)
    ) {
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
  private generateTextureThumbnail(
    texture: THREE.Texture,
    width: number,
    height: number
  ): string | undefined {
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
      if (
        image instanceof HTMLImageElement ||
        image instanceof HTMLCanvasElement ||
        image instanceof ImageBitmap
      ) {
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
   * Get human-readable format name (delegates to memoized function)
   */
  private getFormatName(format: number): string {
    return getFormatNameMemo(format);
  }

  /**
   * Get human-readable data type name (delegates to memoized function)
   */
  private getDataTypeName(type: number): string {
    return getDataTypeNameMemo(type);
  }

  /**
   * Get human-readable wrap mode name (delegates to memoized function)
   */
  private getWrapName(wrap: number): string {
    return getWrapNameMemo(wrap);
  }

  /**
   * Get human-readable filter name (delegates to memoized function)
   */
  private getFilterName(filter: number): string {
    return getFilterNameMemo(filter);
  }

  /**
   * Get compression format name (delegates to memoized function)
   */
  private getCompressionFormat(format: number): string {
    return getCompressionFormatMemo(format);
  }

  /**
   * Create GeometryData from a three.js BufferGeometry
   */
  private createGeometryData(
    geometry: THREE.BufferGeometry,
    usedByMeshes: string[]
  ): GeometryData {
    const attributes = this.collectGeometryAttributes(geometry);
    const memoryBytes = attributes.reduce(
      (sum, attr) => sum + attr.memoryBytes,
      0
    );

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
        min: {
          x: geometry.boundingBox.min.x,
          y: geometry.boundingBox.min.y,
          z: geometry.boundingBox.min.z,
        },
        max: {
          x: geometry.boundingBox.max.x,
          y: geometry.boundingBox.max.y,
          z: geometry.boundingBox.max.z,
        },
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
  private collectGeometryAttributes(
    geometry: THREE.BufferGeometry
  ): GeometryAttributeData[] {
    const attributes: GeometryAttributeData[] = [];

    for (const [name, attr] of Object.entries(geometry.attributes)) {
      if (!attr) continue;
      attributes.push(
        this.createAttributeData(name, attr as THREE.BufferAttribute)
      );
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
  private createAttributeData(
    name: string,
    attr: THREE.BufferAttribute
  ): GeometryAttributeData {
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
      data.meshPerAttribute = (
        attr as { meshPerAttribute: number }
      ).meshPerAttribute;
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
   * Get human-readable name for buffer usage (delegates to memoized function)
   */
  private getUsageName(usage: number): string {
    return getUsageNameMemo(usage);
  }

  /**
   * Create MaterialData from a three.js material
   */
  private createMaterialData(
    material: THREE.Material,
    usedByMeshes: string[]
  ): MaterialData {
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
      wireframe:
        'wireframe' in material
          ? (material as THREE.MeshBasicMaterial).wireframe
          : false,
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
  private collectMaterialTextures(
    material: THREE.Material
  ): MaterialTextureRef[] {
    const textures: MaterialTextureRef[] = [];
    const textureSlots = [
      'map',
      'normalMap',
      'roughnessMap',
      'metalnessMap',
      'aoMap',
      'emissiveMap',
      'bumpMap',
      'displacementMap',
      'alphaMap',
      'envMap',
      'lightMap',
      'specularMap',
      'gradientMap',
      'clearcoatMap',
      'clearcoatNormalMap',
      'clearcoatRoughnessMap',
      'sheenColorMap',
      'sheenRoughnessMap',
      'transmissionMap',
      'thicknessMap',
    ];

    for (const slot of textureSlots) {
      if (slot in material) {
        const texture = (material as unknown as Record<string, unknown>)[
          slot
        ] as THREE.Texture | null;
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
  private isPBRMaterial(
    material: THREE.Material
  ): material is THREE.MeshStandardMaterial {
    return (
      'isMeshStandardMaterial' in material ||
      'isMeshPhysicalMaterial' in material
    );
  }

  /**
   * Extract PBR properties from a standard/physical material
   */
  private extractPBRProperties(
    material: THREE.MeshStandardMaterial
  ): MaterialData['pbr'] {
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
  private extractShaderInfo(
    material: THREE.ShaderMaterial
  ): MaterialData['shader'] {
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
      defines:
        (material.defines as Record<string, string | number | boolean>) || {},
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
    // Patch add - cast to match Scene.add signature
    const originalAdd = this.originalAdd;
    const originalRemove = this.originalRemove;
    const trackObject = this.trackObject.bind(this);
    const untrackObject = this.untrackObject.bind(this);
    const onSceneChange = this.options.onSceneChange;

    this.scene.add = function (...objects: THREE.Object3D[]): THREE.Scene {
      const result = originalAdd.apply(this, objects);
      for (const obj of objects) {
        trackObject(obj);
      }
      onSceneChange?.();
      return result as THREE.Scene;
    };

    // Patch remove - cast to match Scene.remove signature
    this.scene.remove = function (...objects: THREE.Object3D[]): THREE.Scene {
      const result = originalRemove.apply(this, objects);
      for (const obj of objects) {
        untrackObject(obj);
      }
      onSceneChange?.();
      return result as THREE.Scene;
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

    // Track resources (geometry, materials, textures) for meshes
    if (this.isMesh(obj)) {
      this.trackMeshResources(obj);
    }

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

    // Track resource detachment for meshes
    if (this.isMesh(obj)) {
      this.untrackMeshResources(obj);
    }

    // Untrack children
    for (const child of obj.children) {
      this.untrackObject(child);
    }
  }

  /**
   * Track resources attached to a mesh
   */
  private trackMeshResources(mesh: THREE.Mesh): void {
    const meshRef = this.getOrCreateRef(mesh);

    // Track geometry
    if (mesh.geometry) {
      const geo = mesh.geometry;
      if (!this.trackedResourceUuids.has(geo.uuid)) {
        this.trackedResourceUuids.add(geo.uuid);
        const posAttr = geo.attributes?.position as
          | THREE.BufferAttribute
          | undefined;
        const vertexCount = posAttr?.count ?? 0;
        const faceCount = geo.index ? geo.index.count / 3 : vertexCount / 3;

        this.lifecycleTracker.recordCreation('geometry', geo.uuid, {
          name: geo.name || undefined,
          subtype: geo.type || 'BufferGeometry',
          estimatedMemory: this.estimateGeometryMemory(geo),
          vertexCount,
          faceCount: Math.round(faceCount),
        });
      }

      this.lifecycleTracker.recordAttachment('geometry', geo.uuid, mesh.uuid, {
        meshName: meshRef.name,
      });
    }

    // Track materials
    const materials = Array.isArray(mesh.material)
      ? mesh.material
      : [mesh.material];
    for (const mat of materials) {
      if (!mat) continue;

      if (!this.trackedResourceUuids.has(mat.uuid)) {
        this.trackedResourceUuids.add(mat.uuid);
        this.lifecycleTracker.recordCreation('material', mat.uuid, {
          name: mat.name || undefined,
          subtype: mat.type || 'Material',
        });
      }

      this.lifecycleTracker.recordAttachment('material', mat.uuid, mesh.uuid, {
        meshName: meshRef.name,
      });

      // Track textures from material
      this.trackMaterialTextures(mat, mesh.uuid, meshRef.name);
    }
  }

  /**
   * Track textures from a material
   */
  private trackMaterialTextures(
    material: THREE.Material,
    meshUuid: string,
    meshName?: string
  ): void {
    const textureProps = [
      'map',
      'normalMap',
      'roughnessMap',
      'metalnessMap',
      'aoMap',
      'emissiveMap',
      'alphaMap',
      'envMap',
      'lightMap',
      'bumpMap',
      'displacementMap',
      'specularMap',
      'gradientMap',
    ];

    for (const prop of textureProps) {
      const texture = (
        material as unknown as Record<string, THREE.Texture | undefined>
      )[prop];
      if (!texture) continue;

      if (!this.trackedResourceUuids.has(texture.uuid)) {
        this.trackedResourceUuids.add(texture.uuid);
        this.lifecycleTracker.recordCreation('texture', texture.uuid, {
          name: texture.name || undefined,
          subtype: texture.constructor.name || 'Texture',
          estimatedMemory: this.estimateTextureMemorySimple(texture),
        });
      }

      this.lifecycleTracker.recordAttachment(
        'texture',
        texture.uuid,
        meshUuid,
        {
          meshName,
          textureSlot: prop,
        }
      );
    }
  }

  /**
   * Untrack resources when a mesh is removed
   */
  private untrackMeshResources(mesh: THREE.Mesh): void {
    const meshRef = this.objectRefs.get(mesh);
    const meshName = meshRef?.name;

    // Record geometry detachment
    if (mesh.geometry) {
      this.lifecycleTracker.recordDetachment(
        'geometry',
        mesh.geometry.uuid,
        mesh.uuid,
        {
          meshName,
        }
      );
    }

    // Record material detachment
    const materials = Array.isArray(mesh.material)
      ? mesh.material
      : [mesh.material];
    for (const mat of materials) {
      if (!mat) continue;

      this.lifecycleTracker.recordDetachment('material', mat.uuid, mesh.uuid, {
        meshName,
      });

      // Record texture detachments
      const textureProps = [
        'map',
        'normalMap',
        'roughnessMap',
        'metalnessMap',
        'aoMap',
        'emissiveMap',
        'alphaMap',
        'envMap',
        'lightMap',
        'bumpMap',
        'displacementMap',
        'specularMap',
        'gradientMap',
      ];

      for (const prop of textureProps) {
        const texture = (
          mat as unknown as Record<string, THREE.Texture | undefined>
        )[prop];
        if (texture) {
          this.lifecycleTracker.recordDetachment(
            'texture',
            texture.uuid,
            mesh.uuid,
            {
              meshName,
              textureSlot: prop,
            }
          );
        }
      }
    }
  }

  /**
   * Estimate geometry memory usage in bytes
   */
  private estimateGeometryMemory(geometry: THREE.BufferGeometry): number {
    let bytes = 0;

    for (const name in geometry.attributes) {
      const attr = geometry.attributes[name] as THREE.BufferAttribute;
      if (attr.array) {
        bytes += attr.array.byteLength;
      }
    }

    if (geometry.index?.array) {
      bytes += geometry.index.array.byteLength;
    }

    return bytes;
  }

  /**
   * Estimate texture memory usage in bytes (simple version for lifecycle tracking)
   */
  private estimateTextureMemorySimple(texture: THREE.Texture): number {
    const image = texture.image;
    if (!image) return 0;

    const width = image.width || image.videoWidth || 256;
    const height = image.height || image.videoHeight || 256;
    const bytesPerPixel = 4; // RGBA

    // Account for mipmaps (roughly 1.33x base size)
    const mipmapFactor = texture.generateMipmaps ? 1.33 : 1;

    return Math.round(width * height * bytesPerPixel * mipmapFactor);
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

    // Compute cost analysis data
    const costData = this.computeObjectCost(mesh, materials, faceCount);

    return {
      geometryRef: geometry?.uuid ?? '',
      materialRefs: materials.map((m) => m?.uuid ?? ''),
      vertexCount,
      faceCount,
      castShadow: mesh.castShadow,
      receiveShadow: mesh.receiveShadow,
      costData,
    };
  }

  private computeObjectCost(
    mesh: THREE.Mesh,
    materials: THREE.Material[],
    faceCount: number
  ): ObjectCostData {
    // Analyze each material
    const materialInfos: MaterialComplexityInfo[] = materials.map((mat) =>
      this.analyzeMaterialComplexity(mat)
    );

    // Calculate triangle cost (normalized: 1 point per 1000 triangles)
    const triangleCost = faceCount / 1000;

    // Calculate material complexity (average of all materials)
    const materialComplexity =
      materialInfos.length > 0
        ? materialInfos.reduce((sum, m) => sum + m.complexityScore, 0) /
          materialInfos.length
        : 1;

    // Calculate texture cost (sum of texture usage)
    const textureCost = materialInfos.reduce(
      (sum, m) => sum + m.textureCount * 2,
      0
    );

    // Calculate shadow cost
    let shadowCost = 0;
    if (mesh.castShadow) shadowCost += 2;
    if (mesh.receiveShadow) shadowCost += 1;

    // Calculate total cost (weighted sum)
    const totalCost =
      triangleCost * 1 +
      materialComplexity * 0.5 +
      textureCost * 0.3 +
      shadowCost * 0.2;

    // Determine cost level
    let costLevel: 'low' | 'medium' | 'high' | 'critical';
    if (totalCost < 2) costLevel = 'low';
    else if (totalCost < 10) costLevel = 'medium';
    else if (totalCost < 50) costLevel = 'high';
    else costLevel = 'critical';

    return {
      triangleCost,
      materialComplexity,
      textureCost,
      shadowCost,
      totalCost,
      costLevel,
      materials: materialInfos,
    };
  }

  private analyzeMaterialComplexity(
    material: THREE.Material
  ): MaterialComplexityInfo {
    if (!material) {
      return {
        type: 'unknown',
        textureCount: 0,
        hasNormalMap: false,
        hasEnvMap: false,
        hasDisplacementMap: false,
        hasAoMap: false,
        transparent: false,
        alphaTest: false,
        doubleSided: false,
        complexityScore: 1,
      };
    }

    const mat = material as THREE.MeshStandardMaterial;

    // Count textures
    let textureCount = 0;
    let hasNormalMap = false;
    let hasEnvMap = false;
    let hasDisplacementMap = false;
    let hasAoMap = false;

    // Check for standard material properties
    if ('map' in mat && mat.map) textureCount++;
    if ('normalMap' in mat && mat.normalMap) {
      textureCount++;
      hasNormalMap = true;
    }
    if ('envMap' in mat && mat.envMap) {
      textureCount++;
      hasEnvMap = true;
    }
    if ('displacementMap' in mat && mat.displacementMap) {
      textureCount++;
      hasDisplacementMap = true;
    }
    if ('aoMap' in mat && mat.aoMap) {
      textureCount++;
      hasAoMap = true;
    }
    if ('roughnessMap' in mat && mat.roughnessMap) textureCount++;
    if ('metalnessMap' in mat && mat.metalnessMap) textureCount++;
    if ('emissiveMap' in mat && mat.emissiveMap) textureCount++;
    if ('bumpMap' in mat && mat.bumpMap) textureCount++;
    if ('alphaMap' in mat && mat.alphaMap) textureCount++;
    if ('lightMap' in mat && mat.lightMap) textureCount++;

    // Calculate complexity score (1-10)
    let complexityScore = 1;

    // Material type complexity
    const type = material.type;
    if (type === 'MeshBasicMaterial') complexityScore += 0;
    else if (type === 'MeshLambertMaterial') complexityScore += 1;
    else if (type === 'MeshPhongMaterial') complexityScore += 2;
    else if (type === 'MeshStandardMaterial') complexityScore += 3;
    else if (type === 'MeshPhysicalMaterial') complexityScore += 4;
    else if (type === 'ShaderMaterial' || type === 'RawShaderMaterial')
      complexityScore += 5;

    // Add texture complexity
    complexityScore += textureCount * 0.5;

    // Add feature complexity
    if (hasNormalMap) complexityScore += 0.5;
    if (hasEnvMap) complexityScore += 1;
    if (hasDisplacementMap) complexityScore += 1.5;
    if (material.transparent) complexityScore += 0.5;
    if (material.side === 2) complexityScore += 0.3; // DoubleSide

    // Clamp to 1-10
    complexityScore = Math.min(10, Math.max(1, complexityScore));

    return {
      type,
      textureCount,
      hasNormalMap,
      hasEnvMap,
      hasDisplacementMap,
      hasAoMap,
      transparent: material.transparent,
      alphaTest: material.alphaTest > 0,
      doubleSided: material.side === 2,
      complexityScore,
    };
  }

  private getLightData(light: THREE.Light): LightNodeData {
    const lightType = this.getLightType(light);

    const data: LightNodeData = {
      lightType,
      color:
        'color' in light ? (light.color as THREE.Color).getHex() : 0xffffff,
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

  private getLightType(light: THREE.Light): LightNodeData['lightType'] {
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
