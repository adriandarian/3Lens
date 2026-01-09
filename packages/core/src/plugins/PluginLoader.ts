import type { DevtoolPlugin, PluginId, PluginMetadata } from './types';

/**
 * Plugin package format - what a plugin npm package should export
 */
export interface PluginPackage {
  /**
   * The plugin definition
   */
  plugin: DevtoolPlugin;

  /**
   * Optional factory function to create the plugin with options
   */
  createPlugin?: (options?: Record<string, unknown>) => DevtoolPlugin;
}

/**
 * Plugin source types
 */
export type PluginSourceType = 'npm' | 'url' | 'inline' | 'local';

/**
 * Plugin source configuration
 */
export interface PluginSource {
  /**
   * Source type
   */
  type: PluginSourceType;

  /**
   * Package name (for npm), URL (for url), or path (for local)
   */
  source: string;

  /**
   * Optional version constraint (for npm)
   */
  version?: string;

  /**
   * Optional configuration to pass to the plugin factory
   */
  options?: Record<string, unknown>;

  /**
   * Whether to auto-activate after loading
   */
  autoActivate?: boolean;
}

/**
 * Plugin registry entry
 */
export interface PluginRegistryEntry {
  /**
   * Plugin metadata
   */
  metadata: PluginMetadata;

  /**
   * Plugin source
   */
  source: PluginSource;

  /**
   * Download count (for popularity sorting)
   */
  downloads?: number;

  /**
   * Star/rating count
   */
  stars?: number;

  /**
   * Last updated timestamp
   */
  updatedAt?: number;

  /**
   * Tags for categorization
   */
  tags?: string[];

  /**
   * Whether this is an official/verified plugin
   */
  verified?: boolean;
}

/**
 * Plugin load result
 */
export interface PluginLoadResult {
  success: boolean;
  plugin?: DevtoolPlugin;
  error?: Error;
  source: PluginSource;
  loadTime: number;
}

/**
 * Plugin loader options
 */
export interface PluginLoaderOptions {
  /**
   * Custom import function (for testing or alternative module systems)
   */
  importFn?: (specifier: string) => Promise<unknown>;

  /**
   * Timeout for loading plugins (ms)
   */
  timeout?: number;

  /**
   * Whether to allow loading from URLs
   */
  allowUrlImports?: boolean;

  /**
   * CDN URL template for npm packages (default: unpkg)
   */
  cdnTemplate?: string;
}

const DEFAULT_CDN_TEMPLATE =
  'https://unpkg.com/{package}@{version}/dist/index.js';

/**
 * Plugin loader - handles loading plugins from various sources
 *
 * @example
 * ```typescript
 * const loader = new PluginLoader();
 *
 * // Load from npm package
 * const result = await loader.loadFromNpm('@3lens/plugin-shadows', '1.0.0');
 *
 * // Load from URL
 * const result = await loader.loadFromUrl('https://example.com/plugin.js');
 *
 * // Load inline
 * const plugin = loader.loadInline({
 *   metadata: { id: 'my-plugin', name: 'My Plugin', version: '1.0.0' },
 *   activate: () => {},
 * });
 * ```
 */
export class PluginLoader {
  private readonly options: Required<PluginLoaderOptions>;
  private readonly loadedPlugins = new Map<PluginId, DevtoolPlugin>();
  private readonly loadingPromises = new Map<
    string,
    Promise<PluginLoadResult>
  >();

  constructor(options: PluginLoaderOptions = {}) {
    this.options = {
      importFn: options.importFn ?? this.defaultImport.bind(this),
      timeout: options.timeout ?? 30000,
      allowUrlImports: options.allowUrlImports ?? true,
      cdnTemplate: options.cdnTemplate ?? DEFAULT_CDN_TEMPLATE,
    };
  }

  /**
   * Load a plugin from an npm package via CDN
   */
  async loadFromNpm(
    packageName: string,
    version: string = 'latest',
    options?: Record<string, unknown>
  ): Promise<PluginLoadResult> {
    const source: PluginSource = {
      type: 'npm',
      source: packageName,
      version,
      options,
    };

    return this.loadFromSource(source);
  }

  /**
   * Load a plugin from a URL
   */
  async loadFromUrl(
    url: string,
    options?: Record<string, unknown>
  ): Promise<PluginLoadResult> {
    if (!this.options.allowUrlImports) {
      return {
        success: false,
        error: new Error('URL imports are disabled'),
        source: { type: 'url', source: url },
        loadTime: 0,
      };
    }

    const source: PluginSource = {
      type: 'url',
      source: url,
      options,
    };

    return this.loadFromSource(source);
  }

