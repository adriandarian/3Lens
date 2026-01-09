import type * as THREE from 'three';
import type { DevtoolProbe } from '../probe/DevtoolProbe';
import type { FrameStats, SceneSnapshot } from '../types';
import type {
  LogicalEntity as NewLogicalEntity,
  ModuleInfo,
} from '../entities';

/**
 * Unique identifier for a plugin
 */
export type PluginId = string;

/**
 * Plugin lifecycle state
 */
export type PluginState = 'registered' | 'activated' | 'deactivated' | 'error';

/**
 * Plugin metadata
 */
export interface PluginMetadata {
  /**
   * Unique plugin identifier (e.g., 'com.example.my-plugin')
   */
  id: PluginId;

  /**
   * Display name
   */
  name: string;

  /**
   * Plugin version (semver)
   */
  version: string;

  /**
   * Plugin description
   */
  description?: string;

  /**
   * Plugin author
   */
  author?: string;

  /**
   * Plugin homepage or repository URL
   */
  homepage?: string;

  /**
   * Minimum 3Lens version required
   */
  minVersion?: string;

  /**
   * Plugin icon (emoji or URL)
   */
  icon?: string;

  /**
   * Tags for categorization
   */
  tags?: string[];
}

/**
 * Panel registration options
 */
export interface PanelDefinition {
  /**
   * Unique panel ID within the plugin
   */
  id: string;

  /**
   * Panel display name
   */
  name: string;

  /**
   * Panel icon (emoji or URL)
   */
  icon?: string;

  /**
   * Panel order in the tab bar (lower = left)
   */
  order?: number;

  /**
   * Render function that returns HTML content
   */
  render: (context: PanelRenderContext) => string;

  /**
   * Called after the panel is mounted to the DOM
   */
  onMount?: (container: HTMLElement, context: DevtoolContext) => void;

  /**
   * Called before the panel is unmounted
   */
  onUnmount?: (container: HTMLElement) => void;

  /**
   * Called when frame stats are updated (for live updates)
   */
  onFrameStats?: (stats: FrameStats, container: HTMLElement) => void;

  /**
   * Called when the scene snapshot is updated
   */
  onSnapshot?: (snapshot: SceneSnapshot, container: HTMLElement) => void;

  /**
   * Called when selection changes
   */
  onSelectionChange?: (
    node: THREE.Object3D | null,
    container: HTMLElement
  ) => void;
}

/**
 * Context provided to panel render functions
 */
export interface PanelRenderContext {
  /**
   * Current frame stats
   */
  frameStats: FrameStats | null;

  /**
   * Current scene snapshot
   */
  snapshot: SceneSnapshot | null;

  /**
   * Currently selected object
   */
  selectedNode: THREE.Object3D | null;

  /**
   * Plugin's stored state
   */
  state: Record<string, unknown>;

  /**
   * Probe instance
   */
  probe: DevtoolProbe;
}

/**
 * Toolbar action definition
 */
export interface ToolbarActionDefinition {
  /**
   * Unique action ID within the plugin
   */
  id: string;

  /**
   * Action display name (shown on hover)
   */
  name: string;

  /**
   * Action icon (emoji or URL)
   */
  icon: string;

  /**
   * Action order in toolbar (lower = left)
   */
  order?: number;

  /**
   * Whether the action is a toggle (shows active state)
   */
  isToggle?: boolean;

  /**
   * Current toggle state (for toggle actions)
   */
  isActive?: () => boolean;

  /**
   * Called when the action is triggered
   */
  onClick: (context: DevtoolContext) => void | Promise<void>;

  /**
   * Whether the action is enabled
   */
  isEnabled?: (context: DevtoolContext) => boolean;

  /**
   * Keyboard shortcut (e.g., 'ctrl+shift+w')
   */
  shortcut?: string;
}

/**
 * Context menu item definition
 */
export interface ContextMenuItemDefinition {
  /**
   * Unique item ID within the plugin
   */
  id: string;

  /**
   * Menu item label
   */
  label: string;

  /**
   * Menu item icon (emoji or URL)
   */
  icon?: string;

  /**
   * Item order in menu (lower = top)
   */
  order?: number;

  /**
   * Where this menu item appears
   */
  target: 'scene-tree' | 'inspector' | 'viewport' | 'all';

  /**
   * Called when the item is clicked
   */
  onClick: (context: ContextMenuContext) => void | Promise<void>;

  /**
   * Whether the item is visible for the given context
   */
  isVisible?: (context: ContextMenuContext) => boolean;

  /**
   * Whether the item is enabled for the given context
   */
  isEnabled?: (context: ContextMenuContext) => boolean;

  /**
   * Submenu items
   */
  submenu?: ContextMenuItemDefinition[];
}

/**
 * Context provided to context menu handlers
 */
