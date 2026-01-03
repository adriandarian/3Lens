/**
 * Format Utilities Test Suite (UI Package)
 *
 * Tests for formatting functions used in the UI package.
 */

import { describe, it, expect } from 'vitest';
import {
  formatNumber,
  formatBytes,
  formatVector,
  formatEuler,
  formatLayers,
  escapeHtml,
  truncateUrl,
  getObjectIcon,
  getObjectClass,
  getMaterialTypeIcon,
  getGeometryIcon,
  getTextureIcon,
  getShortTypeName,
  getSideName,
} from './format';

describe('formatNumber', () => {
  it('should format numbers under 1000 as-is', () => {
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(123)).toBe('123');
    expect(formatNumber(999)).toBe('999');
  });

  it('should format thousands with K suffix', () => {
    expect(formatNumber(1000)).toBe('1.0K');
    expect(formatNumber(1500)).toBe('1.5K');
    expect(formatNumber(12345)).toBe('12.3K');
  });

  it('should format millions with M suffix', () => {
    expect(formatNumber(1000000)).toBe('1.0M');
    expect(formatNumber(5500000)).toBe('5.5M');
  });
});

describe('formatBytes', () => {
  it('should return 0 B for zero or invalid values', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(-1)).toBe('0 B');
    expect(formatBytes(NaN)).toBe('0 B');
  });

  it('should format bytes', () => {
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(1023)).toBe('1023 B');
  });

  it('should format kilobytes', () => {
    expect(formatBytes(1024)).toBe('1.0 KB');
    expect(formatBytes(1536)).toBe('1.5 KB');
  });

  it('should format megabytes', () => {
    expect(formatBytes(1024 * 1024)).toBe('1.0 MB');
    expect(formatBytes(1.5 * 1024 * 1024)).toBe('1.5 MB');
  });

  it('should format gigabytes', () => {
    expect(formatBytes(1024 * 1024 * 1024)).toBe('1.00 GB');
    expect(formatBytes(1.5 * 1024 * 1024 * 1024)).toBe('1.50 GB');
  });
});

describe('formatVector', () => {
  it('should format vector with 2 decimal places', () => {
    expect(formatVector({ x: 1, y: 2, z: 3 })).toBe('(1.00, 2.00, 3.00)');
    expect(formatVector({ x: 1.234, y: 5.678, z: 9.012 })).toBe('(1.23, 5.68, 9.01)');
  });

  it('should handle negative values', () => {
    expect(formatVector({ x: -1, y: -2.5, z: 0 })).toBe('(-1.00, -2.50, 0.00)');
  });
});

describe('formatEuler', () => {
  it('should convert radians to degrees', () => {
    const result = formatEuler({ x: Math.PI, y: Math.PI / 2, z: 0 });
    expect(result).toBe('(180.0°, 90.0°, 0.0°)');
  });

  it('should handle negative rotations', () => {
    const result = formatEuler({ x: -Math.PI / 4, y: 0, z: 0 });
    expect(result).toBe('(-45.0°, 0.0°, 0.0°)');
  });
});

describe('formatLayers', () => {
  it('should return None for empty mask', () => {
    expect(formatLayers(0)).toBe('None');
  });

  it('should format default layer', () => {
    expect(formatLayers(1)).toBe('0 (default)');
  });

  it('should format single non-default layer', () => {
    expect(formatLayers(2)).toBe('1');
    expect(formatLayers(4)).toBe('2');
  });

  it('should format multiple layers', () => {
    expect(formatLayers(3)).toBe('0, 1');
    expect(formatLayers(7)).toBe('0, 1, 2');
  });
});

describe('escapeHtml', () => {
  it('should escape HTML entities', () => {
    expect(escapeHtml('<div>')).toBe('&lt;div&gt;');
    expect(escapeHtml('a & b')).toBe('a &amp; b');
    expect(escapeHtml('"quoted"')).toBe('&quot;quoted&quot;');
    expect(escapeHtml("it's")).toBe("it&#039;s");
  });

  it('should handle strings without entities', () => {
    expect(escapeHtml('plain text')).toBe('plain text');
  });
});

