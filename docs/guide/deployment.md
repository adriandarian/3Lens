# Deployment Guide

This guide explains how to deploy the 3Lens documentation site.

## Deployment Options

3Lens documentation supports three deployment targets:

| Platform | Config File | Best For |
|----------|-------------|----------|
| GitHub Pages | `.github/workflows/deploy-docs.yml` | Open source projects |
| Vercel | `vercel.json` | Preview deployments, edge caching |
| Netlify | `netlify.toml` | Branch deploys, form handling |

## GitHub Pages (Recommended)

GitHub Pages is the primary deployment target for 3Lens documentation.

### Setup

1. **Enable GitHub Pages** in repository settings:
   - Go to Settings → Pages
   - Source: "GitHub Actions"

2. **Configure domain** (optional):
   - Add custom domain in Settings → Pages
   - Create `docs/public/CNAME` with your domain

3. **Deploy**:
   - Push to `main` branch
   - Or trigger manually in Actions tab

### Automatic Deployment

The workflow automatically deploys when:
- Changes are pushed to `main` branch in `docs/` folder
- Package source code changes (regenerates API docs)
- Workflow file is updated
- Manually triggered via "Run workflow"

### Workflow Overview

```yaml
# .github/workflows/deploy-docs.yml
on:
  push:
    branches: [main]
    paths:
      - 'docs/**'
      - 'packages/*/src/**'
```

The workflow:
1. Checks out repository with full history
2. Installs dependencies with pnpm
3. Builds all packages
4. Generates TypeDoc API reference
5. Builds VitePress site
6. Deploys to GitHub Pages

### Manual Deployment

1. Go to Actions → Deploy Documentation
2. Click "Run workflow"
3. Select branch (usually `main`)
4. Click "Run workflow"

## Vercel

### Setup

1. **Import project** on [vercel.com](https://vercel.com):
   - Connect GitHub repository
   - Vercel auto-detects `vercel.json`

2. **Configure environment**:
   ```
   NODE_VERSION = 20
   ```

3. **Deploy**:
   - Automatic on every push
   - Preview URLs for pull requests

### Configuration

```json
// vercel.json
{
  "buildCommand": "pnpm docs:build",
  "outputDirectory": "docs/.vitepress/dist"
}
```

### Features
- ✅ Automatic preview deployments
- ✅ Edge caching
- ✅ Analytics (optional)
- ✅ Custom domains

## Netlify

### Setup

1. **Import project** on [netlify.com](https://netlify.com):
   - Connect GitHub repository
   - Netlify reads `netlify.toml`

2. **Build settings** (auto-detected):
   - Build command: `pnpm docs:build`
   - Publish directory: `docs/.vitepress/dist`

3. **Deploy**:
   - Automatic on every push
   - Deploy previews for PRs

### Configuration

```toml
# netlify.toml
[build]
  command = "pnpm docs:build"
  publish = "docs/.vitepress/dist"
```

### Features
- ✅ Deploy previews
- ✅ Branch deploys
- ✅ Form handling
- ✅ Split testing

## Custom Domain

### GitHub Pages

1. Add domain in Settings → Pages
2. Create DNS records:
   ```
   # For apex domain (3lens.dev)
   A     @    185.199.108.153
   A     @    185.199.109.153
   A     @    185.199.110.153
   A     @    185.199.111.153
   
   # For subdomain (docs.3lens.dev)
   CNAME docs adriandarian.github.io
   ```

3. Create `docs/public/CNAME`:
   ```
   docs.3lens.dev
   ```

### Vercel / Netlify

1. Add domain in project settings
2. Follow DNS configuration wizard
3. SSL certificates are automatic

## Build Scripts

```bash
# Local development
pnpm docs:dev

# Production build
pnpm docs:build

# Preview production build
pnpm docs:preview

# Generate TypeDoc API reference
pnpm docs
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Build mode | `development` |
| `VITEPRESS_BASE` | Base URL path | `/` |

## Caching

### GitHub Pages
- Assets cached for 10 minutes by default
- Use `?v=hash` for cache busting

### Vercel / Netlify
- Immutable assets cached for 1 year
- HTML files have short TTL for updates

## Troubleshooting

### Build Fails

1. Check Node.js version (requires 20+)
2. Verify pnpm lockfile is committed
3. Check for TypeScript errors: `pnpm typecheck`

### 404 Errors

1. Verify `base` in VitePress config matches deployment path
2. Check `cleanUrls` setting
3. Ensure redirects are configured

### Missing Styles

1. Clear browser cache
2. Check asset paths in build output
3. Verify CSS imports in theme

### Slow Builds

1. Enable build caching in CI
2. Use `pnpm install --frozen-lockfile`
3. Consider incremental builds

## Monitoring

### Uptime Monitoring
- [UptimeRobot](https://uptimerobot.com/) - Free tier available
- [Pingdom](https://pingdom.com/) - More detailed

### Performance
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [WebPageTest](https://webpagetest.org/)

### Analytics
- VitePress has no built-in analytics
- Add Plausible, Fathom, or Simple Analytics
- See [Analytics Setup Guide](/guide/analytics-setup)

## Next Steps

- [SEO Configuration](/guide/seo-configuration) - Optimize for search engines
- [Analytics Setup](/guide/analytics-setup) - Track user engagement
- [Maintenance](/guide/maintenance) - Keep documentation healthy
