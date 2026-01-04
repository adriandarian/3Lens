# Configuration File Loading

3Lens supports external configuration files for managing probe settings separately from application code. This enables environment-specific configurations, shared team standards, and easier CI/CD integration.

## Overview

```typescript
import { ConfigLoader, createProbe } from '@3lens/core';

// Auto-discover config file
const config = await ConfigLoader.autoLoadConfig();
if (config) {
  const probe = createProbe(config);
}

// Or load from specific path
const config = await ConfigLoader.loadFromFile('./3lens.config.js');
const probe = createProbe(config);
```

## Supported File Formats

3Lens searches for configuration files in the following order:

| Filename | Format | Priority |
|----------|--------|----------|
| `3lens.config.js` | JavaScript (ES modules) | 1 (highest) |
| `3lens.config.ts` | TypeScript | 2 |
| `3lens.config.mjs` | JavaScript (ES modules) | 3 |
| `.3lens.config.js` | JavaScript (hidden file) | 4 |

## Configuration File Examples

### JavaScript (3lens.config.js)

```javascript
/** @type {import('@3lens/core').ProbeConfig} */
export default {
  appName: 'My 3D Application',
  env: process.env.NODE_ENV || 'development',
  debug: process.env.NODE_ENV !== 'production',

  sampling: {
    frameStats: 'every-frame',
    snapshots: 'on-change',
    gpuTiming: true,
    resourceTracking: true,
  },

  rules: {
    maxDrawCalls: 1000,
    maxTriangles: 500000,
    maxFrameTimeMs: 16.67,
    maxTextures: 100,
    maxTextureMemory: 256 * 1024 * 1024,
    maxGpuMemory: 512 * 1024 * 1024,
    
    custom: [
      {
        id: 'project-specific',
        name: 'Project Specific Check',
        check: (stats) => ({
          passed: stats.drawCalls < 500,
          message: `Draw calls: ${stats.drawCalls}/500`,
        }),
      },
    ],
  },

  tags: {
    team: 'graphics',
    project: 'product-viewer',
  },
};
```

### TypeScript (3lens.config.ts)

```typescript
import type { ProbeConfig, CustomRule } from '@3lens/core';

const customRules: CustomRule[] = [
  {
    id: 'mobile-budget',
    name: 'Mobile Performance Budget',
    check: (stats) => {
      const issues: string[] = [];
      if (stats.drawCalls > 100) issues.push('Too many draw calls');
      if (stats.triangles > 100000) issues.push('Too many triangles');
      
      return {
        passed: issues.length === 0,
        message: issues.join('; ') || 'Within budget',
        severity: issues.length > 1 ? 'error' : 'warning',
      };
    },
  },
];

const config: ProbeConfig = {
  appName: 'Product Configurator',
  env: process.env.NODE_ENV as 'development' | 'production',
  debug: process.env.DEBUG === 'true',

  sampling: {
    frameStats: process.env.NODE_ENV === 'production' ? 60 : 'every-frame',
    snapshots: process.env.NODE_ENV === 'production' ? 'manual' : 'on-change',
    gpuTiming: process.env.NODE_ENV !== 'production',
    resourceTracking: true,
  },

  rules: {
    maxDrawCalls: 1000,
    maxTriangles: 500000,
    maxFrameTimeMs: 16.67,
    custom: customRules,
  },

  tags: {
    version: process.env.APP_VERSION || '0.0.0',
    commit: process.env.GIT_SHA || 'unknown',
  },
};

export default config;
```

### Environment-Specific Configs

```javascript
// 3lens.config.js
const baseConfig = {
  appName: 'MyApp',
  sampling: {
    resourceTracking: true,
  },
};

const envConfigs = {
  development: {
    ...baseConfig,
    debug: true,
    sampling: {
      ...baseConfig.sampling,
      frameStats: 'every-frame',
      snapshots: 'on-change',
      gpuTiming: true,
    },
    rules: {
      maxDrawCalls: 2000,
      maxTriangles: 1000000,
      maxFrameTimeMs: 33.33,
    },
  },

  staging: {
    ...baseConfig,
    debug: false,
    sampling: {
      ...baseConfig.sampling,
      frameStats: 10,
      snapshots: 'on-change',
      gpuTiming: false,
    },
    rules: {
      maxDrawCalls: 1000,
      maxTriangles: 500000,
      maxFrameTimeMs: 16.67,
    },
  },

  production: {
    ...baseConfig,
    debug: false,
    sampling: {
      ...baseConfig.sampling,
      frameStats: 'on-demand',
      snapshots: 'manual',
      gpuTiming: false,
    },
    rules: {
      maxDrawCalls: 500,
      maxTriangles: 250000,
      maxFrameTimeMs: 16.67,
    },
  },
};

export default envConfigs[process.env.NODE_ENV] || envConfigs.development;
```

