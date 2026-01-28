# Release Checklist

Use this checklist when preparing a new release of 3Lens.

## Pre-Release

### Code Quality

- [ ] All tests pass: `pnpm test`
- [ ] All contracts validate: `pnpm validate`
- [ ] Linting passes: `pnpm lint`
- [ ] Type checking passes: `pnpm typecheck`
- [ ] No console.log statements in production code

### Documentation

- [ ] CHANGELOG.md updated
- [ ] README.md up to date
- [ ] API documentation generated
- [ ] Migration guide written (if breaking changes)

### Compatibility

- [ ] Tested with supported three.js versions
- [ ] Tested with WebGL1, WebGL2, WebGPU (where applicable)
- [ ] Tested in Chrome, Firefox, Safari
- [ ] CSP-safe mode tested

### Versioning

- [ ] Version bumped in all package.json files
- [ ] Kernel API version updated (if breaking)
- [ ] Trace schema version updated (if breaking)
- [ ] Contracts version updated (if breaking)

## Release Process

### 1. Create Release Branch

```bash
git checkout -b release/v1.x.x
```

### 2. Update Versions

```bash
pnpm version:bump
```

### 3. Generate Changelog

```bash
pnpm changelog:release
```

### 4. Build All Packages

```bash
pnpm build
```

### 5. Run Full Test Suite

```bash
pnpm test
pnpm validate
```

### 6. Create Release Commit

```bash
git add .
git commit -m "chore: release v1.x.x"
```

### 7. Tag Release

```bash
git tag v1.x.x
```

### 8. Push

```bash
git push origin release/v1.x.x
git push origin v1.x.x
```

### 9. Publish to npm

```bash
pnpm publish -r
```

### 10. Create GitHub Release

- [ ] Create release from tag
- [ ] Copy changelog entry to release notes
- [ ] Attach any release artifacts

## Post-Release

### Verification

- [ ] npm packages published correctly
- [ ] Installation works: `npm install @3lens/devtools`
- [ ] Basic functionality works in a test project
- [ ] Documentation site updated

### Communication

- [ ] Announce on social media
- [ ] Update Discord/community channels
- [ ] Notify major users (if applicable)

### Cleanup

- [ ] Merge release branch to main
- [ ] Delete release branch
- [ ] Update dev version (bump to next -dev)

## Rollback Procedure

If issues are found after release:

### 1. Unpublish (within 72 hours)

```bash
npm unpublish @3lens/package@version
```

### 2. Or Publish Patch

```bash
# Fix issue
pnpm version patch
pnpm build
pnpm publish -r
```

### 3. Communication

- [ ] Post issue notice
- [ ] Recommend pinning to previous version
- [ ] Update when fix available

## Version Compatibility Matrix

Update this table with each release:

| 3Lens Version | three.js | WebGL | WebGPU | Node |
|---------------|----------|-------|--------|------|
| 1.0.0         | >=0.150  | 1, 2  | Beta   | >=18 |

## Breaking Changes Checklist

If this release has breaking changes:

- [ ] Migration guide written
- [ ] Deprecation warnings added in previous release
- [ ] Major version bumped
- [ ] API version bumped
- [ ] Clear upgrade path documented
