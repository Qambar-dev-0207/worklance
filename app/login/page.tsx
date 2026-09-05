'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/jobs';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Login failed');
      }

      // Store in localStorage for fast initial render
      localStorage.setItem('worklance_user', JSON.stringify(data.user));
      
      // Redirect to intended protected page or /jobs
      window.location.href = redirectTarget;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSeedLogin = (role: 'seeker' | 'recruiter') => {
    if (role === 'seeker') {
      setEmail('seeker@worklance.com');
      setPassword('password123');
    } else {
      setEmail('recruiter@worklance.com');
      setPassword('password123');
    }
  };

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid var(--line)',
        borderRadius: '24px',
        padding: '40px',
        width: '100%',
        maxWidth: '440px',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div className="eyebrow" style={{ justifyContent: 'center' }}>Welcome Back</div>
        <h2 style={{ fontSize: '26px', marginBottom: '8px' }}>Log in to Worklance</h2>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Access your jobs, resume builder, applications & HR directory</p>
      </div>

      {searchParams.get('redirect') && (
        <div
          style={{
            background: '#EFF6FF',
            border: '1px solid #BFDBFE',
            color: '#1E40AF',
            padding: '10px 14px',
            borderRadius: '12px',
            fontSize: '13px',
            marginBottom: '18px',
            textAlign: 'center',
            lineHeight: 1.4,
          }}
        >
          🔒 Please log in to access this page.
        </div>
      )}

      {error && (
        <div
          style={{
            background: '#FEE2E2',
            color: '#991B1B',
            padding: '12px 16px',
            borderRadius: '12px',
            fontSize: '13.5px',
            marginBottom: '20px',
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, marginBottom: '6px' }}>Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '12px',
              border: '1px solid var(--line)',
              fontSize: '14px',
              outline: 'none',
            }}
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <label style={{ fontSize: '13.5px', fontWeight: 600 }}>Password</label>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>min. 6 characters</span>
          </div>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '12px',
              border: '1px solid var(--line)',
              fontSize: '14px',
              outline: 'none',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
          style={{ width: '100%', padding: '14px', borderRadius: '100px', marginTop: '8px' }}
        >
          {loading ? 'Authenticating...' : 'Sign in'}
        </button>
      </form>

      {/* QUICK SEED LOGINS */}
      <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--line)' }}>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '10px' }}>
          One-Click Demo Profiles:
        </p>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => handleQuickSeedLogin('seeker')}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              background: 'var(--bg-soft)',
              color: 'var(--navy)',
              border: '1px solid var(--line)',
              cursor: 'pointer',
            }}
          >
            Demo Job Seeker
          </button>
          <button
            type="button"
            onClick={() => handleQuickSeedLogin('recruiter')}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              background: 'var(--bg-soft)',
              color: 'var(--navy)',
              border: '1px solid var(--line)',
              cursor: 'pointer',
            }}
          >
            Demo Recruiter
          </button>
        </div>
      </div>

      <p style={{ textAlign: 'center', fontSize: '13.5px', color: 'var(--text-muted)', marginTop: '24px' }}>
        Don&apos;t have an account?{' '}
        <Link href={`/register${searchParams.get('redirect') ? `?redirect=${encodeURIComponent(searchParams.get('redirect')!)}` : ''}`} style={{ fontWeight: 700, color: 'var(--navy-deep)' }}>
          Create account
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-soft)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <Suspense fallback={<div style={{ padding: '40px', color: '#71717A' }}>Loading login...</div>}>
          <LoginForm />
        </Suspense>
      </div>
      <Footer />
    </div>
  );
}
