// Simple static 404 - no imports to avoid SSR issues
export const dynamic = 'force-static';
export const dynamicParams = false;

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0a0a0a',
      color: '#fff',
      padding: '20px',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h1 style={{ fontSize: '80px', fontWeight: 'bold', marginBottom: '16px' }}>404</h1>
      <p style={{ fontSize: '24px', color: '#888', marginBottom: '32px' }}>Page not found</p>
      <a
        href="/"
        style={{
          padding: '12px 24px',
          backgroundColor: '#2563eb',
          color: '#fff',
          borderRadius: '8px',
          textDecoration: 'none',
          fontSize: '16px',
          fontWeight: '500',
          transition: 'background-color 0.2s'
        }}
      >
        Go back home
      </a>
    </div>
  );
}
