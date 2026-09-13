'use client';

import { useState, Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { isValidEmail } from '@/lib/validation';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, Check, X } from 'lucide-react';
import { toast } from 'sonner';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/jobs';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  const isEmailValid = useMemo(() => isValidEmail(email), [email]);

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 600);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isEmailValid) {
      setError('Please provide a valid email address (e.g. name@company.com)');
      setEmailTouched(true);
      triggerShake();
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      triggerShake();
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid email or password');
      }

      // Store in localStorage for fast initial render
      localStorage.setItem('worklance_user', JSON.stringify(data.user));
      if (data.token) {
        localStorage.setItem('worklance_token', data.token);
      }
      window.dispatchEvent(new Event('worklance-user-updated'));

      toast.success(`Welcome back, ${data.user.name || 'member'}!`, {
        description: 'Signed in successfully.',
        icon: '⚡',
      });

      // Redirect to intended protected page or /jobs
      setTimeout(() => {
        window.location.href = redirectTarget;
      }, 500);
    } catch (err: any) {
      setError(err.message);
      toast.error('Login failed', {
        description: err.message,
      });
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`auth-card ${isShaking ? 'shake-animation' : ''}`}
      style={{
        background: '#FFFFFF',
        border: '1px solid #E4E4E7',
        borderRadius: '24px',
        padding: '36px 40px',
        width: '100%',
        maxWidth: '450px',
        boxShadow: '0 20px 45px rgba(0, 0, 0, 0.07), 0 4px 12px rgba(0, 0, 0, 0.03)',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div className="eyebrow" style={{ justifyContent: 'center' }}>
          Welcome Back
        </div>
        <h2 style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '8px' }}>
          Log in to Worklance
        </h2>
        <p style={{ fontSize: '13.5px', color: '#71717A', lineHeight: 1.5 }}>
          Access your jobs, resume builder, applications & HR directory
        </p>
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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <span>🔒</span>
          <span>Please log in to access this page.</span>
        </div>
      )}

      {error && (
        <div
          style={{
            background: '#FEF2F2',
            border: '1px solid #FCA5A5',
            color: '#991B1B',
            padding: '12px 16px',
            borderRadius: '12px',
            fontSize: '13px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            lineHeight: 1.45,
          }}
        >
          <AlertCircle style={{ width: '16px', height: '16px', flexShrink: 0, marginTop: '2px', color: '#DC2626' }} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* EMAIL ADDRESS */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#18181B' }}>Email Address</label>
            {email && (
              <span
                style={{
                  fontSize: '11.5px',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: isEmailValid ? '#059669' : '#DC2626',
                  transition: 'color 0.2s',
                }}
              >
                {isEmailValid ? (
                  <>
                    <Check style={{ width: '12px', height: '12px' }} />
                    <span>Valid format</span>
                  </>
                ) : (
                  <>
                    <X style={{ width: '12px', height: '12px' }} />
                    <span>Invalid email</span>
                  </>
                )}
              </span>
            )}
          </div>
          <div style={{ position: 'relative' }}>
            <input
              type="email"
              required
              value={email}
              onBlur={() => setEmailTouched(true)}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="auth-input"
              style={{
                width: '100%',
                padding: '11px 14px 11px 38px',
                borderRadius: '12px',
                border: emailTouched && !isEmailValid && email
                  ? '1px solid #EF4444'
                  : isEmailValid && email
                  ? '1px solid #10B981'
                  : '1px solid #E4E4E7',
                fontSize: '14px',
                outline: 'none',
                color: '#09090B',
                background: '#FFFFFF',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
            />
            <Mail
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '16px',
                height: '16px',
                color: isEmailValid && email ? '#10B981' : '#A1A1AA',
                transition: 'color 0.2s',
              }}
            />
          </div>
          {emailTouched && !isEmailValid && email && (
            <p style={{ fontSize: '11.5px', color: '#DC2626', marginTop: '4px', marginInlineStart: '2px' }}>
              Please enter a complete email address (e.g. name@domain.com).
            </p>
          )}
        </div>

        {/* PASSWORD */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#18181B' }}>Password</label>
          </div>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="auth-input"
              style={{
                width: '100%',
                padding: '11px 40px 11px 38px',
                borderRadius: '12px',
                border: '1px solid #E4E4E7',
                fontSize: '14px',
                outline: 'none',
                color: '#09090B',
                background: '#FFFFFF',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
            />
            <Lock
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '16px',
                height: '16px',
                color: '#A1A1AA',
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: '#71717A',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff style={{ width: '16px', height: '16px' }} /> : <Eye style={{ width: '16px', height: '16px' }} />}
            </button>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="auth-submit-btn"
          style={{
            width: '100%',
            padding: '13px',
            borderRadius: '100px',
            marginTop: '8px',
            background: '#09090B',
            color: '#FFFFFF',
            fontSize: '14px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {loading ? (
            <>
              <div className="btn-spinner" />
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <span>Sign in</span>
              <ArrowRight style={{ width: '16px', height: '16px' }} />
            </>
          )}
        </button>
      </form>

      <p style={{ textAlign: 'center', fontSize: '13.5px', color: '#71717A', marginTop: '24px' }}>
        Don&apos;t have an account?{' '}
        <Link
          href={`/register${searchParams.get('redirect') ? `?redirect=${encodeURIComponent(searchParams.get('redirect')!)}` : ''}`}
          style={{ fontWeight: 700, color: '#09090B', textDecoration: 'underline', textUnderlineOffset: '3px' }}
        >
          Create account
        </Link>
      </p>

      <style jsx global>{`
        @keyframes cardFadeInUp {
          from {
            opacity: 0;
            transform: translateY(18px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }

        @keyframes spinBtn {
          to { transform: rotate(360deg); }
        }

        .auth-card {
          animation: cardFadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .shake-animation {
          animation: shake 0.45s ease-in-out !important;
        }

        .auth-input:focus {
          border-color: #09090B !important;
          box-shadow: 0 0 0 3px rgba(9, 9, 11, 0.08) !important;
        }

        .auth-submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.22) !important;
          background: #18181B !important;
        }

        .auth-submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .btn-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #FFFFFF;
          border-radius: 50%;
          animation: spinBtn 0.7s linear infinite;
        }
      `}</style>
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
