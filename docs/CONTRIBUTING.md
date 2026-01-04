# Contributing to 3Lens

Thank you for your interest in contributing to 3Lens! This document provides guidelines and information for contributors.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Setup](#development-setup)
4. [Project Structure](#project-structure)
5. [Development Workflow](#development-workflow)
6. [Coding Standards](#coding-standards)
7. [Testing](#testing)
8. [Documentation](#documentation)
9. [Pull Request Process](#pull-request-process)
10. [Release Process](#release-process)

---

## Code of Conduct

This project follows a standard code of conduct. Please be respectful and constructive in all interactions.

### Our Standards

- Be welcoming and inclusive
- Be respectful of differing viewpoints
- Accept constructive criticism gracefully
- Focus on what is best for the community

---

## Getting Started

### Ways to Contribute

- **Bug Reports**: Found a bug? Open an issue with steps to reproduce
- **Feature Requests**: Have an idea? Open a discussion or issue
- **Code Contributions**: Submit PRs for bugs, features, or docs
- **Documentation**: Improve docs, add examples, fix typos
- **Testing**: Help test pre-releases and report issues
- **Community**: Answer questions, help other users

### First-Time Contributors

Look for issues labeled:
- `good first issue` - Simple, well-defined issues
- `help wanted` - Issues where we need community help
- `documentation` - Documentation improvements

---

## Development Setup

### Prerequisites

- **Node.js**: v18.0.0 or later
- **pnpm**: v8.0.0 or later
- **Git**: Latest version
- **Browser**: Chrome and Firefox for testing

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/3lens.git
cd 3lens

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test
```

### Development Mode

```bash
# Start development watchers for all packages
pnpm dev

# Start specific package in dev mode
pnpm --filter @3lens/core dev
pnpm --filter @3lens/overlay dev
```

### Running the Extension

```bash
# Build extension
pnpm --filter @3lens/extension build

# Load in Chrome:
# 1. Go to chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select packages/extension/dist
```

### Running Example Apps

```bash
# Start example app
pnpm --filter examples-basic dev
```

---

## Project Structure

```
3lens/
├── docs/                    # Documentation
│
├── packages/
│   ├── core/               # @3lens/core - Probe SDK
│   │   ├── src/
│   │   │   ├── probe/      # DevtoolProbe class
│   │   │   ├── adapters/   # WebGL/WebGPU adapters
│   │   │   ├── observers/  # Scene, resource observers
│   │   │   ├── transport/  # Message transport
│   │   │   └── types/      # TypeScript types
│   │   ├── tests/
│   │   └── package.json
│   │
│   ├── overlay/            # @3lens/overlay - In-app UI
│   │   ├── src/
│   │   │   ├── components/ # UI components
│   │   │   ├── panels/     # Panel implementations
│   │   │   ├── stores/     # State management
│   │   │   └── mount.ts    # Entry point
│   │   └── package.json
│   │
│   ├── extension/          # Browser extension
│   │   ├── src/
│   │   │   ├── devtools/   # DevTools panel
│   │   │   ├── content/    # Content script
│   │   │   └── background/ # Service worker
│   │   ├── manifest.json
│   │   └── package.json
│   │
│   ├── react-bridge/       # @3lens/react-bridge
│   ├── angular-bridge/     # @3lens/angular-bridge
│   ├── vue-bridge/         # @3lens/vue-bridge
│   │
│   └── shared/             # Shared utilities
│       ├── protocol/       # Debug protocol types
│       └── ui-components/  # Shared UI components
│
├── examples/               # Example applications
│   ├── basic/             # Vanilla three.js
│   ├── react-r3f/         # React Three Fiber
│   └── angular/           # Angular + three.js
│
├── scripts/               # Build/release scripts
├── pnpm-workspace.yaml
└── package.json
```

---

## Development Workflow

### Branching Strategy

- `main` - Stable, release-ready code
- `develop` - Integration branch for features
- `feature/*` - Feature branches
- `fix/*` - Bug fix branches
- `docs/*` - Documentation changes

### Typical Workflow

1. **Create a branch**
   ```bash
   git checkout -b feature/my-feature develop
   ```

2. **Make changes**
   - Write code
   - Add tests
   - Update documentation

3. **Commit with conventional commits**
   ```bash
   git commit -m "feat(core): add GPU timing support"
   ```

4. **Push and create PR**
   ```bash
   git push origin feature/my-feature
   ```

5. **Address review feedback**

6. **Merge after approval**

### Commit Message Format

We use [Conventional Commits](https://conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting (no code change)
- `refactor` - Code restructuring
- `perf` - Performance improvement
- `test` - Adding tests
- `chore` - Build/tooling changes

**Scopes:**
- `core` - @3lens/core
- `overlay` - @3lens/overlay
- `extension` - Browser extension
- `react` - React bridge
- `angular` - Angular bridge
- `vue` - Vue bridge
- `docs` - Documentation
- `build` - Build system

**Examples:**
```
feat(core): add WebGPU adapter
fix(overlay): fix panel resize on Firefox
docs: update installation guide
perf(core): reduce frame stats overhead
```

---

## Coding Standards

### TypeScript

- **Strict mode** enabled
- Explicit return types on public functions
- Prefer `interface` over `type` for object shapes
- Use `readonly` where appropriate

```typescript
// ✅ Good
interface ProbeConfig {
  readonly appName: string;
  rules?: RulesConfig;
}

function createProbe(config: ProbeConfig): DevtoolProbe {
  // ...
}

// ❌ Avoid
type ProbeConfig = {
  appName: string;
  rules?: any;
};
```

### Code Style

- **Prettier** for formatting
- **ESLint** for linting
- 2-space indentation
- Single quotes
- No semicolons (configurable)
- Max line length: 100

```bash
# Format code
pnpm format

# Lint code
pnpm lint

# Fix lint issues
pnpm lint:fix
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `scene-observer.ts` |
| Classes | PascalCase | `SceneObserver` |
| Interfaces | PascalCase, no `I` prefix | `ProbeConfig` |
| Functions | camelCase | `createProbe` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_FRAME_HISTORY` |
| Private properties | underscore prefix | `_isConnected` |

### File Organization

```typescript
// 1. Imports (external, then internal)
import * as THREE from 'three';
import { Transport } from '../transport';

// 2. Types/Interfaces
interface ObserverOptions {
  // ...
}

// 3. Constants
const DEFAULT_OPTIONS: ObserverOptions = {};

// 4. Class/Function implementation
export class SceneObserver {
  // ...
}

// 5. Exports (if not inline)
```

---

## Testing

### Test Structure

```
packages/core/
├── src/
│   └── probe/
│       └── probe.ts
└── tests/
    └── probe/
        ├── probe.test.ts       # Unit tests
        └── probe.integration.ts # Integration tests
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm --filter @3lens/core test

# Run tests in watch mode
pnpm test:watch

# Run with coverage
pnpm test:coverage
```

### Writing Tests

Use **Vitest** for testing:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { createProbe } from '../src';

describe('createProbe', () => {
  it('should create a probe with default config', () => {
    const probe = createProbe({ appName: 'TestApp' });
    
    expect(probe).toBeDefined();
    expect(probe.config.appName).toBe('TestApp');
  });

  it('should observe a renderer', () => {
    const probe = createProbe({ appName: 'TestApp' });
    const mockRenderer = createMockRenderer();
    
    expect(() => probe.observeRenderer(mockRenderer)).not.toThrow();
  });
});
```

### Test Coverage Requirements

| Package | Minimum Coverage |
|---------|-----------------|
| `@3lens/core` | 80% |
| `@3lens/overlay` | 70% |
| `@3lens/extension` | 60% |
| Bridge packages | 70% |

---

## Documentation

### Documentation Types

1. **API Reference** - Generated from TSDoc comments
2. **Guides** - How-to articles in `/docs`
3. **Examples** - Code examples in `/examples`

### TSDoc Comments

```typescript
/**
 * Creates a new DevtoolProbe instance.
 * 
 * @param config - Probe configuration options
 * @returns A new DevtoolProbe instance
 * 
 * @example
 * ```typescript
 * const probe = createProbe({
 *   appName: 'My App',
 *   rules: { maxDrawCalls: 1000 }
 * });
 * ```
 * 
 * @see {@link DevtoolProbe}
 * @public
 */
export function createProbe(config: ProbeConfig): DevtoolProbe {
  // ...
}
```

### Documentation Updates

- Update docs when changing public APIs
- Add examples for new features
- Keep README.md in sync with changes

---

## Pull Request Process

### Before Submitting

- [ ] Code follows style guidelines
- [ ] Tests pass (`pnpm test`)
- [ ] Linting passes (`pnpm lint`)
- [ ] Documentation updated
- [ ] Commit messages follow convention
- [ ] Branch is up to date with `develop`

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How was this tested?

## Checklist
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

### Review Process

1. **Automated checks** - CI must pass
2. **Code review** - At least one approval required
3. **Testing** - Manual testing for UI changes
4. **Documentation review** - For public API changes

### Merge Requirements

- All checks pass
- At least one approval
- No unresolved conversations
- Branch up to date with target

---

## Release Process

### Version Bumping

We use [changesets](https://github.com/changesets/changesets) for version management:

```bash
# Add a changeset for your PR
pnpm changeset

# Follow the prompts to describe your change
```

### Release Workflow

1. Changesets accumulate in `.changeset/`
2. Maintainers run `pnpm changeset version`
3. Version bumps and CHANGELOG updates
4. Tag and publish to npm

### Release Channels

| Channel | Command | Description |
|---------|---------|-------------|
| Alpha | `pnpm release:alpha` | Pre-release for testing |
| Beta | `pnpm release:beta` | Feature-complete pre-release |
| Latest | `pnpm release` | Stable release |

---

## Getting Help

- **Discord**: [Join our community](#) (link TBD)
- **GitHub Discussions**: For questions and ideas
- **GitHub Issues**: For bugs and feature requests

### Maintainers

- [@adriandarian](https://github.com/adriandarian) - Core SDK & UI/UX

---

## License

By contributing to 3Lens, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to 3Lens! 🎉

