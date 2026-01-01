# 3Lens Documentation

Welcome to the 3Lens documentation! 3Lens is the definitive developer toolkit for three.js applications.

## 📚 Guides

### Getting Started
- **[Getting Started Guide](./GETTING-STARTED.md)** - Installation, basic setup, and your first debugging session

### Framework Integration
- **[React & React Three Fiber](./REACT-R3F-GUIDE.md)** - Hooks, providers, and R3F integration
- **[Angular](./ANGULAR-GUIDE.md)** - Service, directives, and RxJS patterns
- **[Vue & TresJS](./VUE-TRESJS-GUIDE.md)** - Composables, plugin, and TresJS support

### Advanced Topics
- **[Plugin Development](./PLUGIN-DEVELOPMENT.md)** - Create custom panels, actions, and analysis tools
- **[CI Integration](./CI-INTEGRATION.md)** - Automated performance testing and regression detection

## 📖 API Reference

The full API reference is generated using TypeDoc. Run:

```bash
pnpm docs
```

Then open `docs/api/index.html` or run `pnpm docs:serve`.

### Quick Links

- [DevtoolProbe](../packages/core/src/probe/DevtoolProbe.ts) - Main probe class
- [createProbe()](../packages/core/src/probe/createProbe.ts) - Probe factory function
- [Types](../packages/core/src/types/) - TypeScript type definitions

## 🗂️ Package Overview

| Package | Description |
|---------|-------------|
| `@3lens/core` | Core probe SDK for metrics collection |
| `@3lens/overlay` | Visual overlay UI components |
| `@3lens/react-bridge` | React hooks and components |
| `@3lens/angular-bridge` | Angular service and directives |
| `@3lens/vue-bridge` | Vue composables and plugin |

## 🎯 Quick Start

```typescript
import { createProbe } from '@3lens/core';
import { bootstrapOverlay } from '@3lens/overlay';

// Create probe
const probe = createProbe({ appName: 'My App' });

// Connect to your renderer and scene
probe.observeRenderer(renderer);
probe.observeScene(scene);

// Enable the overlay UI
bootstrapOverlay(probe);
```

Press **Ctrl+Shift+D** to toggle the overlay.

## 📁 Documentation Structure

```
docs/
├── guides/
│   ├── GETTING-STARTED.md      # Installation and setup
│   ├── REACT-R3F-GUIDE.md      # React integration
│   ├── ANGULAR-GUIDE.md        # Angular integration
│   ├── VUE-TRESJS-GUIDE.md     # Vue integration
│   ├── PLUGIN-DEVELOPMENT.md   # Plugin creation
│   └── CI-INTEGRATION.md       # CI/CD integration
├── api/                         # Generated API docs
├── API.md                       # API overview
├── ARCHITECTURE.md              # System architecture
├── CONTRIBUTING.md              # Contribution guidelines
└── PROGRESS.md                  # Development progress
```

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on contributing to 3Lens.

## 📄 License

MIT License - see the [LICENSE](../LICENSE) file for details.
