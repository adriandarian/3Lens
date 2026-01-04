# Plugin Settings Schema

The Plugin Settings Schema system enables plugins to define configurable settings with auto-generated UI controls.

## Overview

```typescript
import type { PluginSettingsSchema, PluginSettingField } from '@3lens/core';

const MyPlugin: DevtoolPlugin = {
  metadata: { ... },
  
  settings: {
    fields: [
      {
        key: 'threshold',
        label: 'Detection Threshold',
        type: 'number',
        defaultValue: 10,
        description: 'Objects above this value are flagged',
        min: 1,
        max: 100,
      },
      {
        key: 'enabled',
        label: 'Enable Analysis',
        type: 'boolean',
        defaultValue: true,
      },
    ],
  },
  
  onSettingsChange(settings, context) {
    // Respond to settings changes
    context.log('Settings changed:', settings);
  },
};
```

## PluginSettingsSchema Interface

```typescript
interface PluginSettingsSchema {
  /**
   * Settings fields
   */
  fields: PluginSettingField[];
}
```

The schema contains an array of field definitions that describe each configurable setting.

## PluginSettingField Interface

```typescript
interface PluginSettingField {
  /**
   * Setting key (unique identifier)
   */
  key: string;

  /**
   * Display label
   */
  label: string;

  /**
   * Field type
   */
  type: PluginSettingType;

  /**
   * Default value
   */
  defaultValue: unknown;

  /**
   * Description/help text
   */
  description?: string;

  /**
   * Options for 'select' type
   */
  options?: Array<{ value: unknown; label: string }>;

  /**
   * Min value for 'number' type
   */
  min?: number;

  /**
   * Max value for 'number' type
   */
  max?: number;

  /**
   * Step for 'number' type
   */
  step?: number;
}
```

## PluginSettingType

```typescript
type PluginSettingType = 'string' | 'number' | 'boolean' | 'select' | 'color';
```

| Type | UI Control | Description |
|------|------------|-------------|
| `string` | Text input | Free-form text entry |
| `number` | Number input / slider | Numeric values with optional min/max/step |
| `boolean` | Toggle / checkbox | On/off values |
| `select` | Dropdown | Select from predefined options |
| `color` | Color picker | Color value (hex string) |

## Field Type Examples

### String Field

```typescript
{
  key: 'prefix',
  label: 'Log Prefix',
  type: 'string',
  defaultValue: '[Plugin]',
  description: 'Prefix for log messages',
}
```

### Number Field

```typescript
{
  key: 'threshold',
  label: 'Threshold',
  type: 'number',
  defaultValue: 10,
  description: 'Detection threshold value',
  min: 1,
  max: 100,
  step: 1,
}
```

The `min`, `max`, and `step` properties enable validation and slider UI.

### Boolean Field

```typescript
{
  key: 'showOverlay',
  label: 'Show Overlay',
  type: 'boolean',
  defaultValue: false,
  description: 'Display visual overlay in viewport',
}
```

### Select Field

```typescript
{
  key: 'mode',
  label: 'Analysis Mode',
  type: 'select',
  defaultValue: 'normal',
  description: 'Choose analysis depth',
  options: [
    { value: 'quick', label: 'Quick Scan' },
    { value: 'normal', label: 'Normal Analysis' },
    { value: 'deep', label: 'Deep Analysis' },
  ],
}
```

### Color Field

```typescript
{
  key: 'highlightColor',
  label: 'Highlight Color',
  type: 'color',
  defaultValue: '#ff0000',
  description: 'Color for highlighting flagged objects',
}
```

## Accessing Settings

### In Lifecycle Methods

```typescript
activate(context: DevtoolContext) {
  // Get all settings
  const settings = context.getAllState().settings as MySettings;
  
  // Or get individual setting
  const threshold = context.getState('settings.threshold') as number;
}
```

### In Panel Render

```typescript
render(ctx: PanelRenderContext): string {
  const settings = ctx.state.settings as MySettings;
  const threshold = settings?.threshold ?? DEFAULT_THRESHOLD;
  
  return `<div>Threshold: ${threshold}</div>`;
}
```

### In onSettingsChange

```typescript
onSettingsChange(settings: Record<string, unknown>, context: DevtoolContext) {
  // Settings is the complete settings object
  const threshold = settings.threshold as number;
  
  // Update internal state
  context.setState('needsReanalysis', true);
  
  // Request UI update
  context.requestRender();
}
```

## Default Values

Settings are initialized with their default values when the plugin is activated. The `defaultValue` property is required for every field.

```typescript
// PluginManager applies defaults on activation
function getSettingsWithDefaults(schema: PluginSettingsSchema): Record<string, unknown> {
  const settings: Record<string, unknown> = {};
  for (const field of schema.fields) {
    settings[field.key] = field.defaultValue;
  }
  return settings;
}
```

## Settings Persistence

Plugin settings can be persisted across sessions. The overlay UI stores settings in localStorage:

```typescript
// Save settings
localStorage.setItem(
  `3lens.plugin.${pluginId}.settings`,
  JSON.stringify(settings)
);

// Restore settings
const stored = localStorage.getItem(`3lens.plugin.${pluginId}.settings`);
if (stored) {
  const settings = JSON.parse(stored);
  context.setState('settings', settings);
}
```

