export default function Loading() {
  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        background: '#FAFAFA',
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          border: '3px solid #E4E4E7',
          borderTopColor: '#000000',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#71717A', letterSpacing: '-0.01em' }}>
        Loading Worklance...
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
