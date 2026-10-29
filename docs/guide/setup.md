---
title: Set Up 3Lens
description: Run 3Lens locally and connect the current devtools to an existing three.js application.
---

# Set up 3Lens

3Lens attaches developer tools to the renderer, scene, and camera your application already owns. Start with the local fixture to see the investigation workflow, then connect your own application using the manual host.

::: info Current distribution status
The supported development path in this checkout uses workspace TypeScript sources. A clean external npm installation has not yet been verified for this implementation. The instructions below do not require published `@3lens/*` packages. Older guides using `createProbe` and `bootstrapOverlay` describe the previous API; use `bootstrap3Lens` and `manualHost` for the current platform.
:::

## Run the local development fixture

Use Node.js 22.12 or newer and pnpm 10.29.2 (the repository's pinned package manager). From the repository root:

```sh
pnpm install
pnpm --filter @3lens/example-vanilla-threejs dev
```

Open **http://localhost:3000/**. This runs the existing vanilla three.js fixture directly through Vite's source aliases. Port 3000 must be available. The broader `pnpm dev` command also builds packages and starts watchers; its script terminates an existing listener on port 3000 before starting.

The scene supplies real objects for the tools to inspect. Open **Inspect**, select an entity, and follow its geometry or material relationships. **Performance**, **Memory**, **Changes**, and **Shaders** use the same captured model. **Surfaces** controls the tool's placement. Press **F2** to toggle the tools or **Ctrl/Cmd+K** for commands.

To run this documentation locally:

```sh
pnpm docs:dev
```

Use the URL printed by VitePress.

## Connect an existing Vite + three.js application

The concrete integration below targets a browser application with a `THREE.WebGLRenderer`. The local fixture uses three.js r182. Other framework hosts and WebGPU need their own compatibility verification; the manual WebGL path is the starting point here.

### 1. Resolve the local 3Lens sources

Keep the 3Lens checkout next to your application, and run `pnpm install` in the 3Lens checkout first. In your application's `vite.config.ts`, merge these aliases into your existing configuration. Adjust `threeLensRoot` to your checkout's actual location. Your application still supplies its own `three` dependency.

```ts
import { resolve } from 'node:path';
import { defineConfig, searchForWorkspaceRoot } from 'vite';

const threeLensRoot = resolve('../3Lens');
const source = (path: string) =>
  resolve(threeLensRoot, 'packages', path, 'src/index.ts');

export default defineConfig({
  resolve: {
    dedupe: ['three'],
    alias: {
      '@3lens/devtools': source('core/devtools'),
      '@3lens/runtime': source('core/runtime'),
      '@3lens/kernel': source('core/kernel'),
      '@3lens/host-manual': source('hosts/manual'),
      '@3lens/ui-core': source('ui/core'),
    },
  },
  server: {
    fs: {
      allow: [searchForWorkspaceRoot(process.cwd()), threeLensRoot],
    },
  },
});
```

These are development source aliases, not an npm installation recipe. Vite resolves them at runtime; TypeScript projects should also mirror these five mappings in `compilerOptions.paths` if their editor or type checker cannot resolve the imports. Use paths relative to your tsconfig, for example `"@3lens/devtools": ["../3Lens/packages/core/devtools/src/index.ts"]`.

### 2. Attach after your renderer, scene, and camera exist

Put this code in the module that owns your existing `renderer`, `scene`, and `camera`. Keep your normal render loop running. Do not create a second scene for 3Lens.

```ts
// Vite projects: include vite/client types for import.meta.env and .hot.
if (import.meta.env.DEV) {
  let cancelled = false;
  let disposeTools: (() => void) | undefined;

  import.meta.hot?.dispose(() => {
    cancelled = true;
    disposeTools?.();
  });

  void import('@3lens/devtools').then(({ bootstrap3Lens, manualHost }) => {
    if (cancelled) return;

    const lens = bootstrap3Lens({
      enabled: true,
      autoDiscover: false,
      persist: false,
      layout: 'overlay',
    });

    lens.registerContext({
      id: 'main',
      displayName: 'My application',
      host: manualHost({ renderer, scene, camera }),
    });

    disposeTools = () => lens.dispose();
  });
}
```

The development-only dynamic import allows Vite to remove this integration from a production build. Verify your own production bundle after integrating it. If your application unmounts independently of hot reload, call the same disposal function during that teardown, before disposing the renderer. `lens.dispose()` releases the tools, renderer hooks, and listeners.

`bootstrap3Lens` returns a singleton. Initialize it once per application and register additional contexts with unique IDs for additional renderers. Explicit registration avoids depending on automatic discovery.

### 3. Connect camera controls when using Focus

If your app uses OrbitControls, supply an `onFocus` callback in the manual host configuration so its target follows the camera:

```ts
host: manualHost({
  renderer,
  scene,
  camera,
  onFocus(target) {
    controls.target.set(target.x, target.y, target.z);
    controls.update();
  },
}),
```

Here `controls` is your existing OrbitControls instance. The callback is optional for applications without camera controls.

## Choose where the tools live

The devtools default to a light theme across all screens and surfaces, independently of the host page's theme. Controls use shadcn-inspired styling and semantic theme tokens inside the framework-independent DOM island; the UI core does not require React or Tailwind in your application. The three.js scene keeps its application-owned appearance.

| Layout | Bootstrap options | Application responsibility |
| --- | --- | --- |
| Floating overlay | `layout: 'overlay'` | Keep your existing canvas placement. |
| Full workspace | `layout: 'workspace', viewport` | Pass an application-owned viewport element containing the canvas. |
| Dock | `ui: 'dock', layout: 'dock', target` | Pass an application-owned element for the dock. |
| Separate window | Open it through the Surfaces screen | Allow the user-initiated same-origin window. |

The default layout is the full workspace. Set `layout: 'overlay'` explicitly for a compact inspector over your app. `ui: 'overlay'` alone does not select that compact layout.

When you pass `viewport`, the workspace moves that element into its scene slot and restores it when hidden or disposed. Resize your renderer and update the camera aspect from the viewport's actual dimensions. A `ResizeObserver` is useful for this; call `renderer.setSize(width, height, false)` to preserve CSS sizing, and disconnect the observer during application teardown.

## Verify the integration

1. Render several frames. Confirm your context appears and Inspect shows your application's entity names.
2. Select a mesh. Follow its material and geometry links, and confirm selection stays consistent across tools.
3. Check fidelity badges. Renderer submission timing is not GPU execution time. Geometry storage and shared resource attribution can be **ESTIMATED**; unsupported GPU timing, loader timing, and uninstrumented pass boundaries remain **UNAVAILABLE**.
4. Record a short session, stop, and export it through the trace controls. Open that saved trace and repeat the entity inspection in offline mode. Historical frames disable live scene mutations.
5. Dispose the integration and confirm your application continues rendering. Reload the app to start a fresh live session after opening an offline trace.

For programmatic trace handling, use the same `lens` returned by bootstrap:

```ts
const trace = await lens.exportTrace({ profile: 'STANDARD' });
// Save the Blob using your app's download flow, or reload it directly:
await lens.loadTrace(trace);
```

Loading a trace switches that Lens instance to offline mode and detaches live capture. The UI queries the saved model; it does not reconnect to the renderer to fill missing values.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Cannot resolve `@3lens/*` | Check all five source aliases, the checkout path, and installation of the checkout's dependencies. For TypeScript errors, also check `compilerOptions.paths`. |
| Tools open but no entities appear | Register the manual context after the renderer exists and let the app render frames. Confirm you passed the renderer actually used by your loop. |
| Only the scene is visible | Press F2, check the browser console for initialization errors, and confirm the development import ran. |
| Camera snaps back after Focus | Wire the existing controls' target through `onFocus`. |
| Canvas stretches in workspace mode | Size from the viewport container and update the camera projection when its dimensions change. |
| A metric says UNAVAILABLE | The current capture lacks authoritative instrumentation for that metric. Do not treat it as zero. |

The reproducible reference integration is `examples/getting-started/vanilla-threejs/` in the repository. Its Vite configuration and application initialization are the starting point when adapting another build system.
