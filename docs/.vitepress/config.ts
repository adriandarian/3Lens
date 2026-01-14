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

  // Vite configuration for development
  vite: {
    server: {
      // During development, if examples aren't built, show a helpful message
      // For production, examples are pre-built to docs/public/examples/
      fs: {
        // Allow serving files from the examples directory
        allow: ['..']
      }
    }
  },
  
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
          { text: '@3lens/themes', link: '/api/themes/' },
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
          text: 'Themes',
          items: [
            { text: 'Overview', link: '/api/themes/' },
            { text: 'CSS Variables', link: '/api/themes/css-variables' },
            { text: 'Themes', link: '/api/themes/themes' },
            { text: 'Utility Classes', link: '/api/themes/utility-classes' },
            { text: 'TypeScript API', link: '/api/themes/typescript-api' },
            { text: 'Framework Integration', link: '/api/themes/framework-integration' },
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
            { text: '@3lens/themes', link: '/api/themes/' },
            { text: '@3lens/react-bridge', link: '/packages/react-bridge/' },
            { text: '@3lens/angular-bridge', link: '/packages/angular-bridge/' },
            { text: '@3lens/vue-bridge', link: '/packages/vue-bridge/' },
            { text: '@3lens/ui', link: '/packages/ui/' },
          ]
        }
      ],
      '/api/themes/': [
        {
          text: '@3lens/themes',
          items: [
            { text: 'Overview', link: '/api/themes/' },
            { text: 'CSS Variables', link: '/api/themes/css-variables' },
            { text: 'Themes', link: '/api/themes/themes' },
            { text: 'Utility Classes', link: '/api/themes/utility-classes' },
            { text: 'TypeScript API', link: '/api/themes/typescript-api' },
            { text: 'Framework Integration', link: '/api/themes/framework-integration' },
          ]
        }
      ],
      
      '/examples/': [
        {
          text: 'Examples',
          items: [
            { text: 'Overview', link: '/examples/' },
            { text: '🎮 All Live Examples', link: '/examples/live/' },
          ]
        },
        {
          text: '🔌 Framework Integration',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/examples/live/framework-integration/' },
            { text: 'Vanilla Three.js', link: '/examples/live/framework-integration/vanilla-threejs' },
            { text: 'React Three Fiber', link: '/examples/live/framework-integration/react-three-fiber' },
            { text: 'Vue + TresJS', link: '/examples/live/framework-integration/vue-tresjs' },
            { text: 'Angular', link: '/examples/live/framework-integration/angular-threejs' },
            { text: 'Svelte + Threlte', link: '/examples/live/framework-integration/svelte-threlte' },
            { text: 'Next.js SSR', link: '/examples/live/framework-integration/nextjs-ssr' },
            { text: 'Electron Desktop', link: '/examples/live/framework-integration/electron-desktop' },
          ]
        },
        {
          text: '✨ Feature Showcase',
          collapsed: true,
          items: [
            { text: 'Overview', link: '/examples/live/feature-showcase/' },
            { text: 'Transform Gizmo', link: '/examples/live/feature-showcase/transform-gizmo' },
            { text: 'Camera Controls', link: '/examples/live/feature-showcase/camera-controls' },
            { text: 'Visual Overlays', link: '/examples/live/feature-showcase/visual-overlays' },
            { text: 'Configuration Rules', link: '/examples/live/feature-showcase/configuration-rules' },
            { text: 'Cost Analysis', link: '/examples/live/feature-showcase/cost-analysis' },
            { text: 'Timeline Recording', link: '/examples/live/feature-showcase/timeline-recording' },
            { text: 'Custom Plugin', link: '/examples/live/feature-showcase/custom-plugin' },
            { text: 'WebGPU Features', link: '/examples/live/feature-showcase/webgpu-features' },
          ]
        },
        {
          text: '🔍 Debugging & Profiling',
          collapsed: true,
          items: [
            { text: 'Overview', link: '/examples/live/debugging-profiling/' },
            { text: 'Performance Debugging', link: '/examples/live/debugging-profiling/performance-debugging' },
            { text: 'Memory Leak Detection', link: '/examples/live/debugging-profiling/memory-leak-detection' },
            { text: 'Draw Call Batching', link: '/examples/live/debugging-profiling/draw-call-batching' },
            { text: 'Large Scene Optimization', link: '/examples/live/debugging-profiling/large-scene-optimization' },
            { text: 'Animation Profiling', link: '/examples/live/debugging-profiling/animation-profiling' },
            { text: 'Texture Optimization', link: '/examples/live/debugging-profiling/texture-optimization' },
            { text: 'Raycasting Debugger', link: '/examples/live/debugging-profiling/raycasting-debugger' },
            { text: 'Shader Debugging', link: '/examples/live/debugging-profiling/shader-debugging' },
          ]
        },
        {
          text: '🚀 Advanced Techniques',
          collapsed: true,
          items: [
            { text: 'Overview', link: '/examples/live/advanced-techniques/' },
            { text: 'Compute Shaders', link: '/examples/live/advanced-techniques/compute-shaders' },
            { text: 'Custom Render Pipeline', link: '/examples/live/advanced-techniques/custom-render-pipeline' },
            { text: 'Environment Mapping', link: '/examples/live/advanced-techniques/environment-mapping' },
            { text: 'Morph Target Analyzer', link: '/examples/live/advanced-techniques/morph-target-analyzer' },
            { text: 'Shadow Comparison', link: '/examples/live/advanced-techniques/shadow-comparison' },
            { text: 'Skinned Mesh Inspector', link: '/examples/live/advanced-techniques/skinned-mesh-inspector' },
          ]
        },
        {
          text: '📊 Data Visualization',
          collapsed: true,
          items: [
            { text: 'Overview', link: '/examples/live/data-visualization/' },
            { text: '3D Charts', link: '/examples/live/data-visualization/3d-charts' },
            { text: 'Geographic Data', link: '/examples/live/data-visualization/geographic-data' },
            { text: 'Realtime Streaming', link: '/examples/live/data-visualization/realtime-streaming' },
            { text: 'Scientific Viz', link: '/examples/live/data-visualization/scientific-viz' },
          ]
        },
        {
          text: '🎮 Game Development',
          collapsed: true,
          items: [
            { text: 'Overview', link: '/examples/live/game-development/' },
            { text: 'First-Person Shooter', link: '/examples/live/game-development/first-person-shooter' },
            { text: 'Platformer Physics', link: '/examples/live/game-development/platformer-physics' },
            { text: 'Racing Game', link: '/examples/live/game-development/racing-game' },
            { text: 'Top-Down RPG', link: '/examples/live/game-development/top-down-rpg' },
          ]
        },
        {
          text: '🌍 Real-World Scenarios',
          collapsed: true,
          items: [
            { text: 'Overview', link: '/examples/live/real-world-scenarios/' },
            { text: '3D Model Viewer', link: '/examples/live/real-world-scenarios/3d-model-viewer' },
            { text: 'Audio Visualization', link: '/examples/live/real-world-scenarios/audio-visualization' },
            { text: 'Multi-Scene Management', link: '/examples/live/real-world-scenarios/multi-scene-management' },
            { text: 'Particle System', link: '/examples/live/real-world-scenarios/particle-system' },
            { text: 'Physics Inspector', link: '/examples/live/real-world-scenarios/physics-inspector' },
            { text: 'Post Processing', link: '/examples/live/real-world-scenarios/post-processing' },
            { text: 'Procedural Generation', link: '/examples/live/real-world-scenarios/procedural-generation' },
            { text: 'VR/XR Debugging', link: '/examples/live/real-world-scenarios/vr-xr-debugging' },
          ]
        },
        {
          text: '📖 Documentation',
          collapsed: true,
          items: [
            { text: 'Code Examples', link: '/examples/code-examples' },
            { text: 'Framework Integration Guide', link: '/examples/framework-integration' },
            { text: 'Feature Showcase Guide', link: '/examples/feature-showcase' },
            { text: 'Debugging Examples', link: '/examples/debugging-examples' },
            { text: 'Game Development Guide', link: '/examples/game-development' },
            { text: 'Real-World Scenarios Guide', link: '/examples/real-world-scenarios' },
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
