import type * as THREE from 'three';
import type { DevtoolProbe } from '../probe/DevtoolProbe';
import type { FrameStats, SceneSnapshot } from '../types';
import type {
  PluginId,
  DevtoolPlugin,
  DevtoolContext,
  RegisteredPlugin,
  PanelDefinition,
  ToolbarActionDefinition,
  ContextMenuItemDefinition,
  PluginMessage,
  PluginMessageHandler,
  PanelRenderContext,
  ContextMenuContext,
} from './types';

/**
 * Plugin manager for 3Lens
 *
 * Manages the lifecycle of plugins, including registration, activation,
 * deactivation, and inter-plugin communication.
 *
 * @example
 * ```typescript
 * const manager = new PluginManager(probe);
 *
 * // Register a plugin
 * manager.registerPlugin({
 *   metadata: {
 *     id: 'com.example.my-plugin',
 *     name: 'My Plugin',
 *     version: '1.0.0',
 *   },
 *   activate(context) {
 *     context.log('Plugin activated!');
 *   },
 *   panels: [{
 *     id: 'my-panel',
 *     name: 'My Panel',
 *     render: (ctx) => '<div>Hello from plugin!</div>',
 *   }],
 * });
 *
 * // Activate the plugin
 * await manager.activatePlugin('com.example.my-plugin');
 * ```
 */
export class PluginManager {
  private readonly _probe: DevtoolProbe;
  private readonly _plugins = new Map<PluginId, RegisteredPlugin>();
  private readonly _panels = new Map<
    string,
    { pluginId: PluginId; panel: PanelDefinition }
  >();
  private readonly _toolbarActions = new Map<
    string,
    { pluginId: PluginId; action: ToolbarActionDefinition }
  >();
  private readonly _contextMenuItems = new Map<
    string,
    { pluginId: PluginId; item: ContextMenuItemDefinition }
  >();
  private readonly _globalMessageHandlers: PluginMessageHandler[] = [];

  private _frameStats: FrameStats | null = null;
  private _snapshot: SceneSnapshot | null = null;
  private _selectedNode: THREE.Object3D | null = null;

  // Toast callback (set by UI layer)
  private _toastCallback:
    | ((
        message: string,
        type: 'info' | 'success' | 'warning' | 'error'
      ) => void)
    | null = null;

  // Render request callback (set by UI layer)
  private _renderRequestCallback: ((pluginId: PluginId) => void) | null = null;

  constructor(probe: DevtoolProbe) {
    this._probe = probe;

    // Subscribe to probe events
    probe.onFrameStats((stats) => {
      this._frameStats = stats;
      this._notifyPanelsFrameStats(stats);
    });

    probe.onSnapshot((snapshot) => {
      this._snapshot = snapshot;
      this._notifyPanelsSnapshot(snapshot);
    });

    probe.onSelectionChanged((node) => {
      this._selectedNode = node;
      this._notifyPanelsSelection(node);
    });
  }

  /**
   * Register a plugin
   */
  registerPlugin(plugin: DevtoolPlugin): void {
    const id = plugin.metadata.id;

    if (this._plugins.has(id)) {
      throw new Error(`Plugin "${id}" is already registered`);
    }

    // Validate plugin
    this._validatePlugin(plugin);

    // Create registered plugin entry
    const registered: RegisteredPlugin = {
      plugin,
      state: 'registered',
      storage: {},
      settings: this._getDefaultSettings(plugin),
      messageHandlers: [],
      panelContainers: new Map(),
      registeredAt: Date.now(),
      activatedAt: null,
      error: null,
    };

    this._plugins.set(id, registered);

    // Register panels
    if (plugin.panels) {
      for (const panel of plugin.panels) {
        const panelKey = `${id}:${panel.id}`;
        this._panels.set(panelKey, { pluginId: id, panel });
      }
    }

    // Register toolbar actions
    if (plugin.toolbarActions) {
      for (const action of plugin.toolbarActions) {
        const actionKey = `${id}:${action.id}`;
        this._toolbarActions.set(actionKey, { pluginId: id, action });
      }
    }

    // Register context menu items
    if (plugin.contextMenuItems) {
      for (const item of plugin.contextMenuItems) {
        const itemKey = `${id}:${item.id}`;
        this._contextMenuItems.set(itemKey, { pluginId: id, item });
      }
    }

    this._log(`Plugin registered: ${plugin.metadata.name} (${id})`);
  }

