# Analytics Setup Guide

This guide covers adding privacy-friendly analytics to the 3Lens documentation site.

## Overview

3Lens documentation supports privacy-focused analytics solutions that don't require cookie consent banners:

| Platform | Privacy | Cookie-free | Self-hosted |
|----------|---------|-------------|-------------|
| [Plausible](https://plausible.io) | ✅ GDPR compliant | ✅ Yes | ✅ Optional |
| [Fathom](https://usefathom.com) | ✅ GDPR compliant | ✅ Yes | ❌ No |
| [Simple Analytics](https://simpleanalytics.com) | ✅ GDPR compliant | ✅ Yes | ❌ No |
| [Umami](https://umami.is) | ✅ GDPR compliant | ✅ Yes | ✅ Yes |

## Plausible Analytics

### Why Plausible?

- Privacy-focused, no cookies
- GDPR, CCPA compliant
- Lightweight (~1KB script)
- Simple, actionable dashboard
- Self-hosted option available

### Installation

#### 1. Sign Up

Create an account at [plausible.io](https://plausible.io) or self-host.

#### 2. Add Script to VitePress

```typescript
// docs/.vitepress/config.ts
export default defineConfig({
  head: [
    // Plausible Analytics
    [
      'script',
      {
        defer: '',
        'data-domain': '3lens.dev',
        src: 'https://plausible.io/js/script.js'
      }
    ]
  ]
})
```

#### 3. Verify Installation

1. Visit your documentation site
2. Check the Plausible dashboard for real-time visitors
3. View page shows in the live view

### Custom Events

Track custom events like button clicks or downloads:

```typescript
// Track a custom event
function trackEvent(name: string, props?: Record<string, string>) {
  if (window.plausible) {
    window.plausible(name, { props })
  }
}

// Usage
trackEvent('Download', { package: '@3lens/core' })
trackEvent('Copy Code', { page: '/guide/getting-started' })
```

Add event tracking script:

```typescript
// docs/.vitepress/config.ts
export default defineConfig({
  head: [
    [
      'script',
      {
        defer: '',
        'data-domain': '3lens.dev',
        src: 'https://plausible.io/js/script.tagged-events.js'
      }
    ]
  ]
})
```

### Excluding Traffic

Exclude your own traffic during development:

1. Install the Plausible browser extension
2. Or add to localStorage:
```javascript
localStorage.setItem('plausible_ignore', 'true')
```

## Fathom Analytics

### Installation

#### 1. Sign Up

Create an account at [usefathom.com](https://usefathom.com).

#### 2. Add Script

```typescript
// docs/.vitepress/config.ts
export default defineConfig({
  head: [
    [
      'script',
      {
        src: 'https://cdn.usefathom.com/script.js',
        'data-site': 'YOUR_SITE_ID',
        defer: ''
      }
    ]
  ]
})
```

### Custom Events

```typescript
// Track page views manually (for SPA navigation)
if (window.fathom) {
  window.fathom.trackPageview()
}

// Track goals
if (window.fathom) {
  window.fathom.trackGoal('GOAL_ID', 0) // value in cents
}
```

## Simple Analytics

### Installation

#### 1. Sign Up

Create an account at [simpleanalytics.com](https://simpleanalytics.com).

#### 2. Add Script

```typescript
// docs/.vitepress/config.ts
export default defineConfig({
  head: [
    [
      'script',
      {
        async: '',
        defer: '',
        src: 'https://scripts.simpleanalyticscdn.com/latest.js'
      }
    ],
    [
      'noscript',
      {},
      '<img src="https://queue.simpleanalyticscdn.com/noscript.gif" alt="" referrerpolicy="no-referrer-when-downgrade" />'
    ]
  ]
})
```

### Custom Events

```typescript
// Track events
if (window.sa_event) {
  window.sa_event('download', { package: '@3lens/core' })
}
```

## Umami (Self-Hosted)

### Why Umami?

- Completely free and open-source
- Self-hosted for full control
- Privacy-focused, no cookies
- Simple setup with Docker

### Installation

#### 1. Deploy Umami

```bash
# Clone Umami
git clone https://github.com/umami-software/umami.git
cd umami

# Deploy with Docker
docker-compose up -d
```

Or use one-click deploys:
- [Deploy to Vercel](https://vercel.com/new/clone?repository-url=https://github.com/umami-software/umami)
- [Deploy to Railway](https://railway.app/new/template/umami)

#### 2. Add Website

1. Log into Umami dashboard
2. Go to Settings → Websites → Add website
3. Copy the tracking code

#### 3. Add Script

```typescript
// docs/.vitepress/config.ts
export default defineConfig({
  head: [
    [
      'script',
      {
        async: '',
        src: 'https://your-umami-instance.com/script.js',
        'data-website-id': 'YOUR_WEBSITE_ID'
      }
    ]
  ]
})
```

### Custom Events

```typescript
// Track events
if (window.umami) {
  window.umami.track('download', { package: '@3lens/core' })
}
```

## VitePress Integration

### Creating an Analytics Plugin

Create a reusable analytics composable:

```typescript
// docs/.vitepress/composables/useAnalytics.ts
export function useAnalytics() {
  const trackEvent = (name: string, props?: Record<string, string | number>) => {
    // Plausible
    if ((window as any).plausible) {
      (window as any).plausible(name, { props })
    }
    
    // Fathom
    if ((window as any).fathom && props?.goalId) {
      (window as any).fathom.trackGoal(props.goalId, props.value || 0)
    }
    
    // Simple Analytics
    if ((window as any).sa_event) {
      (window as any).sa_event(name, props)
    }
    
    // Umami
    if ((window as any).umami) {
      (window as any).umami.track(name, props)
    }
  }

  const trackPageView = (url?: string) => {
    // Plausible auto-tracks
    
    // Fathom
    if ((window as any).fathom) {
      (window as any).fathom.trackPageview({ url })
    }
    
    // Simple Analytics auto-tracks
    
    // Umami auto-tracks
  }

  return {
    trackEvent,
    trackPageView
  }
}
```

### Tracking SPA Navigation

VitePress is a SPA, so track navigation:

```typescript
// docs/.vitepress/theme/index.ts
import { watch } from 'vue'
import { useRoute } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { useAnalytics } from '../composables/useAnalytics'

export default {
  extends: DefaultTheme,
  setup() {
    const route = useRoute()
    const { trackPageView } = useAnalytics()
    
    watch(
      () => route.path,
      (path) => {
        trackPageView(path)
      }
    )
  }
}
```

## Tracking Recommendations

### What to Track

| Event | Purpose | Example |
|-------|---------|---------|
| Page views | Content popularity | Automatic |
| Downloads | Package interest | `npm install` button |
| Code copies | Code engagement | Copy button clicks |
| External links | Resource interest | GitHub, npm links |
| Search queries | User intent | Search terms |

### Key Metrics

| Metric | Description | Action |
|--------|-------------|--------|
| Top pages | Most visited content | Prioritize updates |
| Bounce rate | Single-page visits | Improve navigation |
| Time on page | Engagement level | Expand popular content |
| Referrers | Traffic sources | Focus marketing |
| Countries | Audience location | Localization needs |

## Environment-Based Analytics

Only load analytics in production:

```typescript
// docs/.vitepress/config.ts
const isProd = process.env.NODE_ENV === 'production'

export default defineConfig({
  head: [
    // Only add analytics in production
    ...(isProd ? [
      [
        'script',
        {
          defer: '',
          'data-domain': '3lens.dev',
          src: 'https://plausible.io/js/script.js'
        }
      ]
    ] : [])
  ]
})
```

## Testing Analytics

### Local Testing

1. Build the site in production mode:
```bash
NODE_ENV=production pnpm docs:build
pnpm docs:preview
```

2. Check browser Network tab for analytics script
3. Verify events in analytics dashboard

### Debugging

Add debug mode for Plausible:

```typescript
[
  'script',
  {
    defer: '',
    'data-domain': '3lens.dev',
    src: 'https://plausible.io/js/script.local.js' // Debug script
  }
]
```

## Privacy Considerations

### No Cookie Banner Needed

All recommended analytics solutions:
- Don't use cookies
- Don't track across sites
- Don't collect personal data
- Are GDPR/CCPA compliant

### Privacy Policy

Still recommended to add a privacy policy explaining:
- What data is collected (page views, referrers, country)
- What data is NOT collected (personal info, cookies)
- How data is used (improving documentation)

Example statement:

```markdown
## Analytics

We use [Plausible Analytics](https://plausible.io) to understand how our 
documentation is used. Plausible is privacy-focused and doesn't use cookies 
or collect personal data. See their [data policy](https://plausible.io/data-policy).
```

## Dashboard Access

### Sharing Analytics

Make analytics public for transparency:

**Plausible:**
- Go to Site Settings → Visibility → Make stats public
- Share link: `https://plausible.io/3lens.dev`

**Fathom:**
- Create a share link in dashboard settings

### Team Access

Add team members to your analytics dashboard for shared insights.

## Analytics Checklist

### Setup

- [ ] Choose analytics platform
- [ ] Add tracking script to VitePress config
- [ ] Verify script loads in production
- [ ] Test page view tracking

### Custom Events

- [ ] Identify key actions to track
- [ ] Implement event tracking
- [ ] Test events fire correctly
- [ ] Verify in analytics dashboard

### Monitoring

- [ ] Set up weekly report email
- [ ] Create public dashboard (optional)
- [ ] Review metrics monthly
- [ ] Update privacy policy

## Next Steps

- [SEO Configuration](./seo-configuration.md) - Optimize for search engines
- [Maintenance](./maintenance.md) - Keep documentation healthy
- [Deployment](./deployment.md) - Deploy your site
