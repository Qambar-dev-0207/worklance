'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function RegisterPage() {
  const router = useRouter();
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
      router.push(role === 'recruiter' ? '/jobs/post' : '/jobs');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-soft)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
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
            <div className="eyebrow" style={{ justifyContent: 'center' }}>Join Worklance</div>
            <h2 style={{ fontSize: '26px', marginBottom: '8px' }}>Create Your Account</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Choose your account type to get started</p>
          </div>

          {/* ROLE SELECTOR */}
          <div className="tabs" style={{ width: '100%', marginBottom: '24px' }}>
            <button
              type="button"
              className={`tab-btn ${role === 'seeker' ? 'active' : ''}`}
              style={{ flex: 1 }}
              onClick={() => setRole('seeker')}
            >
              Job Seeker
            </button>
            <button
              type="button"
              className={`tab-btn ${role === 'recruiter' ? 'active' : ''}`}
              style={{ flex: 1 }}
              onClick={() => setRole('recruiter')}
            >
              Recruiter / HR
            </button>
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
              <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, marginBottom: '6px' }}>Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Riya Sharma"
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
              <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, marginBottom: '6px' }}>Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@worklance.com"
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
                placeholder="At least 6 characters"
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

            {role === 'recruiter' ? (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, marginBottom: '6px' }}>Company Name</label>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Zenith Tech"
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
                  <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, marginBottom: '6px' }}>Designation / Title</label>
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
                      fontSize: '14.5px',
                      outline: 'none',
                    }}
                  />
                </div>
              </>
            ) : (
              <div>
                <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, marginBottom: '6px' }}>Headline / Primary Skill</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Frontend Developer / Final Year Student"
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
            )}

            <button type="submit" disabled={loading} className="btn btn-primary btn-lg" style={{ marginTop: '8px', width: '100%' }}>
              {loading ? 'Creating Account...' : 'Register Account'}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
