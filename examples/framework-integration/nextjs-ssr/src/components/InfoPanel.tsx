'use client';

interface InfoPanelProps {
  fps: number;
  drawCalls: number;
  triangles: number;
}

export function InfoPanel({ fps, drawCalls, triangles }: InfoPanelProps) {
  return (
    <div className="info-panel">
      <h3>3Lens Next.js SSR</h3>
      <p>FPS: {fps}</p>
      <p>Draw Calls: {drawCalls}</p>
      <p>Triangles: {triangles.toLocaleString()}</p>
      <div className="ssr-note">
        <strong>SSR Note:</strong> This 3D scene is rendered client-side only
        using <code>dynamic import</code> with <code>ssr: false</code>.
      </div>
    </div>
  );
}

