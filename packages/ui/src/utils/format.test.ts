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
    expect(formatVector({ x: 1.234, y: 5.678, z: 9.012 })).toBe(
      '(1.23, 5.68, 9.01)'
    );
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
    expect(escapeHtml("it's")).toBe('it&#039;s');
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
  it('should return correct icon name for scene', () => {
    expect(getObjectIcon('Scene')).toBe('object-scene');
  });

  it('should return correct icon name for mesh', () => {
    expect(getObjectIcon('Mesh')).toBe('object-mesh');
    expect(getObjectIcon('SkinnedMesh')).toBe('object-mesh');
    expect(getObjectIcon('InstancedMesh')).toBe('object-mesh');
  });

  it('should return correct icon name for group', () => {
    expect(getObjectIcon('Group')).toBe('object-group');
  });

  it('should return correct icon name for light', () => {
    expect(getObjectIcon('PointLight')).toBe('object-light');
    expect(getObjectIcon('DirectionalLight')).toBe('object-light');
  });

  it('should return correct icon name for camera', () => {
    expect(getObjectIcon('PerspectiveCamera')).toBe('object-camera');
    expect(getObjectIcon('OrthographicCamera')).toBe('object-camera');
  });

  it('should return correct icon name for bone', () => {
    expect(getObjectIcon('Bone')).toBe('object-bone');
  });

  it('should return correct icon name for skeleton', () => {
    expect(getObjectIcon('Skeleton')).toBe('object-skeleton');
  });

  it('should return correct icon name for sprite', () => {
    expect(getObjectIcon('Sprite')).toBe('object-sprite');
  });

  it('should return correct icon name for line', () => {
    expect(getObjectIcon('Line')).toBe('object-line');
    expect(getObjectIcon('LineSegments')).toBe('object-line');
  });

  it('should return correct icon name for points', () => {
    expect(getObjectIcon('Points')).toBe('object-points');
  });

  it('should return default for unknown', () => {
    expect(getObjectIcon('Unknown')).toBe('object-other');
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
  it('should return correct icon name for Physical materials', () => {
    expect(getMaterialTypeIcon('MeshPhysicalMaterial')).toBe(
      'material-physical'
    );
  });

  it('should return correct icon name for Standard materials', () => {
    expect(getMaterialTypeIcon('MeshStandardMaterial')).toBe(
      'material-standard'
    );
  });

  it('should return correct icon name for Basic materials', () => {
    expect(getMaterialTypeIcon('MeshBasicMaterial')).toBe('material-basic');
  });

  it('should return correct icon name for Lambert materials', () => {
    expect(getMaterialTypeIcon('MeshLambertMaterial')).toBe('material-lambert');
  });

  it('should return correct icon name for Phong materials', () => {
    expect(getMaterialTypeIcon('MeshPhongMaterial')).toBe('material-phong');
  });

  it('should return correct icon name for Toon materials', () => {
    expect(getMaterialTypeIcon('MeshToonMaterial')).toBe('material-toon');
  });

  it('should return correct icon name for Shader/Raw materials', () => {
    expect(getMaterialTypeIcon('ShaderMaterial')).toBe('material-shader');
    expect(getMaterialTypeIcon('RawShaderMaterial')).toBe('material-shader');
  });

  it('should return default for unknown', () => {
    expect(getMaterialTypeIcon('Unknown')).toBe('material-other');
  });
});

describe('getGeometryIcon', () => {
  it('should return correct icon name for box/cube geometries', () => {
    expect(getGeometryIcon('BoxGeometry')).toBe('geometry-box');
    expect(getGeometryIcon('CubeGeometry')).toBe('geometry-box');
  });

  it('should return correct icon name for sphere geometries', () => {
    expect(getGeometryIcon('SphereGeometry')).toBe('geometry-sphere');
  });

  it('should return correct icon name for plane geometries', () => {
    expect(getGeometryIcon('PlaneGeometry')).toBe('geometry-plane');
  });

  it('should return correct icon name for cylinder geometries', () => {
    expect(getGeometryIcon('CylinderGeometry')).toBe('geometry-cylinder');
  });

  it('should return correct icon name for cone geometries', () => {
    expect(getGeometryIcon('ConeGeometry')).toBe('geometry-cone');
  });

  it('should return correct icon name for torus geometries', () => {
    expect(getGeometryIcon('TorusGeometry')).toBe('geometry-torus');
  });

  it('should return correct icon name for ring geometries', () => {
    expect(getGeometryIcon('RingGeometry')).toBe('geometry-ring');
  });

  it('should return correct icon name for circle geometries', () => {
    expect(getGeometryIcon('CircleGeometry')).toBe('geometry-circle');
  });

  it('should return correct icon name for tube geometries', () => {
    expect(getGeometryIcon('TubeGeometry')).toBe('geometry-tube');
  });

  it('should return correct icon name for extrude geometries', () => {
    expect(getGeometryIcon('ExtrudeGeometry')).toBe('geometry-extrude');
  });

  it('should return correct icon name for lathe geometries', () => {
    expect(getGeometryIcon('LatheGeometry')).toBe('geometry-lathe');
  });

  it('should return correct icon name for text/shape geometries', () => {
    expect(getGeometryIcon('TextGeometry')).toBe('geometry-text');
    expect(getGeometryIcon('ShapeGeometry')).toBe('geometry-text');
  });

  it('should return correct icon name for instanced geometries', () => {
    expect(getGeometryIcon('InstancedBufferGeometry')).toBe(
      'geometry-instanced'
    );
  });

  it('should return default for unknown', () => {
    expect(getGeometryIcon('BufferGeometry')).toBe('geometry-default');
  });
});

describe('getTextureIcon', () => {
  it('should return correct icon name for cube textures', () => {
    expect(getTextureIcon({ isCubeTexture: true })).toBe('texture-cube');
  });

  it('should return correct icon name for video textures', () => {
    expect(getTextureIcon({ isVideoTexture: true })).toBe('texture-video');
  });

  it('should return correct icon name for canvas textures', () => {
    expect(getTextureIcon({ isCanvasTexture: true })).toBe('texture-canvas');
  });

  it('should return correct icon name for data textures', () => {
    expect(getTextureIcon({ isDataTexture: true })).toBe('texture-data');
  });

  it('should return correct icon name for render targets', () => {
    expect(getTextureIcon({ isRenderTarget: true })).toBe(
      'texture-render-target'
    );
  });

  it('should return correct icon name for compressed textures', () => {
    expect(getTextureIcon({ isCompressed: true })).toBe('texture-compressed');
  });

  it('should return default for regular textures', () => {
    expect(getTextureIcon({})).toBe('texture-default');
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
