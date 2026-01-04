# Documentation Versioning Guide

This guide explains how documentation versioning works in the 3Lens project.

## Overview

3Lens uses a directory-based versioning system for documentation:

- **Current version** (`/`) - The latest documentation, always at the root
- **Archived versions** (`/versions/v1/`, `/versions/v2/`) - Previous major versions

## How It Works

### Directory Structure

```
docs/
├── .vitepress/
│   ├── config.ts        # Main VitePress config
│   ├── versions.ts      # Version definitions
│   └── theme/
│       └── components/
│           ├── VersionSwitcher.vue   # Dropdown component
│           └── VersionWarning.vue    # Banner for old versions
├── guide/               # Current version docs
├── api/
├── examples/
└── versions/            # Archived versions
    ├── v1/
    │   ├── guide/
    │   ├── api/
    │   └── ...
    └── v2/
        └── ...
```

### Version Configuration

All versions are defined in `/docs/.vitepress/versions.ts`:

```typescript
export const versions: DocVersion[] = [
  {
    label: 'v2.x (Current)',
    path: '/',
    current: true,
    status: 'stable',
    date: '2027-01'
  },
  {
    label: 'v1.x',
    path: '/versions/v1/',
    current: false,
    status: 'deprecated',
    date: '2026-01'
  }
]
```

### Version Statuses

| Status | Meaning | Badge Color |
|--------|---------|-------------|
| `stable` | Production-ready | Green |
| `beta` | Pre-release testing | Yellow |
| `alpha` | Early development | Purple |
| `deprecated` | No longer maintained | Red |

## Creating a New Version

When releasing a new major version, archive the current docs:

### 1. Run the Version Script

```bash
pnpm docs:version create v1.0
```

This will:
- Create `/docs/versions/v1.0/` directory
- Copy all current documentation
- Update internal links to use versioned paths

### 2. Update Version Config

Edit `/docs/.vitepress/versions.ts`:

```typescript
export const versions: DocVersion[] = [
  {
    label: 'v2.x (Current)',
    path: '/',
    current: true,
    status: 'stable',
    date: '2027-01',
    releaseNotes: '/changelog#v2.0.0'
  },
  {
    label: 'v1.x',
    path: '/versions/v1/',
    current: false,
    status: 'deprecated',  // Mark old version
    date: '2026-01',
    releaseNotes: '/versions/v1/changelog#v1.0.0'
  }
]
```

### 3. Update Navigation

The version switcher in the nav bar automatically reads from `versions.ts`.

### 4. Commit and Deploy

```bash
git add docs/versions/v1.0
git commit -m "docs: archive v1.0 documentation"
```

## Version Switcher Component

The `<VersionSwitcher>` component can be used in pages:

```vue
<VersionSwitcher />
```

It's automatically included in the nav bar via the theme configuration.

## Version Warning Banner

When viewing archived documentation, a warning banner automatically appears at the top of the page, encouraging users to view the latest version.

## Best Practices

### When to Create a New Version

- **Major releases** (v1.0 → v2.0): Always archive
- **Minor releases** (v1.0 → v1.1): Usually not needed
- **Patch releases** (v1.0.0 → v1.0.1): Never

### Maintaining Archived Versions

- **Security fixes**: Backport to archived docs if relevant
- **Broken links**: Fix in archived versions
- **New features**: Only add to current version
- **Typos**: Fix in all versions

### SEO Considerations

- Archived versions include `noindex` meta tags (optional)
- Canonical URLs point to current version equivalent
- Sitemap excludes deprecated versions

## CLI Reference

```bash
# Create a new version
pnpm docs:version create <version>

# List all versions
pnpm docs:version list

# Show help
pnpm docs:version help
```

## Troubleshooting

### Links are broken in archived version

Re-run the version script or manually update links:

```bash
# Find and fix broken links
grep -r "](/guide" docs/versions/v1/ --include="*.md"
```

### Version switcher not showing

1. Check that `versions.ts` exports are correct
2. Ensure theme components are registered in `theme/index.ts`
3. Clear VitePress cache: `rm -rf docs/.vitepress/cache`

### Old version banner not appearing

The banner only shows for paths starting with `/versions/`. Ensure:
- The path in `versions.ts` matches the actual directory
- The `current: false` flag is set for archived versions
