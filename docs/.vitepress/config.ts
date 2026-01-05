import { defineConfig } from 'vitepress'
import { getVersionNavItem } from './versions'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: '3Lens',
  description: 'The definitive developer toolkit for three.js - Debug, inspect, and optimize your WebGL/WebGPU applications',
  
  // Base URL for GitHub Pages or custom domain
  base: '/',
  
  // Clean URLs without .html extension
  cleanUrls: true,
  
  // Last updated timestamps
  lastUpdated: true,

  // Ignore dead links during build (many docs reference planned features)
  ignoreDeadLinks: true,
  
  // Head tags - Favicons and branding
  head: [
    // Favicons
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' }],
    ['link', { rel: 'shortcut icon', href: '/favicon.ico' }],
    ['link', { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' }],
    
    // Theme and PWA
    ['meta', { name: 'theme-color', content: '#646cff' }],
    ['meta', { name: 'theme-color', content: '#1a1a1a', media: '(prefers-color-scheme: dark)' }],
    ['link', { rel: 'manifest', href: '/site.webmanifest' }],
    
    // Open Graph
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: '3Lens' }],
    ['meta', { property: 'og:title', content: '3Lens - Three.js Developer Tools' }],
    ['meta', { property: 'og:description', content: 'The definitive developer toolkit for three.js - Debug, inspect, and optimize your WebGL/WebGPU applications' }],
    ['meta', { property: 'og:image', content: 'https://3lens.dev/og-image.png' }],
    ['meta', { property: 'og:image:width', content: '1200' }],
    ['meta', { property: 'og:image:height', content: '630' }],
    ['meta', { property: 'og:url', content: 'https://3lens.dev' }],
    
    // Twitter Card
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:site', content: '@3lensdev' }],
    ['meta', { name: 'twitter:title', content: '3Lens - Three.js Developer Tools' }],
    ['meta', { name: 'twitter:description', content: 'The definitive developer toolkit for three.js - Debug, inspect, and optimize your WebGL/WebGPU applications' }],
    ['meta', { name: 'twitter:image', content: 'https://3lens.dev/og-image.png' }],
    
    // Additional SEO
    ['meta', { name: 'author', content: '3Lens Team' }],
    ['meta', { name: 'keywords', content: 'three.js, threejs, webgl, webgpu, developer tools, debugging, inspector, 3d, javascript, typescript' }],
  ],

  // Markdown configuration
  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    },
    lineNumbers: true,
    // Enable code group feature
    container: {
      tipLabel: 'TIP',
      warningLabel: 'WARNING',
      dangerLabel: 'DANGER',
      infoLabel: 'INFO',
      detailsLabel: 'Details'
    }
  },

  // Sitemap generation
  sitemap: {
    hostname: 'https://3lens.dev'
  },

  // Theme configuration
  themeConfig: {
    // Logo in navigation with dark mode variant
    logo: {
      light: '/logo.svg',
      dark: '/logo-dark.svg'
    },
    siteTitle: '3Lens',

    // Navigation bar
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/api/' },
      { text: 'Examples', link: '/examples/' },
      {
        text: 'Packages',
        items: [
          { text: '@3lens/core', link: '/packages/core/' },
          { text: '@3lens/overlay', link: '/packages/overlay/' },
          { text: '@3lens/react-bridge', link: '/packages/react-bridge/' },
          { text: '@3lens/angular-bridge', link: '/packages/angular-bridge/' },
          { text: '@3lens/vue-bridge', link: '/packages/vue-bridge/' },
          { text: '@3lens/ui', link: '/packages/ui/' },
        ]
      },
      {
        text: 'Resources',
        items: [
          { text: 'Contributing', link: '/contributing' },
          { text: 'Changelog', link: '/changelog' },
          { text: 'Architecture', link: '/architecture' },
          { text: 'Migration Guide', link: '/guide/migration' },
        ]
      },
      // Version switcher dropdown
      getVersionNavItem()
    ],

    // Sidebar navigation
    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'What is 3Lens?', link: '/guide/what-is-3lens' },
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Installation', link: '/guide/installation' },
          ]
        },
        {
          text: 'Framework Integration',
          items: [
            { text: 'Vanilla Three.js', link: '/guide/vanilla-threejs' },
            { text: 'React Three Fiber', link: '/guide/react-r3f' },
            { text: 'Vue + TresJS', link: '/guide/vue-tresjs' },
            { text: 'Angular', link: '/guide/angular' },
            { text: 'Svelte + Threlte', link: '/guide/svelte-threlte' },
          ]
        },
        {
          text: 'Features',
          items: [
            { text: 'Scene Inspection', link: '/guide/features/scene-inspection' },
            { text: 'Performance Debugging', link: '/guide/features/performance' },
            { text: 'Memory Profiling', link: '/guide/features/memory' },
            { text: 'Transform Gizmos', link: '/guide/features/gizmos' },
            { text: 'Material Editing', link: '/guide/features/materials' },
            { text: 'Shader Debugging', link: '/guide/features/shaders' },
          ]
        },
        {
          text: 'Advanced',
          items: [
            { text: 'Configuration', link: '/guide/advanced/configuration' },
            { text: 'Custom Rules', link: '/guide/advanced/custom-rules' },
            { text: 'Plugin Development', link: '/guide/advanced/plugins' },
            { text: 'CI Integration', link: '/guide/advanced/ci' },
            { text: 'WebGPU Support', link: '/guide/advanced/webgpu' },
          ]
        },
        {
          text: 'Deployment & Migration',
          items: [
            { text: 'Deployment Guide', link: '/guide/deployment' },
            { text: 'SEO Configuration', link: '/guide/seo-configuration' },
            { text: 'Analytics Setup', link: '/guide/analytics-setup' },
            { text: 'Maintenance', link: '/guide/maintenance' },
            { text: 'Migration Guide', link: '/guide/migration' },
          ]
        },
        {
          text: 'Troubleshooting',
          items: [
            { text: 'Installation Issues', link: '/guide/installation-troubleshooting' },
            { text: 'First Debugging Session', link: '/guide/first-debugging-session' },
            { text: 'Configuration', link: '/guide/configuration' },
          ]
        }
      ],
      
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Overview', link: '/api/' },
          ]
        },
        {
          text: 'Core - Probe System',
          collapsed: false,
          items: [
            { text: 'createProbe()', link: '/api/core/create-probe' },
            { text: 'DevtoolProbe Class', link: '/api/core/devtool-probe' },
            { text: 'Probe Lifecycle', link: '/api/core/probe-lifecycle' },
            { text: 'observeRenderer()', link: '/api/core/observe-renderer' },
            { text: 'observeScene()', link: '/api/core/observe-scene' },
            { text: 'Inspect Mode API', link: '/api/core/inspect-mode-api' },
            { text: 'Selection API', link: '/api/core/selection-api' },
          ]
        },
        {
          text: 'Core - Configuration',
          collapsed: false,
          items: [
            { text: 'ProbeConfig', link: '/api/core/probe-config' },
            { text: 'Performance Thresholds', link: '/api/core/performance-thresholds' },
            { text: 'Sampling Options', link: '/api/core/sampling-config' },
            { text: 'Custom Rules', link: '/api/core/custom-rules' },
            { text: 'Config File Loading', link: '/api/core/config-file-loading' },
            { text: 'Rule Violations', link: '/api/core/rule-violations' },
          ]
        },
        {
          text: 'Core - Adapters',
          collapsed: false,
          items: [
            { text: 'WebGL Adapter', link: '/api/core/webgl-adapter' },
            { text: 'WebGPU Adapter', link: '/api/core/webgpu-adapter' },
            { text: 'GPU Timing System', link: '/api/core/gpu-timing' },
            { text: 'WebGPU Timing Manager', link: '/api/core/webgpu-timing' },
            { text: 'Renderer Auto-Detection', link: '/api/core/renderer-detection' },
          ]
        },
        {
          text: 'Core - Observers',
          collapsed: false,
          items: [
            { text: 'SceneObserver', link: '/api/core/scene-observer' },
            { text: 'SceneNode', link: '/api/core/scene-node' },
            { text: 'TrackedObjectRef', link: '/api/core/tracked-object-ref' },
            { text: 'Scene Path Computation', link: '/api/core/scene-path' },
          ]
        },
        {
          text: 'Core - Tracking System',
          collapsed: false,
          items: [
            { text: 'PerformanceTracker', link: '/api/core/performance-tracker' },
            { text: 'ResourceLifecycleTracker', link: '/api/core/resource-lifecycle-tracker' },
            { text: 'Memory Tracking', link: '/api/core/memory-tracking' },
            { text: 'Leak Detection', link: '/api/core/leak-detection' },
          ]
        },
        {
          text: 'Overlay',
          items: [
            { text: 'createOverlay()', link: '/api/overlay/create-overlay' },
            { text: 'bootstrapOverlay()', link: '/api/overlay/bootstrap-overlay' },
          ]
        },
        {
          text: 'Hooks & Composables',
          items: [
            { text: 'React Hooks', link: '/api/react/' },
            { text: 'Vue Composables', link: '/api/vue/' },
            { text: 'Angular Service', link: '/api/angular/' },
          ]
        },
        {
          text: 'Types',
          items: [
            { text: 'FrameStats', link: '/api/types/frame-stats' },
            { text: 'SceneSnapshot', link: '/api/types/scene-snapshot' },
            { text: 'All Types', link: '/api/types/' },
          ]
        }
      ],
      
      '/packages/': [
        {
          text: 'Packages',
          items: [
            { text: '@3lens/core', link: '/packages/core/' },
            { text: '@3lens/overlay', link: '/packages/overlay/' },
            { text: '@3lens/react-bridge', link: '/packages/react-bridge/' },
            { text: '@3lens/angular-bridge', link: '/packages/angular-bridge/' },
            { text: '@3lens/vue-bridge', link: '/packages/vue-bridge/' },
            { text: '@3lens/ui', link: '/packages/ui/' },
          ]
        }
      ],
      
      '/examples/': [
        {
          text: 'Examples',
          items: [
            { text: 'Overview', link: '/examples/' },
          ]
        },
        {
          text: 'Framework Integration',
          items: [
            { text: 'Vanilla Three.js', link: '/examples/vanilla-threejs' },
            { text: 'React Three Fiber', link: '/examples/react-r3f' },
            { text: 'Vue + TresJS', link: '/examples/vue-tresjs' },
            { text: 'Next.js SSR', link: '/examples/nextjs-ssr' },
          ]
        },
        {
          text: 'Debugging',
          items: [
            { text: 'Performance Debugging', link: '/examples/performance-debugging' },
            { text: 'Memory Leak Detection', link: '/examples/memory-leaks' },
            { text: 'Shader Debugging', link: '/examples/shader-debugging' },
          ]
        },
        {
          text: 'Advanced',
          items: [
            { text: 'Custom Plugins', link: '/examples/custom-plugin' },
            { text: 'WebGPU Features', link: '/examples/webgpu' },
          ]
        }
      ]
    },

    // Social links
    socialLinks: [
      { icon: 'github', link: 'https://github.com/adriandarian/3Lens' },
      { icon: 'discord', link: 'https://discord.gg/3lens' },
    ],

    // Footer
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026-present 3Lens Contributors'
    },

    // Edit link
    editLink: {
      pattern: 'https://github.com/adriandarian/3Lens/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    },

    // Search configuration (local search)
    search: {
      provider: 'local',
      options: {
        detailedView: true,
        miniSearch: {
          searchOptions: {
            fuzzy: 0.2,
            prefix: true,
            boost: {
              title: 4,
              text: 2,
              titles: 1
            }
          }
        }
      }
    },

    // Outline configuration
    outline: {
      level: [2, 3],
      label: 'On this page'
    },

    // Documentation footer navigation
    docFooter: {
      prev: 'Previous',
      next: 'Next'
    },

    // External link icon
    externalLinkIcon: true,

    // Carbon ads (optional - uncomment when ready)
    // carbonAds: {
    //   code: 'your-carbon-code',
    //   placement: 'your-carbon-placement'
    // }
  }
})
