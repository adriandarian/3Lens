// https://vitepress.dev/guide/custom-theme
import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import './styles/custom.css'

// Version system components
import VersionSwitcher from './components/VersionSwitcher.vue'
import VersionWarning from './components/VersionWarning.vue'

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
    // Register version components globally
    app.component('VersionSwitcher', VersionSwitcher)
    
    // Register other global components
    // app.component('PackageBadge', PackageBadge)
    // app.component('ApiTable', ApiTable)
    // app.component('DemoFrame', DemoFrame)
  }
} satisfies Theme
