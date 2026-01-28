# Contract: Loading

## Purpose

Define how 3Lens gets loaded into an application.
Loading must support multiple modes without users reinventing patterns.

## Loading Modes (5 Supported)

### Mode 1: Dev-only Import (Recommended)

User imports behind environment flag for clean prod bundles.

```typescript
if (import.meta.env.DEV) {
  const { bootstrap3Lens } = await import("@3lens/devtools/bootstrap");
  bootstrap3Lens();
}
```

**Characteristics:**
- Best fidelity (full integration)
- Clean prod bundles (tree-shaken)
- Requires code change
- Works with all bundlers

### Mode 2: URL Toggle

Enable via URL parameter without rebuilding.

```typescript
const enabled =
  import.meta.env.DEV &&
  (new URLSearchParams(location.search).has("3lens") ||
   localStorage.getItem("3lens") === "1");

if (enabled) {
  const { bootstrap3Lens } = await import("@3lens/devtools/bootstrap");
  bootstrap3Lens();
}
```

**Parameters:**
- `?3lens=1` - Enable for this session
- `?3lens=0` - Disable
- `?3lens=persist` - Enable and save to localStorage

### Mode 3: Global Hook Loader

Drop-in snippet for demos and quick integration.

```html
<script>
  window.__3LENS__ = { enabled: true, ui: 'overlay' };
</script>
<script type="module" src="https://unpkg.com/@3lens/devtools/loader.js"></script>
```

**Characteristics:**
- No build changes needed
- Works with static sites
- Potential CSP issues

### Mode 4: Vite Plugin

Zero app-code changes for Vite projects.

```typescript
// vite.config.ts
import { threeLens } from "@3lens/vite-plugin";

export default defineConfig({
  plugins: [threeLens()],
});
```

**Characteristics:**
- Lowest friction for Vite users
- Dev-only by default
- Transparent injection

### Mode 5: Browser Extension

Attach to pages without source access.

**Characteristics:**
- Works on published sites
- Limited fidelity without runtime hooks
- "Connected" mode when runtime present
- "Limited" mode when not

## Bootstrap API

```typescript
interface BootstrapOptions {
  enabled?: boolean;              // Override enable check
  ui?: 'overlay' | 'dock' | 'window';
  autoDiscover?: boolean;         // Auto-detect contexts
  persist?: boolean;              // Save enabled state to localStorage
  contextNameStrategy?: 'canvasId' | 'containerSelector' | 'manual';
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  csp?: CSPOptions;
}

interface CSPOptions {
  styleNonce?: string;            // Nonce for style injection
  cssUrl?: string;                // External CSS URL
  safeMode?: boolean;             // Avoid all injection
}

function bootstrap3Lens(options?: BootstrapOptions): Promise<Lens>;
```

## Invariants (MUST ALWAYS HOLD)

1. **Bootstrap is idempotent:**
   - Calling `bootstrap3Lens()` twice does not create duplicate UIs.
   - Second call returns same Lens instance.

2. **Never enables in production unless explicit:**
   - Default behavior checks for dev environment.
   - Production enable requires `enabled: true` explicitly.

3. **Supports URL toggle:**
   - `?3lens=1` enables in any mode.
   - Can be disabled with `?3lens=0`.

4. **Supports plugin-based injection:**
   - Vite plugin and other build tools supported.

5. **Safe in multi-bundle scenarios:**
   - Monorepos with multiple entry points don't create duplicates.
   - Singleton pattern enforced via global registry.

## Environment Detection

```typescript
function isDevEnvironment(): boolean {
  // Check Vite
  if (typeof import.meta?.env?.DEV === 'boolean') {
    return import.meta.env.DEV;
  }
  // Check webpack
  if (typeof process?.env?.NODE_ENV === 'string') {
    return process.env.NODE_ENV !== 'production';
  }
  // Check hostname
  if (typeof location !== 'undefined') {
    return location.hostname === 'localhost' || 
           location.hostname === '127.0.0.1';
  }
  return false;
}
```

## Degradation Rules

- If CSP blocks style injection:
  - Fall back to external CSS or unstyled mode.
  - Emit warning explaining limitation.
- If popup blocked (window mode):
  - Show instructions to allow popups.
- If dynamic import fails:
  - Emit error with troubleshooting steps.

## Acceptance Tests

- **Idempotent:**
  - Call `bootstrap3Lens()` twice -> same instance returned.
- **Prod safety:**
  - No bootstrap without explicit enable in production build.
- **URL toggle:**
  - `?3lens=1` enables, `?3lens=0` disables.
- **CSP fallback:**
  - With CSP blocking, falls back gracefully with warning.
- **Multi-bundle:**
  - Two bundles calling bootstrap -> single UI instance.

## Anti-goals

- Loading devtools in production by default
- Requiring users to understand internals to load
- Breaking on CSP without fallback
- Multiple UI instances from multiple entry points
- Complex configuration for common cases
