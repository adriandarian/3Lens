// https://vitepress.dev/guide/custom-theme
// @ts-ignore - vue types provided by vitepress
import { h, onMounted } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { inject } from '@vercel/analytics'
import './styles/custom.css'

// Version system components
// @ts-ignore - Vue SFC types
import VersionSwitcher from './components/VersionSwitcher.vue'
// @ts-ignore - Vue SFC types
import VersionWarning from './components/VersionWarning.vue'
// @ts-ignore - Vue SFC types
import ExampleViewer from './components/ExampleViewer.vue'

// Custom components (uncomment as you create them)
// import HomeFeatures from './components/HomeFeatures.vue'
// import PackageBadge from './components/PackageBadge.vue'
// import ApiTable from './components/ApiTable.vue'
// import DemoFrame from './components/DemoFrame.vue'

export default {
  extends: DefaultTheme,
  
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // Custom slots for extending the default theme
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
      
      // Version warning banner for old docs
      'layout-top': () => h(VersionWarning),
      
      // 'home-hero-before': () => h(CustomHeroBanner),
      // 'home-features-after': () => h(HomeFeatures),
      // 'aside-outline-before': () => h(SponsorBanner),
      // 'doc-before': () => h(DocHeader),
      // 'doc-footer-before': () => h(DocFeedback),
    })
  },
  
  enhanceApp({ app, router, siteData }) {
    // Initialize Vercel Analytics
    if (typeof window !== 'undefined') {
      inject()
    }
    
    // Register version components globally
    app.component('VersionSwitcher', VersionSwitcher)
    
    // Register example viewer component
    app.component('ExampleViewer', ExampleViewer)
    
    // Register other global components
    // app.component('PackageBadge', PackageBadge)
    // app.component('ApiTable', ApiTable)
    // app.component('DemoFrame', DemoFrame)
  }
} satisfies Theme
