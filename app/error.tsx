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
    <div style={{ minHeight: '100vh', background: 'var(--bg-soft)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px' }}>
        <div
          style={{
            background: '#fff',
            border: '1px solid var(--line)',
            borderRadius: '24px',
            padding: '48px 40px',
            maxWidth: '520px',
            width: '100%',
            textAlign: 'center',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#FEE2E2',
              color: '#EF4444',
              fontSize: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}
          >
            ⚠️
          </div>

          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--navy-deep)', marginBottom: '12px' }}>
            Something went wrong
          </h1>

          <p style={{ color: 'var(--text-muted)', fontSize: '14.5px', lineHeight: 1.6, marginBottom: '28px' }}>
            An unexpected error occurred while rendering this page. Our team has been notified.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button onClick={() => reset()} className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '14px' }}>
              Try Again
            </button>
            <Link href="/" className="btn btn-outline" style={{ padding: '10px 20px', fontSize: '14px' }}>
              Go to Home
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
