'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function LoginPage() {
  const router = useRouter();
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

      // Store in localStorage for quick frontend state
      localStorage.setItem('worklance_user', JSON.stringify(data.user));
      router.push('/jobs');
      router.refresh();
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
    <div style={{ minHeight: '100vh', background: 'var(--bg-soft)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* LOGIN CARD */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
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
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div className="eyebrow" style={{ justifyContent: 'center' }}>Welcome Back</div>
            <h2 style={{ fontSize: '26px', marginBottom: '8px' }}>Log in to Worklance</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Access your jobs, resume, applications & HR contacts</p>
          </div>

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
                  fontSize: '14.5px',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, marginBottom: '6px' }}>Password</label>
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
                  fontSize: '14.5px',
                  outline: 'none',
                }}
              />
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary btn-lg" style={{ marginTop: '8px', width: '100%' }}>
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          {/* DEMO ACCOUNTS QUICK TEST */}
          <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--line)', textAlign: 'center' }}>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '10px' }}>Quick Demo Login (Sample Data):</p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => handleQuickSeedLogin('seeker')}
                className="btn btn-outline"
                style={{ fontSize: '12px', padding: '6px 12px' }}
              >
                Demo Job Seeker
              </button>
              <button
                type="button"
                onClick={() => handleQuickSeedLogin('recruiter')}
                className="btn btn-outline"
                style={{ fontSize: '12px', padding: '6px 12px' }}
              >
                Demo Recruiter
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
