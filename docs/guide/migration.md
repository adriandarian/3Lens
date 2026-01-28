---
title: Migration Guide
description: Guide for migrating between major versions of 3Lens
---

# Migration Guide

This guide helps you migrate between major versions of 3Lens.

## Upgrading to v1.x

If you're starting fresh with 3Lens v1.x, no migration is needed! Follow the [Getting Started](/guide/getting-started) guide.

## Future Migrations

When new major versions are released, migration guides will be added here:

- **v1.x → v2.x** - Coming with v2.0 release
- **v2.x → v3.x** - Future

## Version Support Policy

| Version | Status | Support |
|---------|--------|---------|
| v1.x | Current | ✅ Active development |
| v0.x | N/A | Not applicable (pre-release) |

### Support Levels

- **Active Development**: New features, bug fixes, security patches
- **Maintenance**: Security patches and critical bug fixes only
- **Deprecated**: No updates, documentation archived
- **End of Life**: No support, documentation may be removed

## Breaking Changes

### How We Handle Breaking Changes

3Lens follows [Semantic Versioning](https://semver.org/):

- **Major versions** (v1 → v2): May include breaking changes
- **Minor versions** (v1.0 → v1.1): New features, backward compatible
- **Patch versions** (v1.0.0 → v1.0.1): Bug fixes only

### Breaking Change Policy

Before any breaking change:

1. **Deprecation warning** in previous minor version
2. **Migration guide** with code examples
3. **Codemod** (automated migration) when possible
4. **Minimum 3 months** notice for major changes

## Getting Help

If you encounter issues during migration:

1. Check the [Changelog](/changelog) for detailed changes
2. Search [GitHub Issues](https://github.com/adriandarian/3Lens/issues)
3. Ask in [GitHub Discussions](https://github.com/adriandarian/3Lens/discussions)
4. Join our [Discord community](#) (coming soon)

## Version Compatibility Matrix

### Three.js Versions

| 3Lens | Three.js | Notes |
|-------|----------|-------|
| v1.x | r150+ | WebGPU support requires r152+ |

### Framework Versions

| 3Lens | React | Angular | Vue |
|-------|-------|---------|-----|
| v1.x | 18+ | 16+ | 3.3+ |

### Browser Support

| 3Lens | Chrome | Firefox | Safari | Edge |
|-------|--------|---------|--------|------|
| v1.x | 90+ | 90+ | 15+ | 90+ |

::: tip WebGPU Requirements
WebGPU features require Chrome 113+ or other browsers with WebGPU enabled.
:::

## Next Steps

- [Getting Started](/guide/getting-started) - Fresh installation guide
- [Configuration](/guide/configuration) - Configure 3Lens options
- [First Debugging Session](/guide/first-debugging-session) - Start debugging