describe('truncateUrl', () => {
  it('should not truncate short URLs', () => {
    expect(truncateUrl('http://example.com')).toBe('http://example.com');
  });

  it('should truncate long URLs', () => {
    const longUrl = 'http://example.com/very/long/path/to/some/file.png';
    const result = truncateUrl(longUrl, 30);
    expect(result.length).toBeLessThanOrEqual(30);
    expect(result).toContain('...');
  });

  it('should show filename for short filenames', () => {
    const url = 'http://example.com/short.png';
    const result = truncateUrl(url, 15);
    expect(result).toBe('...short.png');
  });
});

describe('getObjectIcon', () => {
  it('should return correct icon for scene', () => {
    expect(getObjectIcon('Scene')).toBe('S');
  });

  it('should return correct icon for mesh', () => {
    expect(getObjectIcon('Mesh')).toBe('M');
    expect(getObjectIcon('SkinnedMesh')).toBe('M');
    expect(getObjectIcon('InstancedMesh')).toBe('M');
  });

  it('should return correct icon for group', () => {
    expect(getObjectIcon('Group')).toBe('G');
  });

  it('should return correct icon for light', () => {
    expect(getObjectIcon('PointLight')).toBe('L');
    expect(getObjectIcon('DirectionalLight')).toBe('L');
  });

  it('should return correct icon for camera', () => {
    expect(getObjectIcon('PerspectiveCamera')).toBe('C');
    expect(getObjectIcon('OrthographicCamera')).toBe('C');
  });

  it('should return correct icon for bone', () => {
    expect(getObjectIcon('Bone')).toBe('B');
  });

  it('should return correct icon for skeleton', () => {
    expect(getObjectIcon('Skeleton')).toBe('K');
  });

  it('should return correct icon for sprite', () => {
    expect(getObjectIcon('Sprite')).toBe('P');
  });

  it('should return correct icon for line', () => {
    expect(getObjectIcon('Line')).toBe('—');
    expect(getObjectIcon('LineSegments')).toBe('—');
  });

  it('should return correct icon for points', () => {
    expect(getObjectIcon('Points')).toBe('•');
  });

  it('should return default for unknown', () => {
    expect(getObjectIcon('Unknown')).toBe('O');
  });
});

describe('getObjectClass', () => {
  it('should return scene for scene objects', () => {
    expect(getObjectClass('Scene')).toBe('scene');
  });

  it('should return mesh for mesh objects', () => {
    expect(getObjectClass('Mesh')).toBe('mesh');
    expect(getObjectClass('SkinnedMesh')).toBe('mesh');
  });

  it('should return group for group objects', () => {
    expect(getObjectClass('Group')).toBe('group');
  });

  it('should return light for light objects', () => {
    expect(getObjectClass('PointLight')).toBe('light');
  });

  it('should return camera for camera objects', () => {
    expect(getObjectClass('PerspectiveCamera')).toBe('camera');
  });

  it('should return object for unknown', () => {
    expect(getObjectClass('Unknown')).toBe('object');
  });
});

describe('getMaterialTypeIcon', () => {
  it('should return diamond for Physical materials', () => {
    expect(getMaterialTypeIcon('MeshPhysicalMaterial')).toBe('◆');
  });

  it('should return empty diamond for Standard materials', () => {
    expect(getMaterialTypeIcon('MeshStandardMaterial')).toBe('◇');
  });

  it('should return circle for Basic materials', () => {
    expect(getMaterialTypeIcon('MeshBasicMaterial')).toBe('○');
  });

  it('should return half circle for Lambert materials', () => {
    expect(getMaterialTypeIcon('MeshLambertMaterial')).toBe('◐');
  });

  it('should return half circle for Phong materials', () => {
    expect(getMaterialTypeIcon('MeshPhongMaterial')).toBe('◑');
  });

  it('should return filled circle for Toon materials', () => {
    expect(getMaterialTypeIcon('MeshToonMaterial')).toBe('◕');
  });

  it('should return hexagon for Shader/Raw materials', () => {
    expect(getMaterialTypeIcon('ShaderMaterial')).toBe('⬡');
    expect(getMaterialTypeIcon('RawShaderMaterial')).toBe('⬡');
  });

  it('should return default for unknown', () => {
    expect(getMaterialTypeIcon('Unknown')).toBe('●');
  });
});