## ConfigLoader API

### loadFromFile

Load configuration from a specific file path.

```typescript
static async loadFromFile(filePath: string): Promise<ProbeConfig>
```

**Parameters:**
- `filePath`: Path to the configuration file

**Returns:** Promise resolving to the configuration object

**Example:**
```typescript
import { ConfigLoader, createProbe } from '@3lens/core';

try {
  const config = await ConfigLoader.loadFromFile('./config/3lens.config.js');
  const probe = createProbe(config);
} catch (error) {
  console.error('Failed to load config:', error);
  // Use defaults
  const probe = createProbe({ appName: 'MyApp' });
}
```

### autoLoadConfig

Automatically discover and load a configuration file.

```typescript
static async autoLoadConfig(): Promise<ProbeConfig | null>
```

**Returns:** Promise resolving to configuration or `null` if not found

**Search Order:**
1. `./3lens.config.js`
2. `./3lens.config.ts`
3. `./3lens.config.mjs`
4. `./.3lens.config.js`

**Example:**
```typescript
import { ConfigLoader, createProbe } from '@3lens/core';

const config = await ConfigLoader.autoLoadConfig();

const probe = createProbe(config ?? { appName: 'MyApp' });
```

### validateConfig

Validate a configuration object.

```typescript
static validateConfig(config: unknown): ConfigValidationResult
```

**Parameters:**
- `config`: Configuration object to validate

**Returns:** Validation result with errors and warnings

```typescript
interface ConfigValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
```

**Example:**
```typescript
import { ConfigLoader } from '@3lens/core';

const config = {
  appName: 'MyApp',
  rules: {
    maxDrawCalls: -100, // Invalid
  },
};

const result = ConfigLoader.validateConfig(config);
console.log(result);
// {
//   valid: true,  // No hard errors
//   errors: [],
//   warnings: ['rules.maxDrawCalls should be positive']
// }
```

### generateConfigFileContent

Generate a configuration file template.

```typescript
generateConfigFileContent(): string
```

**Returns:** JavaScript configuration file content as a string

**Example:**
```typescript
const probe = createProbe({
  appName: 'MyApp',
  rules: { maxDrawCalls: 500 },
});

const configContent = probe.generateConfigFileContent();
console.log(configContent);
// /**
//  * 3Lens Configuration
//  * ...
//  */
// export default { ... };
```

## Configuration Validation

### Validation Rules

| Field | Validation | Severity |
|-------|------------|----------|
| `appName` | Required, must be string | Error |
| `env` | Should be string | Warning |
| `debug` | Should be boolean | Warning |
| `rules.*` | Numeric values should be positive | Warning |
| `rules.custom[].id` | Required string | Error |
| `rules.custom[].name` | Required string | Error |
| `rules.custom[].check` | Required function | Error |
| `sampling.frameStats` | Must be valid value | Warning |
| `sampling.snapshots` | Must be valid value | Warning |
| `sampling.gpuTiming` | Should be boolean | Warning |

### Validation Example

```typescript
import { ConfigLoader } from '@3lens/core';

// Load and validate
const config = await ConfigLoader.loadFromFile('./3lens.config.js');
const validation = ConfigLoader.validateConfig(config);

if (!validation.valid) {
  console.error('Configuration errors:');
  validation.errors.forEach(err => console.error(`  ❌ ${err}`));
  throw new Error('Invalid configuration');
}

if (validation.warnings.length > 0) {
  console.warn('Configuration warnings:');
  validation.warnings.forEach(warn => console.warn(`  ⚠️ ${warn}`));
}
```

## Framework Integration

### Vite

```javascript
// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  // 3lens.config.js will be auto-loaded from project root
});
```

### Webpack

```javascript
// webpack.config.js
const path = require('path');

module.exports = {
  resolve: {
    alias: {
      // Ensure config file is resolvable
      '3lens.config': path.resolve(__dirname, '3lens.config.js'),
    },
  },
};
```

### Next.js

```typescript
// lib/threelens.ts
import { ConfigLoader, createProbe, DevtoolProbe } from '@3lens/core';

let probe: DevtoolProbe | null = null;

export async function getProbe(): Promise<DevtoolProbe> {
  if (probe) return probe;

  // Only run on client
  if (typeof window === 'undefined') {
    throw new Error('3Lens probe requires browser environment');
  }

  const config = await ConfigLoader.autoLoadConfig();
  probe = createProbe(config ?? { appName: 'NextApp' });
  return probe;
}
```

