# Documentation Maintenance Guide

This guide covers maintaining healthy documentation through automated link checking, spell checking, and content validation.

## Overview

3Lens documentation uses automated tooling to maintain quality:

| Tool | Purpose | Trigger |
|------|---------|---------|
| Link Checker | Find broken links | CI on PR, scheduled |
| Spell Checker | Catch typos | CI on PR |
| Markdown Lint | Enforce style | CI on PR |
| Dead Code | Find unused docs | Manual |

## Link Checker

### Why Check Links?

- External links can break over time
- Internal links break when pages move
- API documentation links can become stale
- Image links can be incorrect

### Configuration

Create `.github/workflows/link-check.yml`:

```yaml
name: Link Check

on:
  push:
    branches: [main]
    paths:
      - 'docs/**'
  pull_request:
    branches: [main]
    paths:
      - 'docs/**'
  schedule:
    # Run weekly on Sundays at 00:00 UTC
    - cron: '0 0 * * 0'
  workflow_dispatch:

jobs:
  link-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Build docs
        run: |
          pnpm build
          pnpm docs
          pnpm docs:build

      - name: Check links
        uses: lycheeverse/lychee-action@v1
        with:
          args: >
            --verbose
            --no-progress
            --accept 200,204,206,301,302,307,308
            --exclude-mail
            --exclude 'localhost'
            --exclude '127.0.0.1'
            --exclude 'example.com'
            --exclude-path './docs/.vitepress/dist/assets'
            './docs/.vitepress/dist/**/*.html'
          fail: true
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Upload link check report
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: link-check-report
          path: ./lychee/out.md
```

### Lychee Configuration

Create `lychee.toml` for advanced configuration:

```toml
# lychee.toml
# Link checker configuration

# Exclude patterns
exclude = [
  "localhost",
  "127.0.0.1",
  "example.com",
  "your-org.github.io",
]

# Exclude specific paths
exclude_path = [
  "node_modules",
  ".git",
  "dist",
]

# Accept these status codes as valid
accept = [
  200,
  204,
  206,
  301,
  302,
  307,
  308,
]

# Skip email addresses
exclude_mail = true

# Timeout for each request (seconds)
timeout = 30

# Number of retries
max_retries = 3

# User agent string
user_agent = "Mozilla/5.0 (compatible; lychee/0.14.0)"

# Maximum number of concurrent requests
max_concurrency = 32

# Cache results for subsequent runs
cache = true
```

### Running Locally

```bash
# Install lychee
brew install lychee

# Check links in built docs
lychee './docs/.vitepress/dist/**/*.html'

# Check specific file
lychee './docs/guide/getting-started.md'

# With custom config
lychee --config lychee.toml './docs/**/*.md'
```

### Ignoring Links

Add links to ignore in `lychee.toml`:

```toml
exclude = [
  # External sites that block bots
  "twitter.com",
  "linkedin.com",
  
  # Rate-limited APIs
  "api.github.com",
  
  # Internal services
  "internal.company.com",
]
```

Or use inline comments in Markdown:

```markdown
<!-- lychee-ignore -->
[This link won't be checked](https://might-be-flaky.com)
```

## Spell Checker

### Why Check Spelling?

- Typos reduce professionalism
- Inconsistent terminology confuses users
- Technical terms need custom dictionary

### Installation

```bash
# Install cspell globally
npm install -g cspell

# Or as dev dependency
pnpm add -D cspell
```

### Configuration

Create `cspell.json`:

