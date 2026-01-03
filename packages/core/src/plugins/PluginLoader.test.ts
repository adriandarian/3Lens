/**
 * PluginLoader Test Suite
 *
 * Tests for plugin loading from various sources.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PluginLoader } from './PluginLoader';
import type { DevtoolPlugin, PluginMetadata } from './types';

// Helper to create a valid plugin
function createValidPlugin(overrides: Partial<DevtoolPlugin> = {}): DevtoolPlugin {
  return {
    metadata: {
      id: 'test.plugin',
      name: 'Test Plugin',
      version: '1.0.0',
      ...overrides.metadata,
    } as PluginMetadata,
    activate: vi.fn(),
    ...overrides,
  };
}

describe('PluginLoader', () => {
  let loader: PluginLoader;

  beforeEach(() => {
    loader = new PluginLoader();
  });

  describe('constructor', () => {
    it('should create loader with default options', () => {
      expect(loader).toBeDefined();
    });

    it('should accept custom options', () => {
      const customImport = vi.fn();
      const customLoader = new PluginLoader({
        importFn: customImport,
        timeout: 5000,
        allowUrlImports: false,
        cdnTemplate: 'https://cdn.example.com/{package}@{version}',
      });
      expect(customLoader).toBeDefined();
    });
  });

  describe('loadInline', () => {
    it('should load a valid inline plugin', () => {
      const plugin = createValidPlugin();
      
      const result = loader.loadInline(plugin);
      
      expect(result.success).toBe(true);
      expect(result.plugin).toBe(plugin);
      expect(result.source.type).toBe('inline');
    });

    it('should track load time', () => {
      const plugin = createValidPlugin();
      
      const result = loader.loadInline(plugin);
      
      expect(result.loadTime).toBeGreaterThanOrEqual(0);
    });

    it('should reject plugin without metadata', () => {
      const plugin = {
        activate: vi.fn(),
      } as unknown as DevtoolPlugin;
      
      const result = loader.loadInline(plugin);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject plugin without id', () => {
      const plugin = {
        metadata: { name: 'Test', version: '1.0.0' },
        activate: vi.fn(),
      } as unknown as DevtoolPlugin;
      
      const result = loader.loadInline(plugin);
      
      expect(result.success).toBe(false);
    });

    it('should reject plugin without name', () => {
      const plugin = {
        metadata: { id: 'test', version: '1.0.0' },
        activate: vi.fn(),
      } as unknown as DevtoolPlugin;
      
      const result = loader.loadInline(plugin);
      
      expect(result.success).toBe(false);
    });

    it('should reject plugin without version', () => {
      const plugin = {
        metadata: { id: 'test', name: 'Test' },
        activate: vi.fn(),
      } as unknown as DevtoolPlugin;
      
      const result = loader.loadInline(plugin);
      
      expect(result.success).toBe(false);
    });

    it('should reject plugin without activate function', () => {
      const plugin = {
        metadata: { id: 'test', name: 'Test', version: '1.0.0' },
      } as DevtoolPlugin;
      
      const result = loader.loadInline(plugin);
      
      expect(result.success).toBe(false);
    });

    it('should store loaded plugin', () => {
      const plugin = createValidPlugin();
      
      loader.loadInline(plugin);
      
      expect(loader.isLoaded('test.plugin')).toBe(true);
      expect(loader.getLoadedPlugin('test.plugin')).toBe(plugin);
    });
  });

  describe('getLoadedPlugin', () => {
    it('should return loaded plugin', () => {
      const plugin = createValidPlugin();
      loader.loadInline(plugin);
      
      expect(loader.getLoadedPlugin('test.plugin')).toBe(plugin);
    });

    it('should return undefined for unknown plugin', () => {
      expect(loader.getLoadedPlugin('unknown')).toBeUndefined();
    });
  });

  describe('getLoadedPlugins', () => {
    it('should return all loaded plugins', () => {
      const plugin1 = createValidPlugin({ metadata: { id: 'plugin1', name: 'P1', version: '1.0.0' } });
      const plugin2 = createValidPlugin({ metadata: { id: 'plugin2', name: 'P2', version: '1.0.0' } });
      
      loader.loadInline(plugin1);
      loader.loadInline(plugin2);
      
      const plugins = loader.getLoadedPlugins();
      expect(plugins).toHaveLength(2);
      expect(plugins).toContain(plugin1);
      expect(plugins).toContain(plugin2);
    });

    it('should return empty array when no plugins loaded', () => {
      expect(loader.getLoadedPlugins()).toEqual([]);
    });
  });

  describe('isLoaded', () => {
    it('should return true for loaded plugin', () => {
      const plugin = createValidPlugin();
      loader.loadInline(plugin);
      
      expect(loader.isLoaded('test.plugin')).toBe(true);
    });

    it('should return false for unloaded plugin', () => {
      expect(loader.isLoaded('test.plugin')).toBe(false);
    });
  });

  describe('unload', () => {
    it('should unload a plugin', () => {
      const plugin = createValidPlugin();
      loader.loadInline(plugin);
      
      const result = loader.unload('test.plugin');
      
      expect(result).toBe(true);
      expect(loader.isLoaded('test.plugin')).toBe(false);
    });

    it('should return false for unknown plugin', () => {
      const result = loader.unload('unknown');
      
      expect(result).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear all loaded plugins', () => {
      loader.loadInline(createValidPlugin({ metadata: { id: 'p1', name: 'P1', version: '1.0.0' } }));
      loader.loadInline(createValidPlugin({ metadata: { id: 'p2', name: 'P2', version: '1.0.0' } }));
      
      loader.clear();
      
      expect(loader.getLoadedPlugins()).toEqual([]);
    });
  });

  describe('loadFromUrl', () => {
    it('should reject URL imports when disabled', async () => {
      const restrictedLoader = new PluginLoader({
        allowUrlImports: false,
      });
      
      const result = await restrictedLoader.loadFromUrl('https://example.com/plugin.js');
      
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('disabled');
    });

    it('should attempt to load from URL', async () => {
      const mockImport = vi.fn().mockResolvedValue({
        plugin: createValidPlugin(),
      });
      
      const urlLoader = new PluginLoader({
        importFn: mockImport,
      });
      
      const result = await urlLoader.loadFromUrl('https://example.com/plugin.js');
      
      expect(mockImport).toHaveBeenCalledWith('https://example.com/plugin.js');
      expect(result.success).toBe(true);
    });

    it('should handle load errors', async () => {
      const mockImport = vi.fn().mockRejectedValue(new Error('Network error'));
      
      const errorLoader = new PluginLoader({
        importFn: mockImport,
      });
      
      const result = await errorLoader.loadFromUrl('https://example.com/plugin.js');
      
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Network error');
    });
  });

  describe('loadFromNpm', () => {
    it('should construct CDN URL from package name', async () => {
      const mockImport = vi.fn().mockResolvedValue({
        plugin: createValidPlugin(),
      });
      
      const npmLoader = new PluginLoader({
        importFn: mockImport,
      });
      
      await npmLoader.loadFromNpm('@3lens/plugin-test', '1.0.0');
      
      expect(mockImport).toHaveBeenCalledWith(
        expect.stringContaining('@3lens/plugin-test')
      );
      expect(mockImport).toHaveBeenCalledWith(
        expect.stringContaining('1.0.0')
      );
    });

    it('should use latest version by default', async () => {
      const mockImport = vi.fn().mockResolvedValue({
        plugin: createValidPlugin(),
      });
      
      const npmLoader = new PluginLoader({
        importFn: mockImport,
        cdnTemplate: 'https://cdn.example.com/{package}@{version}',
      });
      
      await npmLoader.loadFromNpm('my-plugin');
      
      expect(mockImport).toHaveBeenCalledWith('https://cdn.example.com/my-plugin@latest');
    });
  });

  describe('loadFromSource', () => {
    it('should deduplicate concurrent loads', async () => {
      let resolveLoad: Function;
      const mockImport = vi.fn().mockImplementation(() => 
        new Promise(resolve => { resolveLoad = () => resolve({ plugin: createValidPlugin() }); })
      );
      
      const dedupeLoader = new PluginLoader({
        importFn: mockImport,
      });
      
      const promise1 = dedupeLoader.loadFromSource({ type: 'url', source: 'https://example.com/plugin.js' });
      const promise2 = dedupeLoader.loadFromSource({ type: 'url', source: 'https://example.com/plugin.js' });
      
      // Both should return the same promise (deduplication)
      resolveLoad!();
      
      const [result1, result2] = await Promise.all([promise1, promise2]);
      
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      // Import should only be called once
      expect(mockImport).toHaveBeenCalledTimes(1);
    });

    it('should fail when loading duplicate plugin ID from different source', async () => {
      const plugin = createValidPlugin();
      const mockImport = vi.fn().mockResolvedValue({ plugin });
      
      const cacheLoader = new PluginLoader({
        importFn: mockImport,
      });
      
      // Load first time
      const firstResult = await cacheLoader.loadFromSource({ type: 'url', source: 'https://example.com/plugin.js' });
      expect(firstResult.success).toBe(true);
      
      // Load second time with same URL - fails because plugin ID already exists
      const secondResult = await cacheLoader.loadFromSource({ type: 'url', source: 'https://example.com/plugin.js' });
      
      expect(secondResult.success).toBe(false);
      expect(secondResult.error?.message).toContain('already loaded');
    });
  });

  describe('loadMultiple', () => {
    it('should load multiple plugins', async () => {
      const mockImport = vi.fn()
        .mockResolvedValueOnce({ plugin: createValidPlugin({ metadata: { id: 'p1', name: 'P1', version: '1.0.0' } }) })
        .mockResolvedValueOnce({ plugin: createValidPlugin({ metadata: { id: 'p2', name: 'P2', version: '1.0.0' } }) });
      
      const multiLoader = new PluginLoader({
        importFn: mockImport,
      });
      
      const results = await multiLoader.loadMultiple([
        { type: 'url', source: 'https://example.com/plugin1.js' },
        { type: 'url', source: 'https://example.com/plugin2.js' },
      ]);
      
      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(true);
    });
  });

  describe('plugin extraction', () => {
    it('should extract plugin from createPlugin factory', async () => {
      const plugin = createValidPlugin();
      const mockImport = vi.fn().mockResolvedValue({
        createPlugin: () => plugin,
      });
      
      const factoryLoader = new PluginLoader({
        importFn: mockImport,
      });
      
      const result = await factoryLoader.loadFromUrl('https://example.com/plugin.js');
      
      expect(result.success).toBe(true);
      expect(result.plugin).toBe(plugin);
    });

    it('should pass options to createPlugin factory', async () => {
      const createPlugin = vi.fn().mockReturnValue(createValidPlugin());
      const mockImport = vi.fn().mockResolvedValue({ createPlugin });
      
      const optionsLoader = new PluginLoader({
        importFn: mockImport,
      });
      
      await optionsLoader.loadFromUrl('https://example.com/plugin.js', { debug: true });
      
      expect(createPlugin).toHaveBeenCalledWith({ debug: true });
    });

    it('should extract plugin from default export', async () => {
      const plugin = createValidPlugin();
      const mockImport = vi.fn().mockResolvedValue({
        default: plugin,
      });
      
      const defaultLoader = new PluginLoader({
        importFn: mockImport,
      });
      
      const result = await defaultLoader.loadFromUrl('https://example.com/plugin.js');
      
      expect(result.success).toBe(true);
      expect(result.plugin).toBe(plugin);
    });

    it('should extract plugin from default.plugin', async () => {
      const plugin = createValidPlugin();
      const mockImport = vi.fn().mockResolvedValue({
        default: { plugin },
      });
      
      const defaultPluginLoader = new PluginLoader({
        importFn: mockImport,
      });
      
      const result = await defaultPluginLoader.loadFromUrl('https://example.com/plugin.js');
      
      expect(result.success).toBe(true);
      expect(result.plugin).toBe(plugin);
    });

    it('should extract plugin from default.createPlugin factory', async () => {
      const plugin = createValidPlugin();
      const mockImport = vi.fn().mockResolvedValue({
        default: { createPlugin: () => plugin },
      });
      
      const defaultFactoryLoader = new PluginLoader({
        importFn: mockImport,
      });
      
      const result = await defaultFactoryLoader.loadFromUrl('https://example.com/plugin.js');
      
      expect(result.success).toBe(true);
      expect(result.plugin).toBe(plugin);
    });
  });

  describe('timeout handling', () => {
    it('should timeout slow loads', async () => {
      const mockImport = vi.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 1000))
      );
      
      const timeoutLoader = new PluginLoader({
        importFn: mockImport,
        timeout: 50,
      });
      
      const result = await timeoutLoader.loadFromUrl('https://example.com/slow-plugin.js');
      
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('timeout');
    });
  });
});
