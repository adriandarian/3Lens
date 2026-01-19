/**
 * Icon utilities using Lucide icons
 *
 * For vanilla JS/TS, we use lucide's icon data to generate SVG strings
 */

import * as LucideIcons from 'lucide';

/**
 * Map of icon names to Lucide icon names (kebab-case to PascalCase)
 */
const ICON_NAME_MAP: Record<string, string> = {
  // Panel icons
  scene: 'Film',
  stats: 'Zap',
  materials: 'Palette',
  geometry: 'Ruler',
  textures: 'Image',
  'render-targets': 'Target',
  webgpu: 'Box',
  plugins: 'Plug',
  search: 'Search',
  palette: 'Palette',
  zap: 'Zap',
  ruler: 'Ruler',
  image: 'Image',
  target: 'Target',
  box: 'Box',
  lightbulb: 'Lightbulb',
  bone: 'Bone',
  settings: 'Settings',
  clipboard: 'Clipboard',
  package: 'Package',
  'external-link': 'ExternalLink',
  pause: 'Pause',
  play: 'Play',
  x: 'X',
  circle: 'Circle',
  'alert-circle': 'AlertCircle',
  'alert-triangle': 'AlertTriangle',
  check: 'Check',
  info: 'Info',
  'arrow-left': 'ArrowLeft',
  'arrow-right': 'ArrowRight',
  plus: 'Plus',
  'help-circle': 'HelpCircle',

  // Object type icons
  'object-scene': 'Film',
  'object-mesh': 'Box',
  'object-group': 'Layers',
  'object-light': 'Lightbulb',
  'object-camera': 'Camera',
  'object-bone': 'Bone',
  'object-skeleton': 'Bone',
  'object-sprite': 'Image',
  'object-line': 'Minus',
  'object-points': 'CircleDot',
  'object-other': 'Cube',

  // Material type icons
  'material-physical': 'Triangle',
  'material-standard': 'Cube',
  'material-basic': 'Circle',
  'material-lambert': 'CircleDot',
  'material-phong': 'Circle',
  'material-toon': 'Triangle',
  'material-shader': 'Box',
  'material-sprite': 'Image',
  'material-points': 'CircleDot',
  'material-line': 'Minus',
  'material-other': 'Circle',

  // Geometry icons
  'geometry-box': 'Cube',
  'geometry-cube': 'Cube',
  'geometry-sphere': 'Circle',
  'geometry-plane': 'Square',
  'geometry-cylinder': 'Cylinder',
  'geometry-cone': 'Triangle',
  'geometry-torus': 'Circle',
  'geometry-ring': 'Circle',
  'geometry-circle': 'Circle',
  'geometry-tube': 'TestTube',
  'geometry-extrude': 'BarChart3',
  'geometry-lathe': 'FlaskConical',
  'geometry-text': 'PenTool',
  'geometry-shape': 'PenTool',
  'geometry-instanced': 'RefreshCw',
  'geometry-default': 'Ruler',

  // Texture icons
  'texture-cube': 'Box',
  'texture-video': 'Video',
  'texture-canvas': 'Image',
  'texture-data': 'Database',
  'texture-render-target': 'Target',
  'texture-compressed': 'Package',
  'texture-default': 'FileImage',
};

/**
 * Get Lucide icon data by name
 */
function getIconData(iconName: string): any[] | null {
  const pascalName = ICON_NAME_MAP[iconName] || iconName;
  const IconComponent = (LucideIcons as any)[pascalName];

  if (!IconComponent) {
    console.warn(`Icon "${iconName}" (${pascalName}) not found in Lucide`);
    return null;
  }

  // Lucide icons export an array of SVG element tuples: [tag, attrs]
  // Example: [['path', { d: 'M...' }], ['rect', { ... }]]
  return Array.isArray(IconComponent) ? IconComponent : null;
}

/**
 * Render a Lucide icon as SVG string
 */