  /**
   * Load an inline plugin (already defined in code)
   */
  loadInline(plugin: DevtoolPlugin): PluginLoadResult {
    const startTime = performance.now();

    try {
      this.validatePlugin(plugin);
      this.loadedPlugins.set(plugin.metadata.id, plugin);

      return {
        success: true,
        plugin,
        source: { type: 'inline', source: plugin.metadata.id },
        loadTime: performance.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        source: { type: 'inline', source: plugin.metadata?.id ?? 'unknown' },
        loadTime: performance.now() - startTime,
      };
    }
  }

  /**
   * Load a plugin from a source configuration
   */
  async loadFromSource(source: PluginSource): Promise<PluginLoadResult> {
    const cacheKey = this.getSourceCacheKey(source);

    // Check if already loading
    const existing = this.loadingPromises.get(cacheKey);
    if (existing) {
      return existing;
    }

    // Check if already loaded
    const loadedId = this.getLoadedPluginId(source);
    if (loadedId) {
      const plugin = this.loadedPlugins.get(loadedId);
      if (plugin) {
        return {
          success: true,
          plugin,
          source,
          loadTime: 0,
        };
      }
    }

    // Start loading
    const loadPromise = this.doLoad(source);
    this.loadingPromises.set(cacheKey, loadPromise);

    try {
      const result = await loadPromise;
      return result;
    } finally {
      this.loadingPromises.delete(cacheKey);
    }
  }

  /**
   * Load multiple plugins from sources
   */
  async loadMultiple(sources: PluginSource[]): Promise<PluginLoadResult[]> {
    return Promise.all(sources.map((source) => this.loadFromSource(source)));
  }

  /**
   * Get a loaded plugin by ID
   */
  getLoadedPlugin(id: PluginId): DevtoolPlugin | undefined {
    return this.loadedPlugins.get(id);
  }

  /**
   * Get all loaded plugins
   */
  getLoadedPlugins(): DevtoolPlugin[] {
    return Array.from(this.loadedPlugins.values());
  }

  /**
   * Check if a plugin is loaded
   */
  isLoaded(id: PluginId): boolean {
    return this.loadedPlugins.has(id);
  }

  /**
   * Unload a plugin
   */
  unload(id: PluginId): boolean {
    return this.loadedPlugins.delete(id);
  }

  /**
   * Clear all loaded plugins
   */
  clear(): void {
    this.loadedPlugins.clear();
    this.loadingPromises.clear();
  }

  private async doLoad(source: PluginSource): Promise<PluginLoadResult> {
    const startTime = performance.now();

    try {
      const url = this.getSourceUrl(source);
      const module = await this.loadWithTimeout(url);
      const plugin = this.extractPlugin(module, source.options);

      this.validatePlugin(plugin);
      this.loadedPlugins.set(plugin.metadata.id, plugin);

      return {
        success: true,
        plugin,
        source,
        loadTime: performance.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        source,
        loadTime: performance.now() - startTime,
      };
    }
  }

  private getSourceUrl(source: PluginSource): string {
    switch (source.type) {
      case 'npm':
        return this.options.cdnTemplate
          .replace('{package}', source.source)
          .replace('{version}', source.version ?? 'latest');

      case 'url':
        return source.source;

      case 'local':
        return source.source;

      default:
        throw new Error(`Unsupported source type: ${source.type}`);
    }
  }

  private async loadWithTimeout(url: string): Promise<unknown> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(
        () => reject(new Error(`Plugin load timeout: ${url}`)),
        this.options.timeout
      );
    });

    const loadPromise = this.options.importFn(url);

    return Promise.race([loadPromise, timeoutPromise]);
  }

  private async defaultImport(specifier: string): Promise<unknown> {
    // Use dynamic import for ES modules
    return import(/* @vite-ignore */ specifier);
  }

  private extractPlugin(
    module: unknown,
    options?: Record<string, unknown>
  ): DevtoolPlugin {
    // Handle various export formats
    const pkg = module as Record<string, unknown>;

    // Check for createPlugin factory
    if (typeof pkg.createPlugin === 'function') {
      return (
        pkg.createPlugin as (opts?: Record<string, unknown>) => DevtoolPlugin
      )(options);
    }

    // Check for direct plugin export
    if (pkg.plugin && this.isValidPlugin(pkg.plugin)) {
      return pkg.plugin as DevtoolPlugin;
    }

    // Check for default export
    if (pkg.default) {
      const defaultExport = pkg.default as Record<string, unknown>;

      if (typeof defaultExport.createPlugin === 'function') {
        return (
          defaultExport.createPlugin as (
            opts?: Record<string, unknown>
          ) => DevtoolPlugin
        )(options);
      }

      if (defaultExport.plugin && this.isValidPlugin(defaultExport.plugin)) {
        return defaultExport.plugin as DevtoolPlugin;
      }

      if (this.isValidPlugin(defaultExport)) {
        return defaultExport as DevtoolPlugin;
      }
    }

    // Check if the module itself is a plugin
    if (this.isValidPlugin(pkg)) {
      return pkg as DevtoolPlugin;
    }

    throw new Error('Plugin package does not export a valid plugin');
  }

  private isValidPlugin(obj: unknown): obj is DevtoolPlugin {
    if (!obj || typeof obj !== 'object') return false;
    const plugin = obj as Partial<DevtoolPlugin>;
    return !!(
      plugin.metadata?.id &&
      plugin.metadata?.name &&
      plugin.metadata?.version &&
      typeof plugin.activate === 'function'
    );
  }

  private validatePlugin(plugin: DevtoolPlugin): void {
    if (!plugin.metadata) {
      throw new Error('Plugin must have metadata');
    }
    if (!plugin.metadata.id) {
      throw new Error('Plugin must have an id');
    }
    if (!plugin.metadata.name) {
      throw new Error('Plugin must have a name');
    }
    if (!plugin.metadata.version) {
      throw new Error('Plugin must have a version');
    }
    if (typeof plugin.activate !== 'function') {
      throw new Error('Plugin must have an activate function');
    }

    // Check for duplicate ID
    if (this.loadedPlugins.has(plugin.metadata.id)) {
      throw new Error(
        `Plugin with id "${plugin.metadata.id}" is already loaded`
      );
    }
  }

  private getSourceCacheKey(source: PluginSource): string {
    return `${source.type}:${source.source}:${source.version ?? ''}`;
  }

  private getLoadedPluginId(_source: PluginSource): PluginId | null {
    // For inline plugins, we can't determine the ID without loading
    // For other sources, we need to load to get the ID
    return null;
  }
}

