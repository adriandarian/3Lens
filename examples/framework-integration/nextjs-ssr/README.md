# 3Lens Next.js SSR Example

This example demonstrates how to integrate 3Lens devtools with a Next.js application, handling server-side rendering (SSR) considerations for Three.js.

## The SSR Challenge

Three.js and WebGL cannot run on the server because they require access to the DOM and browser APIs. This example shows the proper patterns for:

- **Dynamic imports** with `ssr: false` to load 3D components client-only
- **`'use client'` directive** for React Server Components compatibility
- **Loading states** while the 3D scene initializes
- **Hydration** without errors

## Getting Started

```bash
# From the monorepo root
pnpm install
pnpm --filter @3lens/example-nextjs-ssr dev
```

Then open http://localhost:3008 in your browser.

## Code Structure

```
src/
├── app/
│   ├── layout.tsx      # Root layout with metadata
│   ├── page.tsx        # Home page with dynamic import
│   └── globals.css     # Global styles
└── components/
    ├── Scene3D.tsx     # Main 3D scene (client-only)
    ├── RotatingBox.tsx # Animated box
    ├── AnimatedSphere.tsx # Bouncing sphere
    ├── TorusGroup.tsx  # Orbital toruses
    ├── Ground.tsx      # Ground plane
    ├── Lights.tsx      # Scene lighting
    ├── InfoPanel.tsx   # Metrics display
    └── index.ts        # Component exports
```

## Key SSR Patterns

### 1. Dynamic Import with SSR Disabled

```tsx
// app/page.tsx
import dynamic from 'next/dynamic';

const Scene3D = dynamic(() => import('@/components/Scene3D'), {
  ssr: false,  // Disable server-side rendering
  loading: () => <LoadingSpinner />,  // Show while loading
});

export default function Home() {
  return <Scene3D />;
}
```

### 2. Use Client Directive

All components using Three.js must have the `'use client'` directive:

```tsx
// components/RotatingBox.tsx
'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export function RotatingBox() {
  // This code only runs in the browser
}
```

### 3. Client-Side Check

Double-check we're on the client before rendering WebGL:

```tsx
'use client';

import { useState, useEffect } from 'react';

export default function Scene3D() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return <Canvas>...</Canvas>;
}
```

### 4. Next.js Configuration

Configure `next.config.js` for Three.js compatibility:

```js
const nextConfig = {
  // Transpile workspace packages
  transpilePackages: ['@3lens/core', '@3lens/overlay', 'three'],
  
  // Handle canvas for SSR
  webpack: (config) => {
    config.externals = [...(config.externals || []), { canvas: 'canvas' }];
    return config;
  },
};
```

## Common SSR Errors and Solutions

### Error: `window is not defined`

**Solution:** Use dynamic import with `ssr: false` or check for window:

```tsx
if (typeof window === 'undefined') return null;
```

### Error: `document is not defined`

**Solution:** Same as above - ensure code runs client-side only.

### Error: Hydration mismatch

**Solution:** Use `useEffect` to set client-side state:

```tsx
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
if (!mounted) return <ServerFallback />;
```

## Integration with 3Lens

### Using React Bridge

```tsx
'use client';

import { ThreeLensProvider, ThreeLensCanvas } from '@3lens/react-bridge';

export default function Scene3D() {
  return (
    <ThreeLensProvider appName="My Next.js App">
      <ThreeLensCanvas>
        {/* Your scene */}
      </ThreeLensCanvas>
    </ThreeLensProvider>
  );
}
```

### Manual Probe Setup

```tsx
'use client';

import { useEffect, useRef } from 'react';
import { createProbe } from '@3lens/core';
import { bootstrapOverlay } from '@3lens/overlay';

export default function Scene3D() {
  const probeRef = useRef(null);

  useEffect(() => {
    // Only runs on client
    probeRef.current = createProbe({ renderer, scene, camera });
    bootstrapOverlay(probeRef.current);
    
    return () => probeRef.current?.dispose();
  }, []);
}
```

## Static Export Considerations

If using `next export` for static sites:

1. All 3D pages work fine (they're client-rendered anyway)
2. No API routes can be used
3. Consider pre-rendering loading states for better SEO

## Dependencies

- `@3lens/core` - Core devtool probe
- `@3lens/overlay` - Floating overlay UI
- `@3lens/react-bridge` - React integration hooks
- `@react-three/fiber` - React renderer for Three.js
- `@react-three/drei` - R3F helpers
- `next` - Next.js framework
- `react` / `react-dom` - React
- `three` - Three.js library