### React (Create React App)

```javascript
// src/setupThreeLens.js
import { ConfigLoader, createProbe } from '@3lens/core';

export async function initProbe() {
  // CRA doesn't support auto-loading, use inline config
  return createProbe({
    appName: process.env.REACT_APP_NAME || 'ReactApp',
    env: process.env.NODE_ENV,
    debug: process.env.NODE_ENV === 'development',
  });
}
```

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/performance.yml
name: Performance Check

on: [push, pull_request]

jobs:
  perf-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run performance tests
        run: npm run test:performance
        env:
          THREELENS_CONFIG: ./config/ci.3lens.config.js
```

### CI Configuration File

```javascript
// config/ci.3lens.config.js
export default {
  appName: 'CI-Performance-Test',
  env: 'ci',
  debug: false,

  sampling: {
    frameStats: 'every-frame',
    snapshots: 'every-frame', // Validate every frame
    gpuTiming: false, // Not available in headless
    resourceTracking: true,
  },

  rules: {
    // Strict thresholds for CI
    maxDrawCalls: 100,
    maxTriangles: 50000,
    maxFrameTimeMs: 10,
    maxTextures: 20,
    maxTextureMemory: 32 * 1024 * 1024,
  },

  tags: {
    ci: 'true',
    commit: process.env.GITHUB_SHA,
    branch: process.env.GITHUB_REF,
    workflow: process.env.GITHUB_WORKFLOW,
  },
};
```

## Exporting Configuration

Export the current runtime configuration:

```typescript
const probe = createProbe({
  appName: 'MyApp',
  rules: { maxDrawCalls: 500 },
});

// Modify at runtime
probe.updateThresholds({ maxTriangles: 750000 });
probe.addCustomRule({
  id: 'runtime-rule',
  name: 'Runtime Rule',
  check: () => ({ passed: true }),
});

// Export current config
const currentConfig = probe.exportConfig();
console.log(currentConfig);
// {
//   appName: 'MyApp',
//   rules: {
//     maxDrawCalls: 500,
//     maxTriangles: 750000,
//     custom: [{ id: 'runtime-rule', name: 'Runtime Rule', ... }]
//   }
// }

// Generate config file
const fileContent = probe.generateConfigFileContent();
// Write to file if needed
```

## Best Practices

### 1. Version Control Your Config

```bash
# Include in version control
git add 3lens.config.js

# Add environment-specific configs
git add config/dev.3lens.config.js
git add config/prod.3lens.config.js
```

### 2. Use TypeScript for Type Safety

```typescript
// 3lens.config.ts provides:
// - Type checking for config options
// - Autocomplete in your editor
// - Compile-time validation
import type { ProbeConfig } from '@3lens/core';

const config: ProbeConfig = {
  appName: 'TypedApp',
  // Typos caught at compile time!
};

export default config;
```

### 3. Environment Variables

```javascript
// 3lens.config.js
export default {
  appName: process.env.APP_NAME || 'DefaultApp',
  env: process.env.NODE_ENV || 'development',
  debug: process.env.DEBUG === 'true',
  
  rules: {
    maxDrawCalls: parseInt(process.env.MAX_DRAW_CALLS || '1000', 10),
  },
  
  tags: {
    version: process.env.npm_package_version,
    commit: process.env.GIT_SHA,
  },
};
```

### 4. Shared Team Configuration

```javascript
// packages/3lens-config/index.js (shared npm package)
export const baseConfig = {
  sampling: {
    frameStats: 'every-frame',
    gpuTiming: true,
  },
  rules: {
    maxDrawCalls: 500,
    maxTriangles: 250000,
  },
};

// App's 3lens.config.js
import { baseConfig } from '@mycompany/3lens-config';

export default {
  ...baseConfig,
  appName: 'MyApp',
  rules: {
    ...baseConfig.rules,
    maxDrawCalls: 750, // Override for this app
  },
};
```

## Type Imports

```typescript
import {
  ConfigLoader,
  type ProbeConfig,
  type ConfigValidationResult,
} from '@3lens/core';
```

## Related

- [ProbeConfig](./probe-config) - Configuration interface reference
- [Performance Thresholds](./performance-thresholds) - Default thresholds
- [SamplingConfig](./sampling-config) - Sampling options
- [Custom Rules](./custom-rules) - Custom rule definitions
- [CI Integration Guide](/guides/ci-integration) - CI/CD setup guide
