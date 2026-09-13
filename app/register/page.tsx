'use client';

import { useState, Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { isValidEmail, analyzePassword } from '@/lib/validation';
import {
  Check,
  X,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Building,
  Briefcase,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

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

  const [showPassword, setShowPassword] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  // Live real-time validations
  const isEmailValid = useMemo(() => isValidEmail(email), [email]);
  const pwdAnalysis = useMemo(() => analyzePassword(password), [password]);

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 600);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Pre-flight client validation with friendly hints
    if (!name.trim() || name.trim().length < 2) {
      setError('Please provide your full name (minimum 2 characters).');
      triggerShake();
      return;
    }

    if (!isEmailValid) {
      setError('Please enter a valid email address (e.g. name@domain.com).');
      setEmailTouched(true);
      triggerShake();
      return;
    }

    if (!pwdAnalysis.isValid) {
      setError(`Password requirements missing: ${pwdAnalysis.missingRequirements.join(', ')}`);
      setPasswordTouched(true);
      triggerShake();
      return;
    }

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
      if (data.token) {
        localStorage.setItem('worklance_token', data.token);
      }
      window.dispatchEvent(new Event('worklance-user-updated'));

      const destination = redirectTarget || (role === 'recruiter' ? '/jobs/post' : '/jobs');
      window.location.href = destination;
    } catch (err: any) {
      setError(err.message);
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = () => {
    switch (pwdAnalysis.score) {
      case 1:
        return '#EF4444'; // Red
      case 2:
        return '#F97316'; // Orange
      case 3:
        return '#F59E0B'; // Amber
      case 4:
        return '#10B981'; // Emerald
      default:
        return '#E4E4E7';
    }
  };

  const getStrengthLabel = () => {
    switch (pwdAnalysis.strength) {
      case 'weak':
        return 'Weak';
      case 'fair':
        return 'Fair';
      case 'good':
        return 'Good';
      case 'strong':
        return 'Strong & Secure';
      default:
        return '';
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
        maxWidth: '490px',
        boxShadow: '0 20px 45px rgba(0, 0, 0, 0.07), 0 4px 12px rgba(0, 0, 0, 0.03)',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div className="eyebrow" style={{ justifyContent: 'center' }}>
          Get Started
        </div>
        <h2 style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '8px' }}>
          Create your Account
        </h2>
        <p style={{ fontSize: '13.5px', color: '#71717A', lineHeight: 1.5 }}>
          Join Worklance to discover jobs, hackathons, and build high-ATS resumes
        </p>
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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <span>🔒</span>
          <span>Create an account to access this protected page.</span>
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

      {/* ROLE SELECTOR WITH SMOOTH ACTIVE INDICATOR */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          marginBottom: '22px',
          background: '#F4F4F5',
          padding: '5px',
          borderRadius: '14px',
          position: 'relative',
        }}
      >
        <button
          type="button"
          onClick={() => setRole('seeker')}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 700,
            background: role === 'seeker' ? '#FFFFFF' : 'transparent',
            color: role === 'seeker' ? '#09090B' : '#71717A',
            boxShadow: role === 'seeker' ? '0 2px 8px rgba(0, 0, 0, 0.08)' : 'none',
            cursor: 'pointer',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <User style={{ width: '14px', height: '14px' }} />
          <span>Job Seeker</span>
        </button>
        <button
          type="button"
          onClick={() => setRole('recruiter')}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 700,
            background: role === 'recruiter' ? '#FFFFFF' : 'transparent',
            color: role === 'recruiter' ? '#09090B' : '#71717A',
            boxShadow: role === 'recruiter' ? '0 2px 8px rgba(0, 0, 0, 0.08)' : 'none',
            cursor: 'pointer',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <Building style={{ width: '14px', height: '14px' }} />
          <span>Recruiter / Employer</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {/* FULL NAME */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#18181B', marginBottom: '6px' }}>
            Full Name
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahul Verma"
              className="auth-input"
              style={{
                width: '100%',
                padding: '11px 14px 11px 38px',
                borderRadius: '12px',
                border: '1px solid #E4E4E7',
                fontSize: '14px',
                outline: 'none',
                color: '#09090B',
                background: '#FFFFFF',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
            />
            <User
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
          </div>
        </div>

        {/* EMAIL ADDRESS WITH LIVE REGEX VALIDATION */}
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
              placeholder="name@example.com"
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
              Please enter a complete email address with domain (e.g. name@domain.com).
            </p>
          )}
        </div>

        {/* PASSWORD WITH INTERACTIVE REGEX CHECKLIST & STRENGTH BAR */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#18181B' }}>Password</label>
            {password && (
              <span style={{ fontSize: '11.5px', fontWeight: 700, color: getStrengthColor(), transition: 'color 0.3s' }}>
                {getStrengthLabel()}
              </span>
            )}
          </div>

          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordTouched(true)}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="auth-input"
              style={{
                width: '100%',
                padding: '11px 40px 11px 38px',
                borderRadius: '12px',
                border: passwordTouched && !pwdAnalysis.isValid && password
                  ? '1px solid #EF4444'
                  : pwdAnalysis.isValid && password
                  ? '1px solid #10B981'
                  : '1px solid #E4E4E7',
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
                color: pwdAnalysis.isValid && password ? '#10B981' : '#A1A1AA',
                transition: 'color 0.2s',
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

          {/* PASSWORD STRENGTH METER BAR */}
          {password && (
            <div style={{ marginTop: '8px' }}>
              <div style={{ display: 'flex', gap: '4px', height: '4px', width: '100%' }}>
                {[1, 2, 3, 4].map((step) => {
                  const filled = pwdAnalysis.score >= step;
                  return (
                    <div
                      key={step}
                      style={{
                        flex: 1,
                        height: '100%',
                        borderRadius: '100px',
                        background: filled ? getStrengthColor() : '#E4E4E7',
                        transition: 'background 0.3s ease',
                      }}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* DYNAMIC REQUIREMENTS CHECKLIST */}
          {(password || passwordFocused) && (
            <div
              className="requirements-box"
              style={{
                marginTop: '10px',
                background: '#F9FAFB',
                border: '1px solid #F3F4F6',
                padding: '10px 14px',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '5px',
                animation: 'fadeInUp 0.2s ease forwards',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>
                Password Requirements
              </div>

              {[
                { key: 'minLength', label: 'At least 8 characters', met: pwdAnalysis.checks.minLength },
                { key: 'hasUpper', label: 'One uppercase letter (A-Z)', met: pwdAnalysis.checks.hasUpper },
                { key: 'hasLower', label: 'One lowercase letter (a-z)', met: pwdAnalysis.checks.hasLower },
                { key: 'hasNumber', label: 'One number (0-9)', met: pwdAnalysis.checks.hasNumber },
                { key: 'hasSpecial', label: 'One special symbol (!@#$%...)', met: pwdAnalysis.checks.hasSpecial },
              ].map((item) => (
                <div
                  key={item.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    color: item.met ? '#059669' : '#6B7280',
                    transition: 'color 0.2s ease',
                  }}
                >
                  <div
                    style={{
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      background: item.met ? '#10B981' : '#E5E7EB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      transition: 'background 0.2s ease',
                      flexShrink: 0,
                    }}
                  >
                    {item.met ? <Check style={{ width: '9px', height: '9px', strokeWidth: 3 }} /> : <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#9CA3AF' }} />}
                  </div>
                  <span style={{ fontWeight: item.met ? 600 : 400 }}>{item.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CONDITIONAL RECRUITER FIELDS */}
        {role === 'recruiter' && (
          <>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#18181B', marginBottom: '6px' }}>
                Company Name
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Zenith Tech Labs, Google"
                  className="auth-input"
                  style={{
                    width: '100%',
                    padding: '11px 14px 11px 38px',
                    borderRadius: '12px',
                    border: '1px solid #E4E4E7',
                    fontSize: '14px',
                    outline: 'none',
                    color: '#09090B',
                    background: '#FFFFFF',
                  }}
                />
                <Building
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
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#18181B', marginBottom: '6px' }}>
                Job Title
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Talent Acquisition Lead"
                  className="auth-input"
                  style={{
                    width: '100%',
                    padding: '11px 14px 11px 38px',
                    borderRadius: '12px',
                    border: '1px solid #E4E4E7',
                    fontSize: '14px',
                    outline: 'none',
                    color: '#09090B',
                    background: '#FFFFFF',
                  }}
                />
                <Briefcase
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
              </div>
            </div>
          </>
        )}

        {/* SUBMIT BUTTON WITH HOVER LIFT & ANIMATION */}
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
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight style={{ width: '16px', height: '16px' }} />
            </>
          )}
        </button>
      </form>

      <p style={{ textAlign: 'center', fontSize: '13.5px', color: '#71717A', marginTop: '22px' }}>
        Already have an account?{' '}
        <Link
          href={`/login${redirectTarget ? `?redirect=${encodeURIComponent(redirectTarget)}` : ''}`}
          style={{ fontWeight: 700, color: '#09090B', textDecoration: 'underline', textUnderlineOffset: '3px' }}
        >
          Log in
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

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
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
