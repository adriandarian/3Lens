---
title: Custom Plugin Demo
description: Learn how to build custom devtools panels and extend 3Lens functionality
---

# Custom Plugin

Build your own devtools panel to extend 3Lens with custom functionality.

<ExampleViewer
  src="/examples/feature-showcase/custom-plugin/"
  title="Custom Plugin Demo"
  description="This example shows a custom statistics panel integrated into 3Lens. Explore how to create your own panels with custom UI and functionality."
  difficulty="advanced"
  github-url="https://github.com/adriandarian/3Lens/tree/main/examples/feature-showcase/custom-plugin"
  aspect-ratio="16/9"
/>

## Features Demonstrated

- **Plugin Architecture**: Creating plugins that integrate with 3Lens
- **Custom Panels**: Building UI panels for the devtools overlay
- **Message Passing**: Communication between plugin and main application
- **Settings Integration**: Adding configurable options to your plugin
- **Event Subscriptions**: Reacting to scene and performance events

## Plugin Structure

A 3Lens plugin consists of:

```typescript
import { createPlugin } from '@3lens/core';

export const myPlugin = createPlugin({
  name: 'my-plugin',
  version: '1.0.0',
  
  // Called when plugin is loaded
  setup(api) {
    // Register panels, commands, settings
    api.registerPanel({
      id: 'my-panel',
      title: 'My Panel',
      icon: '📊',
      render: () => createPanelUI()
    });
  },
  
  // Called when plugin is unloaded
  teardown() {
    // Cleanup resources
  }
});
```

## Related Examples

- [Transform Gizmo](./transform-gizmo) - Interactive object manipulation
- [WebGPU Features](./webgpu-features) - WebGPU-specific capabilities
- [Configuration Rules](./configuration-rules) - Performance budgets and rules
