# Search Configuration

3Lens documentation uses VitePress's built-in search functionality. This document explains the search configuration and how to upgrade to Algolia DocSearch if needed.

## Current Setup: Local Search

The documentation site uses VitePress's built-in local search powered by [MiniSearch](https://lucaong.github.io/minisearch/). This provides:

- **Zero external dependencies** - Works completely offline
- **Fast indexing** - Index is built at build time
- **Fuzzy matching** - Finds results even with typos
- **Prefix search** - Matches partial words
- **Relevance boosting** - Titles rank higher than body text

### Configuration

The search is configured in `.vitepress/config.ts`:

```ts
search: {
  provider: 'local',
  options: {
    detailedView: true,
    miniSearch: {
      searchOptions: {
        fuzzy: 0.2,        // Allow 20% character difference
        prefix: true,       // Match word prefixes
        boost: {
          title: 4,         // Titles are 4x more important
          text: 2,          // Body text is 2x
          titles: 1         // Section headers
        }
      }
    }
  }
}
```

### Search Shortcuts

- **`Ctrl+K`** or **`/`** - Open search dialog
- **`↑`** **`↓`** - Navigate results
- **`Enter`** - Go to selected result
- **`Esc`** - Close search

## Upgrading to Algolia DocSearch

For larger documentation sites with thousands of pages, [Algolia DocSearch](https://docsearch.algolia.com/) provides:

- Faster search on large sites
- Advanced ranking algorithms
- Search analytics
- Hosted infrastructure

### When to Upgrade

Consider Algolia DocSearch when:
- Documentation exceeds 500+ pages
- Local search becomes slow
- You need search analytics
- Users report search quality issues

### Setup Instructions

1. **Apply for DocSearch** (free for open-source projects):
   - Visit [docsearch.algolia.com/apply](https://docsearch.algolia.com/apply/)
   - Submit your documentation URL
   - Wait for approval (usually 1-2 weeks)

2. **Receive credentials** from Algolia:
   ```
   appId: 'YOUR_APP_ID'
   apiKey: 'YOUR_SEARCH_API_KEY'  // Public search-only key
   indexName: '3lens'
   ```

3. **Update VitePress config**:
   ```ts
   // .vitepress/config.ts
   export default defineConfig({
     themeConfig: {
       search: {
         provider: 'algolia',
         options: {
           appId: 'YOUR_APP_ID',
           apiKey: 'YOUR_SEARCH_API_KEY',
           indexName: '3lens',
           
           // Optional: Customize search behavior
           searchParameters: {
             facetFilters: ['language:en', 'version:v1']
           },
           
           // Optional: Localization
           locales: {
             root: {
               placeholder: 'Search documentation...',
               translations: {
                 button: {
                   buttonText: 'Search',
                   buttonAriaLabel: 'Search'
                 },
                 modal: {
                   searchBox: {
                     resetButtonTitle: 'Clear',
                     cancelButtonText: 'Cancel'
                   },
                   footer: {
                     selectText: 'to select',
                     navigateText: 'to navigate',
                     closeText: 'to close'
                   }
                 }
               }
             }
           }
         }
       }
     }
   })
   ```

4. **Store credentials securely**:
   
   For CI/CD, use environment variables:
   ```ts
   search: {
     provider: 'algolia',
     options: {
       appId: process.env.ALGOLIA_APP_ID,
       apiKey: process.env.ALGOLIA_API_KEY,
       indexName: process.env.ALGOLIA_INDEX_NAME || '3lens'
     }
   }
   ```

5. **Configure crawler** (if self-hosting):
   
   Create `algolia.config.json`:
   ```json
   {
     "index_name": "3lens",
     "start_urls": ["https://3lens.dev/"],
     "selectors": {
       "lvl0": ".VPContent h1",
       "lvl1": ".VPContent h2",
       "lvl2": ".VPContent h3",
       "lvl3": ".VPContent h4",
       "text": ".VPContent p, .VPContent li, .VPContent td"
     }
   }
   ```

## Troubleshooting

### Local search not finding results

1. **Rebuild the site** - Index is generated at build time:
   ```bash
   pnpm docs:build
   ```

2. **Check content** - Ensure pages have proper frontmatter and headings

3. **Clear cache**:
   ```bash
   rm -rf docs/.vitepress/cache
   pnpm docs:build
   ```

### Search is slow

1. **Reduce indexed content** - Exclude large auto-generated pages:
   ```ts
   search: {
     provider: 'local',
     options: {
       exclude: (relativePath) => {
         return relativePath.includes('api/reference/')
       }
     }
   }
   ```

2. **Consider Algolia** for sites with 500+ pages

### Algolia not updating

1. **Check crawler schedule** - DocSearch crawls weekly by default
2. **Trigger manual crawl** in Algolia dashboard
3. **Verify robots.txt** allows Algolia crawler

## See Also

- [VitePress Search Documentation](https://vitepress.dev/reference/default-theme-search)
- [Algolia DocSearch Documentation](https://docsearch.algolia.com/docs/what-is-docsearch)
- [MiniSearch Options](https://lucaong.github.io/minisearch/classes/MiniSearch.html)
