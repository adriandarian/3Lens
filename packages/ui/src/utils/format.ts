/**
 * Formatting utilities for 3Lens UI
 */

/**
 * Format large numbers with K/M suffix
 */
export function formatNumber(num: number): string {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
  return num.toString();
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes <= 0 || Number.isNaN(bytes)) return '0 B';
  if (bytes < 1024) return `${bytes.toFixed(0)} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

/**
 * Format a 3D vector
 */
export function formatVector(v: { x: number; y: number; z: number }): string {
  return `(${v.x.toFixed(2)}, ${v.y.toFixed(2)}, ${v.z.toFixed(2)})`;
}

/**
 * Format Euler rotation (radians to degrees)
 */
export function formatEuler(e: {
  x: number;
  y: number;
  z: number;
  order?: string;
}): string {
  const toDeg = (r: number) => ((r * 180) / Math.PI).toFixed(1);
  return `(${toDeg(e.x)}°, ${toDeg(e.y)}°, ${toDeg(e.z)}°)`;
}

/**
 * Format layer mask to human-readable string
 */
export function formatLayers(layerMask: number): string {
  if (layerMask === 0) return 'None';
  if (layerMask === 1) return '0 (default)';

  const enabledLayers: number[] = [];
  for (let i = 0; i < 32; i++) {
    if (layerMask & (1 << i)) {
      enabledLayers.push(i);
    }
  }

  if (enabledLayers.length === 1) {
    return enabledLayers[0] === 0 ? '0 (default)' : String(enabledLayers[0]);
  }

  return enabledLayers.join(', ');
}

/**
 * Escape HTML entities
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Truncate a URL for display
 */
export function truncateUrl(url: string, maxLen = 40): string {
  if (url.length <= maxLen) return url;

  const parts = url.split('/');
  const filename = parts[parts.length - 1];
  if (filename.length < maxLen - 3) {
    return '...' + filename;
  }

  return url.substring(0, maxLen - 3) + '...';
}

/**
 * Get icon for object type
 */
export function getObjectIcon(type: string): string {
  const lower = type.toLowerCase();
  if (lower.includes('scene')) return 'S';
  if (lower.includes('mesh')) return 'M';
  if (lower.includes('group')) return 'G';
  if (lower.includes('light')) return 'L';
  if (lower.includes('camera')) return 'C';
  if (lower.includes('bone')) return 'B';
  if (lower.includes('skeleton')) return 'K';
  if (lower.includes('sprite')) return 'P';
  if (lower.includes('line')) return '—';
  if (lower.includes('points')) return '•';
  return 'O';
}

/**
 * Get CSS class for object type
 */
export function getObjectClass(type: string): string {
  const lower = type.toLowerCase();
  if (lower.includes('scene')) return 'scene';
  if (lower.includes('mesh')) return 'mesh';
  if (lower.includes('group')) return 'group';
  if (lower.includes('light')) return 'light';
  if (lower.includes('camera')) return 'camera';
  return 'object';
}

/**
 * Get icon for material type
 */
export function getMaterialTypeIcon(type: string): string {
  if (type.includes('Physical')) return '◆';
  if (type.includes('Standard')) return '◇';
  if (type.includes('Basic')) return '○';
  if (type.includes('Lambert')) return '◐';
  if (type.includes('Phong')) return '◑';
  if (type.includes('Toon')) return '◕';
  if (type.includes('Shader') || type.includes('Raw')) return '⬡';
  if (type.includes('Sprite')) return '◎';
  if (type.includes('Points')) return '•';
  if (type.includes('Line')) return '―';
  return '●';
}

/**
 * Get icon for geometry type
 */
export function getGeometryIcon(type: string): string {
  const lower = type.toLowerCase();
  if (lower.includes('box') || lower.includes('cube')) return '📦';
  if (lower.includes('sphere')) return '🔮';
  if (lower.includes('plane')) return '⬛';
  if (lower.includes('cylinder')) return '🧴';
  if (lower.includes('cone')) return '🔺';
  if (lower.includes('torus')) return '🍩';
  if (lower.includes('ring')) return '💍';
  if (lower.includes('circle')) return '⭕';
  if (lower.includes('tube')) return '🧪';
  if (lower.includes('extrude')) return '📊';
  if (lower.includes('lathe')) return '🏺';
  if (lower.includes('text') || lower.includes('shape')) return '✒️';
  if (lower.includes('instanced')) return '🔄';
  return '📐';
}

/**
 * Get icon for texture
 */
export function getTextureIcon(tex: {
  isCubeTexture?: boolean;
  isVideoTexture?: boolean;
  isCanvasTexture?: boolean;
  isDataTexture?: boolean;
  isRenderTarget?: boolean;
  isCompressed?: boolean;
}): string {
  if (tex.isCubeTexture) return '🎲';
  if (tex.isVideoTexture) return '🎬';
  if (tex.isCanvasTexture) return '🎨';
  if (tex.isDataTexture) return '📊';
  if (tex.isRenderTarget) return '🎯';
  if (tex.isCompressed) return '📦';
  return '🖼️';
}

/**
 * Get short type name for array type
 */
export function getShortTypeName(arrayType: string): string {
  const map: Record<string, string> = {
    Float32Array: 'f32',
    Float64Array: 'f64',
    Int8Array: 'i8',
    Int16Array: 'i16',
    Int32Array: 'i32',
    Uint8Array: 'u8',
    Uint16Array: 'u16',
    Uint32Array: 'u32',
    Uint8ClampedArray: 'u8c',
  };
  return map[arrayType] || arrayType;
}

/**
 * Get side name from Three.js side constant
 */
export function getSideName(side: number): string {
  switch (side) {
    case 0:
      return 'Front';
    case 1:
      return 'Back';
    case 2:
      return 'Double';
    default:
      return `Unknown (${side})`;
  }
}
