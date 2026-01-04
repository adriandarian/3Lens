# ADR-001: Documentation Framework Selection

> **Status:** Proposed  
> **Date:** January 3, 2026  
> **Decision Makers:** 3Lens Core Team  
> **Related Task:** DOCUMENTATION-PLAN.md #1.1

---

## Context

3Lens needs a documentation site to support 180+ documentation tasks covering:
- API reference documentation (TypeDoc integration)
- Framework guides (React, Angular, Vue)
- Tutorials and examples
- Package documentation for 6 packages

The documentation must support:
- Code syntax highlighting for TypeScript, JavaScript, GLSL, WGSL
- Dark/light theme toggle
- Full-text search
- Versioning (v1.x, v2.x)
- Custom components for interactive demos
- SEO optimization

---

## Options Considered

### 1. VitePress

**Overview:** Vue-powered static site generator built on Vite, designed for documentation.

| Aspect | Details |
|--------|---------|
| **Framework** | Vue 3 |
| **Build Tool** | Vite |
| **Performance** | Extremely fast HMR and builds |
| **Theme** | Default theme is excellent out-of-box |
| **Search** | Built-in local search, Algolia optional |
| **Versioning** | Manual setup required |
| **Stars** | ~13k GitHub stars |

**Pros:**
- ⚡ Lightning-fast development with Vite HMR
- 🎨 Beautiful default theme requires minimal customization
- 📦 Small bundle size (~30kb gzipped)
- 🔌 Vue ecosystem alignment (3Lens has Vue bridge)
- 📝 Excellent Markdown extensions (containers, code groups)
- 🔍 Built-in local search works great
- 🌐 Easy internationalization support
- 💻 Vue components can be embedded in Markdown

**Cons:**
- 📚 Manual versioning setup
- 🔧 Fewer plugins than Docusaurus
- 📊 Smaller ecosystem than Docusaurus

**Example Sites:** Vue.js, Vite, Vitest, Pinia, VueUse

---

### 2. Docusaurus

**Overview:** Facebook's documentation framework built on React.

| Aspect | Details |
|--------|---------|
| **Framework** | React |
| **Build Tool** | Webpack (v2) / future Rspack |
| **Performance** | Good, but slower than Vite |
| **Theme** | Comprehensive default theme |
| **Search** | Algolia DocSearch (free for OSS) |
| **Versioning** | Built-in, excellent |
| **Stars** | ~56k GitHub stars |

**Pros:**
- 📚 Built-in versioning system
- 🔍 Algolia DocSearch integration
- 🌍 Excellent i18n support
- 📦 Large plugin ecosystem
- 👥 Large community and support
- 📝 MDX support for React components
- 🎯 SEO optimized out-of-box

**Cons:**
- 🐢 Slower builds than Vite-based solutions
- 📦 Larger bundle size
- ⚛️ React-based (not aligned with Vue bridge)
- 🔧 More complex configuration
- 💾 Higher memory usage during builds

**Example Sites:** React, Jest, Redux, Babel, Prettier

---

### 3. Starlight (Astro)

**Overview:** Astro's official documentation theme, framework-agnostic.

| Aspect | Details |
|--------|---------|
| **Framework** | Astro (framework-agnostic) |
| **Build Tool** | Astro/Vite |
| **Performance** | Excellent (zero JS by default) |
| **Theme** | Modern, accessible default |
| **Search** | Pagefind (local), Algolia optional |
| **Versioning** | Manual setup required |
| **Stars** | ~6k GitHub stars |

**Pros:**
- 🚀 Zero JavaScript by default (best performance)
- 🎨 Beautiful, accessible default theme
- 🔌 Use any framework's components (Vue, React, Svelte)
- 📱 Excellent mobile experience
- ♿ A11y-focused design
- 🔍 Pagefind local search is excellent
- 📝 MDX and component islands

**Cons:**
- 🆕 Newer, smaller ecosystem
- 📚 Manual versioning
- 📖 Less documentation/examples
- 🔧 Learning curve if unfamiliar with Astro

**Example Sites:** Astro docs, withastro.com, Sharp

---

## Comparison Matrix

| Feature | VitePress | Docusaurus | Starlight |
|---------|:---------:|:----------:|:---------:|
| **Build Speed** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Bundle Size** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Default Theme** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Built-in Versioning** | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| **Plugin Ecosystem** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Search** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Vue Alignment** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| **TypeDoc Integration** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Community Size** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Learning Curve** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |

---

## Decision

### Recommendation: **VitePress**

