'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '';

  const [role, setRole] = useState<'seeker' | 'recruiter'>('seeker');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role, company, title }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Registration failed');
      }

      localStorage.setItem('worklance_user', JSON.stringify(data.user));
      
      const destination = redirectTarget || (role === 'recruiter' ? '/jobs/post' : '/jobs');
      window.location.href = destination;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
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
        maxWidth: '480px',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div className="eyebrow" style={{ justifyContent: 'center' }}>Get Started</div>
        <h2 style={{ fontSize: '26px', marginBottom: '8px' }}>Create your Account</h2>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Join Worklance to discover jobs, hackathons, and build high-ATS resumes</p>
      </div>

      {redirectTarget && (
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
          🔒 Create an account to access this page.
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

      {/* ROLE SELECTOR */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', background: 'var(--bg-soft)', padding: '4px', borderRadius: '12px' }}>
        <button
          type="button"
          onClick={() => setRole('seeker')}
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            background: role === 'seeker' ? '#fff' : 'transparent',
            color: role === 'seeker' ? 'var(--navy-deep)' : 'var(--text-muted)',
            boxShadow: role === 'seeker' ? 'var(--shadow-sm)' : 'none',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          Job Seeker
        </button>
        <button
          type="button"
          onClick={() => setRole('recruiter')}
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            background: role === 'recruiter' ? '#fff' : 'transparent',
            color: role === 'recruiter' ? 'var(--navy-deep)' : 'var(--text-muted)',
            boxShadow: role === 'recruiter' ? 'var(--shadow-sm)' : 'none',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          Recruiter / Employer
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, marginBottom: '6px' }}>Full Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
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
          <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, marginBottom: '6px' }}>Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
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

        {role === 'recruiter' && (
          <>
            <div>
              <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, marginBottom: '6px' }}>Company Name</label>
              <input
                type="text"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Google, Stripe, etc."
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
              <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, marginBottom: '6px' }}>Job Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Talent Acquisition Lead"
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
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
          style={{ width: '100%', padding: '14px', borderRadius: '100px', marginTop: '8px' }}
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <p style={{ textAlign: 'center', fontSize: '13.5px', color: 'var(--text-muted)', marginTop: '20px' }}>
        Already have an account?{' '}
        <Link href={`/login${redirectTarget ? `?redirect=${encodeURIComponent(redirectTarget)}` : ''}`} style={{ fontWeight: 700, color: 'var(--navy-deep)' }}>
          Log in
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-soft)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <Suspense fallback={<div style={{ padding: '40px', color: '#71717A' }}>Loading registration...</div>}>
          <RegisterForm />
        </Suspense>
      </div>
      <Footer />
    </div>
  );
}
