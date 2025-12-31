import dynamic from 'next/dynamic';

/**
 * Next.js SSR Page
 * 
 * Three.js and WebGL cannot run on the server, so we use dynamic imports
 * with ssr: false to ensure the 3D scene only renders on the client.
 */

// Dynamic import with SSR disabled for Three.js components
const Scene3D = dynamic(() => import('@/components/Scene3D'), {
  ssr: false,
  loading: () => (
    <div className="loading-container">
      <div className="loading-spinner">
        <div className="spinner" />
        <span>Loading 3D Scene...</span>
      </div>
    </div>
  ),
});

export default function Home() {
  return (
    <main className="app-container">
      <Scene3D />
    </main>
  );
}

