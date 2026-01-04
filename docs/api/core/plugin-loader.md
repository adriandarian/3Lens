# PluginLoader Class

The `PluginLoader` class handles loading 3Lens plugins from various sources including npm packages (via CDN), URLs, and inline definitions.

## Overview

```typescript
import { PluginLoader } from '@3lens/core';

const loader = new PluginLoader();

// Load from npm package
const result = await loader.loadFromNpm('@3lens/plugin-shadows', '1.0.0');

// Load from URL
const result = await loader.loadFromUrl('https://example.com/my-plugin.js');

// Load inline
const result = loader.loadInline(myPluginDefinition);

if (result.success) {
  pluginManager.registerPlugin(result.plugin);
  await pluginManager.activatePlugin(result.plugin.metadata.id);
}
```

## Constructor

```typescript
new PluginLoader(options?: PluginLoaderOptions)
```

### PluginLoaderOptions

```typescript
interface PluginLoaderOptions {
  /** Custom import function (for testing or alternative module systems) */
  importFn?: (specifier: string) => Promise<unknown>;

  /** Timeout for loading plugins (ms). Default: 30000 */
  timeout?: number;

  /** Whether to allow loading from URLs. Default: true */
  allowUrlImports?: boolean;

  /** CDN URL template for npm packages. Default: unpkg */
  cdnTemplate?: string;
}
```

**Default CDN Template:**
```
https://unpkg.com/{package}@{version}/dist/index.js
```

**Example:**

```typescript
const loader = new PluginLoader({
  timeout: 60000,
  allowUrlImports: false, // Security: disable URL imports
  cdnTemplate: 'https://cdn.jsdelivr.net/npm/{package}@{version}/dist/index.js',
});
```

## Loading Methods

### loadFromNpm

Loads a plugin from an npm package via CDN.

```typescript
async loadFromNpm(
  packageName: string,
  version?: string,
  options?: Record<string, unknown>
): Promise<PluginLoadResult>
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `packageName` | `string` | - | npm package name |
| `version` | `string` | `'latest'` | Version constraint |
| `options` | `Record<string, unknown>` | `undefined` | Options passed to plugin factory |

**Example:**

```typescript
// Load latest version
const result = await loader.loadFromNpm('@3lens/plugin-shadows');

// Load specific version
const result = await loader.loadFromNpm('@3lens/plugin-shadows', '1.2.3');

// Load with options
const result = await loader.loadFromNpm('@3lens/plugin-shadows', '1.0.0', {
  enableAdvancedFeatures: true,
});

if (result.success) {
  console.log(`Loaded: ${result.plugin.metadata.name}`);
  console.log(`Load time: ${result.loadTime}ms`);
} else {
  console.error('Failed to load:', result.error);
}
```

### loadFromUrl

Loads a plugin from a URL.

```typescript
async loadFromUrl(
  url: string,
  options?: Record<string, unknown>
): Promise<PluginLoadResult>
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `url` | `string` | URL to the plugin module |
| `options` | `Record<string, unknown>` | Options passed to plugin factory |

**Example:**

```typescript
const result = await loader.loadFromUrl(
  'https://my-cdn.com/plugins/custom-analyzer.js'
);

if (result.success) {
  pluginManager.registerPlugin(result.plugin);
}
```

::: warning
URL imports can be disabled via `allowUrlImports: false` for security.
:::

### loadInline

Loads an inline plugin definition (already in code).

```typescript
loadInline(plugin: DevtoolPlugin): PluginLoadResult
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `plugin` | `DevtoolPlugin` | The plugin definition |

**Returns:** `PluginLoadResult` (synchronous)

**Example:**

```typescript
const myPlugin: DevtoolPlugin = {
  metadata: {
    id: 'my-inline-plugin',
    name: 'My Inline Plugin',
    version: '1.0.0',
  },
  activate(context) {
    context.log('Activated!');
  },
};

const result = loader.loadInline(myPlugin);

if (result.success) {
  pluginManager.registerPlugin(result.plugin);
}
```

### loadFromSource

Loads a plugin from a source configuration.

```typescript
async loadFromSource(source: PluginSource): Promise<PluginLoadResult>
```

**Example:**

```typescript
const result = await loader.loadFromSource({
  type: 'npm',
  source: '@3lens/plugin-shadows',
  version: '1.0.0',
  options: { debug: true },
  autoActivate: true,
});
```

### loadMultiple

Loads multiple plugins from source configurations.

```typescript
async loadMultiple(sources: PluginSource[]): Promise<PluginLoadResult[]>
```

**Example:**

```typescript
const results = await loader.loadMultiple([
  { type: 'npm', source: '@3lens/plugin-shadows', version: '1.0.0' },
  { type: 'npm', source: '@3lens/plugin-lod', version: '1.0.0' },
  { type: 'url', source: 'https://example.com/custom-plugin.js' },
]);

const successful = results.filter(r => r.success);
const failed = results.filter(r => !r.success);