describe('getGeometryIcon', () => {
  it('should return box for box/cube geometries', () => {
    expect(getGeometryIcon('BoxGeometry')).toBe('📦');
    expect(getGeometryIcon('CubeGeometry')).toBe('📦');
  });

  it('should return sphere for sphere geometries', () => {
    expect(getGeometryIcon('SphereGeometry')).toBe('🔮');
  });

  it('should return plane for plane geometries', () => {
    expect(getGeometryIcon('PlaneGeometry')).toBe('⬛');
  });

  it('should return cylinder for cylinder geometries', () => {
    expect(getGeometryIcon('CylinderGeometry')).toBe('🧴');
  });

  it('should return cone for cone geometries', () => {
    expect(getGeometryIcon('ConeGeometry')).toBe('🔺');
  });

  it('should return torus for torus geometries', () => {
    expect(getGeometryIcon('TorusGeometry')).toBe('🍩');
  });

  it('should return ring for ring geometries', () => {
    expect(getGeometryIcon('RingGeometry')).toBe('💍');
  });

  it('should return circle for circle geometries', () => {
    expect(getGeometryIcon('CircleGeometry')).toBe('⭕');
  });

  it('should return tube for tube geometries', () => {
    expect(getGeometryIcon('TubeGeometry')).toBe('🧪');
  });

  it('should return extrude for extrude geometries', () => {
    expect(getGeometryIcon('ExtrudeGeometry')).toBe('📊');
  });

  it('should return lathe for lathe geometries', () => {
    expect(getGeometryIcon('LatheGeometry')).toBe('🏺');
  });

  it('should return text for text/shape geometries', () => {
    expect(getGeometryIcon('TextGeometry')).toBe('✒️');
    expect(getGeometryIcon('ShapeGeometry')).toBe('✒️');
  });

  it('should return instanced for instanced geometries', () => {
    expect(getGeometryIcon('InstancedBufferGeometry')).toBe('🔄');
  });

  it('should return default for unknown', () => {
    expect(getGeometryIcon('BufferGeometry')).toBe('📐');
  });
});

describe('getTextureIcon', () => {
  it('should return cube icon for cube textures', () => {
    expect(getTextureIcon({ isCubeTexture: true })).toBe('🎲');
  });

  it('should return video icon for video textures', () => {
    expect(getTextureIcon({ isVideoTexture: true })).toBe('🎬');
  });

  it('should return canvas icon for canvas textures', () => {
    expect(getTextureIcon({ isCanvasTexture: true })).toBe('🎨');
  });

  it('should return data icon for data textures', () => {
    expect(getTextureIcon({ isDataTexture: true })).toBe('📊');
  });

  it('should return render target icon for render targets', () => {
    expect(getTextureIcon({ isRenderTarget: true })).toBe('🎯');
  });

  it('should return compressed icon for compressed textures', () => {
    expect(getTextureIcon({ isCompressed: true })).toBe('📦');
  });

  it('should return default for regular textures', () => {
    expect(getTextureIcon({})).toBe('🖼️');
  });
});

describe('getShortTypeName', () => {
  it('should return short names for typed arrays', () => {
    expect(getShortTypeName('Float32Array')).toBe('f32');
    expect(getShortTypeName('Float64Array')).toBe('f64');
    expect(getShortTypeName('Int8Array')).toBe('i8');
    expect(getShortTypeName('Int16Array')).toBe('i16');
    expect(getShortTypeName('Int32Array')).toBe('i32');
    expect(getShortTypeName('Uint8Array')).toBe('u8');
    expect(getShortTypeName('Uint16Array')).toBe('u16');
    expect(getShortTypeName('Uint32Array')).toBe('u32');
    expect(getShortTypeName('Uint8ClampedArray')).toBe('u8c');
  });

  it('should return original for unknown types', () => {
    expect(getShortTypeName('UnknownArray')).toBe('UnknownArray');
  });
});

describe('getSideName', () => {
  it('should return Front for side 0', () => {
    expect(getSideName(0)).toBe('Front');
  });

  it('should return Back for side 1', () => {
    expect(getSideName(1)).toBe('Back');
  });

  it('should return Double for side 2', () => {
    expect(getSideName(2)).toBe('Double');
  });

  it('should return Unknown for other values', () => {
    expect(getSideName(3)).toBe('Unknown (3)');
    expect(getSideName(-1)).toBe('Unknown (-1)');
  });
});