export function renderIcon(
  iconName: string,
  options: {
    size?: number;
    color?: string;
    strokeWidth?: number;
    class?: string;
  } = {}
): string {
  const {
    size = 18,
    color = 'currentColor',
    strokeWidth = 2,
    class: className = '',
  } = options;

  const iconData = getIconData(iconName);
  if (!iconData || iconData.length === 0) {
    return '';
  }

  // Lucide icons are arrays of [tag, attrs] tuples
  // Example: [['path', { d: 'M...' }], ['rect', { x: 0, y: 0, width: 24, height: 24 }]]
  const viewBox = '0 0 24 24';

  const elements = iconData
    .map(([tag, attrs]: [string, Record<string, any>]) => {
      // Merge default attributes
      const mergedAttrs = {
        ...attrs,
        fill: attrs.fill || 'none',
        stroke: attrs.stroke || color,
        'stroke-width': attrs['stroke-width'] || strokeWidth,
        'stroke-linecap': attrs['stroke-linecap'] || 'round',
        'stroke-linejoin': attrs['stroke-linejoin'] || 'round',
      };

      // Convert attrs object to HTML attributes string
      const attrsString = Object.entries(mergedAttrs)
        .map(([key, value]) => `${key}="${String(value)}"`)
        .join(' ');

      return `<${tag} ${attrsString}/>`;
    })
    .join('');

  return `<svg width="${size}" height="${size}" viewBox="${viewBox}" fill="none" xmlns="http://www.w3.org/2000/svg" class="${className}" style="display: inline-block; vertical-align: middle;">${elements}</svg>`;
}

/**
 * Get icon name for object type
 */
export function getObjectIconName(type: string): string {
  const lower = type.toLowerCase();
  if (lower.includes('scene')) return 'object-scene';
  if (lower.includes('mesh')) return 'object-mesh';
  if (lower.includes('group')) return 'object-group';
  if (lower.includes('light')) return 'object-light';
  if (lower.includes('camera')) return 'object-camera';
  if (lower.includes('bone')) return 'object-bone';
  if (lower.includes('skeleton')) return 'object-skeleton';
  if (lower.includes('sprite')) return 'object-sprite';
  if (lower.includes('line')) return 'object-line';
  if (lower.includes('points')) return 'object-points';
  return 'object-other';
}

/**
 * Get icon name for material type
 */
export function getMaterialTypeIconName(type: string): string {
  if (type.includes('Physical')) return 'material-physical';
  if (type.includes('Standard')) return 'material-standard';
  if (type.includes('Basic')) return 'material-basic';
  if (type.includes('Lambert')) return 'material-lambert';
  if (type.includes('Phong')) return 'material-phong';
  if (type.includes('Toon')) return 'material-toon';
  if (type.includes('Shader') || type.includes('Raw')) return 'material-shader';
  if (type.includes('Sprite')) return 'material-sprite';
  if (type.includes('Points')) return 'material-points';
  if (type.includes('Line')) return 'material-line';
  return 'material-other';
}

/**
 * Get icon name for geometry type
 */
export function getGeometryIconName(type: string): string {
  const lower = type.toLowerCase();
  if (lower.includes('box') || lower.includes('cube')) return 'geometry-box';
  if (lower.includes('sphere')) return 'geometry-sphere';
  if (lower.includes('plane')) return 'geometry-plane';
  if (lower.includes('cylinder')) return 'geometry-cylinder';
  if (lower.includes('cone')) return 'geometry-cone';
  if (lower.includes('torus')) return 'geometry-torus';
  if (lower.includes('ring')) return 'geometry-ring';
  if (lower.includes('circle')) return 'geometry-circle';
  if (lower.includes('tube')) return 'geometry-tube';
  if (lower.includes('extrude')) return 'geometry-extrude';
  if (lower.includes('lathe')) return 'geometry-lathe';
  if (lower.includes('text') || lower.includes('shape')) return 'geometry-text';
  if (lower.includes('instanced')) return 'geometry-instanced';
  return 'geometry-default';
}

/**
 * Get icon name for texture
 */
export function getTextureIconName(tex: {
  isCubeTexture?: boolean;
  isVideoTexture?: boolean;
  isCanvasTexture?: boolean;
  isDataTexture?: boolean;
  isRenderTarget?: boolean;
  isCompressed?: boolean;
}): string {
  if (tex.isCubeTexture) return 'texture-cube';
  if (tex.isVideoTexture) return 'texture-video';
  if (tex.isCanvasTexture) return 'texture-canvas';
  if (tex.isDataTexture) return 'texture-data';
  if (tex.isRenderTarget) return 'texture-render-target';
  if (tex.isCompressed) return 'texture-compressed';
  return 'texture-default';
}

/**
 * Alias for renderIcon (for consistency)
 */
export function iconToSVG(
  iconName: string,
  options: {
    size?: number;
    color?: string;
    strokeWidth?: number;
    class?: string;
  } = {}
): string {
  return renderIcon(iconName, options);
}
