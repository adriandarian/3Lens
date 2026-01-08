---
title: Svelte Threlte
description: Integrate 3Lens with Svelte and Threlte
---

# Svelte Threlte

Integrate 3Lens with Svelte applications using Threlte.

<ExampleViewer
  src="/examples/framework-integration/svelte-threlte/"
  title="Svelte Threlte Demo"
  description="Use 3Lens with Svelte 5 and Threlte for reactive 3D applications."
  difficulty="intermediate"
  github-url="https://github.com/adriandarian/3Lens/tree/main/examples/framework-integration/svelte-threlte"
/>

## Features Demonstrated

- **Threlte Integration**: Works with Threlte components
- **Svelte Stores**: Reactive probe state
- **Runes Support**: Compatible with Svelte 5 runes
- **Component Inspection**: Debug Threlte components

## Usage

```svelte
<script>
  import { Canvas } from '@threlte/core';
  import { use3Lens } from '@3lens/svelte-bridge';
  
  const probe = use3Lens();
</script>

<Canvas>
  <Scene />
</Canvas>
```

## Related Examples

- [Vue + TresJS](./vue-tresjs) - Vue integration
- [React Three Fiber](./react-three-fiber) - React integration