  /**
   * Unregister a plugin
   */
  async unregisterPlugin(pluginId: PluginId): Promise<void> {
    const registered = this._plugins.get(pluginId);
    if (!registered) {
      return;
    }

    // Deactivate first if active
    if (registered.state === 'activated') {
      await this.deactivatePlugin(pluginId);
    }

    // Remove panels
    for (const [key] of this._panels) {
      if (key.startsWith(`${pluginId}:`)) {
        this._panels.delete(key);
      }
    }

    // Remove toolbar actions
    for (const [key] of this._toolbarActions) {
      if (key.startsWith(`${pluginId}:`)) {
        this._toolbarActions.delete(key);
      }
    }

    // Remove context menu items
    for (const [key] of this._contextMenuItems) {
      if (key.startsWith(`${pluginId}:`)) {
        this._contextMenuItems.delete(key);
      }
    }

    this._plugins.delete(pluginId);
    this._log(`Plugin unregistered: ${pluginId}`);
  }

  /**
   * Activate a plugin
   */
  async activatePlugin(pluginId: PluginId): Promise<void> {
    const registered = this._plugins.get(pluginId);
    if (!registered) {
      throw new Error(`Plugin "${pluginId}" not found`);
    }

    if (registered.state === 'activated') {
      return; // Already active
    }

    try {
      const context = this._createContext(pluginId);
      await registered.plugin.activate(context);
      registered.state = 'activated';
      registered.activatedAt = Date.now();
      registered.error = null;
      this._log(`Plugin activated: ${registered.plugin.metadata.name}`);
    } catch (error) {
      registered.state = 'error';
      registered.error =
        error instanceof Error ? error : new Error(String(error));
      this._log(`Plugin activation failed: ${pluginId}`, {
        error: registered.error.message,
      });
      throw error;
    }
  }

  /**
   * Deactivate a plugin
   */
  async deactivatePlugin(pluginId: PluginId): Promise<void> {
    const registered = this._plugins.get(pluginId);
    if (!registered || registered.state !== 'activated') {
      return;
    }

    try {
      const context = this._createContext(pluginId);

      // Unmount panels
      for (const [panelId, container] of registered.panelContainers) {
        const panel = registered.plugin.panels?.find((p) => p.id === panelId);
        if (panel?.onUnmount) {
          panel.onUnmount(container);
        }
      }
      registered.panelContainers.clear();

      // Call deactivate
      if (registered.plugin.deactivate) {
        await registered.plugin.deactivate(context);
      }

      registered.state = 'deactivated';
      registered.messageHandlers = [];
      this._log(`Plugin deactivated: ${registered.plugin.metadata.name}`);
    } catch (error) {
      registered.state = 'error';
      registered.error =
        error instanceof Error ? error : new Error(String(error));
      this._log(`Plugin deactivation failed: ${pluginId}`, {
        error: registered.error.message,
      });
    }
  }

  /**
   * Get all registered plugins
   */
  getPlugins(): Array<{
    id: PluginId;
    metadata: DevtoolPlugin['metadata'];
    state: RegisteredPlugin['state'];
  }> {
    return Array.from(this._plugins.entries()).map(([id, reg]) => ({
      id,
      metadata: reg.plugin.metadata,
      state: reg.state,
    }));
  }

  /**
   * Get a specific plugin
   */
  getPlugin(pluginId: PluginId): RegisteredPlugin | undefined {
    return this._plugins.get(pluginId);
  }

