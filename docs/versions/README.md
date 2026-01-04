# Archived Documentation Versions

This directory contains archived documentation for previous major versions of 3Lens.

## Structure

```
versions/
├── v1/          # v1.x documentation (when archived)
│   ├── guide/
│   ├── api/
│   └── ...
├── v2/          # v2.x documentation (future)
└── ...
```

## Creating a New Version Archive

Use the version management script:

```bash
pnpm docs:version create v1.0
```

This will:
1. Copy current documentation to `/versions/v1.0/`
2. Update internal links to use versioned paths
3. Preserve the documentation state at that version

## Notes

- Archived versions are read-only (no active development)
- Security-critical updates may be backported
- Each version maintains its own sidebar configuration
- Version warnings appear automatically when viewing old docs
