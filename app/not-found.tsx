'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function NotFound() {
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
            maxWidth: '500px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
          }}
        >
          <div
            style={{
              fontSize: '64px',
              fontWeight: 900,
              color: '#000000',
              lineHeight: 1,
              marginBottom: '16px',
              letterSpacing: '-0.04em',
            }}
          >
            404
          </div>

          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#000000', marginBottom: '12px', letterSpacing: '-0.02em' }}>
            Page Not Found
          </h1>

          <p style={{ color: '#71717A', fontSize: '14px', lineHeight: 1.6, marginBottom: '28px' }}>
            The career resource or page you are looking for does not exist or has been relocated.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link href="/jobs" className="btn btn-primary" style={{ padding: '10px 22px', fontSize: '13.5px', borderRadius: '100px' }}>
              Explore Job Hub
            </Link>
            <Link href="/" className="btn btn-outline" style={{ padding: '10px 22px', fontSize: '13.5px', borderRadius: '100px' }}>
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
