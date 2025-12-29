export { PluginManager } from './PluginManager';
export { PluginLoader, PluginRegistry } from './PluginLoader';
export type {
  PluginId,
  PluginState,
  PluginMetadata,
  PanelDefinition,
  PanelRenderContext,
  ToolbarActionDefinition,
  ContextMenuItemDefinition,
  ContextMenuContext,
  PluginMessage,
  PluginMessageHandler,
  DevtoolContext,
  DevtoolPlugin,
  PluginSettingType,
  PluginSettingField,
  PluginSettingsSchema,
  RegisteredPlugin,
} from './types';
export type {
  PluginPackage,
  PluginSourceType,
  PluginSource,
  PluginRegistryEntry,
  PluginLoadResult,
  PluginLoaderOptions,
} from './PluginLoader';

// Built-in plugins
export { LODCheckerPlugin, ShadowDebuggerPlugin, BUILTIN_PLUGINS, getBuiltinPlugins } from './builtin';
export type { LODAnalysis, LODCheckerSettings } from './builtin';
export type { ShadowLightAnalysis, ShadowIssue, ShadowStats, ShadowDebuggerSettings } from './builtin';