## Complete Example

```typescript
import type { DevtoolPlugin, DevtoolContext } from '@3lens/core';

interface PerformanceAnalyzerSettings {
  warningThreshold: number;
  errorThreshold: number;
  showInViewport: boolean;
  highlightMode: 'outline' | 'fill' | 'both';
  highlightColor: string;
  logPrefix: string;
}

const DEFAULT_SETTINGS: PerformanceAnalyzerSettings = {
  warningThreshold: 16,
  errorThreshold: 33,
  showInViewport: true,
  highlightMode: 'outline',
  highlightColor: '#ffcc00',
  logPrefix: '[Perf]',
};

export const PerformanceAnalyzerPlugin: DevtoolPlugin = {
  metadata: {
    id: 'my-plugin.performance-analyzer',
    name: 'Performance Analyzer',
    version: '1.0.0',
  },

  settings: {
    fields: [
      {
        key: 'warningThreshold',
        label: 'Warning Threshold (ms)',
        type: 'number',
        defaultValue: DEFAULT_SETTINGS.warningThreshold,
        description: 'Frame time threshold for warning',
        min: 1,
        max: 100,
        step: 1,
      },
      {
        key: 'errorThreshold',
        label: 'Error Threshold (ms)',
        type: 'number',
        defaultValue: DEFAULT_SETTINGS.errorThreshold,
        description: 'Frame time threshold for error',
        min: 1,
        max: 100,
        step: 1,
      },
      {
        key: 'showInViewport',
        label: 'Show in Viewport',
        type: 'boolean',
        defaultValue: DEFAULT_SETTINGS.showInViewport,
        description: 'Display performance overlay in 3D viewport',
      },
      {
        key: 'highlightMode',
        label: 'Highlight Mode',
        type: 'select',
        defaultValue: DEFAULT_SETTINGS.highlightMode,
        description: 'How to highlight slow objects',
        options: [
          { value: 'outline', label: 'Outline Only' },
          { value: 'fill', label: 'Fill Only' },
          { value: 'both', label: 'Outline + Fill' },
        ],
      },
      {
        key: 'highlightColor',
        label: 'Highlight Color',
        type: 'color',
        defaultValue: DEFAULT_SETTINGS.highlightColor,
        description: 'Color for performance warnings',
      },
      {
        key: 'logPrefix',
        label: 'Log Prefix',
        type: 'string',
        defaultValue: DEFAULT_SETTINGS.logPrefix,
        description: 'Prefix for console messages',
      },
    ],
  },

  activate(context: DevtoolContext) {
    // Settings are auto-initialized with defaults
    context.log('Performance Analyzer activated');
  },

  onSettingsChange(settings, context) {
    const typed = settings as PerformanceAnalyzerSettings;
    
    // Validate threshold relationship
    if (typed.warningThreshold >= typed.errorThreshold) {
      context.log('Warning: warning threshold should be less than error threshold');
    }
    
    // Update visualization if needed
    if (typed.showInViewport) {
      context.setState('overlayEnabled', true);
    } else {
      context.setState('overlayEnabled', false);
    }
    
    context.requestRender();
  },
};
```

## Built-in Plugin Settings Examples

### LOD Checker

```typescript
settings: {
  fields: [
    { key: 'overDetailThreshold', type: 'number', min: 1, max: 100, defaultValue: 10 },
    { key: 'minScreenSize', type: 'number', min: 1, max: 50, defaultValue: 5 },
    { key: 'maxAnalysisDistance', type: 'number', min: 10, max: 10000, defaultValue: 1000 },
    { key: 'showOverlayMarkers', type: 'boolean', defaultValue: false },
    { key: 'autoRefreshInterval', type: 'number', min: 0, max: 10000, defaultValue: 0 },
  ],
}
```

### Shadow Debugger

```typescript
settings: {
  fields: [
    { key: 'maxRecommendedResolution', type: 'number', min: 512, max: 8192, step: 256, defaultValue: 2048 },
    { key: 'minRecommendedResolution', type: 'number', min: 64, max: 1024, step: 64, defaultValue: 256 },
    { key: 'maxFrustumSize', type: 'number', min: 10, max: 500, step: 10, defaultValue: 100 },
    { key: 'maxCastersPerLight', type: 'number', min: 10, max: 500, step: 10, defaultValue: 100 },
    { key: 'showFrustumVis', type: 'boolean', defaultValue: false },
    { key: 'showShadowMapPreview', type: 'boolean', defaultValue: false },
  ],
}
```

## See Also

- [DevtoolPlugin](./devtool-plugin.md) - Plugin interface with settings property
- [DevtoolContext](./devtool-context.md) - State management for settings
- [LOD Checker Plugin](./lod-checker-plugin.md) - Built-in plugin with settings
- [Shadow Debugger Plugin](./shadow-debugger-plugin.md) - Built-in plugin with settings
- [Plugin Development Guide](/guides/PLUGIN-DEVELOPMENT.md) - Complete plugin development tutorial
