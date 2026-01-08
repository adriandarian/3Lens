---
title: Next.js SSR
description: Use 3Lens with Next.js and server-side rendering
---

# Next.js SSR

Use 3Lens with Next.js and handle server-side rendering considerations.

<ExampleViewer
  src="/examples/framework-integration/nextjs-ssr/"
  title="Next.js SSR Demo"
  description="Properly integrate 3Lens with Next.js, handling SSR, dynamic imports, and app router."
  difficulty="intermediate"
  github-url="https://github.com/adriandarian/3Lens/tree/main/examples/framework-integration/nextjs-ssr"
/>

## Features Demonstrated

- **Dynamic Imports**: Client-only loading for 3Lens
- **App Router Support**: Works with Next.js 13+ app router
- **SSR Safety**: No server-side rendering issues
- **Suspense Integration**: Loading states

## Usage

```tsx
'use client';

import dynamic from 'next/dynamic';

const ThreeLensProvider = dynamic(
  () => import('@3lens/react-bridge').then(m => m.ThreeLensProvider),
  { ssr: false }
);

export default function Page() {
  return (
    <ThreeLensProvider>
      <Canvas>
        <Scene />
      </Canvas>
    </ThreeLensProvider>
  );
}
```

## Related Examples

- [React Three Fiber](./react-three-fiber) - React integration
- [Vanilla Three.js](./vanilla-threejs) - Basic setup
