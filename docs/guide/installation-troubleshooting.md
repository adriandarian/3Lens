# Installation Troubleshooting

Having issues getting 3Lens installed or running? This guide covers the most common problems and their solutions.

## Installation Issues

### Package Not Found

**Error:** `npm ERR! 404 Not Found - GET https://registry.npmjs.org/@3lens/core`

**Solutions:**
1. Check that you're using the correct package name (note the `@` scope)
2. Ensure you have network connectivity to npm
3. Try clearing your npm cache:
   ```bash
   npm cache clean --force
   ```
4. If using a private registry, ensure it's configured to fall back to the public npm registry

### Peer Dependency Warnings

**Warning:** `npm WARN peerDependencies: three@^0.150.0 is required`

**Solutions:**
- Install the recommended three.js version:
  ```bash
  npm install three@latest
  ```
- If you need an older version, 3Lens supports three.js 0.140.0+, though some features may be limited

### TypeScript Errors on Install

**Error:** `Cannot find module '@3lens/core' or its corresponding type declarations`

**Solutions:**
1. Ensure TypeScript is configured to find node_modules:
   ```json
   // tsconfig.json
   {
     "compilerOptions": {
       "moduleResolution": "bundler", // or "node"
       "esModuleInterop": true
     }
   }
   ```
2. Restart your TypeScript server (in VS Code: `Cmd+Shift+P` → "TypeScript: Restart TS Server")

### ESM/CJS Module Issues

**Error:** `ERR_REQUIRE_ESM: require() of ES Module not supported`

3Lens is distributed as ESM. If you're using CommonJS:

**Solution 1:** Use dynamic import:
```javascript
async function setupDevtools() {
  const { createProbe } = await import('@3lens/core');
  const { bootstrapOverlay } = await import('@3lens/overlay');
  // ...
}
```

**Solution 2:** Update your project to ESM:
```json
// package.json
{
  "type": "module"
}
```

---

## Runtime Issues

### Overlay Not Appearing

**Symptom:** No UI appears after calling `bootstrapOverlay()`

**Checklist:**
1. ✅ Verify the probe is created and connected:
   ```typescript
   const probe = createProbe({ debug: true }); // Enable debug logging
   console.log('Probe created:', probe);
   
   probe.observeRenderer(renderer);
   probe.observeScene(scene);
   bootstrapOverlay(probe);
   ```

2. ✅ Check the browser console for errors

3. ✅ Ensure `bootstrapOverlay` is called after the DOM is ready:
   ```typescript
   // If using before DOMContentLoaded, wrap in event listener
   document.addEventListener('DOMContentLoaded', () => {
     bootstrapOverlay(probe);
   });
   ```

4. ✅ Try pressing `Ctrl+Shift+D` (or `Cmd+Shift+D` on Mac) - the overlay might be hidden

5. ✅ Check if the overlay container exists:
   ```javascript
   console.log(document.querySelector('#threelens-overlay'));
   ```

6. ✅ Verify no CSS is hiding the overlay:
   ```css
   /* Check for conflicting styles */
   #threelens-overlay {
     display: block !important;
     visibility: visible !important;
   }
   ```

### "Cannot read property 'observeRenderer' of undefined"

**Cause:** The probe wasn't created or `createProbe()` failed.

**Solution:**
```typescript
import { createProbe } from '@3lens/core';

// Make sure createProbe is actually called
const probe = createProbe();

if (!probe) {
  console.error('Failed to create probe');
} else {
  probe.observeRenderer(renderer);
}
```

### No Stats Appearing (0 FPS, 0 Draw Calls)

**Cause:** The probe isn't connected to your render loop.

**Solutions:**

1. Ensure `observeRenderer()` is called BEFORE your render loop starts:
   ```typescript
   probe.observeRenderer(renderer);
   probe.observeScene(scene);
   
   // THEN start the render loop
   function animate() {
     requestAnimationFrame(animate);
     renderer.render(scene, camera);
   }
   animate();
   ```

2. Verify the renderer is the same instance:
   ```typescript
   // ❌ Wrong: Creating new renderer after observation
   probe.observeRenderer(renderer);
   renderer = new THREE.WebGLRenderer(); // New instance!
   
   // ✅ Correct: Use same instance
   const renderer = new THREE.WebGLRenderer();
   probe.observeRenderer(renderer);
   // Use this same renderer throughout
   ```

3. Check that `renderer.render()` is actually being called

### Selection Not Working (Inspect Mode)

**Cause:** Missing THREE reference or scene not observed.

**Solutions:**

1. Provide the THREE namespace:
   ```typescript
   import * as THREE from 'three';
   
   probe.setThreeReference(THREE);
   ```

2. Ensure all scenes are observed:
   ```typescript
   probe.observeScene(mainScene);
   probe.observeScene(uiScene); // Don't forget secondary scenes!
   ```

