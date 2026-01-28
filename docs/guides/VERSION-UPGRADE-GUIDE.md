---
title: 3Lens Version Upgrade Guide
description: Guide for upgrading between 3Lens versions including breaking changes and migration steps
---

# 3Lens Version Upgrade Guide

This guide covers upgrading between 3Lens versions, including breaking changes, migration steps, and compatibility notes.

## Table of Contents

- [Version History](#version-history)
- [Upgrade Process](#upgrade-process)
- [Version 2.0 Upgrade](#version-20-upgrade)
- [Version 1.5 Upgrade](#version-15-upgrade)
- [Version 1.0 Upgrade](#version-10-upgrade)
- [Compatibility Matrix](#compatibility-matrix)
- [Deprecation Notices](#deprecation-notices)
- [Troubleshooting](#troubleshooting)

---

## Version History

| Version | Release Date | Three.js Support | Node.js | Status |
|---------|--------------|------------------|---------|--------|
| 2.0.0 | 2025-12-01 | r160+ | 18+ | Current |
| 1.5.0 | 2025-06-01 | r150-r159 | 16+ | Maintained |
| 1.0.0 | 2025-01-01 | r140-r149 | 16+ | Security only |
| 0.x | 2024 | r130-r139 | 14+ | End of life |

---

## Upgrade Process

### General Steps

1. **Check compatibility**: Review the compatibility matrix below
2. **Read release notes**: Check for breaking changes
3. **Update dependencies**: Upgrade all @3lens/* packages together
4. **Test thoroughly**: Run your test suite
5. **Update code**: Apply any required migrations

### Updating Packages

Always update all 3Lens packages together to avoid version mismatches:

```bash
# npm
npm update @3lens/core @3lens/overlay @3lens/ui @3lens/react-bridge @3lens/vue-bridge @3lens/angular-bridge

# pnpm
pnpm update @3lens/core @3lens/overlay @3lens/ui @3lens/react-bridge @3lens/vue-bridge @3lens/angular-bridge

# yarn
yarn upgrade @3lens/core @3lens/overlay @3lens/ui @3lens/react-bridge @3lens/vue-bridge @3lens/angular-bridge
```

### Checking Current Version

```bash
# Check installed versions
npm list @3lens/core @3lens/overlay

# Or in code
import { version } from '@3lens/core';
console.log('3Lens version:', version);
```

---

## Version 2.0 Upgrade

**Release Date**: December 2025  
**Minimum Three.js**: r160  
**Minimum Node.js**: 18

### Breaking Changes

#### 1. Probe Configuration API

The `createProbe` configuration has been restructured for clarity:

**Before (v1.x):**
```javascript
const probe = createProbe({
  renderer,
  scene,
  camera,
  trackLeaks: true,
  leakThreshold: 100,
  gpuTiming: true,
  historySize: 300
});
```

**After (v2.0):**
```javascript
const probe = createProbe({
  renderer,
  scene,
  camera,
  
  // Grouped configuration
  memory: {
    trackLeaks: true,
    leakThreshold: 100,
    trackDisposal: true
  },
  
  performance: {
    enableGPUTiming: true,
    historySize: 300,
    sampleRate: 60
  }
});
```

**Migration**: Use the new nested configuration structure. The old flat structure will log deprecation warnings and be removed in v3.0.

#### 2. Event System Changes

Event names have been standardized to camelCase:

**Before (v1.x):**
```javascript
probe.on('object-selected', callback);
probe.on('frame-stats', callback);
probe.on('leak-detected', callback);
```

**After (v2.0):**
```javascript
probe.on('objectSelected', callback);
probe.on('frameStats', callback);
probe.on('leakDetected', callback);
```

**Migration**: Update all event listeners to use camelCase names.

#### 3. Plugin Interface Updates

The `DevtoolPlugin` interface has new required methods:

**Before (v1.x):**
```typescript
interface DevtoolPlugin {
  name: string;
  initialize(context: DevtoolContext): void;
  dispose?(): void;
}
```

**After (v2.0):**
```typescript
interface DevtoolPlugin {
  name: string;
  version: string;  // NEW: Required
  
  initialize(context: DevtoolContext): void | Promise<void>;  // Can be async
  
  // NEW: Lifecycle hooks
  onProbeReady?(probe: Probe): void;
  onSceneChange?(scene: Scene): void;
  
  dispose(): void;  // Now required
}
```

**Migration**: Add `version` property and `dispose` method to all plugins:

```typescript
// Before
const myPlugin: DevtoolPlugin = {
  name: 'my-plugin',
  initialize(ctx) { /* ... */ }
};

// After
const myPlugin: DevtoolPlugin = {
  name: 'my-plugin',
  version: '1.0.0',
  
  initialize(ctx) { /* ... */ },
  
  dispose() {
    // Cleanup logic
  }
};
```

#### 4. React Bridge Hook Changes

`useDevtoolEntity` now returns an object instead of a ref:

**Before (v1.x):**
```jsx
function Component() {
  const meshRef = useDevtoolEntity('MyEntity');
  return <mesh ref={meshRef} />;
}
```

**After (v2.0):**
```jsx
function Component() {
  const { ref, entity, metrics } = useDevtoolEntity('MyEntity');
  return <mesh ref={ref} />;
}
```

**Migration**: Destructure the `ref` property from the returned object:

```jsx
// Quick migration - just add destructuring
const { ref: meshRef } = useDevtoolEntity('MyEntity');

// Or use the new features
const { ref, entity, metrics } = useDevtoolEntity('MyEntity', {
  metadata: { type: 'character' }
});
```

#### 5. Overlay Positioning API

The overlay positioning configuration has changed:

**Before (v1.x):**
```javascript
createOverlay(probe, {
  position: 'right',
  width: 350,
  offset: { x: 10, y: 10 }
});
```

**After (v2.0):**
```javascript
createOverlay(probe, {
  layout: {
    position: 'right',
    width: 350,
    margin: 10,
    resizable: true  // NEW
  }
});
```

#### 6. TypeScript Strict Mode

3Lens v2.0 requires TypeScript 5.0+ with stricter types:

```typescript
// Some previously loose types are now strict
interface FrameStats {
  fps: number;           // Was: number | undefined
  frameTime: number;     // Was: number | undefined
  drawCalls: number;
  triangles: number;
  // ...
}

// Null checks now required
const stats = probe.getFrameStats();
if (stats) {
  console.log(stats.fps); // OK
}
// console.log(stats.fps); // Error: stats might be null
```

### New Features in 2.0

#### WebGPU Support

```javascript
// Automatic WebGPU detection
const probe = createProbe({
  renderer, // WebGPU or WebGL renderer
  scene,
  camera
});

// WebGPU-specific metrics
probe.on('frameStats', (stats) => {
  if (stats.gpu) {
    console.log('GPU frame time:', stats.gpu.frameTime);
    console.log('Compute time:', stats.gpu.computeTime);
  }
});
```

#### Logical Entity Groups

```javascript
// Group related entities
probe.createEntityGroup('Enemies', {
  entities: ['Enemy1', 'Enemy2', 'Enemy3'],
  aggregateMetrics: true
});

// Access group metrics
const groupStats = probe.getEntityGroupStats('Enemies');
console.log('Total enemy triangles:', groupStats.triangles);
```

#### Custom Rules Engine

```javascript
// Define performance rules
probe.addRule({
  id: 'max-triangles',
  name: 'Triangle Budget',
  condition: (ctx) => ctx.frameStats.triangles > 1000000,
  severity: 'warning',
  message: 'Scene exceeds 1M triangles'
});
```

### Migration Script

For large codebases, use the migration codemod:

```bash
# Install migration tool
npx @3lens/migrate@latest

# Run migration
npx @3lens/migrate --from 1.5 --to 2.0

# Preview changes without applying
npx @3lens/migrate --from 1.5 --to 2.0 --dry-run
```

---

## Version 1.5 Upgrade

**Release Date**: June 2025  
**Minimum Three.js**: r150

### Breaking Changes

#### 1. Package Restructure

The UI package was extracted from overlay:

**Before (v1.0):**
```javascript
import { createOverlay, MaterialsPanel, StatsChart } from '@3lens/overlay';
```

**After (v1.5):**
```javascript
import { createOverlay } from '@3lens/overlay';
import { MaterialsPanel, StatsChart } from '@3lens/ui';
```

**Migration**: Update imports to use `@3lens/ui` for UI components.

#### 2. Memory Tracking Opt-in

Memory tracking is now opt-in by default:

**Before (v1.0):**
```javascript
const probe = createProbe({
  renderer, scene, camera
  // Memory tracking was enabled by default
});
```

**After (v1.5):**
```javascript
const probe = createProbe({
  renderer, scene, camera,
  trackMemory: true  // Now explicit
});
```

#### 3. Angular Module Changes

Angular bridge now uses standalone components:

**Before (v1.0):**
```typescript
@NgModule({
  imports: [ThreeLensModule]
})
```

**After (v1.5):**
```typescript
// Standalone components (Angular 15+)
@Component({
  standalone: true,
  imports: [ThreeLensEntityDirective]
})
```

### New Features in 1.5

- GPU timing for WebGL2
- Vue 3 Composition API support
- Angular Signals integration
- Performance budgets
- Snapshot/preset system

---

## Version 1.0 Upgrade

**Release Date**: January 2025  
**Minimum Three.js**: r140

### Breaking Changes from 0.x

#### 1. Complete API Redesign

The v1.0 release was a complete rewrite. All APIs changed:

**Before (v0.x):**
```javascript
import ThreeLensDevtools from 'three-lens';

const devtools = new ThreeLensDevtools();
devtools.attach(renderer, scene, camera);
devtools.show();
```

**After (v1.0):**
```javascript
import { createProbe } from '@3lens/core';
import { createOverlay } from '@3lens/overlay';

const probe = createProbe({ renderer, scene, camera });
const overlay = createOverlay(probe);
```

#### 2. Package Split

The monolithic package was split into multiple packages:

```bash
# Before (v0.x)
npm install three-lens

# After (v1.0)
npm install @3lens/core @3lens/overlay
# Optional framework bridges
npm install @3lens/react-bridge
npm install @3lens/vue-bridge
npm install @3lens/angular-bridge
```

#### 3. No Automatic Global

v0.x automatically attached to `window`:

```javascript
// v0.x - automatic global
window.threeLens.selectObject(mesh);

// v1.0 - explicit export
export const probe = createProbe({ renderer, scene, camera });
// Access via import or module reference
```

### Migration from 0.x

Due to the complete rewrite, we recommend:

1. Remove all v0.x code
2. Follow the [Getting Started Guide](/guide/getting-started)
3. Implement features incrementally

---

## Compatibility Matrix

### Three.js Versions

| 3Lens | Three.js | Notes |
|-------|----------|-------|
| 2.0.x | r160-r170 | WebGPU support |
| 1.5.x | r150-r159 | WebGL2 GPU timing |
| 1.0.x | r140-r149 | Full feature set |
| 0.x | r130-r139 | Legacy, unsupported |

### Framework Versions

| 3Lens | React | Vue | Angular |
|-------|-------|-----|---------|
| 2.0.x | 18+ | 3.3+ | 17+ |
| 1.5.x | 17+ | 3.0+ | 15+ |
| 1.0.x | 17+ | 3.0+ | 14+ |

### Node.js & Build Tools

| 3Lens | Node.js | Vite | Webpack |
|-------|---------|------|---------|
| 2.0.x | 18+ | 5+ | 5+ |
| 1.5.x | 16+ | 4+ | 5+ |
| 1.0.x | 16+ | 3+ | 5+ |

### Browser Support

| 3Lens | Chrome | Firefox | Safari | Edge |
|-------|--------|---------|--------|------|
| 2.0.x | 100+ | 100+ | 15.4+ | 100+ |
| 1.5.x | 90+ | 90+ | 14+ | 90+ |
| 1.0.x | 80+ | 80+ | 13+ | 80+ |

---

## Deprecation Notices

### Deprecated in 2.0 (Remove in 3.0)

```javascript
// Deprecated: Flat configuration
createProbe({
  trackLeaks: true,    // Use memory.trackLeaks
  gpuTiming: true,     // Use performance.enableGPUTiming
  historySize: 300     // Use performance.historySize
});

// Deprecated: kebab-case events
probe.on('object-selected', cb);  // Use 'objectSelected'
probe.on('frame-stats', cb);      // Use 'frameStats'

// Deprecated: Direct overlay access
overlay.panels;  // Use probe.getPanels()
```

### Deprecated in 1.5 (Removed in 2.0)

```javascript
// Removed: Old import paths
import { MaterialsPanel } from '@3lens/overlay';  // Use @3lens/ui

// Removed: Legacy Angular module
ThreeLensModule  // Use standalone components

// Removed: Implicit memory tracking
// Must now explicitly enable with trackMemory: true
```

### Deprecated in 1.0 (Removed in 1.5)

```javascript
// Removed: Global attachment
window.threeLens  // Use explicit probe reference

// Removed: Old package name
import ThreeLensDevtools from 'three-lens';  // Use @3lens/core
```

---

## Troubleshooting

### "Module not found" after upgrade

Ensure all 3Lens packages are the same version:

```bash
# Check versions
npm list | grep @3lens

# Force consistent versions
npm update @3lens/core@latest @3lens/overlay@latest @3lens/ui@latest
```

### TypeScript errors after upgrade

Update your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "moduleResolution": "bundler",  // or "node16"
    "strict": true,
    "skipLibCheck": true
  }
}
```

### "Cannot read property of undefined" errors

Check for breaking API changes in event handlers:

```javascript
// v1.x
probe.on('frame-stats', (stats) => {
  console.log(stats.fps);  // Was always defined
});

// v2.0
probe.on('frameStats', (stats) => {
  console.log(stats?.fps);  // May be undefined initially
});
```

### Plugin not loading after upgrade

Update plugin interface:

```typescript
// Ensure version and dispose are defined
const plugin: DevtoolPlugin = {
  name: 'my-plugin',
  version: '2.0.0',  // Required in v2.0
  
  initialize(ctx) { /* ... */ },
  
  dispose() { /* ... */ }  // Required in v2.0
};
```

### Performance regression after upgrade

3Lens v2.0 enables more features by default. Optimize for performance:

```javascript
const probe = createProbe({
  renderer, scene, camera,
  
  performance: {
    sampleRate: 30,       // Lower sample rate
    historySize: 60,      // Smaller history
    enableGPUTiming: false
  },
  
  memory: {
    trackLeaks: false,    // Disable if not needed
    trackDisposal: false
  }
});
```

### React hydration mismatch (SSR)

Use dynamic import for client-only loading:

```jsx
// Next.js / SSR frameworks
import dynamic from 'next/dynamic';

const ThreeLensProvider = dynamic(
  () => import('@3lens/react-bridge').then(m => m.ThreeLensProvider),
  { ssr: false }
);
```

---

## Getting Help

- **Documentation**: [3lens.dev/docs](https://3lens.dev/docs)
- **GitHub Issues**: [github.com/3lens/3lens/issues](https://github.com/3lens/3lens/issues)
- **Discord**: [discord.gg/3lens](https://discord.gg/3lens)
- **Migration Guide Updates**: Check the [changelog](https://github.com/3lens/3lens/blob/main/CHANGELOG.md)

---

## Changelog

For detailed changes between versions, see:

- [CHANGELOG.md](https://github.com/3lens/3lens/blob/main/CHANGELOG.md)
- [GitHub Releases](https://github.com/3lens/3lens/releases)
## See Also

- [Getting Started](/guide/getting-started) - Fresh installation guide
- [Migration from lil-gui](/guides/MIGRATION-FROM-LIL-GUI) - Migrate from lil-gui
- [Migration from three-inspect](/guides/MIGRATION-FROM-THREE-INSPECT) - Migrate from three-inspect