console.log(`Loaded ${successful.length} plugins, ${failed.length} failed`);
```

## Query Methods

### getLoadedPlugin

Gets a loaded plugin by ID.

```typescript
getLoadedPlugin(id: PluginId): DevtoolPlugin | undefined
```

### getLoadedPlugins

Gets all loaded plugins.

```typescript
getLoadedPlugins(): DevtoolPlugin[]
```

### isLoaded

Checks if a plugin is loaded.

```typescript
isLoaded(id: PluginId): boolean
```

## Management Methods

### unload

Unloads a plugin from the loader's cache.

```typescript
unload(id: PluginId): boolean
```

::: warning
This only removes the plugin from the loader's cache. To fully remove a plugin, also call `pluginManager.unregisterPlugin()`.
:::

### clear

Clears all loaded plugins and pending loads.

```typescript
clear(): void
```

## Types

### PluginSource

Configuration for a plugin source.

```typescript
interface PluginSource {
  /** Source type */
  type: PluginSourceType; // 'npm' | 'url' | 'inline' | 'local'

  /** Package name (for npm), URL (for url), or path (for local) */
  source: string;

  /** Optional version constraint (for npm) */
  version?: string;

  /** Optional configuration to pass to the plugin factory */
  options?: Record<string, unknown>;

  /** Whether to auto-activate after loading */
  autoActivate?: boolean;
}
```

### PluginLoadResult

Result of a plugin load operation.

```typescript
interface PluginLoadResult {
  /** Whether loading succeeded */
  success: boolean;

  /** The loaded plugin (if successful) */
  plugin?: DevtoolPlugin;

  /** Error (if failed) */
  error?: Error;

  /** Source configuration */
  source: PluginSource;

  /** Load time in milliseconds */
  loadTime: number;
}
```

### PluginPackage

Expected format for plugin npm packages.

```typescript
interface PluginPackage {
  /** The plugin definition */
  plugin: DevtoolPlugin;

  /** Optional factory function to create the plugin with options */
  createPlugin?: (options?: Record<string, unknown>) => DevtoolPlugin;
}
```

## Plugin Package Format

When publishing a plugin as an npm package, export it in one of these formats:

### Named Export

```typescript
// index.ts
export const plugin: DevtoolPlugin = {
  metadata: { id: 'my-plugin', name: 'My Plugin', version: '1.0.0' },
  activate(context) { /* ... */ },
};
```

### Factory Function

```typescript
// index.ts
export function createPlugin(options?: MyPluginOptions): DevtoolPlugin {
  return {
    metadata: { id: 'my-plugin', name: 'My Plugin', version: '1.0.0' },
    activate(context) {
      // Use options
      if (options?.enableFeature) {
        // ...
      }
    },
  };
}
```

### Default Export

```typescript
// index.ts
const plugin: DevtoolPlugin = {
  metadata: { id: 'my-plugin', name: 'My Plugin', version: '1.0.0' },
  activate(context) { /* ... */ },
};

export default plugin;
```

## Complete Example

```typescript
import { createProbe, PluginLoader } from '@3lens/core';

const probe = createProbe({ name: 'My App' });
const pluginManager = probe.getPluginManager();
const loader = new PluginLoader({
  timeout: 30000,
  cdnTemplate: 'https://unpkg.com/{package}@{version}/dist/index.js',
});

// Define plugin sources
const pluginSources: PluginSource[] = [
  // Official plugins from npm
  { type: 'npm', source: '@3lens/plugin-shadows', version: '^1.0.0' },
  { type: 'npm', source: '@3lens/plugin-performance', version: 'latest' },
  
  // Custom plugin from URL
  { type: 'url', source: 'https://my-cdn.com/plugins/custom-viz.js' },
];

async function loadAndActivatePlugins() {
  console.log('Loading plugins...');
  
  const results = await loader.loadMultiple(pluginSources);
  
  for (const result of results) {
    if (result.success && result.plugin) {
      console.log(`✓ Loaded: ${result.plugin.metadata.name} (${result.loadTime}ms)`);
      
      // Register with plugin manager
      pluginManager.registerPlugin(result.plugin);
      
      // Activate
      try {
        await pluginManager.activatePlugin(result.plugin.metadata.id);
        console.log(`  ✓ Activated`);
      } catch (error) {
        console.error(`  ✗ Activation failed:`, error);
      }
    } else {
      console.error(`✗ Failed to load from ${result.source.source}:`, result.error);
    }
  }
  
  // Summary
  const loaded = results.filter(r => r.success).length;
  console.log(`\nLoaded ${loaded}/${results.length} plugins`);
}

// Also support loading plugins dynamically
async function loadPluginByName(packageName: string) {
  const result = await loader.loadFromNpm(packageName);
  
  if (result.success && result.plugin) {
    pluginManager.registerPlugin(result.plugin);
    await pluginManager.activatePlugin(result.plugin.metadata.id);
    return result.plugin;
  }
  
  throw result.error ?? new Error('Unknown error');
}

// Start
loadAndActivatePlugins();
```

## Security Considerations

1. **Disable URL imports in production** if you only want to allow vetted plugins:
   ```typescript
   new PluginLoader({ allowUrlImports: false });
   ```

2. **Use specific versions** instead of `latest` for production:
   ```typescript
   loader.loadFromNpm('@3lens/plugin', '1.2.3'); // Good
   loader.loadFromNpm('@3lens/plugin', 'latest'); // Risky
   ```

3. **Validate plugin sources** before loading user-provided URLs.

4. **Set reasonable timeouts** to prevent hanging on slow/malicious endpoints:
   ```typescript
   new PluginLoader({ timeout: 10000 });
   ```

## See Also

- [DevtoolPlugin](./devtool-plugin.md) - Plugin interface
- [PluginManager](./plugin-manager.md) - Plugin lifecycle management
- [Plugin Development Guide](/guides/PLUGIN-DEVELOPMENT.md) - Creating plugins
