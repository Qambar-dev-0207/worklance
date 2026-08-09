'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function NotFound() {
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
            maxWidth: '500px',
            width: '100%',
            textAlign: 'center',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div
            style={{
              fontSize: '64px',
              fontWeight: 900,
              color: 'var(--orange-2)',
              lineHeight: 1,
              marginBottom: '16px',
            }}
          >
            404
          </div>

          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--navy-deep)', marginBottom: '12px' }}>
            Page Not Found
          </h1>

          <p style={{ color: 'var(--text-muted)', fontSize: '14.5px', lineHeight: 1.6, marginBottom: '28px' }}>
            The career resource or page you are looking for does not exist or has been relocated.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link href="/jobs" className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '14px' }}>
              Explore Job Hub
            </Link>
            <Link href="/" className="btn btn-outline" style={{ padding: '10px 20px', fontSize: '14px' }}>
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