3. Check that objects are actually in the scene:
   ```javascript
   console.log('Scene children:', scene.children.length);
   ```

---

## Framework-Specific Issues

### React / React Three Fiber

**Issue:** "useThreeLens must be used within ThreeLensProvider"

**Solution:**
```tsx
// Wrap your app or canvas in the provider
import { ThreeLensProvider } from '@3lens/react-bridge';

function App() {
  return (
    <ThreeLensProvider>
      <Canvas>
        {/* Your R3F scene */}
      </Canvas>
    </ThreeLensProvider>
  );
}
```

**Issue:** Stats not updating in R3F

**Solution:**
```tsx
// Use ThreeLensCanvas instead of Canvas for automatic connection
import { ThreeLensCanvas } from '@3lens/react-bridge';

function App() {
  return (
    <ThreeLensProvider>
      <ThreeLensCanvas>
        {/* Auto-connects to renderer and scene */}
      </ThreeLensCanvas>
    </ThreeLensProvider>
  );
}
```

### Vue / TresJS

**Issue:** "useThreeLens must be used within a component with ThreeLensPlugin"

**Solution:**
```typescript
// main.ts
import { createApp } from 'vue';
import { ThreeLensPlugin } from '@3lens/vue-bridge';

const app = createApp(App);
app.use(ThreeLensPlugin);
app.mount('#app');
```

**Issue:** TresJS probe not connecting

**Solution:**
```vue
<script setup>
import { useTresProbe } from '@3lens/vue-bridge';

// Call inside TresCanvas context
const { isConnected } = useTresProbe();
</script>

<template>
  <TresCanvas>
    <!-- useTresProbe auto-connects here -->
  </TresCanvas>
</template>
```

### Angular

**Issue:** "NullInjectorError: No provider for ThreeLensService"

**Solution:**
```typescript
// app.module.ts
import { ThreeLensModule } from '@3lens/angular-bridge';

@NgModule({
  imports: [
    ThreeLensModule.forRoot({
      appName: 'My Angular App'
    })
  ]
})
export class AppModule {}
```

---

## Build Tool Issues

### Vite

**Issue:** "Failed to resolve import '@3lens/core'"

**Solution:**
```typescript
// vite.config.ts
export default defineConfig({
  optimizeDeps: {
    include: ['@3lens/core', '@3lens/overlay']
  }
});
```

### Webpack

**Issue:** "Module not found: Can't resolve '@3lens/core'"

**Solutions:**
1. Check your resolve configuration:
   ```javascript
   // webpack.config.js
   module.exports = {
     resolve: {
       extensions: ['.ts', '.js', '.mjs'],
       mainFields: ['module', 'main']
     }
   };
   ```

2. If using TypeScript, ensure ts-loader or babel handles the files

### Next.js

**Issue:** "window is not defined" (SSR error)

**Solution:** Use dynamic import with SSR disabled:
```tsx
import dynamic from 'next/dynamic';

const ThreeLensCanvas = dynamic(
  () => import('@3lens/react-bridge').then(mod => mod.ThreeLensCanvas),
  { ssr: false }
);
```

---

## Performance Issues

### High Memory Usage

**Symptoms:** Browser memory climbing steadily

**Solutions:**
1. Reduce history buffer size:
   ```typescript
   const probe = createProbe({
     sampling: {
       historyLength: 60, // Reduce from default 120
     }
   });
   ```

2. Increase sampling interval:
   ```typescript
   const probe = createProbe({
     sampling: {
       frameInterval: 2, // Sample every other frame
     }
   });
   ```

### Devtools Causing Frame Drops

**Solutions:**
1. Reduce update frequency:
   ```typescript
   const probe = createProbe({
     sampling: {
       frameInterval: 3, // Less frequent updates
       snapshotInterval: 120, // Less frequent snapshots
     }
   });
   ```

2. Hide the overlay during performance-critical moments:
   ```typescript
   // Temporarily hide during cutscene
   overlay.hide();
   // ... play cutscene ...
   overlay.show();
   ```

---

## Still Having Issues?

If none of these solutions work:

1. **Enable debug mode** for detailed logging:
   ```typescript
   const probe = createProbe({ debug: true });
   ```

2. **Check the browser console** for warnings or errors

3. **Create a minimal reproduction** - often the issue becomes clear when isolating the problem

4. **File an issue** on [GitHub](https://github.com/adriandarian/3Lens/issues) with:
   - Your environment (Node version, browser, bundler)
   - Package versions (`npm list @3lens/core`)
   - Error messages and console output
   - Minimal code to reproduce

## Next Steps

- [Getting Started](/guide/getting-started) - Basic setup guide
- [Configuration](/guide/configuration) - All configuration options
- [First Debugging Session](/guide/first-debugging-session) - Start debugging your scene
