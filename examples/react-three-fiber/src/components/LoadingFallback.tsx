import { Html } from '@react-three/drei';

/**
 * Loading Fallback Component
 * 
 * Displayed while scene assets are loading.
 */
export function LoadingFallback() {
  return (
    <Html center>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        color: 'white',
        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(255,255,255,0.1)',
          borderTopColor: '#4ecdc4',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <span>Loading scene...</span>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </Html>
  );
}

