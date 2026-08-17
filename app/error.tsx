'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled runtime error:', error);
  }, [error]);

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px' }}>
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E4E4E7',
            borderRadius: '24px',
            padding: '48px 40px',
            maxWidth: '520px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: '#000000',
              color: '#FFFFFF',
              fontSize: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}
          >
            !
          </div>

          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#000000', marginBottom: '12px', letterSpacing: '-0.02em' }}>
            Something went wrong
          </h1>

          <p style={{ color: '#71717A', fontSize: '14px', lineHeight: 1.6, marginBottom: '28px' }}>
            An unexpected error occurred while rendering this page. You can try refreshing or returning to the dashboard.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button onClick={() => reset()} className="btn btn-primary" style={{ padding: '10px 22px', fontSize: '13.5px', borderRadius: '100px' }}>
              Try Again
            </button>
            <Link href="/" className="btn btn-outline" style={{ padding: '10px 22px', fontSize: '13.5px', borderRadius: '100px' }}>
              Go to Home
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