```json
{
  "version": "0.2",
  "language": "en",
  "words": [
    "3lens",
    "threejs",
    "vitepress",
    "typedoc",
    "monorepo",
    "pnpm",
    "devtools",
    "webgl",
    "webgpu",
    "glsl",
    "shader",
    "shaders",
    "postprocessing",
    "raycaster",
    "raycast",
    "gizmo",
    "gizmos",
    "quaternion",
    "quaternions",
    "euler",
    "lerp",
    "slerp",
    "orthographic",
    "perspectiva",
    "culling",
    "frustum",
    "mipmaps",
    "anisotropic",
    "emissive",
    "specular",
    "metalness",
    "roughness",
    "normals",
    "bumpmap",
    "envmap",
    "skybox",
    "cubemap",
    "shadowmap",
    "framebuffer",
    "rendertarget",
    "instancing",
    "batching",
    "wireframe",
    "bbox",
    "aabb",
    "interactable",
    "draggable",
    "resizable",
    "collapsible",
    "unfocus",
    "autofocus",
    "hotkey",
    "hotkeys",
    "keybind",
    "keybinds",
    "submenu",
    "tooltip",
    "tooltips",
    "dropdown",
    "textarea",
    "checkbox",
    "colorpicker",
    "datetime",
    "composable",
    "composables",
    "reactivity",
    "lifecycle",
    "middleware",
    "serializer",
    "deserialize",
    "interpolate",
    "debounce",
    "debounced",
    "throttle",
    "throttled",
    "changelog",
    "semver",
    "lockfile",
    "dotfile",
    "gitignore",
    "eslintrc",
    "prettierrc",
    "tsconfig"
  ],
  "flagWords": [
    "hte",
    "teh",
    "taht"
  ],
  "ignorePaths": [
    "node_modules",
    "dist",
    "coverage",
    "pnpm-lock.yaml",
    "*.min.js",
    "*.d.ts",
    "docs/.vitepress/cache",
    "docs/.vitepress/dist",
    "docs/api"
  ],
  "ignoreRegExpList": [
    "/```[\\s\\S]*?```/g",
    "/@[a-zA-Z0-9_-]+/g",
    "/\\$\\{[^}]+\\}/g",
    "/https?:\\/\\/[^\\s)]+/g"
  ],
  "overrides": [
    {
      "filename": "**/*.md",
      "words": [
        "frontmatter"
      ]
    },
    {
      "filename": "**/*.ts",
      "words": [
        "readonly",
        "keyof",
        "typeof"
      ]
    }
  ]
}
```

### GitHub Actions Workflow

Create `.github/workflows/spell-check.yml`:

```yaml
name: Spell Check

on:
  push:
    branches: [main]
    paths:
      - 'docs/**'
      - '**.md'
  pull_request:
    branches: [main]
    paths:
      - 'docs/**'
      - '**.md'

jobs:
  spell-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install cspell
        run: npm install -g cspell

      - name: Run spell check
        run: cspell --no-progress "docs/**/*.md" "**/*.md"
```

### Running Locally

```bash
# Check all markdown files
cspell "docs/**/*.md"

# Check specific file
cspell docs/guide/getting-started.md

# Check with suggestions
cspell --show-suggestions "docs/**/*.md"

# Generate list of unknown words
cspell --words-only --unique "docs/**/*.md" | sort
```

### Adding Words to Dictionary

When the spell checker flags a valid word:

1. Add to `cspell.json` words array
2. Or create a project dictionary file

Create `dictionaries/project.txt`:

```
3lens
threejs
vitepress
# Add new words here
```

Reference in `cspell.json`:

```json
{
  "dictionaryDefinitions": [
    {
      "name": "project-words",
      "path": "./dictionaries/project.txt"
    }
  ],
  "dictionaries": ["project-words"]
}
```

## Markdown Lint

### Configuration

Create `.markdownlint.json`:

```json
{
  "default": true,
  "MD013": false,
  "MD033": {
    "allowed_elements": [
      "details",
      "summary",
      "br",
      "sup",
      "sub",
      "kbd",
      "script"
    ]
  },
  "MD041": false,
  "MD024": {
    "siblings_only": true
  }
}
```

### Running Locally

```bash
# Install markdownlint CLI
npm install -g markdownlint-cli

# Check files
markdownlint 'docs/**/*.md'

# Fix automatically
markdownlint --fix 'docs/**/*.md'
```

### GitHub Actions Integration

Add to your CI workflow:

```yaml
- name: Lint Markdown
  run: |
    npm install -g markdownlint-cli
    markdownlint 'docs/**/*.md'
```

## Combined Maintenance Workflow

Create a comprehensive maintenance workflow:

