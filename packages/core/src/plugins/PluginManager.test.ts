/**
 * PluginManager Test Suite
 *
 * Tests for plugin lifecycle management, messaging, and state handling.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PluginManager } from './PluginManager';
import type { DevtoolPlugin, PanelRenderContext, DevtoolContext } from './types';

// Mock HTMLElement for DOM tests
function createMockContainer(): HTMLElement {
  return {
    innerHTML: '',
    appendChild: vi.fn(),
    removeChild: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    querySelector: vi.fn(),
    querySelectorAll: vi.fn(() => []),
  } as unknown as HTMLElement;
}

// Mock DevtoolProbe
function createMockProbe(): any {
  const callbacks = {
    frameStats: [] as Function[],
    snapshot: [] as Function[],
    selection: [] as Function[],
  };

  return {
    config: {
      debug: false,
      captureFrameStats: true,
      snapshotInterval: 1000,
    },
    onFrameStats: vi.fn((cb: Function) => {
      callbacks.frameStats.push(cb);
      return () => {
        callbacks.frameStats = callbacks.frameStats.filter(c => c !== cb);
      };
    }),
    onSnapshot: vi.fn((cb: Function) => {
      callbacks.snapshot.push(cb);
      return () => {
        callbacks.snapshot = callbacks.snapshot.filter(c => c !== cb);
      };
    }),
    onSelectionChanged: vi.fn((cb: Function) => {
      callbacks.selection.push(cb);
      return () => {
        callbacks.selection = callbacks.selection.filter(c => c !== cb);
      };
    }),
    getLatestStats: vi.fn(() => null),
    getSnapshot: vi.fn(() => null),
    selectObject: vi.fn(),
    findObjectByDebugIdOrUuid: vi.fn(() => ({ uuid: 'some-uuid' })),
    navigateToObject: vi.fn(),
    focusOnObject: vi.fn(),
    setObjectVisible: vi.fn(),
    getLogicalEntities: vi.fn(() => []),
    getModuleInfo: vi.fn(() => null),
    // Emit helpers for testing
    _emit: {
      frameStats: (stats: any) => callbacks.frameStats.forEach(cb => cb(stats)),
      snapshot: (snapshot: any) => callbacks.snapshot.forEach(cb => cb(snapshot)),
      selection: (node: any) => callbacks.selection.forEach(cb => cb(node)),
    },
  };
}

// Helper to create a basic plugin
function createMockPlugin(overrides: Partial<DevtoolPlugin> = {}): DevtoolPlugin {
  return {
    metadata: {
      id: 'test.plugin',
      name: 'Test Plugin',
      version: '1.0.0',
      ...overrides.metadata,
    },
    activate: vi.fn(),
    deactivate: vi.fn(),
    ...overrides,
  };
}

describe('PluginManager', () => {
  let manager: PluginManager;
  let mockProbe: ReturnType<typeof createMockProbe>;

  beforeEach(() => {
    mockProbe = createMockProbe();
    manager = new PluginManager(mockProbe);
  });

  describe('registerPlugin', () => {
    it('should register a valid plugin', () => {
      const plugin = createMockPlugin();
      
      manager.registerPlugin(plugin);
      
      const plugins = manager.getPlugins();
      expect(plugins).toHaveLength(1);
      expect(plugins[0].id).toBe('test.plugin');
      expect(plugins[0].state).toBe('registered');
    });

    it('should throw on duplicate plugin ID', () => {
      const plugin = createMockPlugin();
      manager.registerPlugin(plugin);
      
      expect(() => {
        manager.registerPlugin(plugin);
      }).toThrow('Plugin "test.plugin" is already registered');
    });

    it('should register plugin panels', () => {
      const plugin = createMockPlugin({
        panels: [
          {
            id: 'panel1',
            name: 'Panel 1',
            render: () => '<div>Panel 1</div>',
          },
          {
            id: 'panel2',
            name: 'Panel 2',
            render: () => '<div>Panel 2</div>',
          },
        ],
      });
      
      manager.registerPlugin(plugin);
      
      const panels = manager.getPanels();
      expect(panels).toHaveLength(2);
      expect(panels[0].panel.name).toBe('Panel 1');
    });

    it('should register toolbar actions', () => {
      const plugin = createMockPlugin({
        toolbarActions: [
          {
            id: 'action1',
            name: 'Action 1',
            icon: '🔧',
            onClick: vi.fn(),
          },
        ],
      });
      
      manager.registerPlugin(plugin);
      
      const actions = manager.getToolbarActions();
      expect(actions).toHaveLength(1);
      expect(actions[0].action.name).toBe('Action 1');
    });

    it('should register context menu items', () => {
      const plugin = createMockPlugin({
        contextMenuItems: [
          {
            id: 'menu1',
            name: 'Menu Item 1',
            target: 'scene-tree',
            onClick: vi.fn(),
          },
        ],
      });
      
      manager.registerPlugin(plugin);
      
      const items = manager.getContextMenuItems('scene-tree');
      expect(items).toHaveLength(1);
      expect(items[0].item.name).toBe('Menu Item 1');
    });
  });

  describe('unregisterPlugin', () => {
    it('should unregister a plugin', async () => {
      const plugin = createMockPlugin();
      manager.registerPlugin(plugin);
      
      await manager.unregisterPlugin('test.plugin');
      
      const plugins = manager.getPlugins();
      expect(plugins).toHaveLength(0);
    });

    it('should handle unregistering non-existent plugin', async () => {
      await expect(
        manager.unregisterPlugin('non.existent')
      ).resolves.not.toThrow();
    });

    it('should deactivate plugin before unregistering', async () => {
      const deactivate = vi.fn();
      const plugin = createMockPlugin({ deactivate });
      manager.registerPlugin(plugin);
      await manager.activatePlugin('test.plugin');
      
      await manager.unregisterPlugin('test.plugin');
      
      expect(deactivate).toHaveBeenCalled();
    });

    it('should remove panels on unregister', async () => {
      const plugin = createMockPlugin({
        panels: [{ id: 'panel1', name: 'Panel 1', render: () => '' }],
      });
      manager.registerPlugin(plugin);
      
      await manager.unregisterPlugin('test.plugin');
      
      const panels = manager.getPanels();
      expect(panels).toHaveLength(0);
    });
  });

  describe('activatePlugin', () => {
    it('should activate a registered plugin', async () => {
      const activate = vi.fn();
      const plugin = createMockPlugin({ activate });
      manager.registerPlugin(plugin);
      
      await manager.activatePlugin('test.plugin');
      
      expect(activate).toHaveBeenCalled();
      const plugins = manager.getPlugins();
      expect(plugins[0].state).toBe('activated');
    });

    it('should throw for non-existent plugin', async () => {
      await expect(
        manager.activatePlugin('non.existent')
      ).rejects.toThrow('Plugin "non.existent" not found');
    });

    it('should not re-activate already active plugin', async () => {
      const activate = vi.fn();
      const plugin = createMockPlugin({ activate });
      manager.registerPlugin(plugin);
      
      await manager.activatePlugin('test.plugin');
      await manager.activatePlugin('test.plugin');
      
      expect(activate).toHaveBeenCalledTimes(1);
    });

    it('should pass context to activate', async () => {
      let receivedContext: DevtoolContext | null = null;
      const plugin = createMockPlugin({
        activate: (ctx) => {
          receivedContext = ctx;
        },
      });
      manager.registerPlugin(plugin);
      
      await manager.activatePlugin('test.plugin');
      
      expect(receivedContext).toBeDefined();
      // Context should have probe and state methods
      expect(receivedContext!.probe).toBe(mockProbe);
      expect(typeof receivedContext!.getState).toBe('function');
      expect(typeof receivedContext!.setState).toBe('function');
    });

    it('should set error state on activation failure', async () => {
      const plugin = createMockPlugin({
        activate: () => {
          throw new Error('Activation failed');
        },
      });
      manager.registerPlugin(plugin);
      
      await expect(
        manager.activatePlugin('test.plugin')
      ).rejects.toThrow('Activation failed');
      
      const plugins = manager.getPlugins();
      expect(plugins[0].state).toBe('error');
    });
  });

  describe('deactivatePlugin', () => {
    it('should deactivate an active plugin', async () => {
      const deactivate = vi.fn();
      const plugin = createMockPlugin({ deactivate });
      manager.registerPlugin(plugin);
      await manager.activatePlugin('test.plugin');
      
      await manager.deactivatePlugin('test.plugin');
      
      expect(deactivate).toHaveBeenCalled();
      const plugins = manager.getPlugins();
      expect(plugins[0].state).toBe('deactivated');
    });

    it('should handle deactivating non-active plugin', async () => {
      const plugin = createMockPlugin();
      manager.registerPlugin(plugin);
      
      await expect(
        manager.deactivatePlugin('test.plugin')
      ).resolves.not.toThrow();
    });

    it('should call panel unmount on deactivation', async () => {
      const onUnmount = vi.fn();
      const plugin = createMockPlugin({
        panels: [{
          id: 'panel1',
          name: 'Panel 1',
          render: () => '',
          onUnmount,
        }],
      });
      manager.registerPlugin(plugin);
      await manager.activatePlugin('test.plugin');
      
      // Mount the panel
      const container = createMockContainer();
      manager.mountPanel('test.plugin:panel1', container);
      
      await manager.deactivatePlugin('test.plugin');
      
      expect(onUnmount).toHaveBeenCalled();
    });
  });

  describe('getPlugins', () => {
    it('should return all registered plugins', () => {
      manager.registerPlugin(createMockPlugin({ metadata: { id: 'plugin1', name: 'P1', version: '1.0.0' } }));
      manager.registerPlugin(createMockPlugin({ metadata: { id: 'plugin2', name: 'P2', version: '1.0.0' } }));
      
      const plugins = manager.getPlugins();
      
      expect(plugins).toHaveLength(2);
    });

    it('should return empty array when no plugins', () => {
      const plugins = manager.getPlugins();
      expect(plugins).toEqual([]);
    });
  });

  describe('getPlugin', () => {
    it('should return specific plugin', () => {
      manager.registerPlugin(createMockPlugin());
      
      const plugin = manager.getPlugin('test.plugin');
      
      expect(plugin).toBeDefined();
      expect(plugin?.plugin.metadata.name).toBe('Test Plugin');
    });

    it('should return undefined for non-existent plugin', () => {
      const plugin = manager.getPlugin('non.existent');
      expect(plugin).toBeUndefined();
    });
  });

  describe('renderPanel', () => {
    it('should render panel content', async () => {
      const plugin = createMockPlugin({
        panels: [{
          id: 'panel1',
          name: 'Panel 1',
          render: () => '<div>Test Content</div>',
        }],
      });
      manager.registerPlugin(plugin);
      await manager.activatePlugin('test.plugin');
      
      const html = manager.renderPanel('test.plugin:panel1');
      
      expect(html).toBe('<div>Test Content</div>');
    });

    it('should return error for non-existent panel', () => {
      const html = manager.renderPanel('non.existent:panel');
      expect(html).toContain('Panel not found');
    });

    it('should return error for inactive plugin panel', () => {
      const plugin = createMockPlugin({
        panels: [{ id: 'panel1', name: 'Panel 1', render: () => '' }],
      });
      manager.registerPlugin(plugin);
      
      const html = manager.renderPanel('test.plugin:panel1');
      expect(html).toContain('Plugin not active');
    });

    it('should handle render errors gracefully', async () => {
      const plugin = createMockPlugin({
        panels: [{
          id: 'panel1',
          name: 'Panel 1',
          render: () => {
            throw new Error('Render failed');
          },
        }],
      });
      manager.registerPlugin(plugin);
      await manager.activatePlugin('test.plugin');
      
      const html = manager.renderPanel('test.plugin:panel1');
      expect(html).toContain('Render error');
      expect(html).toContain('Render failed');
    });

    it('should pass context to render function', async () => {
      let receivedContext: PanelRenderContext | null = null;
      const plugin = createMockPlugin({
        panels: [{
          id: 'panel1',
          name: 'Panel 1',
          render: (ctx) => {
            receivedContext = ctx;
            return '';
          },
        }],
      });
      manager.registerPlugin(plugin);
      await manager.activatePlugin('test.plugin');
      
      manager.renderPanel('test.plugin:panel1');
      
      expect(receivedContext).toBeDefined();
      expect(receivedContext!.probe).toBe(mockProbe);
    });
  });

  describe('mountPanel / unmountPanel', () => {
    it('should call onMount when mounting panel', async () => {
      const onMount = vi.fn();
      const plugin = createMockPlugin({
        panels: [{
          id: 'panel1',
          name: 'Panel 1',
          render: () => '',
          onMount,
        }],
      });
      manager.registerPlugin(plugin);
      await manager.activatePlugin('test.plugin');
      
      const container = createMockContainer();
      manager.mountPanel('test.plugin:panel1', container);
      
      expect(onMount).toHaveBeenCalledWith(container, expect.any(Object));
    });

    it('should call onUnmount when unmounting panel', async () => {
      const onUnmount = vi.fn();
      const plugin = createMockPlugin({
        panels: [{
          id: 'panel1',
          name: 'Panel 1',
          render: () => '',
          onUnmount,
        }],
      });
      manager.registerPlugin(plugin);
      await manager.activatePlugin('test.plugin');
      
      const container = createMockContainer();
      manager.mountPanel('test.plugin:panel1', container);
      manager.unmountPanel('test.plugin:panel1');
      
      expect(onUnmount).toHaveBeenCalledWith(container);
    });
  });

  describe('executeToolbarAction', () => {
    it('should execute toolbar action', async () => {
      const onClick = vi.fn();
      const plugin = createMockPlugin({
        toolbarActions: [{
          id: 'action1',
          name: 'Action 1',
          icon: '🔧',
          onClick,
        }],
      });
      manager.registerPlugin(plugin);
      await manager.activatePlugin('test.plugin');
      
      await manager.executeToolbarAction('test.plugin:action1');
      
      expect(onClick).toHaveBeenCalled();
    });

    it('should respect isEnabled check', async () => {
      const onClick = vi.fn();
      const plugin = createMockPlugin({
        toolbarActions: [{
          id: 'action1',
          name: 'Action 1',
          icon: '🔧',
          onClick,
          isEnabled: () => false,
        }],
      });
      manager.registerPlugin(plugin);
      await manager.activatePlugin('test.plugin');
      
      await manager.executeToolbarAction('test.plugin:action1');
      
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('panel order', () => {
    it('should sort panels by order', async () => {
      const plugin = createMockPlugin({
        panels: [
          { id: 'panel3', name: 'Panel 3', render: () => '', order: 30 },
          { id: 'panel1', name: 'Panel 1', render: () => '', order: 10 },
          { id: 'panel2', name: 'Panel 2', render: () => '', order: 20 },
        ],
      });
      manager.registerPlugin(plugin);
      
      const panels = manager.getPanels();
      
      expect(panels[0].panel.id).toBe('panel1');
      expect(panels[1].panel.id).toBe('panel2');
      expect(panels[2].panel.id).toBe('panel3');
    });
  });

  describe('context menu filtering', () => {
    it('should filter context menu items by target', async () => {
      const plugin = createMockPlugin({
        contextMenuItems: [
          { id: 'item1', name: 'Item 1', target: 'scene-tree', onClick: vi.fn() },
          { id: 'item2', name: 'Item 2', target: 'inspector', onClick: vi.fn() },
          { id: 'item3', name: 'Item 3', target: 'all', onClick: vi.fn() },
        ],
      });
      manager.registerPlugin(plugin);
      
      const sceneItems = manager.getContextMenuItems('scene-tree');
      const inspectorItems = manager.getContextMenuItems('inspector');
      
      expect(sceneItems).toHaveLength(2); // item1 + item3
      expect(inspectorItems).toHaveLength(2); // item2 + item3
    });
  });

  describe('plugin storage', () => {
    it('should provide storage access in context', async () => {
      let context: DevtoolContext | null = null;
      const plugin = createMockPlugin({
        activate: (ctx) => {
          context = ctx;
          ctx.setState('key', 'value');
        },
      });
      manager.registerPlugin(plugin);
      await manager.activatePlugin('test.plugin');
      
      expect(context!.getState('key')).toBe('value');
    });

    it('should support getAllState', async () => {
      let context: DevtoolContext | null = null;
      const plugin = createMockPlugin({
        activate: (ctx) => {
          context = ctx;
          ctx.setState('key1', 'value1');
          ctx.setState('key2', 'value2');
        },
      });
      manager.registerPlugin(plugin);
      await manager.activatePlugin('test.plugin');
      
      const allState = context!.getAllState();
      expect(allState).toEqual({ key1: 'value1', key2: 'value2' });
    });

    it('should support clearState', async () => {
      let context: DevtoolContext | null = null;
      const plugin = createMockPlugin({
        activate: (ctx) => {
          context = ctx;
          ctx.setState('key1', 'value1');
          ctx.clearState();
        },
      });
      manager.registerPlugin(plugin);
      await manager.activatePlugin('test.plugin');
      
      expect(context!.getAllState()).toEqual({});
    });
  });

  describe('executeContextMenuItem', () => {
    it('should execute context menu item', async () => {
      const onClick = vi.fn();
      const plugin = createMockPlugin({
        contextMenuItems: [{
          id: 'item1',
          name: 'Item 1',
          target: 'scene-tree',
          onClick,
        }],
      });
      manager.registerPlugin(plugin);
      await manager.activatePlugin('test.plugin');
      
      await manager.executeContextMenuItem('test.plugin:item1', { targetUuid: '123', targetType: 'mesh' });
      
      expect(onClick).toHaveBeenCalled();
    });

    it('should not execute for non-existent item', async () => {
      await expect(
        manager.executeContextMenuItem('non.existent:item', { targetUuid: '123', targetType: 'mesh' })
      ).resolves.not.toThrow();
    });

    it('should not execute for inactive plugin', async () => {
      const onClick = vi.fn();
      const plugin = createMockPlugin({
        contextMenuItems: [{
          id: 'item1',
          name: 'Item 1',
          target: 'scene-tree',
          onClick,
        }],
      });
      manager.registerPlugin(plugin);
      
      await manager.executeContextMenuItem('test.plugin:item1', { targetUuid: '123', targetType: 'mesh' });
      
      expect(onClick).not.toHaveBeenCalled();
    });

    it('should respect isEnabled check', async () => {
      const onClick = vi.fn();
      const plugin = createMockPlugin({
        contextMenuItems: [{
          id: 'item1',
          name: 'Item 1',
          target: 'scene-tree',
          onClick,
          isEnabled: () => false,
        }],
      });
      manager.registerPlugin(plugin);
      await manager.activatePlugin('test.plugin');
      
      await manager.executeContextMenuItem('test.plugin:item1', { targetUuid: '123', targetType: 'mesh' });
      
      expect(onClick).not.toHaveBeenCalled();
    });

    it('should handle execution errors gracefully', async () => {
      const plugin = createMockPlugin({
        contextMenuItems: [{
          id: 'item1',
          name: 'Item 1',
          target: 'scene-tree',
          onClick: () => { throw new Error('Item error'); },
        }],
      });
      manager.registerPlugin(plugin);
      await manager.activatePlugin('test.plugin');
      
      // Should not throw
      await expect(
        manager.executeContextMenuItem('test.plugin:item1', { targetUuid: '123', targetType: 'mesh' })
      ).resolves.not.toThrow();
    });
  });

  describe('sendMessage', () => {
    it('should send message to specific plugin', async () => {
      const handler = vi.fn();
      const plugin1 = createMockPlugin({
        metadata: { id: 'plugin1', name: 'Plugin 1', version: '1.0.0' },
        activate: (ctx) => {
          ctx.onMessage(handler);
        },
      });
      const plugin2 = createMockPlugin({
        metadata: { id: 'plugin2', name: 'Plugin 2', version: '1.0.0' },
      });
      
      manager.registerPlugin(plugin1);
      manager.registerPlugin(plugin2);
      await manager.activatePlugin('plugin1');
      await manager.activatePlugin('plugin2');
      
      manager.sendMessage('plugin2', 'plugin1', 'test-type', { data: 'hello' });
      
      expect(handler).toHaveBeenCalledWith(expect.objectContaining({
        source: 'plugin2',
        target: 'plugin1',
        type: 'test-type',
        payload: { data: 'hello' },
      }));
    });

    it('should broadcast message to all plugins except source', async () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      const handler3 = vi.fn();
      
      const plugin1 = createMockPlugin({
        metadata: { id: 'plugin1', name: 'Plugin 1', version: '1.0.0' },
        activate: (ctx) => { ctx.onMessage(handler1); },
      });
      const plugin2 = createMockPlugin({
        metadata: { id: 'plugin2', name: 'Plugin 2', version: '1.0.0' },
        activate: (ctx) => { ctx.onMessage(handler2); },
      });
      const plugin3 = createMockPlugin({
        metadata: { id: 'plugin3', name: 'Plugin 3', version: '1.0.0' },
        activate: (ctx) => { ctx.onMessage(handler3); },
      });
      
      manager.registerPlugin(plugin1);
      manager.registerPlugin(plugin2);
      manager.registerPlugin(plugin3);
      await manager.activatePlugin('plugin1');
      await manager.activatePlugin('plugin2');
      await manager.activatePlugin('plugin3');
      
      manager.sendMessage('plugin1', '*', 'broadcast', { msg: 'hi all' });
      
      expect(handler1).not.toHaveBeenCalled(); // Source excluded
      expect(handler2).toHaveBeenCalled();
      expect(handler3).toHaveBeenCalled();
    });

    it('should not send to inactive plugins', async () => {
      const handler = vi.fn();
      const plugin1 = createMockPlugin({
        metadata: { id: 'plugin1', name: 'Plugin 1', version: '1.0.0' },
        activate: (ctx) => { ctx.onMessage(handler); },
      });
      
      manager.registerPlugin(plugin1);
      // Not activated
      
      manager.sendMessage('other', 'plugin1', 'test', {});
      
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('onMessage (global)', () => {
    it('should receive broadcasts via global handler', async () => {
      const globalHandler = vi.fn();
      manager.onMessage(globalHandler);
      
      const plugin = createMockPlugin();
      manager.registerPlugin(plugin);
      await manager.activatePlugin('test.plugin');
      
      manager.sendMessage('test.plugin', '*', 'broadcast', { test: true });
      
      expect(globalHandler).toHaveBeenCalled();
    });

    it('should support unsubscribe', async () => {
      const globalHandler = vi.fn();
      const unsub = manager.onMessage(globalHandler);
      
      unsub();
      
      const plugin = createMockPlugin();
      manager.registerPlugin(plugin);
      await manager.activatePlugin('test.plugin');
      
      manager.sendMessage('test.plugin', '*', 'broadcast', {});
      
      expect(globalHandler).not.toHaveBeenCalled();
    });
  });

  describe('callbacks', () => {
    it('should call toast callback when showToast is invoked', async () => {
      const toastCallback = vi.fn();
      manager.setToastCallback(toastCallback);
      
      const plugin = createMockPlugin({
        activate: (ctx) => {
          ctx.showToast('Hello!', 'success');
        },
      });
      manager.registerPlugin(plugin);
      await manager.activatePlugin('test.plugin');
      
      expect(toastCallback).toHaveBeenCalledWith('Hello!', 'success');
    });

    it('should use default info type for toast', async () => {
      const toastCallback = vi.fn();
      manager.setToastCallback(toastCallback);
      
      const plugin = createMockPlugin({
        activate: (ctx) => {
          ctx.showToast('Info message');
        },
      });
      manager.registerPlugin(plugin);
      await manager.activatePlugin('test.plugin');
      
      expect(toastCallback).toHaveBeenCalledWith('Info message', 'info');
    });

    it('should call requestRender callback', async () => {
      const renderCallback = vi.fn();
      manager.setRenderRequestCallback(renderCallback);
      
      const plugin = createMockPlugin({
        activate: (ctx) => {
          ctx.requestRender();
        },
      });
      manager.registerPlugin(plugin);
      await manager.activatePlugin('test.plugin');
      
      expect(renderCallback).toHaveBeenCalledWith('test.plugin');
    });
  });

  describe('settings', () => {
    it('should initialize with default settings', () => {
      const plugin = createMockPlugin({
        settings: {
          fields: [
            { key: 'threshold', type: 'number', label: 'Threshold', defaultValue: 50 },
            { key: 'enabled', type: 'boolean', label: 'Enabled', defaultValue: true },
          ],
        },
      });
      manager.registerPlugin(plugin);
      
      const settings = manager.getPluginSettings('test.plugin');
      expect(settings).toEqual({ threshold: 50, enabled: true });
    });

    it('should update plugin settings', async () => {
      const plugin = createMockPlugin({
        settings: {
          fields: [
            { key: 'threshold', type: 'number', label: 'Threshold', defaultValue: 50 },
          ],
        },
      });
      manager.registerPlugin(plugin);
      
      manager.updatePluginSettings('test.plugin', { threshold: 100 });
      
      const settings = manager.getPluginSettings('test.plugin');
      expect(settings.threshold).toBe(100);
    });

    it('should call onSettingsChange when settings update', async () => {
      const onSettingsChange = vi.fn();
      const plugin = createMockPlugin({
        settings: {
          fields: [
            { key: 'value', type: 'number', label: 'Value', defaultValue: 0 },
          ],
        },
        onSettingsChange,
      });
      manager.registerPlugin(plugin);
      await manager.activatePlugin('test.plugin');
      
      manager.updatePluginSettings('test.plugin', { value: 42 });
      
      expect(onSettingsChange).toHaveBeenCalledWith(
        expect.objectContaining({ value: 42 }),
        expect.any(Object)
      );
    });

    it('should not call onSettingsChange for inactive plugin', async () => {
      const onSettingsChange = vi.fn();
      const plugin = createMockPlugin({
        settings: {
          fields: [
            { key: 'value', type: 'number', label: 'Value', defaultValue: 0 },
          ],
        },
        onSettingsChange,
      });
      manager.registerPlugin(plugin);
      // Not activated
      
      manager.updatePluginSettings('test.plugin', { value: 42 });
      
      expect(onSettingsChange).not.toHaveBeenCalled();
    });
  });

  describe('plugin state/settings getters', () => {
    it('should return empty object for non-existent plugin state', () => {
      const state = manager.getPluginState('non.existent');
      expect(state).toEqual({});
    });

    it('should return empty object for non-existent plugin settings', () => {
      const settings = manager.getPluginSettings('non.existent');
      expect(settings).toEqual({});
    });

    it('should set plugin state externally', () => {
      const plugin = createMockPlugin();
      manager.registerPlugin(plugin);
      
      manager.setPluginState('test.plugin', 'external', 'data');
      
      const state = manager.getPluginState('test.plugin');
      expect(state.external).toBe('data');
    });

    it('should ignore setPluginState for non-existent plugin', () => {
      expect(() => {
        manager.setPluginState('non.existent', 'key', 'value');
      }).not.toThrow();
    });

    it('should ignore updatePluginSettings for non-existent plugin', () => {
      expect(() => {
        manager.updatePluginSettings('non.existent', { key: 'value' });
      }).not.toThrow();
    });
  });

  describe('plugin counts', () => {
    it('should track plugin count', () => {
      expect(manager.pluginCount).toBe(0);
      
      manager.registerPlugin(createMockPlugin({ metadata: { id: 'p1', name: 'P1', version: '1.0.0' } }));
      expect(manager.pluginCount).toBe(1);
      
      manager.registerPlugin(createMockPlugin({ metadata: { id: 'p2', name: 'P2', version: '1.0.0' } }));
      expect(manager.pluginCount).toBe(2);
    });

    it('should track active plugin count', async () => {
      expect(manager.activePluginCount).toBe(0);
      
      manager.registerPlugin(createMockPlugin({ metadata: { id: 'p1', name: 'P1', version: '1.0.0' } }));
      manager.registerPlugin(createMockPlugin({ metadata: { id: 'p2', name: 'P2', version: '1.0.0' } }));
      
      await manager.activatePlugin('p1');
      expect(manager.activePluginCount).toBe(1);
      
      await manager.activatePlugin('p2');
      expect(manager.activePluginCount).toBe(2);
    });
  });

  describe('panel notifications', () => {
    it('should notify panels of frame stats', async () => {
      const onFrameStats = vi.fn();
      const plugin = createMockPlugin({
        panels: [{
          id: 'panel1',
          name: 'Panel 1',
          render: () => '',
          onFrameStats,
        }],
      });
      manager.registerPlugin(plugin);
      await manager.activatePlugin('test.plugin');
      
      // Mount panel
      const container = createMockContainer();
      manager.mountPanel('test.plugin:panel1', container);
      
      // Emit frame stats
      const stats = { frameTime: 16.7, fps: 60 };
      mockProbe._emit.frameStats(stats);
      
      expect(onFrameStats).toHaveBeenCalledWith(stats, container);
    });

    it('should notify panels of snapshot', async () => {
      const onSnapshot = vi.fn();
      const plugin = createMockPlugin({
        panels: [{
          id: 'panel1',
          name: 'Panel 1',
          render: () => '',
          onSnapshot,
        }],
      });
      manager.registerPlugin(plugin);
      await manager.activatePlugin('test.plugin');
      
      const container = createMockContainer();
      manager.mountPanel('test.plugin:panel1', container);
      
      const snapshot = { scene: {}, materials: [], textures: [] };
      mockProbe._emit.snapshot(snapshot);
      
      expect(onSnapshot).toHaveBeenCalledWith(snapshot, container);
    });

    it('should notify panels of selection change', async () => {
      const onSelectionChange = vi.fn();
      const plugin = createMockPlugin({
        panels: [{
          id: 'panel1',
          name: 'Panel 1',
          render: () => '',
          onSelectionChange,
        }],
      });
      manager.registerPlugin(plugin);
      await manager.activatePlugin('test.plugin');
      
      const container = createMockContainer();
      manager.mountPanel('test.plugin:panel1', container);
      
      const node = { uuid: '123', name: 'TestMesh', type: 'Mesh' };
      mockProbe._emit.selection(node);
      
      expect(onSelectionChange).toHaveBeenCalledWith(node, container);
    });

    it('should not notify unmounted panels', async () => {
      const onFrameStats = vi.fn();
      const plugin = createMockPlugin({
        panels: [{
          id: 'panel1',
          name: 'Panel 1',
          render: () => '',
          onFrameStats,
        }],
      });
      manager.registerPlugin(plugin);
      await manager.activatePlugin('test.plugin');
      
      // Don't mount the panel
      mockProbe._emit.frameStats({ frameTime: 16.7 });
      
      expect(onFrameStats).not.toHaveBeenCalled();
    });

    it('should not notify inactive plugin panels', async () => {
      const onFrameStats = vi.fn();
      const plugin = createMockPlugin({
        panels: [{
          id: 'panel1',
          name: 'Panel 1',
          render: () => '',
          onFrameStats,
        }],
      });
      manager.registerPlugin(plugin);
      // Not activated
      
      mockProbe._emit.frameStats({ frameTime: 16.7 });
      
      expect(onFrameStats).not.toHaveBeenCalled();
    });
  });

  describe('validation', () => {
    it('should throw for plugin without metadata', () => {
      const plugin = { activate: vi.fn() } as any;
      // Accessing plugin.metadata.id throws before _validatePlugin is called
      expect(() => manager.registerPlugin(plugin)).toThrow();
    });

    it('should throw for plugin without id', () => {
      const plugin = { metadata: { name: 'Test', version: '1.0.0' }, activate: vi.fn() } as any;
      expect(() => manager.registerPlugin(plugin)).toThrow();
    });

    it('should throw for plugin without name', () => {
      const plugin = { metadata: { id: 'test', version: '1.0.0' }, activate: vi.fn() } as any;
      expect(() => manager.registerPlugin(plugin)).toThrow('Plugin must have a name');
    });

    it('should throw for plugin without version', () => {
      const plugin = { metadata: { id: 'test', name: 'Test' }, activate: vi.fn() } as any;
      expect(() => manager.registerPlugin(plugin)).toThrow('Plugin must have a version');
    });

    it('should throw for plugin without activate function', () => {
      const plugin = { metadata: { id: 'test', name: 'Test', version: '1.0.0' } } as any;
      expect(() => manager.registerPlugin(plugin)).toThrow('Plugin must have an activate function');
    });
  });

  describe('context methods', () => {
    it('should provide getFrameStats in context', async () => {
      let context: DevtoolContext | null = null;
      const plugin = createMockPlugin({
        activate: (ctx) => { context = ctx; },
      });
      manager.registerPlugin(plugin);
      await manager.activatePlugin('test.plugin');
      
      // Initially null
      expect(context!.getFrameStats()).toBeNull();
      
      // After frame stats emit
      mockProbe._emit.frameStats({ frameTime: 16.7, fps: 60 });
      expect(context!.getFrameStats()).toEqual({ frameTime: 16.7, fps: 60 });
    });

    it('should provide getSnapshot in context', async () => {
      let context: DevtoolContext | null = null;
      const plugin = createMockPlugin({
        activate: (ctx) => { context = ctx; },
      });
      manager.registerPlugin(plugin);
      await manager.activatePlugin('test.plugin');
      
      expect(context!.getSnapshot()).toBeNull();
      
      const snapshot = { scene: {}, materials: [] };
      mockProbe._emit.snapshot(snapshot);
      expect(context!.getSnapshot()).toEqual(snapshot);
    });

    it('should provide getSelectedNode in context', async () => {
      let context: DevtoolContext | null = null;
      const plugin = createMockPlugin({
        activate: (ctx) => { context = ctx; },
      });
      manager.registerPlugin(plugin);
      await manager.activatePlugin('test.plugin');
      
      expect(context!.getSelectedNode()).toBeNull();
      
      const node = { uuid: '123', name: 'Mesh', type: 'Mesh' };
      mockProbe._emit.selection(node);
      expect(context!.getSelectedNode()).toEqual(node);
    });

    it('should provide selectObject in context', async () => {
      let context: DevtoolContext | null = null;
      const plugin = createMockPlugin({
        activate: (ctx) => { context = ctx; },
      });
      manager.registerPlugin(plugin);
      await manager.activatePlugin('test.plugin');
      
      context!.selectObject('some-uuid');
      expect(mockProbe.findObjectByDebugIdOrUuid).toHaveBeenCalledWith('some-uuid');
      expect(mockProbe.selectObject).toHaveBeenCalled();
    });

    it('should provide clearSelection in context', async () => {
      let context: DevtoolContext | null = null;
      const plugin = createMockPlugin({
        activate: (ctx) => { context = ctx; },
      });
      manager.registerPlugin(plugin);
      await manager.activatePlugin('test.plugin');
      
      context!.clearSelection();
      expect(mockProbe.selectObject).toHaveBeenCalledWith(null);
    });

    it('should provide getEntities in context', async () => {
      mockProbe.getLogicalEntities.mockReturnValue([{ id: 'entity1' }]);
      
      let context: DevtoolContext | null = null;
      const plugin = createMockPlugin({
        activate: (ctx) => { context = ctx; },
      });
      manager.registerPlugin(plugin);
      await manager.activatePlugin('test.plugin');
      
      const entities = context!.getEntities();
      expect(entities).toEqual([{ id: 'entity1' }]);
    });

    it('should provide getModuleInfo in context', async () => {
      mockProbe.getModuleInfo.mockReturnValue({ triangles: 1000 });
      
      let context: DevtoolContext | null = null;
      const plugin = createMockPlugin({
        activate: (ctx) => { context = ctx; },
      });
      manager.registerPlugin(plugin);
      await manager.activatePlugin('test.plugin');
      
      const info = context!.getModuleInfo('@test/module');
      expect(mockProbe.getModuleInfo).toHaveBeenCalledWith('@test/module');
      expect(info).toEqual({ triangles: 1000 });
    });

    it('should provide getContainer in context', async () => {
      let context: DevtoolContext | null = null;
      const plugin = createMockPlugin({
        panels: [{
          id: 'panel1',
          name: 'Panel 1',
          render: () => '',
        }],
        activate: (ctx) => { context = ctx; },
      });
      manager.registerPlugin(plugin);
      await manager.activatePlugin('test.plugin');
      
      // No container initially
      expect(context!.getContainer()).toBeNull();
      
      // Mount panel
      const container = createMockContainer();
      manager.mountPanel('test.plugin:panel1', container);
      
      expect(context!.getContainer()).toBe(container);
    });

    it('should support onMessage unsubscribe in context', async () => {
      let context: DevtoolContext | null = null;
      const handler = vi.fn();
      const plugin = createMockPlugin({
        activate: (ctx) => { 
          context = ctx;
          const unsub = ctx.onMessage(handler);
          unsub(); // Immediately unsubscribe
        },
      });
      manager.registerPlugin(plugin);
      await manager.activatePlugin('test.plugin');
      
      manager.sendMessage('other', 'test.plugin', 'test', {});
      
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle toolbar action errors gracefully', async () => {
      const plugin = createMockPlugin({
        toolbarActions: [{
          id: 'action1',
          name: 'Action 1',
          icon: '🔧',
          onClick: () => { throw new Error('Action failed'); },
        }],
      });
      manager.registerPlugin(plugin);
      await manager.activatePlugin('test.plugin');
      
      await expect(
        manager.executeToolbarAction('test.plugin:action1')
      ).resolves.not.toThrow();
    });

    it('should not execute toolbar action for non-existent entry', async () => {
      await expect(
        manager.executeToolbarAction('non.existent:action')
      ).resolves.not.toThrow();
    });

    it('should not execute toolbar action for inactive plugin', async () => {
      const onClick = vi.fn();
      const plugin = createMockPlugin({
        toolbarActions: [{
          id: 'action1',
          name: 'Action 1',
          icon: '🔧',
          onClick,
        }],
      });
      manager.registerPlugin(plugin);
      // Not activated
      
      await manager.executeToolbarAction('test.plugin:action1');
      
      expect(onClick).not.toHaveBeenCalled();
    });

    it('should handle async callback errors in _safeCall', async () => {
      const onFrameStats = vi.fn().mockRejectedValue(new Error('Async error'));
      const plugin = createMockPlugin({
        panels: [{
          id: 'panel1',
          name: 'Panel 1',
          render: () => '',
          onFrameStats,
        }],
      });
      manager.registerPlugin(plugin);
      await manager.activatePlugin('test.plugin');
      
      const container = createMockContainer();
      manager.mountPanel('test.plugin:panel1', container);
      
      // Should not throw
      expect(() => mockProbe._emit.frameStats({ frameTime: 16.7 })).not.toThrow();
    });

    it('should handle deactivation errors', async () => {
      const plugin = createMockPlugin({
        deactivate: () => { throw new Error('Deactivation failed'); },
      });
      manager.registerPlugin(plugin);
      await manager.activatePlugin('test.plugin');
      
      await manager.deactivatePlugin('test.plugin');
      
      const plugins = manager.getPlugins();
      expect(plugins[0].state).toBe('error');
    });
  });

  describe('debug logging', () => {
    it('should log when debug is enabled', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      mockProbe.config.debug = true;
      
      const plugin = createMockPlugin();
      manager.registerPlugin(plugin);
      
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('unmountPanel edge cases', () => {
    it('should handle unmounting non-existent panel', () => {
      expect(() => manager.unmountPanel('non.existent:panel')).not.toThrow();
    });

    it('should handle unmounting panel without onUnmount', async () => {
      const plugin = createMockPlugin({
        panels: [{
          id: 'panel1',
          name: 'Panel 1',
          render: () => '',
          // No onUnmount
        }],
      });
      manager.registerPlugin(plugin);
      await manager.activatePlugin('test.plugin');
      
      const container = createMockContainer();
      manager.mountPanel('test.plugin:panel1', container);
      
      expect(() => manager.unmountPanel('test.plugin:panel1')).not.toThrow();
    });
  });

  describe('mountPanel edge cases', () => {
    it('should handle mounting non-existent panel', () => {
      const container = createMockContainer();
      expect(() => manager.mountPanel('non.existent:panel', container)).not.toThrow();
    });

    it('should handle mounting panel for inactive plugin', () => {
      const plugin = createMockPlugin({
        panels: [{ id: 'panel1', name: 'Panel 1', render: () => '' }],
      });
      manager.registerPlugin(plugin);
      // Not activated
      
      const container = createMockContainer();
      expect(() => manager.mountPanel('test.plugin:panel1', container)).not.toThrow();
    });

    it('should handle mounting panel without onMount', async () => {
      const plugin = createMockPlugin({
        panels: [{
          id: 'panel1',
          name: 'Panel 1',
          render: () => '',
          // No onMount
        }],
      });
      manager.registerPlugin(plugin);
      await manager.activatePlugin('test.plugin');
      
      const container = createMockContainer();
      expect(() => manager.mountPanel('test.plugin:panel1', container)).not.toThrow();
    });
  });

  describe('unregister cleanup', () => {
    it('should remove toolbar actions on unregister', async () => {
      const plugin = createMockPlugin({
        toolbarActions: [{ id: 'action1', name: 'Action', icon: '🔧', onClick: vi.fn() }],
      });
      manager.registerPlugin(plugin);
      
      expect(manager.getToolbarActions()).toHaveLength(1);
      
      await manager.unregisterPlugin('test.plugin');
      
      expect(manager.getToolbarActions()).toHaveLength(0);
    });

    it('should remove context menu items on unregister', async () => {
      const plugin = createMockPlugin({
        contextMenuItems: [{ id: 'item1', name: 'Item', target: 'scene-tree', onClick: vi.fn() }],
      });
      manager.registerPlugin(plugin);
      
      expect(manager.getContextMenuItems('scene-tree')).toHaveLength(1);
      
      await manager.unregisterPlugin('test.plugin');
      
      expect(manager.getContextMenuItems('scene-tree')).toHaveLength(0);
    });
  });
});
