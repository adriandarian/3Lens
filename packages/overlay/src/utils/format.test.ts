import { describe, it, expect } from 'vitest';
import {
  formatNumber,
  formatBytes,
  getObjectClass,
  getObjectIcon,
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
    expect(formatNumber(999999)).toBe('1000.0K');
  });

  it('should format millions with M suffix', () => {
    expect(formatNumber(1000000)).toBe('1.0M');
    expect(formatNumber(1500000)).toBe('1.5M');
    expect(formatNumber(12345678)).toBe('12.3M');
  });
});

describe('formatBytes', () => {
  it('should format bytes under 1KB', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(1023)).toBe('1023 B');
  });

  it('should format kilobytes', () => {
    expect(formatBytes(1024)).toBe('1.00 KB');
    expect(formatBytes(1536)).toBe('1.50 KB');
    expect(formatBytes(102400)).toBe('100.00 KB');
  });

  it('should format megabytes', () => {
    expect(formatBytes(1048576)).toBe('1.00 MB');
    expect(formatBytes(1572864)).toBe('1.50 MB');
    expect(formatBytes(104857600)).toBe('100.00 MB');
  });

  it('should format gigabytes', () => {
    expect(formatBytes(1073741824)).toBe('1.00 GB');
    expect(formatBytes(1610612736)).toBe('1.50 GB');
    expect(formatBytes(2147483648)).toBe('2.00 GB');
  });
});

describe('getObjectClass', () => {
  it('should return "scene" for scene objects', () => {
    expect(getObjectClass('Scene')).toBe('scene');
    expect(getObjectClass('SCENE')).toBe('scene');
    expect(getObjectClass('MyScene')).toBe('scene');
  });

  it('should return "mesh" for mesh objects', () => {
    expect(getObjectClass('Mesh')).toBe('mesh');
    expect(getObjectClass('SkinnedMesh')).toBe('mesh');
    expect(getObjectClass('InstancedMesh')).toBe('mesh');
  });

  it('should return "group" for group objects', () => {
    expect(getObjectClass('Group')).toBe('group');
    expect(getObjectClass('group')).toBe('group');
  });

  it('should return "light" for light objects', () => {
    expect(getObjectClass('Light')).toBe('light');
    expect(getObjectClass('PointLight')).toBe('light');
    expect(getObjectClass('DirectionalLight')).toBe('light');
    expect(getObjectClass('SpotLight')).toBe('light');
  });

  it('should return "camera" for camera objects', () => {
    expect(getObjectClass('Camera')).toBe('camera');
    expect(getObjectClass('PerspectiveCamera')).toBe('camera');
    expect(getObjectClass('OrthographicCamera')).toBe('camera');
  });

  it('should return "bone" for bone objects', () => {
    expect(getObjectClass('Bone')).toBe('bone');
    expect(getObjectClass('bone')).toBe('bone');
  });

  it('should return "object" for unknown types', () => {
    expect(getObjectClass('Unknown')).toBe('object');
    expect(getObjectClass('Helper')).toBe('object');
    expect(getObjectClass('')).toBe('object');
  });
});

describe('getObjectIcon', () => {
  it('should return correct icon name for scene objects', () => {
    expect(getObjectIcon('Scene')).toBe('object-scene');
  });

  it('should return correct icon name for mesh objects', () => {
    expect(getObjectIcon('Mesh')).toBe('object-mesh');
    expect(getObjectIcon('SkinnedMesh')).toBe('object-mesh');
  });

  it('should return correct icon name for group objects', () => {
    expect(getObjectIcon('Group')).toBe('object-group');
  });

  it('should return correct icon name for light objects', () => {
    expect(getObjectIcon('PointLight')).toBe('object-light');
  });

  it('should return correct icon name for camera objects', () => {
    expect(getObjectIcon('PerspectiveCamera')).toBe('object-camera');
  });

  it('should return correct icon name for bone objects', () => {
    expect(getObjectIcon('Bone')).toBe('object-bone');
  });

  it('should return default for unknown types', () => {
    expect(getObjectIcon('Unknown')).toBe('object-other');
    expect(getObjectIcon('')).toBe('object-other');
  });
});