  /**
   * Get all registered panels
   */
  getPanels(): Array<{
    key: string;
    pluginId: PluginId;
    panel: PanelDefinition;
  }> {
    return Array.from(this._panels.entries())
      .map(([key, { pluginId, panel }]) => ({ key, pluginId, panel }))
      .sort((a, b) => (a.panel.order ?? 100) - (b.panel.order ?? 100));
  }

  /**
   * Get all registered toolbar actions
   */
  getToolbarActions(): Array<{
    key: string;
    pluginId: PluginId;
    action: ToolbarActionDefinition;
  }> {
    return Array.from(this._toolbarActions.entries())
      .map(([key, { pluginId, action }]) => ({ key, pluginId, action }))
      .sort((a, b) => (a.action.order ?? 100) - (b.action.order ?? 100));
  }

  /**
   * Get context menu items for a target
   */
  getContextMenuItems(target: 'scene-tree' | 'inspector' | 'viewport'): Array<{
    key: string;
    pluginId: PluginId;
    item: ContextMenuItemDefinition;
  }> {
    return Array.from(this._contextMenuItems.entries())
      .filter(([, { item }]) => item.target === target || item.target === 'all')
      .map(([key, { pluginId, item }]) => ({ key, pluginId, item }))
      .sort((a, b) => (a.item.order ?? 100) - (b.item.order ?? 100));
  }

  /**
   * Render a panel
   */
  renderPanel(panelKey: string): string {
    const entry = this._panels.get(panelKey);
    if (!entry) {
      return '<div class="plugin-error">Panel not found</div>';
    }

    const { pluginId, panel } = entry;
    const registered = this._plugins.get(pluginId);
    if (!registered || registered.state !== 'activated') {
      return '<div class="plugin-error">Plugin not active</div>';
    }

    const renderContext: PanelRenderContext = {
      frameStats: this._frameStats,
      snapshot: this._snapshot,
      selectedNode: this._selectedNode,
      state: registered.storage,
      probe: this._probe,
    };

    try {
      return panel.render(renderContext);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return `<div class="plugin-error">Render error: ${message}</div>`;
    }
  }

  /**
   * Mount a panel to a container
   */
  mountPanel(panelKey: string, container: HTMLElement): void {
    const entry = this._panels.get(panelKey);
    if (!entry) return;

    const { pluginId, panel } = entry;
    const registered = this._plugins.get(pluginId);
    if (!registered || registered.state !== 'activated') return;

    // Store container reference
    registered.panelContainers.set(panel.id, container);

    // Call onMount
    if (panel.onMount) {
      const context = this._createContext(pluginId);
      panel.onMount(container, context);
    }
  }

  /**
   * Unmount a panel
   */
  unmountPanel(panelKey: string): void {
    const entry = this._panels.get(panelKey);
    if (!entry) return;

    const { pluginId, panel } = entry;
    const registered = this._plugins.get(pluginId);
    if (!registered) return;

    const container = registered.panelContainers.get(panel.id);
    if (container && panel.onUnmount) {
      panel.onUnmount(container);
    }
    registered.panelContainers.delete(panel.id);
  }