```yaml
# .github/workflows/docs-maintenance.yml
name: Documentation Maintenance

on:
  push:
    branches: [main]
    paths:
      - 'docs/**'
  pull_request:
    branches: [main]
    paths:
      - 'docs/**'
  schedule:
    - cron: '0 0 * * 0'  # Weekly on Sunday

jobs:
  spell-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Run spell check
        run: |
          npm install -g cspell
          cspell --no-progress "docs/**/*.md"

  markdown-lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Lint Markdown
        uses: DavidAnson/markdownlint-cli2-action@v14
        with:
          globs: 'docs/**/*.md'

  link-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - name: Install and build
        run: |
          pnpm install
          pnpm build
          pnpm docs
          pnpm docs:build
      - name: Check links
        uses: lycheeverse/lychee-action@v1
        with:
          args: >
            --verbose
            --no-progress
            --accept 200,204,206,301,302,307,308
            --exclude-mail
            --exclude 'localhost'
            './docs/.vitepress/dist/**/*.html'
          fail: true
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Content Auditing

### Finding Outdated Content

Create a script to find old content:

```bash
#!/bin/bash
# scripts/find-stale-docs.sh

echo "Files not modified in 90+ days:"
find docs -name "*.md" -type f -mtime +90 | head -20

echo ""
echo "Files with TODO/FIXME:"
grep -r "TODO\|FIXME\|XXX" docs --include="*.md" || true
```

### Checking for Dead Links to Docs

```bash
# Find internal links that might be broken
grep -r "\](/" docs --include="*.md" | \
  grep -oP '\]\(/[^)]+' | \
  sed 's/\](//' | \
  sort -u
```

## Automated Reports

### Generating Health Reports

Create a script for documentation health:

```typescript
// scripts/docs-health.ts
import { execSync } from 'child_process'
import { readdirSync, statSync } from 'fs'
import { join } from 'path'

function countFiles(dir: string, ext: string): number {
  let count = 0
  const files = readdirSync(dir, { withFileTypes: true })
  
  for (const file of files) {
    const path = join(dir, file.name)
    if (file.isDirectory()) {
      count += countFiles(path, ext)
    } else if (file.name.endsWith(ext)) {
      count++
    }
  }
  return count
}

function getWordCount(dir: string): number {
  const output = execSync(`find ${dir} -name "*.md" -exec wc -w {} +`)
  const match = output.toString().match(/(\d+)\s+total/)
  return match ? parseInt(match[1]) : 0
}

console.log('📊 Documentation Health Report')
console.log('================================')
console.log(`📄 Markdown files: ${countFiles('docs', '.md')}`)
console.log(`📝 Total words: ${getWordCount('docs').toLocaleString()}`)
console.log(`🖼️  Images: ${countFiles('docs', '.png') + countFiles('docs', '.jpg')}`)
console.log('================================')
```

Run with:

```bash
npx tsx scripts/docs-health.ts
```

## Local Development Checks

### Pre-commit Hook

Add documentation checks to pre-commit:

```bash
# Install husky
pnpm add -D husky lint-staged

# Setup hooks
pnpm husky install
```

Create `.husky/pre-commit`:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Run spell check on staged markdown files
npx lint-staged
```

Create `.lintstagedrc`:

```json
{
  "docs/**/*.md": [
    "cspell --no-progress",
    "markdownlint"
  ]
}
```

## Maintenance Checklist

### Weekly

- [ ] Review link checker results
- [ ] Fix any broken links
- [ ] Review spell check warnings

### Monthly

- [ ] Audit content for outdated information
- [ ] Update version numbers and examples
- [ ] Review analytics for unpopular pages

### Quarterly

- [ ] Full documentation review
- [ ] Update screenshots
- [ ] Refresh code examples
- [ ] Update dependencies in examples

### Release Time

- [ ] Update changelog
- [ ] Update version badges
- [ ] Verify all links to releases
- [ ] Update migration guides

## Troubleshooting

### Link Checker False Positives

Some sites block automated requests:

```toml
# lychee.toml
exclude = [
  "twitter.com",  # Blocks bots
  "linkedin.com", # Requires auth
]
```

### Spell Checker Too Strict

Reduce false positives:

1. Add technical terms to dictionary
2. Use language-specific overrides
3. Ignore code blocks with regex

### Slow CI Checks

Speed up maintenance checks:

1. Cache dependencies
2. Run checks in parallel
3. Only check changed files on PR

```yaml
- name: Check only changed files
  run: |
    CHANGED=$(git diff --name-only origin/main...HEAD -- '*.md')
    if [ -n "$CHANGED" ]; then
      echo "$CHANGED" | xargs cspell
    fi
```

## Next Steps

- [Deployment](./deployment.md) - Deploy documentation
- [SEO Configuration](./seo-configuration.md) - Optimize for search
- [Analytics Setup](./analytics-setup.md) - Track engagement