export interface ContextMenuContext extends DevtoolContext {
  /**
   * The target element that was right-clicked
   */
  targetElement: HTMLElement | null;

  /**
   * The Three.js object at the click location (if any)
   */
  targetObject: THREE.Object3D | null;

  /**
   * Mouse position
   */
  position: { x: number; y: number };
}

/**
 * Plugin message for inter-plugin communication
 */
export interface PluginMessage {
  /**
   * Source plugin ID
   */
  source: PluginId;

  /**
   * Target plugin ID (or '*' for broadcast)
   */
  target: PluginId | '*';

  /**
   * Message type
   */
  type: string;

  /**
   * Message payload
   */
  payload: unknown;

  /**
   * Timestamp
   */
  timestamp: number;
}

/**
 * Plugin message handler
 */
export type PluginMessageHandler = (
  message: PluginMessage
) => void | Promise<void>;

/**
 * Context provided to plugins for interacting with 3Lens
 */
export interface DevtoolContext {
  /**
   * The probe instance
   */
  probe: DevtoolProbe;

  /**
   * Current frame stats
   */
  getFrameStats(): FrameStats | null;

  /**
   * Current scene snapshot
   */
  getSnapshot(): SceneSnapshot | null;

  /**
   * Currently selected object
   */
  getSelectedNode(): THREE.Object3D | null;

  /**
   * Select an object by UUID
   */
  selectObject(uuid: string): void;

  /**
   * Clear selection
   */
  clearSelection(): void;

  /**
   * Get all logical entities
   */
  getEntities(): NewLogicalEntity[];

  /**
   * Get module info
   */
  getModuleInfo(moduleId: string): ModuleInfo | undefined;

  /**
   * Log a message (shown in devtools console)
   */
  log(message: string, data?: Record<string, unknown>): void;

  /**
   * Show a toast notification
   */
  showToast(
    message: string,
    type?: 'info' | 'success' | 'warning' | 'error'
  ): void;

  /**
   * Get plugin state
   */
  getState<T = unknown>(key: string): T | undefined;

  /**
   * Set plugin state
   */
  setState<T = unknown>(key: string, value: T): void;

  /**
   * Get all plugin state
   */
  getAllState(): Record<string, unknown>;

  /**
   * Clear plugin state
   */
  clearState(): void;

  /**
   * Send a message to another plugin
   */
  sendMessage(target: PluginId | '*', type: string, payload: unknown): void;

  /**
   * Subscribe to messages
   */
  onMessage(handler: PluginMessageHandler): () => void;

  /**
   * Request a panel re-render
   */
  requestRender(): void;

  /**
   * Get the plugin's container element (if panel is mounted)
   */
  getContainer(): HTMLElement | null;
}

/**
 * Plugin definition interface
 */
export interface DevtoolPlugin {
  /**
   * Plugin metadata
   */
  metadata: PluginMetadata;

  /**
   * Called when the plugin is activated
   */
  activate(context: DevtoolContext): void | Promise<void>;

  /**
   * Called when the plugin is deactivated
   */
  deactivate?(context: DevtoolContext): void | Promise<void>;

  /**
   * Panel definitions (optional)
   */
  panels?: PanelDefinition[];

  /**
   * Toolbar action definitions (optional)
   */
  toolbarActions?: ToolbarActionDefinition[];

  /**
   * Context menu item definitions (optional)
   */
  contextMenuItems?: ContextMenuItemDefinition[];

  /**
   * Settings schema (for plugin settings UI)
   */
  settings?: PluginSettingsSchema;

  /**
   * Called when plugin settings change
   */
  onSettingsChange?: (
    settings: Record<string, unknown>,
    context: DevtoolContext
  ) => void;
}

/**
 * Plugin settings field types
 */
export type PluginSettingType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'select'
  | 'color';

/**
 * Plugin settings field definition
 */
export interface PluginSettingField {
  /**
   * Setting key
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

/**
 * Plugin settings schema
 */
export interface PluginSettingsSchema {
  /**
   * Settings fields
   */
  fields: PluginSettingField[];
}

/**
 * Registered plugin info (internal)
 */
export interface RegisteredPlugin {
  /**
   * Plugin definition
   */
  plugin: DevtoolPlugin;

  /**
   * Plugin state
   */
  state: PluginState;

  /**
   * Plugin's stored data
   */
  storage: Record<string, unknown>;

  /**
   * Plugin's settings values
   */
  settings: Record<string, unknown>;

  /**
   * Message handlers
   */
  messageHandlers: PluginMessageHandler[];

  /**
   * Panel containers
   */
  panelContainers: Map<string, HTMLElement>;

  /**
   * When the plugin was registered
   */
  registeredAt: number;

  /**
   * When the plugin was last activated
   */
  activatedAt: number | null;

  /**
   * Error if in error state
   */
  error: Error | null;
}