/**
 * Plugin registry - for discovering available plugins
 */
export class PluginRegistry {
  private readonly entries = new Map<PluginId, PluginRegistryEntry>();
  private readonly sources: string[] = [];

  /**
   * Add a registry source URL
   */
  addSource(url: string): void {
    if (!this.sources.includes(url)) {
      this.sources.push(url);
    }
  }

  /**
   * Remove a registry source
   */
  removeSource(url: string): void {
    const index = this.sources.indexOf(url);
    if (index !== -1) {
      this.sources.splice(index, 1);
    }
  }

  /**
   * Refresh the registry from all sources
   */
  async refresh(): Promise<void> {
    this.entries.clear();

    for (const source of this.sources) {
      try {
        const response = await fetch(source);
        const data = (await response.json()) as {
          plugins?: PluginRegistryEntry[];
        };

        if (Array.isArray(data.plugins)) {
          for (const entry of data.plugins) {
            this.entries.set(entry.metadata.id, entry);
          }
        }
      } catch (error) {
        console.warn(`Failed to fetch plugin registry from ${source}:`, error);
      }
    }
  }

  /**
   * Register a plugin entry manually
   */
  register(entry: PluginRegistryEntry): void {
    this.entries.set(entry.metadata.id, entry);
  }

  /**
   * Unregister a plugin entry
   */
  unregister(id: PluginId): void {
    this.entries.delete(id);
  }

  /**
   * Get all registered plugins
   */
  getAll(): PluginRegistryEntry[] {
    return Array.from(this.entries.values());
  }

  /**
   * Get a specific plugin entry
   */
  get(id: PluginId): PluginRegistryEntry | undefined {
    return this.entries.get(id);
  }

  /**
   * Search plugins by name or tags
   */
  search(query: string): PluginRegistryEntry[] {
    const lowerQuery = query.toLowerCase();
    return this.getAll().filter((entry) => {
      const nameMatch = entry.metadata.name.toLowerCase().includes(lowerQuery);
      const descMatch = entry.metadata.description
        ?.toLowerCase()
        .includes(lowerQuery);
      const tagMatch = entry.tags?.some((tag) =>
        tag.toLowerCase().includes(lowerQuery)
      );
      return nameMatch || descMatch || tagMatch;
    });
  }

  /**
   * Get plugins by tag
   */
  getByTag(tag: string): PluginRegistryEntry[] {
    const lowerTag = tag.toLowerCase();
    return this.getAll().filter((entry) =>
      entry.tags?.some((t) => t.toLowerCase() === lowerTag)
    );
  }

  /**
   * Get verified plugins only
   */
  getVerified(): PluginRegistryEntry[] {
    return this.getAll().filter((entry) => entry.verified);
  }

  /**
   * Get popular plugins (sorted by downloads)
   */
  getPopular(limit: number = 10): PluginRegistryEntry[] {
    return this.getAll()
      .sort((a, b) => (b.downloads ?? 0) - (a.downloads ?? 0))
      .slice(0, limit);
  }

  /**
   * Get recently updated plugins
   */
  getRecent(limit: number = 10): PluginRegistryEntry[] {
    return this.getAll()
      .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))
      .slice(0, limit);
  }

  /**
   * Get plugin count
   */
  get count(): number {
    return this.entries.size;
  }
}