VitePress is the recommended choice for 3Lens documentation for the following reasons:

#### 1. Vue Ecosystem Alignment
3Lens includes `@3lens/vue-bridge` for Vue/TresJS integration. Using VitePress:
- Allows embedding Vue component demos in documentation
- Provides consistent developer experience for Vue users
- Enables code reuse between docs and Vue bridge package

#### 2. Performance
- Instant HMR during documentation development
- Sub-second builds for incremental changes
- Small bundle size benefits end users

#### 3. Developer Experience
- Minimal configuration to get started
- Excellent default theme matches modern documentation standards
- Code groups and containers perfect for multi-framework examples:

```md
::: code-group
```ts [React]
import { useDevtoolEntity } from '@3lens/react-bridge';
```

```ts [Vue]
import { useDevtoolEntity } from '@3lens/vue-bridge';
```

```ts [Angular]
import { ThreeLensService } from '@3lens/angular-bridge';
```
:::
```

#### 4. Search
Built-in local search is fast and works offline. Algolia can be added later if needed.

#### 5. TypeDoc Compatibility
VitePress integrates well with TypeDoc output through:
- `typedoc-plugin-markdown` for Markdown API docs
- Custom sidebar generation from TypeDoc output

---

## Implementation Plan

### Phase 1: Setup (Task 1.2)
```bash
# Initialize VitePress in docs folder
pnpm add -D vitepress

# Create config
mkdir -p docs/.vitepress
touch docs/.vitepress/config.ts
```

### Phase 2: Configuration (Task 1.3)
```ts
// docs/.vitepress/config.ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '3Lens',
  description: 'Three.js Developer Tools',
  
  themeConfig: {
    logo: '/logo.svg',
    
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/api/' },
      { text: 'Examples', link: '/examples/' },
    ],
    
    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Installation', link: '/guide/installation' },
          ]
        },
        // ... more sections
      ],
    },
    
    search: {
      provider: 'local'
    },
    
    socialLinks: [
      { icon: 'github', link: 'https://github.com/adriandarian/3Lens' }
    ]
  }
})
```

### Phase 3: Scripts (Task 9.1.1)
```json
{
  "scripts": {
    "docs:dev": "vitepress dev docs",
    "docs:build": "vitepress build docs",
    "docs:preview": "vitepress preview docs"
  }
}
```

### Phase 4: TypeDoc Integration
```bash
# Generate markdown API docs
pnpm add -D typedoc typedoc-plugin-markdown
```

```json
// typedoc.json addition
{
  "plugin": ["typedoc-plugin-markdown"],
  "out": "docs/api/reference"
}
```

---

## Versioning Strategy

While VitePress doesn't have built-in versioning, we can implement it:

### Option A: Branch-based (Recommended for now)
- `main` branch → latest docs
- `v1` branch → v1.x docs
- Deploy multiple branches to subdirectories

### Option B: Directory-based
```
docs/
  v1/
  v2/
  latest/ → symlink to v2
```

### Option C: Plugin
Use `vitepress-versioning-plugin` when versioning becomes necessary.

**Recommendation:** Start without versioning. Add directory-based versioning when v2 releases.

---

## Alternatives Rejected

### Docusaurus
Rejected due to:
- React-based, not aligned with Vue ecosystem
- Slower build times impact documentation iteration
- Larger bundle size
- More complex than needed for our use case

### Starlight
Rejected due to:
- Smaller ecosystem and community
- Team familiarity with Vue exceeds Astro
- VitePress is more established

---

## Consequences

### Positive
- Fast documentation development cycle
- Vue components can be embedded for interactive demos
- Consistent with Vue bridge development
- Small bundle benefits documentation users
- Easy to maintain and extend

### Negative
- Manual versioning implementation when needed
- Smaller plugin ecosystem than Docusaurus
- May need custom solutions for advanced features

### Neutral
- Team needs to learn VitePress-specific features
- Migration to another tool possible but non-trivial

---

## References

- [VitePress Documentation](https://vitepress.dev/)
- [Docusaurus Documentation](https://docusaurus.io/)
- [Starlight Documentation](https://starlight.astro.build/)
- [typedoc-plugin-markdown](https://github.com/tgreyuk/typedoc-plugin-markdown)
- [Vue.js Documentation (VitePress example)](https://vuejs.org/)

---

## Changelog

| Date | Author | Change |
|------|--------|--------|
| 2026-01-03 | - | Initial proposal |

---

*This ADR documents the decision-making process for Task 1.1 of the Documentation Plan.*
