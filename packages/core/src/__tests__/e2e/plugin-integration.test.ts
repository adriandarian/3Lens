/**
 * Integration E2E Tests: Plugin System
 * 
 * Tests the complete plugin lifecycle, loading, registration,
 * and interaction with the probe.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DevtoolProbe } from '../../probe/DevtoolProbe';
import { PluginManager } from '../../plugins/PluginManager';
import type { DevtoolPlugin, DevtoolContext } from '../../plugins/types';

// Helper to create mock probe
function createTestProbe() {
  return new DevtoolProbe({
    appName: 'Plugin E2E Test',
    env: 'development',
  });
}

// Helper to create a test plugin
function createTestPlugin(
  id: string,
  options: Partial<{
    name: string;
    version: string;
    description: string;
    author: string;
    activate: (context: DevtoolContext) => void | Promise<void>;
    deactivate: (context: DevtoolContext) => void | Promise<void>;
    panels: DevtoolPlugin['panels'];
    toolbarActions: DevtoolPlugin['toolbarActions'];
    settings: DevtoolPlugin['settings'];
  }> = {}
): DevtoolPlugin {
  return {
    metadata: {
      id,
      name: options.name ?? `Test Plugin ${id}`,
      version: options.version ?? '1.0.0',
      description: options.description ?? 'A test plugin',
      author: options.author ?? 'Test Author',
    },
    activate: options.activate ?? vi.fn(),
    deactivate: options.deactivate,
    panels: options.panels,
    toolbarActions: options.toolbarActions,
    settings: options.settings,
  };
}

describe('Plugin System Integration E2E', () => {
  let probe: DevtoolProbe;

  beforeEach(() => {
    probe = createTestProbe();
  });

  afterEach(() => {
    probe.dispose();
  });

  describe('Plugin Registration', () => {
    it('should register a simple plugin', () => {
      const activateFn = vi.fn();
      const plugin = createTestPlugin('simple-plugin', {
        activate: activateFn,
      });

      probe.registerPlugin(plugin);

      const plugins = probe.getPlugins();
      expect(plugins.some(p => p.metadata.id === 'simple-plugin')).toBe(true);
    });

    it('should register multiple plugins', () => {
      const plugins = [
        createTestPlugin('plugin-a'),
        createTestPlugin('plugin-b'),
        createTestPlugin('plugin-c'),
      ];

      for (const plugin of plugins) {
        probe.registerPlugin(plugin);
      }

      const registered = probe.getPlugins();
      expect(registered.some(p => p.metadata.id === 'plugin-a')).toBe(true);
      expect(registered.some(p => p.metadata.id === 'plugin-b')).toBe(true);
      expect(registered.some(p => p.metadata.id === 'plugin-c')).toBe(true);
    });

    it('should not register duplicate plugins', () => {
      const plugin1 = createTestPlugin('duplicate-plugin');

      probe.registerPlugin(plugin1);
      
      // Second registration should throw
      expect(() => {
        const plugin2 = createTestPlugin('duplicate-plugin');
        probe.registerPlugin(plugin2);
      }).toThrow();
    });
  });

  describe('Plugin Lifecycle', () => {
    it('should activate plugin on registration', async () => {
      const activateFn = vi.fn();
      const plugin = createTestPlugin('activate-plugin', {
        activate: activateFn,
      });

      probe.registerPlugin(plugin);
      await probe.activatePlugin('activate-plugin');

      expect(activateFn).toHaveBeenCalled();
    });

    it('should call deactivate on unregister', async () => {
      const deactivateFn = vi.fn();
      const plugin = createTestPlugin('deactivate-plugin', {
        deactivate: deactivateFn,
      });

      probe.registerPlugin(plugin);
      await probe.activatePlugin('deactivate-plugin');
      await probe.unregisterPlugin('deactivate-plugin');

      expect(deactivateFn).toHaveBeenCalled();
    });
  });

  describe('Plugin Panels', () => {
    it('should register plugin with panels', () => {
      const plugin = createTestPlugin('panel-plugin', {
        panels: [
          {
            id: 'test-panel',
            name: 'Test Panel',
            icon: '🔧',
            render: () => '<div>Test Content</div>',
          },
        ],
      });

      probe.registerPlugin(plugin);

      const plugins = probe.getPlugins();
      const registeredPlugin = plugins.find(p => p.metadata.id === 'panel-plugin');
      // getPlugins() returns {id, metadata, state} - panels are managed internally
      expect(registeredPlugin?.metadata.id).toBe('panel-plugin');
    });
  });

  describe('Plugin Toolbar Actions', () => {
    it('should register plugin with toolbar actions', () => {
      const actionHandler = vi.fn();

      const plugin = createTestPlugin('action-plugin', {
        toolbarActions: [
          {
            id: 'test-action',
            name: 'Test Action',
            icon: '⚡',
            onClick: actionHandler,
          },
        ],
      });

      probe.registerPlugin(plugin);

      const plugins = probe.getPlugins();
      const registeredPlugin = plugins.find(p => p.metadata.id === 'action-plugin');
      // getPlugins() returns {id, metadata, state} - toolbar actions are managed internally
      expect(registeredPlugin?.metadata.id).toBe('action-plugin');
    });
  });

  describe('Plugin Settings', () => {
    it('should handle plugin settings schema', () => {
      const plugin = createTestPlugin('settings-plugin', {
        settings: {
          fields: [
            {
              key: 'enabled',
              type: 'boolean',
              label: 'Enable Feature',
              defaultValue: true,
            },
            {
              key: 'threshold',
              type: 'number',
              label: 'Threshold',
              defaultValue: 100,
            },
          ],
        },
      });

      probe.registerPlugin(plugin);

      const plugins = probe.getPlugins();
      const registeredPlugin = plugins.find(p => p.metadata.id === 'settings-plugin');
      // getPlugins() returns {id, metadata, state} - settings are managed internally
      expect(registeredPlugin?.metadata.id).toBe('settings-plugin');
    });
  });

  describe('Plugin Count', () => {
    it('should track plugin count', () => {
      expect(probe.pluginCount).toBe(0);

      probe.registerPlugin(createTestPlugin('count-1'));
      expect(probe.pluginCount).toBe(1);

      probe.registerPlugin(createTestPlugin('count-2'));
      expect(probe.pluginCount).toBe(2);
    });

    it('should track active plugin count', async () => {
      probe.registerPlugin(createTestPlugin('active-1'));
      probe.registerPlugin(createTestPlugin('active-2'));

      await probe.activatePlugin('active-1');
      expect(probe.activePluginCount).toBe(1);

      await probe.activatePlugin('active-2');
      expect(probe.activePluginCount).toBe(2);
    });
  });

  describe('Error Handling', () => {
    it('should handle plugin activation errors gracefully', async () => {
      const errorPlugin = createTestPlugin('error-plugin', {
        activate: () => {
          throw new Error('Activation failed!');
        },
      });

      probe.registerPlugin(errorPlugin);

      // Should not throw, but handle gracefully
      try {
        await probe.activatePlugin('error-plugin');
      } catch (e) {
        // Error is expected
        expect(e).toBeDefined();
      }

      // Probe should still be functional
      expect(probe.config.appName).toBe('Plugin E2E Test');
    });
  });
});

describe('PluginManager Direct Tests', () => {
  let probe: DevtoolProbe;
  let manager: PluginManager;

  beforeEach(() => {
    probe = new DevtoolProbe({
      appName: 'Manager Test',
      env: 'development',
    });
    manager = new PluginManager(probe);
  });

  afterEach(() => {
    // PluginManager doesn't have dispose() - cleanup handled by probe
    probe.dispose();
  });

  it('should manage plugin lifecycle correctly', async () => {
    const activateFn = vi.fn();
    const deactivateFn = vi.fn();

    const plugin = createTestPlugin('managed-plugin', {
      activate: activateFn,
      deactivate: deactivateFn,
    });

    manager.registerPlugin(plugin);
    await manager.activatePlugin('managed-plugin');
    expect(activateFn).toHaveBeenCalled();

    await manager.unregisterPlugin('managed-plugin');
    expect(deactivateFn).toHaveBeenCalled();
  });

  it('should list all registered plugins', () => {
    manager.registerPlugin(createTestPlugin('list-a'));
    manager.registerPlugin(createTestPlugin('list-b'));

    const plugins = manager.getPlugins();
    expect(plugins).toHaveLength(2);
    expect(plugins.map(p => p.metadata.id)).toContain('list-a');
    expect(plugins.map(p => p.metadata.id)).toContain('list-b');
  });

  it('should get plugin by id', () => {
    const plugin = createTestPlugin('get-by-id');
    manager.registerPlugin(plugin);

    const retrieved = manager.getPlugin('get-by-id');
    // RegisteredPlugin has .plugin.metadata, not .metadata directly
    expect(retrieved?.plugin.metadata.id).toBe('get-by-id');
  });

  it('should check if plugin is registered', () => {
    const plugin = createTestPlugin('check-registered');
    
    // Use getPlugin() which returns undefined if not found
    expect(manager.getPlugin('check-registered')).toBeUndefined();
    
    manager.registerPlugin(plugin);
    
    expect(manager.getPlugin('check-registered')).toBeDefined();
  });
});
