---
title: Installation
description: Install 3Lens in your three.js project to start debugging and optimizing
---

# Installation

Install 3Lens in your three.js project to start debugging and optimizing your WebGL/WebGPU applications.

## Prerequisites

Before installing 3Lens, ensure you have:

- **Node.js** 18+ (LTS recommended)
- **A three.js application** (v0.150.0 or higher recommended)
- **A package manager** (npm, pnpm, yarn, or bun)

::: tip New to three.js?
3Lens works with any three.js project. If you're just getting started with three.js, check out the [official three.js documentation](https://threejs.org/docs/) first.
:::

## Core Packages

Install the core package and the overlay UI:

::: code-group

```bash [npm]
npm install @3lens/core @3lens/overlay
```

```bash [pnpm]
pnpm add @3lens/core @3lens/overlay
```

```bash [yarn]
yarn add @3lens/core @3lens/overlay
```

```bash [bun]
bun add @3lens/core @3lens/overlay
```

:::

### Package Overview

| Package | Description |
|---------|-------------|
| `@3lens/core` | Core probe SDK for metrics collection and scene introspection |
| `@3lens/overlay` | Visual overlay UI components and devtools panel |

## Framework-Specific Packages

If you're using a framework, install the corresponding bridge package for the best experience:

### React / React Three Fiber

```bash
npm install @3lens/react-bridge
# or
pnpm add @3lens/react-bridge
```

[React Three Fiber Guide →](/guide/react-r3f)

### Vue / TresJS

```bash
npm install @3lens/vue-bridge
# or
pnpm add @3lens/vue-bridge
```

[Vue & TresJS Guide →](/guide/vue-tresjs)

### Angular

```bash
npm install @3lens/angular-bridge
# or
pnpm add @3lens/angular-bridge
```

[Angular Guide →](/guide/angular)

## Installation Methods

### Standard Installation

For most projects, install 3Lens as a regular dependency:

```bash
pnpm add @3lens/core @3lens/overlay
```

### Development-Only Installation

For production builds, you may want to exclude 3Lens to reduce bundle size. Install as a dev dependency:

```bash
pnpm add -D @3lens/core @3lens/overlay
```

Then conditionally import in your code:

```typescript
if (import.meta.env.DEV) {
  const { createProbe } = await import('@3lens/core');
  const { bootstrapOverlay } = await import('@3lens/overlay');
  // ... setup code
}
```

### Workspace Installation (Monorepo)

If you're using a monorepo (pnpm workspaces, npm workspaces, etc.):

```bash
# From the root of your monorepo
pnpm add -w @3lens/core @3lens/overlay

# Or add to a specific workspace
pnpm --filter my-app add @3lens/core @3lens/overlay
```

## Verify Installation

After installation, verify that 3Lens is properly installed:

```bash
# Check if packages are installed
pnpm list @3lens/core @3lens/overlay

# Or with npm
npm list @3lens/core @3lens/overlay
```

You should see the packages listed with their versions.

## Next Steps

After installation:

1. **[Get Started](/guide/getting-started)** - Basic setup and your first debugging session
2. **[Framework Integration](/guide/vanilla-threejs)** - Framework-specific setup guides
3. **[Configuration](/guide/advanced/configuration)** - Configure 3Lens for your needs

## Troubleshooting

If you encounter issues during installation:

- **[Installation Troubleshooting](/guide/installation-troubleshooting)** - Common issues and solutions
- Check that your Node.js version is 18+ (`node --version`)
- Ensure your package manager is up to date
- Try clearing your package manager cache:
  ```bash
  # pnpm
  pnpm store prune
  
  # npm
  npm cache clean --force
  
  # yarn
  yarn cache clean
  ```

## Version Compatibility

3Lens is compatible with:

- **three.js**: v0.150.0 or higher
- **Node.js**: 18.0.0 or higher
- **TypeScript**: 4.9.0 or higher (optional, for TypeScript projects)

For WebGPU support, ensure you're using three.js v0.160.0 or higher.

## Uninstallation

To remove 3Lens from your project:

```bash
pnpm remove @3lens/core @3lens/overlay @3lens/react-bridge  # if installed
```

Note: Removing 3Lens won't affect your three.js application. Simply remove the 3Lens setup code from your application.