  /**
   * Execute a toolbar action
   */
  async executeToolbarAction(actionKey: string): Promise<void> {
    const entry = this._toolbarActions.get(actionKey);
    if (!entry) return;

    const { pluginId, action } = entry;
    const registered = this._plugins.get(pluginId);
    if (!registered || registered.state !== 'activated') return;

    const context = this._createContext(pluginId);

    if (action.isEnabled && !action.isEnabled(context)) {
      return; // Action is disabled
    }

    try {
      await action.onClick(context);
    } catch (error) {
      this._log(`Toolbar action error: ${actionKey}`, {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Execute a context menu item
   */
  async executeContextMenuItem(
    itemKey: string,
    menuContext: Omit<ContextMenuContext, keyof DevtoolContext>
  ): Promise<void> {
    const entry = this._contextMenuItems.get(itemKey);
    if (!entry) return;

    const { pluginId, item } = entry;
    const registered = this._plugins.get(pluginId);
    if (!registered || registered.state !== 'activated') return;

    const context: ContextMenuContext = {
      ...this._createContext(pluginId),
      ...menuContext,
    };

    if (item.isEnabled && !item.isEnabled(context)) {
      return; // Item is disabled
    }

    try {
      await item.onClick(context);
    } catch (error) {
      this._log(`Context menu item error: ${itemKey}`, {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Send a message between plugins
   */
  sendMessage(
    source: PluginId,
    target: PluginId | '*',
    type: string,
    payload: unknown
  ): void {
    const message: PluginMessage = {
      source,
      target,
      type,
      payload,
      timestamp: Date.now(),
    };

    // Broadcast or targeted delivery
    if (target === '*') {
      // Broadcast to all plugins except source
      for (const [pluginId, registered] of this._plugins) {
        if (pluginId !== source && registered.state === 'activated') {
          for (const handler of registered.messageHandlers) {
            this._safeCall(() => handler(message));
          }
        }
      }
      // Also notify global handlers
      for (const handler of this._globalMessageHandlers) {
        this._safeCall(() => handler(message));
      }
    } else {
      // Send to specific plugin
      const registered = this._plugins.get(target);
      if (registered?.state === 'activated') {
        for (const handler of registered.messageHandlers) {
          this._safeCall(() => handler(message));
        }
      }
    }
  }

  /**
   * Subscribe to all plugin messages
   */
  onMessage(handler: PluginMessageHandler): () => void {
    this._globalMessageHandlers.push(handler);
    return () => {
      const index = this._globalMessageHandlers.indexOf(handler);
      if (index !== -1) {
        this._globalMessageHandlers.splice(index, 1);
      }
    };
  }

  /**
   * Set the toast callback (called by UI layer)
   */
  setToastCallback(
    callback: (
      message: string,
      type: 'info' | 'success' | 'warning' | 'error'
    ) => void
  ): void {
    this._toastCallback = callback;
  }

  /**
   * Set the render request callback (called by UI layer)
   */
  setRenderRequestCallback(callback: (pluginId: PluginId) => void): void {
    this._renderRequestCallback = callback;
  }

  /**
   * Get plugin state
   */
  getPluginState(pluginId: PluginId): Record<string, unknown> {
    return this._plugins.get(pluginId)?.storage ?? {};
  }

  /**
   * Set plugin state
   */
  setPluginState(pluginId: PluginId, key: string, value: unknown): void {
    const registered = this._plugins.get(pluginId);
    if (registered) {
      registered.storage[key] = value;
    }
  }

  /**
   * Get plugin settings
   */
  getPluginSettings(pluginId: PluginId): Record<string, unknown> {
    return this._plugins.get(pluginId)?.settings ?? {};
  }

  /**
   * Update plugin settings
   */
  updatePluginSettings(
    pluginId: PluginId,
    settings: Record<string, unknown>
  ): void {
    const registered = this._plugins.get(pluginId);
    if (!registered) return;

    registered.settings = { ...registered.settings, ...settings };

    // Notify plugin of settings change
    if (
      registered.plugin.onSettingsChange &&
      registered.state === 'activated'
    ) {
      const context = this._createContext(pluginId);
      this._safeCall(() =>
        registered.plugin.onSettingsChange!(registered.settings, context)
      );
    }
  }

  /**
   * Get plugin count
   */
  get pluginCount(): number {
    return this._plugins.size;
  }

  /**
   * Get active plugin count
   */
  get activePluginCount(): number {
    return Array.from(this._plugins.values()).filter(
      (p) => p.state === 'activated'
    ).length;
  }

  private _createContext(pluginId: PluginId): DevtoolContext {
    const registered = this._plugins.get(pluginId)!;

    return {
      probe: this._probe,

      getFrameStats: () => this._frameStats,
      getSnapshot: () => this._snapshot,
      getSelectedNode: () => this._selectedNode,

      selectObject: (uuid) => {
        // Try to find object by UUID through the probe's scene observer
        const obj = this._probe.findObjectByDebugIdOrUuid(uuid);
        if (obj) {
          this._probe.selectObject(obj);
        }
      },
      clearSelection: () => this._probe.selectObject(null),

      getEntities: () => this._probe.getLogicalEntities(),
      getModuleInfo: (moduleId) => this._probe.getModuleInfo(moduleId),

      log: (message, data) => this._log(`[${pluginId}] ${message}`, data),
      showToast: (message, type = 'info') => {
        if (this._toastCallback) {
          this._toastCallback(message, type);
        }
      },

      getState: <T>(key: string) => registered.storage[key] as T | undefined,
      setState: <T>(key: string, value: T) => {
        registered.storage[key] = value;
      },
      getAllState: () => ({ ...registered.storage }),
      clearState: () => {
        registered.storage = {};
      },

      sendMessage: (target, type, payload) => {
        this.sendMessage(pluginId, target, type, payload);
      },
      onMessage: (handler) => {
        registered.messageHandlers.push(handler);
        return () => {
          const index = registered.messageHandlers.indexOf(handler);
          if (index !== -1) {
            registered.messageHandlers.splice(index, 1);
          }
        };
      },

      requestRender: () => {
        if (this._renderRequestCallback) {
          this._renderRequestCallback(pluginId);
        }
      },

      getContainer: () => {
        // Return the first panel container
        const containers = Array.from(registered.panelContainers.values());
        return containers[0] ?? null;
      },
    };
  }

  private _validatePlugin(plugin: DevtoolPlugin): void {
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
    if (!plugin.activate) {
      throw new Error('Plugin must have an activate function');
    }
  }

  private _getDefaultSettings(plugin: DevtoolPlugin): Record<string, unknown> {
    const defaults: Record<string, unknown> = {};
    if (plugin.settings?.fields) {
      for (const field of plugin.settings.fields) {
        defaults[field.key] = field.defaultValue;
      }
    }
    return defaults;
  }

  private _notifyPanelsFrameStats(stats: FrameStats): void {
    for (const [, { pluginId, panel }] of this._panels) {
      if (!panel.onFrameStats) continue;

      const registered = this._plugins.get(pluginId);
      if (!registered || registered.state !== 'activated') continue;

      const container = registered.panelContainers.get(panel.id);
      if (!container) continue;

      this._safeCall(() => panel.onFrameStats!(stats, container));
    }
  }

  private _notifyPanelsSnapshot(snapshot: SceneSnapshot): void {
    for (const [, { pluginId, panel }] of this._panels) {
      if (!panel.onSnapshot) continue;

      const registered = this._plugins.get(pluginId);
      if (!registered || registered.state !== 'activated') continue;

      const container = registered.panelContainers.get(panel.id);
      if (!container) continue;

      this._safeCall(() => panel.onSnapshot!(snapshot, container));
    }
  }

  private _notifyPanelsSelection(node: THREE.Object3D | null): void {
    for (const [, { pluginId, panel }] of this._panels) {
      if (!panel.onSelectionChange) continue;

      const registered = this._plugins.get(pluginId);
      if (!registered || registered.state !== 'activated') continue;

      const container = registered.panelContainers.get(panel.id);
      if (!container) continue;

      this._safeCall(() => panel.onSelectionChange!(node, container));
    }
  }

  private _safeCall(fn: () => void | Promise<void>): void {
    try {
      const result = fn();
      if (result instanceof Promise) {
        result.catch((error) => {
          this._log('Plugin callback error', {
            error: error instanceof Error ? error.message : String(error),
          });
        });
      }
    } catch (error) {
      this._log('Plugin callback error', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private _log(message: string, data?: Record<string, unknown>): void {
    if (this._probe.config.debug) {
      // eslint-disable-next-line no-console
      console.log(`[3Lens PluginManager] ${message}`, data ?? '');
    }
  }
}
